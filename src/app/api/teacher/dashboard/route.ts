import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

/**
 * Teacher Dashboard API Route
 * 
 * Provides comprehensive dashboard data for authenticated teachers including:
 * - Teacher profile and subjects taught
 * - Student management data with names and class information
 * - Academic grades for teacher's subjects
 * - Attendance records for classes
 * - Registration and enrollment statistics
 * 
 * @returns {Object} Complete teacher dashboard data or error response
 */
export async function GET() {
  try {
    // Authenticate and verify teacher session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    
    // Ensure only teachers can access this endpoint
    if (session.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get teacher's personal and professional profile information
    const person = await prisma.person.findUnique({
      where: { PersonID: session.userId },
      include: {
        teacher: true
      }
    });

    if (!person || !person.teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    // Get all subjects assigned to this teacher
    const subjects = await prisma.subject.findMany({
      where: { TeacherID: person.teacher.TeacherID },
      include: { teacher: true }
    });

    // Get all students for teacher overview and management
    const students = await prisma.student.findMany({
      include: { 
        Renamedclass: true
      },
      orderBy: { AdmissionNumber: 'asc' }
    });

    // Enhance student data with names from person table using proper Prisma relations
    const studentsWithNames = await Promise.all(
      students.map(async (student) => {
        try {
          const person = await prisma.person.findUnique({
            where: { PersonID: student.AdmissionNumber }
          });
          
          return {
            ...student,
            FirstName: person?.FirstName || '',
            LastName: person?.LastName || '',
            FullName: person ? `${person.FirstName} ${person.LastName}` : student.AdmissionNumber,
            ClassName: student.Renamedclass?.ClassName || 'Unknown Class'
          };
        } catch {
          return {
            ...student,
            FirstName: '',
            LastName: '',
            FullName: student.AdmissionNumber,
            ClassName: student.Renamedclass?.ClassName || 'Unknown Class'
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
        gradesRaw.map(async (grade) => {
          try {
            const [student, subject] = await Promise.all([
              prisma.person.findUnique({ where: { PersonID: grade.StudentID } }),
              prisma.subject.findUnique({ where: { SubjectID: grade.SubjectID } })
            ]);
            
            const studentName = student 
              ? `${student.FirstName} ${student.LastName}` 
              : 'Unknown Student';
            
            return {
              ...grade,
              StudentName: studentName,
              SubjectName: subject?.SubjectName || 'Unknown Subject',
              Student: {
                FirstName: student?.FirstName || '',
                LastName: student?.LastName || ''
              },
              Subject: {
                SubjectName: subject?.SubjectName || 'Unknown Subject'
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

      // Get student and subject names for each attendance record using proper Prisma relations
      attendance = await Promise.all(
        attendanceRaw.map(async (att) => {
          try {
            const [student, subject] = await Promise.all([
              prisma.person.findUnique({ where: { PersonID: att.StudentID } }),
              prisma.subject.findUnique({ where: { SubjectID: att.SubjectID } })
            ]);
            
            const studentName = student 
              ? `${student.FirstName} ${student.LastName}` 
              : 'Unknown Student';
            
            return {
              ...att,
              StudentName: studentName,
              SubjectName: subject?.SubjectName || 'Unknown Subject',
              Status: att.Status === 'PRESENT' ? 'Present' : 'Absent',
              Student: {
                FirstName: student?.FirstName || '',
                LastName: student?.LastName || ''
              },
              Subject: {
                SubjectName: subject?.SubjectName || 'Unknown Subject'
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