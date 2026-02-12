import React, { useState, useEffect } from "react";
import { collection, onSnapshot, updateDoc, doc, deleteDoc, serverTimestamp, query, where } from 'firebase/firestore';
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
        onRestore={handleRestoreLead}
        onPermanentDelete={handlePermanentDelete}
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
