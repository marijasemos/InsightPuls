
import React, { useRef, useState } from 'react';
import {
  Palette,
  KeyRound,
  FileText,
  ShieldCheck,
  Image as ImageIcon,
  Upload,
  Trash2,
  Plus,
  Lock,
  Eye,
  X,
  ChevronDown,
  Building2,
  Bot,
  Info,
} from 'lucide-react';

export interface BrandingConfig {
  logoLight: string;
  logoDark: string;
  favicon: string;
  accentColor: string;
  productName: string;
  loginCustomEnabled: boolean;
  loginBgType: 'color' | 'image' | 'gradient';
  loginBgColor: string;
  loginBgImage: string;
  loginBgGradient: string;
  loginHeadline: string;
  loginSubtext: string;
  showPoweredBy: boolean;
  includeLogoOnDocuments: boolean;
  includeLogoOnPayslips: boolean;
  emailSenderName: string;
  includeLogoInEmailHeader: boolean;
  teamsBotName: string;
  teamsBotIcon: string;
}

export const DEFAULT_BRANDING: BrandingConfig = {
  logoLight: '',
  logoDark: '',
  favicon: '',
  accentColor: '#f59e0b',
  productName: '',
  loginCustomEnabled: true,
  loginBgType: 'gradient',
  loginBgColor: '#0f172a',
  loginBgImage: '',
  loginBgGradient: 'linear-gradient(135deg, #2563eb, #4f46e5)',
  loginHeadline: 'Welcome to InsightPro',
  loginSubtext: 'Sign in to access your HR workspace.',
  showPoweredBy: true,
  includeLogoOnDocuments: true,
  includeLogoOnPayslips: true,
  emailSenderName: 'InsightPro HR',
  includeLogoInEmailHeader: true,
  teamsBotName: 'InsightPro Assistant',
  teamsBotIcon: '',
};

const ACCENT_SWATCHES = ['#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];
const GRADIENT_PRESETS = [
  'linear-gradient(135deg, #2563eb, #4f46e5)',
  'linear-gradient(135deg, #059669, #0d9488)',
  'linear-gradient(135deg, #7c3aed, #db2777)',
  'linear-gradient(135deg, #0f172a, #334155)',
];

const ENTITIES = ['InsightPro Corp. (HQ)', 'InsightPro EU Ltd.'];

const RECENT_CHANGES = [
  { user: 'Marija M.', field: 'Primary Color', date: 'Sep 2, 2026' },
  { user: 'John Doe', field: 'Product Display Name', date: 'Aug 28, 2026' },
  { user: 'Marija M.', field: 'Login Headline', date: 'Aug 20, 2026' },
  { user: 'John Doe', field: '"Show Powered By" badge', date: 'Aug 15, 2026' },
];

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`h-6 w-11 rounded-full relative transition-colors shrink-0 ${checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
  >
    <span className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const ToggleRow: React.FC<{ label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, desc, checked, onChange }) => (
  <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-800">
    <div>
      <p className="text-sm font-bold dark:text-white">{label}</p>
      {desc && <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>}
    </div>
    <ToggleSwitch checked={checked} onChange={onChange} />
  </div>
);

const CardShell: React.FC<{ icon: React.ElementType; title: string; desc: string; children: React.ReactNode }> = ({ icon: Icon, title, desc, children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm p-8 space-y-8">
    <div>
      <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
        <Icon className="h-5 w-5 text-blue-500" /> {title}
      </h3>
      <p className="text-sm text-slate-500 mt-1">{desc}</p>
    </div>
    {children}
  </div>
);

interface BrandingSettingsProps {
  primaryColor: string;
  onPrimaryColorChange: (color: string) => void;
  branding: BrandingConfig;
  onChange: (patch: Partial<BrandingConfig>) => void;
}

const BrandingSettings: React.FC<BrandingSettingsProps> = ({ primaryColor, onPrimaryColorChange, branding, onChange }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [entity, setEntity] = useState(ENTITIES[0]);
  const [entityOpen, setEntityOpen] = useState(false);

  const logoLightRef = useRef<HTMLInputElement>(null);
  const logoDarkRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);
  const loginBgRef = useRef<HTMLInputElement>(null);
  const botIconRef = useRef<HTMLInputElement>(null);

  const displayName = branding.productName || 'InsightPro';
  const initials = displayName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'IP';

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, key: keyof BrandingConfig) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange({ [key]: URL.createObjectURL(file) } as Partial<BrandingConfig>);
    e.target.value = '';
  };

  const loginBackgroundStyle: React.CSSProperties =
    branding.loginBgType === 'color'
      ? { backgroundColor: branding.loginBgColor }
      : branding.loginBgType === 'image' && branding.loginBgImage
      ? { backgroundImage: `url(${branding.loginBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { backgroundImage: branding.loginBgGradient };

  const HeaderPreview = () => (
    <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-700 shadow-sm">
      <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-black text-xs overflow-hidden shrink-0" style={{ backgroundColor: primaryColor }}>
        {branding.logoLight ? <img src={branding.logoLight} alt="" className="h-full w-full object-contain" /> : initials}
      </div>
      <span className="font-bold dark:text-white text-sm">{displayName}</span>
      <span className="ml-auto h-2.5 w-2.5 rounded-full" style={{ backgroundColor: branding.accentColor }}></span>
    </div>
  );

  const LoginPreview = () => (
    <div className="rounded-2xl overflow-hidden border dark:border-slate-800 shadow-sm" style={loginBackgroundStyle}>
      <div className="p-6 flex flex-col items-center text-center gap-2.5 bg-black/25 min-h-[220px] justify-center">
        <div className="h-10 w-10 rounded-xl bg-white/95 flex items-center justify-center font-black text-sm overflow-hidden" style={{ color: primaryColor }}>
          {branding.logoLight ? <img src={branding.logoLight} alt="" className="h-full w-full object-contain" /> : initials}
        </div>
        <h4 className="text-white font-black text-sm leading-tight">{branding.loginHeadline || 'Welcome'}</h4>
        <p className="text-white/80 text-[11px] leading-snug">{branding.loginSubtext}</p>
        <div className="w-full space-y-1.5 mt-2">
          <div className="h-7 bg-white/90 rounded-lg"></div>
          <div className="h-7 rounded-lg" style={{ backgroundColor: primaryColor }}></div>
        </div>
        {branding.showPoweredBy && <p className="text-white/50 text-[9px] mt-2 uppercase tracking-widest">Powered by InsightPro</p>}
      </div>
    </div>
  );

  const PayslipPreview = () => (
    <div className="rounded-2xl border dark:border-slate-800 overflow-hidden bg-white">
      <div className="p-4 flex items-center justify-between border-b-2 border-slate-900">
        <div className="flex items-center gap-2">
          {branding.includeLogoOnPayslips && branding.logoLight && <img src={branding.logoLight} alt="" className="h-6 object-contain" />}
          <span className="text-xs font-black uppercase text-slate-900">{displayName}</span>
        </div>
        <span className="text-[9px] font-bold text-slate-400 uppercase">Payslip</span>
      </div>
      <div className="p-4 space-y-2">
        <div className="h-2 w-3/4 bg-slate-100 rounded"></div>
        <div className="h-2 w-full bg-slate-100 rounded"></div>
        <div className="h-8 rounded-lg flex items-center justify-between px-3 mt-3" style={{ backgroundColor: primaryColor }}>
          <span className="text-[9px] font-black uppercase text-white tracking-widest">Net Payable</span>
          <span className="text-[10px] font-black text-white">€4,125.00</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {ENTITIES.length > 1 && (
        <div className="relative inline-block">
          <button
            onClick={() => setEntityOpen((o) => !o)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl text-sm font-bold dark:text-white border dark:border-slate-800 shadow-sm"
          >
            <Building2 className="h-4 w-4 text-slate-400" />
            Applying to: <span className="text-blue-600 dark:text-blue-400">{entity}</span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
          {entityOpen && (
            <div className="absolute z-20 mt-2 w-72 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl shadow-lg overflow-hidden">
              {ENTITIES.map((e) => (
                <button
                  key={e}
                  onClick={() => { setEntity(e); setEntityOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white ${e === entity ? 'text-blue-600 dark:text-blue-400' : ''}`}
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CARD 1: Visual Identity */}
      <CardShell icon={Palette} title="Visual Identity" desc="Define how your brand appears across the entire application.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {(['light', 'dark'] as const).map((mode) => {
            const key = mode === 'light' ? 'logoLight' : 'logoDark';
            const value = branding[key];
            const ref = mode === 'light' ? logoLightRef : logoDarkRef;
            return (
              <div key={mode} className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Logo ({mode === 'light' ? 'Light Mode' : 'Dark Mode'})</label>
                <div className={`h-28 rounded-2xl border-2 border-dashed dark:border-slate-700 flex items-center justify-center overflow-hidden ${mode === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
                  {value ? <img src={value} alt="" className="max-h-20 max-w-[80%] object-contain" /> : <ImageIcon className="h-6 w-6 text-slate-300" />}
                </div>
                <div className="flex gap-2">
                  <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, key)} />
                  <button onClick={() => ref.current?.click()} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <Upload className="h-3.5 w-3.5" /> Upload
                  </button>
                  {value && (
                    <button onClick={() => onChange({ [key]: '' } as Partial<BrandingConfig>)} className="px-3 py-2 border dark:border-slate-700 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Favicon</label>
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
              {branding.favicon ? <img src={branding.favicon} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-4 w-4 text-slate-300" />}
            </div>
            <div className="flex-1 min-w-0 flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border dark:border-slate-700">
              <div className="h-3.5 w-3.5 rounded-sm overflow-hidden bg-white shrink-0 flex items-center justify-center">
                {branding.favicon && <img src={branding.favicon} alt="" className="h-full w-full object-cover" />}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{displayName} — Dashboard</span>
            </div>
            <input ref={faviconRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'favicon')} />
            <button onClick={() => faviconRef.current?.click()} className="px-3 py-2.5 border dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0">
              Upload
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Color</label>
            <div className="flex flex-wrap gap-3">
              {['#2563eb', '#059669', '#7c3aed', '#db2777', '#ea580c', '#0f172a'].map((color) => (
                <button
                  key={color}
                  onClick={() => onPrimaryColorChange(color)}
                  className={`h-10 w-10 rounded-xl transition-all transform hover:scale-110 shadow-sm ${primaryColor === color ? 'ring-4 ring-offset-2 dark:ring-offset-slate-900 ring-slate-200 dark:ring-slate-700' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <div className="relative">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => onPrimaryColorChange(e.target.value)}
                  className="h-10 w-10 rounded-xl opacity-0 absolute inset-0 cursor-pointer"
                />
                <div className="h-10 w-10 rounded-xl border-2 border-dashed dark:border-slate-700 flex items-center justify-center text-slate-400">
                  <Plus className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accent Color</label>
            <div className="flex flex-wrap gap-3">
              {ACCENT_SWATCHES.map((color) => (
                <button
                  key={color}
                  onClick={() => onChange({ accentColor: color })}
                  className={`h-10 w-10 rounded-xl transition-all transform hover:scale-110 shadow-sm ${branding.accentColor === color ? 'ring-4 ring-offset-2 dark:ring-offset-slate-900 ring-slate-200 dark:ring-slate-700' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <div className="relative">
                <input
                  type="color"
                  value={branding.accentColor}
                  onChange={(e) => onChange({ accentColor: e.target.value })}
                  className="h-10 w-10 rounded-xl opacity-0 absolute inset-0 cursor-pointer"
                />
                <div className="h-10 w-10 rounded-xl border-2 border-dashed dark:border-slate-700 flex items-center justify-center text-slate-400">
                  <Plus className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product Display Name</label>
          <input
            type="text"
            value={branding.productName}
            onChange={(e) => onChange({ productName: e.target.value })}
            placeholder="InsightPro Corp."
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:ring-0 text-sm font-bold dark:text-white"
          />
        </div>

        <div className="p-5 rounded-2xl border dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Live Preview</p>
          <HeaderPreview />
        </div>
      </CardShell>

      {/* CARD 2: Login Screen */}
      <CardShell icon={KeyRound} title="Login Screen" desc="Customize the first thing your employees see.">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8">
          <div className="space-y-6">
            <ToggleRow
              label="Use custom login branding"
              checked={branding.loginCustomEnabled}
              onChange={(v) => onChange({ loginCustomEnabled: v })}
            />

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Background</label>
              <div className="grid grid-cols-3 gap-3">
                {(['color', 'image', 'gradient'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => onChange({ loginBgType: opt })}
                    className={`p-3 rounded-xl border-2 text-[11px] font-bold uppercase tracking-widest transition-all capitalize ${
                      branding.loginBgType === opt
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {branding.loginBgType === 'color' && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {['#0f172a', '#1e3a8a', '#064e3b', '#3b0764', '#7f1d1d'].map((color) => (
                    <button
                      key={color}
                      onClick={() => onChange({ loginBgColor: color })}
                      className={`h-9 w-9 rounded-lg transition-all hover:scale-110 ${branding.loginBgColor === color ? 'ring-4 ring-offset-2 dark:ring-offset-slate-900 ring-slate-200 dark:ring-slate-700' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}

              {branding.loginBgType === 'gradient' && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {GRADIENT_PRESETS.map((grad) => (
                    <button
                      key={grad}
                      onClick={() => onChange({ loginBgGradient: grad })}
                      className={`h-9 w-9 rounded-lg transition-all hover:scale-110 ${branding.loginBgGradient === grad ? 'ring-4 ring-offset-2 dark:ring-offset-slate-900 ring-slate-200 dark:ring-slate-700' : ''}`}
                      style={{ backgroundImage: grad }}
                    />
                  ))}
                </div>
              )}

              {branding.loginBgType === 'image' && (
                <div className="flex items-center gap-3 pt-1">
                  <div className="h-14 w-20 rounded-lg border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                    {branding.loginBgImage ? <img src={branding.loginBgImage} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-4 w-4 text-slate-300" />}
                  </div>
                  <input ref={loginBgRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'loginBgImage')} />
                  <button onClick={() => loginBgRef.current?.click()} className="px-3 py-2 border dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                    Upload Image
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Welcome Headline</label>
              <input
                type="text"
                value={branding.loginHeadline}
                onChange={(e) => onChange({ loginHeadline: e.target.value })}
                placeholder="Welcome to Acme HR"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:ring-0 text-sm font-bold dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Welcome Subtext</label>
              <input
                type="text"
                value={branding.loginSubtext}
                onChange={(e) => onChange({ loginSubtext: e.target.value })}
                placeholder="Sign in to continue"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:ring-0 text-sm font-bold dark:text-white"
              />
            </div>

            <ToggleRow
              label='Show "Powered by InsightPro" badge'
              checked={branding.showPoweredBy}
              onChange={(v) => onChange({ showPoweredBy: v })}
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Preview</p>
            <LoginPreview />
          </div>
        </div>
      </CardShell>

      {/* CARD 3: Documents & Communications */}
      <CardShell icon={FileText} title="Documents & Communications" desc="Apply your brand to everything sent to employees.">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8">
          <div className="space-y-4">
            <ToggleRow
              label="Include logo on generated documents"
              desc="Applies to Generate Annex, Export Report and Download Strategy Deck."
              checked={branding.includeLogoOnDocuments}
              onChange={(v) => onChange({ includeLogoOnDocuments: v })}
            />
            <div>
              <ToggleRow
                label="Include logo on payslips"
                checked={branding.includeLogoOnPayslips}
                onChange={(v) => onChange({ includeLogoOnPayslips: v })}
              />
              <p className="text-[10px] text-slate-400 mt-1.5 px-1">Applies to all payslips in My Payroll & Income.</p>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Sender Name</label>
              <input
                type="text"
                value={branding.emailSenderName}
                onChange={(e) => onChange({ emailSenderName: e.target.value })}
                placeholder="Acme HR"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:ring-0 text-sm font-bold dark:text-white"
              />
            </div>

            <ToggleRow
              label="Include logo in email header"
              checked={branding.includeLogoInEmailHeader}
              onChange={(v) => onChange({ includeLogoInEmailHeader: v })}
            />

            <div className="pt-4 border-t dark:border-slate-800 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Microsoft Teams Bot Name</label>
                <input
                  type="text"
                  value={branding.teamsBotName}
                  onChange={(e) => onChange({ teamsBotName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:ring-0 text-sm font-bold dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bot Icon</label>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                    {branding.teamsBotIcon ? <img src={branding.teamsBotIcon} alt="" className="h-full w-full object-cover" /> : <Bot className="h-4 w-4 text-slate-300" />}
                  </div>
                  <input ref={botIconRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'teamsBotIcon')} />
                  <button onClick={() => botIconRef.current?.click()} className="px-3 py-2 border dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                    Upload
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Email Preview</p>
            <PayslipEmailPreview />
          </div>
        </div>
      </CardShell>

      {/* CARD 4: Access & Publishing */}
      <CardShell icon={ShieldCheck} title="Access & Publishing" desc="Control who can change these settings and preview before publishing.">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-800">
          <Lock className="h-4 w-4 text-slate-400 shrink-0" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Only users with <span className="font-bold text-slate-700 dark:text-slate-300">Super Admin</span> role can modify Master Configuration.
          </p>
        </div>

        <button
          onClick={() => setPreviewOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 border-2 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <Eye className="h-4 w-4" /> Preview Changes
        </button>

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recent Changes</p>
          <div className="space-y-2">
            {RECENT_CHANGES.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-800">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-800 dark:text-white">{c.user}</span> changed <span className="font-bold">{c.field}</span>
                </p>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{c.date}</span>
              </div>
            ))}
          </div>
        </div>
      </CardShell>

      {previewOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[88vh] flex flex-col bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="px-8 pt-7 pb-5 border-b dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-blue-500" />
                <div>
                  <h2 className="text-lg font-bold dark:text-white">Preview Changes</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Unsaved — click Save Configuration to publish.</p>
                </div>
              </div>
              <button onClick={() => setPreviewOpen(false)} className="h-9 w-9 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Dashboard Header</p>
                  <HeaderPreview />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Login Screen</p>
                  <LoginPreview />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Payslip Sample</p>
                  <PayslipPreview />
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex items-start gap-3">
                <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                  This is a live preview of your unsaved changes. Click <strong>Save Configuration</strong> at the top of the page to publish them.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function PayslipEmailPreview() {
    return (
      <div className="rounded-2xl border dark:border-slate-800 overflow-hidden">
        <div className="p-4 flex items-center gap-3" style={{ backgroundColor: primaryColor }}>
          {branding.includeLogoInEmailHeader && branding.logoLight && <img src={branding.logoLight} alt="" className="h-6 object-contain" />}
          <span className="text-white font-bold text-sm">{branding.emailSenderName || displayName}</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-950 space-y-2">
          <div className="h-2 w-3/4 bg-slate-100 dark:bg-slate-800 rounded"></div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
          <div className="h-2 w-2/3 bg-slate-100 dark:bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }
};

export default BrandingSettings;
