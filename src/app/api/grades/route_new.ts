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

// GET /api/grades - Get grades
export async function GET(request: NextRequest) {
  try {
    const session = await authenticate(request);
    
    if (session.role === 'TEACHER') {
      // Get teacher's person and profile - using the working pattern from attendance API
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

      // Get grades for all subjects taught by this teacher
      const subjectIds = subjects.map(s => s.SubjectID);
      const grades = await prisma.grade.findMany({
        where: { SubjectID: { in: subjectIds } },
        include: {
          subject: true
        },
        orderBy: [
          { Term: 'desc' }
        ]
      });

      // Get all students for form dropdowns
      const allStudents = await prisma.student.findMany({});

      // Transform grades to include proper student names from Person table
      const transformedGrades = await Promise.all(grades.map(async (grade) => {
        const studentPerson = await prisma.person.findUnique({
          where: { PersonID: grade.StudentID }
        });

        return {
          ...grade,
          Student: {
            AdmissionNumber: grade.StudentID,
            FirstName: studentPerson?.FirstName || '',
            LastName: studentPerson?.LastName || '',
          },
          Subject: {
            SubjectName: grade.subject.SubjectName
          }
        };
      }));

      // Transform students for dropdown - get names from Person table
      const transformedStudents = await Promise.all(allStudents.map(async (student) => {
        const studentPerson = await prisma.person.findUnique({
          where: { PersonID: student.AdmissionNumber }
        });
        
        return {
          AdmissionNumber: student.AdmissionNumber,
          FirstName: studentPerson?.FirstName || '',
          LastName: studentPerson?.LastName || '',
        };
      }));

      return NextResponse.json({ 
        grades: transformedGrades,
        students: transformedStudents,
        subjects 
      });
    }

    if (session.role === 'STUDENT') {
      // Get student using PersonID from session
      const student = await prisma.student.findUnique({
        where: { AdmissionNumber: session.userId }
      });

      if (!student) {
        return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
      }

      const grades = await prisma.grade.findMany({
        where: { StudentID: student.AdmissionNumber },
        include: { 
          subject: true
        },
        orderBy: { Term: 'desc' }
      });

      // Transform grades to include proper subject names
      const transformedGrades = grades.map(grade => ({
        ...grade,
        Subject: {
          SubjectName: grade.subject.SubjectName
        }
      }));

      return NextResponse.json({ grades: transformedGrades });
    }

    if (session.role === 'PARENT') {
      // Get parent using PersonID from session
      const parent = await prisma.parent.findUnique({
        where: { ParentID: session.userId }
      });

      if (!parent) {
        return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 });
      }

      // Get children
      const children = await prisma.student.findMany({
        where: { ParentID: parent.ParentID }
      });

      const studentIds = children.map(c => c.AdmissionNumber);
      const grades = await prisma.grade.findMany({
        where: { StudentID: { in: studentIds } },
        include: {
          subject: true
        },
        orderBy: [
          { Term: 'desc' }
        ]
      });

      // Transform grades to include student names from Person table
      const transformedGrades = await Promise.all(grades.map(async (grade) => {
        const studentPerson = await prisma.person.findUnique({
          where: { PersonID: grade.StudentID }
        });

        return {
          ...grade,
          Student: {
            AdmissionNumber: grade.StudentID,
            FirstName: studentPerson?.FirstName || '',
            LastName: studentPerson?.LastName || '',
          },
          Subject: {
            SubjectName: grade.subject.SubjectName
          }
        };
      }));

      return NextResponse.json({ grades: transformedGrades });
    }

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { 
        status: error.message === 'Unauthorized' ? 401 : 403 
      });
    }
    console.error('Get grades error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/grades - Create new grade (teachers only)
export async function POST(request: NextRequest) {
  try {
    const session = await authenticate(request, ['TEACHER']);
    const gradeData = await request.json();

    // Validate required fields
    const requiredFields = ['StudentID', 'SubjectID', 'Term', 'TotalScore'];
    for (const field of requiredFields) {
      if (!gradeData[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    // Verify teacher teaches this subject
    const person = await prisma.person.findUnique({
      where: { PersonID: session.userId },
      include: { teacher: true }
    });

    if (!person || !person.teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    const subject = await prisma.subject.findUnique({
      where: { SubjectID: gradeData.SubjectID }
    });

    if (!subject || subject.TeacherID !== person.teacher.TeacherID) {
      return NextResponse.json({ error: 'Access denied: You can only grade your own subjects' }, { status: 403 });
    }

    // Generate unique GradeID
    const gradeCount = await prisma.grade.count();
    const gradeId = `G${(gradeCount + 1).toString().padStart(3, '0')}`;

    // Calculate grade based on total score
    let grade = 'F';
    if (gradeData.TotalScore >= 90) grade = 'A+';
    else if (gradeData.TotalScore >= 80) grade = 'A';
    else if (gradeData.TotalScore >= 70) grade = 'B+';
    else if (gradeData.TotalScore >= 60) grade = 'B';
    else if (gradeData.TotalScore >= 50) grade = 'C+';
    else if (gradeData.TotalScore >= 40) grade = 'C';
    else if (gradeData.TotalScore >= 30) grade = 'D+';
    else if (gradeData.TotalScore >= 20) grade = 'D';

    const newGrade = await prisma.grade.create({
      data: {
        GradeID: gradeId,
        StudentID: gradeData.StudentID,
        SubjectID: gradeData.SubjectID,
        Term: gradeData.Term,
        CA: gradeData.CA || 0,
        Exam: gradeData.Exam || 0,
        TotalScore: gradeData.TotalScore,
        Grade: grade
      },
      include: {
        subject: true
      }
    });

    return NextResponse.json({ grade: newGrade }, { status: 201 });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { 
        status: error.message === 'Unauthorized' ? 401 : 403 
      });
    }
    console.error('Create grade error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/grades - Update grade (teachers only)
export async function PUT(request: NextRequest) {
  try {
    const session = await authenticate(request, ['TEACHER']);
    const { gradeId, ...updateData } = await request.json();

    if (!gradeId) {
      return NextResponse.json({ error: 'Grade ID is required' }, { status: 400 });
    }

    // Verify teacher can update this grade
    const person = await prisma.person.findUnique({
      where: { PersonID: session.userId },
      include: { teacher: true }
    });

    if (!person || !person.teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    const existingGrade = await prisma.grade.findUnique({
      where: { GradeID: gradeId },
      include: { subject: true }
    });

    if (!existingGrade || existingGrade.subject.TeacherID !== person.teacher.TeacherID) {
      return NextResponse.json({ error: 'Grade not found or access denied' }, { status: 404 });
    }

    // Recalculate grade if TotalScore is updated
    if (updateData.TotalScore !== undefined) {
      let grade = 'F';
      if (updateData.TotalScore >= 90) grade = 'A+';
      else if (updateData.TotalScore >= 80) grade = 'A';
      else if (updateData.TotalScore >= 70) grade = 'B+';
      else if (updateData.TotalScore >= 60) grade = 'B';
      else if (updateData.TotalScore >= 50) grade = 'C+';
      else if (updateData.TotalScore >= 40) grade = 'C';
      else if (updateData.TotalScore >= 30) grade = 'D+';
      else if (updateData.TotalScore >= 20) grade = 'D';
      updateData.Grade = grade;
    }

    const grade = await prisma.grade.update({
      where: { GradeID: gradeId },
      data: updateData,
      include: {
        subject: true
      }
    });

    return NextResponse.json({ grade });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { 
        status: error.message === 'Unauthorized' ? 401 : 403 
      });
    }
    console.error('Update grade error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/grades - Delete grade (teachers only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await authenticate(request, ['TEACHER']);
    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get('gradeId');

    if (!gradeId) {
      return NextResponse.json({ error: 'Grade ID is required' }, { status: 400 });
    }

    // Verify teacher can delete this grade
    const person = await prisma.person.findUnique({
      where: { PersonID: session.userId },
      include: { teacher: true }
    });

    if (!person || !person.teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    const existingGrade = await prisma.grade.findUnique({
      where: { GradeID: gradeId },
      include: { subject: true }
    });

    if (!existingGrade || existingGrade.subject.TeacherID !== person.teacher.TeacherID) {
      return NextResponse.json({ error: 'Grade not found or access denied' }, { status: 404 });
    }

    await prisma.grade.delete({
      where: { GradeID: gradeId }
    });

    return NextResponse.json({ message: 'Grade deleted successfully' });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { 
        status: error.message === 'Unauthorized' ? 401 : 403 
      });
    }
    console.error('Delete grade error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
