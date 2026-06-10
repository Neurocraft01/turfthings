import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, token, password } = await request.json();

    if (!email || !token || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({
      where: { username: email },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // Check if token matches and hasn't expired
    if (
      admin.resetToken !== token || 
      !admin.resetTokenExpiry || 
      new Date() > new Date(admin.resetTokenExpiry)
    ) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // Valid token! Update password and clear token
    await prisma.admin.update({
      where: { username: email },
      data: { 
        password: password,
        resetToken: null,
        resetTokenExpiry: null
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
