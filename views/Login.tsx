
import React, { useState } from 'react';
import { LogIn, Mail, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string) => boolean;
}

const labelCls = 'text-[10px] font-bold uppercase tracking-widest text-slate-400';
const inputCls = 'w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:ring-0 text-sm font-bold dark:text-white';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = onLogin(email.trim(), password);
    if (!ok) setError('Invalid email or password.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-xl p-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20">
            HP
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">InsightPro</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Sign in to your HR workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className={labelCls}>Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                className={inputCls}
                placeholder="you@company.com"
                autoComplete="username"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                className={inputCls}
                placeholder="••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
          >
            <LogIn className="h-4 w-4" /> Sign In
          </button>
        </form>

        <div className="border-t dark:border-slate-800 pt-5">
          <p className={`${labelCls} mb-2`}>Demo Accounts</p>
          <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
            <p><span className="font-bold text-slate-700 dark:text-slate-300">HR:</span> mm@gmail.com / 1111</p>
            <p><span className="font-bold text-slate-700 dark:text-slate-300">Employee:</span> aa@gmail.com / 1111</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
