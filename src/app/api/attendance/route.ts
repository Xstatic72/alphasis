import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session');
    
    console.log('Session cookie found:', !!sessionCookie);
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    console.log('Session parsed:', session);
    
    if (session.role === 'TEACHER') {
      // Get teacher's person and profile
      const person = await prisma.person.findUnique({
        where: { PersonID: session.userId },
        include: {
          teacher: true
        }
      });

      if (!person || !person.teacher) {
        return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
      }

      // Get teacher's subjects
      const subjects = await prisma.subject.findMany({
        where: { TeacherID: person.teacher.TeacherID },
        orderBy: { SubjectName: 'asc' }
      });      // Get attendance records for teacher's subjects
      const attendance = await prisma.attendance.findMany({
        where: { 
          SubjectID: { 
            in: subjects.map(s => s.SubjectID) 
          } 
        },
        include: {
          student: true,
          subject: true
        },
        orderBy: [
          { Date: 'desc' },
          { StudentID: 'asc' }
        ]
      });

      // Get all student names in a single query
      const studentIds = [...new Set(attendance.map(record => record.StudentID))];
      const studentPersons = await prisma.person.findMany({
        where: {
          PersonID: {
            in: studentIds
          }
        },
        select: {
          PersonID: true,
          FirstName: true,
          LastName: true
        }
      });

      // Create a map for quick lookup
      const personMap = new Map(
        studentPersons.map(person => [person.PersonID, person])
      );

      // Transform attendance records to match frontend expectations
      const attendanceWithNames = attendance.map((record) => {
        const person = personMap.get(record.StudentID);
        return {
          ...record,
          student: {
            AdmissionNumber: record.StudentID,
            FirstName: person?.FirstName || '',
            LastName: person?.LastName || ''
          },
          subject: record.subject
        };
      });      // Get all students with names for the mark attendance form
      const students = await prisma.student.findMany({
        orderBy: { AdmissionNumber: 'asc' }
      });

      // Get all student person records
      const allStudentPersons = await prisma.person.findMany({
        where: {
          PersonID: {
            in: students.map(s => s.AdmissionNumber)
          }
        },
        select: {
          PersonID: true,
          FirstName: true,
          LastName: true
        }
      });

      // Create a map for quick lookup
      const allPersonMap = new Map(
        allStudentPersons.map(person => [person.PersonID, person])
      );

      const studentsWithNames = students.map((student) => {
        const person = allPersonMap.get(student.AdmissionNumber);
        return {
          AdmissionNumber: student.AdmissionNumber,
          FirstName: person?.FirstName || '',
          LastName: person?.LastName || ''
        };
      });

      return NextResponse.json({ 
        attendance: attendanceWithNames, 
        subjects, 
        students: studentsWithNames 
      });
    }

    if (session.role === 'STUDENT') {
      // Get student's attendance
      const attendance = await prisma.attendance.findMany({
        where: { StudentID: session.userId },
        include: { subject: true },
        orderBy: { Date: 'desc' }
      });

      return NextResponse.json({ attendance });
    }

    if (session.role === 'PARENT') {
      // Get parent's person and profile
      const person = await prisma.person.findUnique({
        where: { PersonID: session.userId },
        include: {
          parent: true
        }
      });

      if (!person || !person.parent) {
        return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 });
      }

      // Get children's attendance
      const children = await prisma.student.findMany({
        where: { ParentID: person.parent.ParentID }
      });

      const attendance = await prisma.attendance.findMany({
        where: {
          StudentID: {
            in: children.map(child => child.AdmissionNumber)
          }
        },
        include: { subject: true },
        orderBy: { Date: 'desc' }
      });

      return NextResponse.json({ attendance });
    }    return NextResponse.json({ error: 'Access denied' }, { status: 403 });

  } catch (error) {
    console.error('Attendance fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/attendance - Create attendance record (teachers only)
export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session');
    
    console.log('POST Session cookie found:', !!sessionCookie);
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    console.log('POST Session parsed:', session);
    
    if (session.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }    const attendanceData = await request.json();

    // Validate required fields
    const requiredFields = ['StudentID', 'SubjectID', 'Date', 'Status'];
    for (const field of requiredFields) {
      if (!attendanceData[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }    // Map frontend status values to database enum values
    let dbStatus: 'PRESENT' | 'ABSENT';
    if (attendanceData.Status === 'Present' || attendanceData.Status === '1' || attendanceData.Status === 'PRESENT') {
      dbStatus = 'PRESENT'; // Use the enum value directly
    } else if (attendanceData.Status === 'Absent' || attendanceData.Status === '0' || attendanceData.Status === 'ABSENT') {
      dbStatus = 'ABSENT'; // Use the enum value directly
    } else {
      return NextResponse.json({ error: 'Invalid status. Must be Present or Absent' }, { status: 400 });
    }    console.log('Attendance data received:', attendanceData);
    console.log('Mapped status:', dbStatus);

    // Get teacher's person and profile
    const person = await prisma.person.findUnique({
      where: { PersonID: session.userId },
      include: {
        teacher: true
      }
    });

    if (!person || !person.teacher) {
      console.error('Teacher profile not found for user:', session.userId);
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    console.log('Teacher found:', person.teacher.TeacherID);

    // Verify subject exists and teacher has permission
    const subject = await prisma.subject.findUnique({
      where: { SubjectID: attendanceData.SubjectID }
    });

    console.log('Subject found:', subject);
    console.log('Teacher ID from person:', person.teacher.TeacherID);
    console.log('Subject TeacherID:', subject?.TeacherID);

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    if (subject.TeacherID !== person.teacher.TeacherID) {
      return NextResponse.json({ 
        error: `Access denied: You can only manage attendance for your own subjects. Your TeacherID: ${person.teacher.TeacherID}, Subject TeacherID: ${subject.TeacherID}` 
      }, { status: 403 });
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { AdmissionNumber: attendanceData.StudentID }
    });

    console.log('Student found:', student ? 'Yes' : 'No');

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }// Check if attendance already exists for this student, subject, and date
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        StudentID: attendanceData.StudentID,
        SubjectID: attendanceData.SubjectID,
        Date: new Date(attendanceData.Date)
      }
    });

    if (existingAttendance) {
      // Update existing attendance instead of creating new one
      const updatedAttendance = await prisma.attendance.update({
        where: { AttendanceID: existingAttendance.AttendanceID },
        data: {
          Status: dbStatus as any
        },
        include: {
          subject: true
        }
      });      // Get student name from person table
      const studentPerson = await prisma.person.findUnique({
        where: { PersonID: updatedAttendance.StudentID },
        select: {
          FirstName: true,
          LastName: true
        }
      });

      return NextResponse.json({ 
        attendance: {
          ...updatedAttendance,
          student: {
            AdmissionNumber: updatedAttendance.StudentID,
            FirstName: studentPerson?.FirstName || '',
            LastName: studentPerson?.LastName || ''
          }
        }
      });
    }// Generate a unique AttendanceID (4 characters)
    const generateAttendanceID = async (): Promise<string> => {
      let attendanceID: string;
      let isUnique = false;
      let attempts = 0;
      
      while (!isUnique && attempts < 100) {
        // Generate a 4-character ID (A + 3 digits)
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        attendanceID = `A${randomNum}`;
        
        // Check if this ID already exists
        const existing = await prisma.attendance.findUnique({
          where: { AttendanceID: attendanceID }
        });
        
        if (!existing) {
          isUnique = true;
        }
        attempts++;
      }
      
      if (!isUnique) {
        throw new Error('Unable to generate unique AttendanceID');
      }
      
      return attendanceID!;
    };    const attendanceID = await generateAttendanceID();
    
    console.log('Creating attendance with ID:', attendanceID);
    console.log('Data to insert:', {
      AttendanceID: attendanceID,
      StudentID: attendanceData.StudentID,
      SubjectID: attendanceData.SubjectID,
      Date: new Date(attendanceData.Date),
      Status: dbStatus
    });

    const attendance = await prisma.attendance.create({
      data: {
        AttendanceID: attendanceID,
        StudentID: attendanceData.StudentID,
        SubjectID: attendanceData.SubjectID,
        Date: new Date(attendanceData.Date),
        Status: dbStatus as any // Use the enum value
      },
      include: {
        subject: true
      }
    });

    console.log('Attendance created successfully:', attendance.AttendanceID);// Get student name from person table
    const studentPerson = await prisma.person.findUnique({
      where: { PersonID: attendance.StudentID },
      select: {
        FirstName: true,
        LastName: true
      }
    });

    return NextResponse.json({ 
      attendance: {
        ...attendance,
        student: {
          AdmissionNumber: attendance.StudentID,
          FirstName: studentPerson?.FirstName || '',
          LastName: studentPerson?.LastName || ''
        }
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Create attendance error:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Handle specific Prisma errors
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json({ error: 'Invalid student or subject ID' }, { status: 400 });
      }
      
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({ error: 'Attendance record already exists for this date' }, { status: 409 });
      }
      
      return NextResponse.json({ error: error.message }, { 
        status: error.message === 'Unauthorized' ? 401 : 403 
      });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/attendance - Update attendance record (teachers only)
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

    const { attendanceId, ...updateData } = await request.json();

    if (!attendanceId) {
      return NextResponse.json({ error: 'Attendance ID is required' }, { status: 400 });
    }

    // Get teacher's person and profile
    const person = await prisma.person.findUnique({
      where: { PersonID: session.userId },
      include: {
        teacher: true
      }
    });    if (!person || !person.teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }    const existingAttendance = await prisma.attendance.findUnique({
      where: { AttendanceID: attendanceId },
      include: { subject: true }
    });

    if (!existingAttendance || existingAttendance.subject.TeacherID !== person.teacher.TeacherID) {
      return NextResponse.json({ error: 'Attendance record not found or access denied' }, { status: 404 });
    }

    // Convert Date if provided
    if (updateData.Date) {
      updateData.Date = new Date(updateData.Date);
    }

    const attendance = await prisma.attendance.update({
      where: { AttendanceID: attendanceId },      data: updateData,
      include: {
        student: true,
        subject: true
      }
    });

    return NextResponse.json({ attendance });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { 
        status: error.message === 'Unauthorized' ? 401 : 403 
      });
    }
    console.error('Update attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/attendance - Delete attendance record (teachers only)
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const attendanceId = searchParams.get('attendanceId');

    if (!attendanceId) {
      return NextResponse.json({ error: 'Attendance ID is required' }, { status: 400 });
    }

    // Get teacher's person and profile
    const person = await prisma.person.findUnique({
      where: { PersonID: session.userId },
      include: {
        teacher: true
      }
    });

    if (!person || !person.teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    const existingAttendance = await prisma.attendance.findUnique({
      where: { AttendanceID: attendanceId },
      include: { subject: true }
    });

    if (!existingAttendance || existingAttendance.subject.TeacherID !== person.teacher.TeacherID) {
      return NextResponse.json({ error: 'Attendance record not found or access denied' }, { status: 404 });
    }

    await prisma.attendance.delete({
      where: { AttendanceID: attendanceId }
    });

    return NextResponse.json({ message: 'Attendance record deleted successfully' });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { 
        status: error.message === 'Unauthorized' ? 401 : 403 
      });
    }
    console.error('Delete attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
