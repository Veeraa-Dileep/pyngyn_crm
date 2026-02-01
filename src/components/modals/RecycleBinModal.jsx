import React, { useEffect, useState, useCallback } from "react";
import Icon from "../AppIcon";
import Button from "../ui/Button";

/**
 * RecycleBinModal.jsx
 *
 * A professional, modern modal for managing deleted items with restore/delete functionality.
 */

export default function RecycleBinModal({
  open,
  onClose,
  leads = null,
  pipeline = null,
  onRestoreLead,
  onDeleteLead,
  onRestorePipeline,
  onDeletePipeline,
}) {
  // Local fallback data if none provided
  const [localLeads, setLocalLeads] = useState([
    { id: "L1", name: "Acme Corp", deletedAt: "2026-01-27 10:12" },
    { id: "L2", name: "Jane Doe", deletedAt: "2026-01-28 14:05" },
  ]);
  const [localPipeline, setLocalPipeline] = useState([
    { id: "P1", name: "Opportunity A", deletedAt: "2026-01-20 09:00" },
  ]);

  // Pick data source: props or local
  const leadsData = leads ?? localLeads;
  const pipelineData = pipeline ?? localPipeline;

  // Close modal
  const close = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };

    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Event handlers
  const handleRestoreLead = (item) => {
    if (onRestoreLead) {
      onRestoreLead(item);
    } else {
      setLocalLeads((prev) => prev.filter((p) => p.id !== item.id));
      console.log("Restored lead", item);
    }
  };

  const handleDeleteLead = (item) => {
    if (onDeleteLead) {
      onDeleteLead(item);
    } else {
      setLocalLeads((prev) => prev.filter((p) => p.id !== item.id));
      console.log("Permanently deleted lead", item);
    }
  };

  const handleRestorePipeline = (item) => {
    if (onRestorePipeline) {
      onRestorePipeline(item);
    } else {
      setLocalPipeline((prev) => prev.filter((p) => p.id !== item.id));
      console.log("Restored pipeline item", item);
    }
  };

  const handleDeletePipeline = (item) => {
    if (onDeletePipeline) {
      onDeletePipeline(item);
    } else {
      setLocalPipeline((prev) => prev.filter((p) => p.id !== item.id));
      console.log("Permanently deleted pipeline item", item);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-9999 p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-card border border-border rounded-xl shadow-elevation-3 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
              <Icon name="Trash2" size={20} className="text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Recycle Bin</h2>
              <p className="text-xs text-muted-foreground">Restore or permanently delete items</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={close} aria-label="Close recycle bin">
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Leads Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center space-x-2">
              <Icon name="Target" size={16} className="text-muted-foreground" />
              <span>Deleted from Leads</span>
            </h3>
            {leadsData && leadsData.length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Name
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Deleted Time
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-background">
                    {leadsData.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-smooth">
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Icon name="Clock" size={14} className="text-muted-foreground" />
                            <span>{item.deletedAt ?? "-"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestoreLead(item)}
                              className="text-success hover:bg-success/10 hover:text-success hover:border-success"
                            >
                              <Icon name="RotateCcw" size={14} className="mr-1.5" />
                              Restore
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteLead(item)}
                              className="text-error hover:bg-error/10 hover:text-error hover:border-error"
                            >
                              <Icon name="Trash2" size={14} className="mr-1.5" />
                              Delete Forever
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 bg-muted/20 rounded-lg border border-dashed border-border">
                <Icon name="Inbox" size={32} className="text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No deleted leads</p>
              </div>
            )}
          </div>

          {/* Pipeline Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center space-x-2">
              <Icon name="GitBranch" size={16} className="text-muted-foreground" />
              <span>Deleted from Pipeline</span>
            </h3>
            {pipelineData && pipelineData.length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Name
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Deleted Time
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-background">
                    {pipelineData.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-smooth">
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Icon name="Clock" size={14} className="text-muted-foreground" />
                            <span>{item.deletedAt ?? "-"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestorePipeline(item)}
                              className="text-success hover:bg-success/10 hover:text-success hover:border-success"
                            >
                              <Icon name="RotateCcw" size={14} className="mr-1.5" />
                              Restore
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePipeline(item)}
                              className="text-error hover:bg-error/10 hover:text-error hover:border-error"
                            >
                              <Icon name="Trash2" size={14} className="mr-1.5" />
                              Delete Forever
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 bg-muted/20 rounded-lg border border-dashed border-border">
                <Icon name="Inbox" size={32} className="text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No deleted pipeline items</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground">
            <Icon name="Info" size={14} className="inline mr-1" />
            Items can be restored or permanently deleted
          </p>
          <Button variant="outline" onClick={close}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}