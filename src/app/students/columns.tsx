"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const student = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(student.AdmissionNumber)}
            >
              Copy admission number
            </DropdownMenuItem>
            <DropdownMenuSeparator />            <DropdownMenuItem asChild>
              <EditStudentDialog student={student} />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`/students/${student.AdmissionNumber}`}>View details</a>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => deleteStudent(student.AdmissionNumber)}>
              Delete student
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
