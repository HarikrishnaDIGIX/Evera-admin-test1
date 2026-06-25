import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../ui/DataTable';
import { StatusBadge } from '../ui/StatusBadge';
import { FilterPanel } from '../ui/FilterPanel';
import { AuditLog } from '../../types';
import * as api from '../../api/service';
import { Icons } from '../ui/Icons';
import { Info, Code, Calendar, Globe, Terminal } from 'lucide-react';

export const AuditLogs = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Filters and search
    const [search, setSearch] = useState('');
    const [filterValues, setFilterValues] = useState<Record<string, string>>({
        module: '',
        action: '',
    });

    // Detail modal state
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setIsLoading(true);
        try {
            const res = await api.fetchAuditLogs();
            if (res.success && res.data) {
                setLogs(res.data);
            } else {
                setLogs([]);
            }
            setIsLoading(false);
        } catch (e) {
            console.error(e);
            setIsLoading(false);
        }
    };

    const handleFilterChange = (id: string, value: string) => {
        setFilterValues(prev => ({ ...prev, [id]: value }));
    };

    const handleClearFilters = () => {
        setFilterValues({
            module: '',
            action: '',
        });
        setSearch('');
    };

    const getActionBadgeColor = (action: string) => {
        if (action.includes('SUSPEND') || action.includes('DELETE') || action.includes('REJECT')) {
            return 'bg-red-500/10 border-red-500/30 text-red-400';
        }
        if (action.includes('UPDATE_ROLE') || action.includes('UPDATE_CONFIG')) {
            return 'bg-[#facc15]/10 border-[#facc15]/30 text-[#facc15]';
        }
        if (action.includes('APPROVE') || action.includes('RESOLVE') || action.includes('PROCESS')) {
            return 'bg-green-500/10 border-green-500/30 text-green-400';
        }
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = 
            log.adminName.toLowerCase().includes(search.toLowerCase()) ||
            log.action.toLowerCase().includes(search.toLowerCase()) ||
            log.resourceId.toLowerCase().includes(search.toLowerCase()) ||
            log.ipAddress.toLowerCase().includes(search.toLowerCase());

        const matchesModule = !filterValues.module || log.module === filterValues.module;
        const matchesAction = !filterValues.action || log.action === filterValues.action;

        return matchesSearch && matchesModule && matchesAction;
    });

    const filterFields = [
        {
            id: 'module',
            label: 'System Module',
            type: 'select' as const,
            options: [
                { value: 'Settings', label: 'Settings' },
                { value: 'Operations', label: 'Operations' },
                { value: 'Finance', label: 'Finance' },
                { value: 'Auth', label: 'Authentication' },
                { value: 'Support', label: 'Customer Support' },
            ]
        },
        {
            id: 'action',
            label: 'Action Type',
            type: 'select' as const,
            options: [
                { value: 'UPDATE_CONFIG', label: 'Update Configuration' },
                { value: 'RESOLVE_DISPUTE', label: 'Resolve Dispute' },
                { value: 'PROCESS_SETTLEMENT', label: 'Process Settlement' },
                { value: 'UPDATE_ROLE', label: 'Update Role' },
                { value: 'SUSPEND_USER', label: 'Suspend User' },
                { value: 'APPROVE_VENDOR', label: 'Approve Vendor' },
            ]
        }
    ];

    const columns: Column<AuditLog>[] = [
        { 
            header: 'Timestamp', 
            accessorKey: 'timestamp', 
            className: 'text-xs text-gray-400 font-mono w-44' 
        },
        { 
            header: 'Actor', 
            accessorKey: 'adminName', 
            cell: (l) => <span className="text-xs text-white font-bold">{l.adminName}</span> 
        },
        { 
            header: 'Action', 
            accessorKey: 'action', 
            cell: (l) => (
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getActionBadgeColor(l.action)}`}>
                    {l.action}
                </span>
            )
        },
        { 
            header: 'Module', 
            accessorKey: 'module', 
            cell: (l) => <span className="text-xs text-gray-300 font-semibold">{l.module}</span> 
        },
        { 
            header: 'Target ID', 
            accessorKey: 'resourceId', 
            className: 'font-mono text-xs text-[#f48c25] font-bold' 
        },
        { 
            header: 'IP Address', 
            accessorKey: 'ipAddress', 
            className: 'text-xs text-evera-muted font-mono' 
        },
        {
            header: 'Inspection',
            cell: (l) => (
                <button 
                    onClick={() => setSelectedLog(l)}
                    className="text-xs text-[#f48c25] hover:underline font-bold flex items-center gap-1.5"
                >
                    <Info size={13} />
                    <span>View Diff</span>
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Security Audit Log Center</h2>
                    <p className="text-xs text-[#A8A29E]">Track administrator action history, security changes, updates, IP access codes, and system configurations.</p>
                </div>
                <div className="w-full sm:w-80">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search IP, admin, code or action..."
                        className="w-full bg-[#241E1B] border border-[#38302C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#f48c25] placeholder-[#A8A29E]/50"
                    />
                </div>
            </div>

            <FilterPanel
                fields={filterFields}
                values={filterValues}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
            />

            <div className="card bg-evera-card border-evera-border p-1">
                <DataTable
                    columns={columns}
                    data={filteredLogs}
                    isLoading={isLoading}
                    emptyMessage="No audit logs found matching criteria"
                />
            </div>

            {/* Change Inspection Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
                    <div className="bg-[#241E1B] border border-[#38302C] w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-5 animate-fade-in">
                        <div className="flex justify-between items-center border-b border-evera-border pb-3">
                            <div className="flex items-center gap-2 text-white">
                                <Terminal size={16} className="text-[#f48c25]" />
                                <h3 className="text-base font-black">Audit Event Inspection</h3>
                            </div>
                            <button 
                                onClick={() => setSelectedLog(null)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Icons.Reject size={18} />
                            </button>
                        </div>

                        {/* Event Metadata Grid */}
                        <div className="grid grid-cols-2 gap-4 bg-[#161210] p-4 rounded-xl border border-evera-border/30 text-xs">
                            <div>
                                <span className="text-[#A8A29E] block mb-0.5">Administrator</span>
                                <span className="text-white font-bold">{selectedLog.adminName}</span>
                            </div>
                            <div>
                                <span className="text-[#A8A29E] block mb-0.5">Timestamp</span>
                                <span className="text-white font-bold flex items-center gap-1">
                                    <Calendar size={11} className="text-gray-500" />
                                    <span>{selectedLog.timestamp}</span>
                                </span>
                            </div>
                            <div>
                                <span className="text-[#A8A29E] block mb-0.5">IP Location</span>
                                <span className="text-white font-bold flex items-center gap-1">
                                    <Globe size={11} className="text-gray-500" />
                                    <span>{selectedLog.ipAddress}</span>
                                </span>
                            </div>
                            <div>
                                <span className="text-[#A8A29E] block mb-0.5">Action Event Code</span>
                                <span className="text-[#f48c25] font-mono font-bold">{selectedLog.action}</span>
                            </div>
                            <div className="col-span-2 border-t border-[#38302C]/40 pt-2.5 mt-1">
                                <span className="text-[#A8A29E] block mb-0.5">Client User Agent</span>
                                <span className="text-gray-300 font-mono text-[10px] leading-relaxed block break-words">
                                    {selectedLog.userAgent}
                                </span>
                            </div>
                        </div>

                        {/* Diff Changes block */}
                        {selectedLog.changes ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5 text-xs text-white font-bold">
                                    <Code size={13} className="text-[#f48c25]" />
                                    <span>Payload Modification Parameters:</span>
                                </div>
                                <div className="bg-black/40 border border-[#38302C] rounded-xl p-4 overflow-x-auto max-h-[180px] no-scrollbar">
                                    <pre className="text-[10px] text-green-400 font-mono leading-relaxed">
                                        {JSON.stringify(selectedLog.changes, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-[#161210]/50 rounded-xl text-center border border-dashed border-[#38302C] text-xs text-gray-500">
                                No granular properties modified. This event is a read/query audit check.
                            </div>
                        )}

                        <div className="flex justify-end pt-3">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="bg-[#f48c25] hover:bg-[#d9751a] text-xs px-5 py-2.5 rounded-lg text-white font-bold transition-all"
                            >
                                Close Inspection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
