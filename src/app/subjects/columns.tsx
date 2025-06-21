"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, BookOpen, GraduationCap, User, Calendar, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteSubject } from "./actions";
import { EditSubjectDialog } from "./edit-subject-dialog";

// This type is based on the Prisma schema
export type Subject = {
  SubjectID: string;
  SubjectName: string;
  ClassLevel: string;
  TeacherID: string;
};

export const columns: ColumnDef<Subject>[] = [
  {
    accessorKey: "SubjectName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-300 px-4 py-2 rounded-lg font-semibold text-gray-700"
        >
          <BookOpen className="mr-2 h-4 w-4 text-orange-500" />
          Subject Name
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <div className="ml-2 h-4 w-4" />
          )}
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-3 py-2">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate hover:text-orange-600 transition-colors duration-200">
              {row.getValue("SubjectName")}
            </div>
            <div className="text-sm text-gray-500">
              Subject ID: {row.original.SubjectID}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "ClassLevel",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-gradient-to-r hover:from-green-50 hover:to-lime-50 transition-all duration-300 px-4 py-2 rounded-lg font-semibold text-gray-700"
        >
          <GraduationCap className="mr-2 h-4 w-4 text-green-600" />
          Class Level
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <div className="ml-2 h-4 w-4" />
          )}
        </Button>
      )
    },
    cell: ({ row }) => {
      const classLevel = row.getValue("ClassLevel") as string;
      return (
        <div className="flex items-center space-x-2 py-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-lime-100 text-green-800 border border-green-200 shadow-sm">
            <GraduationCap className="mr-1 h-3 w-3" />
            {classLevel}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "TeacherID",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 px-4 py-2 rounded-lg font-semibold text-gray-700"
        >
          <User className="mr-2 h-4 w-4 text-blue-600" />
          Teacher
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <div className="ml-2 h-4 w-4" />
          )}
        </Button>
      )
    },
    cell: ({ row }) => {
      const teacherID = row.getValue("TeacherID") as string;
      return (
        <div className="flex items-center space-x-2 py-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
            <User className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Teacher {teacherID}</div>
            <div className="text-xs text-gray-500">ID: {teacherID}</div>
          </div>
        </div>
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center font-semibold text-gray-700">Actions</div>,
    cell: ({ row }) => {
      const subject = row.original;

      return (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-10 w-10 p-0 rounded-full hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-5 w-5 text-gray-600" />
              </Button>            </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-xl rounded-xl p-1">
            <DropdownMenuLabel className="px-3 py-2 text-sm font-semibold text-gray-900 border-b border-gray-100">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(subject.SubjectID.toString())}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 rounded-lg mx-1 my-1 transition-all duration-200 cursor-pointer"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Copy subject ID
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 border-gray-100" />
            <DropdownMenuItem asChild className="px-0 mx-1">
              <div className="px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 rounded-lg transition-all duration-200 cursor-pointer">
                <EditSubjectDialog subject={subject} />
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                await deleteSubject(subject.SubjectID);
              }}
              className="px-3 py-2 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 rounded-lg mx-1 my-1 transition-all duration-200 cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              Delete subject
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      );
    },
  },
];
