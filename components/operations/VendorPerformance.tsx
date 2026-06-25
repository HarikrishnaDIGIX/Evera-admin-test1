import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../ui/DataTable';
import { StatusBadge } from '../ui/StatusBadge';
import { Worker } from '../../types'; // Using Worker as Vendor for now

export const VendorPerformance = ({ onVendorClick }: { onVendorClick?: (id: number) => void }) => {
    const { workers, isLoading, adminUser } = useApp();
    const isSupportRole = adminUser?.role === 'SUPPORT_ADMIN' || adminUser?.role === 'SUPPORT_WORKER';
    const [filter, setFilter] = useState('ALL');
    const [search, setSearch] = useState('');

    const columns: Column<Worker>[] = [
        {
            header: 'Vendor',
            cell: (w) => (
                <div className="flex items-center space-x-3">
                    <img src={w.avatar} alt="" className="w-8 h-8 rounded-full bg-gray-700" />
                    <div>
                        <div className="font-medium text-white">{w.name}</div>
                        <div className="text-xs text-evera-muted">{w.role}</div>
                    </div>
                </div>
            )
        },
        { header: 'Status', accessorKey: 'status', cell: (w) => <StatusBadge status={w.status} /> },
        {
            header: 'Rating',
            accessorKey: 'rating',
            cell: (w) => (
                <div className="flex items-center text-yellow-500">
                    <span className="font-bold mr-1">{w.rating}</span>
                    <span className="text-xs text-evera-muted">/ 5.0</span>
                </div>
            )
        },
        { header: 'Jobs', accessorKey: 'jobsCompleted' },
        {
            header: 'Revenue',
            accessorKey: 'totalEarned',
            cell: (w) => `₹${(w.totalEarned || 0).toLocaleString()}`
        },
    ];

    const filteredWorkers = workers.filter(w => {
        if (isSupportRole && w.status !== 'ACTIVE') return false;
        if (filter !== 'ALL' && w.status !== (filter === 'PENDING_APPROVAL' ? 'PENDING' : filter)) return false;
        if (search) {
             const term = search.toLowerCase();
             const matchesName = w.name.toLowerCase().includes(term);
             const matchesEmail = w.email?.toLowerCase().includes(term) ?? false;
             const matchesPhone = ('phone' in w && typeof w.phone === 'string') ? w.phone.toLowerCase().includes(term) : false;
             if (!matchesName && !matchesEmail && !matchesPhone) return false;
        }
        return true;
    });

    const avgRating = workers.length > 0 ? (workers.reduce((acc, w) => acc + (Number(w.rating) || 0), 0) / workers.length).toFixed(1) : '0.0';
    const totalJobs = workers.reduce((acc, w) => acc + (w.jobsCompleted || 0), 0);
    const completionRate = totalJobs > 0 ? ((totalJobs / (totalJobs + 1)) * 100).toFixed(1) + '%' : '0%';

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-xl font-bold text-white">Vendor Performance</h2>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <div className="bg-evera-card border border-evera-border rounded-lg flex items-center px-3 py-2 w-full sm:w-64">
                        <svg className="w-4 h-4 text-evera-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input 
                            type="text" 
                            placeholder="Search name, email, phone..." 
                            className="bg-transparent border-none outline-none text-white ml-2 w-full placeholder-evera-muted text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {!isSupportRole && (
                        <div className="flex space-x-2">
                            {['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-3 py-1.5 text-xs rounded-full border font-medium transition-colors ${filter === status
                                        ? 'bg-evera-primary/20 text-evera-primary border-evera-primary'
                                        : 'border-evera-border text-evera-muted hover:border-evera-muted hover:text-white'
                                        }`}
                                >
                                    {status === 'PENDING' ? 'PENDING' : status}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-evera-card p-4 rounded-xl border border-evera-border hover:border-evera-primary/50 transition-colors duration-300">
                    <h3 className="text-sm text-evera-muted mb-2">Average Rating</h3>
                    <div className="text-2xl font-bold text-white">{avgRating} <span className="text-sm font-normal text-green-500"></span></div>
                </div>
                <div className="bg-evera-card p-4 rounded-xl border border-evera-border hover:border-evera-primary/50 transition-colors duration-300">
                    <div className="text-sm text-evera-muted mb-2">Completion Rate</div>
                    <div className="text-2xl font-bold text-white">{completionRate} <span className="text-sm font-normal text-evera-muted"></span></div>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredWorkers}
                isLoading={isLoading}
                onRowClick={(row) => onVendorClick && onVendorClick(Number(row.id))}
            />
        </div>
    );
};
