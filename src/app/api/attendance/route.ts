import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    
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
      });

      // Get attendance records for teacher's subjects
      const attendance = await prisma.attendance.findMany({
        where: { 
          SubjectID: { 
            in: subjects.map(s => s.SubjectID) 
          } 
        },
        include: {
          subject: true
        },
        orderBy: [
          { Date: 'desc' },
          { StudentID: 'asc' }
        ]
      });

      // Get student names for attendance records
      const attendanceWithNames = await Promise.all(
        attendance.map(async (record) => {
          try {
            const studentPerson = await prisma.$queryRaw`
              SELECT FirstName, LastName FROM person WHERE PersonID = ${record.StudentID}
            ` as any[];
            
            return {
              ...record,
              Student: {
                AdmissionNumber: record.StudentID,
                FirstName: studentPerson[0]?.FirstName || '',
                LastName: studentPerson[0]?.LastName || ''
              },
              Subject: record.subject
            };
          } catch (error) {
            return {
              ...record,
              Student: {
                AdmissionNumber: record.StudentID,
                FirstName: '',
                LastName: ''
              },
              Subject: record.subject
            };
          }
        })
      );

      // Get all students with names for the mark attendance form
      const students = await prisma.student.findMany({
        orderBy: { AdmissionNumber: 'asc' }
      });

      const studentsWithNames = await Promise.all(
        students.map(async (student) => {
          try {
            const studentPerson = await prisma.$queryRaw`
              SELECT FirstName, LastName FROM person WHERE PersonID = ${student.AdmissionNumber}
            ` as any[];
            
            return {
              AdmissionNumber: student.AdmissionNumber,
              FirstName: studentPerson[0]?.FirstName || '',
              LastName: studentPerson[0]?.LastName || ''
            };
          } catch (error) {
            return {
              AdmissionNumber: student.AdmissionNumber,
              FirstName: '',
              LastName: ''
            };
          }
        })
      );

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
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    
    if (session.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }    const attendanceData = await request.json();

    // Validate required fields
    const requiredFields = ['StudentID', 'SubjectID', 'Date', 'Status'];
    for (const field of requiredFields) {
      if (!attendanceData[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
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

    const subject = await prisma.subject.findUnique({
      where: { SubjectID: attendanceData.SubjectID }
    });

    if (!subject || subject.TeacherID !== person.teacher.TeacherID) {
      return NextResponse.json({ error: 'Access denied: You can only manage attendance for your own subjects' }, { status: 403 });
    }

    // Check if attendance already exists for this student, subject, and date
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        StudentID: attendanceData.StudentID,
        SubjectID: attendanceData.SubjectID,
        Date: new Date(attendanceData.Date)
      }
    });

    if (existingAttendance) {
      return NextResponse.json({ error: 'Attendance already recorded for this date' }, { status: 400 });
    }    const attendance = await prisma.attendance.create({
      data: {
        StudentID: attendanceData.StudentID,
        SubjectID: attendanceData.SubjectID,
        Date: new Date(attendanceData.Date),
        Status: attendanceData.Status
      },
      include: {
        Subject: true
      }
    });

    // Get student name from person table
    const studentPerson = await prisma.$queryRaw`
      SELECT FirstName, LastName FROM person WHERE PersonID = ${attendance.StudentID}
    ` as any[];

    return NextResponse.json({ 
      attendance: {
        ...attendance,
        Student: {
          AdmissionNumber: attendance.StudentID,
          FirstName: studentPerson[0]?.FirstName || '',
          LastName: studentPerson[0]?.LastName || ''
        }
      }
    }, { status: 201 });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { 
        status: error.message === 'Unauthorized' ? 401 : 403 
      });
    }
    console.error('Create attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/attendance - Update attendance record (teachers only)
export async function PUT(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session');
    
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
    }

    const existingAttendance = await prisma.attendance.findUnique({
      where: { AttendanceID: attendanceId },
      include: { Subject: true }
    });

    if (!existingAttendance || existingAttendance.Subject.TeacherID !== person.teacher.TeacherID) {
      return NextResponse.json({ error: 'Attendance record not found or access denied' }, { status: 404 });
    }

    // Convert Date if provided
    if (updateData.Date) {
      updateData.Date = new Date(updateData.Date);
    }

    const attendance = await prisma.attendance.update({
      where: { AttendanceID: attendanceId },
      data: updateData,
      include: {
        Student: true,
        Subject: true
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
    const session = await authenticate(request, ['TEACHER']);
    const { searchParams } = new URL(request.url);
    const attendanceId = searchParams.get('attendanceId');

    if (!attendanceId) {
      return NextResponse.json({ error: 'Attendance ID is required' }, { status: 400 });
    }

    // Verify teacher can delete this attendance
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { teacherProfile: true }
    });

    if (!user?.teacherProfile) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }    const existingAttendance = await prisma.attendance.findUnique({
      where: { AttendanceID: attendanceId },
      include: { Subject: true }
    });

    if (!existingAttendance || existingAttendance.Subject.TeacherID !== person.teacher.TeacherID) {
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
