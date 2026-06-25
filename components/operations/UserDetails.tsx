import React, { useState, useRef } from 'react';
import {
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, Clock, Shield,
  CreditCard, Package, Activity, Hash, Star, CheckCircle2, AlertTriangle,
  AlertCircle, ShieldCheck, Smartphone, Wifi, WifiOff, ChevronRight,
  ChevronDown, XCircle, ExternalLink, Plus, Trash2, Home, Briefcase, X
} from 'lucide-react';

import { StatusBadge } from '../ui/StatusBadge';
import { useApp } from '../../context/AppContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusColor: Record<string, string> = {
  ACTIVE:      'text-green-400 bg-green-500/10 border-green-500/20',
  SUSPENDED:   'text-red-400 bg-red-500/10 border-red-500/20',
  PENDING:     'text-amber-400 bg-amber-500/10 border-amber-500/20',
  VERIFIED:    'text-green-400 bg-green-500/10 border-green-500/20',
  COMPLETED:   'text-green-400 bg-green-500/10 border-green-500/20',
  CANCELLED:   'text-red-400 bg-red-500/10 border-red-500/20',
  IN_PROGRESS: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  CONFIRMED:   'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

const InfoRow: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
    <span className="text-[11px] text-[#A8A29E] font-semibold uppercase tracking-widest flex items-center gap-2 flex-shrink-0 w-40">
      {icon}{label}
    </span>
    <span className="text-sm text-white font-medium text-right">{value}</span>
  </div>
);

// Clickable KPI card that scrolls to a target section
const KPICard: React.FC<{
  label: string; value: React.ReactNode; sub?: string;
  color: string; icon: React.ReactNode;
  onClick: () => void; highlighted?: boolean;
}> = ({ label, value, sub, color, icon, onClick, highlighted }) => (
  <button
    onClick={onClick}
    className={`rounded-2xl border p-5 flex flex-col gap-3 w-full text-left transition-all duration-200 cursor-pointer
      hover:scale-[1.02] hover:shadow-lg active:scale-100
      ${color}
      ${highlighted ? 'ring-2 ring-white/30 scale-[1.02] shadow-xl' : ''}
    `}
  >
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</span>
      <div className="opacity-70">{icon}</div>
    </div>
    <div>
      <p className="text-2xl font-black">{value}</p>
      {sub && <p className="text-[11px] opacity-60 mt-1">{sub}</p>}
    </div>

  </button>
);

// Section wrapper with highlight animation
const Section: React.FC<{ id: string; highlighted: boolean; children: React.ReactNode; className?: string }> = ({ id, highlighted, children, className = '' }) => (
  <div
    id={id}
    className={`bg-white/[0.02] border rounded-3xl p-6 transition-all duration-500 ${className}
      ${highlighted ? 'border-evera-primary/50 shadow-lg shadow-evera-primary/10 ring-1 ring-evera-primary/20' : 'border-white/5'}
    `}
  >
    {children}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
interface UserDetailsProps {
  userId: string | null;
  onBack: () => void;
}

export const UserDetails: React.FC<UserDetailsProps> = ({ userId, onBack }) => {
  const { bookings, adminUser, users } = useApp();
  const isOperationsAdmin = adminUser?.role === 'OPERATIONS_ADMIN';
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [isSuspending, setIsSuspending] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);

  // Address state
  const [addresses, setAddresses] = useState<{ label: string; value: string }[] | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('Home');
  const [newAddrValue, setNewAddrValue] = useState('');

  // Section refs for smooth scrolling
  const bookingsRef  = useRef<HTMLDivElement>(null);
  const paymentsRef  = useRef<HTMLDivElement>(null);
  const ticketsRef   = useRef<HTMLDivElement>(null);
  const disputesRef  = useRef<HTMLDivElement>(null);

  const user = (users || []).find((u: any) => String(u.id) === String(userId)) || null;

  // Initialise addresses from user data (once)
  const userAddresses = addresses ?? ((user as any)?.addresses || (user?.address ? [{ label: 'Home', value: user.address }] : []));

  const handleAddAddress = () => {
    if (!newAddrValue.trim()) return;
    setAddresses([...userAddresses, { label: newAddrLabel, value: newAddrValue.trim() }]);
    setNewAddrValue('');
    setNewAddrLabel('Home');
    setShowAddAddress(false);
  };

  const handleDeleteAddress = (idx: number) => {
    setAddresses(userAddresses.filter((_, i) => i !== idx));
  };

  // Real bookings from app context for this user
  const customerBookings = user
    ? bookings.filter(b => b.customerName?.toLowerCase() === user.name.toLowerCase())
    : [];

  // Merge: real bookings + mock bookings (deduplicated by id)
  const allBookings = [
    ...customerBookings,
    ...(user?.recentBookings || []).filter(
      rb => !customerBookings.some(cb => cb.id === rb.id)
    ),
  ];

  const totalBookingsCount = allBookings.length;

  const scrollAndHighlight = (ref: React.RefObject<HTMLDivElement>, section: string) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setHighlighted(section);
    setTimeout(() => setHighlighted(null), 2500);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <XCircle size={40} className="text-red-400 mx-auto" />
          <p className="text-white font-bold">User not found</p>
          <button onClick={onBack} className="text-evera-primary text-sm hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  const isActive = user.status === 'ACTIVE';
  const statusCls = statusColor[user.status] || 'text-gray-400 bg-gray-500/10 border-gray-500/20';

  // Real avatar photo URLs per user
  const avatarPhotoMap: Record<string, string> = {
    c1:  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=facearea&facepad=3&q=80',
    c5:  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=facearea&facepad=3&q=80',
    c8:  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=256&h=256&fit=facearea&facepad=3&q=80',
    c12: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=facearea&facepad=3&q=80',
  };
  const avatarPhoto = avatarPhotoMap[user.id];

  return (
    <div className="space-y-6 animate-fade-in pb-16">

      {/* ── Top Navigation Bar ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all flex items-center gap-2 text-sm font-bold"
          >
            <ArrowLeft size={16} /> Back to Users
          </button>
          <div>
            <h2 className="text-xl font-black text-white">User Profile</h2>
            <p className="text-xs text-[#A8A29E]">Full customer details — click any card to jump to that section</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.open(`mailto:${user.email}`, '_blank')}
            className="flex items-center gap-2 border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
          >
            <Mail size={13} /> Contact User
          </button>
          {/* Suspend/Restore — only visible to Super Admin, not Operations Admin */}
          {!isOperationsAdmin && (
            isActive ? (
              <button
                onClick={() => setIsSuspending(true)}
                className="flex items-center gap-2 border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
              >
                <Shield size={13} /> Suspend Account
              </button>
            ) : (
              <button className="flex items-center gap-2 border border-green-500/30 bg-green-500/5 hover:bg-green-500/10 text-green-400 text-xs font-bold px-4 py-2.5 rounded-xl transition-all">
                <CheckCircle2 size={13} /> Restore Account
              </button>
            )
          )}
        </div>
      </div>

      {/* ── Layout Grid ── */}
      <div className="grid grid-cols-12 gap-6">

        {/* ═══ LEFT COLUMN ═══════════════════════════════════════════════════ */}
        <div className="col-span-12 lg:col-span-4 space-y-5">

          {/* Profile Card */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-600/5 to-transparent pointer-events-none rounded-3xl" />
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              {/* Avatar — real photo if available */}
              <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/40 border-2 border-white/10 flex-shrink-0">
                {avatarPhoto ? (
                  <img src={avatarPhoto} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-black text-3xl">
                    {user.avatar}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">{user.name}</h3>
                <p className="text-sm text-[#A8A29E] mt-1">{user.city}</p>
              </div>
              <span className={`text-xs font-black px-3 py-1.5 rounded-full border ${statusCls}`}>
                {user.status}
              </span>
              {/* Quick stats — also clickable */}
              <div className="w-full grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
                {[
                  { label: 'Bookings', value: totalBookingsCount, ref: bookingsRef, section: 'bookings' },
                  { label: 'Tickets',  value: user.tickets,       ref: ticketsRef,  section: 'tickets' },
                  { label: 'Disputes', value: user.disputes,      ref: disputesRef, section: 'disputes' },
                ].map(s => (
                  <button
                    key={s.label}
                    onClick={() => scrollAndHighlight(s.ref, s.section)}
                    className="text-center hover:bg-white/5 rounded-xl p-1.5 transition-all cursor-pointer"
                  >
                    <p className="text-xl font-black text-white">{s.value}</p>
                    <p className="text-[10px] text-[#A8A29E] uppercase tracking-wider mt-0.5">{s.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <User size={13} className="text-evera-primary" /> Personal Information
            </h4>
            <InfoRow label="Full Name"   value={user.name || 'N/A'}        icon={<User size={10} />} />
            <InfoRow label="Email"       value={user.email || 'N/A'}       icon={<Mail size={10} />} />
            <InfoRow label="Phone"       value={user.phone || <span className="text-gray-500 italic text-[10px]">Not provided</span>}       icon={<Phone size={10} />} />
            <InfoRow label="Gender"      value={user.gender || <span className="text-gray-500 italic text-[10px]">Not provided</span>} />
            <InfoRow label="Age"         value={user.age ? `${user.age} years` : <span className="text-gray-500 italic text-[10px]">Not provided</span>} />
            <InfoRow label="City"        value={user.city && user.city !== 'Unknown City' ? user.city : <span className="text-gray-500 italic text-[10px]">Not provided</span>}        icon={<MapPin size={10} />} />
            <InfoRow label="Joined"      value={user.joinedDate || 'N/A'}  icon={<Calendar size={10} />} />
            <InfoRow label="Last Active" value={user.lastActive || 'N/A'}  icon={<Clock size={10} />} />
          </div>

          {/* Saved Addresses — VIEW ONLY (user manages from app) */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <MapPin size={13} className="text-blue-400" /> Saved Addresses
              <span className="ml-1 text-[10px] text-[#A8A29E] font-normal normal-case">({userAddresses.length})</span>
              <span className="ml-auto text-[10px] text-[#A8A29E] italic font-normal normal-case">Managed by user</span>
            </h4>

            {/* Address List — read only */}
            {userAddresses.length === 0 ? (
              <p className="text-xs text-[#A8A29E] italic">No addresses saved by this user.</p>
            ) : (
              <div className="space-y-3">
                {userAddresses.map((addr, i) => {
                  const iconMap: Record<string, React.ReactNode> = {
                    Home: <Home size={13} className="text-blue-400" />,
                    Work: <Briefcase size={13} className="text-purple-400" />,
                    'Event Venue': <MapPin size={13} className="text-amber-400" />,
                    Other: <MapPin size={13} className="text-gray-400" />,
                  };
                  return (
                    <div key={i} className="flex items-start gap-3 bg-black/20 border border-white/5 rounded-2xl px-4 py-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {iconMap[addr.label] ?? <MapPin size={13} className="text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-black text-evera-primary uppercase tracking-widest block mb-1">{addr.label}</span>
                        <p className="text-sm text-gray-300 leading-relaxed">{addr.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>


          {/* KYC & Identity */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck size={13} className="text-green-400" /> KYC & Identity
            </h4>
            <InfoRow label="KYC Status" value={
              <span className={`text-[11px] font-black px-2 py-0.5 rounded border ${statusColor[user.kycStatus] || 'text-gray-400 bg-gray-500/10 border-gray-500/20'}`}>
                {user.kycStatus}
              </span>
            } />
            <InfoRow label="Aadhaar" value={user.aadhar ? <span className="font-mono tracking-widest">{user.aadhar}</span> : <span className="text-gray-500 italic text-[10px]">Not Submitted</span>} icon={<Hash size={10} />} />
            <InfoRow label="PAN"     value={user.pan ? <span className="font-mono tracking-widest">{user.pan}</span> : <span className="text-gray-500 italic text-[10px]">Not Submitted</span>}    icon={<Hash size={10} />} />
          </div>
        </div>

        {/* ═══ RIGHT COLUMN ═══════════════════════════════════════════════════ */}
        <div className="col-span-12 lg:col-span-8 space-y-5">

          {/* ── Clickable KPI Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <KPICard
              label="Total Bookings" value={totalBookingsCount} sub={`${totalBookingsCount} booking${totalBookingsCount !== 1 ? 's' : ''} found`}
              color="text-blue-400 bg-blue-500/10 border border-blue-500/20"
              icon={<Package size={18} />}
              highlighted={highlighted === 'bookings'}
              onClick={() => scrollAndHighlight(bookingsRef, 'bookings')}
            />
            <KPICard
              label="Total Spent" value={`₹${user.totalSpent.toLocaleString()}`} sub="Lifetime value"
              color="text-green-400 bg-green-500/10 border border-green-500/20"
              icon={<CreditCard size={18} />}
              highlighted={highlighted === 'payments'}
              onClick={() => scrollAndHighlight(paymentsRef, 'payments')}
            />
            <KPICard
              label="Open Tickets" value={user.tickets} sub={user.tickets > 0 ? 'Needs attention' : 'All clear'}
              color="text-amber-400 bg-amber-500/10 border border-amber-500/20"
              icon={<AlertTriangle size={18} />}
              highlighted={highlighted === 'tickets'}
              onClick={() => scrollAndHighlight(ticketsRef, 'tickets')}
            />
            <KPICard
              label="Disputes" value={user.disputes} sub={`${user.refunds} refund(s)`}
              color="text-red-400 bg-red-500/10 border border-red-500/20"
              icon={<Shield size={18} />}
              highlighted={highlighted === 'disputes'}
              onClick={() => scrollAndHighlight(disputesRef, 'disputes')}
            />
          </div>

          {/* App & Device Info */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Smartphone size={13} className="text-cyan-400" /> App & Device Info
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Device',       value: user.appInfo?.device      || '—', icon: <Smartphone size={12} /> },
                { label: 'App Version',  value: user.appInfo?.appVersion  || '—', icon: <Activity size={12} /> },
                { label: 'Auth Method',  value: user.appInfo?.authMethod  || '—', icon: <Shield size={12} /> },
                { label: 'Last Session', value: user.appInfo?.lastSession || '—', icon: <Clock size={12} /> },
              ].map(item => (
                <div key={item.label} className="bg-black/20 border border-white/5 rounded-2xl p-4">
                  <p className="text-[10px] text-[#A8A29E] font-semibold uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    {item.icon}{item.label}
                  </p>
                  <p className="text-sm text-white font-bold">{item.value}</p>
                </div>
              ))}
              <div className="bg-black/20 border border-white/5 rounded-2xl p-4">
                <p className="text-[10px] text-[#A8A29E] font-semibold uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  {user.appInfo?.pushNotifications === 'Enabled'
                    ? <Wifi size={12} className="text-green-400" />
                    : <WifiOff size={12} className="text-red-400" />}
                  Push Notifications
                </p>
                <span className={`text-xs font-black px-2 py-0.5 rounded border ${user.appInfo?.pushNotifications === 'Enabled' ? statusColor.ACTIVE : 'text-gray-400 bg-gray-500/10 border-gray-500/20'}`}>
                  {user.appInfo?.pushNotifications || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Methods — scroll target for "Total Spent" */}
          <div ref={paymentsRef}>
            <Section id="payments-section" highlighted={highlighted === 'payments'}>
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <CreditCard size={13} className="text-purple-400" /> Payment Methods
                {highlighted === 'payments' && <span className="ml-auto text-[10px] text-evera-primary font-bold animate-pulse">↑ You clicked Total Spent</span>}
              </h4>
              <div className="space-y-3">
                {user.paymentMethods.map((pm, i) => (
                  <div key={i} className="flex items-center gap-3 bg-black/20 border border-white/5 rounded-2xl px-4 py-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/20 flex items-center justify-center">
                      <CreditCard size={14} className="text-purple-400" />
                    </div>
                    <span className="text-sm text-white font-medium">{pm}</span>
                    <CheckCircle2 size={14} className="text-green-400 ml-auto" />
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Preferred Services */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Star size={13} className="text-amber-400" /> Preferred Services
            </h4>
            <div className="flex flex-wrap gap-2">
              {user.preferredServices.map(s => (
                <span key={s} className="text-sm bg-evera-primary/10 border border-evera-primary/25 text-evera-primary px-4 py-2 rounded-xl font-semibold">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Booking History — scroll target for "Total Bookings" */}
          <div ref={bookingsRef}>
            <Section id="bookings-section" highlighted={highlighted === 'bookings'}>
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <Package size={13} className="text-amber-400" /> Booking History
                <span className="ml-2 text-[10px] text-[#A8A29E] font-normal normal-case">({totalBookingsCount} total)</span>
                {highlighted === 'bookings' && <span className="ml-auto text-[10px] text-evera-primary font-bold animate-pulse">↑ You clicked Total Bookings</span>}
              </h4>
              <div className="space-y-3">
                {allBookings.length === 0 ? (
                  <div className="text-center py-8 text-[#A8A29E]">
                    <Package size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No bookings found for this user.</p>
                  </div>
                ) : allBookings.map((b: any) => {
                  const bId = b.id || b.serviceType;
                  const isOpen = expandedBooking === bId;
                  const bStatus = b.status || 'PENDING';
                  const bCls = statusColor[bStatus] || 'text-gray-400 bg-gray-500/10 border-gray-500/20';
                  const serviceName = b.service || b.serviceType || 'Service';
                  const vendorName = b.vendor || b.provider || '—';
                  const bDate = b.date || '—';
                  const bAmount = b.amount || 0;
                  return (
                    <div key={bId} className={`border rounded-2xl transition-all ${isOpen ? 'border-evera-primary/30 bg-evera-primary/5' : 'border-white/5 bg-black/20 hover:border-white/10'}`}>
                      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedBooking(isOpen ? null : bId)}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <Package size={16} className="text-amber-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{serviceName}</p>
                            <p className="text-xs text-[#A8A29E]">{vendorName} · {bDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-black text-white">₹{Number(bAmount).toLocaleString()}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${bCls}`}>{bStatus}</span>
                          </div>
                          {isOpen ? <ChevronDown size={16} className="text-evera-primary" /> : <ChevronRight size={16} className="text-gray-500" />}
                        </div>
                      </div>
                      {isOpen && (
                        <div className="border-t border-white/5 p-4 animate-fade-in grid grid-cols-2 gap-3">
                          {[
                            { label: 'Booking ID',  value: b.id || '—' },
                            { label: 'Service',     value: serviceName },
                            { label: 'Vendor',      value: vendorName },
                            { label: 'Date',        value: bDate },
                            { label: 'Amount Paid', value: `₹${Number(bAmount).toLocaleString()}` },
                            { label: 'Status',      value: bStatus },
                          ].map(item => (
                            <div key={item.label} className="bg-black/20 border border-white/5 rounded-xl p-3">
                              <p className="text-[10px] text-[#A8A29E] font-semibold uppercase tracking-widest mb-1">{item.label}</p>
                              <p className="text-xs text-white font-bold">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          </div>

          {/* Open Tickets — scroll target for "Open Tickets" */}
          <div ref={ticketsRef}>
            <Section id="tickets-section" highlighted={highlighted === 'tickets'}>
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle size={13} className="text-amber-400" /> Open Tickets
                {highlighted === 'tickets' && <span className="ml-auto text-[10px] text-evera-primary font-bold animate-pulse">↑ You clicked Open Tickets</span>}
              </h4>
              {user.tickets > 0 ? (
                <div className="space-y-3">
                  {Array.from({ length: user.tickets }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl px-4 py-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <AlertTriangle size={14} className="text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-bold">Support Ticket #{String(i + 1).padStart(3, '0')}</p>
                        <p className="text-xs text-[#A8A29E]">Pending resolution · Assigned to support team</p>
                      </div>
                      <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded border text-amber-400 bg-amber-500/10 border-amber-500/20">OPEN</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#A8A29E]">
                  <CheckCircle2 size={28} className="text-green-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">No open tickets</p>
                  <p className="text-xs mt-1">This user has no active support tickets.</p>
                </div>
              )}
            </Section>
          </div>

          {/* Disputes & Refunds — scroll target for "Disputes" */}
          <div ref={disputesRef}>
            <Section id="disputes-section" highlighted={highlighted === 'disputes'}>
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <Shield size={13} className="text-red-400" /> Disputes & Refunds
                {highlighted === 'disputes' && <span className="ml-auto text-[10px] text-evera-primary font-bold animate-pulse">↑ You clicked Disputes</span>}
              </h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-red-400">{user.disputes}</p>
                  <p className="text-[10px] text-[#A8A29E] uppercase tracking-widest mt-1">Total Disputes</p>
                </div>
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-blue-400">{user.refunds}</p>
                  <p className="text-[10px] text-[#A8A29E] uppercase tracking-widest mt-1">Refunds Issued</p>
                </div>
              </div>
              {user.disputes === 0 ? (
                <div className="text-center py-4 text-[#A8A29E]">
                  <p className="text-sm">No disputes on record for this user.</p>
                </div>
              ) : (
                <p className="text-xs text-[#A8A29E]">This user has raised {user.disputes} dispute(s) with {user.refunds} resolved via refund. Review booking history for full context.</p>
              )}
            </Section>
          </div>

        </div>
      </div>

      {/* Suspend Confirmation Modal */}
      {isSuspending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1A1612] border border-[#38302C] rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Shield size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-black text-lg">Suspend Account</h3>
                <p className="text-[#A8A29E] text-xs">This action can be reversed later</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-6">
              Are you sure you want to suspend <strong className="text-white">{user.name}</strong>'s account? They will lose access to the app immediately.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsSuspending(false)} className="flex-1 border border-white/10 text-white text-sm font-bold py-3 rounded-xl hover:bg-white/5 transition-all">
                Cancel
              </button>
              <button onClick={() => setIsSuspending(false)} className="flex-1 bg-red-600 hover:bg-red-500 text-white text-sm font-bold py-3 rounded-xl transition-all">
                Confirm Suspend
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
