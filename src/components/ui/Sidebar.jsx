import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

// ─── Temporary local state for pipelines ────────────────────────────────────
// This will move into a Redux slice later. For now it lives here so the
// sidebar can manage pipelines independently while we wire up the full flow.
const initialPipelines = [
  { id: 'sales-q1-a1b2', name: 'Sales Q1' },
];

const Sidebar = ({ isOpen = false, onClose, onRecycleBinOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // ── Sidebar compression state ───────────────────────────────────────────
  const [isCompressed, setIsCompressed] = useState(() => {
    const saved = localStorage.getItem('sidebar-compressed');
    return saved === 'true';
  });

  // ── Pipeline state ──────────────────────────────────────────────────────
  const [pipelines, setPipelines] = useState(initialPipelines);
  const [isPipelineExpanded, setIsPipelineExpanded] = useState(
    location.pathname === '/pipeline'
  );
  const [isAddingPipeline, setIsAddingPipeline] = useState(false);
  const [newPipelineName, setNewPipelineName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [hoveredPipelineId, setHoveredPipelineId] = useState(null);

  // Confirm-delete modal
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, name } | null

  const addInputRef = useRef(null);
  const editInputRef = useRef(null);

  // Auto-expand when user lands on /pipeline
  useEffect(() => {
    if (location.pathname === '/pipeline') {
      setIsPipelineExpanded(true);
    }
  }, [location.pathname]);

  // Focus the add-input when it mounts
  useEffect(() => {
    if (isAddingPipeline && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [isAddingPipeline]);

  // Focus the edit-input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  // Save compression state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-compressed', isCompressed);
  }, [isCompressed]);

  // ── Pipeline CRUD ───────────────────────────────────────────────────────
  const generatePipelineId = (name) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const suffix = Date.now().toString(36).slice(-4);
    return `${slug}-${suffix}`;
  };

  const handleAddPipeline = () => {
    const trimmed = newPipelineName.trim();
    if (!trimmed) return;
    setPipelines((prev) => [...prev, { id: generatePipelineId(trimmed), name: trimmed }]);
    setNewPipelineName('');
    setIsAddingPipeline(false);
    // Navigate so the new pipeline's board opens right away
    navigate('/pipeline');
  };

  const handleDeletePipeline = (pipeline) => {
    setConfirmDelete(pipeline); // open modal
  };

  const handleConfirmDelete = () => {
    setPipelines((prev) => prev.filter((p) => p.id !== confirmDelete.id));
    setConfirmDelete(null);
  };

  const handleRenameStart = (pipeline) => {
    setEditingId(pipeline.id);
    setEditingName(pipeline.name);
  };

  const handleRenameSave = () => {
    const trimmed = editingName.trim();
    if (trimmed) {
      setPipelines((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, name: trimmed } : p))
      );
    }
    setEditingId(null);
    setEditingName('');
  };

  // ── Static nav items (Pipeline is handled separately) ──────────────────
  const topNavItems = [
    { label: 'Home', path: '/home', icon: 'Home' },
    { label: 'Leads', path: '/Leads', icon: 'Target' },
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

  const isPipelineActive = location.pathname === '/pipeline';

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

              {/* Home & Leads */}
              {topNavItems.map(renderNavItem)}

              {/* ─────────────────────────────────────────────────────────
                  PIPELINE — parent button + expandable sub-nav
                  ───────────────────────────────────────────────────── */}
              <div className="mt-1">
                {/* Parent button */}
                <button
                  onClick={() => {
                    if (isCompressed) {
                      handleNavigation('/pipeline');
                    } else {
                      const willExpand = !isPipelineExpanded;
                      setIsPipelineExpanded(willExpand);
                      if (willExpand) handleNavigation('/pipeline');
                    }
                  }}
                  className={`
                    w-full flex items-center ${isCompressed ? 'justify-center' : 'justify-between'} px-3 py-2.5 text-sm font-medium rounded-lg
                    transition-smooth group
                    ${isPipelineActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }
                  `}
                  aria-current={isPipelineActive ? 'page' : undefined}
                  title={isCompressed ? 'Pipeline' : undefined}
                >
                  <div className={`flex items-center ${isCompressed ? '' : 'space-x-3'}`}>
                    <Icon
                      name="GitBranch"
                      size={18}
                      className={isPipelineActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}
                    />
                    {!isCompressed && <span>Pipeline</span>}
                  </div>
                  {!isCompressed && (
                    <Icon
                      name="ChevronDown"
                      size={14}
                      className={`
                        transition-transform duration-200
                        ${isPipelineExpanded ? 'rotate-180' : ''}
                        ${isPipelineActive ? 'text-primary-foreground' : 'text-muted-foreground'}
                      `}
                    />
                  )}
                </button>

                {/* Expandable sub-nav */}
                {isPipelineExpanded && !isCompressed && (
                  <div className="mt-1 ml-3 pl-3 border-l border-border space-y-0.5">

                    {/* Pipeline list */}
                    {pipelines.map((pipeline) => (
                      <div
                        key={pipeline.id}
                        onMouseEnter={() => setHoveredPipelineId(pipeline.id)}
                        onMouseLeave={() => setHoveredPipelineId(null)}
                      >
                        {/* ── Rename mode ── */}
                        {editingId === pipeline.id ? (
                          <div className="py-0.5">
                            <input
                              ref={editInputRef}
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameSave();
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              onBlur={handleRenameSave}
                              className="w-full text-xs font-medium bg-muted border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        ) : (
                          /* ── Normal display mode ── */
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => handleNavigation('/pipeline')}
                              className="flex-1 flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth text-left"
                            >
                              {/* Colored dot */}
                              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                              {/* Name */}
                              <span className="truncate">{pipeline.name}</span>
                              {/* Truncated ID hint */}
                              <span className="text-muted-foreground/40 font-mono text-[10px] ml-auto flex-shrink-0">
                                {pipeline.id.length > 12 ? pipeline.id.slice(0, 12) + '…' : pipeline.id}
                              </span>
                            </button>

                            {/* Hover actions: rename + delete */}
                            {hoveredPipelineId === pipeline.id && (
                              <div className="flex items-center gap-0.5 ml-1 flex-shrink-0">
                                <button
                                  onClick={() => handleRenameStart(pipeline)}
                                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
                                  aria-label={`Rename ${pipeline.name}`}
                                >
                                  <Icon name="Pencil" size={11} />
                                </button>
                                <button
                                  onClick={() => handleDeletePipeline(pipeline)}
                                  className="p-1 rounded text-muted-foreground hover:text-error hover:bg-error/10 transition-smooth"
                                  aria-label={`Delete ${pipeline.name}`}
                                >
                                  <Icon name="Trash2" size={11} />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* ── Add pipeline ── */}
                    {isAddingPipeline ? (
                      <div className="py-0.5 mt-1">
                        <input
                          ref={addInputRef}
                          type="text"
                          value={newPipelineName}
                          placeholder="Pipeline name"
                          onChange={(e) => setNewPipelineName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddPipeline();
                            if (e.key === 'Escape') {
                              setIsAddingPipeline(false);
                              setNewPipelineName('');
                            }
                          }}
                          onBlur={() => {
                            if (!newPipelineName.trim()) {
                              setIsAddingPipeline(false);
                            } else {
                              handleAddPipeline();
                            }
                          }}
                          className="w-full text-xs font-medium bg-muted border border-border rounded px-2 py-1 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsAddingPipeline(true)}
                        className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded text-muted-foreground hover:text-primary hover:bg-primary/5 transition-smooth mt-0.5"
                      >
                        <Icon name="Plus" size={11} />
                        <span>Add pipeline</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

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

      {/* ── Confirm-delete modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60" onClick={() => setConfirmDelete(null)}>
          <div
            className="bg-card border border-border rounded-xl shadow-elevation-2 w-full max-w-sm mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon + text */}
            <div className="p-5 space-y-3">
              <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                <Icon name="Trash2" size={20} className="text-error" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Delete pipeline</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Are you sure you want to delete <span className="font-medium text-foreground">"{confirmDelete.name}"</span>? All deals inside this pipeline will also be removed. This action cannot be undone.
                </p>
              </div>
            </div>
            {/* Actions */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-muted/30">
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmDelete}
                className="bg-error text-error-foreground hover:bg-error/90"
              >
                <Icon name="Trash2" size={13} className="mr-1.5" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;