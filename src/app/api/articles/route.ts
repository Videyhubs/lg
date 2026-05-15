import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper to generate slug from title
function generateArticleSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// GET /api/articles - List all articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const published = searchParams.get('published');
    const limitParam = searchParams.get('limit');
    const trending = searchParams.get('trending');

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { excerpt: { contains: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (published !== null && published !== '') {
      where.isPublished = published === 'true';
    }

    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const orderBy = trending === 'true'
      ? { trendingScore: 'desc' as const }
      : { createdAt: 'desc' as const };

    const articles = await db.article.findMany({
      where,
      orderBy,
      ...(limit ? { take: limit } : {}),
    });

    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// POST /api/articles - Create article
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
      title,
      content,
      excerpt,
      thumbnail,
      category,
      tags,
      author,
      readTime,
    } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { success: false, error: 'title is required' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: 'content is required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    let slug = generateArticleSlug(title);
    if (!slug) {
      slug = generateArticleSlug('untitled-' + Date.now());
    }

    // Ensure slug is unique
    const existingSlug = await db.article.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const article = await db.article.create({
      data: {
        slug,
        title,
        content,
        excerpt: excerpt || null,
        thumbnail: thumbnail || null,
        category: category || null,
        tags: tags ? JSON.stringify(tags) : null,
        author: author || 'Admin',
        readTime: readTime ? parseInt(String(readTime), 10) : 5,
      },
    });

    return NextResponse.json({ success: true, data: article }, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create article' },
      { status: 500 }
    );
  }
}

// PUT /api/articles - Update article
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
        { success: false, error: 'Article id is required' },
        { status: 400 }
      );
    }

    // Check if article exists
    const existing = await db.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (fields.title !== undefined) {
      updateData.title = fields.title;
      updateData.slug = generateArticleSlug(fields.title) || `untitled-${Date.now()}`;
    }
    if (fields.content !== undefined) updateData.content = fields.content;
    if (fields.excerpt !== undefined) updateData.excerpt = fields.excerpt;
    if (fields.thumbnail !== undefined) updateData.thumbnail = fields.thumbnail;
    if (fields.category !== undefined) updateData.category = fields.category;
    if (fields.tags !== undefined)
      updateData.tags = fields.tags ? JSON.stringify(fields.tags) : null;
    if (fields.author !== undefined) updateData.author = fields.author;
    if (fields.readTime !== undefined)
      updateData.readTime = parseInt(String(fields.readTime), 10);
    if (fields.isPublished !== undefined) updateData.isPublished = fields.isPublished;
    if (fields.trendingScore !== undefined)
      updateData.trendingScore = parseInt(String(fields.trendingScore), 10);
    if (fields.fakeViews !== undefined)
      updateData.fakeViews = parseInt(String(fields.fakeViews), 10);

    const article = await db.article.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE /api/articles - Delete article
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
        { success: false, error: 'Article id is required' },
        { status: 400 }
      );
    }

    // Check if article exists
    const existing = await db.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    await db.article.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
