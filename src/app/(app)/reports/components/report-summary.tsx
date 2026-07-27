'use client';

import { useEffect, useState } from 'react';
import { generateReportSummary } from '@/ai/flows/report-summary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Bot } from 'lucide-react';
import type { ReportType } from '../page';

type ReportSummaryProps = {
  reportType: ReportType;
  reportData: any; 
};

export function ReportSummary({ reportType, reportData }: ReportSummaryProps) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reportType && reportData) {
      setLoading(true);
      generateReportSummary({
        reportType,
        reportData: JSON.stringify(reportData),
      })
        .then((result) => {
          setSummary(result.summary);
        })
        .catch((error) => {
          console.error('Error generating summary:', error);
          setSummary('Could not generate summary.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
        setSummary('');
    }
  }, [reportType, reportData]);

  if (!reportType) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6" />
          AI Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Generating summary...</span>
          </div>
        ) : (
          <p className="text-sm">{summary}</p>
        )}
      </CardContent>
    </Card>
  );
}
