import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { listSubscriptions } from "@/lib/db";
import { getOrCreateDigest } from "@/lib/superintel";

export async function POST(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Please sign in.", signInRequired: true }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const topic = typeof body?.topic === "string" ? body.topic.trim().slice(0, 100) : "";
  if (!topic) {
    return NextResponse.json({ error: "Requires 'topic'" }, { status: 400 });
  }
  const subscribed = listSubscriptions(user.id).some(
    (s) => s.topic.toLowerCase() === topic.toLowerCase()
  );
  if (!subscribed) {
    return NextResponse.json({ error: "Subscribe to this topic first" }, { status: 403 });
  }
  const digest = await getOrCreateDigest(topic);
  if (!digest) {
    return NextResponse.json({ error: "Digest engine unavailable" }, { status: 503 });
  }
  return NextResponse.json({ topic, digest });
}
