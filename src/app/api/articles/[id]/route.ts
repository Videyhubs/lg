import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/articles/[id] - Update a single article
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

    const existing = await db.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.thumbnail !== undefined) updateData.thumbnail = body.thumbnail;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.tags !== undefined) updateData.tags = body.tags ? JSON.stringify(body.tags) : null;
    if (body.author !== undefined) updateData.author = body.author;
    if (body.readTime !== undefined) updateData.readTime = parseInt(String(body.readTime), 10);
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;
    if (body.trendingScore !== undefined) updateData.trendingScore = parseInt(String(body.trendingScore), 10);
    if (body.fakeViews !== undefined) updateData.fakeViews = parseInt(String(body.fakeViews), 10);

    const article = await db.article.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[id] - Delete a single article
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
