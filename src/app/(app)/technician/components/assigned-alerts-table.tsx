
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
import { collection, query, orderBy, limit, onSnapshot, getDocs } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { useLanguage } from "@/app/(app)/layout";

const translations: Record<string, Record<string, string>> = {
  en: {
    title: 'Your Recent Alerts',
    description: 'Critical warnings from machines in your clusters.',
    machine: 'Machine',
    severity: 'Severity',
    status: 'Status',
    action: 'Action',
    loading: 'Loading alerts...',
    noAlerts: 'No recent alerts.',
    new: 'New',
    resolved: 'Resolved',
    viewMachine: 'View Machine',
  },
  hi: {
    title: 'आपके हाल के अलर्ट',
    description: 'आपके क्लस्टर में मशीनों से महत्वपूर्ण चेतावनियाँ।',
    machine: 'मशीन',
    severity: 'गंभीरता',
    status: 'स्थिति',
    action: 'कार्रवाई',
    loading: 'अलर्ट लोड हो रहे हैं...',
    noAlerts: 'कोई हाल का अलर्ट नहीं।',
    new: 'नया',
    resolved: 'हल किया गया',
    viewMachine: 'मशीन देखें',
  },
  ta: {
    title: 'உங்கள் சமீபத்திய விழிப்பூட்டல்கள்',
    description: 'உங்கள் கிளஸ்டர்களில் உள்ள இயந்திரங்களிலிருந்து வரும் முக்கியமான எச்சரிக்கைகள்.',
    machine: 'இயந்திரம்',
    severity: 'தீவிரம்',
    status: 'நிலை',
    action: 'செயல்',
    loading: 'விழிப்பூட்டல்கள் ஏற்றப்படுகின்றன...',
    noAlerts: 'சமீபத்திய விழிப்பூட்டல்கள் இல்லை.',
    new: 'புதிய',
    resolved: 'தீர்வு காணப்பட்டது',
    viewMachine: 'இயந்திரத்தைக் காண்க',
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

export function AssignedAlertsTable({ clusterIds }: { clusterIds: string[] }) {
  const firestore = useFirestore();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();

  const t = translations[language] || translations.en;

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
          const q = query(alertsRef, orderBy('timestamp', 'desc'), limit(5));

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
  
  const getStatusText = (isResolved: boolean) => isResolved ? t.resolved : t.new;
  const getStatusBadge = (isResolved: boolean) => isResolved ? "bg-green-500/20 text-green-600" : "bg-destructive/20 text-destructive";

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <CardDescription>
          {t.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.machine}</TableHead>
              <TableHead>{t.severity}</TableHead>
              <TableHead>{t.status}</TableHead>
               <TableHead>{t.action}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
                 <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        {t.loading}
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
                 <TableCell>
                  <span className={cn("text-xs font-semibold py-1 px-2.5 rounded-full", getStatusBadge(alert.isResolved))}>
                    {getStatusText(alert.isResolved)}
                  </span>
                </TableCell>
                <TableCell>
                    <Link href={`/clusters/${alert.clusterId}/machines/${alert.machineId}`} className="text-primary hover:underline flex items-center gap-2">
                        <Eye className="h-4 w-4" /> {t.viewMachine}
                    </Link>
                </TableCell>
              </TableRow>
            ))}
             {!isLoading && alerts.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        {t.noAlerts}
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
