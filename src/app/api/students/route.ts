import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Generate student ID
function generateStudentId(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 900) + 100; // 3-digit random number
  return `AB${year}0${random}`;
}

export async function GET() {
  try {
    // Get all students with their class information
    const students = await prisma.student.findMany({
      include: { 
        Renamedclass: true 
      },
      orderBy: { AdmissionNumber: 'asc' }
    });

    // Get corresponding person data for students
    const studentsWithNames = await Promise.all(
      students.map(async (student) => {
        try {
          const person = await prisma.person.findUnique({
            where: { PersonID: student.AdmissionNumber }
          });
          
          return {
            ...student,
            FirstName: person?.FirstName || '',
            LastName: person?.LastName || '',
            Class: student.Renamedclass
          };
        } catch (error) {
          return {
            ...student,
            FirstName: '',
            LastName: '',
            Class: student.Renamedclass
          };
        }
      })
    );

    // Get all classes
    const classes = await prisma.renamedclass.findMany({
      orderBy: { ClassName: 'asc' }
    });

    return NextResponse.json({
      students: studentsWithNames,
      classes: classes
    });

  } catch (error) {
    console.error('Students fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { FirstName, LastName, DateOfBirth, Gender, ParentContact, Address, StudentClassID } = await request.json();

    // Generate a unique student ID
    let studentId = generateStudentId();
    
    // Ensure the ID is unique
    let existingStudent = await prisma.student.findUnique({
      where: { AdmissionNumber: studentId }
    });
    
    while (existingStudent) {
      studentId = generateStudentId();
      existingStudent = await prisma.student.findUnique({
        where: { AdmissionNumber: studentId }
      });
    }    // Validate that the StudentClassID exists
    if (StudentClassID) {
      const classExists = await prisma.renamedclass.findUnique({
        where: { ClassID: StudentClassID }
      });
      
      if (!classExists) {
        return NextResponse.json({ 
          error: `Class ID ${StudentClassID} does not exist. Please use a valid class ID.` 
        }, { status: 400 });
      }
    }

    // Get a default class if none provided
    let defaultClassID = 'AB01';
    if (!StudentClassID) {
      const firstClass = await prisma.renamedclass.findFirst();
      if (firstClass) {
        defaultClassID = firstClass.ClassID;
      }
    }

    // Create person record first
    await prisma.person.create({
      data: {
        PersonID: studentId,
        FirstName,
        LastName
      }
    });

    // Create student record
    const newStudent = await prisma.student.create({
      data: {
        AdmissionNumber: studentId,
        DateOfBirth: new Date(DateOfBirth),
        Gender: Gender === 'Male' ? 'M' : 'F',
        StudentClassID: StudentClassID || defaultClassID,
        ParentContact,
        Address
      },
      include: {
        Renamedclass: true
      }
    });

    return NextResponse.json({
      message: 'Student added successfully',
      student: {
        ...newStudent,
        FirstName,
        LastName,
        Class: newStudent.Renamedclass
      }
    });

  } catch (error) {
    console.error('Add student error:', error);
    return NextResponse.json({ error: 'Failed to add student' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { admissionNumber, FirstName, LastName, DateOfBirth, Gender, ParentContact, Address, StudentClassID } = await request.json();

    // Update person record
    await prisma.person.update({
      where: { PersonID: admissionNumber },
      data: {
        FirstName,
        LastName
      }
    });

    // Update student record
    const updatedStudent = await prisma.student.update({
      where: { AdmissionNumber: admissionNumber },
      data: {
        DateOfBirth: new Date(DateOfBirth),
        Gender: Gender === 'Male' ? 'M' : 'F',
        StudentClassID: StudentClassID,
        ParentContact,
        Address
      },
      include: {
        Renamedclass: true
      }
    });

    return NextResponse.json({
      message: 'Student updated successfully',
      student: {
        ...updatedStudent,
        FirstName,
        LastName,
        Class: updatedStudent.Renamedclass
      }
    });
  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}
