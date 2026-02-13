import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import ActivityTimeline from './ActivityTimeline';

const LeadDetailView = ({ deal, isOpen, onClose, onSave, teamMembers, showToast }) => {
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        value: 0,
        probability: 50,
        contactName: '',
        email: '',
        mobile: '',
        owner: null,
        closeDate: '',
        source: '',
        notes: '',
        status: 'new'
    });

    // Initialize form data when deal changes
    useEffect(() => {
        if (deal) {
            setFormData({
                title: deal.title || '',
                company: deal.company || '',
                value: deal.value || 0,
                probability: deal.probability || 50,
                contactName: deal.contactName || '',
                email: deal.email || '',
                mobile: deal.mobile || '',
                owner: deal.owner?.id || null,
                closeDate: deal.closeDate || '',
                source: deal.source || '',
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
                                                {deal?.title || 'Untitled'}
                                            </h1>
                                        </span>
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-1.5">
                                                <Icon name="User" size={26} className="text-muted-foreground shrink-0" />
                                                <span className="text-lg font-medium text-foreground truncate">
                                                    {deal?.contactName || '-'}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1.5">
                                                <Icon name="Building2" size={26} className="text-muted-foreground shrink-0" />
                                                <span className="text-lg font-medium text-muted-foreground truncate">
                                                    {deal?.company || '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>


                                    {/* Contact Information */}
                                    <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm space-y-6">
                                        <div className="flex items-center space-x-3 border-b border-border/40 pb-4">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Icon name="Contact" size={20} className="text-primary" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-foreground">Contact & Deal Details</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                            {/* Contact Name */}
                                            <div className="space-y-2 group">
                                                <div className="flex items-center space-x-2 text-muted-foreground group-hover:text-primary transition-colors">
                                                    <Icon name="User" size={16} />
                                                    <span className="text-xs font-medium uppercase tracking-wider">Contact Name</span>
                                                </div>
                                                <p className="text-foreground font-medium pl-6 text-base">{formData.contactName || '-'}</p>
                                            </div>

                                            {/* Salesperson */}
                                            <div className="space-y-2 group">
                                                <div className="flex items-center space-x-2 text-muted-foreground group-hover:text-primary transition-colors">
                                                    <Icon name="UserCheck" size={16} />
                                                    <span className="text-xs font-medium uppercase tracking-wider">Salesperson</span>
                                                </div>
                                                <div className="pl-6 flex items-center">
                                                    {formData.owner ? (
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground">
                                                                {(teamMembers?.find(m => m.id === formData.owner)?.name || deal?.owner?.name || '?').charAt(0)}
                                                            </div>
                                                            <span className="text-foreground font-medium">
                                                                {teamMembers?.find(m => m.id === formData.owner)?.name || deal?.owner?.name}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">Unassigned</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div className="space-y-2 group">
                                                <div className="flex items-center space-x-2 text-muted-foreground group-hover:text-primary transition-colors">
                                                    <Icon name="Mail" size={16} />
                                                    <span className="text-xs font-medium uppercase tracking-wider">Email</span>
                                                </div>
                                                {formData.email ? (
                                                    <a
                                                        href={`mailto:${formData.email}`}
                                                        className="text-foreground font-medium pl-6 hover:text-primary hover:underline transition-all block truncate text-base"
                                                    >
                                                        {formData.email}
                                                    </a>
                                                ) : (
                                                    <p className="text-muted-foreground pl-6">-</p>
                                                )}
                                            </div>

                                            {/* Phone */}
                                            <div className="space-y-2 group">
                                                <div className="flex items-center space-x-2 text-muted-foreground group-hover:text-primary transition-colors">
                                                    <Icon name="Phone" size={16} />
                                                    <span className="text-xs font-medium uppercase tracking-wider">Phone</span>
                                                </div>
                                                {formData.mobile ? (
                                                    <a
                                                        href={`tel:${formData.mobile}`}
                                                        className="text-foreground font-medium pl-6 hover:text-primary hover:underline transition-all block text-base"
                                                    >
                                                        {formData.mobile}
                                                    </a>
                                                ) : (
                                                    <p className="text-muted-foreground pl-6">-</p>
                                                )}
                                            </div>

                                            {/* Expected Closing */}
                                            <div className="space-y-2 group">
                                                <div className="flex items-center space-x-2 text-muted-foreground group-hover:text-primary transition-colors">
                                                    <Icon name="Calendar" size={16} />
                                                    <span className="text-xs font-medium uppercase tracking-wider">Expected Closing</span>
                                                </div>
                                                <p className="text-foreground font-medium pl-6 text-base">
                                                    {formData.closeDate ? new Date(formData.closeDate).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    }) : '-'}
                                                </p>
                                            </div>

                                            {/* Source */}
                                            <div className="space-y-2 group">
                                                <div className="flex items-center space-x-2 text-muted-foreground group-hover:text-primary transition-colors">
                                                    <Icon name="Globe" size={16} />
                                                    <span className="text-xs font-medium uppercase tracking-wider">Source</span>
                                                </div>
                                                <div className="pl-6">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-secondary-foreground/10 shadow-sm">
                                                        {formData.source || 'Unknown'}
                                                    </span>
                                                </div>
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
