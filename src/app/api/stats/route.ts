import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/stats - Return statistics
export async function GET() {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get 7 days ago for dailyClicks
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOf7DaysAgo = new Date(sevenDaysAgo.getFullYear(), sevenDaysAgo.getMonth(), sevenDaysAgo.getDate());

    // Run all queries in parallel
    const [
      totalClicks,
      todayClicksResult,
      uniqueVisitorsResult,
      totalLinks,
      totalArticles,
      topLinks,
      topArticles,
      deviceStats,
      browserStats,
      referrerStats,
      dailyClicksRaw,
    ] = await Promise.all([
      // Total clicks
      db.click.count(),

      // Today's clicks
      db.click.count({
        where: { createdAt: { gte: startOfToday } },
      }),

      // Unique visitors today (unique IPs)
      db.click.groupBy({
        by: ['ip'],
        where: {
          createdAt: { gte: startOfToday },
          ip: { not: null },
        },
      }),

      // Total links
      db.link.count(),

      // Total articles
      db.article.count(),

      // Top 5 links by clicks
      db.link.findMany({
        take: 5,
        orderBy: {
          clicks: { _count: 'desc' },
        },
        include: {
          _count: { select: { clicks: true } },
        },
      }),

      // Top 5 articles by fakeViews
      db.article.findMany({
        take: 5,
        where: { isPublished: true },
        orderBy: { fakeViews: 'desc' },
      }),

      // Device stats
      db.click.groupBy({
        by: ['device'],
        where: { device: { not: null } },
        _count: true,
      }),

      // Browser stats
      db.click.groupBy({
        by: ['browser'],
        where: { browser: { not: null } },
        _count: true,
      }),

      // Referrer stats
      db.click.groupBy({
        by: ['referer'],
        where: { referer: { not: null } },
        _count: true,
      }),

      // Daily clicks for last 7 days
      db.click.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: startOf7DaysAgo } },
        _count: true,
      }),
    ]);

    // Process daily clicks into date-keyed map
    const dailyClicksMap = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyClicksMap.set(dateStr, 0);
    }

    for (const entry of dailyClicksRaw) {
      const dateStr = entry.createdAt.toISOString().split('T')[0];
      const current = dailyClicksMap.get(dateStr) || 0;
      dailyClicksMap.set(dateStr, current + 1);
    }

    const dailyClicks = Array.from(dailyClicksMap.entries())
      .map(([date, clicks]) => ({ date, clicks }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      data: {
        totalClicks,
        todayClicks: todayClicksResult,
        uniqueVisitors: uniqueVisitorsResult.length,
        totalLinks,
        totalArticles,
        topLinks: topLinks.map(link => ({
          slug: link.slug,
          title: link.title,
          clicks: link._count.clicks,
        })),
        topArticles: topArticles.map(article => ({
          slug: article.slug,
          title: article.title,
          views: article.fakeViews,
        })),
        deviceStats: deviceStats
          .filter(d => d.device)
          .map(d => ({ device: d.device!, count: d._count })),
        browserStats: browserStats
          .filter(b => b.browser)
          .map(b => ({ browser: b.browser!, count: b._count })),
        referrerStats: referrerStats
          .filter(r => r.referer)
          .map(r => ({ referrer: r.referer!, count: r._count })),
        dailyClicks,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
