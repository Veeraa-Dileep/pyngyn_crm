import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import Input from './ui/Input';

const AddMemberModal = ({ isOpen, onClose, onAddMember, members }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Sales Rep'
    });

    const roles = [
        'Sales Rep',
        'Sales Manager',
        'Account Executive',
        'Business Development',
        'Customer Success',
        'Support Agent'
    ];

    const colors = [
        '#4F46E5', '#7C3AED', '#DB2777', '#DC2626', '#EA580C',
        '#D97706', '#CA8A04', '#65A30D', '#16A34A', '#059669',
        '#0891B2', '#0284C7', '#2563EB', '#4F46E5'
    ];

    useEffect(() => {
        if (!isOpen) {
            setFormData({ name: '', email: '', role: 'Sales Rep' });
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.email.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        const newMember = {
            id: `member-${Date.now()}`,
            ...formData,
            color: colors[members.length % colors.length],
            createdAt: new Date().toISOString()
        };

        onAddMember(newMember);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-xl shadow-elevation-3 w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Add Team Member</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Add a new member to your team
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Icon name="X" size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                    <Input
                        label="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        required
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Role
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            {roles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end space-x-3 pt-2">
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
                            iconName="UserPlus"
                            iconPosition="left"
                            iconSize={16}
                        >
                            Add Member
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMemberModal;
