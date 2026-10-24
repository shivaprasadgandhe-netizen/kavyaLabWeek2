"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface SignupsChartProps {
  data: Array<{ date: string; count: number }>;
}

export default function SignupsChart({ data }: SignupsChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-72 sm:h-80 flex items-center justify-center text-slate-500 text-sm">
        Loading chart...
      </div>
    );
  }

  return (
    <div className="w-full h-72 sm:h-80" id="signups-chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 12, right: 12, left: -20, bottom: 6 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            interval={4}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            allowDecimals={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#334155",
              borderRadius: "0.5rem",
              color: "#f8fafc",
              fontSize: "12px",
            }}
            cursor={{ fill: "rgba(99, 102, 241, 0.15)" }}
          />
          <Bar
            dataKey="count"
            name="New Signups"
            fill="#6366f1"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
