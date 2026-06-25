import React, { useState } from 'react';
import { Icons } from '../ui/Icons';
import { StatusBadge } from '../ui/StatusBadge';
import { Payment } from '../../types';
import { MapPin, Calendar, Clock, User, Phone, Mail, Briefcase, CreditCard, Receipt, ShieldCheck, ArrowRightLeft, Copy } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PaymentDetailViewProps {
    payment: Payment;
    onBack: () => void;
    handleRefund?: (id: string, amount: number) => void;
    onStatusChange?: (id: string, status: string) => void;
    reconDetails?: {
        settlementId: string | null;
        difference?: number;
        status: string;
        onForceMatch?: () => void;
        onResolveDiff?: () => void;
    };
}

export const PaymentDetailView: React.FC<PaymentDetailViewProps> = ({ payment, onBack, onStatusChange, handleRefund, reconDetails }) => {
    const { addNotification, setTickets, adminUser } = useApp();
    const [showRefundModal, setShowRefundModal] = useState(false);

    const handleCreateTicket = () => {
        const newTicket = {
            id: `t-${Date.now()}`,
            ticketNumber: `T-FIN-${Math.floor(Math.random() * 10000)}`,
            customerId: payment.customerId,
            customerName: payment.customer?.name || 'Unknown Customer',
            customerEmail: payment.customer?.email || 'customer@example.com',
            subject: `Payment Investigation: ${payment.transactionId}`,
            description: `Automated ticket raised from Finance Module.\\nPayment ID: ${payment.id}\\nTransaction Ref: ${payment.transactionId}\\nAmount: ₹${payment.amount}\\nStatus: ${payment.status}\\n\\nPlease investigate this transaction.`,
            category: 'PAYMENT',
            priority: 'HIGH',
            status: 'OPEN',
            assignedDepartment: 'FINANCE',
            createdAt: new Date().toLocaleString(),
            updatedAt: new Date().toLocaleString(),
            tags: ['finance', 'payment', payment.transactionId],
            timelineActions: [
                {
                    id: `ta-${Date.now()}`,
                    action: 'CREATED',
                    actorName: adminUser?.name || 'Finance Admin',
                    timestamp: new Date().toLocaleString()
                }
            ]
        };

        setTickets(prev => [newTicket, ...prev]);
        addNotification(`Support Ticket ${newTicket.ticketNumber} created successfully.`);
    };

    const handleDownloadInvoice = () => {
        addNotification(`Downloading Invoice for ${payment.id}`);
        try {
            const doc = new jsPDF();
            
            // Header
            doc.setFontSize(22);
            doc.text('TAX INVOICE', 14, 20);
            
            doc.setFontSize(10);
            doc.text(`Invoice No: INV-${payment.transactionId}`, 14, 30);
            doc.text(`Date: ${payment.createdAt}`, 14, 36);
            doc.text(`Status: ${payment.status}`, 14, 42);

            // Company Details
            doc.setFont(undefined, 'bold');
            doc.text('Evera Services Pvt Ltd', 130, 20);
            doc.setFont(undefined, 'normal');
            doc.text('123 Tech Park, Bangalore', 130, 26);
            doc.text('support@evera.com', 130, 32);

            // Customer Details
            doc.setFont(undefined, 'bold');
            doc.text('Bill To:', 14, 55);
            doc.text(payment.customer?.name || 'Customer', 14, 61);
            doc.setFont(undefined, 'normal');
            doc.text(payment.customer?.phone || '', 14, 67);
            doc.text(payment.customer?.email || '', 14, 73);

            // Table
            const subtotal = payment.amount - (payment.tax || 0);
            
            autoTable(doc, {
                startY: 85,
                head: [['Description', 'Amount']],
                body: [
                    [`Service: ${payment.serviceName} (${payment.category})`, `Rs. ${subtotal.toFixed(2)}`],
                    ['Taxes (18% GST)', `Rs. ${(payment.tax || 0).toFixed(2)}`],
                    ...(payment.platform_fee ? [['Platform Fee', `Rs. ${payment.platform_fee.toFixed(2)}`]] : [])
                ],
                foot: [['Total', `Rs. ${payment.amount.toFixed(2)}`]],
                theme: 'striped',
                headStyles: { fillColor: [79, 70, 229] },
                footStyles: { fillColor: [22, 18, 16] }
            });

            // Footer
            const finalY = (doc as any).lastAutoTable?.finalY || 150;
            doc.text('Thank you for choosing Evera Services!', 14, finalY + 20);

            doc.save(`Invoice_${payment.transactionId}.pdf`);
        } catch (error) {
            console.error('Failed to generate PDF', error);
            alert('Failed to download invoice. Please try again.');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 bg-evera-card p-4 md:p-6 rounded-2xl border border-evera-border shadow-sm">
                <button 
                    onClick={onBack}
                    className="p-2 md:p-3 bg-evera-bg hover:bg-evera-primary/10 rounded-xl text-evera-muted hover:text-evera-primary transition-all border border-evera-border"
                >
                    <Icons.ChevronRight className="rotate-180" size={20} />
                </button>
                <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                            <h4 className="text-xl md:text-2xl font-black text-white tracking-tight">Booking Details</h4>
                            <p className="text-xs text-evera-muted font-mono mt-1">Ref: {payment.transactionId}</p>
                        </div>
                        <StatusBadge status={payment.status} className="px-4 py-1.5 text-sm w-max" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Service Info Card */}
                    <div className="bg-evera-card rounded-2xl border border-evera-border p-6 md:p-8">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-evera-primary/10 flex items-center justify-center text-evera-primary border border-evera-primary/20">
                                    <Briefcase size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white">{payment.serviceName}</h2>
                                    <p className="text-sm text-evera-muted mt-1">{payment.category}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-evera-muted mb-1">Total Amount</p>
                                <p className="text-3xl font-black text-white">₹{payment.amount.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-evera-bg/50 rounded-xl border border-evera-border">
                                <div className="p-2 bg-white/5 rounded-lg text-evera-muted"><Calendar size={18} /></div>
                                <div>
                                    <p className="text-[10px] text-evera-muted uppercase font-bold tracking-wider">Date Scheduled</p>
                                    <p className="text-sm font-medium text-white">{payment.createdAt}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-evera-bg/50 rounded-xl border border-evera-border">
                                <div className="p-2 bg-white/5 rounded-lg text-evera-muted"><CreditCard size={18} /></div>
                                <div>
                                    <p className="text-[10px] text-evera-muted uppercase font-bold tracking-wider">Payment Method</p>
                                    <p className="text-sm font-medium text-white">{payment.method}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {payment.bookingDetails && (
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-evera-primary/50"></div>
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <Briefcase size={16} className="text-evera-primary" />
                                Booking Specifications
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {payment.bookingDetails.packageName && (
                                    <div>
                                        <p className="text-[10px] text-evera-muted uppercase font-bold tracking-wider mb-1">Package</p>
                                        <p className="text-sm font-medium text-white">{payment.bookingDetails.packageName}</p>
                                    </div>
                                )}
                                {payment.bookingDetails.pricingType && (
                                    <div>
                                        <p className="text-[10px] text-evera-muted uppercase font-bold tracking-wider mb-1">Pricing Type</p>
                                        <p className="text-sm font-medium text-white">{payment.bookingDetails.pricingType}</p>
                                    </div>
                                )}
                                {payment.bookingDetails.guestCount && (
                                    <div>
                                        <p className="text-[10px] text-evera-muted uppercase font-bold tracking-wider mb-1">Guest Capacity</p>
                                        <p className="text-sm font-medium text-white">{payment.bookingDetails.guestCount} Guests</p>
                                    </div>
                                )}
                            </div>
                            
                            {payment.bookingDetails.addons && payment.bookingDetails.addons.length > 0 && (
                                <div className="mt-5 pt-5 border-t border-white/5">
                                    <p className="text-[10px] text-evera-muted uppercase font-bold tracking-wider mb-3">Selected Add-ons</p>
                                    <div className="flex flex-wrap gap-2">
                                        {payment.bookingDetails.addons.map((addon: string, i: number) => (
                                            <span key={i} className="px-3 py-1.5 bg-evera-primary/10 border border-evera-primary/20 text-evera-primary text-[11px] font-bold rounded-lg flex items-center gap-1.5">
                                                <Icons.Check size={12} />
                                                {addon}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Customer & Provider Profiles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer */}
                        <div className="bg-evera-card rounded-2xl border border-evera-border p-6">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <User size={16} className="text-evera-primary" />
                                Customer Details
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-evera-bg flex items-center justify-center font-bold text-white border border-evera-border">
                                        {payment.customer?.name?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">{payment.customer?.name}</p>
                                        <p className="text-xs text-evera-muted font-mono">{payment.customerId}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 pt-2 text-sm">
                                    <div className="flex items-center gap-3 text-evera-muted">
                                        <Phone size={14} />
                                        <span className="text-white">{payment.customer?.phone || '+91 98765 43210'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-evera-muted">
                                        <Mail size={14} />
                                        <span className="text-white truncate">{payment.customer?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-evera-muted">
                                        <MapPin size={14} />
                                        <span className="text-white truncate" title={payment.location || '123 Main Street, Bangalore'}>
                                            {payment.location || '123 Main Street, Bangalore'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vendor */}
                        <div className="bg-evera-card rounded-2xl border border-evera-border p-6">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <Briefcase size={16} className="text-orange-400" />
                                Service Provider
                            </h3>
                            {payment.vendor ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center font-bold text-orange-400 border border-orange-500/20">
                                                {payment.vendor?.name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">{payment.vendor?.name}</p>
                                                <div className="flex items-center text-orange-400 mt-0.5 gap-1">
                                                    <Icons.Check size={12} />
                                                    <span className="text-xs font-bold">{payment.vendor?.rating} Rating</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 pt-2 text-sm">
                                        <div className="flex items-center gap-3 text-evera-muted">
                                            <Phone size={14} />
                                            <span className="text-white">{payment.vendor?.phone || '+91 91234 56789'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-evera-muted">
                                            <Calendar size={14} />
                                            <span className="text-white">Partner since {payment.vendor?.joinedDate}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-evera-muted">
                                            <Icons.Check size={14} />
                                            <span className="text-white">{payment.vendor?.totalJobs} jobs completed</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center min-h-[120px]">
                                    <p className="text-evera-muted text-sm italic">Assigning provider...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Summary & Actions */}
                <div className="space-y-6">
                    {/* Invoice Summary */}
                    <div className="bg-evera-card rounded-2xl border border-evera-border p-6">
                        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                            <Receipt size={16} className="text-evera-primary" />
                            Payment Summary
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-evera-muted">Subtotal</span>
                                <span className="text-white">₹{(payment.amount - (payment.tax || 0)).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-evera-muted">Taxes (GST)</span>
                                <span className="text-white">₹{payment.tax?.toLocaleString()}</span>
                            </div>
                            {payment.platform_fee && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-evera-muted">Platform Fee</span>
                                    <span className="text-white">₹{payment.platform_fee.toLocaleString()}</span>
                                </div>
                            )}
                            
                            <div className="pt-4 border-t border-evera-border">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-white font-bold">Total Charged</span>
                                    <span className="text-xl font-black text-white">₹{payment.amount.toLocaleString()}</span>
                                </div>
                                <p className="text-[10px] text-evera-muted text-right">Paid via {payment.method}</p>
                            </div>

                            {/* Internal Payout view (optional for admins) */}
                            <div className="mt-4 p-4 bg-evera-bg rounded-xl border border-evera-border/50">
                                <p className="text-[10px] font-bold text-evera-muted uppercase mb-2">Vendor Payout</p>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-evera-muted">Commission (10%)</span>
                                    <span className="text-red-400">-₹{payment.commission?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold pt-1 border-t border-evera-border/30">
                                    <span className="text-white">Net to Vendor</span>
                                    <span className="text-emerald-400">₹{payment.net_amount?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Escrow & Transaction Ledger */}
                    <div className="bg-evera-card rounded-2xl border border-evera-border p-6">
                        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                            <ShieldCheck size={16} className="text-indigo-400" />
                            Transaction & Escrow
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="pt-2">
                                <p className="text-[10px] text-evera-muted uppercase font-bold tracking-wider mb-4">Timeline</p>
                                
                                <div className="relative pl-6 space-y-6 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[2px] before:bg-evera-border/50">
                                    <div className="relative">
                                        <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-bold text-white">Customer Funds Captured</p>
                                                <p className="text-xs text-evera-muted mt-0.5">{payment.requestedAt || payment.createdAt}</p>
                                            </div>
                                            <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded-md text-white font-medium">{payment.method}</span>
                                        </div>
                                        <div className="mt-3 bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-evera-muted">Gateway Ref</span>
                                                <span className="text-white font-medium">{payment.transactionId}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-evera-muted">Customer UTR</span>
                                                <span className="text-indigo-400 font-medium">UTRC-{payment.transactionId.replace(/\D/g, '') || payment.id.replace(/\D/g, '') || '9982123'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-evera-muted">Network</span>
                                                <span className="text-white font-medium">Razorpay / {payment.method.includes('UPI') ? 'NPCI' : 'Visa/Mastercard'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="relative">
                                        <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full ${payment.holding_status === 'ESCROW' || payment.holding_status === 'WALLET' || payment.holding_status === 'SETTLED' || payment.status === 'COMPLETED' ? 'bg-indigo-500/20 border-indigo-500' : 'bg-evera-bg border-evera-border'} border flex items-center justify-center`}>
                                            {(payment.holding_status === 'ESCROW' || payment.holding_status === 'WALLET' || payment.holding_status === 'SETTLED' || payment.status === 'COMPLETED') && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                                        </div>
                                        <p className={`text-sm font-bold ${payment.holding_status === 'ESCROW' || payment.holding_status === 'WALLET' || payment.holding_status === 'SETTLED' || payment.status === 'COMPLETED' ? 'text-white' : 'text-evera-muted'}`}>Holding in Escrow</p>
                                        {(payment.holding_status === 'ESCROW' || payment.holding_status === 'WALLET' || payment.holding_status === 'SETTLED' || payment.status === 'COMPLETED') && (
                                            <div className="mt-3 bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-evera-muted">Internal Escrow Ref</span>
                                                    <span className="text-white font-medium">ESC-{payment.id.split('-')[1] || payment.id.replace(/\D/g, '')}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-evera-muted">Holding Policy</span>
                                                    <span className="text-gray-400 font-medium">24 hours after acceptance</span>
                                                </div>
                                            </div>
                                        )}
                                        {payment.holding_status === 'ESCROW' && <p className="text-xs text-indigo-400 mt-2 italic">Awaiting 24hr escrow clearance...</p>}
                                    </div>

                                    <div className="relative">
                                        <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full ${payment.holding_status === 'WALLET' || payment.holding_status === 'SETTLED' || (payment.status === 'COMPLETED' && payment.holding_status !== 'ESCROW') ? 'bg-indigo-500/20 border-indigo-500' : 'bg-evera-bg border-evera-border'} border flex items-center justify-center`}>
                                            {(payment.holding_status === 'WALLET' || payment.holding_status === 'SETTLED' || (payment.status === 'COMPLETED' && payment.holding_status !== 'ESCROW')) && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className={`text-sm font-bold ${payment.holding_status === 'WALLET' || payment.holding_status === 'SETTLED' || (payment.status === 'COMPLETED' && payment.holding_status !== 'ESCROW') ? 'text-white' : 'text-evera-muted'}`}>Credited to Vendor Wallet</p>
                                                {(payment.holding_status === 'WALLET' || payment.holding_status === 'SETTLED' || (payment.status === 'COMPLETED' && payment.holding_status !== 'ESCROW')) && <p className="text-xs text-evera-muted mt-0.5">{payment.acceptedAt || payment.createdAt}</p>}
                                            </div>
                                            {(payment.holding_status === 'WALLET' || payment.holding_status === 'SETTLED' || (payment.status === 'COMPLETED' && payment.holding_status !== 'ESCROW')) && <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-md text-indigo-400 font-bold">WALLET</span>}
                                        </div>
                                        
                                        {(payment.holding_status === 'WALLET' || payment.holding_status === 'SETTLED' || (payment.status === 'COMPLETED' && payment.holding_status !== 'ESCROW')) && (
                                            <div className="mt-3 bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-evera-muted">Ledger Txn</span>
                                                    <span className="text-white font-medium">LDG-{payment.transactionId.replace(/\D/g, '5') || '559123'}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-evera-muted">Net Wallet Amount</span>
                                                    <span className="text-indigo-400 font-bold">₹{payment.net_amount?.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full ${payment.holding_status === 'SETTLED' ? 'bg-green-500/20 border-green-500' : 'bg-evera-bg border-evera-border'} border flex items-center justify-center`}>
                                            {payment.holding_status === 'SETTLED' && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className={`text-sm font-bold ${payment.holding_status === 'SETTLED' ? 'text-green-400' : 'text-evera-muted'}`}>Settled to Bank Account</p>
                                                {payment.holding_status === 'SETTLED' ? (
                                                    <p className="text-xs text-evera-muted mt-0.5">{payment.settlement_time || 'Completed'}</p>
                                                ) : (
                                                    <p className="text-xs text-evera-muted mt-0.5">Approx 12 hrs from Wallet transfer</p>
                                                )}
                                            </div>
                                            {payment.holding_status === 'SETTLED' && <span className="text-[10px] bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-md text-green-400 font-bold">BANK</span>}
                                        </div>
                                        {payment.holding_status === 'SETTLED' && payment.bankDetails && (
                                            <div className="mt-3 bg-green-500/5 border border-green-500/10 rounded-xl p-3 text-xs space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-green-500/70">Bank UTR</span>
                                                    <span className="text-green-400 font-medium">BNK-UTR-{payment.transactionId.replace(/\D/g, '8') || '88392'}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-green-500/70">Destination</span>
                                                    <span className="text-green-400 font-medium">{payment.bankDetails.bank_name} ending in {payment.bankDetails.account_no?.slice(-4) || 'XXXX'}</span>
                                                </div>
                                            </div>
                                        )}
                                        {payment.holding_status === 'WALLET' && (
                                            <p className="text-xs text-orange-400 mt-2 italic">Vendor can initiate transfer to bank...</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reconciliation Details (If Available) */}
                    {reconDetails && (
                        <div className="bg-evera-card rounded-2xl border border-evera-border p-6">
                            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                                <Icons.Filter size={16} className="text-yellow-500" />
                                Reconciliation Overview
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-evera-muted">Status</span>
                                    <span className={`font-bold ${reconDetails.status === 'MATCHED' ? 'text-green-500' : reconDetails.status === 'DISCREPANCY' ? 'text-red-500' : 'text-yellow-500'}`}>{reconDetails.status}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-evera-muted">Settlement Ref</span>
                                    <span className="text-white font-mono">{reconDetails.settlementId || '-'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-evera-muted">Difference</span>
                                    <span className={`font-mono ${reconDetails.difference ? 'text-red-400 font-bold' : 'text-white'}`}>
                                        {reconDetails.difference ? `₹${reconDetails.difference.toLocaleString()}` : '-'}
                                    </span>
                                </div>
                                
                                {(reconDetails.status === 'UNMATCHED' || reconDetails.status === 'DISCREPANCY') && (
                                    <div className="pt-4 mt-2 border-t border-evera-border flex gap-3">
                                        <button 
                                            onClick={reconDetails.onForceMatch}
                                            className="flex-1 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/30 rounded-xl font-bold text-xs transition-all"
                                        >
                                            Force Match
                                        </button>
                                        <button 
                                            onClick={reconDetails.onResolveDiff}
                                            className="flex-1 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded-xl font-bold text-xs transition-all"
                                        >
                                            Resolve Diff
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="bg-evera-card rounded-2xl border border-evera-border p-6 space-y-3">
                        <h3 className="text-sm font-bold text-white mb-4">Support Actions</h3>
                        
                        {payment.status !== 'COMPLETED' && payment.status !== 'REFUNDED' && handleRefund && (
                            <button 
                                onClick={() => setShowRefundModal(true)}
                                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl font-bold text-sm transition-all"
                            >
                                Initiate Refund
                            </button>
                        )}
                        <button 
                            onClick={handleDownloadInvoice}
                            className="w-full py-3 bg-evera-primary/10 hover:bg-evera-primary/20 text-evera-primary border border-evera-primary/30 rounded-xl font-bold text-sm transition-all"
                        >
                            Download Invoice
                        </button>
                        <button 
                            onClick={handleCreateTicket}
                            className="w-full py-3 bg-evera-bg hover:bg-white/5 text-evera-muted hover:text-white border border-evera-border rounded-xl font-bold text-sm transition-all"
                        >
                            Create Support Ticket
                        </button>
                    </div>
                </div>
            </div>

            {/* Refund Modal */}
            {showRefundModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-evera-card border border-evera-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-evera-border">
                            <h3 className="text-xl font-black text-white">Confirm Refund</h3>
                            <p className="text-sm text-evera-muted mt-1">Please verify details before processing.</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-evera-bg rounded-xl p-4 border border-evera-border/50">
                                <p className="text-[10px] text-evera-muted uppercase font-bold tracking-wider mb-2">Customer Details</p>
                                <p className="text-sm font-bold text-white">{payment.customer?.name || 'N/A'}</p>
                                <p className="text-sm text-evera-muted">{payment.customer?.phone || 'N/A'}</p>
                            </div>
                            {payment.vendor && (
                                <div className="bg-evera-bg rounded-xl p-4 border border-evera-border/50">
                                    <p className="text-[10px] text-evera-muted uppercase font-bold tracking-wider mb-2">Vendor Details</p>
                                    <p className="text-sm font-bold text-white">{payment.vendor.name}</p>
                                    <p className="text-sm text-evera-muted">{payment.vendor.phone}</p>
                                </div>
                            )}
                            <div className="bg-evera-bg rounded-xl p-4 border border-evera-border/50">
                                <p className="text-[10px] text-evera-muted uppercase font-bold tracking-wider mb-2">Bank / UPI Info</p>
                                <p className="text-sm font-bold text-white">{payment.bankDetails?.bank_name || payment.method}</p>
                                <p className="text-sm text-evera-muted">Acc/UPI: {payment.bankDetails?.account_no || 'Linked to method'}</p>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-red-500/5 rounded-xl border border-red-500/20">
                                <span className="text-sm font-bold text-white">Refund Amount</span>
                                <span className="text-xl font-black text-red-400">₹{payment.amount.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="p-4 border-t border-evera-border flex gap-3 bg-evera-bg/50">
                            <button 
                                onClick={() => setShowRefundModal(false)}
                                className="flex-1 py-2.5 rounded-xl border border-evera-border text-white font-bold hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    setShowRefundModal(false);
                                    if (handleRefund) handleRefund(payment.id, payment.amount);
                                }}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all"
                            >
                                Process Refund
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
