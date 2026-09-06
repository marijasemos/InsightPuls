
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  User,
  Heart,
  FileCheck,
  Files,
  TrendingUp,
  History,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  FileText,
  BadgeCheck,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Download,
  UserCog,
  DollarSign,
  GraduationCap,
  Award,
  PenLine,
  Star,
  Plus,
  X,
  Printer,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useApp, buildOffboardingTasks } from '../App';
import { UserRole, User as UserType, OffboardingCase } from '../types';
import { EmployeeService } from '../services/api';
import EditProfileModal, { EditProfileFormValues, OffboardingSubmission } from '../components/EditProfileModal';
import GenerateAnnexModal, { AnnexGenerationResult } from '../components/GenerateAnnexModal';

type ProfileExtra = {
  bio: string;
  location: string;
  officeLabel: string;
  manager: string;
  phone: string;
  employmentType: string;
  nextLeave: string;
  lastMood: string;
};

const PROFILE_EXTRAS: Record<string, ProfileExtra> = {
  '1': {
    bio: 'Leading the design initiatives for the core product experience. Focus on accessibility and user-centric workflows.',
    location: 'London, UK (Remote)',
    officeLabel: 'London Office',
    manager: 'Alex Rivera',
    phone: '+44 20 7946 0123',
    employmentType: 'Permanent Full-time',
    nextLeave: 'Winter Break (Dec 22 - Jan 2)',
    lastMood: '"Feeling productive today!" • Oct 25',
  },
  '2': {
    bio: 'Owns the core backend services and API architecture, focused on scalability and reliability of the platform.',
    location: 'Berlin, Germany (Hybrid)',
    officeLabel: 'Berlin Office',
    manager: 'Priya Nair',
    phone: '+49 30 1234 5678',
    employmentType: 'Permanent Full-time',
    nextLeave: 'No upcoming leave scheduled',
    lastMood: '"Backend migration on track." • Oct 22',
  },
  '3': {
    bio: 'Ensures product quality through rigorous manual and automated testing across the release pipeline.',
    location: 'Austin, TX (On-site)',
    officeLabel: 'Austin Office',
    manager: 'Alex Rivera',
    phone: '+1 512 555 0148',
    employmentType: 'Permanent Full-time',
    nextLeave: 'Medical Leave (Returning Nov 5)',
    lastMood: '"Taking things one day at a time." • Oct 18',
  },
};

const DEFAULT_EXTRA: ProfileExtra = {
  bio: 'No additional bio information has been added yet.',
  location: 'Not specified',
  officeLabel: 'Not specified',
  manager: 'Not assigned',
  phone: 'Not provided',
  employmentType: 'Not specified',
  nextLeave: 'No upcoming leave scheduled',
  lastMood: 'No mood entries yet',
};

const ANNEX_SALARY: Record<string, number> = {
  '1': 5500,
  '2': 4800,
  '3': 3200,
};
const DEFAULT_ANNEX_SALARY = 3500;

type ActiveDocument = {
  id: string;
  name: string;
  type: string;
  status: string;
  ai: string;
  createdOn?: string;
  previewHtml?: string;
};

const DEFAULT_DOCUMENTS: ActiveDocument[] = [
  { id: 'doc-1', name: 'Employment Contract - 2021', type: 'Contract', status: 'Valid', ai: 'Compliant' },
  { id: 'doc-2', name: 'Remote Work Policy Annex', type: 'Annex', status: 'Valid', ai: 'Compliant' },
  { id: 'doc-3', name: 'NDA & IP Agreement', type: 'Policy', status: 'Signed', ai: 'Needs Review' },
];

type ChangeEntry = { type: string; detail: string; date: string };

const DEFAULT_CHANGE_HISTORY: ChangeEntry[] = [
  { type: 'Salary Adjustment', detail: '+12% Performance increase', date: 'Jan 2023' },
  { type: 'Seniority Upgrade', detail: 'Mid to Senior transition', date: 'Jan 2023' },
  { type: 'Team Change', detail: 'Moved to Creative Team', date: 'Aug 2022' },
];

const STATUS_STYLES: Record<string, string> = {
  'Active': 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
  'On Leave': 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  'Sick': 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400',
  'Offboarding': 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300',
};

const toInputDate = (isoOrDate: string) => {
  const parsed = new Date(isoOrDate);
  if (isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

const formatJoinDate = (isoDate: string) => {
  const parsed = new Date(isoDate);
  if (isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

type Tab = 'Overview' | 'Feedback & Mood' | 'Evaluations' | 'Documents' | 'Career' | 'Timeline';

type Evaluation = {
  period: string;
  score: string;
  date: string;
  evaluator: string;
  strengths: string;
  improvements: string;
  summary: string;
};

const evaluations: Evaluation[] = [
  {
    period: 'Q3 2024 Review',
    score: '4.8 / 5',
    date: 'Oct 3, 2024',
    evaluator: 'Alex Rivera',
    summary: 'Continues to exceed expectations, driving the redesign of the core product experience with strong cross-team collaboration.',
    strengths: 'Accessibility-first design decisions, mentoring junior designers, stakeholder communication.',
    improvements: 'Delegate more low-impact tasks to free up time for strategic initiatives.',
  },
  {
    period: 'Q2 2024 Review',
    score: '4.5 / 5',
    date: 'Jul 5, 2024',
    evaluator: 'Alex Rivera',
    summary: 'Consistent, high-quality output on the Q2 roadmap items. Strong ownership of the onboarding flow redesign.',
    strengths: 'Attention to detail, proactive problem solving, reliable delivery timelines.',
    improvements: 'Increase visibility of work-in-progress through more frequent async updates.',
  },
  {
    period: 'Annual Review 2023',
    score: '4.6 / 5',
    date: 'Jan 20, 2024',
    evaluator: 'Alex Rivera',
    summary: 'A strong year overall, marked by the promotion to Senior Product Designer and leadership on the accessibility initiative.',
    strengths: 'Design systems thinking, user-centric workflows, leadership readiness.',
    improvements: 'Continue building experience with data-driven design validation.',
  },
  {
    period: 'Q3 2023 Review',
    score: '4.2 / 5',
    date: 'Oct 4, 2023',
    evaluator: 'Maria Chen',
    summary: 'Solid execution on the Creative Team backlog with good collaboration across engineering.',
    strengths: 'Collaboration, responsiveness to feedback, visual craft.',
    improvements: 'Push back earlier on scope creep during design reviews.',
  },
];

const EmployeeProfile: React.FC = () => {
  const { role, addOffboardingCase, branding } = useApp();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [employee, setEmployee] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [extraOverride, setExtraOverride] = useState<Partial<ProfileExtra>>({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [annexModalOpen, setAnnexModalOpen] = useState(false);
  const [documents, setDocuments] = useState<ActiveDocument[]>(DEFAULT_DOCUMENTS);
  const [changeHistory, setChangeHistory] = useState<ChangeEntry[]>(DEFAULT_CHANGE_HISTORY);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setActiveTab('Overview');
    setExtraOverride({});
    setDocuments(DEFAULT_DOCUMENTS);
    setChangeHistory(DEFAULT_CHANGE_HISTORY);
    EmployeeService.getById(id ?? '1').then((data) => {
      if (active) {
        setEmployee(data);
        setIsLoading(false);
      }
    });
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const isOwnProfile = id === 'me';
  const canManage = role === UserRole.HR && !isOwnProfile;

  const tabs: Tab[] = ['Overview', 'Feedback & Mood', 'Evaluations', 'Documents', 'Career'];
  if (canManage) tabs.push('Timeline');

  if (isLoading || !employee) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Loading Profile...</p>
      </div>
    );
  }

  const extra: ProfileExtra = { ...(PROFILE_EXTRAS[employee.id] ?? DEFAULT_EXTRA), ...extraOverride };
  const firstName = employee.name.split(' ')[0];

  const handleProfileSave = (values: EditProfileFormValues) => {
    const updated = EmployeeService.update(employee.id, {
      name: values.name,
      position: values.position,
      team: values.team,
      status: values.status,
      joinDate: values.joinDate,
      avatar: values.avatar || employee.avatar,
      email: values.email,
    });
    setEmployee(updated);
    setExtraOverride((prev) => ({
      ...prev,
      bio: values.bio,
      location: values.location,
      manager: values.manager,
      phone: values.phone,
      officeLabel: values.officeLabel,
      employmentType: values.employmentType,
    }));
    setEditModalOpen(false);
    setToast('Profile updated successfully');
  };

  const handleOffboardingConfirm = (submission: OffboardingSubmission) => {
    const updated = EmployeeService.update(employee.id, { status: 'Offboarding' });
    setEmployee(updated);
    const newCase: OffboardingCase = {
      id: `off-${employee.id}-${Date.now()}`,
      name: employee.name,
      position: employee.position,
      lastDay: formatJoinDate(submission.lastDay) || submission.lastDay,
      type: submission.reason,
      progress: 0,
      status: 'Documentation',
      tasks: buildOffboardingTasks(),
    };
    addOffboardingCase(newCase);
    setEditModalOpen(false);
    setToast('Employee moved to Offboarding Tracking');
  };

  const handleAnnexGenerate = (result: AnnexGenerationResult) => {
    setDocuments((prev) => [
      {
        id: `doc-annex-${Date.now()}`,
        name: result.documentName,
        type: 'Annex',
        status: 'Pending Signature',
        ai: 'Needs Review',
        createdOn: result.createdOn,
        previewHtml: result.previewHtml,
      },
      ...prev,
    ]);
    if (result.careerEntry) {
      setChangeHistory((prev) => [result.careerEntry as ChangeEntry, ...prev]);
    }
    setAnnexModalOpen(false);
    setActiveTab('Overview');
    setToast('Annex generated and sent for signature.');
  };

  const handleDownloadDocument = (doc: ActiveDocument) => {
    if (!doc.previewHtml) return;
    const blob = new Blob([doc.previewHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 dark:bg-none dark:bg-slate-900"></div>
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row items-end gap-6 -mt-12">
            <img
              src={employee.avatar}
              alt={employee.name}
              className="h-32 w-32 rounded-2xl border-4 border-white dark:border-slate-900 shadow-lg object-cover"
            />
            <div className="flex-1 pb-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{employee.name}</h1>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">{employee.position} • {employee.team} Team</p>
                </div>
                <div className="flex gap-2">
                  {canManage && (
                    <button
                      onClick={() => setAnnexModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Generate Annex
                    </button>
                  )}
                  <button
                    onClick={() => setEditModalOpen(true)}
                    className="px-4 py-2 border dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400">
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold ${STATUS_STYLES[employee.status] ?? 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  <div className="h-1.5 w-1.5 rounded-full bg-current"></div>
                  {employee.status}
                </span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Joined {formatJoinDate(employee.joinDate)}</span>
                {canManage && (
                  <>
                    <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {extra.employmentType}</span>
                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> Manager: {extra.manager}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-8 border-t dark:border-slate-800 flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'Overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm">
                <h3 className="font-bold mb-4 text-slate-800 dark:text-white">Personal Summary</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Bio</p>
                    <p className="text-sm mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                      {extra.bio}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-slate-800">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Location</p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{extra.location}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Direct Lead</p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{extra.manager}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm">
                <h3 className="font-bold mb-4 text-slate-800 dark:text-white">Current Status</h3>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl">
                    <p className="text-xs text-blue-700 dark:text-blue-400 font-bold uppercase">Next Leave</p>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mt-1">{extra.nextLeave}</p>
                  </div>
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl">
                    <p className="text-xs text-indigo-700 dark:text-indigo-400 font-bold uppercase">Last Mood Entry</p>
                    <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mt-1">{extra.lastMood}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Feedback & Mood' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 dark:text-white">Feedback History</h3>
                  <button className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium">Add New</button>
                </div>
                <div className="space-y-4">
                  {[
                    { text: 'Great coordination on the latest release.', date: 'Oct 15', from: 'Self' },
                    { text: 'Excellent presentation at the design critique.', date: 'Sep 28', from: 'Manager' },
                  ].map((f, i) => (
                    <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">{f.from}</span>
                        <span className="text-xs text-slate-400">{f.date}</span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{f.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Documents' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 dark:text-white">Active Documents</h3>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                      <Download className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-4 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">{doc.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {doc.type}{doc.createdOn ? ` • Created ${doc.createdOn}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {canManage && (
                          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${doc.ai === 'Compliant' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'}`}>
                            <Sparkles className="h-3 w-3" /> AI: {doc.ai}
                          </div>
                        )}
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                          <BadgeCheck className="h-4 w-4 text-blue-500" /> {doc.status}
                        </span>
                        {doc.previewHtml && (
                          <button
                            onClick={() => handleDownloadDocument(doc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-all"
                            title="Download mock PDF"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                        <button className="text-xs font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">View</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <h3 className="font-bold text-slate-800 dark:text-white">Signature History</h3>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-3">File Name</th>
                        <th className="px-6 py-3">Signed On</th>
                        <th className="px-6 py-3">Method</th>
                        <th className="px-6 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {[
                        { file: 'Annual Bonus Plan 2023', date: 'Jan 15, 2023', method: 'Digital ID' },
                        { file: 'Equipment Handover Form', date: 'Mar 12, 2021', method: 'Digital ID' },
                      ].map((sig, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">{sig.file}</td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">{sig.date}</td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">{sig.method}</td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-xs">Download PDF</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Career' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <ArrowUpRight className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Career Path
                  </h3>
                  <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                    {[
                      { title: 'Senior Product Designer', date: 'Mar 2023 - Present', status: 'Current' },
                      { title: 'Product Designer', date: 'Mar 2021 - Feb 2023', status: 'Past' },
                    ].map((step, i) => (
                      <div key={i} className="relative">
                        <div className={`absolute -left-[21px] top-1.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 shadow-sm ${step.status === 'Current' ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{step.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{step.date}</p>
                          {step.status === 'Current' && (
                            <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded uppercase">Promoted</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {canManage && (
                    <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">AI Career Suggestion</p>
                        <p className="text-xs text-indigo-900 dark:text-indigo-200 mt-1">
                          Based on 2.5 years of experience and high project ratings, {firstName} is ready for a <span className="font-bold">Design Lead</span> track by Q3 2024.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm overflow-hidden">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <History className="h-5 w-5 text-slate-400" /> Changes History
                  </h3>
                  <div className="space-y-4">
                    {changeHistory.map((change, i) => (
                      <div key={i} className="flex items-start justify-between gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">{change.type}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{change.detail}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{change.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'Evaluations' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" /> Performance Evaluations
                  </h3>
                  {canManage && (
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
                      <Plus className="h-3.5 w-3.5" /> New Evaluation
                    </button>
                  )}
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {evaluations.map((ev, i) => (
                    <div key={i} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                          <Star className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">{ev.period}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Evaluated by {ev.evaluator} • {ev.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold">{ev.score}</span>
                        <button
                          onClick={() => setSelectedEvaluation(ev)}
                          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                        >
                          <FileText className="h-3.5 w-3.5" /> View PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Timeline' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <History className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Employee Timeline
                </h3>
                <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                  {[
                    { icon: PenLine, color: 'bg-indigo-500', title: 'Annex Signed', desc: 'Remote Work Policy Annex signed digitally.', date: 'Mar 4, 2024' },
                    { icon: Award, color: 'bg-pink-500', title: 'Kudos Received', desc: '"Excellent presentation at the design critique." — Maria Chen', date: 'Sep 28, 2023' },
                    { icon: UserCog, color: 'bg-blue-600', title: 'Position Change', desc: 'Promoted from Product Designer to Senior Product Designer.', date: 'Mar 1, 2023' },
                    { icon: DollarSign, color: 'bg-emerald-500', title: 'Salary Increase', desc: '+12% performance-based salary adjustment.', date: 'Jan 15, 2023' },
                    { icon: Award, color: 'bg-pink-500', title: 'Kudos Received', desc: '"Great coordination on the latest release." — Alex Rivera', date: 'Aug 10, 2022' },
                    { icon: GraduationCap, color: 'bg-purple-500', title: 'Onboarding Completed', desc: 'Finished onboarding program and probation period.', date: 'Jun 12, 2021' },
                  ].map((ev, i) => (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[29px] top-0 h-8 w-8 rounded-full ${ev.color} flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm`}>
                        <ev.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{ev.title}</p>
                          <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{ev.date}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{ev.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm">
            <h3 className="font-bold mb-4 text-slate-800 dark:text-white">Contact Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Mail className="h-4 w-4" /> {employee.email}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Phone className="h-4 w-4" /> {extra.phone}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <MapPin className="h-4 w-4" /> {extra.officeLabel}
              </div>
            </div>
          </div>

          {canManage && (
            <div className="bg-slate-900 p-6 rounded-2xl text-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                <h3 className="font-bold">AI Insight Panel</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Risk Indicator</p>
                  <p className="text-sm font-semibold text-emerald-400">Low Risk</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Analysis</p>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    Consistent positive mood entries and strong feedback loops. No signs of burnout or disengagement detected.
                  </p>
                </div>
                <button className="w-full py-2 bg-white/10 rounded-lg text-xs font-medium hover:bg-white/20">
                  Recommended Action: No Action
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="text-center py-8">
        <p className="text-xs text-slate-400">
          Your personal feedback and mood entries are private.
          AI insights are used only to support HR decisions and are never shared with other employees.
        </p>
      </footer>

      {/* Modal / Overlay for Evaluation PDF */}
      {selectedEvaluation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-4 text-white">
                <Printer className="h-5 w-5 cursor-pointer hover:text-blue-400" />
                <Download className="h-5 w-5 cursor-pointer hover:text-blue-400" />
                <Mail className="h-5 w-5 cursor-pointer hover:text-blue-400" />
              </div>
              <button
                onClick={() => setSelectedEvaluation(null)}
                className="h-10 w-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="bg-white text-slate-900 p-8 md:p-12 shadow-2xl rounded-sm border border-slate-200 font-mono">
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">InsightPro Corp.</h2>
                  <p className="text-xs mt-1 text-slate-500">123 Innovation Drive, Tech City</p>
                  <p className="text-xs text-slate-500">HR Department: hr@insightpro.com</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-black uppercase">Evaluation</h3>
                  <p className="text-xs font-bold text-slate-500">{selectedEvaluation.period}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-10">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Employee</p>
                  <p className="text-sm font-black">{employee.name}</p>
                  <p className="text-xs text-slate-500">{employee.position} • {employee.team} Team</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Evaluated By</p>
                  <p className="text-sm font-black">{selectedEvaluation.evaluator}</p>
                  <p className="text-xs text-slate-500">{selectedEvaluation.date}</p>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-6 flex justify-between items-center rounded-sm mb-10">
                <span className="text-sm font-black uppercase tracking-widest">Overall Score</span>
                <span className="text-2xl font-black">{selectedEvaluation.score}</span>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Summary</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedEvaluation.summary}</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Key Strengths</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedEvaluation.strengths}</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Areas for Improvement</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedEvaluation.improvements}</p>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-dashed border-slate-200 text-center">
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  This is a computer-generated document and does not require a physical signature.<br/>
                  Confidentiality Notice: This evaluation is for the intended recipient and HR only.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {editModalOpen && (
        <EditProfileModal
          employeeId={employee.id}
          initialValues={{
            avatar: employee.avatar,
            name: employee.name,
            position: employee.position,
            team: employee.team,
            status: employee.status === 'Offboarding' ? 'Active' : employee.status,
            joinDate: toInputDate(employee.joinDate),
            employmentType: extra.employmentType,
            manager: extra.manager,
            bio: extra.bio,
            location: extra.location,
            email: employee.email,
            phone: extra.phone,
            officeLabel: extra.officeLabel,
          }}
          onClose={() => setEditModalOpen(false)}
          onSave={handleProfileSave}
          onConfirmOffboarding={handleOffboardingConfirm}
        />
      )}

      {annexModalOpen && (
        <GenerateAnnexModal
          employee={{
            id: employee.id,
            name: employee.name,
            position: employee.position,
            seniority: employee.seniority,
            team: employee.team,
            avatar: employee.avatar,
          }}
          currentSalary={ANNEX_SALARY[employee.id] ?? DEFAULT_ANNEX_SALARY}
          currentEmploymentType={extra.employmentType}
          companyName={branding.productName || 'InsightPro'}
          companyLogo={branding.logoLight || undefined}
          onClose={() => setAnnexModalOpen(false)}
          onGenerate={handleAnnexGenerate}
        />
      )}

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[80] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-bold">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProfile;
