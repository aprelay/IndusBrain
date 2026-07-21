import { NextRequest, NextResponse } from "next/server";
import { deleteCompany, listCompanies, upsertCompany } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  "Legal",
  "Finance",
  "Insurance",
  "Engineering",
  "Regulatory",
  "Procurement",
  "Logistics",
  "Construction",
  "Operations",
  "Advisory",
  "Government",
];

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(listCompanies());
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const category = typeof body?.category === "string" ? body.category.trim() : "";
  if (!name || !CATEGORIES.includes(category)) {
    return NextResponse.json(
      { error: `Requires 'name' and 'category' (one of: ${CATEGORIES.join(", ")})` },
      { status: 400 }
    );
  }
  upsertCompany({
    id: Number.isInteger(body?.id) ? Number(body.id) : undefined,
    name,
    category,
    services: typeof body?.services === "string" ? body.services.trim().slice(0, 500) : "",
    location: typeof body?.location === "string" ? body.location.trim().slice(0, 200) : "",
    contact: typeof body?.contact === "string" ? body.contact.trim().slice(0, 300) : "",
    verified: body?.verified === true,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Missing 'id'" }, { status: 400 });
  }
  const ok = deleteCompany(id);
  return NextResponse.json({ ok });
}
