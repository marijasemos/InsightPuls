
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Network, 
  FileText, 
  UserPlus, 
  Smile, 
  Files, 
  Calendar, 
  BarChart3, 
  Settings as SettingsIcon,
  Home,
  User as UserIcon,
  Heart,
  Gift,
  Coffee,
  ArrowRightLeft,
  Link as LinkIcon,
  Banknote,
  Bell,
  Map,
  CalendarDays,
  Briefcase
} from 'lucide-react';
import { useApp } from '../App';
import { UserRole } from '../types';

const ICON_MAP: Record<string, any> = {
  dash: LayoutDashboard,
  ann: Bell,
  cal: CalendarDays,
  rec: Briefcase,
  emp: Users,
  team: Network,
  pay: Banknote,
  offi: Coffee,
  req: FileText,
  feed: Smile,
  onb: UserPlus,
  off: ArrowRightLeft,
  anl: BarChart3,
  home: Home,
  profile: UserIcon,
  heart: Heart,
  gift: Gift,
  ben: Gift,
  events: Calendar,
  coffee: Coffee,
  custom: LinkIcon
};

const Sidebar: React.FC = () => {
  const { role, settings } = useApp();

  const getHrLinks = () => {
    const baseLinks = settings.navigation
      .filter(item => item.isVisible)
      .map(item => ({
        to: item.path,
        icon: ICON_MAP[item.id] || ICON_MAP.custom,
        label: item.label
      }));
    
    return [...baseLinks, { to: '/settings', icon: SettingsIcon, label: 'Master Config' }];
  };

  const employeeLinks = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/announcements', icon: Bell, label: 'Announcements' },
    { to: '/calendar', icon: CalendarDays, label: 'Company Calendar' },
    { to: '/onboarding', icon: UserPlus, label: 'My Onboarding' },
    { to: '/offboarding', icon: ArrowRightLeft, label: 'My Offboarding' },
    { to: '/payroll', icon: Banknote, label: 'My Payroll' },
    { to: '/office', icon: Coffee, label: 'Office & Food' },
    { to: '/profile/me', icon: UserIcon, label: 'My Profile' },
    { to: '/requests', icon: FileText, label: settings.labels.requests },
    { to: '/feedback', icon: Heart, label: 'Feedback & Mood' },
    { to: '/teams', icon: Network, label: settings.labels.team },
    { to: '/benefits', icon: Gift, label: 'Benefits' },
    { to: '/events', icon: Calendar, label: 'Events' },
    { to: '/account-settings', icon: SettingsIcon, label: 'Settings' },
  ];

  const links = role === UserRole.HR ? getHrLinks() : employeeLinks;

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-white dark:bg-slate-900 dark:border-slate-800 transition-colors duration-300">
      <div className="p-6">
        <Link to="/" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          InsightPro
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto custom-scrollbar">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 mt-auto">
        <div className="rounded-2xl bg-slate-900 dark:bg-slate-800 p-5 text-white shadow-xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">System Status</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-[11px] text-slate-300">Teams Integrated</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
