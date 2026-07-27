
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
import { useFirestore, useUser } from "@/firebase";
import { collection, query, orderBy, onSnapshot, getDocs, doc, getDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from "@/app/(app)/layout";

const translations: Record<string, Record<string, string>> = {
  en: {
    title: 'Your Alerts',
    description: 'A complete history of alerts from your assigned clusters.',
    machine: 'Machine',
    cluster: 'Cluster',
    severity: 'Severity',
    alertDescription: 'Description',
    time: 'Time',
    status: 'Status',
    loading: 'Loading alerts...',
    noAlerts: 'No alerts found in your assigned clusters.',
    active: 'Active',
    resolved: 'Resolved',
  },
  hi: {
    title: 'आपके अलर्ट',
    description: 'आपके निर्दिष्ट क्लस्टर से अलर्ट का पूरा इतिहास।',
    machine: 'मशीन',
    cluster: 'क्लस्टर',
    severity: 'गंभीरता',
    alertDescription: 'विवरण',
    time: 'समय',
    status: 'स्थिति',
    loading: 'अलर्ट लोड हो रहे हैं...',
    noAlerts: 'आपके निर्दिष्ट क्लस्टर में कोई अलर्ट नहीं मिला।',
    active: 'सक्रिय',
    resolved: 'हल किया गया',
  },
  ta: {
    title: 'உங்கள் விழிப்பூட்டல்கள்',
    description: 'உங்களுக்கு ஒதுக்கப்பட்ட கிளஸ்டர்களிலிருந்து வரும் விழிப்பூட்டல்களின் முழுமையான வரலாறு.',
    machine: 'இயந்திரம்',
    cluster: 'கிளஸ்டர்',
    severity: 'தீவிரம்',
    alertDescription: 'விளக்கம்',
    time: 'நேரம்',
    status: 'நிலை',
    loading: 'விழிப்பூட்டல்கள் ஏற்றப்படுகின்றன...',
    noAlerts: 'உங்களுக்கு ஒதுக்கப்பட்ட கிளஸ்டர்களில் விழிப்பூட்டல்கள் எதுவும் இல்லை.',
    active: 'செயலில்',
    resolved: 'தீர்வு காணப்பட்டது',
  },
};


type Alert = {
  id: string;
  machineId: string;
  clusterId: string;
  machineName?: string;
  severity: 'High' | 'Medium' | 'Low';
  message: string;
  timestamp: any;
  isResolved: boolean;
};

type UserData = {
  clusterIds?: string[];
}

export default function TechnicianAlertsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clusterIds, setClusterIds] = useState<string[]>([]);
  const { language } = useLanguage();

  const t = translations[language] || translations.en;

  useEffect(() => {
    async function fetchUserClusters() {
        if (user && firestore) {
            const userDoc = await getDoc(doc(firestore, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data() as UserData;
                setClusterIds(userData.clusterIds || []);
            }
        }
    }
    fetchUserClusters();
  }, [user, firestore]);

  useEffect(() => {
    if (!firestore || clusterIds.length === 0) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    const unsubs: (() => void)[] = [];

    async function fetchAlerts() {
      const allAlerts: Alert[] = [];
      for (const clusterId of clusterIds) {
        const machinesRef = collection(firestore, 'clusters', clusterId, 'machines');
        const machinesSnapshot = await getDocs(machinesRef);
        
        machinesSnapshot.forEach(machineDoc => {
          const machineId = machineDoc.id;
          const machineName = machineDoc.data().name;
          const alertsRef = collection(firestore, 'clusters', clusterId, 'machines', machineId, 'alerts');
          const q = query(alertsRef, orderBy('timestamp', 'desc'));

          const unsub = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach(change => {
              const alertData = change.doc.data() as Omit<Alert, 'id' | 'clusterId'>;
              const alertId = change.doc.id;

              const fullAlert = { 
                  ...alertData, 
                  id: alertId,
                  machineId: machineId,
                  machineName: machineName,
                  clusterId: clusterId,
              };

              const existingIndex = allAlerts.findIndex(a => a.id === alertId);

              if (change.type === 'added') {
                  if (existingIndex === -1) {
                      allAlerts.push(fullAlert);
                  }
              }
              if (change.type === 'modified') {
                  if (existingIndex !== -1) {
                      allAlerts[existingIndex] = fullAlert;
                  }
              }
              if (change.type === 'removed') {
                  if (existingIndex > -1) {
                      allAlerts.splice(existingIndex, 1);
                  }
              }
            });
            
            const sortedAlerts = [...allAlerts].sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
            setAlerts(sortedAlerts);
          });
          unsubs.push(unsub);
        });
      }
      setIsLoading(false);
    }

    fetchAlerts();

    return () => {
        unsubs.forEach(unsub => unsub());
    };
  }, [firestore, clusterIds]);


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
  
    const getStatusText = (isResolved: boolean) => isResolved ? t.resolved : t.active;
    const getStatusBadge = (isResolved: boolean) => isResolved ? "bg-green-500/20 text-green-600" : "bg-destructive/20 text-destructive";

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4">
        <header className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">
            {t.description}
          </p>
        </header>
        <main className="grid flex-1 items-start gap-4">
            <Card>
            <CardContent className='pt-6'>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>{t.machine}</TableHead>
                    <TableHead>{t.cluster}</TableHead>
                    <TableHead>{t.severity}</TableHead>
                    <TableHead>{t.alertDescription}</TableHead>
                    <TableHead>{t.time}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                            </TableCell>
                        </TableRow>
                    )}
                    {!isLoading && alerts.map((alert) => (
                    <TableRow key={alert.id}>
                        <TableCell className="font-medium">{alert.machineName}</TableCell>
                        <TableCell>{alert.clusterId.toUpperCase()}</TableCell>
                        <TableCell>
                        <Badge variant={getSeverityBadge(alert.severity)}>
                            {alert.severity}
                        </Badge>
                        </TableCell>
                        <TableCell>{alert.message}</TableCell>
                        <TableCell>
                            {alert.timestamp ? formatDistanceToNow(alert.timestamp.toDate(), { addSuffix: true }) : 'N/A'}
                        </TableCell>
                        <TableCell>
                        <span className={cn("text-xs font-semibold py-1 px-2.5 rounded-full", getStatusBadge(alert.isResolved))}>
                            {getStatusText(alert.isResolved)}
                        </span>
                        </TableCell>
                    </TableRow>
                    ))}
                    {!isLoading && alerts.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                {t.noAlerts}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </CardContent>
            </Card>
        </main>
        </div>
    </div>
  );
}
