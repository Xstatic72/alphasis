import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { AddTeacherDialog } from "./add-teacher-dialog";
import { UserCheck, Users, BookOpen, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { teacher } from '@prisma/client';

// Define a type that includes the person relation
type TeacherWithPerson = teacher & {
  person: {
    FirstName: string;
    LastName: string;
  };
}

export default async function TeachersPage() {
  // Get all teachers with person relation
  const teachers: TeacherWithPerson[] = await prisma.teacher.findMany({
    include: {
      person: true
    },
    orderBy: { TeacherID: 'asc' }
  });// Get subjects count per teacher
  const subjects = await prisma.subject.findMany();
  const subjectsPerTeacher = subjects.reduce((acc: Record<string, number>, subject) => {
    if (subject.TeacherID) {
      acc[subject.TeacherID] = (acc[subject.TeacherID] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <UserCheck className="h-12 w-12 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Teachers Management</h1>
                <p className="text-lg text-gray-600">Manage faculty and teaching staff</p>
                <p className="text-sm text-gray-500">{teachers.length} faculty members</p>
              </div>
            </div>
            <AddTeacherDialog />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subjects Taught</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subjects.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Teachers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Teachers List</CardTitle>
          </CardHeader>          <CardContent>
            <DataTable 
              columns={columns} 
              data={teachers} 
              searchPlaceholder="Search teachers by name..."
              searchColumn="FirstName"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
