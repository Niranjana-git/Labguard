
'use client';

import { useState, useMemo } from "react";
import { ReportControls } from "./components/report-controls";
import { MachineStatusChart } from "./components/machine-status-chart";
import { AlertsOverTimeChart } from "./components/alerts-over-time-chart";
import { MaintenanceHistoryChart } from "./components/maintenance-history-chart";
import { MachineUptimeChart } from "./components/machine-uptime-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";
import { ClusterDistributionChart } from "../dashboard/components/cluster-distribution-chart";
import { AlertsPerClusterChart } from "./components/alerts-per-cluster-chart";
import { ReportSummary } from "./components/report-summary";

export type ReportType = "machine-health" | "fault-maintenance" | "cluster-activity" | "";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('machine-health');
  const [timePeriod, setTimePeriod] = useState<string>("monthly");

  const reportData = useMemo(() => {
    // This is placeholder data. In a real app, you would fetch this based on the report type and time period.
    switch (reportType) {
      case "machine-health":
        return {
          status: { safe: 12, unsafe: 2, maintenance: 4 },
          uptime: { lathe: 98.5, spectrometer: 99.8, uvLamp: 92.3, server: 99.9 },
        };
      case "fault-maintenance":
        return {
          alerts: { total: 4, high: 2, medium: 1, low: 1 },
          maintenance: { completed: 15, scheduled: 16 },
        };
      case "cluster-activity":
        return {
            distribution: { MECH: 1, ECE: 1, EEE: 1, CSE: 1 },
            alertsPerCluster: { MECH: 8, ECE: 2, EEE: 12, CSE: 1 },
        }
      default:
        return null;
    }
  }, [reportType, timePeriod]);


  const renderAnalytics = () => {
    switch (reportType) {
      case "machine-health":
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <MachineStatusChart />
            <MachineUptimeChart />
          </div>
        );
      case "fault-maintenance":
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <AlertsOverTimeChart />
            <MaintenanceHistoryChart />
          </div>
        );
      case "cluster-activity":
        return (
            <div className="grid gap-4 md:grid-cols-2">
                <ClusterDistributionChart />
                <AlertsPerClusterChart />
            </div>
        )
      default:
        return (
            <Card className="flex flex-col items-center justify-center min-h-[300px] border-dashed">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl text-muted-foreground">Select a report type to see analytics</CardTitle>
                </CardHeader>
                <CardContent>
                    <BarChart className="h-16 w-16 text-muted-foreground/50" />
                </CardContent>
            </Card>
        );
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4">
        <header className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            View and download reports on machine performance and alerts.
          </p>
        </header>
        <main className="grid flex-1 items-start gap-4">
          <ReportControls 
            reportType={reportType}
            setReportType={setReportType}
            timePeriod={timePeriod}
            setTimePeriod={setTimePeriod}
          />
          <ReportSummary reportType={reportType} reportData={reportData} />
          {renderAnalytics()}
        </main>
      </div>
    </div>
  );
}
