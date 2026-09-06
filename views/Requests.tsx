
import React, { useMemo, useState } from 'react';
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Download,
  X,
  CheckCircle2,
  Inbox,
} from 'lucide-react';
import { useApp } from '../App';
import { UserRole } from '../types';

type RequestType = 'Leave' | 'Sick' | '1-on-1' | 'Evaluation' | 'Other';
type RequestStatus = 'Pending' | 'Approved' | 'Denied';

interface RequestItem {
  id: string;
  employeeId: string;
  employee: string;
  type: RequestType;
  status: RequestStatus;
  submittedDate: string; // ISO, used for filtering + display
  waitDays: number;
  start?: string;
  end?: string;
  days?: number;
  meetingWith?: string;
  meetingDate?: string;
  topic?: string;
  reason?: string;
  title?: string;
  description?: string;
  notes?: string;
}

const TYPE_LABELS: Record<RequestType, string> = {
  'Leave': 'Leave',
  'Sick': 'Sick',
  '1-on-1': '1-on-1 Meeting',
  'Evaluation': 'Evaluation',
  'Other': 'Other',
};

const MEETING_CONTACTS = ['Alex Rivera (Manager)', 'Priya Nair (Manager)', 'HR Department'];

const todayISO = () => new Date().toISOString().slice(0, 10);

const formatDate = (iso: string) => {
  const parsed = new Date(iso);
  if (isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const MOCK_REQUESTS: RequestItem[] = [
  { id: '1', employeeId: 'e-sarah', employee: 'Sarah Jenkins', type: 'Leave', status: 'Pending', submittedDate: '2023-10-15', waitDays: 2, start: 'Dec 22, 2023', end: 'Jan 2, 2024', days: 10 },
  { id: '2', employeeId: 'e-michael', employee: 'Michael Chen', type: 'Sick', status: 'Approved', submittedDate: '2023-10-24', waitDays: 0, start: 'Oct 24, 2023', end: 'Oct 25, 2023', days: 2 },
  { id: '3', employeeId: 'e-emma', employee: 'Emma Davis', type: 'Leave', status: 'Pending', submittedDate: '2023-10-05', waitDays: 4, start: 'Nov 1, 2023', end: 'Nov 5, 2023', days: 5 },
  { id: '4', employeeId: 'user-1', employee: 'John Doe', type: '1-on-1', status: 'Pending', submittedDate: '2023-10-27', waitDays: 1, meetingWith: 'Alex Rivera (Manager)', meetingDate: 'Nov 10, 2023 - 2:00 PM', topic: 'Career growth discussion' },
  { id: '5', employeeId: 'user-1', employee: 'John Doe', type: 'Evaluation', status: 'Approved', submittedDate: '2023-10-20', waitDays: 0, reason: 'Ready for promotion review after Q4 deliverables.' },
  { id: '6', employeeId: 'user-1', employee: 'John Doe', type: 'Other', status: 'Denied', submittedDate: '2023-10-10', waitDays: 5, title: 'Remote equipment upgrade', description: 'Requesting a new monitor for home office setup.' },
  { id: '7', employeeId: 'e-robert', employee: 'Robert Fox', type: 'Sick', status: 'Denied', submittedDate: '2023-09-05', waitDays: 3, start: 'Sep 5, 2023', end: 'Sep 6, 2023', days: 2 },
  { id: '8', employeeId: 'e-jenny', employee: 'Jenny Wilson', type: '1-on-1', status: 'Approved', submittedDate: '2023-10-25', waitDays: 0, meetingWith: 'HR Department', meetingDate: 'Oct 30, 2023 - 11:00 AM', topic: 'Benefits question' },
  { id: '9', employeeId: 'e-alex', employee: 'Alex Rivera', type: 'Evaluation', status: 'Pending', submittedDate: '2023-10-02', waitDays: 6, reason: 'Requesting a mid-cycle self-evaluation.' },
  { id: '10', employeeId: 'e-noah', employee: 'Noah Taylor', type: 'Other', status: 'Pending', submittedDate: '2023-10-26', waitDays: 1, title: 'Parking permit', description: 'Need a permit for the north lot.' },
];

const typeBadgeCls = (type: RequestType) => {
  switch (type) {
    case 'Leave': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
    case 'Sick': return 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400';
    case '1-on-1': return 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400';
    case 'Evaluation': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400';
    case 'Other': return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
  }
};

const periodLabel = (r: RequestItem) => {
  if (r.type === 'Leave' || r.type === 'Sick') return `${r.start} - ${r.end}`;
  if (r.type === '1-on-1') return r.meetingDate || '—';
  return formatDate(r.submittedDate);
};

const secondaryLabel = (r: RequestItem) => {
  if (r.type === '1-on-1') return r.topic ? `Topic: ${r.topic}` : r.meetingWith ? `With: ${r.meetingWith}` : undefined;
  if (r.type === 'Evaluation') return r.reason;
  if (r.type === 'Other') return r.description;
  return undefined;
};

const daysLabel = (r: RequestItem) => (r.type === 'Leave' || r.type === 'Sick') ? String(r.days ?? 0) : '—';

const inputCls = 'w-full rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:ring-0 text-sm p-3 text-slate-900 dark:text-white transition-colors';
const labelCls = 'text-xs font-bold text-slate-400 uppercase mb-1.5 block';
const selectCls = 'appearance-none bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl py-2.5 pl-4 pr-9 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:ring-0 cursor-pointer transition-colors';

const csvEscape = (val: string) => `"${(val ?? '').replace(/"/g, '""')}"`;

const Requests: React.FC = () => {
  const { role, currentUser } = useApp();
  const [requests, setRequests] = useState<RequestItem[]>(MOCK_REQUESTS);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<'All' | RequestType>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | RequestStatus | 'Overdue'>('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [formType, setFormType] = useState<RequestType>('Leave');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formMeetingWith, setFormMeetingWith] = useState('');
  const [formMeetingDate, setFormMeetingDate] = useState('');
  const [formTopic, setFormTopic] = useState('');
  const [formReason, setFormReason] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const resetForm = () => {
    setFormType('Leave');
    setFormStart('');
    setFormEnd('');
    setFormNotes('');
    setFormMeetingWith('');
    setFormMeetingDate('');
    setFormTopic('');
    setFormReason('');
    setFormTitle('');
    setFormDescription('');
  };

  const closeForm = () => { setShowForm(false); resetForm(); };

  const canSubmit = useMemo(() => {
    switch (formType) {
      case 'Leave':
      case 'Sick':
        return !!formStart && !!formEnd;
      case '1-on-1':
        return !!formMeetingWith && !!formMeetingDate;
      case 'Evaluation':
        return !!formReason.trim();
      case 'Other':
        return !!formTitle.trim() && !!formDescription.trim();
      default:
        return false;
    }
  }, [formType, formStart, formEnd, formMeetingWith, formMeetingDate, formReason, formTitle, formDescription]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const base = {
      id: `req-${Date.now()}`,
      employeeId: currentUser.id,
      employee: currentUser.name,
      type: formType,
      status: 'Pending' as RequestStatus,
      submittedDate: todayISO(),
      waitDays: 0,
      notes: formNotes.trim() || undefined,
    };

    let newRequest: RequestItem;
    if (formType === 'Leave' || formType === 'Sick') {
      const startDate = new Date(formStart);
      const endDate = new Date(formEnd);
      const days = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      newRequest = { ...base, start: formatDate(formStart), end: formatDate(formEnd), days };
    } else if (formType === '1-on-1') {
      newRequest = { ...base, meetingWith: formMeetingWith, meetingDate: formMeetingDate, topic: formTopic.trim() || undefined };
    } else if (formType === 'Evaluation') {
      newRequest = { ...base, reason: formReason.trim() };
    } else {
      newRequest = { ...base, title: formTitle.trim(), description: formDescription.trim() };
    }

    setRequests((prev) => [newRequest, ...prev]);
    closeForm();
    setToast('Request submitted');
  };

  const updateStatus = (id: string, status: RequestStatus) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    setToast(status === 'Approved' ? 'Request approved' : 'Request denied');
  };

  const visibleRequests = useMemo(
    () => (role === UserRole.HR ? requests : requests.filter((r) => r.employeeId === currentUser.id)),
    [requests, role, currentUser.id]
  );

  const filteredRequests = useMemo(() => {
    return visibleRequests.filter((r) => {
      if (typeFilter !== 'All' && r.type !== typeFilter) return false;
      if (statusFilter === 'Overdue') {
        if (!(r.status === 'Pending' && r.waitDays > 3)) return false;
      } else if (statusFilter !== 'All' && r.status !== statusFilter) {
        return false;
      }
      if (fromDate && r.submittedDate < fromDate) return false;
      if (toDate && r.submittedDate > toDate) return false;
      return true;
    });
  }, [visibleRequests, typeFilter, statusFilter, fromDate, toDate]);

  const hasActiveFilters = typeFilter !== 'All' || statusFilter !== 'All' || !!fromDate || !!toDate;
  const clearFilters = () => { setTypeFilter('All'); setStatusFilter('All'); setFromDate(''); setToDate(''); };

  const handleExportCsv = () => {
    const headers = ['Employee', 'Type', 'Status', 'Period/Date', 'Days', 'Meeting With', 'Topic', 'Reason', 'Title', 'Description', 'Submitted'];
    const rows = filteredRequests.map((r) => [
      r.employee,
      TYPE_LABELS[r.type],
      r.status,
      periodLabel(r),
      r.type === 'Leave' || r.type === 'Sick' ? String(r.days ?? '') : '',
      r.meetingWith ?? '',
      r.topic ?? '',
      r.reason ?? '',
      r.title ?? '',
      r.description ?? '',
      formatDate(r.submittedDate),
    ]);
    const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'requests-export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {role === UserRole.HR ? 'Requests Management' : 'My Requests'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {role === UserRole.HR ? 'Review and approve requests across the company.' : 'Track your leave, meetings, and other requests.'}
          </p>
        </div>
        {role === UserRole.EMPLOYEE && (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100"
          >
            <Plus className="h-4 w-4" /> New Request
          </button>
        )}
      </div>

      {/* New Request Modal */}
      {showForm && role === UserRole.EMPLOYEE && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={closeForm}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-blue-600 p-6 text-white sticky top-0 z-10">
              <h3 className="text-xl font-bold">New Request</h3>
              <p className="text-blue-100 text-sm mt-1">Submit your request for HR approval.</p>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Request Type</label>
                  <select value={formType} onChange={(e) => setFormType(e.target.value as RequestType)} className={`${inputCls} appearance-none cursor-pointer`}>
                    <option value="Leave">Leave</option>
                    <option value="Sick">Sick</option>
                    <option value="1-on-1">1-on-1 Meeting Request</option>
                    <option value="Evaluation">Evaluation Request</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {(formType === 'Leave' || formType === 'Sick') && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Start Date</label>
                        <input type="date" value={formStart} onChange={(e) => setFormStart(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>End Date</label>
                        <input type="date" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Comments (Optional)</label>
                      <textarea
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        className={`${inputCls} h-24 resize-none`}
                        placeholder="e.g. Family wedding, medical appointment..."
                      />
                    </div>
                  </>
                )}

                {formType === '1-on-1' && (
                  <>
                    <div>
                      <label className={labelCls}>Meet With</label>
                      <select value={formMeetingWith} onChange={(e) => setFormMeetingWith(e.target.value)} className={`${inputCls} appearance-none cursor-pointer`}>
                        <option value="">Select a contact...</option>
                        {MEETING_CONTACTS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Proposed Date / Time</label>
                      <input type="text" value={formMeetingDate} onChange={(e) => setFormMeetingDate(e.target.value)} placeholder="e.g. Nov 10, 2023 - 2:00 PM" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Topic (Optional)</label>
                      <input type="text" value={formTopic} onChange={(e) => setFormTopic(e.target.value)} placeholder="e.g. Career growth discussion" className={inputCls} />
                    </div>
                  </>
                )}

                {formType === 'Evaluation' && (
                  <div>
                    <label className={labelCls}>Reason</label>
                    <textarea
                      value={formReason}
                      onChange={(e) => setFormReason(e.target.value)}
                      className={`${inputCls} h-28 resize-none`}
                      placeholder="Why are you requesting this evaluation?"
                    />
                  </div>
                )}

                {formType === 'Other' && (
                  <>
                    <div>
                      <label className={labelCls}>Title</label>
                      <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Remote equipment upgrade" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Description</label>
                      <textarea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className={`${inputCls} h-24 resize-none`}
                        placeholder="Describe your request..."
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-start gap-3">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                  Your request is visible only to HR and your manager. You will receive an email once a decision is made.
                </p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={closeForm} className="flex-1 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">Cancel</button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 dark:shadow-none disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 shadow-sm p-5 flex flex-wrap items-center gap-3">
        <div className="relative">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)} className={selectCls}>
            <option value="All">Type: All</option>
            <option value="Leave">Leave</option>
            <option value="Sick">Sick</option>
            <option value="1-on-1">1-on-1</option>
            <option value="Evaluation">Evaluation</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className={selectCls}>
            <option value="All">Status: All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Denied">Denied</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase">From</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:ring-0 text-xs p-2.5 text-slate-900 dark:text-white" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase">To</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:ring-0 text-xs p-2.5 text-slate-900 dark:text-white" />
        </div>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors ml-auto">
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Requests History</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Showing {filteredRequests.length} of {visibleRequests.length} requests
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportCsv} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Inbox className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No requests match these filters.</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">Clear filters</button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[10px] font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Period / Date</th>
                  <th className="px-6 py-4 text-center">Days</th>
                  <th className="px-6 py-4">Status</th>
                  {role === UserRole.HR && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 border dark:border-slate-600 flex items-center justify-center font-bold text-slate-500 dark:text-slate-300 text-xs shrink-0">
                          {req.employee.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-white">{req.employee}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${typeBadgeCls(req.type)}`}>
                        {TYPE_LABELS[req.type]}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-[240px]">
                      <span className="text-slate-500 dark:text-slate-400 text-xs">{periodLabel(req)}</span>
                      {secondaryLabel(req) && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5 truncate">{secondaryLabel(req)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-800 dark:text-slate-200">
                      {daysLabel(req)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${
                          req.status === 'Approved' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                          req.status === 'Pending' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' :
                          'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        }`}>
                          {req.status}
                        </span>
                        {role === UserRole.HR && req.status === 'Pending' && req.waitDays > 3 && (
                          <span title="Overdue (Waiting > 3 days)">
                            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                          </span>
                        )}
                      </div>
                    </td>
                    {role === UserRole.HR && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => updateStatus(req.id, 'Approved')} className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg" title="Approve">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button onClick={() => updateStatus(req.id, 'Denied')} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Reject">
                            <XCircle className="h-4 w-4" />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="Details">
                            <MessageSquare className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl">
        <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">Microsoft Teams Integration</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Employees can submit "Sick Leave" requests directly through Teams messages.
          The system automatically detects keywords and logs a pending request for your review.
        </p>
      </div>

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

export default Requests;
