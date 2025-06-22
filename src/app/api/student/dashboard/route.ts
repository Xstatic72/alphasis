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
      where: { AdmissionNumber: session.userId }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }    // Get class information using raw SQL
    const classResult = await prisma.$queryRaw`
      SELECT ClassID, ClassName FROM class WHERE ClassID = ${student.StudentClassID}
    ` as any[];

    // Get person details using raw SQL  
    const personResult = await prisma.$queryRaw`
      SELECT PersonID, FirstName, LastName FROM person WHERE PersonID = ${session.userId}
    ` as any[];

    const person = personResult[0];
    const studentClass = classResult[0];// Get grades using raw SQL for reliability
    const grades = await prisma.$queryRaw`
      SELECT 
        g.GradeID,
        g.StudentID,
        g.SubjectID,
        g.Term,
        g.CA,
        g.Exam,
        g.TotalScore,
        g.Grade,
        s.SubjectName
      FROM grade g
      LEFT JOIN subject s ON g.SubjectID = s.SubjectID
      WHERE g.StudentID = ${student.AdmissionNumber}
      ORDER BY g.Term DESC
    ` as any[];// Get attendance (last 20 records) using raw SQL for reliability
    const attendance = await prisma.$queryRaw`
      SELECT 
        a.AttendanceID,
        a.StudentID,
        a.SubjectID,
        a.Date,
        a.Status,
        s.SubjectName
      FROM attendance a
      LEFT JOIN subject s ON a.SubjectID = s.SubjectID
      WHERE a.StudentID = ${student.AdmissionNumber}
      ORDER BY a.Date DESC
      LIMIT 20
    ` as any[];

    // Get payments
    const payments = await prisma.payment.findMany({
      where: { StudentID: student.AdmissionNumber },
      orderBy: { PaymentDate: 'desc' }
    });    // Get registered subjects using raw SQL for reliability
    const registeredSubjects = await prisma.$queryRaw`
      SELECT 
        r.RegistrationID,
        r.StudentID,
        r.SubjectID,
        r.Term,
        s.SubjectName,
        s.ClassLevel,
        s.TeacherID,
        p.FirstName as TeacherFirstName,
        p.LastName as TeacherLastName
      FROM registration r
      LEFT JOIN subject s ON r.SubjectID = s.SubjectID
      LEFT JOIN teacher t ON s.TeacherID = t.TeacherID
      LEFT JOIN person p ON t.TeacherID = p.PersonID
      WHERE r.StudentID = ${student.AdmissionNumber}
      ORDER BY s.SubjectName
    ` as any[];// Get available subjects for registration (filtered by student's class level)
    // Map full class names to class level abbreviations
    const getClassLevel = (className: string) => {
      if (className?.startsWith('JSS1')) return 'JSS1';
      if (className?.startsWith('JSS2')) return 'JSS2';
      if (className?.startsWith('JSS3')) return 'JSS3';
      if (className?.startsWith('SS1') || className?.startsWith('SSS1')) return 'SSS1';
      if (className?.startsWith('SS2') || className?.startsWith('SSS2')) return 'SSS2';
      if (className?.startsWith('SS3') || className?.startsWith('SSS3')) return 'SSS3';
      return className;
    };    const classLevel = getClassLevel(studentClass?.ClassName);
      // Get all subjects for the student's class level using raw SQL for reliability
    const allSubjectsForClass = await prisma.$queryRaw`
      SELECT 
        s.SubjectID,
        s.SubjectName,
        s.ClassLevel,
        s.TeacherID,
        p.FirstName as TeacherFirstName,
        p.LastName as TeacherLastName
      FROM subject s
      LEFT JOIN teacher t ON s.TeacherID = t.TeacherID
      LEFT JOIN person p ON t.TeacherID = p.PersonID
      WHERE s.ClassLevel = ${classLevel}
      ORDER BY s.SubjectName
    ` as any[];

    // Get already registered subject IDs
    const registeredSubjectIds = registeredSubjects.map(reg => reg.SubjectID);
    
    // Filter out subjects already registered for
    const availableSubjects = allSubjectsForClass
      .filter((subject: any) => !registeredSubjectIds.includes(subject.SubjectID))
      .map((subject: any) => ({
        SubjectID: subject.SubjectID,
        SubjectName: subject.SubjectName,
        ClassLevel: subject.ClassLevel,
        TeacherID: subject.TeacherID,
        teacher: {
          TeacherID: subject.TeacherID,
          FirstName: subject.TeacherFirstName,
          LastName: subject.TeacherLastName
        }
      }));    // Format the data for the UI
    const formattedGrades = grades.map((grade: any) => ({
      ...grade,
      subject: {
        SubjectName: grade.SubjectName
      }
    }));

    const formattedAttendance = attendance.map((att: any) => ({
      ...att,
      Status: att.Status === '1' ? 'Present' : 'Absent',
      subject: {
        SubjectName: att.SubjectName
      }
    }));

    const formattedRegisteredSubjects = registeredSubjects.map((reg: any) => ({
      RegistrationID: reg.RegistrationID,
      StudentID: reg.StudentID,
      SubjectID: reg.SubjectID,
      Term: reg.Term,
      subject: {
        SubjectName: reg.SubjectName,
        ClassLevel: reg.ClassLevel,
        teacher: {
          TeacherID: reg.TeacherID,
          FirstName: reg.TeacherFirstName,
          LastName: reg.TeacherLastName
        }
      }
    }));

    return NextResponse.json({
      user: {
        PersonID: person?.PersonID,
        name: person ? `${person.FirstName} ${person.LastName}` : '',
        studentProfile: student
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
