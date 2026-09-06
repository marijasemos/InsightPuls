
import React, { useMemo, useState } from 'react';
import {
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingUp,
  Users,
  CalendarClock,
  FileEdit,
  FileText,
  Loader2,
  PenLine,
} from 'lucide-react';
import { useApp } from '../App';

export type AnnexType = 'Salary Change' | 'Promotion / Title Change' | 'Team Transfer' | 'Contract Extension' | 'Other';

const ANNEX_TYPES: { id: AnnexType; icon: React.ElementType; desc: string }[] = [
  { id: 'Salary Change', icon: DollarSign, desc: 'Adjust the monthly base salary.' },
  { id: 'Promotion / Title Change', icon: TrendingUp, desc: 'Change position title or seniority level.' },
  { id: 'Team Transfer', icon: Users, desc: 'Move the employee to a different team.' },
  { id: 'Contract Extension', icon: CalendarClock, desc: 'Extend or change the contract terms.' },
  { id: 'Other', icon: FileEdit, desc: 'Describe a custom contractual change.' },
];

const SENIORITY_LEVELS = ['Junior', 'Mid', 'Senior', 'Lead', 'Director'];
const TEAM_OPTIONS = ['Engineering', 'Product Design', 'Legal & Compliance', 'Human Resources', 'Finance', 'Sales & Marketing'];
const CONTRACT_TYPES = ['Permanent Full-time', 'Part-time', 'Fixed-term'];

const STEPS = [
  { id: 1, label: 'Type' },
  { id: 2, label: 'Details' },
  { id: 3, label: 'Review' },
];

const inputCls = 'w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-blue-500 focus:ring-0 text-sm p-3 text-slate-900 dark:text-white transition-colors';
const readOnlyCls = 'w-full rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-transparent text-sm p-3 text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed';
const labelCls = 'text-xs font-bold text-slate-400 uppercase mb-1.5 block';

const formatDate = (iso: string) => {
  if (!iso) return '';
  const parsed = new Date(iso);
  if (isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const monthYear = (iso: string) => {
  const parsed = iso ? new Date(iso) : new Date();
  if (isNaN(parsed.getTime())) return new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return parsed.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const currency = (n: number) => `€${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export interface AnnexGenerationResult {
  documentName: string;
  createdOn: string;
  type: AnnexType;
  beforeAfter: { label: string; before: string; after: string }[];
  effectiveDateLabel: string;
  reason: string;
  previewHtml: string;
  careerEntry?: { type: string; detail: string; date: string };
}

interface GenerateAnnexModalProps {
  employee: { id: string; name: string; position: string; seniority: string; team: string; avatar: string };
  currentSalary: number;
  currentEmploymentType: string;
  currentContractEnd?: string;
  companyName: string;
  companyLogo?: string;
  onClose: () => void;
  onGenerate: (result: AnnexGenerationResult) => void;
}

const GenerateAnnexModal: React.FC<GenerateAnnexModalProps> = ({
  employee,
  currentSalary,
  currentEmploymentType,
  currentContractEnd,
  companyName,
  companyLogo,
  onClose,
  onGenerate,
}) => {
  const { settings } = useApp();
  const brand = settings.primaryColor;

  const [step, setStep] = useState(1);
  const [type, setType] = useState<AnnexType | null>(null);
  const [generating, setGenerating] = useState(false);

  const [newSalary, setNewSalary] = useState('');
  const [salaryEffectiveDate, setSalaryEffectiveDate] = useState('');

  const [newPosition, setNewPosition] = useState('');
  const [newSeniority, setNewSeniority] = useState(employee.seniority);
  const [promotionEffectiveDate, setPromotionEffectiveDate] = useState('');

  const [newTeam, setNewTeam] = useState('');
  const [transferEffectiveDate, setTransferEffectiveDate] = useState('');

  const [newContractEnd, setNewContractEnd] = useState('');
  const [newContractType, setNewContractType] = useState(
    CONTRACT_TYPES.includes(currentEmploymentType) ? currentEmploymentType : CONTRACT_TYPES[0]
  );

  const [otherDescription, setOtherDescription] = useState('');
  const [reason, setReason] = useState('');

  const canGoNext = useMemo(() => {
    if (step === 1) return !!type;
    if (step === 2) {
      switch (type) {
        case 'Salary Change':
          return !!newSalary && Number(newSalary) > 0 && !!salaryEffectiveDate;
        case 'Promotion / Title Change':
          return !!newPosition.trim() && !!newSeniority && !!promotionEffectiveDate;
        case 'Team Transfer':
          return !!newTeam && !!transferEffectiveDate;
        case 'Contract Extension':
          return !!newContractEnd && !!newContractType;
        case 'Other':
          return !!otherDescription.trim();
        default:
          return false;
      }
    }
    return true;
  }, [step, type, newSalary, salaryEffectiveDate, newPosition, newSeniority, promotionEffectiveDate, newTeam, transferEffectiveDate, newContractEnd, newContractType, otherDescription]);

  const review = useMemo(() => {
    if (!type) return null;
    let beforeAfter: { label: string; before: string; after: string }[] = [];
    let effectiveDateLabel = '';
    let documentName = '';
    let careerEntry: { type: string; detail: string; date: string } | undefined;

    switch (type) {
      case 'Salary Change': {
        const salaryNum = Number(newSalary) || 0;
        beforeAfter = [{ label: 'Monthly Salary', before: currency(currentSalary), after: currency(salaryNum) }];
        effectiveDateLabel = formatDate(salaryEffectiveDate);
        documentName = `Salary Annex — ${monthYear(salaryEffectiveDate)}`;
        careerEntry = {
          type: 'Salary Adjustment',
          detail: `${currency(currentSalary)} → ${currency(salaryNum)}`,
          date: monthYear(salaryEffectiveDate),
        };
        break;
      }
      case 'Promotion / Title Change': {
        beforeAfter = [
          { label: 'Position', before: employee.position, after: newPosition },
          { label: 'Seniority', before: employee.seniority, after: newSeniority },
        ];
        effectiveDateLabel = formatDate(promotionEffectiveDate);
        documentName = `Promotion Annex — ${monthYear(promotionEffectiveDate)}`;
        careerEntry = {
          type: 'Position Change',
          detail: `${employee.position} → ${newPosition}`,
          date: monthYear(promotionEffectiveDate),
        };
        break;
      }
      case 'Team Transfer': {
        beforeAfter = [{ label: 'Team', before: employee.team, after: newTeam }];
        effectiveDateLabel = formatDate(transferEffectiveDate);
        documentName = `Team Transfer Annex — ${monthYear(transferEffectiveDate)}`;
        careerEntry = undefined;
        break;
      }
      case 'Contract Extension': {
        beforeAfter = [
          { label: 'Contract Type', before: currentEmploymentType, after: newContractType },
          { label: 'Contract End Date', before: currentContractEnd ? formatDate(currentContractEnd) : 'No end date (Permanent)', after: formatDate(newContractEnd) },
        ];
        effectiveDateLabel = formatDate(newContractEnd);
        documentName = `Contract Extension Annex — ${monthYear(newContractEnd)}`;
        break;
      }
      case 'Other': {
        beforeAfter = [{ label: 'Change Description', before: '—', after: otherDescription }];
        effectiveDateLabel = formatDate(new Date().toISOString());
        documentName = `Contract Annex — ${monthYear('')}`;
        break;
      }
    }

    return { beforeAfter, effectiveDateLabel, documentName, careerEntry };
  }, [type, newSalary, salaryEffectiveDate, currentSalary, newPosition, newSeniority, promotionEffectiveDate, employee, newTeam, transferEffectiveDate, newContractType, newContractEnd, currentEmploymentType, currentContractEnd, otherDescription]);

  const handleGenerate = () => {
    if (!review || !type) return;
    setGenerating(true);
    setTimeout(() => {
      const createdOn = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const previewHtml = `
        <div style="font-family: 'Courier New', monospace; max-width: 720px; margin: 40px auto; padding: 48px; border: 1px solid #e2e8f0;">
          <div style="display:flex; justify-content:space-between; border-bottom: 2px solid #0f172a; padding-bottom: 24px; margin-bottom: 24px;">
            <div>
              <h1 style="font-size: 20px; margin: 0; text-transform: uppercase;">${companyName}</h1>
            </div>
            <div style="text-align:right;">
              <h2 style="font-size: 16px; margin: 0; text-transform: uppercase;">Contract Annex</h2>
              <p style="font-size: 11px; color: #64748b; margin: 4px 0 0;">${review.documentName}</p>
            </div>
          </div>
          <p style="font-size: 13px;"><strong>${employee.name}</strong> — ${employee.position}</p>
          <table style="width:100%; border-collapse: collapse; margin-top: 24px; font-size: 13px;">
            <thead><tr><th style="text-align:left; border-bottom:1px solid #e2e8f0; padding:8px 0;">Field</th><th style="text-align:left; border-bottom:1px solid #e2e8f0; padding:8px 0;">Before</th><th style="text-align:left; border-bottom:1px solid #e2e8f0; padding:8px 0;">After</th></tr></thead>
            <tbody>
              ${review.beforeAfter.map((r) => `<tr><td style="padding:8px 0; border-bottom:1px solid #f1f5f9;">${r.label}</td><td style="padding:8px 0; border-bottom:1px solid #f1f5f9; color:#64748b;">${r.before}</td><td style="padding:8px 0; border-bottom:1px solid #f1f5f9; font-weight:bold;">${r.after}</td></tr>`).join('')}
            </tbody>
          </table>
          <p style="font-size: 12px; margin-top: 24px;">Effective Date: <strong>${review.effectiveDateLabel}</strong></p>
          ${reason ? `<p style="font-size: 12px; margin-top: 8px;">Notes: ${reason}</p>` : ''}
          <div style="margin-top: 64px; border-top: 1px dashed #cbd5e1; padding-top: 8px; width: 260px; font-size: 11px; color: #94a3b8;">Signature</div>
        </div>
      `;
      onGenerate({
        documentName: review.documentName,
        createdOn,
        type,
        beforeAfter: review.beforeAfter,
        effectiveDateLabel: review.effectiveDateLabel,
        reason,
        previewHtml,
        careerEntry: review.careerEntry,
      });
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header + Step Indicator */}
        <div className="px-8 pt-7 pb-6 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Generate Annex — {employee.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Create a contract annex. This is a mock document for demo purposes.</p>
            </div>
            <button
              onClick={onClose}
              className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center">
            {STEPS.map((s, idx) => (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-3">
                  <div
                    className={
                      step >= s.id
                        ? 'h-8 w-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors text-white'
                        : 'h-8 w-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                    }
                    style={step >= s.id ? { backgroundColor: brand } : undefined}
                  >
                    {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-widest hidden sm:block ${step >= s.id ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="flex-1 h-[2px] mx-4 bg-slate-100 dark:bg-slate-800 relative overflow-hidden rounded-full">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                      style={{ width: step > s.id ? '100%' : '0%', backgroundColor: brand }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {step === 1 && (
            <div className="space-y-3 animate-in fade-in duration-300">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Select Annex Type</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ANNEX_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                      type === t.id ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${type === t.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                      <t.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{t.id}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && type && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {type === 'Salary Change' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Current Salary</label>
                    <input type="text" disabled value={currency(currentSalary)} className={readOnlyCls} />
                  </div>
                  <div>
                    <label className={labelCls}>New Salary</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">€</span>
                      <input
                        type="number"
                        value={newSalary}
                        onChange={(e) => setNewSalary(e.target.value)}
                        placeholder="e.g. 3600"
                        className={`${inputCls} pl-7`}
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Effective Date</label>
                    <input type="date" value={salaryEffectiveDate} onChange={(e) => setSalaryEffectiveDate(e.target.value)} className={inputCls} />
                  </div>
                </div>
              )}

              {type === 'Promotion / Title Change' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Current Position</label>
                    <input type="text" disabled value={employee.position} className={readOnlyCls} />
                  </div>
                  <div>
                    <label className={labelCls}>New Position</label>
                    <input type="text" value={newPosition} onChange={(e) => setNewPosition(e.target.value)} placeholder="e.g. Lead Product Designer" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>New Seniority</label>
                    <select value={newSeniority} onChange={(e) => setNewSeniority(e.target.value)} className={`${inputCls} appearance-none cursor-pointer`}>
                      {SENIORITY_LEVELS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Effective Date</label>
                    <input type="date" value={promotionEffectiveDate} onChange={(e) => setPromotionEffectiveDate(e.target.value)} className={inputCls} />
                  </div>
                </div>
              )}

              {type === 'Team Transfer' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Current Team</label>
                    <input type="text" disabled value={employee.team} className={readOnlyCls} />
                  </div>
                  <div>
                    <label className={labelCls}>New Team</label>
                    <select value={newTeam} onChange={(e) => setNewTeam(e.target.value)} className={`${inputCls} appearance-none cursor-pointer`}>
                      <option value="">Select a team...</option>
                      {TEAM_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Effective Date</label>
                    <input type="date" value={transferEffectiveDate} onChange={(e) => setTransferEffectiveDate(e.target.value)} className={inputCls} />
                  </div>
                </div>
              )}

              {type === 'Contract Extension' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Current Contract Type</label>
                    <input type="text" disabled value={currentEmploymentType} className={readOnlyCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Current Contract End</label>
                    <input type="text" disabled value={currentContractEnd ? formatDate(currentContractEnd) : 'No end date (Permanent)'} className={readOnlyCls} />
                  </div>
                  <div>
                    <label className={labelCls}>New Contract End Date</label>
                    <input type="date" value={newContractEnd} onChange={(e) => setNewContractEnd(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>New Contract Type</label>
                    <select value={newContractType} onChange={(e) => setNewContractType(e.target.value)} className={`${inputCls} appearance-none cursor-pointer`}>
                      {CONTRACT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {type === 'Other' && (
                <div>
                  <label className={labelCls}>Describe the Change</label>
                  <textarea
                    value={otherDescription}
                    onChange={(e) => setOtherDescription(e.target.value)}
                    rows={4}
                    placeholder="Describe the contractual change..."
                    className={`${inputCls} resize-none`}
                  />
                </div>
              )}

              <div className="pt-2 border-t dark:border-slate-800">
                <label className={`${labelCls} mt-4`}>Reason / Notes (optional)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="Add any additional context for this annex..."
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          )}

          {step === 3 && review && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-8 font-mono">
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
                  <div className="flex items-center gap-3">
                    {companyLogo && <img src={companyLogo} alt="" className="h-8 object-contain" />}
                    <h2 className="text-lg font-black uppercase tracking-tighter text-slate-900">{companyName}</h2>
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-black uppercase text-slate-900">Contract Annex</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{review.documentName}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Employee</p>
                  <p className="text-sm font-black text-slate-900">{employee.name}</p>
                  <p className="text-xs text-slate-500">{employee.position} • {employee.team} Team</p>
                </div>

                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase text-slate-400">
                      <th className="pb-2 font-bold">Field</th>
                      <th className="pb-2 font-bold">Before</th>
                      <th className="pb-2 font-bold">After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {review.beforeAfter.map((row, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-2.5 text-slate-700 font-bold">{row.label}</td>
                        <td className="py-2.5 text-slate-500">{row.before}</td>
                        <td className="py-2.5 text-slate-900 font-black">{row.after}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p className="text-xs text-slate-600 mt-6">
                  Effective Date: <span className="font-bold text-slate-900">{review.effectiveDateLabel}</span>
                </p>
                {reason && <p className="text-xs text-slate-600 mt-2">Notes: {reason}</p>}

                <div className="mt-14 pt-2 border-t border-dashed border-slate-300 w-56 flex items-center gap-2">
                  <PenLine className="h-3.5 w-3.5 text-slate-300" />
                  <span className="text-[10px] text-slate-400">Signature</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between shrink-0">
          <button onClick={onClose} className="text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors">
            Cancel
          </button>
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 px-5 py-2.5 border dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            )}
            {step < 3 ? (
              <button
                disabled={!canGoNext}
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: brand }}
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ backgroundColor: brand }}
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {generating ? 'Generating...' : 'Generate & Send for Signature'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateAnnexModal;
