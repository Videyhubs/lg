import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const projectRoot = process.cwd();
    const zipPath = join(projectRoot, 'linkguard-source.zip');

    // Regenerate ZIP if it doesn't exist
    if (!existsSync(zipPath)) {
      execSync(
        `cd "${projectRoot}" && zip -r linkguard-source.zip ` +
        `.env.example .github/ .dockerignore Caddyfile.prod Dockerfile docker-compose.yml ` +
        `vercel.json wrangler.toml package.json bun.lock tsconfig.json eslint.config.mjs ` +
        `postcss.config.mjs tailwind.config.ts components.json next.config.ts ` +
        `prisma/ public/ src/ README.md ` +
        `-x "src/.next/*" -x "*.db" -x "node_modules/*" -x ".git/*"`,
        { timeout: 30000 }
      );
    }

    if (!existsSync(zipPath)) {
      return NextResponse.json(
        { success: false, error: 'ZIP file not found' },
        { status: 404 }
      );
    }

    // Read the ZIP file
    const { readFile } = await import('fs/promises');
    const zipBuffer = await readFile(zipPath);

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="linkguard-source.zip"',
        'Content-Length': String(zipBuffer.length),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate download' },
      { status: 500 }
    );
  }
}
