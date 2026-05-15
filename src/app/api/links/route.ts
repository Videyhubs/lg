import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateSlug, hashPassword } from '@/lib/crypto';
import { rateLimit } from '@/lib/rate-limiter';

// Helper to get client IP
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

// GET /api/links - List all links
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { slug: { contains: search } },
            { title: { contains: search } },
            { originalUrl: { contains: search } },
          ],
        }
      : {};

    const [links, total] = await Promise.all([
      db.link.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { clicks: true } },
        },
      }),
      db.link.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: links,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

// POST /api/links - Create new shortlink
export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const limiter = rateLimit(clientIp, { maxRequests: 30, windowMs: 60 * 1000 });
    if (!limiter.allowed) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      originalUrl,
      customSlug,
      title,
      password,
      expiresAt,
      maxClicks,
      geoTarget,
    } = body;

    if (!originalUrl || typeof originalUrl !== 'string') {
      return NextResponse.json(
        { success: false, error: 'originalUrl is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(originalUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Generate or use custom slug
    let slug: string;
    if (customSlug && typeof customSlug === 'string') {
      const sanitized = customSlug.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (!sanitized) {
        return NextResponse.json(
          { success: false, error: 'Custom slug contains only invalid characters' },
          { status: 400 }
        );
      }
      // Check if slug already exists
      const existing = await db.link.findUnique({ where: { slug: sanitized } });
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Slug already in use' },
          { status: 409 }
        );
      }
      slug = sanitized;
    } else {
      // Generate unique slug
      let attempts = 0;
      do {
        slug = generateSlug(6);
        const existing = await db.link.findUnique({ where: { slug } });
        if (!existing) break;
        attempts++;
      } while (attempts < 10);

      if (attempts >= 10) {
        return NextResponse.json(
          { success: false, error: 'Failed to generate unique slug' },
          { status: 500 }
        );
      }
    }

    // Hash password if provided
    const hashedPassword = password ? hashPassword(password) : null;

    // Parse expiresAt if provided
    let expiresAtDate: Date | null = null;
    if (expiresAt) {
      expiresAtDate = new Date(expiresAt);
      if (isNaN(expiresAtDate.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid expiresAt date' },
          { status: 400 }
        );
      }
    }

    const link = await db.link.create({
      data: {
        slug,
        originalUrl,
        customSlug: customSlug || null,
        title: title || null,
        password: hashedPassword,
        expiresAt: expiresAtDate,
        maxClicks: maxClicks ? parseInt(String(maxClicks), 10) : null,
        geoTarget: geoTarget ? JSON.stringify(geoTarget) : null,
      },
      include: {
        _count: { select: { clicks: true } },
      },
    });

    return NextResponse.json({ success: true, data: link }, { status: 201 });
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create link' },
      { status: 500 }
    );
  }
}

// DELETE /api/links - Delete link by id
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
        { success: false, error: 'Link id is required' },
        { status: 400 }
      );
    }

    // Check if link exists
    const existing = await db.link.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    await db.link.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete link' },
      { status: 500 }
    );
  }
}
