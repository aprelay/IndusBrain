import { NextRequest, NextResponse } from "next/server";
import { listRegWatch } from "@/lib/db";
import { auditAdminAction, isAdminAuthorized } from "@/lib/adminAuth";
import { runRegWatchCheck, seedRegulatorWatchlist } from "@/lib/superintel";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  seedRegulatorWatchlist();
  return NextResponse.json({ watchlist: listRegWatch() });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runRegWatchCheck(15);
  auditAdminAction(req, `regulatory watch check: ${result.checked} checked, ${result.changed.length} changed`);
  return NextResponse.json({ ...result, watchlist: listRegWatch() });
}
