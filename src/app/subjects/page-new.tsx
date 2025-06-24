import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { AddSubjectDialog } from "./add-subject-dialog";
import { BookOpen, Users, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Subject = {
  SubjectID: string;
  SubjectName: string;
  ClassLevel: string;
  TeacherID: string | null;
}

export default async function SubjectsPage() {
  const subjects: Subject[] = await prisma.subject.findMany({
    orderBy: { SubjectName: 'asc' }
  });
  const uniqueClassLevels = new Set(subjects.map((subject) => subject.ClassLevel)).size;
  const uniqueTeachers = new Set(subjects.map((subject) => subject.TeacherID).filter(id => id !== null)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-12 w-12 text-orange-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Subjects Management</h1>
                <p className="text-lg text-gray-600">Manage academic subjects and curriculum</p>
                <p className="text-sm text-gray-500">{subjects.length} active subjects</p>
              </div>
            </div>
            <AddSubjectDialog />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subjects.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Class Levels</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueClassLevels}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueTeachers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Subjects Table */}
        <Card>
          <CardHeader>
            <CardTitle>Subjects List</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={subjects} 
              searchPlaceholder="Search subjects by name..."
              searchColumn="SubjectName"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
