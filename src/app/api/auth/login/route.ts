import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Auto-seed: Ensure the default admin exists
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
            username: 'turfthings999@gmail.com',
            password: 'TurfThings123',
          },
        });
      } catch (seedErr) {
        console.error('Failed to seed default admin:', seedErr);
      }
    }

    // Ensure legacy 'admin' doesn't sneak in; if it does, it'll just fail standard auth.
    
    // Find user in database
    let admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin || admin.password !== password) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    return NextResponse.json({ success: true, message: 'Login successful' }, { status: 200 });
  } catch (error) {
    console.error('Auth login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
