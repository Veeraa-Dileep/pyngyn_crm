import React, { useState, useEffect } from "react";
import { collection, onSnapshot, updateDoc, doc, deleteDoc, serverTimestamp, query, where, collectionGroup } from 'firebase/firestore';
import { db } from '../firebase';
import Header from "../components/ui/Header";
import Sidebar from "../components/ui/Sidebar";
import ManageMembersModal from "./modals/ManageMembersModal";
import RecycleBin from "./RecycleBin";
import { useToast } from "./ui/Toast";

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isManageMembersModalOpen, setIsManageMembersModalOpen] = useState(false);
  const [isSidebarCompressed, setIsSidebarCompressed] = useState(() => {
    const saved = localStorage.getItem('sidebar-compressed');
    return saved === 'true';
  });

  //Recycle Bin State
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [deletedLeads, setDeletedLeads] = useState([]);
  const [deletedDeals, setDeletedDeals] = useState([]);
  const { showToast, ToastContainer } = useToast();

  // Fetch deleted leads globally
  useEffect(() => {
    const q = query(collection(db, "leads"), where("status", "==", "deleted"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const deleted = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDeletedLeads(deleted);
    });

    return () => unsubscribe();
  }, []);

  // Fetch deleted deals globally (from pipeline)
  useEffect(() => {
    // collectionGroup query to find deals deleted from pipeline
    const q = query(
      collectionGroup(db, 'deals'),
      where('status', '==', 'deleted'),
      where('deletionSource', '==', 'pipeline')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const deleted = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Ensure date fields are properly formatted timestamps or ISO strings
        deletedAt: doc.data().deletedAt?.toDate?.()?.toISOString() || doc.data().deletedAt
      }));

      setDeletedDeals(deleted);
    }, (error) => {
      console.error('❌ Error fetching deleted deals:', error);
      console.error('If you see a "missing index" error, follow the link in the error to create it');
    });

    return () => unsubscribe();
  }, []);

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

  const handlePermanentDelete = async (leadId) => {
    try {
      await deleteDoc(doc(db, "leads", leadId));
      showToast("Lead permanently deleted", "success");
    } catch (error) {
      console.error("Error permanently deleting lead:", error);
      showToast("Failed to permanently delete lead", "error");
    }
  };

  const handleRestoreDeal = async (dealId) => {
    try {
      // Find the deal to get its pipelineId
      const deal = deletedDeals.find(d => d.id === dealId);
      if (deal && deal.pipelineId) {
        await updateDoc(doc(db, 'pipelines', deal.pipelineId, 'deals', dealId), {
          status: 'active',
          deletedAt: null,
          deletionSource: null,
          updatedAt: serverTimestamp()
        });
        showToast("Lead restored to pipeline", "success");
      }
    } catch (error) {
      console.error("Error restoring deal:", error);
      showToast("Failed to restore lead", "error");
    }
  };

  const handlePermanentDeleteDeal = async (dealId) => {
    try {
      // Find the deal to get its pipelineId
      const deal = deletedDeals.find(d => d.id === dealId);
      if (deal && deal.pipelineId) {
        await deleteDoc(doc(db, 'pipelines', deal.pipelineId, 'deals', dealId));
        showToast("Lead permanently deleted", "success");
      }
    } catch (error) {
      console.error("Error permanently deleting deal:", error);
      showToast("Failed to permanently delete lead", "error");
    }
  };

  // Toggle sidebar compressed state
  const toggleSidebarCompressed = () => {
    const newState = !isSidebarCompressed;
    setIsSidebarCompressed(newState);
    localStorage.setItem('sidebar-compressed', newState);
  };

  // Listen to localStorage changes from Sidebar component
  React.useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('sidebar-compressed');
      setIsSidebarCompressed(saved === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    // Also check on interval for same-tab updates
    const interval = setInterval(handleStorageChange, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        isCompressed={isSidebarCompressed}
        onClose={() => setSidebarOpen(false)}
        onRecycleBinOpen={() => setIsRecycleBinOpen(true)}
        onAddMemberOpen={() => setIsManageMembersModalOpen(true)}
      />

      <div className={`flex-1 ${isSidebarCompressed ? 'lg:ml-8' : 'lg:ml-56'} pt-16 transition-all duration-300`}>
        <Header
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          onSidebarToggle={toggleSidebarCompressed}
          isSidebarOpen={sidebarOpen}
          isSidebarCompressed={isSidebarCompressed}
        />

        <main>{children}</main>
      </div>

      {/* Global Recycle Bin Modal */}
      <RecycleBin
        isOpen={isRecycleBinOpen}
        onClose={() => setIsRecycleBinOpen(false)}
        deletedLeads={deletedLeads}
        deletedDeals={deletedDeals}
        onRestore={handleRestoreLead}
        onPermanentDelete={handlePermanentDelete}
        onRestoreDeal={handleRestoreDeal}
        onPermanentDeleteDeal={handlePermanentDeleteDeal}
      />
      {/* Toast Container for notifications */}
      <ToastContainer />

      {/* Manage Members Modal */}
      <ManageMembersModal
        isOpen={isManageMembersModalOpen}
        onClose={() => setIsManageMembersModalOpen(false)}
      />
    </div>
  );
};

export default AppLayout;
