import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { AddClassDialog } from "./add-class-dialog";
import { GraduationCap } from "lucide-react";

type SchoolClass = {
  ClassID: string;
  ClassName: string;
}

export default async function ClassesPage() {
  const classes: SchoolClass[] = await prisma.class.findMany();

  return (
    <div className="min-h-full bg-main-gradient">
      <div className="page-container animate-slide-in-up">
        {/* Page Header with enhanced styling */}
        <div className="section-header">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="icon-container animate-float shadow-apple">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold gradient-text">
                  Classes
                </h1>
                <p className="text-gray-600 mt-1 text-lg">
                  Organize students by grade levels and sections
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-apple-green animate-pulse-glow"></div>
                  <span className="text-sm text-gray-500">{classes.length} classes organized</span>
                </div>
              </div>
            </div>
            <AddClassDialog />
          </div>
        </div>

        {/* Enhanced Data Table Card */}
        <div className="content-card hover-lift">
          <div className="data-table-container">            
            <DataTable 
              columns={columns} 
              data={classes} 
              searchPlaceholder="Search classes by name..."
              searchColumn="ClassName"
            />
          </div>
        </div>        {/* Additional Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card-modern hover-lift p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-apple-green to-amber rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-gradient-secondary">{classes.length}</p>
              </div>
            </div>
          </div>
          
          <div className="card-modern hover-lift p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-aerospace-orange to-gamboge rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Classes</p>
                <p className="text-2xl font-bold text-gradient-primary">{classes.length}</p>
              </div>
            </div>
          </div>
          
          <div className="card-modern hover-lift p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-gamboge to-amber rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Class Names</p>
                <p className="text-2xl font-bold gradient-text">
                  {new Set(classes.map((schoolClass) => schoolClass.ClassName.charAt(0))).size}+
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
