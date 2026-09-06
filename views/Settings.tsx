
import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Type, 
  Layout, 
  Database, 
  Zap, 
  Palette, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle,
  Eye,
  EyeOff,
  MoveVertical,
  Globe
} from 'lucide-react';
import { useApp } from '../App';
import BrandingSettings from '../components/BrandingSettings';

type SettingsTab = 'Labels' | 'Navigation' | 'Custom Fields' | 'Workflows' | 'Branding';

const Settings: React.FC = () => {
  const { settings, updateSettings, branding, updateBranding } = useApp();
  const [activeTab, setActiveTab] = useState<SettingsTab>('Labels');
  const [tempSettings, setTempSettings] = useState(settings);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    updateSettings(tempSettings);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const updateLabel = (key: keyof typeof settings.labels, val: string) => {
    setTempSettings(prev => ({
      ...prev,
      labels: { ...prev.labels, [key]: val }
    }));
  };

  const toggleNav = (id: string) => {
    setTempSettings(prev => ({
      ...prev,
      navigation: prev.navigation.map(item => 
        item.id === id ? { ...item, isVisible: !item.isVisible } : item
      )
    }));
  };

  const addCustomField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      label: 'New Custom Field',
      type: 'text' as const,
      section: 'Work' as const
    };
    setTempSettings(prev => ({
      ...prev,
      customFields: [...prev.customFields, newField]
    }));
  };

  const deleteCustomField = (id: string) => {
    setTempSettings(prev => ({
      ...prev,
      customFields: prev.customFields.filter(f => f.id !== id)
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Master Configuration</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Adapt the entire system architecture to your organization's needs.</p>
        </div>
        <div className="flex items-center gap-3">
          {showSaved && (
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm animate-in fade-in slide-in-from-right-2">
              <CheckCircle className="h-4 w-4" /> Configuration saved and published
            </div>
          )}
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
          >
            <Save className="h-4 w-4" /> Save Configuration
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Navigation */}
        <aside className="w-full lg:w-64 space-y-1">
          {[
            { id: 'Labels', icon: Type, label: 'System Labels' },
            { id: 'Navigation', icon: Layout, label: 'Menu Structure' },
            { id: 'Custom Fields', icon: Database, label: 'Field Constructor' },
            { id: 'Workflows', icon: Zap, label: 'AI & Automations' },
            { id: 'Branding', icon: Palette, label: 'Branding' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Settings Content */}
        <div className="flex-1">
        {activeTab === 'Branding' ? (
          <BrandingSettings
            primaryColor={tempSettings.primaryColor}
            onPrimaryColorChange={(color) => setTempSettings(prev => ({ ...prev, primaryColor: color }))}
            branding={branding}
            onChange={updateBranding}
          />
        ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm p-8">

          {activeTab === 'Labels' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" /> Global Vocabulary
                </h3>
                <p className="text-sm text-slate-500 mt-1">Change technical terms into your preferred corporate language.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(tempSettings.labels).map(([key, val]) => (
                  <div key={key} className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{key.replace('_', ' ')}</label>
                    <input 
                      type="text" 
                      value={val}
                      onChange={(e) => updateLabel(key as any, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:ring-0 text-sm font-bold dark:text-white"
                    />
                  </div>
                ))}
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                  <strong>Pro Tip:</strong> Changing these labels will update all headers, tables, and buttons across the entire app for all users.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'Navigation' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold dark:text-white">Menu Structure</h3>
                <p className="text-sm text-slate-500 mt-1">Toggle module visibility for the HR Sidebar.</p>
              </div>
              <div className="space-y-3">
                {tempSettings.navigation.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 group">
                    <div className="flex items-center gap-4">
                      <MoveVertical className="h-4 w-4 text-slate-300 cursor-move" />
                      <div>
                        <p className="text-sm font-bold dark:text-white">{item.label}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{item.path}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleNav(item.id)}
                      className={`p-2 rounded-lg transition-colors ${item.isVisible ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-400 grayscale'}`}
                    >
                      {item.isVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </button>
                  </div>
                ))}
              </div>
              <button className="w-full py-3 border-2 border-dashed dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-400 hover:text-blue-600 hover:border-blue-400 transition-all flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" /> Add Custom Menu Link
              </button>
            </div>
          )}

          {activeTab === 'Custom Fields' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold dark:text-white">Field Constructor</h3>
                  <p className="text-sm text-slate-500 mt-1">Add custom data points to {tempSettings.labels.employee} profiles.</p>
                </div>
                <button 
                  onClick={addCustomField}
                  className="px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all"
                >
                  <Plus className="h-4 w-4 inline mr-2" /> Add Field
                </button>
              </div>

              <div className="space-y-4">
                {tempSettings.customFields.length === 0 ? (
                  <div className="p-12 text-center border-2 border-dashed dark:border-slate-800 rounded-3xl">
                    <Database className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No custom fields created yet.</p>
                  </div>
                ) : (
                  tempSettings.customFields.map((field) => (
                    <div key={field.id} className="p-6 rounded-2xl border dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Field Label</label>
                        <input 
                          type="text" 
                          value={field.label}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTempSettings(prev => ({
                              ...prev,
                              customFields: prev.customFields.map(f => f.id === field.id ? { ...f, label: val } : f)
                            }));
                          }}
                          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border-transparent text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Type</label>
                        <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border-transparent text-sm font-bold">
                          <option>Text</option>
                          <option>Date</option>
                          <option>Selection</option>
                        </select>
                      </div>
                      <div className="flex justify-end">
                        <button 
                          onClick={() => deleteCustomField(field.id)}
                          className="p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'Workflows' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold dark:text-white">AI Thresholds & Automations</h3>
                <p className="text-sm text-slate-500 mt-1">Configure the logic that triggers AI alerts and automated emails.</p>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Risk Alert Threshold', desc: 'Trigger alert after X consecutive Low mood entries.', val: 3 },
                  { label: 'Onboarding Duration', desc: 'Days until an employee is considered "Active".', val: 90 },
                  { label: 'Auto-Reject Overdue Requests', desc: 'Days until a pending request is auto-rejected.', val: 14 },
                ].map((rule, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4 border dark:border-slate-800">
                    <div>
                      <p className="text-sm font-bold dark:text-white">{rule.label}</p>
                      <p className="text-xs text-slate-400 mt-1">{rule.desc}</p>
                    </div>
                    <input 
                      type="number" 
                      defaultValue={rule.val}
                      className="w-20 px-4 py-2 bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-center text-sm font-bold dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
        )}
        </div>
      </div>

      <div className="p-8 border border-dashed dark:border-slate-800 rounded-[2.5rem] bg-slate-50/30 dark:bg-slate-900/30 flex flex-col items-center gap-4">
        <div className="h-10 w-10 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center text-slate-400">
          <Zap className="h-5 w-5" />
        </div>
        <div className="text-center">
          <h4 className="font-bold dark:text-white">Need custom API functions?</h4>
          <p className="text-xs text-slate-500 max-w-lg mt-1">
            For advanced logic like specific payroll integrations or custom ERP webhooks, 
            contact our engineering support via the Developer Portal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
