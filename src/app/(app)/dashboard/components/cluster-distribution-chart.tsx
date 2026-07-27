
"use client";

import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { clusterDistributionData } from "@/lib/data";

const chartConfig = {
  cse: { label: "CSE", color: "hsl(var(--chart-1))" },
  ece: { label: "ECE", color: "hsl(var(--destructive))" },
  eee: { label: "EEE", color: "hsl(var(--chart-5))" },
  mech: { label: "MECH", color: "hsl(140 80% 40%)" },
};

export function ClusterDistributionChart() {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <CardHeader>
        <CardTitle>Machine Cluster Distribution</CardTitle>
        <CardDescription>Distribution of machines across all clusters.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={clusterDistributionData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
                {clusterDistributionData.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={entry.fill}
                    className="stroke-background"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm mt-auto">
        <div className="flex items-center gap-2 font-medium leading-none text-muted-foreground">
          Showing distribution for {clusterDistributionData.reduce((acc, curr) => acc + curr.value, 0)} machines
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-center">
            {clusterDistributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.fill }}
                />
                <span>{item.name}</span>
                </div>
            ))}
        </div>
      </CardFooter>
    </Card>
  );
}
