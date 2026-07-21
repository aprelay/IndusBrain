import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { addApiKeyCredits, createApiKey, deleteApiKey, listApiKeys } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(listApiKeys());
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const credits = Number(body?.credits);
  if (!name || !Number.isInteger(credits) || credits <= 0) {
    return NextResponse.json(
      { error: "Requires 'name' and 'credits' (positive integer)" },
      { status: 400 }
    );
  }
  const key = `ib_${randomBytes(24).toString("hex")}`;
  createApiKey(key, name, credits);
  return NextResponse.json({ key, name, credits });
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const key = typeof body?.key === "string" ? body.key : "";
  const credits = Number(body?.credits);
  if (!key || !Number.isInteger(credits) || credits <= 0) {
    return NextResponse.json(
      { error: "Requires 'key' and 'credits' (positive integer)" },
      { status: 400 }
    );
  }
  const ok = addApiKeyCredits(key, credits);
  if (!ok) return NextResponse.json({ error: "Key not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const key = req.nextUrl.searchParams.get("key") || "";
  if (!key) return NextResponse.json({ error: "Missing 'key'" }, { status: 400 });
  return NextResponse.json({ ok: deleteApiKey(key) });
}
