import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    
    if (session.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get teacher profile
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        teacherProfile: true
      }
    });

    if (!user || !user.teacherProfile) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    const { SubjectName, ClassLevel } = await request.json();

    // Create new subject
    const newSubject = await prisma.subject.create({
      data: {
        SubjectName,
        ClassLevel,
        TeacherID: user.teacherProfile.TeacherID
      },
      include: {
        Teacher: true
      }
    });

    return NextResponse.json({ subject: newSubject });

  } catch (error) {
    console.error('Add subject error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
