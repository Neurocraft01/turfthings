import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { format, subDays, subMonths, parseISO } from 'date-fns';

export async function GET() {
  try {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const currentMonthStr = format(new Date(), 'yyyy-MM');

    // Fetch all active (non-cancelled) bookings
    const activeBookings = await prisma.booking.findMany({
      where: {
        bookingStatus: { not: 'cancelled' }
      }
    });

    const allBookings = await prisma.booking.findMany();

    // 1. Today's Bookings
    const todayBookingsCount = activeBookings.filter(b => b.bookingDate === todayStr).length;

    // 2. Monthly Revenue (for bookings in the current month)
    const monthlyBookings = activeBookings.filter(b => b.bookingDate.startsWith(currentMonthStr));
    const expectedRevenue = monthlyBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const collectedAmount = monthlyBookings.reduce((sum, b) => sum + b.paidAmount, 0);
    const remainingAmount = monthlyBookings.reduce((sum, b) => sum + b.remainingAmount, 0);

    // 3. Active Players (unique player names)
    const uniquePlayers = new Set(allBookings.map(b => b.playerName.trim().toLowerCase()));
    const activePlayersCount = uniquePlayers.size;

    // 4. Pending Inquiries Count
    let pendingInquiriesCount = 0;
    try {
      pendingInquiriesCount = await prisma.inquiry.count({
        where: { status: 'New' }
      });
    } catch (e) {
      console.error('Failed to get inquiry count:', e);
    }

    // 5. Weekly Bookings Volume (last 7 days, including today)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayName = format(date, 'EEE');
      
      const count = activeBookings.filter(b => b.bookingDate === dateStr).length;
      weeklyData.push({ name: dayName, bookings: count });
    }

    // 6. Sport Popularity
    const footballCount = activeBookings.filter(b => b.sport === 'Football').length;
    const cricketCount = activeBookings.filter(b => b.sport === 'Cricket').length;
    const totalSports = footballCount + cricketCount || 1;

    const sportsPopularity = [
      { name: 'Football', value: Math.round((footballCount / totalSports) * 100) || 50, color: '#3b82f6' },
      { name: 'Cricket', value: Math.round((cricketCount / totalSports) * 100) || 50, color: '#10b981' }
    ];

    // 7. Payment Methods Pie (Paid vs Partial vs Unpaid)
    const fullyPaidCount = activeBookings.filter(b => b.remainingAmount === 0).length;
    const partialPaidCount = activeBookings.filter(b => b.paidAmount > 0 && b.remainingAmount > 0).length;
    const unpaidCount = activeBookings.filter(b => b.paidAmount === 0).length;
    const totalPayments = fullyPaidCount + partialPaidCount + unpaidCount || 1;

    const paymentMethods = [
      { name: 'Fully Paid', value: Math.round((fullyPaidCount / totalPayments) * 100) || 0, color: '#10b981' },
      { name: 'Partial', value: Math.round((partialPaidCount / totalPayments) * 100) || 0, color: '#f59e0b' },
      { name: 'Unpaid', value: Math.round((unpaidCount / totalPayments) * 100) || 0, color: '#ef4444' }
    ];

    // 8. Monthly Revenue Trend (computed for the last 6 months)
    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthKey = format(monthDate, 'yyyy-MM'); // e.g. "2026-06"
      const monthName = format(monthDate, 'MMM yyyy'); // e.g. "Jun 2026"
      
      const monthBookings = activeBookings.filter(b => b.bookingDate.startsWith(monthKey));
      const revenue = monthBookings.reduce((sum, b) => sum + b.paidAmount, 0);
      
      revenueData.push({
        name: monthName,
        revenue
      });
    }

    return NextResponse.json({
      stats: {
        todayBookings: todayBookingsCount.toString(),
        monthlyRevenue: `₹${expectedRevenue.toLocaleString('en-IN')}`,
        collectedAmount: `₹${collectedAmount.toLocaleString('en-IN')}`,
        remainingAmount: `₹${remainingAmount.toLocaleString('en-IN')}`,
        activePlayers: activePlayersCount.toString(),
        pendingInquiries: pendingInquiriesCount.toString(),
      },
      charts: {
        bookingData: weeklyData,
        revenueData,
        sportsPopularity,
        paymentMethods
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to calculate admin stats:', error);
    return NextResponse.json({ error: 'Failed to calculate statistics' }, { status: 500 });
  }
}
