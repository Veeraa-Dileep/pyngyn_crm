import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Sidebar = ({ isOpen = false, onClose, onRecycleBinOpen, onAddMemberOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // ── Sidebar compression state ───────────────────────────────────────────
  const [isCompressed, setIsCompressed] = useState(() => {
    const saved = localStorage.getItem('sidebar-compressed');
    return saved === 'true';
  });


  // Save compression state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-compressed', isCompressed);
  }, [isCompressed]);

  // ── Static nav items ──────────────────────────────────────────────────
  const topNavItems = [
    { label: 'Home', path: '/home', icon: 'Home' },
    { label: 'Leads', path: '/Leads', icon: 'Target' },
    { label: 'Pipelines', path: '/pipelines', icon: 'Kanban' },
  ];

  const NavItems2 = [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
  ];
  const BottomNavItems = [
    { label: 'Add Members', action: 'ADD_MEMBERS', icon: 'UserPlus' },
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
          <div className="flex items-center justify-center py-3 mr-3">
            <div className="mt-auto ">
              <button
                onClick={() => setIsCompressed(!isCompressed)}
                className={`
                w-full flex items-center ${isCompressed ? 'justify-center' : 'justify-between'} px-2.5 py-4 
                text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted
                transition-smooth group hidden lg:flex
              `}
                aria-label={isCompressed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={isCompressed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {!isCompressed && <span></span>}
                <Icon
                  name={isCompressed ? 'ChevronRight' : 'ChevronLeft'}
                  size={18}
                  className="text-muted-foreground group-hover:text-foreground "
                />
              </button>
            </div>

            <div className="flex items-center space-x-3">


              {!isCompressed &&
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="Zap" size={20} color="white" />
                </div>
              }
              {!isCompressed && <span className="text-lg font-semibold text-foreground ">PYNGYN CRM</span>}

            </div>
            {/* Mobile close button */}
            {!isCompressed && (
              <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden absolute right-4 top-6" aria-label="Close navigation menu">
                <Icon name="X" size={20} />
              </Button>
            )}
          </div>

          {/* ── Navigation ── */}
          <nav className="flex-1 overflow-y-auto py-4">
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