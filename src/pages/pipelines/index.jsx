import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppLayout from '../../components/AppLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PipelineCard from './components/PipelineCard';
import CreatePipelineModal from './components/CreatePipelineModal';
import DeletePipelineModal from './components/DeletePipelineModal';
import { usePipelines } from '../../contexts/PipelineContext';

const Pipelines = () => {
    const navigate = useNavigate();
    const { pipelines, addPipeline, updatePipeline, deletePipeline } = usePipelines();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingPipeline, setEditingPipeline] = useState(null);
    const [deletingPipeline, setDeletingPipeline] = useState(null);

    const handleCreatePipeline = async (newPipeline) => {
        try {
            await addPipeline(newPipeline);
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error('Error creating pipeline:', error);
            alert('Failed to create pipeline. Please try again.');
        }
    };

    const handleEditPipeline = (pipeline) => {
        setEditingPipeline(pipeline);
        setIsCreateModalOpen(true);
    };

    const handleUpdatePipeline = async (updatedPipeline) => {
        try {
            await updatePipeline(updatedPipeline);
            setEditingPipeline(null);
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error('Error updating pipeline:', error);
            alert('Failed to update pipeline. Please try again.');
        }
    };

    const handleDeletePipeline = (pipeline) => {
        setDeletingPipeline(pipeline);
    };

    const confirmDeletePipeline = () => {
        if (deletingPipeline) {
            deletePipeline(deletingPipeline.id);
            setDeletingPipeline(null);
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
                                <h1 className="text-2xl lg:text-3xl font-bold">Pipelines</h1>
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
                                            onDelete={() => handleDeletePipeline(pipeline)}
                                        />
                                    </motion.div>
                                ))
                            )}
                        </div>
                        {/* Stats Summary 
                        {pipelines.length > 0 && (
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-foreground mb-4">Summary</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                                currency: 'INR',
                                                minimumFractionDigits: 0
                                            }).format(pipelines.reduce((sum, p) => sum + p.totalValue, 0))}
                                        </p>
                                    </div>
                                     
                                </div>
                            </div>
                        )}*/}
                    </div>

                </main>

                {/* Create/Edit Pipeline Modal */}
                <CreatePipelineModal
                    isOpen={isCreateModalOpen}
                    onClose={handleCloseModal}
                    onSave={editingPipeline ? handleUpdatePipeline : handleCreatePipeline}
                    pipeline={editingPipeline}
                />

                {/* Delete Pipeline Modal */}
                <DeletePipelineModal
                    isOpen={!!deletingPipeline}
                    onClose={() => setDeletingPipeline(null)}
                    onConfirm={confirmDeletePipeline}
                    pipelineName={deletingPipeline?.name}
                />
            </AppLayout>
        </div>
    );
};

export default Pipelines;
