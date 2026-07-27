import { ImagePartIdentifier } from "./components/image-part-identifier";
import { CsvClassifier } from "./components/csv-classifier";

export default function AiToolsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4">
        <header className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight">AI-Powered Tools</h1>
          <p className="text-muted-foreground">
            Leverage AI to enhance lab management and maintenance.
          </p>
        </header>
        <main className="grid flex-1 items-start gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2">
            <ImagePartIdentifier />
            <CsvClassifier />
        </main>
      </div>
    </div>
  );
}
