import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, ArrowLeft, Loader2, Save, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDate, getStatusVariant } from "@/lib/grievance-utils";
import type { Grievance, GrievanceStatus } from "@/types/grievance";

const updateSchema = z.object({
  status: z.enum(["New", "In Progress", "Action Taken", "Closed"]),
  response: z.string().max(2000, "Response must be less than 2000 characters").optional(),
  private_notes: z.string().max(2000, "Private notes must be less than 2000 characters").optional(),
});

type UpdateFormValues = z.infer<typeof updateSchema>;

const statuses: GrievanceStatus[] = ["New", "In Progress", "Action Taken", "Closed"];

export default function GrievanceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [grievance, setGrievance] = useState<Grievance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
  });

  const status = watch("status");

  useEffect(() => {
    checkAuth();
    if (id) {
      fetchGrievance();
    }
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
    }
  };

  const fetchGrievance = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("grievances")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      const grievanceData = data as Grievance;
      setGrievance(grievanceData);
      setValue("status", grievanceData.status);
      setValue("response", grievanceData.response || "");
      setValue("private_notes", grievanceData.private_notes || "");
    } catch (error) {
      console.error("Error fetching grievance:", error);
      toast({
        title: "Error",
        description: "Failed to fetch grievance details.",
        variant: "destructive",
      });
      navigate("/admin/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: UpdateFormValues) => {
    if (!id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("grievances")
        .update({
          status: data.status,
          response: data.response || null,
          private_notes: data.private_notes || null,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Grievance updated successfully",
      });

      fetchGrievance();
    } catch (error) {
      console.error("Error updating grievance:", error);
      toast({
        title: "Error",
        description: "Failed to update grievance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!grievance) return null;

  return (
    <div className="min-h-screen gradient-hero">
      <header className="border-b bg-card/50 backdrop-blur-sm shadow-custom-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/dashboard")}
              className="transition-smooth"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-custom-sm">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Grievance Details</h1>
              <p className="text-xs text-muted-foreground font-mono">{grievance.tracking_code}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-custom-lg border-0 gradient-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl">{grievance.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-sm">
                      <Clock className="h-3 w-3" />
                      Submitted {formatDate(grievance.submitted_at)}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusVariant(grievance.status)} className="text-sm px-3 py-1">
                    {grievance.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Category</p>
                  <Badge variant="outline" className="text-sm">
                    {grievance.category}
                  </Badge>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {grievance.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-custom-lg border-0 gradient-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Update Grievance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={status}
                      onValueChange={(value) => setValue("status", value as GrievanceStatus)}
                    >
                      <SelectTrigger id="status" className="transition-smooth">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="response">
                      Public Response
                      <span className="text-muted-foreground text-xs ml-2">(visible to student)</span>
                    </Label>
                    <Textarea
                      id="response"
                      placeholder="Enter official response to the student..."
                      {...register("response")}
                      className="min-h-[120px] transition-smooth resize-none"
                      maxLength={2000}
                    />
                    {errors.response && (
                      <p className="text-sm text-destructive">{errors.response.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="private_notes">
                      Private Notes
                      <span className="text-muted-foreground text-xs ml-2">(admin only)</span>
                    </Label>
                    <Textarea
                      id="private_notes"
                      placeholder="Internal notes for admin use..."
                      {...register("private_notes")}
                      className="min-h-[120px] transition-smooth resize-none"
                      maxLength={2000}
                    />
                    {errors.private_notes && (
                      <p className="text-sm text-destructive">{errors.private_notes.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full transition-smooth shadow-custom-sm hover:shadow-custom-md"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
