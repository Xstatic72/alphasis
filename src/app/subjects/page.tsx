import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table-fixed";
import { columns } from "./columns";
import { AddSubjectDialog } from "./add-subject-dialog";
import { BookOpen, Users, GraduationCap, TrendingUp, Sparkles, ChevronRight } from "lucide-react";

type Subject = {
  SubjectID: string;
  SubjectName: string;
  ClassLevel: string;
  TeacherID: string;
}

export default async function SubjectsPage() {
  const subjects: Subject[] = await prisma.subject.findMany();
  const uniqueClassLevels = new Set(subjects.map((subject) => subject.ClassLevel)).size;
  const uniqueTeachers = new Set(subjects.map((subject) => subject.TeacherID)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-200/20 to-amber-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-green-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Enhanced Page Header */}
        <div className="relative">
          <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-300">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                    Subjects
                  </h1>
                  <p className="text-lg text-gray-600 font-medium">
                    Manage academic subjects and curriculum
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 animate-pulse"></div>
                      <span className="text-sm text-gray-500 font-medium">{subjects.length} active subjects</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 animate-pulse"></div>
                      <span className="text-sm text-gray-500 font-medium">{uniqueClassLevels} class levels</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <AddSubjectDialog />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Subjects</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    {subjects.length}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
                    <TrendingUp className="h-4 w-4" />
                    <span>Active</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-7 w-7 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Class Levels</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {uniqueClassLevels}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-blue-600 font-medium">
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
