import { prisma } from "@/lib/prisma";
import DashboardPageClient from "./DashboardClient";

export default async function DashboardPage() {
  // Fetch dashboard data
  const [
    totalStudents,
    totalTeachers,
    totalClasses,
    totalSubjects,
    totalPayments,
    recentPayments,
    studentsPerClass,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.renamedclass.count(),
    prisma.subject.count(),
    prisma.payment.count(),    prisma.payment.findMany({
      take: 5,
      orderBy: { PaymentDate: 'desc' },
      include: { student: true },
    }),prisma.renamedclass.findMany({
      include: { _count: { select: { student: true } } },
    }),
  ]);

  return (
    <DashboardPageClient
      totalStudents={totalStudents}
      totalTeachers={totalTeachers}
      totalClasses={totalClasses}
      totalSubjects={totalSubjects}
      totalPayments={totalPayments}
      recentPayments={recentPayments}
      studentsPerClass={studentsPerClass}
    />
  );
}
