"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { deleteStudent } from "./actions";
import { EditStudentDialog } from "./edit-student-dialog";

export type Student = {
  AdmissionNumber: string;
  FirstName: string;
  LastName: string;
  DateOfBirth: string;
  Gender: string;
  ParentContact: string;
  Address: string;
  StudentClassID: string;
};

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "AdmissionNumber",
    header: "Admission Number",
  },
  {
    accessorKey: "FirstName",
    header: "First Name",
  },
  {
    accessorKey: "LastName",
    header: "Last Name",
  },
  {
    accessorKey: "Gender",
    header: "Gender",
  },
  {
    accessorKey: "StudentClassID",
    header: "Class",
  },  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const student = row.original;

      const handleEditClick = () => {
        // Scroll to the form area
        const formElement = document.getElementById('add-student-section');
        if (formElement) {
          formElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest' 
          });
        }
      };      const handleDeleteClick = async () => {
        if (confirm(`Are you sure you want to delete student ${student.FirstName || ''} ${student.LastName || ''}?`)) {
          try {
            const result = await deleteStudent(student.AdmissionNumber);
            if (result.success) {
              alert('Student deleted successfully!');
              // The page will automatically refresh due to revalidatePath
            } else {
              alert('Failed to delete student: ' + result.message);
            }
          } catch (error) {
            alert('An error occurred while deleting the student.');
          }
        }
      };      return (
        <div className="flex items-center gap-2">
          <div onClick={handleEditClick}>
            <EditStudentDialog student={student} />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 transition-colors duration-200"
            onClick={handleDeleteClick}
          >
            🗑️ Delete
          </Button>
        </div>
      );
    },
  },
];
