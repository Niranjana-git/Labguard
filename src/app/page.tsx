"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { LabGuardLogo } from '@/app/components/icons';

export default function SplashPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  useEffect(() => {
    if (!isUserLoading) {
      if (user && firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        getDoc(userDocRef).then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            switch (userData.role) {
              case 'Admin':
                router.push('/dashboard');
                break;
              case 'Technician':
                router.push('/technician');
                break;
              case 'Teacher':
                router.push('/teacher');
                break;
              default:
                router.push('/login'); // Fallback to login
            }
          } else {
             router.push('/login'); // User doc not found
          }
        });
      } else {
        router.push('/login');
      }
    }
  }, [user, isUserLoading, router, firestore]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="flex items-center space-x-4">
        <div className="animate-pulse">
            <LabGuardLogo className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-primary tracking-tighter">LabGuard Pro</h1>
      </div>
      <p className="mt-4 text-muted-foreground">Initializing Smart Lab System...</p>
    </div>
  );
}
