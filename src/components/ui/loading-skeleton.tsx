"use client";

import { motion } from "framer-motion";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "card" | "table" | "text" | "avatar" | "button";
  count?: number;
}

export function LoadingSkeleton({ 
  className = "", 
  variant = "card",
  count = 1 
}: LoadingSkeletonProps) {
  const baseClasses = "bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-pulse";
  
  const variants = {
    card: "h-32 w-full rounded-2xl",
    table: "h-12 w-full rounded-lg",
    text: "h-4 w-3/4 rounded-lg",
    avatar: "h-12 w-12 rounded-full",
    button: "h-10 w-24 rounded-xl"
  };

  const shimmerClasses = `${baseClasses} ${variants[variant]} ${className}`;

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className={shimmerClasses}
          style={{
            background: `linear-gradient(90deg, 
              rgba(229, 231, 235, 0.8) 0%, 
              rgba(243, 244, 246, 1) 50%, 
              rgba(229, 231, 235, 0.8) 100%)`,
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s ease-in-out infinite",
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}

// Enhanced Loading States for Different Components
export function TableLoadingSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <LoadingSkeleton variant="table" count={8} />
    </div>
  );
}

export function CardLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <LoadingSkeleton variant="card" count={3} />
    </div>
  );
}

export function HeaderLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <LoadingSkeleton className="h-8 w-48" />
      <LoadingSkeleton className="h-4 w-64" />
    </div>
  );
}
