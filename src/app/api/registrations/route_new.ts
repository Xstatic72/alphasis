import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// Authentication helper
async function authenticate(request: NextRequest, allowedRoles: string[] = []) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  if (!sessionCookie) {
    throw new Error('Unauthorized');
  }

  const session = JSON.parse(sessionCookie.value);
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    throw new Error('Access denied');
  }

  return session;
}

// GET /api/registrations - Get subject registrations
export async function GET(request: NextRequest) {
  try {
    const session = await authenticate(request);

    if (session.role === 'STUDENT') {
      // Get student's registrations using session.userId as AdmissionNumber
      const student = await prisma.student.findUnique({
        where: { AdmissionNumber: session.userId },
        include: { Renamedclass: true }
      });

      if (!student) {
        return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
      }

      // Get registrations with subject and teacher details using raw SQL for reliability
      const registrations = await prisma.$queryRaw`
        SELECT 
          r.RegistrationID,
          r.StudentID,
          r.SubjectID,
          r.Term,
          s.SubjectName,
          s.ClassLevel,
          t.TeacherID,
          p.FirstName as TeacherFirstName,
          p.LastName as TeacherLastName
        FROM registration r
        JOIN subject s ON r.SubjectID = s.SubjectID
        LEFT JOIN teacher t ON s.TeacherID = t.TeacherID
        LEFT JOIN person p ON t.TeacherID = p.PersonID
        WHERE r.StudentID = ${student.AdmissionNumber}
        ORDER BY s.SubjectName
      ` as any[];

      return NextResponse.json({ 
        registrations: registrations.map((reg: any) => ({
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
        }))
      });
    }

    if (session.role === 'TEACHER') {
      // Get teacher's person record
      const person = await prisma.person.findUnique({
        where: { PersonID: session.userId },
        include: { teacher: true }
      });

      if (!person || !person.teacher) {
        return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
      }

      // Get registrations for teacher's subjects
      const registrations = await prisma.$queryRaw`
        SELECT 
          r.RegistrationID,
          r.StudentID,
          r.SubjectID,
          r.Term,
          s.SubjectName,
          p.FirstName as StudentFirstName,
          p.LastName as StudentLastName
        FROM registration r
        JOIN subject s ON r.SubjectID = s.SubjectID
        JOIN person p ON r.StudentID = p.PersonID
        WHERE s.TeacherID = ${person.teacher.TeacherID}
        ORDER BY s.SubjectName, p.LastName, p.FirstName
      ` as any[];

      return NextResponse.json({ 
        registrations: registrations.map((reg: any) => ({
          RegistrationID: reg.RegistrationID,
          StudentID: reg.StudentID,
          SubjectID: reg.SubjectID,
          Term: reg.Term,
          subject: {
            SubjectName: reg.SubjectName
          },
          student: {
            FirstName: reg.StudentFirstName,
            LastName: reg.StudentLastName
          }
        }))
      });
    }

    return NextResponse.json({ registrations: [] });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { 
        status: error.message === 'Unauthorized' ? 401 : 403 
      });
    }
    console.error('Get registrations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/registrations - Create new registration (students only)
export async function POST(request: NextRequest) {
  try {
    const session = await authenticate(request, ['STUDENT']);
    const { SubjectID, Term = '1st Term' } = await request.json();

    if (!SubjectID) {
      return NextResponse.json({ error: 'SubjectID is required' }, { status: 400 });
    }

    // Get student profile
    const student = await prisma.student.findUnique({
      where: { AdmissionNumber: session.userId },
      include: { Renamedclass: true }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Verify subject exists and is available for student's class level
    const subject = await prisma.subject.findUnique({
      where: { SubjectID }
    });

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    // Map class name to class level for comparison
    const getClassLevel = (className: string) => {
      if (className?.startsWith('JSS1')) return 'JSS1';
      if (className?.startsWith('JSS2')) return 'JSS2';
      if (className?.startsWith('JSS3')) return 'JSS3';
      if (className?.startsWith('SS1') || className?.startsWith('SSS1')) return 'SSS1';
      if (className?.startsWith('SS2') || className?.startsWith('SSS2')) return 'SSS2';
      if (className?.startsWith('SS3') || className?.startsWith('SSS3')) return 'SSS3';
      return className;
    };

    const studentClassLevel = getClassLevel(student.Renamedclass?.ClassName);
    
    if (subject.ClassLevel !== studentClassLevel) {
      return NextResponse.json({ 
        error: `This subject is for ${subject.ClassLevel} students. You are in ${studentClassLevel}.` 
      }, { status: 400 });
    }

    // Check if already registered
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        StudentID: student.AdmissionNumber,
        SubjectID: SubjectID,
        Term: Term
      }
    });

    if (existingRegistration) {
      return NextResponse.json({ 
        error: 'You are already registered for this subject in this term' 
      }, { status: 400 });
    }

    // Generate unique RegistrationID
    const registrationCount = await prisma.registration.count();
    const registrationId = `R${(registrationCount + 1).toString().padStart(3, '0')}`;

    // Create registration
    const newRegistration = await prisma.registration.create({
      data: {
        RegistrationID: registrationId,
        StudentID: student.AdmissionNumber,
        SubjectID: SubjectID,
        Term: Term
      }
    });

    // Get the complete registration data to return
    const registrationWithDetails = await prisma.$queryRaw`
      SELECT 
        r.RegistrationID,
        r.StudentID,
        r.SubjectID,
        r.Term,
        s.SubjectName,
        s.ClassLevel,
        t.TeacherID,
        p.FirstName as TeacherFirstName,
        p.LastName as TeacherLastName
      FROM registration r
      JOIN subject s ON r.SubjectID = s.SubjectID
      LEFT JOIN teacher t ON s.TeacherID = t.TeacherID
      LEFT JOIN person p ON t.TeacherID = p.PersonID
      WHERE r.RegistrationID = ${registrationId}
    ` as any[];

    const registration = registrationWithDetails[0];

    return NextResponse.json({ 
      message: 'Successfully registered for subject',
      registration: {
        RegistrationID: registration.RegistrationID,
        StudentID: registration.StudentID,
        SubjectID: registration.SubjectID,
        Term: registration.Term,
        subject: {
          SubjectName: registration.SubjectName,
          ClassLevel: registration.ClassLevel,
          teacher: {
            TeacherID: registration.TeacherID,
            FirstName: registration.TeacherFirstName,
            LastName: registration.TeacherLastName
          }
        }
      }
    }, { status: 201 });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { 
        status: error.message === 'Unauthorized' ? 401 : 403 
      });
    }
    console.error('Create registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/registrations - Remove registration (students only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await authenticate(request, ['STUDENT']);
    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get('registrationId');

    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 });
    }

    // Verify the registration belongs to the student
    const registration = await prisma.registration.findUnique({
      where: { RegistrationID: registrationId }
    });

    if (!registration || registration.StudentID !== session.userId) {
      return NextResponse.json({ error: 'Registration not found or access denied' }, { status: 404 });
    }

    // Delete the registration
    await prisma.registration.delete({
      where: { RegistrationID: registrationId }
    });

    return NextResponse.json({ message: 'Registration removed successfully' });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { 
        status: error.message === 'Unauthorized' ? 401 : 403 
      });
    }
    console.error('Delete registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
