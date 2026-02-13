import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePipelines } from '../../contexts/PipelineContext';
import AppLayout from '../../components/AppLayout';
import Icon from '../../components/AppIcon';

const HomePage = () => {
  const { pipelines } = usePipelines();
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const quickAccess = [
    {
      title: 'Leads',
      description: 'Manage your leads',
      icon: 'Users',
      path: '/Leads',
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
    },
    {
      title: 'Dashboard',
      description: 'View insights',
      icon: 'LayoutDashboard',
      path: '/dashboard',
      color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
    },
    {
      title: 'Pipelines',
      description: 'View all pipelines',
      icon: 'KanbanSquare',
      path: '/pipelines',
      color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppLayout>
        <Helmet>
          <title>Home - PYNGYN CRM</title>
        </Helmet>

        <main className="lg:ml-6 pt-6">
          <div className="px-4 lg:px-6  max-w-7xl mx-auto space-y-12">
            {/* Welcome Section */}
            <div className="space-y-2">
              <h1 className="text-2xl lg:text-3xl font-bold">
                Welcome Team
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Collaborative CRM for Modern Teams. Track your progress and manage your deals efficiently.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-10"
            >
              {/* Quick Access Section */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Icon name="Zap" size={20} className="text-yellow-500" />
                  Quick Access
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {quickAccess.map((item) => (
                    <motion.div
                      key={item.title}
                      variants={itemVariants}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      onClick={() => navigate(item.path)}
                      className="bg-card border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon name={item.icon} size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-foreground/50">
                          <Icon name="ArrowRight" size={18} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Pipelines Section */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Icon name="GitMerge" size={20} className="text-primary" />
                  Your Pipelines
                </h2>

                {pipelines.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pipelines.map((pipeline) => (
                      <motion.div
                        key={pipeline.id}
                        variants={itemVariants}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        onClick={() => navigate(`/pipeline/${pipeline.id}`)}
                        className="bg-card border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Icon name="Kanban" size={64} />
                        </div>

                        <div className="relative z-10 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                              <Icon name="Kanban" size={20} />
                            </div>
                            {pipeline.isDefault && (
                              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">Default</span>
                            )}
                          </div>

                          <div>
                            <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                              {pipeline.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                              <div className="flex items-center gap-1.5">
                                <Icon name="LayoutList" size={14} />
                                <span>{pipeline.dealCount || 0} Deals</span>
                              </div>
                              {(pipeline.totalValue > 0) && (
                                <div className="flex items-center gap-1.5">
                                  <Icon name="DollarSign" size={14} />
                                  <span>
                                    {new Intl.NumberFormat('en-US', {
                                      style: 'currency',
                                      currency: 'USD',
                                      maximumFractionDigits: 0
                                    }).format(pipeline.totalValue)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                      <Icon name="Kanban" size={24} />
                    </div>
                    <h3 className="font-medium text-foreground">No pipelines found</h3>
                    <p className="text-sm text-muted-foreground mt-1">Get started by creating your first pipeline.</p>
                    <button
                      onClick={() => navigate('/pipelines')}
                      className="mt-4 text-primary hover:underline text-sm font-medium"
                    >
                      Create Pipeline
                    </button>
                  </div>
                )}
              </section>
            </motion.div>
          </div>
        </main>
      </AppLayout>
    </div>
  );
};

export default HomePage;
