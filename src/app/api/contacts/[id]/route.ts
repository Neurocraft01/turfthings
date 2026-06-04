import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PATCH /api/contacts/[id] — Update status
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, inquiry }, { status: 200 });
  } catch (error) {
    console.error('Failed to update inquiry:', error);
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
  }
}

// DELETE /api/contacts/[id] — Delete inquiry
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await prisma.inquiry.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: 'Inquiry deleted' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete inquiry:', error);
    return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 });
  }
}
