import React, { useState } from 'react';
import { DataTable, Column } from '../ui/DataTable';
import { StatusBadge } from '../ui/StatusBadge';
import { Icons } from '../ui/Icons';
import { useApp } from '../../context/AppContext';
import { ProcessTransferModal } from './ProcessTransferModal';
import { InvoiceModal } from './InvoiceModal';
import * as api from '../../api/service';

interface WithdrawalRequest {
    id: string;
    requesterType: 'VENDOR' | 'USER';
    requesterId: string;
    requesterName: string;
    amount: number;
    walletBalance: number;
    requestDate: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    bankDetails: {
        accountName: string;
        accountNumber: string;
        bankName: string;
        ifscCode: string;
    };
    transactions: {
        id: string;
        service: string;
        relatedParty: string;
        date: string;
        amount: number;
    }[];
    utrDetails?: {
        utrNumber: string;
        transactionNo: string;
        date: string;
        time: string;
    };
}


export const Withdrawals: React.FC = () => {
    const { addNotification } = useApp();
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
    const [activeTab, setActiveTab] = useState<'VENDOR' | 'USER'>('VENDOR');
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

    const filteredWithdrawals = withdrawals.filter(w => w.requesterType === activeTab);

    const columns: Column<WithdrawalRequest>[] = [
        { header: 'ID', accessorKey: 'id', className: 'text-xs text-evera-muted' },
        { header: activeTab === 'VENDOR' ? 'Vendor' : 'User', accessorKey: 'requesterName', cell: (w) => <span className="font-bold text-white">{w.requesterName}</span> },
        { header: 'Amount', accessorKey: 'amount', cell: (w) => <span className="font-bold text-green-400">₹{w.amount.toLocaleString()}</span> },
        { header: 'Date', accessorKey: 'requestDate' },
        { header: 'Status', accessorKey: 'status', cell: (w) => <StatusBadge status={w.status} /> },
        {
            header: 'Actions',
            cell: (w) => (
                <button
                    onClick={(e) => { e.stopPropagation(); setSelectedRequest(w); }}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white transition-colors"
                >
                    Review
                </button>
            )
        }
    ];

    const handleApproveClick = () => {
        setIsProcessModalOpen(true);
    };

    const handleProcessTransfer = (utrData: { utrNumber: string; transactionNo: string; date: string; time: string }) => {
        if (!selectedRequest) return;
        setWithdrawals(prev => prev.map(w => w.id === selectedRequest.id ? { 
            ...w, 
            status: 'APPROVED',
            utrDetails: utrData
        } : w));
        
        // Update selectedRequest so UI updates immediately
        setSelectedRequest(prev => prev ? { ...prev, status: 'APPROVED', utrDetails: utrData } : null);
        
        api.addMockPayment({
            id: `PAY-${Math.floor(Math.random() * 10000)}`,
            bookingId: '—',
            vendorId: selectedRequest.requesterId,
            customerId: 'ADMIN',
            amount: selectedRequest.amount,
            status: 'COMPLETED',
            method: 'BANK_TRANSFER',
            transactionId: utrData.transactionNo,
            createdAt: `${utrData.date} ${utrData.time}`,
            tax: 0,
            commission: 0,
            platform_fee: 0,
            net_amount: selectedRequest.amount,
            serviceName: 'Withdrawal Payout',
            category: 'Finance',
            customer: { name: 'Evera Platform', email: 'finance@evera.com', phone: '' },
            vendor: { name: selectedRequest.requesterName, email: '', phone: '', rating: 0, joinedDate: '', totalJobs: 0 },
            bankDetails: null,
            requestedAt: selectedRequest.requestDate,
            acceptedAt: `${utrData.date} ${utrData.time}`,
            settlement_time: `${utrData.date} ${utrData.time}`,
            holding_status: 'SETTLED'
        });
        
        addNotification(`Withdrawal ${selectedRequest.id} has been processed and marked as APPROVED.`);
    };

    const handleReject = () => {
        if (!selectedRequest) return;
        setWithdrawals(prev => prev.map(w => w.id === selectedRequest.id ? { ...w, status: 'REJECTED' } : w));
        addNotification(`Withdrawal ${selectedRequest.id} has been rejected.`);
        setSelectedRequest(null);
    };

    if (selectedRequest) {
        return (
            <div className="space-y-6 animate-fade-in pb-20">
                <div className="flex items-center gap-4 bg-evera-card p-4 md:p-6 rounded-2xl border border-evera-border shadow-sm">
                    <button 
                        onClick={() => setSelectedRequest(null)}
                        className="p-2 md:p-3 bg-evera-bg hover:bg-evera-primary/10 rounded-xl text-evera-muted hover:text-evera-primary transition-all border border-evera-border"
                    >
                        <Icons.ChevronRight className="rotate-180" size={20} />
                    </button>
                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div>
                                <h4 className="text-xl md:text-2xl font-black text-white tracking-tight">Withdrawal Request</h4>
                                <p className="text-xs text-evera-muted font-mono mt-1">Ref: {selectedRequest.id}</p>
                            </div>
                            <StatusBadge status={selectedRequest.status} className="px-4 py-1.5 text-sm w-max" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-evera-card rounded-2xl border border-evera-border p-6 md:p-8">
                            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Transfer Details</h3>
                            <div className="flex flex-col space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-evera-border/30">
                                    <span className="text-evera-muted">{selectedRequest.requesterType === 'VENDOR' ? 'Vendor' : 'User'}</span>
                                    <span className="text-white font-bold">{selectedRequest.requesterName}</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-evera-border/30">
                                    <span className="text-evera-muted">Request Date</span>
                                    <span className="text-white font-bold">{selectedRequest.requestDate}</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-evera-border/30">
                                    <span className="text-evera-muted">Current Wallet Balance</span>
                                    <span className="text-white font-mono font-bold">₹{selectedRequest.walletBalance.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-white font-black text-lg">Requested Amount</span>
                                    <span className="text-green-400 font-mono font-black text-2xl">₹{selectedRequest.amount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-evera-card rounded-2xl border border-evera-border p-6 md:p-8">
                            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                                <Icons.CreditCard size={18} className="text-evera-primary" />
                                Destination Bank Account
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-6 rounded-xl border border-evera-border/50">
                                <div>
                                    <p className="text-xs text-evera-muted uppercase mb-1">Account Holder Name</p>
                                    <p className="text-white font-bold">{selectedRequest.bankDetails.accountName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-evera-muted uppercase mb-1">Bank Name</p>
                                    <p className="text-white font-bold">{selectedRequest.bankDetails.bankName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-evera-muted uppercase mb-1">Account Number</p>
                                    <p className="text-white font-mono text-lg tracking-wider bg-white/5 px-3 py-1 rounded inline-block mt-1">
                                        {selectedRequest.bankDetails.accountNumber}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-evera-muted uppercase mb-1">IFSC Code</p>
                                    <p className="text-white font-bold">{selectedRequest.bankDetails.ifscCode}</p>
                                </div>
                            </div>
                            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                <p className="text-xs text-yellow-500 flex items-start gap-2">
                                    <Icons.AlertTriangle size={14} className="mt-0.5 shrink-0" />
                                    Please ensure that you transfer the funds to the exact account detailed above from your corporate banking portal before marking this request as Approved.
                                </p>
                            </div>
                        </div>

                        <div className="bg-evera-card rounded-2xl border border-evera-border p-6 md:p-8">
                            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                                <Icons.Activity size={18} className="text-green-400" />
                                Related Wallet Transactions
                            </h3>
                            <div className="bg-black/20 rounded-xl border border-evera-border/50 overflow-hidden">
                                <DataTable
                                    columns={[
                                        { header: 'Txn ID', accessorKey: 'id', className: 'text-xs text-evera-muted' },
                                        { header: 'Service/Reason', accessorKey: 'service', className: 'text-white font-medium' },
                                        { header: 'Related Party', accessorKey: 'relatedParty', className: 'text-xs text-evera-muted' },
                                        { header: 'Date', accessorKey: 'date' },
                                        { header: 'Amount', accessorKey: 'amount', cell: (t) => <span className="font-bold text-green-400">₹{t.amount.toLocaleString()}</span> }
                                    ]}
                                    data={selectedRequest.transactions}
                                    emptyMessage="No transactions linked."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-evera-card rounded-2xl border border-evera-border p-6 space-y-4">
                            <h3 className="text-sm font-bold text-white mb-4">Actions</h3>
                            
                            {selectedRequest.status === 'PENDING' ? (
                                <>
                                    <button 
                                        onClick={handleApproveClick}
                                        className="w-full py-3 bg-evera-primary hover:bg-evera-primary/90 text-black rounded-xl font-black text-sm transition-all shadow-[0_0_15px_rgba(243,156,18,0.3)] flex justify-center items-center gap-2"
                                    >
                                        <Icons.Check size={18} /> Process Bank Transfer
                                    </button>
                                    <button 
                                        onClick={handleReject}
                                        className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2"
                                    >
                                        <Icons.Reject size={18} /> Reject Request
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                                        <p className="text-sm text-green-400 font-bold mb-1 flex items-center justify-center gap-2">
                                            <Icons.CheckCircle2 size={16} /> Processed Successfully
                                        </p>
                                        <p className="text-xs text-evera-muted">This request has been approved and processed.</p>
                                    </div>
                                    
                                    {selectedRequest.utrDetails && (
                                        <div className="p-4 bg-black/20 border border-evera-border rounded-xl space-y-3">
                                            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Processed Bank Details</h4>
                                            <div>
                                                <p className="text-[10px] text-evera-muted uppercase">UTR Number</p>
                                                <p className="text-sm font-bold text-white font-mono">{selectedRequest.utrDetails.utrNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-evera-muted uppercase">Transaction Ref</p>
                                                <p className="text-sm font-bold text-white font-mono">{selectedRequest.utrDetails.transactionNo}</p>
                                            </div>
                                            <div className="flex justify-between">
                                                <div>
                                                    <p className="text-[10px] text-evera-muted uppercase">Date</p>
                                                    <p className="text-sm text-white">{selectedRequest.utrDetails.date}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-evera-muted uppercase">Time</p>
                                                    <p className="text-sm text-white">{selectedRequest.utrDetails.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <button 
                                        onClick={() => setIsInvoiceModalOpen(true)}
                                        className="w-full mt-4 py-3 bg-[#f48c25]/10 hover:bg-[#f48c25]/20 text-[#f48c25] border border-[#f48c25]/30 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2"
                                    >
                                        <Icons.Mail size={18} /> Generate & Send Invoice
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <ProcessTransferModal
                    isOpen={isProcessModalOpen}
                    onClose={() => setIsProcessModalOpen(false)}
                    onSubmit={handleProcessTransfer}
                    amount={
                        selectedRequest.requesterType === 'VENDOR' 
                        ? selectedRequest.amount - (selectedRequest.amount * 0.1) - (selectedRequest.amount * 0.1 * 0.18)
                        : selectedRequest.amount
                    }
                    recipientName={selectedRequest.requesterName}
                    walletBalance={selectedRequest.walletBalance}
                    commission={selectedRequest.requesterType === 'VENDOR' ? selectedRequest.amount * 0.1 : undefined}
                    gst={selectedRequest.requesterType === 'VENDOR' ? selectedRequest.amount * 0.1 * 0.18 : undefined}
                    bankAccount={selectedRequest.bankDetails.accountNumber}
                    bankName={selectedRequest.bankDetails.bankName}
                />

                <InvoiceModal
                    isOpen={isInvoiceModalOpen}
                    onClose={() => setIsInvoiceModalOpen(false)}
                    type="WITHDRAWAL"
                    data={{
                        id: selectedRequest.id,
                        recipientName: selectedRequest.requesterName,
                        amount: selectedRequest.requesterType === 'VENDOR' 
                            ? selectedRequest.amount - (selectedRequest.amount * 0.1) - (selectedRequest.amount * 0.1 * 0.18)
                            : selectedRequest.amount,
                        commission: selectedRequest.requesterType === 'VENDOR' ? selectedRequest.amount * 0.1 : undefined,
                        gst: selectedRequest.requesterType === 'VENDOR' ? selectedRequest.amount * 0.1 * 0.18 : undefined,
                        utrDetails: selectedRequest.utrDetails,
                        bankDetails: selectedRequest.bankDetails
                    }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-white">Wallet to Bank Transfer Approvals</h2>
            <p className="text-sm text-evera-muted">Review and process withdrawal requests initiated from app wallets.</p>
            
            <div className="flex gap-4 border-b border-evera-border/50 mb-4">
                <button 
                    onClick={() => setActiveTab('VENDOR')}
                    className={`pb-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'VENDOR' ? 'border-evera-primary text-evera-primary' : 'border-transparent text-evera-muted hover:text-white'}`}
                >
                    Vendor Withdrawals
                </button>
                <button 
                    onClick={() => setActiveTab('USER')}
                    className={`pb-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'USER' ? 'border-evera-primary text-evera-primary' : 'border-transparent text-evera-muted hover:text-white'}`}
                >
                    User Withdrawals
                </button>
            </div>

            <DataTable
                columns={columns}
                data={filteredWithdrawals}
                emptyMessage={`No pending withdrawal requests for ${activeTab === 'VENDOR' ? 'vendors' : 'users'}.`}
                onRowClick={(w) => setSelectedRequest(w)}
            />
        </div>
    );
};
