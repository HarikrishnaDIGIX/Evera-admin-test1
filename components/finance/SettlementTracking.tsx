import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../ui/DataTable';
import { StatusBadge } from '../ui/StatusBadge';
import { Settlement } from '../../types';
import * as api from '../../api/service';
import { SettlementDetailView } from './SettlementDetailView';
import { ProcessTransferModal } from './ProcessTransferModal';
import { Icons } from '../ui/Icons';

export const SettlementTracking: React.FC<{ dateRangeLabel?: string, dateRangeValue?: string }> = ({ dateRangeLabel = 'Last 30 Days' }) => {
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
    const [processModalSettlement, setProcessModalSettlement] = useState<Settlement | null>(null);
    const { addNotification } = useApp();

    useEffect(() => {
        loadSettlements();
    }, [dateRangeLabel]);

    const loadSettlements = async () => {
        setIsLoading(true);
        try {
            const res = await api.fetchSettlements();
            if (res.success && res.data) {
                setSettlements(res.data);
            } else {
                setSettlements([]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInlineProcess = async (utrData: { utrNumber: string; transactionNo: string; date: string; time: string }) => {
        if (!processModalSettlement) return;
        const res = await api.processSettlement(processModalSettlement.id, utrData);
        if (res.success) {
            setSettlements(prev => prev.map(s => s.id === processModalSettlement.id ? { 
                ...s, 
                status: 'COMPLETED', 
                completedDate: new Date().toISOString().split('T')[0],
                utrDetails: utrData
            } : s));
            addNotification('Settlement processed successfully with Bank details recorded.');
            setProcessModalSettlement(null);
        }
    };

    const columns: Column<Settlement>[] = [
        { header: 'ID', accessorKey: 'id', className: 'text-xs text-evera-muted' },
        { header: 'Vendor', accessorKey: 'vendorName', cell: (s) => (s.vendorName || '—') },
        {
            header: 'Period', cell: (s) => {
                const period = s.period;
                if (!period) return <span className="text-xs text-evera-muted">—</span>;
                return <span className="text-xs text-evera-muted">{period.from} - {period.to}</span>;
            }
        },
        { header: 'Total', accessorKey: 'amount', cell: (s) => `₹${Number(s.amount || 0).toLocaleString()}` },
        { header: 'Net Payout', accessorKey: 'netAmount', cell: (s) => <span className="font-bold text-green-400">₹{Number(s.netAmount || 0).toLocaleString()}</span> },
        { header: 'Due Date', accessorKey: 'scheduledDate', cell: (s) => s.scheduledDate || '—' },
        { header: 'Status', accessorKey: 'status', cell: (s) => <StatusBadge status={s.status} /> },
        {
            header: 'Actions',
            cell: (s) => (
                s.status === 'PENDING' ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); setProcessModalSettlement(s); }}
                        className="px-3 py-1 bg-evera-primary rounded hover:bg-orange-600 text-xs text-white shadow-[0_0_10px_rgba(243,156,18,0.2)] font-bold flex items-center gap-1"
                    >
                        <Icons.Check size={14} /> Process
                    </button>
                ) : null
            )
        }
    ];

    if (selectedSettlement) {
        return (
            <SettlementDetailView 
                settlement={selectedSettlement}
                onBack={() => setSelectedSettlement(null)}
                onStatusChange={(id, newStatus, utrDetails) => {
                    setSettlements(prev => prev.map(s => s.id === id ? { ...s, status: newStatus as any, completedDate: new Date().toISOString().split('T')[0], utrDetails } : s));
                    setSelectedSettlement(prev => prev ? { ...prev, status: newStatus as any, completedDate: new Date().toISOString().split('T')[0], utrDetails } : null);
                }}
            />
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-white">Settlement Tracking</h2>
            <DataTable
                columns={columns}
                data={settlements}
                isLoading={isLoading}
                emptyMessage="No settlements pending"
                onRowClick={(s) => setSelectedSettlement(s)}
            />
            
            {processModalSettlement && (
                <ProcessTransferModal
                    isOpen={true}
                    onClose={() => setProcessModalSettlement(null)}
                    onSubmit={handleInlineProcess}
                    amount={processModalSettlement.netAmount}
                    recipientName={processModalSettlement.vendorName}
                />
            )}
        </div>
    );
};
