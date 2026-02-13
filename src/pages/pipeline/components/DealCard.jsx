import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const DealCard = ({ deal, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })?.format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'bg-red-100 text-red-800 border-red-200',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Low': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors?.[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getAssigneeColor = (name) => {
    if (!name) return '#9CA3AF'; // gray-400 for unassigned

    // Define a color palette
    const colors = [
      '#4F46E5', // indigo
      '#7C3AED', // purple
      '#DB2777', // pink
      '#DC2626', // red
      '#EA580C', // orange
      '#D97706', // amber
      '#CA8A04', // yellow
      '#65A30D', // lime
      '#16A34A', // green
      '#059669', // emerald
      '#0891B2', // cyan
      '#0284C7', // sky
      '#2563EB', // blue
      '#8B5CF6', // violet
    ];

    // Generate a consistent color based on the name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };


  const getCloseDateStatus = (closeDate) => {
    const today = new Date();
    const close = new Date(closeDate);
    const diffTime = close - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { color: 'text-red-600', text: 'Overdue' };
    if (diffDays <= 7) return { color: 'text-yellow-600', text: 'Due Soon' };
    return { color: 'text-muted-foreground', text: formatDate(closeDate) };
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    e?.dataTransfer?.setData('text/plain', deal?.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const closeDateStatus = getCloseDateStatus(deal?.closeDate);

  return (
    <motion.div
      className={`
        relative bg-card border border-border rounded-lg p-3 cursor-move
        transition-all duration-200 hover:shadow-elevation-2
        ${isDragging ? 'opacity-50 rotate-2 scale-105' : ''}
      `}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      layout
    >
      {/* Actions Menu */}
      {isHovered && !isDragging && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-2 right-2 flex space-x-1 bg-background border border-border rounded-md shadow-elevation-1 p-1 z-10"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-7 px-3 text-xs"
            aria-label="View deal details"
          >
            <Icon name="Eye" size={14} className="mr-1.5" />
            View Details
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-7 w-7 text-destructive hover:text-destructive"
            aria-label="Delete deal"
          >
            <Icon name="Trash2" size={14} />
          </Button>
        </motion.div>
      )}
      {/* Deal Header */}
      <div className="space-y-2.5">
        {/* Opportunity Title */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-primary truncate pr-8 leading-tight">
              {deal?.title || `${deal?.contactName || deal?.email?.split('@')[0] || 'Untitled'}'s Opportunity`}
            </h3>
          </div>
        </div>

        {/* Contact and Company Details */}
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5">
            <Icon name="User" size={14} className="text-muted-foreground shrink-0" />
            <span className="text-xs font-medium text-foreground truncate">
              {deal?.contactName || deal?.email || '-'}
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Icon name="Building2" size={14} className="text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {deal?.company || (deal?.email ? deal.email.split('@')[1]?.split('.')[0] : '-')}
            </span>
          </div>
        </div>

        {/* Deal Details */}
        <div className="space-y-2">
          {/* Owner */}
          <div className="flex items-center space-x-2">
            {/* Avatar Circle */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ backgroundColor: getAssigneeColor(deal?.owner?.name) }}
            >
              {deal?.owner?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="text-xs font-medium text-foreground truncate">
              {deal?.owner?.name}
            </span>
          </div>

          {/* Close Date */}
          <div className="flex items-center space-x-1.5">
            <Icon name="Calendar" size={14} className="text-muted-foreground flex-shrink-0" />
            <span className={`text-xs font-medium ${closeDateStatus?.color}`}>
              {closeDateStatus?.text}
            </span>
          </div>

          {/* Priority */}
          <div className="flex items-center justify-between">
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getPriorityColor(deal?.priority)}`}>
              {deal?.priority}
            </span>
            {/* 
           
            <div className="flex items-center space-x-1">
              <Icon name="TrendingUp" size={14} className="text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                {deal?.probability}%
              </span>
            </div>
           */}

          </div>
        </div>

        {/* Progress Bar 
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-foreground">
            <span>Progress</span>
            <span>{deal?.probability}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${deal?.probability}%` }}
            />
          </div>
        </div>

        
        {deal?.tags && deal?.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {deal?.tags?.slice(0, 2)?.map((tag, index) => (
              <span
                key={index}
                className="px-2.5 py-1 text-xs font-medium bg-accent text-accent-foreground rounded-full"
              >
                {tag}
              </span>
            ))}
            {deal?.tags?.length > 2 && (
              <span className="px-2.5 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                +{deal?.tags?.length - 2}
              </span>
            )}
          </div>
        )}
        */}

      </div>
    </motion.div>
  );
};

export default DealCard;