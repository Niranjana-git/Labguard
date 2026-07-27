"use client";

import { useState, ChangeEvent } from "react";
import { Bot, FileText, Loader2, Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { classifyMachines } from "@/ai/flows/csv-machine-classification";
import type { ClassifyMachinesOutput } from "@/ai/flows/csv-machine-classification";
import { Badge } from "@/components/ui/badge";

export function CsvClassifier() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ClassifyMachinesOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleClassify = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a CSV file to classify.",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const csvData = event.target?.result as string;
            const classification = await classifyMachines({ csvData });
            setResult(classification);
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Classification Failed",
                description: "Could not process the CSV file.",
            });
        } finally {
            setLoading(false);
        }
    };
    reader.readAsText(file);
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6" />
          CSV Machine Classifier
        </CardTitle>
        <CardDescription>
          Upload a CSV with machine data to get cluster and threshold suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center items-center h-64 border-2 border-dashed rounded-lg">
            <div className="text-center text-muted-foreground">
                <FileText className="mx-auto h-12 w-12" />
                <p>Upload a CSV file</p>
                {file && <p className="text-sm font-medium text-foreground mt-2">{file.name}</p>}
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Input id="csvFile" type="file" accept=".csv" onChange={handleFileChange} className="cursor-pointer"/>
            <Button onClick={handleClassify} disabled={loading || !file}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Classify
            </Button>
        </div>
      </CardContent>
      {result && (
         <CardFooter className="flex flex-col items-start space-y-4 rounded-b-lg bg-muted/50 p-4">
            <h3 className="font-semibold">Classification Results:</h3>
            <div className="space-y-2">
                <h4 className="font-medium text-sm">Suggested Clusters:</h4>
                <div className="flex flex-wrap gap-2">
                    {result.clusters.map((cluster, i) => <Badge key={i} variant="secondary">{cluster}</Badge>)}
                </div>
            </div>
            <div className="space-y-2 w-full">
                <h4 className="font-medium text-sm">Optimal Thresholds:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                    {Object.entries(result.thresholdSettings).map(([key, value]) => (
                        <li key={key}>
                            <span className="font-semibold">{key}:</span> {value}
                        </li>
                    ))}
                </ul>
            </div>
         </CardFooter>
      )}
    </Card>
  );
}
