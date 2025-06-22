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
    { 
      accessorKey: "subject.SubjectName", 
      header: "Subject",
      cell: ({ row }: any) => row.original.subject?.SubjectName || 'N/A'
    },
    { accessorKey: "Term", header: "Term" },
    { accessorKey: "CA", header: "CA" },
    { accessorKey: "Exam", header: "Exam" },
    { accessorKey: "TotalScore", header: "Total" },
    { accessorKey: "Grade", header: "Grade" }
  ];

  const attendanceColumns = [
    { 
      accessorKey: "subject.SubjectName", 
      header: "Subject",
      cell: ({ row }: any) => row.original.subject?.SubjectName || 'N/A'
    },
    { 
      accessorKey: "Date", 
      header: "Date",
      cell: ({ row }: any) => new Date(row.original.Date).toLocaleDateString()
    },
    { 
      accessorKey: "Status", 
      header: "Status",
      cell: ({ row }: any) => (        <Badge variant={row.original.Status === 'Present' || row.original.Status === 'PRESENT' || row.original.Status === '1' ? 'default' : 'destructive'}>
          {(row.original.Status === 'Present' || row.original.Status === 'PRESENT' || row.original.Status === '1') ? 'Present' : 'Absent'}
        </Badge>
      )
    }
  ];

  const paymentColumns = [
    { accessorKey: "TransactionID", header: "Transaction ID" },
    { accessorKey: "Amount", header: "Amount (₦)" },
    { accessorKey: "PaymentDate", header: "Date" },
    { accessorKey: "PaymentMethod", header: "Method" },
    { accessorKey: "Term", header: "Term" }
  ];  return (    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <Users className="h-12 w-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
                <p className="text-lg text-gray-600">Welcome back, {data?.user?.name || 'Parent'}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                  <span>Monitoring {(data?.children || []).length} child{(data?.children || []).length !== 1 ? 'ren' : ''}</span>
                  {selectedChildData && (
                    <>
                      <span>•</span>
                      <span>Currently viewing: {selectedChildData.FirstName} {selectedChildData.LastName}</span>
                    </>
                  )}
                </div>
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
        </div>{/* Child Selector - Enhanced Dropdown */}
        {(data.children || []).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Select Child to Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="child-select" className="block text-sm font-medium text-gray-700 mb-2">
                      Choose Child:
                    </label>
                    <select
                      id="child-select"
                      value={selectedChild}
                      onChange={(e) => setSelectedChild(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    >
                      {(data.children || []).map((child: any) => (
                        <option key={child.AdmissionNumber} value={child.AdmissionNumber}>
                          {child.FirstName} {child.LastName} - {child.Class?.ClassName || 'No Class'} ({child.AdmissionNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 w-full">
                      <p className="text-sm text-purple-600 font-medium">Currently Monitoring:</p>
                      <p className="text-lg font-bold text-purple-800">
                        {selectedChildData ? `${selectedChildData.FirstName} ${selectedChildData.LastName}` : 'Select a child'}
                      </p>
                      <p className="text-sm text-purple-600">
                        {selectedChildData ? `${selectedChildData.Class?.ClassName || 'No Class'} • ${selectedChildData.AdmissionNumber}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
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
            </Card>            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Subjects</p>
                      <p className="text-3xl font-bold">{childGrades.length}</p>
                      <p className="text-xs text-blue-200">Enrolled courses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-green-100 text-sm font-medium">Average Grade</p>
                      <p className="text-3xl font-bold">
                        {childGrades.length > 0 
                          ? (childGrades.reduce((sum: number, grade: any) => sum + grade.TotalScore, 0) / childGrades.length).toFixed(1)
                          : 'N/A'
                        }
                      </p>
                      <p className="text-xs text-green-200">Overall performance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Attendance Rate</p>
                      <p className="text-3xl font-bold">
                        {childAttendance.length > 0 
                          ? Math.round((childAttendance.filter((a: any) => a.Status === 'Present' || a.Status === 'PRESENT' || a.Status === '1').length / childAttendance.length) * 100)
                          : 0
                        }%
                      </p>
                      <p className="text-xs text-purple-200">This term</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Payments Made</p>
                      <p className="text-3xl font-bold">{childPayments.length}</p>
                      <p className="text-xs text-orange-200">Total transactions</p>
                    </div>
                  </div>
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
              <CardContent>                <DataTable 
                  columns={gradeColumns} 
                  data={childGrades} 
                  searchPlaceholder="Search subjects..."
                  searchColumn="subject.SubjectName"
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
