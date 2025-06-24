import { NextResponse } from 'next/server';
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
    
    if (session.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }    // Get person with teacher profile
    const person = await prisma.person.findUnique({
      where: { PersonID: session.userId },
      include: {
        teacher: true
      }
    });

    if (!person || !person.teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    // Get teacher's subjects
    const subjects = await prisma.subject.findMany({
      where: { TeacherID: person.teacher.TeacherID }
    });

    const subjectIds = subjects.map(s => s.SubjectID);    // Get students from teacher's subjects
    const registrations = await prisma.registration.findMany({
      where: { SubjectID: { in: subjectIds } },
      include: {
        student: {
          include: { Renamedclass: true }
        }
      }
    });    // Get unique students
    const studentsMap = new Map();
    registrations.forEach(reg => {
      if (reg.student && reg.student.AdmissionNumber && !studentsMap.has(reg.student.AdmissionNumber)) {
        studentsMap.set(reg.student.AdmissionNumber, reg.student);
      }
    });
    const students = Array.from(studentsMap.values());

    // Get attendance records for teacher's subjects
    const attendance = await prisma.attendance.findMany({
      where: { SubjectID: { in: subjectIds } },
      include: {
        student: true,
        subject: true
      },
      orderBy: { Date: 'desc' },
      take: 200
    });

    return NextResponse.json({
      attendance: attendance || [],
      students: students || [],
      subjects: subjects || []
    });

  } catch (error) {
    console.error('Teacher attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
