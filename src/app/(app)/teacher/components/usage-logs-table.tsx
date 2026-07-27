
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFirestore, useUser } from "@/firebase";
import { collectionGroup, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useLanguage } from "@/app/(app)/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { defaultMachinesData } from "@/lib/data";

const translations: Record<string, Record<string, string>> = {
  en: {
    title: 'Machine Usage History',
    description: 'A real-time log of your machine usage sessions.',
    machine: 'Machine',
    cluster: 'Lab/Cluster',
    startTime: 'Start Time',
    endTime: 'End Time',
    duration: 'Duration (hrs)',
    loading: 'Loading usage logs...',
    noLogs: 'You have no machine usage logs yet.',
  },
  hi: {
    title: 'मशीन उपयोग इतिहास',
    description: 'आपके मशीन उपयोग सत्रों का एक वास्तविक समय लॉग।',
    machine: 'मशीन',
    cluster: 'प्रयोगशाला/क्लस्टर',
    startTime: 'प्रारंभ समय',
    endTime: 'समाप्ति समय',
    duration: 'अवधि (घंटे)',
    loading: 'उपयोग लॉग लोड हो रहे हैं...',
    noLogs: 'आपके पास अभी तक कोई मशीन उपयोग लॉग नहीं है।',
  },
  ta: {
    title: 'இயந்திர பயன்பாட்டு வரலாறு',
    description: 'உங்கள் இயந்திர பயன்பாட்டு அமர்வுகளின் நிகழ்நேர பதிவு.',
    machine: 'இயந்திரம்',
    cluster: 'ஆய்வகம்/கிளஸ்டர்',
    startTime: 'தொடக்க நேரம்',
    endTime: 'முடிவு நேரம்',
    duration: 'காலம் (மணி)',
    loading: 'பயன்பாட்டு பதிவுகள் ஏற்றப்படுகின்றன...',
    noLogs: 'உங்களிடம் இன்னும் இயந்திர பயன்பாட்டு பதிவுகள் எதுவும் இல்லை.',
  },
};

type UsageLog = {
  id: string;
  machineId: string;
  clusterId: string;
  startTime: any;
  endTime: any;
  durationInHours: number;
};

// Flatten default machine data for easy lookup
const allDefaultMachines = Object.values(defaultMachinesData).flat();

export function UsageLogsTable() {
    const firestore = useFirestore();
    const { user } = useUser();
    const { language } = useLanguage();
    const [logs, setLogs] = useState<UsageLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const t = translations[language] || translations.en;

    useEffect(() => {
        if (!firestore || !user) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const logsQuery = query(
            collectionGroup(firestore, "usageLogs"),
            where("userId", "==", user.uid),
            orderBy("startTime", "desc")
        );

        const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
            const fetchedLogs: UsageLog[] = [];
            snapshot.forEach(doc => {
                if(doc.data().endTime) { // Only show completed logs
                    fetchedLogs.push({ id: doc.id, ...doc.data() } as UsageLog);
                }
            });
            setLogs(fetchedLogs);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching usage logs: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [firestore, user]);

    const getMachineName = (machineId: string) => {
        const machine = allDefaultMachines.find(m => m.id === machineId);
        return machine?.name || machineId;
    }

    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        return format(timestamp.toDate(), "MMM d, yyyy, hh:mm a");
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t.title}</CardTitle>
                <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t.machine}</TableHead>
                            <TableHead>{t.cluster}</TableHead>
                            <TableHead>{t.startTime}</TableHead>
                            <TableHead>{t.endTime}</TableHead>
                            <TableHead className="text-right">{t.duration}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin"/>
                                </TableCell>
                            </TableRow>
                        ) : logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    {t.noLogs}
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map(log => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium">{getMachineName(log.machineId)}</TableCell>
                                    <TableCell>{log.clusterId.toUpperCase()}</TableCell>
                                    <TableCell>{formatTimestamp(log.startTime)}</TableCell>
                                    <TableCell>{formatTimestamp(log.endTime)}</TableCell>
                                    <TableCell className="text-right">{log.durationInHours.toFixed(2)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
