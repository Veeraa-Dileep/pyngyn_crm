import React, { useState } from "react";
import Header from "../components/ui/Header";
import Sidebar from "../components/ui/Sidebar";
import ManageMembersModal from "./modals/ManageMembersModal";

const AppLayout = ({ children, onRecycleBinOpen }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isManageMembersModalOpen, setIsManageMembersModalOpen] = useState(false);
  const [isSidebarCompressed, setIsSidebarCompressed] = useState(() => {
    const saved = localStorage.getItem('sidebar-compressed');
    return saved === 'true';
  });

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
        onRecycleBinOpen={onRecycleBinOpen}
        onAddMemberOpen={() => setIsManageMembersModalOpen(true)}
      />

      <div className={`flex-1 ${isSidebarCompressed ? 'lg:ml-16' : 'lg:ml-64'} pt-16 transition-all duration-300`}>
        <Header
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          onSidebarToggle={toggleSidebarCompressed}
          isSidebarOpen={sidebarOpen}
          isSidebarCompressed={isSidebarCompressed}
        />

        <main>{children}</main>
      </div>

      {/* Manage Members Modal */}
      <ManageMembersModal
        isOpen={isManageMembersModalOpen}
        onClose={() => setIsManageMembersModalOpen(false)}
      />
    </div>
  );
};

export default AppLayout;
