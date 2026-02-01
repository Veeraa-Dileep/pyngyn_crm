import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = ({ onMenuToggle, isSidebarOpen = false, isSidebarCompressed = false }) => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);
  const location = useLocation();

  const handleUserDropdownToggle = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
    setIsHelpDropdownOpen(false);
  };

  const handleHelpDropdownToggle = () => {
    setIsHelpDropdownOpen(!isHelpDropdownOpen);
    setIsUserDropdownOpen(false);
  };

  const handleDropdownClose = () => {
    setIsUserDropdownOpen(false);
    setIsHelpDropdownOpen(false);
  };

  const handleLogout = () => {
    // Implement logout logic
    console.log('Logout clicked');
    handleDropdownClose();
  };

  const handleProfileClick = () => {
    // Navigate to profile
    console.log('Profile clicked');
    handleDropdownClose();
  };

  const handleSettingsClick = () => {
    // Navigate to settings
    console.log('Settings clicked');
    handleDropdownClose();
  };

    
  return (
    <>
      <header className={`fixed top-0 ${isSidebarCompressed ? 'lg:left-16' : 'lg:left-64'} left-0 right-0 h-16 bg-background border-b border-border z-40 transition-all duration-300`}>
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          
                
          {/* Left Section - Mobile Menu & Logo */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="lg:hidden"
              aria-label="Toggle navigation menu"
            >
              <Icon name={isSidebarOpen ? "X" : "Menu"} size={20} />
            </Button>
            

            {/* Mobile Logo - Only visible on mobile */}
            <div className="flex items-center space-x-3 lg:hidden">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Zap" size={20} color="white" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold text-foreground">pyngyn</span>
                
              </div>
            </div>

            {/* Desktop Logo - Only visible when sidebar is compressed */}
            {isSidebarCompressed && (
              <div className="hidden lg:flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="Zap" size={20} color="white" />
                </div>
                <span className="text-lg font-semibold text-foreground">PYNGYN CRM</span>
              </div>
            )}
          </div>

          {/* Right Section - Actions & User */}
          <div className="flex items-center space-x-2">
            {/* Help Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleHelpDropdownToggle}
                className="relative"
                aria-label="Help and support"
              >
                <Icon name="HelpCircle" size={20} />
              </Button>

              {isHelpDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-50"
                    onClick={handleDropdownClose}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-elevation-2 z-60">
                    <div className="py-1">
                      <button
                        onClick={() => console.log('Documentation clicked')}
                        className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-smooth"
                      >
                        <Icon name="Book" size={16} className="mr-3" />
                        Coming Soon
                      </button>
                      {/* 
                      <button
                        onClick={() => console.log('Keyboard shortcuts clicked')}
                        className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-smooth"
                      >
                        <Icon name="Keyboard" size={16} className="mr-3" />
                        Keyboard Shortcuts
                      </button>
                      <button
                        onClick={() => console.log('Contact support clicked')}
                        className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-smooth"
                      >
                        <Icon name="MessageCircle" size={16} className="mr-3" />
                        Contact Support
                      </button>
                      <div className="border-t border-border my-1" />
                      <button
                        onClick={() => console.log('What\'s new clicked')}
                        className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-smooth"
                      >
                        <Icon name="Sparkles" size={16} className="mr-3" />
                        What's New
                        <span className="ml-auto w-2 h-2 bg-accent rounded-full" />
                      </button>
                      */}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notifications"
            >
              <Icon name="Bell" size={20} />
              {/* 
              
              */}
            </Button>
          </div>
        </div>
      </header>

      {/* Backdrop for mobile dropdowns */}
      {(isUserDropdownOpen || isHelpDropdownOpen) && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={handleDropdownClose}
        />
      )}
    </>
  );
};

export default Header;