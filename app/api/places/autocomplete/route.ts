import { NextResponse } from "next/server";

import { nestAutocompletePlaces } from "@/lib/api";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input") ?? "";
  const predictions = await nestAutocompletePlaces(input, session.apiToken);
  return NextResponse.json(predictions);
}
