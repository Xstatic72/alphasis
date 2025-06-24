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
import { deleteClass } from "./actions";
import { EditClassDialog } from "./edit-class-dialog";

// This type is based on the Prisma schema
export type Class = {
  ClassID: string;
  ClassName: string;
};

export const columns: ColumnDef<Class>[] = [
  {
    accessorKey: "ClassName",
    header: "Class Name",  },
  {
    id: "actions",    cell: ({ row }) => {
      const classData = row.original;

      return <ClassActionsCell class={classData} />;
    },
  },
];

function ClassActionsCell({ class: classData }: { class: Class }) {
  return (
    <div className="flex justify-center">
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
            onClick={() => navigator.clipboard.writeText(classData.ClassID)}
          >
            Copy class ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              await deleteClass(classData.ClassID);
            }}
          >
            Delete class
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <div className="ml-2">
        <EditClassDialog class={classData} />
      </div>
    </div>
  );
}
