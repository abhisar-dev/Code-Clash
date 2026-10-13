import crypto from 'crypto';
import { NextRequest } from 'next/server';

// 1. Cryptographic Password Hashing with Salt (PBKDF2 / SHA-256)
export function hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computed = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
}

// 2. Token Bucket Rate Limiter (Per IP / User Token)
interface RateBucket {
  tokens: number;
  lastRefill: number;
}

const rateLimitStore = new Map<string, RateBucket>();
const RATE_LIMIT_CAPACITY = 60; // Max requests
const REFILL_RATE_PER_SECOND = 1; // 1 token added per second

export function checkRateLimit(clientId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let bucket = rateLimitStore.get(clientId);

  if (!bucket) {
    bucket = { tokens: RATE_LIMIT_CAPACITY, lastRefill: now };
    rateLimitStore.set(clientId, bucket);
  }

  // Refill tokens based on elapsed time
  const elapsedSeconds = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(RATE_LIMIT_CAPACITY, bucket.tokens + elapsedSeconds * REFILL_RATE_PER_SECOND);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { allowed: true, remaining: Math.floor(bucket.tokens) };
  }

  return { allowed: false, remaining: 0 };
}

// 3. Code Sanitization & Threat Scanner
// Guards against common shell injection, malicious fork bombs, and file descriptor wipes
const DANGEROUS_PATTERNS = [
  /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/, // Fork bomb
  /rm\s+-rf\s+[\/~]/i,                         // Destructive rm
  /mkfifo\s+/i,                                // Reverse shell pipe
  /bash\s+-i\s+>&/i,                           // Reverse shell
  /nc\s+-e\s+/i,                               // Netcat reverse shell
  /dev\/tcp\//i,                               // Dev tcp socket
  /powershell.*-enc/i,                         // Encoded PS payload
  /drop\s+database/i,                          // SQL drop
];

export function sanitizeCodeSubmission(code: string): { safe: boolean; reason?: string } {
  if (!code || typeof code !== 'string') {
    return { safe: false, reason: 'Empty submission payload' };
  }

  if (code.length > 50000) {
    return { safe: false, reason: 'Payload exceeds 50KB code limit' };
  }

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(code)) {
      return { safe: false, reason: 'Security violation: Suspicious or unsafe system execution pattern detected' };
    }
  }

  return { safe: true };
}

// 4. Client IP Extractor
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}
