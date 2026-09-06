
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Upload,
  Trash2,
  User as UserIcon,
  Loader2,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { User as UserType } from '../types';
import { EmployeeService } from '../services/api';

export interface EditProfileFormValues {
  avatar: string;
  name: string;
  position: string;
  team: string;
  status: 'Active' | 'On Leave' | 'Sick';
  joinDate: string;
  employmentType: string;
  manager: string;
  bio: string;
  location: string;
  email: string;
  phone: string;
  officeLabel: string;
}

export interface OffboardingSubmission {
  reason: 'Resignation' | 'Mutual';
  lastDay: string;
  note: string;
}

interface EditProfileModalProps {
  employeeId: string;
  initialValues: EditProfileFormValues;
  onClose: () => void;
  onSave: (values: EditProfileFormValues) => void;
  onConfirmOffboarding: (submission: OffboardingSubmission) => void;
}

const TEAMS = ['Creative Team', 'Engineering', 'Product Design', 'Quality', 'Legal & Compliance', 'Human Resources', 'Finance', 'Sales & Marketing'];
const EMPLOYMENT_TYPES = ['Permanent Full-time', 'Part-time', 'Contract', 'Intern'];
const STATUS_OPTIONS: { value: EditProfileFormValues['status']; dot: string }[] = [
  { value: 'Active', dot: 'bg-green-500' },
  { value: 'On Leave', dot: 'bg-amber-500' },
  { value: 'Sick', dot: 'bg-rose-500' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\d][\d\s().-]{5,}$/;

const inputBase = 'w-full rounded-xl bg-slate-50 dark:bg-slate-800 border focus:ring-0 text-sm p-3 text-slate-900 dark:text-white transition-colors';
const okBorder = 'border-transparent focus:border-blue-500';
const errBorder = 'border-rose-400 focus:border-rose-400';
const labelCls = 'text-xs font-bold text-slate-400 uppercase mb-1.5 block';

const EditProfileModal: React.FC<EditProfileModalProps> = ({ employeeId, initialValues, onClose, onSave, onConfirmOffboarding }) => {
  const [values, setValues] = useState<EditProfileFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof EditProfileFormValues, string>>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [managerQuery, setManagerQuery] = useState(initialValues.manager);
  const [managerOptions, setManagerOptions] = useState<UserType[]>([]);
  const [managerDropdownOpen, setManagerDropdownOpen] = useState(false);

  const [offboardingOpen, setOffboardingOpen] = useState(false);
  const [offboardingReason, setOffboardingReason] = useState<'Resignation' | 'Mutual' | ''>('');
  const [offboardingLastDay, setOffboardingLastDay] = useState('');
  const [offboardingNote, setOffboardingNote] = useState('');
  const [offboardingErrors, setOffboardingErrors] = useState<{ reason?: string; lastDay?: string }>({});
  const [offboardingSubmitting, setOffboardingSubmitting] = useState(false);

  useEffect(() => {
    EmployeeService.getAll().then((all) => setManagerOptions(all.filter((e) => e.id !== employeeId)));
  }, [employeeId]);

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialValues),
    [values, initialValues]
  );

  const set = <K extends keyof EditProfileFormValues>(key: K, val: EditProfileFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const filteredManagers = useMemo(
    () => managerOptions.filter((m) => m.name.toLowerCase().includes(managerQuery.toLowerCase())),
    [managerOptions, managerQuery]
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    set('avatar', url);
  };

  const validate = () => {
    const next: Partial<Record<keyof EditProfileFormValues, string>> = {};
    if (!values.name.trim()) next.name = 'Full name is required.';
    if (!values.position.trim()) next.position = 'Position is required.';
    if (!values.team.trim()) next.team = 'Team is required.';
    if (!values.status) next.status = 'Status is required.';
    if (!values.email.trim()) next.email = 'Email is required.';
    else if (!EMAIL_RE.test(values.email.trim())) next.email = 'Enter a valid email address.';
    if (values.phone.trim() && !PHONE_RE.test(values.phone.trim())) next.phone = 'Enter a valid phone number.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      onSave({ ...values, manager: managerQuery });
    }, 1000);
  };

  const handleCloseRequest = () => {
    if (isDirty && !confirmDiscard) {
      setConfirmDiscard(true);
      return;
    }
    onClose();
  };

  const submitOffboarding = () => {
    const next: { reason?: string; lastDay?: string } = {};
    if (!offboardingReason) next.reason = 'Select a reason.';
    if (!offboardingLastDay) next.lastDay = 'Select the last working day.';
    setOffboardingErrors(next);
    if (Object.keys(next).length > 0) return;

    setOffboardingSubmitting(true);
    setTimeout(() => {
      onConfirmOffboarding({
        reason: offboardingReason as 'Resignation' | 'Mutual',
        lastDay: offboardingLastDay,
        note: offboardingNote,
      });
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b dark:border-slate-800 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Profile — {initialValues.name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Update employee record. Changes are saved locally for this demo.</p>
          </div>
          <button
            onClick={handleCloseRequest}
            className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {confirmDiscard && (
          <div className="mx-8 mt-5 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl flex items-center justify-between gap-4 shrink-0">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Discard unsaved changes?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDiscard(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 rounded-lg"
              >
                Keep editing
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
          {/* Section 1: Photo & Basic Info */}
          <section className="space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white">Profile Photo & Basic Info</h3>

            <div className="flex items-center gap-4">
              {values.avatar ? (
                <img src={values.avatar} alt={values.name} className="h-16 w-16 rounded-2xl object-cover border dark:border-slate-700" />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 flex items-center justify-center text-slate-300 dark:text-slate-600">
                  <UserIcon className="h-7 w-7" />
                </div>
              )}
              <div className="flex gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2 border dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Upload className="h-3.5 w-3.5" /> Upload new photo
                </button>
                {values.avatar && (
                  <button
                    onClick={() => set('avatar', '')}
                    className="flex items-center gap-1.5 px-3 py-2 border dark:border-slate-700 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Full Name</label>
                <input
                  type="text"
                  value={values.name}
                  onChange={(e) => set('name', e.target.value)}
                  className={`${inputBase} ${errors.name ? errBorder : okBorder}`}
                />
                {errors.name && <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className={labelCls}>Position / Title</label>
                <input
                  type="text"
                  value={values.position}
                  onChange={(e) => set('position', e.target.value)}
                  className={`${inputBase} ${errors.position ? errBorder : okBorder}`}
                />
                {errors.position && <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.position}</p>}
              </div>

              <div>
                <label className={labelCls}>Team</label>
                <select
                  value={values.team}
                  onChange={(e) => set('team', e.target.value)}
                  className={`${inputBase} ${errors.team ? errBorder : okBorder} appearance-none cursor-pointer`}
                >
                  <option value="">Select a team...</option>
                  {TEAMS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.team && <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.team}</p>}
              </div>

              <div>
                <label className={labelCls}>Employment Status</label>
                <div className="flex items-center gap-2">
                  <select
                    value={values.status}
                    onChange={(e) => set('status', e.target.value as EditProfileFormValues['status'])}
                    className={`${inputBase} ${errors.status ? errBorder : okBorder} appearance-none cursor-pointer`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.value}</option>
                    ))}
                  </select>
                  <span className={`h-2 w-2 rounded-full shrink-0 ${STATUS_OPTIONS.find((s) => s.value === values.status)?.dot}`}></span>
                </div>
                {errors.status && <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.status}</p>}
              </div>

              <div>
                <label className={labelCls}>Joined</label>
                <input
                  type="date"
                  value={values.joinDate}
                  onChange={(e) => set('joinDate', e.target.value)}
                  className={`${inputBase} ${okBorder}`}
                />
              </div>

              <div>
                <label className={labelCls}>Engagement Type</label>
                <select
                  value={values.employmentType}
                  onChange={(e) => set('employmentType', e.target.value)}
                  className={`${inputBase} ${okBorder} appearance-none cursor-pointer`}
                >
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 relative">
                <label className={labelCls}>Manager / Direct Lead</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={managerQuery}
                    onFocus={() => setManagerDropdownOpen(true)}
                    onChange={(e) => { setManagerQuery(e.target.value); setManagerDropdownOpen(true); }}
                    onBlur={() => setTimeout(() => setManagerDropdownOpen(false), 150)}
                    placeholder="Search employees..."
                    className={`${inputBase} ${okBorder} pl-9`}
                  />
                  {managerDropdownOpen && filteredManagers.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredManagers.map((m) => (
                        <button
                          key={m.id}
                          onMouseDown={() => { setManagerQuery(m.name); setManagerDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                          <img src={m.avatar} className="h-6 w-6 rounded-lg object-cover" alt="" />
                          <span className="font-medium text-slate-700 dark:text-slate-200">{m.name}</span>
                          <span className="text-[10px] text-slate-400 ml-auto">{m.position}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Personal Note */}
          <section className="space-y-4 pt-2 border-t dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-white pt-4">Personal Note</h3>
            <div>
              <label className={labelCls}>Bio</label>
              <textarea
                value={values.bio}
                onChange={(e) => set('bio', e.target.value)}
                rows={3}
                className={`${inputBase} ${okBorder} resize-none`}
              />
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input
                type="text"
                value={values.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="e.g. London, UK (Remote)"
                className={`${inputBase} ${okBorder}`}
              />
            </div>
          </section>

          {/* Section 3: Contact Details */}
          <section className="space-y-4 pt-2 border-t dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-white pt-4">Contact Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="text"
                  value={values.email}
                  onChange={(e) => set('email', e.target.value)}
                  className={`${inputBase} ${errors.email ? errBorder : okBorder}`}
                />
                {errors.email && <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input
                  type="text"
                  value={values.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  className={`${inputBase} ${errors.phone ? errBorder : okBorder}`}
                />
                {errors.phone && <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.phone}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Office Location</label>
                <input
                  type="text"
                  value={values.officeLabel}
                  onChange={(e) => set('officeLabel', e.target.value)}
                  placeholder="e.g. London Office"
                  className={`${inputBase} ${okBorder}`}
                />
              </div>
            </div>
          </section>

          {/* Section 4: Danger Zone - Offboarding */}
          <section className="pt-2">
            <div className="border border-rose-200 dark:border-rose-900/40 rounded-2xl p-5 bg-rose-50/40 dark:bg-rose-900/10">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                <h3 className="font-bold text-rose-700 dark:text-rose-400 text-sm uppercase tracking-wide">Danger Zone</h3>
              </div>
              <p className="text-xs text-rose-700/80 dark:text-rose-300/70 mb-4">
                This action is independent of the form above and takes effect immediately.
              </p>

              {!offboardingOpen ? (
                <button
                  onClick={() => setOffboardingOpen(true)}
                  className="px-4 py-2.5 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-lg text-sm font-bold hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all"
                >
                  Assign for Offboarding
                </button>
              ) : (
                <div className="space-y-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-rose-100 dark:border-rose-900/40">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Reason</label>
                      <select
                        value={offboardingReason}
                        onChange={(e) => { setOffboardingReason(e.target.value as 'Resignation' | 'Mutual'); setOffboardingErrors((p) => ({ ...p, reason: undefined })); }}
                        className={`${inputBase} ${offboardingErrors.reason ? errBorder : okBorder} appearance-none cursor-pointer`}
                      >
                        <option value="">Select reason...</option>
                        <option value="Resignation">Resignation</option>
                        <option value="Mutual">Mutual</option>
                      </select>
                      {offboardingErrors.reason && <p className="text-[11px] text-rose-600 font-bold mt-1">{offboardingErrors.reason}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>Last Working Day</label>
                      <input
                        type="date"
                        value={offboardingLastDay}
                        onChange={(e) => { setOffboardingLastDay(e.target.value); setOffboardingErrors((p) => ({ ...p, lastDay: undefined })); }}
                        className={`${inputBase} ${offboardingErrors.lastDay ? errBorder : okBorder}`}
                      />
                      {offboardingErrors.lastDay && <p className="text-[11px] text-rose-600 font-bold mt-1">{offboardingErrors.lastDay}</p>}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Note (optional)</label>
                    <textarea
                      value={offboardingNote}
                      onChange={(e) => setOffboardingNote(e.target.value)}
                      rows={2}
                      className={`${inputBase} ${okBorder} resize-none`}
                    />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setOffboardingOpen(false)}
                      className="px-4 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitOffboarding}
                      disabled={offboardingSubmitting}
                      className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700 transition-all disabled:opacity-60"
                    >
                      {offboardingSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      Confirm Offboarding
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={handleCloseRequest}
            className="px-4 py-2 border dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
