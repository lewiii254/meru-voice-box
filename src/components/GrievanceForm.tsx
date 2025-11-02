import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { generateTrackingCode } from "@/lib/grievance-utils";
import { toast } from "@/hooks/use-toast";
import type { GrievanceCategory } from "@/types/grievance";
import SuccessModal from "./SuccessModal";

const grievanceSchema = z.object({
  title: z.string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z.string()
    .trim()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be less than 2000 characters"),
  category: z.enum(["Academics", "Security", "Maintenance", "Administration", "Other"], {
    required_error: "Please select a category",
  }),
});

type GrievanceFormValues = z.infer<typeof grievanceSchema>;

const categories: GrievanceCategory[] = [
  "Academics",
  "Security",
  "Maintenance",
  "Administration",
  "Other",
];

export default function GrievanceForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<GrievanceFormValues>({
    resolver: zodResolver(grievanceSchema),
  });

  const category = watch("category");

  const onSubmit = async (data: GrievanceFormValues) => {
    setIsSubmitting(true);

    try {
      const newTrackingCode = generateTrackingCode();

      const { error } = await supabase.from("grievances").insert([{
        tracking_code: newTrackingCode,
        title: data.title,
        description: data.description,
        category: data.category,
        status: "New",
      }]);

      if (error) throw error;

      setTrackingCode(newTrackingCode);
      reset();
      
      toast({
        title: "Grievance Submitted Successfully",
        description: "Your tracking code has been generated. Please save it to track your grievance.",
      });
    } catch (error) {
      console.error("Error submitting grievance:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your grievance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="shadow-custom-lg border-0 gradient-card">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Submit a Grievance
          </CardTitle>
          <CardDescription className="text-base">
            Your submission is completely anonymous. Please provide detailed information to help us address your concern effectively.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={category}
                onValueChange={(value) => setValue("category", value as GrievanceCategory)}
              >
                <SelectTrigger id="category" className="transition-smooth">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Brief summary of your concern"
                {...register("title")}
                className="transition-smooth"
                maxLength={100}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Please provide detailed information about your grievance..."
                {...register("description")}
                className="min-h-[200px] transition-smooth resize-none"
                maxLength={2000}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full transition-smooth shadow-custom-sm hover:shadow-custom-md"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Grievance
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {trackingCode && (
        <SuccessModal
          trackingCode={trackingCode}
          onClose={() => setTrackingCode(null)}
        />
      )}
    </>
  );
}
