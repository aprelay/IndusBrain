import { NextRequest, NextResponse } from "next/server";
import { generateBlueprint } from "@/lib/generate";
import { consumeCredit, consumeUserCredit, logBlueprintRequest, saveBlueprint } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { rememberBlueprint } from "@/lib/brain";
import { Blueprint } from "@/lib/types";

const MAX_REQUEST_LENGTH = 500;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

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
  const request = typeof body?.request === "string" ? body.request.trim() : "";
  if (!request) {
    return NextResponse.json({ error: "Missing 'request' field" }, { status: 400 });
  }
  if (request.length > MAX_REQUEST_LENGTH) {
    return NextResponse.json(
      { error: `Request too long (max ${MAX_REQUEST_LENGTH} characters)` },
      { status: 400 }
    );
  }
  const country = typeof body?.country === "string" ? body.country.trim().slice(0, 60) : "";
  const blueprint = await generateBlueprint(request, country || undefined);
  logBlueprintRequest({
    request,
    industry: blueprint.industry,
    source: blueprint.source,
    ip,
  });
  rememberBlueprint(request, blueprint.industry, country || undefined);

  const user = getSessionUser(req);
  const billingEnabled = process.env.BILLING_ENABLED === "true";
  if (billingEnabled) {
    const accessCode = typeof body?.accessCode === "string" ? body.accessCode.trim() : "";
    const unlocked =
      (user !== null && (user.role === "admin" || consumeUserCredit(user.id))) ||
      (accessCode !== "" && consumeCredit(accessCode));
    if (!unlocked) {
      return NextResponse.json({ ...toPreview(blueprint), locked: true });
    }
  }
  let savedId: number | undefined;
  if (user) {
    savedId = saveBlueprint(user.id, blueprint.title, JSON.stringify(blueprint));
  }
  return NextResponse.json(savedId ? { ...blueprint, savedId } : blueprint);
}

function toPreview(bp: Blueprint): Blueprint {
  return {
    ...bp,
    phases: bp.phases.map((p) => ({
      ...p,
      stakeholders: p.stakeholders.slice(0, 1).map((s) => ({
        ...s,
        responsibility: "Unlock the full blueprint to see details",
        whenEngaged: "—",
        typicalCost: undefined,
      })),
      deliverables: [],
    })),
    regulators: [],
    risks: [],
    paymentPoints: [],
    budget: [],
  };
}
