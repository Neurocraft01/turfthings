import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/twilio';

// Helper to convert HH:MM to minutes for easy comparison
const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// PATCH /api/bookings/[id]
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  // Wait for the params to resolve if necessary in Next.js 15+
  const params = await context.params;
  const { id } = params;

  try {
    const body = await request.json();
    const { bookingStatus, extendSlots, additionalAmount, paidAmount } = body;

    // Fetch the existing booking
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const updateData: any = {};
    let willConfirm = false;

    // Handle Status Update
    if (bookingStatus && bookingStatus !== booking.bookingStatus) {
      updateData.bookingStatus = bookingStatus;
      if (bookingStatus === 'confirmed') willConfirm = true;
    }

    // Handle Extension
    if (extendSlots && additionalAmount !== undefined) {
      const currentEndMins = timeToMinutes(booking.slotEnd);
      const newEndMins = currentEndMins + (extendSlots * 30);
      
      // Calculate new end time string
      const endH = Math.floor(newEndMins / 60);
      const endM = newEndMins % 60;
      const newSlotEnd = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

      // Check conflict for the extension period
      const existingBookings = await prisma.booking.findMany({
        where: {
          bookingDate: booking.bookingDate,
          id: { not: booking.id },
          bookingStatus: { not: 'cancelled' }
        }
      });

      const hasConflict = existingBookings.some((b: any) => {
        const bStart = timeToMinutes(b.slotStart);
        const bEnd = timeToMinutes(b.slotEnd);
        // We only check if the new extended period overlaps (currentEndMins to newEndMins)
        return currentEndMins < bEnd && newEndMins > bStart;
      });

      if (hasConflict) {
        return NextResponse.json(
          { error: 'Cannot extend booking. The requested extension slots are already booked.' },
          { status: 409 }
        );
      }

      updateData.slotEnd = newSlotEnd;
      updateData.totalSlots = booking.totalSlots + extendSlots;
      updateData.totalAmount = booking.totalAmount + additionalAmount;
      
      const newPaidAmount = paidAmount !== undefined ? paidAmount : booking.paidAmount;
      updateData.paidAmount = newPaidAmount;
      updateData.remainingAmount = updateData.totalAmount - newPaidAmount;
    } else if (paidAmount !== undefined) {
      // Just updating payments
      updateData.paidAmount = paidAmount;
      updateData.remainingAmount = booking.totalAmount - paidAmount;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
    });

    // Twilio Integration: Send confirmation if newly confirmed
    if (willConfirm && updatedBooking.whatsappNumber) {
      const message = `Booking Confirmed ✅\n\nHello ${updatedBooking.playerName},\n\nYour turf booking for ${updatedBooking.sport || 'Football'} has been confirmed.\n\nDate: ${updatedBooking.bookingDate}\nTime: ${updatedBooking.slotStart} to ${updatedBooking.slotEnd}\n\nTotal Amount: ₹${updatedBooking.totalAmount}\nPaid Amount: ₹${updatedBooking.paidAmount}\nRemaining Amount: ₹${updatedBooking.remainingAmount}\n\nThank you for booking with Turf Things.`;
      
      const twilioRes = await sendWhatsAppMessage(updatedBooking.whatsappNumber, message);
      
      if (twilioRes.success) {
        await prisma.booking.update({
          where: { id },
          data: { messageStatus: 'sent' }
        });
      } else {
        await prisma.booking.update({
          where: { id },
          data: { messageStatus: 'failed' }
        });
        console.error("Twilio failed:", twilioRes.error);
      }
    }

    return NextResponse.json({ booking: updatedBooking }, { status: 200 });
  } catch (error) {
    console.error('Failed to update booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
