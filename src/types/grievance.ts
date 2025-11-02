export type GrievanceCategory = 
  | "Academics" 
  | "Security" 
  | "Maintenance" 
  | "Administration" 
  | "Other";

export type GrievanceStatus = 
  | "New" 
  | "In Progress" 
  | "Action Taken" 
  | "Closed";

export interface Grievance {
  id: string;
  tracking_code: string;
  title: string;
  description: string;
  category: GrievanceCategory;
  status: GrievanceStatus;
  submitted_at: string;
  response: string | null;
  private_notes?: string | null;
}

export interface GrievanceFormData {
  title: string;
  description: string;
  category: GrievanceCategory;
}
