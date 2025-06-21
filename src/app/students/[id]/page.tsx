import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Calendar, MapPin, Phone, GraduationCap, CreditCard } from "lucide-react";

interface PaymentType {
  TransactionID: string;
  Amount: number;
  PaymentDate: Date;
  Term: string;
}

interface StudentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = await params;  const student = await prisma.student.findUnique({
    where: { AdmissionNumber: id },
    include: {
      Class: true,
      Payment: {
        orderBy: { PaymentDate: 'desc' },
        take: 5,
      },
    },
  });

  if (!student) {
    notFound();
  }
  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/students">
            <Button 
              variant="outline" 
              size="sm"
              className="gradient-border hover:shadow-lg transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Student Profile Card */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Card */}
            <div className="card-modern border-0 shadow-xl bg-gradient-to-br from-white via-gray-50 to-white overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-aerospace-orange/10 via-transparent to-apple-green/10" />
              <div className="relative p-8">
                <div className="flex items-start space-x-6">
                  <div className="p-4 bg-gradient-to-br from-aerospace-orange to-gamboge rounded-2xl shadow-lg">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                      {student.FirstName} {student.LastName}
                    </h1>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <GraduationCap className="h-4 w-4" />
                      <span className="font-medium">ID: {student.AdmissionNumber}</span>
                    </div>                    {student.Class && (
                      <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-apple-green/10 to-amber/10 text-gray-700 border border-apple-green/20">
                        Class: {student.Class.ClassName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="card-modern border-0 shadow-xl bg-gradient-to-br from-white via-gray-50 to-white overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-apple-green/5 via-transparent to-amber/5" />
              <div className="relative p-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
                  Personal Information
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Date of Birth</span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {new Date(student.DateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600 mb-1">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">Gender</span>
                    </div>
                    <p className="text-gray-900 font-medium">{student.Gender}</p>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center space-x-2 text-gray-600 mb-1">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">Address</span>
                    </div>
                    <p className="text-gray-900 font-medium">{student.Address}</p>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center space-x-2 text-gray-600 mb-1">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm font-medium">Parent Contact</span>
                    </div>
                    <p className="text-gray-900 font-medium">{student.ParentContact}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Payments Sidebar */}
          <div className="space-y-6">
            <div className="card-modern border-0 shadow-xl bg-gradient-to-br from-white via-gray-50 to-white overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gamboge/5 via-transparent to-aerospace-orange/5" />
              <div className="relative p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-gamboge to-aerospace-orange rounded-lg shadow-lg">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Recent Payments
                  </h2>
                </div>
                
                {student.Payment.length > 0 ? (
                  <div className="space-y-4">                    {student.Payment.map((payment: PaymentType) => (
                      <div
                        key={payment.TransactionID}
                        className="p-4 rounded-xl border border-gray-200 bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>                            <p className="text-xl font-bold text-gray-900">
                              ${payment.Amount.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {payment.Term}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {payment.PaymentDate
                              ? new Date(payment.PaymentDate).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    <Link href={`/payments?student=${student.AdmissionNumber}`}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full gradient-border hover:shadow-lg transition-all duration-300"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        View All Payments
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No payments recorded yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
