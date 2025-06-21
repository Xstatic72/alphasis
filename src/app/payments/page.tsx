import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { AddPaymentDialog } from "./add-payment-dialog";
import { CreditCard } from "lucide-react";

type Payment = {
  TransactionID: string;
  Amount: number;
  PaymentDate: Date;
  PaymentMethod: string;
  Confirmation: boolean;
  ReceiptGenerated: boolean;
  Term: string;
  StudentID: string;
}

type FormattedPayment = {
  TransactionID: string;
  Amount: number;
  PaymentDate: string;
  PaymentMethod: string;
  Confirmation: boolean;
  ReceiptGenerated: boolean;
  Term: string;
  StudentID: string;
}

export default async function PaymentsPage() {
  const paymentsData = await prisma.payment.findMany();
  
  // Convert Date objects to strings for the DataTable
  const payments: FormattedPayment[] = paymentsData.map((payment: Payment) => ({
    ...payment,
    PaymentDate: payment.PaymentDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
  }));

  return (
    <div className="min-h-full bg-main-gradient">
      <div className="page-container animate-slide-in-up">
        {/* Page Header with enhanced styling */}
        <div className="section-header">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="icon-container animate-float shadow-gamboge">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold gradient-text">
                  Payments
                </h1>
                <p className="text-gray-600 mt-1 text-lg">
                  Track and manage student fee payments
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-gamboge animate-pulse-glow"></div>
                  <span className="text-sm text-gray-500">{payments.length} payments recorded</span>
                </div>
              </div>
            </div>
            <AddPaymentDialog />
          </div>
        </div>

        {/* Enhanced Data Table Card */}
        <div className="content-card hover-lift">
          <div className="data-table-container">            
            <DataTable 
              columns={columns} 
              data={payments} 
              searchPlaceholder="Search payments by student ID..."
              searchColumn="StudentID"
            />
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card-modern hover-lift p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-gamboge to-aerospace-orange rounded-lg">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gradient-primary">{payments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="card-modern hover-lift p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-aerospace-orange to-gamboge rounded-lg">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gradient-secondary">
                  ${payments.reduce((sum, payment) => sum + payment.Amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card-modern hover-lift p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-apple-green to-amber rounded-lg">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Payment</p>
                <p className="text-2xl font-bold gradient-text">
                  ${payments.length > 0 ? (payments.reduce((sum, payment) => sum + payment.Amount, 0) / payments.length).toFixed(2) : "0.00"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
