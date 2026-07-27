
"use client";

import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts";
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
import { useFirestore } from "@/firebase";
import { collectionGroup, query, where, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type UptimeData = {
  name: string;
  uptime: number;
  fill: string;
};

const initialData = [
  { name: "Lathe", uptime: 0, fill: "hsl(var(--destructive))" },
  { name: "Spectrometer", uptime: 0, fill: "hsl(140 80% 40%)" },
  { name: "UV Lamp", uptime: 0, fill: "hsl(var(--chart-5))" },
  { name: "Server", uptime: 0, fill: "hsl(var(--chart-1))" },
];

const chartConfig = {
  uptime: {
    label: "Uptime (hrs)",
  },
};

export function MachineUptimeChart() {
  const firestore = useFirestore();
  const [data, setData] = useState<UptimeData[]>(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUptimeData() {
      if (!firestore) return;
      setLoading(true);

      try {
        const usageLogsQuery = query(
          collectionGroup(firestore, "usageLogs"),
          where("durationInHours", ">", 0)
        );
        const querySnapshot = await getDocs(usageLogsQuery);
        
        const uptimeByMachine: Record<string, number> = {};
        
        querySnapshot.forEach(doc => {
          const log = doc.data();
          const machineId = log.machineId;
          const duration = log.durationInHours;
          if (uptimeByMachine[machineId]) {
            uptimeByMachine[machineId] += duration;
          } else {
            uptimeByMachine[machineId] = duration;
          }
        });
        
        const updatedData = initialData.map(machine => {
            const machineKey = machine.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
            const uptime = uptimeByMachine[machineKey] || 0;
            return {
                ...machine,
                uptime: parseFloat(uptime.toFixed(2)),
            };
        }).filter(d => d.uptime > 0); // Only show machines with usage

        setData(updatedData.length > 0 ? updatedData : initialData.map(d => ({...d, uptime: 0})));

      } catch (error) {
        console.error("Error fetching uptime data:", error);
        setData(initialData); // Fallback to initial data on error
      } finally {
        setLoading(false);
      }
    }

    fetchUptimeData();
  }, [firestore]);


  if (loading) {
      return (
          <Card>
              <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                  <Skeleton className="h-[250px] w-[250px] rounded-full" />
              </CardContent>
          </Card>
      );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Machine Uptime</CardTitle>
        <CardDescription>Total logged usage hours per machine.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip cursor={false} content={<ChartTooltipContent hideLabel formatter={(value) => `${value} hrs`} />} />
              <Pie
                data={data}
                dataKey="uptime"
                nameKey="name"
                innerRadius={50}
                strokeWidth={5}
                 label={({ name, uptime }) => uptime > 0 ? `${name}: ${uptime}h` : null}
                 labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
       <CardContent className="mt-auto flex flex-wrap justify-center gap-2 text-xs p-4">
        {data.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span>{item.name}</span>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
