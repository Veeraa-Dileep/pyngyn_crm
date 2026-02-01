import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '../../components/AppLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PipelineColumn from './components/PipelineColumn';
import PipelineFilters from './components/PipelineFilters';
import AddDealModal from './components/AddDealModal';
import PipelineStats from './components/PipelineStats';

const Pipeline = () => {
  const [isAddDealModalOpen, setIsAddDealModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [deals, setDeals] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    owner: 'all',
    priority: 'all',
    dateRange: 'all',
    minValue: 0,
    maxValue: 0,
    startDate: '',
    endDate: ''
  });

  // Mock data for pipeline stages
  const pipelineStages = [
  { id: 'new', name: 'New', color: 'blue' },
  { id: 'qualified', name: 'Qualified', color: 'yellow' },
  { id: 'proposal', name: 'Proposal', color: 'purple' },
  { id: 'won', name: 'Won', color: 'green' },
  { id: 'lost', name: 'Lost', color: 'red' }];


  // Mock deals data
  const mockDeals = [
  {
    id: 'deal-1',
    title: 'Enterprise Software License',
    accountName: 'TechCorp Solutions',
    value: 125000,
    owner: {
      id: 'john-doe',
      name: 'John Doe',
      avatar: "https://images.unsplash.com/photo-1588178457501-31b7688a41a0",
      avatarAlt: 'Professional headshot of John Doe in navy suit with short brown hair'
    },
    closeDate: '2025-01-15',
    priority: 'High',
    probability: 85,
    stage: 'new',
    tags: ['Enterprise', 'Software', 'Renewal'],
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2025-01-02T14:30:00Z'
  },];


  useEffect(() => {
    setDeals(mockDeals);
  }, []);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleAddDeal = (stageId = null) => {
    setSelectedStage(stageId);
    setIsAddDealModalOpen(true);
  };

  const handleSaveDeal = (newDeal) => {
    setDeals((prevDeals) => [...prevDeals, newDeal]);
  };

  const handleDealMove = (dealId, newStageId) => {
    setDeals((prevDeals) =>
    prevDeals?.map((deal) =>
    deal?.id === dealId ?
    { ...deal, stage: newStageId, updatedAt: new Date()?.toISOString() } :
    deal
    )
    );
  };

  const handleEditDeal = (deal) => {
    console.log('Edit deal:', deal);
    // Implement edit functionality
  };

  const handleDeleteDeal = (dealId) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      setDeals((prevDeals) => prevDeals?.filter((deal) => deal?.id !== dealId));
    }
  };

  const handleCloneDeal = (deal) => {
    const clonedDeal = {
      ...deal,
      id: `deal-${Date.now()}`,
      title: `${deal?.title} (Copy)`,
      createdAt: new Date()?.toISOString(),
      updatedAt: new Date()?.toISOString()
    };
    setDeals((prevDeals) => [...prevDeals, clonedDeal]);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      owner: 'all',
      priority: 'all',
      dateRange: 'all',
      minValue: 0,
      maxValue: 0,
      startDate: '',
      endDate: ''
    });
  };

  const getFilteredDeals = () => {
    return deals?.filter((deal) => {
      // Search filter
      if (filters?.search && !deal?.title?.toLowerCase()?.includes(filters?.search?.toLowerCase()) &&
      !deal?.accountName?.toLowerCase()?.includes(filters?.search?.toLowerCase())) {
        return false;
      }

      // Owner filter
      if (filters?.owner && filters?.owner !== 'all' && deal?.owner?.id !== filters?.owner) {
        return false;
      }

      // Priority filter
      if (filters?.priority && filters?.priority !== 'all' && deal?.priority !== filters?.priority) {
        return false;
      }

      // Value range filters
      if (filters?.minValue && deal?.value < filters?.minValue) {
        return false;
      }
      if (filters?.maxValue && deal?.value > filters?.maxValue) {
        return false;
      }

      // Date range filter
      if (filters?.dateRange && filters?.dateRange !== 'all') {
        const closeDate = new Date(deal.closeDate);
        const today = new Date();

        switch (filters?.dateRange) {
          case 'this-week':
            const weekStart = new Date(today);
            weekStart?.setDate(today?.getDate() - today?.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd?.setDate(weekStart?.getDate() + 6);
            if (closeDate < weekStart || closeDate > weekEnd) return false;
            break;
          case 'this-month':
            if (closeDate?.getMonth() !== today?.getMonth() || closeDate?.getFullYear() !== today?.getFullYear()) {
              return false;
            }
            break;
          case 'this-quarter':
            const quarter = Math.floor(today?.getMonth() / 3);
            const dealQuarter = Math.floor(closeDate?.getMonth() / 3);
            if (dealQuarter !== quarter || closeDate?.getFullYear() !== today?.getFullYear()) {
              return false;
            }
            break;
          case 'custom':
            if (filters?.startDate && closeDate < new Date(filters.startDate)) return false;
            if (filters?.endDate && closeDate > new Date(filters.endDate)) return false;
            break;
        }
      }

      return true;
    });
  };

  const filteredDeals = getFilteredDeals();

  const getDealsByStage = (stageId) => {
    return filteredDeals?.filter((deal) => deal?.stage === stageId);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppLayout>
      <motion.Helmet>
        <title>Sales Pipeline</title>
      </motion.Helmet>
      <main className="lg:ml-6 pt-6">
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Sales Pipeline</h1>
              <p className="text-muted-foreground">
                Manage your deals through the sales process with drag-and-drop functionality
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                iconName="Download"
                iconPosition="left"
                iconSize={16}>

                Export Pipeline
              </Button>
              <Button
                variant="default"
                onClick={() => handleAddDeal()}
                iconName="Plus"
                iconPosition="left"
                iconSize={16}>

                Add Deal
              </Button>
            </div>
          </div>

          {/* Pipeline Stats */}
          <PipelineStats deals={filteredDeals} />

          {/* Filters */}
          <PipelineFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onResetFilters={handleResetFilters} />


          {/* Pipeline Board */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Icon name="Kanban" size={24} className="text-primary" />
                <div>
                  <h2 className="text-xl font-bold text-card-foreground">Pipeline Board</h2>
                  <p className="text-base font-medium text-foreground">
                    {filteredDeals?.length} deal{filteredDeals?.length !== 1 ? 's' : ''} • 
                    <span className="text-primary font-semibold ml-1">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0
                      })?.format(filteredDeals?.reduce((sum, deal) => sum + deal?.value, 0))}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Kanban Board with Horizontal Scroll */}
            <div className="overflow-x-auto">
              <div className="flex gap-6 min-h-[600px] w-max min-w-full">
                {pipelineStages?.map((stage) =>
                <motion.div
                  key={stage?.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: pipelineStages?.indexOf(stage) * 0.1 }}
                  className="flex-shrink-0 w-80 h-full">

                    <PipelineColumn
                    stage={stage}
                    deals={getDealsByStage(stage?.id)}
                    onDealMove={handleDealMove}
                    onAddDeal={handleAddDeal}
                    onEditDeal={handleEditDeal}
                    onDeleteDeal={handleDeleteDeal}
                    onCloneDeal={handleCloneDeal} />

                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Pipeline View */}
          <div className="lg:hidden">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Icon name="Smartphone" size={24} className="text-primary" />
                <div>
                  <h3 className="text-lg font-bold text-card-foreground">Mobile Pipeline View</h3>
                  <p className="text-sm text-muted-foreground">
                    Switch to landscape mode or use a larger screen for the full Kanban board experience.
                  </p>
                </div>
              </div>
              
              {/* Stage Tabs for Mobile */}
              <div className="space-y-4">
                {pipelineStages?.map((stage) => {
                  const stageDeals = getDealsByStage(stage?.id);
                  return (
                    <div key={stage?.id} className="border border-border rounded-lg p-4 bg-muted/20">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-card-foreground text-base">{stage?.name}</h4>
                        <span className="text-sm font-medium text-foreground bg-background px-2 py-1 rounded-full">
                          {stageDeals?.length} deal{stageDeals?.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-base font-semibold text-primary">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0
                        })?.format(stageDeals?.reduce((sum, deal) => sum + deal?.value, 0))}
                      </div>
                    </div>);

                })}
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Add Deal Modal */}
      <AddDealModal
        isOpen={isAddDealModalOpen}
        onClose={() => setIsAddDealModalOpen(false)}
        onSave={handleSaveDeal}
        initialStage={selectedStage} />
      </AppLayout>  
    </div>
  );

};

export default Pipeline;