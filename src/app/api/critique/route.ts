import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { critiqueDocument } from "@/lib/superintel";

export async function POST(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Please sign in.", signInRequired: true }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (text.length < 100) {
    return NextResponse.json(
      { error: "Paste your business plan or proposal text (at least 100 characters)" },
      { status: 400 }
    );
  }
  const critique = await critiqueDocument(text);
  if (!critique) {
    return NextResponse.json({ error: "Critique engine unavailable" }, { status: 503 });
  }
  return NextResponse.json({ critique });
}
