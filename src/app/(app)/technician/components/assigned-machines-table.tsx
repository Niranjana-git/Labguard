
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
import { useFirestore } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { defaultMachinesData } from "@/lib/data";
import { useLanguage } from "@/app/(app)/layout";

const translations: Record<string, Record<string, string>> = {
  en: {
    title: 'Your Machines',
    description: 'A list of all machines in your assigned clusters.',
    name: 'Name',
    cluster: 'Cluster',
    status: 'Status',
    actions: 'Actions',
    loading: 'Loading machines...',
    noMachines: 'No machines found in your clusters.',
    view: 'View',
  },
  hi: {
    title: 'आपकी मशीनें',
    description: 'आपके निर्दिष्ट क्लस्टर में सभी मशीनों की सूची।',
    name: 'नाम',
    cluster: 'क्लस्टर',
    status: 'स्थिति',
    actions: 'कार्रवाई',
    loading: 'मशीनें लोड हो रही हैं...',
    noMachines: 'आपके क्लस्टर में कोई मशीन नहीं मिली।',
    view: 'देखें',
  },
  ta: {
    title: 'உங்கள் இயந்திரங்கள்',
    description: 'உங்களுக்கு ஒதுக்கப்பட்ட கிளஸ்டர்களில் உள்ள அனைத்து இயந்திரங்களின் பட்டியல்.',
    name: 'பெயர்',
    cluster: 'கிளஸ்டர்',
    status: 'நிலை',
    actions: 'செயல்கள்',
    loading: 'இயந்திரங்கள் ஏற்றப்படுகின்றன...',
    noMachines: 'உங்கள் கிளஸ்டர்களில் இயந்திரங்கள் எதுவும் இல்லை.',
    view: 'காண்க',
  },
};


type Machine = {
    id: string;
    name: string;
    brand: string;
    model: string;
    status: 'Safe' | 'Unsafe' | 'Maintenance';
    clusterId: string;
}

export function AssignedMachinesTable({ clusterIds }: { clusterIds: string[] }) {
    const firestore = useFirestore();
    const [allMachines, setAllMachines] = useState<Machine[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { language } = useLanguage();
    
    const t = translations[language] || translations.en;

    useEffect(() => {
      async function fetchMachines() {
        // Start with the hardcoded default machines for the assigned clusters
        const defaultClusterMachines = clusterIds
            .map(id => defaultMachinesData[id.toLowerCase() as keyof typeof defaultMachinesData] || [])
            .flat();

        if (!firestore) {
            // If firestore is not available, just use the default data.
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

          // Combine DB machines with default machines, avoiding duplicates
          const combined = [...machinesFromDB];
          defaultClusterMachines.forEach(defaultMachine => {
              if (!machinesFromDB.some(dbMachine => dbMachine.id === defaultMachine.id)) {
                  combined.push(defaultMachine as Machine);
              }
          });
          setAllMachines(combined);

        } catch (error) {
            console.error("Failed to fetch assigned machines: ", error);
            // Fallback to only default data on error
            setAllMachines(defaultClusterMachines as Machine[]);
        } finally {
            setIsLoading(false);
        }
      }
      fetchMachines();
    }, [firestore, clusterIds]);


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
              <TableHead>
                <span className="sr-only">{t.actions}</span>
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
                <TableCell>
                    <Link href="/reports" className="text-primary hover:underline flex items-center gap-2">
                        <Eye className="h-4 w-4" /> {t.view}
                    </Link>
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
