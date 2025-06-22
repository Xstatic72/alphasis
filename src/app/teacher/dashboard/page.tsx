"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Users, Calendar, ClipboardCheck } from 'lucide-react';
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
  const router = useRouter();

  useEffect(() => {
    fetch('/api/teacher/dashboard')
      .then(res => {
        if (!res.ok) router.push('/login');
        return res.json();
      })
      .then(setData)
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!data) return <div>Error loading data</div>;

  const subjectColumns = [
    { accessorKey: "SubjectName", header: "Subject" },
    { accessorKey: "ClassLevel", header: "Class Level" }
  ];

  const studentColumns = [
    { accessorKey: "FirstName", header: "First Name" },
    { accessorKey: "LastName", header: "Last Name" },
    { accessorKey: "AdmissionNumber", header: "Admission No." },
    { accessorKey: "Class.ClassName", header: "Class" }
  ];

  const gradeColumns = [
    { accessorKey: "Student.FirstName", header: "Student" },
    { accessorKey: "Subject.SubjectName", header: "Subject" },
    { accessorKey: "Term", header: "Term" },
    { accessorKey: "CA", header: "CA" },
    { accessorKey: "Exam", header: "Exam" },
    { accessorKey: "TotalScore", header: "Total" },
    { accessorKey: "Grade", header: "Grade" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-4">
            <ClipboardCheck className="h-12 w-12 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="text-lg text-gray-600">Welcome back, {data.user.name}</p>
              {data.user.teacherProfile && (
                <p className="text-sm text-gray-500">
                  Teacher ID: {data.user.teacherProfile.TeacherID}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">My Subjects</h3>
                <p className="text-2xl font-bold text-blue-600">{data.subjects.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold">Students</h3>
                <p className="text-2xl font-bold text-green-600">{data.students.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold">Grades Recorded</h3>
                <p className="text-2xl font-bold text-purple-600">{data.grades.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Subjects */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <BookOpen className="mr-3 h-6 w-6" />
            My Subjects
          </h2>
          <DataTable 
            columns={subjectColumns} 
            data={data.subjects} 
            searchPlaceholder="Search subjects..."
            searchColumn="SubjectName"
          />
        </div>

        {/* My Students */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Users className="mr-3 h-6 w-6" />
            My Students
          </h2>
          <DataTable 
            columns={studentColumns} 
            data={data.students} 
            searchPlaceholder="Search students..."
            searchColumn="FirstName"
          />
        </div>

        {/* Recent Grades */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <ClipboardCheck className="mr-3 h-6 w-6" />
            Recent Grades
          </h2>
          <DataTable 
            columns={gradeColumns} 
            data={data.grades} 
            searchPlaceholder="Search grades..."
          />
        </div>
      </div>
    </div>
  );
}
