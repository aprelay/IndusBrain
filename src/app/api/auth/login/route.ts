import { NextRequest, NextResponse } from "next/server";
import { createSession, getUserByEmail } from "@/lib/db";
import { newSessionToken, SESSION_COOKIE, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const user = email ? getUserByEmail(email) : null;
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
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
