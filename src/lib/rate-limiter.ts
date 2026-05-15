// Simple in-memory rate limiter for API protection

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  identifier: string,
  options: {
    maxRequests?: number;
    windowMs?: number;
  } = {}
): RateLimitResult {
  const { maxRequests = 60, windowMs = 60 * 1000 } = options;
  const now = Date.now();
  const resetAt = now + windowMs;

  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    store.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

// Brute force protection for admin login
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

export function checkLoginAttempt(ip: string): { allowed: boolean; attemptsLeft: number; lockedUntil?: number } {
  const entry = loginAttempts.get(ip);
  const now = Date.now();
  
  if (entry) {
    if (entry.lockedUntil && now < entry.lockedUntil) {
      return { allowed: false, attemptsLeft: 0, lockedUntil: entry.lockedUntil };
    }
    if (entry.lockedUntil && now >= entry.lockedUntil) {
      loginAttempts.delete(ip);
      return { allowed: true, attemptsLeft: 5 };
    }
  }

  const current = entry?.count || 0;
  const remaining = 5 - current;
  
  if (remaining <= 0) {
    const lockedUntil = now + 15 * 60 * 1000; // Lock for 15 minutes
    loginAttempts.set(ip, { count: current, lockedUntil });
    return { allowed: false, attemptsLeft: 0, lockedUntil };
  }

  return { allowed: true, attemptsLeft: remaining };
}

export function recordFailedLogin(ip: string): void {
  const entry = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  entry.count++;
  loginAttempts.set(ip, entry);
}

export function resetLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}
