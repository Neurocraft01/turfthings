import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper to convert HH:MM to minutes for easy comparison
const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// GET /api/bookings
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const search = searchParams.get('search');
    
    // Build query conditions
    const where: any = {};
    if (date) where.bookingDate = date;
    
    if (search) {
      where.OR = [
        { playerName: { contains: search } },
        { mobileNumber: { contains: search } },
        { id: { contains: search } }
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { slotStart: 'asc' }
    });

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

// POST /api/bookings
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      playerName,
      mobileNumber,
      bookingDate,
      slotStart,
      slotEnd,
      totalSlots,
      totalAmount,
      paidAmount,
      bookingStatus
    } = body;

    // Validation: Check for slot conflict
    const startMins = timeToMinutes(slotStart);
    const endMins = timeToMinutes(slotEnd);

    // Get all existing bookings for this date that are NOT cancelled
    const existingBookings = await prisma.booking.findMany({
      where: {
        bookingDate,
        bookingStatus: { not: 'cancelled' }
      }
    });

    // Check for overlap
    const hasConflict = existingBookings.some((b) => {
      const bStart = timeToMinutes(b.slotStart);
      const bEnd = timeToMinutes(b.slotEnd);
      // Overlap condition: (StartA < EndB) and (EndA > StartB)
      return startMins < bEnd && endMins > bStart;
    });

    if (hasConflict) {
      return NextResponse.json(
        { error: 'Slot conflict detected. One or more selected slots are already booked.' },
        { status: 409 }
      );
    }

    const remainingAmount = totalAmount - paidAmount;

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        playerName,
        mobileNumber,
        bookingDate,
        slotStart,
        slotEnd,
        totalSlots,
        totalAmount,
        paidAmount,
        remainingAmount,
        bookingStatus: bookingStatus || 'pending',
        whatsappNumber: mobileNumber, // Assuming standard mobile maps to WA
      }
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('Failed to create booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
