import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ActivityTimeline = ({ deal, showToast }) => {
    const [activities, setActivities] = useState([]);
    const [newActivity, setNewActivity] = useState('');
    const [isAddingActivity, setIsAddingActivity] = useState(false);

    // Fetch activities from Firebase
    useEffect(() => {
        if (!deal?.id) return;

        const q = query(
            collection(db, 'activities'),
            where('dealId', '==', deal.id),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const activityData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setActivities(activityData);
        });

        return () => unsubscribe();
    }, [deal?.id]);

    const handleAddActivity = async () => {
        if (!newActivity.trim()) return;

        try {
            setIsAddingActivity(true);
            await addDoc(collection(db, 'activities'), {
                dealId: deal.id,
                type: 'note',
                content: newActivity.trim(),
                createdAt: serverTimestamp(),
                createdBy: deal.owner?.name || 'Unknown User'
            });
            setNewActivity('');
            showToast('Activity added successfully', 'success');
        } catch (error) {
            console.error('Error adding activity:', error);
            showToast('Failed to add activity', 'error');
        } finally {
            setIsAddingActivity(false);
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'call':
                return { name: 'Phone', color: 'text-blue-500' };
            case 'email':
                return { name: 'Mail', color: 'text-purple-500' };
            case 'meeting':
                return { name: 'Calendar', color: 'text-green-500' };
            case 'note':
                return { name: 'FileText', color: 'text-gray-500' };
            case 'status_change':
                return { name: 'RefreshCw', color: 'text-orange-500' };
            default:
                return { name: 'Activity', color: 'text-gray-500' };
        }
    };

    const formatActivityTime = (timestamp) => {
        if (!timestamp) return 'Just now';

        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            const now = new Date();
            const diffInMs = now - date;
            const diffInMinutes = Math.floor(diffInMs / 1000 / 60);
            const diffInHours = Math.floor(diffInMinutes / 60);
            const diffInDays = Math.floor(diffInHours / 24);

            if (diffInMinutes < 1) return 'Just now';
            if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
            if (diffInHours < 24) return `${diffInHours}h ago`;
            if (diffInDays < 7) return `${diffInDays}d ago`;

            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        } catch (error) {
            return 'Unknown';
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Activity Timeline</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Icon name="Filter" size={16} />
                </Button>
            </div>

            {/* Add Activity */}
            <div className="mb-4">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newActivity}
                        onChange={(e) => setNewActivity(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddActivity()}
                        placeholder="Log an activity..."
                        className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-smooth"
                    />
                    <Button
                        size="sm"
                        onClick={handleAddActivity}
                        disabled={!newActivity.trim() || isAddingActivity}
                        className="px-3"
                    >
                        <Icon name="Plus" size={16} />
                    </Button>
                </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {activities.length === 0 ? (
                    <div className="text-center py-12">
                        <Icon name="Activity" size={48} className="mx-auto mb-3 text-muted-foreground opacity-30" />
                        <p className="text-sm text-muted-foreground">No activities yet</p>
                        <p className="text-xs text-muted-foreground mt-1">Log your first activity above</p>
                    </div>
                ) : (
                    activities.map((activity, index) => {
                        const icon = getActivityIcon(activity.type);
                        return (
                            <div key={activity.id} className="flex space-x-3">
                                {/* Timeline Line */}
                                <div className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${icon.color}`}>
                                        <Icon name={icon.name} size={14} />
                                    </div>
                                    {index < activities.length - 1 && (
                                        <div className="w-0.5 flex-1 bg-border mt-2" style={{ minHeight: '20px' }} />
                                    )}
                                </div>

                                {/* Activity Content */}
                                <div className="flex-1 pb-4">
                                    <div className="flex items-start justify-between mb-1">
                                        <span className="text-sm font-medium text-foreground">
                                            {activity.createdBy}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatActivityTime(activity.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {activity.content}
                                    </p>
                                    {activity.metadata && (
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            {activity.metadata}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ActivityTimeline;
