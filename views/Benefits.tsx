
import React, { useState } from 'react';
import {
  Shield,
  Dumbbell,
  TrendingUp,
  Home,
  GraduationCap,
  Utensils,
  HeartPulse,
  Car,
  Baby,
  PieChart,
  Info,
  X,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../App';
import { UserRole } from '../types';

interface Benefit {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  icon: any;
  color: string;
  status: 'Active' | 'Available' | 'Pending';
  details: { label: string; value: string }[];
}

const BENEFITS_DATA: Benefit[] = [
  {
    id: 'health',
    title: 'Private Health Insurance',
    description: 'Full coverage for you and direct family members.',
    longDescription: 'Our comprehensive health insurance plan through MedCare Premium provides you with access to the best private hospitals and clinics worldwide. This benefit covers inpatient and outpatient care, dental treatments, and maternity support.',
    icon: Shield,
    color: 'blue',
    status: 'Active',
    details: [
      { label: 'Provider', value: 'MedCare Premium' },
      { label: 'Package', value: 'Diamond Global' },
      { label: 'Family Inclusion', value: 'Partner & Children' },
      { label: 'Renewal Date', value: 'Jan 1, 2024' }
    ]
  },
  {
    id: 'fitpass',
    title: 'FitPass Membership',
    description: 'Access to over 500 gyms and sports centers.',
    longDescription: 'Stay healthy and active with a fully company-sponsored FitPass membership. Access gyms, pools, yoga studios, and various sports facilities nationwide. Use your digital card via the FitPass app.',
    icon: Dumbbell,
    color: 'emerald',
    status: 'Active',
    details: [
      { label: 'Access Level', value: 'Elite Unlimited' },
      { label: 'Monthly Cost', value: '0 (Sponosred)' },
      { label: 'Usage', value: 'Daily allowed' }
    ]
  },
  {
    id: 'bonus',
    title: 'Quarterly Bonus',
    description: 'Performance-based bonuses paid every 3 months.',
    longDescription: 'We reward excellence. The quarterly bonus is calculated based on individual KPIs and company-wide performance milestones. This incentive is paid out in the month following the end of each quarter.',
    icon: TrendingUp,
    color: 'amber',
    status: 'Available',
    details: [
      { label: 'Target Amount', value: 'Up to 15% of salary' },
      { label: 'Next Payout', value: 'November 15' },
      { label: 'KPI Progress', value: '88% (On Track)' }
    ]
  },
  {
    id: 'wfh',
    title: 'Work from Home',
    description: 'Flexible hybrid model with home office stipend.',
    longDescription: 'Enjoy a flexible hybrid work schedule. Employees are eligible for up to 3 days per week of remote work. We also provide a one-time 500 EUR stipend for setting up your ergonomic home office.',
    icon: Home,
    color: 'indigo',
    status: 'Active',
    details: [
      { label: 'Days per week', value: '3 Days' },
      { label: 'Equipment Stipend', value: '500 EUR / Year' },
      { label: 'Last claimed', value: 'Mar 2023' }
    ]
  },
  {
    id: 'education',
    title: 'Education Budget',
    description: 'Yearly budget for courses, books, and exams.',
    longDescription: 'Continuous learning is part of our DNA. Every employee has access to a personal education budget to attend conferences, buy books, or complete professional certifications related to their career path.',
    icon: GraduationCap,
    color: 'purple',
    status: 'Available',
    details: [
      { label: 'Annual Amount', value: '1,500 EUR' },
      { label: 'Remaining', value: '840 EUR' },
      { label: 'Approver', value: 'Department Head' }
    ]
  },
  {
    id: 'lunch',
    title: 'Lunch Allowance',
    description: 'Daily prepaid card for restaurants and grocery.',
    longDescription: 'A daily tax-free lunch allowance is loaded onto your Edenred card. This can be used at over 5,000 partner restaurants, cafes, and supermarkets.',
    icon: Utensils,
    color: 'rose',
    status: 'Active',
    details: [
      { label: 'Daily Amount', value: '8.50 EUR' },
      { label: 'Card Provider', value: 'Edenred' },
      { label: 'Monthly reload', value: '1st of month' }
    ]
  },
  {
    id: 'mental',
    title: 'Mental Health Support',
    description: 'Free therapy sessions and meditation apps.',
    longDescription: 'Your mental well-being matters. We provide 5 anonymous therapy sessions per year through "MindSpace" and a premium subscription to the Headspace meditation app.',
    icon: HeartPulse,
    color: 'cyan',
    status: 'Active',
    details: [
      { label: 'Platform', value: 'MindSpace Pro' },
      { label: 'Sessions', value: '5 per year' },
      { label: 'App access', value: 'Headspace Premium' }
    ]
  },
  {
    id: 'stock',
    title: 'Stock Options (ESOP)',
    description: 'Be an owner of the company with our stock plan.',
    longDescription: 'Participate in our success through the Employee Stock Option Plan. Options vest over a 4-year period with a 1-year cliff, giving you a real stake in the company growth.',
    icon: PieChart,
    color: 'slate',
    status: 'Pending',
    details: [
      { label: 'Shares granted', value: '1,200 units' },
      { label: 'Vesting start', value: 'Jan 2024' },
      { label: 'Cliff period', value: '1 Year' }
    ]
  }
];

const inputCls = 'w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-blue-500 focus:ring-0 text-sm p-3 text-slate-900 dark:text-white transition-colors';
const labelCls = 'text-xs font-bold text-slate-400 uppercase mb-1.5 block';

const STATUS_OPTIONS: Benefit['status'][] = ['Active', 'Available', 'Pending'];

const Benefits: React.FC = () => {
  const { role } = useApp();
  const [benefits, setBenefits] = useState<Benefit[]>(BENEFITS_DATA);
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [formTarget, setFormTarget] = useState<Benefit | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<Benefit['status']>('Active');
  const [deleteTarget, setDeleteTarget] = useState<Benefit | null>(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const openAddForm = () => {
    setFormMode('add');
    setFormTarget(null);
    setFormTitle('');
    setFormDescription('');
    setFormStatus('Active');
  };

  const openEditForm = (benefit: Benefit) => {
    setFormMode('edit');
    setFormTarget(benefit);
    setFormTitle(benefit.title);
    setFormDescription(benefit.description);
    setFormStatus(benefit.status);
  };

  const closeForm = () => setFormMode(null);

  const canSaveForm = formTitle.trim() && formDescription.trim();

  const handleSaveForm = () => {
    if (!canSaveForm) return;
    if (formMode === 'edit' && formTarget) {
      setBenefits((prev) => prev.map((b) => (b.id === formTarget.id ? { ...b, title: formTitle.trim(), description: formDescription.trim(), status: formStatus } : b)));
      setToast('Benefit updated');
    } else {
      const newBenefit: Benefit = {
        id: `benefit-${Date.now()}`,
        title: formTitle.trim(),
        description: formDescription.trim(),
        longDescription: formDescription.trim(),
        icon: Info,
        color: 'slate',
        status: formStatus,
        details: [],
      };
      setBenefits((prev) => [newBenefit, ...prev]);
      setToast('Benefit added to catalog');
    }
    closeForm();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setBenefits((prev) => prev.filter((b) => b.id !== deleteTarget.id));
    if (selectedBenefit?.id === deleteTarget.id) setSelectedBenefit(null);
    setToast('Benefit removed from catalog');
    setDeleteTarget(null);
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30';
      case 'Available': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800/30';
      case 'Pending': return 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-800/30';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-700';
    }
  };

  const getColorStyles = (color: string) => {
    const map: Record<string, string> = {
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
      cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
      slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    };
    return map[color] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Benefits & Perks</h1>
          <p className="text-slate-500 dark:text-slate-400">Discover and manage the benefits available to you as part of our team.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium">
            <Info className="h-4 w-4 text-blue-400" />
            <span>Need help? Contact HR Benefits Team</span>
          </div>
          {role === UserRole.HR && (
            <button
              onClick={openAddForm}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
            >
              <Plus className="h-4 w-4" /> Add New Benefit
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit) => (
          <div
            key={benefit.id}
            onClick={() => setSelectedBenefit(benefit)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setSelectedBenefit(benefit); }}
            className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-left shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${getColorStyles(benefit.color)}`}>
                <benefit.icon className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-2">
                {role === UserRole.HR && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditForm(benefit); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Edit benefit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(benefit); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                      title="Delete benefit"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border tracking-wider ${getStatusStyles(benefit.status)}`}>
                  {benefit.status}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {benefit.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {benefit.description}
            </p>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">View Details</span>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedBenefit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSelectedBenefit(null)}
          ></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className={`p-8 ${getColorStyles(selectedBenefit.color).split(' ')[0]} dark:bg-slate-800/60 bg-opacity-20`}>
              <button
                onClick={() => setSelectedBenefit(null)}
                className="absolute top-6 right-6 p-2 hover:bg-white/50 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </button>

              <div className="flex items-center gap-4 mb-4">
                <div className={`p-4 rounded-2xl shadow-sm ${getColorStyles(selectedBenefit.color)}`}>
                  <selectedBenefit.icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedBenefit.title}</h3>
                  <span className={`inline-block mt-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border tracking-wider ${getStatusStyles(selectedBenefit.status)}`}>
                    {selectedBenefit.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <section>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wider">About this benefit</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedBenefit.longDescription}
                </p>
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedBenefit.details.map((detail, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{detail.label}</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{detail.value}</p>
                  </div>
                ))}
              </section>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button className="flex-1 py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <ExternalLink className="h-4 w-4" /> Go to Partner Portal
                </button>
                <button className="flex-1 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Download Guide (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Benefit Modal */}
      {formMode && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeForm}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-7 pt-6 pb-4 border-b dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{formMode === 'edit' ? 'Edit Benefit' : 'Add New Benefit'}</h2>
              <button onClick={closeForm} className="h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-7 space-y-5">
              <div>
                <label className={labelCls}>Benefit Name</label>
                <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Dental Coverage" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3} placeholder="Short description shown on the catalog card..." className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <div className="grid grid-cols-3 gap-3">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormStatus(s)}
                      className={`p-3 rounded-xl border-2 text-xs font-bold uppercase tracking-widest transition-all ${
                        formStatus === s ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-slate-100 dark:border-slate-700 text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-7 py-5 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-end gap-3">
              <button onClick={closeForm} className="px-4 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleSaveForm}
                disabled={!canSaveForm}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {formMode === 'edit' ? 'Save Changes' : 'Add Benefit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDeleteTarget(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] border dark:border-slate-800 shadow-2xl p-7 animate-in zoom-in-95 duration-200">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-5">
              <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Remove {deleteTarget.title} from the catalog?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">Employees will no longer see this benefit. This action cannot be undone.</p>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 border dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                Cancel
              </button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-bold">{toast}</span>
          </div>
        </div>
      )}

      {/* Engagement Banner */}
      <section className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 md:max-w-lg">
          <h2 className="text-2xl font-bold mb-2">Have a benefit suggestion?</h2>
          <p className="text-blue-100 mb-6 leading-relaxed">
            We are constantly looking for ways to improve your work experience. If you have a provider or a perk in mind, let our Benefits Team know.
          </p>
          <button className="px-6 py-2.5 bg-white text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors flex items-center gap-2">
            Submit Suggestion <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute -bottom-12 -right-12 p-8 opacity-10">
          <PieChart className="h-64 w-64" />
        </div>
      </section>

      <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">
          Your benefits are part of your Total Rewards package. Values are adjusted according to seniority and contract type.
        </p>
      </div>
    </div>
  );
};

export default Benefits;
