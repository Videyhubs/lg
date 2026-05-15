import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/visitor - Track visitor session
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
    const { sessionId, ip, country, device, browser, path } = body;

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const visitor = await db.visitorSession.create({
      data: {
        sessionId,
        ip: ip || null,
        country: country || null,
        device: device || null,
        browser: browser || null,
        path: path || null,
      },
    });

    return NextResponse.json({ success: true, data: visitor }, { status: 201 });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track visitor' },
      { status: 500 }
    );
  }
}
