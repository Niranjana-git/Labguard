
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const data = [
  { status: "Safe", count: 12, fill: "hsl(var(--chart-2))" },
  { status: "Unsafe", count: 2, fill: "hsl(var(--destructive))" },
  { status: "Maintenance", count: 4, fill: "hsl(var(--chart-4))" },
];

const chartConfig = {
  count: {
    label: "Machines",
  },
  safe: {
    label: "Safe",
    color: "hsl(var(--chart-2))",
  },
    unsafe: {
    label: "Unsafe",
    color: "hsl(var(--destructive))",
    },
    maintenance: {
    label: "Maintenance",
    color: "hsl(var(--chart-4))",
    },
};

export function MachineStatusChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Machine Status Distribution</CardTitle>
        <CardDescription>Number of machines by their current status.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
                <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
              <XAxis type="number" hide />
              <YAxis
                dataKey="status"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                className="text-sm"
                interval={0}
              />
              <Bar dataKey="count" radius={5}>
                {data.map((entry) => (
                    <Cell key={`cell-${entry.status}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
