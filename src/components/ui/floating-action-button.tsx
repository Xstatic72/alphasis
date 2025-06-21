"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useState } from "react";

interface FloatingActionButtonProps {
  actions?: Array<{
    icon: React.ComponentType<any>;
    label: string;
    onClick: () => void;
    color?: string;
  }>;
  children?: React.ReactNode;
}

export function FloatingActionButton({ actions = [], children }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Floating Actions */}
      <AnimatePresence>
        {isOpen && actions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {actions.map((action, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={action.onClick}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-xl border border-white/20
                  transition-all duration-300 hover:scale-105 hover:shadow-2xl group
                  ${action.color || 'bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900'}
                `}
              >
                <action.icon className="h-5 w-5" />
                <span className="font-medium whitespace-nowrap">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 backdrop-blur-xl border border-white/20"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </motion.div>
      </motion.button>

      {/* Custom Children */}
      {children}
    </div>
  );
}

// Quick Action Fab
export function QuickActionFab({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-8 right-8 z-50"
    >
      {children}
    </motion.div>
  );
}
