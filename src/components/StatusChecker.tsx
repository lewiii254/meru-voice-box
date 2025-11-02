import { useState } from "react";
import { Search, Loader2, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDate, getStatusVariant } from "@/lib/grievance-utils";
import type { Grievance } from "@/types/grievance";

export default function StatusChecker() {
  const [trackingCode, setTrackingCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [grievance, setGrievance] = useState<Grievance | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingCode.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a tracking code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setNotFound(false);
    setGrievance(null);

    try {
      const { data, error } = await supabase
        .from("grievances")
        .select("id, tracking_code, title, category, status, submitted_at, response")
        .eq("tracking_code", trackingCode.trim().toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setNotFound(true);
        toast({
          title: "Not Found",
          description: "No grievance found with this tracking code",
          variant: "destructive",
        });
      } else {
        setGrievance(data as Grievance);
      }
    } catch (error) {
      console.error("Error fetching grievance:", error);
      toast({
        title: "Error",
        description: "Failed to fetch grievance status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-custom-lg border-0 gradient-card">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            Track Your Grievance
          </CardTitle>
          <CardDescription className="text-base">
            Enter your tracking code to check the current status of your grievance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tracking-code">Tracking Code</Label>
              <div className="flex gap-2">
                <Input
                  id="tracking-code"
                  placeholder="e.g., MU-1234-5678"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  className="transition-smooth font-mono"
                  maxLength={13}
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="transition-smooth shadow-custom-sm hover:shadow-custom-md"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {notFound && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">
                No grievance found with tracking code: <span className="font-mono">{trackingCode}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {grievance && (
        <Card className="shadow-custom-lg border-0 gradient-card animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl">{grievance.title}</CardTitle>
                <CardDescription className="font-mono text-sm">
                  Tracking Code: {grievance.tracking_code}
                </CardDescription>
              </div>
              <Badge variant={getStatusVariant(grievance.status)} className="text-sm px-3 py-1">
                {grievance.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{grievance.category}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(grievance.submitted_at)}
                </p>
              </div>
            </div>

            <Separator />

            {grievance.response ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-primary">Official Response</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg border">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{grievance.response}</p>
                </div>
              </div>
            ) : (
              <div className="bg-muted/30 p-4 rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground text-center">
                  No official response yet. We're working on your grievance.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
