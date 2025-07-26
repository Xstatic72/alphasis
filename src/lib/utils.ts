import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility Functions Library
 * 
 * This module provides commonly used utility functions across the application.
 * Currently focuses on CSS class name management for Tailwind CSS.
 */

/**
 * Combines and merges CSS class names intelligently
 * 
 * This function combines multiple class name inputs and resolves conflicts
 * between Tailwind CSS classes. It uses clsx for conditional class names
 * and tailwind-merge to handle Tailwind-specific conflicts.
 * 
 * @param inputs - Variable number of class name inputs (strings, objects, arrays)
 * @returns {string} - Merged and deduplicated class names
 * 
 * @example
 * cn('px-2 py-1', 'px-4') // Returns 'py-1 px-4' (px-2 is overridden)
 * cn('text-red-500', condition && 'text-blue-500') // Conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
