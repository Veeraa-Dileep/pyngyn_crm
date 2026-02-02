import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Sidebar = ({ isOpen = false, isCompressed = false, onClose, onRecycleBinOpen, onAddMemberOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // ── Static nav items ──────────────────────────────────────────────────
  const topNavItems = [
    { label: 'Home', path: '/home', icon: 'Home' },
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Leads', path: '/Leads', icon: 'Target' },
    
  ];

  const NavItems2 = [
    { label: 'Pipelines', path: '/pipelines', icon: 'Kanban' },
    
  ];
  const BottomNavItems = [
    { label: 'Manage Members', action: 'ADD_MEMBERS', icon: 'UserPlus' },
    { label: 'Recycle Bin', action: 'RECYCLE_BIN', icon: 'Trash2' },
  ];
  const handleNavigation = (path) => {
    navigate(path);
    onClose?.();
  };

  const renderNavItem = (item) => {
    const isActive = item.path && location.pathname === item.path;
    return (
      <button
        key={item.path || item.action}
        onClick={() => {
          if (item.action === 'RECYCLE_BIN') {
            onRecycleBinOpen?.();
            onClose?.();
          } else if (item.action === 'ADD_MEMBERS') {
            onAddMemberOpen?.();
            onClose?.();
          } else {
            handleNavigation(item.path);
          }
        }}
        className={`
          w-full flex items-center ${isCompressed ? 'justify-center' : 'justify-between'} px-3 py-2.5 text-sm font-medium rounded-lg
          transition-smooth group relative
          ${isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }
        `}
        aria-current={isActive ? 'page' : undefined}
        title={isCompressed ? item.label : undefined}
      >
        <div className={`flex items-center ${isCompressed ? '' : 'space-x-3'}`}>
          <Icon
            name={item.icon}
            size={18}
            className={isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}
          />
          {!isCompressed && <span>{item.label}</span>}
        </div>
      </button>
    );
  };


  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full ${isCompressed ? 'w-16' : 'w-64'} bg-background border-r border-border z-50 lg:z-30
          transform transition-all duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">

          {/* ── Header ── */}
          <div className="py-4">
            {/* Mobile close button */}
            {!isCompressed && (
              <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden absolute right-4 top-6" aria-label="Close navigation menu">
                <Icon name="X" size={20} />
              </Button>
            )}
          </div>

          {/* ── Navigation ── */}
          <nav className="flex-1 overflow-y-auto py-4 mt-10">
            <div className="px-3 space-y-1">

              {/* Home, Leads & Pipelines */}
              {topNavItems.map(renderNavItem)}

              {/* Dashboard & Recycle Bin */}
              {NavItems2.map(renderNavItem)}

            </div>

          </nav>

          <div className="mt-auto mb-2 mx-2">
            {BottomNavItems.map(renderNavItem)}
          </div>


          {/* ── Footer ── */}
          {!isCompressed && (
            <div className="p-4 border-t border-border">
              <div className="text-xs text-muted-foreground text-center">
                © 2025. All rights reserved.
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;