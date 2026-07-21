import { NextRequest } from "next/server";
import { timingSafeEqual } from "crypto";

export function isAdminAuthorized(req: NextRequest): boolean {
  const expected = process.env.ADMIN_ACCESS_CODE;
  if (!expected) return false;
  const provided =
    req.headers.get("x-admin-code") || req.cookies.get("admin_code")?.value || "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
