import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import dashboardData from "@/data/dashboard.json";

const { borrowingTrends: borrowingData } = dashboardData;

export function BorrowingTrendsChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={borrowingData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="month"
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
        />
        <Line
          type="monotone"
          dataKey="borrows"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
          name="Borrowed"
        />
        <Line
          type="monotone"
          dataKey="returns"
          stroke="hsl(var(--secondary))"
          strokeWidth={2}
          dot={{ fill: "hsl(var(--secondary))", strokeWidth: 2 }}
          name="Returned"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
