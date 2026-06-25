import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../ui/DataTable';
import { StatusBadge } from '../ui/StatusBadge';
import { SearchBar } from '../ui/SearchBar';
import { Dispute } from '../../types';
import * as api from '../../api/service';

export const DisputeResolution = () => {
    const { addNotification } = useApp();
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadDisputes();
    }, []);

    const loadDisputes = async () => {
        setIsLoading(true);
        try {
            const res = await api.fetchDisputes();
            if (res.success && res.data) {
                setDisputes(res.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResolve = async (id: string) => {
        // In a real app this would open a modal
        if (confirm('Resolve this dispute?')) {
            const res = await api.resolveDispute(id, 'Resolved by Admin');
            if (res.success) {
                addNotification('Dispute resolved successfully');
                loadDisputes();
            }
        }
    };

    const columns: Column<Dispute>[] = [
        { header: 'ID', accessorKey: 'disputeNumber', className: 'w-24' },
        { header: 'Type', accessorKey: 'type', cell: (d) => <StatusBadge status={d.type} /> },
        { header: 'Customer', accessorKey: 'customerName' },
        { header: 'Vendor', accessorKey: 'vendorName' },
        { header: 'Status', accessorKey: 'status', cell: (d) => <StatusBadge status={d.status} /> },
        { header: 'Priority', accessorKey: 'priority', cell: (d) => <StatusBadge status={d.priority} /> },
        {
            header: 'Actions',
            cell: (d) => (
                <button
                    onClick={(e) => { e.stopPropagation(); handleResolve(d.id); }}
                    className="text-xs text-evera-primary hover:underline"
                >
                    Resolve
                </button>
            )
        }
    ];

    const filteredDisputes = disputes.filter(d =>
        d.disputeNumber.toLowerCase().includes(search.toLowerCase()) ||
        d.customerName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Dispute Resolution</h2>
                <div className="w-64">
                    <SearchBar value={search} onChange={setSearch} placeholder="Search disputes..." />
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredDisputes}
                isLoading={isLoading}
                emptyMessage="No active disputes found"
            />
        </div>
    );
};
