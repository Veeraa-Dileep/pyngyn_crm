import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

const MembersContext = createContext();

const COLORS = [
    '#4F46E5', '#7C3AED', '#DB2777', '#DC2626', '#EA580C',
    '#D97706', '#CA8A04', '#65A30D', '#16A34A', '#059669',
    '#0891B2', '#0284C7', '#2563EB', '#8B5CF6'
];

export const MembersProvider = ({ children }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // One-time migration from localStorage to Firestore
    useEffect(() => {
        const migrateFromLocalStorage = async () => {
            const migrated = localStorage.getItem('crm_members_migrated');
            if (migrated) return;

            const localMembers = localStorage.getItem('crm_members');
            if (localMembers) {
                try {
                    const membersData = JSON.parse(localMembers);

                    for (const member of membersData) {
                        const { id, ...memberData } = member;
                        await addDoc(collection(db, 'members'), {
                            ...memberData,
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp()
                        });
                    }

                    localStorage.setItem('crm_members_migrated', 'true');
                    console.log('Successfully migrated members to Firestore');
                } catch (error) {
                    console.error('Error migrating members:', error);
                    localStorage.setItem('crm_members_migrated', 'true');
                }
            } else {
                localStorage.setItem('crm_members_migrated', 'true');
            }
        };

        migrateFromLocalStorage();
    }, []);

    // Real-time listener for members
    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, 'members'),
            (snapshot) => {
                const memberData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                    updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
                }));
                setMembers(memberData);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching members:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const addMember = async (newMember) => {
        try {
            // Assign color based on current member count
            const color = COLORS[members.length % COLORS.length];

            const docRef = await addDoc(collection(db, 'members'), {
                ...newMember,
                color,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            return {
                id: docRef.id,
                ...newMember,
                color
            };
        } catch (error) {
            console.error('Error adding member:', error);
            throw error;
        }
    };

    const updateMember = async (updatedMember) => {
        try {
            const { id, createdAt, ...updateData } = updatedMember;
            await updateDoc(doc(db, 'members', id), {
                ...updateData,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating member:', error);
            throw error;
        }
    };

    const deleteMember = async (memberId) => {
        try {
            await deleteDoc(doc(db, 'members', memberId));
        } catch (error) {
            console.error('Error deleting member:', error);
            throw error;
        }
    };

    const getMember = (memberId) => {
        return members.find(m => m.id === memberId);
    };

    const value = {
        members,
        loading,
        addMember,
        updateMember,
        deleteMember,
        getMember
    };

    return (
        <MembersContext.Provider value={value}>
            {children}
        </MembersContext.Provider>
    );
};

export const useMembers = () => {
    const context = useContext(MembersContext);
    if (!context) {
        throw new Error('useMembers must be used within a MembersProvider');
    }
    return context;
};
