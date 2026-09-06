
import React, { useState } from 'react';
import { Heart, MessageSquare, ShieldCheck, CheckCircle, Clock, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import SurveysSection from '../components/SurveysSection';

type FeedbackTab = 'Daily Check-in' | 'Surveys & Evaluations';

const FeedbackMood: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FeedbackTab>('Daily Check-in');
  const [mood, setMood] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const moods = [
    { label: 'Very Low', emoji: '😞', color: 'hover:bg-red-50 dark:hover:bg-red-900/20', activeColor: 'border-red-600 dark:border-red-500 bg-red-50 dark:bg-red-900/20' },
    { label: 'Low', emoji: '🙁', color: 'hover:bg-orange-50 dark:hover:bg-orange-900/20', activeColor: 'border-orange-600 dark:border-orange-500 bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Neutral', emoji: '😐', color: 'hover:bg-slate-50 dark:hover:bg-slate-800', activeColor: 'border-slate-600 dark:border-slate-400 bg-slate-50 dark:bg-slate-800' },
    { label: 'Good', emoji: '🙂', color: 'hover:bg-blue-50 dark:hover:bg-blue-900/20', activeColor: 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Very Good', emoji: '😊', color: 'hover:bg-green-50 dark:hover:bg-green-900/20', activeColor: 'border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-900/20' },
  ];

  const mockHistory = [
    { id: '1', mood: 'Very Good', emoji: '😊', date: 'Today, 09:15', comment: 'Feeling very productive after the project kickoff.' },
    { id: '2', mood: 'Good', emoji: '🙂', date: 'Yesterday, 08:45', comment: null },
    { id: '3', mood: 'Neutral', emoji: '😐', date: 'Oct 24, 2023', comment: 'A bit overwhelmed with the new deadlines.' },
    { id: '4', mood: 'Good', emoji: '🙂', date: 'Oct 23, 2023', comment: 'Team meeting went great.' },
    { id: '5', mood: 'Low', emoji: '🙁', date: 'Oct 22, 2023', comment: 'Feeling a bit tired today.' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood) return;
    setSubmitted(true);
    // Simulate API call
    setTimeout(() => {
      // Logic would go here
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-12">
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        {(['Daily Check-in', 'Surveys & Evaluations'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Surveys & Evaluations' && <SurveysSection />}

      {activeTab === 'Daily Check-in' && (
      <>
      {submitted ? (
        <div className="max-w-xl mx-auto text-center animate-in fade-in zoom-in duration-300">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Thank you!</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Your input has been saved. Your feedback helps us make the workplace better for everyone.</p>
          <button 
            onClick={() => { setSubmitted(false); setMood(null); setComment(''); }}
            className="mt-8 px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Submit Another Entry
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <Heart className="h-8 w-8 mb-4 opacity-80" />
              <h2 className="text-2xl font-bold">How are you feeling today?</h2>
              <p className="text-indigo-100 mt-1">Your input is private and helps us improve the work environment.</p>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <SmileIcon className="h-32 w-32" />
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Mood Input */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Select Mood</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {moods.map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setMood(m.label)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all group ${
                      mood === m.label
                      ? m.activeColor
                      : 'border-slate-100 dark:border-slate-700 ' + m.color
                    }`}
                  >
                    <span className="text-3xl group-hover:scale-110 transition-transform">{m.emoji}</span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">{m.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Feedback Input */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-4 w-4 text-slate-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Additional Feedback (Optional)</h3>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="If you want, share what influenced your mood today..."
                className="w-full h-32 rounded-2xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-indigo-500 focus:ring-0 p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
              ></textarea>
            </section>

            {/* Privacy Note */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex gap-3 items-start border border-slate-100 dark:border-slate-700">
              <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                My comment is visible only to me and HR. It will <span className="font-bold text-slate-700 dark:text-slate-200">never</span> be shared with my team. Data is analyzed to identify trends, not to judge individuals.
              </p>
            </div>

            <button
              type="submit"
              disabled={!mood}
              className={`w-full py-4 rounded-2xl text-white font-bold transition-all transform active:scale-[0.98] ${
                mood
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none'
                : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
              }`}
            >
              Submit Entry
            </button>
          </form>
        </div>
      )}

      {/* Mood History Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-400" />
            Recent Mood History
          </h3>
          <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            Full Timeline <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 shadow-sm divide-y dark:divide-slate-800">
          {mockHistory.map((entry) => (
            <div key={entry.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
              <div className="flex items-center gap-4 flex-1">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-100 dark:border-slate-700 ${
                  entry.mood.includes('Very Good') ? 'bg-green-50 dark:bg-green-900/20' :
                  entry.mood.includes('Good') ? 'bg-blue-50 dark:bg-blue-900/20' :
                  entry.mood.includes('Neutral') ? 'bg-slate-50 dark:bg-slate-800' :
                  entry.mood.includes('Low') ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  {entry.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-white">{entry.mood}</span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" /> {entry.date}
                    </span>
                  </div>
                  {entry.comment ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
                      "{entry.comment}"
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic mt-1">No additional feedback provided</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 dark:text-slate-600">Entry Saved</span>
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl flex items-center justify-center gap-2 text-indigo-700 dark:text-indigo-300">
          <ShieldCheck className="h-4 w-4" />
          <p className="text-xs font-semibold">Your history is encrypted and private. Only aggregated team trends are visible to management.</p>
        </div>
      </section>
      </>
      )}
    </div>
  );
};

// Simplified icon component for background decorative use
const SmileIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

export default FeedbackMood;
