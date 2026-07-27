
'use client';
import { useMemo } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { RealTimeChart } from '@/app/(app)/dashboard/components/real-time-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Shield, Thermometer, Zap, Waves, Cpu, CheckCircle, XCircle } from 'lucide-react';
import { EarthLineVerificationDialog } from './components/earth-line-verification-dialog';
import { cn } from '@/lib/utils';
import { defaultMachinesData } from '@/lib/data';


type Machine = {
    id: string;
    name: string;
    brand: string;
    model: string;
    status: 'Safe' | 'Unsafe' | 'Maintenance';
    earthLine: boolean;
    technician: string;
}

type MachineDetailClientPageProps = {
    clusterId: string;
    machineId: string;
};

export default function MachineDetailClientPage({ clusterId, machineId }: MachineDetailClientPageProps) {
  const firestore = useFirestore();

  const machineRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'clusters', clusterId, 'machines', machineId);
  }, [firestore, clusterId, machineId]);

  const { data: machineFromDB, isLoading } = useDoc<Machine>(machineRef);

  const machine = useMemo(() => {
    // If we have data from the DB, use it.
    if (machineFromDB) return machineFromDB;
    
    // Otherwise, try to find it in the hardcoded default data.
    const clusterDefaultMachines = defaultMachinesData[clusterId.toLowerCase() as keyof typeof defaultMachinesData] || [];
    const defaultMachine = clusterDefaultMachines.find(m => m.id === machineId);

    if(defaultMachine) return defaultMachine as Machine;

    return null; // Return null if not found anywhere
  }, [machineFromDB, clusterId, machineId]);


  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!machine) {
    return <div>Machine not found.</div>;
  }

  const isDefaultMachine = Object.values(defaultMachinesData).flat().some(m => m.id === machine.id && !machineFromDB);
  
  const machineDetails = [
    { label: "Brand", value: machine.brand },
    { label: "Model", value: machine.model },
    { label: "Status", value: machine.status, icon: Shield },
    { label: "Assigned Technician", value: machine.technician },
  ];

  const earthLineDetail = { 
      label: "Earth-Line Status", 
      value: machine.earthLine ? 'Verified' : 'Not Verified', 
      icon: machine.earthLine ? CheckCircle : XCircle, 
      color: machine.earthLine ? 'text-green-500' : 'text-red-500' 
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4">
        <header className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight">{machine.name}</h1>
          <p className="text-muted-foreground">Detailed real-time analytics for {machine.name}.</p>
        </header>

        <main className="grid flex-1 items-start gap-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
             <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Machine Details</CardTitle>
                    <CardDescription>Key information about this machine.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {machineDetails.map(detail => (
                        <div key={detail.label} className="flex justify-between items-center text-sm">
                           <div className="flex items-center gap-2 text-muted-foreground">
                             {detail.icon && <detail.icon className="h-4 w-4" />}
                             <span>{detail.label}</span>
                           </div>
                           <span className={cn('font-semibold', detail.color || '')}>{detail.value}</span>
                        </div>
                    ))}
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <earthLineDetail.icon className={cn("h-4 w-4", earthLineDetail.color)} />
                            <span>{earthLineDetail.label}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                           <span className={cn('font-semibold', earthLineDetail.color)}>{earthLineDetail.value}</span>
                           {!machine.earthLine && machineRef && (
                                <EarthLineVerificationDialog clusterId={clusterId} machineId={machineId}/>
                            )}
                        </div>
                    </div>
                </CardContent>
             </Card>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:col-span-2 gap-4">
                <RealTimeChart dataType="vibration" title="Vibration" yAxisLabel="mm/s" threshold={10} Icon={Waves} />
                <RealTimeChart dataType="temperature" title="Temperature" yAxisLabel="°C" threshold={80} Icon={Thermometer} />
                <RealTimeChart dataType="voltage" title="Voltage" yAxisLabel="V" threshold={230} Icon={Zap} />
                <RealTimeChart dataType="current" title="Current" yAxisLabel="A" threshold={2} Icon={Cpu} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
