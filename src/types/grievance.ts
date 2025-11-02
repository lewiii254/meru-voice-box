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

export interface StatusHistory {
  id: string;
  grievance_id: string;
  old_status: GrievanceStatus | null;
  new_status: GrievanceStatus;
  changed_by: string | null;
  changed_at: string;
  notes: string | null;
}

export interface Attachment {
  id: string;
  grievance_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string | null;
  uploaded_at: string;
}

export interface Comment {
  id: string;
  grievance_id: string;
  content: string;
  is_public: boolean;
  is_request_info: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
