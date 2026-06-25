import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import * as api from '../../api/service';
import { Column, DataTable } from '../ui/DataTable';
import { StatusBadge } from '../ui/StatusBadge';
import { Settlement, Payment } from '../../types';
import { Icons } from '../ui/Icons';
import { ProcessTransferModal } from './ProcessTransferModal';
import { InvoiceModal } from './InvoiceModal';


interface SettlementDetailViewProps {
    settlement: Settlement;
    onBack: () => void;
    onStatusChange: (id: string, newStatus: string, utrDetails?: any) => void;
}

export const SettlementDetailView: React.FC<SettlementDetailViewProps> = ({ settlement, onBack, onStatusChange }) => {
    const { addNotification } = useApp();
    const [showVendorDetails, setShowVendorDetails] = useState(false);
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

    const handleProcessTransfer = async (utrData: { utrNumber: string; transactionNo: string; date: string; time: string }) => {
        const res = await api.processSettlement(settlement.id, utrData);
        if (res.success) {
            onStatusChange(settlement.id, 'COMPLETED', utrData);
            addNotification('Settlement processed successfully with Bank details recorded.');
            setIsProcessModalOpen(false);
        }
    };

    const { setTickets, adminUser } = useApp();
    const [showFlagConfirmation, setShowFlagConfirmation] = useState(false);

    const handleFlagDiscrepancy = () => {
        const newTicket = {
            id: `t-${Date.now()}`,
            ticketNumber: `T-SET-${Math.floor(Math.random() * 10000)}`,
            customerId: settlement.vendorId, 
            customerName: settlement.vendorName,
            customerEmail: 'vendor@example.com',
            subject: `Settlement Discrepancy: ${settlement.id}`,
            description: `Auto-generated ticket for Settlement Discrepancy.\\nVendor: ${settlement.vendorName}\\nPeriod: ${settlement.period.from} to ${settlement.period.to}\\nAmount: ₹${settlement.amount}\\n\\nPlease investigate this settlement discrepancy.`,
            category: 'PAYMENT',
            priority: 'HIGH',
            status: 'OPEN',
            assignedDepartment: 'FINANCE',
            createdAt: new Date().toLocaleString(),
            updatedAt: new Date().toLocaleString(),
            tags: ['finance', 'settlement', settlement.id],
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
        addNotification(`Discrepancy Ticket ${newTicket.ticketNumber} created and assigned to Support.`);
        setShowFlagConfirmation(false);
    };

    const handleDownloadReport = () => {
        addNotification(`Downloading Settlement Report for ${settlement.id}`);
    };

    const vendor = null;

    // Filter payments that belong to this settlement
    const includedPayments = [];

    const paymentColumns: Column<any>[] = [
        { header: 'Txn Ref', accessorKey: 'transactionId' },
        { header: 'Date', accessorKey: 'createdAt', cell: (p) => p.createdAt.split(' ')[0] },
        { header: 'Service', accessorKey: 'serviceName' },
        { header: 'Net Amount', accessorKey: 'net_amount', cell: (p) => `₹${p.net_amount.toLocaleString()}` }
    ];

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
                            <h4 className="text-xl md:text-2xl font-black text-white tracking-tight">Settlement Details</h4>
                            <p className="text-xs text-evera-muted font-mono mt-1">Ref: {settlement.id}</p>
                        </div>
                        <StatusBadge status={settlement.status} className="px-4 py-1.5 text-sm w-max" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Financial Summary */}
                    <div className="bg-evera-card rounded-2xl border border-evera-border p-6 md:p-8">
                        <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Financial Breakdown</h3>
                        
                        <div className="flex flex-col space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-evera-border/30">
                                <span className="text-evera-muted">Total Gross Volume</span>
                                <span className="text-white font-mono text-lg">₹{settlement.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-evera-border/30">
                                <span className="text-evera-muted">Platform Commission Deducted</span>
                                <span className="text-red-400 font-mono text-lg">- ₹{settlement.commission.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-white font-black text-lg">Final Net Payout</span>
                                <span className="text-green-400 font-mono font-black text-2xl">₹{settlement.netAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Info */}
                    <div className="bg-evera-card rounded-2xl border border-evera-border p-6 md:p-8">
                        <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Timeline</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-evera-bg/50 p-4 rounded-xl border border-evera-border/50">
                                <p className="text-xs text-evera-muted uppercase mb-1">Period Start</p>
                                <p className="text-white font-bold">{settlement.period.from}</p>
                            </div>
                            <div className="bg-evera-bg/50 p-4 rounded-xl border border-evera-border/50">
                                <p className="text-xs text-evera-muted uppercase mb-1">Period End</p>
                                <p className="text-white font-bold">{settlement.period.to}</p>
                            </div>
                            <div className="bg-evera-bg/50 p-4 rounded-xl border border-evera-border/50">
                                <p className="text-xs text-evera-muted uppercase mb-1">Scheduled Payout</p>
                                <p className="text-white font-bold">{settlement.scheduledDate}</p>
                            </div>
                            {settlement.completedDate && (
                                <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20 md:col-span-3">
                                    <p className="text-xs text-green-500 uppercase mb-1">Successfully Processed On</p>
                                    <p className="text-white font-bold">{settlement.completedDate}</p>
                                    
                                    {settlement.utrDetails && (
                                        <div className="mt-3 grid grid-cols-2 gap-4 pt-3 border-t border-green-500/20">
                                            <div>
                                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center mb-4">
                                                    <p className="text-sm text-green-400 font-bold mb-1 flex items-center justify-center gap-2">
                                                        <Icons.CheckCircle2 size={16} /> Processed Successfully
                                                    </p>
                                                    <p className="text-xs text-evera-muted">This settlement has been processed.</p>
                                                </div>
                                                <button 
                                                    onClick={() => setIsInvoiceModalOpen(true)}
                                                    className="w-full py-3 bg-[#f48c25]/10 hover:bg-[#f48c25]/20 text-[#f48c25] border border-[#f48c25]/30 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2"
                                                >
                                                    <Icons.Mail size={18} /> Generate & Send Invoice
                                                </button>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-green-500/70 uppercase">UTR Number</p>
                                                <p className="text-sm font-mono text-white">{settlement.utrDetails.utrNumber}</p>
                                                <p className="text-[10px] text-green-500/70 uppercase mt-2">Transaction ID</p>
                                                <p className="text-sm font-mono text-white">{settlement.utrDetails.transactionNo}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Included Payments */}
                    <div className="bg-evera-card rounded-2xl border border-evera-border p-6">
                        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex justify-between items-center">
                            <span>Transactions Included</span>
                            <span className="bg-evera-primary/20 text-evera-primary px-2 py-0.5 rounded text-xs">
                                {includedPayments.length} records
                            </span>
                        </h3>
                        
                        <DataTable 
                            columns={paymentColumns}
                            data={includedPayments}
                            emptyMessage="No payments specifically linked"
                        />
                    </div>
                </div>

                {/* Right Column - Vendor & Actions */}
                <div className="space-y-6">
                    <div className="bg-evera-card rounded-2xl border border-evera-border p-6 space-y-4">
                        <h3 className="text-sm font-bold text-white mb-4">Vendor Profile</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                <Icons.Users size={20} className="text-evera-muted" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{settlement.vendorName}</h4>
                                <p className="text-xs text-evera-muted">Vendor ID: {settlement.vendorId}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowVendorDetails(!showVendorDetails)}
                            className="w-full mt-4 py-2 border border-evera-border hover:bg-white/5 rounded-lg text-sm text-evera-muted transition-colors"
                        >
                            {showVendorDetails ? 'Hide Profile Details' : 'View Full Profile'}
                        </button>
                        
                        {showVendorDetails && vendor && (
                            <div className="mt-4 p-4 bg-black/30 rounded-xl border border-evera-border/30 space-y-3 animate-fade-in text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-evera-muted">Role</span>
                                    <span className="text-white font-medium">{vendor.role}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-evera-muted">Email</span>
                                    <span className="text-white font-medium truncate max-w-[150px]">{vendor.email}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-evera-muted">Rating</span>
                                    <span className="text-yellow-500 font-bold">{vendor.rating > 0 ? `${vendor.rating} ★` : 'New'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-evera-muted">Jobs Completed</span>
                                    <span className="text-white font-medium">{vendor.jobsCompleted}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                    <span className="text-evera-muted">Status</span>
                                    <StatusBadge status={vendor.status} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-evera-card rounded-2xl border border-evera-border p-6 space-y-3">
                        <h3 className="text-sm font-bold text-white mb-4">Support Actions</h3>
                        
                        {settlement.status === 'PENDING' && (
                            <button 
                                onClick={() => setIsProcessModalOpen(true)}
                                className="w-full py-3 bg-evera-primary hover:bg-evera-primary/90 text-black rounded-xl font-black text-sm transition-all shadow-[0_0_15px_rgba(243,156,18,0.3)] flex justify-center items-center gap-2"
                            >
                                <Icons.Check size={18} /> Process Bank Transfer
                            </button>
                        )}

                        <button 
                            onClick={handleDownloadReport}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold text-sm transition-all"
                        >
                            Download Full Report
                        </button>

                        {!showFlagConfirmation && (
                            <button 
                                onClick={() => setShowFlagConfirmation(true)}
                                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl font-bold text-sm transition-all"
                            >
                                Flag Discrepancy
                            </button>
                        )}

                        {showFlagConfirmation && (
                            <div className="w-full p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-4 animate-fade-in">
                                <h4 className="text-sm font-bold text-red-400">Confirm Discrepancy</h4>
                                <p className="text-xs text-evera-muted">
                                    You are about to flag this settlement for discrepancy. This will generate a high-priority support ticket assigned to the Finance Support team for investigation.
                                </p>
                                <div className="flex gap-2 pt-2">
                                    <button 
                                        onClick={() => setShowFlagConfirmation(false)}
                                        className="flex-1 py-2 text-xs font-bold text-evera-muted hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleFlagDiscrepancy}
                                        className="flex-1 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                                    >
                                        Confirm Flag
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <ProcessTransferModal
                isOpen={isProcessModalOpen}
                onClose={() => setIsProcessModalOpen(false)}
                onSubmit={handleProcessTransfer}
                amount={settlement.netAmount}
                recipientName={settlement.vendorName}
                commission={settlement.commission}
                gst={settlement.commission * 0.18}
            />

            <InvoiceModal
                isOpen={isInvoiceModalOpen}
                onClose={() => setIsInvoiceModalOpen(false)}
                type="SETTLEMENT"
                data={{
                    id: settlement.id,
                    recipientName: settlement.vendorName,
                    amount: settlement.netAmount,
                    commission: settlement.commission,
                    gst: settlement.commission * 0.18,
                    utrDetails: settlement.utrDetails,
                    bankDetails: { bankName: 'Registered Bank', accountNumber: '****' + settlement.id.substring(4, 8) }
                }}
            />
        </div>
    );
};
