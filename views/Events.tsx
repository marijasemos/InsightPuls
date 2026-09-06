
import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Music,
  Sun,
  Snowflake,
  Heart,
  Trophy,
  Pizza,
  Lightbulb,
  X,
  ChevronRight,
  Clock,
  Ticket,
  Share2,
  Bell,
  Plus,
  CheckCircle2,
  // Added Info icon to imports
  Info
} from 'lucide-react';
import { useApp } from '../App';
import { UserRole } from '../types';

interface EventItem {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  shortDesc: string;
  longDesc: string;
  icon: any;
  color: string;
  status: 'Upcoming' | 'Registrations Open' | 'Past';
  stats: { label: string; value: string }[];
}

const EVENTS_DATA: EventItem[] = [
  {
    id: 'ny-party',
    title: 'New Year Party 2024',
    category: 'Social',
    date: 'December 22, 2023',
    location: 'Grand Ballroom, Plaza Hotel',
    shortDesc: 'Celebrate the end of a successful year with the whole team!',
    longDesc: 'Join us for a night of music, fine dining, and celebration. We’ll be hosting our annual gala dinner followed by live performances and an awards ceremony to recognize our top performers of the year. Dress code: Black Tie / Formal.',
    icon: Music,
    color: 'purple',
    status: 'Upcoming',
    stats: [
      { label: 'Attendees', value: '145 Signed up' },
      { label: 'Dress Code', value: 'Formal / Black Tie' },
      { label: 'Time', value: '19:00 - 02:00' },
      { label: 'Plus One', value: 'Allowed' }
    ]
  },
  {
    id: 'summer-tb',
    title: 'Summer Team Building',
    category: 'Outdoor',
    date: 'July 15-17, 2024',
    location: 'Mountain Resort, Alps',
    shortDesc: 'A weekend of hiking, rafting, and fresh air.',
    longDesc: 'Our annual summer retreat is all about disconnecting from tech and reconnecting with colleagues. Activities include guided hikes, whitewater rafting, campfire evenings, and collaborative strategy workshops in nature.',
    icon: Sun,
    color: 'orange',
    status: 'Upcoming',
    stats: [
      { label: 'Duration', value: '3 Days' },
      { label: 'Transport', value: 'Company Bus' },
      { label: 'Accommodation', value: 'Eco-Lodge' },
      { label: 'Difficulty', value: 'Moderate' }
    ]
  },
  {
    id: 'winter-sports',
    title: 'Winter Sports Weekend',
    category: 'Sport',
    date: 'February 10-12, 2024',
    location: 'Zermatt Ski Area',
    shortDesc: 'Skiing, snowboarding and apres-ski fun.',
    longDesc: 'Hit the slopes with your teammates! Whether you are a pro skier or a total beginner, we have instructors and equipment ready for everyone. Evenings are reserved for cozy fondue dinners and networking.',
    icon: Snowflake,
    color: 'blue',
    status: 'Registrations Open',
    stats: [
      { label: 'Equipment', value: 'Provided' },
      { label: 'Instructors', value: 'Available' },
      { label: 'Spots Left', value: '12 / 40' },
      { label: 'Deadline', value: 'Jan 15' }
    ]
  },
  {
    id: 'charity-run',
    title: 'Charity Run for Kids',
    category: 'Charity',
    date: 'October 12, 2023',
    location: 'Central Park Loop',
    shortDesc: 'Running for a cause. All proceeds go to local orphanages.',
    longDesc: 'Put on your running shoes! Every kilometer you run will be matched with a 10 EUR donation from the company. Families are welcome to join us for the post-run picnic.',
    icon: Heart,
    color: 'rose',
    status: 'Past',
    stats: [
      { label: 'Distance', value: '5K or 10K' },
      { label: 'Funds Raised', value: '12,400 EUR' },
      { label: 'Participants', value: '88 Employees' },
      { label: 'Charity', value: 'ChildHope Foundation' }
    ]
  },
  {
    id: 'basketball',
    title: 'Inter-Departmental Basketball',
    category: 'Sports',
    date: 'Every Thursday',
    location: 'City Arena Court B',
    shortDesc: 'Weekly friendly matches between departments.',
    longDesc: 'The Engineering vs Marketing rivalry continues! Join our weekly basketball sessions. It’s a great way to stay fit and build healthy competition across the company.',
    icon: Trophy,
    color: 'amber',
    status: 'Registrations Open',
    stats: [
      { label: 'Frequency', value: 'Weekly' },
      { label: 'Skill Level', value: 'All welcome' },
      { label: 'Teams', value: 'Mixed' },
      { label: 'Current Champ', value: 'Design Team' }
    ]
  },
  {
    id: 'pizza-friday',
    title: 'Monthly Pizza Friday',
    category: 'Social',
    date: 'Last Friday of month',
    location: 'Office Lounge',
    shortDesc: 'Informal lunch and hang out with the team.',
    longDesc: 'A company tradition. On the last Friday of every month, we gather in the office lounge for pizza, drinks, and casual conversations. No meetings allowed after 2 PM!',
    icon: Pizza,
    color: 'red',
    status: 'Upcoming',
    stats: [
      { label: 'Menu', value: 'Italian / Vegan' },
      { label: 'Drinks', value: 'Included' },
      { label: 'Vibe', value: 'Chill' },
      { label: 'Next Date', value: 'Nov 24' }
    ]
  },
  {
    id: 'tech-talk',
    title: 'Tech & Innovation Talk',
    category: 'Professional',
    date: 'November 2, 2023',
    location: 'Room 402 / Zoom',
    shortDesc: 'Guest speaker: AI Trends in 2024.',
    longDesc: 'We’re inviting industry experts to share insights on emerging technologies. This month, we host a guest from Silicon Valley to discuss the future of Generative AI in enterprise software.',
    icon: Lightbulb,
    color: 'cyan',
    status: 'Upcoming',
    stats: [
      { label: 'Speaker', value: 'Dr. Jane Smith' },
      { label: 'CPE Credits', value: '2 Hours' },
      { label: 'Format', value: 'Hybrid' },
      { label: 'Topic', value: 'AI & Data' }
    ]
  },
  {
    id: 'blood-drive',
    title: 'Corporate Blood Drive',
    category: 'Charity',
    date: 'November 15, 2023',
    location: 'Office Ground Floor',
    shortDesc: 'Donate blood, save lives. Mobile unit will be on-site.',
    longDesc: 'We’ve partnered with the National Red Cross to host a blood donation day at our headquarters. It’s a simple act that makes a huge difference. Refreshments provided for all donors.',
    icon: Heart,
    color: 'emerald',
    status: 'Upcoming',
    stats: [
      { label: 'Partner', value: 'Red Cross' },
      { label: 'Time Slot', value: '09:00 - 15:00' },
      { label: 'Goal', value: '50 Donors' },
      { label: 'Recovery', value: 'Snacks provided' }
    ]
  }
];

type NewEventType = 'Social' | 'Sports' | 'Charity' | 'Professional';

const EVENT_TYPE_CONFIG: Record<NewEventType, { icon: EventItem['icon']; color: string }> = {
  Social: { icon: Music, color: 'purple' },
  Sports: { icon: Trophy, color: 'amber' },
  Charity: { icon: Heart, color: 'rose' },
  Professional: { icon: Lightbulb, color: 'cyan' },
};

const inputCls = 'w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-blue-500 focus:ring-0 text-sm p-3 text-slate-900 dark:text-white transition-colors';
const labelCls = 'text-xs font-bold text-slate-400 uppercase mb-1.5 block';

const Events: React.FC = () => {
  const { role } = useApp();
  const [events, setEvents] = useState<EventItem[]>(EVENTS_DATA);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<NewEventType>('Social');
  const [newDate, setNewDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDesc, setNewDesc] = useState('');

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const resetCreateForm = () => {
    setNewTitle('');
    setNewType('Social');
    setNewDate('');
    setNewLocation('');
    setNewDesc('');
  };

  const canCreate = newTitle.trim() && newDate.trim() && newLocation.trim();

  const handleCreateEvent = () => {
    if (!canCreate) return;
    const config = EVENT_TYPE_CONFIG[newType];
    setEvents((prev) => [
      {
        id: `evt-${Date.now()}`,
        title: newTitle.trim(),
        category: newType,
        date: newDate.trim(),
        location: newLocation.trim(),
        shortDesc: newDesc.trim(),
        longDesc: newDesc.trim(),
        icon: config.icon,
        color: config.color,
        status: 'Upcoming',
        stats: [],
      },
      ...prev,
    ]);
    resetCreateForm();
    setCreateOpen(false);
    setToast('Event created');
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Upcoming': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800/30';
      case 'Registrations Open': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30';
      case 'Past': return 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-700';
    }
  };

  const getColorStyles = (color: string) => {
    const map: Record<string, string> = {
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
      amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
      emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    };
    return map[color] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Upcoming Events</h1>
          <p className="text-slate-500 dark:text-slate-400">Connect, grow, and have fun with your teammates.</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2 border dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-white dark:hover:bg-slate-800 transition-colors">
            <Calendar className="h-4 w-4" /> Sync to Calendar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors">
            <Bell className="h-4 w-4" /> Manage Notifications
          </button>
          {role === UserRole.HR && (
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
            >
              <Plus className="h-4 w-4" /> Create Event
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => setSelectedEvent(event)}
            className={`group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 text-left shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden active:scale-[0.98] ${event.status === 'Past' ? 'opacity-70 grayscale-[0.5]' : ''}`}
          >
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full opacity-[0.03] transition-transform group-hover:scale-150 ${getColorStyles(event.color).split(' ')[0]}`}></div>
            
            <div className="flex items-start justify-between mb-6 relative">
              <div className={`p-4 rounded-2xl transition-transform group-hover:rotate-12 ${getColorStyles(event.color)}`}>
                <event.icon className="h-6 w-6" />
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border tracking-widest ${getStatusStyles(event.status)}`}>
                {event.status}
              </span>
            </div>
            
            <div className="space-y-3 relative">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{event.category}</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {event.title}
              </h3>

              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <Clock className="h-3.5 w-3.5" /> {event.date}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <MapPin className="h-3.5 w-3.5" /> {event.location}
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Show Details</span>
              <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
            onClick={() => setSelectedEvent(null)}
          ></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-8 duration-300">
            {/* Header / Banner */}
            <div className={`p-10 ${getColorStyles(selectedEvent.color).split(' ')[0]} dark:bg-slate-800/60 bg-opacity-10 relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 w-64 h-64 -mr-20 -mt-20 rounded-full opacity-10 ${getColorStyles(selectedEvent.color).split(' ')[0]}`}></div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-6 right-6 p-2 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 rounded-full shadow-sm transition-all z-10"
              >
                <X className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </button>

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className={`p-6 rounded-3xl shadow-lg ring-4 ring-white dark:ring-slate-900 ${getColorStyles(selectedEvent.color)}`}>
                  <selectedEvent.icon className="h-10 w-10" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">{selectedEvent.category}</p>
                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">{selectedEvent.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border tracking-widest ${getStatusStyles(selectedEvent.status)}`}>
                      {selectedEvent.status}
                    </span>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 font-medium">
                      <Calendar className="h-4 w-4 text-slate-400" /> {selectedEvent.date}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                  <section>
                    <h4 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                      <Info className="h-4 w-4" /> About the Event
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                      {selectedEvent.longDesc}
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Location & Venue
                    </h4>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-lg">{selectedEvent.location}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 italic">Click for maps and directions</p>
                      </div>
                      <button className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <Share2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </button>
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 space-y-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-4 border-slate-200 dark:border-slate-700">Event Info</h4>
                    {selectedEvent.stats.map((stat, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {selectedEvent.status !== 'Past' && (
                    <button className="w-full py-4 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 dark:shadow-none transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]">
                      <Ticket className="h-4 w-4" /> Book Your Spot
                    </button>
                  )}
                  <button className="w-full py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Add to Calendar
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 text-center border-t dark:border-slate-800">
              <p className="text-xs text-slate-400 font-medium italic">
                For team events, travel insurance is provided by the company. Participation is voluntary but encouraged! 🌟
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => { setCreateOpen(false); resetCreateForm(); }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-7 pt-6 pb-4 border-b dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Create Event</h2>
              <button onClick={() => { setCreateOpen(false); resetCreateForm(); }} className="h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-7 space-y-5">
              <div>
                <label className={labelCls}>Event Name</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Spring Hackathon" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(EVENT_TYPE_CONFIG) as NewEventType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewType(t)}
                      className={`p-3 rounded-xl border-2 text-xs font-bold uppercase tracking-widest transition-all ${
                        newType === t ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-slate-100 dark:border-slate-700 text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Date</label>
                  <input type="text" value={newDate} onChange={(e) => setNewDate(e.target.value)} placeholder="e.g. Dec 15, 2024" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Location</label>
                  <input type="text" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="e.g. Office Lounge" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} placeholder="What is this event about?" className={`${inputCls} resize-none`} />
              </div>
            </div>
            <div className="px-7 py-5 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-end gap-3">
              <button onClick={() => { setCreateOpen(false); resetCreateForm(); }} className="px-4 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                disabled={!canCreate}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Create Event
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

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Upcoming Events', value: '12', icon: Calendar, color: 'text-blue-600' },
          { label: 'Attended Last Month', value: '450+', icon: Users, color: 'text-emerald-600' },
          { label: 'Avg Satisfaction', value: '4.8/5', icon: Trophy, color: 'text-amber-500' },
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center gap-6 shadow-sm">
            <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 ${item.color}`}>
              <item.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 bg-slate-100/50 dark:bg-slate-800/50 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-center">
        <div className="h-12 w-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center">
          <Share2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white">Organizing something?</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            If you want to suggest a new club, a workshop, or a social gathering, use the "Internal Initiatives" form in Settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Events;
