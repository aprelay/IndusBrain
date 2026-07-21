import { NextResponse } from "next/server";
import { listIndustries } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = listIndustries().map((i) => ({
    id: i.id,
    name: i.name,
    isicCode: i.isicCode,
    country: i.country,
  }));
  return NextResponse.json(items);
}
