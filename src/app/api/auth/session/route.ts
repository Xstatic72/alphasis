import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie?.value) {
      return NextResponse.json({ session: null }, { status: 401 });
    }    // In a real app, you'd validate a JWT token here
    // For now, we'll parse the simple session format
    const sessionData = JSON.parse(sessionCookie.value);
    
    // Verify the person still exists
    const person = await prisma.person.findUnique({
      where: { PersonID: sessionData.userId }
    });

    if (!person) {
      return NextResponse.json({ session: null }, { status: 401 });
    }    return NextResponse.json({
      session: {
        userId: person.PersonID,
        role: sessionData.role,
        name: sessionData.name,
        personId: person.PersonID
      }
    });

  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ session: null }, { status: 401 });
  }
}
