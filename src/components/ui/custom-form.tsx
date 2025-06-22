"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Calendar,
  Hash,
  Type,
  DollarSign,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Field type definitions
export type FieldType = 
  | "text" 
  | "email" 
  | "password" 
  | "tel" 
  | "number" 
  | "date" 
  | "select" 
  | "textarea"
  | "checkbox"
  | "radio";

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  icon?: React.ComponentType<any>;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | undefined;
  };
  className?: string;
  disabled?: boolean;
  defaultValue?: any;
  description?: string;
}

export interface CustomFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => Promise<void> | void;
  title?: string;
  description?: string;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  className?: string;
  loading?: boolean;
  columns?: 1 | 2 | 3;
  spacing?: "sm" | "md" | "lg";
  variant?: "default" | "modern" | "minimal";
  showProgress?: boolean;
}

// Default icons for different field types
const getDefaultIcon = (type: FieldType): React.ComponentType<any> => {
  const iconMap: Record<FieldType, React.ComponentType<any>> = {
    text: Type,
    email: Mail,
    password: Lock,
    tel: Phone,
    number: Hash,
    date: Calendar,
    select: CheckCircle,
    textarea: Type,
    checkbox: CheckCircle,
    radio: CheckCircle,
  };
  return iconMap[type] || Type;
};

export function CustomForm({
  fields,
  onSubmit,
  title,
  description,
  submitText = "Submit",
  cancelText = "Cancel",
  onCancel,
  className,
  loading = false,
  columns = 1,
  spacing = "md",
  variant = "modern",
  showProgress = false,
}: CustomFormProps) {
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  // Initialize form data with default values
  React.useEffect(() => {
    const initialData: Record<string, any> = {};
    fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initialData[field.name] = field.defaultValue;
      }
    });
    setFormData(initialData);
  }, [fields]);

  // Validation function
  const validateField = (field: FormField, value: any): string | undefined => {
    if (field.required && (!value || value.toString().trim() === "")) {
      return `${field.label} is required`;
    }

    if (field.validation) {
      const { min, max, minLength, maxLength, pattern, custom } = field.validation;

      if (typeof value === "string") {
        if (minLength && value.length < minLength) {
          return `${field.label} must be at least ${minLength} characters`;
        }
        if (maxLength && value.length > maxLength) {
          return `${field.label} must be no more than ${maxLength} characters`;
        }
        if (pattern && !pattern.test(value)) {
          return `${field.label} format is invalid`;
        }
      }

      if (typeof value === "number") {
        if (min !== undefined && value < min) {
          return `${field.label} must be at least ${min}`;
        }
        if (max !== undefined && value > max) {
          return `${field.label} must be no more than ${max}`;
        }
      }

      if (custom) {
        const customError = custom(value);
        if (customError) return customError;
      }
    }

    return undefined;
  };

  // Handle field change
  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: "" }));
    }
  };

  // Handle field blur
  const handleFieldBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    const field = fields.find(f => f.name === fieldName);
    if (field) {
      const error = validateField(field, formData[fieldName]);
      if (error) {
        setErrors(prev => ({ ...prev, [fieldName]: error }));
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    setTouched(fields.reduce((acc, field) => ({ ...acc, [field.name]: true }), {}));

    // If no errors, submit the form
    if (Object.keys(newErrors).length === 0) {
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error("Form submission error:", error);
      }
    }
  };

  // Grid columns class
  const getGridCols = () => {
    const colsMap = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    };
    return colsMap[columns];
  };

  // Spacing class
  const getSpacing = () => {
    const spacingMap = {
      sm: "gap-4",
      md: "gap-6",
      lg: "gap-8",
    };
    return spacingMap[spacing];
  };

  // Render form field
  const renderField = (field: FormField, index: number) => {
    const IconComponent = field.icon || getDefaultIcon(field.type);
    const fieldError = touched[field.name] ? errors[field.name] : undefined;
    const fieldValue = formData[field.name] || "";

    const fieldProps = {
      id: field.name,
      name: field.name,
      required: field.required,
      disabled: field.disabled,
      className: cn("input-modern hover-lift", field.className),
      value: fieldValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        handleFieldChange(field.name, e.target.value),
      onBlur: () => handleFieldBlur(field.name),
    };

    return (
      <motion.div
        key={field.name}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1, duration: 0.3 }}
        className={cn(
          "form-field",
          field.type === "textarea" && "md:col-span-2",
          field.className
        )}
      >
        <Label
          htmlFor={field.name}
          className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2"
        >
          <IconComponent className="h-4 w-4 text-[#ff4e00]" />
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
        </Label>

        {field.description && (
          <p className="text-xs text-gray-500 mb-2">{field.description}</p>
        )}

        <div className="relative">
          {field.type === "date" ? (
            <DatePicker
              name={field.name}
              label=""
              placeholder={field.placeholder}
              value={fieldValue}
              error={fieldError}
              required={field.required}
              disabled={field.disabled}
              onChange={(value) => handleFieldChange(field.name, value)}
            />
          ) : field.type === "select" ? (
            <select
              {...fieldProps}
              className={cn(fieldProps.className, fieldError && "border-red-500")}
            >
              {field.placeholder && (
                <option value="">{field.placeholder}</option>
              )}
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : field.type === "textarea" ? (
            <textarea
              {...fieldProps}
              placeholder={field.placeholder}
              rows={4}
              className={cn(fieldProps.className, fieldError && "border-red-500")}
            />
          ) : field.type === "checkbox" ? (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...fieldProps}
                checked={fieldValue}
                onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                className="rounded border-gray-300 text-[#ff4e00] focus:ring-[#ff4e00]"
              />
              {field.placeholder && (
                <span className="text-sm text-gray-600">{field.placeholder}</span>
              )}
            </div>
          ) : (
            <Input
              {...fieldProps}
              type={field.type}
              placeholder={field.placeholder}
              className={cn(fieldProps.className, fieldError && "border-red-500")}
            />
          )}

          {fieldError && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-1 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              {fieldError}
            </motion.p>
          )}
        </div>
      </motion.div>
    );
  };

  const completedFields = Object.keys(formData).filter(key => formData[key] && formData[key] !== "").length;
  const progressPercentage = (completedFields / fields.length) * 100;

  return (
    <div className={cn("form-container", className)}>
      {(title || description) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="form-header mb-6"
        >
          {title && (
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
          )}
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </motion.div>
      )}

      {showProgress && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-[#ff4e00] to-[#ec9f05] h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={cn("grid", getGridCols(), getSpacing())}>
          {fields.map((field, index) => renderField(field, index))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: fields.length * 0.1 }}
          className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200/50"
        >
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="btn-outline hover-lift w-full sm:w-auto"
              disabled={loading}
            >
              {cancelText}
            </Button>
          )}
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto sm:ml-auto"
          >
            <Button
              type="submit"
              disabled={loading}
              className="btn-primary hover-lift w-full sm:w-auto"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {loading ? "Processing..." : submitText}
            </Button>
          </motion.div>
        </motion.div>
      </form>
    </div>
  );
}
