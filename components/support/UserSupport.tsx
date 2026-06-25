import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../ui/DataTable';
import { StatusBadge } from '../ui/StatusBadge';
import { SearchBar } from '../ui/SearchBar';
import { Icons } from '../ui/Icons';
import { fetchCustomers } from '../../api/service';
import {
    ShieldAlert, ShieldCheck, Mail, Calendar, CreditCard, ChevronRight,
    ChevronDown, User, Hash, Clock, Tag, Package, CheckCircle2, AlertCircle,
    Phone, MapPin, Ticket, Layers, Check
} from 'lucide-react';

interface Customer {
    id: string;
    name: string;
    email: string;
    status: 'ACTIVE' | 'SUSPENDED';
    createdAt: string;
    totalTickets: number;
    phone: string;
    location: string;
    lastActive: string;
    avatar?: string;
    aadhaarVerified?: boolean;
    rawCreatedAt?: Date | null;
}

export const UserSupport: React.FC<{ dateRangeLabel?: string; dateRangeValue?: string; onUserClick?: (id: string) => void }> = ({ dateRangeLabel = 'Last 7 Days', dateRangeValue, onUserClick }) => {
    const { bookings, addNotification, tickets, setTickets } = useApp();
    const [search, setSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [activeTab, setActiveTab] = useState<'tickets' | 'bookings'>('tickets');
    const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
    const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

    useEffect(() => {
        const loadCustomers = async () => {
            setIsLoadingCustomers(true);
            const res = await fetchCustomers();
            if (res.success && res.data) {
                // Map API response to UI Customer interface
                const mapped = res.data.map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    email: c.email,
                    status: c.status as 'ACTIVE' | 'SUSPENDED',
                    createdAt: c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A',
                    rawCreatedAt: c.created_at ? new Date(c.created_at) : null,
                    totalTickets: c.total_tickets || 0,
                    phone: c.phone || 'N/A',
                    location: c.location || 'N/A',
                    lastActive: 'Recently',
                    aadhaarVerified: c.aadhaar_verified
                }));
                setCustomers(mapped);
            } else {
                addNotification('Failed to load customers');
            }
            setIsLoadingCustomers(false);
        };
        loadCustomers();
    }, []);

    // Date filtering logic
    const filteredCustomers = customers.filter(c => {
        if (!c.rawCreatedAt || dateRangeLabel === 'Custom Range') return true;
        
        const now = new Date();
        const created = c.rawCreatedAt;
        
        // Reset times for accurate day comparison
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const itemDate = new Date(created.getFullYear(), created.getMonth(), created.getDate());
        
        if (dateRangeLabel === 'Today') {
            return itemDate.getTime() === today.getTime();
        } else if (dateRangeLabel === 'Yesterday') {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return itemDate.getTime() === yesterday.getTime();
        } else if (dateRangeLabel === 'Last 7 Days') {
            const lastWeek = new Date(today);
            lastWeek.setDate(lastWeek.getDate() - 7);
            return itemDate >= lastWeek;
        } else if (dateRangeLabel === 'Last 30 Days') {
            const lastMonth = new Date(today);
            lastMonth.setDate(lastMonth.getDate() - 30);
            return itemDate >= lastMonth;
        } else if (dateRangeLabel === 'This Month') {
            return itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
        }
        
        return true;
    }).filter(c => {
        if (!search) return true;
        const q = search.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.id.toString().includes(q);
    });

    // Tickets state
    const [customerTickets, setCustomerTickets] = useState<any[]>([]);

    const handleToggleStatus = (customerId: string) => {
        setCustomers(prev => prev.map(c => {
            if (c.id === customerId) {
                const nextStatus = c.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
                addNotification(`Customer ${c.name} is now ${nextStatus.toLowerCase()}`);
                if (selectedCustomer && selectedCustomer.id === customerId) {
                    setSelectedCustomer({ ...c, status: nextStatus });
                }
                return { ...c, status: nextStatus };
            }
            return c;
        }));
    };

    const columns: Column<Customer>[] = [
        {
            header: 'Customer',
            cell: (c) => (
                <div className="flex items-center space-x-3">
                    {c.avatar ? (
                        <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-xl object-cover shadow-sm border border-evera-border" />
                    ) : (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold shadow-sm">
                            {c.name.charAt(0)}
                        </div>
                    )}
                    <div>
                        <div className="font-bold text-white text-sm">{c.name}</div>
                        <div className="text-xs text-evera-muted">{c.email}</div>
                    </div>
                </div>
            )
        },
        { header: 'Status', accessorKey: 'status', cell: (c) => <StatusBadge status={c.status} /> },
        { header: 'Joined Date', accessorKey: 'createdAt', className: 'text-xs text-gray-300' },
        { header: 'Submitted Tickets', accessorKey: 'totalTickets', className: 'text-center font-bold' },
        {
            header: 'Actions',
            cell: (c) => (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { setSelectedCustomer(c); setExpandedTicketId(null); setExpandedBookingId(null); }}
                        className="text-xs text-[#f48c25] hover:underline font-bold"
                    >
                        View Profile
                    </button>
                    <span className="text-[#38302C]">|</span>
                    <button
                        onClick={() => handleToggleStatus(c.id)}
                        className={`text-xs font-semibold hover:underline ${
                            c.status === 'ACTIVE' ? 'text-red-400' : 'text-green-400'
                        }`}
                    >
                        {c.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                </div>
            )
        }
    ];



    const handleResolveTicket = (ticketId: string) => {
        setTickets(prev => prev.map(t => 
            t.id === ticketId 
                ? { ...t, status: 'RESOLVED', resolutionNotes: 'Resolved by support admin.', updatedAt: new Date().toISOString() } 
                : t
        ));
        addNotification(`Ticket marked as resolved`);
        setExpandedTicketId(null);
    };

    // If customer details are selected, render customer profile dashboard view
    if (selectedCustomer) {
        const customerBookings = bookings.filter(b =>
            b.customerName.toLowerCase() === selectedCustomer.name.toLowerCase()
        );

        const allTickets = tickets.filter(t => t.customerName?.toLowerCase() === selectedCustomer.name.toLowerCase());

        const activeTicketsList = allTickets.filter(t => t.status !== 'RESOLVED');
        const resolvedTicketsList = allTickets.filter(t => t.status === 'RESOLVED');

        const getPriorityStyle = (p: string) => {
            if (p === 'URGENT') return 'bg-red-500/10 border-red-500/30 text-red-400';
            if (p === 'HIGH') return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
            if (p === 'MEDIUM') return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
            return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
        };

        const getStatusColor = (s: string) => {
            if (s === 'COMPLETED' || s === 'CONFIRMED') return 'bg-green-500/10 border-green-500/30 text-green-400';
            if (s === 'CANCELLED') return 'bg-red-500/10 border-red-500/30 text-red-400';
            if (s === 'IN_PROGRESS') return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
            return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
        };

        const getMockTimeline = (status: string, provider: string) => {
            const steps = [
                { label: 'Booking Placed', time: '10:00 AM', completed: true, desc: 'Customer completed payment and requested service.' },
                { label: 'Vendor Accepted', time: '10:15 AM', completed: true, desc: `Assigned to ${provider || 'Partner Network'}.` },
                { label: 'En Route', time: '08:30 AM', completed: status === 'IN_PROGRESS' || status === 'COMPLETED', desc: 'Provider is on the way to the location.' },
                { label: 'Work Started', time: '09:00 AM', completed: status === 'IN_PROGRESS' || status === 'COMPLETED', desc: 'Service has officially begun.' },
                { label: 'Completed', time: '11:00 AM', completed: status === 'COMPLETED', desc: 'Service finished and payment finalized.' }
            ];
            
            if (status === 'CANCELLED') {
                return [
                    { label: 'Booking Placed', time: '10:00 AM', completed: true, desc: 'Customer completed payment and requested service.' },
                    { label: 'Cancelled', time: '11:30 AM', completed: true, desc: 'Booking was cancelled.' }
                ];
            }
            
            if (status === 'CONFIRMED') {
                return [
                    { label: 'Booking Placed', time: '10:00 AM', completed: true, desc: 'Customer completed payment and requested service.' },
                    { label: 'Vendor Accepted', time: '10:15 AM', completed: true, desc: `Assigned to ${provider || 'Partner Network'}.` },
                    { label: 'Pending Dispatch', time: '—', completed: false, desc: 'Awaiting provider to head to location.' }
                ];
            }
            
            return steps;
        };

        const renderTicketCard = (t: any) => {
            const isOpen = expandedTicketId === t.id;
            return (
                <div key={t.id} className={`card border transition-all duration-200 ${isOpen ? 'bg-[#1a1210] border-[#f48c25]/30' : 'bg-evera-card border-evera-border hover:border-evera-primary/30'} ${t.status === 'RESOLVED' ? 'opacity-80' : ''}`}>
                    {/* Ticket Header — always visible */}
                    <div
                        className="p-4 flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedTicketId(isOpen ? null : t.id)}
                    >
                        <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[10px] text-[#f48c25] bg-[#f48c25]/10 border border-[#f48c25]/20 px-2 py-0.5 rounded font-bold">{t.ticketNumber}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityStyle(t.priority)}`}>{t.priority}</span>
                                <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock size={9} />{t.createdAt?.split('T')[0]}</span>
                            </div>
                            <p className={`text-sm font-bold mt-1 truncate ${t.status === 'RESOLVED' ? 'text-gray-300 line-through decoration-gray-500' : 'text-white'}`}>{t.subject}</p>
                            <p className="text-[10px] text-[#A8A29E]">{t.category}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                            <StatusBadge status={t.status} />
                            {isOpen ? <ChevronDown size={16} className="text-[#f48c25]" /> : <ChevronRight size={16} className="text-gray-500" />}
                        </div>
                    </div>

                    {/* Expanded Ticket Details */}
                    {isOpen && (
                        <div className="border-t border-[#38302C]/50 px-4 pb-4 pt-3 space-y-4 animate-fade-in">
                            {/* Description */}
                            <div className="bg-[#161210] border border-[#38302C] rounded-xl p-3">
                                <p className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider mb-1.5">Issue Description</p>
                                <p className="text-xs text-gray-300 leading-relaxed">{t.description}</p>
                            </div>

                            {/* Detail Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Ticket ID', value: t.id, icon: <Hash size={10} /> },
                                    { label: 'Category', value: t.category, icon: <Tag size={10} /> },
                                    { label: 'Assigned To', value: t.assignedToName || 'Unassigned', icon: <User size={10} /> },
                                    { label: 'Last Updated', value: new Date(t.updatedAt).toLocaleDateString(), icon: <Clock size={10} /> },
                                    { label: 'Status', value: t.status.replace(/_/g, ' '), icon: <AlertCircle size={10} /> },
                                    { label: 'Priority', value: t.priority, icon: <ShieldAlert size={10} /> },
                                ].map(({ label, value, icon }) => (
                                    <div key={label} className="bg-[#161210] border border-[#38302C]/60 rounded-lg p-2.5">
                                        <p className="text-[9px] text-[#A8A29E] font-bold uppercase tracking-wider flex items-center gap-1 mb-1">{icon}{label}</p>
                                        <p className="text-xs text-white font-bold">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Resolution */}
                            <div className={`rounded-xl p-3 border ${t.resolutionNotes ? 'bg-green-500/5 border-green-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                                <p className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mb-1 ${t.resolutionNotes ? 'text-green-400' : 'text-amber-400'}`}>
                                    {t.resolutionNotes ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                                    <span>
                                        {t.resolutionNotes ? 'Resolution' : 'Pending Resolution'}
                                    </span>
                                </p>
                                <p className="text-xs text-gray-300">{t.resolutionNotes || 'This ticket is currently being investigated by the assigned support agent.'}</p>
                            </div>

                            {/* Resolve Action */}
                            {t.status !== 'RESOLVED' && (
                                <div className="pt-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleResolveTicket(t.id); }}
                                        className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 w-full transition-all shadow-md shadow-green-900/20"
                                    >
                                        <Check size={14} strokeWidth={3} /> Mark as Resolved
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        };

        return (
            <div className="space-y-6 animate-fade-in pb-12">
                {/* Back Header */}
                <div className="flex items-center gap-3 border-b border-evera-border pb-4">
                    <button
                        onClick={() => setSelectedCustomer(null)}
                        className="p-2 bg-[#241E1B] hover:bg-[#38302C] border border-evera-border text-white rounded-xl transition-all"
                    >
                        <Icons.ChevronDown className="rotate-90" size={16} />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-white">Customer Support Profile</h2>
                        <p className="text-xs text-[#A8A29E]">History, compliance metrics, and active assistance requests.</p>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Left Panel */}
                    <div className="col-span-12 lg:col-span-4 space-y-4">
                        {/* Profile Card */}
                        <div className="card bg-evera-card border-evera-border p-6 text-center space-y-4">
                            {selectedCustomer.avatar ? (
                                <img src={selectedCustomer.avatar} alt={selectedCustomer.name} className="w-20 h-20 rounded-2xl object-cover mx-auto shadow-lg border border-evera-border" />
                            ) : (
                                <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-950/20 mx-auto">
                                    {selectedCustomer.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-black text-white">{selectedCustomer.name}</h3>
                                <p className="text-xs text-evera-muted flex items-center justify-center gap-1.5 mt-1">
                                    <Mail size={12} />
                                    <span>{selectedCustomer.email}</span>
                                </p>
                            </div>
                            <div className="flex justify-center">
                                <StatusBadge status={selectedCustomer.status} />
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 border-y border-[#38302C] py-4">
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Total Tickets</p>
                                    <p className="text-white font-black text-xl mt-0.5">{selectedCustomer.totalTickets}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Total Bookings</p>
                                    <p className="text-white font-black text-xl mt-0.5">{customerBookings.length}</p>
                                </div>
                            </div>

                            {/* Account Details */}
                            <div className="space-y-2 text-xs text-left">
                                <div className="flex justify-between items-center py-1.5 border-b border-[#38302C]/40">
                                    <span className="text-[#A8A29E] flex items-center gap-1"><Hash size={10} /> Customer ID</span>
                                    <span className="font-mono text-white font-bold">{selectedCustomer.id.toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-[#38302C]/40">
                                    <span className="text-[#A8A29E] flex items-center gap-1"><Phone size={10} /> Phone</span>
                                    <span className="text-white font-bold">{selectedCustomer.phone}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-[#38302C]/40">
                                    <span className="text-[#A8A29E] flex items-center gap-1"><MapPin size={10} /> Location</span>
                                    <span className="text-white font-bold">{selectedCustomer.location}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-[#38302C]/40">
                                    <span className="text-[#A8A29E] flex items-center gap-1"><Clock size={10} /> Last Active</span>
                                    <span className="text-white font-bold">{selectedCustomer.lastActive}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-[#38302C]/40">
                                    <span className="text-[#A8A29E] flex items-center gap-1"><Calendar size={10} /> Joined</span>
                                    <span className="text-white font-bold">{selectedCustomer.createdAt}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-[#38302C]/40">
                                    <span className="text-[#A8A29E] flex items-center gap-1"><User size={10} /> Account Type</span>
                                    <span className="text-white font-bold">Standard</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-[#38302C]/40">
                                    <span className="text-[#A8A29E] flex items-center gap-1"><ShieldCheck size={10} /> Identity</span>
                                    {selectedCustomer.aadhaarVerified ? (
                                        <span className="text-green-400 font-bold text-[10px] flex items-center gap-1"><CheckCircle2 size={10} /> AADHAAR VERIFIED</span>
                                    ) : (
                                        <span className="text-red-400 font-bold text-[10px] flex items-center gap-1"><AlertCircle size={10} /> UNVERIFIED</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Support Flags */}
                        <div className="card bg-evera-card border-evera-border p-5 space-y-3">
                            <h4 className="font-bold text-white text-xs border-b border-[#38302C] pb-2 uppercase tracking-wider">Support Flags</h4>
                            {allTickets.length === 0 ? (
                                <p className="text-[11px] text-[#A8A29E] italic">No flags recorded.</p>
                            ) : (
                                <div className="space-y-3">
                                    {allTickets.map(t => (
                                        <div key={t.id} className="flex items-start gap-2.5 text-xs">
                                            <div className={`p-1.5 rounded flex-shrink-0 ${t.priority === 'URGENT' ? 'bg-red-500/10 text-red-400' : 'bg-[#facc15]/10 text-[#facc15]'}`}>
                                                <ShieldAlert size={12} />
                                            </div>
                                            <div>
                                                <p className="text-white font-bold leading-tight">{t.subject}</p>
                                                <p className="text-gray-400 text-[10px] mt-0.5">{t.category} · {t.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="col-span-12 lg:col-span-8 space-y-4">
                        {/* Tabs */}
                        <div className="flex border-b border-[#38302C] gap-6">
                            <button
                                onClick={() => { setActiveTab('tickets'); setExpandedTicketId(null); }}
                                className={`pb-3 text-sm font-bold transition-all relative ${
                                    activeTab === 'tickets' ? 'text-[#f48c25]' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                Active Tickets ({allTickets.length})
                                {activeTab === 'tickets' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f48c25]" />}
                            </button>
                            <button
                                onClick={() => { setActiveTab('bookings'); setExpandedBookingId(null); }}
                                className={`pb-3 text-sm font-bold transition-all relative ${
                                    activeTab === 'bookings' ? 'text-[#f48c25]' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                Booking History ({customerBookings.length})
                                {activeTab === 'bookings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f48c25]" />}
                            </button>
                        </div>

                        {/* ── TICKETS TAB ── */}
                        {activeTab === 'tickets' ? (
                            <div className="space-y-6">
                                {/* Active Tickets Section */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wider border-b border-[#38302C] pb-2">Active Tickets</h4>
                                    {activeTicketsList.length === 0 ? (
                                        <div className="text-center py-6 text-xs text-evera-muted card border-[#38302C]/50 bg-[#241E1B]/30 border-dashed">
                                            No active tickets found.
                                        </div>
                                    ) : (
                                        activeTicketsList.map(renderTicketCard)
                                    )}
                                </div>
                                
                                {/* Resolved Tickets Section */}
                                <div className="space-y-3 pt-2">
                                    <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider border-b border-[#38302C] pb-2">Resolved Tickets</h4>
                                    {resolvedTicketsList.length === 0 ? (
                                        <div className="text-center py-6 text-xs text-evera-muted card border-[#38302C]/50 bg-[#241E1B]/30 border-dashed">
                                            No resolved tickets.
                                        </div>
                                    ) : (
                                        resolvedTicketsList.map(renderTicketCard)
                                    )}
                                </div>
                            </div>
                        ) : (
                            // ── BOOKINGS TAB ──
                            <div className="space-y-3">
                                {customerBookings.length === 0 ? (
                                    <div className="text-center py-12 text-xs text-evera-muted card border-[#38302C]/50 bg-[#241E1B]/30 border-dashed">
                                        No booking transactions found for this customer.
                                    </div>
                                ) : (
                                    customerBookings.map((b, idx) => {
                                        const bookingKey = b.id || String(idx);
                                        const isOpen = expandedBookingId === bookingKey;
                                        return (
                                            <div key={bookingKey} className={`card border transition-all duration-200 ${isOpen ? 'bg-[#1a1210] border-[#f48c25]/30' : 'bg-evera-card border-evera-border hover:border-evera-primary/30'}`}>
                                                {/* Booking Header */}
                                                <div
                                                    className="p-4 flex items-center justify-between cursor-pointer"
                                                    onClick={() => setExpandedBookingId(isOpen ? null : bookingKey)}
                                                >
                                                    <div className="space-y-1 flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-[10px] text-white font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded uppercase">
                                                                {b.service || b.serviceType || 'Service'}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                                <Calendar size={9} />{b.date}{b.time ? ` at ${b.time}` : ''}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-bold text-white mt-1">
                                                            {b.provider ? `Provider: ${b.provider}` : b.vendorId ? `Vendor: ${b.vendorId}` : 'Service Booking'}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                                                        <div className="text-right">
                                                            <p className="text-sm font-black text-white">${b.amount}</p>
                                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border mt-0.5 inline-block ${getStatusColor(b.status)}`}>
                                                                {b.status}
                                                            </span>
                                                        </div>
                                                        {isOpen ? <ChevronDown size={16} className="text-[#f48c25]" /> : <ChevronRight size={16} className="text-gray-500" />}
                                                    </div>
                                                </div>

                                                {/* Expanded Booking Details */}
                                                {isOpen && (
                                                    <div className="border-t border-[#38302C]/50 px-4 pb-4 pt-3 space-y-4 animate-fade-in">
                                                        {/* Full Detail Grid */}
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {[
                                                                { label: 'Booking ID', value: b.id || `BK-${idx + 1}`, icon: <Hash size={10} /> },
                                                                { label: 'Service', value: b.service || b.serviceType || '—', icon: <Package size={10} /> },
                                                                { label: 'Booking Date', value: b.date, icon: <Calendar size={10} /> },
                                                                { label: 'Booking Time', value: b.time || '—', icon: <Clock size={10} /> },
                                                                { label: 'Provider', value: b.provider || '—', icon: <User size={10} /> },
                                                                { label: 'Vendor ID', value: b.vendorId || '—', icon: <Layers size={10} /> },
                                                                { label: 'Amount Paid', value: `$${b.amount}`, icon: <CreditCard size={10} /> },
                                                                { label: 'Payment Status', value: b.status, icon: <CheckCircle2 size={10} /> },
                                                                { label: 'Customer Name', value: b.customerName, icon: <User size={10} /> },
                                                            ].map(({ label, value, icon }) => (
                                                                <div key={label} className="bg-[#161210] border border-[#38302C]/60 rounded-lg p-2.5">
                                                                    <p className="text-[9px] text-[#A8A29E] font-bold uppercase tracking-wider flex items-center gap-1 mb-1">{icon}{label}</p>
                                                                    <p className="text-xs text-white font-bold">{value}</p>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Status Banner */}
                                                        <div className={`rounded-xl p-3 border ${getStatusColor(b.status)}`}>
                                                            <p className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                                {b.status === 'COMPLETED' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                                                Booking Status: {b.status}
                                                            </p>
                                                            <p className="text-[11px] mt-1 opacity-80">
                                                                {b.status === 'COMPLETED' ? 'This booking has been completed successfully.' :
                                                                 b.status === 'CANCELLED' ? 'This booking was cancelled. Refund may apply.' :
                                                                 b.status === 'CONFIRMED' ? 'Booking confirmed and awaiting service delivery.' :
                                                                 'Booking is currently in progress.'}
                                                            </p>
                                                        </div>

                                                        {/* Booking Timeline */}
                                                        <div className="bg-[#161210] border border-[#38302C] rounded-xl p-4 mt-4">
                                                            <p className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider mb-4">Service Timeline</p>
                                                            <div className="space-y-0">
                                                                {getMockTimeline(b.status, b.provider || 'System').map((step, i, arr) => (
                                                                    <div key={i} className="flex gap-3">
                                                                        <div className="flex flex-col items-center">
                                                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 z-10 ${step.completed ? 'bg-green-500 border-green-500 text-[#1a1210]' : 'bg-[#1a1210] border-[#38302C]'}`}>
                                                                                {step.completed && <Check size={12} className="text-[#1a1210] stroke-[3]" />}
                                                                            </div>
                                                                            {i !== arr.length - 1 && <div className={`w-0.5 h-full min-h-[30px] my-1 rounded-full ${step.completed ? 'bg-green-500/40' : 'bg-[#38302C]'}`}></div>}
                                                                        </div>
                                                                        <div className="pb-4 pt-0.5">
                                                                            <p className={`text-xs font-bold ${step.completed ? 'text-white' : 'text-gray-500'}`}>{step.label}</p>
                                                                            <p className={`text-[10px] mt-0.5 ${step.completed ? 'text-[#A8A29E]' : 'text-gray-600'}`}>
                                                                                {step.time !== '—' ? `${step.time} · ` : ''}{step.desc}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Customer Support Accounts</h2>
                    <p className="text-xs text-[#A8A29E]">Browse profiles, view ticket history and logs, review booking records, or moderate accounts.</p>
                </div>
                <div className="w-full sm:w-80">
                    <SearchBar value={search} onChange={setSearch} placeholder="Search customer name or email..." />
                </div>
            </div>

            <div className="card bg-evera-card border-evera-border p-1">
                <DataTable
                    columns={columns}
                    data={filteredCustomers}
                />
            </div>
        </div>
    );
};
