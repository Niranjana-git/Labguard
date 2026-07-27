
'use client';
import { useUser, useFirestore } from '@/firebase';
import { Loader2, Wrench, BookUser } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/app/(app)/layout';
import { TeacherMachinesTable } from './components/teacher-machines-table';
import { LabScheduleCalendar } from './components/lab-schedule-calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsageLogsTable } from './components/usage-logs-table';

const translations: Record<string, Record<string, string>> = {
  en: {
    title: 'Teacher Dashboard',
    description: 'Overview of machines and your schedule for assigned labs.',
    noClustersTitle: 'No Labs Assigned',
    noClustersDescription: 'Please contact an administrator to be assigned to a lab cluster.',
    myMachines: 'My Machines',
    usageHistory: 'Usage History',
  },
  hi: {
    title: 'शिक्षक डैशबोर्ड',
    description: 'आपके निर्दिष्ट प्रयोगशालाओं में मशीनों और आपके शेड्यूल का अवलोकन।',
    noClustersTitle: 'कोई प्रयोगशाला निर्दिष्ट नहीं है',
    noClustersDescription: 'प्रयोगशाला क्लस्टर को असाइन करने के लिए कृपया एक प्रशासक से संपर्क करें।',
    myMachines: 'मेरी मशीनें',
    usageHistory: 'उपयोग इतिहास',
  },
  ta: {
    title: 'ஆசிரியர் டாஷ்போர்டு',
    description: 'உங்களுக்கு ஒதுக்கப்பட்ட ஆய்வகங்களில் உள்ள இயந்திரங்கள் மற்றும் உங்கள் அட்டவணையின் கண்ணோட்டம்.',
    noClustersTitle: 'ஆய்வகங்கள் ஒதுக்கப்படவில்லை',
    noClustersDescription: 'ஒரு ஆய்வக கிளஸ்டருக்கு ஒதுக்கப்படுவதற்கு దయచేసి நிர்வாகியைத் தொடர்பு கொள்ளவும்.',
    myMachines: 'என் இயந்திரங்கள்',
    usageHistory: 'பயன்பாட்டு வரலாறு',
  }
};


type UserData = {
  name: string;
  clusterIds?: string[];
}

export default function TeacherPage() {
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
          <BookUser className="h-16 w-16 text-muted-foreground" />
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
        <main className="grid flex-1 items-start gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
                <Tabs defaultValue="machines">
                  <TabsList>
                    <TabsTrigger value="machines">{t.myMachines}</TabsTrigger>
                    <TabsTrigger value="logs">{t.usageHistory}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="machines">
                    <TeacherMachinesTable clusterIds={userData.clusterIds} />
                  </TabsContent>
                  <TabsContent value="logs">
                    <UsageLogsTable />
                  </TabsContent>
                </Tabs>
            </div>
            <div className="md:col-span-1">
                <LabScheduleCalendar />
            </div>
        </main>
      </div>
    </div>
  );
}
