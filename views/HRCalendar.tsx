
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, UserCheck, Search, Filter, Plus, X, CheckCircle2 } from 'lucide-react';
import { useApp } from '../App';
import { UserRole } from '../types';

type AgendaItem = { id: string; title: string; type: 'Employee' | 'Candidate'; time: string; duration: string; participants: string[]; color: string };

const MOCK_EVENTS: AgendaItem[] = [
  { id: '1', title: 'Team Sync: Creative', type: 'Employee', time: '10:00 AM', duration: '1h', participants: ['Alex R.', 'Sarah J.'], color: 'blue' },
  { id: '2', title: 'Interview: Frontend Candidate', type: 'Candidate', time: '1:30 PM', duration: '45m', participants: ['Michael C.', 'Noah T.'], color: 'amber' },
  { id: '3', title: '1-on-1: Sarah Jenkins', type: 'Employee', time: '3:00 PM', duration: '30m', participants: ['Alex R.'], color: 'blue' },
];

const inputCls = 'w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-blue-500 focus:ring-0 text-sm p-3 text-slate-900 dark:text-white transition-colors';
const labelCls = 'text-xs font-bold text-slate-400 uppercase mb-1.5 block';

const HRCalendar: React.FC = () => {
  const { role } = useApp();
  const [agenda, setAgenda] = useState<AgendaItem[]>(MOCK_EVENTS);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'Employee' | 'Candidate'>('Employee');
  const [newTime, setNewTime] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newParticipants, setNewParticipants] = useState('');
  const [wholeTeam, setWholeTeam] = useState(false);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const resetCreateForm = () => {
    setNewTitle('');
    setNewType('Employee');
    setNewTime('');
    setNewDuration('');
    setNewParticipants('');
    setWholeTeam(false);
  };

  const canCreate = newTitle.trim() && newTime.trim() && newDuration.trim();

  const handleCreate = () => {
    if (!canCreate) return;
    const participants = wholeTeam
      ? ['Whole Team']
      : newParticipants.split(',').map((p) => p.trim()).filter(Boolean);
    setAgenda((prev) => [
      {
        id: `evt-${Date.now()}`,
        title: newTitle.trim(),
        type: newType,
        time: newTime.trim(),
        duration: newDuration.trim(),
        participants: participants.length > 0 ? participants : ['You'],
        color: newType === 'Candidate' ? 'amber' : 'blue',
      },
      ...prev,
    ]);
    resetCreateForm();
    setCreateOpen(false);
    setToast('Event scheduled');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Smart Scheduler</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Distinguish between workforce syncs and talent acquisition.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> New Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-[3rem] border dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-8 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-4">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-black dark:text-white">October 2023</h3>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-xs font-bold shadow-sm">Today</button>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                <button className="px-3 py-1 bg-white dark:bg-slate-700 rounded-lg text-[10px] font-black uppercase shadow-sm">Week</button>
                <button className="px-3 py-1 text-[10px] font-black uppercase text-slate-400">Month</button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-7 border-b dark:border-slate-800">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 border-r dark:border-slate-800 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 h-[600px] divide-x divide-y dark:divide-slate-800 border-b dark:border-slate-800">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="p-4 bg-white dark:bg-slate-900 group relative">
                <span className={`text-xs font-bold ${i === 27 ? 'text-blue-600' : 'text-slate-400'}`}>{i - 3 > 0 && i - 3 < 32 ? i - 3 : ''}</span>
                {i === 27 && (
                  <div className="mt-2 space-y-1">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg border-l-4 border-l-blue-600">
                      <p className="text-[8px] font-black text-blue-800 dark:text-blue-200 truncate">Staff Sync</p>
                    </div>
                    <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-lg border-l-4 border-l-amber-600">
                      <p className="text-[8px] font-black text-amber-800 dark:text-amber-200 truncate">Interview</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800">
            <h4 className="text-sm font-black dark:text-white mb-6 uppercase tracking-widest">Today's Agenda</h4>
            <div className="space-y-4">
              {agenda.map((evt) => (
                <div key={evt.id} className="p-4 rounded-2xl border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 group hover:border-blue-300 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                      evt.type === 'Employee' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {evt.type}
                    </span>
                    <Clock className="h-3 w-3 text-slate-400" />
                  </div>
                  <h5 className="text-sm font-black dark:text-slate-200">{evt.title}</h5>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">{evt.time} • {evt.duration}</p>
                  <div className="mt-3 flex -space-x-2">
                    {evt.participants.map((p, idx) => (
                      <div key={idx} className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-bold">
                        {p[0]}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <UserCheck className="h-10 w-10 mb-4" />
              <h4 className="text-xl font-black mb-2">Interview Ready?</h4>
              <p className="text-xs text-blue-100 leading-relaxed mb-6">AI has pre-screened the candidate's portfolio. Review the summary before the call.</p>
              <button className="w-full py-3 bg-white text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all">
                Open AI Summary
              </button>
            </div>
            <div className="absolute -bottom-12 -right-12 h-48 w-48 bg-white opacity-5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
          </div>
        </div>
      </div>

      {/* New Event Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => { setCreateOpen(false); resetCreateForm(); }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-7 pt-6 pb-4 border-b dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">New Event</h2>
              <button onClick={() => { setCreateOpen(false); resetCreateForm(); }} className="h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-7 space-y-5">
              <div>
                <label className={labelCls}>Title</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Design Review" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['Employee', 'Candidate'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewType(t)}
                      className={`p-3 rounded-xl border-2 text-xs font-bold uppercase tracking-widest transition-all ${
                        newType === t ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-slate-100 dark:border-slate-700 text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Time</label>
                  <input type="text" value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="e.g. 2:00 PM" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Duration</label>
                  <input type="text" value={newDuration} onChange={(e) => setNewDuration(e.target.value)} placeholder="e.g. 30m" className={inputCls} />
                </div>
              </div>

              {role === UserRole.HR && (
                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 cursor-pointer">
                  <input type="checkbox" checked={wholeTeam} onChange={(e) => setWholeTeam(e.target.checked)} className="h-4 w-4 rounded accent-blue-600" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Visible to whole team (not just me)</span>
                </label>
              )}

              {!wholeTeam && (
                <div>
                  <label className={labelCls}>Participants</label>
                  <input type="text" value={newParticipants} onChange={(e) => setNewParticipants(e.target.value)} placeholder="e.g. Alex R., Sarah J." className={inputCls} />
                </div>
              )}
            </div>
            <div className="px-7 py-5 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-end gap-3">
              <button onClick={() => { setCreateOpen(false); resetCreateForm(); }} className="px-4 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!canCreate}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Schedule Event
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
    </div>
  );
};

export default HRCalendar;
