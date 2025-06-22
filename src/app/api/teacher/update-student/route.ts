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

    const { admissionNumber, FirstName, LastName, DateOfBirth, Gender, ParentContact, Address, StudentClassID } = await request.json();

    // Update student
    const updatedStudent = await prisma.student.update({
      where: { AdmissionNumber: admissionNumber },
      data: {
        FirstName,
        LastName,
        DateOfBirth: new Date(DateOfBirth),
        Gender,
        ParentContact,
        Address,
        ...(StudentClassID && { StudentClassID })
      },
      include: {
        Class: true
      }
    });

    return NextResponse.json({ student: updatedStudent });

  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
