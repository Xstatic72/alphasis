"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { 
  BookOpen, 
  User, 
  Calendar, 
  Plus, 
  CheckCircle, 
  LogOut, 
  TrendingUp, 
  Clock, 
  Award, 
  DollarSign,
  FileText,
  GraduationCap,
  BarChart3,
  CalendarDays,
  UserCheck,
  UserX,
  Loader2
} from 'lucide-react';

type Subject = {
  SubjectID: string;
  SubjectName: string;
  ClassLevel: string;
  teacher: {
    FirstName: string;
    LastName: string;
  } | null;
};

type StudentData = {
  user: any;
  registeredSubjects: any[];
  availableSubjects: Subject[];
  grades: any[];
  attendance: any[];
  payments: any[];
};

export default function StudentDashboard() {
  const [data, setData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null);
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
    fetch('/api/student/dashboard')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);  const handleRegisterSubject = async (subjectId: string) => {
    setRegistering(subjectId);
    setRegistrationSuccess(null);
    
    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId }),
      });

      if (response.ok) {
        // Refresh data
        const updatedData = await fetch('/api/student/dashboard').then(res => res.json());
        setData(updatedData);
        setRegistrationSuccess(subjectId);
        
        // Clear success message after 3 seconds
        setTimeout(() => setRegistrationSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setRegistering(null);
    }
  };if (loading) return (
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
  const totalSubjects = (data.registeredSubjects || []).length;
  const averageGrade = (data.grades || []).length > 0 
    ? ((data.grades || []).reduce((sum: number, grade: any) => sum + grade.TotalScore, 0) / (data.grades || []).length).toFixed(1)
    : 'N/A';  const attendanceRate = (data.attendance || []).length > 0 
    ? Math.round(((data.attendance || []).filter((a: any) => a.Status === 'Present' || a.Status === 'PRESENT' || a.Status === '1').length / (data.attendance || []).length) * 100)
    : 0;
  const totalPayments = (data.payments || []).reduce((sum: number, payment: any) => sum + Number(payment.Amount), 0);
  const recentAttendance = (data.attendance || []).slice(0, 10);
  const recentGrades = (data.grades || []).slice(0, 5);

  // Prepare data for tables
  const gradeColumns = [
    { 
      accessorKey: "subject.SubjectName", 
      header: "Subject",
      cell: ({ row }: any) => row.original.subject?.SubjectName || 'N/A'
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
      accessorKey: "subject.SubjectName", 
      header: "Subject",
      cell: ({ row }: any) => row.original.subject?.SubjectName || 'N/A'
    },
    { 
      accessorKey: "Date", 
      header: "Date",
      cell: ({ row }: any) => new Date(row.original.Date).toLocaleDateString()
    },    { 
      accessorKey: "Status", 
      header: "Status",
      cell: ({ row }: any) => (
        <Badge variant={row.original.Status === 'Present' || row.original.Status === 'PRESENT' || row.original.Status === '1' ? 'default' : 'destructive'}>
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

  const paymentColumns = [
    { accessorKey: "TransactionID", header: "Transaction ID" },
    { 
      accessorKey: "Amount", 
      header: "Amount",
      cell: ({ row }: any) => `₦${Number(row.original.Amount).toLocaleString()}`
    },
    { 
      accessorKey: "PaymentDate", 
      header: "Date",
      cell: ({ row }: any) => new Date(row.original.PaymentDate).toLocaleDateString()
    },
    { accessorKey: "PaymentMethod", header: "Method" },
    { accessorKey: "Term", header: "Term" },
    { 
      accessorKey: "Confirmation", 
      header: "Status",
      cell: ({ row }: any) => (
        <Badge variant={row.original.Confirmation ? 'default' : 'secondary'}>
          {row.original.Confirmation ? 'Confirmed' : 'Pending'}
        </Badge>
      )
    }
  ];  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <User className="h-12 w-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-lg text-gray-600">Welcome back, {data?.user?.name || 'Student'}</p>
                {data?.user?.studentProfile && (
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>Admission: {data.user.studentProfile.AdmissionNumber}</span>
                    <span>•</span>
                    <span>Class: {data.user.studentProfile.Renamedclass?.ClassName || 'Not Assigned'}</span>
                    <span>•</span>
                    <span>Gender: {data.user.studentProfile.Gender}</span>
                  </div>
                )}
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
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium">Registered Subjects</p>
                  <p className="text-3xl font-bold">{totalSubjects}</p>
                  <p className="text-xs text-blue-200">This term</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-green-100 text-sm font-medium">Average Grade</p>
                  <p className="text-3xl font-bold">{averageGrade}</p>
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
                  <p className="text-3xl font-bold">{attendanceRate}%</p>
                  <p className="text-xs text-purple-200">This term</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-orange-100 text-sm font-medium">Total Payments</p>
                  <p className="text-3xl font-bold">₦{totalPayments.toLocaleString()}</p>
                  <p className="text-xs text-orange-200">All time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                <FileText className="h-6 w-6" />
                <span>View Transcript</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <CalendarDays className="h-6 w-6" />
                <span>Academic Calendar</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <DollarSign className="h-6 w-6" />
                <span>Payment History</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <GraduationCap className="h-6 w-6" />
                <span>Course Catalog</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Academic Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Recent Grades
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentGrades.length > 0 ? (
                <div className="space-y-3">
                  {recentGrades.map((grade: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{grade.subject?.SubjectName || 'Unknown Subject'}</p>
                        <p className="text-sm text-gray-600">Term {grade.Term}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{grade.TotalScore}/100</p>
                        <Badge variant={
                          grade.Grade === 'A' ? 'default' :
                          grade.Grade === 'B' ? 'secondary' :
                          grade.Grade === 'C' ? 'outline' : 'destructive'
                        }>
                          Grade {grade.Grade}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Award className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No grades available yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Recent Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentAttendance.length > 0 ? (
                <div className="space-y-3">
                  {recentAttendance.map((attendance: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{attendance.subject?.SubjectName || 'Unknown Subject'}</p>
                        <p className="text-sm text-gray-600">{new Date(attendance.Date).toLocaleDateString()}</p>
                      </div>                      <Badge variant={attendance.Status === 'Present' || attendance.Status === 'PRESENT' || attendance.Status === '1' ? 'default' : 'destructive'}>
                        {attendance.Status === 'Present' || attendance.Status === 'PRESENT' || attendance.Status === '1' ? (
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No attendance records yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>        {/* Enhanced Course Registration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Course Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(data.availableSubjects || []).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <GraduationCap className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-lg font-medium">All available courses registered!</p>
                <p>You have successfully registered for all courses available for your class level.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(data.availableSubjects || []).map((subject) => {
                  const isRegistered = (data.registeredSubjects || []).some(
                    (reg: any) => reg.SubjectID === subject.SubjectID
                  );
                  const isRegistering = registering === subject.SubjectID;
                  const wasJustRegistered = registrationSuccess === subject.SubjectID;
                  
                  return (
                    <div key={subject.SubjectID} className="border-2 border-gray-200 rounded-lg p-4 space-y-3 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{subject.SubjectName}</h3>
                        {isRegistered && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Registered
                          </Badge>
                        )}
                        {wasJustRegistered && (
                          <Badge variant="default" className="bg-green-500 text-white animate-pulse">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Success!
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2">                        <p className="text-sm text-gray-600 flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          Teacher: {subject.teacher ? `${subject.teacher.FirstName} ${subject.teacher.LastName}` : 'Not assigned'}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <GraduationCap className="h-4 w-4 mr-1" />
                          Class Level: {subject.ClassLevel}
                        </p>
                      </div>
                      
                      {!isRegistered && (
                        <Button 
                          onClick={() => handleRegisterSubject(subject.SubjectID)}
                          size="sm" 
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isRegistering || wasJustRegistered}
                        >
                          {isRegistering ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              Registering...
                            </>
                          ) : wasJustRegistered ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Registered!
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1" />
                              Register Now
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced My Subjects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              My Subjects ({totalSubjects})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalSubjects > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(data.registeredSubjects || []).map((registration: any) => {
                  const subjectGrade = (data.grades || []).find((g: any) => g.SubjectID === registration.SubjectID);                  const subjectAttendance = (data.attendance || []).filter((a: any) => a.SubjectID === registration.SubjectID);
                  const attendanceRate = subjectAttendance.length > 0 
                    ? Math.round((subjectAttendance.filter((a: any) => a.Status === 'Present' || a.Status === 'PRESENT' || a.Status === '1').length / subjectAttendance.length) * 100)
                    : 0;

                  return (
                    <div key={registration.RegistrationID} className="border rounded-lg p-4 space-y-3 bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg">{registration.subject.SubjectName}</h3>
                        <Badge variant="outline">{registration.Term}</Badge>
                      </div>
                      
                      <div className="space-y-2">                        <p className="text-sm text-gray-600 flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {registration.subject.teacher ? `${registration.subject.teacher.FirstName || ''} ${registration.subject.teacher.LastName || ''}` : 'Not assigned'}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Current Grade</p>
                            <p className="font-semibold">
                              {subjectGrade ? `${subjectGrade.TotalScore}/100 (${subjectGrade.Grade})` : 'Not graded yet'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Attendance</p>
                            <p className="font-semibold">{attendanceRate}%</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <FileText className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Progress
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-lg font-medium">No subjects registered yet</p>
                <p>Register for subjects above to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Academic Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Academic Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={gradeColumns} 
                data={data.grades || []} 
                searchPlaceholder="Search subjects..."
                searchColumn="subject.SubjectName"
              />
            </CardContent>
          </Card>

          {/* Attendance History Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Attendance History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={attendanceColumns} 
                data={data.attendance || []} 
                searchPlaceholder="Search attendance..."
                searchColumn="subject.SubjectName"
              />
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        {(data.payments || []).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={paymentColumns} 
                data={data.payments || []} 
                searchPlaceholder="Search payments..."
                searchColumn="TransactionID"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
