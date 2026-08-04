import { NextRequest, NextResponse } from "next/server";
import { deleteIndustry, listIndustries, upsertIndustry } from "@/lib/db";
import { auditAdminAction, isAdminAuthorized } from "@/lib/adminAuth";
import { IndustryTemplate } from "@/lib/types";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorized();
  return NextResponse.json(listIndustries());
}

function validateTemplate(body: unknown): IndustryTemplate | null {
  const t = body as Partial<IndustryTemplate>;
  if (
    typeof t?.id !== "string" ||
    !/^[a-z0-9-]+$/.test(t.id) ||
    typeof t?.name !== "string" ||
    typeof t?.summary !== "string" ||
    !Array.isArray(t?.keywords) ||
    !Array.isArray(t?.phases) ||
    !Array.isArray(t?.regulators) ||
    !Array.isArray(t?.risks) ||
    !Array.isArray(t?.paymentPoints)
  ) {
    return null;
  }
  return t as IndustryTemplate;
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorized();
  const body = await req.json().catch(() => null);
  const template = validateTemplate(body);
  if (!template) {
    return NextResponse.json(
      { error: "Invalid industry template: requires id (lowercase-hyphen), name, summary, keywords[], phases[], regulators[], risks[], paymentPoints[]" },
      { status: 400 }
    );
  }
  upsertIndustry(template);
  auditAdminAction(req, "industry saved", template.id);
  return NextResponse.json({ ok: true, id: template.id });
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthorized(req)) return unauthorized();
  const id = req.nextUrl.searchParams.get("id") || "";
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const deleted = deleteIndustry(id);
  auditAdminAction(req, "industry deleted", id);
  return NextResponse.json({ ok: deleted });
}
