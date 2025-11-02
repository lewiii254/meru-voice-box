import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, LogOut, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDate, getStatusVariant } from "@/lib/grievance-utils";
import type { Grievance } from "@/types/grievance";

export default function AdminDashboard() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchGrievances();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
    }
  };

  const fetchGrievances = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("grievances")
        .select("*")
        .order("status", { ascending: true })
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      setGrievances((data as Grievance[]) || []);
    } catch (error) {
      console.error("Error fetching grievances:", error);
      toast({
        title: "Error",
        description: "Failed to fetch grievances. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      navigate("/admin/login");
    }
  };

  const statusOrder: Record<string, number> = {
    "New": 1,
    "In Progress": 2,
    "Action Taken": 3,
    "Closed": 4,
  };

  const sortedGrievances = [...grievances].sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
  });

  return (
    <div className="min-h-screen gradient-hero">
      <header className="border-b bg-card/50 backdrop-blur-sm shadow-custom-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-custom-sm">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">Grievance Management Portal</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="transition-smooth"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {["New", "In Progress", "Action Taken", "Closed"].map((status) => {
              const count = grievances.filter((g) => g.status === status).length;
              return (
                <Card key={status} className="shadow-custom-md border-0 gradient-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-sm text-muted-foreground">{status}</p>
                      </div>
                      <Badge variant={getStatusVariant(status)} className="text-sm px-3 py-1">
                        {status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="shadow-custom-lg border-0 gradient-card">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                All Grievances
              </CardTitle>
              <CardDescription className="text-base">
                Click on any grievance to view details and update status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : sortedGrievances.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No grievances submitted yet</p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tracking Code</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedGrievances.map((grievance) => (
                        <TableRow
                          key={grievance.id}
                          className="cursor-pointer hover:bg-muted/50 transition-smooth"
                          onClick={() => navigate(`/admin/grievance/${grievance.id}`)}
                        >
                          <TableCell className="font-mono text-sm font-medium">
                            {grievance.tracking_code}
                          </TableCell>
                          <TableCell className="font-medium max-w-xs truncate">
                            {grievance.title}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {grievance.category}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(grievance.status)}>
                              {grievance.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(grievance.submitted_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
