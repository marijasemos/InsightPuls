
import React, { useState } from 'react';
import { KeyRound, Globe, Bell, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '../App';

const LANGUAGES = ['English', 'Srpski', 'Deutsch'];

const labelCls = 'text-[10px] font-bold uppercase tracking-widest text-slate-400';
const inputCls = 'w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:ring-0 text-sm font-bold dark:text-white';

const formatDate = (iso: string) => {
  const parsed = new Date(iso);
  if (isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`h-6 w-11 rounded-full relative transition-colors shrink-0 ${checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
  >
    <span className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const CardShell: React.FC<{ icon: React.ElementType; title: string; desc: string; children: React.ReactNode }> = ({ icon: Icon, title, desc, children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm p-8 space-y-6">
    <div>
      <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
        <Icon className="h-5 w-5 text-blue-500" /> {title}
      </h3>
      <p className="text-sm text-slate-500 mt-1">{desc}</p>
    </div>
    {children}
  </div>
);

const AccountSettings: React.FC = () => {
  const { currentUser } = useApp();
  const [toast, setToast] = useState<string | null>(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  /* -------------------------------- Password -------------------------------- */

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    setPasswordError(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setToast('Password updated successfully');
  };

  /* -------------------------------- Language -------------------------------- */

  const [language, setLanguage] = useState('English');
  const handleLanguageChange = (val: string) => {
    setLanguage(val);
    setToast('Language updated');
  };

  /* ------------------------------ Notifications ------------------------------ */

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifTeams, setNotifTeams] = useState(true);
  const [notifPush, setNotifPush] = useState(false);

  const NOTIFICATION_ROWS = [
    { key: 'email', label: 'Email Notifications', desc: 'Receive updates about requests, approvals, and announcements via email.', checked: notifEmail, setter: setNotifEmail },
    { key: 'teams', label: 'Microsoft Teams Notifications', desc: 'Get instant alerts inside Microsoft Teams for time-sensitive actions.', checked: notifTeams, setter: setNotifTeams },
    { key: 'push', label: 'Push Notifications', desc: 'Receive browser push notifications while the app is open in another tab.', checked: notifPush, setter: setNotifPush },
  ] as const;

  const toggleNotification = (setter: (v: boolean) => void, current: boolean, label: string) => {
    setter(!current);
    setToast(`${label} ${!current ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your account preferences.</p>
      </div>

      <CardShell icon={KeyRound} title="Change Password" desc="Update the password used to sign in to your account.">
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className={labelCls}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelCls}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPasswordError(null); }}
                className={inputCls}
              />
            </div>
            <div className="space-y-2">
              <label className={labelCls}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(null); }}
                className={inputCls}
              />
            </div>
          </div>
          {passwordError && (
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{passwordError}</p>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
          >
            <KeyRound className="h-4 w-4" /> Update Password
          </button>
        </form>
      </CardShell>

      <CardShell icon={Globe} title="Interface Language" desc="Choose the language used across the application.">
        <div className="space-y-2 max-w-xs">
          <label className={labelCls}>Language</label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className={`${inputCls} appearance-none cursor-pointer`}
          >
            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </CardShell>

      <CardShell icon={Bell} title="Notifications" desc="Choose how you want to be notified about activity.">
        <div className="space-y-3">
          {NOTIFICATION_ROWS.map((row) => (
            <div key={row.key} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-800">
              <div>
                <p className="text-sm font-bold dark:text-white">{row.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{row.desc}</p>
              </div>
              <ToggleSwitch checked={row.checked} onChange={() => toggleNotification(row.setter, row.checked, row.label)} />
            </div>
          ))}
        </div>
      </CardShell>

      <CardShell icon={ShieldCheck} title="Connected Account" desc="Information about how you sign in to InsightPro.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className={labelCls}>Email Address</p>
            <p className="text-sm font-bold dark:text-white mt-1">{currentUser.email}</p>
          </div>
          <div>
            <p className={labelCls}>Sign-in Method</p>
            <p className="text-sm font-bold dark:text-white mt-1">Signed in via Microsoft</p>
          </div>
          <div>
            <p className={labelCls}>Account Created</p>
            <p className="text-sm font-bold dark:text-white mt-1">{formatDate(currentUser.joinDate)}</p>
          </div>
        </div>
      </CardShell>

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

export default AccountSettings;
