"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { useState, useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    colors: "from-green-500 to-emerald-500",
    bgColors: "from-green-50 to-emerald-50",
    textColor: "text-green-800",
    borderColor: "border-green-200"
  },
  error: {
    icon: XCircle,
    colors: "from-red-500 to-rose-500",
    bgColors: "from-red-50 to-rose-50",
    textColor: "text-red-800",
    borderColor: "border-red-200"
  },
  warning: {
    icon: AlertCircle,
    colors: "from-yellow-500 to-amber-500",
    bgColors: "from-yellow-50 to-amber-50",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-200"
  },
  info: {
    icon: Info,
    colors: "from-blue-500 to-indigo-500",
    bgColors: "from-blue-50 to-indigo-50",
    textColor: "text-blue-800",
    borderColor: "border-blue-200"
  }
};

export function Toast({ id, type, title, description, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const config = toastConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`
        relative max-w-sm w-full bg-gradient-to-r ${config.bgColors} 
        backdrop-blur-xl border ${config.borderColor} rounded-2xl shadow-2xl 
        p-4 pointer-events-auto overflow-hidden group
      `}
    >
      {/* Animated background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${config.colors} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      {/* Content */}
      <div className="relative flex items-start gap-3">
        <div className={`flex-shrink-0 w-8 h-8 bg-gradient-to-r ${config.colors} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${config.textColor} text-sm`}>
            {title}
          </h3>
          {description && (
            <p className={`text-xs ${config.textColor} opacity-80 mt-1 leading-relaxed`}>
              {description}
            </p>
          )}
        </div>

        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300);
          }}
          className={`flex-shrink-0 w-6 h-6 ${config.textColor} opacity-60 hover:opacity-100 transition-opacity duration-200 rounded-lg hover:bg-white/20 flex items-center justify-center`}
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Progress bar */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: duration / 1000, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${config.colors} rounded-full`}
      />
    </motion.div>
  );
}

// Toast Container
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: ToastType;
    title: string;
    description?: string;
    duration?: number;
  }>;
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={onClose}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
