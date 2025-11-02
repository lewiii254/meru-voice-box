import { useState } from "react";
import { Check, Copy, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface SuccessModalProps {
  trackingCode: string;
  onClose: () => void;
}

export default function SuccessModal({ trackingCode, onClose }: SuccessModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(trackingCode);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Tracking code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the tracking code manually",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="h-6 w-6 text-primary" />
            </div>
            Grievance Submitted Successfully
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Your grievance has been recorded. Please save this tracking code to check the status of your grievance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted p-6 rounded-lg border-2 border-primary/20">
            <p className="text-sm text-muted-foreground mb-2 text-center">Your Tracking Code</p>
            <p className="text-3xl font-bold text-center text-primary tracking-wider">
              {trackingCode}
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
              ⚠️ Important: Save this tracking code! You will need it to check your grievance status. This code will not be shown again.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="flex-1 transition-smooth"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Code
                </>
              )}
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 transition-smooth"
            >
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
