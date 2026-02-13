import React, { useState, useEffect } from "react";
import Icon from "../AppIcon";

/**
 * Toast Notification Component
 * Displays temporary success/error/info notifications at bottom-right
 */

export const Toast = ({ message, type = "success", duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: "CheckCircle",
    error: "XCircle",
    info: "Info",
    warning: "AlertTriangle",
  };

  const styles = {
    success: "bg-success/10 border-success text-success",
    error: "bg-error/10 border-error text-error",
    info: "bg-primary/10 border-primary text-primary",
    warning: "bg-warning/10 border-warning text-warning",
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-10000 flex items-center space-x-3 px-4 py-3 rounded-lg border-2 shadow-elevation-2 backdrop-blur-sm animate-in slide-in-from-bottom-5 duration-300 ${styles[type]}`}
    >
      <Icon name={icons[type]} className="text-black" size={20} />
      <span className="text-black text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:opacity-80 transition-opacity"
        aria-label="Close notification"
      >
        <Icon name="X" size={16} />
      </button>
    </div>
  );
};

/**
 * Toast Container - Manages multiple toasts
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const ToastContainer = () => (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );

  return { showToast, ToastContainer };
};

export default Toast;
