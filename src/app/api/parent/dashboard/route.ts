import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    
    if (session.role !== 'PARENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }    // Get person and parent profile
    const person = await prisma.person.findUnique({
      where: { PersonID: session.userId },
      include: {
        parent: true
      }
    });

    if (!person || !person.parent) {
      return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 });
    }    // Get parent's children with names from person table
    const children = await prisma.student.findMany({
      where: { ParentID: person.parent.ParentID },
      include: { Renamedclass: true }
    });

    // Get corresponding person data for children
    const childrenWithNames = await Promise.all(
      children.map(async (child) => {
        try {
          const childPerson = await prisma.$queryRaw`
            SELECT FirstName, LastName FROM person WHERE PersonID = ${child.AdmissionNumber}
          ` as any[];
          
          return {
            ...child,
            FirstName: childPerson[0]?.FirstName || '',
            LastName: childPerson[0]?.LastName || '',
            FullName: childPerson[0] ? `${childPerson[0].FirstName} ${childPerson[0].LastName}` : child.AdmissionNumber,
            Class: child.Renamedclass
          };
        } catch (error) {
          return {
            ...child,
            FirstName: '',
            LastName: '',
            FullName: child.AdmissionNumber,
            Class: child.Renamedclass
          };
        }
      })
    );// Get all grades for all children
    const grades = await prisma.grade.findMany({
      where: {
        StudentID: {
          in: children.map(child => child.AdmissionNumber)
        }
      },
      include: { 
        student: true,
        subject: true 
      },
      orderBy: { Term: 'desc' }
    });

    // Get all attendance for all children
    const attendance = await prisma.attendance.findMany({
      where: {
        StudentID: {
          in: children.map(child => child.AdmissionNumber)
        }
      },
      include: { 
        student: true,
        subject: true 
      },
      orderBy: { Date: 'desc' },
      take: 200
    });

    // Get all payments for all children
    const payments = await prisma.payment.findMany({
      where: {
        StudentID: {
          in: children.map(child => child.AdmissionNumber)
        }
      },
      orderBy: { PaymentDate: 'desc' }
    });    return NextResponse.json({
      user: {
        PersonID: person.PersonID,
        name: `${person.FirstName} ${person.LastName}`,
        parentProfile: person.parent
      },
      children: childrenWithNames,
      grades,
      attendance,
      payments
    });

  } catch (error) {
    console.error('Parent dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
