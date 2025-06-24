"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';
import { Calendar, UserCheck, UserX, Users, CheckCircle, XCircle, LogOut, ArrowLeft, Home } from 'lucide-react';

type AttendanceRecord = {
  AttendanceID: string;
  Date: string;
  Status: 'Present' | 'Absent' | 'PRESENT' | '1' | '0';
  student: {
    AdmissionNumber: string;
    FirstName: string;
    LastName: string;
  };
  subject: {
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
  
  // New state for the two-list system
  const [pendingStudents, setPendingStudents] = useState<Student[]>([]);
  const [markedStudents, setMarkedStudents] = useState<Array<Student & { status: 'Present' | 'Absent' }>>([]);
  const [isFinalizingAttendance, setIsFinalizingAttendance] = useState(false);
  
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

  // Update pending students when students data changes or subject changes
  useEffect(() => {
    if (students.length > 0 && selectedSubject) {
      // Filter out students who already have attendance for this date/subject
      const existingAttendance = getAttendanceForDate(selectedDate);      const studentsWithoutAttendance = students.filter(student => 
        student && student.AdmissionNumber && !existingAttendance.some(record => record.student?.AdmissionNumber === student.AdmissionNumber)
      );
      setPendingStudents(studentsWithoutAttendance);
      setMarkedStudents([]);
    }
  }, [students, selectedSubject, selectedDate, attendanceRecords]);
  const fetchData = async () => {
    try {
      const response = await fetch('/api/attendance', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data.attendance || []);
        setStudents(data.students || []);
        setSubjects(data.subjects || []);
        if (data.subjects && data.subjects.length > 0) {
          setSelectedSubject(data.subjects[0].SubjectID);
        }
        // Reset the pending students list when data is fetched
        setPendingStudents(data.students || []);
        setMarkedStudents([]);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // New function to handle marking attendance (moves student to marked list)
  const handleMarkAttendanceTemp = (studentId: string, status: 'Present' | 'Absent') => {
    const student = pendingStudents.find(s => s.AdmissionNumber === studentId);
    if (student) {
      // Remove from pending list
      setPendingStudents(prev => prev.filter(s => s.AdmissionNumber !== studentId));
      // Add to marked list
      setMarkedStudents(prev => [...prev, { ...student, status }]);
    }
  };

  // Function to move student back to pending list
  const handleUnmarkAttendance = (studentId: string) => {
    const student = markedStudents.find(s => s.AdmissionNumber === studentId);
    if (student) {
      // Remove from marked list
      setMarkedStudents(prev => prev.filter(s => s.AdmissionNumber !== studentId));
      // Add back to pending list
      setPendingStudents(prev => [...prev, { 
        AdmissionNumber: student.AdmissionNumber,
        FirstName: student.FirstName,
        LastName: student.LastName
      }]);
    }
  };

  // Function to finalize all attendance (save to database)
  const handleFinalizeAttendance = async () => {
    if (!selectedSubject || markedStudents.length === 0) return;

    setIsFinalizingAttendance(true);
    try {      const attendancePromises = markedStudents.map(async student => {
        console.log('Submitting attendance for student:', student.AdmissionNumber, 'Status:', student.status);
        
        const response = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            StudentID: student.AdmissionNumber,
            SubjectID: selectedSubject,
            Date: selectedDate,
            Status: student.status
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to submit attendance for student:', student.AdmissionNumber, 'Error:', errorData);
          throw new Error(`Failed for ${student.FirstName} ${student.LastName}: ${errorData.error || 'Unknown error'}`);
        }

        return response;
      });      const results = await Promise.allSettled(attendancePromises);
      
      const successful = results.filter(result => result.status === 'fulfilled');
      const failed = results.filter(result => result.status === 'rejected');

      console.log('Attendance submission results:', {
        successful: successful.length,
        failed: failed.length,
        total: results.length
      });

      if (failed.length > 0) {
        const errorMessages = failed.map((result, index) => 
          result.status === 'rejected' ? result.reason.message : 'Unknown error'
        );
        console.error('Failed submissions:', errorMessages);
        alert(`Some attendance records failed to save:\n${errorMessages.join('\n')}`);
      }

      if (successful.length > 0) {
        // Reset the lists and fetch fresh data
        setMarkedStudents([]);
        setPendingStudents([]);
        setShowMarkAttendance(false);
        fetchData();
        
        if (failed.length === 0) {
          alert('All attendance records saved successfully!');
        } else {
          alert(`${successful.length} of ${results.length} attendance records saved successfully.`);
        }
      } else {
        alert('All attendance records failed to save. Please check the console for details.');
      }    } catch (error) {
      console.error('Error finalizing attendance:', error);
      alert(`Error finalizing attendance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsFinalizingAttendance(false);
    }
  };
  // Function to reset the attendance session
  const handleResetAttendance = () => {
    setPendingStudents(students);
    setMarkedStudents([]);
  };
  const getAttendanceForDate = (date: string) => {    return attendanceRecords.filter(record => 
      record.Date.split('T')[0] === date && 
      record.subject?.SubjectID === selectedSubject
    );
  };

  const getTodayAttendance = () => {
    return getAttendanceForDate(selectedDate);
  };  const getStudentAttendanceStatus = (studentId: string) => {
    const todayAttendance = getTodayAttendance();
    return todayAttendance.find(record => record.student?.AdmissionNumber === studentId);
  };
  const attendanceColumns = [
    { 
      accessorKey: "Date", 
      header: "Date",
      cell: ({ row }: any) => new Date(row.original.Date).toLocaleDateString()
    },    { 
      accessorKey: "student.FirstName", 
      header: "Student Name",
      cell: ({ row }: any) => {
        const student = row.original.student;
        return student ? `${student.FirstName || ''} ${student.LastName || ''}`.trim() : 'Unknown Student';
      }
    },    { 
      accessorKey: "student.AdmissionNumber", 
      header: "Admission No.",
      cell: ({ row }: any) => {
        const student = row.original.student;
        return student ? student.AdmissionNumber || 'N/A' : 'Unknown';
      }
    },
    { 
      accessorKey: "subject.SubjectName", 
      header: "Subject",
      cell: ({ row }: any) => {
        const subject = row.original.subject;
        return subject ? subject.SubjectName || 'N/A' : 'Unknown Subject';
      }
    },
    { 
      accessorKey: "Status", 
      header: "Status",
      cell: ({ row }: any) => (        <Badge variant={row.original.Status === 'Present' || row.original.Status === 'PRESENT' || row.original.Status === '1' ? 'default' : 'destructive'}>
          {row.original.Status === 'Present' || row.original.Status === 'PRESENT' || row.original.Status === '1' ? (
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
        {/* Navigation Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            onClick={() => router.push('/teacher')}
            variant="outline"
            className="flex items-center gap-2 hover:bg-blue-50 border-blue-300"
          >            <ArrowLeft className="h-4 w-4" />
            Back to Main Dashboard
          </Button>
        </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">                <div>
                  <Label htmlFor="date">Select Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
              </div>              {/* Students List - Two-List System */}
              {selectedSubject && (pendingStudents.length > 0 || markedStudents.length > 0) && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Student Attendance for {new Date(selectedDate).toLocaleDateString()}
                    </h3>
                    <div className="flex items-center gap-4 text-sm font-semibold">
                      <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 rounded-lg">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-orange-800">Pending: {pendingStudents.length}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-lg">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-green-800">Present: {markedStudents.filter(s => s.status === 'Present').length}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-red-100 rounded-lg">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-red-800">Absent: {markedStudents.filter(s => s.status === 'Absent').length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pending Students Section */}
                  {pendingStudents.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-md font-bold text-gray-700 border-b pb-2">Students to Mark</h4>
                      <div className="grid gap-3">
                        {pendingStudents.filter(student => student && student.AdmissionNumber).map((student) => (
                          <div 
                            key={student.AdmissionNumber}
                            className="flex items-center justify-between p-4 border-2 border-orange-200 rounded-lg bg-orange-50 hover:border-orange-300 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-center space-x-4">                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-200 text-gray-700 font-bold text-sm">
                                {(student.FirstName || '').charAt(0)}{(student.LastName || '').charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-800">
                                  {student.FirstName || ''} {student.LastName || ''}
                                </p>
                                <p className="text-sm text-gray-600">
                                  ID: {student.AdmissionNumber}
                                </p>
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleMarkAttendanceTemp(student.AdmissionNumber, 'Present')}
                              >
                                <UserCheck className="h-3 w-3 mr-1" />
                                Present
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-700 hover:bg-red-50"
                                onClick={() => handleMarkAttendanceTemp(student.AdmissionNumber, 'Absent')}
                              >
                                <UserX className="h-3 w-3 mr-1" />
                                Absent
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Marked Students Section */}
                  {markedStudents.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-md font-bold text-gray-700 border-b pb-2">
                        Marked Students ({new Date(selectedDate).toLocaleDateString()})
                      </h4>
                      <div className="grid gap-3">
                        {markedStudents.filter(student => student && student.AdmissionNumber).map((student) => (
                          <div 
                            key={student.AdmissionNumber}
                            className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all duration-200 ${
                              student.status === 'Present' 
                                ? 'border-green-200 bg-green-50 hover:border-green-300'
                                : 'border-red-200 bg-red-50 hover:border-red-300'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-sm ${
                                student.status === 'Present' 
                                  ? 'bg-gradient-to-br from-green-500 to-green-600'
                                  : 'bg-gradient-to-br from-red-500 to-red-600'
                              }`}>                                {(student.FirstName || '').charAt(0)}{(student.LastName || '').charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-800">
                                  {student.FirstName || ''} {student.LastName || ''}
                                </p>
                                <p className="text-sm text-gray-600">
                                  ID: {student.AdmissionNumber}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <Badge 
                                variant={student.status === 'Present' ? 'default' : 'destructive'}
                                className="px-3 py-1"
                              >
                                {student.status === 'Present' ? (
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
                                onClick={() => handleUnmarkAttendance(student.AdmissionNumber)}
                              >
                                Undo
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Finalization Controls */}
                  {markedStudents.length > 0 && (
                    <div className="flex justify-center gap-4 pt-6 border-t border-gray-200">
                      <Button
                        variant="outline"
                        className="bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                        onClick={handleResetAttendance}
                        disabled={isFinalizingAttendance}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Reset All
                      </Button>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                        onClick={handleFinalizeAttendance}
                        disabled={isFinalizingAttendance || pendingStudents.length > 0}
                      >
                        {isFinalizingAttendance ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Finalizing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Finalize Attendance ({markedStudents.length} students)
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Bulk Actions for Pending Students */}
                  {pendingStudents.length > 0 && (
                    <div className="flex justify-center gap-4 pt-4 border-t border-gray-200">
                      <Button
                        variant="outline"
                        className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                        onClick={() => {
                          pendingStudents.forEach(student => {
                            handleMarkAttendanceTemp(student.AdmissionNumber, 'Present');
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
                          pendingStudents.forEach(student => {
                            handleMarkAttendanceTemp(student.AdmissionNumber, 'Absent');
                          });
                        }}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Mark All Absent
                      </Button>
                    </div>
                  )}
                </div>
              )}              {selectedSubject && pendingStudents.length === 0 && markedStudents.length === 0 && (
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
                    {getTodayAttendance().filter(r => r.Status === 'Present' || r.Status === 'PRESENT' || r.Status === '1').length}
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
          <CardContent>            <DataTable 
              columns={attendanceColumns} 
              data={attendanceRecords}
              searchPlaceholder="Search attendance records..."
            />
          </CardContent>
        </Card>

        {/* Attendance Reports Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="mr-2 h-5 w-5" />
              Attendance Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Report Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="reportDate">Report Date Range</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Input
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="reportSubject">Subject Filter</Label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject.SubjectID} value={subject.SubjectID}>
                        {subject.SubjectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Generate Report
                  </Button>
                </div>
              </div>

              {/* Attendance Summary by Student */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Attendance Summary by Student</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {students.filter(student => student && student.AdmissionNumber).slice(0, 10).map((student) => {                        const studentAttendance = attendanceRecords.filter(record => 
                          record.student?.AdmissionNumber === student.AdmissionNumber &&
                          (!selectedSubject || record.subject?.SubjectID === selectedSubject)
                        );
                        const presentCount = studentAttendance.filter(record => record.Status === 'Present' || record.Status === 'PRESENT' || record.Status === '1').length;
                        const totalCount = studentAttendance.length;
                        const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
                          return (
                          <div key={student.AdmissionNumber} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                                {(student.FirstName || '').charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{student.FirstName || ''} {student.LastName || ''}</p>
                                <p className="text-sm text-gray-600">{student.AdmissionNumber}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <p className="font-semibold text-gray-800">{presentCount}/{totalCount}</p>
                                <p className="text-sm text-gray-600">Present/Total</p>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                attendanceRate >= 80 ? 'bg-green-100 text-green-800' :
                                attendanceRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {attendanceRate}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Attendance Summary by Subject</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {subjects.map((subject) => {
                        const subjectAttendance = attendanceRecords.filter(record => 
                          record.subject?.SubjectID === subject.SubjectID
                        );
                        const presentCount = subjectAttendance.filter(record => record.Status === 'Present' || record.Status === 'PRESENT' || record.Status === '1').length;
                        const totalCount = subjectAttendance.length;
                        const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
                        
                        return (
                          <div key={subject.SubjectID} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium text-gray-800">{subject.SubjectName}</p>
                              <p className="text-sm text-gray-600">Subject ID: {subject.SubjectID}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <p className="font-semibold text-gray-800">{presentCount}/{totalCount}</p>
                                <p className="text-sm text-gray-600">Present/Total</p>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                attendanceRate >= 80 ? 'bg-green-100 text-green-800' :
                                attendanceRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {attendanceRate}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Attendance Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Attendance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Get last 7 days of attendance */}
                    {Array.from({ length: 7 }, (_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() - i);
                      const dateString = date.toISOString().split('T')[0];
                      const dayAttendance = getAttendanceForDate(dateString);
                      const presentCount = dayAttendance.filter(record => record.Status === 'Present' || record.Status === 'PRESENT' || record.Status === '1').length;
                      const totalCount = dayAttendance.length;
                      const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
                      
                      return (
                        <div key={dateString} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">{date.toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600">{date.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className="font-semibold text-gray-800">{presentCount}/{totalCount}</p>
                              <p className="text-sm text-gray-600">Present/Total</p>
                            </div>
                            {totalCount > 0 && (
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                attendanceRate >= 80 ? 'bg-green-100 text-green-800' :
                                attendanceRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {attendanceRate}%
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}