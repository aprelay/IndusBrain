import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { deletePrice, listPrices, upsertPrice } from "@/lib/db";
import { auditAdminAction, isAdminAuthorized } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user && !isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Please sign in.", signInRequired: true }, { status: 401 });
  }
  const country = req.nextUrl.searchParams.get("country") || undefined;
  return NextResponse.json({ prices: listPrices(country) });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const item = typeof body?.item === "string" ? body.item.trim().slice(0, 120) : "";
  const price = typeof body?.price === "string" ? body.price.trim().slice(0, 80) : "";
  if (!item || !price) {
    return NextResponse.json({ error: "Requires 'item' and 'price'" }, { status: 400 });
  }
  upsertPrice({
    item,
    price,
    unit: typeof body?.unit === "string" ? body.unit.trim().slice(0, 40) : "",
    country: typeof body?.country === "string" && body.country.trim() ? body.country.trim().slice(0, 60) : "Nigeria",
    source: typeof body?.source === "string" ? body.source.trim().slice(0, 200) : "",
  });
  auditAdminAction(req, `price updated: ${item}`);
  return NextResponse.json({ prices: listPrices() });
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const id = Number(body?.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Requires 'id'" }, { status: 400 });
  }
  deletePrice(id);
  auditAdminAction(req, `price ${id} deleted`);
  return NextResponse.json({ prices: listPrices() });
}
