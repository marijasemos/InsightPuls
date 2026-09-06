
import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Search, 
  X, 
  UserX, 
  FileText, 
  Archive, 
  HelpCircle, 
  Upload, 
  Trash2,
  AlertTriangle,
  Mail,
  Info
} from 'lucide-react';
import { useApp } from '../App';
import { UserRole, OffboardingCase, OffboardingTask } from '../types';

const OFFBOARDING_CATEGORIES: OffboardingTask['category'][] = ['Access Handover', 'Compliance Review', 'Succession Planning', 'Equipment Return'];

const caseProgress = (item: OffboardingCase) =>
  item.tasks.length > 0
    ? Math.round((item.tasks.filter((t) => t.completed).length / item.tasks.length) * 100)
    : item.progress;

const Offboarding: React.FC = () => {
  const { role, settings, currentUser, offboardingCases, toggleOffboardingCaseTask } = useApp();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Find John Doe's tasks specifically for the employee view
  const doeCase = offboardingCases.find(c => c.name === 'John Doe');
  const [personalTasks, setPersonalTasks] = useState<OffboardingTask[]>(doeCase?.tasks || []);

  const selectedCase = offboardingCases.find(c => c.id === selectedCaseId);

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
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 p-10 rounded-[3rem] flex flex-col md:flex-row items-center gap-8 shadow-sm relative overflow-hidden">
          <div className="h-16 w-16 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center shrink-0 shadow-sm ring-1 ring-amber-200">
            <UserX className="h-10 w-10 text-amber-600" />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-black text-amber-900 dark:text-amber-200">Offboarding Checklist for {currentUser.name.split(' ')[0]}</h2>
            <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
              Confirmed Departure Date: <span className="font-black underline">December 20, 2023</span>.
            </p>
          </div>
          <div className="text-center md:text-right bg-white/50 dark:bg-slate-900/50 p-4 rounded-3xl border border-amber-100 dark:border-amber-800/30 min-w-[120px]">
             <div className="text-4xl font-black text-amber-600 leading-none">{progress}%</div>
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 mt-2">Overall Progress</p>
          </div>
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12">
            <Archive className="h-48 w-48 text-amber-600" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Tasks to Complete</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{personalTasks.filter(t => t.completed).length} / {personalTasks.length} Done</span>
            </div>
            <div className="space-y-3">
              {personalTasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)}
                  className={`p-6 rounded-3xl border transition-all cursor-pointer flex items-center gap-4 group active:scale-[0.98] ${
                    task.completed 
                    ? 'bg-amber-50/50 dark:bg-amber-900/5 border-amber-100 dark:border-amber-800/30 opacity-60' 
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-700 shadow-sm'
                  }`}
                >
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.completed ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 dark:border-slate-700'
                  }`}>
                    {task.completed && <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${task.completed ? 'text-amber-700 dark:text-amber-400 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                      {task.label}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{task.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-black dark:text-white mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" /> Departure Files
              </h3>
              <div className="p-10 border-2 border-dashed dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-amber-400 dark:hover:border-amber-600 transition-all group cursor-pointer bg-slate-50/50 dark:bg-slate-800/20">
                <Upload className="h-6 w-6 text-slate-400 group-hover:text-amber-500" />
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-amber-600">Upload Document</p>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
               <h4 className="text-xl font-black mb-2 flex items-center gap-2">
                 <HelpCircle className="h-5 w-5 text-amber-400" /> Exit Interview
               </h4>
               <p className="text-xs text-slate-400 leading-relaxed mb-6">
                 Your input is critical to our succession planning.
               </p>
               <button className="w-full py-4 bg-white text-slate-900 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-amber-100 transition-all shadow-lg active:scale-95">
                 Start Anonymous Interview
               </button>
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
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Exit Tracking</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Coordinate organizational departures.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search cases..." 
              className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
            <h3 className="font-bold text-slate-800 dark:text-white">Active Departures</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{offboardingCases.length} Cases</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">{settings.labels.employee}</th>
                  <th className="px-6 py-4">Last Day</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {offboardingCases.map((item) => (
                  <tr 
                    key={item.id} 
                    onClick={() => setSelectedCaseId(item.id)}
                    className={`group hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${selectedCaseId === item.id ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-400">
                          {item.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{item.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{item.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.lastDay}</p>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{item.type}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${caseProgress(item) === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
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
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-xl border-t-4 border-t-amber-500">
                <div className="flex items-start justify-between mb-8">
                  <h3 className="text-xl font-black dark:text-white">Case Detail</h3>
                  <button onClick={() => setSelectedCaseId(null)} className="text-slate-400 hover:text-slate-600 p-1">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-800">
                    <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xl">
                      {selectedCase.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold dark:text-white leading-tight">{selectedCase.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">Exit: {selectedCase.lastDay}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Progress</span>
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-amber-500'}`}
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
                          <Clock className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedCase.status}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Checklist</p>
                    <div className="space-y-4">
                      {OFFBOARDING_CATEGORIES.map((category) => (
                        <div key={category}>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">{category}</p>
                          <div className="space-y-0.5">
                            {selectedCase.tasks.filter((t) => t.category === category).map((task) => (
                              <div
                                key={task.id}
                                onClick={() => toggleOffboardingCaseTask(selectedCase.id, task.id)}
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
                      <Mail className="h-4 w-4" /> Message Departure
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-[2rem] border border-amber-100 dark:border-amber-800/30 flex items-start gap-4">
                 <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                 <div>
                    <p className="text-[10px] font-bold uppercase text-amber-700 tracking-widest">Exit Alert</p>
                    <p className="text-xs text-amber-800 dark:text-amber-400 mt-1 leading-relaxed">
                      {isComplete ? (
                        <>Offboarding for <span className="font-bold">{selectedCase.name}</span> completed successfully.</>
                      ) : (
                        <>System access deactivation scheduled for <span className="font-bold">{selectedCase.name}</span>.</>
                      )}
                    </p>
                 </div>
              </div>
            </div>
            );
          })() : (
            <div className="bg-slate-50 dark:bg-slate-900 p-12 rounded-[3rem] border-2 border-dashed dark:border-slate-800 text-center flex flex-col items-center justify-center min-h-[450px]">
              <div className="h-20 w-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-sm ring-1 ring-slate-100">
                <UserX className="h-10 w-10 text-slate-300" />
              </div>
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-sm">Select an exit case</h4>
              <p className="text-xs text-slate-400 mt-2 max-w-[200px] leading-relaxed">Click any employee from the table to manage their offboarding.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Offboarding;
