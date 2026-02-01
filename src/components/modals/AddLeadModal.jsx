import React, { useState, useEffect } from "react";
import Icon from "../AppIcon";
import Button from "../ui/Button";

const SOURCE_OPTIONS = [
  { value: "Manual", label: "Manual", icon: "UserPlus" },
  { value: "Signup", label: "Signup", icon: "UserCheck" },
  { value: "Google", label: "Google", icon: "Chrome" },
  { value: "Meta", label: "Meta", icon: "Facebook" },
];

export default function AddLeadModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    title: "",
    email: "",
    mobile: "",
    source: "Manual",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Auto-update title based on name or company
  useEffect(() => {
    if (!touched.title) {
      const displayName = formData.name || formData.company;
      if (displayName) {
        setFormData((prev) => ({
          ...prev,
          title: `${displayName}'s Opportunity`,
        }));
      }
    }
  }, [formData.name, formData.company, touched.title]);

  // Validation
  const validate = () => {
    const newErrors = {};

    // At least name or company is required
    if (!formData.name && !formData.company) {
      newErrors.name = "Either Name or Company is required";
      newErrors.company = "Either Name or Company is required";
    }

    // Email is required
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    // Call success callback
    if (onSuccess) {
      await onSuccess(formData);
    }

    // Reset form
    setFormData({
      name: "",
      company: "",
      title: "",
      email: "",
      mobile: "",
      source: "Manual",
    });
    setErrors({});
    setTouched({});
  };

  const handleClose = () => {
    setFormData({
      name: "",
      company: "",
      title: "",
      email: "",
      mobile: "",
      source: "Manual",
    });
    setErrors({});
    setTouched({});
    onClose?.();
  };

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
    };

    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-9999 p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-card border border-border rounded-xl shadow-elevation-3 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="UserPlus" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Add New Lead</h2>
              <p className="text-xs text-muted-foreground">Create a new lead opportunity</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close modal">
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Name and Company - Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Name {(!formData.company) && <span className="text-error">*</span>}
              </label>
              <div className="relative">
                <Icon
                  name="User"
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setTouched({ ...touched, name: true });
                  }}
                  className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg bg-background transition-smooth
                    ${errors.name && touched.name
                      ? "border-error focus:ring-error/20"
                      : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }
                    focus:outline-none`}
                  placeholder="Contact name"
                />
              </div>
              {errors.name && touched.name && !formData.company && (
                <p className="text-xs text-error mt-1 flex items-center space-x-1">
                  <Icon name="AlertCircle" size={12} />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Company {(!formData.name) && <span className="text-error">*</span>}
              </label>
              <div className="relative">
                <Icon
                  name="Building"
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => {
                    setFormData({ ...formData, company: e.target.value });
                    setTouched({ ...touched, company: true });
                  }}
                  className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg bg-background transition-smooth
                    ${errors.company && touched.company
                      ? "border-error focus:ring-error/20"
                      : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }
                    focus:outline-none`}
                  placeholder="Company name"
                />
              </div>
              {errors.company && touched.company && !formData.name && (
                <p className="text-xs text-error mt-1 flex items-center space-x-1">
                  <Icon name="AlertCircle" size={12} />
                  <span>{errors.company}</span>
                </p>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Opportunity Title
            </label>
            <div className="relative">
              <Icon
                name="Briefcase"
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  setTouched({ ...touched, title: true });
                }}
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-smooth"
                placeholder="e.g., John's Opportunity"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Auto-generated from name or company, editable</p>
          </div>

          {/* Email and Mobile - Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Icon
                  name="Mail"
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setTouched({ ...touched, email: true });
                  }}
                  className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg bg-background transition-smooth
                    ${errors.email && touched.email
                      ? "border-error focus:ring-error/20"
                      : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }
                    focus:outline-none`}
                  placeholder="contact@example.com"
                />
              </div>
              {errors.email && touched.email && (
                <p className="text-xs text-error mt-1 flex items-center space-x-1">
                  <Icon name="AlertCircle" size={12} />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Mobile <span className="text-muted-foreground text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <Icon
                  name="Phone"
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-smooth"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Source
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {SOURCE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, source: option.value })}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-smooth
                    ${formData.source === option.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-muted"
                    }
                  `}
                >
                  <Icon name={option.icon} size={20} className="mb-1" />
                  <span className="text-xs font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground">
            <Icon name="Info" size={14} className="inline mr-1" />
            Fields marked with * are required
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSubmit}>
              <Icon name="Plus" size={16} className="mr-1.5" />
              Add Lead
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
