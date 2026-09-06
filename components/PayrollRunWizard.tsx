
import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Sparkles,
  Building2,
  Wallet,
  Receipt,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  FileText,
  Send,
  Eye,
  Download,
} from 'lucide-react';
import { useApp } from '../App';
import { Payslip } from '../types';

export interface PayrollRunSourceEmployee {
  id: string;
  name: string;
  position: string;
  team: string;
  avatar: string;
  salary: number;
}

type LineStatus = 'included' | 'excluded_sick' | 'new_hire';

interface RunLineItem {
  id: string;
  name: string;
  position: string;
  team: string;
  avatar: string;
  grossPay: number;
  workedDays: number;
  standardDays: number;
  statusNote: LineStatus;
  included: boolean;
  bonus: number;
}

const TAX_RATE = 0.15;
const EMPLOYEE_CONTRIB_RATE = 0.10;
const EMPLOYER_CONTRIB_RATE = 0.16;

// Mock per-cycle overrides layered on top of the base employee list, so the demo tells a
// believable story (someone on sick leave, a prorated new hire) without touching real payroll logic.
const LINE_OVERRIDES: Record<string, Partial<Pick<RunLineItem, 'workedDays' | 'standardDays' | 'statusNote' | 'included' | 'grossPay' | 'bonus'>>> = {
  '3': { workedDays: 14, standardDays: 22, statusNote: 'excluded_sick', included: false },
  '4': { bonus: 500 },
  '5': { workedDays: 9, standardDays: 22, statusNote: 'new_hire', grossPay: 1555 },
};

const statusLabel = (status: LineStatus, days: { worked: number; standard: number }) => {
  switch (status) {
    case 'excluded_sick':
      return `Isključen zbog bolovanja > ${days.standard - days.worked} dana`;
    case 'new_hire':
      return 'Novi zaposleni — proporcionalno';
    default:
      return 'Uključen';
  }
};

const statusBadgeClasses = (status: LineStatus) => {
  switch (status) {
    case 'excluded_sick':
      return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800/30';
    case 'new_hire':
      return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800/30';
    default:
      return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30';
  }
};

export interface PayrollRunResult {
  runDate: string;
  employeeIds: string[];
  payslipsByEmployee: Record<string, Payslip>;
}

interface PayrollRunWizardProps {
  employees: PayrollRunSourceEmployee[];
  paymentDate: string;
  onClose: () => void;
  onComplete: (result: PayrollRunResult) => void;
}

const STEPS = [
  { id: 1, label: 'Pregled zaposlenih' },
  { id: 2, label: 'Potvrda iznosa' },
  { id: 3, label: 'Platni listići' },
];

const PayrollRunWizard: React.FC<PayrollRunWizardProps> = ({ employees, paymentDate, onClose, onComplete }) => {
  const { settings } = useApp();
  const brand = settings.primaryColor;

  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [lineItems, setLineItems] = useState<RunLineItem[]>(() =>
    employees.map((emp) => {
      const override = LINE_OVERRIDES[emp.id] || {};
      return {
        id: emp.id,
        name: emp.name,
        position: emp.position,
        team: emp.team,
        avatar: emp.avatar,
        grossPay: override.grossPay ?? emp.salary,
        workedDays: override.workedDays ?? 22,
        standardDays: override.standardDays ?? 22,
        statusNote: override.statusNote ?? 'included',
        included: override.included ?? true,
        bonus: override.bonus ?? 0,
      };
    })
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);
  const [notified, setNotified] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (step !== 3) return;
    setProcessing(true);
    const timer = setTimeout(() => setProcessing(false), 1600);
    return () => clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredItems = useMemo(
    () => lineItems.filter((i) => `${i.name} ${i.position}`.toLowerCase().includes(searchTerm.toLowerCase())),
    [lineItems, searchTerm]
  );

  const includedItems = useMemo(() => lineItems.filter((i) => i.included), [lineItems]);
  const sickCount = useMemo(() => lineItems.filter((i) => i.statusNote === 'excluded_sick').length, [lineItems]);

  const toggleIncluded = (id: string) => {
    setLineItems((prev) => prev.map((i) => (i.id === id ? { ...i, included: !i.included } : i)));
  };

  const updateBonus = (id: string, value: number) => {
    setLineItems((prev) => prev.map((i) => (i.id === id ? { ...i, bonus: isNaN(value) ? 0 : value } : i)));
  };

  const calc = (item: RunLineItem) => {
    const effectiveGross = item.grossPay + item.bonus;
    const tax = effectiveGross * TAX_RATE;
    const employeeContrib = effectiveGross * EMPLOYEE_CONTRIB_RATE;
    const employerContrib = effectiveGross * EMPLOYER_CONTRIB_RATE;
    const net = effectiveGross - tax - employeeContrib;
    const companyCost = effectiveGross + employerContrib;
    return { effectiveGross, tax, employeeContrib, employerContrib, net, companyCost };
  };

  const totals = useMemo(() => {
    return includedItems.reduce(
      (acc, item) => {
        const c = calc(item);
        acc.companyCost += c.companyCost;
        acc.net += c.net;
        acc.tax += c.tax;
        acc.contrib += c.employeeContrib + c.employerContrib;
        return acc;
      },
      { companyCost: 0, net: 0, tax: 0, contrib: 0 }
    );
  }, [includedItems]);

  const includedGrossSum = useMemo(
    () => includedItems.reduce((sum, i) => sum + i.grossPay + i.bonus, 0),
    [includedItems]
  );

  const canGoNext = step === 1 ? includedItems.length > 0 : true;

  const handleComplete = () => {
    const payslipsByEmployee: Record<string, Payslip> = {};
    includedItems.forEach((item) => {
      const c = calc(item);
      payslipsByEmployee[item.id] = {
        id: `ps-run-${item.id}-${Date.now()}`,
        month: new Date(paymentDate).toLocaleDateString('en-US', { month: 'long' }) || 'Current',
        year: new Date(paymentDate).getFullYear() || new Date().getFullYear(),
        date: paymentDate,
        grossPay: c.effectiveGross,
        netPay: c.net,
        tax: c.tax,
        insurance: c.employeeContrib,
        status: 'Sent',
      };
    });
    onComplete({
      runDate: paymentDate,
      employeeIds: includedItems.map((i) => i.id),
      payslipsByEmployee,
    });
  };

  const currency = (n: number) => `€${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-5xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header + Step Indicator */}
        <div className="px-8 pt-8 pb-6 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Run Payroll</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                Obračunski ciklus za isplatu {paymentDate}
              </p>
            </div>
            {step !== 3 || processing ? (
              <button
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center">
            {STEPS.map((s, idx) => (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-3">
                  <div
                    className={
                      step >= s.id
                        ? 'h-9 w-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors text-white'
                        : 'h-9 w-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }
                    style={step >= s.id ? { backgroundColor: brand } : undefined}
                  >
                    {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                  </div>
                  <span
                    className={`text-xs font-bold uppercase tracking-widest hidden sm:block ${
                      step >= s.id ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                    }`}
                  >
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
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Zaposleni u obračunu</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {includedItems.length} <span className="text-sm text-slate-400 font-bold">/ {lineItems.length}</span>
                  </p>
                </div>
                <div className="p-5 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ukupan bruto iznos</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{currency(includedGrossSum)}</p>
                </div>
              </div>

              {sickCount > 0 && (
                <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-[1.5rem] border border-blue-100 dark:border-blue-800/50 flex items-start gap-3">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-900 dark:text-blue-100 leading-relaxed font-medium">
                    {sickCount} {sickCount === 1 ? 'zaposleni ima' : 'zaposlena imaju'} neobrađen zahtev za bolovanje koji može
                    uticati na obračun — proveriti pre nastavka.
                  </p>
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pretraži po imenu ili poziciji..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:ring-0 text-sm dark:text-slate-200 dark:placeholder-slate-500 transition-all"
                />
              </div>

              <div className="rounded-2xl border dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-4 py-3 w-10"></th>
                      <th className="px-4 py-3">Zaposleni</th>
                      <th className="px-4 py-3">Tim</th>
                      <th className="px-4 py-3">Bruto zarada</th>
                      <th className="px-4 py-3">Radni dani</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-800">
                    {filteredItems.map((item) => (
                      <tr
                        key={item.id}
                        className={`transition-colors ${item.included ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'opacity-50'}`}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={item.included}
                            onChange={() => toggleIncluded(item.id)}
                            style={{ accentColor: brand }}
                            className="h-4 w-4 rounded cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <img src={item.avatar} alt={item.name} className="h-9 w-9 rounded-xl object-cover border dark:border-slate-700" />
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{item.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{item.position}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{item.team}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-black text-slate-800 dark:text-slate-200">{currency(item.grossPay)}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {item.workedDays}/{item.standardDays}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border whitespace-nowrap ${statusBadgeClasses(
                              item.statusNote
                            )}`}
                          >
                            {statusLabel(item.statusNote, { worked: item.workedDays, standard: item.standardDays })}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Ukupan trošak kompanije', value: totals.companyCost, icon: Building2, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' },
                  { label: 'Ukupno za isplatu (neto)', value: totals.net, icon: Wallet, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' },
                  { label: 'Ukupni porezi', value: totals.tax, icon: Receipt, color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30' },
                  { label: 'Ukupni doprinosi', value: totals.contrib, icon: ShieldCheck, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
                ].map((kpi, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] border dark:border-slate-800 shadow-sm">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-4 ${kpi.color}`}>
                      <kpi.icon className="h-4 w-4" />
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{kpi.label}</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white mt-1 truncate">{currency(kpi.value)}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-800 flex items-center gap-3">
                <ChevronRight className="h-4 w-4 text-slate-400" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Planirani datum isplate: <span className="font-black text-slate-900 dark:text-white">{paymentDate}</span>
                </p>
              </div>

              <div className="rounded-2xl border dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-4 py-3">Zaposleni</th>
                      <th className="px-4 py-3">Bruto</th>
                      <th className="px-4 py-3">Porez</th>
                      <th className="px-4 py-3">Doprinosi</th>
                      <th className="px-4 py-3">Neto</th>
                      <th className="px-4 py-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-800">
                    {includedItems.map((item) => {
                      const c = calc(item);
                      const isExpanded = expandedId === item.id;
                      return (
                        <React.Fragment key={item.id}>
                          <tr
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                <img src={item.avatar} alt={item.name} className="h-8 w-8 rounded-lg object-cover border dark:border-slate-700" />
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">{currency(c.effectiveGross)}</td>
                            <td className="px-4 py-4 text-sm font-medium text-rose-600">-{currency(c.tax)}</td>
                            <td className="px-4 py-4 text-sm font-medium text-rose-600">-{currency(c.employeeContrib)}</td>
                            <td className="px-4 py-4 text-sm font-black text-emerald-600">{currency(c.net)}</td>
                            <td className="px-4 py-4 text-right text-slate-300">
                              <ChevronRight className="h-4 w-4 inline" />
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-slate-50/60 dark:bg-slate-800/30">
                              <td colSpan={6} className="px-4 pb-5 pt-1">
                                <div
                                  className="flex flex-wrap items-end gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border dark:border-slate-800"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                                      Osnovna bruto zarada
                                    </label>
                                    <p className="text-sm font-black text-slate-700 dark:text-slate-200 py-2">{currency(item.grossPay)}</p>
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                                      Bonus / naknada
                                    </label>
                                    <input
                                      type="number"
                                      value={item.bonus}
                                      onChange={(e) => updateBonus(item.id, parseFloat(e.target.value))}
                                      className="w-32 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:ring-0 text-sm p-2.5 font-bold dark:text-white"
                                    />
                                  </div>
                                  <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs">
                                    Ručna izmena mock iznosa radi demonstracije — bez stvarne logike obračuna.
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in duration-300">
              {processing ? (
                <div className="flex flex-col items-center justify-center py-24 gap-5">
                  <Loader2 className="h-12 w-12 animate-spin" style={{ color: brand }} />
                  <p className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">
                    Generišem platne listiće za {includedItems.length} zaposlenih...
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col items-center text-center py-6">
                    <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-9 w-9 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Obračun je uspešno završen</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      {includedItems.length} platnih listića generisano za {paymentDate}
                    </p>
                  </div>

                  <div className="rounded-2xl border dark:border-slate-800 overflow-hidden">
                    <div className="p-4 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        Generisani platni listići
                      </h4>
                    </div>
                    <div className="divide-y dark:divide-slate-800">
                      {includedItems.map((item) => {
                        const c = calc(item);
                        return (
                          <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-900 dark:text-white">{item.name}</p>
                                <p className="text-xs text-slate-500 font-medium">Neto: {currency(c.net)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                title="Pregled"
                                className="p-2.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                title="Preuzmi PDF"
                                className="p-2.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => {
                        setNotified(true);
                        setToast('Obaveštenja poslata');
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black border dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                      {notified ? <Check className="h-4 w-4 text-emerald-600" /> : <Send className="h-4 w-4" />}
                      {notified ? 'Obaveštenja poslata' : 'Pošalji obaveštenje zaposlenima'}
                    </button>
                    <button
                      onClick={() => {
                        handleComplete();
                      }}
                      className="flex-1 py-3 rounded-xl text-sm font-black text-white shadow-lg transition-all active:scale-[0.98]"
                      style={{ backgroundColor: brand }}
                    >
                      Zatvori
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Nav */}
        {step !== 3 && (
          <div className="px-8 py-5 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between shrink-0">
            <button
              onClick={onClose}
              className="text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors"
            >
              Otkaži
            </button>
            <div className="flex items-center gap-3">
              {step > 1 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-2 px-5 py-2.5 border dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all"
                >
                  <ChevronLeft className="h-4 w-4" /> Nazad
                </button>
              )}
              <button
                disabled={!canGoNext}
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: brand }}
              >
                {step === 2 ? 'Potvrdi i generiši platne listiće' : 'Dalje'}
                {step === 1 && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[80] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/10">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-bold">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollRunWizard;
