import { NextRequest, NextResponse } from "next/server";
import { createQuoteRequest } from "@/lib/db";
import { notifyOwner } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const company = typeof body?.company === "string" ? body.company.trim() : "";
  const request = typeof body?.request === "string" ? body.request.trim() : "";
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !request) {
    return NextResponse.json(
      { error: "Name, valid email and request description are required" },
      { status: 400 }
    );
  }
  if (name.length > 200 || company.length > 200 || request.length > 2000) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }
  createQuoteRequest({ name, email, company, request });
  notifyOwner(
    "New quote request — IndusBrain",
    `Name: ${name}\nEmail: ${email}\nCompany: ${company}\n\nRequest:\n${request}`
  );
  return NextResponse.json({ ok: true });
}
