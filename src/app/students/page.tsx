import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { AddStudentDialog } from "./add-student-dialog";
import { Users } from "lucide-react";

type PrismaStudent = {
  AdmissionNumber: string;
  FirstName: string;
  LastName: string;
  DateOfBirth: Date;
  Gender: string;
  ParentContact: string;
  Address: string;
  StudentClassID: string;
}

type FormattedStudent = {
  AdmissionNumber: string;
  FirstName: string;
  LastName: string;
  DateOfBirth: string;
  Gender: string;
  ParentContact: string;
  Address: string;
  StudentClassID: string;
}

export default async function StudentsPage() {
  const studentsData = await prisma.student.findMany();
    // Convert Date objects to strings for the DataTable
  const students: FormattedStudent[] = studentsData.map((student: PrismaStudent) => ({
    ...student,
    DateOfBirth: student.DateOfBirth.toISOString().split('T')[0], // Format as YYYY-MM-DD
  }));

  return (
    <div className="min-h-full bg-main-gradient">
      <div className="page-container animate-slide-in-up">
        {/* Page Header with enhanced styling */}
        <div className="section-header">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">              <div className="icon-container animate-float shadow-aerospace-enhanced">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-gradient-enhanced">
                  Students
                </h1>
                <p className="text-gray-600 mt-1 text-lg">
                  Manage student information and records
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-aerospace-orange animate-pulse-glow"></div>
                  <span className="text-sm text-gray-500">{students.length} students enrolled</span>
                </div>
              </div>
            </div>
            <AddStudentDialog />
          </div>
        </div>

        {/* Enhanced Data Table Card */}
        <div className="content-card hover-lift">
          <div className="data-table-container">
            <DataTable 
              columns={columns} 
              data={students} 
              searchPlaceholder="Search students by name..."
              searchColumn="FirstName"
            />
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card-modern hover-lift p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-aerospace-orange to-gamboge rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gradient-primary">{students.length}</p>
              </div>
            </div>
          </div>
          
          <div className="card-modern hover-lift p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-apple-green to-amber rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Male Students</p>                <p className="text-2xl font-bold text-gradient-secondary">
                  {students.filter((student) => student.Gender === 'Male').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card-modern hover-lift p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-gamboge to-aerospace-orange rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Female Students</p>                <p className="text-2xl font-bold gradient-text">
                  {students.filter((student) => student.Gender === 'Female').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
