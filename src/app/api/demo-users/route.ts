import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get sample users from different roles
    const teachers = await prisma.teacher.findMany({
      take: 3,
      include: { person: true }
    });

    const parents = await prisma.parent.findMany({
      take: 3,
      include: { person: true }
    });

    // Get students (those who have PersonIDs matching their AdmissionNumbers)
    const students = await prisma.student.findMany({
      take: 3
    });

    // Get corresponding persons for students
    const studentPersons = await prisma.person.findMany({
      where: {
        PersonID: {
          in: students.map(s => s.AdmissionNumber)
        }
      }
    });

    const demoUsers = [
      ...teachers.map(teacher => ({
        PersonID: teacher.person.PersonID,
        FirstName: teacher.person.FirstName,
        LastName: teacher.person.LastName,
        role: 'TEACHER'
      })),
      ...parents.map(parent => ({
        PersonID: parent.person.PersonID,
        FirstName: parent.person.FirstName,
        LastName: parent.person.LastName,
        role: 'PARENT'
      })),
      ...studentPersons.map(person => ({
        PersonID: person.PersonID,
        FirstName: person.FirstName,
        LastName: person.LastName,
        role: 'STUDENT'
      }))
    ];

    return NextResponse.json({ users: demoUsers });

  } catch (error) {
    console.error('Error fetching demo users:', error);
    return NextResponse.json({ error: 'Failed to fetch demo users' }, { status: 500 });
  }
}
