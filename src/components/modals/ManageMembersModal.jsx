import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import AddMemberModal from '../AddMemberModal';
import { useMembers } from '../../contexts/MembersContext';

const ManageMembersModal = ({ isOpen, onClose }) => {
    const { members, loading, deleteMember } = useMembers();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);

    const handleEdit = (member) => {
        setEditingMember(member);
        setIsAddModalOpen(true);
    };

    const handleDelete = async (memberId, memberName) => {
        if (window.confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
            try {
                await deleteMember(memberId);
            } catch (error) {
                alert('Failed to delete member. Please try again.');
            }
        }
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        setEditingMember(null);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-background rounded-xl shadow-elevation-3 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Manage Team Members</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {members.length} {members.length === 1 ? 'member' : 'members'} in your team
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
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Add Member Button */}
                        <div className="mb-4">
                            <Button
                                variant="default"
                                onClick={() => setIsAddModalOpen(true)}
                                iconName="UserPlus"
                                iconPosition="left"
                                iconSize={16}
                            >
                                Add Team Member
                            </Button>
                        </div>

                        {/* Members List */}
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-muted-foreground mt-4">Loading members...</p>
                            </div>
                        ) : members.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Icon name="Users" size={32} className="text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">No Team Members Yet</h3>
                                <p className="text-muted-foreground mb-6">
                                    Add team members to assign leads and deals
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3 flex-1">
                                                {/* Avatar */}
                                                <div
                                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                                                    style={{ backgroundColor: member.color }}
                                                >
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>

                                                {/* Member Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-foreground truncate">
                                                        {member.name}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {member.email}
                                                    </p>
                                                    <span className="inline-block mt-1 text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                                                        {member.role}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center space-x-2 ml-4">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(member)}
                                                    className="h-8 w-8"
                                                    aria-label="Edit member"
                                                >
                                                    <Icon name="Edit2" size={14} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(member.id, member.name)}
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    aria-label="Delete member"
                                                >
                                                    <Icon name="Trash2" size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-border flex justify-end">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </div>

            {/* Add/Edit Member Modal */}
            <AddMemberModal
                isOpen={isAddModalOpen}
                onClose={handleCloseAddModal}
                member={editingMember}
            />
        </>
    );
};

export default ManageMembersModal;
