import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PipelineCard = ({ pipeline, onClick, onEdit, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        onEdit();
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete();
    };

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:shadow-elevation-2 transition-all relative group"
        >
            {/* Actions */}
            {isHovered && (
                <div className="absolute top-3 right-3 flex space-x-1 bg-background border border-border rounded-md shadow-elevation-1 p-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleEdit}
                        className="h-7 w-7"
                        aria-label="Edit pipeline"
                    >
                        <Icon name="Edit2" size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        aria-label="Delete pipeline"
                    >
                        <Icon name="Trash2" size={14} />
                    </Button>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon name="GitBranch" size={20} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground flex items-center space-x-2">
                            <span>{pipeline.name}</span>
                        </h3>
                        {pipeline.description && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {pipeline.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Stages</p>
                    <p className="text-sm font-semibold text-foreground">{pipeline.stages?.length || 0}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Deals</p>
                    <p className="text-sm font-semibold text-foreground">{pipeline.dealCount}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Value</p>
                    <p className="text-sm font-semibold text-primary">
                        {formatCurrency(pipeline.totalValue)}
                    </p>
                </div>
            </div>

            {/* Stages Preview */}
            <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">Stages</p>
                <div className="flex flex-wrap gap-1.5">
                    {pipeline.stages?.slice(0, 3).map((stage) => (
                        <span
                            key={stage.id}
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${stage.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                stage.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                    stage.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                                        stage.color === 'green' ? 'bg-green-100 text-green-800' :
                                            stage.color === 'red' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                }`}
                        >
                            {stage.name}
                        </span>
                    ))}
                    {pipeline.stages?.length > 3 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                            +{pipeline.stages.length - 3}
                        </span>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                    Created {formatDate(pipeline.createdAt)}
                </span>
                <Icon name="ArrowRight" size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
        </div>
    );
};

export default PipelineCard;
