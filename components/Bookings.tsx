import React, { useState, useEffect } from 'react';
import { Icons } from './ui/Icons';
import * as api from '../api/service';
import { Booking } from '../types';

import { PaymentDetailView } from './finance/PaymentDetailView';
import { Search, Clock, CheckCircle2, XCircle, AlertCircle, Calendar, Briefcase, TrendingUp, ChevronRight, MapPin } from 'lucide-react';

interface BookingsProps {
    onBack: () => void;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
    COMPLETED:  { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: <CheckCircle2 size={12} />, label: 'Completed' },
    CONFIRMED:  { color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    icon: <CheckCircle2 size={12} />, label: 'Confirmed' },
    PENDING:    { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   icon: <Clock size={12} />,        label: 'Pending' },
    CANCELLED:  { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/30',     icon: <XCircle size={12} />,      label: 'Cancelled' },
    IN_PROGRESS:{ color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/30',  icon: <AlertCircle size={12} />,  label: 'In Progress' },
};

const getStatus = (status: string) =>
    STATUS_CONFIG[status] ?? { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', icon: <AlertCircle size={12} />, label: status };

export const Bookings: React.FC<BookingsProps> = ({ onBack }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        api.fetchBookings().then(res => {
            if (res.success && res.data) setBookings(res.data);
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    const statuses = ['ALL', 'COMPLETED', 'CONFIRMED', 'PENDING', 'IN_PROGRESS', 'CANCELLED'];

    const filtered = bookings.filter(b => {
        const matchSearch = !search ||
            b.customerName?.toLowerCase().includes(search.toLowerCase()) ||
            b.serviceType?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // Stats
    const total = bookings.length;
    const completed = bookings.filter(b => b.status === 'COMPLETED').length;
    const pending = bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED').length;
    const revenue = bookings.filter(b => b.status === 'COMPLETED').reduce((s, b) => s + (b.amount || 0), 0);

    const openPayment = (booking: Booking) => {
        const realPayment = null;

        setSelectedPayment({
            id: realPayment?.id || `PAY-${booking.id}`,
            transactionId: realPayment?.transactionId || `TXN_BK_${booking.id}`,
            amount: booking.amount,
            status: realPayment?.status || (booking.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING'),
            method: realPayment?.method || 'UPI / Razorpay',
        createdAt: booking.date,
        serviceName: booking.serviceType,
        category: 'Home Service',
        location: booking.location,
        bookingDetails: booking.bookingDetails,
        customer: { name: booking.customerName, email: 'customer@evera.com', phone: '+91 9000000000' },
        vendor: { name: 'Verified Evera Partner', rating: 4.8, joinedDate: 'Jan 2023', totalJobs: 42, phone: '+91 8000000000' },
        platform_fee: 55,
        tax: Math.floor(booking.amount * 0.18),
        commission: Math.floor(booking.amount * 0.10),
        net_amount: Math.floor(booking.amount * 0.72),
        requestedAt: booking.date,
        acceptedAt: booking.date,
        settlement_time: booking.date,
        holding_status: 'ESCROW',
        bankDetails: {
            bank_name: 'HDFC Bank',
            account_no: 'XXXX-XXXX-9932',
            ifsc_code: 'HDFC0001234',
            holder_name: 'Verified Evera Partner'
        }
    });
    };

    if (selectedPayment) {
        return <PaymentDetailView payment={selectedPayment} onBack={() => setSelectedPayment(null)} />;
    }

    return (
        <div className="pb-20 animate-fade-in space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 rounded-xl bg-evera-card border border-evera-border text-evera-muted hover:text-white transition-all">
                        <Icons.ChevronDown className="rotate-90" size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-white">Service Bookings</h1>
                        <p className="text-xs text-evera-muted mt-0.5">{total} total bookings across all services</p>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Bookings', value: total, icon: <Briefcase size={18} />, color: 'text-evera-primary', bg: 'bg-evera-primary/10' },
                    { label: 'Completed',      value: completed, icon: <CheckCircle2 size={18} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Active / Pending', value: pending, icon: <Clock size={18} />,       color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { label: 'Revenue',        value: `₹${revenue.toLocaleString()}`, icon: <TrendingUp size={18} />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                ].map(stat => (
                    <div key={stat.label} className="bg-evera-card border border-evera-border rounded-2xl p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[10px] text-evera-muted uppercase tracking-wider font-bold">{stat.label}</p>
                            <p className="text-lg font-black text-white leading-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-evera-muted" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by customer or service..."
                        className="w-full bg-evera-card border border-evera-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-evera-muted focus:outline-none focus:border-evera-primary transition-all"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {statuses.map(s => {
                        const cfg = s === 'ALL' ? null : getStatus(s);
                        const active = statusFilter === s;
                        return (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider border transition-all ${
                                    active
                                        ? s === 'ALL'
                                            ? 'bg-evera-primary text-white border-evera-primary'
                                            : `${cfg?.bg} ${cfg?.color} ${cfg?.border}`
                                        : 'bg-evera-card border-evera-border text-evera-muted hover:text-white'
                                }`}
                            >
                                {s === 'ALL' ? 'All' : cfg?.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Bookings List */}
            {loading ? (
                <div className="space-y-3">
                    {[1,2,3].map(i => (
                        <div key={i} className="bg-evera-card border border-evera-border rounded-2xl p-5 animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white/5" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-white/5 rounded w-1/3" />
                                    <div className="h-2.5 bg-white/5 rounded w-1/2" />
                                </div>
                                <div className="h-3 bg-white/5 rounded w-16" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-evera-card border border-dashed border-evera-border rounded-2xl p-12 text-center">
                    <Briefcase size={36} className="mx-auto text-evera-muted opacity-40 mb-3" />
                    <p className="text-white font-bold mb-1">No bookings found</p>
                    <p className="text-evera-muted text-sm">Try adjusting your search or filter.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(booking => {
                        const cfg = getStatus(booking.status);
                        return (
                            <div
                                key={booking.id}
                                onClick={() => openPayment(booking)}
                                className="bg-evera-card border border-evera-border hover:border-evera-primary/40 rounded-2xl p-5 cursor-pointer group transition-all duration-200 hover:shadow-lg hover:shadow-black/20 active:scale-[0.99]"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-evera-primary/20 to-evera-primary/5 border border-evera-primary/20 flex items-center justify-center font-black text-evera-primary text-lg flex-shrink-0 group-hover:from-evera-primary/30 transition-all">
                                        {booking.customerName?.charAt(0) || '?'}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="text-white font-bold text-sm group-hover:text-evera-primary transition-colors truncate">
                                                {booking.customerName}
                                            </h4>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                                {cfg.icon}
                                                {cfg.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                                            <span className="text-evera-muted text-xs flex items-center gap-1">
                                                <Briefcase size={11} />
                                                {booking.serviceType}
                                            </span>
                                            <span className="text-evera-muted text-xs flex items-center gap-1">
                                                <Calendar size={11} />
                                                {booking.date}
                                            </span>
                                            {booking.location && (
                                                <span className="text-evera-muted text-xs flex items-center gap-1 max-w-[200px] truncate" title={booking.location}>
                                                    <MapPin size={11} className="flex-shrink-0" />
                                                    <span className="truncate">{booking.location}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Amount + Arrow */}
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-white font-black text-base">₹{booking.amount?.toLocaleString()}</p>
                                        <p className="text-evera-muted text-[10px] mt-0.5">Tap to view details</p>
                                    </div>
                                    <ChevronRight size={16} className="text-evera-muted group-hover:text-evera-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};