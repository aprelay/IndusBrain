import { NextRequest, NextResponse } from "next/server";
import { getSavedIdea, listSavedIdeas } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const idParam = req.nextUrl.searchParams.get("id");
  if (idParam) {
    const id = Number(idParam);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid 'id'" }, { status: 400 });
    }
    const data = getSavedIdea(user.id, id);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return new NextResponse(data, {
      headers: { "Content-Type": "application/json" },
    });
  }
  return NextResponse.json(listSavedIdeas(user.id));
}
