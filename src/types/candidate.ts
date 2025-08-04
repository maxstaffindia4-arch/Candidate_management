export interface Candidate {
  id: string;
  full_name: string;
  alias_name?: string;
  email: string;
  phone: string;
  current_title: string;
  manager?: string;
  employee_id?: string;
  education: string;
  skills: string[];
  summary: string;
  location: string;
  source: 'upload' | 'manual';
  cv_filepath?: string;
  created_at: string;
  updated_at: string;
}

export interface ParsedCandidateData {
  full_name?: string;
  alias_name?: string;
  email?: string;
  phone?: string;
  current_title?: string;
  manager?: string;
  employee_id?: string;
  education?: string;
  skills?: string[];
  summary?: string;
  location?: string;
  auto_populated_fields: string[];
}