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
import { deletePayment } from "./actions";
import { EditPaymentDialog } from "./edit-payment-dialog";

// This type is based on the Prisma schema (formatted for DataTable)
export type Payment = {
  TransactionID: string;
  StudentID: string;
  StudentName?: string;
  Amount: number;
  Term: string;
  PaymentMethod: string;
  PaymentDate: string; // Formatted as string for DataTable
  Confirmation: boolean;
  ReceiptGenerated: boolean;
};

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "StudentName",
    header: "Student Name",
    cell: ({ row }) => {
      const studentName = row.getValue("StudentName") as string;
      const studentId = row.original.StudentID;
      return (
        <div>
          <div className="font-medium">{studentName || studentId}</div>
          <div className="text-sm text-gray-500">{studentId}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "Amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("Amount"));
      const formatted = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(amount);
      return <div className="font-medium text-green-600">{formatted}</div>;
    },
  },
  {
    accessorKey: "Term",
    header: "Term",
    cell: ({ row }) => {
      const term = row.getValue("Term") as string;
      return <div className="font-medium">{term}</div>;
    },
  },  {
    accessorKey: "PaymentMethod",
    header: "Payment Method",
    cell: ({ row }) => {
      const method = row.getValue("PaymentMethod") as string;
      return (
        <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {method}
        </div>
      );
    },
  },
  {
    accessorKey: "PaymentDate",
    header: "Payment Date",
    cell: ({ row }) => {
      const date = row.getValue("PaymentDate") as string;
      return <div className="font-medium">{new Date(date).toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "Confirmation",
    header: "Status",
    cell: ({ row }) => {
      const confirmed = row.getValue("Confirmation") as boolean;
      return (
        <div className={`px-2 py-1 rounded-full text-sm font-medium ${
          confirmed 
            ? "bg-green-100 text-green-800" 
            : "bg-yellow-100 text-yellow-800"
        }`}>
          {confirmed ? "Confirmed" : "Pending"}
        </div>
      );
    },
  },  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;

      return <PaymentActionsCell payment={payment} />;
    },
  },
];

function PaymentActionsCell({ payment }: { payment: Payment }) {
  return (
    <div className="flex justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              navigator.clipboard.writeText(payment.TransactionID)
            }
            className="cursor-pointer"
          >
            Copy payment ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              await deletePayment(payment.TransactionID);
            }}
            className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Delete payment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <div className="ml-2">
        <EditPaymentDialog payment={payment} />
      </div>
    </div>
  );
}
