import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, generateSecureToken } from '@/lib/crypto';
import {
  checkLoginAttempt,
  recordFailedLogin,
  resetLoginAttempts,
} from '@/lib/rate-limiter';

// Helper to get client IP
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

// POST /api/admin - Admin login
export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);

    // Check brute force protection
    const attemptCheck = checkLoginAttempt(clientIp);
    if (!attemptCheck.allowed) {
      const minutesLeft = Math.ceil(
        ((attemptCheck.lockedUntil || 0) - Date.now()) / (60 * 1000)
      );
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please try again in ${minutesLeft} minutes.`,
          attemptsLeft: 0,
          lockedUntil: attemptCheck.lockedUntil,
        },
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
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find admin by username
    const admin = await db.adminAccount.findUnique({
      where: { username },
    });

    if (!admin) {
      recordFailedLogin(clientIp);
      const check = checkLoginAttempt(clientIp);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
          attemptsLeft: check.attemptsLeft,
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = verifyPassword(password, admin.passwordHash);

    if (!isPasswordValid) {
      recordFailedLogin(clientIp);
      const check = checkLoginAttempt(clientIp);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
          attemptsLeft: check.attemptsLeft,
        },
        { status: 401 }
      );
    }

    // Successful login - reset attempts and generate token
    resetLoginAttempts(clientIp);

    const token = generateSecureToken(32);

    // Update last login
    await db.adminAccount.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}

// GET /api/admin - Verify admin token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Simplified auth - just return valid for now
    // In production, you'd verify the token against a stored session
    return NextResponse.json({ success: true, valid: true });
  } catch (error) {
    console.error('Error verifying admin token:', error);
    return NextResponse.json(
      { success: false, error: 'Token verification failed' },
      { status: 500 }
    );
  }
}
