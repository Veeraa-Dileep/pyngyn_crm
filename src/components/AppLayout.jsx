import React, { useState } from "react";
import Header from "../components/ui/Header";
import Sidebar from "../components/ui/Sidebar";
import RecycleBinModal from "./modals/RecycleBinModal";

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [isSidebarCompressed, setIsSidebarCompressed] = useState(() => {
    const saved = localStorage.getItem('sidebar-compressed');
    return saved === 'true';
  });

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
        onClose={() => setSidebarOpen(false)}
        onRecycleBinOpen={() => setIsRecycleBinOpen(true)}
      />

      <div className={`flex-1 ${isSidebarCompressed ? 'lg:ml-16' : 'lg:ml-64'} pt-16 transition-all duration-300`}>
        <Header
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          isSidebarOpen={sidebarOpen}
          isSidebarCompressed={isSidebarCompressed}
        />

        <main>{children}</main>
      </div>
      <RecycleBinModal
        open={isRecycleBinOpen}
        onClose={() => setIsRecycleBinOpen(false)}
      />
    </div>
  );
};

export default AppLayout;
