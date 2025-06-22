"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';
import { Calendar, UserCheck, UserX, Users, CheckCircle, XCircle, LogOut } from 'lucide-react';

type AttendanceRecord = {
  AttendanceID: string;
  Date: string;
  Status: 'Present' | 'Absent';
  Student: {
    AdmissionNumber: string;
    FirstName: string;
    LastName: string;
  };
  Subject: {
    SubjectID: string;
    SubjectName: string;
  };
};

type Student = {
  AdmissionNumber: string;
  FirstName: string;
  LastName: string;
};

type Subject = {
  SubjectID: string;
  SubjectName: string;
};

export default function TeacherAttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/attendance');
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data.attendance || []);
        setStudents(data.students || []);
        setSubjects(data.subjects || []);
        if (data.subjects && data.subjects.length > 0) {
          setSelectedSubject(data.subjects[0].SubjectID);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleMarkAttendance = async (studentId: string, status: 'Present' | 'Absent') => {
    if (!selectedSubject) return;

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          StudentID: studentId,
          SubjectID: selectedSubject,
          Date: selectedDate,
          Status: status
        }),
      });

      if (response.ok) {
        fetchData(); // Refresh data
      } else {
        const errorData = await response.json();
        console.error('Error marking attendance:', errorData.error);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const getAttendanceForDate = (date: string) => {
    return attendanceRecords.filter(record => 
      record.Date.split('T')[0] === date && 
      record.Subject.SubjectID === selectedSubject
    );
  };

  const getTodayAttendance = () => {
    return getAttendanceForDate(selectedDate);
  };

  const getStudentAttendanceStatus = (studentId: string) => {
    const todayAttendance = getTodayAttendance();
    return todayAttendance.find(record => record.Student.AdmissionNumber === studentId);
  };

  const attendanceColumns = [
    { 
      accessorKey: "Date", 
      header: "Date",
      cell: ({ row }: any) => new Date(row.original.Date).toLocaleDateString()
    },
    { 
      accessorKey: "Student.FirstName", 
      header: "Student Name",
      cell: ({ row }: any) => `${row.original.Student.FirstName} ${row.original.Student.LastName}`
    },
    { accessorKey: "Student.AdmissionNumber", header: "Admission No." },
    { accessorKey: "Subject.SubjectName", header: "Subject" },
    { 
      accessorKey: "Status", 
      header: "Status",
      cell: ({ row }: any) => (
        <Badge variant={row.original.Status === 'Present' ? 'default' : 'destructive'}>
          {row.original.Status === 'Present' ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Present
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 mr-1" />
              Absent
            </>
          )}
        </Badge>
      )
    },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calendar className="h-12 w-12 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
                <p className="text-lg text-gray-600">Track and manage student attendance records</p>
                <p className="text-sm text-gray-500">{attendanceRecords.length} total records</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setShowMarkAttendance(!showMarkAttendance)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                {showMarkAttendance ? 'Hide Form' : 'Mark Attendance'}
              </Button>
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
        </div>        {/* Mark Attendance Section */}
        {showMarkAttendance && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="mr-2 h-5 w-5" />
                Mark Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Form Controls with Enhanced Styling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="date">Select Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Select Subject</Label>
                  <select
                    id="subject"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Choose a subject...</option>
                    {subjects.map((subject) => (
                      <option key={subject.SubjectID} value={subject.SubjectID}>
                        {subject.SubjectName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>              {/* Students List */}
              {selectedSubject && students.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Student Attendance for {new Date(selectedDate).toLocaleDateString()}
                    </h3>
                    <div className="flex items-center gap-4 text-sm font-semibold">
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-lg">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-green-800">Present: {getTodayAttendance().filter(r => r.Status === 'Present').length}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-red-100 rounded-lg">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-red-800">Absent: {getTodayAttendance().filter(r => r.Status === 'Absent').length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {students.map((student) => {
                      const attendanceStatus = getStudentAttendanceStatus(student.AdmissionNumber);
                      return (
                        <div 
                          key={student.AdmissionNumber}
                          className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 text-gray-700 font-bold text-sm">
                              {student.FirstName.charAt(0)}{student.LastName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">
                                {student.FirstName} {student.LastName}
                              </p>
                              <p className="text-sm text-gray-600">
                                ID: {student.AdmissionNumber}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            {attendanceStatus ? (
                              <div className="flex items-center gap-3">
                                <Badge 
                                  variant={attendanceStatus.Status === 'Present' ? 'default' : 'destructive'}
                                  className="px-3 py-1"
                                >
                                  {attendanceStatus.Status === 'Present' ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Present
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Absent
                                    </>
                                  )}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() => {
                                    const newStatus = attendanceStatus.Status === 'Present' ? 'Absent' : 'Present';
                                    handleMarkAttendance(student.AdmissionNumber, newStatus);
                                  }}
                                >
                                  Change
                                </Button>
                              </div>
                            ) : (
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleMarkAttendance(student.AdmissionNumber, 'Present')}
                                >
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Present
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                  onClick={() => handleMarkAttendance(student.AdmissionNumber, 'Absent')}
                                >
                                  <UserX className="h-3 w-3 mr-1" />
                                  Absent
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bulk Actions */}
                  <div className="flex justify-center gap-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                      onClick={() => {
                        students.forEach(student => {
                          if (!getStudentAttendanceStatus(student.AdmissionNumber)) {
                            handleMarkAttendance(student.AdmissionNumber, 'Present');
                          }
                        });
                      }}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Mark All Present
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
                      onClick={() => {
                        students.forEach(student => {
                          if (!getStudentAttendanceStatus(student.AdmissionNumber)) {
                            handleMarkAttendance(student.AdmissionNumber, 'Absent');
                          }
                        });
                      }}
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Mark All Absent
                    </Button>
                  </div>
                </div>
              )}

              {selectedSubject && students.length === 0 && (
                <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-gray-600 mb-1">No Students Found</h3>
                  <p className="text-gray-500">No students are registered for this subject yet.</p>
                </div>
              )}

              {!selectedSubject && (
                <div className="text-center py-8 px-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Calendar className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-blue-600 mb-1">Select Subject</h3>
                  <p className="text-blue-500">Please select a subject above to view and mark attendance for students.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}        {/* Enhanced Attendance Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Records</p>
                  <p className="text-3xl font-bold text-blue-600">{attendanceRecords.length}</p>
                  <p className="text-xs text-gray-500">All time</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Present Today</p>
                  <p className="text-3xl font-bold text-green-600">
                    {getTodayAttendance().filter(r => r.Status === 'Present').length}
                  </p>
                  <p className="text-xs text-gray-500">
                    Out of {getTodayAttendance().length} marked
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                  <UserX className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Absent Today</p>
                  <p className="text-3xl font-bold text-red-600">
                    {getTodayAttendance().filter(r => r.Status === 'Absent').length}
                  </p>
                  <p className="text-xs text-gray-500">
                    Out of {getTodayAttendance().length} marked
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Attendance Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Attendance Records ({attendanceRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={attendanceColumns} 
              data={attendanceRecords}
              searchPlaceholder="Search by student name..."
              searchColumn="Student.FirstName"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
