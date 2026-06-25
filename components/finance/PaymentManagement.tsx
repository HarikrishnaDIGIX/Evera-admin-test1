import { useApp } from '../../context/AppContext';
import { Payment } from '../../types';
import * as api from '../../api/service';
import { Column, DataTable } from '../ui/DataTable';
import { StatusBadge } from '../ui/StatusBadge';
import { Icons } from '../ui/Icons';
import { SearchBar } from '../ui/SearchBar';
import { PaymentDetailView } from './PaymentDetailView';
import React, { useState, useEffect } from 'react';


export const PaymentManagement: React.FC<{ dateRangeLabel?: string }> = ({ dateRangeLabel = 'Last 30 Days' }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [historyTab, setHistoryTab] = useState<'customer' | 'vendor'>('customer');
    const { addNotification } = useApp();

    useEffect(() => {
        loadPayments();
    }, [dateRangeLabel]);

    const loadPayments = async () => {
        setIsLoading(true);
        try {
            const res = await api.fetchPayments();
            if (res.success && res.data) {
                setPayments(res.data);
            } else {
                setPayments([]);
            }
        } catch (e) {
            console.error(e);
            setPayments([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefund = async (id: string, amount: number) => {
        if (confirm('Process refund for this payment?')) {
            const res = await api.processRefund(id, amount);
            if (res.success) {
                addNotification('Refund processed successfully');
                loadPayments(); // In reality we'd update local state to avoid refetch
            }
        }
    };

    const columns: Column<Payment>[] = [
        { header: 'ID', accessorKey: 'id', className: 'w-16 text-xs text-evera-muted' },
        { header: 'Date', accessorKey: 'createdAt' },
        { header: 'Amount', accessorKey: 'amount', cell: (p) => `₹${p.amount}` },
        { header: 'Method', accessorKey: 'method' },
        { header: 'Booking ID', accessorKey: 'bookingId' },
        { header: 'Status', accessorKey: 'status', cell: (p) => <StatusBadge status={p.status} /> },
        {
            header: 'Actions',
            cell: (p) => (
                p.status === 'COMPLETED' ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); handleRefund(p.id, p.amount); }}
                        className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-2 py-1 rounded"
                    >
                        Refund
                    </button>
                ) : null
            )
        }
    ];

    const filteredPayments = payments.filter(p => {
        const matchesSearch = p.transactionId.toLowerCase().includes(search.toLowerCase()) ||
                            p.bookingId.toLowerCase().includes(search.toLowerCase()) ||
                            p.id.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filterStatus === 'ALL' || p.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const handleExport = () => {
        addNotification('Generating CSV report...');
        
        if (filteredPayments.length === 0) {
            addNotification('No data to export.');
            return;
        }

        const headers = ['ID', 'Booking ID', 'Transaction ID', 'Date', 'Amount', 'Status', 'Method', 'Customer Name', 'Vendor Name', 'Platform Fee', 'Commission', 'Tax', 'Net Amount'];
        
        const csvRows = [
            headers.join(','),
            ...filteredPayments.map(p => {
                return [
                    p.id,
                    p.bookingId,
                    p.transactionId,
                    `"${p.createdAt}"`,
                    p.amount,
                    p.status,
                    p.method,
                    `"${p.customer?.name || ''}"`,
                    `"${p.vendor?.name || ''}"`,
                    p.platform_fee || 0,
                    p.commission || 0,
                    p.tax || 0,
                    p.net_amount || 0
                ].join(',');
            })
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `payments_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        addNotification('Payment report exported successfully');
    };

    const stats = {
        total: payments.length,
        completed: payments.filter(p => p.status === 'COMPLETED').length,
        pending: payments.filter(p => p.status === 'PENDING').length,
        refunded: payments.filter(p => p.status === 'REFUNDED').length,
    };

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Payment Management</h2>
                    <p className="text-sm text-evera-muted">Monitor and manage all platform transactions <span className="font-bold text-evera-primary ml-1">({dateRangeLabel})</span></p>
                </div>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={handleExport}
                        className="px-4 py-2 bg-evera-card border border-evera-border rounded-xl text-white text-sm font-medium hover:bg-evera-card/50 transition-colors flex items-center space-x-2"
                    >
                        <Icons.Download size={16} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats & Tabs */}
            {!selectedPayment && (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-evera-card/30 p-2 rounded-2xl border border-evera-border/50">
                <div className="flex p-1 bg-evera-bg rounded-xl space-x-1">
                    {['ALL', 'COMPLETED', 'PENDING', 'REFUNDED', 'FAILED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                filterStatus === status 
                                    ? 'bg-evera-primary text-white shadow-lg shadow-evera-primary/20' 
                                    : 'text-evera-muted hover:text-white'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                
                <div className="flex items-center space-x-6 px-4">
                    <div className="text-center">
                        <p className="text-[10px] text-evera-muted uppercase font-bold tracking-widest">Total Volume</p>
                        <p className="text-lg font-bold text-white">₹{payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString()}</p>
                    </div>
                    <div className="h-8 w-px bg-evera-border" />
                    <div className="text-center">
                        <p className="text-[10px] text-evera-muted uppercase font-bold tracking-widest">Success Rate</p>
                        <p className="text-lg font-bold text-green-500">
                            {payments.length ? ((stats.completed / payments.length) * 100).toFixed(1) : 0}%
                        </p>
                    </div>
                </div>

                <div className="w-full lg:w-72">
                    <SearchBar value={search} onChange={setSearch} placeholder="Search transaction or booking ID..." />
                </div>
            </div>
            )}

            {!selectedPayment ? (
                <div className="bg-evera-card border border-evera-border rounded-2xl overflow-hidden shadow-xl relative">
                    <DataTable
                        columns={columns}
                        data={filteredPayments}
                        isLoading={isLoading}
                        emptyMessage="No payments found matching your criteria"
                        onRowClick={(row) => setSelectedPayment(row)}
                    />
                </div>
            ) : (
                <PaymentDetailView 
                    payment={selectedPayment}
                    onBack={() => setSelectedPayment(null)}
                    handleRefund={handleRefund}
                />
            )}
        </div>
    );
};
