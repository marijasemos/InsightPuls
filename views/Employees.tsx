
import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Download,
  Mail,
  ExternalLink,
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { User, UserRole } from '../types';
import { Link } from 'react-router-dom';
import { EmployeeService } from '../services/api';
import { useApp, buildOnboardingTasks } from '../App';
import AddHireModal, { AddHireFormValues, OnboardingSubmission } from '../components/AddHireModal';

const formatDateDisplay = (isoDate: string) => {
  const parsed = new Date(isoDate);
  if (isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const Employees: React.FC = () => {
  const { addOnboardingCase } = useApp();
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addHireOpen, setAddHireOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [seniorityFilter, setSeniorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleSubmitNewHire = (values: AddHireFormValues, onboarding: OnboardingSubmission | null) => {
    const created = EmployeeService.create({
      name: values.name,
      role: UserRole.EMPLOYEE,
      position: values.position,
      seniority: values.seniority,
      team: values.team,
      avatar: values.avatar || `https://picsum.photos/seed/${encodeURIComponent(values.name)}/100/100`,
      email: values.email,
      status: values.status,
      joinDate: values.joinDate,
    });
    setEmployees((prev) => (prev.some((e) => e.id === created.id) ? prev : [created, ...prev]));
    setAddHireOpen(false);

    if (onboarding) {
      addOnboardingCase({
        id: `onb-${created.id}`,
        name: created.name,
        position: created.position,
        startDate: formatDateDisplay(onboarding.startDate),
        buddy: onboarding.buddy,
        progress: 0,
        status: 'Administrative',
        tasks: buildOnboardingTasks(),
      });
      setToast('New hire added and enrolled in Onboarding Tracking');
    } else {
      setToast('New hire added');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await EmployeeService.getAll();
        setEmployees(data);
      } catch (err: any) {
        setError("Could not connect to backend. Please ensure the API is running.");
        // Fallback to empty state for now
        setEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            emp.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeniority = seniorityFilter === 'All' || emp.seniority === seniorityFilter;
      const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
      return matchesSearch && matchesSeniority && matchesStatus;
    });
  }, [employees, searchTerm, seniorityFilter, statusFilter]);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30';
      case 'On Leave': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800/30';
      case 'Sick': return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800/30';
      case 'Offboarding': return 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800/30';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-100 dark:border-slate-700';
    }
  };

  const getSeniorityColor = (seniority: string) => {
    switch (seniority) {
      case 'Director': return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20';
      case 'Lead': return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20';
      case 'Senior': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'Mid': return 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800';
      case 'Junior': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Connecting to HQ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Employee Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Search and manage workforce profiles globally.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 border dark:border-slate-800 rounded-2xl text-sm font-bold bg-white dark:bg-slate-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            <Download className="h-4 w-4" /> Export
          </button>
          <button
            onClick={() => setAddHireOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all transform active:scale-95"
          >
            <UserPlus className="h-4 w-4" /> New Hire
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-2xl flex items-center gap-3 text-rose-600">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-4 transition-colors">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Filter by name, position or email..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:ring-0 text-sm dark:text-slate-200 dark:placeholder-slate-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
              value={seniorityFilter}
              onChange={(e) => { setSeniorityFilter(e.target.value); setCurrentPage(1); }}
              className="appearance-none bg-slate-50 dark:bg-slate-800 border-transparent rounded-2xl py-3 pl-5 pr-11 text-sm font-bold dark:text-slate-300 focus:border-blue-500 focus:ring-0 cursor-pointer transition-colors"
            >
              <option value="All">All Seniorities</option>
              <option value="Junior">Junior</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
              <option value="Director">Director</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="appearance-none bg-slate-50 dark:bg-slate-800 border-transparent rounded-2xl py-3 pl-5 pr-11 text-sm font-bold dark:text-slate-300 focus:border-blue-500 focus:ring-0 cursor-pointer transition-colors"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Sick">Sick</option>
              <option value="Offboarding">Offboarding</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b dark:border-slate-800">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Employee</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Role & Team</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Seniority</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Join Date</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((emp) => (
                  <tr key={emp.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800 transition-colors cursor-default">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img 
                          src={emp.avatar} 
                          alt={emp.name} 
                          className="h-11 w-11 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                        />
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{emp.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                            <Mail className="h-3 w-3" /> {emp.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">{emp.position}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{emp.team}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-transparent ${getSeniorityColor(emp.seniority)}`}>
                        {emp.seniority}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest ${getStatusColor(emp.status)}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{new Date(emp.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <Link to={`/profile/${emp.id}`} className="p-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all" title="View Full Profile">
                          <ExternalLink className="h-4.5 w-4.5" />
                        </Link>
                        <button className="p-2.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                          <MoreVertical className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-600">
                      <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-2">
                        <Search className="h-8 w-8 opacity-40" />
                      </div>
                      <p className="text-sm font-bold uppercase tracking-widest">No candidates match your filters.</p>
                      <button onClick={() => { setSearchTerm(''); setSeniorityFilter('All'); setStatusFilter('All'); }} className="text-xs font-black text-blue-600 dark:text-blue-400 hover:underline">Clear all filters</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-5 bg-slate-50/50 dark:bg-slate-800/30 border-t dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Showing <span className="text-slate-900 dark:text-slate-100 font-black">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-slate-900 dark:text-slate-100 font-black">{Math.min(currentPage * itemsPerPage, filteredEmployees.length)}</span> of <span className="text-slate-900 dark:text-slate-100 font-black">{filteredEmployees.length}</span> entries
            </p>
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Rows:</span>
              <select 
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-transparent border-none text-[11px] font-black text-slate-900 dark:text-slate-100 focus:ring-0 p-0 cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </button>
            <div className="flex items-center gap-1.5 px-3">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`h-9 w-9 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${
                    currentPage === i + 1 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {addHireOpen && (
        <AddHireModal
          onClose={() => setAddHireOpen(false)}
          onSubmit={handleSubmitNewHire}
        />
      )}

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[80] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-bold">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
