import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../ui/Icons';
import { AdminUser } from '../../types';
import { useApp } from '../../context/AppContext';
import {
    Search, ChevronDown, Filter, Plus, Users, UserCheck, CheckCircle2,
    Clock, Activity, MessageSquare, Key, Ban, Power, Download, Edit,
    MoreVertical, ShieldCheck, AlertTriangle
} from 'lucide-react';
import { CreateWorker } from '../support/CreateWorker';

interface AdminTeamViewProps {
    admin: AdminUser | 'NEW';
    onBack: () => void;
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
    status: 'Online' | 'Away' | 'Offline';
    tasksTotal: number;
    tasksDone: number;
    completed: number;
    performance: number;
    lastActive: string;
    permissions?: string[];
    rawId?: string | number;
}

const generateTeamMembers = (adminRole: string): TeamMember[] => {
    const rolePrefix = adminRole.split('_')[0]; // 'OPERATIONS', 'SUPPORT', 'FINANCE', 'SUPER'
    const shortPrefix = rolePrefix.substring(0, 3).toUpperCase();
    let roleName = rolePrefix.charAt(0).toUpperCase() + rolePrefix.slice(1).toLowerCase();
    
    // For specific terms
    if (adminRole === 'SUPER_ADMIN') {
        roleName = 'Super';
    }

    // Different sets of names for different departments
    const namesByRole: Record<string, string[]> = {
        SUPPORT: ['Ravi Kumar', 'Neha Sharma', 'Arjun Singh', 'Pooja Patel', 'Vikram Mehta', 'Karan Verma', 'Anjali Desai', 'Suresh Yadav', 'Megha Joshi', 'Deepak Rao'],
        OPERATIONS: ['Amit Shah', 'Priya Gupta', 'Rohit Das', 'Sneha Reddy', 'Kunal Kapoor', 'Divya Nair', 'Manoj Tiwari', 'Kavita Iyer', 'Sanjay Dutt', 'Rekha Jain'],
        FINANCE: ['Anand Mahindra', 'Sunita Williams', 'Rahul Dravid', 'Smriti Irani', 'Vijay Mallya', 'Indra Nooyi', 'Uday Kotak', 'Kiran Mazumdar', 'Ratan Tata', 'Nita Ambani'],
        SUPER: ['Bruce Wayne', 'Diana Prince', 'Clark Kent', 'Barry Allen', 'Arthur Curry', 'Victor Stone', 'Hal Jordan', 'Oliver Queen', 'Dinah Lance', 'John Jones']
    };

    const defaultNames = namesByRole['OPERATIONS'];
    const names = namesByRole[rolePrefix] || defaultNames;

    // Use a pseudo-random seed based on role length to vary the metrics
    const seed = rolePrefix.length;

    return [
        { id: `${shortPrefix}-MGR-001`, name: names[0], role: `${roleName} Manager`, status: 'Online', tasksTotal: 15 + seed, tasksDone: 12 + seed, completed: 11 + seed, performance: Math.min(100, 95 + seed), lastActive: '09:15 AM' },
        { id: `${shortPrefix}-STAFF-002`, name: names[1], role: `${roleName} Staff`, status: 'Online', tasksTotal: 10 + seed, tasksDone: 8 + seed, completed: 9, performance: 90, lastActive: '09:42 AM' },
        { id: `${shortPrefix}-STAFF-003`, name: names[2], role: `${roleName} Staff`, status: 'Online', tasksTotal: 12, tasksDone: 10, completed: 8, performance: 88, lastActive: '09:10 AM' },
        { id: `${shortPrefix}-STAFF-004`, name: names[3], role: `${roleName} Staff`, status: 'Away', tasksTotal: 8, tasksDone: 6, completed: 6, performance: 85, lastActive: '11:20 AM' },
        { id: `${shortPrefix}-STAFF-005`, name: names[4], role: `${roleName} Staff`, status: 'Online', tasksTotal: 9 + seed, tasksDone: 7 + seed, completed: 7, performance: 92, lastActive: '09:05 AM' },
        { id: `${shortPrefix}-STAFF-006`, name: names[5], role: `${roleName} Staff`, status: 'Offline', tasksTotal: 0, tasksDone: 0, completed: 0, performance: 0, lastActive: 'Yesterday' },
        { id: `${shortPrefix}-STAFF-007`, name: names[6], role: `${roleName} Staff`, status: 'Online', tasksTotal: 11, tasksDone: 9, completed: 10, performance: 94, lastActive: '09:30 AM' },
        { id: `${shortPrefix}-STAFF-008`, name: names[7], role: `${roleName} Staff`, status: 'Away', tasksTotal: 7, tasksDone: 4, completed: 4, performance: 78, lastActive: '10:15 AM' },
        { id: `${shortPrefix}-STAFF-009`, name: names[8], role: `${roleName} Staff`, status: 'Offline', tasksTotal: 6, tasksDone: 0, completed: 0, performance: 0, lastActive: '2 days ago' },
        { id: `${shortPrefix}-STAFF-010`, name: names[9], role: `${roleName} Staff`, status: 'Online', tasksTotal: 13, tasksDone: 11, completed: 12, performance: 96, lastActive: '09:18 AM' },
    ];
};

const getActivities = (adminRole: string) => {
    const rolePrefix = adminRole.split('_')[0];
    
    if (rolePrefix === 'SUPPORT') {
        return [
            { id: 1, user: 'Ravi Kumar', action: 'Resolved Ticket', target: '#TCK-8892', time: '10 mins ago', Icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
            { id: 2, user: 'Neha Sharma', action: 'Replied to Customer', target: '#USR-1029', time: '45 mins ago', Icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { id: 3, user: 'System', action: 'Automated Backup Completed', target: '', time: '2 hours ago', Icon: Download, color: 'text-gray-400', bg: 'bg-gray-500/10' },
            { id: 4, user: 'Arjun Singh', action: 'Changed status to', target: 'Away', time: '3 hours ago', Icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { id: 5, user: 'Pooja Patel', action: 'Escalated Issue', target: '#TCK-9921', time: '4 hours ago', Icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
        ];
    } else if (rolePrefix === 'FINANCE') {
        return [
            { id: 1, user: 'Ravi Kumar', action: 'Processed Payout', target: '#PAY-8892', time: '10 mins ago', Icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
            { id: 2, user: 'Neha Sharma', action: 'Approved Invoice', target: '#INV-1029', time: '45 mins ago', Icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { id: 3, user: 'System', action: 'Daily Settlement Run', target: '', time: '2 hours ago', Icon: Download, color: 'text-gray-400', bg: 'bg-gray-500/10' },
            { id: 4, user: 'Arjun Singh', action: 'Changed status to', target: 'Away', time: '3 hours ago', Icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { id: 5, user: 'Pooja Patel', action: 'Flagged Transaction', target: '#TRX-9921', time: '4 hours ago', Icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
        ];
    } else {
        return [
            { id: 1, user: 'Ravi Kumar', action: 'Approved Vendor Application', target: '#VND-8892', time: '10 mins ago', Icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
            { id: 2, user: 'Neha Sharma', action: 'Resolved Dispute', target: '#DSP-1029', time: '45 mins ago', Icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { id: 3, user: 'System', action: 'Automated Backup Completed', target: '', time: '2 hours ago', Icon: Download, color: 'text-gray-400', bg: 'bg-gray-500/10' },
            { id: 4, user: 'Arjun Singh', action: 'Changed status to', target: 'Away', time: '3 hours ago', Icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { id: 5, user: 'Pooja Patel', action: 'Escalated Ticket', target: '#TCK-9921', time: '4 hours ago', Icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
        ];
    }
};

const getMemberActivities = (member: TeamMember, adminRole: string, tickets: any[]) => {
    // Find tickets where this worker had some activity
    const workerTickets = tickets.filter(t => t.assignedWorkerId === member.rawId);
    let activities: any[] = [];
    workerTickets.forEach(t => {
        if (t.timelineActions) {
            t.timelineActions.forEach((action: any) => {
                activities.push({
                    id: action.id || Math.random().toString(),
                    action: action.action.replace(/_/g, ' '),
                    target: `#${t.ticketNumber}`,
                    time: new Date(action.timestamp).toLocaleString(),
                    Icon: CheckCircle2,
                    color: 'text-blue-500',
                    bg: 'bg-blue-500/10',
                    timestamp: new Date(action.timestamp).getTime()
                });
            });
        }
    });

    activities.sort((a, b) => b.timestamp - a.timestamp);
    return activities.slice(0, 5);
};

const getPermissionsHeaders = (adminRole: string) => {
    const rolePrefix = adminRole.split('_')[0];
    if (rolePrefix === 'SUPPORT') return ['Member', 'Users', 'Tickets', 'Chat Logs', 'Reports'];
    if (rolePrefix === 'FINANCE') return ['Member', 'Payouts', 'Invoices', 'Refunds', 'Reports'];
    return ['Member', 'Users & Providers', 'Tasks & Workflow', 'Reports', 'Finance Access'];
};

export const AdminTeamView: React.FC<AdminTeamViewProps> = ({ admin, onBack }) => {
    const { supportWorkers, tickets } = useApp();
    
    const currentAdminRole = admin !== 'NEW' ? admin.role : 'OPERATIONS_ADMIN';
    const rolePrefix = currentAdminRole.split('_')[0];

    const matchingRealWorkers = supportWorkers.filter(w => {
        // Match strictly by manager ID if admin is specified
        if (admin !== 'NEW') {
            return w.managerId === admin.id?.toString();
        }

        return false;
    });

    const realTeamMembers: TeamMember[] = matchingRealWorkers.map(w => {
        const workerTickets = (tickets as any[]).filter(t => t.assignedWorkerId === w.id);
        const tasksTotal = workerTickets.length;
        const resolvedTickets = workerTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED');
        const tasksDone = resolvedTickets.length;
        const completed = tasksDone;
        const performance = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

        const statusVal: 'Online' | 'Away' | 'Offline' = w.status === 'ACTIVE' ? 'Online' : 'Offline';

        return {
            id: w.employeeId || `EMP-${w.id}`,
            rawId: w.id,
            name: w.name,
            role: w.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            status: statusVal,
            tasksTotal,
            tasksDone,
            completed,
            performance,
            lastActive: w.status === 'ACTIVE' ? 'Just now' : 'Yesterday',
            permissions: w.permissions || []
        };
    });

    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

    useEffect(() => {
        setTeamMembers(realTeamMembers);
    }, [supportWorkers, tickets, admin]);

    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

    useEffect(() => {
        if (!selectedMember && teamMembers.length > 0) {
            setSelectedMember(teamMembers[0]);
        }
    }, [teamMembers, selectedMember]);

    const { hasPermission } = useApp();
    const canAddMember = hasPermission('support-workers', 'create');

    const [activeTab, setActiveTab] = useState('Team Members');
    const [editMember, setEditMember] = useState<TeamMember | null>(null);
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [accountStatus, setAccountStatus] = useState<'ACTIVE' | 'BLOCKED' | 'SUSPENDED'>('ACTIVE');
    const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const adminRoleName = admin !== 'NEW' ? admin.role.replace('_', ' ') : 'Operations';
    const teamName = adminRoleName.split(' ')[0] + ' Team';

    const getStatusColor = (status: string) => {
        if (status === 'Online') return 'bg-green-500';
        if (status === 'Away') return 'bg-orange-500';
        return 'bg-gray-500';
    };

    const statusBadgeClass = (s: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED') => {
        if (s === 'ACTIVE') return 'bg-green-500/15 text-green-400 border border-green-500/30';
        if (s === 'SUSPENDED') return 'bg-orange-500/15 text-orange-400 border border-orange-500/30';
        return 'bg-red-500/15 text-red-400 border border-red-500/30';
    };

    const statusDotClass = (s: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED') => {
        if (s === 'ACTIVE') return 'bg-green-400';
        if (s === 'SUSPENDED') return 'bg-orange-400';
        return 'bg-red-400';
    };

    const togglePermission = async (permKey: string) => {
        if (!selectedMember || !selectedMember.rawId) return;
        
        const currentPerms = selectedMember.permissions || [];
        const isEnabled = currentPerms.includes(permKey);
        
        let newPerms;
        if (isEnabled) {
            newPerms = currentPerms.filter(p => p !== permKey);
        } else {
            newPerms = [...currentPerms, permKey];
        }
        
        // Optimistic UI update
        const updatedMember = { ...selectedMember, permissions: newPerms };
        setSelectedMember(updatedMember);
        setTeamMembers(teamMembers.map(m => m.rawId === selectedMember.rawId ? updatedMember : m));
        
        // API call
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`http://127.0.0.1:8001/api/v1/admin/workers/${selectedMember.rawId}`, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ permissions: newPerms })
            });
            if (!response.ok) {
                throw new Error('Failed to update');
            }
        } catch(e) {
            console.error("Failed to update permissions", e);
            // Revert on failure
            setSelectedMember(selectedMember);
            setTeamMembers(teamMembers.map(m => m.rawId === selectedMember.rawId ? selectedMember : m));
        }
    };

    const renderToggle = (label: string, permKey: string) => {
        const enabled = selectedMember?.permissions?.includes(permKey) ?? false;
        return (
            <div className="flex items-center justify-between py-2">
                <span className="text-xs text-white">{label}</span>
                <button 
                    onClick={() => togglePermission(permKey)}
                    className={`w-8 h-4 rounded-full transition-colors relative ${enabled ? 'bg-orange-500' : 'bg-gray-700'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${enabled ? 'translate-x-4' : ''}`}></div>
                </button>
            </div>
        );
    };

    const tabs = ['Team Members', 'Performance', 'Activities', 'Attendance', 'Permissions Overview'];

    const totalMembers = teamMembers.length;
    const onlineMembers = teamMembers.filter(m => m.status === 'Online').length;
    const tasksCompleted = teamMembers.reduce((acc, m) => acc + m.completed, 0);
    const pendingTasks = teamMembers.reduce((acc, m) => acc + (m.tasksTotal - m.tasksDone), 0);
    const avgPerformance = teamMembers.length > 0 ? Math.round(teamMembers.reduce((acc, m) => acc + m.performance, 0) / teamMembers.length) : 0;

    return (
        <>
        {isAddingMember ? (
            <div className="animate-fade-in pb-20">
                <CreateWorker onBack={() => setIsAddingMember(false)} managerId={admin !== 'NEW' ? admin.id?.toString() : undefined} />
            </div>
        ) : (
        <div className="space-y-6 animate-fade-in pb-20 min-w-[1024px]">

                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="flex text-xs text-evera-muted items-center gap-2 mb-2 font-bold uppercase tracking-wider">
                            <span className="hover:text-white cursor-pointer" onClick={onBack}>Team Management</span>
                            <Icons.ChevronRight size={12} />
                            <span className="text-white">{teamName}</span>
                        </div>
                        <h1 className="text-3xl font-black text-white">{teamName}</h1>
                        <p className="text-xs text-evera-muted mt-1">Manage {teamName.toLowerCase()} members, activities and permissions</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-[#161210] border border-[#38302C] rounded-lg px-4 py-2 flex items-center gap-3 cursor-pointer hover:border-evera-primary/50 transition-colors">
                            <span className="text-sm font-bold text-white">May 12 - May 18, 2025</span>
                            <Icons.Calendar size={14} className="text-evera-muted" />
                        </div>
                        <div className="relative cursor-pointer p-2 bg-[#161210] border border-[#38302C] rounded-lg hover:scale-105 transition-transform">
                            <Icons.Bell size={18} className="text-white" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">8</span>
                        </div>
                        <button onClick={() => {
                            const csvContent = "data:text/csv;charset=utf-8," 
                                + "Member Name,Employee ID,Role,Status,Performance,Tasks Completed\n"
                                + teamMembers.map(m => `${m.name},${m.id},${m.role},${m.status},${m.performance}%,${m.completed}`).join("\n");
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", `${teamName}_Report.csv`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }} className="bg-[#161210] border border-[#38302C] hover:bg-[#2A2A2B] px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors flex items-center gap-2">
                            <Download size={16} /> Export Report
                        </button>
                    </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-5 gap-4">
                    {[
                        { label: 'Total Members', value: totalMembers, sub: `All ${adminRoleName} Staff`, icon: <Users size={20} />, color: 'bg-indigo-500/20 text-indigo-500', filter: null },
                        { label: 'Online Now', value: onlineMembers, sub: 'Currently Active', icon: <UserCheck size={20} />, color: 'bg-green-500/20 text-green-500', filter: 'Online' },
                        { label: 'Tasks Completed', value: tasksCompleted, sub: 'This Week', icon: <CheckCircle2 size={20} />, color: 'bg-blue-500/20 text-blue-500', filter: 'tasks' },
                        { label: 'Pending Tasks', value: pendingTasks, sub: 'Requires Attention', icon: <Clock size={20} />, color: 'bg-orange-500/20 text-orange-500', filter: 'pending' },
                    ].map(card => (
                        <div
                            key={card.label}
                            onClick={() => setStatusFilter(statusFilter === card.filter ? null : card.filter)}
                            className={`bg-evera-card rounded-xl border p-5 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02] ${
                                statusFilter === card.filter
                                    ? 'border-evera-primary shadow-lg shadow-evera-primary/10'
                                    : 'border-evera-border hover:border-evera-primary/50'
                            }`}
                        >
                            <div>
                                <p className="text-[10px] font-bold text-evera-muted uppercase">{card.label}</p>
                                <h3 className="text-2xl font-black text-white mt-1">{card.value}</h3>
                                <p className="text-[10px] text-evera-muted mt-1">{card.sub}</p>
                            </div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${card.color}`}>{card.icon}</div>
                        </div>
                    ))}
                    <div className="bg-evera-card rounded-xl border border-evera-border p-5 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-evera-muted uppercase">Avg. Performance</p>
                            <h3 className="text-2xl font-black text-white mt-1">{avgPerformance}%</h3>
                            <p className="text-[10px] text-evera-muted mt-1">Team Average</p>
                        </div>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center border-4 border-blue-500">
                            <span className="text-xs font-bold text-blue-500">{avgPerformance}%</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-evera-border overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? 'border-evera-primary text-evera-primary' : 'border-transparent text-evera-muted hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* ── TAB: TEAM MEMBERS ── */}
                {activeTab === 'Team Members' && (
                    <div className="flex gap-6 items-start">

                        {/* Table */}
                        <div className="flex-1 bg-evera-card rounded-2xl border border-evera-border p-5 w-full">
                            {/* Toolbar */}
                            <div className="flex justify-between items-center gap-4 mb-6">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="relative w-64">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-evera-muted" />
                                        <input type="text" placeholder="Search team member..." className="w-full bg-[#161210] border border-[#38302C] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-evera-primary" />
                                    </div>
                                    <div className="flex items-center gap-2 bg-[#161210] border border-[#38302C] rounded-lg px-3 py-2 cursor-pointer">
                                        <span className="text-xs text-white">All Roles</span>
                                        <ChevronDown size={14} className="text-evera-muted" />
                                    </div>
                                    <div className="flex items-center gap-2 bg-[#161210] border border-[#38302C] rounded-lg px-3 py-2 cursor-pointer">
                                        <span className="text-xs text-white">All Status</span>
                                        <ChevronDown size={14} className="text-evera-muted" />
                                    </div>
                                    <div className="flex items-center gap-2 text-evera-muted hover:text-white cursor-pointer px-2">
                                        <Filter size={14} />
                                        <span className="text-xs font-bold">More Filters</span>
                                    </div>
                                </div>
                                {canAddMember && (
                                    <button
                                        onClick={() => setIsAddingMember(true)}
                                        className="bg-[#f48c25] hover:bg-[#d9751a] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 whitespace-nowrap"
                                    >
                                        <Plus size={14} /> Add Member
                                    </button>
                                )}
                            </div>

                            {/* Active Filter Banner */}
                            {statusFilter && (() => {
                                const filtered = teamMembers.filter(m => {
                                    if (statusFilter === 'Online') return m.status === 'Online';
                                    if (statusFilter === 'tasks') return m.completed > 0;
                                    if (statusFilter === 'pending') return (m.tasksTotal - m.tasksDone) > 0;
                                    return true;
                                });
                                const label = statusFilter === 'Online'
                                    ? `🟢 Online Now — ${filtered.length} member${filtered.length !== 1 ? 's' : ''} currently active`
                                    : statusFilter === 'tasks'
                                    ? `✅ Tasks Completed — ${filtered.length} member${filtered.length !== 1 ? 's' : ''} with completed tasks`
                                    : `⏳ Pending Tasks — ${filtered.length} member${filtered.length !== 1 ? 's' : ''} have work requiring attention`;
                                return (
                                    <div className="flex items-center justify-between mb-4 px-4 py-2.5 bg-evera-primary/10 border border-evera-primary/30 rounded-xl animate-fade-in">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-evera-primary">Filtered View:</span>
                                            <span className="text-xs text-white">{label}</span>
                                        </div>
                                        <button
                                            onClick={() => setStatusFilter(null)}
                                            className="text-[10px] font-bold text-evera-muted hover:text-white border border-[#38302C] px-2 py-1 rounded-md transition-colors"
                                        >
                                            ✕ Clear Filter
                                        </button>
                                    </div>
                                );
                            })()}

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#38302C]">
                                            {['Member', 'Role', 'Status', "Today's Tasks", 'Completed', 'Performance', 'Last Active', 'Actions'].map((h, i) => {
                                                const isHighlighted =
                                                    (statusFilter === 'Online' && h === 'Status') ||
                                                    (statusFilter === 'tasks' && h === 'Completed') ||
                                                    (statusFilter === 'pending' && h === "Today's Tasks");
                                                return (
                                                    <th key={h} className={`py-3 px-4 text-[10px] font-bold uppercase tracking-wider ${i >= 3 && i <= 5 ? 'text-center' : i === 7 ? 'text-right' : ''} ${isHighlighted ? 'text-evera-primary' : 'text-evera-muted'}`}>{h}</th>
                                                );
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...teamMembers]
                                            .sort((a, b) => {
                                                if (statusFilter === 'tasks') return b.completed - a.completed;
                                                if (statusFilter === 'pending') return (b.tasksTotal - b.tasksDone) - (a.tasksTotal - a.tasksDone);
                                                if (statusFilter === 'Online') return a.status === 'Online' ? -1 : 1;
                                                return 0;
                                            })
                                            .filter(m => {
                                                if (!statusFilter) return true;
                                                if (statusFilter === 'Online') return m.status === 'Online';
                                                return true;
                                            })
                                            .map(member => (
                                            <tr
                                                key={member.id}
                                                onClick={() => setSelectedMember(member)}
                                                className={`border-b border-[#38302C] hover:bg-[#161210]/50 transition-colors cursor-pointer border-l-2 ${selectedMember?.id === member.id ? 'bg-[#161210] border-l-evera-primary' : 'border-l-transparent'}`}
                                            >
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-evera-primary/20 text-evera-primary flex items-center justify-center text-xs font-bold">
                                                            {member.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-white">{member.name}</p>
                                                            <p className="text-[10px] text-evera-muted">{member.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">{member.role}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(member.status)}`}></div>
                                                        <span className="text-xs text-white">{member.status}</span>
                                                    </div>
                                                </td>
                                                <td className={`py-3 px-4 text-center text-xs font-bold ${
                                                    statusFilter === 'pending'
                                                        ? 'text-evera-primary'
                                                        : 'text-white'
                                                }`}>
                                                    {member.tasksDone} / {member.tasksTotal}
                                                    {statusFilter === 'pending' && (
                                                        <span className="ml-1 text-[9px] text-evera-primary/70">
                                                            ({member.tasksTotal - member.tasksDone} left)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className={`py-3 px-4 text-center text-xs font-bold ${
                                                    statusFilter === 'tasks'
                                                        ? 'text-evera-primary'
                                                        : 'text-white'
                                                }`}>{member.completed}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-white w-8">{member.performance > 0 ? `${member.performance}%` : '-'}</span>
                                                        <div className="w-16 h-1 bg-[#161210] rounded-full overflow-hidden">
                                                            <div className="h-full rounded-full" style={{ width: `${member.performance}%`, backgroundColor: member.performance >= 90 ? '#22C55E' : member.performance >= 80 ? '#f48c25' : '#EF4444' }}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-xs text-evera-muted">{member.lastActive}</td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* View */}
                                                        <button
                                                            title="View Profile"
                                                            onClick={e => { e.stopPropagation(); setSelectedMember(member); setActiveTab('Team Members'); }}
                                                            className="p-1.5 rounded-md hover:bg-[#38302C] hover:text-white text-evera-muted transition-colors"
                                                        >
                                                            <Icons.Eye size={14} />
                                                        </button>
                                                        {/* Edit */}
                                                        <button
                                                            title="Edit Member"
                                                            onClick={e => { e.stopPropagation(); setEditMember({ ...member }); }}
                                                            className="p-1.5 rounded-md hover:bg-[#38302C] hover:text-evera-primary text-evera-muted transition-colors"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        {/* More dropdown */}
                                                        <div className="relative" ref={openDropdownId === member.id ? dropdownRef : null}>
                                                            <button
                                                                title="More Options"
                                                                onClick={e => { e.stopPropagation(); setOpenDropdownId(prev => prev === member.id ? null : member.id); }}
                                                                className={`p-1.5 rounded-md transition-colors text-evera-muted hover:bg-[#38302C] hover:text-white ${openDropdownId === member.id ? 'bg-[#38302C] text-white' : ''}`}
                                                            >
                                                                <MoreVertical size={14} />
                                                            </button>
                                                            {openDropdownId === member.id && (
                                                                <div className="absolute right-0 top-full mt-1 w-44 bg-[#1A1613] border border-[#38302C] rounded-xl shadow-2xl z-50 overflow-hidden">
                                                                    <button onClick={() => { setSelectedMember(member); setShowMessageModal(true); setOpenDropdownId(null); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-white hover:bg-[#241E1B] transition-colors">
                                                                        <MessageSquare size={12} className="text-blue-400" /> Message
                                                                    </button>
                                                                    <button onClick={() => { setSelectedMember(member); setShowResetConfirm(true); setOpenDropdownId(null); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-white hover:bg-[#241E1B] transition-colors">
                                                                        <Key size={12} className="text-orange-400" /> Reset Password
                                                                    </button>
                                                                    <div className="border-t border-[#38302C] my-1"></div>
                                                                    <button onClick={() => { setAccountStatus(s => s === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED'); setOpenDropdownId(null); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                                                                        <Ban size={12} /> Block Access
                                                                    </button>
                                                                    <button onClick={() => { setSelectedMember(member); setShowSuspendConfirm(true); setOpenDropdownId(null); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-500 hover:bg-red-500/10 transition-colors">
                                                                        <Power size={12} /> Suspend User
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-4 text-xs text-evera-muted">
                                <span>Showing {totalMembers === 0 ? 0 : 1} to {Math.min(10, totalMembers)} of {totalMembers} members</span>
                                <div className="flex items-center gap-1">
                                    <button className="w-6 h-6 rounded bg-evera-primary text-white font-bold flex items-center justify-center">1</button>
                                </div>
                            </div>
                        </div>

                        {/* Right: Profile Card */}
                        {selectedMember && (
                            <div className="w-full xl:w-80 shrink-0 bg-[#120F0E] rounded-2xl border border-evera-border overflow-hidden flex flex-col">

                                {/* Profile Header */}
                                <div className="p-6 border-b border-[#38302C]">
                                    <div className="flex items-start gap-4">
                                        <div className="relative shrink-0">
                                            <div className="w-16 h-16 rounded-full bg-[#161210] border-2 border-evera-border flex items-center justify-center text-xl font-bold text-white">
                                                {selectedMember.name.charAt(0)}
                                            </div>
                                            <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-[#120F0E] rounded-full ${getStatusColor(selectedMember.status)}`}></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-base font-black text-white truncate">{selectedMember.name} <Icons.Check className="inline text-blue-500 bg-blue-500/20 rounded-full p-0.5" size={14} /></h2>
                                            <p className="text-[10px] text-evera-muted mt-0.5">{selectedMember.id}</p>
                                            <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">{selectedMember.role}</span>
                                            <div className="flex items-center gap-1.5 text-xs text-white mt-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(selectedMember.status)}`}></div>
                                                {selectedMember.status}
                                            </div>
                                            <p className="text-[10px] text-evera-muted mt-1">Joined: Jan 12, 2024</p>
                                        </div>
                                    </div>

                                    {/* Account Status */}
                                    <div className="mt-4 p-3 bg-[#1A1613] rounded-xl border border-[#38302C] flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold text-evera-muted uppercase">Account Status</p>
                                            <p className="text-[10px] text-evera-muted mt-0.5">Member since Jan 12, 2023</p>
                                        </div>
                                        <button
                                            onClick={() => setAccountStatus(s => s === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE')}
                                            className={`text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${statusBadgeClass(accountStatus)}`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full ${statusDotClass(accountStatus)}`}></div>
                                            {accountStatus}
                                        </button>
                                    </div>

                                    {/* Mini Stats */}
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#38302C]">
                                        <div>
                                            <p className="text-[9px] text-evera-muted uppercase font-bold">Today's Tasks</p>
                                            <p className="text-lg font-black text-white mt-0.5">{selectedMember.tasksDone} / {selectedMember.tasksTotal}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-evera-muted uppercase font-bold">Completed</p>
                                            <p className="text-lg font-black text-white mt-0.5">{selectedMember.completed}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-evera-muted uppercase font-bold">Performance</p>
                                            <p className="text-lg font-black text-white mt-0.5">{selectedMember.performance}%</p>
                                        </div>
                                    </div>

                                    {/* Recent Activity */}
                                    <div className="mt-4 pt-4 border-t border-[#38302C] space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-evera-muted uppercase tracking-wider">Recent Completed Work</span>
                                            <span className="text-[9px] bg-green-500/10 text-green-400 font-bold px-1.5 py-0.5 rounded uppercase">Active</span>
                                        </div>
                                        <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                                            {getMemberActivities(selectedMember, currentAdminRole, tickets).length > 0 ? (
                                                getMemberActivities(selectedMember, currentAdminRole, tickets).map(act => (
                                                    <div key={act.id} className="flex gap-2.5 bg-[#161210] p-2.5 rounded-xl border border-[#38302C]">
                                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${act.bg}`}>
                                                            <act.Icon size={12} className={act.color} />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-[11px] text-white font-medium leading-snug">
                                                                {act.action} <span className="text-evera-primary font-bold">{act.target}</span>
                                                            </p>
                                                            <p className="text-[9px] text-evera-muted mt-0.5">{act.time}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-[10px] text-evera-muted text-center py-4">No recent activities found.</p>
                                            )}
                                        </div>

                                    </div>
                                </div>

                                {/* Permissions Section */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-white">Permissions</h3>
                                        <button onClick={() => setEditMember({ ...selectedMember })} className="text-[10px] text-evera-muted hover:text-evera-primary flex items-center gap-1 transition-colors">
                                            <Edit size={10} /> Edit Permissions
                                        </button>
                                    </div>
                                    <div className="bg-[#161210] rounded-xl border border-[#38302C] overflow-hidden">
                                        <div className="bg-[#241E1B] px-4 py-2 border-b border-[#38302C] flex items-center justify-between">
                                            <span className="text-xs font-bold text-white">Tickets & Support</span>
                                            <ChevronDown size={14} className="text-evera-muted" />
                                        </div>
                                        <div className="p-4 space-y-1">
                                            {renderToggle('View Tickets', 'read_tickets')}
                                            {renderToggle('Resolve Tickets', 'resolve_tickets')}
                                            {renderToggle('Contact Users', 'contact_users')}
                                            {renderToggle('Escalate Tickets', 'escalate_tickets')}
                                        </div>
                                    </div>
                                    <div className="bg-[#161210] rounded-xl border border-[#38302C] overflow-hidden">
                                        <div className="bg-[#241E1B] px-4 py-2 border-b border-[#38302C] flex items-center justify-between">
                                            <span className="text-xs font-bold text-white">Users & Providers</span>
                                            <ChevronDown size={14} className="text-evera-muted" />
                                        </div>
                                        <div className="p-4 space-y-1">
                                            {renderToggle('View Providers', 'view_providers')}
                                            {renderToggle('Approve Providers', 'approve_providers')}
                                            {renderToggle('Verify Documents', 'verify_documents')}
                                            {renderToggle('Edit Providers', 'edit_providers')}
                                        </div>
                                    </div>
                                    {['Reports & Analytics', 'Finance Access', 'Support Access', 'System Access'].map(cat => (
                                        <div key={cat} className="bg-[#161210] rounded-xl border border-[#38302C] px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#241E1B]">
                                            <span className="text-xs font-bold text-white">{cat}</span>
                                            <ChevronDown size={14} className="text-evera-muted" />
                                        </div>
                                    ))}
                                </div>

                                {/* Bottom Actions */}
                                <div className="p-6 border-t border-[#38302C] space-y-3 bg-[#161210]">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowMessageModal(true)}
                                            className="flex-1 bg-transparent border border-[#38302C] hover:bg-[#2A2A2B] hover:border-blue-500/40 text-white py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all"
                                        >
                                            <MessageSquare size={12} className="text-blue-400" /> Message
                                        </button>
                                        <button
                                            onClick={() => setShowResetConfirm(true)}
                                            className="flex-1 bg-transparent border border-[#38302C] hover:bg-[#2A2A2B] hover:border-orange-500/40 text-white py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all"
                                        >
                                            <Key size={12} className="text-orange-400" /> Reset Password
                                        </button>
                                        <button
                                            onClick={() => setAccountStatus(s => s === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED')}
                                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all border ${
                                                accountStatus === 'BLOCKED'
                                                    ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                                                    : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
                                            }`}
                                        >
                                            <Ban size={12} /> {accountStatus === 'BLOCKED' ? 'Unblock' : 'Block Access'}
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setShowSuspendConfirm(true)}
                                        className={`w-full py-2.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 transition-all border ${
                                            accountStatus === 'SUSPENDED'
                                                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
                                                : 'bg-transparent border-red-500/30 hover:bg-red-500/10 text-red-500'
                                        }`}
                                    >
                                        <Power size={14} /> {accountStatus === 'SUSPENDED' ? 'Unsuspend User' : 'Suspend User'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB: PERFORMANCE ── */}
                {activeTab === 'Performance' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[#120F0E] border border-evera-border rounded-xl p-6">
                                <p className="text-xs text-evera-muted font-bold uppercase mb-2">Avg Resolution Time</p>
                                <h3 className="text-3xl font-black text-white">42<span className="text-sm font-medium text-evera-muted ml-1">mins</span></h3>
                                <p className="text-xs text-green-500 mt-2 flex items-center gap-1"><Icons.TrendUp size={12} /> 12% faster than last week</p>
                            </div>
                            <div className="bg-[#120F0E] border border-evera-border rounded-xl p-6">
                                <p className="text-xs text-evera-muted font-bold uppercase mb-2">CSAT Score</p>
                                <h3 className="text-3xl font-black text-white">4.8<span className="text-sm font-medium text-evera-muted ml-1">/ 5.0</span></h3>
                                <p className="text-xs text-green-500 mt-2 flex items-center gap-1"><Icons.TrendUp size={12} /> 0.2 increase</p>
                            </div>
                            <div className="bg-[#120F0E] border border-evera-border rounded-xl p-6">
                                <p className="text-xs text-evera-muted font-bold uppercase mb-2">SLA Compliance</p>
                                <h3 className="text-3xl font-black text-white">98.5%</h3>
                                <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><Icons.Reject size={12} /> 0.5% decrease</p>
                            </div>
                        </div>
                        <div className="bg-evera-card rounded-2xl border border-evera-border p-6">
                            <h3 className="text-lg font-black text-white mb-6">Top Performers</h3>
                            <div className="space-y-4">
                                {[...teamMembers].sort((a, b) => b.performance - a.performance).slice(0, 5).map((member, i) => (
                                    <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#161210] rounded-xl border border-[#38302C] gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-[#241E1B] border border-[#38302C] flex items-center justify-center font-bold text-white shrink-0">#{i + 1}</div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{member.name}</p>
                                                <p className="text-xs text-evera-muted">{member.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-center">
                                                <p className="text-[10px] text-evera-muted uppercase">Tasks</p>
                                                <p className="text-sm font-bold text-white">{member.completed}</p>
                                            </div>
                                            <div className="w-32">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-evera-muted">Score</span>
                                                    <span className="font-bold text-white">{member.performance}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-[#241E1B] rounded-full overflow-hidden">
                                                    <div className="h-full bg-evera-primary rounded-full" style={{ width: `${member.performance}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB: ACTIVITIES ── */}
                {activeTab === 'Activities' && (
                    <div className="bg-evera-card rounded-2xl border border-evera-border p-6">
                        <h3 className="text-lg font-black text-white mb-6">Recent Activities</h3>
                        <div className="space-y-6">
                            {getActivities(admin !== 'NEW' ? admin.role : 'OPERATIONS_ADMIN').map(activity => (
                                <div key={activity.id} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.bg}`}>
                                            <activity.Icon size={18} className={activity.color} />
                                        </div>
                                        <div className="w-px flex-1 bg-[#38302C] mt-2"></div>
                                    </div>
                                    <div className="pb-6 pt-2">
                                        <p className="text-sm text-white">
                                            <span className="font-bold">{activity.user}</span> {activity.action} <span className="font-bold text-evera-primary">{activity.target}</span>
                                        </p>
                                        <p className="text-xs text-evera-muted mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── TAB: ATTENDANCE ── */}
                {activeTab === 'Attendance' && (
                    <div className="bg-evera-card rounded-2xl border border-evera-border p-6 overflow-x-auto">
                        <h3 className="text-lg font-black text-white mb-6">Weekly Attendance</h3>
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-[#38302C]">
                                    {['Member', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Total Hours'].map((h, i) => (
                                        <th key={h} className={`py-3 px-4 text-[10px] font-bold text-evera-muted uppercase tracking-wider ${i >= 1 && i <= 5 ? 'text-center' : i === 6 ? 'text-right' : ''}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {teamMembers.slice(0, 5).map(member => (
                                    <tr key={member.id} className="border-b border-[#38302C] hover:bg-[#161210]/50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#241E1B] flex items-center justify-center text-xs font-bold text-white">{member.name.charAt(0)}</div>
                                                <span className="text-sm font-bold text-white">{member.name}</span>
                                            </div>
                                        </td>
                                        {['8h', '8h', '8.5h', '7.5h'].map((h, i) => (
                                            <td key={i} className="py-4 px-4 text-center"><span className="text-xs text-white bg-[#241E1B] px-2 py-1 rounded">{h}</span></td>
                                        ))}
                                        <td className="py-4 px-4 text-center">
                                            {member.status === 'Away'
                                                ? <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded">Leave</span>
                                                : <span className="text-xs text-white bg-[#241E1B] px-2 py-1 rounded">8h</span>}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <span className="text-sm font-bold text-evera-primary">{member.status === 'Away' ? '32h' : '40h'}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── TAB: PERMISSIONS OVERVIEW ── */}
                {activeTab === 'Permissions Overview' && (
                    <div className="bg-evera-card rounded-2xl border border-evera-border p-6 overflow-x-auto">
                        <h3 className="text-lg font-black text-white mb-6">Access Matrix</h3>
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-[#38302C]">
                                    {getPermissionsHeaders(admin !== 'NEW' ? admin.role : 'OPERATIONS_ADMIN').map((h, i) => (
                                        <th key={h} className={`py-3 px-4 text-[10px] font-bold text-evera-muted uppercase tracking-wider ${i > 0 ? 'text-center' : ''}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {teamMembers.slice(0, 5).map(member => (
                                    <tr key={member.id} className="border-b border-[#38302C] hover:bg-[#161210]/50 transition-colors">
                                        <td className="py-4 px-4">
                                            <p className="text-sm font-bold text-white">{member.name}</p>
                                            <p className="text-[10px] text-evera-muted">{member.role}</p>
                                        </td>
                                        <td className="py-4 px-4 text-center"><CheckCircle2 size={16} className="text-green-500 mx-auto" /></td>
                                        <td className="py-4 px-4 text-center"><CheckCircle2 size={16} className="text-green-500 mx-auto" /></td>
                                        <td className="py-4 px-4 text-center">
                                            {member.role.includes('Manager') ? <CheckCircle2 size={16} className="text-green-500 mx-auto" /> : <Ban size={14} className="text-red-500/50 mx-auto" />}
                                        </td>
                                        <td className="py-4 px-4 text-center"><Ban size={14} className="text-red-500/50 mx-auto" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            )}

            {/* ── EDIT MEMBER MODAL ── */}
            {editMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setEditMember(null)}>
                    <div className="bg-[#1A1613] border border-[#38302C] rounded-2xl w-full max-w-lg p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-white">Edit Member</h2>
                            <button onClick={() => setEditMember(null)} className="text-evera-muted hover:text-white transition-colors"><Icons.Reject size={20} /></button>
                        </div>
                        <div className="flex items-center gap-4 mb-6 p-4 bg-[#120F0E] rounded-xl border border-[#38302C]">
                            <div className="w-14 h-14 rounded-full bg-evera-primary/20 text-evera-primary flex items-center justify-center text-xl font-bold">{editMember.name.charAt(0)}</div>
                            <div>
                                <p className="text-sm font-bold text-white">{editMember.name}</p>
                                <p className="text-xs text-evera-muted">{editMember.id}</p>
                                <div className={`inline-flex items-center gap-1.5 mt-1 text-xs px-2 py-0.5 rounded-full ${editMember.status === 'Online' ? 'bg-green-500/10 text-green-400' : editMember.status === 'Away' ? 'bg-orange-500/10 text-orange-400' : 'bg-gray-500/10 text-gray-400'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(editMember.status)}`}></div>
                                    {editMember.status}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-evera-muted uppercase mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        value={editMember.name}
                                        onChange={e => setEditMember({ ...editMember, name: e.target.value })}
                                        className="w-full bg-[#120F0E] border border-[#38302C] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-evera-primary transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-evera-muted uppercase mb-1.5">Role</label>
                                    <select
                                        value={editMember.role}
                                        onChange={e => setEditMember({ ...editMember, role: e.target.value })}
                                        className="w-full bg-[#120F0E] border border-[#38302C] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-evera-primary transition-colors"
                                    >
                                        <option>{admin !== 'NEW' ? admin.role.split('_')[0].charAt(0).toUpperCase() + admin.role.split('_')[0].slice(1).toLowerCase() : 'Operations'} Manager</option>
                                        <option>{admin !== 'NEW' ? admin.role.split('_')[0].charAt(0).toUpperCase() + admin.role.split('_')[0].slice(1).toLowerCase() : 'Operations'} Staff</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-evera-muted uppercase mb-1.5">Status</label>
                                <div className="flex gap-3">
                                    {(['Online', 'Away', 'Offline'] as const).map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setEditMember({ ...editMember, status: s })}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                                                editMember.status === s
                                                    ? s === 'Online' ? 'bg-green-500/20 border-green-500 text-green-400'
                                                    : s === 'Away' ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                                                    : 'bg-gray-500/20 border-gray-500 text-gray-400'
                                                    : 'bg-transparent border-[#38302C] text-evera-muted hover:border-evera-muted'
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setEditMember(null)} className="flex-1 py-2.5 rounded-xl border border-[#38302C] text-sm font-bold text-evera-muted hover:text-white transition-colors">Cancel</button>
                            <button
                                onClick={() => {
                                    if (selectedMember?.id === editMember.id) setSelectedMember(editMember);
                                    setEditMember(null);
                                }}
                                className="flex-1 py-2.5 rounded-xl bg-evera-primary hover:bg-[#d9751a] text-white text-sm font-bold transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MESSAGE MODAL ── */}
            {showMessageModal && selectedMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowMessageModal(false)}>
                    <div className="bg-[#1A1613] border border-[#38302C] rounded-2xl w-full max-w-md p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-evera-primary/20 text-evera-primary flex items-center justify-center font-bold">{selectedMember.name.charAt(0)}</div>
                                <div>
                                    <h2 className="text-base font-black text-white">Message {selectedMember.name}</h2>
                                    <p className="text-[10px] text-evera-muted">{selectedMember.role}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowMessageModal(false)} className="text-evera-muted hover:text-white"><Icons.Reject size={18} /></button>
                        </div>
                        <textarea
                            value={messageText}
                            onChange={e => setMessageText(e.target.value)}
                            placeholder="Type your message here..."
                            rows={4}
                            className="w-full bg-[#120F0E] border border-[#38302C] rounded-xl px-4 py-3 text-sm text-white placeholder-evera-muted focus:outline-none focus:border-evera-primary resize-none transition-colors"
                        />
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setShowMessageModal(false)} className="flex-1 py-2.5 rounded-xl border border-[#38302C] text-sm font-bold text-evera-muted hover:text-white transition-colors">Cancel</button>
                            <button
                                onClick={() => { setShowMessageModal(false); setMessageText(''); }}
                                className="flex-1 py-2.5 rounded-xl bg-evera-primary hover:bg-[#d9751a] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                <MessageSquare size={14} /> Send Message
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── RESET PASSWORD CONFIRM ── */}
            {showResetConfirm && selectedMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)}>
                    <div className="bg-[#1A1613] border border-[#38302C] rounded-2xl w-full max-w-sm p-8 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-5">
                            <Key size={28} className="text-orange-400" />
                        </div>
                        <h2 className="text-xl font-black text-white mb-2">Reset Password?</h2>
                        <p className="text-sm text-evera-muted mb-6">A password reset link will be sent to <span className="text-white font-bold">{selectedMember.name}</span>'s registered email address.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-[#38302C] text-sm font-bold text-evera-muted hover:text-white transition-colors">Cancel</button>
                            <button 
                                onClick={async () => {
                                    setShowResetConfirm(false);
                                    try {
                                        const token = localStorage.getItem('auth_token');
                                        const response = await fetch(`http://127.0.0.1:8001/api/v1/admin/workers/${selectedMember.rawId}/reset-password`, {
                                            method: 'POST',
                                            headers: { 'Authorization': `Bearer ${token}` }
                                        });
                                        if (response.ok) {
                                            const data = await response.json();
                                            alert(`Password reset to: ${data.new_password}`);
                                        } else {
                                            alert("Failed to reset password.");
                                        }
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }} 
                                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors">Confirm Reset</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SUSPEND CONFIRM ── */}
            {showSuspendConfirm && selectedMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowSuspendConfirm(false)}>
                    <div className="bg-[#1A1613] border border-[#38302C] rounded-2xl w-full max-w-sm p-8 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5">
                            <Power size={28} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-black text-white mb-2">{accountStatus === 'SUSPENDED' ? 'Unsuspend User?' : 'Suspend User?'}</h2>
                        <p className="text-sm text-evera-muted mb-6">
                            {accountStatus === 'SUSPENDED'
                                ? <><span className="text-white font-bold">{selectedMember.name}</span> will be restored and can log in again.</>
                                : <><span className="text-white font-bold">{selectedMember.name}</span> will lose access to the system immediately.</>
                            }
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowSuspendConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-[#38302C] text-sm font-bold text-evera-muted hover:text-white transition-colors">Cancel</button>
                            <button
                                onClick={() => { setAccountStatus(s => s === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'); setShowSuspendConfirm(false); }}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors"
                            >
                                {accountStatus === 'SUSPENDED' ? 'Unsuspend' : 'Suspend'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
