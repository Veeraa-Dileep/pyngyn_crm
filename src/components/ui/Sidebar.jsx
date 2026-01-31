import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Sidebar = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isUpgradeCardVisible, setIsUpgradeCardVisible] = useState(true);

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'LayoutDashboard',
      badge: null
    },
    {
      label: 'Accounts',
      path: '/accounts',
      icon: 'Building2',
      badge: null
    },
    {
      label: 'Contacts',
      path: '/contacts',
      icon: 'Users',
      badge: null
    },
    {
      label: 'Deals',
      path: '/deals',
      icon: 'Target',
      badge: '12'
    },
    {
      label: 'Pipeline',
      path: '/pipeline',
      icon: 'GitBranch',
      badge: null
    },
    {
      label: 'Activities',
      path: '/activities',
      icon: 'Calendar',
      badge: '3'
    },
    {
      label: 'Emails',
      path: '/emails',
      icon: 'Mail',
      badge: null
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: 'BarChart3',
      badge: null
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: 'Settings',
      badge: null
    },
    {
      label: 'Billing',
      path: '/billing',
      icon: 'CreditCard',
      badge: null
    },
    {
      label: 'Integrations',
      path: '/integrations',
      icon: 'Puzzle',
      badge: null
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) {
      onClose();
    }
  };

  const handleUpgradeClick = () => {
    navigate('/billing');
    if (onClose) {
      onClose();
    }
  };

  const handleUpgradeClose = () => {
    setIsUpgradeCardVisible(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-background border-r border-border z-50 lg:z-30
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Zap" size={20} color="white" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold text-foreground">CRMPro</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-accent text-accent-foreground rounded-full">
                  v2.1
                </span>
              </div>
            </div>
            
            {/* Close button for mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
              aria-label="Close navigation menu"
            >
              <Icon name="X" size={20} />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-3 space-y-1">
              {navigationItems?.map((item) => {
                const isActive = location?.pathname === item?.path;
                
                return (
                  <button
                    key={item?.path}
                    onClick={() => handleNavigation(item?.path)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg
                      transition-smooth group
                      ${isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        name={item?.icon}
                        size={18}
                        className={`
                          ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}
                        `}
                      />
                      <span>{item?.label}</span>
                    </div>
                    {item?.badge && (
                      <span
                        className={`
                          px-2 py-0.5 text-xs font-medium rounded-full
                          ${isActive
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : 'bg-accent text-accent-foreground'
                          }
                        `}
                      >
                        {item?.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Upgrade Card */}
          {isUpgradeCardVisible && (
            <div className="p-4 border-t border-border">
              <div className="relative bg-gradient-to-br from-primary to-secondary p-4 rounded-lg text-primary-foreground">
                <button
                  onClick={handleUpgradeClose}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-smooth"
                  aria-label="Close upgrade card"
                >
                  <Icon name="X" size={14} />
                </button>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Icon name="Crown" size={20} />
                    <span className="font-semibold">Upgrade to Pro</span>
                  </div>
                  
                  <p className="text-sm text-primary-foreground/90">
                    Unlock advanced analytics, unlimited contacts, and premium integrations.
                  </p>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleUpgradeClick}
                    className="w-full bg-white/20 hover:bg-white/30 text-primary-foreground border-white/30"
                  >
                    <Icon name="ArrowRight" size={16} className="mr-2" />
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground text-center">
              © 2025 CRMPro. All rights reserved.
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;