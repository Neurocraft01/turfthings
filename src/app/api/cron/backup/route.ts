import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';

// Allow a longer execution time (if deploying to Vercel Pro/Enterprise, or default 10-15s for Hobby)
export const maxDuration = 60; 

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all records from database tables
    const [bookings, inquiries, reviews, gallery, siteContent, admins] = await Promise.all([
      prisma.booking.findMany(),
      prisma.inquiry.findMany(),
      prisma.review.findMany(),
      prisma.galleryImage.findMany(),
      prisma.siteContent.findMany(),
      prisma.admin.findMany(),
    ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      bookings,
      inquiries,
      reviews,
      gallery,
      siteContent,
      admins
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `db_backup_${dateStr}`;

    // Upload to Cloudinary using upload_stream as raw resource
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'database_backups',
          public_id: filename,
          format: 'json'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(Buffer.from(jsonString));
    });

    return NextResponse.json({ success: true, backup: uploadResult }, { status: 200 });

  } catch (error) {
    console.error('Backup cron failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
