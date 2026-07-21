import { NextRequest, NextResponse } from "next/server";
import { addUserCredits, listUsers } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(listUsers());
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const credits = Number(body?.credits);
  if (!email || !Number.isInteger(credits) || credits <= 0) {
    return NextResponse.json(
      { error: "Requires 'email' and 'credits' (positive integer)" },
      { status: 400 }
    );
  }
  const ok = addUserCredits(email, credits);
  if (!ok) return NextResponse.json({ error: "No user with that email" }, { status: 404 });
  void sendEmail(
    email,
    "Blueprint credits added — IndusBrain",
    `Your payment has been confirmed and ${credits} blueprint credit(s) have been added to your IndusBrain account. Sign in to generate your full blueprints.`
  );
  return NextResponse.json({ ok: true });
}
