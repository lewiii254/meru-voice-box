import { Link, useLocation } from "react-router-dom";
import { FileText, Search, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-custom-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-custom-sm group-hover:shadow-custom-md transition-smooth">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">MUST Grievance Portal</h1>
              <p className="text-xs text-muted-foreground">Meru University of Science & Technology</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            {!isAdminRoute && (
              <>
                <Button
                  asChild
                  variant={location.pathname === "/" ? "default" : "ghost"}
                  className="transition-smooth"
                >
                  <Link to="/">
                    <FileText className="h-4 w-4 mr-2" />
                    Submit
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={location.pathname === "/track" ? "default" : "ghost"}
                  className="transition-smooth"
                >
                  <Link to="/track">
                    <Search className="h-4 w-4 mr-2" />
                    Track
                  </Link>
                </Button>
              </>
            )}
            {!isAdminRoute && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="ml-2 transition-smooth"
              >
                <Link to="/admin/login">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
