import { prisma } from "@/lib/prisma";

export interface GoalProgress {
  metric: "COMMITS_PER_WEEK" | "ACTIVE_DAYS_PER_WEEK" | "LATE_NIGHT_RATIO_MAX";
  target: number;
  current: number;
  met: boolean;
}

export async function getGoalProgress(userId: string): Promise<GoalProgress[]> {
  const [goals, metrics] = await Promise.all([
    prisma.goal.findMany({ where: { userId } }),
    prisma.dailyMetric.findMany({
      where: {
        userId,
        date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const totalCommits = metrics.reduce((sum, m) => sum + m.commits, 0);
  const totalLateNight = metrics.reduce((sum, m) => sum + m.lateNightCommits, 0);
  const activeDays = metrics.filter((m) => m.commits > 0).length;
  const lateNightRatio = totalCommits > 0 ? totalLateNight / totalCommits : 0;

  return goals.map((goal): GoalProgress =>  {
    let current: number;
    let met: boolean;

    switch (goal.metric) {
      case "COMMITS_PER_WEEK":
        current = totalCommits;
        met = current >= goal.target;
        break;
      case "ACTIVE_DAYS_PER_WEEK":
        current = activeDays;
        met = current >= goal.target;
        break;
      case "LATE_NIGHT_RATIO_MAX":
        current = lateNightRatio;
        met = current <= goal.target; // ceiling — met means staying under, not over
        break;
    }

    return { metric: goal.metric, target: goal.target, current, met };
  });
}

export async function setGoal(userId: string, metric: GoalProgress["metric"], target: number) {
  return prisma.goal.upsert({
    where: { userId_metric: { userId, metric } },
    update: { target },
    create: { userId, metric, target },
  });
}