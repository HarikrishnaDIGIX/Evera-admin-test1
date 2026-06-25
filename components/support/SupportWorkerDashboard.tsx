import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Ticket, WorkerStatus, SupportWorker } from '../../types';
import { DataTable, Column } from '../ui/DataTable';
import { StatusBadge } from '../ui/StatusBadge';
import { TicketDetails } from './TicketDetails';
import { Icons } from '../ui/Icons';
import { 
  Users, MessageSquare, Check, Calendar, Bell, ShieldAlert,
  ArrowUpRight, AlertOctagon, HelpCircle, BookOpen, Clock, Star,
  Search, Filter
} from 'lucide-react';

interface SupportWorkerDashboardProps {
  onNavigate?: (screen: string) => void;
}

export const SupportWorkerDashboard: React.FC<SupportWorkerDashboardProps> = ({ onNavigate }) => {
  const { 
    tickets, 
    setTickets, 
    supportWorkers, 
    adminUser, 
    addNotification, 
    assignTicketToWorkerLocal,
    addTicketTimelineActionLocal,
    assignTicketToDepartmentLocal,
    claimTicketLocal,
    refreshData
  } = useApp();

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [search, setSearch] = useState('');
  const [kbOpenIndex, setKbOpenIndex] = useState<number | null>(null);
  
  // Filters state
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [scopeFilter, setScopeFilter] = useState<string>('TEAM');

  // Find worker profile matching active login
  const currentWorker = supportWorkers.find(
    w => w.email.toLowerCase() === adminUser?.email.toLowerCase()
  ) || supportWorkers[0] || { id: 'sw1', name: 'John Doe', role: 'LEVEL_1_AGENT', status: 'ACTIVE', employeeId: 'EMP-SW-001', phone: '', departments: ['CUSTOMER_SUPPORT'] as import('../../types').SupportDepartment[], permissions: [] };

  const isSupportAdminOrSuperAdmin = adminUser?.role === 'SUPER_ADMIN' || adminUser?.role === 'SUPPORT_ADMIN';

  const hasPermissionForCategory = (category: string) => {
    if (category === 'ALL' || isSupportAdminOrSuperAdmin) return true;
    switch (category) {
      case 'BOOKING':
      case 'SERVICE_QUALITY':
        return currentWorker.departments?.includes('CUSTOMER_SUPPORT');
      case 'VENDOR':
        return currentWorker.departments?.includes('VENDOR_SUPPORT');
      case 'PAYMENT':
        return currentWorker.departments?.includes('FINANCE_SUPPORT');
      case 'TECHNICAL':
        return currentWorker.departments?.includes('TECHNICAL_SUPPORT');
      case 'OTHER':
        return true;
      default:
        return true;
    }
  };

  const isCurrentCategoryAllowed = hasPermissionForCategory(categoryFilter);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value;
    setCategoryFilter(selectedCategory);
    
    if (!hasPermissionForCategory(selectedCategory)) {
      addNotification("You don't have permission for this category. Please ask Super Admin.");
    }
  };
  
  // Filter tickets dynamically based on department
  const visibleTickets = (isSupportAdminOrSuperAdmin || !currentWorker.departments || currentWorker.departments.length === 0) 
    ? tickets 
    : tickets.filter(t => 
        currentWorker.departments?.includes(t.assignedDepartment as any) ||
        t.assignedWorkerId === currentWorker.id
      );

  // Filter tickets assigned directly to this worker
  const myTickets = visibleTickets.filter(t => t.assignedWorkerId === currentWorker.id);

  // My Work KPI metrics
  const assignedToMe = visibleTickets.filter(t => t.assignedWorkerId === currentWorker.id && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
  const resolvedByMe = visibleTickets.filter(t => t.resolvedByWorkerId === currentWorker.id || (t.assignedWorkerId === currentWorker.id && (t.status === 'RESOLVED' || t.status === 'CLOSED'))).length;
  const escalatedByMe = visibleTickets.filter(t => t.status === 'ESCALATED' && t.assignedWorkerId === currentWorker.id).length;

  // Team Work KPI metrics
  const teamOpenTickets = visibleTickets.filter(t => t.status === 'OPEN').length;
  const teamResolvedTickets = visibleTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const teamPendingTickets = visibleTickets.filter(t => t.status === 'IN_PROGRESS' || t.status === 'WAITING_FOR_USER' || t.status === 'WAITING_FOR_PROVIDER').length;

  const totalAssigned = myTickets.length;
  const resolvedCount = resolvedByMe;
  const highPriorityTasks = myTickets.filter(t => (t.priority === 'URGENT' || t.priority === 'HIGH') && t.status !== 'RESOLVED' && t.status !== 'CLOSED');
  const followUpTasks = myTickets.filter(t => t.status === 'WAITING_FOR_USER' || t.status === 'WAITING_FOR_PROVIDER');
  const pendingTasks = myTickets.filter(t => t.status === 'IN_PROGRESS');

  const transfersReceived = visibleTickets.reduce((acc: number, t: any) => {
    const count = (t.timelineActions || []).filter((a: any) => 
      (a.action === 'TRANSFERRED' && a.note?.includes(`to ${currentWorker.name}`)) ||
      (a.action === 'TAKEOVER_APPROVED' && a.note?.includes(`to ${currentWorker.name}`))
    ).length;
    return acc + count;
  }, 0);

  const transfersSent = visibleTickets.reduce((acc: number, t: any) => {
    const count = (t.timelineActions || []).filter((a: any) => 
      (a.action === 'TRANSFERRED' && a.note?.includes(`from ${currentWorker.name}`)) ||
      (a.action === 'TAKEOVER_APPROVED' && a.note?.includes(`from ${currentWorker.name}`))
    ).length;
    return acc + count;
  }, 0);


  // Filter My Tickets list
  const filteredMyTickets = visibleTickets.filter(t => {
    const matchesScope = scopeFilter === 'MY' ? t.assignedWorkerId === currentWorker.id : true;

    const matchesSearch = 
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;

    return matchesScope && matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const columns: Column<Ticket>[] = [
    { header: 'ID', accessorKey: 'ticketNumber', className: 'w-24 font-mono text-xs font-bold text-evera-primary' },
    { header: 'Subject', accessorKey: 'subject', className: 'font-semibold text-white' },
    { header: 'Requester', accessorKey: 'customerName', cell: (t) => (
      <div>
        <div className="flex items-center gap-1.5">
          <p className="font-medium text-white">{t.customerName}</p>
          {t.assignedDepartment === 'VENDOR_SUPPORT' && <span className="px-1 text-[8px] font-bold border border-[#f48c25] text-[#f48c25] rounded uppercase tracking-wider">Vendor</span>}
        </div>
        <p className="text-[10px] text-evera-muted">{t.customerEmail}</p>
      </div>
    )},
    { header: 'Category', accessorKey: 'category', cell: (t) => <StatusBadge status={t.category} /> },
    { header: 'Priority', accessorKey: 'priority', cell: (t) => <StatusBadge status={t.priority} /> },
    { header: 'Status', accessorKey: 'status', cell: (t) => <StatusBadge status={t.status} /> },
    { header: 'Handler', cell: (t) => (
      <span className="text-xs font-semibold text-gray-300">
        {t.assignedToName || 'Unassigned'}
      </span>
    )},
    {
      header: 'Actions',
      cell: (t) => {
        const isMyTicket = t.assignedWorkerId === currentWorker.id;
        const isUnassigned = !t.assignedWorkerId;

        return (
          <div className="flex items-center gap-2">
            {isUnassigned && (
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  await claimTicketLocal(t.id);
                }}
                className="text-[10px] bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-500 px-2 py-1 rounded font-bold transition-all"
              >
                Claim Ticket
              </button>
            )}
            <button
              onClick={() => setSelectedTicket(t)}
              className="text-xs bg-evera-primary/10 border border-evera-primary/20 hover:bg-evera-primary/20 text-[#f48c25] px-2.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap"
            >
              {isMyTicket ? 'View (Mine)' : 'View & Manage'}
            </button>
          </div>
        );
      }
    }
  ];

  const faqs = [
    { q: "How to process immediate disputes?", a: "Review linked bookings, verify customer evidence inside Dispute evidence, and check if refund bounds are within standard L2 daily caps. If yes, mark resolved; otherwise escalate to Finance." },
    { q: "When to escalate to Finance Department?", a: "Escalate immediately when a refund exceeds standard L2 approval caps, booking fees fail to settle to bank gateway, or transaction reconciliation reports show mismatches." },
    { q: "When to route to Technical Department?", a: "Route immediately in case of app crashes, login failures, API checkout latency, or system bugs preventing checkout confirmation." }
  ];

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

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {isSupportAdminOrSuperAdmin 
              ? 'Support Agent Dashboard (All Domains)' 
              : `${(currentWorker.departments && currentWorker.departments.length > 0) ? currentWorker.departments.map(d => d.replace('_', ' ')).join(' & ') : 'General Support'} Dashboard`}
          </h2>
          <p className="text-xs text-[#A8A29E]">Manage assigned disputes, communicate with users, update timelines, and escalate unresolved issues.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#161210] border border-[#38302C] px-3.5 py-2 rounded-xl text-xs font-extrabold text-[#f48c25]">
            AGENT ID: {currentWorker.employeeId}
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-12 gap-6">
        {/* My Work */}
        <div className="col-span-12 lg:col-span-6 space-y-3">
          <h4 className="text-xs font-black text-[#A8A29E] uppercase tracking-wider flex items-center gap-1.5">
            <span>👤 My Work</span>
          </h4>
          <div className="grid grid-cols-3 gap-4">
            {/* Assigned to Me */}
            <div className="card stat-card relative overflow-hidden bg-evera-card hover:border-evera-primary/30 transition-all p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <Users size={16} />
                </div>
              </div>
              <p className="stat-label mb-1 text-[9px] uppercase tracking-tighter font-bold text-gray-400">Assigned</p>
              <h3 className="stat-value text-white text-xl font-black">{assignedToMe}</h3>
            </div>
            {/* Resolved by Me */}
            <div className="card stat-card relative overflow-hidden bg-evera-card hover:border-evera-primary/30 transition-all p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="p-1.5 rounded-lg bg-green-500/10 text-green-400">
                  <Check size={16} />
                </div>
              </div>
              <p className="stat-label mb-1 text-[9px] uppercase tracking-tighter font-bold text-gray-400">Resolved</p>
              <h3 className="stat-value text-white text-xl font-black">{resolvedByMe}</h3>
            </div>
            {/* Escalated by Me */}
            <div className="card stat-card relative overflow-hidden bg-evera-card hover:border-evera-primary/30 transition-all p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
                  <ShieldAlert size={16} />
                </div>
              </div>
              <p className="stat-label mb-1 text-[9px] uppercase tracking-tighter font-bold text-gray-400">Escalated</p>
              <h3 className="stat-value text-white text-xl font-black">{escalatedByMe}</h3>
            </div>
          </div>
        </div>

        {/* Team Work */}
        <div className="col-span-12 lg:col-span-6 space-y-3">
          <h4 className="text-xs font-black text-[#A8A29E] uppercase tracking-wider flex items-center gap-1.5">
            <span>👥 Team Work</span>
          </h4>
          <div className="grid grid-cols-3 gap-4">
            {/* Total Open Tickets */}
            <div className="card stat-card relative overflow-hidden bg-evera-card hover:border-evera-primary/30 transition-all p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
                  <MessageSquare size={16} />
                </div>
              </div>
              <p className="stat-label mb-1 text-[9px] uppercase tracking-tighter font-bold text-gray-400">Total Open</p>
              <h3 className="stat-value text-white text-xl font-black">{teamOpenTickets}</h3>
            </div>
            {/* Total Resolved Tickets */}
            <div className="card stat-card relative overflow-hidden bg-evera-card hover:border-evera-primary/30 transition-all p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Check size={16} />
                </div>
              </div>
              <p className="stat-label mb-1 text-[9px] uppercase tracking-tighter font-bold text-gray-400">Total Resolved</p>
              <h3 className="stat-value text-white text-xl font-black">{teamResolvedTickets}</h3>
            </div>
            {/* Team Pending Tickets */}
            <div className="card stat-card relative overflow-hidden bg-evera-card hover:border-evera-primary/30 transition-all p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400">
                  <Clock size={16} />
                </div>
              </div>
              <p className="stat-label mb-1 text-[9px] uppercase tracking-tighter font-bold text-gray-400">Team Pending</p>
              <h3 className="stat-value text-white text-xl font-black">{teamPendingTickets}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Side: Inbox & Filters */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          <div className="card bg-evera-card border-evera-border p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">📋 Universal Tickets Queue</h3>
              <div className="w-full sm:w-64 relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search subject, customer, ID..."
                  className="w-full bg-[#161210] border border-[#38302C] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#f48c25]"
                />
                <Search size={14} className="absolute left-2.5 top-2 text-gray-500" />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-evera-border/30">
              {/* Scope Filter */}
              <div className="flex items-center gap-1.5 bg-[#161210] border border-[#38302C] px-2 py-1.5 rounded-lg">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Scope:</span>
                <select
                  value={scopeFilter}
                  onChange={(e) => setScopeFilter(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none cursor-pointer font-semibold [&>option]:bg-[#161210]"
                >
                  <option value="TEAM">Team Tickets</option>
                  <option value="MY">My Tickets</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-[#161210] border border-[#38302C] px-2 py-1.5 rounded-lg">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none cursor-pointer font-semibold [&>option]:bg-[#161210]"
                >
                  <option value="ALL">All</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="WAITING_FOR_USER">Waiting for User</option>
                  <option value="WAITING_FOR_PROVIDER">Waiting for Provider</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="ESCALATED">Escalated</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-1.5 bg-[#161210] border border-[#38302C] px-2 py-1.5 rounded-lg">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none cursor-pointer font-semibold [&>option]:bg-[#161210]"
                >
                  <option value="ALL">All</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5 bg-[#161210] border border-[#38302C] px-2 py-1.5 rounded-lg">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={handleCategoryChange}
                  className="bg-transparent text-xs text-white focus:outline-none cursor-pointer font-semibold [&>option]:bg-[#161210]"
                >
                  <option value="ALL">All</option>
                  <option value="BOOKING">Booking</option>
                  <option value="SERVICE_QUALITY">Service Quality</option>
                  <option value="PAYMENT">Payment</option>
                  <option value="VENDOR">Vendor</option>
                  <option value="TECHNICAL">Technical</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={isCurrentCategoryAllowed ? filteredMyTickets : []}
              emptyMessage={isCurrentCategoryAllowed 
                ? "No assigned tickets found matching standard filters." 
                : "You don't have permission for this category. Please ask Super Admin."}
              onRowClick={(t) => setSelectedTicket(t)}
            />
          </div>

          {/* Performance scorecard dashboard */}
          <div className="card bg-evera-card border-evera-border p-5 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">📊 My Performance Scorecard</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-[#161210] border border-[#38302C] p-4 rounded-xl text-center">
                <span className="text-[9px] font-black text-[#A8A29E] uppercase tracking-wider">Disputes Assigned</span>
                <p className="text-2xl font-black text-white mt-1">{totalAssigned}</p>
              </div>
              <div className="bg-[#161210] border border-[#38302C] p-4 rounded-xl text-center">
                <span className="text-[9px] font-black text-green-500 uppercase tracking-wider">Tickets Resolved</span>
                <p className="text-2xl font-black text-green-400 mt-1">{resolvedCount}</p>
              </div>
              <div className="bg-[#161210] border border-[#38302C] p-4 rounded-xl text-center">
                <span className="text-[9px] font-black text-[#f48c25] uppercase tracking-wider">Avg Speed</span>
                <p className="text-2xl font-black text-[#f48c25] mt-1">1.8 hrs</p>
              </div>
              <div className="bg-[#161210] border border-[#38302C] p-4 rounded-xl text-center">
                <span className="text-[9px] font-black text-yellow-500 uppercase tracking-wider">CSAT Satisfaction</span>
                <p className="text-2xl font-black text-yellow-400 mt-1 flex items-center justify-center gap-1">
                  <Star size={16} fill="currentColor" className="text-yellow-500" />
                  <span>4.9</span>
                </p>
              </div>
              <div className="bg-[#161210] border border-[#38302C] p-4 rounded-xl text-center">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider">Transfers Received</span>
                <p className="text-2xl font-black text-indigo-300 mt-1">{transfersReceived}</p>
              </div>
              <div className="bg-[#161210] border border-[#38302C] p-4 rounded-xl text-center">
                <span className="text-[9px] font-black text-purple-400 uppercase tracking-wider">Transfers Sent</span>
                <p className="text-2xl font-black text-purple-300 mt-1">{transfersSent}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Daily Tasks, Notifications, Knowledge Base */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          {/* Daily Work Section */}
          <div className="card bg-evera-card border-evera-border p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-evera-border/30 pb-2">
              <Calendar size={16} className="text-[#f48c25]" />
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Today's Daily Tasks</h4>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-[#161210] p-2.5 rounded-lg border border-evera-border/30">
                <span className="text-red-400 font-bold">Urgent Action:</span>
                <span className="text-white font-extrabold bg-red-500/10 px-2 py-0.5 rounded">{highPriorityTasks.length} Cases</span>
              </div>
              <div className="flex justify-between items-center bg-[#161210] p-2.5 rounded-lg border border-evera-border/30">
                <span className="text-yellow-500 font-bold">Pending Follow-ups:</span>
                <span className="text-white font-extrabold bg-yellow-500/10 px-2 py-0.5 rounded">{followUpTasks.length} Tickets</span>
              </div>
              <div className="flex justify-between items-center bg-[#161210] p-2.5 rounded-lg border border-evera-border/30">
                <span className="text-blue-400 font-bold">Investigating:</span>
                <span className="text-white font-extrabold bg-blue-500/10 px-2 py-0.5 rounded">{pendingTasks.length} Tickets</span>
              </div>
            </div>
          </div>

          {/* Active Notifications Panel */}
          <div className="card bg-evera-card border-evera-border p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-evera-border/30 pb-2">
              <Bell size={16} className="text-[#f48c25] animate-pulse" />
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Worker Alerts</h4>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 no-scrollbar">
              {highPriorityTasks.map((t) => (
                <div key={t.id} className="p-2 bg-red-500/5 border border-red-500/10 rounded-lg text-[10px] space-y-0.5">
                  <p className="font-bold text-red-400 uppercase leading-none">CRITICAL PRIORITY</p>
                  <p className="text-white leading-tight mt-0.5 truncate">{t.subject}</p>
                </div>
              ))}
              {followUpTasks.map((t) => (
                <div key={t.id} className="p-2 bg-yellow-500/5 border border-yellow-500/10 rounded-lg text-[10px] space-y-0.5">
                  <p className="font-bold text-yellow-500 uppercase leading-none">REPLY RECEIVED</p>
                  <p className="text-white leading-tight mt-0.5 truncate">{t.subject}</p>
                </div>
              ))}
              {highPriorityTasks.length === 0 && followUpTasks.length === 0 && (
                <p className="text-[10px] text-evera-muted italic text-center py-4">No recent task alerts</p>
              )}
            </div>
          </div>

          {/* Knowledge Base */}
          <div className="card bg-evera-card border-evera-border p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-evera-border/30 pb-2">
              <BookOpen size={16} className="text-[#f48c25]" />
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Agent Knowledge Base</h4>
            </div>
            
            <div className="space-y-2">
              {faqs.map((faq, idx) => {
                const isOpen = kbOpenIndex === idx;
                return (
                  <div key={idx} className="border border-[#38302C] rounded-lg overflow-hidden transition-all bg-[#161210]">
                    <button
                      type="button"
                      onClick={() => setKbOpenIndex(isOpen ? null : idx)}
                      className="w-full flex justify-between items-center px-3 py-2 text-[10px] font-bold text-white text-left hover:bg-white/5"
                    >
                      <span>{faq.q}</span>
                      <Icons.ChevronDown size={12} className={`text-evera-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-2.5 pt-0.5 text-[10px] text-gray-400 border-t border-[#38302C]/40 leading-relaxed bg-[#161210]/50 font-medium whitespace-pre-wrap">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
