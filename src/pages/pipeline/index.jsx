import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PipelineColumn from './components/PipelineColumn';
import PipelineFilters from './components/PipelineFilters';
import AddDealModal from './components/AddDealModal';
import PipelineStats from './components/PipelineStats';
import PipelineListView from './components/PipelineListView';
import LeadDetailView from './components/LeadDetailView';
import { usePipelines } from '../../contexts/PipelineContext';
import { useDeals } from '../../contexts/DealsContext';

const Pipeline = () => {
  const { pipelineId } = useParams();
  const navigate = useNavigate();
  const { getPipeline, pipelines } = usePipelines();
  const { getDealsByPipeline, addDeal, updateDeal, deleteDeal, moveDeal } = useDeals();

  // State for current pipeline
  const [currentPipeline, setCurrentPipeline] = useState(null);
  const [isAddDealModalOpen, setIsAddDealModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'
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
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [teamMembers, setTeamMembers] = useState([]);

  // Load pipeline data when pipelineId changes
  useEffect(() => {
    if (pipelineId) {
      const pipeline = getPipeline(pipelineId);
      if (pipeline) {
        setCurrentPipeline(pipeline);
      } else {
        // Pipeline not found, redirect to pipelines page
        navigate('/pipelines');
      }
    } else {
      // No pipelineId, use default (first pipeline)
      if (pipelines.length > 0) {
        setCurrentPipeline(pipelines[0]);
      }
    }
  }, [pipelineId, navigate, getPipeline, pipelines]);

  // Get stages from current pipeline
  const pipelineStages = currentPipeline?.stages || [];



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
    if (currentPipeline) {
      addDeal(currentPipeline.id, newDeal);
    }
  };

  const handleDealMove = (dealId, newStageId) => {
    if (currentPipeline) {
      moveDeal(dealId, currentPipeline.id, currentPipeline.id, newStageId);
    }
  };

  const handleEditDeal = (deal) => {
    setSelectedDeal(deal);
    setIsDetailViewOpen(true);
  };

  const handleDeleteDeal = (dealId) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      if (currentPipeline) {
        deleteDeal(currentPipeline.id, dealId);
      }
    }
  };




  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSaveDealDetails = async (updatedDeal) => {
    if (currentPipeline) {
      await updateDeal(currentPipeline.id, updatedDeal.id, updatedDeal);
    }
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
    const deals = currentPipeline ? getDealsByPipeline(currentPipeline.id) : [];
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
          <title>{currentPipeline?.name || 'Pipeline'}</title>
        </motion.Helmet>
        <main className="lg:ml-6 pt-6">
          <div className="p-4 space-y-4">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <button
                    onClick={() => navigate('/pipelines')}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon name="ChevronLeft" size={20} />
                  </button>
                  <h1 className="text-2xl font-bold text-foreground">
                    {currentPipeline?.name || 'Pipeline'}
                  </h1>
                </div>
                <p className="text-muted-foreground ml-7">
                  {currentPipeline?.description || 'Manage your deals through the sales process'}
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



            {/* Pipeline Board / List View */}
            <div className="bg-card border border-border rounded-xl p-3">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Icon name="Kanban" size={24} className="text-primary" />
                  <div>
                    <h2 className="text-xl font-bold text-card-foreground">
                      {viewMode === 'board' ? 'Pipeline Board' : 'Pipeline List'}
                    </h2>
                    <p className="text-base font-medium text-foreground">
                      {filteredDeals?.length} lead{filteredDeals?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border">
                  <button
                    onClick={() => setViewMode('board')}
                    className={`
                      flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                      ${viewMode === 'board'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'}
                    `}
                  >
                    <Icon name="Kanban" size={16} />
                    <span>Board</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`
                      flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                      ${viewMode === 'list'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'}
                    `}
                  >
                    <Icon name="List" size={16} />
                    <span>List</span>
                  </button>
                </div>
              </div>

              {viewMode === 'board' ? (
                <>
                  {/* Kanban Board with Horizontal Scroll */}
                  <div className="w-full">
                    <div className="flex justify-between min-h-[600px]">
                      {pipelineStages?.map((stage) =>
                        <motion.div
                          key={stage?.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: pipelineStages?.indexOf(stage) * 0.1 }}
                          className="h-full"
                          style={{ width: '19%', minWidth: '180px' }}>

                          <PipelineColumn
                            stage={stage}
                            deals={getDealsByStage(stage?.id)}
                            onDealMove={handleDealMove}
                            onAddDeal={handleAddDeal}
                            onEditDeal={handleEditDeal}
                            onDeleteDeal={handleDeleteDeal} />

                        </motion.div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <PipelineListView
                  deals={filteredDeals}
                  stages={pipelineStages}
                  onEditDeal={handleEditDeal}
                  onDeleteDeal={handleDeleteDeal}
                  onStageChange={handleDealMove}
                />
              )}
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

        {/* Lead Detail View */}
        <LeadDetailView
          deal={selectedDeal}
          isOpen={isDetailViewOpen}
          onClose={() => setIsDetailViewOpen(false)}
          onSave={handleSaveDealDetails}
          teamMembers={teamMembers}
          showToast={showToast}
        />

        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-elevation-3 z-50 ${toastType === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
              }`}
          >
            {toastMessage}
          </div>
        )}
      </AppLayout>
    </div>
  );

};

export default Pipeline;