// lib/dashboard-data.ts
import { prisma } from "@/lib/prisma";

export async function getDashboardData(userId: string) {
  const metrics = await prisma.dailyMetric.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  });

  const commitTrend = metrics.map((m) => ({
    date: m.date.toISOString().slice(0, 10), // YYYY-MM-DD for chart labels
    commits: m.commits,
  }));

  const commitCalendar = metrics.map((m) => ({
  date: m.date.toISOString().slice(0, 10),
  count: m.commits,
    }));

  const lateNightRatio = metrics.map((m) => ({
    date: m.date.toISOString().slice(0, 10),
    ratio: m.commits > 0 ? m.lateNightCommits / m.commits : 0,
  }));

  // Histogram: count how many days each UTC hour was the "most active" hour
  const hourCounts = new Array(24).fill(0);
  for (const m of metrics) {
    if (m.productivityHour !== null) hourCounts[m.productivityHour]++;
  }
  const hourHistogram = hourCounts.map((count, hour) => ({ hour, count }));

  const totalCommits = metrics.reduce((sum, m) => sum + m.commits, 0);
  const activeDays = metrics.filter((m) => m.commits > 0).length;

return { commitTrend, lateNightRatio, hourHistogram, commitCalendar, totalCommits, activeDays };
}