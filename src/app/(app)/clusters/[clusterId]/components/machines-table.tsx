
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
import { useCollection } from "@/firebase";
import { collection, query, doc, deleteDoc } from "firebase/firestore";
import { useFirestore, useMemoFirebase } from "@/firebase";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Edit, Eye } from "lucide-react";
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator
  } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { EditMachineDialog } from "./edit-machine-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { defaultMachinesData } from "@/lib/data";

type Machine = {
    id: string;
    name: string;
    brand: string;
    model: string;
    status: 'Safe' | 'Unsafe' | 'Maintenance';
    location: string;
    technician: string;
}

export function MachinesTable({ clusterId }: { clusterId: string }) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const machinesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'clusters', clusterId, 'machines'));
    }, [firestore, clusterId]);

    const { data: machinesFromDB, isLoading } = useCollection<Machine>(machinesQuery);
    
    const [allMachines, setAllMachines] = useState<Machine[]>([]);

    useEffect(() => {
        const defaultClusterMachines = defaultMachinesData[clusterId.toLowerCase() as keyof typeof defaultMachinesData] || [];
        if (machinesFromDB) {
            const combined = [...machinesFromDB];
            defaultClusterMachines.forEach(defaultMachine => {
                if (!machinesFromDB.some(dbMachine => dbMachine.id === defaultMachine.id)) {
                    combined.push(defaultMachine as Machine);
                }
            });
            setAllMachines(combined);
        } else {
            setAllMachines(defaultClusterMachines as Machine[]);
        }
    }, [machinesFromDB, clusterId]);

    const handleDelete = async (machineId: string) => {
        if (!firestore) return;
        
        // Prevent deletion of default machines from firestore for demo purposes
        const isDefault = Object.values(defaultMachinesData).flat().some(m => m.id === machineId);
        if (isDefault) {
            // Just remove from local state for the demo
            setAllMachines(prev => prev.filter(m => m.id !== machineId));
            toast({ title: "Demo Machine Removed", description: "This machine was part of the demo and has been removed from the view." });
            return;
        }

        const machineRef = doc(firestore, 'clusters', clusterId, 'machines', machineId);
        try {
            await deleteDoc(machineRef).catch(serverError => {
                const permissionError = new FirestorePermissionError({
                    path: machineRef.path,
                    operation: 'delete',
                });
                errorEmitter.emit('permission-error', permissionError);
            });
            toast({ title: "Machine Deleted", description: "The machine has been successfully deleted." });
        } catch (error) {
            console.error("Error deleting machine: ", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to delete machine." });
        }
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
        <CardTitle>Machines</CardTitle>
        <CardDescription>
          A list of all machines in this cluster.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Assigned Technician</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        Loading...
                    </TableCell>
                </TableRow>
            )}
            {allMachines && allMachines.map((machine) => (
              <TableRow key={machine.id}>
                <TableCell className="font-medium">{machine.name}</TableCell>
                <TableCell>{machine.brand}</TableCell>
                <TableCell>{machine.model}</TableCell>
                <TableCell>{machine.technician || 'N/A'}</TableCell>
                <TableCell>
                  <span className={cn("text-xs font-semibold py-1 px-2.5 rounded-full", getStatusBadge(machine.status))}>
                    {machine.status}
                  </span>
                </TableCell>
                <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                             <DropdownMenuItem asChild>
                                <Link href={`/clusters/${clusterId}/machines/${machine.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                </Link>
                            </DropdownMenuItem>
                            <EditMachineDialog clusterId={clusterId} machine={machine}>
                                <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </div>
                            </EditMachineDialog>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </div>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the
                                        machine and all its associated data.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(machine.id)}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
             {!isLoading && allMachines?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No machines found in this cluster.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
