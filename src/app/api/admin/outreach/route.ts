import { NextRequest, NextResponse } from "next/server";
import {
  bulkInsertOutreachDomains,
  deleteOutreachIndustry,
  outreachIndustryStats,
} from "@/lib/db";
import { OUTREACH_INDUSTRIES, parseDomainList } from "@/lib/outreach";
import { isAdminAuthorized } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20 MB per upload; split larger lists

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(outreachIndustryStats());
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const text = await req.text().catch(() => "");
  if (!text.trim()) {
    return NextResponse.json(
      { error: "Empty upload — send CSV or TXT domain list as the request body" },
      { status: 400 }
    );
  }
  if (text.length > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Upload too large — split the file into chunks under 20 MB" },
      { status: 413 }
    );
  }
  const industryParam = req.nextUrl.searchParams.get("industry")?.trim() || "";
  if (industryParam && !(OUTREACH_INDUSTRIES as readonly string[]).includes(industryParam)) {
    return NextResponse.json(
      { error: `Unknown industry '${industryParam}'` },
      { status: 400 }
    );
  }
  const entries = parseDomainList(text, industryParam || undefined);
  if (entries.length === 0) {
    return NextResponse.json(
      { error: "No valid domains found in the upload" },
      { status: 400 }
    );
  }
  const added = bulkInsertOutreachDomains(entries);
  return NextResponse.json({
    parsed: entries.length,
    added,
    duplicatesSkipped: entries.length - added,
  });
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const industry = req.nextUrl.searchParams.get("industry")?.trim() || "";
  if (!industry) {
    return NextResponse.json({ error: "Missing 'industry'" }, { status: 400 });
  }
  const removed = deleteOutreachIndustry(industry);
  return NextResponse.json({ removed });
}
