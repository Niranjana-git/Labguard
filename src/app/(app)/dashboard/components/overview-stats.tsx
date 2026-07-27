import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { overviewStats } from "@/lib/data";
import { AlertTriangle, ShieldCheck, Wrench, Users, CalendarClock, type LucideIcon, type LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

const iconMap: Record<string, ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>> = {
    Wrench,
    AlertTriangle,
    ShieldCheck,
    CalendarClock,
    Users
};


export function OverviewStats() {
  return (
    <>
      {overviewStats.map((stat, index) => {
          const Icon = iconMap[stat.icon];
          return (
            <Card key={index} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
          )
      })}
    </>
  );
}
