'use client';

import { useEffect, useState } from "react";

interface GoalProgress {
  metric: "COMMITS_PER_WEEK" | "ACTIVE_DAYS_PER_WEEK" | "LATE_NIGHT_RATIO_MAX";
  target: number;
  current: number;
  met: boolean;
}

const METRIC_LABELS: Record<GoalProgress["metric"], string> = {
  COMMITS_PER_WEEK: "Commits per week",
  ACTIVE_DAYS_PER_WEEK: "Active days per week",
  LATE_NIGHT_RATIO_MAX: "Late-night ratio ceiling (UTC)",
};

export default function GoalsPanel() {
  const [progress, setProgress] = useState<GoalProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<GoalProgress["metric"]>("COMMITS_PER_WEEK");
  const [target, setTarget] = useState("");

  async function loadProgress() {
    setLoading(true);
    const res = await fetch("/api/goals");
    const data = await res.json();
    setProgress(data.progress ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadProgress();
  }, []);

  async function handleSetGoal() {
    const targetNum = parseFloat(target);
    if (isNaN(targetNum)) return;
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metric, target: targetNum }),
    });
    setTarget("");
    loadProgress();
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <h2
        className="text-sm font-semibold tracking-wide uppercase mb-4"
        style={{ color: "var(--text-secondary)", fontFamily: "'Space Grotesk', sans-serif" }}
      >
        Goals
      </h2>

      {loading ? (
        <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
      ) : progress.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>No goals set yet.</p>
      ) : (
        <div className="space-y-3 mb-4">
          {progress.map((g) => {
            const pct =
              g.metric === "LATE_NIGHT_RATIO_MAX"
                ? Math.min(100, (g.current / g.target) * 100)
                : Math.min(100, (g.current / g.target) * 100);
            return (
              <div key={g.metric}>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: "var(--text-primary)" }}>{METRIC_LABELS[g.metric]}</span>
                  <span style={{ color: g.met ? "var(--accent-commit)" : "var(--text-secondary)" }}>
                    {g.metric === "LATE_NIGHT_RATIO_MAX"
                      ? `${Math.round(g.current * 100)}% / ${Math.round(g.target * 100)}%`
                      : `${g.current.toFixed(0)} / ${g.target}`}
                  </span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "var(--border)" }}>
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: g.met ? "var(--accent-commit)" : "var(--accent-data)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2">
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value as GoalProgress["metric"])}
          className="text-sm px-2 py-1.5 rounded-md flex-1"
          style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        >
          <option value="COMMITS_PER_WEEK">Commits per week</option>
          <option value="ACTIVE_DAYS_PER_WEEK">Active days per week</option>
          <option value="LATE_NIGHT_RATIO_MAX">Late-night ratio ceiling</option>
        </select>
        <input
        type="number"
        step={metric === "LATE_NIGHT_RATIO_MAX" ? "0.01" : "1"}
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder={metric === "LATE_NIGHT_RATIO_MAX" ? "e.g. 0.2 (20%)" : "e.g. 5"}
        className="text-sm px-2 py-1.5 rounded-md w-28"
        style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        />
        <button
          onClick={handleSetGoal}
          className="text-sm px-3 py-1.5 rounded-md"
          style={{ background: "var(--accent-commit)", color: "#0D1117" }}
        >
          Set
        </button>
      </div>
    </div>
  );
}