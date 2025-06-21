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
  Amount: number;
  Term: string;
  PaymentMethod: string;
  PaymentDate: string; // Formatted as string for DataTable
  Confirmation: boolean;
  ReceiptGenerated: boolean;
};

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "StudentID",
    header: "Student ID",
  },
  {
    accessorKey: "Amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("Amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "Term",
    header: "Term",
  },
  {
    accessorKey: "PaymentMethod",
    header: "Payment Method",
  },
  {
    accessorKey: "PaymentDate",
    header: "Payment Date",
    cell: ({ row }) => {
      const date = row.getValue("PaymentDate") as Date;
      return date ? new Date(date).toLocaleDateString() : "N/A";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;

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
              onClick={() =>
                navigator.clipboard.writeText(payment.TransactionID)
              }
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <EditPaymentDialog payment={payment} />
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                await deletePayment(payment.TransactionID);
              }}
            >
              Delete payment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
