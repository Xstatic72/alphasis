import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

/**
 * Student Dashboard API Route
 * 
 * Provides comprehensive dashboard data for authenticated students including:
 * - Personal information and class details
 * - Academic grades across all subjects and terms
 * - Attendance records (last 20 entries)
 * - Payment history
 * - Subject registrations (current and available)
 * 
 * @returns {Object} Complete student dashboard data or error response
 */
export async function GET() {
  try {
    // Get session cookie from request headers
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    // Verify user is authenticated
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    
    // Ensure only students can access this endpoint
    if (session.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }    // Find student record using PersonID from session (PersonID = AdmissionNumber)
    const student = await prisma.student.findUnique({
      where: { AdmissionNumber: session.userId }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Get class information - use proper Prisma relation instead of raw SQL
    const studentClass = await prisma.renamedclass.findUnique({
      where: { ClassID: student.StudentClassID }
    });

    // Get student's personal details from person table
    const person = await prisma.person.findUnique({
      where: { PersonID: session.userId }
    });    // Fetch student's academic grades with subject information
    const grades = await prisma.grade.findMany({
      where: { StudentID: student.AdmissionNumber },
      include: {
        subject: true
      },
      orderBy: { Term: 'desc' }
    });

    // Get recent attendance records (last 20 entries) with subject details
    const attendance = await prisma.attendance.findMany({
      where: { StudentID: student.AdmissionNumber },
      include: {
        subject: true
      },
      orderBy: { Date: 'desc' },
      take: 20
    });

    // Get student's payment history
    const payments = await prisma.payment.findMany({
      where: { StudentID: student.AdmissionNumber },
      orderBy: { PaymentDate: 'desc' }
    });    // Get current subject registrations with teacher information
    const registeredSubjects = await prisma.registration.findMany({
      where: { StudentID: student.AdmissionNumber },
      include: {
        subject: {
          include: {
            teacher: {
              include: {
                person: true
              }
            }
          }
        }
      },
      orderBy: {
        subject: {
          SubjectName: 'asc'
        }
      }
    });

    /**
     * Maps full class names to standardized class level abbreviations
     * for subject filtering purposes
     * 
     * @param {string} className - Full class name (e.g., "JSS1 Gold", "SSS2 Science")
     * @returns {string} Class level abbreviation (e.g., "JSS1", "SSS2")
     */
    const getClassLevel = (className: string | undefined): string => {
      if (!className) return '';
      
      if (className.startsWith('JSS1')) return 'JSS1';
      if (className.startsWith('JSS2')) return 'JSS2';
      if (className.startsWith('JSS3')) return 'JSS3';
      if (className.startsWith('SS1') || className.startsWith('SSS1')) return 'SSS1';
      if (className.startsWith('SS2') || className.startsWith('SSS2')) return 'SSS2';
      if (className.startsWith('SS3') || className.startsWith('SSS3')) return 'SSS3';
      return className;
    };

    const classLevel = getClassLevel(studentClass?.ClassName);    // Get all subjects available for the student's class level
    const allSubjectsForClass = await prisma.subject.findMany({
      where: { ClassLevel: classLevel },
      include: {
        teacher: {
          include: {
            person: true
          }
        }
      },
      orderBy: { SubjectName: 'asc' }
    });

    // Extract IDs of subjects the student is already registered for
    const registeredSubjectIds = registeredSubjects.map(reg => reg.SubjectID);
      
    // Filter out subjects student is already registered for
    const availableSubjects = allSubjectsForClass
      .filter((subject) => !registeredSubjectIds.includes(subject.SubjectID))
      .map((subject) => ({
        SubjectID: subject.SubjectID,
        SubjectName: subject.SubjectName,
        ClassLevel: subject.ClassLevel,
        TeacherID: subject.TeacherID,
        teacher: subject.teacher ? {
          TeacherID: subject.teacher.TeacherID,
          FirstName: subject.teacher.person?.FirstName || '',
          LastName: subject.teacher.person?.LastName || ''
        } : null
      }));

    // Format grades data for frontend consumption
    const formattedGrades = grades.map((grade) => ({
      ...grade,
      subject: {
        SubjectName: grade.subject.SubjectName
      }
    }));

    // Format attendance data with readable status and subject information
    const formattedAttendance = attendance.map((att) => ({
      ...att,
      Status: att.Status === 'PRESENT' ? 'Present' : 'Absent',
      subject: {
        SubjectName: att.subject.SubjectName
      }
    }));

    // Format registered subjects with complete teacher information
    const formattedRegisteredSubjects = registeredSubjects.map((reg) => ({
      RegistrationID: reg.RegistrationID,
      StudentID: reg.StudentID,
      SubjectID: reg.SubjectID,
      Term: reg.Term,
      subject: {
        SubjectName: reg.subject.SubjectName,
        ClassLevel: reg.subject.ClassLevel,
        teacher: reg.subject.teacher ? {
          TeacherID: reg.subject.teacher.TeacherID,
          FirstName: reg.subject.teacher.person?.FirstName || '',
          LastName: reg.subject.teacher.person?.LastName || ''
        } : null
      }
    }));    // Return comprehensive dashboard data
    return NextResponse.json({
      user: {
        PersonID: person?.PersonID,
        name: person ? `${person.FirstName} ${person.LastName}` : '',
        studentProfile: {
          ...student,
          Renamedclass: studentClass ? {
            ClassID: studentClass.ClassID,
            ClassName: studentClass.ClassName
          } : null
        }
      },
      grades: formattedGrades || [],
      attendance: formattedAttendance || [],
      payments: payments || [],
      registeredSubjects: formattedRegisteredSubjects || [],
      availableSubjects: availableSubjects || []
    });

  } catch (error) {
    console.error('Student dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
