import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StatusChecker from "@/components/StatusChecker";
import { Info } from "lucide-react";

export default function Track() {
  return (
    <div className="min-h-screen flex flex-col gradient-hero">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-6">
          <div className="text-center space-y-3 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Track Your Grievance
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Check the status and response for your submitted grievance using your tracking code
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">Need Your Tracking Code?</p>
              <p>The tracking code was provided when you submitted your grievance. It follows the format: MU-XXXX-YYYY</p>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <StatusChecker />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
