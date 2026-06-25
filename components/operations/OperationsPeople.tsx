import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Worker, WorkerStatus } from '../../types';
import {
  Search, Star, Briefcase, Phone, Mail, Calendar, TrendingUp,
  User, Shield, AlertTriangle, CheckCircle2, XCircle, Clock,
  ChevronRight, ChevronDown, MapPin, Hash, Award, CreditCard,
  Activity, Package, ArrowUpRight, Filter, Download, Eye
} from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

// ─── Mock extended user data ──────────────────────────────────────────────────
export const MOCK_USERS: any = [];


// ─── Status colour helpers ────────────────────────────────────────────────────
const statusColor: Record<string, string> = {
  ACTIVE: 'text-green-400 bg-green-500/10 border-green-500/20',
  PENDING_APPROVAL: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  SUSPENDED: 'text-red-400 bg-red-500/10 border-red-500/20',
  DELETED: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  PENDING: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  COMPLETED: 'text-green-400 bg-green-500/10 border-green-500/20',
  CANCELLED: 'text-red-400 bg-red-500/10 border-red-500/20',
  IN_PROGRESS: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  CONFIRMED: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  VERIFIED: 'text-green-400 bg-green-500/10 border-green-500/20',
};

const InfoRow: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-[#38302C]/40 last:border-0">
    <span className="text-[10px] text-[#A8A29E] font-medium uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0 w-36">
      {icon}{label}
    </span>
    <span className="text-xs text-white font-medium text-right">{value}</span>
  </div>
);

const StatCard: React.FC<{ label: string; value: string | number; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className={`rounded-xl border p-3 flex items-center gap-3 ${color}`}>
    <div className="opacity-80">{icon}</div>
    <div>
      <p className="text-lg font-black">{value}</p>
      <p className="text-[10px] opacity-70 font-medium uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

// ─── Vendor Detail Panel ──────────────────────────────────────────────────────
const VendorDetailPanel: React.FC<{ vendor: Worker; onClose: () => void }> = ({ vendor, onClose }) => {
  const statusCls = statusColor[vendor.status] || 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="h-full w-full max-w-xl bg-[#1A1612] border-l border-[#38302C] overflow-y-auto no-scrollbar animate-slide-in-right"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#1A1612]/95 backdrop-blur border-b border-[#38302C] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <img src={vendor.avatar} alt={vendor.name} className="w-10 h-10 rounded-xl object-cover" />
            <div>
              <h2 className="text-sm font-black text-white">{vendor.name}</h2>
              <p className="text-[10px] text-[#A8A29E]">{vendor.role} · ID #{vendor.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#A8A29E] hover:text-white transition-colors p-1">
            <XCircle size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status + KPI row */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Jobs Done" value={vendor.jobsCompleted} color="text-blue-400 bg-blue-500/10 border border-blue-500/20" icon={<Package size={16} />} />
            <StatCard label="Total Earned" value={`₹${vendor.totalEarned.toLocaleString()}`} color="text-green-400 bg-green-500/10 border border-green-500/20" icon={<CreditCard size={16} />} />
            <StatCard label="Rating" value={`${vendor.rating} ★`} color="text-amber-400 bg-amber-500/10 border border-amber-500/20" icon={<Star size={16} />} />
            <div className={`rounded-xl border p-3 flex items-center gap-3 ${statusCls}`}>
              <Activity size={16} className="opacity-80" />
              <div>
                <p className="text-xs font-black uppercase">{vendor.status.replace('_', ' ')}</p>
                <p className="text-[10px] opacity-70 uppercase tracking-wider">Account Status</p>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-[#161210] border border-[#38302C] rounded-xl p-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <User size={12} className="text-evera-primary" /> Personal Information
            </h3>
            <InfoRow label="Email" value={vendor.email && !vendor.email.endsWith('@example.com') ? vendor.email : <span className="text-gray-500 italic text-[10px]">Not provided</span>} icon={<Mail size={10} />} />
            <InfoRow label="Phone" value={(vendor as any).phone || '—'} icon={<Phone size={10} />} />
            <InfoRow label="Role / Trade" value={vendor.role} icon={<Briefcase size={10} />} />
            <InfoRow label="Joined Date" value={vendor.joinedDate} icon={<Calendar size={10} />} />
            <InfoRow label="Vendor ID" value={`#${vendor.id}`} icon={<Hash size={10} />} />
          </div>

          {/* Performance */}
          <div className="bg-[#161210] border border-[#38302C] rounded-xl p-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp size={12} className="text-green-400" /> Performance Metrics
            </h3>
            <InfoRow label="Jobs Completed" value={vendor.jobsCompleted} />
            <InfoRow label="Total Earned" value={`₹${vendor.totalEarned.toLocaleString()}`} />
            <InfoRow label="Average Rating" value={
              (vendor as any).reviews === 0 ? (
                <span className="text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[10px]">NEW</span>
              ) : (
                <span className="flex items-center gap-1">{vendor.rating} <Star size={10} className="text-amber-400 fill-amber-400" /></span>
              )
            } icon={<Star size={10} />} />
            <InfoRow label="Avg per Job" value={vendor.jobsCompleted > 0 ? `₹${Math.round(vendor.totalEarned / vendor.jobsCompleted).toLocaleString()}` : '—'} />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 border border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10 rounded-xl py-2.5 text-xs font-bold transition-all">
              <Shield size={12} /> Suspend Vendor
            </button>
            <button className="flex items-center justify-center gap-2 border border-blue-500/30 text-blue-400 bg-blue-500/5 hover:bg-blue-500/10 rounded-xl py-2.5 text-xs font-bold transition-all">
              <Mail size={12} /> Send Notice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── User Detail Panel ────────────────────────────────────────────────────────
const UserDetailPanel: React.FC<{ user: typeof MOCK_USERS[0]; onClose: () => void }> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="h-full w-full max-w-xl bg-[#1A1612] border-l border-[#38302C] overflow-y-auto no-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#1A1612]/95 backdrop-blur border-b border-[#38302C] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-black text-sm">
              {user.avatar}
            </div>
            <div>
              <h2 className="text-sm font-black text-white">{user.name}</h2>
              <p className="text-[10px] text-[#A8A29E]">{user.city} · ID #{user.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#A8A29E] hover:text-white transition-colors p-1">
            <XCircle size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total Bookings" value={user.totalBookings} color="text-blue-400 bg-blue-500/10 border border-blue-500/20" icon={<Package size={16} />} />
            <StatCard label="Total Spent" value={`₹${user.totalSpent.toLocaleString()}`} color="text-green-400 bg-green-500/10 border border-green-500/20" icon={<CreditCard size={16} />} />
            <StatCard label="Open Tickets" value={user.tickets} color="text-amber-400 bg-amber-500/10 border border-amber-500/20" icon={<AlertTriangle size={16} />} />
            <StatCard label="Disputes" value={user.disputes} color="text-red-400 bg-red-500/10 border border-red-500/20" icon={<Shield size={16} />} />
          </div>

          {/* Personal Info */}
          <div className="bg-[#161210] border border-[#38302C] rounded-xl p-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <User size={12} className="text-evera-primary" /> Personal Information
            </h3>
            <InfoRow label="Full Name" value={user.name} icon={<User size={10} />} />
            <InfoRow label="Email" value={user.email} icon={<Mail size={10} />} />
            <InfoRow label="Phone" value={user.phone} icon={<Phone size={10} />} />
            <InfoRow label="Gender" value={user.gender} />
            <InfoRow label="Age" value={`${user.age} years`} />
            <InfoRow label="City" value={user.city} icon={<MapPin size={10} />} />
            <InfoRow label="Joined" value={user.joinedDate} icon={<Calendar size={10} />} />
            <InfoRow label="Last Active" value={user.lastActive} icon={<Clock size={10} />} />
          </div>

          {/* Address */}
          <div className="bg-[#161210] border border-[#38302C] rounded-xl p-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin size={12} className="text-blue-400" /> Address
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">{user.address}</p>
          </div>

          {/* KYC / Identity */}
          <div className="bg-[#161210] border border-[#38302C] rounded-xl p-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield size={12} className="text-green-400" /> KYC & Identity
            </h3>
            <InfoRow label="KYC Status" value={
              <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${statusColor[user.kycStatus] || 'text-gray-400 bg-gray-500/10 border-gray-500/20'}`}>
                {user.kycStatus}
              </span>
            } />
            <InfoRow label="Aadhaar" value={user.aadhar} icon={<Hash size={10} />} />
            <InfoRow label="PAN" value={user.pan} icon={<Hash size={10} />} />
          </div>

          {/* Payment Methods */}
          <div className="bg-[#161210] border border-[#38302C] rounded-xl p-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <CreditCard size={12} className="text-purple-400" /> Payment Methods
            </h3>
            <div className="space-y-2">
              {user.paymentMethods.map((pm, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-300 bg-[#241E1B] border border-[#38302C] rounded-lg px-3 py-2">
                  <CreditCard size={12} className="text-[#A8A29E]" /> {pm}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-[#161210] border border-[#38302C] rounded-xl p-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Package size={12} className="text-amber-400" /> Recent Bookings
            </h3>
            <div className="space-y-2">
              {user.recentBookings.map(b => (
                <div key={b.id} className="flex items-center justify-between bg-[#241E1B] border border-[#38302C] rounded-lg px-3 py-2.5">
                  <div>
                    <p className="text-xs font-bold text-white">{b.service}</p>
                    <p className="text-[10px] text-[#A8A29E]">{b.vendor} · {b.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-white">₹{b.amount}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${statusColor[b.status] || ''}`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preferred Services */}
          <div className="bg-[#161210] border border-[#38302C] rounded-xl p-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3">Preferred Services</h3>
            <div className="flex flex-wrap gap-2">
              {user.preferredServices.map(s => (
                <span key={s} className="text-[10px] bg-evera-primary/10 border border-evera-primary/20 text-evera-primary px-2.5 py-1 rounded-lg font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* App & Device Info */}
          <div className="bg-[#161210] border border-[#38302C] rounded-xl p-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity size={12} className="text-cyan-400" /> App & Device Info
            </h3>
            <InfoRow label="Device Model" value={user.appInfo?.device || <span className="text-gray-500 italic text-[10px]">Not provided</span>} icon={<Phone size={10} />} />
            <InfoRow label="App Version" value={user.appInfo?.appVersion || <span className="text-gray-500 italic text-[10px]">Not provided</span>} icon={<Package size={10} />} />
            <InfoRow label="Push Notifications" value={
              user.appInfo?.pushNotifications
                ? <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${user.appInfo.pushNotifications === 'Enabled' ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-gray-400 bg-gray-500/10 border-gray-500/20'}`}>{user.appInfo.pushNotifications}</span>
                : <span className="text-gray-500 italic text-[10px]">Not provided</span>
            } icon={<Mail size={10} />} />
            <InfoRow label="Auth Method" value={user.appInfo?.authMethod || <span className="text-gray-500 italic text-[10px]">Not provided</span>} icon={<Shield size={10} />} />
            <InfoRow label="Last App Session" value={user.appInfo?.lastSession || <span className="text-gray-500 italic text-[10px]">Not provided</span>} icon={<Clock size={10} />} />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 border border-amber-500/30 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 rounded-xl py-2.5 text-xs font-bold transition-all">
              <Shield size={12} /> Suspend User
            </button>
            <button 
              onClick={() => window.open(`mailto:${user.email}`, '_blank')}
              className="flex items-center justify-center gap-2 border border-blue-500/30 text-blue-400 bg-blue-500/5 hover:bg-blue-500/10 rounded-xl py-2.5 text-xs font-bold transition-all"
            >
              <Mail size={12} /> Contact User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const OperationsPeople: React.FC<{ defaultTab?: 'vendors' | 'users'; onUserClick?: (userId: string) => void; usersOnly?: boolean }> = ({ defaultTab = 'vendors', onUserClick, usersOnly = false }) => {
  const { workers, users, adminUser, bookings } = useApp();
  const isOpsWorker = adminUser?.role === 'OPERATIONS_WORKER';
  
  const [tab, setTab] = useState<'vendors' | 'users'>(usersOnly ? 'users' : defaultTab);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(isOpsWorker ? 'PENDING_APPROVAL' : 'ALL');
  const [selectedVendor, setSelectedVendor] = useState<Worker | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Filter vendors
  const filteredVendors = useMemo(() => workers.filter(w => {
    if (isOpsWorker && w.status !== WorkerStatus.PENDING) return false;
    if (statusFilter !== 'ALL' && w.status !== statusFilter) return false;
    if (!search) return true;
    const t = search.toLowerCase();
    return w.name.toLowerCase().includes(t) || w.role.toLowerCase().includes(t) || w.email.toLowerCase().includes(t);
  }), [workers, search, statusFilter, isOpsWorker]);

  // Filter users
  const filteredUsers = useMemo(() => (users || []).filter(u => {
    if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
    if (!search) return true;
    const t = search.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(t)) ||
      (u.email && u.email.toLowerCase().includes(t)) ||
      (u.phone && u.phone.toLowerCase().includes(t)) ||
      (u.city && u.city.toLowerCase().includes(t))
    );
  }), [users, search, statusFilter]);

  const totalVendors = workers.length;
  const activeVendors = workers.filter(w => w.status === WorkerStatus.ACTIVE).length;
  const pendingVendors = workers.filter(w => w.status === WorkerStatus.PENDING).length;
  const totalUsers = (users || []).length;
  const activeUsers = (users || []).filter(u => u.status === 'ACTIVE').length || totalUsers; // Live users count

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white">{usersOnly ? 'Users Management' : 'People Management'}</h2>
          <p className="text-xs text-[#A8A29E]">{usersOnly ? 'Full pin-to-pin customer details. Click any user to view their profile.' : 'Full pin-to-pin vendor and user details for Operations oversight.'}</p>
        </div>
        <button className="flex items-center gap-2 border border-[#38302C] bg-[#161210] text-[#A8A29E] hover:text-white text-xs font-bold px-4 py-2 rounded-xl transition-all">
          <Download size={13} /> Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(usersOnly ? [
          { label: 'Total Users', value: totalUsers, color: 'from-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
          { label: 'Active Users', value: activeUsers, color: 'from-green-500/10', border: 'border-green-500/20', text: 'text-green-400' },
          { label: 'Suspended Users', value: totalUsers - activeUsers, color: 'from-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
          { label: 'Open Tickets', value: (users || []).reduce((a: any, u: any) => a + (u.tickets || 0), 0), color: 'from-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
          { label: 'Total Disputes', value: (users || []).reduce((a: any, u: any) => a + (u.disputes || 0), 0), color: 'from-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
        ] : [
          ...(isOpsWorker ? [] : [
            { label: 'Total Vendors', value: totalVendors, color: 'from-orange-500/10', border: 'border-orange-500/20', text: 'text-evera-primary' },
            { label: 'Active Vendors', value: activeVendors, color: 'from-green-500/10', border: 'border-green-500/20', text: 'text-green-400' },
          ]),
          { label: 'Pending Approval', value: pendingVendors, color: 'from-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
          ...(isOpsWorker ? [] : [
            { label: 'Total Users', value: totalUsers, color: 'from-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
            { label: 'Active Users', value: activeUsers, color: 'from-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
          ]),
        ]).map(c => (
          <div key={c.label} className={`bg-gradient-to-br ${c.color} to-transparent border ${c.border} rounded-xl p-4`}>
            <p className={`text-2xl font-black ${c.text}`}>{c.value}</p>
            <p className="text-[10px] text-[#A8A29E] font-medium uppercase tracking-wider mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Tab Toggle — hidden in usersOnly mode and for Ops Worker */}
      {!usersOnly && !isOpsWorker && (
        <div className="bg-[#161210] border border-[#38302C] p-1 rounded-xl flex gap-1 w-fit">
          {(['vendors', 'users'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setStatusFilter('ALL'); setSearch(''); }}
              className={`px-5 py-2 rounded-lg text-xs font-black transition-all capitalize ${
                tab === t
                  ? 'bg-gradient-to-r from-evera-primary to-[#d9751a] text-white shadow-md'
                  : 'text-[#A8A29E] hover:text-white'
              }`}
            >
              {t === 'vendors' ? `🏢 Vendors (${totalVendors})` : `👤 Users (${totalUsers})`}
            </button>
          ))}
        </div>
      )}

      {/* Search + Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={tab === 'vendors' ? 'Search by name, trade, email…' : 'Search by name, email or phone…'}
            className="w-full bg-[#161210] border border-[#38302C] text-white rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-evera-primary placeholder-[#A8A29E]"
          />
        </div>

        {!isOpsWorker && (
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#161210] border border-[#38302C] text-[#A8A29E] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-evera-primary cursor-pointer"
          >
            <option value="ALL">All Status</option>
            {tab === 'vendors'
              ? <>
                <option value="ACTIVE">Active</option>
                <option value="PENDING_APPROVAL">Pending</option>
                <option value="SUSPENDED">Suspended</option>
              </>
              : <>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </>
            }
          </select>
        )}
      </div>

      {/* ── VENDORS TABLE ─────────────────────────────────────────────────────── */}
      {tab === 'vendors' && (
        <div className="card bg-evera-card border-evera-border overflow-hidden">
          <div className="p-4 border-b border-[#38302C]/50">
            <p className="text-xs text-[#A8A29E]">Showing <span className="text-white font-bold">{filteredVendors.length}</span> vendors — click any row to see full details</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#38302C]/50">
                  {['Vendor', 'Trade / Role', 'Contact', 'Status', 'Jobs', 'Rating', 'Total Earned', 'Joined', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-[#A8A29E] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map(v => {
                  const cls = statusColor[v.status] || 'text-gray-400 bg-gray-500/10 border-gray-500/20';
                  return (
                    <tr
                      key={v.id}
                      onClick={() => setSelectedVendor(v)}
                      className="border-b border-[#38302C]/30 hover:bg-white/[0.02] cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={v.avatar} alt={v.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-white group-hover:text-evera-primary transition-colors">{v.name}</p>
                            <p className="text-[10px] text-[#A8A29E] font-mono">#{v.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-300 bg-[#241E1B] border border-[#38302C] px-2 py-0.5 rounded-lg">{v.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-300">{v.email && !v.email.endsWith('@example.com') ? v.email : 'No email'}</p>
                        <p className="text-[10px] text-[#A8A29E]">{(v as any).phone || '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${cls}`}>
                          {v.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-white">{v.jobsCompleted}</td>
                      <td className="px-4 py-3">
                        {(v as any).reviews === 0 ? (
                          <span className="text-xs text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">NEW</span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                            {v.rating} <Star size={10} className="fill-amber-400" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs font-black text-green-400">₹{v.totalEarned.toLocaleString()}</td>
                      <td className="px-4 py-3 text-[10px] text-[#A8A29E]">{v.joinedDate}</td>
                      <td className="px-4 py-3">
                        <Eye size={14} className="text-[#A8A29E] group-hover:text-evera-primary transition-colors" />
                      </td>
                    </tr>
                  );
                })}
                {filteredVendors.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-12 text-xs text-[#A8A29E]">No vendors match your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── USERS TABLE ───────────────────────────────────────────────────────── */}
      {tab === 'users' && (
        <div className="card bg-evera-card border-evera-border overflow-hidden">
          <div className="p-4 border-b border-[#38302C]/50">
            <p className="text-xs text-[#A8A29E]">Showing <span className="text-white font-bold">{filteredUsers.length}</span> users — click any row to see full details</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#38302C]/50">
                  {['User', 'Contact', 'Location', 'Status', 'Bookings', 'Total Spent', 'Tickets', 'KYC', 'Last Active', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-[#A8A29E] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => {
                  const cls = statusColor[u.status] || 'text-gray-400 bg-gray-500/10 border-gray-500/20';
                  return (
                    <tr
                      key={u.id}
                      onClick={() => onUserClick ? onUserClick(u.id) : setSelectedUser(u)}
                      className="border-b border-[#38302C]/30 hover:bg-white/[0.02] cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                            {(u as any).photoUrl ? (
                              <img src={(u as any).photoUrl} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-black text-xs">
                                {u.avatar}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{u.name}</p>
                            <p className="text-[10px] text-[#A8A29E] font-mono">#{u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-300">{u.email}</p>
                        <p className="text-[10px] text-[#A8A29E]">{u.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-xs text-gray-300">
                          <MapPin size={10} className="text-[#A8A29E]" /> {u.city}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${cls}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-white">{u.totalBookings}</td>
                      <td className="px-4 py-3 text-xs font-black text-green-400">₹{u.totalSpent.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-black ${u.tickets > 0 ? 'text-amber-400' : 'text-[#A8A29E]'}`}>
                          {u.tickets}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColor[u.kycStatus] || ''}`}>
                          {u.kycStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[10px] text-[#A8A29E]">{u.lastActive}</td>
                      <td className="px-4 py-3">
                        <Eye size={14} className="text-[#A8A29E] group-hover:text-blue-400 transition-colors" />
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan={10} className="text-center py-12 text-xs text-[#A8A29E]">No users match your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Panels */}
      {selectedVendor && <VendorDetailPanel vendor={selectedVendor} onClose={() => setSelectedVendor(null)} />}
      {!onUserClick && selectedUser && <UserDetailPanel user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
};
