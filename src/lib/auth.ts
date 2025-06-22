import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

export type UserSession = {
  id: string;
  username: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  name: string;
};

export async function authenticateUser(username: string, password: string): Promise<UserSession | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        studentProfile: true,
        teacherProfile: true,
      },
    });

    if (!user || user.password !== password) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export function setUserSession(response: NextResponse, user: UserSession) {
  response.cookies.set('user-session', JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export function getUserSession(request: NextRequest): UserSession | null {
  try {
    const sessionCookie = request.cookies.get('user-session');
    if (!sessionCookie) return null;
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export function clearUserSession(response: NextResponse) {
  response.cookies.delete('user-session');
}
