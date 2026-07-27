
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ReportType } from '../page';

type TimePeriod = "weekly" | "monthly";

type ReportControlsProps = {
    reportType: ReportType;
    setReportType: (value: ReportType) => void;
    timePeriod: string;
    setTimePeriod: (value: TimePeriod) => void;
}

export function ReportControls({ reportType, setReportType, timePeriod, setTimePeriod }: ReportControlsProps) {
  const { toast } = useToast();

  const handleDownload = () => {
    if (!reportType || !timePeriod) {
      toast({
        variant: "destructive",
        title: "Selection Required",
        description: "Please select a report type and time period.",
      });
      return;
    }

    // Simulate CSV generation
    const headers = "machineId,status,uptime_percentage,alerts_count";
    const data = [
      "lathe-01,Safe,99.5,2",
      "spectrometer-01,Safe,99.9,0",
      "uv-lamp-01,Unsafe,85.2,5",
      "server-01,Maintenance,92.0,1",
    ];
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${data.join("\n")}`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}_${timePeriod}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Report Downloaded",
      description: `Your ${reportType} report for the ${timePeriod} is downloading.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Report</CardTitle>
        <CardDescription>
          Select a report type and time period to generate and download.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="report-type">Report Type</label>
            <Select onValueChange={(value: ReportType) => setReportType(value)} value={reportType}>
              <SelectTrigger id="report-type">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="machine-health">Machine Health</SelectItem>
                <SelectItem value="fault-maintenance">Fault & Maintenance</SelectItem>
                <SelectItem value="cluster-activity">Cluster Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="time-period">Time Period</label>
            <Select onValueChange={(value: TimePeriod) => setTimePeriod(value)} value={timePeriod}>
              <SelectTrigger id="time-period">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button className="w-full sm:w-auto" onClick={handleDownload} disabled={!reportType}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
