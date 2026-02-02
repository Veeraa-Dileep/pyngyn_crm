import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const CreatePipelineModal = ({ isOpen, onClose, onSave, pipeline }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        stages: [
            { id: 'new', name: 'New', color: 'blue', order: 1 },
            { id: 'qualified', name: 'Qualified', color: 'yellow', order: 2 },
            { id: 'proposal', name: 'Proposal', color: 'purple', order: 3 },
            { id: 'won', name: 'Won', color: 'green', order: 4 },
            { id: 'lost', name: 'Lost', color: 'red', order: 5 }
        ]
    });

    const [errors, setErrors] = useState({});

    const colorOptions = [
        { value: 'blue', label: 'Blue', class: 'bg-blue-100 text-blue-800' },
        { value: 'yellow', label: 'Yellow', class: 'bg-yellow-100 text-yellow-800' },
        { value: 'purple', label: 'Purple', class: 'bg-purple-100 text-purple-800' },
        { value: 'green', label: 'Green', class: 'bg-green-100 text-green-800' },
        { value: 'red', label: 'Red', class: 'bg-red-100 text-red-800' },
        { value: 'orange', label: 'Orange', class: 'bg-orange-100 text-orange-800' },
        { value: 'indigo', label: 'Indigo', class: 'bg-indigo-100 text-indigo-800' }
    ];

    useEffect(() => {
        if (pipeline) {
            setFormData({
                name: pipeline.name,
                description: pipeline.description || '',
                stages: pipeline.stages
            });
        } else {
            // Reset to defaults when creating new
            setFormData({
                name: '',
                description: '',
                stages: [
                    { id: 'new', name: 'New', color: 'blue', order: 1 },
                    { id: 'qualified', name: 'Qualified', color: 'yellow', order: 2 },
                    { id: 'proposal', name: 'Proposal', color: 'purple', order: 3 },
                    { id: 'won', name: 'Won', color: 'green', order: 4 },
                    { id: 'lost', name: 'Lost', color: 'red', order: 5 }
                ]
            });
        }
        setErrors({});
    }, [pipeline, isOpen]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleStageChange = (index, field, value) => {
        const newStages = [...formData.stages];
        newStages[index] = { ...newStages[index], [field]: value };
        setFormData(prev => ({ ...prev, stages: newStages }));
    };

    const addStage = () => {
        const newStage = {
            id: `stage-${Date.now()}`,
            name: '',
            color: 'blue',
            order: formData.stages.length + 1
        };
        setFormData(prev => ({ ...prev, stages: [...prev.stages, newStage] }));
    };

    const removeStage = (index) => {
        if (formData.stages.length <= 2) {
            alert('Pipeline must have at least 2 stages');
            return;
        }
        const newStages = formData.stages.filter((_, i) => i !== index);
        // Reorder remaining stages
        newStages.forEach((stage, idx) => {
            stage.order = idx + 1;
        });
        setFormData(prev => ({ ...prev, stages: newStages }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Pipeline name is required';
        }

        if (formData.stages.length < 2) {
            newErrors.stages = 'Pipeline must have at least 2 stages';
        }

        formData.stages.forEach((stage, index) => {
            if (!stage.name.trim()) {
                newErrors[`stage-${index}`] = 'Stage name is required';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            const pipelineData = {
                name: formData.name,
                description: formData.description,
                stages: formData.stages
            };

            // Only include id when editing existing pipeline
            if (pipeline?.id) {
                pipelineData.id = pipeline.id;
            }

            await onSave(pipelineData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-xl shadow-elevation-3 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">
                            {pipeline ? 'Edit Pipeline' : 'Create New Pipeline'}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {pipeline ? 'Update your pipeline settings' : 'Set up a new pipeline for your workflow'}
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
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                    {/* Pipeline Name */}
                    <div>
                        <Input
                            label="Pipeline Name"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="e.g., Sales Pipeline, Support Pipeline"
                            error={errors.name}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Brief description of this pipeline's purpose"
                            rows={3}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Stages */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-foreground">
                                Pipeline Stages
                            </label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addStage}
                                iconName="Plus"
                                iconPosition="left"
                                iconSize={14}
                            >
                                Add Stage
                            </Button>
                        </div>

                        {errors.stages && (
                            <p className="text-sm text-destructive mb-2">{errors.stages}</p>
                        )}

                        <div className="space-y-3">
                            {formData.stages.map((stage, index) => (
                                <div key={index} className="bg-muted/30 rounded-lg p-3 space-y-3">
                                    <div className="flex items-start space-x-2">
                                        <div className="flex-1 space-y-3">
                                            <Input
                                                label={`Stage ${index + 1} Name`}
                                                value={stage.name}
                                                onChange={(e) => handleStageChange(index, 'name', e.target.value)}
                                                placeholder="Stage name"
                                                error={errors[`stage-${index}`]}
                                            />

                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-1.5">
                                                    Color
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {colorOptions.map(color => (
                                                        <button
                                                            key={color.value}
                                                            type="button"
                                                            onClick={() => handleStageChange(index, 'color', color.value)}
                                                            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${color.class} ${stage.color === color.value ? 'ring-2 ring-primary ring-offset-2' : 'opacity-60 hover:opacity-100'
                                                                }`}
                                                        >
                                                            {color.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {formData.stages.length > 2 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeStage(index)}
                                                className="text-destructive hover:text-destructive mt-6"
                                            >
                                                <Icon name="Trash2" size={16} />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border flex items-center justify-end space-x-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="default"
                        onClick={handleSubmit}
                    >
                        {pipeline ? 'Update Pipeline' : 'Create Pipeline'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreatePipelineModal;
