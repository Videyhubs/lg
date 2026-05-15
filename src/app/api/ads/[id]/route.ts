import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/ads/[id] - Update a single ad slot
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const existing = await db.adSlot.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Ad slot not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.scriptHtml !== undefined) updateData.scriptHtml = body.scriptHtml;
    if (body.isEnabled !== undefined) updateData.isEnabled = Boolean(body.isEnabled);
    if (body.deviceTarget !== undefined) updateData.deviceTarget = body.deviceTarget;
    if (body.frequencyCap !== undefined) updateData.frequencyCap = body.frequencyCap ? parseInt(String(body.frequencyCap), 10) : null;
    if (body.priority !== undefined) updateData.priority = parseInt(String(body.priority), 10);

    const adSlot = await db.adSlot.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, data: adSlot });
  } catch (error) {
    console.error('Error updating ad slot:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update ad slot' },
      { status: 500 }
    );
  }
}

// DELETE /api/ads/[id] - Delete a single ad slot
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.adSlot.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Ad slot not found' },
        { status: 404 }
      );
    }

    await db.adSlot.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Ad slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting ad slot:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete ad slot' },
      { status: 500 }
    );
  }
}
