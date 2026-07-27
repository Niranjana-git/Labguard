
"use client";

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
import { clusterOverviewData } from "@/lib/data";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function ClusterOverview() {

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

    return (
        <>
            {clusterOverviewData.map((cluster, index) => (
                <Card key={index} className="shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
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
                             <span className="text-sm text-muted-foreground">Machines / Faults</span>
                             <span className="font-semibold">{cluster.machineCount} / {cluster.faults}</span>
                           </div>
                           <Progress value={(cluster.faults / cluster.machineCount) * 100} className="h-2" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Link href={`/clusters/${cluster.name.toLowerCase()}`} className="w-full">
                            <Button className="w-full">View Machines</Button>
                        </Link>
                    </CardFooter>
                </Card>
            ))}
        </>
    );
}
