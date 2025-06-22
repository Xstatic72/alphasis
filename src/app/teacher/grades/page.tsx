"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { 
  ClipboardCheck, 
  Plus, 
  Edit, 
  Search, 
  LogOut,
  GraduationCap,
  TrendingUp,
  BarChart3,
  Award,
  ArrowLeft,
  Home
} from 'lucide-react';

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
  const [showAddForm, setShowAddForm] = useState(false);  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('1st Term');
  const router = useRouter();
  const [newGradeForm, setNewGradeForm] = useState({
    StudentID: '',
    SubjectID: '',
    Term: '1st Term',
    TotalScore: '',
    Grade: ''
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
    const matchesSubject = !selectedSubject || grade.SubjectID === selectedSubject;
    const matchesTerm = grade.Term === selectedTerm;
    
    return matchesSubject && matchesTerm;
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
        {/* Navigation Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            onClick={() => router.push('/teacher')}
            variant="outline"
            className="flex items-center gap-2 hover:bg-green-50 border-green-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Main Dashboard
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
        </div>        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Grades</CardTitle>
              <BarChart3 className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(data?.grades || []).length}</div>
              <p className="text-xs text-blue-100">Total recorded grades</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(data?.grades || []).length > 0 
                  ? Math.round((data?.grades || []).reduce((sum, grade) => sum + grade.TotalScore, 0) / (data?.grades || []).length)
                  : 0
                }
              </div>
              <p className="text-xs text-green-100">Class average</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">A Grades</CardTitle>
              <Award className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(data?.grades || []).filter(g => g.Grade.startsWith('A')).length}
              </div>
              <p className="text-xs text-purple-100">Excellent performance</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <GraduationCap className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(data?.grades || []).filter(g => g.Grade === 'F').length}
              </div>
              <p className="text-xs text-red-100">Need improvement</p>
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
        )}        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Filter Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="subject-filter" className="text-sm font-medium text-gray-700">Subject</Label>
                <select
                  id="subject-filter"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                <Label htmlFor="term-filter" className="text-sm font-medium text-gray-700">Term</Label>
                <select
                  id="term-filter"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                >
                  <option value="1st Term">1st Term</option>
                  <option value="2nd Term">2nd Term</option>
                  <option value="3rd Term">3rd Term</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="w-full bg-gray-50 hover:bg-gray-100"
                  onClick={() => {
                    setSelectedSubject('');
                    setSelectedTerm('1st Term');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grades Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Grades List</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={gradeColumns} 
              data={filteredGrades} 
              searchColumn="Student.FirstName"
              searchPlaceholder="Search by student name..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
