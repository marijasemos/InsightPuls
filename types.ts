
export enum UserRole {
  HR = 'HR',
  EMPLOYEE = 'EMPLOYEE'
}

export type User = {
  id: string;
  name: string;
  role: UserRole;
  position: string;
  seniority: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Director';
  team: string;
  avatar: string;
  email: string;
  status: 'Active' | 'On Leave' | 'Sick' | 'Offboarding';
  joinDate: string;
};

export type OffboardingTask = {
  id: string;
  label: string;
  completed: boolean;
  category: 'Access Handover' | 'Compliance Review' | 'Succession Planning' | 'Equipment Return';
};

export type OffboardingCase = {
  id: string;
  name: string;
  position: string;
  lastDay: string;
  type: 'Resignation' | 'Mutual' | 'End of Contract';
  progress: number;
  status: 'In Progress' | 'Documentation' | 'Hardware' | 'Completed';
  tasks: OffboardingTask[];
};

export type OnboardingTask = {
  id: string;
  label: string;
  completed: boolean;
  category: 'Administrative' | 'Team & Culture' | 'Tools & Setup';
};

export type OnboardingCase = {
  id: string;
  name: string;
  position: string;
  startDate: string;
  buddy: string;
  progress: number;
  status: 'In Progress' | 'Administrative' | 'Ready' | 'Completed';
  tasks: OnboardingTask[];
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  priority: 'Critical' | 'Normal';
  category: 'HR' | 'Social' | 'Tech';
};

export type CalendarEvent = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'Employee' | 'Candidate';
  participants: string[];
};

export type Kudos = {
  id: string;
  from: string;
  to: string;
  reason: string;
  points: number;
  date: string;
};

export type PipelineStage = 'Applied' | 'Phone Screen' | 'Technical' | 'HR Interview' | 'Offer Sent';

export type CandidateNote = {
  author: string;
  date: string;
  text: string;
};

export type Candidate = {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  stage: PipelineStage;
  appliedDate: string;
  skills: string[];
  resumeUrl: string;
  notes: CandidateNote[];
  history: { stage: PipelineStage; date: string }[];
};

export type TalentPoolCandidate = {
  id: string;
  name: string;
  email: string;
  skills: string[];
};

export type JobOpening = {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  status: 'Active' | 'Draft' | 'Closed';
  postedDate: string;
  description: string;
  requirements: string[];
  requiredSkills: string[];
  candidates: Candidate[];
};

export type Payslip = {
  id: string;
  month: string;
  year: number;
  date: string;
  grossPay: number;
  netPay: number;
  tax: number;
  insurance: number;
  status: 'Sent' | 'Scheduled' | 'Failed';
};
