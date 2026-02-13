import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import ActivityTimeline from './ActivityTimeline';

const LeadDetailView = ({ deal, isOpen, onClose, onSave, teamMembers, showToast }) => {
    const [formData, setFormData] = useState({
        title: '',
        accountName: '',
        value: 0,
        probability: 50,
        contactName: '',
        email: '',
        phone: '',
        owner: null,
        closeDate: '',
        tags: [],
        notes: '',
        status: 'new'
    });

    // Initialize form data when deal changes
    useEffect(() => {
        if (deal) {
            setFormData({
                title: deal.title || '',
                accountName: deal.accountName || '',
                value: deal.value || 0,
                probability: deal.probability || 50,
                contactName: deal.contactName || deal.owner?.name || '',
                email: deal.email || '',
                phone: deal.mobile || deal.phone || '',
                owner: deal.owner?.id || null,
                closeDate: deal.closeDate || '',
                tags: deal.tags || [],
                notes: deal.notes || '',
                status: deal.status || 'new'
            });
        }
    }, [deal]);

    const handleSave = async () => {
        try {
            await onSave({ ...deal, ...formData });
            showToast('Changes saved successfully', 'success');
        } catch (error) {
            console.error('Error saving deal:', error);
            showToast('Failed to save changes', 'error');
        }
    };

    const handleStatusChange = (newStatus) => {
        setFormData({ ...formData, status: newStatus });
        onSave({ ...deal, ...formData, status: newStatus });
        showToast(`Status updated to ${newStatus}`, 'success');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    if (!deal) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full lg:w-[90%] xl:w-[85%] bg-background shadow-elevation-3 z-50 overflow-hidden flex flex-col"
                    >
                        {/* Top Action Bar */}
                        <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={onClose}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label="Close"
                                >
                                    <Icon name="X" size={24} />
                                </button>

                            </div>

                            {/* Modern Stage Stepper */}
                            <div className="flex items-center">
                                {['New', 'Qualified', 'Proposal', 'Won'].map((stage, index, array) => {
                                    const isActive = deal.stage === stage.toLowerCase();
                                    const stageIndex = array.findIndex(s => s.toLowerCase() === deal.stage);
                                    const isPassed = index < stageIndex;

                                    return (
                                        <div key={stage} className="flex items-center">
                                            {/* Stage Step */}
                                            <div className="relative">
                                                <div
                                                    className={`
                                                        relative px-4 py-1.5 text-xs font-semibold transition-all duration-200
                                                        ${isActive
                                                            ? 'bg-primary text-primary-foreground shadow-md z-10 scale-105'
                                                            : isPassed
                                                                ? 'bg-primary/20 text-primary'
                                                                : 'bg-muted text-muted-foreground'
                                                        }
                                                        ${index === 0 ? 'rounded-l-md' : ''}
                                                        ${index === array.length - 1 ? 'rounded-r-md' : ''}
                                                    `}
                                                    style={{
                                                        clipPath: index === array.length - 1
                                                            ? 'none'
                                                            : 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)',
                                                        paddingRight: index === array.length - 1 ? '1rem' : '1.25rem'
                                                    }}
                                                >
                                                    {stage}
                                                </div>
                                            </div>
                                            {/* Connector - overlap the arrow */}
                                            {index < array.length - 1 && (
                                                <div className="-ml-2" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                                {/* Left Panel (2/3 width) */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Title and Company */}
                                    <div>
                                        <span>
                                            <h1 className="text-3xl font-bold text-foreground mb-2">
                                                {/* Use name if available (new deals), otherwise use title (old deals) */}
                                                {(deal?.name || deal?.title || deal?.email?.split('@')[0] || 'Untitled')}'s Opportunity
                                            </h1>
                                        </span>
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-1.5">
                                                <Icon name="User" size={26} className="text-muted-foreground shrink-0" />
                                                <span className="text-lg font-medium text-foreground truncate">
                                                    {/* Show name (new deals) or title (old deals) */}
                                                    {deal?.name || deal?.title || deal?.email || '-'}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1.5">
                                                <Icon name="Building2" size={26} className="text-muted-foreground shrink-0" />
                                                <span className="text-lg font-medium text-muted-foreground truncate">
                                                    {/* Show company (new deals) or extract from email domain (old deals) */}
                                                    {deal?.company || deal?.accountName || (deal?.email ? deal.email.split('@')[1]?.split('.')[0] : '-')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>


                                    {/* Contact Information */}
                                    <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                                        <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                                    Contact Name
                                                </label>
                                                <p className="text-foreground font-medium">{formData.contactName || '-'}</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                                    Email
                                                </label>
                                                <p className="text-foreground">{formData.email || '-'}</p>
                                            </div>


                                        </div>

                                        <div className="grid grid-cols-2 gap-4">


                                            <div>
                                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                                    Phone
                                                </label>
                                                <p className="text-foreground">{formData.phone || '-'}</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                                    Salesperson
                                                </label>
                                                <p className="text-foreground font-medium">
                                                    {teamMembers?.find(m => m.id === formData.owner)?.name || 'Unassigned'}
                                                </p>
                                            </div>
                                        </div>



                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                                    Expected Closing
                                                </label>
                                                <p className="text-foreground font-medium">
                                                    {formData.closeDate ? new Date(formData.closeDate).toLocaleDateString('en-US', {
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    }) : '-'}
                                                </p>
                                            </div>

                                            <div>
                                                {formData.tags && formData.tags.length > 0 && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                                                            Tags
                                                        </label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {formData.tags.map((tag, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>


                                    </div>
                                </div>

                                {/* Right Panel (1/3 width) - Activity Timeline */}
                                <div className="lg:col-span-1">
                                    <ActivityTimeline
                                        deal={deal}
                                        showToast={showToast}
                                        notes={formData.notes}
                                        onNotesChange={(newNotes) => setFormData({ ...formData, notes: newNotes })}
                                    />
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default LeadDetailView;
