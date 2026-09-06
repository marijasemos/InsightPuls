
import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  UserPlus,
  Activity,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Info
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useApp } from '../App';
import ActionRequiredModal, { ActionModalType, RequestItem, TaskItem } from '../components/ActionRequiredModal';

const data = [
  { name: 'Jan', headcount: 120, departures: 2, mood: 4.2 },
  { name: 'Feb', headcount: 125, departures: 1, mood: 4.0 },
  { name: 'Mar', headcount: 128, departures: 3, mood: 4.1 },
  { name: 'Apr', headcount: 135, departures: 2, mood: 3.8 },
  { name: 'May', headcount: 140, departures: 0, mood: 4.5 },
];

const INITIAL_REQUESTS: RequestItem[] = [
  { id: 'req-1', name: 'Sarah Wilson', type: 'Sick', period: 'Oct 24 - Oct 25', days: 2, daysWaiting: 4, status: 'Overdue' },
  { id: 'req-2', name: 'Emma Davis', type: 'Leave', period: 'Nov 1 - Nov 5', days: 5, daysWaiting: 4, status: 'Overdue' },
  { id: 'req-3', name: 'Noah Taylor', type: 'Sick', period: 'Oct 20 - Oct 21', days: 2, daysWaiting: 5, status: 'Overdue' },
  { id: 'req-4', name: 'Sarah Jenkins', type: 'Leave', period: 'Dec 22 - Jan 2', days: 10, daysWaiting: 2, status: 'Pending' },
  { id: 'req-5', name: 'Michael Chen', type: 'Sick', period: 'Oct 24 - Oct 25', days: 2, daysWaiting: 0, status: 'Pending' },
  { id: 'req-6', name: 'Sofia Martinez', type: 'Leave', period: 'Nov 10 - Nov 12', days: 3, daysWaiting: 1, status: 'Pending' },
  { id: 'req-7', name: 'Robert Fox', type: 'Leave', period: 'Nov 20 - Nov 22', days: 3, daysWaiting: 1, status: 'Pending' },
  { id: 'req-8', name: 'Jenny Wilson', type: 'Sick', period: 'Oct 28 - Oct 29', days: 2, daysWaiting: 0, status: 'Pending' },
  { id: 'req-9', name: 'David Kim', type: 'Leave', period: 'Nov 15 - Nov 18', days: 4, daysWaiting: 2, status: 'Pending' },
  { id: 'req-10', name: 'Priya Nair', type: 'Sick', period: 'Oct 26 - Oct 27', days: 2, daysWaiting: 1, status: 'Pending' },
  { id: 'req-11', name: 'Alex Rivera', type: 'Leave', period: 'Dec 1 - Dec 3', days: 3, daysWaiting: 0, status: 'Pending' },
  { id: 'req-12', name: 'Maria Chen', type: 'Leave', period: 'Nov 8 - Nov 9', days: 2, daysWaiting: 1, status: 'Pending' },
];

const INITIAL_TASKS: TaskItem[] = [
  { id: 'task-1', label: "Review Sarah Wilson's sick leave", priority: 'Urgent', due: 'Due today, 2:00 PM', completed: false },
  { id: 'task-2', label: 'Approve Q2 headcount request', priority: 'Urgent', due: 'Due today, 5:00 PM', completed: false },
  { id: 'task-3', label: 'Send offer to Alice Thompson', priority: 'Normal', due: 'Due tomorrow', completed: false },
  { id: 'task-4', label: "Confirm Robert Fox's exit interview slot", priority: 'Normal', completed: false },
  { id: 'task-5', label: "Update Noah Taylor's onboarding checklist", priority: 'Normal', completed: false },
  { id: 'task-6', label: 'Reply to Finance re: payroll sync', priority: 'Normal', completed: false },
];

const HRDashboard: React.FC = () => {
  const { theme, settings } = useApp();
  const isDark = theme === 'dark';
  const [activeModal, setActiveModal] = useState<ActionModalType | null>(null);
  const [requestItems, setRequestItems] = useState<RequestItem[]>(INITIAL_REQUESTS);
  const [taskItems, setTaskItems] = useState<TaskItem[]>(INITIAL_TASKS);

  const pendingRequestsCount = requestItems.filter((r) => r.status === 'Pending' || r.status === 'Overdue').length;
  const remainingTasksCount = taskItems.filter((t) => !t.completed).length;

  const handleRequestAction = (id: string, action: 'approve' | 'deny') => {
    setRequestItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: action === 'approve' ? 'Approved' : 'Denied' } : r))
    );
  };

  const handleToggleTask = (id: string) => {
    setTaskItems((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 animate-in fade-in duration-500 pb-20">
      <div className="flex-1 space-y-10 min-w-0">
        {/* Critical Section: Action Required */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black flex items-center gap-3 dark:text-white">
              <div className="h-8 w-8 rounded-lg bg-rose-500 flex items-center justify-center">
                <AlertCircle className="text-white h-5 w-5" />
              </div>
              Action Required Today
            </h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Priority Queue</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: 'requests' as ActionModalType, label: `Pending ${settings.labels.requests}`, value: String(pendingRequestsCount), sub: '3 over 3 days', color: 'bg-white dark:bg-slate-900 border-l-4 border-l-orange-500', icon: Clock, iconColor: 'text-orange-500' },
              { key: 'recruitment' as ActionModalType, label: 'Recruitment Alerts', value: '8', sub: '5 awaiting feedback', color: 'bg-white dark:bg-slate-900 border-l-4 border-l-blue-500', icon: UserPlus, iconColor: 'text-blue-500' },
              { key: 'risk' as ActionModalType, label: `${settings.labels.employee} Risk (AI)`, value: '3', sub: 'High risk detected', color: 'bg-white dark:bg-slate-900 border-l-4 border-l-rose-500', icon: Activity, iconColor: 'text-rose-500' },
              { key: 'tasks' as ActionModalType, label: "Today's HR Tasks", value: String(remainingTasksCount), sub: '2 urgent tasks', color: 'bg-white dark:bg-slate-900 border-l-4 border-l-emerald-500', icon: CheckCircle2, iconColor: 'text-emerald-500' },
            ].map((card, i) => (
              <div key={i} className={`p-6 rounded-2xl border dark:border-slate-800 flex flex-col justify-between shadow-sm transition-all hover:shadow-md ${card.color}`}>
                <div>
                  <div className={`h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 ${card.iconColor}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{card.label}</p>
                  <p className="text-3xl font-black mt-1 dark:text-white">{card.value}</p>
                </div>
                <div className="mt-4 pt-4 border-t dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{card.sub}</span>
                  <button
                    onClick={() => setActiveModal(card.key)}
                    className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Informational: Operational Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Leave & Sick {settings.labels.requests}</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">Monitoring workforce availability</p>
              </div>
              <button className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline">Full History</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b dark:border-slate-800">
                  <tr>
                    <th className="pb-4 px-2">Name</th>
                    <th className="pb-4 px-2">Type</th>
                    <th className="pb-4 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800">
                  {[
                    { name: 'Sarah Wilson', type: 'Sick', status: 'Pending', statusColor: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
                    { name: 'Michael Chen', type: 'Leave', status: 'Approved', statusColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
                    { name: 'Emma Davis', type: 'Leave', status: 'Overdue', statusColor: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-2 font-bold dark:text-slate-200">{row.name}</td>
                      <td className="py-4 px-2 text-slate-500 dark:text-slate-400">{row.type}</td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${row.statusColor}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recruitment Pipeline</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">Active hiring status</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Applied', value: 45, color: 'bg-blue-500', trend: '+12%' },
                { label: 'Interview', value: 12, color: 'bg-indigo-500', trend: '+2' },
                { label: 'Offer', value: 4, color: 'bg-emerald-500', trend: 'Stable' },
                { label: 'Stalled', value: 6, color: 'bg-rose-500', trend: '-1' },
              ].map((step, i) => (
                <div key={i} className="p-5 rounded-2xl border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{step.value}</div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{step.trend}</span>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">{step.label}</div>
                  <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${step.color}`} style={{ width: `${(step.value / 45) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Strategic Analytics with Insight Layer */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border dark:border-slate-800 shadow-sm">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Headcount Trend & Mood Correlation
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                    <Area type="monotone" dataKey="headcount" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="w-full md:w-72 flex flex-col justify-center">
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border border-blue-100 dark:border-blue-800/50">
                <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
                  <Sparkles className="h-4 w-4" />
                  <h4 className="text-xs font-black uppercase tracking-widest">AI Insight</h4>
                </div>
                <p className="text-xs text-blue-900 dark:text-blue-100 leading-relaxed font-medium">
                  Headcount grew by <span className="font-black">16%</span> since January. Note that <span className="font-black text-rose-500">mood dips</span> in April coincide with the heavy Q2 release cycle. Recommend early team-building for May.
                </p>
                <button className="mt-4 text-[10px] font-black uppercase text-blue-600 hover:underline flex items-center gap-1">
                  View full report <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Persistent Insight Sidebar */}
      <aside className="w-full xl:w-80 space-y-6">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl sticky top-24 border dark:border-slate-800 overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sparkles className="h-32 w-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold leading-tight">Priority Insights</h3>
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Real-time Analysis</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { employee: 'Robert Fox', risk: 'High', reason: 'High burnout risk detected via feedback sentiment.', action: '1-on-1 Recommended' },
                { employee: 'Engineering', risk: 'Medium', reason: 'Engagement drop in backend sub-team.', action: 'Review Health' },
                { employee: 'Jenny Wilson', risk: 'Success', reason: 'Onboarding track 100% completed.', action: 'Confirm Integration' },
              ].map((alert, i) => (
                <div key={i} className="p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-100">{alert.employee}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${
                      alert.risk === 'High' ? 'bg-red-500 text-white' : 
                      alert.risk === 'Medium' ? 'bg-amber-500 text-white' : 
                      'bg-emerald-500 text-white'
                    }`}>
                      {alert.risk}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                    {alert.reason}
                  </p>
                  <button className="flex items-center gap-2 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors">
                    {alert.action} <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
              <Info className="h-4 w-4 text-slate-500" />
              <p className="text-[9px] text-slate-500 leading-tight">
                Insights are generated based on anonymized trend data. Individual privacy is fully protected.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {activeModal && (
        <ActionRequiredModal
          type={activeModal}
          onClose={() => setActiveModal(null)}
          requestItems={requestItems}
          onRequestAction={handleRequestAction}
          taskItems={taskItems}
          onToggleTask={handleToggleTask}
        />
      )}
    </div>
  );
};

export default HRDashboard;
