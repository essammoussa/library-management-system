import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Dummy data - replace with real data from backend
const categoryData = [
  { category: "Fiction", count: 245 },
  { category: "Science", count: 198 },
  { category: "History", count: 156 },
  { category: "Biography", count: 142 },
  { category: "Technology", count: 128 },
  { category: "Arts", count: 95 },
];

export function TopCategoriesChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={categoryData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="category"
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          angle={-45}
          textAnchor="end"
          height={80}
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
        <Bar
          dataKey="count"
          fill="hsl(var(--primary))"
          radius={[8, 8, 0, 0]}
          name="Books Borrowed"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
