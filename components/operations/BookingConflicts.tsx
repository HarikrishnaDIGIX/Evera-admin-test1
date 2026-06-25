import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../ui/DataTable';
import { StatusBadge } from '../ui/StatusBadge';
import { Booking } from '../../types';
import * as api from '../../api/service';

// Extended type for conflicts
interface ConflictedBooking extends Booking {
    conflictReason: string;
}

export const BookingConflicts = () => {
    const { addNotification } = useApp();
    const [conflicts, setConflicts] = useState<ConflictedBooking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadConflicts();
    }, []);

    const loadConflicts = async () => {
        setIsLoading(true);
        // Mocking conflict detection
        try {
            const res = await api.fetchBookings();
            if (res.success && res.data) {
                // Artificially create a conflict for demo
                const potentialConflicts = res.data.slice(0, 2).map(b => ({
                    ...b,
                    conflictReason: 'Double booked with event ID #' + Math.floor(Math.random() * 1000)
                }));
                setConflicts(potentialConflicts);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const resolveConflict = (id: string, action: 'reschedule' | 'cancel') => {
        addNotification(`Booking ${id} ${action}d successfully`);
        setConflicts(prev => prev.filter(b => b.id !== id));
    };

    const columns: Column<ConflictedBooking>[] = [
        { header: 'ID', accessorKey: 'id', className: 'w-16' },
        { header: 'Date', accessorKey: 'date' },
        { header: 'Time', accessorKey: 'time' },
        { header: 'Service', accessorKey: 'service' },
        { header: 'Vendor', accessorKey: 'vendorId' }, // ideally vendor name
        {
            header: 'Conflict Reason',
            accessorKey: 'conflictReason',
            className: 'text-red-400'
        },
        {
            header: 'Actions',
            cell: (b) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => resolveConflict(b.id, 'reschedule')}
                        className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded hover:bg-blue-500/30"
                    >
                        Reschedule
                    </button>
                    <button
                        onClick={() => resolveConflict(b.id, 'cancel')}
                        className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded hover:bg-red-500/30"
                    >
                        Cancel
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Booking Conflicts</h2>
            <p className="text-sm text-evera-muted">Detected scheduling overlaps needing attention.</p>

            <DataTable
                columns={columns}
                data={conflicts}
                isLoading={isLoading}
                emptyMessage="No conflicts detected"
            />
        </div>
    );
};
