import React, { useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DeletePipelineModal = ({ isOpen, onClose, onConfirm, pipelineName }) => {
    // Close on Escape key
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-9999 p-4 animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-card border border-border rounded-xl shadow-elevation-3 w-full max-w-md p-6 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
                        <Icon name="AlertTriangle" size={24} className="text-error" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Delete Permanently?</h2>
                        <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                    </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-foreground mb-2">
                        {pipelineName || 'Untitled Pipeline'}
                    </p>
                    <p className="text-xs text-error">
                        All associated deals and data will be permanently deleted
                    </p>
                </div>

                <div className="flex space-x-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        className="flex-1"
                    >
                        Delete Permanently
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeletePipelineModal;
