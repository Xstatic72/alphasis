"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  UserPlus,
  LogOut,
  GraduationCap,
  TrendingUp,
  UserCheck,
  UserX,
  BarChart3,
  Home
} from 'lucide-react';

type TeacherData = {
  user: any;
  subjects: any[];
  students: any[];
  grades: any[];
  attendance: any[];
};

export default function TeacherDashboard() {
  const [data, setData] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);
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
    fetch('/api/teacher/dashboard')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (!data) return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
        <p className="text-gray-600">Please try refreshing the page</p>
      </div>
    </div>
  );

  // Calculate statistics
  const totalStudents = (data.students || []).length;
  const totalSubjects = (data.subjects || []).length;
  const totalGrades = (data.grades || []).length;
  const totalAttendance = (data.attendance || []).length;
  const averageGrade = (data.grades || []).length > 0 
    ? ((data.grades || []).reduce((sum: number, grade: any) => sum + grade.TotalScore, 0) / (data.grades || []).length).toFixed(1)
    : 'N/A';
  const attendanceRate = (data.attendance || []).length > 0 
    ? Math.round(((data.attendance || []).filter((a: any) => a.Status === 'Present' || a.Status === 'PRESENT' || a.Status === '1').length / (data.attendance || []).length) * 100)
    : 0;

  // Define table columns
  const studentColumns = [
    { accessorKey: "AdmissionNumber", header: "Admission No." },
    { 
      accessorKey: "FirstName", 
      header: "Student Name",
      cell: ({ row }: any) => `${row.original.FirstName} ${row.original.LastName}`
    },
    { accessorKey: "Gender", header: "Gender" },    { 
      accessorKey: "Renamedclass.ClassName", 
      header: "Class",
      cell: ({ row }: any) => row.original.Renamedclass?.ClassName || 'N/A'
    },
    { accessorKey: "ParentContact", header: "Parent Contact" }
  ];
  const gradeColumns = [
    { 
      accessorKey: "StudentName", 
      header: "Student",
      cell: ({ row }: any) => row.original.StudentName || `${row.original.Student?.FirstName || ''} ${row.original.Student?.LastName || ''}`.trim() || 'N/A'
    },
    { 
      accessorKey: "SubjectName", 
      header: "Subject",
      cell: ({ row }: any) => row.original.SubjectName || row.original.Subject?.SubjectName || 'N/A'
    },
    { accessorKey: "Term", header: "Term" },
    { accessorKey: "CA", header: "CA Score" },
    { accessorKey: "Exam", header: "Exam Score" },
    { accessorKey: "TotalScore", header: "Total Score" },
    { 
      accessorKey: "Grade", 
      header: "Grade",
      cell: ({ row }: any) => (
        <Badge variant={
          row.original.Grade === 'A' ? 'default' :
          row.original.Grade === 'B' ? 'secondary' :
          row.original.Grade === 'C' ? 'outline' : 'destructive'
        }>
          {row.original.Grade}
        </Badge>
      )
    }
  ];
  const attendanceColumns = [
    { 
      accessorKey: "StudentName", 
      header: "Student",
      cell: ({ row }: any) => row.original.StudentName || `${row.original.Student?.FirstName || ''} ${row.original.Student?.LastName || ''}`.trim() || 'N/A'
    },
    { 
      accessorKey: "SubjectName", 
      header: "Subject",
      cell: ({ row }: any) => row.original.SubjectName || row.original.Subject?.SubjectName || 'N/A'
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
          {row.original.Status === 'Present' || row.original.Status === 'PRESENT' || row.original.Status === '1' ? (
            <>
              <UserCheck className="h-3 w-3 mr-1" />
              Present
            </>
          ) : (
            <>
              <UserX className="h-3 w-3 mr-1" />
              Absent
            </>
          )}
        </Badge>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <GraduationCap className="h-12 w-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-lg text-gray-600">Welcome back, {data?.user?.name || 'Teacher'}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                  <span>Managing {totalStudents} students</span>
                  <span>•</span>
                  <span>Teaching {totalSubjects} subjects</span>
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
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Students</p>
                  <p className="text-3xl font-bold">{totalStudents}</p>
                  <p className="text-xs text-blue-200">Under your guidance</p>
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
                  <p className="text-green-100 text-sm font-medium">Subjects Teaching</p>
                  <p className="text-3xl font-bold">{totalSubjects}</p>
                  <p className="text-xs text-green-200">Active courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-purple-100 text-sm font-medium">Average Grade</p>
                  <p className="text-3xl font-bold">{averageGrade}</p>
                  <p className="text-xs text-purple-200">Class performance</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-orange-100 text-sm font-medium">Attendance Rate</p>
                  <p className="text-3xl font-bold">{attendanceRate}%</p>
                  <p className="text-xs text-orange-200">Overall attendance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <UserPlus className="mr-2 h-5 w-5 text-blue-600" />
                Student Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Manage your students, add new ones, and view detailed profiles.</p>
              <Button 
                onClick={() => router.push('/teacher/students')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Manage Students
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Calendar className="mr-2 h-5 w-5 text-green-600" />
                Attendance Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Mark attendance, view reports, and track student presence.</p>
              <Button 
                onClick={() => router.push('/teacher/attendance')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Track Attendance
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <BarChart3 className="mr-2 h-5 w-5 text-purple-600" />
                Grade Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Input grades, calculate averages, and generate reports.</p>
              <Button 
                onClick={() => router.push('/teacher/grades')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Manage Grades
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Recent Students ({totalStudents})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={studentColumns} 
              data={(data.students || []).slice(0, 10)} 
              searchPlaceholder="Search students..."
              searchColumn="FirstName"
            />
            {totalStudents > 10 && (
              <div className="mt-4 text-center">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/teacher/students')}
                >
                  View All Students ({totalStudents})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Grades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Recent Grades ({totalGrades})
            </CardTitle>
          </CardHeader>
          <CardContent>            <DataTable 
              columns={gradeColumns} 
              data={(data.grades || []).slice(0, 10)} 
              searchPlaceholder="Search grades..."
              searchColumn="StudentName"
            />
            {totalGrades > 10 && (
              <div className="mt-4 text-center">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/teacher/grades')}
                >
                  View All Grades ({totalGrades})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Recent Attendance ({totalAttendance})
            </CardTitle>
          </CardHeader>
          <CardContent>            <DataTable 
              columns={attendanceColumns} 
              data={(data.attendance || []).slice(0, 10)} 
              searchPlaceholder="Search attendance..."
              searchColumn="StudentName"
            />
            {totalAttendance > 10 && (
              <div className="mt-4 text-center">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/teacher/attendance')}
                >
                  View All Attendance ({totalAttendance})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
