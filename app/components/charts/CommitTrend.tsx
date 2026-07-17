'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { date: string; commits: number }[];
}

export default function CommitTrend({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#7D8590" }} />
        <YAxis allowDecimals={false} tick={{ fill: "#7D8590" }} />
        <Tooltip
          contentStyle={{ background: "#161B22", border: "1px solid #30363D", color: "#E6EDF3" }}
        />
        <Line type="monotone" dataKey="commits" stroke="#3FB950" strokeWidth={2} dot={{ fill: "#3FB950", r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}