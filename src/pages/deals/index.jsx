import React, { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet";
import AppLayout from "../../components/AppLayout"; 
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import DealsTable from "./components/DealsTable";
import DealsFilters from "./components/DealsFilters";
import DealDrawer from "./components/DealDrawer";
import TablePagination from "./components/TablePagination";

import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import AddLeadModal from "../../components/modals/AddLeadModal";
import { useToast } from "../../components/ui/Toast";

const ASSIGNEES = ["Dileep", "Shankar"];
const DEFAULT_PIPELINE_ID = "default-pipeline";

const DealsPage = () => {
  const [leads, setLeads] = useState([]);

  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDeals, setSelectedDeals] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // promote modal
  const [promoteLead, setPromoteLead] = useState(null);
  const [assignee, setAssignee] = useState("");
  const [pipelineId, setPipelineId] = useState(DEFAULT_PIPELINE_ID);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);

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
        source: formData.source, // Save source to database
        status: "new",
        notes: "",
        assignee: null,
        pipelineId: null,
        createdAt: serverTimestamp(),
      });

      setIsAddLeadOpen(false);
      
      // Show success toast
      showToast("Lead successfully added", "success");
    } catch (error) {
      console.error("Error adding lead:", error);
      showToast("Failed to add lead", "error");
    }
  };

  /* ---------------- FIREBASE: FETCH LEADS ---------------- */
  useEffect(() => {
    const q = query(collection(db, "leads"), where("status", "==", "new"));

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),

        // fields expected by existing UI
        value: "",
        closeDate: "",
        probability: "",
        stage: "New",
        owner: doc.data().assignee || "",
      }));
      setLeads(data);
    });

    return () => unsub();
  }, []);

  /* ---------------- DELETE (SOFT) ---------------- */
  const handleDeleteLead = async (leadId) => {
    try {
      await updateDoc(doc(db, "leads", leadId), {
        status: "deleted",
      });
      showToast("Lead moved to recycle bin", "success");
    } catch (error) {
      console.error("Error deleting lead:", error);
      showToast("Failed to delete lead", "error");
    }
  };

  /* ---------------- PROMOTE ---------------- */
  const confirmPromote = async () => {
    if (!assignee || !pipelineId) return;

    try {
      await addDoc(collection(db, "pipelines", pipelineId, "deals"), {
        ...promoteLead,
        assignee,
        leadId: promoteLead.id,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "leads", promoteLead.id), {
        status: "promoted",
        assignee,
        pipelineId,
      });

      setPromoteLead(null);
      setAssignee("");
      setPipelineId(DEFAULT_PIPELINE_ID);
      
      showToast("Lead promoted to pipeline successfully", "success");
    } catch (error) {
      console.error("Error promoting lead:", error);
      showToast("Failed to promote lead", "error");
    }
  };

  const filteredAndSortedDeals = useMemo(() => leads, [leads]);
  const totalPages = Math.ceil(filteredAndSortedDeals.length / itemsPerPage);

  return (
     <div className="min-h-screen bg-background">
       <AppLayout>
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
              <Button onClick={() => setIsAddLeadOpen(true)}>
                <Icon name="Plus" size={16} className="mr-2" />
                New Lead
              </Button>
            </div>

            {/* FILTERS (UNCHANGED) */}
            <DealsFilters
              filters={{}}
              onFiltersChange={() => {}}
              onClearFilters={() => {}}
              dealCount={filteredAndSortedDeals.length}
              selectedCount={selectedDeals.length}
            />

            {/* TABLE (UNCHANGED STRUCTURE) */}
            <DealsTable
              deals={filteredAndSortedDeals}
              selectedDeals={selectedDeals}
              onSelectDeal={() => {}}
              onSelectAll={() => {}}
              onDealClick={(deal) => {
                setSelectedDeal(deal);
                setIsDrawerOpen(true);
              }}
              onDeleteLead={handleDeleteLead}
              onPromoteLead={setPromoteLead}
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

        {/* PROMOTE MODAL (MINIMAL JSX) */}
        {promoteLead && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-4">Promote Lead</h3>

              <select
                className="w-full mb-3 border px-2 py-1"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                <option value="">Select Assignee</option>
                {ASSIGNEES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>

              <input
                className="w-full mb-4 border px-2 py-1"
                value={pipelineId}
                onChange={(e) => setPipelineId(e.target.value)}
              />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPromoteLead(null)}>
                  Cancel
                </Button>
                <Button onClick={confirmPromote}>Promote</Button>
              </div>
            </div>
          </div>
        )}
      
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
