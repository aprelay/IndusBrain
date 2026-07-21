import { NextRequest, NextResponse } from "next/server";
import { listCompanies } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") || undefined;
  return NextResponse.json(listCompanies(category));
}
