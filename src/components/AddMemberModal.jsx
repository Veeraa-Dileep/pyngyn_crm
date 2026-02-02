import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import Input from './ui/Input';
import { useMembers } from '../contexts/MembersContext';

const AddMemberModal = ({ isOpen, onClose, member }) => {
    const { addMember, updateMember } = useMembers();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Sales Rep'
    });

    const roles = [
        'Sales Rep',
        'Sales Manager',
    ];

    useEffect(() => {
        if (member) {
            setFormData({
                name: member.name,
                email: member.email,
                role: member.role
            });
        } else {
            setFormData({ name: '', email: '', role: 'Sales Rep' });
        }
    }, [member, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.email.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            if (member) {
                // Update existing member
                await updateMember({
                    ...member,
                    ...formData
                });
            } else {
                // Add new member
                await addMember(formData);
            }
            onClose();
        } catch (error) {
            alert(`Failed to ${member ? 'update' : 'add'} member. Please try again.`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-xl shadow-elevation-3 w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">
                            {member ? 'Edit Team Member' : 'Add Team Member'}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {member ? 'Update member details' : 'Add a new member to your team'}
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
                        placeholder="Enter your name"
                        required
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter your email"
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
                            iconName={member ? "Save" : "UserPlus"}
                            iconPosition="left"
                            iconSize={16}
                        >
                            {member ? 'Save Changes' : 'Add Member'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMemberModal;
