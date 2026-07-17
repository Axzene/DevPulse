// components/charts/CommitHeatmap.tsx
'use client';

interface DayData {
  date: string; // YYYY-MM-DD
  count: number;
}

function getColor(count: number, max: number): string {
  if (count === 0) return "#161b22";
  const ratio = count / max;
  if (ratio < 0.25) return "#0e4429";
  if (ratio < 0.5) return "#006d32";
  if (ratio < 0.75) return "#26a641";
  return "#39d353";
}

export default function CommitHeatmap({ data }: { data: DayData[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  // Map date -> count for O(1) lookup while walking the calendar grid
  const dateMap = new Map(data.map((d) => [d.date, d.count]));

  // Build a continuous day range from first to last date, grouped into weeks (columns)
  const start = new Date(data[0]?.date ?? new Date());
  const end = new Date(data[data.length - 1]?.date ?? new Date());
  const days: string[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(d.toISOString().slice(0, 10));
  }

  // Pad to start on a Sunday so weeks align into clean columns
  const firstDay = new Date(days[0]).getDay();
  const padded = Array(firstDay).fill(null).concat(days);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  return (
    <div className="flex gap-1 overflow-x-auto">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map((date, di) => (
            <div
              key={di}
              title={date ? `${date}: ${dateMap.get(date) ?? 0} commits` : undefined}
              className={`w-3 h-3 rounded-sm ${
                date ? getColor(dateMap.get(date) ?? 0, max) : "bg-transparent"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}