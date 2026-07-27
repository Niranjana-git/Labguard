
'use client';
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { useLanguage } from "@/app/(app)/layout";

const translations: Record<string, Record<string, string>> = {
  en: {
    title: 'Lab Schedule',
    description: 'Your scheduled lab days for this month.',
    legend: 'Scheduled Lab Day'
  },
  hi: {
    title: 'लैब शेड्यूल',
    description: 'इस महीने के लिए आपके निर्धारित लैब के दिन।',
    legend: 'निर्धारित लैब दिवस'
  },
  ta: {
    title: 'ஆய்வக அட்டவணை',
    description: 'இந்த மாதத்திற்கான உங்கள் திட்டமிடப்பட்ட ஆய்வக நாட்கள்.',
    legend: 'திட்டமிடப்பட்ட ஆய்வக நாள்'
  },
};

export function LabScheduleCalendar() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  // Static example dates for demonstration
  const today = new Date();
  const labDays = [
    today,
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10),
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 11),
  ];

  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          modifiers={{ scheduled: labDays }}
          modifiersStyles={{
            scheduled: {
              backgroundColor: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              borderRadius: '25%'
            },
          }}
        />
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 rounded-sm bg-primary" />
          <span>{t.legend}</span>
        </div>
      </CardContent>
    </Card>
  );
}
