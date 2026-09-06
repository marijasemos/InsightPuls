
import React, { useMemo, useState } from 'react';
import {
  Map as MapIcon, Layout, Utensils, CheckCircle2, Info, Navigation, Calendar,
  Plus, Minus, AlertTriangle, Search, Download, Clock,
} from 'lucide-react';
import { useApp } from '../App';
import { UserRole } from '../types';

/* --------------------------------- Shared --------------------------------- */

const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

const inputCls = 'w-full rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:ring-0 text-sm p-3 text-slate-900 dark:text-white transition-colors';

const ConfirmModal: React.FC<{ title: string; message: string; confirmLabel: string; confirmTone?: 'blue' | 'rose'; onCancel: () => void; onConfirm: () => void }> = ({
  title, message, confirmLabel, confirmTone = 'blue', onCancel, onConfirm,
}) => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onCancel}>
    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] border dark:border-slate-800 shadow-2xl p-7 animate-in zoom-in-95 duration-200">
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-5 ${confirmTone === 'rose' ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
        <AlertTriangle className={`h-6 w-6 ${confirmTone === 'rose' ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}`} />
      </div>
      <h3 className="text-lg font-black text-slate-900 dark:text-white">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{message}</p>
      <div className="flex items-center gap-3 mt-6">
        <button onClick={onCancel} className="flex-1 px-4 py-2.5 border dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          Keep as is
        </button>
        <button
          onClick={onConfirm}
          className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all ${confirmTone === 'rose' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

/* ------------------------------- Desk Booking ------------------------------ */

type DeskStatus = 'available' | 'reserved-by-me' | 'reserved-by-other';

interface Desk {
  id: number;
  status: DeskStatus;
  reservedByName?: string;
}

const OTHER_RESERVERS = ['Sarah J.', 'Michael C.', 'Emma D.', 'Alex R.', 'Robert F.'];

const generateInitialDesks = (): Desk[] =>
  Array.from({ length: 24 }, (_, i) => {
    if (Math.random() < 0.35) {
      return { id: i + 1, status: 'reserved-by-other' as const, reservedByName: OTHER_RESERVERS[Math.floor(Math.random() * OTHER_RESERVERS.length)] };
    }
    return { id: i + 1, status: 'available' as const };
  });

const todayLabel = () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

/* --------------------------------- Food ------------------------------------ */

interface MenuItem { id: string; name: string; desc: string; price: string; img: string; }

const MENU_ITEMS: MenuItem[] = [
  { id: 'vegan-bowl', name: 'Vegan Bowl', desc: 'Quinoa, avocado, roasted chickpeas.', price: '€8.50', img: 'https://picsum.photos/seed/food1/300/200' },
  { id: 'burger', name: 'Classic Burger', desc: 'Angus beef, cheddar, brioche bun.', price: '€9.50', img: 'https://picsum.photos/seed/food2/300/200' },
  { id: 'salmon', name: 'Salmon Salad', desc: 'Fresh salmon, baby spinach, nuts.', price: '€11.00', img: 'https://picsum.photos/seed/food3/300/200' },
  { id: 'wrap', name: 'Veggie Wrap', desc: 'Grilled vegetables, hummus, whole wheat wrap.', price: '€7.50', img: 'https://picsum.photos/seed/food4/300/200' },
  { id: 'soup', name: 'Soup of the Day', desc: "Chef's daily seasonal soup, served warm.", price: '€5.50', img: 'https://picsum.photos/seed/food5/300/200' },
];

interface FoodOrder {
  id: string;
  employeeId: string;
  employeeName: string;
  avatar: string;
  itemName: string;
  qty: number;
  notes?: string;
  orderedAt: string;
}

const SEED_ORDERS: FoodOrder[] = [
  { id: 'o1', employeeId: 'e-sarah', employeeName: 'Sarah Jenkins', avatar: 'https://picsum.photos/seed/sarah/100/100', itemName: 'Salmon Salad', qty: 1, orderedAt: '9:02 AM' },
  { id: 'o2', employeeId: 'e-michael', employeeName: 'Michael Chen', avatar: 'https://picsum.photos/seed/michael/100/100', itemName: 'Classic Burger', qty: 1, notes: 'No onions', orderedAt: '9:10 AM' },
  { id: 'o3', employeeId: 'e-emma', employeeName: 'Emma Davis', avatar: 'https://picsum.photos/seed/emma/100/100', itemName: 'Vegan Bowl', qty: 1, orderedAt: '9:14 AM' },
  { id: 'o4', employeeId: 'e-alex', employeeName: 'Alex Rivera', avatar: 'https://picsum.photos/seed/alex/100/100', itemName: 'Veggie Wrap', qty: 2, orderedAt: '9:20 AM' },
  { id: 'o5', employeeId: 'e-robert', employeeName: 'Robert Fox', avatar: 'https://picsum.photos/seed/robert/100/100', itemName: 'Soup of the Day', qty: 1, orderedAt: '9:25 AM' },
  { id: 'o6', employeeId: 'e-jenny', employeeName: 'Jenny Wilson', avatar: 'https://picsum.photos/seed/jenny/100/100', itemName: 'Vegan Bowl', qty: 1, notes: 'Extra avocado', orderedAt: '9:31 AM' },
  { id: 'o7', employeeId: 'e-devon', employeeName: 'Devon Lane', avatar: 'https://picsum.photos/seed/devon/100/100', itemName: 'Classic Burger', qty: 1, orderedAt: '9:40 AM' },
  { id: 'o8', employeeId: 'e-sofia', employeeName: 'Sofia Martinez', avatar: 'https://picsum.photos/seed/sofia/100/100', itemName: 'Salmon Salad', qty: 1, orderedAt: '9:45 AM' },
];

const CANCEL_CUTOFF_HOUR = 10;

const csvEscape = (val: string) => `"${(val ?? '').replace(/"/g, '""')}"`;

/* --------------------------------------------------------------------------- */

const OfficeSpace: React.FC = () => {
  const { role, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'DESKS' | 'FOOD'>('DESKS');
  const [toast, setToast] = useState<string | null>(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  /* --------------------------------- Desks --------------------------------- */

  const [desks, setDesks] = useState<Desk[]>(() => generateInitialDesks());
  const [reservedByMe, setReservedByMe] = useState<number | null>(null);
  const [moveTarget, setMoveTarget] = useState<number | null>(null);
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);

  const reserveDesk = (id: number) => {
    setDesks((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'reserved-by-me', reservedByName: undefined } : d)));
    setReservedByMe(id);
    setToast('Desk reserved for today.');
  };

  const handleDeskClick = (desk: Desk) => {
    if (desk.status === 'reserved-by-other') return;
    if (desk.status === 'reserved-by-me') {
      setCancelTarget(desk.id);
      return;
    }
    if (reservedByMe === null) {
      reserveDesk(desk.id);
    } else if (reservedByMe !== desk.id) {
      setMoveTarget(desk.id);
    }
  };

  const confirmMove = () => {
    if (moveTarget === null) return;
    const oldId = reservedByMe;
    const newId = moveTarget;
    setDesks((prev) => prev.map((d) => {
      if (d.id === oldId) return { ...d, status: 'available', reservedByName: undefined };
      if (d.id === newId) return { ...d, status: 'reserved-by-me', reservedByName: undefined };
      return d;
    }));
    setReservedByMe(newId);
    setMoveTarget(null);
    setToast(`Reservation moved to Desk ${newId}.`);
  };

  const confirmCancel = () => {
    if (cancelTarget === null) return;
    setDesks((prev) => prev.map((d) => (d.id === cancelTarget ? { ...d, status: 'available', reservedByName: undefined } : d)));
    setReservedByMe(null);
    setCancelTarget(null);
    setToast('Reservation cancelled.');
  };

  /* ---------------------------------- Food ---------------------------------- */

  const [orders, setOrders] = useState<FoodOrder[]>(SEED_ORDERS);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [orderQty, setOrderQty] = useState(1);
  const [orderNotes, setOrderNotes] = useState('');

  const [hrSearch, setHrSearch] = useState('');
  const [hrItemFilter, setHrItemFilter] = useState('All');

  const myOrder = useMemo(() => orders.find((o) => o.employeeId === currentUser.id) ?? null, [orders, currentUser.id]);
  const canCancelOrder = new Date().getHours() < CANCEL_CUTOFF_HOUR;

  const handleExpandItem = (item: MenuItem) => {
    if (myOrder) {
      setToast('You already have an active order today. Cancel it to choose something else.');
      return;
    }
    setExpandedItemId(item.id);
    setOrderQty(1);
    setOrderNotes('');
  };

  const handlePlaceOrder = (item: MenuItem) => {
    if (myOrder) return;
    const newOrder: FoodOrder = {
      id: `order-${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      avatar: currentUser.avatar,
      itemName: item.name,
      qty: orderQty,
      notes: orderNotes.trim() || undefined,
      orderedAt: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
    setOrders((prev) => [newOrder, ...prev]);
    setExpandedItemId(null);
    setToast('Order placed for today.');
  };

  const handleCancelOrder = () => {
    if (!myOrder || !canCancelOrder) return;
    setOrders((prev) => prev.filter((o) => o.id !== myOrder.id));
    setToast('Order cancelled.');
  };

  const itemCounts = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => map.set(o.itemName, (map.get(o.itemName) || 0) + o.qty));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [orders]);

  const filteredOrders = useMemo(
    () => orders.filter((o) =>
      (hrItemFilter === 'All' || o.itemName === hrItemFilter) &&
      o.employeeName.toLowerCase().includes(hrSearch.toLowerCase())
    ),
    [orders, hrSearch, hrItemFilter]
  );

  const handleExportOrders = () => {
    const headers = ['Employee', 'Item', 'Quantity', 'Notes', 'Ordered At'];
    const rows = filteredOrders.map((o) => [o.employeeName, o.itemName, String(o.qty), o.notes ?? '', o.orderedAt]);
    const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'food-orders-today.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const cancelTargetDesk = desks.find((d) => d.id === cancelTarget);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Workspace & Services</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Reserve your desk and order your daily fuel.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('DESKS')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'DESKS' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600' : 'text-slate-400'}`}
          >
            Desk Booking
          </button>
          <button
            onClick={() => setActiveTab('FOOD')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'FOOD' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600' : 'text-slate-400'}`}
          >
            Food Order
          </button>
        </div>
      </div>

      {activeTab === 'DESKS' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[3rem] border dark:border-slate-800 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
              <h3 className="text-xl font-black dark:text-white flex items-center gap-3">
                <Layout className="h-6 w-6 text-blue-600" />
                Floor Plan: 4th Floor
              </h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reserved by You</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reserved by Others</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-6 p-8 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border-2 border-dashed dark:border-slate-800">
              {desks.map((desk) => (
                <button
                  key={desk.id}
                  onClick={() => handleDeskClick(desk)}
                  title={desk.status === 'reserved-by-other' ? `Reserved by ${desk.reservedByName}` : undefined}
                  className={`h-16 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                    desk.status === 'reserved-by-me' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' :
                    desk.status === 'reserved-by-other' ? 'bg-slate-200 dark:bg-slate-700 border-transparent text-slate-500 dark:text-slate-400 cursor-help' :
                    'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:text-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase">{desk.id}</span>
                  {desk.status === 'reserved-by-me' && <span className="text-[8px] font-bold mt-1 opacity-90">{initials(currentUser.name)}</span>}
                  {desk.status === 'reserved-by-other' && <span className="text-[8px] font-bold mt-1 opacity-70">{desk.reservedByName}</span>}
                </button>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm border-t-8 border-t-blue-600">
              <h4 className="text-lg font-black dark:text-white mb-6">Reservation Details</h4>
              {reservedByMe !== null ? (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl">
                      {reservedByMe}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-blue-600 tracking-widest">Your Reservation</p>
                      <p className="text-sm font-black dark:text-white">Desk {reservedByMe}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-500">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs font-bold">{todayLabel()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <Navigation className="h-4 w-4" />
                      <span className="text-xs font-bold">Window Side • Near Creative Team</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setCancelTarget(reservedByMe)}
                    className="w-full py-4 border-2 border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                  >
                    Cancel Reservation
                  </button>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="h-16 w-16 mx-auto bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
                    <MapIcon className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select an available desk to reserve it instantly</p>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-800/30 rounded-[2.5rem] flex items-start gap-4 border-2 border-dashed dark:border-slate-800">
               <Info className="h-5 w-5 text-slate-400 shrink-0" />
               <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                 Your desk reservation will be synced with your <span className="text-blue-600 font-bold">Microsoft Teams</span> status automatically.
               </p>
            </div>
          </aside>
        </div>
      ) : (
        <div className="space-y-10">
          {myOrder && (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">My Order Today</p>
                  <p className="text-lg font-black dark:text-white">{myOrder.qty}x {myOrder.itemName}</p>
                  {myOrder.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 italic">"{myOrder.notes}"</p>}
                  <span className="inline-block mt-2 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase rounded-full">Ordered</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <button
                  onClick={handleCancelOrder}
                  disabled={!canCancelOrder}
                  className="px-5 py-2.5 border-2 border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  Cancel Order
                </button>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                  Cancel available until {CANCEL_CUTOFF_HOUR}:00 AM
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-8">
            {MENU_ITEMS.map((item) => {
              const isExpanded = expandedItemId === item.id;
              return (
                <div key={item.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm overflow-hidden group hover:shadow-xl transition-all">
                  <img src={item.img} className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-black dark:text-white">{item.name}</h4>
                      <span className="text-lg font-black text-blue-600">{item.price}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8">{item.desc}</p>

                    {isExpanded ? (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quantity</span>
                          <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setOrderQty((q) => Math.max(1, q - 1))} className="h-7 w-7 rounded-lg bg-white dark:bg-slate-900 border dark:border-slate-700 flex items-center justify-center hover:border-blue-400">
                              <Minus className="h-3.5 w-3.5 dark:text-slate-300" />
                            </button>
                            <span className="text-sm font-black w-4 text-center dark:text-white">{orderQty}</span>
                            <button type="button" onClick={() => setOrderQty((q) => Math.min(9, q + 1))} className="h-7 w-7 rounded-lg bg-white dark:bg-slate-900 border dark:border-slate-700 flex items-center justify-center hover:border-blue-400">
                              <Plus className="h-3.5 w-3.5 dark:text-slate-300" />
                            </button>
                          </div>
                        </div>
                        <textarea
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          placeholder="Notes (allergies, preferences)..."
                          className={`${inputCls} h-16 resize-none text-xs`}
                        />
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setExpandedItemId(null)} className="px-4 py-3 text-xs font-black uppercase text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePlaceOrder(item)}
                            className="flex-1 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                          >
                            Place Order
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleExpandItem(item)}
                        className="w-full py-4 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all"
                      >
                        Add to Order
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {role === UserRole.HR && (
            <section className="bg-white dark:bg-slate-900 rounded-[3rem] border dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-8 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-black dark:text-white flex items-center gap-3">
                      <Utensils className="h-5 w-5 text-blue-600" /> Today's Food Orders
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                      {orders.length} order{orders.length !== 1 ? 's' : ''} today{itemCounts.length > 0 ? ` · ${itemCounts.map(([name, qty]) => `${qty}x ${name}`).join(' · ')}` : ''}
                    </p>
                  </div>
                  <button onClick={handleExportOrders} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <Download className="h-3.5 w-3.5" /> Export to CSV
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={hrSearch}
                      onChange={(e) => setHrSearch(e.target.value)}
                      placeholder="Search by employee name..."
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                    />
                  </div>
                  <select
                    value={hrItemFilter}
                    onChange={(e) => setHrItemFilter(e.target.value)}
                    className="appearance-none bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl py-2.5 pl-4 pr-9 text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
                  >
                    <option value="All">All Items</option>
                    {MENU_ITEMS.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-sm font-bold text-slate-400">No orders match this search.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[10px] font-bold uppercase">
                      <tr>
                        <th className="px-8 py-4">Employee</th>
                        <th className="px-8 py-4">Item</th>
                        <th className="px-8 py-4 text-center">Qty</th>
                        <th className="px-8 py-4">Notes</th>
                        <th className="px-8 py-4 text-right">Ordered At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-800">
                      {filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <img src={o.avatar} className="h-8 w-8 rounded-full object-cover" alt="" />
                              <span className="font-semibold text-slate-800 dark:text-white">{o.employeeName}</span>
                            </div>
                          </td>
                          <td className="px-8 py-4 text-slate-600 dark:text-slate-300">{o.itemName}</td>
                          <td className="px-8 py-4 text-center font-bold text-slate-800 dark:text-slate-200">{o.qty}</td>
                          <td className="px-8 py-4 text-slate-500 dark:text-slate-400 text-xs italic">{o.notes || '—'}</td>
                          <td className="px-8 py-4 text-right text-slate-500 dark:text-slate-400 text-xs">
                            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {o.orderedAt}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {moveTarget !== null && (
        <ConfirmModal
          title="Move your reservation?"
          message={`You currently have Desk ${reservedByMe} reserved. Move your reservation to Desk ${moveTarget} instead?`}
          confirmLabel="Move Reservation"
          confirmTone="blue"
          onCancel={() => setMoveTarget(null)}
          onConfirm={confirmMove}
        />
      )}

      {cancelTarget !== null && (
        <ConfirmModal
          title="Cancel Reservation"
          message={`Cancel your reservation for Desk ${cancelTargetDesk?.id ?? cancelTarget}? This will make it available for others.`}
          confirmLabel="Cancel Reservation"
          confirmTone="rose"
          onCancel={() => setCancelTarget(null)}
          onConfirm={confirmCancel}
        />
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

export default OfficeSpace;
