import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RightRail = () => {
  const navigate = useNavigate();

  const quickLinks = [
    {
      title: 'View Documentation',
      description: 'Learn how to maximize your CRM usage',
      icon: 'Book',
      action: () => console.log('Documentation clicked')
    },
    {
      title: 'Need Help?',
      description: 'Contact our support team',
      icon: 'HelpCircle',
      action: () => console.log('Help clicked')
    },
    {
      title: 'Share Feedback',
      description: 'Help us improve CRMPro',
      icon: 'MessageSquare',
      action: () => console.log('Feedback clicked')
    }
  ];

  const handleUpgradeClick = () => {
    navigate('/billing');
  };

  return (
    <div className="space-y-6">
      {/* Quick Links */}
      <motion.div 
        className="bg-card border border-border rounded-xl p-6 shadow-elevation-1"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Quick Actions</h3>
        <div className="space-y-3">
          {quickLinks?.map((link, index) => (
            <button
              key={index}
              onClick={link?.action}
              className="w-full flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-smooth text-left"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name={link?.icon} size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-card-foreground mb-1">
                  {link?.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {link?.description}
                </p>
              </div>
              <Icon name="ArrowRight" size={14} className="text-muted-foreground mt-1" />
            </button>
          ))}
        </div>
      </motion.div>
      {/* Upgrade Card */}
      <motion.div 
        className="bg-gradient-to-br from-primary to-secondary p-6 rounded-xl text-primary-foreground shadow-elevation-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Icon name="Crown" size={24} />
            <span className="text-lg font-semibold">Upgrade to Premium</span>
          </div>
          
          <p className="text-sm text-primary-foreground/90">
            Unlock advanced analytics, unlimited contacts, custom fields, and premium integrations to supercharge your sales process.
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Icon name="Check" size={16} />
              <span>Advanced reporting & analytics</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Icon name="Check" size={16} />
              <span>Unlimited contacts & deals</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Icon name="Check" size={16} />
              <span>Custom fields & workflows</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Icon name="Check" size={16} />
              <span>Priority support</span>
            </div>
          </div>
          
          <Button
            variant="secondary"
            onClick={handleUpgradeClick}
            className="w-full bg-white/20 hover:bg-white/30 text-primary-foreground border-white/30"
          >
            <Icon name="ArrowRight" size={16} className="mr-2" />
            Upgrade Now
          </Button>
          
          <p className="text-xs text-primary-foreground/70 text-center">
            30-day money-back guarantee
          </p>
        </div>
      </motion.div>
      {/* Stats Card */}
      <motion.div 
        className="bg-card border border-border rounded-xl p-6 shadow-elevation-1"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Your Progress</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Monthly Goal</span>
              <span className="text-sm font-medium text-card-foreground">74%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '74%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Quarterly Target</span>
              <span className="text-sm font-medium text-card-foreground">89%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-accent h-2 rounded-full" style={{ width: '89%' }}></div>
            </div>
          </div>
          
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rank</span>
              <div className="flex items-center space-x-1">
                <Icon name="Trophy" size={16} className="text-accent" />
                <span className="text-sm font-medium text-card-foreground">#3 in team</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RightRail;