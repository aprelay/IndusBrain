import { NextRequest, NextResponse } from "next/server";
import { listQuoteRequests, updateQuoteStatus } from "@/lib/db";
import { auditAdminAction, isAdminAuthorized } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(listQuoteRequests());
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  auditAdminAction(req, "quote status updated");
  const body = await req.json().catch(() => null);
  const id = Number(body?.id);
  const status = typeof body?.status === "string" ? body.status : "";
  if (!Number.isInteger(id) || !["new", "quoted", "invoiced", "paid", "closed"].includes(status)) {
    return NextResponse.json(
      { error: "Requires 'id' and 'status' (new|quoted|invoiced|paid|closed)" },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: updateQuoteStatus(id, status) });
}
