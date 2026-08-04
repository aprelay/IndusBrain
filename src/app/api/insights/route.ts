import { NextResponse } from "next/server";
import { getBrainInsights } from "@/lib/brain";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getBrainInsights());
}
