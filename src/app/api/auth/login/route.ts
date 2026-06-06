import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Auto-seed: Check if there are any admins in the database
    let adminCount = 0;
    try {
      adminCount = await prisma.admin.count();
    } catch (e) {
      console.error('Failed to query admin count:', e);
    }

    if (adminCount === 0) {
      try {
        await prisma.admin.create({
          data: {
            username: 'admin',
            password: 'admin123', // Match the UI demo credentials
          },
        });
      } catch (seedErr) {
        console.error('Failed to seed default admin:', seedErr);
      }
    }

    // Find user in database
    let admin = await prisma.admin.findUnique({
      where: { username },
    });

    // If username is admin, and it doesn't exist, OR it exists but password doesn't match,
    // and the user provided a correct default password, dynamically update it.
    if (username === 'admin' && (password === 'admin123' || password === 'Turfthings12')) {
      if (!admin || admin.password !== password) {
        admin = await prisma.admin.upsert({
          where: { username: 'admin' },
          update: { password },
          create: { username: 'admin', password },
        });
      }
    }

    if (!admin || admin.password !== password) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    return NextResponse.json({ success: true, message: 'Login successful' }, { status: 200 });
  } catch (error) {
    console.error('Auth login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
