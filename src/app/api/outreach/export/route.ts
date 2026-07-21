import { NextRequest, NextResponse } from "next/server";
import { consumeCredit, consumeUserCredit, searchOutreachDomains } from "@/lib/db";
import { OUTREACH_INDUSTRIES } from "@/lib/outreach";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_EXPORT = 100_000;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const industry = typeof body?.industry === "string" ? body.industry.trim() : "";
  if (!industry || !(OUTREACH_INDUSTRIES as readonly string[]).includes(industry)) {
    return NextResponse.json({ error: "Missing or unknown 'industry'" }, { status: 400 });
  }
  const billingEnabled = process.env.BILLING_ENABLED === "true";
  if (billingEnabled) {
    const user = getSessionUser(req);
    const accessCode = typeof body?.accessCode === "string" ? body.accessCode.trim() : "";
    const unlocked =
      (user !== null && (user.role === "admin" || consumeUserCredit(user.id))) ||
      (accessCode !== "" && consumeCredit(accessCode));
    if (!unlocked) {
      return NextResponse.json(
        { error: "Exporting requires 1 credit — sign in with credits or use an access code" },
        { status: 402 }
      );
    }
  }
  const { total, domains } = searchOutreachDomains(industry, "", 1, MAX_EXPORT);
  const lines = domains.map((d) => d.domain);
  if (total > MAX_EXPORT) {
    lines.push(`# ${total - MAX_EXPORT} more domains — contact us for the full list`);
  }
  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="outreach-${industry.replace(/[^a-z0-9]+/gi, "-")}.txt"`,
    },
  });
}
