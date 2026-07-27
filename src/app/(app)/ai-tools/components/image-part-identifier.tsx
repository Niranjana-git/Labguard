"use client";

import { useState, ChangeEvent } from "react";
import Image from 'next/image';
import { Bot, Image as ImageIcon, Loader2, Upload } from "lucide-react";
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
import { identifySparePart } from "@/ai/flows/image-based-spare-part-identification";
import type { IdentifySparePartOutput } from "@/ai/flows/image-based-spare-part-identification";

export function ImagePartIdentifier() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifySparePartOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleIdentify = async () => {
    if (!file || !preview) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select an image file to identify.",
      });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const partIdentification = await identifySparePart({ photoDataUri: preview });
      setResult(partIdentification);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Identification Failed",
        description: "Could not identify the part from the image.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6" />
          Image-Based Spare Part Identifier
        </CardTitle>
        <CardDescription>
          Upload a photo of a machine part to identify it and get its market price and parameters.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative flex justify-center items-center h-64 border-2 border-dashed rounded-lg">
            {preview ? (
                <Image src={preview} alt="Part preview" fill style={{objectFit:"contain"}} className="rounded-lg"/>
            ) : (
                <div className="text-center text-muted-foreground">
                    <ImageIcon className="mx-auto h-12 w-12" />
                    <p>Image preview will appear here</p>
                </div>
            )}
        </div>
        <div className="flex items-center gap-2">
            <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} className="cursor-pointer" />
            <Button onClick={handleIdentify} disabled={loading || !file}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Identify
            </Button>
        </div>
      </CardContent>
      {result && (
         <CardFooter className="flex flex-col items-start space-y-4 rounded-b-lg bg-muted/50 p-4">
            <h3 className="font-semibold">Identification Result:</h3>
            <p className="text-sm"><span className="font-medium">Part Name:</span> {result.partName}</p>
            <p className="text-sm"><span className="font-medium">Market Price:</span> {result.marketPrice}</p>
            
            <div className="space-y-2 w-full">
                <h4 className="font-medium text-sm">Parameters to Measure:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                    {result.parametersToMeasure.map((param, index) => (
                        <li key={index}>{param}</li>
                    ))}
                </ul>
            </div>
            
            <div className="space-y-2 w-full">
                <h4 className="font-medium text-sm">Operational Thresholds:</h4>
                <p className="text-sm">{result.thresholds}</p>
            </div>
         </CardFooter>
      )}
    </Card>
  );
}
