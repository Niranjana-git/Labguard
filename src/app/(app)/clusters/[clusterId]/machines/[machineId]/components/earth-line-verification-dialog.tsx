
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
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
import { Input } from '@/components/ui/input';
import { Loader2, ShieldCheck } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const verificationSchema = z.object({
  resistance: z.coerce.number().min(0, 'Resistance must be a positive number.'),
});

type EarthLineVerificationDialogProps = {
  clusterId: string;
  machineId: string;
};

export function EarthLineVerificationDialog({ clusterId, machineId }: EarthLineVerificationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      resistance: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof verificationSchema>) => {
    if (!firestore) return;

    if (values.resistance >= 1) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: 'Resistance must be less than 1 ohm to be considered verified.',
      });
      return;
    }
    
    setLoading(true);
    try {
      const machineRef = doc(firestore, 'clusters', clusterId, 'machines', machineId);
      const updatePayload = { earthLine: true };
      
      await updateDoc(machineRef, updatePayload).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: machineRef.path,
            operation: 'update',
            requestResourceData: updatePayload,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

      toast({
        title: 'Earth-Line Verified',
        description: `Successfully updated the machine's earth-line status.`,
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error verifying earth-line:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update machine status.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Verify
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Verify Earth-Line Status</DialogTitle>
          <DialogDescription>
            Enter the measured earth-line resistance in ohms. The value must be less than 1 ohm to pass.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="resistance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resistance (Ohms)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., 0.5" {...field} />
                  </FormControl>
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
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 <ShieldCheck className="mr-2 h-4 w-4"/>
                Verify & Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

