
'use client';

import { useEffect, useState, useRef, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { AppSidebar } from '@/app/components/layout/sidebar';
import { AppHeader } from '@/app/components/layout/header';
import { Loader2 } from 'lucide-react';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { SaraChatbot } from '@/app/components/sara-chatbot';
import { useToast } from '@/hooks/use-toast';
import { clusterOverviewData } from '@/lib/data';

type Alert = {
  id: string;
  machineName?: string;
  message: string;
  severity: 'High' | 'Medium' | 'Low';
};

type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [clusterIds, setClusterIds] = useState<string[] | null>(null);
  const { toast } = useToast();
  const notifiedAlertIds = useRef(new Set());
  const [language, setLanguage] = useState('en');


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    } else if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setRole(userData.role);
          setName(userData.name);
          if (userData.role === 'Technician' && userData.clusterIds) {
            setClusterIds(userData.clusterIds);
          } else {
            setClusterIds([]);
          }
        } else {
          // If user doc doesn't exist, maybe they haven't completed registration
          router.push('/register');
        }
      });
    }
  }, [user, isUserLoading, router, firestore]);
  
  useEffect(() => {
    if (!firestore || !role) return;

    let alertQuery;
    const machineDetails = clusterOverviewData.flatMap(c => ({ 
        id: c.defaultMachine.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'),
        name: c.defaultMachine,
        clusterId: c.name.toLowerCase()
    }));

    const unsubs: (() => void)[] = [];

    const clustersToMonitor = role === 'Admin' ? machineDetails.map(m => m.clusterId) : clusterIds || [];

    if (clustersToMonitor.length > 0) {
        machineDetails.filter(m => clustersToMonitor.includes(m.clusterId)).forEach(machine => {
            const alertsRef = collection(firestore, 'clusters', machine.clusterId, 'machines', machine.id, 'alerts');
            alertQuery = query(alertsRef, where('isResolved', '==', false));

            const unsub = onSnapshot(alertQuery, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const newAlert = { id: change.doc.id, ...change.doc.data(), machineName: machine.name } as Alert;
                        if (!notifiedAlertIds.current.has(newAlert.id)) {
                             toast({
                                variant: newAlert.severity === 'High' ? 'destructive' : 'default',
                                title: `${newAlert.severity} Alert: ${newAlert.machineName}`,
                                description: newAlert.message,
                            });
                            notifiedAlertIds.current.add(newAlert.id);
                        }
                    }
                });
            });
            unsubs.push(unsub);
        });
    }

    return () => {
        unsubs.forEach(unsub => unsub());
    }

  }, [firestore, role, clusterIds, toast]);


  if (isUserLoading || !user || !role || clusterIds === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <AppSidebar userRole={role} />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <AppHeader name={name} role={role} clusterIds={clusterIds} />
          <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
          <SaraChatbot />
        </div>
      </div>
    </LanguageContext.Provider>
  );
}
