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
    const session = await authenticate(request);    if (session.role === 'STUDENT') {
      // Get student's registrations using session.userId as AdmissionNumber
      const student = await prisma.student.findUnique({
        where: { AdmissionNumber: session.userId }
      });

      if (!student) {
        return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
      }

      const registrations = await prisma.registration.findMany({
        where: { StudentID: student.AdmissionNumber },
        include: {
          Subject: {
            include: { Teacher: true }
          }
        }
      });

      return NextResponse.json({ registrations });
    }

    if (session.role === 'TEACHER') {
      // Get registrations for teacher's subjects
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { teacherProfile: true }
      });

      if (!user?.teacherProfile) {
        return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
      }

      const subjects = await prisma.subject.findMany({
        where: { TeacherID: user.teacherProfile.TeacherID }
      });

      const subjectIds = subjects.map(s => s.SubjectID);
      const registrations = await prisma.registration.findMany({
        where: { SubjectID: { in: subjectIds } },
        include: {
          Student: true,
          Subject: true
        }
      });

      return NextResponse.json({ registrations });
    }

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

// POST /api/registrations - Register for subject (students only)
export async function POST(request: NextRequest) {
  try {
    const session = await authenticate(request, ['STUDENT']);
    const { subjectId } = await request.json();

    if (!subjectId) {
      return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 });
    }

    // Get student profile using session.userId as AdmissionNumber
    const student = await prisma.student.findUnique({
      where: { AdmissionNumber: session.userId }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Check if already registered
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        StudentID: student.AdmissionNumber,
        SubjectID: subjectId
      }
    });

    if (existingRegistration) {
      return NextResponse.json({ error: 'Already registered for this subject' }, { status: 400 });
    }

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { SubjectID: subjectId }
    });

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    // Generate registration ID
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.floor(Math.random() * 9000) + 1000;
    const registrationId = `REG${year}${random}`;

    const registration = await prisma.registration.create({
      data: {
        RegistrationID: registrationId,
        Term: '1st Term', // Default term
        StudentID: student.AdmissionNumber,
        SubjectID: subjectId
      },
      include: {
        Subject: {
          include: { Teacher: true }
        }
      }
    });

    return NextResponse.json({ registration }, { status: 201 });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { 
        status: error.message === 'Unauthorized' ? 401 : 403 
      });    }
    console.error('Create registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/registrations - Unregister from subject
export async function DELETE(request: NextRequest) {
  try {
    const session = await authenticate(request, ['STUDENT']);
    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get('registrationId');

    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 });
    }

    // Get student profile using session.userId as AdmissionNumber
    const student = await prisma.student.findUnique({
      where: { AdmissionNumber: session.userId }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Verify student owns this registration
    const registration = await prisma.registration.findUnique({
      where: { RegistrationID: registrationId }
    });

    if (!registration || registration.StudentID !== student.AdmissionNumber) {
      return NextResponse.json({ error: 'Registration not found or access denied' }, { status: 404 });
    }

    await prisma.registration.delete({
      where: { RegistrationID: registrationId }
    });

    return NextResponse.json({ message: 'Successfully unregistered from subject' });

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
