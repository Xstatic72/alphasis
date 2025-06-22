"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Calendar, CreditCard, User } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';

type StudentData = {
  user: any;
  grades: any[];
  attendance: any[];
  payments: any[];
};

export default function StudentDashboard() {
  const [data, setData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/student/dashboard')
      .then(res => {
        if (!res.ok) router.push('/login');
        return res.json();
      })
      .then(setData)
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!data) return <div>Error loading data</div>;

  const gradeColumns = [
    { accessorKey: "Subject.SubjectName", header: "Subject" },
    { accessorKey: "Term", header: "Term" },
    { accessorKey: "CA", header: "CA (40)" },
    { accessorKey: "Exam", header: "Exam (60)" },
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
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-4">
            <User className="h-12 w-12 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-lg text-gray-600">Welcome back, {data.user.name}</p>
              {data.user.studentProfile && (
                <p className="text-sm text-gray-500">
                  Admission Number: {data.user.studentProfile.AdmissionNumber} | 
                  Class: {data.user.studentProfile.Class?.ClassName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold">Grades</h3>
                <p className="text-2xl font-bold text-green-600">{data.grades.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">Attendance</h3>
                <p className="text-2xl font-bold text-blue-600">{data.attendance.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <CreditCard className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold">Payments</h3>
                <p className="text-2xl font-bold text-purple-600">{data.payments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grades Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <BookOpen className="mr-3 h-6 w-6" />
            My Grades
          </h2>
          <DataTable 
            columns={gradeColumns} 
            data={data.grades} 
            searchPlaceholder="Search subjects..."
            searchColumn="Subject.SubjectName"
          />
        </div>

        {/* Recent Attendance */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Calendar className="mr-3 h-6 w-6" />
            Recent Attendance
          </h2>
          <DataTable 
            columns={attendanceColumns} 
            data={data.attendance.slice(0, 10)} 
            searchPlaceholder="Search attendance..."
          />
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <CreditCard className="mr-3 h-6 w-6" />
            Payment History
          </h2>
          <DataTable 
            columns={paymentColumns} 
            data={data.payments} 
            searchPlaceholder="Search payments..."
          />
        </div>
      </div>
    </div>
  );
}
