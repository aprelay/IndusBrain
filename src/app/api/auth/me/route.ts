import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: { email: user.email, role: user.role, credits: user.credits },
  });
}
