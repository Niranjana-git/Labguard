
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useFirestore } from "@/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { clusterOverviewData, alertsData as defaultAlertsData } from "@/lib/data";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";

type Alert = {
  id: string;
  machineId: string;
  machineName?: string;
  severity: 'High' | 'Medium' | 'Low';
  message: string;
  timestamp: any;
  isResolved: boolean;
  clusterId: string;
};

const machineDetails = clusterOverviewData.flatMap(cluster => 
    ({
        id: cluster.defaultMachine.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'),
        name: cluster.defaultMachine,
        clusterId: cluster.name.toLowerCase()
    })
);


export function AlertsTable() {
  const firestore = useFirestore();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Filter default alerts to only include MECH and EEE
    const initialAlerts = defaultAlertsData
        .filter(a => a.clusterId === 'mech' || a.clusterId === 'eee')
        .map(a => ({...a, timestamp: { toDate: () => a.timestamp }}) as Alert);

    if (!firestore) {
      setAlerts(initialAlerts);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);

    const allAlerts: Alert[] = [...initialAlerts];
    const unsubs: (() => void)[] = [];

    const clustersToMonitor = machineDetails.filter(m => m.clusterId === 'mech' || m.clusterId === 'eee');

    clustersToMonitor.forEach(machine => {
        const alertsRef = collection(firestore, 'clusters', machine.clusterId, 'machines', machine.id, 'alerts');
        const q = query(alertsRef, orderBy('timestamp', 'desc'), limit(5));

        const unsub = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach(change => {
                const alertData = change.doc.data() as Omit<Alert, 'id'|'clusterId'>;
                const alertId = change.doc.id;
                const fullAlert = { ...alertData, id: alertId, machineName: machine.name, clusterId: machine.clusterId };

                const existingIndex = allAlerts.findIndex(a => a.id === alertId);

                if (change.type === 'added') {
                    if (existingIndex === -1) {
                        allAlerts.push(fullAlert);
                    }
                } else if (change.type === 'modified') {
                    if (existingIndex !== -1) {
                        allAlerts[existingIndex] = fullAlert;
                    }
                } else if (change.type === 'removed') {
                    if (existingIndex > -1) {
                        allAlerts.splice(existingIndex, 1);
                    }
                }
            });
            
            const sortedAlerts = [...allAlerts].sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());
            setAlerts(sortedAlerts);
            setIsLoading(false);
        }, (error) => {
            const permissionError = new FirestorePermissionError({
                path: alertsRef.path,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
            setIsLoading(false);
        });
        unsubs.push(unsub);
    });

    // In case there are no listeners set up (e.g., no machines in DB)
    if(unsubs.length === 0){
        setAlerts(initialAlerts);
        setIsLoading(false);
    }

    return () => {
        unsubs.forEach(unsub => unsub());
    };
  }, [firestore]);


  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };
  
    const getStatusText = (isResolved: boolean) => isResolved ? 'Resolved' : 'New';
    const getStatusBadge = (isResolved: boolean) => isResolved ? "bg-green-500/20 text-green-600" : "bg-destructive/20 text-destructive";

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
        <CardDescription>
          Critical warnings and notifications from machines.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Machine</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
                 <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        Loading alerts...
                    </TableCell>
                </TableRow>
            )}
            {!isLoading && alerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell className="font-medium">{alert.machineName}</TableCell>
                <TableCell>
                  <Badge variant={getSeverityBadge(alert.severity)}>
                    {alert.severity}
                  </Badge>
                </TableCell>
                <TableCell>{alert.message}</TableCell>
                 <TableCell>
                  <span className={cn("text-xs font-semibold py-1 px-2.5 rounded-full", getStatusBadge(alert.isResolved))}>
                    {getStatusText(alert.isResolved)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
             {!isLoading && alerts.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No recent alerts.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
