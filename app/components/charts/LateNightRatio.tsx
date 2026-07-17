'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { date: string; ratio: number }[];
}

export default function LateNightRatio({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#7D8590" }} />
        <YAxis
          domain={[0, 1]}
          tick={{ fill: "#7D8590" }}
          tickFormatter={(v) => `${Math.round(v * 100)}%`}
        />
        <Tooltip
          formatter={(value) => {
            const v = typeof value === "number" ? value : Number(value);
            return `${Math.round(v * 100)}%`;
          }}
          contentStyle={{ background: "#161B22", border: "1px solid #30363D", color: "#E6EDF3" }}
        />
        <Bar dataKey="ratio" fill="#F0883E" />
      </BarChart>
    </ResponsiveContainer>
  );
}