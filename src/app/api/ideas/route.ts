import { NextRequest, NextResponse } from "next/server";
import { generateIdeas, IdeaReport } from "@/lib/ideas";
import {
  consumeCredit,
  consumeUserCredit,
  logBlueprintRequest,
  saveIdeaReport,
} from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { buildMemoryContext, rememberIdeaReport } from "@/lib/brain";

const MAX_REQUEST_LENGTH = 500;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 6;

const requestLog = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(key) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX) {
    requestLog.set(key, timestamps);
    return true;
  }
  timestamps.push(now);
  requestLog.set(key, timestamps);
  return false;
}

function toPreview(report: IdeaReport): IdeaReport {
  return {
    ...report,
    ideas: report.ideas.slice(0, 1).map((i) => ({
      ...i,
      concept: `${i.concept.slice(0, 140)}…`,
      targetMarket: "Unlock the full report to see details",
      revenueModel: "—",
      whyNow: "—",
      marketSignals: "",
      competitiveLandscape: "",
      capitalRequired: "",
      unitEconomics: "",
      confidence: "",
      regulatoryPath: [],
      goToMarket: [],
      ecosystemNeeded: [],
      risks: [],
      assumptions: [],
      firstSteps: [],
    })),
  };
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests, please wait a minute" },
      { status: 429 }
    );
  }
  const body = await req.json().catch(() => null);
  const brief = typeof body?.brief === "string" ? body.brief.trim() : "";
  if (!brief) {
    return NextResponse.json({ error: "Missing 'brief' field" }, { status: 400 });
  }
  if (brief.length > MAX_REQUEST_LENGTH) {
    return NextResponse.json(
      { error: `Brief too long (max ${MAX_REQUEST_LENGTH} characters)` },
      { status: 400 }
    );
  }
  const country = typeof body?.country === "string" ? body.country.trim().slice(0, 60) : "";
  const memoryContext = buildMemoryContext(brief);
  const report = await generateIdeas(brief, country || undefined, memoryContext || undefined);
  if (!report) {
    return NextResponse.json(
      { error: "Idea Engine unavailable — AI is not configured or the request failed" },
      { status: 503 }
    );
  }
  logBlueprintRequest({
    request: brief,
    industry: "Idea Engine",
    source: "ideas",
    ip,
  });
  rememberIdeaReport(report);

  const user = getSessionUser(req);
  const billingEnabled = process.env.BILLING_ENABLED === "true";
  if (billingEnabled) {
    const accessCode = typeof body?.accessCode === "string" ? body.accessCode.trim() : "";
    const unlocked =
      (user !== null && (user.role === "admin" || consumeUserCredit(user.id))) ||
      (accessCode !== "" && consumeCredit(accessCode));
    if (!unlocked) {
      return NextResponse.json({ ...toPreview(report), locked: true });
    }
  }
  if (user) {
    saveIdeaReport(user.id, `Ideas: ${brief.slice(0, 80)}`, JSON.stringify(report));
  }
  return NextResponse.json(report);
}
