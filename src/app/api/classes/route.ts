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

// GET /api/classes - Get all classes
export async function GET(request: NextRequest) {
  try {
    await authenticate(request);
    
    const classes = await prisma.class.findMany({
      orderBy: { ClassName: 'asc' }
    });

    return NextResponse.json({ classes });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { 
        status: error.message === 'Unauthorized' ? 401 : 403 
      });
    }
    console.error('Get classes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/classes - Create new class (teachers/admin only)
export async function POST(request: NextRequest) {
  try {
    await authenticate(request, ['TEACHER']);
    const classData = await request.json();

    if (!classData.ClassName) {
      return NextResponse.json({ error: 'Class name is required' }, { status: 400 });
    }

    const newClass = await prisma.class.create({
      data: {
        ClassName: classData.ClassName
      }
    });

    return NextResponse.json({ class: newClass }, { status: 201 });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { 
        status: error.message === 'Unauthorized' ? 401 : 403 
      });
    }
    console.error('Create class error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/classes - Update class (teachers/admin only)
export async function PUT(request: NextRequest) {
  try {
    await authenticate(request, ['TEACHER']);
    const { classId, ...updateData } = await request.json();

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    const updatedClass = await prisma.class.update({
      where: { ClassID: classId },
      data: updateData
    });

    return NextResponse.json({ class: updatedClass });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { 
        status: error.message === 'Unauthorized' ? 401 : 403 
      });
    }
    console.error('Update class error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/classes - Delete class (teachers/admin only)
export async function DELETE(request: NextRequest) {
  try {
    await authenticate(request, ['TEACHER']);
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    // Check if class has students
    const studentsInClass = await prisma.student.count({
      where: { StudentClassID: classId }
    });

    if (studentsInClass > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete class with enrolled students. Please move students to another class first.' 
      }, { status: 400 });
    }

    await prisma.class.delete({
      where: { ClassID: classId }
    });

    return NextResponse.json({ message: 'Class deleted successfully' });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Record to delete does not exist')) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { 
        status: error.message === 'Unauthorized' ? 401 : 403 
      });
    }
    console.error('Delete class error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
