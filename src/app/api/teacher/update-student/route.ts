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

    // First, find the student to get the PersonID (which should be the same as AdmissionNumber)
    const student = await prisma.student.findUnique({
      where: { AdmissionNumber: admissionNumber },
      select: { AdmissionNumber: true }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Update person record first
    await prisma.person.update({
      where: { PersonID: admissionNumber }, // PersonID should match AdmissionNumber
      data: {
        FirstName,
        LastName
      }
    });

    // Update student record
    const updatedStudent = await prisma.student.update({
      where: { AdmissionNumber: admissionNumber },
      data: {        DateOfBirth: new Date(DateOfBirth),
        Gender,
        ParentContact,
        Address,
        ...(StudentClassID && { StudentClassID })      },
      include: {
        Renamedclass: true
      }
    });

    return NextResponse.json({ student: updatedStudent });

  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
