"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CustomForm, FormField } from "@/components/ui/custom-form";
import { addStudent } from "../../app/students/actions";
import { Plus, User, Calendar, MapPin, Phone, Hash, Users } from "lucide-react";
import { toast } from "sonner";

export function EnhancedAddStudentDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: Record<string, any>) => {
    setIsLoading(true);
    try {
      const result = await addStudent({
        FirstName: formData.FirstName,
        LastName: formData.LastName,
        DateOfBirth: formData.DateOfBirth,
        Gender: formData.Gender,
        ParentContact: formData.ParentContact,
        Address: formData.Address,
        StudentClassID: formData.StudentClassID,
      });

      if (result?.success) {
        toast.success("Student added successfully!");
        setIsOpen(false);
      } else {
        toast.error("Failed to add student. Please try again.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formFields: FormField[] = [
    {
      name: "FirstName",
      label: "First Name",
      type: "text",
      icon: User,
      placeholder: "Enter first name",
      required: true,
      validation: {
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s]+$/,
      },
      description: "Student's first name (letters only)",
    },
    {
      name: "LastName",
      label: "Last Name",
      type: "text",
      icon: User,
      placeholder: "Enter last name",
      required: true,
      validation: {
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s]+$/,
      },
      description: "Student's last name (letters only)",
    },
    {
      name: "DateOfBirth",
      label: "Date of Birth",
      type: "date",
      icon: Calendar,
      required: true,
      description: "Student's date of birth",
    },
    {
      name: "Gender",
      label: "Gender",
      type: "select",
      icon: Users,
      placeholder: "Select gender",
      required: true,
      options: [
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
        { value: "Other", label: "Other" },
      ],
      description: "Student's gender",
    },
    {
      name: "ParentContact",
      label: "Parent Contact",
      type: "tel",
      icon: Phone,
      placeholder: "Enter parent's phone number",
      required: true,
      validation: {
        pattern: /^[\+]?[1-9][\d]{0,15}$/,
      },
      description: "Parent's contact phone number",
    },
    {
      name: "Address",
      label: "Address",
      type: "textarea",
      icon: MapPin,
      placeholder: "Enter home address",
      required: true,
      validation: {
        minLength: 10,
        maxLength: 200,
      },
      description: "Student's home address",
      className: "md:col-span-2",
    },
    {
      name: "StudentClassID",
      label: "Class ID",
      type: "text",
      icon: Hash,
      placeholder: "Enter class ID (e.g., CLS001)",
      required: true,
      validation: {
        pattern: /^CLS\d{3}$/,
      },
      description: "Class ID in format CLS001",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="btn-primary interactive-element shadow-aerospace">
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </motion.div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-gray-200/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <DialogHeader className="space-y-3 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#ff4e00] to-[#8ea604]">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-800">
                  Add New Student
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Fill in the student's information below to add them to the system.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <CustomForm
            fields={formFields}
            onSubmit={handleSubmit}
            submitText="Add Student"
            cancelText="Cancel"
            onCancel={() => setIsOpen(false)}
            loading={isLoading}
            columns={2}
            spacing="md"
            showProgress={true}
            className="mt-6"
          />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
