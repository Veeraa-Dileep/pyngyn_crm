import React, { useState } from 'react';
import Header from '../components/ui/Header';
import Sidebar from '../components/ui/Sidebar';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 pt-16">
  <Header
    onMenuToggle={() => setSidebarOpen(prev => !prev)}
    isSidebarOpen={sidebarOpen}
  />

  <main className="px-6 py-6">
    {children}
  </main>
</div>
    </div>
  );
};

export default AppLayout;
