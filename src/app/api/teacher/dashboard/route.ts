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
    }    // Get person and teacher profile
    const person = await prisma.person.findUnique({
      where: { PersonID: session.userId },
      include: {
        teacher: true
      }
    });

    if (!person || !person.teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }    // Get subjects taught by this teacher
    const subjects = await prisma.subject.findMany({
      where: { TeacherID: person.teacher.TeacherID },
      include: { teacher: true }
    });    // Get all students (for teacher's overview) 
    const students = await prisma.student.findMany({
      include: { 
        Renamedclass: true
      },
      orderBy: { AdmissionNumber: 'asc' }
    });
  

    // Get corresponding person data for students using raw query if needed
    const studentsWithNames = await Promise.all(
      students.map(async (student) => {        try {
          const personResult = await prisma.$queryRaw`
            SELECT FirstName, LastName FROM person WHERE PersonID = ${student.AdmissionNumber}
          ` as { FirstName: string; LastName: string }[];
          
          return {
            ...student,
            FirstName: personResult[0]?.FirstName || '',
            LastName: personResult[0]?.LastName || '',
            FullName: personResult[0] ? `${personResult[0].FirstName} ${personResult[0].LastName}` : student.AdmissionNumber
          };
        } catch {
          return {
            ...student,
            FirstName: '',
            LastName: '',
            FullName: student.AdmissionNumber
          };
        }
      })
    );    // Get recent grades for subjects this teacher teaches
    let grades: {
      GradeID: string;
      StudentID: string;
      SubjectID: string;
      Term: string;
      CA: number | null;
      Exam: number | null;
      TotalScore: number | null;
      Grade: string | null;
      StudentName: string;
      SubjectName: string;
      Student: { FirstName: string; LastName: string };
      Subject: { SubjectName: string };
    }[] = [];
    if (subjects.length > 0) {
      
      const gradesRaw = await prisma.grade.findMany({
        where: {
          SubjectID: {
            in: subjects.map(subject => subject.SubjectID)
          }
        },
        orderBy: { Term: 'desc' },
        take: 50
      });
      

      // Get student and subject names for each grade
      grades = await Promise.all(
        gradesRaw.map(async (grade) => {          try {
            const [studentResult, subjectResult] = await Promise.all([
              prisma.$queryRaw`SELECT FirstName, LastName FROM person WHERE PersonID = ${grade.StudentID}` as Promise<{ FirstName: string; LastName: string }[]>,
              prisma.subject.findUnique({ where: { SubjectID: grade.SubjectID } })
            ]);
            
            const studentName = studentResult[0] 
              ? `${studentResult[0].FirstName} ${studentResult[0].LastName}` 
              : 'Unknown Student';
            
            return {
              ...grade,
              StudentName: studentName,
              SubjectName: subjectResult?.SubjectName || 'Unknown Subject',
              Student: {
                FirstName: studentResult[0]?.FirstName || '',
                LastName: studentResult[0]?.LastName || ''
              },
              Subject: {
                SubjectName: subjectResult?.SubjectName || 'Unknown Subject'
              }
            };
          } catch {
            return {
              ...grade,
              StudentName: 'Unknown Student',
              SubjectName: 'Unknown Subject',
              Student: { FirstName: '', LastName: '' },
              Subject: { SubjectName: 'Unknown Subject' }
            };
          }
        })
      );
    }    // Get recent attendance for subjects this teacher teaches
    let attendance: {
      AttendanceID: string;
      StudentID: string;
      SubjectID: string;
      Date: Date;
      Status: string;
      StudentName: string;
      SubjectName: string;
      Student: { FirstName: string; LastName: string };
      Subject: { SubjectName: string };
    }[] = [];
    if (subjects.length > 0) {
      console.log('Looking for attendance for subjects:', subjects.map(s => s.SubjectID));
      const attendanceRaw = await prisma.attendance.findMany({
        where: {
          SubjectID: {
            in: subjects.map(subject => subject.SubjectID)
          }
        },
        orderBy: { Date: 'desc' },
        take: 50
      });
      console.log('Found attendance records:', attendanceRaw.length);
      console.log('Attendance records:', attendanceRaw);

      // Get student and subject names for each attendance record
      attendance = await Promise.all(
        attendanceRaw.map(async (att) => {          try {
            const [studentResult, subjectResult] = await Promise.all([
              prisma.$queryRaw`SELECT FirstName, LastName FROM person WHERE PersonID = ${att.StudentID}` as Promise<{ FirstName: string; LastName: string }[]>,
              prisma.subject.findUnique({ where: { SubjectID: att.SubjectID } })
            ]);
            
            const studentName = studentResult[0] 
              ? `${studentResult[0].FirstName} ${studentResult[0].LastName}` 
              : 'Unknown Student';
            
            return {
              ...att,
              StudentName: studentName,
              SubjectName: subjectResult?.SubjectName || 'Unknown Subject',
              Status: att.Status === 'PRESENT' ? 'Present' : 'Absent',
              Student: {
                FirstName: studentResult[0]?.FirstName || '',
                LastName: studentResult[0]?.LastName || ''
              },
              Subject: {
                SubjectName: subjectResult?.SubjectName || 'Unknown Subject'
              }
            };
          } catch {
            return {
              ...att,
              StudentName: 'Unknown Student',
              SubjectName: 'Unknown Subject',
              Status: att.Status === 'PRESENT' ? 'Present' : 'Absent',
              Student: { FirstName: '', LastName: '' },
              Subject: { SubjectName: 'Unknown Subject' }
            };
          }
        })
      );
    }return NextResponse.json({
      user: {
        PersonID: person.PersonID,
        name: `${person.FirstName} ${person.LastName}`,
        teacherProfile: person.teacher
      },
      subjects: subjects || [],
      students: studentsWithNames || [],
      grades: grades || [],
      attendance: attendance || []
    });

  } catch (error) {
    console.error('Teacher dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}