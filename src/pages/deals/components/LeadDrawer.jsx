import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';

const SOURCE_OPTIONS = [
    { value: 'Manual', label: 'Manual', icon: 'UserPlus' },
    { value: 'Signup', label: 'Signup', icon: 'UserCheck' },
    { value: 'Google', label: 'Google', icon: 'Chrome' },
    { value: 'Meta', label: 'Meta', icon: 'Facebook' },
];

const LeadDrawer = ({ lead, isOpen, onClose, teamMembers = [], showToast }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        name: '',
        company: '',
        email: '',
        mobile: '',
        source: 'Manual',
        assignee: null,
        notes: '',
    });
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Initialize form data when lead changes
    useEffect(() => {
        if (lead) {
            setFormData({
                title: lead.title || '',
                name: lead.name || '',
                company: lead.company || '',
                email: lead.email || '',
                mobile: lead.mobile || '',
                source: lead.source || 'Manual',
                assignee: lead.assignee || null,
                notes: lead.notes || '',
            });
            setIsEditing(false);
            setErrors({});
        }
    }, [lead]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    if (!lead) return null;

    const formatDate = (date) => {
        if (!date) return '-';
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const validate = () => {
        const newErrors = {};

        // At least name or company is required
        if (!formData.name && !formData.company) {
            newErrors.name = 'Either Name or Company is required';
            newErrors.company = 'Either Name or Company is required';
        }

        // Email is required and must be valid
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) {
            showToast?.('Please fix validation errors', 'error');
            return;
        }

        setIsSaving(true);
        try {
            await updateDoc(doc(db, 'leads', lead.id), {
                title: formData.title,
                name: formData.name,
                company: formData.company,
                email: formData.email,
                mobile: formData.mobile,
                source: formData.source,
                assignee: formData.assignee,
                notes: formData.notes,
                updatedAt: serverTimestamp(),
            });

            showToast?.('Lead updated successfully', 'success');
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating lead:', error);
            showToast?.('Failed to update lead', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form data to original lead values
        setFormData({
            title: lead.title || '',
            name: lead.name || '',
            company: lead.company || '',
            email: lead.email || '',
            mobile: lead.mobile || '',
            source: lead.source || 'Manual',
            assignee: lead.assignee || null,
            notes: lead.notes || '',
        });
        setErrors({});
        setIsEditing(false);
    };

    const handleClose = () => {
        handleCancel();
        onClose();
    };

    const getSourceIcon = (source) => {
        const option = SOURCE_OPTIONS.find(opt => opt.value === source);
        return option?.icon || 'UserPlus';
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={handleClose}
                />
            )}

            {/* Drawer */}
            <div
                className={`
          fixed top-0 right-0 h-full w-full max-w-2xl bg-background border-l border-border z-50
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Icon name="User" size={20} className="text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">
                                    {lead.title || lead.name || lead.company || 'Lead Details'}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {lead.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {isEditing ? (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                    >
                                        <Icon name="X" size={16} className="mr-1" />
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        <Icon name="Check" size={16} className="mr-1" />
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <Icon name="Edit" size={16} className="mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleClose}
                                    >
                                        <Icon name="X" size={20} />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                    Opportunity Title
                                </label>
                                {isEditing ? (
                                    <div className="relative">
                                        <Icon
                                            name="Briefcase"
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        />
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full pl-10 pr-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-smooth"
                                            placeholder="e.g., John's Opportunity"
                                        />
                                    </div>
                                ) : (
                                    <p className="text-foreground font-medium">{formData.title || '-'}</p>
                                )}
                            </div>

                            {/* Name and Company - Grid Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                                        Name {isEditing && !formData.company && <span className="text-error">*</span>}
                                    </label>
                                    {isEditing ? (
                                        <div>
                                            <div className="relative">
                                                <Icon
                                                    name="User"
                                                    size={16}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                />
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg bg-background transition-smooth
                            ${errors.name && !formData.company
                                                            ? 'border-error focus:ring-error/20'
                                                            : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                                                        }
                            focus:outline-none`}
                                                    placeholder="Contact name"
                                                />
                                            </div>
                                            {errors.name && !formData.company && (
                                                <p className="text-xs text-error mt-1 flex items-center space-x-1">
                                                    <Icon name="AlertCircle" size={12} />
                                                    <span>{errors.name}</span>
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-foreground font-medium">{formData.name || '-'}</p>
                                    )}
                                </div>

                                {/* Company */}
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                                        Company {isEditing && !formData.name && <span className="text-error">*</span>}
                                    </label>
                                    {isEditing ? (
                                        <div>
                                            <div className="relative">
                                                <Icon
                                                    name="Building"
                                                    size={16}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                />
                                                <input
                                                    type="text"
                                                    value={formData.company}
                                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                    className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg bg-background transition-smooth
                            ${errors.company && !formData.name
                                                            ? 'border-error focus:ring-error/20'
                                                            : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                                                        }
                            focus:outline-none`}
                                                    placeholder="Company name"
                                                />
                                            </div>
                                            {errors.company && !formData.name && (
                                                <p className="text-xs text-error mt-1 flex items-center space-x-1">
                                                    <Icon name="AlertCircle" size={12} />
                                                    <span>{errors.company}</span>
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-foreground font-medium">{formData.company || '-'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Email and Mobile - Grid Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                                        Email {isEditing && <span className="text-error">*</span>}
                                    </label>
                                    {isEditing ? (
                                        <div>
                                            <div className="relative">
                                                <Icon
                                                    name="Mail"
                                                    size={16}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                />
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg bg-background transition-smooth
                            ${errors.email
                                                            ? 'border-error focus:ring-error/20'
                                                            : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                                                        }
                            focus:outline-none`}
                                                    placeholder="contact@example.com"
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="text-xs text-error mt-1 flex items-center space-x-1">
                                                    <Icon name="AlertCircle" size={12} />
                                                    <span>{errors.email}</span>
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-foreground font-medium">{formData.email || '-'}</p>
                                    )}
                                </div>

                                {/* Mobile */}
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                                        Mobile <span className="text-muted-foreground text-xs">(Optional)</span>
                                    </label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <Icon
                                                name="Phone"
                                                size={16}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                            />
                                            <input
                                                type="tel"
                                                value={formData.mobile}
                                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                                className="w-full pl-10 pr-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-smooth"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-foreground font-medium">{formData.mobile || '-'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Source */}
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                    Source
                                </label>
                                {isEditing ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {SOURCE_OPTIONS.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, source: option.value })}
                                                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-smooth
                          ${formData.source === option.value
                                                        ? 'border-primary bg-primary/10 text-primary'
                                                        : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-muted'
                                                    }
                        `}
                                            >
                                                <Icon name={option.icon} size={20} className="mb-1" />
                                                <span className="text-xs font-medium">{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <Icon name={getSourceIcon(formData.source)} size={16} className="text-primary" />
                                        </div>
                                        <span className="text-foreground font-medium">{formData.source}</span>
                                    </div>
                                )}
                            </div>

                            {/* Assignee */}
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                    Assignee
                                </label>
                                <p className="text-foreground font-medium">
                                    {formData.assignee
                                        ? teamMembers.find(m => m.id === formData.assignee)?.name || 'Unknown'
                                        : 'Unassigned'
                                    }
                                </p>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                    Notes
                                </label>
                                {isEditing ? (
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={4}
                                        className="w-full p-3 text-sm border border-border rounded-lg bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-smooth resize-none"
                                        placeholder="Add notes about this lead..."
                                    />
                                ) : (
                                    <p className="text-foreground whitespace-pre-wrap">
                                        {formData.notes || 'No notes added'}
                                    </p>
                                )}
                            </div>

                            {/* Metadata */}
                            <div className="pt-4 border-t border-border">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                                            Status
                                        </label>
                                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                            {lead.status || 'new'}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                                            Created
                                        </label>
                                        <p className="text-sm text-foreground">
                                            {formatDate(lead.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LeadDrawer;
