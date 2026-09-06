
import React, { useState } from 'react';
import { Bell, Info, AlertTriangle, Send, Share2, MessageSquare, X, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../App';
import { UserRole } from '../types';

type Announcement = { id: string; title: string; content: string; author: string; date: string; priority: 'Critical' | 'Normal'; category: string };

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: '1', title: 'New Remote Work Policy', content: 'Starting next month, we are transitioning to a 3-day office model. Please check the full document in your profile.', author: 'HR Dept', date: 'Oct 28, 2023', priority: 'Critical', category: 'HR' },
  { id: '2', title: 'Pizza Friday is back!', content: 'Join us this Friday in the main lounge for the monthly pizza gathering.', author: 'Social Club', date: 'Oct 26, 2023', priority: 'Normal', category: 'Social' },
  { id: '3', title: 'System Maintenance', content: 'Internal payroll systems will be offline for 2 hours this Saturday for a scheduled AI update.', author: 'Tech Team', date: 'Oct 25, 2023', priority: 'Normal', category: 'Tech' },
];

const inputCls = 'w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-blue-500 focus:ring-0 text-sm p-3 text-slate-900 dark:text-white transition-colors';
const labelCls = 'text-xs font-bold text-slate-400 uppercase mb-1.5 block';

const todayLabel = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const Announcements: React.FC = () => {
  const { role, currentUser } = useApp();
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const [broadcastText, setBroadcastText] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<Announcement | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editPriority, setEditPriority] = useState<Announcement['priority']>('Normal');
  const [editCategory, setEditCategory] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const openEdit = (ann: Announcement) => {
    setEditTarget(ann);
    setEditTitle(ann.title);
    setEditContent(ann.content);
    setEditPriority(ann.priority);
    setEditCategory(ann.category);
  };

  const saveEdit = () => {
    if (!editTarget || !editTitle.trim() || !editContent.trim()) return;
    setAnnouncements((prev) => prev.map((a) => (a.id === editTarget.id ? { ...a, title: editTitle.trim(), content: editContent.trim(), priority: editPriority, category: editCategory.trim() || a.category } : a)));
    setEditTarget(null);
    setToast('Announcement updated');
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setAnnouncements((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    setDeleteTarget(null);
    setToast('Announcement deleted');
  };

  const handleSendBroadcast = () => {
    if (!broadcastText.trim()) return;
    const text = broadcastText.trim();
    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      title: text.length > 60 ? `${text.slice(0, 57)}...` : text,
      content: text,
      author: currentUser.name,
      date: todayLabel(),
      priority: 'Normal',
      category: 'HR',
    };
    setAnnouncements((prev) => [newAnnouncement, ...prev]);
    setBroadcastText('');
    setToast('Announcement sent');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Internal Communications</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Stay updated with the latest company intelligence.</p>
        </div>
        <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl">
          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Microsoft Teams: Connected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm relative overflow-hidden group transition-all hover:shadow-lg ${
                ann.priority === 'Critical' ? 'border-l-8 border-l-rose-500' : 'border-l-8 border-l-blue-500'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${ann.priority === 'Critical' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}`}>
                    {ann.priority === 'Critical' ? <AlertTriangle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{ann.category} • {ann.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  {role === UserRole.HR && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(ann)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit announcement">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(ann)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors" title="Delete announcement">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <button className="text-slate-400 hover:text-blue-600 transition-colors p-1.5">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{ann.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{ann.content}</p>
              
              <div className="mt-8 pt-6 border-t dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-500 dark:text-slate-400">{ann.author[0]}</div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{ann.author}</span>
                </div>
                <button className="flex items-center gap-2 text-xs font-black uppercase text-blue-600 dark:text-blue-400 hover:underline">
                  Read Full Post <Send className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl overflow-hidden relative">
            <h3 className="text-xl font-black mb-4">Broadcast Message</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">Send a global announcement to all employees and Teams channels instantly.</p>
            <textarea
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              className="w-full h-32 bg-white/5 border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
              placeholder="What's the news?"
            ></textarea>
            <button
              onClick={handleSendBroadcast}
              disabled={!broadcastText.trim()}
              className="w-full mt-4 py-3 bg-blue-600 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Send Alert
            </button>
          </div>

          <div className="p-8 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-[2.5rem]">
            <h4 className="text-sm font-bold dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" /> Recent Threads
            </h4>
            <div className="space-y-4">
              {['Off-site feedback', 'Q4 Strategy Discussion', 'Holiday schedule'].map((thread, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <span className="text-xs font-medium text-slate-500 group-hover:text-blue-500 transition-colors">{thread}</span>
                  <span className="text-[10px] font-bold text-slate-400">2h ago</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Edit Announcement Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setEditTarget(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-7 pt-6 pb-4 border-b dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Edit Announcement</h2>
              <button onClick={() => setEditTarget(null)} className="h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-7 space-y-5">
              <div>
                <label className={labelCls}>Title</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Content</label>
                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={4} className={`${inputCls} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Category</label>
                  <input type="text" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Priority</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Normal', 'Critical'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setEditPriority(p)}
                        className={`py-3 rounded-xl border-2 text-xs font-bold uppercase tracking-widest transition-all ${
                          editPriority === p ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-slate-100 dark:border-slate-700 text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-7 py-5 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-end gap-3">
              <button onClick={() => setEditTarget(null)} className="px-4 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={!editTitle.trim() || !editContent.trim()}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Save Changes
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
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Delete "{deleteTarget.title}"?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">This announcement will be removed from the feed for all employees. This action cannot be undone.</p>
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
    </div>
  );
};

export default Announcements;
