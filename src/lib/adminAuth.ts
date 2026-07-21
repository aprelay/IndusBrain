import { NextRequest } from "next/server";
import { timingSafeEqual } from "crypto";
import { clientIp } from "@/lib/security";
import { logBlueprintRequest } from "@/lib/db";

const failedAttempts = new Map<string, number[]>();
const FAIL_WINDOW_MS = 15 * 60_000;
const MAX_FAILURES = 10;

export function isAdminAuthorized(req: NextRequest): boolean {
  const expected = process.env.ADMIN_ACCESS_CODE;
  if (!expected) return false;
  const provided =
    req.headers.get("x-admin-code") || req.cookies.get("admin_code")?.value || "";
  if (!provided) return false;
  const ip = clientIp(req);
  const now = Date.now();
  const fails = (failedAttempts.get(ip) || []).filter((t) => now - t < FAIL_WINDOW_MS);
  if (fails.length >= MAX_FAILURES) {
    failedAttempts.set(ip, fails);
    return false;
  }
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  const ok = a.length === b.length && timingSafeEqual(a, b);
  if (!ok) {
    fails.push(now);
    failedAttempts.set(ip, fails);
    if (failedAttempts.size > 10_000) failedAttempts.clear();
  }
  return ok;
}

export function auditAdminAction(req: NextRequest, action: string, detail = ""): void {
  try {
    logBlueprintRequest({
      request: `[admin] ${action}${detail ? ` — ${detail}` : ""}`,
      industry: "admin",
      source: "admin",
      ip: clientIp(req),
    });
  } catch {
    // auditing must never break the action itself
  }
}
