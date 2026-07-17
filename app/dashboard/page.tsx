import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/dashboard-data";
import CommitTrend from "@/app/components/charts/CommitTrend";
import LateNightRatio from "@/app/components/charts/LateNightRatio";
import HourHistogram from "@/app/components/charts/HourHistogram";
import CommitHeatmap from "@/app/components/charts/CommitHeatmap";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");

  const { commitTrend, lateNightRatio, hourHistogram, commitCalendar, totalCommits, activeDays } =
    await getDashboardData(session.user.id);

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          DevPulse
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Developer activity, tracked from real GitHub data.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total Commits" value={totalCommits} accent="var(--accent-commit)" />
        <StatCard label="Active Days" value={activeDays} accent="var(--accent-data)" />
      </div>

      <ChartCard title="Commit Activity">
        <CommitHeatmap data={commitCalendar} />
      </ChartCard>

      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard title="Commit Trend">
          <CommitTrend data={commitTrend} />
        </ChartCard>
        <ChartCard title="Late-Night Commit Ratio">
          <LateNightRatio data={lateNightRatio} />
        </ChartCard>
      </div>

      <ChartCard title="Most Active Hour (UTC)">
        <HourHistogram data={hourHistogram} />
      </ChartCard>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: accent }}
        />
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {label}
        </span>
      </div>
      <div
        className="text-3xl font-bold mt-2"
        style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-primary)" }}
      >
        {value}
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <h2
        className="text-sm font-semibold mb-4 tracking-wide uppercase"
        style={{ color: "var(--text-secondary)", fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}