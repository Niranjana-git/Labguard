
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
import { useFirestore, useUser } from "@/firebase";
import { collection, getDocs, addDoc, doc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Eye, Play, Square } from "lucide-react";
import { defaultMachinesData } from "@/lib/data";
import { useLanguage } from "@/app/(app)/layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const translations: Record<string, Record<string, string>> = {
  en: {
    title: 'Available Machines',
    description: 'A list of all machines in your assigned labs. You can start and stop usage sessions.',
    name: 'Name',
    cluster: 'Lab/Cluster',
    status: 'Status',
    actions: 'Actions',
    loading: 'Loading machines...',
    noMachines: 'No machines found in your labs.',
    view: 'View Details',
    startSession: 'Start Session',
    stopSession: 'Stop Session',
    sessionStarted: 'Session started for',
    sessionStopped: 'Session stopped for',
    sessionError: 'Session management error',
  },
  hi: {
    title: 'उपलब्ध मशीनें',
    description: 'आपके निर्दिष्ट प्रयोगशालाओं में सभी मशीनों की सूची। आप उपयोग सत्र शुरू और बंद कर सकते हैं।',
    name: 'नाम',
    cluster: 'प्रयोगशाला/क्लस्टर',
    status: 'स्थिति',
    actions: 'कार्रवाई',
    loading: 'मशीनें लोड हो रही हैं...',
    noMachines: 'आपकी प्रयोगशालाओं में कोई मशीन नहीं मिली।',
    view: 'विवरण देखें',
    startSession: 'सत्र शुरू करें',
    stopSession: 'सत्र बंद करें',
    sessionStarted: 'के लिए सत्र शुरू हुआ',
    sessionStopped: 'के लिए सत्र बंद हुआ',
    sessionError: 'सत्र प्रबंधन त्रुटि',
  },
  ta: {
    title: 'கிடைக்கக்கூடிய இயந்திரங்கள்',
    description: 'உங்களுக்கு ஒதுக்கப்பட்ட ஆய்வகங்களில் உள்ள அனைத்து இயந்திரங்களின் பட்டியல். நீங்கள் பயன்பாட்டு அமர்வுகளைத் தொடங்கலாம் மற்றும் நிறுத்தலாம்.',
    name: 'பெயர்',
    cluster: 'ஆய்வகம்/கிளஸ்டர்',
    status: 'நிலை',
    actions: 'செயல்கள்',
    loading: 'இயந்திரங்கள் ஏற்றப்படுகின்றன...',
    noMachines: 'உங்கள் ஆய்வகங்களில் இயந்திரங்கள் எதுவும் இல்லை.',
    view: 'விவரங்களைக் காண்க',
    startSession: 'அமர்வைத் தொடங்கு',
    stopSession: 'அமர்வை நிறுத்து',
    sessionStarted: 'அமர்வு தொடங்கியது',
    sessionStopped: 'அமர்வு நிறுத்தப்பட்டது',
    sessionError: 'அமர்வு மேலாண்மை பிழை',
  },
};


type Machine = {
    id: string;
    name: string;
    status: 'Safe' | 'Unsafe' | 'Maintenance';
    clusterId: string;
}

type ActiveSession = {
  logId: string;
  machineId: string;
  clusterId: string;
  startTime: number;
}

export function TeacherMachinesTable({ clusterIds }: { clusterIds: string[] }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    const [allMachines, setAllMachines] = useState<Machine[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { language } = useLanguage();
    const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
    
    const t = translations[language] || translations.en;

    useEffect(() => {
        const savedSession = localStorage.getItem('activeMachineSession');
        if (savedSession) {
            setActiveSession(JSON.parse(savedSession));
        }
    }, []);

    useEffect(() => {
      async function fetchMachines() {
        const defaultClusterMachines = clusterIds
            .map(id => defaultMachinesData[id.toLowerCase() as keyof typeof defaultMachinesData] || [])
            .flat();

        if (!firestore) {
            setAllMachines(defaultClusterMachines as Machine[]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const machinesFromDB: Machine[] = [];
        try {
          if (clusterIds.length > 0) {
            for (const clusterId of clusterIds) {
              const machinesRef = collection(firestore, 'clusters', clusterId, 'machines');
              const snapshot = await getDocs(machinesRef);
              snapshot.forEach(doc => {
                machinesFromDB.push({ id: doc.id, clusterId: clusterId, ...doc.data() } as Machine);
              });
            }
          }

          const combined = [...machinesFromDB];
          defaultClusterMachines.forEach(defaultMachine => {
              if (!machinesFromDB.some(dbMachine => dbMachine.id === defaultMachine.id)) {
                  combined.push(defaultMachine as Machine);
              }
          });
          setAllMachines(combined);

        } catch (error) {
            console.error("Failed to fetch assigned machines: ", error);
            setAllMachines(defaultClusterMachines as Machine[]);
        } finally {
            setIsLoading(false);
        }
      }
      fetchMachines();
    }, [firestore, clusterIds]);

    const handleStartSession = async (machine: Machine) => {
      if (!firestore || !user) return;
      if (activeSession) {
        toast({ variant: 'destructive', title: t.sessionError, description: 'Another session is already active.' });
        return;
      }
  
      const usageLogsRef = collection(firestore, 'clusters', machine.clusterId, 'machines', machine.id, 'usageLogs');
      const newLog = {
        userId: user.uid,
        machineId: machine.id,
        clusterId: machine.clusterId,
        startTime: serverTimestamp(),
        endTime: null,
        durationInHours: 0,
      };
  
      addDoc(usageLogsRef, newLog)
        .then(docRef => {
          const sessionData = { logId: docRef.id, machineId: machine.id, clusterId: machine.clusterId, startTime: Date.now() };
          setActiveSession(sessionData);
          localStorage.setItem('activeMachineSession', JSON.stringify(sessionData));
          toast({ title: t.sessionStarted, description: `${machine.name}` });
        })
        .catch(serverError => {
          const permissionError = new FirestorePermissionError({
            path: usageLogsRef.path,
            operation: 'create',
            requestResourceData: newLog,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    };

    const handleStopSession = async () => {
      if (!firestore || !activeSession) return;
  
      const { logId, machineId, clusterId, startTime } = activeSession;
      const logRef = doc(firestore, 'clusters', clusterId, 'machines', machineId, 'usageLogs', logId);
  
      const endTime = Timestamp.now();
      const durationInMillis = endTime.toMillis() - startTime;
      const durationInHours = durationInMillis / (1000 * 60 * 60);
  
      const updatePayload = {
        endTime: endTime,
        durationInHours: parseFloat(durationInHours.toFixed(4)),
      };
  
      updateDoc(logRef, updatePayload)
        .then(() => {
          const machineName = allMachines.find(m => m.id === machineId)?.name || machineId;
          toast({ title: t.sessionStopped, description: `${machineName}` });
          setActiveSession(null);
          localStorage.removeItem('activeMachineSession');
        })
        .catch(serverError => {
          const permissionError = new FirestorePermissionError({
            path: logRef.path,
            operation: 'update',
            requestResourceData: updatePayload,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    };


    const getStatusBadge = (status: string) => {
        switch (status) {
          case "Safe":
            return "bg-green-500/20 text-green-600";
          case "Unsafe":
            return "bg-red-500/20 text-red-700";
          case "Maintenance":
            return "bg-yellow-500/20 text-yellow-600";
          default:
            return "bg-gray-500/20 text-gray-600";
        }
      };

  return (
    <Card>
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
              <TableHead>{t.name}</TableHead>
              <TableHead>{t.cluster}</TableHead>
              <TableHead>{t.status}</TableHead>
              <TableHead className="text-right">
                {t.actions}
              </TableHead>
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
            {!isLoading && allMachines.map((machine) => (
              <TableRow key={machine.id}>
                <TableCell className="font-medium">{machine.name}</TableCell>
                <TableCell>{machine.clusterId.toUpperCase()}</TableCell>
                <TableCell>
                  <span className={cn("text-xs font-semibold py-1 px-2.5 rounded-full", getStatusBadge(machine.status))}>
                    {machine.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                        {activeSession?.machineId === machine.id ? (
                             <Button size="sm" onClick={handleStopSession} variant="destructive">
                                <Square className="mr-2 h-4 w-4" />
                                {t.stopSession}
                            </Button>
                        ) : (
                            <Button size="sm" onClick={() => handleStartSession(machine)} disabled={!!activeSession || machine.status !== 'Safe'}>
                                <Play className="mr-2 h-4 w-4" />
                                {t.startSession}
                            </Button>
                        )}
                        <Button size="sm" variant="outline" asChild>
                            <Link href={`/clusters/${machine.clusterId}/machines/${machine.id}`}>
                                <Eye className="mr-2 h-4 w-4" /> {t.view}
                            </Link>
                        </Button>
                    </div>
                </TableCell>
              </TableRow>
            ))}
             {!isLoading && allMachines?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        {t.noMachines}
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
