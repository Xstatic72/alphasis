"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, Calendar, CreditCard, LogOut } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';

type ParentData = {
  user: any;
  children: any[];
  grades: any[];
  attendance: any[];
  payments: any[];
};

export default function ParentDashboard() {
  const [data, setData] = useState<ParentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  useEffect(() => {
    fetch('/api/parent/dashboard')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (data && (data.children || []).length > 0 && !selectedChild) {
      setSelectedChild((data.children || [])[0].AdmissionNumber);
    }  }, [data, selectedChild]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!data) return <div>Error loading data</div>;
  const selectedChildData = (data?.children || []).find(child => child.AdmissionNumber === selectedChild);
  const childGrades = (data?.grades || []).filter(grade => grade.StudentID === selectedChild);
  const childAttendance = (data?.attendance || []).filter(att => att.StudentID === selectedChild);
  const childPayments = (data?.payments || []).filter(payment => payment.StudentID === selectedChild);

  const gradeColumns = [
    { accessorKey: "Subject.SubjectName", header: "Subject" },
    { accessorKey: "Term", header: "Term" },
    { accessorKey: "CA", header: "CA" },
    { accessorKey: "Exam", header: "Exam" },
    { accessorKey: "TotalScore", header: "Total" },
    { accessorKey: "Grade", header: "Grade" }
  ];

  const attendanceColumns = [
    { accessorKey: "Subject.SubjectName", header: "Subject" },
    { accessorKey: "Date", header: "Date" },
    { accessorKey: "Status", header: "Status" }
  ];

  const paymentColumns = [
    { accessorKey: "TransactionID", header: "Transaction ID" },
    { accessorKey: "Amount", header: "Amount (₦)" },
    { accessorKey: "PaymentDate", header: "Date" },
    { accessorKey: "PaymentMethod", header: "Method" },
    { accessorKey: "Term", header: "Term" }
  ];  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Users className="h-12 w-12 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
                <p className="text-lg text-gray-600">Welcome back, {data?.user?.name || 'Parent'}</p>
                <p className="text-sm text-gray-500">
                  Monitoring {(data?.children || []).length} child{(data?.children || []).length !== 1 ? 'ren' : ''}
                </p>
              </div>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 hover:text-red-800 transition-all duration-200 active:scale-95"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>{/* Child Selector */}
        {(data.children || []).length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Child</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(data.children || []).map((child: any) => (
                  <Button
                    key={child.AdmissionNumber}
                    variant={selectedChild === child.AdmissionNumber ? "default" : "outline"}
                    onClick={() => setSelectedChild(child.AdmissionNumber)}
                  >
                    {child.FirstName} {child.LastName} ({child.Class?.ClassName})
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedChildData && (
          <>
            {/* Child Info */}
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-semibold">{selectedChildData.FirstName} {selectedChildData.LastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Admission Number</p>
                    <p className="font-semibold">{selectedChildData.AdmissionNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Class</p>
                    <p className="font-semibold">{selectedChildData.Class?.ClassName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-semibold">{selectedChildData.Gender}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{childGrades.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {childGrades.length > 0 
                      ? (childGrades.reduce((sum: number, grade: any) => sum + grade.TotalScore, 0) / childGrades.length).toFixed(1)
                      : 'N/A'
                    }
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {childAttendance.length > 0 
                      ? Math.round((childAttendance.filter((a: any) => a.Status === 'Present').length / childAttendance.length) * 100)
                      : 0
                    }%
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Payments Made</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{childPayments.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Grades Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Academic Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable 
                  columns={gradeColumns} 
                  data={childGrades} 
                  searchPlaceholder="Search subjects..."
                  searchColumn="Subject.SubjectName"
                />
              </CardContent>
            </Card>

            {/* Attendance Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Attendance Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable 
                  columns={attendanceColumns} 
                  data={childAttendance.slice(0, 20)} 
                  searchPlaceholder="Search attendance..."
                />
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable 
                  columns={paymentColumns} 
                  data={childPayments} 
                  searchPlaceholder="Search payments..."
                />
              </CardContent>
            </Card>
          </>        )}
      </div>
    </div>  );
}
