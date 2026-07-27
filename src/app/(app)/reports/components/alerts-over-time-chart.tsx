"use client";

import { Line, LineChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const data = [
  { date: "Jan", high: 5, medium: 10, low: 20 },
  { date: "Feb", high: 6, medium: 12, low: 22 },
  { date: "Mar", high: 4, medium: 8, low: 18 },
  { date: "Apr", high: 8, medium: 15, low: 25 },
  { date: "May", high: 7, medium: 14, low: 24 },
  { date: "Jun", high: 10, medium: 20, low: 30 },
];

const chartConfig = {
  high: {
    label: "High Severity",
    color: "hsl(var(--destructive))",
  },
  medium: {
    label: "Medium Severity",
    color: "hsl(var(--chart-4))",
  },
  low: {
    label: "Low Severity",
    color: "hsl(var(--chart-2))",
  },
};

export function AlertsOverTimeChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts Over Time</CardTitle>
        <CardDescription>Number of alerts by severity over the last 6 months.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <Tooltip content={<ChartTooltipContent indicator="line" />} />
              <Line dataKey="high" type="monotone" stroke="var(--color-high)" strokeWidth={2} dot={false} />
              <Line dataKey="medium" type="monotone" stroke="var(--color-medium)" strokeWidth={2} dot={false} />
              <Line dataKey="low" type="monotone" stroke="var(--color-low)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
