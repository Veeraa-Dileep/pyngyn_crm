import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import ActivityTimeline from './ActivityTimeline';

const LeadDetailView = ({ deal, isOpen, onClose, onSave, teamMembers, showToast }) => {
    const [activeTab, setActiveTab] = useState('notes');
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

                            <div className="flex items-center space-x-2">
                                {/* Stage Pills */}
                                <div className="flex items-center space-x-2">
                                    {['New', 'Qualified', 'Proposition', 'Won'].map((stage) => (
                                        <span
                                            key={stage}
                                            className={`px-3 py-1 text-xs font-semibold rounded-full ${deal.stage === stage.toLowerCase()
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground'
                                                }`}
                                        >
                                            {stage}
                                        </span>
                                    ))}
                                </div>

                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                                {/* Left Panel (2/3 width) */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Title and Company */}
                                    <div>
                                        <span>Title:</span>
                                        <span>
                                            <h1 className="text-3xl font-bold text-foreground mb-2">
                                                {formData.title || 'Untitled Opportunity'}
                                            </h1>
                                        </span>
                                        <span>Company:</span>
                                        <p className="text-lg text-muted-foreground font-bold">
                                            {formData.accountName || 'No company'}
                                        </p>
                                    </div>

                                    {/* Revenue and Probability */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                                Expected Revenue
                                            </label>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="number"
                                                    value={formData.value}
                                                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                                                    className="w-full px-4 py-2 text-2xl font-bold text-foreground bg-muted/30 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-smooth"
                                                />
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{formatCurrency(formData.value)}</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                                Probability
                                            </label>
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={formData.probability}
                                                    onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
                                                    className="flex-1"
                                                />
                                                <span className="text-2xl font-bold text-foreground w-16 text-right">
                                                    {formData.probability}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2 mt-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${formData.probability}%` }}
                                                />
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
                                                    Email
                                                </label>
                                                <p className="text-foreground">{formData.email || '-'}</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                                    Phone
                                                </label>
                                                <p className="text-foreground">{formData.phone || '-'}</p>
                                            </div>
                                        </div>

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

                                    {/* Tabs: Notes / Contacts */}
                                    <div>
                                        <div className="flex items-center space-x-1 border-b border-border mb-4">
                                            <button
                                                onClick={() => setActiveTab('notes')}
                                                className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'notes'
                                                    ? 'text-primary border-b-2 border-primary'
                                                    : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                Notes
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('contacts')}
                                                className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'contacts'
                                                    ? 'text-primary border-b-2 border-primary'
                                                    : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                Contacts
                                            </button>
                                        </div>

                                        {activeTab === 'notes' && (
                                            <div>
                                                <textarea
                                                    value={formData.notes}
                                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                    rows={6}
                                                    className="w-full p-4 text-sm bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-smooth resize-none"
                                                    placeholder="Add notes about this opportunity..."
                                                />
                                            </div>
                                        )}

                                        {activeTab === 'contacts' && (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <Icon name="Users" size={48} className="mx-auto mb-3 opacity-30" />
                                                <p>Contact management coming soon</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Panel (1/3 width) - Activity Timeline */}
                                <div className="lg:col-span-1">
                                    <ActivityTimeline deal={deal} showToast={showToast} />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Action Bar */}
                        <div className="bg-card border-t border-border px-6 py-4 flex items-center justify-between">
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave}>
                                <Icon name="Check" size={16} className="mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default LeadDetailView;
