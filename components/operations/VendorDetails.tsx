import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../ui/Icons';
import { ChevronDown, ChevronRight, Clock, Hash, Tag, User, AlertCircle, ShieldAlert, CheckCircle2, Star } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { DataTable, Column } from '../ui/DataTable';
import { useApp } from '../../context/AppContext';
import * as api from '../../api/service';
import { BASE_HOST } from '../../api/service';
import { PaymentDetailView } from '../finance/PaymentDetailView';

interface VendorDetailsProps {
    vendorId: number | null;
    onBack: () => void;
}

export const VendorDetails: React.FC<VendorDetailsProps> = ({ vendorId, onBack }) => {
    const { addNotification, updateWorkerStatusLocal, verifyWorkerDocsLocal, adminUser, workers } = useApp();
    const isSupportRole = adminUser?.role === 'SUPPORT_ADMIN' || adminUser?.role === 'SUPPORT_WORKER';
    const isOpsWorker = ['OPERATIONS_WORKER', 'OPERATIONS_ADMIN', 'SUPER_ADMIN'].includes(adminUser?.role);
    const canVerifyDocs = ['SUPER_ADMIN', 'OPERATIONS_ADMIN', 'OPERATIONS_WORKER'].includes(adminUser?.role);
    const canApproveAccount = ['SUPER_ADMIN', 'OPERATIONS_ADMIN', 'OPERATIONS_WORKER'].includes(adminUser?.role);
    const canRejectAccount = ['SUPER_ADMIN', 'OPERATIONS_ADMIN', 'OPERATIONS_WORKER'].includes(adminUser?.role);
    const canSuspendHold = ['SUPER_ADMIN', 'OPERATIONS_ADMIN', 'OPERATIONS_WORKER'].includes(adminUser?.role);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [selectedDocument, setSelectedDocument] = useState<any>(null);
    const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [docStatuses, setDocStatuses] = useState<Record<string, 'APPROVED' | 'REUPLOAD_REQUESTED'>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (vendorId) {
            loadProfile();
        }
    }, [vendorId]);

    const loadProfile = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.fetchFullProfile(vendorId!);
            if (res.success) {
                const localWorker = workers.find(w => w.id === vendorId?.toString());
                if (localWorker?.documentsVerified) {
                    res.data.documentsVerified = true;
                }
                setProfile(res.data);
                setEditForm(res.data);
                
                // Initialize doc statuses from backend
                const statuses: Record<string, 'APPROVED' | 'REUPLOAD_REQUESTED'> = {};
                const allDocs = [...(res.data.businessDocuments || []), ...(res.data.certificates || [])];
                allDocs.forEach((doc: any) => {
                    if (doc.status === 'APPROVED' || doc.status === 'REUPLOAD_REQUESTED') {
                        statuses[doc.title] = doc.status;
                    }
                });
                setDocStatuses(statuses);
            } else {
                setError(res.error || 'Failed to load profile');
            }
        } catch (e) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        setActionLoading(newStatus);
        try {
            const res = await api.updateWorkerStatus(profile.id.toString(), newStatus);
            if (res.success) {
                setProfile((prev: any) => ({ ...prev, status: newStatus }));
                updateWorkerStatusLocal(profile.id.toString(), newStatus);
                addNotification(`Vendor status updated to ${newStatus}`);
            } else {
                addNotification(`Failed to update status`);
            }
        } catch (e) {
            addNotification(`Failed to update status`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleApproveService = async (serviceId: string) => {
        setActionLoading(`service-${serviceId}`);
        try {
            // Removed delay
            setProfile((prev: any) => ({
                ...prev,
                service_catalog: prev.service_catalog.map((s: any) => 
                    s.id === serviceId ? { ...s, status: 'ACTIVE' } : s
                )
            }));
            addNotification(`Service has been approved and is now live`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleSaveEdit = async () => {
        setIsSaving(true);
        try {
            // we will submit only the subset of fields we are editing for safety
            const updates = {
                name: editForm.name || profile.name,
                email: editForm.email || profile.email,
                phone: editForm.phone || profile.phone,
                description: editForm.businessDescription || profile.businessDescription,
                category: editForm.category || profile.category,
                radius: editForm.serviceRadius || profile.serviceRadius,
                upi_id: editForm.upiId || profile.upiId,
                address: editForm.address || profile.address,
                gst_number: editForm.gstNumber || profile.gstNumber,
                pan_number: editForm.panNumber || profile.panNumber,
                bank_account: editForm.bankAccount ?? profile.payments?.bankDetails?.accountNumber,
                bank_ifsc: editForm.bankIfsc ?? profile.payments?.bankDetails?.ifsc,
                bank_name: editForm.bankName ?? profile.payments?.bankDetails?.bankName,
            };
            const res = await api.updateVendor(profile.id, updates);
            if (res.success) {
                setProfile({ ...profile, ...editForm });
                setIsEditing(false);
                addNotification('Vendor details updated successfully');
            } else {
                addNotification(res.error || 'Failed to update vendor');
            }
        } catch (e: any) {
            addNotification(e.message || 'Error saving details');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 animate-pulse">
                <div className="w-12 h-12 border-4 border-evera-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-evera-muted">Fetching full vendor profile...</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="bg-evera-card p-8 rounded-2xl border border-evera-border text-center space-y-4">
                <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center text-red-500 mx-auto">
                    <Icons.Reject size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">{error || 'Vendor Not Found'}</h3>
                <button 
                    onClick={onBack}
                    className="px-6 py-2 bg-evera-primary text-white rounded-lg hover:bg-evera-primary/80 transition-colors"
                >
                    Return to List
                </button>
            </div>
        );
    }

    const bookingColumns: Column<any>[] = [
        { header: 'ID', accessorKey: 'id' },
        { 
            header: 'Customer', 
            accessorKey: 'customerName',
            cell: (row) => (
                <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-evera-primary/20 flex items-center justify-center text-[10px] font-bold text-evera-primary">
                        {row.customerName?.[0]}
                    </div>
                    <span className="font-medium text-white">{row.customerName}</span>
                </div>
            )
        },
        { header: 'Date', accessorKey: 'date' },
        { 
            header: 'Status', 
            accessorKey: 'status',
            cell: (row) => <StatusBadge status={row.status} />
        },
        { 
            header: 'Amount', 
            accessorKey: 'amount',
            cell: (row) => `₹${row.amount?.toLocaleString()}`
        },
        {
            header: 'Action',
            cell: (row) => (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChat(row);
                    }}
                    className="p-1.5 hover:bg-evera-primary/10 rounded-lg text-evera-primary transition-colors flex items-center space-x-1"
                >
                    <Icons.Chat size={14} />
                    <span className="text-[10px] font-bold">CHAT</span>
                </button>
            )
        }
    ];

    const paymentColumns: Column<any>[] = [
        { header: 'Transaction ID', accessorKey: 'id' },
        { header: 'Date', accessorKey: 'date' },
        { header: 'Method', accessorKey: 'method' },
        { 
            header: 'Amount', 
            accessorKey: 'amount',
            cell: (row) => `₹${row.amount?.toLocaleString()}`
        },
        { 
            header: 'Status', 
            accessorKey: 'status',
            cell: (row) => <StatusBadge status={row.status} />
        },
    ];

    const getPriorityStyle = (p: string) => {
        if (p === 'URGENT') return 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse';
        if (p === 'HIGH') return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
        if (p === 'MEDIUM') return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
        return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    };

    const renderTicketCard = (t: any) => {
        const isOpen = expandedTicketId === t.id;
        return (
            <div key={t.id} className={`card border transition-all duration-200 ${isOpen ? 'bg-[#1a1210] border-[#f48c25]/30' : 'bg-evera-card border-evera-border hover:border-evera-primary/30'} ${t.status === 'RESOLVED' ? 'opacity-80' : ''}`}>
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
                        <p className={`text-sm font-bold mt-1 truncate ${t.status === 'RESOLVED' ? 'text-gray-300' : 'text-white'}`}>{t.subject}</p>
                        <p className="text-[10px] text-[#A8A29E]">{t.category}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                        <StatusBadge status={t.status} />
                        {isOpen ? <ChevronDown size={16} className="text-[#f48c25]" /> : <ChevronRight size={16} className="text-gray-500" />}
                    </div>
                </div>

                {isOpen && (
                    <div className="border-t border-[#38302C]/50 px-4 pb-4 pt-3 space-y-4 animate-fade-in">
                        <div className="bg-[#161210] border border-[#38302C] rounded-xl p-3">
                            <p className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider mb-1.5">Issue Description</p>
                            <p className="text-xs text-gray-300 leading-relaxed">{t.description}</p>
                        </div>

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
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="pb-20">
            {selectedPayment ? (
                <PaymentDetailView 
                    payment={{
                        ...selectedPayment,
                        transactionId: selectedPayment.id,
                        createdAt: selectedPayment.date,
                        serviceName: 'Vendor Service Payout',
                        category: profile.category,
                        vendor: {
                            name: profile.name,
                            email: profile.email,
                            phone: profile.phone,
                            rating: profile.rating,
                            joinedDate: profile.joinedDate || 'Jan 2023',
                            totalJobs: profile.bookings?.length || 0
                        },
                        customer: selectedPayment.customer || { name: 'Evera User', email: 'user@evera.com', phone: '+91 9988776655' },
                        bankDetails: profile.payments?.bankDetails,
                        platform_fee: selectedPayment.platform_fee || 45,
                        tax: selectedPayment.tax || 120,
                        commission: selectedPayment.commission || 80,
                        net_amount: selectedPayment.net_amount || (selectedPayment.amount - 245),
                        requestedAt: selectedPayment.date,
                        acceptedAt: selectedPayment.date,
                        settlement_time: selectedPayment.date,
                        holding_status: 'SETTLED'
                    }}
                    onBack={() => setSelectedPayment(null)}
                />
            ) : (
                <div className="space-y-8 animate-fade-in">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={onBack}
                                className="p-2 bg-evera-card border border-evera-border rounded-xl hover:border-evera-primary/50 transition-colors"
                            >
                                <Icons.ChevronDown className="rotate-90 text-evera-muted" size={20} />
                            </button>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Vendor Profile</h2>
                                <p className="text-evera-muted text-sm">Detailed profile for {profile.name}</p>
                            </div>
                        </div>
                        {!isSupportRole && (
                            <div className="flex space-x-3 items-center">
                                {isEditing ? (
                                    <>
                                        <button 
                                            onClick={() => { setIsEditing(false); setEditForm(profile); }}
                                            className="px-4 py-2 border border-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
                                            disabled={isSaving}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleSaveEdit}
                                            className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center"
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 border border-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
                                    >
                                        <Icons.Settings size={14} /> Edit Profile
                                    </button>
                                )}
                                
                                {profile.status === 'PENDING_APPROVAL' ? (
                                    <>
                                        {canRejectAccount && (
                                            <button 
                                                onClick={() => handleUpdateStatus('REJECTED')}
                                                className="px-4 py-2 bg-white/[0.02] border border-red-500/30 text-red-500 rounded-xl text-sm font-medium hover:bg-red-500/10 transition-colors"
                                            >
                                                Reject Application
                                            </button>
                                        )}
                                        {isOpsWorker ? (
                                            <button 
                                                onClick={async () => {
                                                    try {
                                                        const res = await api.verifyVendorDocs(profile.id.toString());
                                                        if (res.success) {
                                                            setProfile(prev => ({ ...prev, documentsVerified: true }));
                                                            addNotification('Documents verified and admin notified');
                                                        } else {
                                                            addNotification('Failed to verify documents');
                                                        }
                                                    } catch (e) {
                                                        console.error(e);
                                                    }
                                                }}
                                                disabled={profile.documentsVerified}
                                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                                    profile.documentsVerified 
                                                        ? 'bg-green-500/20 text-green-500 border border-green-500/50 cursor-not-allowed' 
                                                        : 'bg-evera-primary/20 text-evera-primary border border-evera-primary/50 hover:bg-evera-primary/30'
                                                }`}
                                            >
                                                {profile.documentsVerified ? 'Documents Verified' : 'Verify Docs & Notify Admin'}
                                            </button>
                                        ) : canApproveAccount && (
                                            <div className="flex items-center gap-3">
                                                {profile.documentsVerified && (
                                                    <span className="flex items-center text-xs font-bold text-green-500 bg-green-500/10 border border-green-500/30 px-3 py-1.5 rounded-xl">
                                                        <Icons.Check className="mr-1.5" size={14} /> Docs Verified
                                                    </span>
                                                )}
                                                <button 
                                                    onClick={() => setShowApprovalModal(true)}
                                                    className="px-4 py-2 bg-evera-primary text-white rounded-xl text-sm font-medium shadow-lg shadow-evera-primary/20 hover:bg-evera-primary/80 transition-colors"
                                                >
                                                    Approve & Onboard
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : profile.status === 'ACTIVE' ? (
                                    canSuspendHold && (
                                        <button 
                                            onClick={() => handleUpdateStatus('SUSPENDED')}
                                            className="px-4 py-2 bg-white/[0.02] border border-red-500/30 text-red-500 rounded-xl text-sm font-medium hover:bg-red-500/10 transition-colors"
                                        >
                                            Suspend Account
                                        </button>
                                    )
                                ) : (
                                    canSuspendHold ? (
                                        <button 
                                            onClick={() => handleUpdateStatus('ACTIVE')}
                                            className="px-4 py-2 bg-evera-primary text-white rounded-xl text-sm font-medium hover:bg-evera-primary/80 transition-colors"
                                        >
                                            Restore Account
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => addNotification(`Escalation ticket created for Super Admin to review ${profile.name}'s account restoration.`)}
                                            className="px-4 py-2 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-xl text-sm font-medium hover:bg-orange-500/20 transition-colors flex items-center"
                                            title="Pass this restoration request to the Super Admin"
                                        >
                                            <Icons.TrendUp size={16} className="mr-2" />
                                            Pass to Super Admin
                                        </button>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Profile Card */}
                        <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-8 self-start">
                            <div className="bg-evera-card border border-evera-border rounded-2xl overflow-hidden shadow-sm">
                                <div className="h-24 bg-gradient-to-r from-evera-primary/20 to-blue-500/20"></div>
                                <div className="px-6 pb-6 relative">
                                    <div className="absolute -top-12 left-6">
                                        <img 
                                            src={profile.image || `https://ui-avatars.com/api/?name=${profile.name}`} 
                                            className="w-24 h-24 rounded-2xl border-4 border-evera-card object-cover bg-gray-800 shadow-xl"
                                            alt={profile.name}
                                        />
                                    </div>
                                    <div className="pt-16">
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                <input className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Name" />
                                                <input className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm" value={editForm.category || ''} onChange={e => setEditForm({...editForm, category: e.target.value})} placeholder="Category" />
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="text-xl font-bold text-white">{profile.name}</h3>
                                                <p className="text-evera-primary font-medium text-sm">{profile.category}</p>
                                            </>
                                        )}
                                        
                                        <div className="mt-6 space-y-4">
                                            <div className="flex items-center text-sm">
                                                <Icons.Mail className="text-evera-muted mr-3" size={16} />
                                                {isEditing ? (
                                                    <input className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-white" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})} placeholder="Email Address" />
                                                ) : (
                                                    <span className="text-gray-300">{profile.email && !profile.email.endsWith('@example.com') ? profile.email : 'Email not provided'}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <Icons.Phone className="text-evera-muted mr-3" size={16} />
                                                {isEditing ? (
                                                    <input className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-white" value={editForm.phone || ''} onChange={e => setEditForm({...editForm, phone: e.target.value})} placeholder="Phone Number" />
                                                ) : (
                                                    <span className="text-gray-300">{profile.phone || 'Phone not provided'}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-evera-border flex justify-between">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-evera-muted tracking-widest mb-1">Email</p>
                                                <div className="flex items-center gap-2">
                                                    <Icons.Mail size={14} className="text-evera-muted" />
                                                    <span className="text-sm font-medium">{profile.email && !profile.email.endsWith('@example.com') ? profile.email : 'Not Provided'}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-evera-muted tracking-widest mb-1">Status</p>
                                                <StatusBadge status={profile.status || 'ACTIVE'} />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase font-bold text-evera-muted tracking-widest mb-1">Rating</p>
                                                <div className="flex items-center text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/20 w-fit">
                                                    {profile.reviews === 0 ? (
                                                        <span className="font-bold mr-1 text-[11px] tracking-wider uppercase text-amber-500">NEW</span>
                                                    ) : (
                                                        <>
                                                            <span className="font-bold mr-1">{profile.rating}</span>
                                                            <Star size={12} className="fill-amber-400" />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Registered Amenities */}
                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-white/10 transition-colors mt-6 mb-6">
                                {/* Decorative background */}
                                <div className="absolute bottom-0 right-0 -mr-16 -mb-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>
                                
                                <div className="flex justify-between items-start mb-6 relative">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">Vendor Amenities</h3>
                                        <p className="text-xs text-evera-muted font-medium">Features & facilities provided</p>
                                    </div>
                                    <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                                        <Icons.CheckCircle2 size={20} className="text-emerald-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
                                    {profile.amenities && profile.amenities.length > 0 ? (
                                        profile.amenities.map((amenity: string, idx: number) => (
                                            <div key={idx} className="flex items-center space-x-3 bg-white/[0.03] p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                                    <Icons.Check size={12} />
                                                </div>
                                                <span className="text-xs font-bold text-gray-300">{amenity}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full p-4 border border-dashed border-white/10 rounded-xl text-center">
                                            <p className="text-sm text-evera-muted">No amenities recorded for this vendor.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Availability Section */}
                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-white/10 transition-colors mt-6 mb-6">
                                <div className="absolute bottom-0 right-0 -mr-16 -mb-16 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
                                
                                <div className="flex justify-between items-start mb-6 relative">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">Availability</h3>
                                        <p className="text-xs text-evera-muted font-medium">Current working status</p>
                                    </div>
                                    <div className={`p-2.5 rounded-xl flex items-center gap-2 ${profile.availability?.status === 'Online' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-400'}`}>
                                        <div className={`w-2.5 h-2.5 rounded-full ${profile.availability?.status === 'Online' ? 'bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse' : 'bg-gray-500'}`} />
                                        <span className="text-xs font-bold uppercase tracking-wider">{profile.availability?.status || 'Offline'}</span>
                                    </div>
                                </div>
                                
                                <div className="grid gap-3 relative">
                                    <div className="flex items-center space-x-4 bg-white/[0.03] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                                            <Icons.Clock size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-evera-muted uppercase tracking-widest mb-0.5">Office Time</p>
                                            <span className="text-sm font-bold text-gray-200">{profile.availability?.officeTime || '09:00 AM - 06:00 PM'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4 bg-white/[0.03] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                            <Icons.Activity size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-evera-muted uppercase tracking-widest mb-0.5">Online Time</p>
                                            <span className="text-sm font-bold text-gray-200">{profile.availability?.onlineTime || 'Last seen 2 days ago'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Aadhaar Card */}
                            <div className="bg-evera-card border border-evera-border rounded-2xl p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="font-bold text-white flex items-center">
                                        <Icons.Check className="mr-2 text-evera-primary" size={18} />
                                        Identity Verification
                                    </h4>
                                </div>
                                <div className="bg-evera-bg/50 border border-evera-border p-4 rounded-xl flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] text-evera-muted uppercase font-bold mb-1">Aadhaar Last 4</p>
                                        {profile.aadhaar_last4 ? (
                                            <p className="text-lg font-mono text-white tracking-widest">XXXX XXXX {profile.aadhaar_last4}</p>
                                        ) : (
                                            <p className="text-sm font-mono text-gray-400">Aadhaar Not Submitted</p>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                            <button 
                                                onClick={() => {
                                                    setDocStatuses(prev => ({ ...prev, 'Aadhaar': 'REUPLOAD_REQUESTED' }));
                                                    addNotification('Request sent to vendor to re-upload Aadhaar');
                                                }}
                                                className={`p-2 rounded-lg border transition-colors ${docStatuses['Aadhaar'] === 'REUPLOAD_REQUESTED' ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'}`}
                                                title="Request Re-upload"
                                            >
                                                <Icons.Upload size={16} />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setDocStatuses(prev => ({ ...prev, 'Aadhaar': 'APPROVED' }));
                                                }}
                                                className={`p-2 rounded-lg border transition-colors ${docStatuses['Aadhaar'] === 'APPROVED' ? 'bg-green-500/20 border-green-500/50 text-green-500' : 'bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500/20'}`}
                                                title="Approve Document"
                                            >
                                                <Icons.Check size={16} />
                                            </button>
                                        </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-8">
                            {!isSupportRole && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                                            <p className="text-sm text-evera-muted">Total Payouts</p>
                                            <div className="text-2xl font-bold text-white mt-2">
                                                ₹{profile.payments?.total_earnings?.toLocaleString() || '0'}
                                            </div>
                                        </div>
                                        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                                            <p className="text-sm text-evera-muted">Active Bookings</p>
                                            <div className="text-2xl font-bold text-white mt-2">
                                                {profile.bookings?.filter((b:any) => b.status === 'PENDING').length || 0}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Business & Banking Details */}
                                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] pointer-events-none"></div>
                                        <h4 className="font-bold text-white mb-6 flex items-center">
                                            <Icons.Briefcase className="mr-2 text-indigo-400" size={18} />
                                            Business & Registration Details
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-[10px] text-evera-muted uppercase font-bold tracking-widest mb-1">Registered Business Name</p>
                                                    {isEditing ? (
                                                        <input className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm" value={editForm.businessName || ''} onChange={e => setEditForm({...editForm, businessName: e.target.value})} />
                                                    ) : (
                                                        <p className="text-sm text-white font-medium">{profile.businessName || profile.name}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-evera-muted uppercase font-bold tracking-widest mb-1">Vendor Category</p>
                                                    <p className="text-sm font-bold text-indigo-400">{profile.category || 'General'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-evera-muted uppercase font-bold tracking-widest mb-1">GST Number</p>
                                                    {isEditing ? (
                                                        <input className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white font-mono text-sm uppercase" value={editForm.gstNumber || ''} onChange={e => setEditForm({...editForm, gstNumber: e.target.value})} />
                                                    ) : (
                                                        <p className="text-sm font-mono text-gray-300">{profile.gstNumber || 'Not Submitted'}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-evera-muted uppercase font-bold tracking-widest mb-1">PAN Number</p>
                                                    {isEditing ? (
                                                        <input className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white font-mono text-sm uppercase" value={editForm.panNumber || ''} onChange={e => setEditForm({...editForm, panNumber: e.target.value})} />
                                                    ) : (
                                                        <p className="text-sm font-mono text-gray-300">{profile.panNumber || 'Not Submitted'}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-4 border-l border-white/5 pl-6">
                                                {profile.payments?.bankDetails || isEditing ? (
                                                    <>
                                                        <div>
                                                            <p className="text-[10px] text-evera-muted uppercase font-bold tracking-widest mb-1">Bank Name</p>
                                                            {isEditing ? (
                                                                <input className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm" value={editForm.bankName !== undefined ? editForm.bankName : (profile.payments?.bankDetails?.bankName || '')} onChange={e => setEditForm({...editForm, bankName: e.target.value})} placeholder="e.g. HDFC Bank" />
                                                            ) : (
                                                                <p className="text-sm font-mono text-gray-300">{profile.payments?.bankDetails?.bankName || 'Not Submitted'}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-evera-muted uppercase font-bold tracking-widest mb-1">Bank Account Number</p>
                                                            {isEditing ? (
                                                                <input className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white font-mono text-sm" value={editForm.bankAccount !== undefined ? editForm.bankAccount : (profile.payments?.bankDetails?.accountNumber || '')} onChange={e => setEditForm({...editForm, bankAccount: e.target.value})} />
                                                            ) : (
                                                                <p className="text-sm font-mono text-white flex items-center">
                                                                    •••• •••• {profile.payments?.bankDetails?.accountNumber ? profile.payments.bankDetails.accountNumber.slice(-4) : 'N/A'}
                                                                    {profile.payments?.bankDetails?.accountNumber && <span className="ml-2 px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[9px] rounded font-bold uppercase tracking-wider">Verified</span>}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-evera-muted uppercase font-bold tracking-widest mb-1">IFSC Code</p>
                                                            {isEditing ? (
                                                                <input className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white font-mono text-sm uppercase" value={editForm.bankIfsc !== undefined ? editForm.bankIfsc : (profile.payments?.bankDetails?.ifsc || '')} onChange={e => setEditForm({...editForm, bankIfsc: e.target.value})} />
                                                            ) : (
                                                                <p className="text-sm font-mono text-gray-300">{profile.payments?.bankDetails?.ifsc || 'Not Submitted'}</p>
                                                            )}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div>
                                                        <p className="text-[10px] text-evera-muted uppercase font-bold tracking-widest mb-1">Bank Details</p>
                                                        <p className="text-sm font-mono text-gray-400">Bank Details Not Submitted</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-[10px] text-evera-muted uppercase font-bold tracking-widest mb-1">UPI ID</p>
                                                    {isEditing ? (
                                                        <input className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm" value={editForm.upiId || ''} onChange={e => setEditForm({...editForm, upiId: e.target.value})} />
                                                    ) : (
                                                        <p className="text-sm text-gray-300">{profile.upiId || 'Not Submitted'}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-black/20 border border-white/5 rounded-xl p-4">
                                            <p className="text-[10px] text-evera-muted uppercase font-bold tracking-widest mb-2">Business Description</p>
                                            {isEditing ? (
                                                <textarea className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm min-h-[80px]" value={editForm.businessDescription || ''} onChange={e => setEditForm({...editForm, businessDescription: e.target.value})} />
                                            ) : (
                                                <p className="text-sm text-gray-300 leading-relaxed italic">
                                                    "{profile.businessDescription || `We are a professional ${profile.category || 'service'} provider committed to delivering high-quality and reliable services to our clients. Fully equipped with necessary tools and trained staff.`}"
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Venue & Service Location Details */}
                                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 blur-[50px] pointer-events-none"></div>
                                        <h4 className="font-bold text-white mb-6 flex items-center">
                                            <Icons.Settings className="mr-2 text-orange-400" size={18} />
                                            Service Location & Venue Details
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-[10px] text-evera-muted uppercase font-bold tracking-widest mb-1">Primary Operating Address</p>
                                                    {isEditing ? (
                                                        <textarea className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm leading-relaxed" value={editForm.address || ''} onChange={e => setEditForm({...editForm, address: e.target.value})} />
                                                    ) : (
                                                        <p className="text-sm text-white font-medium leading-relaxed">
                                                            {profile.address || 'Address Not Submitted'}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-evera-muted uppercase font-bold tracking-widest mb-1">Service Radius</p>
                                                    <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg mt-1 w-full max-w-[200px]">
                                                        <Icons.CheckCircle2 size={14} className="text-orange-400 shrink-0" />
                                                        {isEditing ? (
                                                            <input className="w-full bg-transparent outline-none text-xs font-bold text-white" value={editForm.serviceRadius || ''} onChange={e => setEditForm({...editForm, serviceRadius: e.target.value})} placeholder="e.g. Up to 50 km" />
                                                        ) : (
                                                            <span className="text-xs font-bold text-white">{profile.serviceRadius || 'Up to 50 km'}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4 border-l border-white/5 pl-6">
                                                {(profile.category === 'Venue' || profile.category === 'Catering') ? (
                                                    <>
                                                        <div>
                                                            <p className="text-[10px] text-evera-muted uppercase font-bold tracking-widest mb-1">{profile.category === 'Venue' ? 'Venue Guest Capacity' : 'Catering Capacity'}</p>
                                                            <div className="flex items-end space-x-2 mt-1">
                                                                <span className="text-2xl font-black text-white leading-none">{profile.capacity?.max || profile.guestCapacity || '500'}</span>
                                                                <span className="text-xs font-bold text-gray-400 pb-0.5">Guests Max</span>
                                                            </div>
                                                        </div>
                                                        {profile.category === 'Venue' && (
                                                            <div>
                                                                <p className="text-[10px] text-evera-muted uppercase font-bold tracking-widest mb-1">Venue Size (Sq Ft)</p>
                                                                <div className="flex items-end space-x-2 mt-1">
                                                                    <span className="text-2xl font-black text-white leading-none">{profile.venueSize || '10,000'}</span>
                                                                    <span className="text-xs font-bold text-gray-400 pb-0.5">Sq Ft</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div>
                                                        <p className="text-[10px] text-evera-muted uppercase font-bold tracking-widest mb-1">Service Availability</p>
                                                        <div className="flex items-end space-x-2 mt-1">
                                                            <span className="text-xl font-black text-green-400 leading-none">Accepting Bookings</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Certificates & Business Documents Grid */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {/* Credential Vault */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="font-bold text-white flex items-center">
                                            <Icons.ShieldCheck className="mr-2 text-indigo-400" size={18} />
                                            Credential Vault
                                        </h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {profile.certificates?.map((cert: any, idx: number) => {
                                            const docUrl = cert.file_url?.startsWith('http') ? cert.file_url : `${BASE_HOST}${cert.file_url}`;
                                            const isPdf = docUrl.toLowerCase().endsWith('.pdf');
                                            return (
                                                <div key={idx} className="group relative bg-evera-bg rounded-xl border border-evera-border overflow-hidden cursor-pointer hover:border-indigo-500/50 transition-all duration-300 shadow-md">
                                                    {docStatuses[cert.title] && (
                                                        <div className="absolute top-2 right-2 z-10 animate-fade-in">
                                                            {docStatuses[cert.title] === 'APPROVED' ? (
                                                                <div className="bg-green-500 rounded-full p-1 shadow-lg">
                                                                    <Icons.Check size={14} className="text-white" />
                                                                </div>
                                                            ) : (
                                                                <div className="bg-red-500 rounded-full p-1 shadow-lg">
                                                                    <Icons.Upload size={14} className="text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {isPdf ? (
                                                        <div className="w-full h-32 flex flex-col items-center justify-center bg-red-500/10 text-red-500 opacity-60 group-hover:opacity-100 transition-opacity">
                                                            <Icons.Reject size={32} />
                                                            <span className="text-[10px] font-bold mt-2">PDF DOCUMENT</span>
                                                        </div>
                                                    ) : (
                                                        <img src={docUrl} className="w-full h-32 object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                    
                                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => setSelectedDocument({ ...cert, file_url: docUrl })}
                                                                className="p-2 bg-white/10 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                                                                title="View Document"
                                                            >
                                                                <Icons.Eye size={18} />
                                                            </button>
                                                            <a 
                                                                href={docUrl} 
                                                                download 
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 bg-white/10 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                                                                title="Download"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Icons.Download size={18} />
                                                            </a>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    try {
                                                                        await api.updateDocumentStatus(profile.id.toString(), cert.id.toString(), 'REUPLOAD_REQUESTED');
                                                                        setDocStatuses(prev => ({ ...prev, [cert.title]: 'REUPLOAD_REQUESTED' }));
                                                                        addNotification(`Request sent to vendor to re-upload ${cert.title}`);
                                                                    } catch(err) { console.error(err); }
                                                                }}
                                                                className={`p-2 rounded-lg transition-colors ${docStatuses[cert.title] === 'REUPLOAD_REQUESTED' ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-red-500 text-white'}`}
                                                                title={`Request Re-upload ${cert.title}`}
                                                            >
                                                                <Icons.Upload size={18} />
                                                            </button>
                                                            <button 
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    try {
                                                                        await api.updateDocumentStatus(profile.id.toString(), cert.id.toString(), 'APPROVED');
                                                                        setDocStatuses(prev => ({ ...prev, [cert.title]: 'APPROVED' }));
                                                                    } catch(err) { console.error(err); }
                                                                }}
                                                                className={`p-2 rounded-lg transition-colors ${docStatuses[cert.title] === 'APPROVED' ? 'bg-green-500 text-white' : 'bg-white/10 hover:bg-green-500 text-white'}`}
                                                                title={`Approve ${cert.title}`}
                                                            >
                                                                <Icons.Check size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-[#161210]/90 absolute bottom-0 inset-x-0 border-t border-white/5">
                                                        <div className="text-[10px] font-bold text-white truncate uppercase tracking-widest">{cert.title}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Business Documents */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="font-bold text-white flex items-center">
                                            <Icons.Briefcase className="mr-2 text-emerald-400" size={18} />
                                            Business Documents
                                        </h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {profile.businessDocuments?.length ? profile.businessDocuments.map((doc: any, idx: number) => {
                                            const docUrl = doc.file_url?.startsWith('http') ? doc.file_url : `${BASE_HOST}${doc.file_url}`;
                                            return (
                                            <div key={idx} className="group relative bg-evera-bg rounded-xl border border-evera-border overflow-hidden cursor-pointer hover:border-emerald-500/50 transition-all duration-300 shadow-md">
                                                {docStatuses[doc.title] && (
                                                    <div className="absolute top-2 right-2 z-10 animate-fade-in">
                                                        {docStatuses[doc.title] === 'APPROVED' ? (
                                                            <div className="bg-green-500 rounded-full p-1 shadow-lg">
                                                                <Icons.Check size={14} className="text-white" />
                                                            </div>
                                                        ) : (
                                                            <div className="bg-red-500 rounded-full p-1 shadow-lg">
                                                                <Icons.Upload size={14} className="text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {docUrl?.toLowerCase().endsWith('.pdf') ? (
                                                    <div className="w-full h-32 flex flex-col items-center justify-center bg-red-500/10 text-red-500 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <Icons.FileText size={32} />
                                                        <span className="text-[10px] font-bold mt-2">PDF DOCUMENT</span>
                                                    </div>
                                                ) : (
                                                    <img src={docUrl} className="w-full h-32 object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                )}
                                                
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                                    <button 
                                                        onClick={() => setSelectedDocument({ title: doc.title, file_url: docUrl })}
                                                        className="p-2 bg-white/10 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                                                        title="View Document"
                                                    >
                                                        <Icons.Eye size={18} />
                                                    </button>
                                                        <button 
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                try {
                                                                    await api.updateDocumentStatus(profile.id.toString(), doc.id.toString(), 'REUPLOAD_REQUESTED');
                                                                    setDocStatuses(prev => ({ ...prev, [doc.title]: 'REUPLOAD_REQUESTED' }));
                                                                    addNotification(`Request sent to vendor to re-upload ${doc.title}`);
                                                                } catch(err) { console.error(err); }
                                                            }}
                                                            className={`p-2 rounded-lg transition-colors ${docStatuses[doc.title] === 'REUPLOAD_REQUESTED' ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-red-500 text-white'}`}
                                                            title={`Request Re-upload ${doc.title}`}
                                                        >
                                                            <Icons.Upload size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                try {
                                                                    await api.updateDocumentStatus(profile.id.toString(), doc.id.toString(), 'APPROVED');
                                                                    setDocStatuses(prev => ({ ...prev, [doc.title]: 'APPROVED' }));
                                                                } catch(err) { console.error(err); }
                                                            }}
                                                            className={`p-2 rounded-lg transition-colors ${docStatuses[doc.title] === 'APPROVED' ? 'bg-green-500 text-white' : 'bg-white/10 hover:bg-green-500 text-white'}`}
                                                            title={`Approve ${doc.title}`}
                                                        >
                                                            <Icons.Check size={18} />
                                                        </button>
                                                    </div>
                                                <div className="p-3 bg-[#161210]/90 absolute bottom-0 inset-x-0 border-t border-white/5">
                                                    <div className="text-[10px] font-bold text-white truncate uppercase tracking-widest">{doc.title}</div>
                                                </div>
                                            </div>
                                        )}) : (
                                            <div className="col-span-2 flex flex-col items-center justify-center py-8 bg-white/[0.02] rounded-xl border border-white/5 border-dashed">
                                                <Icons.FileX className="text-white/20 mb-2" size={32} />
                                                <p className="text-xs text-evera-muted">No business documents uploaded yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Work Portfolio */}
                            <div className="bg-evera-card border border-evera-border rounded-2xl p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="font-bold text-white">Work Portfolio</h4>
                                    <span className="text-[10px] text-evera-primary font-bold uppercase tracking-widest bg-evera-primary/10 px-2 py-1 rounded-lg">Real Work Samples</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {profile.portfolio?.length ? profile.portfolio.map((work: any, idx: number) => {
                                        const workUrl = work.file_url?.startsWith('http') ? work.file_url : `${BASE_HOST}${work.file_url}`;
                                        return (
                                        <div key={idx} className="group relative bg-evera-bg rounded-xl border border-evera-border overflow-hidden cursor-pointer hover:border-evera-primary/50 transition-all duration-300">
                                            {workUrl?.toLowerCase().endsWith('.pdf') ? (
                                                <div className="w-full h-24 flex flex-col items-center justify-center bg-blue-500/10 text-blue-500 opacity-70 group-hover:opacity-100 transition-opacity">
                                                    <Icons.FileText size={24} />
                                                    <span className="text-[8px] font-bold mt-1">PDF</span>
                                                </div>
                                            ) : (
                                                <img src={workUrl} className="w-full h-24 object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                            )}
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => setSelectedDocument({...work, file_url: workUrl})}
                                                    className="p-1.5 bg-white/10 hover:bg-evera-primary text-white rounded-md transition-colors"
                                                >
                                                    <Icons.Eye size={14} />
                                                </button>
                                                <a 
                                                    href={workUrl} 
                                                    download 
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 bg-white/10 hover:bg-evera-primary text-white rounded-md transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Icons.Download size={14} />
                                                </a>
                                            </div>
                                        </div>
                                    )}) : (
                                        <div className="col-span-4 flex flex-col items-center justify-center py-8 bg-white/[0.02] rounded-xl border border-white/5 border-dashed">
                                            <Icons.ImageOff className="text-white/20 mb-2" size={32} />
                                            <p className="text-xs text-evera-muted">No portfolio images uploaded.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Service Offerings & Packages */}
                            <div className="bg-evera-card border border-evera-border rounded-2xl p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="font-bold text-white">Service Offerings & Packages</h4>
                                </div>
                                <div className="space-y-6">
                                    {(!profile.services?.length && !profile.pricing?.length && !profile.packages?.length) ? (
                                        <div className="flex flex-col items-center justify-center py-8 bg-white/[0.02] rounded-xl border border-white/5 border-dashed">
                                            <p className="text-xs text-evera-muted">No services, pricing, or packages found for this vendor.</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Services List */}
                                            {profile.services && profile.services.length > 0 && (
                                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                                                    <p className="text-[10px] text-evera-muted uppercase font-bold tracking-widest mb-3">Available Services</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {profile.services.map((svc: any, i: number) => (
                                                            <div key={i} className="bg-evera-bg border border-evera-border/50 rounded-xl p-4 hover:border-indigo-500/30 transition-all">
                                                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                                                                    <Icons.Check size={14} className="text-indigo-500" />
                                                                    <h5 className="font-bold text-indigo-400">{svc.name || svc}</h5>
                                                                </div>
                                                                {(svc.pricing_type || svc.advance_amount || svc.ac_type || svc.capacity || svc.venue_location) ? (
                                                                    <div className="space-y-1.5 text-xs text-gray-300">
                                                                        {svc.pricing_type && <p><span className="text-evera-muted w-20 inline-block">Pricing:</span> {svc.pricing_type}</p>}
                                                                        {svc.advance_amount && <p><span className="text-evera-muted w-20 inline-block">Advance:</span> <span className="text-orange-400 font-bold">{svc.advance_amount}</span></p>}
                                                                        {svc.ac_type && <p><span className="text-evera-muted w-20 inline-block">AC Type:</span> {svc.ac_type}</p>}
                                                                        {svc.capacity && <p><span className="text-evera-muted w-20 inline-block">Capacity:</span> {svc.capacity}</p>}
                                                                        {svc.venue_location && <p><span className="text-evera-muted w-20 inline-block">Location:</span> {svc.venue_location}</p>}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs text-gray-500 italic">No additional details provided.</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Pricing List */}
                                            {profile.pricing && profile.pricing.length > 0 && (
                                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                                                    <p className="text-[10px] text-evera-muted uppercase font-bold tracking-widest mb-3">Pricing Structure</p>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {profile.pricing.map((price: any, i: number) => (
                                                            <div key={i} className="bg-evera-bg border border-evera-border p-3 rounded-lg">
                                                                <p className="text-xs text-gray-400 mb-1">{price.type}</p>
                                                                <p className="text-lg font-bold text-white">₹{price.amount.toLocaleString()}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Packages List */}
                                            {profile.packages && profile.packages.length > 0 && (
                                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                                                    <p className="text-[10px] text-evera-muted uppercase font-bold tracking-widest mb-3">Service Packages</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {profile.packages.map((pkg: any, pIdx: number) => (
                                                            <div key={pIdx} className="bg-evera-bg border border-evera-border/50 rounded-xl p-5 hover:border-evera-primary/30 transition-all">
                                                                <div className="flex justify-between items-start mb-4">
                                                                    <span className="text-sm font-black uppercase text-evera-primary tracking-widest">{pkg.name}</span>
                                                                    <div className="text-right">
                                                                        <span className="text-lg font-bold text-white">₹{pkg.price?.toLocaleString() || pkg.price}</span>
                                                                        {pkg.advance_amount && <p className="text-[10px] text-orange-400 mt-1 uppercase font-bold tracking-wider">Advance: {pkg.advance_amount}</p>}
                                                                    </div>
                                                                </div>
                                                                <ul className="space-y-2 mt-2">
                                                                    {pkg.features?.split(',').map((feature: string, aIdx: number) => (
                                                                        <li key={aIdx} className="flex items-start text-[11px] text-gray-300 font-medium">
                                                                            <Icons.Check size={12} className="text-evera-primary mr-2 mt-0.5 shrink-0" />
                                                                            <span>{feature.trim()}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Payment History - TRIGGER REDIRECT */}
                            {!isSupportRole && (
                                <div className="bg-evera-card border border-evera-border rounded-2xl overflow-hidden shadow-xl">
                                    <div className="px-6 py-4 border-b border-evera-border bg-white/5 flex justify-between items-center">
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Financial Audit Trail</h4>
                                        <span className="text-[10px] text-evera-primary font-bold italic">Click any record for full reconciliation</span>
                                    </div>
                                    <DataTable 
                                        columns={paymentColumns}
                                        data={profile.payments?.history || []}
                                        onRowClick={(row) => setSelectedPayment(row)}
                                        emptyMessage="No financial records available for pending vendors."
                                    />
                                </div>
                            )}

                            {/* Booking History */}
                            {!isSupportRole && (
                                <div className="bg-evera-card border border-evera-border rounded-2xl overflow-hidden">
                                    <div className="px-6 py-4 border-b border-evera-border">
                                        <h4 className="font-bold text-white">Service History</h4>
                                    </div>
                                    <DataTable 
                                        columns={bookingColumns}
                                        data={profile.bookings || []}
                                        onRowClick={(row) => setSelectedBooking(row)}
                                        emptyMessage="No service history available for pending vendors."
                                    />
                                </div>
                            )}

                            {/* Vendor Support Tickets */}
                            <div className="bg-evera-card border border-evera-border rounded-2xl overflow-hidden">
                                <div className="px-6 py-4 border-b border-evera-border flex justify-between items-center bg-[#161210]">
                                    <div>
                                        <h4 className="font-bold text-white flex items-center gap-2">
                                            <Icons.Users className="text-evera-primary" size={18} />
                                            Support Tickets
                                        </h4>
                                        <p className="text-[10px] text-gray-400 mt-1">Vendor's reported issues and inquiries</p>
                                    </div>
                                    <span className="bg-evera-primary/10 text-evera-primary px-3 py-1 rounded-full text-xs font-bold border border-evera-primary/20">
                                        {profile.tickets?.length || 0} Total
                                    </span>
                                </div>
                                <div className="p-4 space-y-3 bg-[#0d0a09]">
                                    {profile.tickets && profile.tickets.length > 0 ? (
                                        profile.tickets.map(renderTicketCard)
                                    ) : (
                                        <div className="text-center py-12 border border-dashed border-[#38302C] rounded-xl">
                                            <Icons.Users size={32} className="mx-auto text-gray-600 mb-3" />
                                            <p className="text-gray-400 text-sm font-medium">No support tickets found.</p>
                                            <p className="text-xs text-gray-500 mt-1">This vendor hasn't raised any issues yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Overlay */}
            {selectedChat && createPortal(
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                >
                    <div 
                        className="bg-white/[0.03] border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[550px] transform transition-all"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-black/20 backdrop-blur-sm">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                                    {selectedChat.customerName?.charAt(0) || 'C'}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">{selectedChat.customerName}</h4>
                                    <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest flex items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                                        Active Chat
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedChat(null)} 
                                className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors"
                            >
                                <Icons.Reject size={20} />
                            </button>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gradient-to-b from-transparent to-black/20 relative">
                            {selectedChat.chat?.map((msg:any, i:number) => {
                                const isVendor = msg.sender === 'vendor';
                                return (
                                    <div key={i} className={`flex flex-col ${isVendor ? 'items-end' : 'items-start'} animate-fade-in`} style={{ animationDelay: `${i * 100}ms` }}>
                                        <div className="flex items-end space-x-2">
                                            {!isVendor && (
                                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shadow-sm mb-1 shrink-0">
                                                    {selectedChat.customerName?.charAt(0) || 'C'}
                                                </div>
                                            )}
                                            <div className={`p-4 rounded-2xl max-w-[280px] text-sm shadow-md ${
                                                isVendor 
                                                    ? 'bg-gradient-to-br from-evera-primary to-orange-600 text-white rounded-br-sm' 
                                                    : 'bg-white/[0.05] border border-white/5 text-gray-200 rounded-bl-sm backdrop-blur-sm'
                                            }`}>
                                                {msg.text}
                                            </div>
                                            {isVendor && (
                                                <div className="w-6 h-6 rounded-full bg-evera-primary/20 flex items-center justify-center text-[10px] font-bold text-evera-primary shadow-sm mb-1 shrink-0">
                                                    V
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[9px] text-gray-500 font-medium mt-1 px-8 uppercase">
                                            {isVendor ? 'Vendor' : 'Customer'} • Just now
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-4 border-t border-white/5 bg-black/40 backdrop-blur-md">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="You are viewing this chat in read-only mode..." 
                                    disabled
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-gray-400 cursor-not-allowed"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/5 rounded-lg text-gray-500">
                                    <Icons.Check size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Booking Detail Overlay */}
            {selectedBooking && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }} onClick={() => setSelectedBooking(null)}>
                    <div className="bg-white/[0.03] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden transform transition-all" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-black/20 backdrop-blur-sm">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg">
                                    <Icons.Check size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">Booking Snapshot</h4>
                                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">ID: #{selectedBooking.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedBooking(null)} className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors">
                                <Icons.Reject size={20} />
                            </button>
                        </div>
                        <div className="p-8 space-y-8 bg-gradient-to-b from-transparent to-black/20 relative">
                            <div className="flex justify-between items-center">
                                <h3 className="text-3xl font-black text-white tracking-tight">{selectedBooking.serviceType}</h3>
                                <StatusBadge status={selectedBooking.status} />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                                    <div className="flex items-center space-x-2 mb-2 text-evera-primary">
                                        <Icons.Users size={16} />
                                        <p className="text-evera-muted font-bold uppercase text-[10px] tracking-widest">Customer</p>
                                    </div>
                                    <p className="text-white text-lg font-medium mb-3">{selectedBooking.customerName}</p>
                                    
                                    <div className="space-y-2">
                                        <div className="flex items-center text-xs text-gray-400">
                                            <Icons.Phone size={12} className="mr-2 text-gray-500" />
                                            {selectedBooking.customerPhone || '+91 98765 00000'}
                                        </div>
                                        <div className="flex items-center text-xs text-gray-400">
                                            <Icons.Mail size={12} className="mr-2 text-gray-500" />
                                            {selectedBooking.customerEmail || 'Not Provided'}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                                    <div className="flex items-center space-x-2 mb-2 text-emerald-400">
                                        <Icons.Dollar size={16} />
                                        <p className="text-evera-muted font-bold uppercase text-[10px] tracking-widest">Service Amount</p>
                                    </div>
                                    <p className="text-white text-xl font-black tracking-tight">₹{selectedBooking.amount?.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                                <div className="flex items-center space-x-2 mb-3 text-red-400">
                                    <Icons.MapPin size={16} />
                                    <p className="text-evera-muted font-bold uppercase text-[10px] tracking-widest">Event Location</p>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">{selectedBooking.address || 'Location details not provided for this booking.'}</p>
                            </div>
                            
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                                <div className="flex items-center space-x-2 mb-3 text-indigo-400">
                                    <Icons.Chat size={16} />
                                    <p className="text-evera-muted font-bold uppercase text-[10px] tracking-widest">Customer Request / Event Description</p>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">"{selectedBooking.description || 'No additional event description provided by the customer.'}"</p>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Approval Modal */}
            {showApprovalModal && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }} onClick={() => setShowApprovalModal(false)}>
                    <div className="relative max-w-2xl w-full flex flex-col bg-evera-card rounded-3xl border border-evera-primary/30 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-evera-primary/10">
                            <div>
                                <h4 className="font-bold text-white text-xl flex items-center">
                                    <Icons.CheckCircle2 className="mr-2 text-evera-primary" size={24} />
                                    Final Approval Review
                                </h4>
                                <p className="text-xs text-evera-muted mt-1">Review locked-in details before approving.</p>
                            </div>
                            <button onClick={() => setShowApprovalModal(false)} className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors">
                                <Icons.Reject size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#161210] p-4 rounded-xl border border-[#38302C]">
                                    <p className="text-[10px] text-evera-muted uppercase tracking-widest font-bold mb-1">Vendor Name</p>
                                    <p className="text-white font-bold">{profile.name}</p>
                                </div>
                                <div className="bg-[#161210] p-4 rounded-xl border border-[#38302C]">
                                    <p className="text-[10px] text-evera-muted uppercase tracking-widest font-bold mb-1">Service Category</p>
                                    <p className="text-evera-primary font-bold">{profile.category}</p>
                                </div>
                                <div className="bg-[#161210] p-4 rounded-xl border border-[#38302C]">
                                    <p className="text-[10px] text-evera-muted uppercase tracking-widest font-bold mb-1">Aadhaar Status</p>
                                    <p className={`font-bold ${profile.documentsVerified || docStatuses['Aadhaar'] === 'APPROVED' ? 'text-green-500' : docStatuses['Aadhaar'] === 'REUPLOAD_REQUESTED' ? 'text-red-500' : 'text-yellow-500'}`}>
                                        {profile.documentsVerified || docStatuses['Aadhaar'] === 'APPROVED' ? 'Verified' : docStatuses['Aadhaar'] === 'REUPLOAD_REQUESTED' ? 'Re-upload Req' : 'Pending Verification'}
                                    </p>
                                </div>
                                <div className="bg-[#161210] p-4 rounded-xl border border-[#38302C]">
                                    <p className="text-[10px] text-evera-muted uppercase tracking-widest font-bold mb-1">Document Status</p>
                                    <p className="font-bold text-sm">
                                        <span className="text-green-500">{profile.documentsVerified ? (profile.documents?.length || 4) : Object.values(docStatuses).filter(v => v === 'APPROVED').length} Approved</span>
                                        <span className="text-gray-500 mx-2">|</span>
                                        <span className="text-red-500">{profile.documentsVerified ? 0 : Object.values(docStatuses).filter(v => v === 'REUPLOAD_REQUESTED').length} Rejected</span>
                                    </p>
                                </div>                        </div>
                            </div>
                        <div className="p-6 border-t border-white/5 flex justify-between bg-black/20">
                            {(() => {
                                const isReadyToApprove = profile.documentsVerified || Object.values(docStatuses).filter(v => v === 'APPROVED').length > 0;
                                return Object.values(docStatuses).filter(v => v === 'REUPLOAD_REQUESTED').length > 0 ? (
                                    <button 
                                        onClick={() => {
                                            addNotification('Re-upload requests sent to vendor.');
                                            setShowApprovalModal(false);
                                        }}
                                    className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/20 font-bold text-sm transition-all flex items-center w-full justify-center"
                                >
                                    <Icons.Upload size={16} className="mr-2" /> Send Re-upload Requests
                                </button>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => setShowApprovalModal(false)}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setShowApprovalModal(false);
                                            handleUpdateStatus('ACTIVE');
                                        }}
                                        className={`px-6 py-2 bg-evera-primary hover:bg-evera-primary/80 text-white rounded-xl shadow-lg shadow-evera-primary/20 font-bold text-sm transition-all flex items-center ${!isReadyToApprove ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={!isReadyToApprove}
                                    >
                                        <Icons.Check size={16} className="mr-2" /> Confirm & Approve
                                    </button>
                                </>
                            );
                        })()}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Document Preview Overlay */}
            {selectedDocument && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }} onClick={() => setSelectedDocument(null)}>
                    <div className="relative max-w-5xl w-full h-[90vh] flex flex-col bg-white/[0.03] rounded-3xl border border-white/10 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-md z-10">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg border border-white/10">
                                    <Icons.Briefcase size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-xl">{selectedDocument.title}</h4>
                                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">Official Document Preview</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <a 
                                    href={selectedDocument.file_url} 
                                    download 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2.5 bg-evera-primary hover:bg-evera-primary/80 text-white rounded-xl shadow-lg shadow-evera-primary/20 transition-all flex items-center space-x-2"
                                >
                                    <Icons.Download size={18} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Download</span>
                                </a>
                                <button onClick={() => setSelectedDocument(null)} className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors">
                                    <Icons.Reject size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="relative w-full h-full flex items-center justify-center p-4">
                            {selectedDocument.file_url?.toLowerCase().endsWith('.pdf') ? (
                                <iframe 
                                    src={selectedDocument.file_url?.startsWith('http') ? selectedDocument.file_url : `${BASE_HOST}${selectedDocument.file_url}`} 
                                    className="w-full h-full rounded-lg bg-white" 
                                />
                            ) : (
                                <img 
                                    src={selectedDocument.file_url?.startsWith('http') ? selectedDocument.file_url : `${BASE_HOST}${selectedDocument.file_url}`} 
                                    className="max-w-full max-h-full object-contain rounded-lg" 
                                />
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
