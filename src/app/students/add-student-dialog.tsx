"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addStudent } from "./actions";
import { Plus, User, Calendar, MapPin, Phone, GraduationCap } from "lucide-react";
import { toast } from "sonner";

type Class = {
  ClassID: string;
  ClassName: string;
};

type FormField = {
  name: string;
  label: string;
  type: string;
  icon: any;
  placeholder?: string;
  options?: { value: string; label: string }[];
};

export function AddStudentDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchClasses();
    }
  }, [isOpen]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const result = await addStudent({
        FirstName: formData.get("FirstName") as string,
        LastName: formData.get("LastName") as string,
        DateOfBirth: formData.get("DateOfBirth") as string,
        Gender: formData.get("Gender") as string,
        ParentContact: formData.get("ParentContact") as string,
        Address: formData.get("Address") as string,
        StudentClassID: formData.get("StudentClassID") as string,
      });

      if (result?.success) {
        toast.success("Student added successfully!");        setIsOpen(false);
      } else {
        toast.error("Failed to add student. Please try again.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const formFields = [
    {
      name: "FirstName",
      label: "First Name",
      type: "text",
      icon: User,
      placeholder: "Enter first name",
    },
    {
      name: "LastName",
      label: "Last Name",
      type: "text",
      icon: User,
      placeholder: "Enter last name",
    },
    {
      name: "DateOfBirth",
      label: "Date of Birth",
      type: "date",
      icon: Calendar,
    },
    {
      name: "Gender",
      label: "Gender",
      type: "select",
      icon: User,
      options: [
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
        { value: "Other", label: "Other" }
      ]
    },
    {
      name: "ParentContact",
      label: "Parent Contact",
      type: "tel",
      icon: Phone,
      placeholder: "Enter parent's phone number",
    },
    {
      name: "Address",
      label: "Address",
      type: "text",
      icon: MapPin,
      placeholder: "Enter home address",
    },
    {
      name: "StudentClassID",
      label: "Class",
      type: "select",
      icon: GraduationCap,
      options: classes.map(cls => ({ value: cls.ClassID, label: cls.ClassName }))
    },
  ];

  return (    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="btn-primary interactive-element shadow-aerospace">
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </motion.div>
      </DialogTrigger>

      <AnimatePresence>
        {isOpen && (          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-gray-200/50 shadow-2xl rounded-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="p-8"
            >
              <DialogHeader className="space-y-4 pb-8 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#ff4e00] via-[#ec9f05] to-[#8ea604] shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-gray-800">
                      Add New Student
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 mt-1">
                      Fill in the student&apos;s information below to add them to the system.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>              <form action={handleSubmit} className="space-y-8 mt-8">                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {formFields.map((field, index) => {
                    const IconComponent = field.icon;
                    return (
                      <motion.div
                        key={field.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        className={`form-field ${field.name === "Address" ? "md:col-span-2" : ""}`}
                      >
                        <Label
                          htmlFor={field.name}
                          className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3 px-1"
                        >
                          <IconComponent className="h-4 w-4 text-[#ff4e00]" />
                          {field.label}
                          <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <div className="relative group">
                          {field.type === "select" ? (
                            <select
                              id={field.name}
                              name={field.name}
                              required
                              className="input-modern hover-lift h-12 px-4 text-base w-full appearance-none bg-white"
                              style={{
                                backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 1rem center',
                                backgroundSize: '0.65rem auto',
                                paddingRight: '3rem'
                              }}
                            >
                              <option value="">Choose {field.label.toLowerCase()}...</option>
                              {field.options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <Input
                              id={field.name}
                              name={field.name}
                              type={field.type}
                              placeholder={field.placeholder}
                              required
                              className="input-modern hover-lift h-12 px-4 text-base"
                            />
                          )}
                          {field.type === "date" && (
                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div><DialogFooter className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 font-medium text-gray-700"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <motion.div 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#ff4e00] via-[#ec9f05] to-[#8ea604] hover:from-[#e63900] hover:via-[#d18b04] hover:to-[#7a9503] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      {isLoading ? "Adding Student..." : "Add Student"}
                    </Button>
                  </motion.div>
                </DialogFooter>
              </form>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
