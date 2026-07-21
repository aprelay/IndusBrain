import { NextRequest, NextResponse } from "next/server";
import { generateBlueprint } from "@/lib/generate";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const request = typeof body?.request === "string" ? body.request.trim() : "";
  if (!request) {
    return NextResponse.json({ error: "Missing 'request' field" }, { status: 400 });
  }
  const blueprint = await generateBlueprint(request);
  return NextResponse.json(blueprint);
}
