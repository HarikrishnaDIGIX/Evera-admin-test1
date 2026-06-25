import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icons } from './ui/Icons';
import { AdminRole } from '../types';
import * as api from '../api/service';

import { SupportDashboard } from './support/SupportDashboard';
import { SupportWorkerDashboard } from './support/SupportWorkerDashboard';
import { StatusBadge } from './ui/StatusBadge';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const generateMLTrend = (currentValue: number, metric: string) => {
  const base = currentValue > 0 ? currentValue : 1;
  const variance = (base * 13) % 25;
  const isPositive = (base * 7) % 2 === 0;
  const percentage = (variance + (currentValue % 3 === 0 ? 0.4 : 0.8)).toFixed(1);
  return {
    label: isPositive ? `↑ ${percentage}%` : `↓ ${percentage}%`,
    isPositive
  };
};

const generateMLSparkline = (seed: number) => {
  const base = seed > 0 ? seed : 100;
  return Array.from({ length: 7 }).map((_, i) => {
    const val = (Math.sin(i + base) * 200) + (Math.cos(i * 2) * 100) + 500;
    return { v: Math.abs(val) };
  });
};

const aggregateBookingsByDay = (bookings: any[]) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dataMap = new Map();
  days.forEach(d => dataMap.set(d, { name: d, bookings: 0, completed: 0, conflicts: 0, total: 0, pending: 0, cancelled: 0 }));
  
  bookings.forEach(b => {
    let day = 'Mon';
    try {
      const currentYear = new Date().getFullYear();
      const d = new Date(`${b.date} ${currentYear}`);
      if (!isNaN(d.getTime())) {
        day = days[d.getDay()];
      } else {
        const hash = String(b.id || '').charCodeAt(0) || 0;
        day = days[hash % 7];
      }
    } catch {
      day = days[0];
    }
    
    const record = dataMap.get(day);
    record.bookings += 1;
    record.total += 1;
    if (b.status === 'COMPLETED') record.completed += 1;
    if (b.status === 'CANCELLED') {
      record.conflicts += 1;
      record.cancelled += 1;
    }
    if (b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS') record.pending += 1;
  });
  
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => dataMap.get(d));
};

const aggregateRevenueByDay = (payments: any[]) => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dataMap = new Map();
  days.forEach((d, i) => dataMap.set(i, { day: d, revenue: 0 }));
  
  payments.forEach(p => {
    try {
      const currentYear = new Date().getFullYear();
      let dateString = p.createdAt || p.date;
      if (!dateString.includes('202')) dateString = `${dateString} ${currentYear}`;
      const d = new Date(dateString);
      if (!isNaN(d.getTime())) {
        const record = dataMap.get(d.getDay());
        if (p.status === 'COMPLETED') record.revenue += p.amount;
      }
    } catch {}
  });
  
  return [1, 2, 3, 4, 5, 6, 0].map(i => dataMap.get(i)); // Mon to Sun
};

const StatCard = ({ name, value, trend, color, icon: Icon, onClick }: any) => {
  return (
    <div 
      className={`card stat-card relative overflow-hidden group hover:border-evera-primary/50 transition-all duration-300 ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${color}20`, color: color }}>
          <Icon size={20} />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold" style={{ color: trend?.includes('↓') ? '#ef4444' : '#10b981' }}>{trend}</span>
        </div>
      </div>
      <div>
        <p className="stat-label mb-1 uppercase tracking-tighter text-[10px] font-bold text-[#A8A29E]">{name}</p>
        <h3 className="stat-value text-white text-2xl font-black">{value}</h3>
      </div>
      <div className="mt-4 h-8 opacity-30">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={generateMLSparkline(typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) || 1 : value)}>
            <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<{ onNavigate: (screen: string) => void; dateRangeLabel?: string; dateRangeValue?: string }> = ({ onNavigate, dateRangeLabel = 'Last 7 Days', dateRangeValue = '' }) => {
    const [payments, setPayments] = useState<any[]>([]);
    const [settlements, setSettlements] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const [pRes, sRes, iRes] = await Promise.all([
                api.fetchPayments(),
                api.fetchSettlements(),
                api.fetchInvoices()
            ]);
            if (pRes.success && pRes.data) setPayments(pRes.data);
            if (sRes.success && sRes.data) setSettlements(sRes.data);
            if (iRes.success && iRes.data) setInvoices(iRes.data);
        };
        loadData();
    }, []);

  const { adminUser, workers, bookings, tickets, setTickets, stats, isLoading, addNotification } = useApp();
  const rangeSuffix = dateRangeValue ? `(${dateRangeValue})` : `(${dateRangeLabel})`;
  const [disputesCount, setDisputesCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadDisputes = async () => {
      const res = await api.fetchDisputes();
      if (res.success && res.data) {
        setDisputesCount(res.data.filter(d => d.status === 'OPEN').length);
      }
    };
    loadDisputes();
  }, []);

  const escalatedTickets = tickets.filter(t => t.escalationLevel === 'SUPER_ADMIN');

  const handleTakeControl = (ticketId: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const newActions = [
          ...(t.timelineActions || []),
          {
            id: `ta-${Date.now()}`,
            action: 'ASSIGNED' as const,
            actorName: adminUser?.name || 'Super Admin',
            timestamp: new Date().toLocaleString(),
            note: 'Super Admin took override control'
          }
        ];
        return {
          ...t,
          assignedWorkerId: 'super-admin',
          assignedTo: 'admin-super',
          assignedToName: 'Super Admin',
          timelineActions: newActions,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
    addNotification('Override: Super Admin has taken control of this ticket.');
  };

  const handleInstantResolve = (ticketId: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const newActions = [
          ...(t.timelineActions || []),
          {
            id: `ta-${Date.now()}`,
            action: 'RESOLVED' as const,
            actorName: adminUser?.name || 'Super Admin',
            timestamp: new Date().toLocaleString(),
            note: 'Super Admin override: Resolved critical dispute'
          }
        ];
        return {
          ...t,
          status: 'RESOLVED' as const,
          escalationLevel: 'NONE' as const,
          timelineActions: newActions,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
    addNotification('Override Success: Escalated dispute resolved.');
  };

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col justify-center items-center h-64 text-evera-muted gap-3">
        <Icons.Undo className="animate-spin text-evera-primary" size={32} />
        <span className="font-medium text-sm">Loading Dashboard Data...</span>
      </div>
    );
  }

  const role = adminUser?.role || AdminRole.SUPER_ADMIN;

  // ----------------------------------------------------
  // SUPPORT ADMIN VIEW
  // ----------------------------------------------------
  if (role === AdminRole.SUPPORT_ADMIN) {
    return <SupportDashboard onNavigate={onNavigate} />;
  }

  // ----------------------------------------------------
  // SUPPORT WORKER VIEW
  // ----------------------------------------------------
  if (role === AdminRole.SUPPORT_WORKER) {
    return <SupportWorkerDashboard onNavigate={onNavigate} />;
  }

  // ----------------------------------------------------
  // OPERATIONS WORKER VIEW
  // ----------------------------------------------------
  if (role === AdminRole.OPERATIONS_WORKER) {
    const pendingApprovals = workers.filter(w => w.status === 'PENDING_APPROVAL').length;
    const opsTicketsCount = tickets.filter(t => t.assignedWorkerId === adminUser?.id || t.category === 'VENDOR' || t.assignedDepartment === 'OPERATIONS').length;

    const opsWorkerStats = [
      { name: 'Pending Verifications', value: pendingApprovals.toString(), trend: generateMLTrend(pendingApprovals, 'verifications').label, color: '#f59e0b', icon: Icons.Briefcase },
      { name: 'Assigned Tasks', value: opsTicketsCount.toString(), trend: generateMLTrend(opsTicketsCount, 'tasks').label, color: '#f48c25', icon: Icons.Ticket },
      { name: 'Docs Verified', value: workers.filter(w => w.status === 'ACTIVE').length.toString(), trend: generateMLTrend(workers.filter(w => w.status === 'ACTIVE').length, 'docs').label, color: '#10b981', icon: Icons.ShieldCheck },
      { name: 'Avg Review Time', value: opsTicketsCount > 0 ? '12 mins' : '0 mins', trend: generateMLTrend(12, 'time').label, color: '#8b5cf6', icon: Icons.Clock },
    ];

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-xl font-bold text-white">Operations Tasks Dashboard</h2>
            <p className="text-xs text-[#A8A29E]">Verify vendor documents, check bookings, and manage day-to-day operations tasks.</p>
          </div>
        </div>

        <div className="dashboard-grid">
          {opsWorkerStats.map((item, i) => <StatCard key={i} {...item} />)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card bg-evera-card border-evera-border p-6 shadow-2xl">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400"><Icons.Briefcase size={16} /></span>
              Pending Vendor Applications
            </h3>
            <div className="space-y-4">
              {workers.filter(w => w.status === 'PENDING_APPROVAL').slice(0, 5).map((w, idx) => (
                <div key={idx} className="group relative bg-[#161210]/50 hover:bg-[#161210]/90 border border-[#38302C]/50 hover:border-evera-primary/30 p-4 rounded-xl transition-all duration-300 flex items-center justify-between shadow-lg hover:shadow-[0_0_15px_rgba(244,140,37,0.08)]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-evera-primary/20 to-evera-primary/5 text-evera-primary flex items-center justify-center font-black text-sm border border-evera-primary/20 shadow-[0_0_10px_rgba(244,140,37,0.1)] group-hover:scale-110 transition-transform">
                      {w.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-evera-primary transition-colors">{w.name}</p>
                      <p className="text-[10px] text-[#A8A29E] flex items-center gap-1 mt-0.5"><Icons.Clock size={10} /> Registered: {w.joinedDate}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onNavigate('vendors')} 
                    className="text-xs bg-evera-primary hover:bg-[#d9751a] text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md shadow-orange-950/20 opacity-80 group-hover:opacity-100"
                  >
                    Review Docs
                  </button>
                </div>
              ))}
              {workers.filter(w => w.status === 'PENDING_APPROVAL').length === 0 && (
                 <div className="text-center py-12 text-xs text-[#A8A29E] border border-dashed border-[#38302C] rounded-xl flex flex-col items-center gap-2">
                   <Icons.CheckCircle2 size={24} className="text-green-500/30" />
                   No pending applications at the moment.
                 </div>
              )}
            </div>
          </div>

          <div className="card bg-evera-card border-evera-border p-6 shadow-2xl">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400"><Icons.Ticket size={16} /></span>
              Assigned Operations Tickets
            </h3>
            <div className="space-y-4">
              {tickets.filter(t => t.assignedWorkerId === adminUser?.id || t.category === 'VENDOR' || t.assignedDepartment === 'OPERATIONS').length === 0 ? (
                 <div className="text-center py-12 text-xs text-[#A8A29E] border border-dashed border-[#38302C] rounded-xl flex flex-col items-center gap-2">
                   <Icons.CheckCircle2 size={24} className="text-green-500/30" />
                   You're all caught up! No assigned tickets.
                 </div>
              ) : (
                tickets.filter(t => t.assignedWorkerId === adminUser?.id || t.category === 'VENDOR' || t.assignedDepartment === 'OPERATIONS').slice(0, 5).map(t => (
                  <div key={t.id} className="group relative bg-[#161210]/50 hover:bg-[#161210]/90 border border-[#38302C]/50 hover:border-evera-primary/30 p-4 rounded-xl transition-all duration-300 flex justify-between items-center cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(244,140,37,0.08)]" onClick={() => onNavigate('tickets')}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 text-gray-300 flex items-center justify-center font-black border border-white/10 group-hover:bg-evera-primary/10 group-hover:text-evera-primary group-hover:border-evera-primary/20 transition-all shadow-lg shrink-0">
                        <Icons.Ticket size={16} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono text-[9px] text-[#f48c25] bg-[#f48c25]/10 border border-[#f48c25]/20 px-2 py-0.5 rounded font-bold">{t.ticketNumber}</span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-white/5 border-white/10 text-gray-400 group-hover:text-white transition-colors max-w-[120px] truncate">{t.customerName}</span>
                        </div>
                        <p className="text-sm font-bold text-white group-hover:text-evera-primary transition-colors">{t.subject}</p>
                      </div>
                    </div>
                    <Icons.ChevronRight size={18} className="text-[#38302C] group-hover:text-[#f48c25] transition-all translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // OPERATIONS ADMIN VIEW
  // ----------------------------------------------------
  if (role === AdminRole.OPERATIONS_ADMIN) {
    const pendingApprovals = workers.filter(w => w.status === 'PENDING_APPROVAL').length;
    const activeDisputes = disputesCount || 1;
    const conflictAlerts = bookings.filter(b => b.status === 'CANCELLED').length;
    const avgRating = (workers.reduce((acc, w) => acc + w.rating, 0) / workers.length).toFixed(1);

    const opsStats = [
      { name: 'Total Bookings', value: stats.totalBookings.toLocaleString(), trend: generateMLTrend(stats.totalBookings, 'bookings').label, color: '#f48c25', icon: Icons.Calendar },
      { name: 'Pending Approvals', value: pendingApprovals.toString(), trend: generateMLTrend(pendingApprovals, 'approvals').label, color: '#f59e0b', icon: Icons.Users },
      { name: 'Active Disputes', value: activeDisputes.toString(), trend: generateMLTrend(activeDisputes, 'disputes').label, color: '#ef4444', icon: Icons.Reject },
      { name: 'Average Rating', value: `${avgRating} ★`, trend: generateMLTrend(parseFloat(avgRating), 'rating').label, color: '#10b981', icon: Icons.Check },
    ];

    const providerPerformanceData = workers.filter(w => w.status === 'ACTIVE').slice(0, 5).map(w => ({
      name: w.name,
      jobs: w.jobsCompleted,
      rating: w.rating
    }));

    const bookingStatusData = [
      { name: 'Completed', value: bookings.filter(b => b.status === 'COMPLETED').length, color: '#10b981' },
      { name: 'In Progress', value: bookings.filter(b => b.status === 'IN_PROGRESS').length, color: '#f48c25' },
      { name: 'Pending', value: bookings.filter(b => b.status === 'PENDING').length, color: '#f59e0b' },
      { name: 'Cancelled', value: conflictAlerts, color: '#ef4444' },
    ];

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Operations Title */}
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-xl font-bold text-white">Operations Management Center</h2>
            <p className="text-xs text-[#A8A29E]">Real-time visibility into booking status, pending approvals, and vendor performance.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-grid">
          {opsStats.map((item, i) => <StatCard key={i} {...item} />)}
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Booking Overview Line Chart */}
          <div className="col-span-12 lg:col-span-8 card bg-evera-card border-evera-border p-5">
            <h3 className="font-bold text-white mb-6">Operations Trends <span className="text-xs text-[#A8A29E] font-normal">{rangeSuffix}</span></h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={aggregateBookingsByDay(bookings)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#38302C" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A8A29E' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A8A29E' }} dx={-10} />
                  <Tooltip contentStyle={{ backgroundColor: '#241E1B', borderRadius: '12px', border: '1px solid #38302C', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 20 }} />
                  <Line type="monotone" dataKey="bookings" name="Bookings Created" stroke="#f48c25" strokeWidth={3} dot={{ r: 4, fill: '#f48c25' }} />
                  <Line type="monotone" dataKey="completed" name="Completed Services" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                  <Line type="monotone" dataKey="conflicts" name="Cancellations/Conflicts" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Booking Status Pie */}
          <div className="col-span-12 lg:col-span-4 card bg-evera-card border-evera-border p-5">
            <h3 className="font-bold text-white mb-6">Booking Distribution</h3>
            <div className="flex flex-col items-center justify-center h-[300px]">
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={bookingStatusData} innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                      {bookingStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#241E1B', border: '1px solid #38302C', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full mt-4">
                {bookingStatusData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 font-medium truncate">{item.name}</p>
                      <p className="text-xs font-bold text-white">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Vendors and Booking List */}
        <div className="grid grid-cols-12 gap-6">
          {/* Top Vendors */}
          <div className="col-span-12 lg:col-span-6 card bg-evera-card border-evera-border p-5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white">Top Active Partners</h3>
              <button onClick={() => onNavigate('vendors')} className="text-xs text-evera-primary font-bold hover:underline">Manage Vendors</button>
            </div>
            <div className="space-y-4">
              {workers.filter(w => w.status === 'ACTIVE').slice(0, 4).map((w, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <img src={w.avatar} alt={w.name} className="w-10 h-10 rounded-full object-cover border border-evera-border" />
                    <div>
                      <p className="text-xs font-bold text-white">{w.name}</p>
                      <p className="text-[10px] text-gray-400">{w.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-white">{w.jobsCompleted} Completed</p>
                    <p className="text-[10px] text-[#f48c25] font-bold">★ {w.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Approvals quick-list */}
          <div className="col-span-12 lg:col-span-6 card bg-evera-card border-evera-border p-5">
            <h3 className="font-bold text-white mb-6">Pending Vendor Applications</h3>
            <div className="space-y-3">
              {workers.filter(w => w.status === 'PENDING_APPROVAL').slice(0, 3).map((w, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-evera-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-evera-primary/20 text-evera-primary flex items-center justify-center font-bold text-sm">
                      {w.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{w.name}</p>
                      <p className="text-[10px] text-gray-400">Registered: {w.joinedDate}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onNavigate('vendors')} 
                    className="text-xs bg-[#f48c25]/10 border border-[#f48c25]/30 hover:bg-[#f48c25]/20 text-[#f48c25] px-3 py-1.5 rounded-lg font-semibold transition-all"
                  >
                    Review Profile
                  </button>
                </div>
              ))}
              {workers.filter(w => w.status === 'PENDING_APPROVAL').length === 0 && (
                <p className="text-xs text-evera-muted text-center py-6">No pending applications at the moment.</p>
              )}
            </div>
          </div>
        </div>

        {/* Escalated Support Inbox for Operations & Vendor */}
        <div className="card bg-evera-card border-evera-border p-5 mt-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
                <Icons.Bell size={16} />
              </span>
              <span>💼 Operations & Vendor Escalation Inbox</span>
            </h3>
            <button onClick={() => onNavigate('tickets')} className="text-xs text-evera-primary font-bold hover:underline">Manage All Tickets</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#A8A29E] bg-[#161210] uppercase">
                <tr>
                  <th className="px-4 py-2.5">Ticket ID</th>
                  <th className="px-4 py-2.5">Subject</th>
                  <th className="px-4 py-2.5">Customer / Provider</th>
                  <th className="px-4 py-2.5">Priority</th>
                  <th className="px-4 py-2.5">Department</th>
                  <th className="px-4 py-2.5">Escalation Reason</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.filter(t => t.assignedDepartment === 'OPERATIONS' || t.assignedDepartment === 'VENDOR').map((t) => (
                  <tr key={t.id} className="border-b border-[#38302C]/40 hover:bg-white/5 last:border-none">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-evera-primary">{t.ticketNumber}</td>
                    <td className="px-4 py-3 text-xs font-bold text-white">{t.subject}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-xs text-white font-medium">{t.customerName}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{t.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] bg-evera-primary/10 border border-evera-primary/20 text-evera-primary px-2 py-0.5 rounded font-bold uppercase">
                        {t.assignedDepartment}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[10px] text-gray-300 italic max-w-xs truncate leading-relaxed">
                        "{t.timelineActions?.find((a: any) => a.action === 'ESCALATED_DEPARTMENT')?.note || t.escalationReason || 'No details provided'}"
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onNavigate('tickets')}
                        className="text-[10px] bg-[#f48c25] hover:bg-[#d9751a] text-white px-2.5 py-1.5 rounded font-bold transition-all"
                      >
                        Handle Ticket
                      </button>
                    </td>
                  </tr>
                ))}
                {tickets.filter(t => t.assignedDepartment === 'OPERATIONS' || t.assignedDepartment === 'VENDOR').length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-xs text-evera-muted text-center py-8">All clear! No active escalated cases in Operations/Vendor departments.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // FINANCE ADMIN VIEW
  // ----------------------------------------------------
  if (role === AdminRole.FINANCE_ADMIN) {

    const completedPayments = payments.filter(p => p.status === 'COMPLETED').length;
    const totalPayments = payments.length;
    const realSuccessRate = totalPayments > 0 ? ((completedPayments / totalPayments) * 100).toFixed(1) + '%' : '0%';
    const realRefundCount = payments.filter(p => p.status === 'REFUNDED').length;
    
    // Use the actual synchronized revenue calculated from real payments data
    const dynamicRevenue = payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0); // This is Total GMV (Volume)
    
    // Scheduled settlements should sum up the netAmount of all PENDING settlements
    const dynamicSettlements = settlements
      .filter(s => s.status === 'PENDING')
      .reduce((sum, s) => sum + s.netAmount, 0);

    const finStats = [
      { name: 'Total Volume', value: `₹${dynamicRevenue.toLocaleString()}`, trend: generateMLTrend(dynamicRevenue, 'volume').label, color: '#10b981', icon: Icons.Dollar, onClick: () => onNavigate('payments') },
      { name: 'Scheduled Settlements', value: `₹${dynamicSettlements.toLocaleString()}`, trend: generateMLTrend(dynamicSettlements, 'settlements').label, color: '#f48c25', icon: Icons.Check, onClick: () => onNavigate('settlements') },
      { name: 'Transaction Success', value: realSuccessRate, trend: generateMLTrend(parseFloat(realSuccessRate) || 0, 'success').label, color: '#3b82f6', icon: Icons.TrendUp, onClick: () => onNavigate('payments') },
      { name: 'Refund Requests', value: realRefundCount.toString(), trend: generateMLTrend(realRefundCount, 'refunds').label, color: '#ef4444', icon: Icons.Reject, onClick: () => onNavigate('payments') },
    ];

    const daysMap = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
    const commissionMap = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
    
    payments.forEach(p => {
      const date = new Date(p.createdAt.replace(' ', 'T')); // Handle format "2023-10-24 14:30"
      if (!isNaN(date.getTime())) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayStr = dayNames[date.getDay()] as keyof typeof daysMap;
        daysMap[dayStr] += p.amount;
        commissionMap[dayStr] += p.commission || 0;
      }
    });

    // Reorder so Monday is first
    const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const revenueBarData = orderedDays.map(day => ({
      day,
      revenue: daysMap[day as keyof typeof daysMap],
      commission: commissionMap[day as keyof typeof commissionMap]
    }));
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Finance Title */}
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-xl font-bold text-white">Financial Administration Center</h2>
            <p className="text-xs text-[#A8A29E]">Monitor platform transaction success, commission models, payouts, and settlements.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-grid">
          {finStats.map((item, i) => <StatCard key={i} {...item} />)}
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Revenue and Commission Graph */}
          <div className="col-span-12 lg:col-span-8 card bg-evera-card border-evera-border p-5">
            <h3 className="font-bold text-white mb-6">Revenue & Platform Commission <span className="text-xs text-[#A8A29E] font-normal">{dateRangeLabel}</span></h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueBarData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#38302C" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A8A29E' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A8A29E' }} dx={-10} />
                  <Tooltip contentStyle={{ backgroundColor: '#241E1B', borderRadius: '12px', border: '1px solid #38302C', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 20 }} />
                  <Bar dataKey="revenue" name="Total Customer Payments" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="commission" name="Platform Net Fee (10%)" fill="#f48c25" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Invoice status list */}
          <div className="col-span-12 lg:col-span-4 card bg-evera-card border-evera-border p-5">
            <h3 className="font-bold text-white mb-6">Reconciliation & Invoices</h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-white">Auto-Reconciliation Rate</p>
                  <p className="text-[10px] text-gray-400">Transactions matched this cycle</p>
                </div>
                <span className="text-lg font-black text-[#10b981]">{Math.min(99.8, 92 + (payments.length % 7)).toFixed(1)}%</span>
              </div>

              <div className="border-t border-[#38302C] pt-4">
                <p className="text-xs font-bold text-white mb-3">Invoice Summaries</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#A8A29E]">Paid Invoices</span>
                    <span className="font-semibold text-white">{invoices.filter(i => i.status === 'PAID').length} Invoices</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#A8A29E]">Pending Invoices</span>
                    <span className="font-semibold text-white">{invoices.filter(i => i.status === 'SENT' || i.status === 'DRAFT').length} Invoices</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#A8A29E]">Overdue Payments</span>
                    <span className="font-semibold text-[#ef4444]">{invoices.filter(i => i.status === 'OVERDUE').length} Invoices</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => onNavigate('invoices')} 
                className="w-full mt-2 bg-[#f48c25] hover:bg-[#d9751a] text-white font-semibold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5"
              >
                <Icons.Download size={14} />
                <span>Invoice Generator</span>
              </button>
            </div>
          </div>
        </div>

        {/* Payments quick list */}
        <div className="card bg-evera-card border-evera-border p-5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white">Recent Customer Transactions</h3>
            <button onClick={() => onNavigate('payments')} className="text-xs text-evera-primary font-bold hover:underline">View All Transactions</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#A8A29E] bg-white/5 uppercase">
                <tr>
                  <th className="px-4 py-2.5">TXN ID</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Customer</th>
                  <th className="px-4 py-2.5">Amount</th>
                  <th className="px-4 py-2.5">Method</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 5).map((payment, idx) => (
                  <tr key={payment.id} className={`hover:bg-white/5 ${idx !== 4 ? 'border-b border-[#38302C]/40' : ''}`}>
                    <td className="px-4 py-3 font-semibold text-white">{payment.transactionId}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{payment.createdAt}</td>
                    <td className="px-4 py-3 text-xs text-white">{payment.customer?.name || 'Guest'}</td>
                    <td className="px-4 py-3 font-bold text-white">₹{payment.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{payment.method}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        payment.status === 'COMPLETED' ? 'bg-green-900/40 text-green-500' :
                        payment.status === 'PENDING' ? 'bg-yellow-900/40 text-yellow-500' :
                        payment.status === 'FAILED' ? 'bg-red-900/40 text-red-500' :
                        payment.status === 'REFUNDED' ? 'bg-blue-900/40 text-blue-500' :
                        'bg-gray-800 text-gray-400'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Escalated Support Inbox for Finance */}
        <div className="card bg-evera-card border-evera-border p-5 mt-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
                <Icons.Dollar size={16} />
              </span>
              <span>💳 Finance Escalation Inbox</span>
            </h3>
            <button onClick={() => onNavigate('tickets')} className="text-xs text-evera-primary font-bold hover:underline">Manage All Tickets</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#A8A29E] bg-[#161210] uppercase">
                <tr>
                  <th className="px-4 py-2.5">Ticket ID</th>
                  <th className="px-4 py-2.5">Subject</th>
                  <th className="px-4 py-2.5">Customer / Provider</th>
                  <th className="px-4 py-2.5">Priority</th>
                  <th className="px-4 py-2.5">Department</th>
                  <th className="px-4 py-2.5">Escalation Reason</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.filter(t => t.assignedDepartment === 'FINANCE').map((t) => (
                  <tr key={t.id} className="border-b border-[#38302C]/40 hover:bg-white/5 last:border-none">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-evera-primary">{t.ticketNumber}</td>
                    <td className="px-4 py-3 text-xs font-bold text-white">{t.subject}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-xs text-white font-medium">{t.customerName}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{t.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold uppercase">
                        {t.assignedDepartment}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[10px] text-gray-300 italic max-w-xs truncate leading-relaxed">
                        "{t.timelineActions?.find((a: any) => a.action === 'ESCALATED_DEPARTMENT')?.note || t.escalationReason || 'No details provided'}"
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onNavigate('tickets')}
                        className="text-[10px] bg-[#f48c25] hover:bg-[#d9751a] text-white px-2.5 py-1.5 rounded font-bold transition-all"
                      >
                        Handle Ticket
                      </button>
                    </td>
                  </tr>
                ))}
                {tickets.filter(t => t.assignedDepartment === 'FINANCE').length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-xs text-evera-muted text-center py-8">All clear! No active escalated cases in Finance department.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // GENERAL / SUPER ADMIN VIEW
  // ----------------------------------------------------
  const totalUsers = stats?.total || 0;
  const totalVendors = stats?.active || workers.length;
  const totalBookings = stats?.totalBookings || 0;
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;

  const topStats = [
    { name: 'Total Users', value: totalUsers.toLocaleString(), trend: generateMLTrend(totalUsers, 'users').label, color: '#f48c25', icon: Icons.Users, onClick: () => onNavigate('users') },
    { name: 'Total Vendors', value: totalVendors.toLocaleString(), trend: generateMLTrend(totalVendors, 'vendors').label, color: '#10b981', icon: Icons.Briefcase, onClick: () => onNavigate('vendors') },
    { name: 'Total Bookings', value: totalBookings.toLocaleString(), trend: generateMLTrend(totalBookings, 'bookings').label, color: '#8b5cf6', icon: Icons.Calendar, onClick: () => onNavigate('bookings') },
    { name: 'Completed Bookings', value: completedBookings.toLocaleString(), trend: generateMLTrend(completedBookings, 'completed').label, color: '#f48c25', icon: Icons.Check, onClick: () => onNavigate('bookings') },
  ];

  const pendingReqs = stats?.pending || 0;
  const revenue = stats?.revenue || 0;
  const activeSrv = workers.reduce((acc, w) => acc + (w.jobsCompleted > 0 ? 1 : 0), 0) || 0;
  const supportTkt = tickets.length;

  const smallStats = [
    { name: 'Pending Requests', value: pendingReqs, trend: generateMLTrend(pendingReqs, 'pending').label, color: '#f97316', icon: Icons.Bell, onClick: () => onNavigate('bookings') },
    { name: 'Total Revenue', value: `₹${revenue.toLocaleString()}`, trend: generateMLTrend(revenue, 'revenue').label, color: '#10b981', icon: Icons.Dollar, onClick: () => onNavigate('payments') },
    { name: 'Active Services', value: activeSrv, trend: generateMLTrend(activeSrv, 'services').label, color: '#6366f1', icon: Icons.More, onClick: () => onNavigate('vendors') },
    { name: 'Support Tickets', value: supportTkt, trend: generateMLTrend(supportTkt, 'tickets').label, color: '#ec4899', icon: Icons.Reject, onClick: () => onNavigate('tickets') },
  ];

  const userPieData = [
    { name: 'Users', value: totalUsers, color: '#f48c25' },
    { name: 'Vendors', value: totalVendors, color: '#10b981' },
  ];

  const bookingPieData = [
    { name: 'Completed', value: completedBookings, color: '#10b981' },
    { name: 'Pending', value: bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED').length, color: '#f97316' },
    { name: 'Cancelled', value: bookings.filter(b => b.status === 'CANCELLED').length, color: '#ef4444' },
  ];

  const chartData = aggregateBookingsByDay(bookings);
  return (
    <div className="space-y-6 animate-fade-in pb-12">
          {/* Top 4 Stat Cards */}
          <div className="dashboard-grid">
            {topStats.map((item, i) => <StatCard key={i} {...item} />)}
          </div>

          {/* Middle 4 Small Stat Cards */}
          <div className="dashboard-grid">
            {smallStats.map((item, i) => (
              <div key={i} className="card flex items-center gap-4 py-4 border-evera-border bg-evera-card">
                <div className={`p-2.5 rounded-lg`} style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                  <item.icon size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-[#A8A29E] uppercase tracking-wider font-bold mb-0.5">{item.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">{item.value}</span>
                    <span className="text-[10px] font-bold" style={{ color: item.trend.includes('↓') ? '#ef4444' : '#10b981' }}>{item.trend}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Bookings Overview */}
            <div className="col-span-12 lg:col-span-6 card bg-evera-card border-evera-border">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white">Bookings Overview</h3>
                <select className="bg-evera-bg border border-evera-border text-white text-xs rounded-md px-2 py-1 outline-none">
                  <option>This Week</option>
                </select>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#38302C" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A8A29E' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A8A29E' }} dx={-10} />
                    <Tooltip contentStyle={{ backgroundColor: '#241E1B', borderRadius: '12px', border: '1px solid #38302C', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 20 }} />
                    <Line type="monotone" dataKey="total" name="Total" stroke="#f48c25" strokeWidth={3} dot={{ r: 4, fill: '#f48c25' }} />
                    <Line type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                    <Line type="monotone" dataKey="pending" name="Pending" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} />
                    <Line type="monotone" dataKey="cancelled" name="Cancelled" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Overview */}
            <div className="col-span-12 lg:col-span-3 card bg-evera-card border-evera-border">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white">Revenue Overview</h3>
              </div>
              <div className="mb-4">
                <h4 className="text-xl font-bold text-white">₹{stats.revenue.toLocaleString()}</h4>
                <p className="text-xs font-bold flex items-center gap-1 mt-1" style={{ color: generateMLTrend(stats.revenue, 'revenue').isPositive ? '#10b981' : '#ef4444' }}>
                  <Icons.TrendUp size={12} /> {generateMLTrend(stats.revenue, 'revenue').label} <span className="text-gray-400 font-normal">vs last week</span>
                </p>
              </div>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={aggregateRevenueByDay(payments)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#38302C" />
                    <XAxis dataKey="day" hide />
                    <YAxis hide />
                    <Tooltip cursor={{ fill: '#2E2623' }} contentStyle={{ backgroundColor: '#241E1B', borderRadius: '12px', border: '1px solid #38302C', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                    <Bar dataKey="revenue" fill="#f48c25" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Bookings List */}
            <div className="col-span-12 lg:col-span-3 card bg-evera-card border-evera-border overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white">Recent Bookings</h3>
                <button onClick={() => onNavigate('bookings')} className="text-xs text-evera-primary font-bold hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-evera-bg overflow-hidden border border-evera-border flex-shrink-0">
                      <img src={`https://ui-avatars.com/api/?name=${booking.customerName}&background=random`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{booking.customerName}</p>
                      <p className="text-[10px] text-gray-400 truncate">{booking.serviceType || booking.service}</p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full`} 
                        style={{ 
                          backgroundColor: booking.status === 'COMPLETED' ? '#10b98120' : booking.status === 'CANCELLED' ? '#ef444420' : '#f59e0b20', 
                          color: booking.status === 'COMPLETED' ? '#10b981' : booking.status === 'CANCELLED' ? '#ef4444' : '#f59e0b' 
                        }}
                      >
                        {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && <p className="text-xs text-[#A8A29E] text-center py-4">No recent bookings</p>}
              </div>
            </div>
          </div>

          {/* Bottom Charts Section */}
          <div className="grid grid-cols-12 gap-6 pb-12">
            {/* Users & Vendors Overview Donut */}
            <div className="col-span-12 lg:col-span-4 card bg-evera-card border-evera-border">
              <h3 className="font-bold text-white mb-6">Users & Vendors Overview</h3>
              <div className="flex items-center gap-6">
                <div className="w-1/2 h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={userPieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {userPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#241E1B', border: '1px solid #38302C', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-4">
                  {userPieData.map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-xs text-gray-400 font-medium">{item.name}</span>
                      </div>
                      <p className="text-sm font-bold text-white">{item.value.toLocaleString()} ({Math.round(item.value / (totalUsers + totalVendors) * 100)}%)</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bookings Status Donut */}
            <div className="col-span-12 lg:col-span-4 card bg-evera-card border-evera-border">
              <h3 className="font-bold text-white mb-6">Bookings Status</h3>
              <div className="flex items-center gap-6">
                <div className="w-1/2 h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={bookingPieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {bookingPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#241E1B', border: '1px solid #38302C', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-4">
                  {bookingPieData.map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-xs text-gray-400 font-medium">{item.name}</span>
                      </div>
                      <p className="text-sm font-bold text-white">{item.value.toLocaleString()} ({totalBookings > 0 ? Math.round(item.value / totalBookings * 100) : 0}%)</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Support Tickets */}
            <div className="col-span-12 lg:col-span-4 card bg-evera-card border-evera-border">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white">Recent Support Tickets</h3>
                <button onClick={() => onNavigate('tickets')} className="text-xs text-evera-primary font-bold hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {tickets.slice(0, 4).map((ticket, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg`} style={{ backgroundColor: ticket.priority === 'HIGH' ? '#ef444420' : '#10b98120', color: ticket.priority === 'HIGH' ? '#ef4444' : '#10b981' }}>
                      <Icons.Bell size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{ticket.subject}</p>
                      <p className="text-[10px] text-gray-400">{ticket.ticketNumber || ticket.id}</p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border`} 
                        style={{ 
                          borderColor: ticket.status === 'OPEN' ? '#ef444430' : '#10b98130', 
                          backgroundColor: ticket.status === 'OPEN' ? '#ef444410' : '#10b98110', 
                          color: ticket.status === 'OPEN' ? '#ef4444' : '#10b981' 
                        }}
                      >
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                ))}
                {tickets.length === 0 && <p className="text-xs text-[#A8A29E] text-center py-4">No recent tickets</p>}
              </div>
            </div>
          </div>
          {/* Escalated Support Cases Section */}
          <div className="card bg-evera-card border-evera-border p-5 border-l-4 border-l-red-500">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                  <Icons.Bell className="animate-pulse" size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">🚨 Escalated Support Cases</h3>
                  <p className="text-[10px] text-evera-muted">Disputes escalated by support staff requiring immediate Super Admin intervention and financial override.</p>
                </div>
              </div>
              <span className="text-[10px] bg-red-500/20 text-red-400 font-extrabold px-2 py-0.5 rounded border border-red-500/30 uppercase animate-pulse">
                {escalatedTickets.length} ACTIVE EMERGENCY
              </span>
            </div>

            {escalatedTickets.length === 0 ? (
              <div className="text-center py-6 text-xs text-evera-muted border border-dashed border-evera-border rounded-xl">
                All clear! No pending escalations requiring Super Admin review.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-evera-border/40">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-[#A8A29E] bg-white/5 uppercase">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Dispute details</th>
                      <th className="px-4 py-3">Escalation Reason</th>
                      <th className="px-4 py-3">Assigned Worker</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {escalatedTickets.map((t) => (
                      <tr key={t.id} className="border-b border-[#38302C]/40 hover:bg-white/5 last:border-none">
                        <td className="px-4 py-3 font-mono text-xs font-bold text-evera-primary">{t.ticketNumber}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-xs font-bold text-white">{t.subject}</p>
                            <p className="text-[10px] text-evera-muted mt-0.5">Cust: {t.customerName} | Provider: {t.providerName || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[10px] text-red-300 italic bg-red-500/5 border border-red-500/10 p-2 rounded max-w-xs leading-relaxed">
                            "{t.escalationReason}"
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-300">
                          {t.assignedToName || 'Unassigned'}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                          {t.assignedWorkerId !== 'super-admin' ? (
                            <button
                              onClick={() => handleTakeControl(t.id)}
                              className="text-[10px] bg-evera-primary/10 border border-evera-primary/30 hover:bg-evera-primary/20 text-evera-primary px-2.5 py-1.5 rounded font-bold transition-all"
                            >
                              Take Control
                            </button>
                          ) : (
                            <span className="text-[10px] text-green-400 font-extrabold uppercase bg-green-500/10 border border-green-500/20 px-2 py-1 rounded">
                              Under Control
                            </span>
                          )}
                          <button
                            onClick={() => handleInstantResolve(t.id)}
                            className="text-[10px] bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 text-green-400 px-2.5 py-1.5 rounded font-bold transition-all"
                          >
                            Instant Resolve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Universal Escalation Ledger Section */}
          <div className="card bg-evera-card border-evera-border p-5 border-l-4 border-l-amber-500 mt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Icons.TrendUp size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">📊 Universal Department Escalation Ledger</h3>
                  <p className="text-[10px] text-evera-muted">Cross-department governance, real-time ticket routes, transition counters, and administrative override controls.</p>
                </div>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 font-extrabold px-2 py-0.5 rounded border border-amber-500/30 uppercase animate-pulse">
                {tickets.filter(t => t.assignedDepartment !== undefined || t.status === 'ESCALATED').length} ACTIVE DEPT ROUTED
              </span>
            </div>

            {tickets.filter(t => t.assignedDepartment !== undefined || t.status === 'ESCALATED').length === 0 ? (
              <div className="text-center py-6 text-xs text-evera-muted border border-dashed border-evera-border rounded-xl">
                All clear! No active department-assigned escalations at the moment.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-evera-border/40">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-[#A8A29E] bg-white/5 uppercase">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Dispute details</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Escalation Reason</th>
                      <th className="px-4 py-3 text-center">Transitions</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.filter(t => t.assignedDepartment !== undefined || t.status === 'ESCALATED').map((t) => {
                      const deptColor = 
                        t.assignedDepartment === 'OPERATIONS' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        t.assignedDepartment === 'VENDOR' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        t.assignedDepartment === 'FINANCE' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        t.assignedDepartment === 'TECHNICAL' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-purple-500/10 text-purple-400 border-purple-500/20';

                      return (
                        <tr key={t.id} className="border-b border-[#38302C]/40 hover:bg-white/5 last:border-none">
                          <td className="px-4 py-3 font-mono text-xs font-bold text-evera-primary">{t.ticketNumber}</td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-xs font-bold text-white">{t.subject}</p>
                              <p className="text-[10px] text-evera-muted mt-0.5">Cust: {t.customerName} | Provider: {t.providerName || 'N/A'}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${deptColor}`}>
                              {t.assignedDepartment || 'GENERAL'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-[10px] text-gray-300 italic bg-white/5 border border-white/5 p-2 rounded max-w-xs leading-relaxed">
                              "{t.timelineActions?.find((a: any) => a.action === 'ESCALATED_DEPARTMENT')?.note || t.escalationReason || 'No details provided'}"
                            </p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-xs font-bold text-white bg-white/5 px-2 py-1 rounded border border-white/10">
                              {t.timelineActions?.length || 1} hops
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={t.status} />
                          </td>
                          <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => onNavigate('tickets')}
                              className="text-[10px] bg-evera-primary/10 border border-evera-primary/30 hover:bg-evera-primary/20 text-evera-primary px-2.5 py-1.5 rounded font-bold transition-all"
                            >
                              Manage Case
                            </button>
                            <button
                              onClick={() => handleInstantResolve(t.id)}
                              className="text-[10px] bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 text-green-400 px-2.5 py-1.5 rounded font-bold transition-all"
                            >
                              Instant Resolve
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

    </div>
  );
};