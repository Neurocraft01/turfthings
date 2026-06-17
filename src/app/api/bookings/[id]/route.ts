import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendWhatsAppMessage, sendWhatsAppTemplate } from '@/lib/twilio';

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
    const { 
      bookingStatus, 
      extendSlots, 
      additionalAmount, 
      paidAmount,
      playerName,
      mobileNumber,
      sport,
      paymentMethod,
      firstPaidAmount,
      firstPaymentMethod,
      secondPaidAmount,
      secondPaymentMethod
    } = body;

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

    // Handle general details updates
    if (playerName !== undefined) updateData.playerName = playerName;
    if (mobileNumber !== undefined) {
      updateData.mobileNumber = mobileNumber;
      updateData.whatsappNumber = mobileNumber;
    }
    if (sport !== undefined) updateData.sport = sport;

    // Handle split payment updates explicitly if provided
    if (firstPaidAmount !== undefined) updateData.firstPaidAmount = firstPaidAmount;
    if (firstPaymentMethod !== undefined) updateData.firstPaymentMethod = firstPaymentMethod;
    if (secondPaidAmount !== undefined) updateData.secondPaidAmount = secondPaidAmount;
    if (secondPaymentMethod !== undefined) updateData.secondPaymentMethod = secondPaymentMethod;

    // Determine total paid amount and payment method
    let finalPaidAmount = booking.paidAmount;
    if (firstPaidAmount !== undefined || secondPaidAmount !== undefined) {
      const fPaid = firstPaidAmount !== undefined ? firstPaidAmount : booking.firstPaidAmount;
      const sPaid = secondPaidAmount !== undefined ? secondPaidAmount : booking.secondPaidAmount;
      finalPaidAmount = fPaid + sPaid;
      updateData.paidAmount = finalPaidAmount;
      // Also update single paymentMethod field for backward compatibility
      if (secondPaidAmount !== undefined && secondPaidAmount > 0) {
        updateData.paymentMethod = secondPaymentMethod !== undefined ? secondPaymentMethod : booking.secondPaymentMethod;
      } else {
        updateData.paymentMethod = firstPaymentMethod !== undefined ? firstPaymentMethod : booking.firstPaymentMethod;
      }
    } else if (paidAmount !== undefined) {
      // Fallback/backward compatibility: split single paidAmount
      finalPaidAmount = paidAmount;
      updateData.paidAmount = paidAmount;
      if (booking.firstPaidAmount === 0) {
        updateData.firstPaidAmount = paidAmount;
        updateData.secondPaidAmount = 0;
      } else {
        updateData.firstPaidAmount = booking.firstPaidAmount;
        updateData.secondPaidAmount = Math.max(0, paidAmount - booking.firstPaidAmount);
      }
      if (paymentMethod !== undefined) {
        updateData.paymentMethod = paymentMethod;
        if (updateData.secondPaidAmount > 0) {
          updateData.secondPaymentMethod = paymentMethod;
        } else {
          updateData.firstPaymentMethod = paymentMethod;
        }
      }
    } else if (paymentMethod !== undefined) {
      updateData.paymentMethod = paymentMethod;
      updateData.firstPaymentMethod = paymentMethod;
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
      
      updateData.remainingAmount = updateData.totalAmount - finalPaidAmount;
    } else {
      const totalAmt = updateData.totalAmount !== undefined ? updateData.totalAmount : booking.totalAmount;
      updateData.remainingAmount = totalAmt - finalPaidAmount;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
    });

    // Twilio Integration: Send confirmation if newly confirmed
    if (willConfirm && updatedBooking.whatsappNumber) {
      const templateSid = process.env.TWILIO_CONFIRMATION_TEMPLATE_SID;
      let twilioRes;
      
      if (templateSid) {
        twilioRes = await sendWhatsAppTemplate(updatedBooking.whatsappNumber, templateSid, {
          '1': updatedBooking.playerName,
          '2': updatedBooking.sport || 'Football',
          '3': updatedBooking.bookingDate,
          '4': updatedBooking.slotStart,
          '5': updatedBooking.slotEnd,
          '6': updatedBooking.totalAmount.toString(),
          '7': updatedBooking.paidAmount.toString(),
          '8': updatedBooking.remainingAmount.toString()
        });
      }
      
      if (!twilioRes || !twilioRes.success) {
        const message = `Booking Confirmed ✅\n\nHello ${updatedBooking.playerName},\n\nYour turf booking for ${updatedBooking.sport || 'Football'} has been confirmed.\n\nDate: ${updatedBooking.bookingDate}\nTime: ${updatedBooking.slotStart} to ${updatedBooking.slotEnd}\n\nTotal Amount: ₹${updatedBooking.totalAmount}\nPaid Amount: ₹${updatedBooking.paidAmount}\nRemaining Amount: ₹${updatedBooking.remainingAmount}\n\nThank you for booking with Turf Things.\nThis number is only for Booking Confirmation. For any query or further enquiry please contact on 7030499191.`;
        twilioRes = await sendWhatsAppMessage(updatedBooking.whatsappNumber, message);
      }
      
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
