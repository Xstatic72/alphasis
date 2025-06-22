import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { AddPaymentDialog } from "./add-payment-dialog";
import { CreditCard, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  StudentName?: string;
}

export default async function PaymentsPage() {
  // Get all payments
  const paymentsData = await prisma.payment.findMany({
    orderBy: { PaymentDate: 'desc' }
  });
  
  // Get student names from person table
  const paymentsWithNames = await Promise.all(
    paymentsData.map(async (payment: Payment) => {
      try {
        const person = await prisma.$queryRaw`
          SELECT FirstName, LastName FROM person WHERE PersonID = ${payment.StudentID}
        ` as any[];
        
        return {
          ...payment,
          PaymentDate: payment.PaymentDate.toISOString().split('T')[0],
          StudentName: person[0] ? `${person[0].FirstName} ${person[0].LastName}` : payment.StudentID
        };
      } catch (error) {
        return {
          ...payment,
          PaymentDate: payment.PaymentDate.toISOString().split('T')[0],
          StudentName: payment.StudentID
        };
      }
    })
  );

  const payments: FormattedPayment[] = paymentsWithNames;
  const totalAmount = payments.reduce((sum, payment) => sum + payment.Amount, 0);
  const averagePayment = payments.length > 0 ? totalAmount / payments.length : 0;
  const confirmedPayments = payments.filter(payment => payment.Confirmation).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CreditCard className="h-12 w-12 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Payments Management</h1>
                <p className="text-lg text-gray-600">Track and manage student fee payments</p>
                <p className="text-sm text-gray-500">{payments.length} payments recorded</p>
              </div>
            </div>
            <AddPaymentDialog />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payments.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{totalAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{averagePayment.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{confirmedPayments}</div>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Records</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={payments} 
              searchPlaceholder="Search payments by student name or ID..."
              searchColumn="StudentName"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
