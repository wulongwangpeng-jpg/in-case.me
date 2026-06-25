/**
 * Rate limiting middleware — simple in-memory IP counting.
 * In production, replace with Vercel KV or Redis for distributed accuracy.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory store (resets on deployment / cold start)
const store = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;

  entry.count++;
  return true;
}

// Periodic cleanup (every 5 min, sweep expired entries)
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of store) {
    if (now > v.resetAt) store.delete(k);
  }
}, 300_000);

export default function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // ── Auth / SMS: 5 req / 60s per IP ──
  if (path === "/api/auth/send-code" || path === "/api/auth/login") {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(ip, 5, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }
  }

  // ── Unlock / brute-force guard: 10 req / 15 min per IP ──
  if (path === "/api/unlock") {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(ip, 10, 900_000)) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }
  }

  // ── Credential creation: 3 req / 60s per IP ──
  if (path === "/api/credentials" && req.method === "POST") {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(ip, 3, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }
  }

  // ── AI endpoints (cost money): 10 req / 60s per IP ──
  if (path.startsWith("/api/ai/")) {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(ip, 10, 60_000)) {
      return NextResponse.json(
        { error: "Too many AI requests. Please wait a moment." },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/auth/send-code",
    "/api/auth/login",
    "/api/unlock",
    "/api/credentials",
    "/api/ai/:path*",
  ],
};
