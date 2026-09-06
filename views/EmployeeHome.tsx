
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Heart, 
  ClipboardList, 
  ChevronRight, 
  UserCheck, 
  UserX, 
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Trophy,
  Coffee,
  Bell
} from 'lucide-react';
import { useApp } from '../App';

const EmployeeHome: React.FC = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [checkedIn, setCheckedIn] = useState(false);

  const onboardingProgress = 65;
  const isLeaving = false;

  return (
    <div className="space-y-10 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
            Hi, {currentUser.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-lg">
            Let's make today productive and meaningful.
          </p>
        </div>
        
        {/* Daily Smart Check-in Widget */}
        <div className={`transition-all duration-500 ${checkedIn ? 'opacity-60 scale-95' : 'scale-100'}`}>
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
            <div className="flex items-center gap-6 relative z-10">
              {!checkedIn ? (
                <>
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black dark:text-white">Daily Check-in</h3>
                    <p className="text-xs text-slate-500 font-medium">How are you feeling today?</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {['😊', '😐', '🙁'].map((emoji, i) => (
                      <button 
                        key={i}
                        onClick={() => setCheckedIn(true)}
                        className="h-10 w-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-xl text-lg transition-all transform hover:scale-110 active:scale-90"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 py-1">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Mood logged. Teams status updated.</span>
                </div>
              )}
            </div>
            <div className="absolute -bottom-4 -right-4 h-16 w-16 bg-indigo-600 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        </div>
      </div>

      {/* Highlights Bar */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => navigate('/announcements')}
          className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border dark:border-slate-800 flex items-center gap-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group"
        >
          <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-left">
             <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Unread news</p>
             <p className="text-sm font-black dark:text-white">Remote policy update</p>
          </div>
        </button>

        <button 
          onClick={() => navigate('/office')}
          className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border dark:border-slate-800 flex items-center gap-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group"
        >
          <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <Coffee className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="text-left">
             <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Office</p>
             <p className="text-sm font-black dark:text-white">Desk Delta-4 booked</p>
          </div>
        </button>

        <button 
          onClick={() => navigate('/feedback')}
          className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border dark:border-slate-800 flex items-center gap-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group"
        >
          <div className="h-12 w-12 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
            <Trophy className="h-6 w-6 text-amber-600" />
          </div>
          <div className="text-left">
             <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Recognition</p>
             <p className="text-sm font-black dark:text-white">New Kudos received</p>
          </div>
        </button>
      </section>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Priority Journey */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border dark:border-slate-800 shadow-sm overflow-hidden group hover:shadow-lg transition-all">
            <div className="p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <UserCheck className="h-7 w-7 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Integration</span>
                  <p className="text-sm font-black text-blue-600 mt-1">{onboardingProgress}% Ready</p>
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">My Onboarding</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8">We're so glad you're part of the executive team!</p>
              
              <div className="space-y-5">
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full shadow-lg" style={{ width: `${onboardingProgress}%` }}></div>
                </div>
                <button 
                  onClick={() => navigate('/onboarding')}
                  className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-3 group"
                >
                  Continue Journey <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-8 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <h3 className="font-bold text-slate-800 dark:text-white">Pending Approvals</h3>
              <button onClick={() => navigate('/requests')} className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <tbody className="divide-y dark:divide-slate-800">
                  {[
                    { type: 'Sick Leave', date: 'Oct 12, 2023', status: 'Approved' },
                    { type: 'Vacation', date: 'Nov 15-20, 2023', status: 'Pending' },
                  ].map((req, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                      <td className="px-10 py-6 font-black text-slate-800 dark:text-slate-200">{req.type}</td>
                      <td className="px-10 py-6 text-slate-500 dark:text-slate-400 font-medium">{req.date}</td>
                      <td className="px-10 py-6 text-right">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          req.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Peer Recognition Kudos */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Sparkles className="h-32 w-32" />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-4">Send Kudos</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">Recognize a colleague's hard work. Your "Insight Points" build a stronger culture.</p>
              <div className="space-y-4">
                <select className="w-full bg-white/5 border-white/10 rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-500">
                  <option>Select Colleague...</option>
                  <option>Alex Rivera</option>
                  <option>Sarah Jenkins</option>
                  <option>Michael Chen</option>
                </select>
                <textarea 
                  className="w-full h-24 bg-white/5 border-white/10 rounded-xl p-3 text-xs placeholder:text-slate-600"
                  placeholder="Why are they awesome?"
                ></textarea>
                <button className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95">
                  Give Props
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-sm">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Active Tasks</h4>
            <div className="space-y-4">
               {[
                  'Finalize Q4 Hiring Annex',
                  'Return Hardware (Old Laptop)',
                  'Complete Security Audit'
                ].map((task, i) => (
                  <div key={i} className="flex items-start gap-3 group cursor-pointer">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 transition-transform group-hover:scale-150"></div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-blue-500 transition-colors">{task}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Anchor */}
      <div className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border dark:border-slate-800 flex items-center gap-6 shadow-sm border-dashed">
        <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0">
          <ShieldCheck className="h-6 w-6 text-slate-500" />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          <span className="font-black text-slate-900 dark:text-slate-100">Security & Privacy:</span> All mood data and feedback comments are encrypted and processed anonymously for team analytics. Peer kudos are visible only to the recipient and HR.
        </p>
      </div>
    </div>
  );
};

export default EmployeeHome;
