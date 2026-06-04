import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 24 one-hour blocks from 00:00 to 23:00
const generateDailySlots = () => {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`);
  }
  return slots;
};

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// GET /api/slots?date=YYYY-MM-DD
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    // Fetch active bookings for this date
    const bookings = await prisma.booking.findMany({
      where: {
        bookingDate: date,
        bookingStatus: { not: 'cancelled' }
      }
    });

    const allSlots = generateDailySlots();
    const availableSlots = [];

    for (let i = 0; i < allSlots.length; i++) {
      const slotStartTime = allSlots[i];
      const slotStartMins = timeToMinutes(slotStartTime);
      const slotEndMins = slotStartMins + 60;

      // Check if this specific 30-min block falls within any existing booking
      const isBooked = bookings.some((b: any) => {
        const bStart = timeToMinutes(b.slotStart);
        const bEnd = timeToMinutes(b.slotEnd);
        // Overlap: slotStart < bEnd AND slotEnd > bStart
        return slotStartMins < bEnd && slotEndMins > bStart;
      });

      if (!isBooked) {
        availableSlots.push(slotStartTime);
      }
    }

    return NextResponse.json({ availableSlots, allSlots }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch slots:', error);
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
  }
}
