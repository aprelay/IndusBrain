import { NextRequest, NextResponse } from "next/server";
import { generateBlueprint } from "@/lib/generate";
import { consumeApiKeyCredit, logBlueprintRequest } from "@/lib/db";

export const dynamic = "force-dynamic";

const MAX_REQUEST_LENGTH = 500;

/**
 * Public partner API. Requires an API key issued from the admin panel via the
 * `x-api-key` header; each successful call consumes one API-key credit.
 */
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key") || "";
  if (!apiKey) {
    return NextResponse.json({ error: "Missing x-api-key header" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const request = typeof body?.request === "string" ? body.request.trim() : "";
  if (!request) {
    return NextResponse.json({ error: "Missing 'request' field" }, { status: 400 });
  }
  if (request.length > MAX_REQUEST_LENGTH) {
    return NextResponse.json(
      { error: `Request too long (max ${MAX_REQUEST_LENGTH} characters)` },
      { status: 400 }
    );
  }
  if (!consumeApiKeyCredit(apiKey)) {
    return NextResponse.json(
      { error: "Invalid API key or no credits remaining" },
      { status: 402 }
    );
  }
  const country = typeof body?.country === "string" ? body.country.trim().slice(0, 60) : "";
  const blueprint = await generateBlueprint(request, country || undefined);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "api";
  logBlueprintRequest({
    request,
    industry: blueprint.industry,
    source: `api:${blueprint.source}`,
    ip,
  });
  return NextResponse.json(blueprint);
}
