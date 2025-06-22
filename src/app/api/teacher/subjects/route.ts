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

    // Get teacher's subjects
    const subjects = await prisma.subject.findMany({
      where: { TeacherID: user.teacherProfile.TeacherID },
      include: {
        Teacher: true
      }
    });

    // Get all subjects for reference
    const allSubjects = await prisma.subject.findMany({
      include: {
        Teacher: true
      }
    });

    return NextResponse.json({
      subjects: subjects || [],
      allSubjects: allSubjects || []
    });

  } catch (error) {
    console.error('Teacher subjects error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
