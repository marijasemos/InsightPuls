
import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Mail, 
  ShieldCheck, 
  Video, 
  Users, 
  Search, 
  Plus, 
  ChevronRight, 
  X,
  UserCheck,
  LayoutGrid,
  Info
} from 'lucide-react';
import { useApp } from '../App';
import { UserRole, OnboardingCase, OnboardingTask } from '../types';

const ONBOARDING_CATEGORIES: OnboardingTask['category'][] = ['Administrative', 'Team & Culture', 'Tools & Setup'];

const caseProgress = (item: OnboardingCase) =>
  item.tasks.length > 0
    ? Math.round((item.tasks.filter((t) => t.completed).length / item.tasks.length) * 100)
    : item.progress;

const Onboarding: React.FC = () => {
  const { role, settings, currentUser, onboardingCases, toggleOnboardingCaseTask } = useApp();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Find John Doe's tasks specifically for the employee view
  const doeCase = onboardingCases.find(c => c.name === 'John Doe');
  const [personalTasks, setPersonalTasks] = useState<OnboardingTask[]>(doeCase?.tasks || []);

  const selectedCase = onboardingCases.find(c => c.id === selectedCaseId);

  // --- EMPLOYEE VIEW (Personal Journey) ---
  if (role === UserRole.EMPLOYEE) {
    const toggleTask = (id: string) => {
      setPersonalTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const progress = personalTasks.length > 0 
      ? Math.round((personalTasks.filter(t => t.completed).length / personalTasks.length) * 100)
      : 0;

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border dark:border-slate-800 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">Welcome, {currentUser.name.split(' ')[0]}! 🚀</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-lg">
              Your onboarding journey as <span className="text-blue-600 font-black">{currentUser.position}</span> is currently active.
            </p>
            <div className="pt-6">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Current Progress</span>
                <span className="text-sm font-black text-blue-600 dark:text-blue-400">{progress}%</span>
              </div>
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-blue-500/20" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <UserCheck className="h-48 w-48 text-blue-600" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Your Tasks</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{personalTasks.filter(t => t.completed).length} of {personalTasks.length} Done</span>
            </div>
            <div className="space-y-3">
              {personalTasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer flex items-center gap-4 group hover:scale-[1.02] active:scale-95 ${
                    task.completed 
                    ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30' 
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-800 shadow-sm'
                  }`}
                >
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-slate-700'
                  }`}>
                    {task.completed && <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${task.completed ? 'text-emerald-700 dark:text-emerald-400 line-through opacity-60' : 'text-slate-800 dark:text-slate-200'}`}>
                      {task.label}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{task.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-8">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
               <div className="relative z-10">
                 <h4 className="text-xl font-black mb-2">Internal Support</h4>
                 <p className="text-sm text-slate-400 leading-relaxed mb-6">
                   Your integration partner is <span className="text-white font-bold">Alex Rivera</span>. 
                 </p>
                 <button className="w-full py-3.5 bg-blue-600 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                   <Mail className="h-4 w-4" /> Message Integration Lead
                 </button>
               </div>
               <div className="absolute -bottom-12 -right-12 h-48 w-48 bg-blue-600 rounded-full opacity-10 blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // --- HR VIEW (Management Console) ---
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Onboarding Tracking</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Global tracking of all active hire integrations.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search hires..." 
              className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
            <h3 className="font-bold text-slate-800 dark:text-white">Active Onboardings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">{settings.labels.employee}</th>
                  <th className="px-6 py-4">Start Date</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {onboardingCases.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => setSelectedCaseId(item.id)}
                    className={`group hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${selectedCaseId === item.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-black text-xs text-blue-600">
                          {item.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{item.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{item.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.startDate}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${caseProgress(item) === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                            style={{ width: `${caseProgress(item)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-black dark:text-slate-400">{caseProgress(item)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          {selectedCase ? (() => {
            const progress = caseProgress(selectedCase);
            const isComplete = progress === 100;
            return (
            <div className="animate-in fade-in zoom-in-95 duration-300 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-xl border-t-4 border-t-blue-500">
                <div className="flex items-start justify-between mb-8">
                  <h3 className="text-xl font-black dark:text-white">Case Summary</h3>
                  <button onClick={() => setSelectedCaseId(null)} className="text-slate-400 hover:text-slate-600 p-1">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-800">
                    <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl">
                      {selectedCase.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold dark:text-white leading-tight">{selectedCase.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">Starting {selectedCase.startDate}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Progress</span>
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-blue-600'}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</p>
                    <div className="flex items-center gap-3">
                      {isComplete ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Completed</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedCase.status}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Checklist</p>
                    <div className="space-y-4">
                      {ONBOARDING_CATEGORIES.map((category) => (
                        <div key={category}>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">{category}</p>
                          <div className="space-y-0.5">
                            {selectedCase.tasks.filter((t) => t.category === category).map((task) => (
                              <div
                                key={task.id}
                                onClick={() => toggleOnboardingCaseTask(selectedCase.id, task.id)}
                                className="flex items-center gap-3 py-1.5 px-1 -mx-1 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                              >
                                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                  task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600'
                                }`}>
                                  {task.completed && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                                </div>
                                <p className={`text-xs font-bold ${task.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {task.label}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t dark:border-slate-800 flex flex-col gap-2">
                    <button className="w-full py-3.5 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2">
                      <Mail className="h-4 w-4" /> Message Hire
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-800/30 flex items-start gap-4">
                 <Info className="h-5 w-5 text-blue-600 shrink-0" />
                 <div>
                    <p className="text-[10px] font-bold uppercase text-blue-700 tracking-widest">HR Insight</p>
                    <p className="text-xs text-blue-800 dark:text-blue-400 mt-1 leading-relaxed">
                      {isComplete ? (
                        <>Integration for <span className="font-bold">{selectedCase.name}</span> completed successfully.</>
                      ) : (
                        <>Integration for <span className="font-bold">{selectedCase.name}</span> is proceeding according to the standard workflow.</>
                      )}
                    </p>
                 </div>
              </div>
            </div>
            );
          })() : (
            <div className="bg-slate-50 dark:bg-slate-900 p-12 rounded-[3rem] border-2 border-dashed dark:border-slate-800 text-center flex flex-col items-center justify-center min-h-[450px]">
              <div className="h-20 w-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-sm ring-1 ring-slate-100">
                <UserCheck className="h-10 w-10 text-slate-300" />
              </div>
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-sm">Select a case</h4>
              <p className="text-xs text-slate-400 mt-2 max-w-[200px] leading-relaxed">Click any record to manage their organizational integration.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
