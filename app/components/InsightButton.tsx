'use client';

import { useState } from "react";

export default function InsightButton() {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/insights", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate insight");
      setInsight(data.insight.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-sm font-semibold tracking-wide uppercase"
          style={{ color: "var(--text-secondary)", fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Weekly Insight
        </h2>
        <button
          onClick={handleClick}
          disabled={loading}
          className="text-sm px-3 py-1.5 rounded-md"
          style={{ background: "var(--accent-commit)", color: "#0D1117", opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Generating..." : "Generate Insight"}
        </button>
      </div>
      {error && <p style={{ color: "var(--accent-alert)" }}>{error}</p>}
      {insight && <p style={{ color: "var(--text-primary)" }}>{insight}</p>}
      {!insight && !error && (
        <p style={{ color: "var(--text-secondary)" }}>No insight generated yet this week.</p>
      )}
    </div>
  );
}