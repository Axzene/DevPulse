'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { hour: number; count: number }[];
}

export default function HourHistogram({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
        <XAxis
          dataKey="hour"
          tick={{ fontSize: 11, fill: "#7D8590" }}
          tickFormatter={(h) => `${h}:00`}
        />
        <YAxis allowDecimals={false} tick={{ fill: "#7D8590" }} />
        <Tooltip
          labelFormatter={(h) => `${h}:00 UTC`}
          contentStyle={{ background: "#161B22", border: "1px solid #30363D", color: "#E6EDF3" }}
        />
        <Bar dataKey="count" fill="#58A6FF" />
      </BarChart>
    </ResponsiveContainer>
  );
}