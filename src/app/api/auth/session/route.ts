import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie?.value) {
      return NextResponse.json({ session: null }, { status: 401 });
    }

    // In a real app, you'd validate a JWT token here
    // For now, we'll parse the simple session format
    const sessionData = JSON.parse(sessionCookie.value);
    
    // Verify the user still exists
    const user = await prisma.user.findUnique({
      where: { id: sessionData.userId }
    });

    if (!user) {
      return NextResponse.json({ session: null }, { status: 401 });
    }

    return NextResponse.json({
      session: {
        userId: user.id,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ session: null }, { status: 401 });
  }
}
