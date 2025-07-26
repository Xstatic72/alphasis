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
    }    // Get teacher profile
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

    const subjectIds = subjects.map(s => s.SubjectID);    // Get grades for teacher's subjects
    const grades = await prisma.grade.findMany({
      where: { SubjectID: { in: subjectIds } },
      include: {
        student: true,
        subject: true
      },      orderBy: [
        { Term: 'desc' },
        { StudentID: 'asc' }
      ]
    });

    // Get students for teacher's subjects with names
    const registrations = await prisma.registration.findMany({
      where: { SubjectID: { in: subjectIds } },
      include: {
        student: true
      }
    });

    const studentsMap = new Map();
    registrations.forEach(reg => {
      if (reg.student && reg.student.AdmissionNumber && !studentsMap.has(reg.student.AdmissionNumber)) {
        studentsMap.set(reg.student.AdmissionNumber, reg.student);
      }
    });
    const studentsArray = Array.from(studentsMap.values());

    // Get student names from person table
    const studentsWithNames = await Promise.all(
      studentsArray.map(async (student) => {
        try {
          const person = await prisma.person.findUnique({
            where: { PersonID: student.AdmissionNumber }
          });
          
          return {
            ...student,
            FirstName: person?.FirstName || '',
            LastName: person?.LastName || '',
            FullName: person ? `${person.FirstName} ${person.LastName}` : student.AdmissionNumber
          };
        } catch (error) {
          return {
            ...student,
            FirstName: '',
            LastName: '',
            FullName: student.AdmissionNumber
          };
        }
      })
    );

    // Transform grades to include student names
    const gradesWithNames = await Promise.all(
      grades.map(async (grade) => {
        try {
          const person = await prisma.person.findUnique({
            where: { PersonID: grade.StudentID }
          });
          
          return {
            ...grade,
            StudentName: person ? `${person.FirstName} ${person.LastName}` : 'Unknown Student',
            Student: {
              ...grade.student,
              FirstName: person?.FirstName || '',
              LastName: person?.LastName || ''
            }
          };
        } catch (error) {
          return {
            ...grade,
            StudentName: 'Unknown Student',
            Student: {
              ...grade.student,
              FirstName: '',
              LastName: ''
            }
          };
        }
      })
    );

    return NextResponse.json({
      grades: gradesWithNames || [],
      students: studentsWithNames || [],
      subjects: subjects || []
    });

  } catch (error) {
    console.error('Teacher grades error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
