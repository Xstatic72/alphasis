import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    
    if (session.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }    // Get student by PersonID (which is same as AdmissionNumber)
    const student = await prisma.student.findUnique({
      where: { AdmissionNumber: session.userId },
      include: { Renamedclass: true }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Get person details
    const person = await prisma.person.findUnique({
      where: { PersonID: session.userId }
    });

    // Get grades
    const grades = await prisma.grade.findMany({
      where: { StudentID: student.AdmissionNumber },
      include: { Subject: true },
      orderBy: { Term: 'desc' }
    });    // Get attendance (last 20 records)
    const attendance = await prisma.attendance.findMany({
      where: { StudentID: student.AdmissionNumber },
      include: { subject: true },
      orderBy: { Date: 'desc' },
      take: 20
    });

    // Get payments
    const payments = await prisma.payment.findMany({
      where: { StudentID: student.AdmissionNumber },
      orderBy: { PaymentDate: 'desc' }
    });

    // Get registered subjects
    const registeredSubjects = await prisma.registration.findMany({
      where: { StudentID: student.AdmissionNumber },
      include: {
        subject: {
          include: { teacher: true }
        }
      }
    });

    // Get available subjects for registration
    const availableSubjects = await prisma.subject.findMany({
      include: { teacher: true }
    });

    return NextResponse.json({
      user: {
        PersonID: person?.PersonID,
        name: person ? `${person.FirstName} ${person.LastName}` : '',
        studentProfile: student
      },
      grades: grades || [],
      attendance: attendance || [],
      payments: payments || [],
      registeredSubjects: registeredSubjects || [],
      availableSubjects: availableSubjects || []
    });

  } catch (error) {
    console.error('Student dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
