
"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { realtimeChartData as initialData } from "@/lib/data";
import type { LucideIcon } from "lucide-react";

type RealTimeChartProps = {
  dataType: "vibration" | "temperature" | "voltage" | "current";
  title: string;
  yAxisLabel: string;
  threshold?: number;
  Icon?: LucideIcon;
};

export function RealTimeChart({ dataType, title, yAxisLabel, threshold, Icon }: RealTimeChartProps) {
  const [chartData, setChartData] = useState(initialData[dataType]);

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prevData) => {
        const newDataPoint = {
          time: "T",
          value:
            dataType === 'vibration' ? Math.random() * 5 :
            dataType === 'temperature' ? Math.random() * 10 + 60 :
            dataType === 'voltage' ? 220 + (Math.random() - 0.5) * 10 :
            1.5 + (Math.random() - 0.5) * 0.5,
        };
        const updatedData = [...prevData.slice(1), newDataPoint].map((d, i) => ({
            ...d,
            time: `T-${29 - i}`
        }));
        return updatedData;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [dataType]);

  const latestValue = chartData[chartData.length - 1].value;
  const isAboveThreshold = threshold && latestValue > threshold;
  
  const chartConfig = {
    value: {
      label: title,
      color: isAboveThreshold ? "hsl(var(--destructive))" : "hsl(var(--chart-1))",
    },
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
            {title}
        </CardTitle>
        <CardDescription>
          Latest: <span className={`font-bold ${isAboveThreshold ? 'text-destructive' : 'text-foreground'}`}>{latestValue.toFixed(2)} {yAxisLabel}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
            <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                offset="5%"
                                stopColor="var(--color-value)"
                                stopOpacity={0.8}
                                />
                                <stop
                                offset="95%"
                                stopColor="var(--color-value)"
                                stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="time"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value, index) => index % 5 === 0 ? value : ''}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', offset: 10 }}
                        />
                        <Tooltip
                            cursor={{ stroke: 'hsl(var(--accent))', strokeWidth: 1, strokeDasharray: "3 3" }}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Area
                            dataKey="value"
                            type="monotone"
                            fill="url(#fillValue)"
                            stroke="var(--color-value)"
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
