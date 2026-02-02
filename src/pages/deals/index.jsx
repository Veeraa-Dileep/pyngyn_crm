import React, { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet";
import AppLayout from "../../components/AppLayout";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import DealsTable from "./components/DealsTable";
import DealsFilters from "./components/DealsFilters";
import DealDrawer from "./components/DealDrawer";
import TablePagination from "./components/TablePagination";
import PromoteLeadModal from "./components/PromoteLeadModal";
import RecycleBin from "./components/RecycleBin";
import AddMemberModal from "../../components/AddMemberModal";
import ImportLeadsModal from "./components/ImportLeadsModal";

import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import AddLeadModal from "../../components/modals/AddLeadModal";
import { useToast } from "../../components/ui/Toast";
import { usePipelines } from '../../contexts/PipelineContext';
import { useDeals } from '../../contexts/DealsContext';

const ASSIGNEES = ["Dileep", "Shankar"];
const DEFAULT_PIPELINE_ID = "default-pipeline";

const DealsPage = () => {
  const { pipelines } = usePipelines();
  const { addDeal } = useDeals();
  const [leads, setLeads] = useState([]);
  const [deletedLeads, setDeletedLeads] = useState([]);
  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: 'Dileep', email: 'dileep@example.com', role: 'Sales Manager' },
    { id: '2', name: 'Shankar', email: 'shankar@example.com', role: 'Sales Rep' }
  ]);

  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDeals, setSelectedDeals] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Modal states
  const [promoteLead, setPromoteLead] = useState(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Toast notifications
  const { showToast, ToastContainer } = useToast();

  const handleCreateLead = async (formData) => {
    try {
      await addDoc(collection(db, "leads"), {
        title: formData.title,
        name: formData.name,
        company: formData.company,
        mobile: formData.mobile,
        email: formData.email,
        source: formData.source,
        status: "new",
        notes: "",
        assignee: null,
        pipelineId: null,
        createdAt: serverTimestamp(),
      });

      setIsAddLeadOpen(false);
      showToast("Lead successfully added", "success");
    } catch (error) {
      console.error("Error adding lead:", error);
      showToast("Failed to add lead", "error");
    }
  };

  /* ---------------- FIREBASE: FETCH LEADS ---------------- */
  useEffect(() => {
    // Fetch active leads
    const q = query(collection(db, "leads"), where("status", "==", "new"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        value: "",
        closeDate: "",
        probability: "",
        stage: "New",
        owner: doc.data().assignee || "",
      }));
      setLeads(data);
    });

    // Fetch deleted leads
    const qDeleted = query(collection(db, "leads"), where("status", "==", "deleted"));
    const unsubDeleted = onSnapshot(qDeleted, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        deletedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      }));
      setDeletedLeads(data);
    });

    return () => {
      unsub();
      unsubDeleted();
    };
  }, []);

  /* ---------------- DELETE (SOFT) ---------------- */
  const handleDeleteLead = async (leadId) => {
    try {
      await updateDoc(doc(db, "leads", leadId), {
        status: "deleted",
        updatedAt: serverTimestamp(),
      });
      showToast("Lead moved to recycle bin", "success");
    } catch (error) {
      console.error("Error deleting lead:", error);
      showToast("Failed to delete lead", "error");
    }
  };

  /* ---------------- RESTORE FROM RECYCLE BIN ---------------- */
  const handleRestoreLead = async (leadId) => {
    try {
      await updateDoc(doc(db, "leads", leadId), {
        status: "new",
        updatedAt: serverTimestamp(),
      });
      showToast("Lead restored successfully", "success");
    } catch (error) {
      console.error("Error restoring lead:", error);
      showToast("Failed to restore lead", "error");
    }
  };

  /* ---------------- PERMANENT DELETE ---------------- */
  const handlePermanentDelete = async (leadId) => {
    try {
      await deleteDoc(doc(db, "leads", leadId));
      showToast("Lead permanently deleted", "success");
    } catch (error) {
      console.error("Error permanently deleting lead:", error);
      showToast("Failed to permanently delete lead", "error");
    }
  };

  /* ---------------- PROMOTE ---------------- */
  const handlePromoteLead = async (promotionData) => {
    try {
      const { leadId, pipelineId, stage, assignedTo, pipelineName } = promotionData;
      const lead = leads.find(l => l.id === leadId);

      if (!lead) {
        showToast("Lead not found", "error");
        return;
      }

      // Update lead status to promoted in Firebase
      await updateDoc(doc(db, "leads", leadId), {
        status: "promoted",
        pipelineId,
        stage,
        assignee: assignedTo,
        promotedAt: serverTimestamp(),
      });

      // Create a deal from the lead using DealsContext
      const newDeal = {
        title: lead.name || lead.company || 'Untitled Deal',
        accountName: lead.company || lead.name || 'Unknown',
        value: lead.value || 0,
        owner: {
          id: assignedTo || 'unassigned',
          name: teamMembers.find(m => m.id === assignedTo)?.name || 'Unassigned',
          avatar: '',
          avatarAlt: ''
        },
        closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        priority: 'Medium',
        probability: 50,
        stage: stage,
        tags: [lead.source || 'Lead'],
        email: lead.email,
        mobile: lead.mobile,
        leadId: leadId
      };

      addDeal(pipelineId, newDeal);

      showToast(`Lead promoted to ${pipelineName} successfully`, "success");
      setPromoteLead(null);
    } catch (error) {
      console.error("Error promoting lead:", error);
      showToast("Failed to promote lead", "error");
    }
  };

  /* ---------------- TEAM MEMBER MANAGEMENT ---------------- */
  const handleAddMember = (member) => {
    setTeamMembers([...teamMembers, member]);
    showToast(`${member.name} added to team`, "success");
  };

  /* ---------------- IMPORT LEADS ---------------- */
  const handleImportLeads = async (leadsToImport) => {
    const batchSize = 50;
    const promises = [];

    for (let i = 0; i < leadsToImport.length; i += batchSize) {
      const batch = leadsToImport.slice(i, i + batchSize);

      const batchPromises = batch.map(lead => {
        // Generate title in format "{name/company}'s Opportunity"
        const displayName = lead.name || lead.company || 'Unknown';
        const title = `${displayName}'s Opportunity`;

        return addDoc(collection(db, "leads"), {
          title,
          name: lead.name || '',
          company: lead.company || '',
          email: lead.email,
          mobile: lead.mobile || '',
          source: lead.source || 'Imported',
          status: "new",
          notes: "",
          assignee: null,
          pipelineId: null,
          createdAt: serverTimestamp(),
        });
      });

      promises.push(...batchPromises);
    }

    await Promise.all(promises);
  };

  /* ---------------- SORTING ---------------- */
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredAndSortedDeals = useMemo(() => {
    if (!sortConfig.key) return leads;

    const sorted = [...leads].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle date sorting for createdAt
      if (sortConfig.key === 'createdAt') {
        // Convert Firestore Timestamp to Date if needed
        const aDate = aValue?.toDate ? aValue.toDate() : new Date(aValue || 0);
        const bDate = bValue?.toDate ? bValue.toDate() : new Date(bValue || 0);
        return sortConfig.direction === 'asc'
          ? aDate - bDate
          : bDate - aDate;
      }

      // Handle string sorting for source
      if (sortConfig.key === 'source') {
        aValue = (aValue || '').toLowerCase();
        bValue = (bValue || '').toLowerCase();
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }

      return 0;
    });

    return sorted;
  }, [leads, sortConfig]);
  const totalPages = Math.ceil(filteredAndSortedDeals.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-background">
      <AppLayout
        onRecycleBinOpen={() => setIsRecycleBinOpen(true)}
        onAddMemberOpen={() => setIsAddMemberOpen(true)}
      >
        <Helmet>
          <title>Leads</title>
        </Helmet>

        <main className="lg:ml-6 pt-6">
          <div className="p-4 lg:p-6">
            {/* PAGE HEADER */}
            <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">Leads</h1>
                <p className="text-muted-foreground">
                  Track and manage your sales opportunities
                </p>
              </div>
              <div className="flex gap-4">
                <Button onClick={() => setIsImportOpen(true)}>
                  <Icon name="Import" size={16} className="mr-2" />
                  Import Leads
                </Button>
                <Button onClick={() => setIsAddLeadOpen(true)}>
                  <Icon name="Plus" size={16} className="mr-2" />
                  New Lead
                </Button>
              </div>
            </div>

            {/* FILTERS (UNCHANGED) */}
            <DealsFilters
              filters={{}}
              onFiltersChange={() => { }}
              onClearFilters={() => { }}
              dealCount={filteredAndSortedDeals.length}
              selectedCount={selectedDeals.length}
            />

            {/* TABLE (UNCHANGED STRUCTURE) */}
            <DealsTable
              deals={filteredAndSortedDeals}
              selectedDeals={selectedDeals}
              onSelectDeal={() => { }}
              onSelectAll={() => { }}
              onDealClick={(deal) => {
                setSelectedDeal(deal);
                setIsDrawerOpen(true);
              }}
              onDeleteLead={handleDeleteLead}
              onPromoteLead={setPromoteLead}
              sortConfig={sortConfig}
              onSort={handleSort}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
            />

            {/* PAGINATION */}
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAndSortedDeals.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </main>

        {/* DRAWER (UNCHANGED) */}
        <DealDrawer
          deal={selectedDeal}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />

        {/* PROMOTE MODAL */}
        <PromoteLeadModal
          isOpen={!!promoteLead}
          onClose={() => setPromoteLead(null)}
          onPromote={handlePromoteLead}
          lead={promoteLead}
        />

        {/* RECYCLE BIN MODAL */}
        <RecycleBin
          isOpen={isRecycleBinOpen}
          onClose={() => setIsRecycleBinOpen(false)}
          deletedLeads={deletedLeads}
          onRestore={handleRestoreLead}
          onPermanentDelete={handlePermanentDelete}
        />

        {/* ADD MEMBER MODAL */}
        <AddMemberModal
          isOpen={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
          onAddMember={handleAddMember}
          members={teamMembers}
        />

        {/* IMPORT LEADS MODAL */}
        <ImportLeadsModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          existingLeads={leads}
          onImport={handleImportLeads}
        />

        {/* Add Lead Modal */}
        <AddLeadModal
          open={isAddLeadOpen}
          onClose={() => setIsAddLeadOpen(false)}
          onSuccess={handleCreateLead}
        />

        {/* Toast Notifications */}
        <ToastContainer />

      </AppLayout>
    </div>
  );
};

export default DealsPage;
