import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import AppLayout from '../../components/AppLayout';
import { Home } from 'lucide-react';

const HomePage = () => {

  const handleSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
       <AppLayout>
      <Helmet>
        <title>Pyngyn CRM</title>
      </Helmet>

      <div className="p-12 space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome Team
            </h1>
            <p className="text-muted-foreground">
              Collaborative CRM for Modern Teams
            </p>
          </div>
        </div>
      </div>
    </AppLayout>

    </div>
  );
};

export default HomePage;
