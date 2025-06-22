import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // For MVP: Simple authentication using PersonID as username
    // Password is "password123" for everyone
    if (password !== 'password123') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Find person in database using PersonID as username
    const person = await prisma.person.findUnique({
      where: { PersonID: username },
      include: {
        teacher: true,
        parent: true
      }
    });

    if (!person) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Determine user role and profile
    let role = 'STUDENT'; // Default role
    let profile = null;

    if (person.teacher) {
      role = 'TEACHER';
      profile = person.teacher;
    } else if (person.parent) {
      role = 'PARENT';
      profile = person.parent;
    } else {
      // Check if this person is a student
      const student = await prisma.student.findFirst({
        where: { AdmissionNumber: person.PersonID },
        include: { Renamedclass: true }
      });
      if (student) {
        role = 'STUDENT';
        profile = student;
      }
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session', JSON.stringify({
      userId: person.PersonID,
      role: role,
      name: `${person.FirstName} ${person.LastName}`,
      personId: person.PersonID
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return NextResponse.json({
      user: {
        id: person.PersonID,
        username: person.PersonID,
        role: role,
        name: `${person.FirstName} ${person.LastName}`,
        profile: profile
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
