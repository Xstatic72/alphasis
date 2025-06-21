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
import { deleteTeacher } from "./actions";
import { EditTeacherDialog } from "./edit-teacher-dialog";

// This type is based on the Prisma schema
export type Teacher = {
  TeacherID: string;
  FirstName: string;
  LastName: string;
  Email: string;
  PhoneNum: string;
};

export const columns: ColumnDef<Teacher>[] = [
  {
    accessorKey: "FirstName",
    header: "First Name",
  },
  {
    accessorKey: "LastName",
    header: "Last Name",
  },
  {
    accessorKey: "Email",
    header: "Email",
  },
  {
    accessorKey: "PhoneNum",
    header: "Phone",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const teacher = row.original;

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
              onClick={() => navigator.clipboard.writeText(teacher.TeacherID)}
            >
              Copy teacher ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />            <DropdownMenuItem asChild>
              <EditTeacherDialog teacher={teacher} />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`/teachers/${teacher.TeacherID}`}>View details</a>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                await deleteTeacher(teacher.TeacherID);
              }}
            >
              Delete teacher
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
