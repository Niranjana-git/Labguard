"use client";

import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const data = [
  { month: "Jan", completed: 12, scheduled: 15 },
  { month: "Feb", completed: 10, scheduled: 12 },
  { month: "Mar", completed: 14, scheduled: 14 },
  { month: "Apr", completed: 18, scheduled: 20 },
  { month: "May", completed: 15, scheduled: 16 },
  { month: "Jun", completed: 11, scheduled: 11 },
];

const chartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
  scheduled: {
    label: "Scheduled",
    color: "hsl(var(--chart-2))",
  },
};

export function MaintenanceHistoryChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Task History</CardTitle>
        <CardDescription>Completed vs. Scheduled tasks over the last 6 months.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="scheduled" fill="var(--color-scheduled)" radius={4} />
              <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
