
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Checkbox } from '@/components/ui/checkbox';
import { clusterOverviewData } from '@/lib/data';

type User = {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Technician' | 'Teacher';
    clusterIds?: string[];
}

type Cluster = {
    id: string;
    name: string;
}

const assignClusterSchema = z.object({
  clusterIds: z.array(z.string()).refine(value => value.length > 0, {
    message: 'You must select at least one cluster.',
  }),
});

type AssignClusterDialogProps = {
  user: User;
  children: React.ReactNode;
};

export function AssignClusterDialog({ user, children }: AssignClusterDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [clustersLoading, setClustersLoading] = useState(true);

  useEffect(() => {
    async function fetchClusters() {
        if(!firestore) return;
        setClustersLoading(true);
        try {
            const clusterSnapshot = await getDocs(collection(firestore, 'clusters'));
            const fetchedClusters = clusterSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cluster));

            const defaultClusters = clusterOverviewData.map(c => ({id: c.name.toLowerCase(), name: c.name.toUpperCase()}));

            const combined = [...fetchedClusters];
             defaultClusters.forEach(defaultCluster => {
                if (!fetchedClusters.some(dbCluster => dbCluster.id === defaultCluster.id)) {
                    combined.push(defaultCluster);
                }
            });

            setClusters(combined);
        } catch (error) {
            console.error("Failed to fetch clusters:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load clusters.' });
        } finally {
            setClustersLoading(false);
        }
    }

    if (open) {
        fetchClusters();
    }
  }, [open, firestore, toast]);

  const form = useForm<z.infer<typeof assignClusterSchema>>({
    resolver: zodResolver(assignClusterSchema),
    defaultValues: {
      clusterIds: user.clusterIds || [],
    },
  });

  useEffect(() => {
    if (user.clusterIds) {
        form.reset({ clusterIds: user.clusterIds });
    }
  }, [user.clusterIds, form]);

  const onSubmit = async (values: z.infer<typeof assignClusterSchema>) => {
    if (!firestore) return;
    setLoading(true);
    try {
      const userRef = doc(firestore, 'users', user.id);
      await setDoc(userRef, values, { merge: true }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'update',
            requestResourceData: values,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

      toast({
        title: 'Clusters Assigned',
        description: `Successfully updated assignments for ${user.name}.`,
      });
      setOpen(false);
    } catch (error) {
      console.error('Error assigning clusters:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to assign clusters.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Clusters to {user.name}</DialogTitle>
          <DialogDescription>
            Select the clusters this user should have access to.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="clusterIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Available Clusters</FormLabel>
                  </div>
                  {clustersLoading ? (
                    <div className='flex items-center justify-center p-4'>
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : clusters.map((cluster) => (
                    <FormField
                      key={cluster.id}
                      control={form.control}
                      name="clusterIds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={cluster.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(cluster.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), cluster.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== cluster.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {cluster.name.toUpperCase()}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading || clustersLoading}>
                 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Assignments
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
