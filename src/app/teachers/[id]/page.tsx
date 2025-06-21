import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserCheck, Mail, Phone, BookOpen, GraduationCap } from "lucide-react";

interface SubjectType {
  SubjectID: string;
  SubjectName: string;
  ClassLevel: string;
}

interface TeacherDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TeacherDetailPage({ params }: TeacherDetailPageProps) {
  const { id } = await params;
  
  const teacher = await prisma.teacher.findUnique({
    where: { TeacherID: id },
    include: {
      Subject: true,
    },
  });

  if (!teacher) {
    notFound();
  }
  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/teachers">
            <Button 
              variant="outline" 
              size="sm"
              className="gradient-border hover:shadow-lg transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Teachers
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Teacher Profile Card */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Card */}
            <div className="card-modern border-0 shadow-xl bg-gradient-to-br from-white via-gray-50 to-white overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-aerospace-orange/10 via-transparent to-apple-green/10" />
              <div className="relative p-8">
                <div className="flex items-start space-x-6">
                  <div className="p-4 bg-gradient-to-br from-aerospace-orange to-gamboge rounded-2xl shadow-lg">
                    <UserCheck className="h-10 w-10 text-white" />
                  </div>
                  <div className="flex-1">                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                      {teacher.FirstName} {teacher.LastName}
                    </h1>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <GraduationCap className="h-4 w-4" />
                      <span className="font-medium">Teacher ID: {teacher.TeacherID}</span>                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="card-modern border-0 shadow-xl bg-gradient-to-br from-white via-gray-50 to-white overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-apple-green/5 via-transparent to-amber/5" />
              <div className="relative p-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
                  Contact Information
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600 mb-1">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm font-medium">Email Address</span>
                    </div>                    <p className="text-gray-900 font-medium">{teacher.Email}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600 mb-1">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm font-medium">Phone Number</span>
                    </div>
                    <p className="text-gray-900 font-medium">{teacher.PhoneNum}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subjects Taught Sidebar */}
          <div className="space-y-6">
            <div className="card-modern border-0 shadow-xl bg-gradient-to-br from-white via-gray-50 to-white overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber/5 via-transparent to-gamboge/5" />
              <div className="relative p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-amber to-gamboge rounded-lg shadow-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Subjects Taught
                  </h2>
                </div>
                
                {teacher.Subject.length > 0 ? (
                  <div className="space-y-3">                    {teacher.Subject.map((subject: SubjectType) => (
                      <div
                        key={subject.SubjectID}
                        className="p-4 rounded-xl border border-gray-200 bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-br from-apple-green/20 to-amber/20 rounded-lg">
                            <BookOpen className="h-4 w-4 text-gray-700" />
                          </div>                          <div>
                            <p className="font-medium text-gray-900">{subject.SubjectName}</p>
                            <p className="text-xs text-gray-500">Level: {subject.ClassLevel}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No subjects assigned yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
