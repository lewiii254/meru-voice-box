import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GrievanceForm from "@/components/GrievanceForm";
import { AlertCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col gradient-hero">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-6">
          <div className="text-center space-y-3 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Voice Your Concerns
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Submit your grievances anonymously and track their resolution. Your feedback matters.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Anonymous & Secure</p>
              <p>Your identity is completely protected. We do not collect any personal information during submission.</p>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <GrievanceForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
