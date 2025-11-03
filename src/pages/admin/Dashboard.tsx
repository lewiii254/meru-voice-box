import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, LogOut, Loader2, FileText, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import type { Grievance, GrievanceCategory, GrievanceStatus } from "@/types/grievance";
import SearchFilters from "@/components/admin/SearchFilters";
import AnalyticsCards from "@/components/admin/AnalyticsCards";
import { parse } from "papaparse";

export default function AdminDashboard() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<GrievanceCategory[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<GrievanceStatus | "All">("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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

  // Filtered and sorted grievances
  const filteredGrievances = useMemo(() => {
    return grievances.filter((g) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === "" || 
        g.title.toLowerCase().includes(searchLower) ||
        g.description.toLowerCase().includes(searchLower) ||
        g.tracking_code.toLowerCase().includes(searchLower);

      // Category filter
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(g.category);

      // Status filter
      const matchesStatus = selectedStatus === "All" || g.status === selectedStatus;

      // Date range filter
      const gDate = new Date(g.submitted_at);
      const matchesDateFrom = dateFrom === "" || gDate >= new Date(dateFrom);
      const matchesDateTo = dateTo === "" || gDate <= new Date(dateTo);

      return matchesSearch && matchesCategory && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [grievances, searchQuery, selectedCategories, selectedStatus, dateFrom, dateTo]);

  const sortedGrievances = useMemo(() => {
    return [...filteredGrievances].sort((a, b) => {
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
    });
  }, [filteredGrievances]);

  const handleExportCSV = () => {
    const csvData = sortedGrievances.map((g) => ({
      "Tracking Code": g.tracking_code,
      "Title": g.title,
      "Description": g.description,
      "Category": g.category,
      "Status": g.status,
      "Submitted At": formatDate(g.submitted_at),
      "Response": g.response || "N/A",
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) => Object.values(row).map((val) => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grievances_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Exported ${sortedGrievances.length} grievances to CSV`,
    });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedStatus("All");
    setDateFrom("");
    setDateTo("");
  };

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
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="overview">
              <FileText className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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

            <SearchFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              dateFrom={dateFrom}
              setDateFrom={setDateFrom}
              dateTo={dateTo}
              setDateTo={setDateTo}
              onExport={handleExportCSV}
              onReset={handleResetFilters}
            />

            <Card className="shadow-custom-lg border-0 gradient-card">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  All Grievances
                  <Badge variant="secondary" className="ml-2">
                    {sortedGrievances.length} results
                  </Badge>
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
                    <p className="text-muted-foreground">No grievances match your filters</p>
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
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsCards grievances={grievances} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
