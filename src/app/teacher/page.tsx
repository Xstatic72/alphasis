"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Plus, 
  UserPlus,
  Edit,
  Save,
  LogOut
} from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';

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
  const [activeTab, setActiveTab] = useState('students');
  const router = useRouter();
  const [newStudentForm, setNewStudentForm] = useState({
    FirstName: '',
    LastName: '',
    AdmissionNumber: '',
    DateOfBirth: '',
    Gender: '',
    ParentContact: '',
    Address: '',
    StudentClassID: ''
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout API fails
      router.push('/login');
    }
  };

  useEffect(() => {
    fetch('/api/teacher/dashboard')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudentForm),
      });

      if (response.ok) {
        // Refresh data
        const updatedData = await fetch('/api/teacher/dashboard').then(res => res.json());
        setData(updatedData);
        setNewStudentForm({
          FirstName: '',
          LastName: '',
          AdmissionNumber: '',
          DateOfBirth: '',
          Gender: '',
          ParentContact: '',
          Address: '',
          StudentClassID: ''
        });
      }
    } catch (error) {
      console.error('Add student failed:', error);
    }
  };
  const handleUpdateGrade = async (gradeId: string, ca: number, exam: number) => {
    try {
      await fetch('/api/grades', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradeId, ca, exam }),
      });
      
      // Refresh data
      const updatedData = await fetch('/api/teacher/dashboard').then(res => res.json());
      setData(updatedData);
    } catch (error) {
      console.error('Update grade failed:', error);
    }
  };
  const handleUpdateAttendance = async (studentId: string, subjectId: string, status: string) => {
    try {
      await fetch('/api/attendance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, subjectId, status, date: new Date().toISOString() }),
      });
      
      // Refresh data
      const updatedData = await fetch('/api/teacher/dashboard').then(res => res.json());
      setData(updatedData);
    } catch (error) {
      console.error('Update attendance failed:', error);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!data) return <div>Error loading data</div>;  const studentColumns = [
    { accessorKey: "AdmissionNumber", header: "Admission No" },
    { accessorKey: "FirstName", header: "First Name" },
    { accessorKey: "LastName", header: "Last Name" },
    { accessorKey: "Renamedclass.ClassName", header: "Class" },
    { accessorKey: "Gender", header: "Gender" }
  ];  const gradeColumns = [
    { 
      accessorKey: "Student", 
      header: "Student",
      cell: ({ row }: any) => {
        const grade = row.original;
        return `${grade.Student?.FirstName || ''} ${grade.Student?.LastName || ''}`.trim() || grade.StudentID;
      }
    },
    { accessorKey: "subject.SubjectName", header: "Subject" },
    { accessorKey: "Term", header: "Term" },
    { accessorKey: "CA", header: "CA" },
    { accessorKey: "Exam", header: "Exam" },
    { accessorKey: "TotalScore", header: "Total" },
    { accessorKey: "Grade", header: "Grade" }
  ];return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-12 w-12 text-green-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-lg text-gray-600">Welcome back, {data?.user?.name || 'Teacher'}</p>
                {data?.user?.teacherProfile && (
                  <p className="text-sm text-gray-500">
                    Teacher ID: {data.user.teacherProfile.TeacherID}
                  </p>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>            <CardContent>
              <div className="text-2xl font-bold">{(data.subjects || []).length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>            <CardContent>
              <div className="text-2xl font-bold">{(data.students || []).length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Grades Recorded</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>            <CardContent>
              <div className="text-2xl font-bold">{(data.grades || []).length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Records</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>            <CardContent>
              <div className="text-2xl font-bold">{(data.attendance || []).length}</div>
            </CardContent>
          </Card>
        </div>        {/* Navigation Tabs */}
        <div className="flex space-x-4">
          {['students', 'grades', 'attendance', 'add-student'].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              onClick={() => setActiveTab(tab)}
              className={`capitalize transition-all duration-200 active:scale-95 ${
                activeTab === tab 
                  ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg" 
                  : "border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 hover:text-green-800"
              }`}
            >
              {tab.replace('-', ' ')}
            </Button>
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'students' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                My Students
              </CardTitle>
            </CardHeader>            <CardContent>
              <DataTable 
                columns={studentColumns} 
                data={data?.students || []}
                searchPlaceholder="Search students..."
                searchColumn="FirstName"
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 'grades' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit className="mr-2 h-5 w-5" />
                Manage Grades
              </CardTitle>
            </CardHeader>            <CardContent>
              <DataTable 
                columns={gradeColumns} 
                data={data?.grades || []}
                searchPlaceholder="Search grades..."
                searchColumn="Student.FirstName"
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 'attendance' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Manage Attendance
              </CardTitle>
            </CardHeader>            <CardContent>
              <div className="space-y-4">
                {(data?.students || []).map((student: any) => (
                  <div key={student.AdmissionNumber} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{student.FirstName} {student.LastName}</h3>
                      <p className="text-sm text-gray-600">{student.AdmissionNumber}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdateAttendance(student.AdmissionNumber, (data?.subjects || [])[0]?.SubjectID, 'Present')}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                      >
                        Present
                      </Button>                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUpdateAttendance(student.AdmissionNumber, (data?.subjects || [])[0]?.SubjectID, 'Absent')}
                        className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 hover:text-red-800 transition-all duration-200 active:scale-95"
                      >
                        Absent
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'add-student' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="mr-2 h-5 w-5" />
                Add New Student
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={newStudentForm.FirstName}
                      onChange={(e) => setNewStudentForm({...newStudentForm, FirstName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={newStudentForm.LastName}
                      onChange={(e) => setNewStudentForm({...newStudentForm, LastName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="admissionNumber">Admission Number</Label>
                    <Input
                      id="admissionNumber"
                      value={newStudentForm.AdmissionNumber}
                      onChange={(e) => setNewStudentForm({...newStudentForm, AdmissionNumber: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={newStudentForm.DateOfBirth}
                      onChange={(e) => setNewStudentForm({...newStudentForm, DateOfBirth: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      value={newStudentForm.Gender}
                      onChange={(e) => setNewStudentForm({...newStudentForm, Gender: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="parentContact">Parent Contact</Label>
                    <Input
                      id="parentContact"
                      value={newStudentForm.ParentContact}
                      onChange={(e) => setNewStudentForm({...newStudentForm, ParentContact: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={newStudentForm.Address}
                      onChange={(e) => setNewStudentForm({...newStudentForm, Address: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentClass">Class</Label>
                    <select
                      id="studentClass"
                      value={newStudentForm.StudentClassID}
                      onChange={(e) => setNewStudentForm({...newStudentForm, StudentClassID: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    >
                      <option value="">Select Class</option>
                      <option value="jss1">JSS1</option>
                      <option value="jss2">JSS2</option>
                      <option value="jss3">JSS3</option>
                      <option value="sss1">SSS1</option>
                      <option value="sss2">SSS2</option>
                      <option value="sss3">SSS3</option>
                    </select>
                  </div>
                </div>                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              </form>
            </CardContent>
          </Card>        )}
      </div>    </div>
  );
}
