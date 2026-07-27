import { OverviewStats } from "./components/overview-stats";
import { ClusterOverview } from "./components/cluster-overview";
import { AlertsTable } from "./components/alerts-table";
import { ClusterDistributionChart } from "./components/cluster-distribution-chart";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4">
        <header className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">Real-time monitoring of all lab equipment.</p>
        </header>
        <main className="grid flex-1 items-start gap-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <OverviewStats />
            </div>
             <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <ClusterOverview />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="lg:col-span-4">
                    <AlertsTable />
                </div>
                <div className="lg:col-span-3">
                    <ClusterDistributionChart />
                </div>
            </div>
        </main>
      </div>
    </div>
  );
}
