import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <p>© 2025 Meru University of Science and Technology</p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Your feedback helps us improve. All submissions are anonymous and secure.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
