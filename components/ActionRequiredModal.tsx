
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Clock,
  UserPlus,
  Activity,
  CheckCircle2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Info,
  PartyPopper,
} from 'lucide-react';

export type ActionModalType = 'requests' | 'recruitment' | 'risk' | 'tasks';

export interface RequestItem {
  id: string;
  name: string;
  type: 'Leave' | 'Sick';
  period: string;
  days: number;
  daysWaiting: number;
  status: 'Pending' | 'Overdue' | 'Approved' | 'Denied';
}

export interface TaskItem {
  id: string;
  label: string;
  priority: 'Urgent' | 'Normal';
  due?: string;
  completed: boolean;
}

interface RecruitmentAlert {
  id: string;
  name: string;
  position: string;
  stage: 'Applied' | 'Interview' | 'Offer' | 'Stalled';
  alert: 'Awaiting Feedback' | 'Stalled 5+ days' | 'Interview Today';
}

interface RiskEmployee {
  id: string;
  profileId: string;
  name: string;
  risk: 'High' | 'Medium';
  reason: string;
  action: string;
}

const RECRUITMENT_ALERTS: RecruitmentAlert[] = [
  { id: 'r1', name: 'Alice Thompson', position: 'Senior Product Designer', stage: 'Interview', alert: 'Awaiting Feedback' },
  { id: 'r2', name: 'Mark Wilson', position: 'Senior Product Designer', stage: 'Interview', alert: 'Awaiting Feedback' },
  { id: 'r3', name: 'David Kim', position: 'Backend Engineer', stage: 'Applied', alert: 'Awaiting Feedback' },
  { id: 'r4', name: 'Laura Bianchi', position: 'Marketing Specialist', stage: 'Offer', alert: 'Awaiting Feedback' },
  { id: 'r5', name: 'James Carter', position: 'QA Specialist', stage: 'Interview', alert: 'Awaiting Feedback' },
  { id: 'r6', name: 'Nadia Petrov', position: 'Backend Engineer', stage: 'Stalled', alert: 'Stalled 5+ days' },
  { id: 'r7', name: 'Tom Becker', position: 'Legal Counsel', stage: 'Stalled', alert: 'Stalled 5+ days' },
  { id: 'r8', name: 'Yuki Tanaka', position: 'Senior Product Designer', stage: 'Interview', alert: 'Interview Today' },
];

const RISK_EMPLOYEES: RiskEmployee[] = [
  { id: 'risk-1', profileId: '2', name: 'Michael Chen', risk: 'High', reason: 'High burnout risk detected via feedback sentiment and declining engagement scores.', action: '1-on-1 Recommended' },
  { id: 'risk-2', profileId: '3', name: 'Emma Davis', risk: 'Medium', reason: 'Extended leave pattern combined with reduced check-in frequency.', action: 'Review Health' },
  { id: 'risk-3', profileId: '1', name: 'Sarah Jenkins', risk: 'Medium', reason: 'Slight dip in mood entries following the Q2 release cycle.', action: 'Monitor Mood' },
];

const stageColor = (stage: RecruitmentAlert['stage']) => {
  switch (stage) {
    case 'Applied': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    case 'Interview': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    case 'Offer': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    case 'Stalled': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  }
};

const alertColor = (alert: RecruitmentAlert['alert']) => {
  switch (alert) {
    case 'Awaiting Feedback': return 'bg-amber-500 text-white';
    case 'Stalled 5+ days': return 'bg-rose-500 text-white';
    case 'Interview Today': return 'bg-blue-500 text-white';
  }
};

const requestStatusColor = (status: RequestItem['status']) => {
  switch (status) {
    case 'Pending': return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
    case 'Overdue': return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    case 'Approved': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    case 'Denied': return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  }
};

const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').slice(0, 2);

const HEADER_META: Record<ActionModalType, { title: string; icon: React.ElementType; color: string }> = {
  requests: { title: 'Pending Requests', icon: Clock, color: 'bg-orange-500' },
  recruitment: { title: 'Recruitment Alerts', icon: UserPlus, color: 'bg-blue-500' },
  risk: { title: 'Employee Risk (AI)', icon: Activity, color: 'bg-rose-500' },
  tasks: { title: "Today's HR Tasks", icon: CheckCircle2, color: 'bg-emerald-500' },
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
    <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
      <PartyPopper className="h-6 w-6 text-slate-400" />
    </div>
    <p className="text-sm font-bold text-slate-300">{message}</p>
  </div>
);

interface ActionRequiredModalProps {
  type: ActionModalType;
  onClose: () => void;
  requestItems: RequestItem[];
  onRequestAction: (id: string, action: 'approve' | 'deny') => void;
  taskItems: TaskItem[];
  onToggleTask: (id: string) => void;
}

const ActionRequiredModal: React.FC<ActionRequiredModalProps> = ({
  type,
  onClose,
  requestItems,
  onRequestAction,
  taskItems,
  onToggleTask,
}) => {
  const [toast, setToast] = useState<string | null>(null);
  const meta = HEADER_META[type];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const sortedTasks = [...taskItems].sort((a, b) => {
    if (a.priority === b.priority) return 0;
    return a.priority === 'Urgent' ? -1 : 1;
  });
  const sortedRecruitment = [...RECRUITMENT_ALERTS].sort((a, b) => {
    const aTop = a.alert === 'Awaiting Feedback' ? 0 : 1;
    const bTop = b.alert === 'Awaiting Feedback' ? 0 : 1;
    return aTop - bTop;
  });

  const requestsUnresolved = requestItems.some((r) => r.status === 'Pending' || r.status === 'Overdue');
  const tasksUnresolved = taskItems.some((t) => !t.completed);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[640px] max-h-[85vh] flex flex-col bg-slate-900 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-lg ${meta.color}`}>
              <meta.icon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-black text-white">{meta.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 flex items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-5">
          {type === 'requests' && (
            requestsUnresolved ? (
              <div className="space-y-2">
                {requestItems.map((r) => (
                  <div
                    key={r.id}
                    className={`flex items-center gap-4 p-3.5 rounded-2xl border transition-colors ${
                      r.status === 'Overdue'
                        ? 'bg-rose-500/5 border-rose-500/20'
                        : 'bg-white/[0.03] border-white/10'
                    }`}
                  >
                    <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                      {initials(r.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white truncate">{r.name}</p>
                        {r.status === 'Overdue' && <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {r.type} • {r.period} ({r.days} {r.days === 1 ? 'day' : 'days'})
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border shrink-0 ${requestStatusColor(r.status)}`}>
                      {r.status}
                    </span>
                    {(r.status === 'Pending' || r.status === 'Overdue') && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => { onRequestAction(r.id, 'approve'); setToast(`${r.name}'s request approved`); }}
                          title="Approve"
                          className="p-1.5 text-emerald-400 hover:bg-emerald-500/15 rounded-lg transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { onRequestAction(r.id, 'deny'); setToast(`${r.name}'s request denied`); }}
                          title="Deny"
                          className="p-1.5 text-rose-400 hover:bg-rose-500/15 rounded-lg transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="All caught up — nothing pending here." />
            )
          )}

          {type === 'recruitment' && (
            <div className="space-y-2">
              {sortedRecruitment.map((c) => (
                <div key={c.id} className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                    {initials(c.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{c.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{c.position}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border shrink-0 ${stageColor(c.stage)}`}>
                    {c.stage}
                  </span>
                  <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest shrink-0 ${alertColor(c.alert)}`}>
                    {c.alert}
                  </span>
                  <button
                    onClick={() => setToast('Opening candidate profile...')}
                    className="text-[10px] font-black uppercase text-blue-400 hover:text-blue-300 shrink-0"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          )}

          {type === 'risk' && (
            <div className="space-y-4">
              {RISK_EMPLOYEES.map((e) => (
                <div key={e.id} className="p-5 rounded-3xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-100">{e.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                      e.risk === 'High' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {e.risk}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-400 leading-relaxed mb-4">{e.reason}</p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-blue-400">
                      {e.action} <ArrowRight className="h-3 w-3" />
                    </span>
                    <Link
                      to={`/profile/${e.profileId}`}
                      onClick={onClose}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
              <div className="pt-2 flex items-start gap-3">
                <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Insights are generated based on anonymized trend data. Individual privacy is fully protected.
                </p>
              </div>
            </div>
          )}

          {type === 'tasks' && (
            tasksUnresolved ? (
              <div className="space-y-2">
                {sortedTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onToggleTask(t.id)}
                    className={`flex items-center gap-4 p-3.5 rounded-2xl border cursor-pointer transition-colors ${
                      t.priority === 'Urgent' && !t.completed
                        ? 'bg-rose-500/5 border-white/10 border-l-4 border-l-rose-500'
                        : 'bg-white/[0.03] border-white/10'
                    } ${t.completed ? 'opacity-50' : 'hover:bg-white/[0.06]'}`}
                  >
                    <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                      t.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'
                    }`}>
                      {t.completed && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${t.completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                        {t.label}
                      </p>
                      {t.due && <p className="text-[11px] text-slate-400 mt-0.5">{t.due}</p>}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shrink-0 ${
                      t.priority === 'Urgent' ? 'bg-rose-500/15 text-rose-300' : 'bg-slate-500/15 text-slate-300'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="All caught up — nothing pending here." />
            )
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={() => setToast(`Full ${meta.title} module coming soon`)}
            className="px-4 py-2 border border-white/15 text-white/80 rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
          >
            View Full {meta.title}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white text-slate-900 rounded-xl text-sm font-black hover:bg-slate-100 transition-all"
          >
            Close
          </button>
        </div>
      </div>

      {toast && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[80] animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="flex items-center gap-3 bg-white text-slate-900 px-5 py-3.5 rounded-2xl shadow-2xl">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-bold">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionRequiredModal;
