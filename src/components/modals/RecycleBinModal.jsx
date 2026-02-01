import React, { useEffect, useState, useCallback } from "react";

/**
 * RecycleBinModal.jsx
 *
 * Usage:
 *  - Import and render <RecycleBinModal /> once (e.g. in App.jsx)
 *  - To open from anywhere: import { openRecycleBin } from "./components/modals/RecycleBinModal";
 *    then call openRecycleBin();
 *
 * Props (optional):
 *  - leads: [{ id, name, deletedAt }]
 *  - pipeline: [{ id, name, deletedAt }]
 *  - onRestoreLead(item) - optional callback for restore
 *  - onDeleteLead(item) - optional callback for permanent delete
 *  - onRestorePipeline(item)
 *  - onDeletePipeline(item)
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


    // local fallback data if none provided
    const [localLeads, setLocalLeads] = useState([
        { id: "L1", name: "Acme Corp", deletedAt: "2026-01-27 10:12" },
        { id: "L2", name: "Jane Doe", deletedAt: "2026-01-28 14:05" },
    ]);
    const [localPipeline, setLocalPipeline] = useState([
        { id: "P1", name: "Opportunity A", deletedAt: "2026-01-20 09:00" },
    ]);

    // pick data source: props or local
    const leadsData = leads ?? localLeads;
    const pipelineData = pipeline ?? localPipeline;

    // open when window event fired
  

    // close on Escape
    const close = useCallback(() => {
  onClose?.();
}, [onClose]);

useEffect(() => {
  const onKey = (e) => {
    if (e.key === "Escape") close();
  };

  if (open) window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [open, close]);


    const handleRestoreLead = (item) => {
        if (onRestoreLead) {
            onRestoreLead(item);
        } else {
            // fallback: remove from local data
            setLocalLeads((prev) => prev.filter((p) => p.id !== item.id));
            console.log("Restored lead", item);
        }
    };

    const handleDeleteLead = (item) => {
        if (!window.confirm(`Permanently delete lead "${item.name}"? This cannot be undone.`)) return;
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
        if (!window.confirm(`Permanently delete pipeline item "${item.name}"? This cannot be undone.`)) return;
        if (onDeletePipeline) {
            onDeletePipeline(item);
        } else {
            setLocalPipeline((prev) => prev.filter((p) => p.id !== item.id));
            console.log("Permanently deleted pipeline item", item);
        }
    };

    if (!open) return null;

    // simple styles
    const styles = {
        overlay: {
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
        },
        modal: {
            width: "min(1100px, 96%)",
            maxHeight: "90vh",
            overflowY: "auto",
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            padding: 20,
            position: "relative",
            color: "#111",
            fontFamily: "Arial, Helvetica, sans-serif",
        },
        header: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
        },
        title: {
            fontSize: 18,
            fontWeight: 600,
        },
        closeBtn: {
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 8,
            lineHeight: 0,
        },
        section: {
            marginTop: 12,
        },
        sectionTitle: {
            fontSize: 15,
            fontWeight: 600,
            marginBottom: 8,
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
        },
        th: {
            textAlign: "left",
            padding: "8px 10px",
            borderBottom: "1px solid #eee",
            fontSize: 13,
            color: "#333",
        },
        td: {
            padding: "8px 10px",
            borderBottom: "1px solid #fafafa",
            fontSize: 14,
        },
        actions: {
            display: "flex",
            gap: 8,
        },
        btn: {
            padding: "6px 10px",
            borderRadius: 4,
            border: "1px solid #ddd",
            background: "#fff",
            cursor: "pointer",
            fontSize: 13,
        },
        restoreBtn: { background: "#e6ffef", borderColor: "#8ae6b7" },
        deleteBtn: { background: "#fff1f1", borderColor: "#f1a3a3" },
        empty: { padding: 12, color: "#666" },
    };

    return (
        <div
            style={styles.overlay}
            onClick={(e) => {
                // close when clicking overlay but not the modal itself
                if (e.target === e.currentTarget) close();
            }}
            aria-modal="true"
            role="dialog"
        >
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <div style={styles.title}>Recycle Bin</div>
                    <button aria-label="Close recycle bin" onClick={close} style={styles.closeBtn}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                            <path d="M18 6 L6 18" />
                            <path d="M6 6 L18 18" />
                        </svg>
                    </button>
                </div>

                <div style={styles.section}>
                    <div style={styles.sectionTitle}>Deleted from Leads</div>
                    {leadsData && leadsData.length > 0 ? (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Name</th>
                                    <th style={styles.th}>Deleted time</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leadsData.map((item) => (
                                    <tr key={item.id}>
                                        <td style={styles.td}>{item.name}</td>
                                        <td style={styles.td}>{item.deletedAt ?? "-"}</td>
                                        <td style={{ ...styles.td }}>
                                            <div style={styles.actions}>
                                                <button
                                                    style={{ ...styles.btn, ...styles.restoreBtn }}
                                                    onClick={() => handleRestoreLead(item)}
                                                >
                                                    Restore
                                                </button>
                                                <button
                                                    style={{ ...styles.btn, ...styles.deleteBtn }}
                                                    onClick={() => handleDeleteLead(item)}
                                                >
                                                    Permanently delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={styles.empty}>No deleted leads.</div>
                    )}
                </div>

                <div style={styles.section}>
                    <div style={styles.sectionTitle}>Deleted from Pipeline</div>
                    {pipelineData && pipelineData.length > 0 ? (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Name</th>
                                    <th style={styles.th}>Deleted time</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pipelineData.map((item) => (
                                    <tr key={item.id}>
                                        <td style={styles.td}>{item.name}</td>
                                        <td style={styles.td}>{item.deletedAt ?? "-"}</td>
                                        <td style={styles.td}>
                                            <div style={styles.actions}>
                                                <button
                                                    style={{ ...styles.btn, ...styles.restoreBtn }}
                                                    onClick={() => handleRestorePipeline(item)}
                                                >
                                                    Restore
                                                </button>
                                                <button
                                                    style={{ ...styles.btn, ...styles.deleteBtn }}
                                                    onClick={() => handleDeletePipeline(item)}
                                                >
                                                    Permanently delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={styles.empty}>No deleted pipeline items.</div>
                    )}
                </div>
            </div>
        </div>
    );
}