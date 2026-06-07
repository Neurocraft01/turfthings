import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';
import * as XLSX from 'xlsx';

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function getMonthRange(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0);
  const end = `${year}-${String(month).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
  return { start, end, daysInMonth: endDate.getDate() };
}

function fmt12(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ap}`;
}

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short',
  });
}

function autoWidth(data: Record<string, unknown>[]) {
  if (!data.length) return [];
  return Object.keys(data[0]).map(k => ({
    wch: Math.max(k.length, ...data.map(r => String(r[k] ?? '').length)) + 2,
  }));
}

/* ─────────────────────────────────────────────────────────────
   ROUTE HANDLER
───────────────────────────────────────────────────────────── */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { year, month, email } = body;

    const targetYear  = year  || new Date().getFullYear();
    const targetMonth = month || new Date().getMonth() + 1;
    const to          = email || process.env.SMTP_TO;

    if (!to) {
      return NextResponse.json({ error: 'No recipient email provided' }, { status: 400 });
    }

    /* ── Fetch all bookings for the month ── */
    const { start, end, daysInMonth } = getMonthRange(targetYear, targetMonth);
    const monthName = new Date(targetYear, targetMonth - 1)
      .toLocaleString('en-IN', { month: 'long' });

    const bookings = await prisma.booking.findMany({
      where: { bookingDate: { gte: start, lte: end } },
      orderBy: [{ bookingDate: 'asc' }, { slotStart: 'asc' }],
    });

    if (bookings.length === 0) {
      return NextResponse.json(
        { error: `No bookings found for ${monthName} ${targetYear}` },
        { status: 404 }
      );
    }

    /* ── Aggregate stats ── */
    const active    = bookings.filter(b => b.bookingStatus !== 'cancelled');
    const confirmed = bookings.filter(b => b.bookingStatus === 'confirmed').length;
    const pending   = bookings.filter(b => b.bookingStatus === 'pending').length;
    const cancelled = bookings.filter(b => b.bookingStatus === 'cancelled').length;

    const totalRevenue   = active.reduce((s, b) => s + b.totalAmount,    0);
    const totalCollected = active.reduce((s, b) => s + b.paidAmount,     0);
    const totalBalance   = active.reduce((s, b) => s + b.remainingAmount, 0);
    const collectRate    = totalRevenue
      ? Math.round((totalCollected / totalRevenue) * 100)
      : 0;

    /* ── Day-wise aggregation ── */
    type DayStat = {
      date: string; label: string;
      total: number; confirmed: number; pending: number; cancelled: number;
      revenue: number; collected: number; balance: number;
      sports: string;
    };

    const dayMap = new Map<string, DayStat>();
    const sportsByDay: Record<string, Record<string, number>> = {};

    for (let d = 1; d <= daysInMonth; d++) {
      const dt = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      dayMap.set(dt, {
        date: dt, label: fmtDate(dt),
        total: 0, confirmed: 0, pending: 0, cancelled: 0,
        revenue: 0, collected: 0, balance: 0, sports: '',
      });
    }

    bookings.forEach(b => {
      const day = dayMap.get(b.bookingDate);
      if (!day) return;
      day.total++;
      if (b.bookingStatus === 'confirmed')      day.confirmed++;
      else if (b.bookingStatus === 'pending')   day.pending++;
      else                                       day.cancelled++;
      if (b.bookingStatus !== 'cancelled') {
        day.revenue   += b.totalAmount;
        day.collected += b.paidAmount;
        day.balance   += b.remainingAmount;
      }
      if (!sportsByDay[b.bookingDate]) sportsByDay[b.bookingDate] = {};
      const sp = b.sport || 'Football';
      sportsByDay[b.bookingDate][sp] = (sportsByDay[b.bookingDate][sp] || 0) + 1;
    });

    dayMap.forEach((day, dt) => {
      const sc = sportsByDay[dt];
      if (sc) day.sports = Object.entries(sc).map(([s, n]) => `${s}(${n})`).join(', ');
    });

    const allDays   = Array.from(dayMap.values());
    const activeDays = allDays.filter(d => d.total > 0);
    const peakDay   = [...activeDays].sort((a, b) => b.total - a.total)[0];

    /* Group bookings by date for detail sheet */
    const byDate = new Map<string, typeof bookings>();
    bookings.forEach(b => {
      if (!byDate.has(b.bookingDate)) byDate.set(b.bookingDate, []);
      byDate.get(b.bookingDate)!.push(b);
    });

    /* ═══════════════════════════════════════════════════════
       BUILD EXCEL  (4 sheets)
    ═══════════════════════════════════════════════════════ */
    const wb = XLSX.utils.book_new();

    /* ── Sheet 1: Monthly Summary ── */
    const summaryRows = [
      { Metric: 'Month',                   Value: `${monthName} ${targetYear}` },
      { Metric: 'Report Generated',        Value: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) },
      { Metric: '',                         Value: '' },
      { Metric: '── BOOKING COUNTS ──',   Value: '' },
      { Metric: 'Total Bookings',          Value: bookings.length },
      { Metric: 'Confirmed',               Value: confirmed },
      { Metric: 'Pending',                 Value: pending },
      { Metric: 'Cancelled',               Value: cancelled },
      { Metric: 'Active Days',             Value: activeDays.length },
      { Metric: 'Avg Bookings / Active Day', Value: activeDays.length ? +(bookings.length / activeDays.length).toFixed(1) : 0 },
      { Metric: 'Peak Day',                Value: peakDay ? `${peakDay.label} (${peakDay.total} bookings)` : '—' },
      { Metric: '',                         Value: '' },
      { Metric: '── REVENUE ──',           Value: '' },
      { Metric: 'Expected Revenue (₹)',    Value: totalRevenue },
      { Metric: 'Collected Amount (₹)',    Value: totalCollected },
      { Metric: 'Outstanding Balance (₹)', Value: totalBalance },
      { Metric: 'Collection Rate',         Value: `${collectRate}%` },
    ];
    const ws1 = XLSX.utils.json_to_sheet(summaryRows);
    ws1['!cols'] = [{ wch: 32 }, { wch: 26 }];
    XLSX.utils.book_append_sheet(wb, ws1, 'Monthly Summary');

    /* ── Sheet 2: Day-wise Summary ── */
    const dayRows = allDays.map(d => ({
      'Date':           d.date,
      'Day':            d.label,
      'Total Bookings': d.total,
      'Confirmed':      d.confirmed,
      'Pending':        d.pending,
      'Cancelled':      d.cancelled,
      'Sports':         d.sports || (d.total > 0 ? 'N/A' : ''),
      'Revenue (₹)':   d.revenue,
      'Collected (₹)': d.collected,
      'Balance (₹)':   d.balance,
    }));
    // Totals row
    dayRows.push({
      'Date':           'TOTAL',
      'Day':            '',
      'Total Bookings': bookings.length,
      'Confirmed':      confirmed,
      'Pending':        pending,
      'Cancelled':      cancelled,
      'Sports':         '',
      'Revenue (₹)':   totalRevenue,
      'Collected (₹)': totalCollected,
      'Balance (₹)':   totalBalance,
    });
    const ws2 = XLSX.utils.json_to_sheet(dayRows);
    ws2['!cols'] = autoWidth(dayRows as any);
    XLSX.utils.book_append_sheet(wb, ws2, 'Day-wise Summary');

    /* ── Sheet 3: Day-wise Details (each booking grouped under its day) ── */
    const detailRows: Record<string, unknown>[] = [];
    activeDays
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach(day => {
        // Day header row
        detailRows.push({
          'S.No':             '',
          'Date':             day.date,
          'Day':              day.label,
          'Player Name':      `── ${day.total} booking${day.total !== 1 ? 's' : ''} | ${day.sports || 'N/A'} ──`,
          'Mobile':           '',
          'Sport':            '',
          'Start Time':       '',
          'End Time':         '',
          'Duration (min)':   '',
          'Total (₹)':        day.revenue,
          'Paid (₹)':         day.collected,
          'Balance (₹)':      day.balance,
          'Status':           '',
          'Booking ID':       '',
        });

        const dayBookings = byDate.get(day.date) || [];
        dayBookings.forEach((b, i) => {
          detailRows.push({
            'S.No':           i + 1,
            'Date':           b.bookingDate,
            'Day':            fmtDate(b.bookingDate),
            'Player Name':    b.playerName,
            'Mobile':         b.mobileNumber,
            'Sport':          b.sport || 'Football',
            'Start Time':     fmt12(b.slotStart),
            'End Time':       fmt12(b.slotEnd),
            'Duration (min)': b.totalSlots * 30,
            'Total (₹)':      b.totalAmount,
            'Paid (₹)':       b.paidAmount,
            'Balance (₹)':    b.remainingAmount,
            'Status':         b.bookingStatus.toUpperCase(),
            'Booking ID':     b.id.slice(-8).toUpperCase(),
          });
        });

        // Blank separator
        detailRows.push({
          'S.No': '', 'Date': '', 'Day': '', 'Player Name': '',
          'Mobile': '', 'Sport': '', 'Start Time': '', 'End Time': '',
          'Duration (min)': '', 'Total (₹)': '', 'Paid (₹)': '',
          'Balance (₹)': '', 'Status': '', 'Booking ID': '',
        });
      });

    const ws3 = XLSX.utils.json_to_sheet(detailRows);
    ws3['!cols'] = autoWidth(detailRows as any);
    XLSX.utils.book_append_sheet(wb, ws3, 'Day-wise Details');

    /* ── Sheet 4: All Bookings (flat list) ── */
    const allRows = bookings.map((b, i) => ({
      'S.No':           i + 1,
      'Booking ID':     b.id.slice(-8).toUpperCase(),
      'Date':           b.bookingDate,
      'Day':            fmtDate(b.bookingDate),
      'Player Name':    b.playerName,
      'Mobile Number':  b.mobileNumber,
      'Sport':          b.sport || 'Football',
      'Start Time':     fmt12(b.slotStart),
      'End Time':       fmt12(b.slotEnd),
      'Duration (min)': b.totalSlots * 30,
      'Total (₹)':      b.totalAmount,
      'Paid (₹)':       b.paidAmount,
      'Balance (₹)':    b.remainingAmount,
      'Status':         b.bookingStatus.toUpperCase(),
      'Msg Status':     b.messageStatus || 'N/A',
      'Created At':     new Date(b.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    }));
    const ws4 = XLSX.utils.json_to_sheet(allRows);
    ws4['!cols'] = autoWidth(allRows as any);
    XLSX.utils.book_append_sheet(wb, ws4, 'All Bookings');

    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const fileName = `TurfThings_Bookings_${monthName}_${targetYear}.xlsx`;

    /* ═══════════════════════════════════════════════════════
       CLEAN EMAIL HTML  (summary only — all detail is in Excel)
    ═══════════════════════════════════════════════════════ */
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;">
<tr><td align="center" style="padding:32px 16px;">

  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <tr>
      <td style="background:linear-gradient(135deg,#0a1a0c 0%,#1e3a20 100%);padding:36px 40px;text-align:center;">
        <div style="font-size:40px;line-height:1;">⚽</div>
        <h1 style="margin:12px 0 4px;color:#27a84e;font-size:28px;letter-spacing:4px;text-transform:uppercase;">Turf Things</h1>
        <p style="margin:0;color:rgba(255,255,255,0.45);font-size:12px;letter-spacing:2px;text-transform:uppercase;">Monthly Bookings Report</p>
      </td>
    </tr>

    <!-- Month badge -->
    <tr>
      <td style="background:#27a84e;padding:14px 40px;text-align:center;">
        <p style="margin:0;color:#ffffff;font-size:17px;font-weight:700;letter-spacing:1px;">${monthName} ${targetYear}</p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:36px 40px;">

        <p style="margin:0 0 24px;color:#4b5563;font-size:14px;line-height:1.7;">
          Hi there,<br><br>
          Please find attached the complete bookings report for <strong>${monthName} ${targetYear}</strong>.
          The Excel file contains <strong>${bookings.length} booking records</strong> across 4 sheets with full day-wise and client details.
        </p>

        <!-- KPI grid -->
        <table width="100%" cellpadding="0" cellspacing="8" style="margin-bottom:24px;">
          <tr>
            <td width="50%" style="vertical-align:top;padding-right:6px;">
              <table width="100%" cellpadding="12" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;border-left:4px solid #27a84e;">
                <tr><td style="color:#6b7280;font-size:12px;padding-bottom:4px;">TOTAL BOOKINGS</td></tr>
                <tr><td style="font-size:28px;font-weight:800;color:#0d0d0d;padding-top:0;">${bookings.length}</td></tr>
                <tr><td style="font-size:12px;color:#6b7280;padding-top:4px;">
                  ✅ ${confirmed} confirmed &nbsp;·&nbsp; ⏳ ${pending} pending &nbsp;·&nbsp; ❌ ${cancelled} cancelled
                </td></tr>
              </table>
            </td>
            <td width="50%" style="vertical-align:top;padding-left:6px;">
              <table width="100%" cellpadding="12" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;border-left:4px solid #3b82f6;">
                <tr><td style="color:#6b7280;font-size:12px;padding-bottom:4px;">EXPECTED REVENUE</td></tr>
                <tr><td style="font-size:28px;font-weight:800;color:#0d0d0d;padding-top:0;">₹${totalRevenue.toLocaleString('en-IN')}</td></tr>
                <tr><td style="font-size:12px;color:#6b7280;padding-top:4px;">
                  Collected: <span style="color:#059669;font-weight:700;">₹${totalCollected.toLocaleString('en-IN')}</span> &nbsp;·&nbsp; 
                  Due: <span style="color:#ef4444;font-weight:700;">₹${totalBalance.toLocaleString('en-IN')}</span>
                </td></tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Quick stats row -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
          <tr style="background:#f8fafc;">
            <td style="padding:14px 20px;border-right:1px solid #e2e8f0;text-align:center;">
              <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Active Days</div>
              <div style="font-size:22px;font-weight:800;color:#0d0d0d;">${activeDays.length}</div>
            </td>
            <td style="padding:14px 20px;border-right:1px solid #e2e8f0;text-align:center;">
              <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Peak Day</div>
              <div style="font-size:14px;font-weight:700;color:#d97706;">${peakDay ? peakDay.label : '—'}</div>
              <div style="font-size:11px;color:#9ca3af;">${peakDay ? `${peakDay.total} bookings` : ''}</div>
            </td>
            <td style="padding:14px 20px;text-align:center;">
              <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Collection Rate</div>
              <div style="font-size:22px;font-weight:800;color:#27a84e;">${collectRate}%</div>
            </td>
          </tr>
        </table>

        <!-- Excel contents note -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;overflow:hidden;margin-bottom:28px;">
          <tr>
            <td style="padding:18px 20px;">
              <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#1e40af;">📎 Excel Attachment — ${fileName}</p>
              <table width="100%" cellpadding="4" cellspacing="0" style="font-size:12px;color:#374151;">
                <tr>
                  <td style="width:24px;color:#3b82f6;font-weight:700;">1.</td>
                  <td><strong>Monthly Summary</strong> — Overall stats, revenue & collection rate</td>
                </tr>
                <tr>
                  <td style="color:#3b82f6;font-weight:700;">2.</td>
                  <td><strong>Day-wise Summary</strong> — One row per calendar day with totals</td>
                </tr>
                <tr>
                  <td style="color:#3b82f6;font-weight:700;">3.</td>
                  <td><strong>Day-wise Details</strong> — Each day's bookings with player name, mobile, sport, timings & amounts</td>
                </tr>
                <tr>
                  <td style="color:#3b82f6;font-weight:700;">4.</td>
                  <td><strong>All Bookings</strong> — Flat list of every booking with full details</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
          Generated on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' })}
        </p>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#0a1a0c;padding:20px 40px;text-align:center;">
        <p style="margin:0;color:rgba(255,255,255,0.3);font-size:11px;line-height:1.8;">
          Turf Things &nbsp;·&nbsp; Karvenagar, Pune, Maharashtra 411052<br>
          📞 +91 70304 99191 &nbsp;·&nbsp; ✉️ turfthings999@gmail.com
        </p>
      </td>
    </tr>

  </table>
</td></tr>
</table>
</body>
</html>`;

    /* ═══════════════════════════════════════════════════════
       SEND EMAIL
    ═══════════════════════════════════════════════════════ */
    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST || 'smtp.gmail.com',
      port:   Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from:    process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: `📊 Turf Things — ${monthName} ${targetYear} Bookings Report (${bookings.length} bookings)`,
      html,
      attachments: [
        {
          filename:    fileName,
          content:     excelBuffer,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      ],
    });

    return NextResponse.json({
      success:       true,
      message:       `Report for ${monthName} ${targetYear} sent to ${to}`,
      bookingsCount: bookings.length,
      activeDays:    activeDays.length,
    });

  } catch (error: any) {
    console.error('Email report error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email report' },
      { status: 500 }
    );
  }
}
