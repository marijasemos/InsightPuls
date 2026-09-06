
import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Plus,
  ExternalLink,
  Shield,
  ChevronLeft,
  Network,
  User as UserIcon,
  Search,
  ArrowRight,
  ChevronRight,
  Heart,
  AlertCircle,
  X,
  Trash2,
  Mail,
  Phone,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { EmployeeService } from '../services/api';
import { User } from '../types';

type ViewMode = 'OVERVIEW' | 'SUB_TEAMS' | 'HIERARCHY';
type TeamType = 'Internal' | 'Mixed' | 'External';
type SubTeamHealth = 'High Focus' | 'Medium Focus' | 'Low Focus' | 'Stable';

interface Team {
  id: string;
  name: string;
  count: number;
  subTeams: number;
  type: TeamType;
  onboard: number;
  status: string;
  mood: string;
  leader?: string;
}

interface SubTeam {
  id: string;
  teamId: string;
  name: string;
  lead: string;
  members: number;
  health: SubTeamHealth;
  projects: number;
}

interface OrgNode {
  id: string;
  name: string;
  role: string;
  team: string;
  avatar: string;
  email: string;
  phone: string;
  status: 'Active' | 'On Leave' | 'Sick';
  parentId: string | null;
}

const INITIAL_TEAMS: Team[] = [
  { id: 't-eng', name: 'Engineering', count: 42, subTeams: 4, type: 'Internal', onboard: 2, status: 'Stable', mood: '😊 Good', leader: 'Alex Rivera' },
  { id: 't-design', name: 'Product Design', count: 12, subTeams: 0, type: 'Mixed', onboard: 0, status: 'Peak Workload', mood: '😐 Neutral', leader: 'Maria Chen' },
  { id: 't-legal', name: 'Legal & Compliance', count: 4, subTeams: 0, type: 'External', onboard: 0, status: 'Stable', mood: '😊 Good', leader: 'Robert Fox' },
  { id: 't-hr', name: 'Human Resources', count: 8, subTeams: 0, type: 'Internal', onboard: 1, status: 'Stable', mood: '😊 Good', leader: 'Jenny Wilson' },
  { id: 't-finance', name: 'Finance', count: 6, subTeams: 0, type: 'Mixed', onboard: 0, status: 'Offboarding Active', mood: '🙁 Low', leader: 'Olivia Park' },
  { id: 't-sales', name: 'Sales & Marketing', count: 24, subTeams: 0, type: 'Internal', onboard: 4, status: 'Growing', mood: '😊 Good', leader: 'Grace Kim' },
];

const INITIAL_SUB_TEAMS: SubTeam[] = [
  { id: 'st-frontend', teamId: 't-eng', name: 'Frontend Engineering', lead: 'Alex Rivera', members: 12, health: 'High Focus', projects: 3 },
  { id: 'st-backend', teamId: 't-eng', name: 'Backend Services', lead: 'Michael Chen', members: 15, health: 'High Focus', projects: 5 },
  { id: 'st-qa', teamId: 't-eng', name: 'Quality Assurance', lead: 'Sarah Jenkins', members: 8, health: 'Medium Focus', projects: 2 },
  { id: 'st-devops', teamId: 't-eng', name: 'DevOps & Infra', lead: 'Liam Wilson', members: 7, health: 'High Focus', projects: 4 },
];

const INITIAL_ORG_NODES: OrgNode[] = [
  { id: '1', name: 'Alex Rivera', role: 'Engineering Lead', team: 'Engineering', avatar: 'https://picsum.photos/seed/alex/100/100', email: 'a.rivera@company.com', phone: '+1 415 555 0110', status: 'Active', parentId: null },
  { id: '2', name: 'Sarah Jenkins', role: 'Senior Product Designer', team: 'Creative', avatar: 'https://picsum.photos/seed/sarah/100/100', email: 's.jenkins@company.com', phone: '+44 20 7946 0123', status: 'Active', parentId: '1' },
  { id: '3', name: 'Noah Taylor', role: 'Junior Designer', team: 'Creative', avatar: 'https://picsum.photos/seed/noah/100/100', email: 'n.taylor@company.com', phone: '+1 415 555 0142', status: 'Active', parentId: '2' },
  { id: '4', name: 'Emma White', role: 'UI Trainee', team: 'Creative', avatar: 'https://picsum.photos/seed/emma/100/100', email: 'e.white@company.com', phone: '+1 415 555 0157', status: 'Active', parentId: '2' },
  { id: '5', name: 'Michael Chen', role: 'Senior Backend Engineer', team: 'Engineering', avatar: 'https://picsum.photos/seed/michael/100/100', email: 'm.chen@tech.com', phone: '+49 30 1234 5678', status: 'Active', parentId: '1' },
  { id: '6', name: 'Devon Lane', role: 'API Engineer', team: 'Engineering', avatar: 'https://picsum.photos/seed/devon/100/100', email: 'd.lane@company.com', phone: '+1 415 555 0166', status: 'Active', parentId: '5' },
  { id: '7', name: 'Sofia Martinez', role: 'Database Admin', team: 'Engineering', avatar: 'https://picsum.photos/seed/sofia/100/100', email: 's.martinez@company.com', phone: '+1 415 555 0178', status: 'On Leave', parentId: '5' },
];

const healthColor = (health: SubTeamHealth) => {
  switch (health) {
    case 'High Focus': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600';
    case 'Medium Focus': return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600';
    case 'Low Focus': return 'bg-rose-50 dark:bg-rose-900/20 text-rose-600';
    case 'Stable': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600';
  }
};

const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').slice(0, 2);

const inputCls = 'w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:ring-0 text-sm font-bold dark:text-white';
const labelCls = 'text-[10px] font-bold text-slate-400 uppercase tracking-widest';

/* ------------------------------- Shared bits ------------------------------ */

const ModalShell: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; footer: React.ReactNode; maxW?: string }> = ({ title, onClose, children, footer, maxW = 'max-w-lg' }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
    <div onClick={(e) => e.stopPropagation()} className={`w-full ${maxW} max-h-[88vh] flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}>
      <div className="px-7 pt-6 pb-4 border-b dark:border-slate-800 flex items-center justify-between shrink-0">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{title}</h2>
        <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-7 space-y-5">{children}</div>
      <div className="px-7 py-5 border-t dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">{footer}</div>
    </div>
  </div>
);

const ConfirmModal: React.FC<{ title: string; message: string; warning?: string; confirmLabel?: string; onCancel: () => void; onConfirm: () => void }> = ({
  title, message, warning, confirmLabel = 'Delete', onCancel, onConfirm,
}) => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onCancel}>
    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] border dark:border-slate-800 shadow-2xl p-7 animate-in zoom-in-95 duration-200">
      <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-5">
        <AlertTriangle className="h-6 w-6 text-rose-600" />
      </div>
      <h3 className="text-lg font-black text-slate-900 dark:text-white">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{message}</p>
      {warning && (
        <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-xl p-3 mt-3 leading-relaxed">
          {warning}
        </p>
      )}
      <div className="flex items-center gap-3 mt-6">
        <button onClick={onCancel} className="flex-1 px-4 py-2.5 border dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          Cancel
        </button>
        <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all">
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

const EmployeePicker: React.FC<{ options: User[]; value: string; onChange: (v: string) => void; onSelect: (u: User) => void; placeholder?: string }> = ({ options, value, onChange, onSelect, placeholder }) => {
  const [open, setOpen] = useState(false);
  const filtered = useMemo(() => options.filter((e) => e.name.toLowerCase().includes(value.toLowerCase())), [options, value]);
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
      <input
        type="text"
        value={value}
        onFocus={() => setOpen(true)}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder || 'Search employees...'}
        className={`${inputCls} pl-9`}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((emp) => (
            <button
              key={emp.id}
              onMouseDown={() => { onSelect(emp); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
            >
              <img src={emp.avatar} className="h-6 w-6 rounded-lg object-cover" alt="" />
              <span className="font-medium text-slate-700 dark:text-slate-200">{emp.name}</span>
              <span className="text-[10px] text-slate-400 ml-auto">{emp.position}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------------------------------- Main ---------------------------------- */

const TeamView: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('OVERVIEW');
  const [selectedMainTeam, setSelectedMainTeam] = useState<string | null>(null);
  const [selectedSubTeam, setSelectedSubTeam] = useState<string | null>(null);

  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [subTeams, setSubTeams] = useState<SubTeam[]>(INITIAL_SUB_TEAMS);
  const [orgNodes, setOrgNodes] = useState<OrgNode[]>(INITIAL_ORG_NODES);
  const [employeeDirectory, setEmployeeDirectory] = useState<User[]>([]);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null);
  const [deleteSubTeamId, setDeleteSubTeamId] = useState<string | null>(null);
  const [removeNodeId, setRemoveNodeId] = useState<string | null>(null);
  const [infoNodeId, setInfoNodeId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { EmployeeService.getAll().then(setEmployeeDirectory); }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const selectedTeam = teams.find((t) => t.name === selectedMainTeam);
  const teamSubTeams = selectedTeam ? subTeams.filter((s) => s.teamId === selectedTeam.id) : [];
  const hasRealSubTeams = teamSubTeams.length > 0;

  type DisplayRow = { id: string; name: string; lead: string; members: number; healthLabel: string; healthClasses: string; isVirtual: boolean };

  const displayRows: DisplayRow[] = hasRealSubTeams
    ? teamSubTeams.map((s) => ({ id: s.id, name: s.name, lead: s.lead, members: s.members, healthLabel: s.health, healthClasses: healthColor(s.health), isVirtual: false }))
    : selectedTeam
    ? [{
        id: `virtual-${selectedTeam.id}`,
        name: selectedTeam.name,
        lead: selectedTeam.leader || 'Unassigned',
        members: selectedTeam.count,
        healthLabel: selectedTeam.status,
        healthClasses: selectedTeam.status.includes('Offboarding') || selectedTeam.status.includes('Peak')
          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
          : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
        isVirtual: true,
      }]
    : [];

  /* --------------------------------- Level 1 -------------------------------- */

  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamType, setNewTeamType] = useState<TeamType>('Internal');
  const [newTeamLeader, setNewTeamLeader] = useState('');

  const resetTeamForm = () => { setNewTeamName(''); setNewTeamType('Internal'); setNewTeamLeader(''); };

  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;
    setTeams((prev) => [...prev, {
      id: `t-${Date.now()}`, name: newTeamName.trim(), count: 0, subTeams: 0, type: newTeamType,
      onboard: 0, status: 'Stable', mood: '😐 Neutral', leader: newTeamLeader.trim() || undefined,
    }]);
    resetTeamForm();
    setAddModalOpen(false);
    setToast('New entity added');
  };

  const teamToDelete = teams.find((t) => t.id === deleteTeamId);
  const confirmDeleteTeam = () => {
    if (!deleteTeamId) return;
    setTeams((prev) => prev.filter((t) => t.id !== deleteTeamId));
    setDeleteTeamId(null);
    setToast('Team removed');
  };

  /* --------------------------------- Level 2 -------------------------------- */

  const [newSubTeamName, setNewSubTeamName] = useState('');
  const [newSubTeamLead, setNewSubTeamLead] = useState('');
  const [newSubTeamMembers, setNewSubTeamMembers] = useState('');
  const [newSubTeamHealth, setNewSubTeamHealth] = useState<SubTeamHealth>('Stable');

  const resetSubTeamForm = () => { setNewSubTeamName(''); setNewSubTeamLead(''); setNewSubTeamMembers(''); setNewSubTeamHealth('Stable'); };

  const handleAddSubTeam = () => {
    if (!newSubTeamName.trim() || !selectedTeam) return;
    setSubTeams((prev) => [...prev, {
      id: `st-${Date.now()}`, teamId: selectedTeam.id, name: newSubTeamName.trim(), lead: newSubTeamLead.trim() || 'Unassigned',
      members: Number(newSubTeamMembers) || 0, health: newSubTeamHealth, projects: 0,
    }]);
    resetSubTeamForm();
    setAddModalOpen(false);
    setToast('New entity added');
  };

  const subTeamToDelete = subTeams.find((s) => s.id === deleteSubTeamId);
  const confirmDeleteSubTeam = () => {
    if (!deleteSubTeamId) return;
    setSubTeams((prev) => prev.filter((s) => s.id !== deleteSubTeamId));
    setDeleteSubTeamId(null);
    setToast('Sub-team removed');
  };

  /* --------------------------------- Level 3 -------------------------------- */

  const [personQuery, setPersonQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<User | null>(null);
  const [reportsTo, setReportsTo] = useState('');

  const resetPersonForm = () => { setPersonQuery(''); setSelectedPerson(null); setReportsTo(''); };

  const handleAddPerson = () => {
    if (!selectedPerson || !reportsTo) return;
    setOrgNodes((prev) => [...prev, {
      id: `${selectedPerson.id}-${Date.now()}`, name: selectedPerson.name, role: selectedPerson.position,
      team: selectedPerson.team, avatar: selectedPerson.avatar, email: selectedPerson.email,
      phone: '+1 415 555 0100', status: selectedPerson.status === 'Offboarding' ? 'Active' : selectedPerson.status,
      parentId: reportsTo,
    }]);
    resetPersonForm();
    setAddModalOpen(false);
    setToast('New entity added');
  };

  const nodeToRemove = orgNodes.find((n) => n.id === removeNodeId);
  const directReportsOf = (id: string) => orgNodes.filter((n) => n.parentId === id);
  const removeParentName = nodeToRemove ? orgNodes.find((n) => n.id === nodeToRemove.parentId)?.name : undefined;

  const confirmRemoveNode = () => {
    if (!nodeToRemove) return;
    const newParentId = nodeToRemove.parentId;
    setOrgNodes((prev) =>
      prev
        .filter((n) => n.id !== nodeToRemove.id)
        .map((n) => (n.parentId === nodeToRemove.id ? { ...n, parentId: newParentId } : n))
    );
    setRemoveNodeId(null);
    setToast('Team member removed');
  };

  const infoNode = orgNodes.find((n) => n.id === infoNodeId);

  /* --------------------------------- Render --------------------------------- */

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {teams.map((team) => (
        <div key={team.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col h-full group">
          <div className="p-8 border-b dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                team.type === 'Internal' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' :
                team.type === 'External' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600' :
                'bg-orange-50 dark:bg-orange-900/30 text-orange-600'
              }`}>
                {team.type}
              </span>
              <div className="flex items-center gap-2">
                {team.onboard > 0 && (
                  <span className="text-[9px] font-black text-emerald-600 flex items-center gap-1 uppercase">
                    <Plus className="h-3 w-3" /> {team.onboard} new
                  </span>
                )}
                <button
                  onClick={() => setDeleteTeamId(team.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                  title="Delete team"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              {team.name}
            </h3>
            {team.leader && <p className="text-[11px] font-bold text-slate-400 mt-1">Led by {team.leader}</p>}
          </div>

          <div className="p-8 flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Members</p>
                <p className="text-3xl font-black text-slate-800 dark:text-slate-200">{team.count}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Health Status</p>
                <div className={`flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl border ${
                  team.status.includes('Offboarding') || team.status.includes('Peak')
                  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-100'
                  : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100'
                }`}>
                  {team.status.includes('Offboarding') ? <AlertCircle className="h-3.5 w-3.5" /> : <Heart className="h-3.5 w-3.5" />}
                  {team.status}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t dark:border-slate-800 flex items-center justify-between">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aggregated Mood</span>
               <span className="text-sm font-black dark:text-slate-300">{team.mood}</span>
            </div>
          </div>

          <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 border-t dark:border-slate-800 rounded-b-[2.5rem]">
            <button
              onClick={() => {
                setSelectedMainTeam(team.name);
                setViewMode('SUB_TEAMS');
              }}
              className="w-full py-3 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-xs font-black text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 transition-all shadow-sm"
            >
              Manage Structure <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSubTeamsTable = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Network className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedMainTeam} Sub-Teams</h3>
              <p className="text-xs text-slate-500 font-medium">
                {hasRealSubTeams
                  ? `Monitoring ${displayRows.length} active sub-team${displayRows.length !== 1 ? 's' : ''}`
                  : 'No sub-teams defined yet — showing team-level overview'}
              </p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter teams..."
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Sub-Team</th>
                <th className="px-8 py-5">Lead</th>
                <th className="px-8 py-5 text-center">Staff</th>
                <th className="px-8 py-5">Health Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {displayRows.map((row) => (
                <tr key={row.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-8 py-6 font-black text-slate-800 dark:text-white">{row.name}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-700 border dark:border-slate-600 flex items-center justify-center text-[10px] font-black">
                        {initials(row.lead)}
                      </div>
                      <span className="text-sm font-bold dark:text-slate-300">{row.lead}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-black">{row.members}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${row.healthClasses}`}>
                      {row.healthLabel}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="inline-flex items-center gap-2">
                      {!row.isVirtual && (
                        <button
                          onClick={() => setDeleteSubTeamId(row.id)}
                          className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                          title="Delete sub-team"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedSubTeam(row.name);
                          setViewMode('HIERARCHY');
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-xs font-black text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-all shadow-sm"
                      >
                        Organization Map <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const HierarchyNode: React.FC<{ node: OrgNode; isRoot?: boolean }> = ({ node, isRoot }) => {
    const children = orgNodes.filter((n) => n.parentId === node.id);
    return (
      <div className="flex flex-col items-center relative">
        {!isRoot && <div className="h-10 w-0.5 bg-slate-200 dark:bg-slate-800"></div>}

        <div className="group relative">
          <div
            onClick={() => setInfoNodeId(node.id)}
            className="flex flex-col items-center bg-white dark:bg-slate-900 p-6 rounded-[2rem] border dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all w-56 z-10 relative cursor-pointer"
          >
            <img src={node.avatar} alt={node.name} className="h-14 w-14 rounded-2xl border-2 border-white dark:border-slate-800 shadow-md mb-3 object-cover" />
            <p className="text-sm font-black text-slate-900 dark:text-white text-center leading-tight">{node.name}</p>
            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-2">{node.role}</p>

            {!isRoot && (
              <button
                onClick={(e) => { e.stopPropagation(); setRemoveNodeId(node.id); }}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 flex items-center justify-center rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-500 hover:bg-rose-100"
                title="Remove from structure"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {children.length > 0 && (
          <div className="relative flex flex-col items-center">
            <div className="h-10 w-0.5 bg-slate-200 dark:bg-slate-800"></div>
            <div className="absolute top-10 h-0.5 bg-slate-200 dark:bg-slate-800" style={{
              width: `calc(100% - ${250 / children.length}px)`,
              left: '50%',
              transform: 'translateX(-50%)'
            }}></div>

            <div className="flex gap-12 px-6">
              {children.map((child) => (
                <HierarchyNode key={child.id} node={child} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const rootNode = orgNodes.find((n) => n.parentId === null);

  const renderHierarchy = () => (
    <div className="animate-in fade-in zoom-in-95 duration-500 py-16 px-6 overflow-x-auto flex justify-center min-h-[600px] bg-slate-50/30 dark:bg-slate-950/30 rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
      {rootNode && <HierarchyNode node={rootNode} isRoot />}
    </div>
  );

  const handleAddEntityClick = () => setAddModalOpen(true);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
            <span
              className={`cursor-pointer hover:text-blue-600 transition-colors ${viewMode === 'OVERVIEW' ? 'text-blue-600' : ''}`}
              onClick={() => setViewMode('OVERVIEW')}
            >
              Company Overview
            </span>
            {viewMode !== 'OVERVIEW' && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span
                  className={`cursor-pointer hover:text-blue-600 transition-colors ${viewMode === 'SUB_TEAMS' ? 'text-blue-600' : ''}`}
                  onClick={() => setViewMode('SUB_TEAMS')}
                >
                  {selectedMainTeam}
                </span>
              </>
            )}
            {viewMode === 'HIERARCHY' && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="text-blue-600">{selectedSubTeam}</span>
              </>
            )}
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            {viewMode === 'OVERVIEW' ? 'Teams & Organization' :
             viewMode === 'SUB_TEAMS' ? `${selectedMainTeam} Portfolio` :
             `${selectedSubTeam} Reporting`}
          </h2>
        </div>

        <div className="flex gap-4">
          {viewMode !== 'OVERVIEW' && (
            <button
              onClick={() => setViewMode(viewMode === 'HIERARCHY' ? 'SUB_TEAMS' : 'OVERVIEW')}
              className="px-5 py-2.5 border dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          )}
          <button
            onClick={handleAddEntityClick}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all transform active:scale-95"
          >
            <Plus className="h-4 w-4" /> Add Entity
          </button>
        </div>
      </div>

      <div className="min-h-[500px]">
        {viewMode === 'OVERVIEW' && renderOverview()}
        {viewMode === 'SUB_TEAMS' && renderSubTeamsTable()}
        {viewMode === 'HIERARCHY' && renderHierarchy()}
      </div>

      <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border dark:border-slate-800 shadow-sm border-dashed">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
            <Shield className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">External Collaborators</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Specialized contractors and advisor permissions</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'David Smith', role: 'External Auditor', team: 'Finance' },
            { name: 'Legal Solutions Ltd', role: 'Counsel', team: 'Legal' },
            { name: 'Cloud Architects Inc.', role: 'Infrastructure', team: 'Engineering' },
          ].map((role, i) => (
            <div key={i} className="p-5 rounded-2xl border dark:border-slate-800 flex items-center justify-between group hover:border-blue-400 transition-all cursor-default">
              <div>
                <p className="text-sm font-black text-slate-800 dark:text-white">{role.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{role.role} • {role.team}</p>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <UserIcon className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------- Add Entity Modals --------------------------- */}

      {addModalOpen && viewMode === 'OVERVIEW' && (
        <ModalShell
          title="Add Team"
          onClose={() => { setAddModalOpen(false); resetTeamForm(); }}
          footer={
            <>
              <button onClick={() => { setAddModalOpen(false); resetTeamForm(); }} className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">Cancel</button>
              <button onClick={handleAddTeam} disabled={!newTeamName.trim()} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Add Team</button>
            </>
          }
        >
          <div className="space-y-2">
            <label className={labelCls}>Team Name</label>
            <input type="text" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="e.g. Customer Success" className={inputCls} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Type</label>
            <div className="grid grid-cols-3 gap-3">
              {(['Internal', 'Mixed', 'External'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setNewTeamType(t)}
                  className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${
                    newTeamType === t ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Team Leader (optional)</label>
            <input type="text" value={newTeamLeader} onChange={(e) => setNewTeamLeader(e.target.value)} placeholder="e.g. Alex Rivera" className={inputCls} />
          </div>
        </ModalShell>
      )}

      {addModalOpen && viewMode === 'SUB_TEAMS' && (
        <ModalShell
          title="Add Sub-Team"
          onClose={() => { setAddModalOpen(false); resetSubTeamForm(); }}
          footer={
            <>
              <button onClick={() => { setAddModalOpen(false); resetSubTeamForm(); }} className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">Cancel</button>
              <button onClick={handleAddSubTeam} disabled={!newSubTeamName.trim()} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Add Sub-Team</button>
            </>
          }
        >
          <div className="space-y-2">
            <label className={labelCls}>Sub-Team Name</label>
            <input type="text" value={newSubTeamName} onChange={(e) => setNewSubTeamName(e.target.value)} placeholder="e.g. Platform Engineering" className={inputCls} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Lead</label>
            <EmployeePicker options={employeeDirectory} value={newSubTeamLead} onChange={setNewSubTeamLead} onSelect={(u) => setNewSubTeamLead(u.name)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelCls}>Members</label>
              <input type="number" min={0} value={newSubTeamMembers} onChange={(e) => setNewSubTeamMembers(e.target.value)} placeholder="0" className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className={labelCls}>Health Status</label>
              <select value={newSubTeamHealth} onChange={(e) => setNewSubTeamHealth(e.target.value as SubTeamHealth)} className={`${inputCls} appearance-none cursor-pointer`}>
                <option value="High Focus">High Focus</option>
                <option value="Medium Focus">Medium Focus</option>
                <option value="Low Focus">Low Focus</option>
                <option value="Stable">Stable</option>
              </select>
            </div>
          </div>
        </ModalShell>
      )}

      {addModalOpen && viewMode === 'HIERARCHY' && (
        <ModalShell
          title="Add Person to Structure"
          onClose={() => { setAddModalOpen(false); resetPersonForm(); }}
          footer={
            <>
              <button onClick={() => { setAddModalOpen(false); resetPersonForm(); }} className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">Cancel</button>
              <button onClick={handleAddPerson} disabled={!selectedPerson || !reportsTo} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Add to Structure</button>
            </>
          }
        >
          <div className="space-y-2">
            <label className={labelCls}>Employee</label>
            {selectedPerson ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700">
                <img src={selectedPerson.avatar} className="h-8 w-8 rounded-lg object-cover" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{selectedPerson.name}</p>
                  <p className="text-[10px] text-slate-400">{selectedPerson.position}</p>
                </div>
                <button onClick={() => { setSelectedPerson(null); setPersonQuery(''); }} className="p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <EmployeePicker
                options={employeeDirectory}
                value={personQuery}
                onChange={setPersonQuery}
                onSelect={(u) => { setSelectedPerson(u); setPersonQuery(u.name); }}
                placeholder="Search Employee Directory..."
              />
            )}
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Reports To</label>
            <select value={reportsTo} onChange={(e) => setReportsTo(e.target.value)} className={`${inputCls} appearance-none cursor-pointer`}>
              <option value="">Select a manager...</option>
              {orgNodes.map((n) => <option key={n.id} value={n.id}>{n.name} — {n.role}</option>)}
            </select>
          </div>
        </ModalShell>
      )}

      {/* ------------------------------ Confirm Modals ----------------------------- */}

      {teamToDelete && (
        <ConfirmModal
          title={`Delete ${teamToDelete.name}?`}
          message={`This will remove all ${teamToDelete.count} members from this structure. This action cannot be undone.`}
          onCancel={() => setDeleteTeamId(null)}
          onConfirm={confirmDeleteTeam}
        />
      )}

      {subTeamToDelete && (
        <ConfirmModal
          title={`Delete ${subTeamToDelete.name}?`}
          message={`This will remove all ${subTeamToDelete.members} members from this structure. This action cannot be undone.`}
          onCancel={() => setDeleteSubTeamId(null)}
          onConfirm={confirmDeleteSubTeam}
        />
      )}

      {nodeToRemove && (
        <ConfirmModal
          title={`Remove ${nodeToRemove.name} from this reporting structure?`}
          message="This person will be removed from the organization map."
          warning={
            directReportsOf(nodeToRemove.id).length > 0
              ? `This person has ${directReportsOf(nodeToRemove.id).length} direct report${directReportsOf(nodeToRemove.id).length > 1 ? 's' : ''} who will be reassigned to ${removeParentName ?? 'the top of this structure'}.`
              : undefined
          }
          confirmLabel="Remove"
          onCancel={() => setRemoveNodeId(null)}
          onConfirm={confirmRemoveNode}
        />
      )}

      {/* -------------------------------- Info Modal ------------------------------- */}

      {infoNode && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setInfoNodeId(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] border dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center border-b dark:border-slate-800 relative">
              <button onClick={() => setInfoNodeId(null)} className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
              <img src={infoNode.avatar} alt={infoNode.name} className="h-20 w-20 rounded-2xl object-cover mx-auto shadow-md" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-4">{infoNode.name}</h3>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1">{infoNode.role}</p>
              <span className={`inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                infoNode.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : infoNode.status === 'On Leave' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current"></span> {infoNode.status}
              </span>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Users className="h-4 w-4 text-slate-400" /> {infoNode.team} Team
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Mail className="h-4 w-4 text-slate-400" /> {infoNode.email}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Phone className="h-4 w-4 text-slate-400" /> {infoNode.phone}
              </div>
            </div>
            <div className="p-6 border-t dark:border-slate-800">
              <button
                onClick={() => { setToast('Opening full profile...'); setInfoNodeId(null); }}
                className="w-full py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:opacity-90 transition-all"
              >
                View Full Profile
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

export default TeamView;
