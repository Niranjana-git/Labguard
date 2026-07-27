
import { PlusCircle } from "lucide-react";
import { MachinesTable } from "./components/machines-table";
import { CreateMachineDialog } from "./components/create-machine-dialog";

type ClusterMachinesPageProps = {
  params: {
    clusterId: string;
  };
};

export default function ClusterMachinesPage({ params }: ClusterMachinesPageProps) {
  const { clusterId } = params;
  const clusterName = clusterId.toUpperCase();
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4">
        <header className="mb-4 flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Machines in {clusterName}</h1>
                <p className="text-muted-foreground">
                    An overview of all machines in the {clusterName} cluster.
                </p>
            </div>
            <CreateMachineDialog clusterId={clusterId}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Machine
            </CreateMachineDialog>
        </header>
        <main className="grid flex-1 items-start gap-4">
          <MachinesTable clusterId={clusterId} />
        </main>
      </div>
    </div>
  );
}
