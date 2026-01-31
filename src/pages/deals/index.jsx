import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import DealsTable from './components/DealsTable';
import DealsFilters from './components/DealsFilters';
import DealDrawer from './components/DealDrawer';
import TablePagination from './components/TablePagination';

const DealsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDeals, setSelectedDeals] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [filters, setFilters] = useState({
    search: '',
    stage: '',
    owner: '',
    minValue: '',
    maxValue: '',
    closeDateFrom: '',
    closeDateTo: ''
  });

  // Mock deals data
  const mockDeals = [
   
    {
      id: 12,
      name: 'Business Intelligence Suite',
      account: 'Logistics Partners',
      value: 85000,
      owner: 'Michael Chen',
      stage: 'Qualified',
      closeDate: '2025-12-25',
      probability: 19,
      createdDate: '2025-10-05'
    }
  ];

  // Filter and sort deals
  const filteredAndSortedDeals = useMemo(() => {
    let filtered = mockDeals?.filter(deal => {
      const matchesSearch = !filters?.search || 
        deal?.name?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        deal?.account?.toLowerCase()?.includes(filters?.search?.toLowerCase());
      
      const matchesStage = !filters?.stage || deal?.stage === filters?.stage;
      const matchesOwner = !filters?.owner || deal?.owner === filters?.owner;
      
      const matchesMinValue = !filters?.minValue || deal?.value >= parseInt(filters?.minValue);
      const matchesMaxValue = !filters?.maxValue || deal?.value <= parseInt(filters?.maxValue);
      
      const matchesCloseDateFrom = !filters?.closeDateFrom || 
        new Date(deal.closeDate) >= new Date(filters.closeDateFrom);
      const matchesCloseDateTo = !filters?.closeDateTo || 
        new Date(deal.closeDate) <= new Date(filters.closeDateTo);

      return matchesSearch && matchesStage && matchesOwner && 
             matchesMinValue && matchesMaxValue && 
             matchesCloseDateFrom && matchesCloseDateTo;
    });

    // Sort deals
    if (sortConfig?.key) {
      filtered?.sort((a, b) => {
        let aValue = a?.[sortConfig?.key];
        let bValue = b?.[sortConfig?.key];

        if (sortConfig?.key === 'value') {
          aValue = parseInt(aValue);
          bValue = parseInt(bValue);
        } else if (sortConfig?.key === 'closeDate') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else if (typeof aValue === 'string') {
          aValue = aValue?.toLowerCase();
          bValue = bValue?.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig?.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig?.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [filters, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedDeals?.length / itemsPerPage);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleDealClick = (deal) => {
    setSelectedDeal(deal);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedDeal(null);
  };

  const handleSelectDeal = (dealId, isSelected) => {
    if (isSelected) {
      setSelectedDeals([...selectedDeals, dealId]);
    } else {
      setSelectedDeals(selectedDeals?.filter(id => id !== dealId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      const currentPageDeals = filteredAndSortedDeals?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)?.map(deal => deal?.id);
      setSelectedDeals([...new Set([...selectedDeals, ...currentPageDeals])]);
    } else {
      const currentPageDeals = filteredAndSortedDeals?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)?.map(deal => deal?.id);
      setSelectedDeals(selectedDeals?.filter(id => !currentPageDeals?.includes(id)));
    }
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig?.key === key && prevConfig?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      stage: '',
      owner: '',
      minValue: '',
      maxValue: '',
      closeDateFrom: '',
      closeDateTo: ''
    });
    setCurrentPage(1);
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk action ${action} for deals:`, selectedDeals);
    // Implement bulk actions here
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  return (
    <>
      <Helmet>
        <title>Leads</title>
        <meta name="description" content="Manage and track your sales deals with comprehensive filtering and pipeline management tools." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header onMenuToggle={handleMenuToggle} isSidebarOpen={isSidebarOpen} />
        <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
        
        <main className="lg:ml-64 pt-16">
          <div className="p-4 lg:p-6">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Leads</h1>
                <p className="text-muted-foreground mt-1">
                  Track and manage your sales opportunities
                </p>
              </div>
              <div className="flex items-center space-x-3">
              
                {/*
                <Button variant="outline">
                  <Icon name="Download" size={16} className="mr-2" />
                  Export
                </Button>
                <Button variant="outline">
                  <Icon name="GitBranch" size={16} className="mr-2" />
                  Pipeline View
                </Button>

                */} 
                <Button>
                  <Icon name="Plus" size={16} className="mr-2" />
                  New Lead
                </Button>
              </div>
            </div>

            {/* Filters */}
            <DealsFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              dealCount={filteredAndSortedDeals?.length}
              onBulkAction={handleBulkAction}
              selectedCount={selectedDeals?.length}
            />

            {/* Deals Table */}
            <DealsTable
              deals={filteredAndSortedDeals}
              selectedDeals={selectedDeals}
              onSelectDeal={handleSelectDeal}
              onSelectAll={handleSelectAll}
              onDealClick={handleDealClick}
              sortConfig={sortConfig}
              onSort={handleSort}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
            />

            {/* Pagination */}
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAndSortedDeals?.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </main>

        {/* Deal Drawer */}
        <DealDrawer
          deal={selectedDeal}
          isOpen={isDrawerOpen}
          onClose={handleDrawerClose}
        />
      </div>
    </>
  );
};

export default DealsPage;