
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, Bell, SwitchCamera, Sun, Moon, LogOut } from 'lucide-react';
import { useApp } from '../App';
import { UserRole } from '../types';

const Header: React.FC = () => {
  const { role, setRole, authRole, logout, currentUser, theme, toggleTheme } = useApp();
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname.includes('/profile')) return 'Employee Profile';
    if (location.pathname === '/employees') return 'Employee Directory';
    if (location.pathname === '/teams') return 'Teams & Hierarchy';
    if (location.pathname === '/feedback') return 'Feedback & Mood';
    if (location.pathname === '/onboarding') return 'Onboarding';
    if (location.pathname === '/offboarding') return 'Offboarding';
    if (location.pathname === '/requests') return 'Requests';
    if (location.pathname === '/benefits') return 'Benefits';
    if (location.pathname === '/events') return 'Events';
    if (location.pathname === '/account-settings') return 'Settings';
    if (location.pathname === '/recruitment') return 'Recruitment';
    return role === UserRole.HR ? 'HR Dashboard' : 'My Home';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white dark:bg-slate-900 px-4 md:px-8 shadow-sm dark:border-slate-800 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/20">
          HP
        </div>
        <h1 className="text-xl font-semibold hidden md:block dark:text-white">{getTitle()}</h1>
      </div>

      <div className="flex-1 max-w-md mx-8 hidden lg:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search employees, documents, requests..."
            className="w-full rounded-full bg-slate-100 dark:bg-slate-800 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200 dark:placeholder-slate-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        {authRole === UserRole.HR && (
          <button
            onClick={() => setRole(role === UserRole.HR ? UserRole.EMPLOYEE : UserRole.HR)}
            className="flex items-center gap-2 rounded-lg border dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <SwitchCamera className="h-4 w-4" />
            <span className="hidden sm:inline">Switch to {role === UserRole.HR ? 'Employee' : 'HR'}</span>
          </button>
        )}

        <button className="relative text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-2">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-900"></span>
        </button>

        <Link to="/profile/me" className="flex items-center gap-3 pl-4 border-l dark:border-slate-800 group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{currentUser.name}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{role}</p>
          </div>
          <img
            src={currentUser.avatar}
            alt="Profile"
            className="h-9 w-9 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-colors"
          />
        </Link>

        <button
          onClick={logout}
          className="p-2 rounded-lg border dark:border-slate-700 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-colors"
          title="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
