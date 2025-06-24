"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Edit, Users, ArrowLeft, Home } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { useRouter } from 'next/navigation';

type Subject = {
  SubjectID: string;
  SubjectName: string;
  ClassLevel: string;
  teacher: {
    FirstName: string;
    LastName: string;
  } | null;
};

type TeacherSubjectsData = {
  subjects: Subject[];
  allSubjects: Subject[];
};

export default function TeacherSubjectsPage() {
  const router = useRouter();
  const [data, setData] = useState<TeacherSubjectsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [newSubjectForm, setNewSubjectForm] = useState({
    SubjectName: '',
    ClassLevel: ''
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubjectForm),
      });

      if (response.ok) {
        await fetchSubjects();
        setShowAddForm(false);
        setNewSubjectForm({
          SubjectName: '',
          ClassLevel: ''
        });
      }
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setNewSubjectForm({
      SubjectName: subject.SubjectName,
      ClassLevel: subject.ClassLevel
    });
    setShowAddForm(true);
  };
  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    try {
      const response = await fetch('/api/subjects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: editingSubject.SubjectID,
          ...newSubjectForm
        }),
      });

      if (response.ok) {
        await fetchSubjects();
        setShowAddForm(false);
        setEditingSubject(null);
        setNewSubjectForm({
          SubjectName: '',
          ClassLevel: ''
        });
      }
    } catch (error) {
      console.error('Error updating subject:', error);
    }
  };

  const subjectColumns = [
    { accessorKey: "SubjectName", header: "Subject Name" },
    { accessorKey: "ClassLevel", header: "Class Level" },
    { accessorKey: "Teacher.FirstName", header: "Teacher" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditSubject(row.original)}
          >
            <Edit className="h-3 w-3" />
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
            <ArrowLeft className="h-4 w-4" />            Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-12 w-12 text-green-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Subjects Management</h1>
                <p className="text-lg text-gray-600">Manage your subjects and curriculum</p>
              </div>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </div>
        </div>        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Subjects</CardTitle>
              <BookOpen className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(data?.subjects || []).length}</div>
              <p className="text-xs text-blue-100">Subjects I teach</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(data?.allSubjects || []).length}</div>
              <p className="text-xs text-green-100">School-wide subjects</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Class Levels</CardTitle>
              <Edit className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set((data?.subjects || []).map(s => s.ClassLevel)).size}
              </div>
              <p className="text-xs text-purple-100">Levels taught</p>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Subject Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </CardTitle>
            </CardHeader>
            <CardContent>              <form onSubmit={editingSubject ? handleUpdateSubject : handleAddSubject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subjectName">Subject Name</Label>
                  <Input
                    id="subjectName"
                    value={newSubjectForm.SubjectName}
                    onChange={(e) => setNewSubjectForm(prev => ({...prev, SubjectName: e.target.value}))}
                    className="mt-3"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="classLevel">Class Level</Label>
                  <select
                    id="classLevel"
                    className="w-full p-2 border rounded-md mt-3"
                    value={newSubjectForm.ClassLevel}
                    onChange={(e) => setNewSubjectForm(prev => ({...prev, ClassLevel: e.target.value}))}
                    required
                  >
                    <option value="">Select Class Level</option>
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex space-x-2">
                  <Button type="submit">
                    {editingSubject ? 'Update Subject' : 'Add Subject'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingSubject(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}        {/* My Subjects */}
        <Card className="bg-white rounded-xl shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-gray-900">My Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={subjectColumns} 
              data={data?.subjects || []} 
              searchColumn="SubjectName"
              searchPlaceholder="Search subjects..."
            />
          </CardContent>
        </Card>        {/* All Subjects (Read-only) */}
        <Card className="bg-white rounded-xl shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-gray-900">All School Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(data?.allSubjects || []).map((subject) => (
                <div key={subject.SubjectID} className="border border-gray-200 rounded-lg p-4 space-y-2 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg text-gray-900">{subject.SubjectName}</h3>
                  <p className="text-sm text-gray-600">Level: {subject.ClassLevel}</p>                  <p className="text-sm text-gray-500">
                    Teacher: {subject.teacher ? `${subject.teacher.FirstName} ${subject.teacher.LastName}` : 'Not assigned'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
