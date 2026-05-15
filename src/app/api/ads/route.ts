import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/ads - Return all ad slots
export async function GET() {
  try {
    const ads = await db.adSlot.findMany({
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, data: ads });
  } catch (error) {
    console.error('Error fetching ads:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ad slots' },
      { status: 500 }
    );
  }
}

// POST /api/ads - Create ad slot
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      name,
      position,
      scriptHtml,
      isEnabled,
      deviceTarget,
      frequencyCap,
    } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'name is required' },
        { status: 400 }
      );
    }

    if (!position || typeof position !== 'string') {
      return NextResponse.json(
        { success: false, error: 'position is required' },
        { status: 400 }
      );
    }

    // Validate position
    const validPositions = [
      'banner_top',
      'banner_middle',
      'banner_bottom',
      'native',
      'sticky',
      'floating',
      'in_article',
      'popunder',
    ];

    if (!validPositions.includes(position)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid position. Must be one of: ${validPositions.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const adSlot = await db.adSlot.create({
      data: {
        name,
        position,
        scriptHtml: scriptHtml || null,
        isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
        deviceTarget: deviceTarget || 'all',
        frequencyCap: frequencyCap ? parseInt(String(frequencyCap), 10) : null,
      },
    });

    return NextResponse.json({ success: true, data: adSlot }, { status: 201 });
  } catch (error) {
    console.error('Error creating ad slot:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create ad slot' },
      { status: 500 }
    );
  }
}

// PUT /api/ads - Update ad slot
export async function PUT(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { id, ...fields } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Ad slot id is required' },
        { status: 400 }
      );
    }

    // Check if ad slot exists
    const existing = await db.adSlot.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Ad slot not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (fields.name !== undefined) updateData.name = fields.name;
    if (fields.position !== undefined) updateData.position = fields.position;
    if (fields.scriptHtml !== undefined) updateData.scriptHtml = fields.scriptHtml;
    if (fields.isEnabled !== undefined) updateData.isEnabled = Boolean(fields.isEnabled);
    if (fields.deviceTarget !== undefined) updateData.deviceTarget = fields.deviceTarget;
    if (fields.frequencyCap !== undefined)
      updateData.frequencyCap = fields.frequencyCap
        ? parseInt(String(fields.frequencyCap), 10)
        : null;
    if (fields.priority !== undefined)
      updateData.priority = parseInt(String(fields.priority), 10);

    const adSlot = await db.adSlot.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: adSlot });
  } catch (error) {
    console.error('Error updating ad slot:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update ad slot' },
      { status: 500 }
    );
  }
}

// DELETE /api/ads - Delete ad slot
export async function DELETE(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Ad slot id is required' },
        { status: 400 }
      );
    }

    // Check if ad slot exists
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
