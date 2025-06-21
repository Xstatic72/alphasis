import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { AddTeacherDialog } from "./add-teacher-dialog";
import { UserCheck } from "lucide-react";

type Teacher = {
  TeacherID: string;
  FirstName: string;
  LastName: string;
  PhoneNum: string;
  Email: string;
}

export default async function TeachersPage() {
  const teachers: Teacher[] = await prisma.teacher.findMany();

  return (
    <div className="min-h-full bg-main-gradient">
      <div className="page-container animate-slide-in-up">
        {/* Page Header with enhanced styling */}
        <div className="section-header">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="icon-container animate-float shadow-aerospace">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold gradient-text">
                  Teachers
                </h1>
                <p className="text-gray-600 mt-1 text-lg">
                  Manage faculty and teaching staff
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-apple-green animate-pulse-glow"></div>
                  <span className="text-sm text-gray-500">{teachers.length} faculty members</span>
                </div>
              </div>
            </div>
            <AddTeacherDialog />
          </div>
        </div>

        {/* Enhanced Data Table Card */}
        <div className="content-card hover-lift">
          <div className="data-table-container">            
            <DataTable 
              columns={columns} 
              data={teachers} 
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
