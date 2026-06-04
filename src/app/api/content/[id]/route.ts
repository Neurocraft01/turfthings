import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// DELETE /api/content/[id]?type=review|gallery
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'review' or 'gallery'

  try {
    if (type === 'review') {
      await prisma.review.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, message: 'Review deleted' }, { status: 200 });
    } else if (type === 'gallery') {
      await prisma.galleryImage.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, message: 'Gallery image deleted' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
  } catch (error) {
    console.error('Failed to delete content:', error);
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 });
  }
}
