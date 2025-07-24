"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, UserPlus, Edit, Trash2, Search, LogOut, ArrowLeft, Home } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { toast } from "sonner";
import { deleteStudent } from '@/app/students/actions';

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

export default function TeacherStudentsPage() {  const [data, setData] = useState<TeacherStudentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const scrollToSection = (sectionId: string)=>{
    const element = document.getElementById(sectionId)
    if (element){
      element.scrollIntoView({behavior: "smooth"})
    }

  }

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
      }    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteStudent(studentToDelete.AdmissionNumber);
      
      if (result.success) {
        toast.success("Student deleted successfully!");
        await fetchStudents(); // Refresh the student list
        setStudentToDelete(null);
      } else {
        toast.error(result.message || "Failed to delete student");
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error("An error occurred while deleting the student");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setStudentToDelete(null);
  };
  const filteredStudents = (data?.students || []).filter(student =>
    `${student.FirstName || ''} ${student.LastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.AdmissionNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const studentColumns = [
    { accessorKey: "AdmissionNumber", header: "Admission No." },
    { accessorKey: "FirstName", header: "First Name" },
    { accessorKey: "LastName", header: "Last Name" },
    { accessorKey: "Gender", header: "Gender" },
    { accessorKey: "ParentContact", header: "Parent Contact" },
    { accessorKey: "Renamedclass.ClassName", header: "Class" },
    {
      id: "actions",
      header: "Actions",      cell: ({ row }: any) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {handleEditStudent(row.original);
              scrollToSection('edit student')
            }}
            className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-800 transition-all duration-200 active:scale-95"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteClick(row.original)}
            className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 hover:text-red-800 transition-all duration-200 active:scale-95"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
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
        <div className="flex items-center gap-4 mb-6">          <Button 
            onClick={() => router.push('/teacher')}
            variant="outline"
            className="flex items-center gap-2 hover:bg-green-50 border-green-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
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
          
          <section id='edit student'>
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
                      className="mt-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={newStudentForm.LastName}
                      onChange={(e) => setNewStudentForm(prev => ({...prev, LastName: e.target.value}))}
                      className="mt-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                      className="mt-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>                <div>
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      className="w-full p-2 border rounded-md mt-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                      className="w-full p-2 border rounded-md mt-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                      className="mt-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={newStudentForm.Address}
                      onChange={(e) => setNewStudentForm(prev => ({...prev, Address: e.target.value}))}
                      className="mt-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
          </section>
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
          </CardContent>        </Card>
      </div>      {/* Enhanced Delete Confirmation Dialog with Glassmorphism */}
      <Dialog open={!!studentToDelete} onOpenChange={(open) => !open && handleCancelDelete()}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden">
          {/* Gradient Background Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/80 via-orange-50/60 to-pink-50/80 backdrop-blur-sm" />
          
          {/* Content Container */}
          <div className="relative z-10 p-6">
            <DialogHeader className="space-y-6 text-center">
              {/* Warning Icon with Animation */}
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center shadow-lg border border-red-200/50">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                  <svg 
                    className="w-6 h-6 text-white" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2.5" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              
              <div className="space-y-3">
                <DialogTitle className="text-2xl font-bold text-gray-800 tracking-tight">
                  Confirm Deletion
                </DialogTitle>
                <DialogDescription className="text-lg text-gray-600 leading-relaxed max-w-md mx-auto">
                  You are about to permanently delete student{' '}
                  <span className="font-semibold text-gray-800 bg-gradient-to-r from-blue-100 to-indigo-100 px-2 py-1 rounded-lg border border-blue-200/50">
                    {studentToDelete?.FirstName} {studentToDelete?.LastName}
                  </span>
                </DialogDescription>
                
                {/* Student Details Card */}
                <div className="mt-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 shadow-inner">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <span className="font-medium">Admission Number:</span>
                    <span className="font-mono bg-gray-100/80 px-2 py-1 rounded-md">
                      {studentToDelete?.AdmissionNumber}
                    </span>
                  </div>
                </div>
                
                {/* Warning Message */}
                <div className="mt-4 p-3 bg-red-50/80 backdrop-blur-sm rounded-lg border border-red-200/50">
                  <p className="text-sm text-red-700 font-medium flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>This action cannot be undone</span>
                  </p>
                </div>
              </div>
            </DialogHeader>
            
            <DialogFooter className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-center">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="w-full sm:w-auto px-8 py-3 bg-white/80 backdrop-blur-sm hover:bg-white/90 border-gray-300/50 text-gray-700 hover:text-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
              >
                {isDeleting ? (
                  <>
                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Student
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
