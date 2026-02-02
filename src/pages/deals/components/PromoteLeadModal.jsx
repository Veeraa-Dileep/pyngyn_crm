import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { usePipelines } from '../../../contexts/PipelineContext';
import { useMembers } from '../../../contexts/MembersContext';

const PromoteLeadModal = ({ isOpen, onClose, onPromote, lead }) => {
    const { pipelines, addPipeline } = usePipelines();
    const { members } = useMembers();
    const [selectedPipelineId, setSelectedPipelineId] = useState('');
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newPipelineName, setNewPipelineName] = useState('');
    const [newPipelineDescription, setNewPipelineDescription] = useState('');
    const [selectedStage, setSelectedStage] = useState('');
    const [assignedTo, setAssignedTo] = useState('');

    useEffect(() => {
        if (isOpen && pipelines.length > 0) {
            // Reset form when modal opens
            setSelectedPipelineId(pipelines[0]?.id || '');
            setIsCreatingNew(false);
            setNewPipelineName('');
            setNewPipelineDescription('');
            setSelectedStage('new');
            setAssignedTo('');
        }
    }, [isOpen, pipelines]);

    const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId);

    const handlePipelineChange = (value) => {
        if (value === 'create-new') {
            setIsCreatingNew(true);
            setSelectedPipelineId('');
        } else {
            setIsCreatingNew(false);
            setSelectedPipelineId(value);
            // Reset stage to first stage of selected pipeline
            const pipeline = pipelines.find(p => p.id === value);
            if (pipeline?.stages?.length > 0) {
                setSelectedStage(pipeline.stages[0].id);
            }
        }
    };

    const handlePromote = async () => {
        if (isCreatingNew) {
            if (!newPipelineName.trim()) {
                alert('Please enter a pipeline name');
                return;
            }
            // Create new pipeline using context
            const newPipeline = {
                name: newPipelineName,
                description: newPipelineDescription,
                stages: [
                    { id: 'new', name: 'New', color: 'blue', order: 1 },
                    { id: 'qualified', name: 'Qualified', color: 'yellow', order: 2 },
                    { id: 'proposal', name: 'Proposal', color: 'purple', order: 3 },
                    { id: 'won', name: 'Won', color: 'green', order: 4 },
                    { id: 'lost', name: 'Lost', color: 'red', order: 5 }
                ]
            };

            // Wait for pipeline to be created and get the ID
            const createdPipeline = await addPipeline(newPipeline);

            onPromote({
                leadId: lead.id,
                pipelineId: createdPipeline.id,
                pipelineName: createdPipeline.name,
                stage: 'new',
                assignedTo,
                newPipeline: createdPipeline
            });
        } else {
            if (!selectedPipelineId || !selectedStage) {
                alert('Please select a pipeline and stage');
                return;
            }

            onPromote({
                leadId: lead.id,
                pipelineId: selectedPipelineId,
                pipelineName: selectedPipeline?.name,
                stage: selectedStage,
                assignedTo
            });
        }

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-xl shadow-elevation-3 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Promote Lead to Pipeline</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Convert "{lead?.name || lead?.company}" to a deal
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Icon name="X" size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {/* Pipeline Selection */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Select Pipeline
                        </label>
                        <select
                            value={isCreatingNew ? 'create-new' : selectedPipelineId}
                            onChange={(e) => handlePipelineChange(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            {pipelines.map(pipeline => (
                                <option key={pipeline.id} value={pipeline.id}>
                                    {pipeline.name}
                                </option>
                            ))}
                            <option value="create-new">+ Create New Pipeline</option>
                        </select>
                    </div>

                    {/* Create New Pipeline Form */}
                    {isCreatingNew && (
                        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                            <div className="flex items-center space-x-2 text-primary mb-2">
                                <Icon name="Plus" size={16} />
                                <span className="text-sm font-semibold">New Pipeline Details</span>
                            </div>

                            <Input
                                label="Pipeline Name"
                                value={newPipelineName}
                                onChange={(e) => setNewPipelineName(e.target.value)}
                                placeholder="e.g., Q1 Sales, Support Pipeline"
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={newPipelineDescription}
                                    onChange={(e) => setNewPipelineDescription(e.target.value)}
                                    placeholder="Brief description of this pipeline's purpose"
                                    rows={2}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                />
                            </div>

                            <p className="text-xs text-muted-foreground">
                                The pipeline will be created with default stages (New, Qualified, Proposal, Won, Lost)
                            </p>
                        </div>
                    )}

                    {/* Stage Selection */}
                    {!isCreatingNew && selectedPipeline && (
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Starting Stage
                            </label>
                            <select
                                value={selectedStage}
                                onChange={(e) => setSelectedStage(e.target.value)}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                {selectedPipeline.stages.map(stage => (
                                    <option key={stage.id} value={stage.id}>
                                        {stage.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Assign To */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Assign To (Optional)
                        </label>
                        <select
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">Unassigned</option>
                            {members.map(member => (
                                <option key={member.id} value={member.id}>
                                    {member.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Lead Info Summary */}
                    <div className="bg-muted/20 rounded-lg p-3 border border-border">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Lead Information</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-muted-foreground">Name:</span>
                                <span className="text-foreground ml-1 font-medium">{lead?.name || '-'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Company:</span>
                                <span className="text-foreground ml-1 font-medium">{lead?.company || '-'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Email:</span>
                                <span className="text-foreground ml-1 font-medium">{lead?.email || '-'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Value:</span>
                                <span className="text-foreground ml-1 font-medium">
                                    {lead?.value ? `$${lead.value.toLocaleString()}` : '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border flex items-center justify-end space-x-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="default"
                        onClick={handlePromote}
                        iconName="ArrowRight"
                        iconPosition="right"
                        iconSize={16}
                    >
                        {isCreatingNew ? 'Create & Promote' : 'Promote to Pipeline'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PromoteLeadModal;
