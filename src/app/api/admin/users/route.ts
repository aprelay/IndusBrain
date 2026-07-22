import { NextRequest, NextResponse } from "next/server";
import { addUserCredits, deleteUser, listUsers } from "@/lib/db";
import { auditAdminAction, isAdminAuthorized } from "@/lib/adminAuth";
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
  auditAdminAction(req, "user credits updated");
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

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const id = Number(body?.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Requires 'id'" }, { status: 400 });
  }
  const ok = deleteUser(id);
  if (!ok) {
    return NextResponse.json(
      { error: "User not found or is an admin" },
      { status: 404 }
    );
  }
  auditAdminAction(req, `user ${id} deleted`);
  return NextResponse.json({ ok: true });
}
