

'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { clusterOverviewData } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/app/(app)/layout";

const machineGuidebookData = {
    "Lathe": {
        description: "A versatile machine tool that rotates a workpiece about an axis of rotation to perform various operations such as cutting, sanding, knurling, drilling, or deformation.",
        safety: [
            "Always wear safety glasses.",
            "Ensure all guards are in place before operating.",
            "Never leave the machine running unattended.",
            "Keep hands and clothing away from moving parts."
        ],
        maintenance: [
            "Daily: Clean chips and lubricate ways.",
            "Weekly: Check and top-up coolant levels.",
            "Monthly: Inspect belts and pulleys for wear.",
        ]
    },
    "Spectrometer": {
        description: "An instrument used to measure properties of light over a specific portion of the electromagnetic spectrum, typically used in spectroscopic analysis to identify materials.",
        safety: [
            "Do not look directly into the light source.",
            "Handle samples with care, using appropriate personal protective equipment (PPE).",
            "Ensure the instrument is properly calibrated before use."
        ],
        maintenance: [
            "Daily: Check for and clean any dust on optical surfaces.",
            "Weekly: Run calibration check with standard samples.",
            "Yearly: Professional servicing and alignment."
        ]
    },
    "UV Lamp": {
        description: "A lamp that emits ultraviolet (UV) light, used for various purposes such as sterilization, curing of materials, and in photolithography.",
        safety: [
            "Never expose skin or eyes to direct UV radiation.",
            "Use UV-blocking face shields and protective clothing.",
            "Ensure interlocks are functioning correctly to prevent accidental exposure."
        ],
        maintenance: [
            "Weekly: Clean the lamp surface with a soft, lint-free cloth.",
            "As needed: Replace the UV bulb according to the manufacturer's recommended service life.",
        ]
    },
    "PC & Cloud Server": {
        description: "A high-performance computing system used for data processing, simulations, and providing cloud-based services to the lab.",
        safety: [
            "Ensure proper grounding and electrical safety.",
            "Maintain adequate cooling and ventilation to prevent overheating.",
            "Follow standard procedures for data backup and recovery."
        ],
        maintenance: [
            "Daily: Monitor system performance and resource utilization.",
            "Monthly: Check and clean air filters and fans.",
            "Quarterly: Review security logs and apply necessary software updates.",
        ]
    }
}

const translations: Record<string, Record<string, string>> = {
  en: {
    title: "Machine Guidebook",
    description: "A comprehensive handbook for all machines in the lab.",
    selected: "Selected Language: English"
  },
  hi: {
    title: "मशीन गाइडबुक",
    description: "प्रयोगशाला में सभी मशीनों के लिए एक व्यापक हैंडबुक।",
    selected: "चयनित भाषा: हिंदी"
  },
  ta: {
    title: "இயந்திர வழிகாட்டி",
    description: "ஆய்வகத்தில் உள்ள அனைத்து இயந்திரங்களுக்கும் ஒரு விரிவான கையேடு.",
    selected: "தேர்ந்தெடுக்கப்பட்ட மொழி: தமிழ்"
  }
};


type MachineName = keyof typeof machineGuidebookData;

export default function GuidebookPage() {
  const { language, setLanguage } = useLanguage();

  const t = translations[language] || translations.en;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
            <p className="text-muted-foreground">
              {t.description}
            </p>
          </div>
           <div className="flex items-center gap-2">
            <label htmlFor="language-select" className="text-sm font-medium">Language:</label>
            <Select onValueChange={setLanguage} value={language}>
              <SelectTrigger id="language-select" className="w-[180px]">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>
        <main className="grid flex-1 items-start gap-4">
            <p className="text-sm text-muted-foreground italic">{t.selected}</p>
            <Accordion type="single" collapsible className="w-full">
                {clusterOverviewData.map(cluster => (
                    <AccordionItem value={cluster.name} key={cluster.name}>
                        <AccordionTrigger className="text-xl font-semibold">{cluster.name} Cluster</AccordionTrigger>
                        <AccordionContent>
                           <div className="p-4 bg-muted/50 rounded-lg">
                             <h3 className="text-lg font-bold mb-2">{cluster.defaultMachine}</h3>
                             <p className="text-sm text-muted-foreground mb-4">{machineGuidebookData[cluster.defaultMachine as MachineName].description}</p>
                             <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold mb-2">Safety Protocols</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        {machineGuidebookData[cluster.defaultMachine as MachineName].safety.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                                 <div>
                                    <h4 className="font-semibold mb-2">Maintenance Schedule</h4>
                                     <ul className="list-disc list-inside space-y-1 text-sm">
                                        {machineGuidebookData[cluster.defaultMachine as MachineName].maintenance.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                             </div>
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </main>
      </div>
    </div>
  );
}
