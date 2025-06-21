"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
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
import { Plus, User, Calendar, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

export function AddStudentDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      type: "text",
      icon: User,
      placeholder: "Male/Female/Other",
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
      label: "Class ID",
      type: "text",
      icon: User,
      placeholder: "Enter class ID",
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
        {isOpen && (
          <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm border-gray-200/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <DialogHeader className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-[#ff4e00] to-[#8ea604]">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-semibold text-gray-800">
                      Add New Student
                    </DialogTitle>                    <DialogDescription className="text-gray-600">
                      Fill in the student&apos;s information below to add them to the
                      system.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>              <form action={handleSubmit} className="form-container mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                        >
                          <IconComponent className="h-4 w-4 text-[#ff4e00]" />
                          {field.label}
                        </Label>
                        <div className="form-input-with-icon">
                          <Input
                            id={field.name}
                            name={field.name}
                            type={field.type}
                            placeholder={field.placeholder}
                            required
                            className="input-modern hover-lift"
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>                <DialogFooter className="flex gap-3 pt-4 border-t border-gray-200/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="btn-outline hover-lift"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary hover-lift"
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
                      {isLoading ? "Adding..." : "Add Student"}
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
