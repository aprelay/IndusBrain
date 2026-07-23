import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { addSubscription, listSubscriptions, removeSubscription } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Please sign in.", signInRequired: true }, { status: 401 });
  }
  return NextResponse.json({ subscriptions: listSubscriptions(user.id) });
}

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
  if (listSubscriptions(user.id).length >= 10) {
    return NextResponse.json({ error: "Maximum 10 subscriptions" }, { status: 400 });
  }
  addSubscription(user.id, topic);
  return NextResponse.json({ subscriptions: listSubscriptions(user.id) });
}

export async function DELETE(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Please sign in.", signInRequired: true }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const id = Number(body?.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Requires 'id'" }, { status: 400 });
  }
  removeSubscription(user.id, id);
  return NextResponse.json({ subscriptions: listSubscriptions(user.id) });
}
