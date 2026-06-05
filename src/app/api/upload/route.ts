import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be under 10MB' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'turf-things',
          resource_type: 'image',
          transformation: [
            { quality: 'auto:good', fetch_format: 'auto' },
            { width: 1200, crop: 'limit' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as { secure_url: string; public_id: string });
        }
      ).end(buffer);
    });

    return NextResponse.json(
      { success: true, url: result.secure_url, publicId: result.public_id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image. Check Cloudinary credentials in .env.' },
      { status: 500 }
    );
  }
}
