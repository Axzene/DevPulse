import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getGoalProgress, setGoal } from "@/lib/goals";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = await getGoalProgress(session.user.id);
  return NextResponse.json({ progress });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { metric, target } = body;

  if (!metric || typeof target !== "number") {
    return NextResponse.json({ error: "Invalid goal data" }, { status: 400 });
  }

  const goal = await setGoal(session.user.id, metric, target);
  return NextResponse.json({ goal });
}