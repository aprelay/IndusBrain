import { NextRequest, NextResponse } from "next/server";
import { issueCredits, listCredits } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(listCredits());
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const credits = Number(body?.credits);
  const note = typeof body?.note === "string" ? body.note : "";
  if (!code || !Number.isInteger(credits) || credits <= 0) {
    return NextResponse.json(
      { error: "Requires 'code' (string) and 'credits' (positive integer)" },
      { status: 400 }
    );
  }
  issueCredits(code, credits, note);
  return NextResponse.json({ ok: true });
}
