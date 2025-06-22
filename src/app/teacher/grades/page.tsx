"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, Plus, Edit, Search } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';

type Grade = {
  GradeID: string;
  StudentID: string;
  SubjectID: string;
  Term: string;
  TotalScore: number;
  Grade: string;
  Student: {
    FirstName: string;
    LastName: string;
    AdmissionNumber: string;
  };
  Subject: {
    SubjectName: string;
  };
};

type GradesData = {
  grades: Grade[];
  students: any[];
  subjects: any[];
};

export default function TeacherGradesPage() {
  const [data, setData] = useState<GradesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('1st Term');
  const [newGradeForm, setNewGradeForm] = useState({
    StudentID: '',
    SubjectID: '',
    Term: '1st Term',
    TotalScore: '',
    Grade: ''
  });

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await fetch('/api/grades');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C+';
    if (score >= 40) return 'C';
    if (score >= 30) return 'D+';
    if (score >= 20) return 'D';
    return 'F';
  };

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    const score = parseInt(newGradeForm.TotalScore);
    const grade = calculateGrade(score);

    try {
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newGradeForm,
          TotalScore: score,
          Grade: grade
        }),
      });

      if (response.ok) {
        await fetchGrades();
        setShowAddForm(false);
        setNewGradeForm({
          StudentID: '',
          SubjectID: '',
          Term: '1st Term',
          TotalScore: '',
          Grade: ''
        });
      }
    } catch (error) {
      console.error('Error adding grade:', error);
    }
  };

  const handleEditGrade = (grade: Grade) => {
    setEditingGrade(grade);
    setNewGradeForm({
      StudentID: grade.StudentID,
      SubjectID: grade.SubjectID,
      Term: grade.Term,
      TotalScore: grade.TotalScore.toString(),
      Grade: grade.Grade
    });
    setShowAddForm(true);
  };

  const handleUpdateGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrade) return;

    const score = parseInt(newGradeForm.TotalScore);
    const grade = calculateGrade(score);

    try {
      const response = await fetch('/api/grades', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeId: editingGrade.GradeID,
          TotalScore: score,
          Grade: grade,
          Term: newGradeForm.Term
        }),
      });

      if (response.ok) {
        await fetchGrades();
        setShowAddForm(false);
        setEditingGrade(null);
        setNewGradeForm({
          StudentID: '',
          SubjectID: '',
          Term: '1st Term',
          TotalScore: '',
          Grade: ''
        });
      }
    } catch (error) {
      console.error('Error updating grade:', error);
    }
  };

  const filteredGrades = (data?.grades || []).filter(grade => {
    const matchesSearch = `${grade.Student.FirstName} ${grade.Student.LastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.Student.AdmissionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !selectedSubject || grade.SubjectID === selectedSubject;
    const matchesTerm = grade.Term === selectedTerm;
    
    return matchesSearch && matchesSubject && matchesTerm;
  });

  const gradeColumns = [
    { accessorKey: "Student.AdmissionNumber", header: "Admission No." },
    { 
      accessorKey: "Student.FirstName", 
      header: "Student Name",
      cell: ({ row }: any) => `${row.original.Student.FirstName} ${row.original.Student.LastName}`
    },
    { accessorKey: "Subject.SubjectName", header: "Subject" },
    { accessorKey: "Term", header: "Term" },
    { accessorKey: "TotalScore", header: "Score" },
    { 
      accessorKey: "Grade", 
      header: "Grade",
      cell: ({ row }: any) => (
        <Badge variant={row.original.Grade === 'F' ? 'destructive' : 'default'}>
          {row.original.Grade}
        </Badge>
      )
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditGrade(row.original)}
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
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ClipboardCheck className="h-12 w-12 text-green-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Grades Management</h1>
                <p className="text-lg text-gray-600">Manage student grades and assessments</p>
              </div>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Grade
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(data?.grades || []).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(data?.grades || []).length > 0 
                  ? Math.round((data?.grades || []).reduce((sum, grade) => sum + grade.TotalScore, 0) / (data?.grades || []).length)
                  : 0
                }
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">A Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(data?.grades || []).filter(g => g.Grade.startsWith('A')).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(data?.grades || []).filter(g => g.Grade === 'F').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Grade Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingGrade ? 'Edit Grade' : 'Add New Grade'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingGrade ? handleUpdateGrade : handleAddGrade} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!editingGrade && (
                  <>
                    <div>
                      <Label htmlFor="student">Student</Label>
                      <select
                        id="student"
                        className="w-full p-2 border rounded-md"
                        value={newGradeForm.StudentID}
                        onChange={(e) => setNewGradeForm(prev => ({...prev, StudentID: e.target.value}))}
                        required
                      >
                        <option value="">Select Student</option>
                        {(data?.students || []).map((student: any) => (
                          <option key={student.AdmissionNumber} value={student.AdmissionNumber}>
                            {student.FirstName} {student.LastName} ({student.AdmissionNumber})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <select
                        id="subject"
                        className="w-full p-2 border rounded-md"
                        value={newGradeForm.SubjectID}
                        onChange={(e) => setNewGradeForm(prev => ({...prev, SubjectID: e.target.value}))}
                        required
                      >
                        <option value="">Select Subject</option>
                        {(data?.subjects || []).map((subject: any) => (
                          <option key={subject.SubjectID} value={subject.SubjectID}>
                            {subject.SubjectName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                <div>
                  <Label htmlFor="term">Term</Label>
                  <select
                    id="term"
                    className="w-full p-2 border rounded-md"
                    value={newGradeForm.Term}
                    onChange={(e) => setNewGradeForm(prev => ({...prev, Term: e.target.value}))}
                    required
                  >
                    <option value="1st Term">1st Term</option>
                    <option value="2nd Term">2nd Term</option>
                    <option value="3rd Term">3rd Term</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="score">Total Score (0-100)</Label>
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    max="100"
                    value={newGradeForm.TotalScore}
                    onChange={(e) => setNewGradeForm(prev => ({...prev, TotalScore: e.target.value}))}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Grade: {newGradeForm.TotalScore ? calculateGrade(parseInt(newGradeForm.TotalScore)) : '-'}
                  </p>
                </div>
                <div className="md:col-span-2 flex space-x-2">
                  <Button type="submit">
                    {editingGrade ? 'Update Grade' : 'Add Grade'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingGrade(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
              <div>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">All Subjects</option>
                  {(data?.subjects || []).map((subject: any) => (
                    <option key={subject.SubjectID} value={subject.SubjectID}>
                      {subject.SubjectName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                >
                  <option value="1st Term">1st Term</option>
                  <option value="2nd Term">2nd Term</option>
                  <option value="3rd Term">3rd Term</option>
                </select>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSubject('');
                  setSelectedTerm('1st Term');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Grades Table */}
        <Card>
          <CardHeader>
            <CardTitle>Grades List</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={gradeColumns} data={filteredGrades} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
