import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    collection,
    collectionGroup,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    writeBatch,
    getDocs,
    query,
    where
} from 'firebase/firestore';
import { db } from '../firebase';

const DealsContext = createContext();

// Mock deal  data for the default pipeline
const DEFAULT_DEAL = {
    title: 'Enterprise Software License',
    contactName: 'John Doe',
    company: 'TechCorp Solutions',
    email: '',
    mobile: '',
    value: 125000,
    owner: {
        id: 'john-doe',
        name: 'John Doe',
    },
    closeDate: '2025-01-15',
    priority: 'High',
    probability: 85,
    stage: 'new',
    source: 'Enterprise',
    pipelineId: 'sales-pipeline'
};

export const DealsProvider = ({ children }) => {
    const [dealsByPipeline, setDealsByPipeline] = useState({});
    const [loading, setLoading] = useState(true);

    // One-time migration from localStorage to Firestore
    useEffect(() => {
        const migrateFromLocalStorage = async () => {
            const migrated = localStorage.getItem('crm_deals_migrated');
            if (migrated) return;

            const localDeals = localStorage.getItem('crm_deals');
            if (localDeals) {
                try {
                    const dealsMap = JSON.parse(localDeals);

                    for (const [pipelineId, deals] of Object.entries(dealsMap)) {
                        for (const deal of deals) {
                            await addDoc(collection(db, 'pipelines', pipelineId, 'deals'), {
                                ...deal,
                                pipelineId,
                                createdAt: serverTimestamp(),
                                updatedAt: serverTimestamp()
                            });
                        }
                    }

                    localStorage.setItem('crm_deals_migrated', 'true');
                    console.log('Successfully migrated deals to Firestore');
                } catch (error) {
                    console.error('Error migrating deals:', error);
                }
            }
        };

        migrateFromLocalStorage();
    }, []);

    // Real-time listener for all deals across all pipelines
    useEffect(() => {
        const unsubscribe = onSnapshot(
            collectionGroup(db, 'deals'),
            (snapshot) => {
                const dealsByPipeline = {};
                snapshot.docs.forEach(docSnapshot => {
                    const data = docSnapshot.data();
                    // Filter out deleted deals from the main view
                    if (data.status === 'deleted') return;

                    const deal = {
                        id: docSnapshot.id,
                        ...data,
                        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
                    };
                    const pipelineId = deal.pipelineId;
                    if (!dealsByPipeline[pipelineId]) {
                        dealsByPipeline[pipelineId] = [];
                    }
                    dealsByPipeline[pipelineId].push(deal);
                });
                setDealsByPipeline(dealsByPipeline);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching deals:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const updatePipelineStats = async (pipelineId) => {
        try {
            // Stats should only count active (non-deleted) deals
            // The dealsByPipeline state is already filtered, but we might need to be careful if calling this
            // before state updates. For accuracy, we could query Firestore, but using state is faster/cheaper.
            // Recalculating based on state:
            const deals = dealsByPipeline[pipelineId] || [];
            const dealCount = deals.length;
            const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);

            await updateDoc(doc(db, 'pipelines', pipelineId), {
                dealCount,
                totalValue,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating pipeline stats:', error);
        }
    };

    const addDeal = async (pipelineId, newDeal) => {
        try {
            const docRef = await addDoc(collection(db, 'pipelines', pipelineId, 'deals'), {
                ...newDeal,
                pipelineId,
                status: 'active', // Explicitly set status
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // Update pipeline stats
            await updatePipelineStats(pipelineId);

            return {
                id: docRef.id,
                ...newDeal,
                pipelineId
            };
        } catch (error) {
            console.error('Error adding deal:', error);
            throw error;
        }
    };

    const updateDeal = async (pipelineId, updatedDeal) => {
        try {
            const { id, createdAt, ...updateData } = updatedDeal;
            await updateDoc(doc(db, 'pipelines', pipelineId, 'deals', id), {
                ...updateData,
                updatedAt: serverTimestamp()
            });

            // Update pipeline stats
            await updatePipelineStats(pipelineId);
        } catch (error) {
            console.error('Error updating deal:', error);
            throw error;
        }
    };

    const moveDeal = async (dealId, fromPipelineId, toPipelineId, toStage) => {
        try {
            if (fromPipelineId === toPipelineId) {
                // Just update the stage
                await updateDoc(doc(db, 'pipelines', fromPipelineId, 'deals', dealId), {
                    stage: toStage,
                    updatedAt: serverTimestamp()
                });
            } else {
                // Move to different pipeline: delete from old, add to new
                // NOTE: When moving, we're effectively creating a new doc in a new subcollection
                // We need to get the old deal first.
                // For simplicity assuming we have the deal data or fetch it.
                // In a real app we'd fetch the doc first.
                // Since our local state dealsByPipeline has the data:
                const deals = dealsByPipeline[fromPipelineId] || [];
                const deal = deals.find(d => d.id === dealId);

                if (deal) {
                    // Add to new pipeline
                    const { id, ...dealData } = deal;
                    await addDoc(collection(db, 'pipelines', toPipelineId, 'deals'), {
                        ...dealData,
                        pipelineId: toPipelineId,
                        stage: toStage,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    });

                    // Hard delete the old doc as it's a move, not a user deletion
                    await deleteDoc(doc(db, 'pipelines', fromPipelineId, 'deals', dealId));

                    // Update stats for both pipelines
                    await updatePipelineStats(fromPipelineId);
                    await updatePipelineStats(toPipelineId);
                }
            }
        } catch (error) {
            console.error('Error moving deal:', error);
            throw error;
        }
    };

    // Soft delete
    const deleteDeal = async (pipelineId, dealId) => {
        try {
            console.log('🗑️ Deleting deal:', { pipelineId, dealId });
            await updateDoc(doc(db, 'pipelines', pipelineId, 'deals', dealId), {
                status: 'deleted',
                deletedAt: serverTimestamp(),
                deletionSource: 'pipeline', // Track source
                updatedAt: serverTimestamp()
            });
            console.log('✅ Deal deleted successfully');

            // Update pipeline stats
            await updatePipelineStats(pipelineId);
        } catch (error) {
            console.error('❌ Error deleting deal:', error);
            throw error;
        }
    };

    const restoreDeal = async (pipelineId, dealId) => {
        try {
            await updateDoc(doc(db, 'pipelines', pipelineId, 'deals', dealId), {
                status: 'active',
                deletedAt: null,
                deletionSource: null,
                updatedAt: serverTimestamp()
            });
            // Update pipeline stats
            await updatePipelineStats(pipelineId);
        } catch (error) {
            console.error('Error restoring deal:', error);
            throw error;
        }
    };

    const permanentlyDeleteDeal = async (pipelineId, dealId) => {
        try {
            await deleteDoc(doc(db, 'pipelines', pipelineId, 'deals', dealId));
        } catch (error) {
            console.error('Error permanently deleting deal:', error);
            throw error;
        }
    };

    const getDeletedDeals = async () => {
        try {
            // We need to query all deals with status == 'deleted'
            // Collection group query
            const q = query(
                collectionGroup(db, 'deals'),
                where('status', '==', 'deleted'),
                where('deletionSource', '==', 'pipeline')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                deletedAt: doc.data().deletedAt?.toDate?.()?.toISOString() || new Date().toISOString()
            }));

        } catch (error) {
            console.error("Error getting deleted deals", error);
            return [];
        }
    };

    const getDealsByPipeline = (pipelineId) => {
        return dealsByPipeline[pipelineId] || [];
    };

    const getAllDeals = () => {
        return Object.values(dealsByPipeline).flat();
    };

    const value = {
        dealsByPipeline,
        loading,
        addDeal,
        updateDeal,
        moveDeal,
        deleteDeal,
        restoreDeal,
        permanentlyDeleteDeal,
        getDeletedDeals,
        getDealsByPipeline,
        getAllDeals
    };

    return (
        <DealsContext.Provider value={value}>
            {children}
        </DealsContext.Provider>
    );
};

export const useDeals = () => {
    const context = useContext(DealsContext);
    if (!context) {
        throw new Error('useDeals must be used within a DealsProvider');
    }
    return context;
};
