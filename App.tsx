
import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole, User, OffboardingCase, OffboardingTask, OnboardingCase, OnboardingTask } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HRDashboard from './views/HRDashboard';
import EmployeeHome from './views/EmployeeHome';
import EmployeeProfile from './views/EmployeeProfile';
import TeamView from './views/TeamView';
import FeedbackMood from './views/FeedbackMood';
import Onboarding from './views/Onboarding';
import Offboarding from './views/Offboarding';
import Requests from './views/Requests';
import Benefits from './views/Benefits';
import Events from './views/Events';
import Employees from './views/Employees';
import Analytics from './views/Analytics';
import Settings from './views/Settings';
import Payroll from './views/Payroll';
import Announcements from './views/Announcements';
import HRCalendar from './views/HRCalendar';
import OfficeSpace from './views/OfficeSpace';
import Recruitment from './views/Recruitment';
import AccountSettings from './views/AccountSettings';
import Login from './views/Login';
import { BrandingConfig, DEFAULT_BRANDING } from './components/BrandingSettings';

type Theme = 'light' | 'dark';

interface DynamicSettings {
  labels: {
    employee: string;
    team: string;
    position: string;
    requests: string;
    analytics: string;
  };
  navigation: {
    id: string;
    label: string;
    path: string;
    isVisible: boolean;
    isCustom?: boolean;
  }[];
  customFields: {
    id: string;
    label: string;
    type: 'text' | 'date' | 'select';
    section: 'Personal' | 'Work';
  }[];
  primaryColor: string;
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  authRole: UserRole;
  logout: () => void;
  currentUser: User;
  theme: Theme;
  toggleTheme: () => void;
  settings: DynamicSettings;
  updateSettings: (newSettings: Partial<DynamicSettings>) => void;
  offboardingCases: OffboardingCase[];
  addOffboardingCase: (newCase: OffboardingCase) => void;
  toggleOffboardingCaseTask: (caseId: string, taskId: string) => void;
  onboardingCases: OnboardingCase[];
  addOnboardingCase: (newCase: OnboardingCase) => void;
  toggleOnboardingCaseTask: (caseId: string, taskId: string) => void;
  branding: BrandingConfig;
  updateBranding: (patch: Partial<BrandingConfig>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

const DEFAULT_SETTINGS: DynamicSettings = {
  labels: {
    employee: 'Employee',
    team: 'Team',
    position: 'Position',
    requests: 'Requests',
    analytics: 'Analytics'
  },
  navigation: [
    { id: 'dash', label: 'Dashboard', path: '/', isVisible: true },
    { id: 'profile', label: 'My Profile', path: '/profile/me', isVisible: true },
    { id: 'ann', label: 'Announcements', path: '/announcements', isVisible: true },
    { id: 'cal', label: 'Calendar', path: '/calendar', isVisible: true },
    { id: 'rec', label: 'Recruitment', path: '/recruitment', isVisible: true },
    { id: 'emp', label: 'Employees', path: '/employees', isVisible: true },
    { id: 'team', label: 'Teams', path: '/teams', isVisible: true },
    { id: 'pay', label: 'Payroll', path: '/payroll', isVisible: true },
    { id: 'offi', label: 'Office & Food', path: '/office', isVisible: true },
    { id: 'ben', label: 'Benefits', path: '/benefits', isVisible: true },
    { id: 'events', label: 'Events', path: '/events', isVisible: true },
    { id: 'req', label: 'Requests', path: '/requests', isVisible: true },
    { id: 'feed', label: 'Feedback', path: '/feedback', isVisible: true },
    { id: 'onb', label: 'Onboarding', path: '/onboarding', isVisible: true },
    { id: 'off', label: 'Offboarding', path: '/offboarding', isVisible: true },
    { id: 'anl', label: 'Analytics', path: '/analytics', isVisible: true },
  ],
  customFields: [],
  primaryColor: '#2563eb'
};

type AuthSession = { email: string; role: UserRole };

const ACCOUNTS: { email: string; password: string; role: UserRole }[] = [
  { email: 'mm@gmail.com', password: '1111', role: UserRole.HR },
  { email: 'aa@gmail.com', password: '1111', role: UserRole.EMPLOYEE },
];

const MOCK_USER: User = {
  id: 'user-1',
  name: 'John Doe',
  role: UserRole.HR,
  position: 'HR Director',
  seniority: 'Director',
  email: 'j.doe@company.com',
  team: 'HR Management',
  avatar: 'https://picsum.photos/seed/john/100/100',
  status: 'Active',
  joinDate: '2022-03-15',
};

// Fixed checklist templates (mock) - every case shares the same categories and items;
// only which items are pre-completed differs per case.
export const ONBOARDING_TASK_TEMPLATE: Omit<OnboardingTask, 'completed'>[] = [
  { id: 'ob-contract', label: 'Contract signed', category: 'Administrative' },
  { id: 'ob-payroll', label: 'Payroll details entered', category: 'Administrative' },
  { id: 'ob-security', label: 'Security training completed', category: 'Administrative' },
  { id: 'ob-intro', label: 'Team introduction scheduled', category: 'Team & Culture' },
  { id: 'ob-buddy', label: 'Buddy / mentor assigned', category: 'Team & Culture' },
  { id: 'ob-1on1', label: 'First 1-on-1 with manager held', category: 'Team & Culture' },
  { id: 'ob-equipment', label: 'Work equipment issued', category: 'Tools & Setup' },
  { id: 'ob-access', label: 'Account access activated (email, Teams, internal systems)', category: 'Tools & Setup' },
  { id: 'ob-desk', label: 'Workspace / desk assigned', category: 'Tools & Setup' },
];

export const buildOnboardingTasks = (completedIds: string[] = []): OnboardingTask[] =>
  ONBOARDING_TASK_TEMPLATE.map((t) => ({ ...t, completed: completedIds.includes(t.id) }));

export const OFFBOARDING_TASK_TEMPLATE: Omit<OffboardingTask, 'completed'>[] = [
  { id: 'off-email', label: 'Email / Teams access revoked', category: 'Access Handover' },
  { id: 'off-systems', label: 'Internal systems access revoked', category: 'Access Handover' },
  { id: 'off-nda', label: 'Signed NDA / post-employment agreement verified', category: 'Compliance Review' },
  { id: 'off-payroll', label: 'Final payroll and settlement verified', category: 'Compliance Review' },
  { id: 'off-transfer', label: 'Tasks / projects transferred to new owner', category: 'Succession Planning' },
  { id: 'off-notify', label: 'Team notified of departure', category: 'Succession Planning' },
  { id: 'off-laptop', label: 'Laptop / equipment returned', category: 'Equipment Return' },
  { id: 'off-card', label: 'Access card returned', category: 'Equipment Return' },
];

export const buildOffboardingTasks = (completedIds: string[] = []): OffboardingTask[] =>
  OFFBOARDING_TASK_TEMPLATE.map((t) => ({ ...t, completed: completedIds.includes(t.id) }));

const INITIAL_OFFBOARDING_CASES: OffboardingCase[] = [
  {
    id: 'off-doe',
    name: 'John Doe',
    position: 'HR Director',
    lastDay: 'Dec 20, 2023',
    type: 'Mutual',
    progress: 13,
    status: 'Documentation',
    tasks: buildOffboardingTasks(['off-email']),
  },
  {
    id: 'off-1',
    name: 'Robert Fox',
    position: 'Lead Counsel',
    lastDay: 'Nov 30, 2023',
    type: 'Resignation',
    progress: 50,
    status: 'In Progress',
    tasks: buildOffboardingTasks(['off-email', 'off-systems', 'off-nda', 'off-payroll']),
  },
  {
    id: 'off-2',
    name: 'Jenny Wilson',
    position: 'HR Manager',
    lastDay: 'Dec 15, 2023',
    type: 'Mutual',
    progress: 25,
    status: 'Documentation',
    tasks: buildOffboardingTasks(['off-email', 'off-systems']),
  },
];

const INITIAL_ONBOARDING_CASES: OnboardingCase[] = [
  {
    id: 'onb-doe',
    name: 'John Doe',
    position: 'HR Director',
    startDate: 'Nov 01, 2023',
    buddy: 'Alex Rivera',
    progress: 67,
    status: 'In Progress',
    tasks: buildOnboardingTasks(['ob-contract', 'ob-payroll', 'ob-security', 'ob-intro', 'ob-buddy', 'ob-1on1']),
  },
  {
    id: 'onb-1',
    name: 'Noah Taylor',
    position: 'Junior Developer',
    startDate: 'Oct 15, 2023',
    buddy: 'Alex Rivera',
    progress: 33,
    status: 'In Progress',
    tasks: buildOnboardingTasks(['ob-contract', 'ob-payroll', 'ob-security']),
  },
  {
    id: 'onb-2',
    name: 'Sofia Martinez',
    position: 'Marketing Specialist',
    startDate: 'Nov 01, 2023',
    buddy: 'Jenny Wilson',
    progress: 11,
    status: 'Administrative',
    tasks: buildOnboardingTasks(['ob-contract']),
  },
];

const App: React.FC = () => {
  // Always start signed out - the login page is the mandatory entry point every time the app loads.
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [role, setRole] = useState<UserRole>(UserRole.HR);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [settings, setSettings] = useState<DynamicSettings>(() => {
    const saved = localStorage.getItem('hr_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [offboardingCases, setOffboardingCases] = useState<OffboardingCase[]>(INITIAL_OFFBOARDING_CASES);
  const addOffboardingCase = (newCase: OffboardingCase) => setOffboardingCases(prev => prev.some(c => c.id === newCase.id) ? prev : [newCase, ...prev]);
  const toggleOffboardingCaseTask = (caseId: string, taskId: string) => setOffboardingCases(prev => prev.map(c =>
    c.id !== caseId ? c : { ...c, tasks: c.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) }
  ));
  const [onboardingCases, setOnboardingCases] = useState<OnboardingCase[]>(INITIAL_ONBOARDING_CASES);
  const addOnboardingCase = (newCase: OnboardingCase) => setOnboardingCases(prev => prev.some(c => c.id === newCase.id) ? prev : [newCase, ...prev]);
  const toggleOnboardingCaseTask = (caseId: string, taskId: string) => setOnboardingCases(prev => prev.map(c =>
    c.id !== caseId ? c : { ...c, tasks: c.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) }
  ));
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);
  const updateBranding = (patch: Partial<BrandingConfig>) => setBranding(prev => ({ ...prev, ...patch }));

  useEffect(() => {
    const root = window.document.documentElement;
    theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('hr_settings', JSON.stringify(settings));
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
  }, [settings]);

  const updateSettings = (updates: Partial<DynamicSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const handleLogin = (email: string, password: string): boolean => {
    const match = ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
    if (!match) return false;
    setAuthSession({ email: match.email, role: match.role });
    setRole(match.role);
    return true;
  };

  const logout = () => {
    setAuthSession(null);
    setRole(UserRole.HR);
  };

  if (!authSession) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <AppContext.Provider value={{ role, setRole, authRole: authSession.role, logout, currentUser: MOCK_USER, theme, toggleTheme, settings, updateSettings, offboardingCases, addOffboardingCase, toggleOffboardingCaseTask, onboardingCases, addOnboardingCase, toggleOnboardingCaseTask, branding, updateBranding }}>
      <HashRouter>
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
              <Routes>
                <Route path="/" element={role === UserRole.HR ? <HRDashboard /> : <EmployeeHome />} />
                <Route path="/announcements" element={<Announcements />} />
                <Route path="/calendar" element={<HRCalendar />} />
                {role === UserRole.HR && <Route path="/recruitment" element={<Recruitment />} />}
                <Route path="/employees" element={<Employees />} />
                <Route path="/profile/:id" element={<EmployeeProfile />} />
                <Route path="/teams" element={<TeamView />} />
                <Route path="/payroll" element={<Payroll />} />
                <Route path="/office" element={<OfficeSpace />} />
                <Route path="/requests" element={<Requests />} />
                <Route path="/feedback" element={<FeedbackMood />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/offboarding" element={<Offboarding />} />
                <Route path="/benefits" element={<Benefits />} />
                <Route path="/events" element={<Events />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/account-settings" element={<AccountSettings />} />
                {role === UserRole.HR && <Route path="/settings" element={<Settings />} />}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
