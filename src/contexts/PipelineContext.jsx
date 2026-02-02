import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

const PipelineContext = createContext();



export const PipelineProvider = ({ children }) => {
    const [pipelines, setPipelines] = useState([]);
    const [loading, setLoading] = useState(true);

    // One-time migration from localStorage to Firestore
    useEffect(() => {
        const migrateFromLocalStorage = async () => {
            const migrated = localStorage.getItem('crm_pipelines_migrated');
            if (migrated) return;

            const localPipelines = localStorage.getItem('crm_pipelines');
            if (localPipelines) {
                try {
                    const pipelines = JSON.parse(localPipelines);

                    // Prevent duplicates by checking existing pipelines
                    for (const pipeline of pipelines) {
                        // Remove the old 'id' field as Firestore will auto-generate
                        const { id, ...pipelineData } = pipeline;
                        await addDoc(collection(db, 'pipelines'), {
                            ...pipelineData,
                            isDefault: false, // Remove default restriction
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp()
                        });
                    }

                    localStorage.setItem('crm_pipelines_migrated', 'true');
                    console.log('Successfully migrated pipelines to Firestore');
                } catch (error) {
                    console.error('Error migrating pipelines:', error);
                    localStorage.setItem('crm_pipelines_migrated', 'true'); // Mark as done even if error
                }
            } else {
                // Mark as migrated even if no data (no default pipeline)
                localStorage.setItem('crm_pipelines_migrated', 'true');
            }
        };

        migrateFromLocalStorage();
    }, []);

    // Real-time listener for pipelines
    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, 'pipelines'),
            (snapshot) => {
                const pipelineData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
                }));
                setPipelines(pipelineData);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching pipelines:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const addPipeline = async (newPipeline) => {
        try {
            const docRef = await addDoc(collection(db, 'pipelines'), {
                ...newPipeline,
                dealCount: 0,
                totalValue: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            return {
                id: docRef.id,
                ...newPipeline,
                dealCount: 0,
                totalValue: 0
            };
        } catch (error) {
            console.error('Error adding pipeline:', error);
            throw error;
        }
    };

    const updatePipeline = async (updatedPipeline) => {
        try {
            const { id, createdAt, ...updateData } = updatedPipeline;
            await updateDoc(doc(db, 'pipelines', id), {
                ...updateData,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating pipeline:', error);
            throw error;
        }
    };

    const deletePipeline = async (pipelineId) => {
        try {
            await deleteDoc(doc(db, 'pipelines', pipelineId));
        } catch (error) {
            console.error('Error deleting pipeline:', error);
            throw error;
        }
    };

    const getPipeline = (pipelineId) => {
        return pipelines.find(p => p.id === pipelineId);
    };

    const updatePipelineStats = async (pipelineId, dealCount, totalValue) => {
        try {
            await updateDoc(doc(db, 'pipelines', pipelineId), {
                dealCount,
                totalValue,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating pipeline stats:', error);
        }
    };

    const value = {
        pipelines,
        loading,
        addPipeline,
        updatePipeline,
        deletePipeline,
        getPipeline,
        updatePipelineStats
    };

    return (
        <PipelineContext.Provider value={value}>
            {children}
        </PipelineContext.Provider>
    );
};

export const usePipelines = () => {
    const context = useContext(PipelineContext);
    if (!context) {
        throw new Error('usePipelines must be used within a PipelineProvider');
    }
    return context;
};
