import React, { useState, useEffect } from 'react';
import { Column, DataTable } from '../ui/DataTable';
import { PaymentDetailView } from './PaymentDetailView';
import { Payment, Settlement } from '../../types';
import * as api from '../../api/service';

interface ReconItem {
    id: string;
    date: string;
    paymentId: string;
    settlementId: string | null;
    amount: number;
    status: 'MATCHED' | 'UNMATCHED' | 'DISCREPANCY';
    difference?: number;
    originalPayment: Payment;
}

export const ReconciliationTool: React.FC<{ dateRangeLabel?: string, dateRangeValue?: string }> = ({ dateRangeLabel = 'Last 30 Days' }) => {
    const [items, setItems] = useState<ReconItem[]>([]);
    const [selectedRecon, setSelectedRecon] = useState<ReconItem | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadReconData = async () => {
            setIsLoading(true);
            try {
                const res = await api.fetchPayments();
                const paymentsList = res.success && res.data ? res.data : [];
                
                const settlementsRes = await api.fetchSettlements();
                const settlementsList = settlementsRes.success && settlementsRes.data ? settlementsRes.data : [];

                const generatedItems: ReconItem[] = paymentsList.map(p => {
                    const settlement = settlementsList.find(s => s.transactionIds && s.transactionIds.includes(p.id));
                    
                    let status: 'MATCHED' | 'UNMATCHED' | 'DISCREPANCY' = 'UNMATCHED';
                    let diff = 0;
                    
                    if (settlement) {
                        const totalPaymentsNet = paymentsList
                            .filter(pay => settlement.transactionIds.includes(pay.id))
                            .reduce((acc, pay) => acc + pay.net_amount, 0);
                            
                        diff = totalPaymentsNet - settlement.netAmount;
                        status = diff === 0 ? 'MATCHED' : 'DISCREPANCY';
                    }

                    return {
                        id: `recon_${p.id}`,
                        date: p.createdAt.split(' ')[0],
                        paymentId: p.transactionId,
                        settlementId: settlement ? settlement.id : null,
                        amount: p.amount,
                        status: status,
                        difference: diff !== 0 ? diff : undefined,
                        originalPayment: p
                    };
                });
                
                setItems(generatedItems);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        loadReconData();
    }, [dateRangeLabel]);

    const handleRunReconciliation = () => {
        setIsLoading(true);
        setTimeout(() => {
            setItems(prevItems => prevItems.map((item, index) => {
                // Simulate a mix of matched and discrepancy
                if (index % 3 === 1) {
                    return { 
                        ...item, 
                        status: 'DISCREPANCY', 
                        settlementId: `SET_${item.paymentId.replace('TXN_', '')}`, 
                        difference: -50 
                    };
                } else if (index % 4 === 0 && index > 0) {
                    // Leave some unmatched
                    return item;
                } else {
                    return { 
                        ...item, 
                        status: 'MATCHED', 
                        settlementId: `SET_${item.paymentId.replace('TXN_', '')}`, 
                        difference: 0 
                    };
                }
            }));
            setIsLoading(false);
        }, 1500);
    };

    const totalUnreconciled = items.filter(i => i.status !== 'MATCHED').reduce((acc, curr) => acc + curr.amount, 0);

    const columns: Column<ReconItem>[] = [
        { header: 'Date', accessorKey: 'date' },
        { header: 'Payment Ref', accessorKey: 'paymentId' },
        { header: 'Settlement Ref', accessorKey: 'settlementId', cell: (r) => r.settlementId || '-' },
        { header: 'Amount', accessorKey: 'amount', cell: (r) => `₹${r.amount}` },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (r) => {
                let color = '';
                if (r.status === 'MATCHED') color = 'bg-green-500/10 text-green-500 border-green-500/20';
                if (r.status === 'UNMATCHED') color = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
                if (r.status === 'DISCREPANCY') color = 'bg-red-500/10 text-red-500 border-red-500/20';
                return (
                    <span className={`px-2 py-0.5 rounded text-xs border ${color}`}>
                        {r.status}
                    </span>
                );
            }
        },
        {
            header: 'Diff',
            accessorKey: 'difference',
            cell: (r) => r.difference ? <span className="text-red-400 font-mono">₹{r.difference.toLocaleString()}</span> : '-'
        }
    ];

    if (selectedRecon) {
        return (
            <PaymentDetailView 
                payment={selectedRecon.originalPayment}
                onBack={() => setSelectedRecon(null)}
                reconDetails={{
                    settlementId: selectedRecon.settlementId,
                    difference: selectedRecon.difference,
                    status: selectedRecon.status,
                    onForceMatch: () => {
                        const newId = selectedRecon.settlementId || `SET_${selectedRecon.paymentId.replace('TXN_', '')}`;
                        setItems(items.map(i => i.id === selectedRecon.id ? { ...i, status: 'MATCHED', difference: 0, settlementId: newId } : i));
                        setSelectedRecon({ ...selectedRecon, status: 'MATCHED', difference: 0, settlementId: newId });
                    },
                    onResolveDiff: () => {
                        setItems(items.map(i => i.id === selectedRecon.id ? { ...i, status: 'MATCHED', difference: 0 } : i));
                        setSelectedRecon({ ...selectedRecon, status: 'MATCHED', difference: 0 });
                    }
                }}
            />
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-white">Reconciliation</h2>
            <div className="bg-evera-card p-4 rounded-xl border border-evera-border flex justify-between items-center text-sm">
                <div>
                    <span className="text-evera-muted">Total Unreconciled: </span>
                    <span className="text-white font-bold ml-1">₹{totalUnreconciled.toLocaleString()}</span>
                </div>
                <button 
                    onClick={handleRunReconciliation}
                    disabled={isLoading}
                    className="text-evera-primary hover:text-white font-bold transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Reconciling...' : 'Run Reconciliation'}
                </button>
            </div>
            <DataTable
                columns={columns}
                data={items}
                isLoading={isLoading}
                onRowClick={(r) => setSelectedRecon(r)}
            />
        </div>
    );
};
