import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppLayout from '../../components/AppLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PipelineCard from './components/PipelineCard';
import CreatePipelineModal from './components/CreatePipelineModal';

const Pipelines = () => {
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingPipeline, setEditingPipeline] = useState(null);

    // Mock data for pipelines - will be replaced with API/database
    const [pipelines, setPipelines] = useState([
        {
            id: 'sales-pipeline',
            name: 'Sales Pipeline',
            description: 'Main sales pipeline for all deals',
            stages: [
                { id: 'new', name: 'New', color: 'blue', order: 1 },
                { id: 'qualified', name: 'Qualified', color: 'yellow', order: 2 },
                { id: 'proposal', name: 'Proposal', color: 'purple', order: 3 },
                { id: 'won', name: 'Won', color: 'green', order: 4 },
                { id: 'lost', name: 'Lost', color: 'red', order: 5 }
            ],
            dealCount: 5,
            totalValue: 625000,
            isDefault: true,
            createdAt: '2025-01-01T00:00:00Z'
        }
    ]);

    const handleCreatePipeline = (newPipeline) => {
        const pipeline = {
            ...newPipeline,
            id: `pipeline-${Date.now()}`,
            dealCount: 0,
            totalValue: 0,
            isDefault: false,
            createdAt: new Date().toISOString()
        };
        setPipelines([...pipelines, pipeline]);
        setIsCreateModalOpen(false);
    };

    const handleEditPipeline = (pipeline) => {
        setEditingPipeline(pipeline);
        setIsCreateModalOpen(true);
    };

    const handleUpdatePipeline = (updatedPipeline) => {
        setPipelines(pipelines.map(p =>
            p.id === updatedPipeline.id ? updatedPipeline : p
        ));
        setEditingPipeline(null);
        setIsCreateModalOpen(false);
    };

    const handleDeletePipeline = (pipelineId) => {
        if (window.confirm('Are you sure you want to delete this pipeline? All associated deals will be lost.')) {
            setPipelines(pipelines.filter(p => p.id !== pipelineId));
        }
    };

    const handlePipelineClick = (pipelineId) => {
        navigate(`/pipeline/${pipelineId}`);
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setEditingPipeline(null);
    };

    return (
        <div className="min-h-screen bg-background">
            <AppLayout>
                <motion.Helmet>
                    <title>Pipelines</title>
                </motion.Helmet>

                <main className="lg:ml-6 pt-6">
                    <div className="p-4 space-y-4">
                        {/* Page Header */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">Pipelines</h1>
                                <p className="text-muted-foreground">
                                    Manage your sales pipelines and workflows
                                </p>
                            </div>

                            <Button
                                variant="default"
                                onClick={() => setIsCreateModalOpen(true)}
                                iconName="Plus"
                                iconPosition="left"
                                iconSize={16}
                            >
                                Create Pipeline
                            </Button>
                        </div>

                        {/* Pipelines Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pipelines.length === 0 ? (
                                <div className="col-span-full">
                                    <div className="bg-card border border-border rounded-xl p-12 text-center">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Icon name="Kanban" size={32} className="text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-foreground mb-2">No Pipelines Yet</h3>
                                        <p className="text-muted-foreground mb-6">
                                            Create your first pipeline to start managing deals and opportunities
                                        </p>
                                        <Button
                                            variant="default"
                                            onClick={() => setIsCreateModalOpen(true)}
                                            iconName="Plus"
                                            iconPosition="left"
                                        >
                                            Create Your First Pipeline
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                pipelines.map((pipeline, index) => (
                                    <motion.div
                                        key={pipeline.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <PipelineCard
                                            pipeline={pipeline}
                                            onClick={() => handlePipelineClick(pipeline.id)}
                                            onEdit={() => handleEditPipeline(pipeline)}
                                            onDelete={() => handleDeletePipeline(pipeline.id)}
                                        />
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Stats Summary */}
                        {pipelines.length > 0 && (
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-foreground mb-4">Summary</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-muted/30 rounded-lg p-4">
                                        <p className="text-sm text-muted-foreground mb-1">Total Pipelines</p>
                                        <p className="text-2xl font-bold text-foreground">{pipelines.length}</p>
                                    </div>
                                    <div className="bg-muted/30 rounded-lg p-4">
                                        <p className="text-sm text-muted-foreground mb-1">Total Deals</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {pipelines.reduce((sum, p) => sum + p.dealCount, 0)}
                                        </p>
                                    </div>
                                    <div className="bg-muted/30 rounded-lg p-4">
                                        <p className="text-sm text-muted-foreground mb-1">Total Value</p>
                                        <p className="text-2xl font-bold text-primary">
                                            {new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency: 'USD',
                                                minimumFractionDigits: 0
                                            }).format(pipelines.reduce((sum, p) => sum + p.totalValue, 0))}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* Create/Edit Pipeline Modal */}
                <CreatePipelineModal
                    isOpen={isCreateModalOpen}
                    onClose={handleCloseModal}
                    onSave={editingPipeline ? handleUpdatePipeline : handleCreatePipeline}
                    pipeline={editingPipeline}
                />
            </AppLayout>
        </div>
    );
};

export default Pipelines;
