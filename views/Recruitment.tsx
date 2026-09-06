
import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  Calendar,
  MapPin,
  Plus,
  X,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Star,
  FileText,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { PipelineStage, JobOpening, Candidate, CandidateNote, TalentPoolCandidate } from '../types';

/* ------------------------------------------------------------------ */
/* Shared style tokens                                                 */
/* ------------------------------------------------------------------ */

const labelCls = 'text-xs font-bold text-slate-400 uppercase mb-1.5 block';
const inputCls = 'w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-blue-500 focus:ring-0 text-sm p-3 text-slate-900 dark:text-white transition-colors';

const STAGE_META: { key: PipelineStage; label: string; color: string }[] = [
  { key: 'Applied', label: 'Applied', color: 'bg-blue-500' },
  { key: 'Phone Screen', label: 'Phone Screen', color: 'bg-violet-500' },
  { key: 'Technical', label: 'Technical', color: 'bg-orange-500' },
  { key: 'HR Interview', label: 'HR Interview', color: 'bg-emerald-500' },
  { key: 'Offer Sent', label: 'Offer Sent', color: 'bg-sky-400' },
];

const STATUS_BADGE: Record<JobOpening['status'], string> = {
  Active: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  Draft: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  Closed: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
};

const AVATAR_PALETTE = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-orange-500', 'bg-rose-500', 'bg-cyan-500', 'bg-amber-500', 'bg-indigo-500'];

const avatarColor = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash << 5) - hash + seed.charCodeAt(i);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

const formatDate = (iso: string) => {
  const parsed = new Date(iso);
  if (isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const buildHistory = (appliedDate: string, finalStage: PipelineStage): { stage: PipelineStage; date: string }[] => {
  const idx = STAGE_META.findIndex((s) => s.key === finalStage);
  const start = new Date(appliedDate);
  return STAGE_META.slice(0, idx + 1).map((s, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i * 4);
    return { stage: s.key, date: d.toISOString().slice(0, 10) };
  });
};

let candCounter = 1;
const makeCandidate = (
  name: string,
  email: string,
  stage: PipelineStage,
  rating: number,
  skills: string[],
  appliedDate: string,
  notes: CandidateNote[] = []
): Candidate => ({
  id: `cand-${candCounter++}`,
  name,
  email,
  phone: '+1 555 010 ' + (1000 + candCounter),
  rating,
  stage,
  appliedDate,
  skills,
  resumeUrl: '#',
  notes,
  history: buildHistory(appliedDate, stage),
});

const INITIAL_JOBS: JobOpening[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote',
    employmentType: 'Full-time',
    status: 'Active',
    postedDate: '2026-08-10',
    description: "We're looking for a Senior Frontend Engineer to help lead the next generation of our employee experience platform. You'll work closely with product and design to ship polished, accessible interfaces at scale.",
    requirements: [
      '5+ years of experience with React and modern JavaScript',
      'Strong understanding of TypeScript and component architecture',
      'Experience with REST and GraphQL APIs',
      'Familiarity with CI/CD pipelines and automated testing',
    ],
    requiredSkills: ['React', 'TypeScript', 'GraphQL', 'Next.js', 'Testing'],
    candidates: [
      makeCandidate('Ana Petrović', 'ana.petrovic@mail.com', 'Applied', 4, ['React', 'TypeScript', 'CSS'], '2026-08-15'),
      makeCandidate('Marko Ilić', 'marko.ilic@mail.com', 'Applied', 3, ['React', 'JavaScript'], '2026-08-16'),
      makeCandidate('Elena Popov', 'elena.popov@mail.com', 'Applied', 5, ['React', 'TypeScript', 'GraphQL'], '2026-08-17'),
      makeCandidate('Daniel Cruz', 'daniel.cruz@mail.com', 'Phone Screen', 4, ['TypeScript', 'Next.js'], '2026-08-12'),
      makeCandidate('Priya Shah', 'priya.shah@mail.com', 'Phone Screen', 4, ['React', 'GraphQL', 'Testing'], '2026-08-13'),
      makeCandidate('Tom Becker', 'tom.becker@mail.com', 'Technical', 5, ['React', 'TypeScript', 'Next.js', 'GraphQL'], '2026-08-08', [
        { author: 'Alex Rivera', date: '2026-08-20', text: 'Strong system design instincts, very clean whiteboard walkthrough. Recommend advancing.' },
      ]),
      makeCandidate('Lucas Meyer', 'lucas.meyer@mail.com', 'HR Interview', 4, ['React', 'TypeScript'], '2026-08-05'),
      makeCandidate('Nina Kovač', 'nina.kovac@mail.com', 'Offer Sent', 5, ['React', 'TypeScript', 'GraphQL', 'Testing'], '2026-07-28', [
        { author: 'Priya Nair', date: '2026-08-02', text: 'Excellent communicator, past experience is a great fit for the design-system rebuild.' },
        { author: 'HR Team', date: '2026-08-18', text: 'References checked, no concerns. Offer approved by leadership.' },
      ]),
    ],
  },
  {
    id: 'job-2',
    title: 'Product Designer',
    department: 'Design',
    location: 'Belgrade, Serbia (Hybrid)',
    employmentType: 'Full-time',
    status: 'Active',
    postedDate: '2026-08-20',
    description: 'Join our design team to shape the visual language and user experience of InsightPro across web and mobile.',
    requirements: [
      '3+ years of product design experience in SaaS',
      'Strong portfolio demonstrating end-to-end design process',
      'Proficiency in Figma and design systems',
    ],
    requiredSkills: ['Figma', 'UX Research', 'Design Systems'],
    candidates: [
      makeCandidate('Sofia Ramirez', 's.ramirez@mail.com', 'Applied', 3, ['Figma', 'UI Design'], '2026-08-24'),
      makeCandidate('Jonas Weber', 'jonas.weber@mail.com', 'Phone Screen', 4, ['Figma', 'Design Systems'], '2026-08-22'),
      makeCandidate('Mia Larsen', 'mia.larsen@mail.com', 'Technical', 4, ['Figma', 'UX Research', 'Design Systems'], '2026-08-15'),
      makeCandidate('Owen Clarke', 'owen.clarke@mail.com', 'HR Interview', 5, ['Figma', 'UX Research'], '2026-08-10'),
    ],
  },
  {
    id: 'job-3',
    title: 'Data Analyst',
    department: 'Analytics',
    location: 'Remote',
    employmentType: 'Contract',
    status: 'Draft',
    postedDate: '2026-09-01',
    description: "We're hiring a Data Analyst to support workforce analytics and build reporting dashboards for HR leadership.",
    requirements: [
      "Bachelor's degree in Statistics, Mathematics or a related field",
      'Advanced SQL and data visualization skills (Tableau or Power BI)',
      'Experience with Python for data analysis',
    ],
    requiredSkills: ['SQL', 'Python', 'Tableau'],
    candidates: [],
  },
  {
    id: 'job-4',
    title: 'Customer Support Specialist',
    department: 'Customer Success',
    location: 'Belgrade, Serbia',
    employmentType: 'Full-time',
    status: 'Closed',
    postedDate: '2026-06-01',
    description: 'This role has been filled. Kept here for historical reference and reporting.',
    requirements: [
      '2+ years in a customer-facing support role',
      'Excellent written and verbal communication in English',
      'Experience with helpdesk tools (Zendesk, Intercom)',
    ],
    requiredSkills: ['Communication', 'Zendesk'],
    candidates: [],
  },
];

const TALENT_POOL: TalentPoolCandidate[] = [
  { id: 'pool-1', name: 'Ivan Novak', email: 'ivan.novak@mail.com', skills: ['React', 'TypeScript', 'GraphQL', 'Node.js'] },
  { id: 'pool-2', name: 'Hana Kim', email: 'hana.kim@mail.com', skills: ['Figma', 'UX Research', 'UI Design'] },
  { id: 'pool-3', name: 'Leo Fischer', email: 'leo.fischer@mail.com', skills: ['React', 'Next.js', 'Testing'] },
  { id: 'pool-4', name: 'Zara Ahmed', email: 'zara.ahmed@mail.com', skills: ['SQL', 'Python', 'Tableau'] },
  { id: 'pool-5', name: 'Ben Turner', email: 'ben.turner@mail.com', skills: ['React', 'TypeScript', 'Design Systems'] },
];

const FILTERS: ('All' | JobOpening['status'])[] = ['All', 'Active', 'Draft', 'Closed'];
const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Analytics', 'Customer Success', 'Sales & Marketing', 'Finance', 'Human Resources', 'Legal & Compliance'];
const EMPLOYMENT_TYPES: JobOpening['employmentType'][] = ['Full-time', 'Part-time', 'Contract', 'Remote'];

/* ------------------------------------------------------------------ */
/* Small shared components                                             */
/* ------------------------------------------------------------------ */

const StarRow: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} className={`h-3.5 w-3.5 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
    ))}
  </div>
);

const StatCard: React.FC<{ icon: React.ElementType; label: string; value: number; color: string }> = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white dark:bg-slate-900 rounded-[2rem] border dark:border-slate-800 shadow-sm p-6 flex items-center gap-4">
    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  </div>
);

const SkillChip: React.FC<{ label: string }> = ({ label }) => (
  <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
    {label}
  </span>
);

const JobCard: React.FC<{ job: JobOpening; onOpen: () => void }> = ({ job, onOpen }) => (
  <div
    onClick={onOpen}
    className={`bg-white dark:bg-slate-900 rounded-[2rem] border dark:border-slate-800 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col ${
      job.status === 'Draft' ? 'border-l-4 border-l-amber-400 dark:border-l-amber-500' : ''
    }`}
  >
    <div className="p-6 space-y-4 flex-1">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            {job.department}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            <MapPin className="h-3 w-3" /> {job.location}
          </span>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shrink-0 ${STATUS_BADGE[job.status]}`}>
          {job.status}
        </span>
      </div>

      <div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">{job.title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{job.description}</p>
      </div>

      <div className="flex items-center gap-1.5">
        {STAGE_META.map((s) => {
          const count = job.candidates.filter((c) => c.stage === s.key).length;
          return (
            <div
              key={s.key}
              title={s.label}
              className={`h-6 min-w-[1.5rem] px-1.5 rounded-full flex items-center justify-center text-[10px] font-black text-white ${s.color}`}
            >
              {count}
            </div>
          );
        })}
      </div>
    </div>

    <div className="px-6 py-4 border-t dark:border-slate-800 flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
        <Users className="h-4 w-4" />
        <span className="text-sm font-bold">{job.candidates.length}</span>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onOpen(); }}
        className="text-xs font-black text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
      >
        View Pipeline <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  </div>
);

const CandidateCard: React.FC<{
  candidate: Candidate;
  onViewProfile: () => void;
  onAdvance: () => void;
  onReject: () => void;
}> = ({ candidate, onViewProfile, onAdvance, onReject }) => {
  const stageIdx = STAGE_META.findIndex((s) => s.key === candidate.stage);
  const isLast = stageIdx === STAGE_META.length - 1;
  const nextLabel = isLast ? 'Mark as Hired' : STAGE_META[stageIdx + 1].label;

  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 border dark:border-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 ${avatarColor(candidate.id)}`}>
          {initials(candidate.name)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{candidate.name}</p>
          <p className="text-[11px] text-slate-400 truncate">{candidate.email}</p>
        </div>
      </div>
      <StarRow rating={candidate.rating} />
      <button
        onClick={onViewProfile}
        className="w-full py-2 border dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all"
      >
        View Profile
      </button>
      <div className="flex gap-2">
        <button
          onClick={onAdvance}
          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all ${
            isLast ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLast ? nextLabel : `→ ${nextLabel}`}
        </button>
        <button
          onClick={onReject}
          className="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-rose-600 hover:bg-rose-700 transition-all"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Create Job Modal                                                    */
/* ------------------------------------------------------------------ */

interface CreateJobModalProps {
  onClose: () => void;
  onCreate: (data: {
    title: string;
    department: string;
    location: string;
    employmentType: JobOpening['employmentType'];
    description: string;
    requirements: string[];
    status: 'Draft' | 'Active';
  }) => void;
}

const CreateJobModal: React.FC<CreateJobModalProps> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState<JobOpening['employmentType']>('Full-time');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Active'>('Draft');
  const [requirements, setRequirements] = useState<string[]>([]);
  const [reqInput, setReqInput] = useState('');

  const addRequirement = () => {
    const val = reqInput.trim();
    if (!val) return;
    setRequirements((prev) => [...prev, val]);
    setReqInput('');
  };
  const removeRequirement = (idx: number) => setRequirements((prev) => prev.filter((_, i) => i !== idx));

  const canSubmit = title.trim() && department && location.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    onCreate({ title: title.trim(), department, location: location.trim(), employmentType, description: description.trim(), requirements, status });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 pt-7 pb-5 border-b dark:border-slate-800 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Job Opening</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Post a new role. Changes are saved locally for this demo.</p>
          </div>
          <button onClick={onClose} className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
          <div>
            <label className={labelCls}>Position Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="e.g. Senior Frontend Engineer" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Department</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className={`${inputCls} appearance-none cursor-pointer`}>
                <option value="">Select a department...</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} placeholder="e.g. Remote / Belgrade" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Employment Type</label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as JobOpening['employmentType'])}
              className={`${inputCls} appearance-none cursor-pointer`}
            >
              {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Short summary of the role..."
            />
          </div>

          <div>
            <label className={labelCls}>Requirements</label>
            <div className="flex gap-2 mt-1">
              <input
                value={reqInput}
                onChange={(e) => setReqInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRequirement(); } }}
                className={inputCls}
                placeholder="e.g. 3+ years of experience with React"
              />
              <button onClick={addRequirement} type="button" className="px-4 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-sm font-black hover:opacity-90 shrink-0">
                Add
              </button>
            </div>
            {requirements.length > 0 && (
              <ul className="mt-3 space-y-2">
                {requirements.map((r, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-2.5">
                    <span className="text-sm text-slate-700 dark:text-slate-200">{r}</span>
                    <button onClick={() => removeRequirement(i)} className="text-slate-400 hover:text-rose-600 transition-colors shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className={labelCls}>Status</label>
            <div className="flex gap-2 mt-1">
              {(['Draft', 'Active'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
                    status === s
                      ? s === 'Active'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border dark:border-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-8 py-5 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 border dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" /> Create Job Opening
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Candidate Profile Modal                                             */
/* ------------------------------------------------------------------ */

type ProfileTarget =
  | { type: 'pipeline'; jobId: string; candidateId: string }
  | { type: 'pool'; jobId: string; poolId: string };

const CandidateProfileModal: React.FC<{
  target: ProfileTarget;
  candidate: Candidate | null;
  pool: TalentPoolCandidate | null;
  onClose: () => void;
  onAddToPipeline: () => void;
}> = ({ target, candidate, pool, onClose, onAddToPipeline }) => {
  const person = target.type === 'pipeline' ? candidate : pool;
  if (!person) return null;

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg max-h-[88vh] flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b dark:border-slate-800 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white font-black shrink-0 ${avatarColor(person.id)}`}>
              {initials(person.name)}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">{person.name}</h3>
              <p className="text-xs text-slate-500 truncate">{person.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {target.type === 'pipeline' && candidate && (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className={labelCls}>Phone</p>
                  <p className="font-bold text-slate-800 dark:text-white mt-1">{candidate.phone}</p>
                </div>
                <div>
                  <p className={labelCls}>Applied</p>
                  <p className="font-bold text-slate-800 dark:text-white mt-1">{formatDate(candidate.appliedDate)}</p>
                </div>
              </div>

              <div>
                <p className={labelCls}>Resume / CV</p>
                <a href={candidate.resumeUrl} className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-bold mt-1">
                  <FileText className="h-4 w-4" /> View CV
                </a>
              </div>

              {candidate.skills.length > 0 && (
                <div>
                  <p className={labelCls}>Skills</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {candidate.skills.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className={labelCls}>Stage History</p>
                <div className="space-y-2.5 mt-2">
                  {candidate.history.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${STAGE_META.find((s) => s.key === h.stage)?.color}`} />
                      <span className="font-bold text-slate-800 dark:text-white">{h.stage}</span>
                      <span className="text-slate-400 ml-auto text-xs">{formatDate(h.date)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {candidate.notes.length > 0 && (
                <div>
                  <p className={labelCls}>Interviewer Notes</p>
                  <div className="space-y-3 mt-2">
                    {candidate.notes.map((n, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5">
                        <p className="text-sm text-slate-600 dark:text-slate-300">{n.text}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1.5">{n.author} • {formatDate(n.date)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {target.type === 'pool' && pool && (
            <div>
              <p className={labelCls}>Skills</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {pool.skills.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
          {target.type === 'pool' && (
            <button onClick={onAddToPipeline} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-all">
              <UserPlus className="h-4 w-4" /> Add to Pipeline
            </button>
          )}
          <button onClick={onClose} className="px-5 py-2.5 border dark:border-slate-700 rounded-xl text-sm font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Reject Confirmation Modal                                           */
/* ------------------------------------------------------------------ */

const RejectConfirmModal: React.FC<{ name: string; onCancel: () => void; onConfirm: () => void }> = ({ name, onCancel, onConfirm }) => (
  <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
    <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-8 text-center space-y-5 animate-in zoom-in-95 duration-300">
      <div className="h-14 w-14 mx-auto rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
        <X className="h-7 w-7" />
      </div>
      <div>
        <h3 className="font-black text-lg text-slate-900 dark:text-white">Reject Candidate?</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Are you sure you want to reject <strong className="text-slate-700 dark:text-slate-200">{name}</strong>? This will remove them from the pipeline.
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-3 border dark:border-slate-700 rounded-xl text-sm font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          Cancel
        </button>
        <button onClick={onConfirm} className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-sm font-black hover:bg-rose-700 transition-all">
          Reject
        </button>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Main view                                                            */
/* ------------------------------------------------------------------ */

const Recruitment: React.FC = () => {
  const [jobs, setJobs] = useState<JobOpening[]>(INITIAL_JOBS);
  const [statusFilter, setStatusFilter] = useState<'All' | JobOpening['status']>('All');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [profileTarget, setProfileTarget] = useState<ProfileTarget | null>(null);
  const [rejectTarget, setRejectTarget] = useState<{ jobId: string; candidateId: string; name: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || null;
  const filteredJobs = statusFilter === 'All' ? jobs : jobs.filter((j) => j.status === statusFilter);

  const totalOpenings = jobs.length;
  const activeCandidates = jobs.reduce((sum, j) => sum + j.candidates.length, 0);
  const interviewsThisWeek = jobs.reduce(
    (sum, j) => sum + j.candidates.filter((c) => ['Phone Screen', 'Technical', 'HR Interview'].includes(c.stage)).length,
    0
  );

  const handleCreateJob = (data: {
    title: string;
    department: string;
    location: string;
    employmentType: JobOpening['employmentType'];
    description: string;
    requirements: string[];
    status: 'Draft' | 'Active';
  }) => {
    const newJob: JobOpening = {
      ...data,
      id: `job-${Date.now()}`,
      postedDate: new Date().toISOString().slice(0, 10),
      candidates: [],
      requiredSkills: [],
    };
    setJobs((prev) => [newJob, ...prev]);
    setShowCreateModal(false);
    setToast('Job opening created');
  };

  const advanceCandidate = (jobId: string, candidateId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    const candidate = job?.candidates.find((c) => c.id === candidateId);
    if (!job || !candidate) return;
    const idx = STAGE_META.findIndex((s) => s.key === candidate.stage);
    const isLast = idx === STAGE_META.length - 1;

    if (isLast) {
      setJobs((prev) => prev.map((j) => (j.id !== jobId ? j : { ...j, candidates: j.candidates.filter((c) => c.id !== candidateId) })));
      setToast(`${candidate.name} marked as hired`);
      return;
    }

    const nextStage = STAGE_META[idx + 1].key;
    setJobs((prev) =>
      prev.map((j) =>
        j.id !== jobId
          ? j
          : {
              ...j,
              candidates: j.candidates.map((c) =>
                c.id !== candidateId
                  ? c
                  : { ...c, stage: nextStage, history: [...c.history, { stage: nextStage, date: new Date().toISOString().slice(0, 10) }] }
              ),
            }
      )
    );
    setToast(`Candidate moved to ${nextStage}`);
  };

  const confirmReject = () => {
    if (!rejectTarget) return;
    const { jobId, candidateId, name } = rejectTarget;
    setJobs((prev) => prev.map((j) => (j.id !== jobId ? j : { ...j, candidates: j.candidates.filter((c) => c.id !== candidateId) })));
    setRejectTarget(null);
    setToast(`${name} was rejected`);
  };

  const addToPipeline = (jobId: string, pool: TalentPoolCandidate) => {
    const today = new Date().toISOString().slice(0, 10);
    const newCandidate: Candidate = {
      id: `cand-${Date.now()}`,
      name: pool.name,
      email: pool.email,
      phone: '+1 555 010 2000',
      rating: 3,
      stage: 'Applied',
      appliedDate: today,
      skills: pool.skills,
      resumeUrl: '#',
      notes: [],
      history: [{ stage: 'Applied', date: today }],
    };
    setJobs((prev) => prev.map((j) => (j.id !== jobId ? j : { ...j, candidates: [...j.candidates, newCandidate] })));
    setProfileTarget(null);
    setToast(`${pool.name} added to pipeline`);
  };

  const profileCandidate =
    profileTarget?.type === 'pipeline'
      ? jobs.find((j) => j.id === profileTarget.jobId)?.candidates.find((c) => c.id === profileTarget.candidateId) || null
      : null;
  const profilePool = profileTarget?.type === 'pool' ? TALENT_POOL.find((p) => p.id === profileTarget.poolId) || null : null;

  return (
    <div className="space-y-8 pb-20">
      {!selectedJob ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Recruitment</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Applicant Tracking & Job Openings</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95 shrink-0"
            >
              <Plus className="h-4 w-4" /> Create Job Opening
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard icon={Briefcase} label="Total Openings" value={totalOpenings} color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" />
            <StatCard icon={Users} label="Active Candidates" value={activeCandidates} color="bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400" />
            <StatCard icon={Calendar} label="Interviews This Week" value={interviewsThisWeek} color="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  statusFilter === f
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-900 border dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} onOpen={() => setSelectedJobId(job.id)} />
            ))}
            {filteredJobs.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-400 font-bold">No job openings match this filter.</div>
            )}
          </div>
        </>
      ) : (
        <>
          <button
            onClick={() => setSelectedJobId(null)}
            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> All Openings
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
            {/* Left: job details */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm p-8 space-y-6 lg:sticky lg:top-24">
              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_BADGE[selectedJob.status]}`}>
                {selectedJob.status}
              </span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{selectedJob.title}</h1>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Briefcase className="h-4 w-4 text-slate-400 shrink-0" /> {selectedJob.department}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" /> {selectedJob.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" /> Posted {formatDate(selectedJob.postedDate)}
                </div>
              </div>

              <div className="border-t dark:border-slate-800 pt-6 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Description</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{selectedJob.description}</p>
              </div>

              {selectedJob.requirements.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Requirements</p>
                  <ul className="space-y-2">
                    {selectedJob.requirements.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right: pipeline */}
            <div className="space-y-8 min-w-0">
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm p-8 space-y-8">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Candidate Pipeline</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{selectedJob.candidates.length} active candidates</p>
                </div>

                {/* Stepper */}
                <div className="flex items-start">
                  {STAGE_META.map((s, i) => {
                    const count = selectedJob.candidates.filter((c) => c.stage === s.key).length;
                    return (
                      <React.Fragment key={s.key}>
                        <div className="flex flex-col items-center gap-2 w-20">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-black text-sm ${s.color}`}>{i + 1}</div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center leading-tight">{s.label}</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white">{count}</p>
                        </div>
                        {i < STAGE_META.length - 1 && <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-700 shrink-0 mt-3" />}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Kanban */}
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                  {STAGE_META.map((s) => {
                    const stageCandidates = selectedJob.candidates.filter((c) => c.stage === s.key);
                    return (
                      <div key={s.key} className="w-72 shrink-0 flex flex-col gap-3">
                        <div className="flex items-center gap-2 px-1">
                          <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${s.color}`} />
                          <p className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 truncate">{s.label}</p>
                          <span className="ml-auto text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full shrink-0">
                            {stageCandidates.length}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {stageCandidates.length === 0 ? (
                            <div className="h-28 rounded-2xl border-2 border-dashed dark:border-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                              Empty
                            </div>
                          ) : (
                            stageCandidates.map((c) => (
                              <CandidateCard
                                key={c.id}
                                candidate={c}
                                onViewProfile={() => setProfileTarget({ type: 'pipeline', jobId: selectedJob.id, candidateId: c.id })}
                                onAdvance={() => advanceCandidate(selectedJob.id, c.id)}
                                onReject={() => setRejectTarget({ jobId: selectedJob.id, candidateId: c.id, name: c.name })}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Talent Pool */}
              {(() => {
                const matches = TALENT_POOL.map((p) => ({
                  pool: p,
                  matched: p.skills.filter((s) => selectedJob.requiredSkills.includes(s)),
                }))
                  .filter((m) => m.matched.length > 0)
                  .sort((a, b) => b.matched.length - a.matched.length);

                if (matches.length === 0) return null;

                return (
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm p-8 space-y-5">
                    <div className="flex items-center gap-3">
                      <UserPlus className="h-5 w-5 text-blue-500 shrink-0" />
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Recommended from Talent Pool</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{matches.length} candidates match the required skills</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {matches.map(({ pool, matched }) => (
                        <div key={pool.id} className="bg-slate-50 dark:bg-slate-800/60 border dark:border-slate-800 rounded-2xl p-5 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 ${avatarColor(pool.id)}`}>
                              {initials(pool.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{pool.name}</p>
                              <p className="text-[11px] text-slate-400 truncate">{pool.email}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {matched.map((s) => <SkillChip key={s} label={s} />)}
                          </div>
                          <p className="text-[11px] font-bold text-slate-400">
                            {matched.length} / {selectedJob.requiredSkills.length} skills matched
                          </p>
                          <button
                            onClick={() => setProfileTarget({ type: 'pool', jobId: selectedJob.id, poolId: pool.id })}
                            className="w-full py-2 border dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all"
                          >
                            View Profile
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </>
      )}

      {showCreateModal && <CreateJobModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateJob} />}

      {profileTarget && (
        <CandidateProfileModal
          target={profileTarget}
          candidate={profileCandidate}
          pool={profilePool}
          onClose={() => setProfileTarget(null)}
          onAddToPipeline={() => profilePool && addToPipeline(profileTarget.jobId, profilePool)}
        />
      )}

      {rejectTarget && (
        <RejectConfirmModal name={rejectTarget.name} onCancel={() => setRejectTarget(null)} onConfirm={confirmReject} />
      )}

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-bold">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recruitment;
