
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ClipboardList,
  UserCheck,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Plus,
  Trash2,
  Search,
  Calendar,
  Users,
  Loader2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useApp } from '../App';
import { UserRole, User } from '../types';
import { EmployeeService } from '../services/api';

type QuestionType = 'yesno' | 'scale' | 'text';
type AssignmentKind = 'Survey' | 'Self-Evaluation';
type AssignmentStatus = 'Not Started' | 'In Progress' | 'Completed';

interface Question {
  id: string;
  text: string;
  type: QuestionType;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  kind: AssignmentKind;
  status: AssignmentStatus;
  dueDate: string;
  questions: Question[];
  totalAssigned?: number;
  completedCount?: number;
}

const TEAMS = ['Creative Team', 'Engineering', 'Product Design', 'Quality', 'Legal & Compliance', 'Human Resources', 'Finance', 'Sales & Marketing'];

const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'sv-q3-engagement',
    title: 'Q3 Engagement Survey',
    description: 'A quick pulse check on how you feel about work, team and growth.',
    kind: 'Survey',
    status: 'Not Started',
    dueDate: 'Oct 31, 2023',
    totalAssigned: 20,
    completedCount: 14,
    questions: [
      { id: 'q1', text: 'I feel motivated to do my best work here.', type: 'scale' },
      { id: 'q2', text: 'My manager provides clear direction.', type: 'scale' },
      { id: 'q3', text: 'I have the tools I need to do my job well.', type: 'yesno' },
      { id: 'q4', text: 'I would recommend this company as a great place to work.', type: 'scale' },
      { id: 'q5', text: 'I feel recognized for my contributions.', type: 'scale' },
      { id: 'q6', text: 'I have opportunities to grow my skills.', type: 'yesno' },
      { id: 'q7', text: 'I feel a sense of belonging on my team.', type: 'scale' },
      { id: 'q8', text: 'I am satisfied with my work-life balance.', type: 'scale' },
    ],
  },
  {
    id: 'se-mid-year',
    title: 'Mid-Year Self-Evaluation',
    description: 'Reflect on your performance and set goals for the next quarter.',
    kind: 'Self-Evaluation',
    status: 'In Progress',
    dueDate: 'Nov 15, 2023',
    totalAssigned: 20,
    completedCount: 6,
    questions: [
      { id: 'q1', text: 'What were your key achievements this period?', type: 'text' },
      { id: 'q2', text: 'What challenges did you face?', type: 'text' },
      { id: 'q3', text: 'What are your goals for the next quarter?', type: 'text' },
    ],
  },
  {
    id: 'sv-culture-checkin',
    title: 'Team Culture Check-in',
    description: 'Help us understand how the team is feeling day-to-day.',
    kind: 'Survey',
    status: 'Not Started',
    dueDate: 'Nov 5, 2023',
    totalAssigned: 12,
    completedCount: 5,
    questions: [
      { id: 'q1', text: 'Do you feel comfortable sharing feedback with your team?', type: 'yesno' },
      { id: 'q2', text: 'Have you had a 1-on-1 with your manager this month?', type: 'yesno' },
      { id: 'q3', text: 'Do you feel included in team decisions?', type: 'yesno' },
      { id: 'q4', text: 'Would you attend an optional team social event?', type: 'yesno' },
    ],
  },
  {
    id: 'sv-manager-pulse',
    title: 'Manager Feedback Pulse',
    description: 'A short pulse on how your manager is supporting you.',
    kind: 'Survey',
    status: 'Completed',
    dueDate: 'Oct 10, 2023',
    totalAssigned: 20,
    completedCount: 20,
    questions: [
      { id: 'q1', text: 'My manager listens to my concerns.', type: 'scale' },
      { id: 'q2', text: 'My manager gives me useful feedback.', type: 'scale' },
      { id: 'q3', text: 'I trust my manager.', type: 'scale' },
      { id: 'q4', text: 'My manager helps remove blockers.', type: 'scale' },
      { id: 'q5', text: 'I feel supported in my career growth.', type: 'scale' },
    ],
  },
];

const kindBadge = (kind: AssignmentKind) =>
  kind === 'Survey' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400';

const statusBadge = (status: AssignmentStatus) => {
  switch (status) {
    case 'Not Started': return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';
    case 'In Progress': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
    case 'Completed': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400';
  }
};

const actionLabel = (status: AssignmentStatus) => {
  switch (status) {
    case 'Not Started': return 'Start';
    case 'In Progress': return 'Continue';
    case 'Completed': return 'View Responses';
  }
};

/* ---------------------------- Take Survey Modal --------------------------- */

const TakeSurveyModal: React.FC<{ assignment: Assignment; onClose: () => void; onSubmit: () => void }> = ({ assignment, onClose, onSubmit }) => {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const total = assignment.questions.length;
  const question = assignment.questions[index];
  const answered = answers[question.id] !== undefined;
  const isLast = index === total - 1;

  const setAnswer = (val: string | number) => setAnswers((prev) => ({ ...prev, [question.id]: val }));

  const handleNext = () => {
    if (isLast) {
      onSubmit();
      return;
    }
    setIndex((i) => i + 1);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Question {index + 1} of {total}</span>
            <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${((index + 1) / total) * 100}%` }}></div>
          </div>
        </div>

        <div className="p-8 min-h-[220px] flex flex-col justify-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8 text-center">{question.text}</h3>

          {question.type === 'yesno' && (
            <div className="grid grid-cols-2 gap-4">
              {(['Yes', 'No'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAnswer(opt)}
                  className={`py-6 rounded-2xl border-2 text-lg font-black transition-all ${
                    answers[question.id] === opt ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {question.type === 'scale' && (
            <div>
              <div className="flex items-center justify-between gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setAnswer(n)}
                    className={`h-12 w-12 rounded-full border-2 flex items-center justify-center font-black transition-all ${
                      answers[question.id] === n ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-300'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                <span>Strongly Disagree</span>
                <span>Strongly Agree</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <button
            onClick={handleNext}
            disabled={!answered}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isLast ? 'Submit' : 'Next'} {!isLast && <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------ Take Self-Evaluation Modal ----------------------- */

const TakeSelfEvalModal: React.FC<{ assignment: Assignment; onClose: () => void; onSubmit: () => void }> = ({ assignment, onClose, onSubmit }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showSaved, setShowSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (id: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
    setShowSaved(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setShowSaved(false), 1500);
  };

  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{assignment.title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{assignment.description}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {assignment.questions.map((q) => (
            <div key={q.id} className="space-y-2">
              <label className="text-sm font-bold text-slate-800 dark:text-white">{q.text}</label>
              <textarea
                value={answers[q.id] || ''}
                onChange={(e) => handleChange(q.id, e.target.value)}
                rows={4}
                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-indigo-500 focus:ring-0 p-4 text-sm text-slate-900 dark:text-white resize-none"
                placeholder="Type your answer..."
              />
            </div>
          ))}
        </div>

        <div className="px-6 pb-4 h-5 shrink-0">
          {showSaved && (
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
              <CheckCircle2 className="h-3.5 w-3.5" /> Draft saved
            </p>
          )}
        </div>

        <div className="p-6 border-t dark:border-slate-800 shrink-0">
          <button
            onClick={onSubmit}
            className="w-full py-4 rounded-2xl text-white font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all transform active:scale-[0.98]"
          >
            Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------- Create Survey Wizard -------------------------- */

const QUESTION_TYPE_LABEL: Record<QuestionType, string> = { yesno: 'Yes / No', scale: 'Scale 1-5', text: 'Descriptive / Text' };

const CreateSurveyWizard: React.FC<{ onClose: () => void; onPublish: (a: Assignment) => void }> = ({ onClose, onPublish }) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<AssignmentKind>('Survey');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [recipientType, setRecipientType] = useState<'all' | 'team' | 'individual'>('all');
  const [team, setTeam] = useState(TEAMS[0]);
  const [individualQuery, setIndividualQuery] = useState('');
  const [individuals, setIndividuals] = useState<User[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<User[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    EmployeeService.getAll().then(setEmployeeOptions);
  }, []);

  const addQuestion = () => setQuestions((prev) => [...prev, { id: `nq-${Date.now()}`, text: '', type: 'yesno' }]);
  const updateQuestion = (id: string, patch: Partial<Question>) => setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  const removeQuestion = (id: string) => setQuestions((prev) => prev.filter((q) => q.id !== id));
  const moveQuestion = (id: string, dir: -1 | 1) => {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === id);
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  };

  const filteredEmployeeOptions = useMemo(
    () => employeeOptions.filter((e) => e.name.toLowerCase().includes(individualQuery.toLowerCase()) && !individuals.some((i) => i.id === e.id)),
    [employeeOptions, individualQuery, individuals]
  );

  const step1Valid = title.trim().length > 0;
  const step2Valid = questions.length > 0 && questions.every((q) => q.text.trim().length > 0);
  const step3Valid = dueDate.length > 0 && (recipientType !== 'individual' || individuals.length > 0);

  const recipientCount = recipientType === 'all' ? 24 : recipientType === 'team' ? 8 : individuals.length;

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      onPublish({
        id: `custom-${Date.now()}`,
        title,
        description,
        kind,
        status: 'Not Started',
        dueDate: new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        questions,
        totalAssigned: recipientCount,
        completedCount: 0,
      });
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[88vh] flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 pt-7 pb-5 border-b dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create New Survey</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="h-9 w-9 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q4 Engagement Survey"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-indigo-500 focus:ring-0 text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Short Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-indigo-500 focus:ring-0 p-4 text-sm text-slate-900 dark:text-white resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Template Type</label>
                <div className="grid grid-cols-2 gap-4">
                  {(['Survey', 'Self-Evaluation'] as const).map((k) => (
                    <button
                      key={k}
                      onClick={() => setKind(k)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        kind === k ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {k === 'Survey' ? <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400 mb-2" /> : <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400 mb-2" />}
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{k}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {questions.length === 0 && (
                <div className="p-8 text-center border-2 border-dashed dark:border-slate-700 rounded-2xl text-slate-400 text-sm font-bold">No questions yet.</div>
              )}
              {questions.map((q, i) => (
                <div key={q.id} className="p-4 rounded-2xl border dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-400 w-5">{i + 1}.</span>
                    <input
                      type="text"
                      value={q.text}
                      onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                      placeholder="Question text"
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border-transparent focus:border-indigo-500 focus:ring-0 text-sm font-medium text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2 pl-7">
                    <select
                      value={q.type}
                      onChange={(e) => updateQuestion(q.id, { type: e.target.value as QuestionType })}
                      className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border-transparent focus:border-indigo-500 focus:ring-0 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="yesno">{QUESTION_TYPE_LABEL.yesno}</option>
                      <option value="scale">{QUESTION_TYPE_LABEL.scale}</option>
                      {kind === 'Self-Evaluation' && <option value="text">{QUESTION_TYPE_LABEL.text}</option>}
                    </select>
                    <div className="ml-auto flex items-center gap-1">
                      <button onClick={() => moveQuestion(q.id, -1)} disabled={i === 0} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-30">
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => moveQuestion(q.id, 1)} disabled={i === questions.length - 1} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-30">
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => removeQuestion(q.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addQuestion}
                className="w-full py-3 border-2 border-dashed dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-400 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Question
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recipients</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['all', 'team', 'individual'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setRecipientType(opt)}
                      className={`p-3 rounded-xl border-2 text-xs font-bold uppercase tracking-widest transition-all ${
                        recipientType === opt ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'border-slate-100 dark:border-slate-700 text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {opt === 'all' ? 'All Employees' : opt === 'team' ? 'Team' : 'Individual'}
                    </button>
                  ))}
                </div>
              </div>

              {recipientType === 'team' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Team</label>
                  <select value={team} onChange={(e) => setTeam(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-indigo-500 focus:ring-0 text-sm font-bold text-slate-900 dark:text-white">
                    {TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}

              {recipientType === 'individual' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Search Employees</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={individualQuery}
                      onChange={(e) => setIndividualQuery(e.target.value)}
                      placeholder="Search employees..."
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-indigo-500 focus:ring-0 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  {individualQuery && filteredEmployeeOptions.length > 0 && (
                    <div className="border dark:border-slate-700 rounded-xl overflow-hidden max-h-32 overflow-y-auto">
                      {filteredEmployeeOptions.map((emp) => (
                        <button
                          key={emp.id}
                          onClick={() => { setIndividuals((prev) => [...prev, emp]); setIndividualQuery(''); }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-900 flex items-center gap-2"
                        >
                          <img src={emp.avatar} className="h-6 w-6 rounded-lg object-cover" alt="" />
                          <span className="font-medium text-slate-700 dark:text-slate-200">{emp.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {individuals.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {individuals.map((emp) => (
                        <span key={emp.id} className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold">
                          {emp.name}
                          <button onClick={() => setIndividuals((prev) => prev.filter((i) => i.id !== emp.id))} className="p-0.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-full">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-indigo-500 focus:ring-0 text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-3 border dark:border-slate-700">
                <Users className="h-4 w-4 text-slate-400" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Estimated recipients: <span className="font-bold text-slate-700 dark:text-slate-200">{recipientCount}</span></p>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-5 border-t dark:border-slate-800 flex items-center justify-between shrink-0">
          <button onClick={onClose} className="text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors">Cancel</button>
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button onClick={() => setStep((s) => s - 1)} className="flex items-center gap-2 px-5 py-2.5 border dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 1 ? !step1Valid : !step2Valid}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={!step3Valid || publishing}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
                Publish Survey
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------- Main Tab -------------------------------- */

const SurveysSection: React.FC = () => {
  const { role } = useApp();
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const activeAssignment = assignments.find((a) => a.id === activeModalId) || null;

  const handleStart = (a: Assignment) => {
    if (a.status === 'Completed') {
      setToast('Opening your responses...');
      return;
    }
    if (a.status === 'Not Started') {
      setAssignments((prev) => prev.map((x) => (x.id === a.id ? { ...x, status: 'In Progress' } : x)));
    }
    setActiveModalId(a.id);
  };

  const handleSubmit = () => {
    if (!activeAssignment) return;
    setAssignments((prev) => prev.map((x) => (x.id === activeAssignment.id ? { ...x, status: 'Completed' } : x)));
    setActiveModalId(null);
    setToast(activeAssignment.kind === 'Survey' ? 'Survey submitted' : 'Self-evaluation submitted');
  };

  const handlePublish = (a: Assignment) => {
    setAssignments((prev) => [a, ...prev]);
    setCreateOpen(false);
    setToast('Survey published');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assigned to You</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Surveys and self-evaluations that need your input.</p>
        </div>
        {role === UserRole.HR && (
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" /> Create New Survey
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 shadow-sm divide-y dark:divide-slate-800">
        {assignments.map((a) => (
          <div key={a.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-800 dark:text-white">{a.title}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${kindBadge(a.kind)}`}>{a.kind}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${statusBadge(a.status)}`}>{a.status}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">{a.description}</p>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-[11px] text-slate-400 font-bold">
                  <Calendar className="h-3 w-3" /> Due {a.dueDate}
                </span>
                {role === UserRole.HR && a.totalAssigned !== undefined && (
                  <span className="text-[11px] text-slate-400 font-bold">{a.completedCount} of {a.totalAssigned} completed</span>
                )}
              </div>
            </div>
            <button
              onClick={() => handleStart(a)}
              className="px-6 py-3 rounded-2xl text-white font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all transform active:scale-[0.98] shrink-0"
            >
              {actionLabel(a.status)}
            </button>
          </div>
        ))}
      </div>

      {activeAssignment && activeAssignment.kind === 'Survey' && (
        <TakeSurveyModal assignment={activeAssignment} onClose={() => setActiveModalId(null)} onSubmit={handleSubmit} />
      )}
      {activeAssignment && activeAssignment.kind === 'Self-Evaluation' && (
        <TakeSelfEvalModal assignment={activeAssignment} onClose={() => setActiveModalId(null)} onSubmit={handleSubmit} />
      )}
      {createOpen && <CreateSurveyWizard onClose={() => setCreateOpen(false)} onPublish={handlePublish} />}

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

export default SurveysSection;
