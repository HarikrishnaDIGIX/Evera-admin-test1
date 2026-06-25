import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../ui/DataTable';
import { StatusBadge } from '../ui/StatusBadge';
import { SearchBar } from '../ui/SearchBar';
import { FilterPanel } from '../ui/FilterPanel';
import { Ticket } from '../../types';
import { TicketDetails } from './TicketDetails';
import { CreateTicket } from './CreateTicket';
import { Plus } from 'lucide-react';

export const TicketManagement = () => {
    const { 
        tickets, 
        isLoading, 
        addNotification, 
        adminUser, 
        assignTicketToWorkerLocal,
        refreshData,
        supportWorkers
    } = useApp();
    
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'assigned' | 'escalated'>('all');
    
    // Filters & Search
    const [search, setSearch] = useState('');
    const [filterValues, setFilterValues] = useState<Record<string, string>>({
        category: '',
        priority: '',
        status: '',
    });

    const handleStatusChange = async (ticketId: string, status: any) => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`http://127.0.0.1:8001/api/v1/admin/tickets/${ticketId}/status?status=${status}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                addNotification(`Ticket status updated to ${status}`);
                refreshData();
            } else {
                addNotification('Failed to update ticket status');
            }
        } catch (e) {
            console.error(e);
            addNotification('Network error updating status');
        }
    };

    const handlePriorityChange = async (ticketId: string, priority: any) => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`http://127.0.0.1:8001/api/v1/admin/tickets/${ticketId}/priority?priority=${priority}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                addNotification(`Ticket priority updated to ${priority}`);
                refreshData();
            } else {
                addNotification('Failed to update ticket priority');
            }
        } catch (e) {
            console.error(e);
            addNotification('Network error updating priority');
        }
    };

    const handleAssignChange = async (ticketId: string, workerId: string, workerName: string) => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`http://127.0.0.1:8001/api/v1/admin/tickets/${ticketId}/assign?owner_id=${workerId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                addNotification(`Ticket assigned to ${workerName}`);
                refreshData();
            } else {
                addNotification('Failed to assign ticket');
            }
        } catch (e) {
            console.error(e);
            addNotification('Network error assigning ticket');
        }
    };

    const handleAddComment = async (ticketId: string, content: string, isInternal: boolean) => {
        if (!adminUser) return;
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`http://127.0.0.1:8001/api/v1/admin/tickets/${ticketId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });
            if (res.ok) {
                addNotification(isInternal ? 'Internal note added' : 'Reply sent');
                refreshData();
            } else {
                addNotification('Failed to post comment');
            }
        } catch (e) {
            console.error(e);
            addNotification('Network error posting comment');
        }
    };


    const handleFilterChange = (id: string, value: string) => {
        setFilterValues(prev => ({ ...prev, [id]: value }));
    };

    const handleClearFilters = () => {
        setFilterValues({
            category: '',
            priority: '',
            status: '',
        });
        setSearch('');
    };

    // Filtered tickets based on search, dropdown filters, AND active tab
    const filteredTickets = tickets.filter(ticket => {
        // Search text matching subject, ticket number, customer name, email
        const matchesSearch = 
            ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
            ticket.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
            ticket.customerName.toLowerCase().includes(search.toLowerCase()) ||
            ticket.customerEmail.toLowerCase().includes(search.toLowerCase());

        const matchesCategory = !filterValues.category || ticket.category === filterValues.category;
        const matchesPriority = !filterValues.priority || ticket.priority === filterValues.priority;
        const matchesStatus = !filterValues.status || ticket.status === filterValues.status;

        // Active Tab filter
        let matchesTab = true;
        if (activeTab === 'assigned') {
            matchesTab = !!ticket.assignedWorkerId;
        } else if (activeTab === 'escalated') {
            matchesTab = ticket.escalationLevel === 'SUPPORT_ADMIN' || ticket.escalationLevel === 'SUPER_ADMIN';
        }

        // Role-based Department Filter
        let matchesDepartment = true;
        if (adminUser?.role === 'OPERATIONS_ADMIN') {
            matchesDepartment = ticket.assignedDepartment === 'OPERATIONS';
        } else if (adminUser?.role === 'FINANCE_ADMIN') {
            matchesDepartment = ticket.assignedDepartment === 'FINANCE';
        } else if (adminUser?.role === 'OPERATIONS_WORKER') {
            matchesDepartment = ticket.assignedWorkerId === adminUser.id || ticket.category === 'VENDOR' || ticket.assignedDepartment === 'OPERATIONS';
        }

        return matchesSearch && matchesCategory && matchesPriority && matchesStatus && matchesTab && matchesDepartment;
    });

    const filterFields = [
        {
            id: 'category',
            label: 'Category',
            type: 'select' as const,
            options: [
                { value: 'SERVICE_QUALITY', label: 'Service Quality' },
                { value: 'PAYMENT', label: 'Payment' },
                { value: 'VENDOR', label: 'Vendor' },
                { value: 'TECHNICAL', label: 'Technical' },
                { value: 'OTHER', label: 'Other' },
            ]
        },
        {
            id: 'priority',
            label: 'Priority',
            type: 'select' as const,
            options: [
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
                { value: 'URGENT', label: 'Urgent' },
            ]
        },
        {
            id: 'status',
            label: 'Status',
            type: 'select' as const,
            options: [
                { value: 'OPEN', label: 'Open' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'RESOLVED', label: 'Resolved' },
                { value: 'CLOSED', label: 'Closed' },
            ]
        }
    ];

    const columns: Column<Ticket>[] = [
        { header: 'ID', accessorKey: 'ticketNumber', className: 'w-24 font-mono text-xs font-bold text-evera-primary' },
        { header: 'Subject', accessorKey: 'subject', className: 'font-semibold text-white' },
        { header: 'Customer', accessorKey: 'customerName', cell: (t) => (
            <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="font-medium text-white">{t.customerName}</p>
                    {t.type && (
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                            t.type === 'VENDOR' ? 'bg-[#f48c25]/10 text-[#f48c25] border-[#f48c25]/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        }`}>
                            {t.type}
                        </span>
                    )}
                </div>
                <p className="text-[10px] text-evera-muted">{t.customerEmail}</p>
            </div>
        )},
        { header: 'Category', accessorKey: 'category', cell: (t) => <StatusBadge status={t.category} /> },
        { header: 'Priority', accessorKey: 'priority', cell: (t) => <StatusBadge status={t.priority} /> },
        { header: 'Status', accessorKey: 'status', cell: (t) => <StatusBadge status={t.status} /> },
        { header: 'Assigned Agent', accessorKey: 'assignedToName', cell: (t) => {
            const worker = supportWorkers?.find(w => w.id === t.assignedWorkerId);
            const fallbackName = t.assignedToName || (worker ? worker.name : '');

            // If escalated to external dept, show the dept manager, not the original worker
            const deptManagerMap: Record<string, string> = {
                'OPERATIONS': 'Operations Manager',
                'FINANCE': 'Finance Manager',
                'ADMIN': 'Super Admin',
            };
            const isExternalDept = t.assignedDepartment && deptManagerMap[t.assignedDepartment];
            const displayName = isExternalDept
                ? deptManagerMap[t.assignedDepartment!]
                : fallbackName;
            return (
                <span className="text-xs font-medium" style={{ color: isExternalDept ? '#a78bfa' : '#d1d5db' }}>
                    {displayName || <span className="text-evera-muted italic">Unassigned</span>}
                </span>
            );
        }},
        { header: 'Escalation', cell: (t) => {
            const isExternalDept = t.assignedDepartment && ['OPERATIONS', 'FINANCE', 'ADMIN'].includes(t.assignedDepartment);
            if (isExternalDept) {
                return <StatusBadge status={t.assignedDepartment!.replace('_', ' ')} className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20" />;
            }
            if (t.escalationLevel && t.escalationLevel !== 'NONE') {
                return <StatusBadge status={t.escalationLevel.replace('_', ' ')} className="bg-red-500/10 text-red-500 border-red-500/20" />;
            }
            return <span className="text-[10px] text-evera-muted italic">None</span>;
        }}
    ];

    const currentSelectedTicket = selectedTicket 
        ? tickets.find(t => t.id === selectedTicket.id) || selectedTicket 
        : null;

    if (currentSelectedTicket) {
        return (
            <TicketDetails
                ticket={currentSelectedTicket}
                onBack={() => setSelectedTicket(null)}
                onStatusChange={(status) => handleStatusChange(currentSelectedTicket.id, status)}
                onPriorityChange={(priority) => handlePriorityChange(currentSelectedTicket.id, priority)}
                onAssignChange={(id, name) => handleAssignChange(currentSelectedTicket.id, id, name)}
                onAddComment={(content, isInternal) => handleAddComment(currentSelectedTicket.id, content, isInternal)}
            />
        );
    }
    
    if (isCreating) {
        return (
            <CreateTicket
                onBack={() => setIsCreating(false)}
                onCreated={() => setIsCreating(false)}
            />
        );
    }

    const activeTicketsList = filteredTickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED');
    const resolvedTicketsList = filteredTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED');

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Support Ticket Management</h2>
                    <p className="text-xs text-[#A8A29E]">Track customer disputes, assign agents, check visual progress steppers, and view complete audit history logs.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-[#f48c25] hover:bg-[#d9751a] px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 border border-transparent"
                    >
                        <Plus size={14} />
                        Create Ticket
                    </button>
                    <div className="w-full sm:w-64">
                      <SearchBar value={search} onChange={setSearch} placeholder="Search subject, user, email or ID..." />
                    </div>
                </div>
            </div>

            {/* Segmented Tab Control */}
            <div className="bg-[#161210] border border-[#38302C] p-1 rounded-xl flex items-center gap-1 shadow-inner max-w-md">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all text-center ${
                        activeTab === 'all' 
                            ? 'bg-gradient-to-r from-evera-primary to-[#d9751a] text-white shadow-md animate-fade-in' 
                            : 'text-evera-muted hover:text-white'
                    }`}
                >
                    All Tickets
                </button>
                <button
                    onClick={() => setActiveTab('assigned')}
                    className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all text-center ${
                        activeTab === 'assigned' 
                            ? 'bg-gradient-to-r from-evera-primary to-[#d9751a] text-white shadow-md animate-fade-in' 
                            : 'text-evera-muted hover:text-white'
                    }`}
                >
                    Assigned Tickets
                </button>
                <button
                    onClick={() => setActiveTab('escalated')}
                    className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all text-center ${
                        activeTab === 'escalated' 
                            ? 'bg-gradient-to-r from-evera-primary to-[#d9751a] text-white shadow-md animate-fade-in' 
                            : 'text-evera-muted hover:text-white'
                    }`}
                >
                    Escalated Tickets
                </button>
            </div>

            <FilterPanel
                fields={filterFields}
                values={filterValues}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
            />

            <div className="space-y-8">
                {/* Active Tickets Table */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white px-2">Active Tickets ({activeTicketsList.length})</h3>
                    <div className="card bg-evera-card border-evera-border p-1">
                        <DataTable
                            columns={columns}
                            data={activeTicketsList}
                            isLoading={isLoading}
                            onRowClick={setSelectedTicket}
                        />
                    </div>
                </div>

                {/* Resolved Tickets Table */}
                {resolvedTicketsList.length > 0 && (
                    <div className="space-y-3 pt-6 border-t border-[#38302C]/50">
                        <h3 className="text-sm font-bold text-gray-400 px-2 uppercase tracking-wider">Resolved Tickets ({resolvedTicketsList.length})</h3>
                        <div className="card bg-evera-card border-evera-border p-1 opacity-75 hover:opacity-100 transition-opacity">
                            <DataTable
                                columns={columns}
                                data={resolvedTicketsList}
                                isLoading={isLoading}
                                onRowClick={setSelectedTicket}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
