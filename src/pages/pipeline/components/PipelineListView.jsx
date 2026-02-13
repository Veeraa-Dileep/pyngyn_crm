import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PipelineListView = ({
    deals,
    stages,
    onEditDeal,
    onDeleteDeal,
    onStageChange
}) => {
    const [hoveredRow, setHoveredRow] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })?.format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const parsed = new Date(dateString);
        if (isNaN(parsed.getTime())) return '-';

        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(parsed);
    };

    const getStageName = (stageId) => {
        const stage = stages?.find(s => s.id === stageId);
        return stage?.name || stageId;
    };

    const getStageColor = (stageId) => {
        const stageName = getStageName(stageId)?.toLowerCase();
        const colors = {
            'new': 'bg-blue-100 text-blue-800 border-blue-200',
            'qualified': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'proposal': 'bg-purple-100 text-purple-800 border-purple-200',
            'won': 'bg-green-100 text-green-800 border-green-200',
            'lost': 'bg-red-100 text-red-800 border-red-200'
        };
        return colors?.[stageName] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'High': 'bg-red-100 text-red-800 border-red-200',
            'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Low': 'bg-green-100 text-green-800 border-green-200'
        };
        return colors?.[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
    };



    const getCloseDateStatus = (closeDate) => {
        const today = new Date();
        const close = new Date(closeDate);
        const diffTime = close - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { color: 'text-red-600', isOverdue: true };
        if (diffDays <= 7) return { color: 'text-yellow-600', isOverdue: false };
        return { color: 'text-foreground', isOverdue: false };
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (column) => {
        if (sortConfig?.key !== column) {
            return <Icon name="ArrowUpDown" size={16} className="text-muted-foreground" />;
        }
        return sortConfig?.direction === 'asc'
            ? <Icon name="ArrowUp" size={16} className="text-primary" />
            : <Icon name="ArrowDown" size={16} className="text-primary" />;
    };

    const sortedDeals = useMemo(() => {
        if (!sortConfig?.key) return deals;

        const sorted = [...deals].sort((a, b) => {
            let aValue, bValue;

            switch (sortConfig.key) {
                case 'title':
                    aValue = a?.title?.toLowerCase() || '';
                    bValue = b?.title?.toLowerCase() || '';
                    break;
                case 'accountName':
                    aValue = a?.accountName?.toLowerCase() || '';
                    bValue = b?.accountName?.toLowerCase() || '';
                    break;
                case 'owner':
                    aValue = a?.owner?.name?.toLowerCase() || '';
                    bValue = b?.owner?.name?.toLowerCase() || '';
                    break;
                case 'stage':
                    aValue = a?.stage?.toLowerCase() || '';
                    bValue = b?.stage?.toLowerCase() || '';
                    break;
                case 'closeDate':
                    aValue = new Date(a?.closeDate).getTime() || 0;
                    bValue = new Date(b?.closeDate).getTime() || 0;
                    break;
                case 'priority':
                    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                    aValue = priorityOrder[a?.priority] || 0;
                    bValue = priorityOrder[b?.priority] || 0;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [deals, sortConfig]);

    const handleAction = (e, action, deal) => {
        e.stopPropagation();
        if (action === 'view') onEditDeal(deal);
        if (action === 'delete') onDeleteDeal(deal?.id);
    };

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="text-left px-4 py-3">
                                <span>Deal Title</span>
                            </th>
                            <th className="text-left px-4 py-3">
                                <span>Account</span>
                            </th>
                            <th className="text-left px-4 py-3">
                                <span>Owner</span>
                            </th>
                            <th className="text-left px-4 py-3">
                                <button
                                    onClick={() => handleSort('stage')}
                                    className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                                >
                                    <span>Stage</span>
                                    {getSortIcon('stage')}
                                </button>
                            </th>
                            <th className="text-left px-4 py-3">
                                <button
                                    onClick={() => handleSort('closeDate')}
                                    className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                                >
                                    <span>Close Date</span>
                                    {getSortIcon('closeDate')}
                                </button>
                            </th>
                            <th className="text-left px-4 py-3">
                                <button
                                    onClick={() => handleSort('priority')}
                                    className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                                >
                                    <span>Priority</span>
                                    {getSortIcon('priority')}
                                </button>
                            </th>
                            <th className="w-28 px-4 py-3">
                                <span className="text-sm font-medium text-foreground">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sortedDeals?.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="px-4 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                            <Icon name="FileText" size={28} className="text-muted-foreground" />
                                        </div>
                                        <p className="text-base font-medium text-foreground mb-2">No deals found</p>
                                        <p className="text-sm text-muted-foreground">Adjust your filters or add a new deal</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            sortedDeals?.map((deal) => {
                                const closeDateStatus = getCloseDateStatus(deal?.closeDate);
                                return (
                                    <tr
                                        key={deal?.id}
                                        onMouseEnter={() => setHoveredRow(deal?.id)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                        className="hover:bg-muted/30 transition-smooth"
                                    >
                                        <td className="px-4 py-4">
                                            <div className="font-medium text-foreground">{deal?.title}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-foreground">{deal?.accountName}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-medium text-primary-foreground">
                                                        {deal?.owner?.name?.split(' ')?.map(n => n?.[0])?.join('')}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-foreground">{deal?.owner?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {/* STAGE EDITING DISABLED - Uncomment below to re-enable stage editing */}
                                            {/* <select
                                                value={deal?.stage}
                                                onChange={(e) => onStageChange?.(deal?.id, e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${getStageColor(deal?.stage)}`}
                                            >
                                                {stages?.map((stage) => (
                                                    <option key={stage.id} value={stage.id}>
                                                        {stage.name}
                                                    </option>
                                                ))}
                                            </select> */}
                                            {/* Read-only stage badge */}
                                            <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${getStageColor(deal?.stage)}`}>
                                                {getStageName(deal?.stage)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className={`text-sm font-medium ${closeDateStatus?.color}`}>
                                                {closeDateStatus?.isOverdue && (
                                                    <span className="inline-flex items-center space-x-1">
                                                        <Icon name="AlertCircle" size={14} />
                                                        <span>Overdue</span>
                                                    </span>
                                                )}
                                                {!closeDateStatus?.isOverdue && formatDate(deal?.closeDate)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(deal?.priority)}`}>
                                                {deal?.priority}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className={`flex items-center space-x-1 transition-opacity `}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => handleAction(e, 'view', deal)}
                                                    className="h-8 px-3"
                                                    aria-label="View deal details"
                                                >
                                                    <Icon name="Eye" size={14} className="mr-1" />
                                                    <span className="text-xs">View</span>
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => handleAction(e, 'delete', deal)}
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    aria-label="Delete deal"
                                                >
                                                    <Icon name="Trash2" size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3 p-3">
                {sortedDeals?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Icon name="FileText" size={28} className="text-muted-foreground" />
                        </div>
                        <p className="text-base font-medium text-foreground mb-2">No deals found</p>
                        <p className="text-sm text-muted-foreground">Adjust your filters or add a new deal</p>
                    </div>
                ) : (
                    sortedDeals?.map((deal) => {
                        const closeDateStatus = getCloseDateStatus(deal?.closeDate);
                        return (
                            <div
                                key={deal?.id}
                                className="bg-card border border-border rounded-lg p-4 hover:shadow-elevation-1 transition-smooth"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-foreground text-sm">{deal?.title}</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">{deal?.accountName}</p>
                                    </div>
                                    {/* STAGE EDITING DISABLED - Uncomment below to re-enable stage editing */}
                                    {/* <select
                                        value={deal?.stage}
                                        onChange={(e) => onStageChange?.(deal?.id, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${getStageColor(deal?.stage)}`}
                                    >
                                        {stages?.map((stage) => (
                                            <option key={stage.id} value={stage.id}>
                                                {stage.name}
                                            </option>
                                        ))}
                                    </select> */}
                                    {/* Read-only stage badge */}
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full border ${getStageColor(deal?.stage)}`}>
                                        {getStageName(deal?.stage)}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">

                                    <div>
                                        <p className="text-xs text-muted-foreground">Owner</p>
                                        <p className="text-xs text-foreground">{deal?.owner?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Close Date</p>
                                        <p className={`text-xs font-medium ${closeDateStatus?.color}`}>
                                            {closeDateStatus?.isOverdue ? 'Overdue' : formatDate(deal?.closeDate)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Priority</p>
                                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full border ${getPriorityColor(deal?.priority)}`}>
                                            {deal?.priority}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 pt-2 border-t border-border">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => handleAction(e, 'view', deal)}
                                    >
                                        <Icon name="Eye" size={14} className="mr-1" />
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default PipelineListView;
