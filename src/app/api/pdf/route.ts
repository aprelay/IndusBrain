import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { markdownToPdf } from "@/lib/pdf";

export const runtime = "nodejs";

const MAX_MARKDOWN_LENGTH = 200_000;

export async function POST(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const markdown = typeof body?.markdown === "string" ? body.markdown : "";
  const title = typeof body?.title === "string" ? body.title.slice(0, 120) : "IndusBrain Report";
  const filename =
    typeof body?.filename === "string" && /^[\w.-]{1,80}$/.test(body.filename)
      ? body.filename
      : "report.pdf";
  if (!markdown || markdown.length > MAX_MARKDOWN_LENGTH) {
    return NextResponse.json({ error: "Invalid markdown" }, { status: 400 });
  }
  const pdf = await markdownToPdf(markdown, title);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
