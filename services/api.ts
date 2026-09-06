
import { User, Announcement, UserRole } from '../types';

// Configuration: Change this to your real backend URL when ready
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://api.insightpro.ai/v1';

/**
 * MOCK DATA - Stored here to serve as fallback if the backend is down
 */
const MOCK_EMPLOYEES: User[] = [
  { id: '1', name: 'Sarah Jenkins', role: UserRole.HR, position: 'Senior Product Designer', seniority: 'Senior', team: 'Creative', avatar: 'https://picsum.photos/seed/sarah/100/100', email: 's.jenkins@company.com', status: 'Active', joinDate: '2021-03-12' },
  { id: '2', name: 'Michael Chen', role: UserRole.EMPLOYEE, position: 'Backend Engineer', seniority: 'Lead', team: 'Engineering', avatar: 'https://picsum.photos/seed/michael/100/100', email: 'm.chen@tech.com', status: 'Active', joinDate: '2020-05-15' },
  { id: '3', name: 'Emma Davis', role: UserRole.EMPLOYEE, position: 'QA Specialist', seniority: 'Mid', team: 'Quality', avatar: 'https://picsum.photos/seed/emma/100/100', email: 'e.davis@web.io', status: 'On Leave', joinDate: '2022-01-10' },
];

const MOCK_JOBS = [
  {
    id: 'job-1',
    title: 'Senior Product Designer',
    department: 'Product',
    location: 'Remote / London',
    type: 'Full-time',
    postedDate: 'Oct 15, 2023',
    status: 'Open',
    applications: 24,
    description: 'We are looking for a Senior Product Designer to lead our design system efforts...',
    candidates: [
      { id: 'c1', name: 'Alice Thompson', email: 'alice.t@gmail.com', appliedDate: 'Oct 24', status: 'Review', aiCompatible: true, score: 92, cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { id: 'c2', name: 'Mark Wilson', email: 'm.wilson@dev.co', appliedDate: 'Oct 23', status: 'Interview', aiCompatible: true, score: 88, cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    ]
  },
  {
    id: 'job-2',
    title: 'Backend Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    postedDate: 'Oct 20, 2023',
    status: 'Open',
    applications: 12,
    description: 'Join our backend team to scale our microservices architecture...',
    candidates: []
  }
];

/**
 * Generic Fetch Wrapper with Fallback Logic
 */
async function apiRequest<T>(endpoint: string, fallbackData: T, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) throw new Error(`Server Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`API Connection to ${endpoint} failed. Using presentation fallback data.`, error);
    // Artifical delay to simulate network latency for better presentation feel
    await new Promise(resolve => setTimeout(resolve, 800));
    return fallbackData;
  }
}

// Exported Services
export const EmployeeService = {
  // Return a shallow copy so callers get their own snapshot - MOCK_EMPLOYEES keeps mutating
  // in place (create/update), and callers holding the live reference would otherwise see
  // those mutations retroactively applied to state React already committed.
  getAll: () => apiRequest<User[]>('/employees', [...MOCK_EMPLOYEES]),
  getById: (id: string) => apiRequest<User>(`/employees/${id}`, MOCK_EMPLOYEES.find(e => e.id === id) || MOCK_EMPLOYEES[0]),
  // No real backend for writes yet - mutate the in-memory mock record directly so every
  // view reading from MOCK_EMPLOYEES (directory, profile, etc.) stays in sync this session.
  update: (id: string, patch: Partial<User>): User => {
    const idx = MOCK_EMPLOYEES.findIndex(e => e.id === id);
    if (idx !== -1) {
      MOCK_EMPLOYEES[idx] = { ...MOCK_EMPLOYEES[idx], ...patch };
      return MOCK_EMPLOYEES[idx];
    }
    return patch as User;
  },
  create: (data: Omit<User, 'id'>): User => {
    const newEmployee: User = { ...data, id: `emp-${Date.now()}` };
    MOCK_EMPLOYEES.push(newEmployee);
    return newEmployee;
  },
};

export const RecruitmentService = {
  getJobs: () => apiRequest<any[]>('/jobs', MOCK_JOBS),
  getApplications: (jobId: string) => apiRequest<any[]>(`/jobs/${jobId}/applications`, MOCK_JOBS.find(j => j.id === jobId)?.candidates || []),
};

export const AnnouncementService = {
  getLatest: () => apiRequest<Announcement[]>('/announcements', []),
};

export const MoodService = {
  submit: (mood: string, comment?: string) => apiRequest<{ success: boolean }>('/mood', { success: true }, {
    method: 'POST',
    body: JSON.stringify({ mood, comment, timestamp: new Date().toISOString() }),
  }),
};
