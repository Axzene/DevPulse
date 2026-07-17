import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { syncDailyMetrics } from "@/lib/metrics"

export async function POST() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const results = await syncDailyMetrics(session.user.id)
    return NextResponse.json({ success: true, count: results.length, results })
  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json(
      { error: "Failed to sync GitHub data" },
      { status: 500 }
    )
  }
}