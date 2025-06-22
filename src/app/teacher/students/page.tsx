"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Edit, Trash2, Search, LogOut, ArrowLeft, Home } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';

type Student = {
  AdmissionNumber: string;
  FirstName: string;
  LastName: string;
  DateOfBirth: string;
  Gender: string;
  ParentContact: string;
  Address: string;
  Class?: {
    ClassName: string;
  };
};

type TeacherStudentsData = {
  students: Student[];
  classes: any[];
};

export default function TeacherStudentsPage() {
  const [data, setData] = useState<TeacherStudentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [newStudentForm, setNewStudentForm] = useState({
    FirstName: '',
    LastName: '',
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
      router.push('/login');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudentForm),
      });

      if (response.ok) {
        await fetchStudents();
        setShowAddForm(false);
        setNewStudentForm({
          FirstName: '',
          LastName: '',
          DateOfBirth: '',
          Gender: '',
          ParentContact: '',
          Address: '',
          StudentClassID: ''
        });
      }
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const handleEditStudent = async (student: Student) => {
    setEditingStudent(student);
    setNewStudentForm({
      FirstName: student.FirstName,
      LastName: student.LastName,
      DateOfBirth: student.DateOfBirth.split('T')[0], // Format for date input
      Gender: student.Gender,
      ParentContact: student.ParentContact,
      Address: student.Address,
      StudentClassID: ''
    });
    setShowAddForm(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {      const response = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admissionNumber: editingStudent.AdmissionNumber,
          ...newStudentForm
        }),
      });

      if (response.ok) {
        await fetchStudents();
        setShowAddForm(false);
        setEditingStudent(null);
        setNewStudentForm({
          FirstName: '',
          LastName: '',
          DateOfBirth: '',
          Gender: '',
          ParentContact: '',
          Address: '',
          StudentClassID: ''
        });
      }
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  const filteredStudents = (data?.students || []).filter(student =>
    `${student.FirstName} ${student.LastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.AdmissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const studentColumns = [
    { accessorKey: "AdmissionNumber", header: "Admission No." },
    { accessorKey: "FirstName", header: "First Name" },
    { accessorKey: "LastName", header: "Last Name" },
    { accessorKey: "Gender", header: "Gender" },
    { accessorKey: "ParentContact", header: "Parent Contact" },
    { accessorKey: "Class.ClassName", header: "Class" },
    {
      id: "actions",
      header: "Actions",      cell: ({ row }: any) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditStudent(row.original)}
            className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-800 transition-all duration-200 active:scale-95"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            onClick={() => router.push('/teacher')}
            variant="outline"
            className="flex items-center gap-2 hover:bg-green-50 border-green-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button 
            onClick={() => router.push('/teacher')}
            variant="ghost"
            className="flex items-center gap-2 text-green-700 hover:bg-green-50"
          >
            <Home className="h-4 w-4" />
            Teacher Home
          </Button>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Users className="h-12 w-12 text-green-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
                <p className="text-lg text-gray-600">Manage your students</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Student
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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(data?.students || []).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(data?.classes || []).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(data?.students || []).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Student Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingStudent ? handleUpdateStudent : handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newStudentForm.FirstName}
                    onChange={(e) => setNewStudentForm(prev => ({...prev, FirstName: e.target.value}))}
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newStudentForm.LastName}
                    onChange={(e) => setNewStudentForm(prev => ({...prev, LastName: e.target.value}))}
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={newStudentForm.DateOfBirth}
                    onChange={(e) => setNewStudentForm(prev => ({...prev, DateOfBirth: e.target.value}))}
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div><div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={newStudentForm.Gender}
                    onChange={(e) => setNewStudentForm(prev => ({...prev, Gender: e.target.value}))}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="studentClass">Class</Label>
                  <select
                    id="studentClass"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={newStudentForm.StudentClassID}
                    onChange={(e) => setNewStudentForm(prev => ({...prev, StudentClassID: e.target.value}))}
                    required
                  >
                    <option value="">Select Class</option>
                    {(data?.classes || []).map((cls: any) => (
                      <option key={cls.ClassID} value={cls.ClassID}>
                        {cls.ClassName}
                      </option>
                    ))}
                  </select>
                </div>                <div>
                  <Label htmlFor="parentContact">Parent Contact</Label>
                  <Input
                    id="parentContact"
                    value={newStudentForm.ParentContact}
                    onChange={(e) => setNewStudentForm(prev => ({...prev, ParentContact: e.target.value}))}
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newStudentForm.Address}
                    onChange={(e) => setNewStudentForm(prev => ({...prev, Address: e.target.value}))}
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div><div className="md:col-span-2 flex space-x-2">
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                  >
                    {editingStudent ? 'Update Student' : 'Add Student'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingStudent(null);
                    }}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 transition-all duration-200 active:scale-95"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Students</CardTitle>
          </CardHeader>          <CardContent>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or admission number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>Students List</CardTitle>
          </CardHeader>          <CardContent>
            <DataTable 
              columns={studentColumns} 
              data={filteredStudents} 
              searchPlaceholder="Search students by name..."
              searchColumn="FirstName"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
