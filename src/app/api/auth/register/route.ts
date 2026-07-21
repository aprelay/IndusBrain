import { NextRequest, NextResponse } from "next/server";
import { createSession, createUser } from "@/lib/db";
import { hashPassword, newSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { clientIp, isRateLimited } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (isRateLimited(`register:${clientIp(req)}`, 5, 15 * 60_000)) {
    return NextResponse.json(
      { error: "Too many registrations — try again later." },
      { status: 429 }
    );
  }
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
    return NextResponse.json(
      { error: "Valid email and password (min 8 characters) required" },
      { status: 400 }
    );
  }
  const user = createUser(email, hashPassword(password));
  if (!user) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }
  const { token, expiresAt } = newSessionToken();
  createSession(user.id, token, expiresAt);
  const res = NextResponse.json({ email: user.email, credits: user.credits });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 86400,
    path: "/",
  });
  return res;
}
