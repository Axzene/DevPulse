import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateInsight } from "@/lib/insights";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const insight = await generateInsight(session.user.id);
    return NextResponse.json({ insight });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
