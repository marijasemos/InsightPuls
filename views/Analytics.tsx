
import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import {
  Download, Filter, Calendar, TrendingUp, Users, Heart, Target,
  Sparkles, ArrowUpRight, ArrowDownRight, Info, ChevronDown, X
} from 'lucide-react';
import { useApp } from '../App';

const GROWTH_DATA = [
  { month: 'Jan', hires: 4, exits: 1, total: 120 },
  { month: 'Feb', hires: 6, exits: 2, total: 124 },
  { month: 'Mar', hires: 8, exits: 1, total: 131 },
  { month: 'Apr', hires: 3, exits: 4, total: 130 },
  { month: 'May', hires: 7, exits: 2, total: 135 },
  { month: 'Jun', hires: 5, exits: 0, total: 140 },
];

const SENTIMENT_DATA = [
  { day: 'Mon', mood: 4.2, events: 0 },
  { day: 'Tue', mood: 3.8, events: 1 }, 
  { day: 'Wed', mood: 3.5, events: 0 },
  { day: 'Thu', mood: 4.5, events: 1 }, 
  { day: 'Fri', mood: 4.7, events: 0 },
  { day: 'Sat', mood: 4.6, events: 0 },
  { day: 'Sun', mood: 4.8, events: 0 },
];

const DIVERSITY_DATA = [
  { name: 'Engineering', value: 45 },
  { name: 'Design', value: 15 },
  { name: 'Marketing', value: 20 },
  { name: 'HR', value: 10 },
  { name: 'Legal', value: 10 },
];

const COLORS = ['#2563eb', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444'];

const Analytics: React.FC = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const [timeRange, setTimeRange] = useState('Last 6 Months');
  const [openTooltip, setOpenTooltip] = useState<number | null>(null);
  const [pinned, setPinned] = useState(false);
  const tooltipRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!pinned) return;
    const handleClickOutside = (e: MouseEvent) => {
      const el = openTooltip !== null ? tooltipRefs.current[openTooltip] : null;
      if (el && !el.contains(e.target as Node)) {
        setPinned(false);
        setOpenTooltip(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [pinned, openTooltip]);

  const kpis = [
    {
      label: 'Retention Rate', value: '94.2%', change: '+1.2%', trend: 'up', icon: Target,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
      tooltip: `Calculated as (employees retained ÷ total employees at start of period) × 100, based on headcount changes over the selected time range (currently: ${timeRange}).`,
    },
    {
      label: 'Avg. eNPS', value: '72', change: '+5 pts', trend: 'up', icon: Heart,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30',
      tooltip: 'Average of individual employee Net Promoter Scores collected through periodic pulse surveys, aggregated across all respondents in the selected period.',
    },
    {
      label: 'Total Headcount', value: '142', change: '+8', trend: 'up', icon: Users,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30',
      tooltip: 'Current number of active employees across all teams, as of today. Excludes External Collaborators.',
    },
    {
      label: 'Turnover (YoY)', value: '5.8%', change: '-0.4%', trend: 'down', icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30',
      tooltip: 'Percentage of employees who left the company over the trailing 12 months, relative to average headcount during that period.',
    },
  ] as const;

  const chartColors = {
    grid: isDark ? '#1e293b' : '#f1f5f9',
    text: isDark ? '#94a3b8' : '#64748b',
    tooltipBg: isDark ? '#0f172a' : '#ffffff',
    tooltipText: isDark ? '#f8fafc' : '#0f172a',
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">People Insights</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-2">Data-driven organizational intelligence.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl text-sm font-bold shadow-sm transition-all hover:shadow-md">
            <Calendar className="h-4 w-4 text-blue-600" />
            {timeRange}
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all">
            <Download className="h-4 w-4" /> Export Report
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="relative bg-white dark:bg-slate-900 p-8 rounded-[2rem] border dark:border-slate-800 shadow-sm group hover:scale-[1.02] transition-all">
            <div className="flex items-start justify-between">
              <div className={`p-4 rounded-2xl ${kpi.color}`}>
                <kpi.icon className="h-6 w-6" />
              </div>
              <div className={`flex items-center gap-1 text-[11px] font-black ${kpi.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {kpi.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {kpi.change}
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{kpi.label}</p>
              <div
                ref={(el) => { tooltipRefs.current[i] = el; }}
                className="relative"
                onMouseEnter={() => { if (!pinned) setOpenTooltip(i); }}
                onMouseLeave={() => { if (!pinned) setOpenTooltip(null); }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPinned(true);
                    setOpenTooltip(i);
                  }}
                  className="flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  aria-label={`How ${kpi.label} is calculated`}
                >
                  <Info className="h-3.5 w-3.5" />
                </button>

                {openTooltip === i && (
                  <div className="absolute z-30 top-full left-1/2 -translate-x-1/2 mt-3 w-64 animate-in fade-in zoom-in-95 duration-150">
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 bg-slate-900 rotate-45" />
                    <div className="relative bg-slate-900 text-white rounded-2xl shadow-2xl p-4">
                      {pinned && (
                        <button
                          onClick={() => { setPinned(false); setOpenTooltip(null); }}
                          className="absolute top-2 right-2 h-5 w-5 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                          aria-label="Close tooltip"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1.5 pr-4">How This Is Calculated</p>
                      <p className="text-xs text-slate-200 leading-relaxed">{kpi.tooltip}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* Dynamic Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Growth & Stability</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Monthly hire/exit correlation</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={GROWTH_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: chartColors.text, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: chartColors.text, fontWeight: 'bold'}} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }} />
                <Area type="monotone" dataKey="hires" stackId="1" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} strokeWidth={4} />
                <Area type="monotone" dataKey="exits" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border dark:border-slate-800 flex gap-4">
             <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
               <Info className="h-5 w-5 text-blue-600" />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">Stability Insight</p>
               <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                 Net headcount increased by <span className="text-blue-600 font-black">15%</span> in Q2. March saw a peak in hiring, followed by a minor dip in April. Current stability is <span className="text-emerald-600 font-black">High</span>.
               </p>
             </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Cultural Sentiment</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Daily mood aggregation</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SENTIMENT_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: chartColors.text, fontWeight: 'bold'}} />
                <YAxis domain={[3, 5]} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: chartColors.text, fontWeight: 'bold'}} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }} />
                <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={5} dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 3, stroke: isDark ? '#0f172a' : '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/50 flex gap-4">
             <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
               <Sparkles className="h-5 w-5 text-indigo-600" />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-1">Engagement Insight</p>
               <p className="text-xs text-indigo-900 dark:text-indigo-100 font-medium leading-relaxed">
                 Mood peak identified on Thursday correlates with team social events. The midweek dip suggests <span className="font-black text-indigo-600">Meeting Overload</span>. Recommend "No-Meeting Wednesday" pilot.
               </p>
             </div>
          </div>
        </section>
      </div>
      
      {/* Predictive Module */}
      <section className="bg-slate-900 p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
        <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
          <Users className="h-64 w-64" />
        </div>
        <div className="flex-1 space-y-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Target className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black">Predictive Forecast</h2>
              <p className="text-slate-400 font-medium">Q4 Workforce Projection</p>
            </div>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl">
            Based on existing hiring velocity and historical seasonal patterns, InsightPro predicts a <span className="text-white font-black underline decoration-blue-500">12% growth</span> in headcount by December. Turnover risk remains below 5% for all departments except Engineering.
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-3 bg-blue-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all">
              Download Strategy Deck
            </button>
            <button className="px-8 py-3 bg-white/10 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all">
              Configure Alerts
            </button>
          </div>
        </div>
      </section>

      <div className="text-center py-10">
        <p className="text-xs text-slate-500 font-medium">
          Analytics are processed in real-time. Data accuracy: <span className="text-emerald-500 font-black">99.8%</span>. 
          Privacy compliance verified for <span className="font-black">ISO 27001</span>.
        </p>
      </div>
    </div>
  );
};

export default Analytics;
