import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecycleBin = ({ isOpen, onClose, deletedLeads, onRestore, onPermanentDelete }) => {
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSelectAll = () => {
        if (selectedLeads.length === deletedLeads.length) {
            setSelectedLeads([]);
        } else {
            setSelectedLeads(deletedLeads.map(lead => lead.id));
        }
    };

    const handleSelectLead = (leadId) => {
        if (selectedLeads.includes(leadId)) {
            setSelectedLeads(selectedLeads.filter(id => id !== leadId));
        } else {
            setSelectedLeads([...selectedLeads, leadId]);
        }
    };

    const handleRestoreSelected = () => {
        selectedLeads.forEach(leadId => {
            onRestore(leadId);
        });
        setSelectedLeads([]);
    };

    const handleDeleteSelected = () => {
        if (window.confirm(`Permanently delete ${selectedLeads.length} lead(s)? This action cannot be undone.`)) {
            selectedLeads.forEach(leadId => {
                onPermanentDelete(leadId);
            });
            setSelectedLeads([]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-xl shadow-elevation-3 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            <Icon name="Trash2" size={20} className="text-muted-foreground" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Recycle Bin</h2>
                            <p className="text-sm text-muted-foreground">
                                {deletedLeads.length} deleted lead{deletedLeads.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Icon name="X" size={20} />
                    </button>
                </div>

                {/* Actions Bar */}
                {selectedLeads.length > 0 && (
                    <div className="px-6 py-3 bg-primary/5 border-b border-border flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                            {selectedLeads.length} selected
                        </span>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRestoreSelected}
                                iconName="RotateCcw"
                                iconPosition="left"
                                iconSize={14}
                            >
                                Restore
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleDeleteSelected}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                iconName="Trash2"
                                iconPosition="left"
                                iconSize={14}
                            >
                                Delete Permanently
                            </Button>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {deletedLeads.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Icon name="Trash2" size={40} className="text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Recycle bin is empty</h3>
                            <p className="text-sm text-muted-foreground text-center max-w-sm">
                                Deleted leads will appear here. You can restore them or permanently delete them.
                            </p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-muted/30 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedLeads.length === deletedLeads.length}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 rounded border-border"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Lead
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Company
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Deleted
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {deletedLeads.map((lead) => (
                                    <motion.tr
                                        key={lead.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-muted/20 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedLeads.includes(lead.id)}
                                                onChange={() => handleSelectLead(lead.id)}
                                                className="w-4 h-4 rounded border-border"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mr-3">
                                                    <span className="text-xs font-semibold text-muted-foreground">
                                                        {lead.name?.charAt(0) || '?'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{lead.name || 'Unknown'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-foreground">{lead.company || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">{lead.email || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {formatDate(lead.deletedAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onRestore(lead.id)}
                                                    iconName="RotateCcw"
                                                    iconPosition="left"
                                                    iconSize={14}
                                                    className="text-primary hover:text-primary"
                                                >
                                                    Restore
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setConfirmDelete(lead)}
                                                    iconName="Trash2"
                                                    iconPosition="left"
                                                    iconSize={14}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Deleted items are kept for 30 days before permanent deletion
                    </p>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>

            {/* Confirm Permanent Delete Modal */}
            {confirmDelete && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-60"
                    onClick={() => setConfirmDelete(null)}
                >
                    <div
                        className="bg-card border border-border rounded-xl shadow-elevation-2 w-full max-w-sm mx-4 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-5 space-y-3">
                            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                                <Icon name="AlertTriangle" size={20} className="text-destructive" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Permanently Delete Lead?</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Are you sure you want to permanently delete <span className="font-medium text-foreground">"{confirmDelete.name}"</span>? This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-muted/30">
                            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(null)}>
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => {
                                    onPermanentDelete(confirmDelete.id);
                                    setConfirmDelete(null);
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                <Icon name="Trash2" size={13} className="mr-1.5" />
                                Delete Permanently
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecycleBin;
