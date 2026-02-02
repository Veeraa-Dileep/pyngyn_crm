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
    accountName: 'TechCorp Solutions',
    value: 125000,
    owner: {
        id: 'john-doe',
        name: 'John Doe',
        avatar: "https://images.unsplash.com/photo-1588178457501-31b7688a41a0",
        avatarAlt: 'Professional headshot of John Doe in navy suit with short brown hair'
    },
    closeDate: '2025-01-15',
    priority: 'High',
    probability: 85,
    stage: 'new',
    tags: ['Enterprise', 'Software', 'Renewal'],
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
                    const deal = {
                        id: docSnapshot.id,
                        ...docSnapshot.data(),
                        createdAt: docSnapshot.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                        updatedAt: docSnapshot.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
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
                const deals = dealsByPipeline[fromPipelineId] || [];
                const deal = deals.find(d => d.id === dealId);

                if (deal) {
                    // Add to new pipeline
                    await addDoc(collection(db, 'pipelines', toPipelineId, 'deals'), {
                        ...deal,
                        pipelineId: toPipelineId,
                        stage: toStage,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    });

                    // Delete from old pipeline
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

    const deleteDeal = async (pipelineId, dealId) => {
        try {
            await deleteDoc(doc(db, 'pipelines', pipelineId, 'deals', dealId));

            // Update pipeline stats
            await updatePipelineStats(pipelineId);
        } catch (error) {
            console.error('Error deleting deal:', error);
            throw error;
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
