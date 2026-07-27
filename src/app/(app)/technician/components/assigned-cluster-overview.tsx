
'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useFirestore } from "@/firebase";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/app/(app)/layout";

const translations: Record<string, Record<string, string>> = {
  en: {
    machinesFaults: 'Machines / Faults',
    viewMachines: 'View Machines',
  },
  hi: {
    machinesFaults: 'मशीनें / खराबियाँ',
    viewMachines: 'मशीनें देखें',
  },
  ta: {
    machinesFaults: 'இயந்திரங்கள் / தவறுகள்',
    viewMachines: 'இயந்திரங்களைக் காண்க',
  },
};


type ClusterData = {
    id: string;
    name: string;
    description: string;
    machineCount: number;
    faults: number;
    status: string;
};

type AssignedClusterOverviewProps = {
    clusterIds: string[];
};

export function AssignedClusterOverview({ clusterIds }: AssignedClusterOverviewProps) {
    const [clusters, setClusters] = useState<ClusterData[]>([]);
    const [loading, setLoading] = useState(true);
    const firestore = useFirestore();
    const { language } = useLanguage();

    const t = translations[language] || translations.en;

    useEffect(() => {
        async function fetchClustersData() {
            if (!firestore || clusterIds.length === 0) {
                setLoading(false);
                return;
            };
            setLoading(true);

            try {
                const clusterDocsPromises = clusterIds.map(id => getDoc(doc(firestore, 'clusters', id)));
                const clusterDocs = await Promise.all(clusterDocsPromises);

                const clustersData = await Promise.all(clusterDocs.map(async (docSnapshot) => {
                    if (docSnapshot.exists()) {
                        const data = docSnapshot.data();
                        const machinesRef = collection(firestore, 'clusters', docSnapshot.id, 'machines');
                        const machinesSnapshot = await getDocs(machinesRef);
                        const machineCount = machinesSnapshot.size;
                        
                        let faults = 0;
                        for (const machineDoc of machinesSnapshot.docs) {
                            if (machineDoc.data().status === 'Unsafe') {
                                faults++;
                            }
                        }
                        
                        let status = 'green';
                        if(faults > 0) status = 'red';
                        else if (machineCount > 0 && faults === 0) status = 'green';
                        else status = 'yellow'; // No machines or other states

                        return {
                            id: docSnapshot.id,
                            name: data.name,
                            description: data.description,
                            machineCount,
                            faults,
                            status,
                        };
                    }
                    return null;
                }));

                setClusters(clustersData.filter(c => c !== null) as ClusterData[]);
            } catch (error) {
                console.error("Failed to fetch cluster overviews:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchClustersData();
    }, [firestore, clusterIds]);


    const getStatusColor = (status: string) => {
        switch (status) {
            case "green":
                return "bg-green-500";
            case "yellow":
                return "bg-yellow-500";
            case "red":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    if (loading) {
        return <>
            {Array.from({ length: clusterIds.length }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-2 w-full" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))}
        </>;
    }

    return (
        <>
            {clusters.map((cluster) => (
                <Card key={cluster.id} className="shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                           <span>{cluster.name}</span>
                           <div className={cn("w-4 h-4 rounded-full", getStatusColor(cluster.status))}></div>
                        </CardTitle>
                        <CardDescription>{cluster.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center">
                             <span className="text-sm text-muted-foreground">{t.machinesFaults}</span>
                             <span className="font-semibold">{cluster.machineCount} / {cluster.faults}</span>
                           </div>
                           <Progress value={(cluster.machineCount > 0 ? (cluster.faults / cluster.machineCount) : 0) * 100} className="h-2" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Link href={`/clusters/${cluster.id.toLowerCase()}`} className="w-full">
                            <Button className="w-full">{t.viewMachines}</Button>
                        </Link>
                    </CardFooter>
                </Card>
            ))}
        </>
    );
}
