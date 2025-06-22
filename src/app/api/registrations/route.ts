import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Authentication helper
async function authenticate(request: NextRequest, allowedRoles: string[] = []) {
  const sessionCookie = request.cookies.get('session');
  
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
      // Get student's registrations
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { studentProfile: true }
      });

      if (!user?.studentProfile) {
        return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
      }

      const registrations = await prisma.registration.findMany({
        where: { StudentID: user.studentProfile.AdmissionNumber },
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

    // Get student profile
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { studentProfile: true }
    });

    if (!user?.studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Check if already registered
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        StudentID: user.studentProfile.AdmissionNumber,
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

    const registration = await prisma.registration.create({
      data: {
        Term: '1st Term', // Default term
        StudentID: user.studentProfile.AdmissionNumber,
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
      });
    }
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

    // Get student profile
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { studentProfile: true }
    });

    if (!user?.studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Verify student owns this registration
    const registration = await prisma.registration.findUnique({
      where: { RegistrationID: registrationId }
    });

    if (!registration || registration.StudentID !== user.studentProfile.AdmissionNumber) {
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
