"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  name?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  icon?: React.ComponentType<any>;
}

export function DatePicker({
  name,
  label,
  placeholder = "Select date",
  value,
  onChange,
  required = false,
  disabled = false,
  className,
  error,
  icon: IconComponent = Calendar,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(value || "");
  const [displayValue, setDisplayValue] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle date selection
  const handleDateSelect = (dateString: string) => {
    setSelectedDate(dateString);
    setDisplayValue(formatDisplayDate(dateString));
    onChange?.(dateString);
    setIsOpen(false);
  };

  // Handle input change (for manual typing)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSelectedDate(inputValue);
    setDisplayValue(inputValue ? formatDisplayDate(inputValue) : "");
    onChange?.(inputValue);
  };

  // Generate calendar grid
  const generateCalendar = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    return { days, monthName: monthNames[currentMonth], year: currentYear };
  };

  const { days, monthName, year } = generateCalendar();

  // Close calendar when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update display value when value prop changes
  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedDate(value);
      setDisplayValue(value ? formatDisplayDate(value) : "");
    }
  }, [value]);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {label && (
        <Label
          htmlFor={name}
          className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2"
        >
          <IconComponent className="h-4 w-4 text-[#ff4e00]" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Input
          id={name}
          name={name}
          type="date"
          value={selectedDate}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={cn(
            "input-modern hover-lift pr-12",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            "hidden" // Hide the native date input
          )}
        />
        
        {/* Custom styled input display */}
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "input-modern hover-lift pr-12 cursor-pointer flex items-center",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-red-500",
            isOpen && "border-[#ff4e00] ring-4 ring-[#ff4e00]/15"
          )}
        >
          <span className={cn(
            "flex-1",
            !displayValue && "text-gray-400"
          )}>
            {displayValue || placeholder}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute right-3 text-gray-400"
          >
            <Calendar className="h-5 w-5" />
          </motion.div>
        </div>

        {/* Calendar Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden"
            >
              {/* Calendar Header */}
              <div className="bg-gradient-to-r from-[#ff4e00] to-[#ec9f05] text-white p-4">
                <h3 className="text-lg font-semibold text-center">
                  {monthName} {year}
                </h3>
              </div>

              {/* Calendar Grid */}
              <div className="p-4">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-gray-500 py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    const isSelected = selectedDate === day.toISOString().split('T')[0];
                    const isToday = day.toDateString() === new Date().toDateString();
                    const isCurrentMonth = day.getMonth() === new Date().getMonth();
                    
                    return (
                      <motion.button
                        key={index}
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDateSelect(day.toISOString().split('T')[0])}
                        className={cn(
                          "text-sm py-2 px-1 rounded-lg transition-all duration-200",
                          isSelected && "bg-[#ff4e00] text-white font-semibold",
                          !isSelected && isToday && "bg-[#ff4e00]/10 text-[#ff4e00] font-semibold",
                          !isSelected && !isToday && isCurrentMonth && "hover:bg-gray-100 text-gray-700",
                          !isCurrentMonth && "text-gray-300 hover:bg-gray-50"
                        )}
                      >
                        {day.getDate()}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-100 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDateSelect(new Date().toISOString().split('T')[0])}
                    className="flex-1 text-xs"
                  >
                    Today
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDate("");
                      setDisplayValue("");
                      onChange?.("");
                      setIsOpen(false);
                    }}
                    className="flex-1 text-xs"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm mt-1 flex items-center gap-1"
        >
          <span className="text-red-500">⚠</span>
          {error}
        </motion.p>
      )}

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={name}
        value={selectedDate}
      />
    </div>
  );
}
