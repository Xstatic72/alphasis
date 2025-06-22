import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { AddTeacherDialog } from "./add-teacher-dialog";
import { UserCheck, Users, BookOpen, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Teacher = {
  TeacherID: string;
  FirstName?: string;
  LastName?: string;
  PhoneNum: string;
  Email: string;
}

export default async function TeachersPage() {
  // Get all teachers
  const teachersData = await prisma.teacher.findMany({
    orderBy: { TeacherID: 'asc' }
  });

  // Get teacher names from person table
  const teachersWithNames = await Promise.all(
    teachersData.map(async (teacher) => {
      try {
        const person = await prisma.$queryRaw`
          SELECT FirstName, LastName FROM person WHERE PersonID = ${teacher.TeacherID}
        ` as any[];
        
        return {
          ...teacher,
          FirstName: person[0]?.FirstName || '',
          LastName: person[0]?.LastName || ''
        };
      } catch (error) {
        return {
          ...teacher,
          FirstName: '',
          LastName: ''
        };
      }
    })
  );

  // Get subjects count per teacher
  const subjects = await prisma.subject.findMany();
  const subjectsPerTeacher = subjects.reduce((acc: Record<string, number>, subject) => {
    acc[subject.TeacherID] = (acc[subject.TeacherID] || 0) + 1;
    return acc;
  }, {});

  const teachers: Teacher[] = teachersWithNames;

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
          </CardHeader>
          <CardContent>
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
              searchPlaceholder="Search teachers by name..."
              searchColumn="FirstName"
            />
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card-modern hover-lift p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-aerospace-orange to-gamboge rounded-lg">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Teachers</p>
                <p className="text-2xl font-bold text-gradient-primary">{teachers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="card-modern hover-lift p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-apple-green to-amber rounded-lg">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Teachers</p>
                <p className="text-2xl font-bold text-gradient-secondary">{teachers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="card-modern hover-lift p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-gamboge to-aerospace-orange rounded-lg">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <div>                <p className="text-sm text-gray-600">Email Contacts</p>
                <p className="text-2xl font-bold gradient-text">
                  {teachers.filter((teacher) => teacher.Email).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
