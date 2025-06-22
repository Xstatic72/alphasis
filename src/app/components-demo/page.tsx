"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CustomForm, FormField } from "@/components/ui/custom-form";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Hash,
  Star,
  BookOpen,
  Users,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

export default function ComponentsDemo() {
  const [selectedDate, setSelectedDate] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Sample form fields for different use cases
  const studentFormFields: FormField[] = [
    {
      name: "firstName",
      label: "First Name",
      type: "text",
      icon: User,
      placeholder: "Enter first name",
      required: true,
      validation: { minLength: 2, maxLength: 50 },
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text",
      icon: User,
      placeholder: "Enter last name",
      required: true,
      validation: { minLength: 2, maxLength: 50 },
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      icon: Mail,
      placeholder: "Enter email address",
      required: true,
      validation: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "tel",
      icon: Phone,
      placeholder: "Enter phone number",
      required: true,
      validation: { pattern: /^[\+]?[1-9][\d]{0,15}$/ },
    },
    {
      name: "birthDate",
      label: "Date of Birth",
      type: "date",
      icon: Calendar,
      required: true,
    },
    {
      name: "grade",
      label: "Grade Level",
      type: "select",
      icon: Star,
      placeholder: "Select grade level",
      required: true,
      options: [
        { value: "1", label: "Grade 1" },
        { value: "2", label: "Grade 2" },
        { value: "3", label: "Grade 3" },
        { value: "4", label: "Grade 4" },
        { value: "5", label: "Grade 5" },
      ],
    },
    {
      name: "address",
      label: "Home Address",
      type: "textarea",
      icon: MapPin,
      placeholder: "Enter full address",
      required: true,
      validation: { minLength: 10, maxLength: 200 },
      className: "md:col-span-2",
    },
    {
      name: "emergencyContact",
      label: "Emergency Contact",
      type: "tel",
      icon: Phone,
      placeholder: "Emergency contact number",
      required: true,
    },
  ];

  const teacherFormFields: FormField[] = [
    {
      name: "teacherName",
      label: "Teacher Name",
      type: "text",
      icon: User,
      placeholder: "Enter teacher name",
      required: true,
    },
    {
      name: "subject",
      label: "Subject",
      type: "select",
      icon: BookOpen,
      placeholder: "Select subject",
      required: true,
      options: [
        { value: "math", label: "Mathematics" },
        { value: "english", label: "English" },
        { value: "science", label: "Science" },
        { value: "history", label: "History" },
        { value: "art", label: "Art" },
      ],
    },
    {
      name: "employeeId",
      label: "Employee ID",
      type: "text",
      icon: Hash,
      placeholder: "Enter employee ID",
      required: true,
      validation: { pattern: /^EMP\d{3}$/ },
      description: "Format: EMP001",
    },
    {
      name: "hireDate",
      label: "Hire Date",
      type: "date",
      icon: Calendar,
      required: true,
    },
    {
      name: "department",
      label: "Department",
      type: "select",
      icon: Users,
      placeholder: "Select department",
      required: true,
      options: [
        { value: "primary", label: "Primary Education" },
        { value: "secondary", label: "Secondary Education" },
        { value: "admin", label: "Administration" },
        { value: "special", label: "Special Education" },
      ],
    },
    {
      name: "salary",
      label: "Salary",
      type: "number",
      icon: DollarSign,
      placeholder: "Enter salary",
      required: true,
      validation: { min: 30000, max: 100000 },
    },
  ];

  const handleStudentSubmit = async (data: Record<string, any>) => {
    setFormLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("Student form data:", data);
    toast.success("Student form submitted successfully!");
    setFormLoading(false);
  };

  const handleTeacherSubmit = async (data: Record<string, any>) => {
    setFormLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("Teacher form data:", data);
    toast.success("Teacher form submitted successfully!");
    setFormLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Custom Form Components Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Showcase of the custom DatePicker and Form components with responsive design,
            validation, and beautiful animations that match the AlphaSIS UI/UX.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Date Picker Demo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card-modern p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Calendar className="h-6 w-6 text-[#ff4e00]" />
              Date Picker Component
            </h2>
            
            <div className="space-y-6">
              <DatePicker
                label="Sample Date Picker"
                placeholder="Select a date"
                value={selectedDate}
                onChange={setSelectedDate}
                required={true}
                icon={Calendar}
              />
              
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <p className="text-green-800">
                    <strong>Selected Date:</strong> {selectedDate}
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    Formatted: {new Date(selectedDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </motion.div>
              )}
              
              <div className="text-sm text-gray-600">
                <h3 className="font-semibold mb-2">Features:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Beautiful calendar dropdown</li>
                  <li>Responsive design</li>
                  <li>Custom styling that matches app theme</li>
                  <li>Quick actions (Today, Clear)</li>
                  <li>Form validation support</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Form Demo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card-modern p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <User className="h-6 w-6 text-[#ff4e00]" />
              Enhanced Form Component
            </h2>
            
            <div className="text-sm text-gray-600 mb-6">
              <h3 className="font-semibold mb-2">Features:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Real-time validation with custom rules</li>
                <li>Responsive grid layout (1, 2, or 3 columns)</li>
                <li>Progress tracking</li>
                <li>Beautiful animations</li>
                <li>Multiple field types support</li>
                <li>Consistent styling with app theme</li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Student Form Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 card-modern p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Users className="h-6 w-6 text-[#ff4e00]" />
            Student Registration Form Example
          </h2>
          
          <CustomForm
            fields={studentFormFields}
            onSubmit={handleStudentSubmit}
            title="Register New Student"
            description="Fill in the student information below. All fields marked with * are required."
            submitText="Register Student"
            loading={formLoading}
            columns={2}
            spacing="lg"
            showProgress={true}
          />
        </motion.div>

        {/* Teacher Form Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 card-modern p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-[#ff4e00]" />
            Teacher Registration Form Example
          </h2>
          
          <CustomForm
            fields={teacherFormFields}
            onSubmit={handleTeacherSubmit}
            title="Add New Teacher"
            description="Enter teacher details and employment information."
            submitText="Add Teacher"
            loading={formLoading}
            columns={3}
            spacing="md"
            showProgress={true}
          />
        </motion.div>

        {/* Usage Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 card-modern p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            How to Use These Components
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">DatePicker Component</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import { DatePicker } from "@/components/ui/date-picker";

<DatePicker
  label="Birth Date"
  placeholder="Select date"
  value={date}
  onChange={setDate}
  required={true}
  icon={Calendar}
/>`}
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">CustomForm Component</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import { CustomForm, FormField } from "@/components/ui/custom-form";

const fields: FormField[] = [
  {
    name: "email",
    label: "Email",
    type: "email",
    icon: Mail,
    required: true,
    validation: { 
      pattern: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/ 
    }
  }
];

<CustomForm
  fields={fields}
  onSubmit={handleSubmit}
  columns={2}
  showProgress={true}
/>`}
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
