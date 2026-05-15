import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/crypto';
import { rateLimit } from '@/lib/rate-limiter';

// Helper to get client IP
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

// Parse user agent to extract device, browser, and OS
function parseUserAgent(ua: string): { device: string; browser: string; os: string } {
  let device = 'Unknown';
  let browser = 'Unknown';
  let os = 'Unknown';

  // Detect device
  if (/mobile/i.test(ua) || /android/i.test(ua)) {
    if (/tablet/i.test(ua)) {
      device = 'Tablet';
    } else {
      device = 'Mobile';
    }
  } else if (/ipad/i.test(ua)) {
    device = 'Tablet';
  } else {
    device = 'Desktop';
  }

  // Detect browser
  if (ua.includes('Firefox/')) {
    browser = 'Firefox';
  } else if (ua.includes('Edg/')) {
    browser = 'Edge';
  } else if (ua.includes('Chrome/')) {
    browser = 'Chrome';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    browser = 'Safari';
  } else if (ua.includes('Opera') || ua.includes('OPR/')) {
    browser = 'Opera';
  } else if (ua.includes('MSIE') || ua.includes('Trident/')) {
    browser = 'IE';
  }

  // Detect OS
  if (ua.includes('Windows NT 10')) {
    os = 'Windows';
  } else if (ua.includes('Windows')) {
    os = 'Windows';
  } else if (ua.includes('Mac OS X')) {
    os = 'macOS';
  } else if (ua.includes('Android')) {
    os = 'Android';
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  }

  return { device, browser, os };
}

// Check if request is from a bot
function isBotRequest(ua: string): boolean {
  const botPatterns = [
    /bot/i, /crawl/i, /spider/i, /slurp/i, /mediapartners/i,
    /google/i, /bing/i, /yahoo/i, /duckduckgo/i, /baidu/i,
    /facebookexternalhit/i, /twitterbot/i, /discordbot/i,
    /telegrambot/i, /whatsapp/i, /curl/i, /wget/i,
  ];
  return botPatterns.some(pattern => pattern.test(ua));
}

// GET /api/safelink - Handle safelink redirect
export async function GET(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const limiter = rateLimit(clientIp, { maxRequests: 100, windowMs: 60 * 1000 });
    if (!limiter.allowed) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Find link by slug
    const link = await db.link.findUnique({
      where: { slug },
      include: { _count: { select: { clicks: true } } },
    });

    if (!link) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    // Check if link is active
    if (!link.isActive) {
      return NextResponse.json(
        { success: false, error: 'This link has been disabled' },
        { status: 403 }
      );
    }

    // Check if link is expired
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'This link has expired' },
        { status: 410 }
      );
    }

    // Check max clicks
    if (link.maxClicks && link._count.clicks >= link.maxClicks) {
      return NextResponse.json(
        { success: false, error: 'This link has reached its maximum click limit' },
        { status: 410 }
      );
    }

    // If link has password, return requiresPassword without recording click
    if (link.password) {
      return NextResponse.json({
        success: true,
        requiresPassword: true,
        link: {
          id: link.id,
          slug: link.slug,
          originalUrl: link.originalUrl,
          customSlug: link.customSlug,
          title: link.title,
          isActive: link.isActive,
          createdAt: link.createdAt.toISOString(),
          updatedAt: link.updatedAt.toISOString(),
        },
      });
    }

    // Record the click
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || request.headers.get('referrer') || null;
    const parsed = parseUserAgent(userAgent);
    const isBot = isBotRequest(userAgent);

    await db.click.create({
      data: {
        linkId: link.id,
        ip: clientIp,
        device: parsed.device,
        browser: parsed.browser,
        os: parsed.os,
        referer: referer || null,
        isBot,
      },
    });

    // Get redirect delay from settings
    const redirectDelaySetting = await db.siteSetting.findUnique({
      where: { key: 'redirectDelay' },
    });
    const countdown = redirectDelaySetting
      ? parseInt(redirectDelaySetting.value, 10) || 10
      : 10;

    // Select a random published article and increment its fakeViews
    const publishedArticles = await db.article.findMany({
      where: { isPublished: true },
    });

    let article: typeof publishedArticles[number] | null = null;
    if (publishedArticles.length > 0) {
      const randomIndex = Math.floor(Math.random() * publishedArticles.length);
      article = publishedArticles[randomIndex];

      // Increment fakeViews
      await db.article.update({
        where: { id: article.id },
        data: { fakeViews: { increment: 1 } },
      });
    }

    // Determine the final redirect URL (geo targeting)
    let redirectUrl = link.originalUrl;
    if (link.geoTarget) {
      try {
        const geoMap = JSON.parse(link.geoTarget) as Record<string, string>;
        // We don't have actual geo lookup here, so use default URL
        // In production, you'd use a geo IP service
        const geoHeader = request.headers.get('x-vercel-ip-country') || null;
        if (geoHeader && geoMap[geoHeader]) {
          redirectUrl = geoMap[geoHeader];
        }
      } catch {
        // Invalid JSON, use default URL
      }
    }

    return NextResponse.json({
      success: true,
      link,
      article,
      countdown,
      redirectUrl,
    });
  } catch (error) {
    console.error('Error processing safelink:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process safelink' },
      { status: 500 }
    );
  }
}

// POST /api/safelink - Verify password for protected link
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
    const { slug, password } = body;

    if (!slug || !password) {
      return NextResponse.json(
        { success: false, error: 'slug and password are required' },
        { status: 400 }
      );
    }

    // Find link by slug
    const link = await db.link.findUnique({
      where: { slug },
      include: { _count: { select: { clicks: true } } },
    });

    if (!link) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    if (!link.password) {
      return NextResponse.json(
        { success: false, error: 'This link does not require a password' },
        { status: 400 }
      );
    }

    // Verify password
    const isValid = verifyPassword(password, link.password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    // After successful password verification, record the click
    const clientIp = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || request.headers.get('referrer') || null;
    const parsed = parseUserAgent(userAgent);
    const isBot = isBotRequest(userAgent);

    await db.click.create({
      data: {
        linkId: link.id,
        ip: clientIp,
        device: parsed.device,
        browser: parsed.browser,
        os: parsed.os,
        referer: referer || null,
        isBot,
      },
    });

    // Get redirect delay from settings
    const redirectDelaySetting = await db.siteSetting.findUnique({
      where: { key: 'redirectDelay' },
    });
    const countdown = redirectDelaySetting
      ? parseInt(redirectDelaySetting.value, 10) || 10
      : 10;

    // Select a random published article and increment its fakeViews
    const publishedArticles = await db.article.findMany({
      where: { isPublished: true },
    });

    let article: typeof publishedArticles[number] | null = null;
    if (publishedArticles.length > 0) {
      const randomIndex = Math.floor(Math.random() * publishedArticles.length);
      article = publishedArticles[randomIndex];

      await db.article.update({
        where: { id: article.id },
        data: { fakeViews: { increment: 1 } },
      });
    }

    // Determine redirect URL (geo targeting)
    let redirectUrl = link.originalUrl;
    if (link.geoTarget) {
      try {
        const geoMap = JSON.parse(link.geoTarget) as Record<string, string>;
        // Note: geo detection not available in this context
      } catch {
        // Invalid JSON, use default URL
      }
    }

    return NextResponse.json({
      success: true,
      link,
      article,
      countdown,
      redirectUrl,
    });
  } catch (error) {
    console.error('Error verifying password:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify password' },
      { status: 500 }
    );
  }
}
