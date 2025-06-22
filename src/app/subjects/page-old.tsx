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
  TeacherID: string;
}

export default async function SubjectsPage() {
  const subjects: Subject[] = await prisma.subject.findMany({
    orderBy: { SubjectName: 'asc' }
  });
  const uniqueClassLevels = new Set(subjects.map((subject) => subject.ClassLevel)).size;
  const uniqueTeachers = new Set(subjects.map((subject) => subject.TeacherID)).size;

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
                    <TrendingUp className="h-4 w-4" />
                    <span>Diverse</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-7 w-7 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Teachers</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {uniqueTeachers}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-purple-600 font-medium">
                    <TrendingUp className="h-4 w-4" />
                    <span>Teaching</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                  <Users className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Data Table */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-200/20 via-white/40 to-slate-200/20 rounded-3xl blur-sm"></div>
          <div className="relative bg-white/90 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Subject Management</h2>
                <p className="text-gray-600">View, edit, and manage all academic subjects in your institution.</p>
              </div>
              <DataTable 
                columns={columns} 
                data={subjects} 
                searchPlaceholder="Search subjects by name, class level, or teacher..."
                searchColumn="SubjectName"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
