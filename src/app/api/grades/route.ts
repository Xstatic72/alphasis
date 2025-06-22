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
    const { searchParams } = new URL(request.url);
    
    if (session.role === 'TEACHER') {
      // Get teacher's grades
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { teacherProfile: true }
      });

      if (!user?.teacherProfile) {
        return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
      }

      // Get teacher's subjects
      const subjects = await prisma.subject.findMany({
        where: { TeacherID: user.teacherProfile.TeacherID }
      });

      const subjectIds = subjects.map(s => s.SubjectID);
      const grades = await prisma.grade.findMany({
        where: { SubjectID: { in: subjectIds } },
        include: {
          Student: true,
          Subject: true
        },
        orderBy: [
          { Term: 'desc' },
          { Student: { LastName: 'asc' } }
        ]
      });

      return NextResponse.json({ grades });
    }

    if (session.role === 'STUDENT') {
      // Get student's grades
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { studentProfile: true }
      });

      if (!user?.studentProfile) {
        return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
      }

      const grades = await prisma.grade.findMany({
        where: { StudentID: user.studentProfile.AdmissionNumber },
        include: { Subject: true },
        orderBy: { Term: 'desc' }
      });

      return NextResponse.json({ grades });
    }

    if (session.role === 'PARENT') {
      // Get children's grades
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { parentProfile: true }
      });

      if (!user?.parentProfile) {
        return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 });
      }

      const children = await prisma.student.findMany({
        where: { ParentID: user.parentProfile.ParentID }
      });

      const studentIds = children.map(c => c.AdmissionNumber);
      const grades = await prisma.grade.findMany({
        where: { StudentID: { in: studentIds } },
        include: {
          Student: true,
          Subject: true
        },
        orderBy: [
          { Term: 'desc' },
          { Student: { LastName: 'asc' } }
        ]
      });

      return NextResponse.json({ grades });
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
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { teacherProfile: true }
    });

    if (!user?.teacherProfile) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    const subject = await prisma.subject.findUnique({
      where: { SubjectID: gradeData.SubjectID }
    });

    if (!subject || subject.TeacherID !== user.teacherProfile.TeacherID) {
      return NextResponse.json({ error: 'Access denied: You can only grade your own subjects' }, { status: 403 });
    }

    // Calculate grade based on total score
    let grade = 'F';
    if (gradeData.TotalScore >= 90) grade = 'A';
    else if (gradeData.TotalScore >= 80) grade = 'B';
    else if (gradeData.TotalScore >= 70) grade = 'C';
    else if (gradeData.TotalScore >= 60) grade = 'D';    const newGrade = await prisma.grade.create({
      data: {
        StudentID: gradeData.StudentID,
        SubjectID: gradeData.SubjectID,
        Term: gradeData.Term,
        CA: gradeData.CA || 0,
        Exam: gradeData.Exam || 0,
        TotalScore: gradeData.TotalScore,
        Grade: grade
      },
      include: {
        Student: true,
        Subject: true
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
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { teacherProfile: true }
    });

    if (!user?.teacherProfile) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    const existingGrade = await prisma.grade.findUnique({
      where: { GradeID: gradeId },
      include: { Subject: true }
    });

    if (!existingGrade || existingGrade.Subject.TeacherID !== user.teacherProfile.TeacherID) {
      return NextResponse.json({ error: 'Grade not found or access denied' }, { status: 404 });
    }

    // Recalculate grade if TotalScore is updated
    if (updateData.TotalScore !== undefined) {
      let grade = 'F';
      if (updateData.TotalScore >= 90) grade = 'A';
      else if (updateData.TotalScore >= 80) grade = 'B';
      else if (updateData.TotalScore >= 70) grade = 'C';
      else if (updateData.TotalScore >= 60) grade = 'D';
      updateData.Grade = grade;
    }

    const grade = await prisma.grade.update({
      where: { GradeID: gradeId },
      data: updateData,
      include: {
        Student: true,
        Subject: true
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
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { teacherProfile: true }
    });

    if (!user?.teacherProfile) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    const existingGrade = await prisma.grade.findUnique({
      where: { GradeID: gradeId },
      include: { Subject: true }
    });

    if (!existingGrade || existingGrade.Subject.TeacherID !== user.teacherProfile.TeacherID) {
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
