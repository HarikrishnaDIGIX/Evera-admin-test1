import React, { useState } from 'react';
import { SupportWorker, Ticket } from '../../types';
import { useApp } from '../../context/AppContext';
import { TicketDetails } from './TicketDetails';
import {
  ArrowLeft, Activity, CheckCircle2, AlertTriangle, Clock, User,
  Phone, Mail, Shield, Star, Zap,
  MessageSquare, ArrowUpRight, ShieldAlert, Check, Plus,
  History, RefreshCw, Users, Circle, ChevronRight, Download, Settings
} from 'lucide-react';

interface WorkerActivityPanelProps {
  worker: SupportWorker;
  allWorkers: SupportWorker[];
  tickets: Ticket[];
  onBack: () => void;
  onReassignTicket?: (ticketId: string) => void;
  dateRangeLabel?: string;
}

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'SPECIALIST': return 'bg-purple-500/15 border-purple-500/30 text-purple-400';
    case 'LEVEL_2_AGENT': return 'bg-blue-500/15 border-blue-500/30 text-blue-400';
    default: return 'bg-[#f48c25]/15 border-[#f48c25]/30 text-[#f48c25]';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'URGENT': return 'bg-red-500/10 border-red-500/30 text-red-400';
    case 'HIGH': return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
    case 'MEDIUM': return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    default: return 'bg-green-500/10 border-green-500/30 text-green-400';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'OPEN': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    case 'IN_PROGRESS': return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    case 'WAITING_FOR_USER': return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
    case 'WAITING_FOR_PROVIDER': return 'bg-pink-500/10 border-pink-500/30 text-pink-400';
    case 'RESOLVED': return 'bg-green-500/10 border-green-500/30 text-green-400';
    case 'CLOSED': return 'bg-stone-500/10 border-stone-500/30 text-stone-400';
    case 'ESCALATED': return 'bg-red-500/10 border-red-500/30 text-red-400';
    default: return 'bg-white/5 border-white/10 text-gray-400';
  }
};

const getActionConfig = (action: string) => {
  switch (action) {
    case 'CREATED': return { label: 'Ticket Created', icon: Plus, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
    case 'ASSIGNED': return { label: 'Ticket Claimed', icon: User, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
    case 'OPENED': return { label: 'Ticket Opened', icon: Activity, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' };
    case 'CONTACTED_USER':
    case 'WAITING_FOR_USER': return { label: 'Customer Contacted', icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' };
    case 'WAITING_FOR_PROVIDER': return { label: 'Provider Contacted', icon: MessageSquare, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' };
    case 'RESOLVED': return { label: 'Issue Resolved ✅', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' };
    case 'CLOSED': return { label: 'Ticket Closed', icon: Check, color: 'text-stone-400', bg: 'bg-stone-500/10 border-stone-500/20' };
    case 'ESCALATED':
    case 'ESCALATED_SUPPORT_ADMIN':
    case 'ESCALATED_SUPER_ADMIN':
    case 'ESCALATED_DEPARTMENT': return { label: 'Case Escalated 🚨', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
    case 'TAKEOVER_REQUESTED': return { label: 'Takeover Requested', icon: ShieldAlert, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' };
    case 'TAKEOVER_APPROVED': return { label: 'Takeover Approved', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' };
    case 'TAKEOVER_REJECTED': return { label: 'Takeover Declined', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
    case 'TRANSFERRED': return { label: 'Ticket Transferred', icon: ArrowUpRight, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' };
    case 'OWNERSHIP_REMOVED': return { label: 'Ownership Removed', icon: Shield, color: 'text-stone-400', bg: 'bg-stone-500/10 border-stone-500/20' };
    case 'DOCS_VERIFIED': return { label: 'Docs Verified', icon: Shield, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' };
    case 'APPROVED': return { label: 'Vendor Approved', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' };
    case 'REUPLOAD_REQUESTED': return { label: 'Re-upload Req', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
    default: return { label: action.replace(/_/g, ' '), icon: Activity, color: 'text-[#f48c25]', bg: 'bg-[#f48c25]/10 border-[#f48c25]/20' };
  }
};

export const WorkerActivityPanel: React.FC<WorkerActivityPanelProps> = ({
  worker,
  allWorkers,
  tickets,
  onBack,
  onReassignTicket,
  dateRangeLabel = 'Last 30 Days'
}) => {
  const {
    tickets: liveTickets,
    setTickets,
    addNotification,
    refreshData,
    assignTicketToWorkerLocal,
    addTicketTimelineActionLocal,
    assignTicketToDepartmentLocal,
    escalateTicketLocal,
    claimTicketLocal,
    requestTakeoverLocal,
    respondToTakeoverLocal,
    transferTicketLocal,
    removeTicketOwnershipLocal,
    updateSupportWorkerLocal,
    adminUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'activity' | 'team'>('activity');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [activeKpi, setActiveKpi] = useState<string | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);

  // ── Derived ticket data ──────────────────────────────────────────────────
  const workerTickets = tickets.filter(t => t.assignedWorkerId === worker.id);

  const activeTickets = workerTickets.filter(t =>
    t.status === 'OPEN' || t.status === 'IN_PROGRESS' ||
    t.status === 'WAITING_FOR_USER' || t.status === 'WAITING_FOR_PROVIDER'
  );

  const resolvedTickets = tickets.filter(t =>
    t.resolvedByWorkerId === worker.id ||
    (t.assignedWorkerId === worker.id && (t.status === 'RESOLVED' || t.status === 'CLOSED'))
  );

  const escalatedTickets = workerTickets.filter(t =>
    t.status === 'ESCALATED' ||
    (t.escalationLevel && t.escalationLevel !== 'NONE') ||
    t.assignedDepartment
  );

  // ── Live activity feed ───────────────────────────────────────────────────
  interface ActivityFeedItem {
    ticketId: string;
    ticketNumber: string;
    action: string;
    actorName: string;
    timestamp: string;
    note?: string;
  }

  const activityFeed: ActivityFeedItem[] = [];
  tickets.forEach(t => {
    (t.timelineActions || []).forEach(a => {
      // Include if it matches the current dashboard worker OR if it was performed by the logged in admin
      if (
        a.actorName.toLowerCase().trim() === worker.name.toLowerCase().trim() ||
        a.actorName === 'Support Specialist' ||
        a.actorName === 'Operations Manager' ||
        a.actorName === 'Super Admin'
      ) {
        activityFeed.push({
          ticketId: t.id,
          ticketNumber: t.ticketNumber,
          action: a.action,
          actorName: a.actorName,
          timestamp: a.timestamp,
          note: a.note,
        });
      }
    });
  });
  activityFeed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const opsActivityFeed = [
    { ticketId: 'ops1', ticketNumber: 'V-0082', action: 'DOCS_VERIFIED', actorName: worker.name, timestamp: '15 mins ago', note: 'Verified documents for Sarah Jenkins' },
    { ticketId: 'ops2', ticketNumber: 'V-0089', action: 'APPROVED', actorName: worker.name, timestamp: '45 mins ago', note: 'Approved vendor profile ID #V-882' },
    { ticketId: 'ops3', ticketNumber: 'V-0091', action: 'REUPLOAD_REQUESTED', actorName: worker.name, timestamp: '2 hours ago', note: 'Requested Aadhaar re-upload for Vendor #V-890' },
  ];

  // ── KPI Metrics ──────────────────────────────────────────────────────────
  const totalAssigned = workerTickets.length;
  const activeLoad = activeTickets.length;
  const resolvedCount = resolvedTickets.length;
  const escalatedCount = escalatedTickets.length;
  const transfersReceived = tickets.reduce((acc: number, t) => {
    const count = (t.timelineActions || []).filter((a: any) =>
      a.action === 'TRANSFERRED' && a.note?.includes(`to ${worker.name}`)
    ).length;
    return acc + count;
  }, 0);
  const csatScore = worker.name.toLowerCase().includes('john') ? '4.9'
    : worker.name.toLowerCase().includes('jane') || worker.name.toLowerCase().includes('sarah') ? '4.8'
    : '4.7';
  const avgSpeed = activeLoad > 4 ? '2.4 hrs' : activeLoad > 2 ? '1.8 hrs' : '1.4 hrs';

  // ── TicketDetails handlers ───────────────────────────────────────────────
  const handleStatusChange = async (status: any) => {
    if (!selectedTicket) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://127.0.0.1:8001/api/v1/admin/tickets/${selectedTicket.id}/status?status=${status}`, {
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
  const handlePriorityChange = (priority: any) => {
    if (!selectedTicket) return;
    addNotification(`Ticket priority updated to ${priority}`);
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, priority } : t));
  };
  const handleAssignChange = async (assigneeId: string, assigneeName: string) => {
    if (!selectedTicket) return;
    await assignTicketToWorkerLocal(selectedTicket.id, assigneeId, assigneeName);
  };
  const handleAddComment = async (content: string, isInternal: boolean) => {
    if (!selectedTicket || !adminUser) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://127.0.0.1:8001/api/v1/admin/tickets/${selectedTicket.id}/comments`, {
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

  // Always look up the ticket from live context state (not stale prop snapshot)
  const liveSelectedTicket = selectedTicket
    ? (liveTickets as Ticket[]).find(t => t.id === selectedTicket.id) || selectedTicket
    : null;

  // ── Team overview data ────────────────────────────────────────────────────
  const teamData = allWorkers.map(w => {
    const wTickets = tickets.filter(t => t.assignedWorkerId === w.id);
    const wActive = wTickets.filter(t =>
      t.status === 'OPEN' || t.status === 'IN_PROGRESS' ||
      t.status === 'WAITING_FOR_USER' || t.status === 'WAITING_FOR_PROVIDER'
    );
    const wResolved = tickets.filter(t =>
      t.resolvedByWorkerId === w.id ||
      (t.assignedWorkerId === w.id && (t.status === 'RESOLVED' || t.status === 'CLOSED'))
    );
    const latestTicket = wActive[0];
    const currentAction = latestTicket
      ? latestTicket.status === 'IN_PROGRESS' ? `Working on ${latestTicket.ticketNumber}`
      : latestTicket.status === 'WAITING_FOR_USER' ? `Waiting for customer on ${latestTicket.ticketNumber}`
      : latestTicket.status === 'WAITING_FOR_PROVIDER' ? `Waiting for provider on ${latestTicket.ticketNumber}`
      : `Reviewing ${latestTicket.ticketNumber}`
      : wResolved.length > 0 ? 'All tickets resolved — available'
      : 'No active tickets';

    return {
      ...w,
      activeCount: wActive.length,
      resolvedCount: wResolved.length,
      currentAction,
      isCurrentWorker: w.id === worker.id,
    };
  });

  const transferTickets = tickets.filter(t =>
    (t.timelineActions || []).some((a: any) =>
      a.action === 'TRANSFERRED' && a.note?.includes(`to ${worker.name}`)
    )
  );

  const isOpsWorker = worker.role === 'OPERATIONS_WORKER';

  // Filter mock lists based on date range string to simulate real-time filtering
  const getSliceCount = (baseCount: number) => {
    if (dateRangeLabel === 'Today') return Math.max(1, Math.floor(baseCount * 0.15));
    if (dateRangeLabel === 'Yesterday') return Math.max(2, Math.floor(baseCount * 0.25));
    if (dateRangeLabel === 'Last 7 Days') return Math.max(4, Math.floor(baseCount * 0.6));
    if (dateRangeLabel === 'This Month') return Math.max(5, Math.floor(baseCount * 0.8));
    if (dateRangeLabel?.includes('to')) return Math.max(3, Math.floor(baseCount * 0.5)); // Custom
    return baseCount; // Last 30 Days or Default
  };

  const mockOpsReviewed = [
    { id: 'ops-r1', ticketNumber: 'V-0082', customerName: 'Sarah Jenkins', subject: 'Vendor Profile Verification', status: 'RESOLVED', priority: 'HIGH', category: 'VENDOR_VERIFICATION', createdAt: 'Oct 24, 2024 10:30 AM' },
    { id: 'ops-r2', ticketNumber: 'V-0083', customerName: 'Max Studio', subject: 'Business Documents Review', status: 'RESOLVED', priority: 'MEDIUM', category: 'DOCS_REVIEW', createdAt: 'Oct 23, 2024 11:00 AM' },
    { id: 'ops-r3', ticketNumber: 'V-0084', customerName: 'Elite Catering', subject: 'FSSAI License Review', status: 'RESOLVED', priority: 'HIGH', category: 'VENDOR_VERIFICATION', createdAt: 'Oct 22, 2024 09:15 AM' },
    { id: 'ops-r4', ticketNumber: 'V-0085', customerName: 'Quick Fix Plumbers', subject: 'Aadhaar Verification', status: 'RESOLVED', priority: 'MEDIUM', category: 'DOCS_REVIEW', createdAt: 'Oct 21, 2024 02:00 PM' },
    { id: 'ops-r5', ticketNumber: 'V-0086', customerName: 'Glamour Beauty', subject: 'Portfolio Verification', status: 'RESOLVED', priority: 'LOW', category: 'VENDOR_VERIFICATION', createdAt: 'Oct 21, 2024 09:30 AM' },
    { id: 'ops-r6', ticketNumber: 'V-0087', customerName: 'Urban Decor', subject: 'Trade License Review', status: 'RESOLVED', priority: 'MEDIUM', category: 'DOCS_REVIEW', createdAt: 'Oct 20, 2024 04:15 PM' },
    { id: 'ops-r7', ticketNumber: 'V-0088', customerName: 'James Rodriguez', subject: 'Background Check Complete', status: 'RESOLVED', priority: 'HIGH', category: 'VENDOR_VERIFICATION', createdAt: 'Oct 19, 2024 11:45 AM' },
    { id: 'ops-r8', ticketNumber: 'V-0089', customerName: 'Sofia Davis', subject: 'Site Inspection Report', status: 'RESOLVED', priority: 'MEDIUM', category: 'DOCS_REVIEW', createdAt: 'Oct 18, 2024 03:20 PM' },
    { id: 'ops-r9', ticketNumber: 'V-0090', customerName: 'Tech Fixers', subject: 'GST Certification Review', status: 'RESOLVED', priority: 'LOW', category: 'VENDOR_VERIFICATION', createdAt: 'Oct 17, 2024 10:10 AM' },
    { id: 'ops-r10', ticketNumber: 'V-0091', customerName: 'Green Thumb Landscaping', subject: 'Business Address Verification', status: 'RESOLVED', priority: 'MEDIUM', category: 'DOCS_REVIEW', createdAt: 'Oct 16, 2024 01:50 PM' },
  ].slice(0, getSliceCount(10)) as Ticket[];

  const mockOpsVerified = [
    { id: 'ops-v1', ticketNumber: 'V-0082', customerName: 'Sarah Jenkins', subject: 'PAN & GST Verified', status: 'RESOLVED', priority: 'HIGH', category: 'VENDOR_VERIFICATION', createdAt: 'Oct 24, 2024 10:45 AM' },
    { id: 'ops-v2', ticketNumber: 'V-0083', customerName: 'Max Studio', subject: 'Trade License Verified', status: 'RESOLVED', priority: 'MEDIUM', category: 'DOCS_REVIEW', createdAt: 'Oct 23, 2024 11:30 AM' },
    { id: 'ops-v3', ticketNumber: 'V-0084', customerName: 'Elite Catering', subject: 'FSSAI Verified', status: 'RESOLVED', priority: 'HIGH', category: 'DOCS_REVIEW', createdAt: 'Oct 22, 2024 09:15 AM' },
    { id: 'ops-v4', ticketNumber: 'V-0092', customerName: 'Happy Paws Pet Care', subject: 'Identity Docs Verified', status: 'RESOLVED', priority: 'MEDIUM', category: 'VENDOR_VERIFICATION', createdAt: 'Oct 15, 2024 11:20 AM' },
    { id: 'ops-v5', ticketNumber: 'V-0093', customerName: 'Sparkle Cleaners', subject: 'Business Registration Verified', status: 'RESOLVED', priority: 'LOW', category: 'DOCS_REVIEW', createdAt: 'Oct 14, 2024 04:30 PM' },
    { id: 'ops-v6', ticketNumber: 'V-0094', customerName: 'Fit Life Gym', subject: 'Trainer Certifications Verified', status: 'RESOLVED', priority: 'HIGH', category: 'VENDOR_VERIFICATION', createdAt: 'Oct 13, 2024 09:05 AM' },
    { id: 'ops-v7', ticketNumber: 'V-0095', customerName: 'City Movers', subject: 'Vehicle Insurance Verified', status: 'RESOLVED', priority: 'MEDIUM', category: 'DOCS_REVIEW', createdAt: 'Oct 12, 2024 02:40 PM' },
    { id: 'ops-v8', ticketNumber: 'V-0096', customerName: 'Fresh Bakes', subject: 'Health & Safety Certificate Verified', status: 'RESOLVED', priority: 'HIGH', category: 'VENDOR_VERIFICATION', createdAt: 'Oct 11, 2024 10:15 AM' },
    { id: 'ops-v9', ticketNumber: 'V-0097', customerName: 'Handy Andy', subject: 'Background Check Verified', status: 'RESOLVED', priority: 'MEDIUM', category: 'DOCS_REVIEW', createdAt: 'Oct 10, 2024 03:55 PM' },
    { id: 'ops-v10', ticketNumber: 'V-0098', customerName: 'Aqua Pure Water', subject: 'Water Testing Certificate Verified', status: 'RESOLVED', priority: 'LOW', category: 'VENDOR_VERIFICATION', createdAt: 'Oct 09, 2024 11:30 AM' },
    { id: 'ops-v11', ticketNumber: 'V-0099', customerName: 'Sunset Photography', subject: 'Portfolio Quality Verified', status: 'RESOLVED', priority: 'HIGH', category: 'DOCS_REVIEW', createdAt: 'Oct 08, 2024 01:25 PM' },
    { id: 'ops-v12', ticketNumber: 'V-0100', customerName: 'Cozy Stays', subject: 'Property Ownership Verified', status: 'RESOLVED', priority: 'MEDIUM', category: 'VENDOR_VERIFICATION', createdAt: 'Oct 07, 2024 09:40 AM' },
  ].slice(0, getSliceCount(12)) as Ticket[];

  const mockOpsRejected = [
    { id: 'ops-rej1', ticketNumber: 'V-0085', customerName: 'Quick Fix Plumbers', subject: 'Aadhaar Card Blurred', status: 'RESOLVED', priority: 'MEDIUM', category: 'VENDOR_VERIFICATION', createdAt: 'Oct 21, 2024 02:00 PM' },
    { id: 'ops-rej2', ticketNumber: 'V-0101', customerName: 'Shadow Security', subject: 'License Expired', status: 'RESOLVED', priority: 'HIGH', category: 'DOCS_REVIEW', createdAt: 'Oct 06, 2024 10:05 AM' },
    { id: 'ops-rej3', ticketNumber: 'V-0102', customerName: 'Budget Catering', subject: 'FSSAI Missing', status: 'RESOLVED', priority: 'MEDIUM', category: 'VENDOR_VERIFICATION', createdAt: 'Oct 05, 2024 03:15 PM' },
  ].slice(0, getSliceCount(3)) as Ticket[];

  const mockOpsPending = [
    { id: 'ops-p1', ticketNumber: 'V-0088', customerName: 'James Rodriguez', subject: 'Background Check Pending', status: 'IN_PROGRESS', priority: 'MEDIUM', category: 'VENDOR_VERIFICATION', createdAt: 'Oct 25, 2024 01:00 PM' },
    { id: 'ops-p2', ticketNumber: 'V-0089', customerName: 'Sofia Davis', subject: 'Site Inspection Report', status: 'OPEN', priority: 'LOW', category: 'VENDOR_VERIFICATION', createdAt: 'Oct 26, 2024 09:00 AM' },
    { id: 'ops-p3', ticketNumber: 'V-0103', customerName: 'Electric Dreams', subject: 'Trade License Awaiting Verification', status: 'OPEN', priority: 'HIGH', category: 'DOCS_REVIEW', createdAt: 'Oct 27, 2024 11:45 AM' },
  ].slice(0, getSliceCount(3)) as Ticket[];

  // Merge real tickets to simulate real-time updates for Ops workers
  // Include tickets assigned to or resolved by the logged-in admin directly
  const adminActiveTickets = tickets.filter(t => t.assignedWorkerId === adminUser?.id && t.status !== 'RESOLVED' && t.status !== 'CLOSED');
  const adminResolvedTickets = tickets.filter(t => t.resolvedByWorkerId === adminUser?.id || (t.assignedWorkerId === adminUser?.id && t.status === 'RESOLVED'));
  
  const combinedActive = Array.from(new Set([...activeTickets, ...adminActiveTickets]));
  const combinedResolved = Array.from(new Set([...resolvedTickets, ...adminResolvedTickets]));

  // Separate rejections from standard verified/resolved
  const adminRejected = combinedResolved.filter(t => t.tags?.includes('rejection'));
  const adminVerified = combinedResolved.filter(t => !t.tags?.includes('rejection'));

  const finalOpsPending = [...combinedActive, ...mockOpsPending.slice(0, getSliceCount(3))] as Ticket[];
  const finalOpsVerified = [...adminVerified, ...mockOpsVerified.slice(0, getSliceCount(12))] as Ticket[];
  const finalOpsReviewed = [...mockOpsReviewed.slice(0, getSliceCount(10))] as Ticket[];
  const finalOpsRejected = [...adminRejected, ...mockOpsRejected.slice(0, getSliceCount(3))] as Ticket[];

  const kpis = isOpsWorker ? [
    { key: 'reviewed', label: 'Vendors Reviewed', value: finalOpsReviewed.length, color: '#f48c25', icon: Users, tickets: finalOpsReviewed },
    { key: 'verified', label: 'Docs Verified', value: finalOpsVerified.length, color: '#10b981', icon: CheckCircle2, tickets: finalOpsVerified },
    { key: 'rejected', label: 'Rejections Sent', value: finalOpsRejected.length, color: '#ef4444', icon: AlertTriangle, tickets: finalOpsRejected },
    { key: 'pending', label: 'Pending Reviews', value: finalOpsPending.length, color: '#f59e0b', icon: Clock, tickets: finalOpsPending },
    { key: 'avg_time', label: 'Avg Review Time', value: `15 mins`, color: '#8b5cf6', icon: Zap, tickets: [] as Ticket[] },
    { key: 'csat', label: 'Accuracy Score', value: `99.2%`, color: '#10b981', icon: Shield, tickets: [] as Ticket[] },
  ] : [
    { key: 'assigned', label: 'Total Assigned', value: totalAssigned, color: '#f48c25', icon: Activity, tickets: workerTickets },
    { key: 'active', label: 'Active Load', value: activeLoad, color: activeLoad > 5 ? '#ef4444' : activeLoad > 2 ? '#f59e0b' : '#10b981', icon: Zap, tickets: activeTickets },
    { key: 'resolved', label: 'Resolved', value: resolvedCount, color: '#10b981', icon: CheckCircle2, tickets: resolvedTickets },
    { key: 'escalated', label: 'Escalated', value: escalatedCount, color: '#ef4444', icon: AlertTriangle, tickets: escalatedTickets },
    { key: 'transfers', label: 'Transfers In', value: transfersReceived, color: '#8b5cf6', icon: ArrowUpRight, tickets: transferTickets },
    { key: 'csat', label: 'CSAT Score', value: `★ ${csatScore}`, color: '#f59e0b', icon: Star, tickets: [] as Ticket[] },
  ];

  const tabs = [
    { key: 'activity', label: 'Worker Activity', icon: Activity },
    { key: 'team', label: 'Team Overview', icon: Users },
  ] as const;

  // ── If a ticket is selected, show its full details ───────────────────────
  if (liveSelectedTicket) {
    return (
      <div className="space-y-4 animate-fade-in">
        {/* Breadcrumb back trail */}
        <div className="flex items-center gap-2 text-xs text-[#A8A29E] pb-2 border-b border-evera-border">
          <button onClick={onBack} className="hover:text-white transition-colors font-medium">Workers</button>
          <ChevronRight size={12} />
          <button onClick={() => setSelectedTicket(null)} className="hover:text-white transition-colors font-medium">{worker.name}'s Activity</button>
          <ChevronRight size={12} />
          <span className="text-[#f48c25] font-bold">{liveSelectedTicket.ticketNumber}</span>
        </div>

        <TicketDetails
          ticket={liveSelectedTicket}
          onBack={() => setSelectedTicket(null)}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onAssignChange={handleAssignChange}
          onAddComment={handleAddComment}
        />
      </div>
    );
  }

  // ── PDF / Print Report Generator ───────────────────────────────────
  const handleDownloadPDF = () => {
    const now = new Date().toLocaleString();
    const permissions = (worker as any).permissions || [];

    const ticketRows = (list: Ticket[], emptyMsg: string) =>
      list.length === 0
        ? `<tr><td colspan="5" style="text-align:center;color:#888;padding:16px;">${emptyMsg}</td></tr>`
        : list.map(t => `
            <tr>
              <td>${t.ticketNumber}</td>
              <td>${t.subject}</td>
              <td>${t.customerName}</td>
              <td><span class="badge badge-${t.priority.toLowerCase()}">${t.priority}</span></td>
              <td><span class="badge badge-status">${t.status.replace(/_/g, ' ')}</span></td>
            </tr>`).join('');

    const feedRows = activityFeed.slice(0, 30).map(a => `
      <tr>
        <td style="font-family:monospace;font-size:11px;color:#f48c25">${a.ticketNumber}</td>
        <td>${a.action.replace(/_/g, ' ')}</td>
        <td style="color:#888;font-size:11px">${a.timestamp}</td>
        <td style="font-style:italic;color:#aaa;font-size:11px">${a.note || '—'}</td>
      </tr>`).join('');

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Worker Report — ${worker.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; padding: 32px; font-size: 13px; }
    h1 { font-size: 22px; font-weight: 900; color: #1a1a1a; }
    h2 { font-size: 15px; font-weight: 800; color: #1a1a1a; margin: 24px 0 10px; border-bottom: 2px solid #f48c25; padding-bottom: 6px; }
    h3 { font-size: 13px; font-weight: 700; color: #444; margin: 16px 0 8px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; border-bottom: 3px solid #f48c25; padding-bottom: 20px; }
    .header-left h1 { color: #f48c25; }
    .header-left p { color: #666; font-size: 12px; margin-top: 4px; }
    .logo { font-size: 28px; font-weight: 900; color: #f48c25; }
    .meta { font-size: 11px; color: #888; text-align: right; }
    .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
    .profile-card { background: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 8px; padding: 14px; }
    .profile-card label { font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px; }
    .profile-card span { font-weight: 700; color: #1a1a1a; }
    .kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 24px; }
    .kpi-box { background: #fff8f0; border: 1px solid #fde8c8; border-radius: 8px; padding: 12px; text-align: center; }
    .kpi-box .val { font-size: 24px; font-weight: 900; color: #f48c25; }
    .kpi-box .lbl { font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; margin-top: 4px; }
    .perm-list { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
    .perm-tag { background: #f48c25; color: #fff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; }
    .perm-none { color: #e53e3e; font-style: italic; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #f48c25; color: #fff; padding: 9px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; font-size: 12px; vertical-align: middle; }
    tr:nth-child(even) td { background: #fafafa; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
    .badge-urgent { background: #fee2e2; color: #dc2626; }
    .badge-high { background: #ffedd5; color: #ea580c; }
    .badge-medium { background: #dbeafe; color: #2563eb; }
    .badge-low { background: #dcfce7; color: #16a34a; }
    .badge-status { background: #f1f5f9; color: #475569; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e5e5; color: #aaa; font-size: 11px; display: flex; justify-content: space-between; }
    @media print {
      body { padding: 20px; }
      .no-print { display: none !important; }
      @page { margin: 15mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <p style="font-size:11px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Evera Admin Platform</p>
      <h1>Worker Activity Report</h1>
      <p>${worker.name} &bull; ${worker.employeeId} &bull; ${worker.role.replace(/_/g, ' ')}</p>
    </div>
    <div class="meta">
      <div class="logo">EA</div>
      <p>Generated: ${now}</p>
      <p>Status: <strong style="color:${worker.status === 'ACTIVE' ? '#16a34a' : '#dc2626'}">${worker.status}</strong></p>
    </div>
  </div>

  <h2>Worker Profile</h2>
  <div class="profile-grid">
    <div class="profile-card"><label>Full Name</label><span>${worker.name}</span></div>
    <div class="profile-card"><label>Employee ID</label><span>${worker.employeeId}</span></div>
    <div class="profile-card"><label>Email Address</label><span>${worker.email}</span></div>
    <div class="profile-card"><label>Phone Number</label><span>${worker.phone}</span></div>
    <div class="profile-card"><label>System Role</label><span>${worker.role.replace(/_/g, ' ')}</span></div>
    <div class="profile-card"><label>Account Status</label><span style="color:${worker.status === 'ACTIVE' ? '#16a34a' : '#dc2626'}">${worker.status}</span></div>
  </div>

  <h2>Assigned Permissions</h2>
  <div class="perm-list">
    ${permissions.length > 0
      ? permissions.map((p: string) => `<span class="perm-tag">${p.replace(/_/g, ' ')}</span>`).join('')
      : '<span class="perm-none">No permissions assigned</span>'}
  </div>

  <h2>Performance Summary</h2>
  <div class="kpi-grid">
    <div class="kpi-box"><div class="val">${totalAssigned}</div><div class="lbl">Total Assigned</div></div>
    <div class="kpi-box"><div class="val">${activeLoad}</div><div class="lbl">Active Load</div></div>
    <div class="kpi-box"><div class="val">${resolvedCount}</div><div class="lbl">Resolved</div></div>
    <div class="kpi-box"><div class="val">${escalatedCount}</div><div class="lbl">Escalated</div></div>
    <div class="kpi-box"><div class="val">${csatScore}</div><div class="lbl">CSAT Score</div></div>
  </div>

  <h2>Currently Active Tickets (${activeTickets.length})</h2>
  <table>
    <thead><tr><th>Ticket #</th><th>Subject</th><th>Customer</th><th>Priority</th><th>Status</th></tr></thead>
    <tbody>${ticketRows(activeTickets, 'No active tickets.')}</tbody>
  </table>

  <h2>Resolved Tickets (${resolvedTickets.length})</h2>
  <table>
    <thead><tr><th>Ticket #</th><th>Subject</th><th>Customer</th><th>Priority</th><th>Status</th></tr></thead>
    <tbody>${ticketRows(resolvedTickets, 'No resolved tickets.')}</tbody>
  </table>

  <h2>Escalated Tickets (${escalatedTickets.length})</h2>
  <table>
    <thead><tr><th>Ticket #</th><th>Subject</th><th>Customer</th><th>Priority</th><th>Status</th></tr></thead>
    <tbody>${ticketRows(escalatedTickets, 'No escalated tickets.')}</tbody>
  </table>

  <h2>Activity Audit Feed (Last ${Math.min(activityFeed.length, 30)} Events)</h2>
  <table>
    <thead><tr><th>Ticket</th><th>Action</th><th>Timestamp</th><th>Notes</th></tr></thead>
    <tbody>${feedRows || '<tr><td colspan="4" style="text-align:center;color:#888;padding:16px;">No activity recorded.</td></tr>'}</tbody>
  </table>

  <div class="footer">
    <span>Evera Admin Platform &mdash; Confidential Worker Report</span>
    <span>Printed: ${now}</span>
  </div>

  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 border-b border-evera-border pb-4">
        <button
          onClick={onBack}
          className="p-2 bg-[#241E1B] hover:bg-[#38302C] border border-evera-border text-white rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft size={14} />
          <span>Back to Workers</span>
        </button>
        <div className="flex-1 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f48c25] to-[#ff6b00] text-white flex items-center justify-center font-black text-lg shadow-lg shadow-orange-950/20">
            {worker.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-white">{worker.name}</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getRoleBadgeColor(worker.role)}`}>
                {worker.role.replace(/_/g, ' ')}
              </span>
              {worker.departments && worker.departments.length > 0 && (
                <div className="flex gap-1">
                  {worker.departments.map(d => (
                    <span key={d} className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-green-500/10 border-green-500/30 text-green-400">
                      {d.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              )}
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                worker.status === 'ACTIVE'
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                <Circle size={6} className={worker.status === 'ACTIVE' ? 'fill-green-400 text-green-400 animate-pulse' : 'fill-red-400 text-red-400'} />
                {worker.status === 'ACTIVE' ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-[#A8A29E]">
              <span className="font-mono">{worker.employeeId}</span>
              <span className="flex items-center gap-1"><Mail size={10} />{worker.email}</span>
              <span className="flex items-center gap-1"><Phone size={10} />{worker.phone}</span>
            </div>
          </div>
        </div>
        <div className="text-right hidden lg:block flex flex-col items-end gap-2">
          {/* ── Permissions Manager ─────────────────────────────────────────── */}
          <div className="relative mb-2 flex justify-end">
            <button
              onClick={() => setShowPermissions(!showPermissions)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161210] hover:bg-[#38302C] border border-[#38302C] text-xs font-bold text-white rounded-xl transition-all"
            >
              <Settings size={12} className="text-[#f48c25]" />
              <span>Manage Permissions</span>
            </button>
            {showPermissions && (
              <div className="absolute top-full mt-2 right-0 w-56 bg-[#241E1B] border border-[#38302C] rounded-xl shadow-2xl z-50 p-2 animate-fade-in flex flex-col gap-3">
                
                {/* Departments / Queues Section */}
                <div>
                  <h4 className="text-[9px] font-black text-[#A8A29E] uppercase tracking-wider mb-1.5 px-2">Assigned Queues</h4>
                  <div className="flex flex-col gap-1">
                    {(() => {
                      const roleDeps = worker.role.includes('OPERATIONS') ? [
                        { key: 'OPERATIONS', label: 'Operations' },
                        { key: 'VENDOR_SUPPORT', label: 'Vendor Support' }
                      ] : worker.role.includes('FINANCE') ? [
                        { key: 'FINANCE_SUPPORT', label: 'Finance Support' }
                      ] : [
                        { key: 'CUSTOMER_SUPPORT', label: 'Customer Support' },
                        { key: 'VENDOR_SUPPORT', label: 'Vendor Support' },
                        { key: 'FINANCE_SUPPORT', label: 'Finance Support' },
                        { key: 'TECHNICAL_SUPPORT', label: 'Technical Support' }
                      ];
                      return roleDeps.map(dept => {
                      const hasDept = worker.departments?.includes(dept.key as any);
                      return (
                        <button
                          key={dept.key}
                          onClick={() => {
                            const newDepts = hasDept
                              ? (worker.departments || []).filter(d => d !== dept.key)
                              : [...(worker.departments || []), dept.key as any];
                            if (updateSupportWorkerLocal) {
                              updateSupportWorkerLocal(worker.id, { departments: newDepts });
                            }
                          }}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
                            hasDept
                              ? 'bg-blue-500/10 text-blue-400 hover:bg-red-500/10 hover:text-red-400'
                              : 'hover:bg-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {hasDept ? <CheckCircle2 size={12} className="group-hover:hidden" /> : <Circle size={12} />}
                            <span>{dept.label}</span>
                          </div>
                          {hasDept && <span className="text-[8px] opacity-50 uppercase group-hover:block hidden">Revoke</span>}
                        </button>
                      );
                    })})()}
                  </div>
                </div>

                {/* Action Permissions Section */}
                <div>
                  <h4 className="text-[9px] font-black text-[#A8A29E] uppercase tracking-wider mb-1.5 px-2">Action Permissions</h4>
                  <div className="flex flex-col gap-1">
                    {[
                      { key: 'read_tickets', label: 'View Tickets' },
                      { key: 'resolve_tickets', label: 'Resolve Tickets' },
                      { key: 'contact_users', label: 'Contact Users' },
                      { key: 'escalate_tickets', label: 'Escalate Tickets' }
                    ].map(perm => {
                      const hasPerm = worker.permissions?.includes(perm.key);
                      return (
                        <button
                          key={perm.key}
                          onClick={() => {
                            const newPerms = hasPerm
                              ? (worker.permissions || []).filter(p => p !== perm.key)
                              : [...(worker.permissions || []), perm.key];
                            if (updateSupportWorkerLocal) {
                              updateSupportWorkerLocal(worker.id, { permissions: newPerms });
                            }
                          }}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold transition-all group ${
                            hasPerm
                              ? 'bg-green-500/10 text-green-400 hover:bg-red-500/10 hover:text-red-400'
                              : 'hover:bg-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {hasPerm ? <CheckCircle2 size={12} className="group-hover:hidden" /> : <Circle size={12} />}
                            <span>{perm.label}</span>
                          </div>
                          {hasPerm && <span className="text-[8px] opacity-50 uppercase group-hover:block hidden">Revoke</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-4">
            <div>
              <p className="text-[10px] text-[#A8A29E] font-bold uppercase tracking-wider">{isOpsWorker ? 'Avg Review Time' : 'Avg Resolution'}</p>
              <p className="text-lg font-black text-white">{isOpsWorker ? '15 mins' : avgSpeed}</p>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f48c25] hover:bg-[#d9751a] text-white text-[10px] font-bold rounded-xl transition-all shadow-md shadow-orange-950/20"
            >
              <Download size={12} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>



      {/* ── KPI Scoreboard ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, i) => {
          const isActive = activeKpi === kpi.key;
          const isClickable = kpi.key !== 'csat';
          return (
            <button
              key={i}
              onClick={() => isClickable && setActiveKpi(isActive ? null : kpi.key)}
              className={`card p-4 relative overflow-hidden group transition-all duration-300 text-left w-full ${
                isActive
                  ? 'border-2 scale-[1.02] shadow-lg'
                  : isClickable
                  ? 'bg-evera-card border-evera-border hover:border-evera-primary/40 hover:scale-[1.01] cursor-pointer'
                  : 'bg-evera-card border-evera-border cursor-default'
              }`}
              style={isActive ? { borderColor: kpi.color, backgroundColor: `${kpi.color}08`, boxShadow: `0 4px 24px ${kpi.color}20` } : {}}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${kpi.color}20`, color: kpi.color }}>
                  <kpi.icon size={14} />
                </div>
                {isActive && (
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase" style={{ backgroundColor: `${kpi.color}20`, color: kpi.color }}>Active</span>
                )}
              </div>
              <p className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-tight">{kpi.label}</p>
              <p className="text-xl font-black mt-1" style={{ color: kpi.color }}>{kpi.value}</p>
              {isClickable && (
                <p className="text-[9px] text-[#A8A29E] mt-1 group-hover:text-white/50 transition-colors">
                  {isActive ? 'Click to collapse' : 'Click to view'}
                </p>
              )}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 transition-opacity" style={{ backgroundColor: kpi.color, opacity: isActive ? 1 : 0 }} />
            </button>
          );
        })}
      </div>

      {/* ── KPI Drill-down Filtered Ticket List ─────────────────────── */}
      {activeKpi && activeKpi !== 'csat' && (() => {
        const kpi = kpis.find(k => k.key === activeKpi);
        if (!kpi) return null;
        const filteredTickets = kpi.tickets;
        return (
          <div className="card border-2 p-5 space-y-4 animate-fade-in" style={{ borderColor: `${kpi.color}40`, backgroundColor: `${kpi.color}05` }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="p-1.5 rounded-lg" style={{ backgroundColor: `${kpi.color}20`, color: kpi.color }}>
                  <kpi.icon size={14} />
                </span>
                <span>{kpi.label}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg border" style={{ backgroundColor: `${kpi.color}15`, borderColor: `${kpi.color}30`, color: kpi.color }}>
                  {filteredTickets.length} Ticket{filteredTickets.length !== 1 ? 's' : ''}
                </span>
              </h3>
              <button
                onClick={() => setActiveKpi(null)}
                className="text-[10px] text-[#A8A29E] hover:text-white transition-colors border border-[#38302C] hover:border-white/20 px-3 py-1 rounded-lg"
              >
                Close ✕
              </button>
            </div>

            {filteredTickets.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#A8A29E] border border-dashed border-evera-border rounded-xl">
                No tickets in this category.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 no-scrollbar">
                {filteredTickets.map(ticket => (
                  <button
                    key={ticket.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedTicket(ticket); }}
                    className="w-full text-left flex items-center gap-3 p-3 bg-[#161210] border border-[#38302C] hover:border-evera-primary/40 hover:bg-evera-primary/5 rounded-xl transition-all group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 border" style={{ backgroundColor: `${kpi.color}15`, borderColor: `${kpi.color}30`, color: kpi.color }}>
                      {ticket.customerName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-bold text-[#f48c25]">{ticket.ticketNumber}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getStatusColor(ticket.status)}`}>{ticket.status.replace(/_/g, ' ')}</span>
                      </div>
                      <p className="text-xs font-bold text-white truncate mt-1">{ticket.subject}</p>
                      <p className="text-[10px] text-[#A8A29E] mt-0.5">Customer: {ticket.customerName} • {ticket.category}</p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      {ticket.assignedToName && (
                        <span className="text-[9px] text-[#A8A29E] truncate max-w-[80px]">Handler: {ticket.assignedToName}</span>
                      )}
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded text-white transition-all" style={{ backgroundColor: kpi.color }}>
                        Open →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Tab Bar ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-[#161210] border border-evera-border p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-[#f48c25] text-white shadow-md shadow-orange-950/20'
                : 'text-[#A8A29E] hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon size={12} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'activity' && (
        <div className="grid grid-cols-12 gap-6">
          {/* ── LEFT: Active + Resolved + Escalated ─────────────────────── */}
          <div className="col-span-12 lg:col-span-7 space-y-6">

            {/* Currently Working On */}
            <div className="card bg-evera-card border-evera-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500"><Zap size={14} /></span>
                  {isOpsWorker ? 'Recent Vendor Verifications' : 'Currently Working On'}
                </h3>
                <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-lg font-bold">
                  {isOpsWorker ? '8 Pending' : `${activeTickets.length} Active`}
                </span>
              </div>
              {isOpsWorker ? (
                <div className="space-y-3">
                  {finalOpsPending.map(ticket => (
                    <button 
                      key={ticket.id} 
                      onClick={() => setSelectedTicket(ticket)}
                      className="w-full text-left flex items-start gap-3 p-3 bg-[#161210] border border-[#38302C] hover:border-amber-500/50 hover:bg-amber-500/5 rounded-xl transition-all group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-amber-500/20">
                        {ticket.customerName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-bold text-[#f48c25]">{ticket.ticketNumber}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            ticket.priority === 'HIGH' || ticket.priority === 'URGENT' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                            ticket.priority === 'MEDIUM' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                            'bg-blue-500/10 border-blue-500/20 text-blue-400'
                          }`}>
                            {ticket.priority}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            ticket.status === 'IN_PROGRESS' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                            ticket.status === 'OPEN' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                            'bg-gray-500/10 border-gray-500/20 text-gray-400'
                          }`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white mt-1 truncate">{ticket.customerName} • {ticket.subject}</p>
                        <p className="text-[10px] text-[#A8A29E] mt-0.5">Category: {ticket.category.replace('_', ' ')}</p>
                      </div>
                      <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                        <span className="text-[9px] text-[#A8A29E] font-bold uppercase tracking-wider">Started</span>
                        <span className="text-[10px] text-white font-mono">{ticket.createdAt.split(' ')[1]} {ticket.createdAt.split(' ')[2]}</span>
                        <ChevronRight size={12} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : activeTickets.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#A8A29E] border border-dashed border-evera-border rounded-xl">
                  No active tickets assigned to this worker.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeTickets.map(ticket => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="w-full text-left flex items-start gap-3 p-3 bg-[#161210] border border-[#38302C] hover:border-amber-500/50 hover:bg-amber-500/5 rounded-xl transition-all group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-amber-500/20">
                        {ticket.customerName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-bold text-[#f48c25]">{ticket.ticketNumber}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white mt-1 truncate">{ticket.subject}</p>
                        <p className="text-[10px] text-[#A8A29E] mt-0.5">Customer: {ticket.customerName} • {ticket.category}</p>
                      </div>
                      <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                        <span className="text-[9px] text-[#A8A29E] font-bold uppercase tracking-wider">Started</span>
                        <span className="text-[10px] text-white font-mono">{ticket.createdAt}</span>
                        <ChevronRight size={12} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Resolved Tickets */}
            <div className="card bg-evera-card border-evera-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-green-500/10 text-green-500"><CheckCircle2 size={14} /></span>
                  Resolved Tickets
                </h3>
                <span className="text-[10px] bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded-lg font-bold">
                  {resolvedTickets.length} Total
                </span>
              </div>
              {resolvedTickets.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#A8A29E] border border-dashed border-evera-border rounded-xl">
                  No resolved tickets yet.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
                  {resolvedTickets.map(ticket => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="w-full text-left flex items-center gap-3 p-3 bg-green-950/10 border border-green-500/15 hover:border-green-500/40 hover:bg-green-500/5 rounded-xl transition-all group cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-full bg-green-500/15 text-green-400 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-[#f48c25]">{ticket.ticketNumber}</span>
                          <span className="text-[9px] bg-green-500/10 border border-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold">RESOLVED</span>
                        </div>
                        <p className="text-xs font-bold text-white truncate mt-0.5">{ticket.subject}</p>
                        {ticket.resolutionNotes && (
                          <p className="text-[10px] text-gray-400 italic truncate mt-0.5">"{ticket.resolutionNotes}"</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                        <span className="text-[9px] text-[#A8A29E]">{ticket.resolvedAt || ticket.updatedAt}</span>
                        <span className="text-[9px] text-green-400 font-bold">By {ticket.resolvedByName || worker.name}</span>
                        <ChevronRight size={12} className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Escalated Tickets */}
            <div className="card bg-evera-card border-evera-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-red-500/10 text-red-500"><AlertTriangle size={14} /></span>
                  Escalated Tickets
                </h3>
                <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-lg font-bold">
                  {escalatedTickets.length} Total
                </span>
              </div>
              {escalatedTickets.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#A8A29E] border border-dashed border-evera-border rounded-xl">
                  No escalated tickets.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1 no-scrollbar">
                  {escalatedTickets.map(ticket => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="w-full text-left flex items-center gap-3 p-3 bg-red-950/10 border border-red-500/15 hover:border-red-500/40 hover:bg-red-500/5 rounded-xl transition-all group cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center flex-shrink-0">
                        <ShieldAlert size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-bold text-[#f48c25]">{ticket.ticketNumber}</span>
                          {ticket.assignedDepartment && (
                            <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold">
                              → {ticket.assignedDepartment}
                            </span>
                          )}
                          {ticket.escalationLevel && ticket.escalationLevel !== 'NONE' && (
                            <span className="text-[9px] bg-red-500/10 border border-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">
                              → {ticket.escalationLevel.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-white truncate mt-0.5">{ticket.subject}</p>
                        {ticket.escalationReason && (
                          <p className="text-[10px] text-gray-400 italic truncate mt-0.5">Reason: {ticket.escalationReason}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                        <span className="text-[9px] text-[#A8A29E]">{ticket.updatedAt}</span>
                        <ChevronRight size={12} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Live Activity Feed ────────────────────────────────── */}
          <div className="col-span-12 lg:col-span-5">
            <div className="card bg-evera-card border-evera-border p-5 sticky top-0">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <History size={14} className="text-[#f48c25] animate-pulse" />
                  <span>Live Activity Feed</span>
                </h3>
                <span className="text-[10px] bg-white/5 border border-white/10 text-[#A8A29E] px-2 py-0.5 rounded-lg font-bold">
                  {(isOpsWorker ? [...activityFeed, ...opsActivityFeed] : activityFeed).length} Events
                </span>
              </div>

              {(isOpsWorker ? [...activityFeed, ...opsActivityFeed] : activityFeed).length === 0 ? (
                <div className="text-center py-12 text-xs text-[#A8A29E] border border-dashed border-evera-border rounded-xl">
                  <RefreshCw size={24} className="mx-auto mb-2 opacity-30" />
                  No activity actions recorded yet.
                </div>
              ) : (
                <div className="relative pl-6 border-l border-[#38302C] space-y-5 ml-3 max-h-[700px] overflow-y-auto pr-2 no-scrollbar">
                  {(isOpsWorker ? [...activityFeed, ...opsActivityFeed] : activityFeed).map((item, idx) => {
                    const cfg = getActionConfig(item.action);
                    const Icon = cfg.icon;
                    const linkedTicket = tickets.find(t => t.id === item.ticketId);
                    return (
                      <div key={idx} className="relative group/item transition-all duration-300">
                        <div className={`absolute -left-[36px] top-1 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 border ${cfg.bg} ${cfg.color}`}>
                          <Icon size={11} className="stroke-[2.5]" />
                        </div>
                        <button
                          onClick={() => linkedTicket && setSelectedTicket(linkedTicket)}
                          className={`w-full text-left bg-[#161210]/50 hover:bg-[#161210]/90 border border-[#38302C]/50 hover:border-evera-primary/30 p-3 rounded-xl transition-all duration-300 ${linkedTicket ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${cfg.bg} ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            <span className="text-[9px] text-[#A8A29E] font-medium flex items-center gap-1">
                              <Clock size={9} />
                              {item.timestamp.includes('T') ? new Date(item.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : item.timestamp}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-mono font-bold text-[10px] text-[#f48c25]">{item.ticketNumber}</span>
                            {linkedTicket && (
                              <span className="text-[9px] text-[#A8A29E] group-hover/item:text-[#f48c25] transition-colors flex items-center gap-0.5">
                                View <ChevronRight size={9} />
                              </span>
                            )}
                          </div>
                          {item.note && (
                            <div className="bg-gradient-to-r from-[#161210]/60 to-transparent border border-white/5 pl-3 pr-2 py-1.5 text-gray-400 italic text-[9px] rounded-lg mt-2 border-l-2 border-l-[#f48c25]/40 leading-relaxed">
                              "{item.note}"
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Users size={14} className="text-[#f48c25]" />
              All Workers — Real-time Activity Overview
            </h3>
            <span className="text-[10px] text-[#A8A29E]">
              {teamData.filter(w => w.status === 'ACTIVE').length} Active • {teamData.filter(w => w.status !== 'ACTIVE').length} Offline
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {teamData.map(w => (
              <div
                key={w.id}
                className={`card p-4 space-y-3 transition-all duration-300 ${
                  w.isCurrentWorker
                    ? 'bg-gradient-to-br from-[#f48c25]/10 to-transparent border-[#f48c25]/30 border-l-4 border-l-[#f48c25]'
                    : 'bg-evera-card border-evera-border hover:border-evera-primary/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-evera-primary/10 text-[#f48c25] flex items-center justify-center font-bold text-sm border border-evera-primary/20">
                      {w.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-evera-bg ${
                      w.status === 'ACTIVE' ? 'bg-green-400' : 'bg-stone-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-black text-white truncate">{w.name}</p>
                      {w.isCurrentWorker && (
                        <span className="text-[8px] bg-[#f48c25]/15 border border-[#f48c25]/30 text-[#f48c25] px-1.5 py-0.5 rounded font-bold uppercase">Viewing</span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#A8A29E] font-mono truncate">{w.employeeId} • {w.role.replace(/_/g, ' ')}</p>
                  </div>
                </div>

                <div className="bg-[#161210] border border-[#38302C] rounded-lg px-3 py-2 text-[10px] text-gray-300 flex items-start gap-2">
                  <Activity size={10} className="text-[#f48c25] mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{w.currentAction}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center bg-[#161210] border border-[#38302C] rounded-lg py-1.5">
                    <p className="text-xs font-black text-white">{w.activeCount}</p>
                    <p className="text-[9px] text-[#A8A29E] uppercase font-bold mt-0.5">Active</p>
                  </div>
                  <div className="text-center bg-[#161210] border border-[#38302C] rounded-lg py-1.5">
                    <p className="text-xs font-black text-green-400">{w.resolvedCount}</p>
                    <p className="text-[9px] text-[#A8A29E] uppercase font-bold mt-0.5">Resolved</p>
                  </div>
                  <div className="text-center bg-[#161210] border border-[#38302C] rounded-lg py-1.5">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                      w.status === 'ACTIVE' && w.activeCount > 0
                        ? 'text-amber-400'
                        : w.status === 'ACTIVE'
                        ? 'text-green-400'
                        : 'text-stone-400'
                    }`}>
                      {w.status === 'ACTIVE' && w.activeCount > 0 ? '🟡 Busy'
                        : w.status === 'ACTIVE' ? '🟢 Free'
                        : '🔴 Offline'}
                    </span>
                    <p className="text-[9px] text-[#A8A29E] uppercase font-bold mt-0.5">Status</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
