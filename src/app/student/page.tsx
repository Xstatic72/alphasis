"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, User, Calendar, Plus, CheckCircle, LogOut } from 'lucide-react';

type Subject = {
  SubjectID: string;
  SubjectName: string;
  ClassLevel: string;
  Teacher: {
    FirstName: string;
    LastName: string;
  };
};

type StudentData = {
  user: any;
  registeredSubjects: any[];
  availableSubjects: Subject[];
  grades: any[];
  attendance: any[];
};

export default function StudentDashboard() {
  const [data, setData] = useState<StudentData | null>(null);
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
    fetch('/api/student/dashboard')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);
  const handleRegisterSubject = async (subjectId: string) => {
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
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }  };
  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!data) return <div>Error loading data</div>;
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <User className="h-12 w-12 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-lg text-gray-600">Welcome back, {data?.user?.name || 'Student'}</p>
                {data?.user?.studentProfile && (
                  <p className="text-sm text-gray-500">
                    Admission Number: {data.user.studentProfile.AdmissionNumber} |
                    Class: {data.user.studentProfile.Class?.ClassName}
                  </p>
                )}              </div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registered Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>            <CardContent>
              <div className="text-2xl font-bold">{(data.registeredSubjects || []).length}</div>
              <p className="text-xs text-muted-foreground">This term</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>            <CardContent>
              <div className="text-2xl font-bold">
                {(data.grades || []).length > 0 
                  ? ((data.grades || []).reduce((sum: number, grade: any) => sum + grade.TotalScore, 0) / (data.grades || []).length).toFixed(1)
                  : 'N/A'
                }
              </div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>            <CardContent>
              <div className="text-2xl font-bold">
                {(data.attendance || []).length > 0 
                  ? Math.round(((data.attendance || []).filter((a: any) => a.Status === 'Present').length / (data.attendance || []).length) * 100)
                  : 0
                }%
              </div>
              <p className="text-xs text-muted-foreground">This term</p>
            </CardContent>
          </Card>
        </div>

        {/* Course Registration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Course Registration
            </CardTitle>
          </CardHeader>          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(data.availableSubjects || []).map((subject) => {
                const isRegistered = (data.registeredSubjects || []).some(
                  (reg: any) => reg.SubjectID === subject.SubjectID
                );
                
                return (
                  <div key={subject.SubjectID} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{subject.SubjectName}</h3>
                      {isRegistered && <Badge variant="secondary">Registered</Badge>}
                    </div>
                    <p className="text-sm text-gray-600">
                      Teacher: {subject.Teacher.FirstName} {subject.Teacher.LastName}
                    </p>
                    <p className="text-sm text-gray-500">Class Level: {subject.ClassLevel}</p>
                    
                    {!isRegistered && (
                      <Button 
                        onClick={() => handleRegisterSubject(subject.SubjectID)}
                        size="sm" 
                        className="w-full"
                      >
                        Register
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* My Subjects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              My Subjects
            </CardTitle>
          </CardHeader>          <CardContent>
            <div className="space-y-4">
              {(data.registeredSubjects || []).map((registration: any) => (
                <div key={registration.RegistrationID} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{registration.Subject.SubjectName}</h3>
                    <p className="text-sm text-gray-600">
                      Teacher: {registration.Subject.Teacher.FirstName} {registration.Subject.Teacher.LastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge>{registration.Term}</Badge>
                    {(data.grades || []).find((g: any) => g.SubjectID === registration.SubjectID) && (
                      <p className="text-sm font-medium mt-1">
                        Grade: {(data.grades || []).find((g: any) => g.SubjectID === registration.SubjectID)?.Grade}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>        </Card>
      </div>
    </div>
  );
}
