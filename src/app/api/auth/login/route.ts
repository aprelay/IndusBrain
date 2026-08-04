import { NextRequest, NextResponse } from "next/server";
import { createSession, getUserByEmail } from "@/lib/db";
import { newSessionToken, SESSION_COOKIE, verifyPassword } from "@/lib/auth";
import { clientIp, isRateLimited } from "@/lib/security";
import { verifyCaptcha } from "@/lib/captcha";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (isRateLimited(`login:${clientIp(req)}`, 10, 15 * 60_000)) {
    return NextResponse.json(
      { error: "Too many login attempts — try again in 15 minutes." },
      { status: 429 }
    );
  }
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const captchaToken = typeof body?.captchaToken === "string" ? body.captchaToken : "";
  if (!(await verifyCaptcha(captchaToken, clientIp(req)))) {
    return NextResponse.json(
      { error: "Captcha verification failed — please try again." },
      { status: 400 }
    );
  }
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
