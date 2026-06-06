import { NextResponse } from 'next/server';

/**
 * GET /api/cron/monthly-report
 *
 * Triggered automatically by Vercel Cron on the 1st of every month at 08:00 AM IST.
 * Cron schedule: "30 2 1 * *"  (2:30 AM UTC = 8:00 AM IST, 1st of every month)
 *
 * Security: Request must include the Authorization header with the CRON_SECRET value.
 * Vercel automatically sends the CRON_SECRET as a Bearer token for cron invocations.
 */
export async function GET(request: Request) {
  /* ── Auth check ── */
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    /* Send report for the PREVIOUS month */
    const now   = new Date();
    const year  = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const month = now.getMonth() === 0 ? 12 : now.getMonth(); // getMonth() is 0-indexed, so current = previous

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/send-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // forward cron secret so send-report can be protected too if needed
        ...(cronSecret ? { 'x-cron-secret': cronSecret } : {}),
      },
      body: JSON.stringify({ year, month }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[CronJob] Monthly report failed:', data);
      return NextResponse.json({ success: false, error: data.error }, { status: 500 });
    }

    console.log(`[CronJob] Monthly report sent — ${data.message}`);
    return NextResponse.json({
      success: true,
      triggeredAt: now.toISOString(),
      reportMonth: `${month}/${year}`,
      ...data,
    });

  } catch (err: any) {
    console.error('[CronJob] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
