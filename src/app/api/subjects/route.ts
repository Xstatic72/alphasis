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

// GET /api/subjects - Get subjects
export async function GET(request: NextRequest) {
  try {
    const session = await authenticate(request);
      if (session.role === 'TEACHER') {
      // Get teacher's subjects using PersonID
      const person = await prisma.person.findUnique({
        where: { PersonID: session.userId },
        include: { teacher: true }
      });

      if (!person?.teacher) {
        return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
      }      const subjects = await prisma.subject.findMany({
        where: { TeacherID: person.teacher.TeacherID },
        include: { 
          teacher: {
            include: { person: true }
          }
        }
      });

      return NextResponse.json({ subjects });
    }    if (session.role === 'STUDENT') {      // Get all available subjects for registration
      const subjects = await prisma.subject.findMany({
        include: { 
          teacher: {
            include: { person: true }
          }
        }
      });

      return NextResponse.json({ subjects });
    }    // For other roles, return all subjects
    const subjects = await prisma.subject.findMany({
      include: { 
        teacher: {
          include: { person: true }
        }
      }
    });

    return NextResponse.json({ subjects });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { 
        status: error.message === 'Unauthorized' ? 401 : 403 
      });
    }
    console.error('Get subjects error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/subjects - Create new subject (teachers only)
export async function POST(request: NextRequest) {
  try {
    const session = await authenticate(request, ['TEACHER']);
    const subjectData = await request.json();    // Get teacher profile
    const person = await prisma.person.findUnique({
      where: { PersonID: session.userId },
      include: { teacher: true }
    });

    if (!person?.teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    // Validate required fields
    const requiredFields = ['SubjectName', 'ClassLevel'];
    for (const field of requiredFields) {
      if (!subjectData[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    // Generate subject ID if not provided
    if (!subjectData.SubjectID) {
      const count = await prisma.subject.count();
      subjectData.SubjectID = `SUB${String(count + 1).padStart(3, '0')}`;
    }    const subject = await prisma.subject.create({
      data: {
        SubjectID: subjectData.SubjectID,
        SubjectName: subjectData.SubjectName,
        ClassLevel: subjectData.ClassLevel,
        TeacherID: person.teacher.TeacherID
      },
      include: { teacher: true }
    });

    return NextResponse.json({ subject }, { status: 201 });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { 
        status: error.message === 'Unauthorized' ? 401 : 403 
      });
    }
    console.error('Create subject error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/subjects - Update subject (teachers only)
export async function PUT(request: NextRequest) {
  try {
    const session = await authenticate(request, ['TEACHER']);
    const { subjectId, ...updateData } = await request.json();

    if (!subjectId) {
      return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 });
    }    // Verify teacher owns this subject
    const person = await prisma.person.findUnique({
      where: { PersonID: session.userId },
      include: { teacher: true }
    });

    if (!person?.teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    const existingSubject = await prisma.subject.findUnique({
      where: { SubjectID: subjectId }
    });

    if (!existingSubject || existingSubject.TeacherID !== person.teacher.TeacherID) {
      return NextResponse.json({ error: 'Subject not found or access denied' }, { status: 404 });
    }

    const subject = await prisma.subject.update({
      where: { SubjectID: subjectId },
      data: updateData,
      include: { teacher: true }
    });

    return NextResponse.json({ subject });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { 
        status: error.message === 'Unauthorized' ? 401 : 403 
      });
    }
    console.error('Update subject error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/subjects - Delete subject (teachers only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await authenticate(request, ['TEACHER']);
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
      return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 });
    }    // Verify teacher owns this subject
    const person = await prisma.person.findUnique({
      where: { PersonID: session.userId },
      include: { teacher: true }
    });

    if (!person?.teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    const existingSubject = await prisma.subject.findUnique({
      where: { SubjectID: subjectId }
    });

    if (!existingSubject || existingSubject.TeacherID !== person.teacher.TeacherID) {
      return NextResponse.json({ error: 'Subject not found or access denied' }, { status: 404 });
    }

    // Delete related records first
    await prisma.registration.deleteMany({
      where: { SubjectID: subjectId }
    });

    await prisma.grade.deleteMany({
      where: { SubjectID: subjectId }
    });

    await prisma.attendance.deleteMany({
      where: { SubjectID: subjectId }
    });

    // Delete the subject
    await prisma.subject.delete({
      where: { SubjectID: subjectId }
    });

    return NextResponse.json({ message: 'Subject deleted successfully' });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { 
        status: error.message === 'Unauthorized' ? 401 : 403 
      });
    }
    console.error('Delete subject error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
