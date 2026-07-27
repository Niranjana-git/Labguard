
import MachineDetailClientPage from './machine-detail-client-page';

type MachineDetailPageProps = {
  params: {
    clusterId: string;
    machineId: string;
  };
};

// This is the server component wrapper
export default function MachineDetailPage({ params }: MachineDetailPageProps) {
  // We receive the params here on the server and pass them down to the client component
  return <MachineDetailClientPage clusterId={params.clusterId} machineId={params.machineId} />;
}
