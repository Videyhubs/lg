import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/settings - Return all settings as key-value pairs
export async function GET() {
  try {
    const settings = await db.siteSetting.findMany({
      orderBy: { key: 'asc' },
    });

    const settingsMap: Record<string, string> = {};
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value;
    }

    return NextResponse.json({ success: true, data: settingsMap });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update settings (upsert each key-value pair)
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

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: 'Request body must be a JSON object with key-value pairs' },
        { status: 400 }
      );
    }

    const entries = Object.entries(body) as [string, unknown][];

    if (entries.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No settings provided' },
        { status: 400 }
      );
    }

    // Upsert each setting
    await Promise.all(
      entries.map(([key, value]) =>
        db.siteSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );

    // Return updated settings
    const allSettings = await db.siteSetting.findMany({ orderBy: { key: 'asc' } });
    const settingsMap: Record<string, string> = {};
    for (const setting of allSettings) {
      settingsMap[setting.key] = setting.value;
    }

    return NextResponse.json({
      success: true,
      data: settingsMap,
      message: `${entries.length} setting(s) updated successfully`,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
