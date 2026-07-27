
'use client';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { Loader2, Wrench } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { AssignedClusterOverview } from './components/assigned-cluster-overview';
import { AssignedMachinesTable } from './components/assigned-machines-table';
import { AssignedAlertsTable } from './components/assigned-alerts-table';
import { useLanguage } from '@/app/(app)/layout';

const translations: Record<string, Record<string, string>> = {
  en: {
    title: 'Technician Dashboard',
    description: 'Overview of your assigned clusters, machines, and alerts.',
    noClustersTitle: 'No Clusters Assigned',
    noClustersDescription: 'Please contact an administrator to be assigned to a cluster.',
  },
  hi: {
    title: 'तकनीशियन डैशबोर्ड',
    description: 'आपके निर्दिष्ट क्लस्टर, मशीन और अलर्ट का अवलोकन।',
    noClustersTitle: 'कोई क्लस्टर निर्दिष्ट नहीं है',
    noClustersDescription: 'क्लस्टर को असाइन करने के लिए कृपया एक प्रशासक से संपर्क करें।',
  },
  ta: {
    title: 'தொழில்நுட்ப வல்லுநர் டாஷ்போர்டு',
    description: 'உங்களுக்கு ஒதுக்கப்பட்ட கிளஸ்டர்கள், இயந்திரங்கள் மற்றும் விழிப்பூட்டல்களின் επισκόπηση.',
    noClustersTitle: 'கிளஸ்டர்கள் ஒதுக்கப்படவில்லை',
    noClustersDescription: 'ஒரு கிளஸ்டருக்கு ஒதுக்கப்படுவதற்கு దయచేసి நிர்வாகியைத் தொடர்பு கொள்ளவும்.',
  }
};


type UserData = {
  name: string;
  clusterIds?: string[];
}

export default function TechnicianPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  const t = translations[language] || translations.en;

  useEffect(() => {
    async function fetchUserData() {
      if (user && firestore) {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        } finally {
          setLoading(false);
        }
      } else if (!isUserLoading) {
        setLoading(false);
      }
    }
    fetchUserData();
  }, [user, firestore, isUserLoading]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!userData || !userData.clusterIds || userData.clusterIds.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          <Wrench className="h-16 w-16 text-muted-foreground" />
          <h3 className="text-2xl font-bold tracking-tight">
            {t.noClustersTitle}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t.noClustersDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4">
        <header className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">
            {t.description}
          </p>
        </header>
        <main className="grid flex-1 items-start gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
               <AssignedClusterOverview clusterIds={userData.clusterIds} />
            </div>

             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="lg:col-span-4">
                    <AssignedMachinesTable clusterIds={userData.clusterIds} />
                </div>
                <div className="lg:col-span-3">
                    <AssignedAlertsTable clusterIds={userData.clusterIds} />
                </div>
            </div>
        </main>
      </div>
    </div>
  );
}
