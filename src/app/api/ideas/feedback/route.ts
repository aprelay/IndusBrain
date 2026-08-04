import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { recordIdeaFeedback } from "@/lib/db";

const OUTCOMES = new Set(["worked", "failed", "in-progress"]);

export async function POST(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Please sign in.", signInRequired: true }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const ideaName = typeof body?.ideaName === "string" ? body.ideaName.trim().slice(0, 200) : "";
  const outcome = typeof body?.outcome === "string" ? body.outcome.trim() : "";
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) : "";
  if (!ideaName || !OUTCOMES.has(outcome)) {
    return NextResponse.json(
      { error: "Requires 'ideaName' and 'outcome' (worked | failed | in-progress)" },
      { status: 400 }
    );
  }
  recordIdeaFeedback(user.id, ideaName, outcome, note);
  return NextResponse.json({ ok: true });
}
