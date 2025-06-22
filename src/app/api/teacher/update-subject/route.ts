import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function PUT(request: NextRequest) {
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

    const { subjectId, SubjectName, ClassLevel } = await request.json();

    // Update subject
    const updatedSubject = await prisma.subject.update({
      where: { SubjectID: subjectId },
      data: {
        SubjectName,
        ClassLevel
      },
      include: {
        Teacher: true
      }
    });

    return NextResponse.json({ subject: updatedSubject });

  } catch (error) {
    console.error('Update subject error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
