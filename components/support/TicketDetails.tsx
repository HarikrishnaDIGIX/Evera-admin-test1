import React, { useState, useEffect } from 'react';
import { Ticket, TicketComment, AdminRole, SupportWorker } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { Icons } from '../ui/Icons';
import { useApp } from '../../context/AppContext';
import {
  Lock, Unlock, Paperclip, Send, UserCheck, ShieldAlert,
  ArrowUpRight, AlertOctagon, HelpCircle, CheckCircle2, ChevronRight,
  ClipboardList, Plus, User, MessageSquare, AlertTriangle, Check, Activity, Clock, History,
  Eye, FileImage, FileText, X
} from 'lucide-react';

interface TicketDetailsProps {
  ticket: Ticket;
  onBack: () => void;
  onStatusChange: (status: any) => void;
  onPriorityChange: (priority: any) => void;
  onAssignChange: (assigneeId: string, assigneeName: string) => void;
  onAddComment: (content: string, isInternal: boolean) => void;
}

export const TicketDetails: React.FC<TicketDetailsProps> = ({
  ticket,
  onBack,
  onStatusChange,
  onPriorityChange,
  onAssignChange,
  onAddComment,
}) => {
  const {
    adminUser,
    supportWorkers,
    escalateTicketLocal,
    assignTicketToDepartmentLocal,
    addTicketTimelineActionLocal,
    addNotification,
    claimTicketLocal,
    setTickets,
    requestTakeoverLocal,
    respondToTakeoverLocal,
    transferTicketLocal,
    removeTicketOwnershipLocal
  } = useApp();
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [localComments, setLocalComments] = useState<any[]>(ticket.comments || []);

  // Only reset localComments when navigating to a different ticket (not on every re-render)
  // This preserves optimistic comment additions within the same ticket view
  useEffect(() => {
    setLocalComments(ticket.comments || []);
  }, [ticket.id]);
  const [selectedStatus, setSelectedStatus] = useState(ticket.status);
  const [selectedPriority, setSelectedPriority] = useState(ticket.priority);
  const [assignee, setAssignee] = useState(ticket.assignedWorkerId || '');

  // Escalation reason state
  const [escalationReason, setEscalationReason] = useState('');
  const [escalationNotes, setEscalationNotes] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);
  const [escalationTarget, setEscalationTarget] = useState<'SUPPORT_ADMIN' | 'SUPER_ADMIN' | 'OPERATIONS' | 'VENDOR' | 'FINANCE' | 'TECHNICAL' | null>(null);
  const [resNotes, setResNotes] = useState('');

  // Takeover & Transfer states
  const [takeoverReason, setTakeoverReason] = useState('');
  const [takeoverNotes, setTakeoverNotes] = useState('');
  const [isRequestingTakeover, setIsRequestingTakeover] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferNotes, setTransferNotes] = useState('');
  const [transferTargetWorker, setTransferTargetWorker] = useState('');

  // Attachment preview state
  const [previewAttachment, setPreviewAttachment] = useState<{ url: string; name: string } | null>(null);

  const currentWorker = supportWorkers.find(
    w => w.email.toLowerCase() === adminUser?.email.toLowerCase()
  ) || supportWorkers.find(w => w.id === 'sw1') || { id: 'sw1', name: adminUser?.name || 'Support Agent', role: 'LEVEL_1_AGENT', employeeId: 'EMP-SW-001', phone: '', permissions: ['read_tickets', 'resolve_tickets', 'contact_users', 'escalate_tickets'] };

  const isOwner = ticket.assignedWorkerId === currentWorker.id;

  const isDeptAdmin =
    (adminUser?.role === AdminRole.OPERATIONS_ADMIN && ticket.assignedDepartment === 'OPERATIONS') ||
    (adminUser?.role === AdminRole.FINANCE_ADMIN && ticket.assignedDepartment === 'FINANCE_SUPPORT');

  const hasAdminBypass = adminUser?.role === AdminRole.SUPPORT_ADMIN || adminUser?.role === AdminRole.SUPER_ADMIN || isDeptAdmin;
  const canModifyControls = isOwner || hasAdminBypass;

  // Lock the controls for workers when their ticket is escalated — they must wait for resolution
  const isLockedForWorker = !hasAdminBypass && ticket.status === 'ESCALATED';

  // Filter out admin users from transfer/assign dropdowns
  const visibleWorkersForTransfer = supportWorkers.filter(w => {
    if (w.status !== 'ACTIVE' && w.id !== ticket.assignedWorkerId) return false;
    
    // High-level admins should not be in the transfer/assign list (must be escalated to)
    if (['OPERATIONS_ADMIN', 'FINANCE_ADMIN', 'SUPER_ADMIN'].includes(w.role)) {
      return w.id === ticket.assignedWorkerId;
    }

    if (adminUser?.role === AdminRole.SUPPORT_WORKER) {
      if (['SUPPORT_ADMIN'].includes(w.role)) {
        // Keep them in the list ONLY if they are the currently assigned worker, so the dropdown doesn't break
        return w.id === ticket.assignedWorkerId;
      }
    }
    return true;
  });

  // ── Worker Permission Gates ───────────────────────────────────────────────
  // Admins always bypass. Workers are gated by their assigned permissions.
  const workerPermissions: string[] = (currentWorker as any).permissions || [];
  const canViewTickets = hasAdminBypass || workerPermissions.includes('read_tickets');
  const canResolveTickets = hasAdminBypass || workerPermissions.includes('resolve_tickets');
  const canContactUsers = hasAdminBypass || workerPermissions.includes('contact_users');
  const canEscalate = hasAdminBypass || workerPermissions.includes('escalate_tickets');

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    // Optimistically add comment to local state so it appears immediately
    const optimisticComment = {
      id: `local-${Date.now()}`,
      content: commentText,
      authorName: adminUser?.name || 'Admin',
      authorType: 'ADMIN',
      isInternal,
      createdAt: new Date().toISOString(),
    };
    setLocalComments(prev => [...prev, optimisticComment]);
    onAddComment(commentText, isInternal);
    setCommentText('');
    setIsInternal(false);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value as any);
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as any;
    setSelectedPriority(val);
    onPriorityChange(val);
  };

  const handleAssignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setAssignee(val);
    if (val === '') {
      onAssignChange('', '');
    } else {
      const selected = supportWorkers.find(w => w.id === val);
      onAssignChange(val, selected ? selected.name : 'Support Agent');
    }
  };

  const assignToMe = () => {
    if (adminUser) {
      // Find matching support worker profile if exists, otherwise use admin
      const matchingWorker = supportWorkers.find(w => w.email.toLowerCase() === adminUser.email.toLowerCase());
      if (matchingWorker) {
        setAssignee(matchingWorker.id);
        onAssignChange(matchingWorker.id, matchingWorker.name);
      } else {
        setAssignee(adminUser.id);
        onAssignChange(adminUser.id, adminUser.name);
      }
    }
  };

  const handleEscalationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalationReason.trim() || !escalationTarget) return;

    try {
      if (['OPERATIONS', 'VENDOR', 'FINANCE', 'TECHNICAL'].includes(escalationTarget)) {
        await assignTicketToDepartmentLocal(ticket.id, escalationTarget as any, escalationReason, escalationNotes);
      } else {
        await escalateTicketLocal(ticket.id, escalationTarget as any, escalationReason);
        if (escalationNotes) {
          await addTicketTimelineActionLocal(ticket.id, 'CONTACTED_USER', `Internal investigation notes: ${escalationNotes}`);
        }
      }
      setIsEscalating(false);
      setEscalationReason('');
      setEscalationNotes('');
      setEscalationTarget(null);
    } catch (err) {
      console.error(err);
      addNotification('Failed to process escalation');
    }
  };

  const handleResolveSubmit = () => {
    if (!resNotes.trim()) return;

    const workerId = currentWorker.id;
    const workerName = currentWorker.name;

    setTickets(prev => prev.map(t => {
      if (t.id === ticket.id) {
        const newActions = [
          ...(t.timelineActions || []),
          {
            id: `ta-${Date.now()}`,
            action: 'RESOLVED' as const,
            actorName: workerName,
            timestamp: new Date().toLocaleString(),
            note: `Ticket resolved. Resolution: ${resNotes}`
          }
        ];
        return {
          ...t,
          status: 'RESOLVED' as const,
          resolvedAt: new Date().toLocaleString(),
          resolvedByWorkerId: workerId,
          resolvedByName: workerName,
          resolutionNotes: resNotes,
          timelineActions: newActions,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
    addNotification('Ticket successfully resolved!');
    onStatusChange('RESOLVED');
  };

  const handleRequestTakeoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!takeoverReason.trim()) return;
    await requestTakeoverLocal(ticket.id, takeoverReason, takeoverNotes);
    setIsRequestingTakeover(false);
    setTakeoverReason('');
    setTakeoverNotes('');
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTargetWorker) return;
    const worker = supportWorkers.find(w => w.id === transferTargetWorker);
    if (!worker) return;
    await transferTicketLocal(ticket.id, worker.id, worker.name, transferNotes);
    setIsTransferring(false);
    setTransferTargetWorker('');
    setTransferNotes('');
  };

  // Determine timeline steps based on ticket state
  const isEscalated = ticket.escalationLevel === 'SUPPORT_ADMIN' || ticket.escalationLevel === 'SUPER_ADMIN' || !!ticket.assignedDepartment;

  const getTimelineSteps = () => {
    if (ticket.assignedDepartment) {
      return [
        { key: 'CREATED', label: 'Created', done: true, desc: `Registered: ${ticket.createdAt}` },
        { key: 'ASSIGNED', label: 'Assigned', done: !!ticket.assignedWorkerId, desc: ticket.assignedWorkerId ? `Handled by ${ticket.assignedToName}` : 'Awaiting assignee' },
        { key: 'DEPT_ASSIGNED', label: 'Dept Assigned', done: true, desc: `Escalated to ${ticket.assignedDepartment}` },
        { key: 'IN_PROGRESS', label: 'In Progress', done: ticket.status === 'IN_PROGRESS' || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' || ticket.status === 'ESCALATED', desc: 'Department reviewing' },
        { key: 'RESOLVED', label: 'Resolved', done: ticket.status === 'RESOLVED' || ticket.status === 'CLOSED', desc: 'Closed with resolution' }
      ];
    }

    if (isEscalated) {
      return [
        { key: 'CREATED', label: 'Created', done: true, desc: `Registered: ${ticket.createdAt}` },
        { key: 'ASSIGNED', label: 'Assigned', done: !!ticket.assignedWorkerId, desc: `Handled by ${ticket.assignedToName}` },
        { key: 'ESCALATED', label: 'Escalated', done: true, desc: 'Forwarded by agent' },
        { key: 'SUPPORT_ADMIN', label: 'Support Admin', done: true, desc: 'Reviewing compensation/refunds' },
        { key: 'SUPER_ADMIN', label: 'Super Admin', done: ticket.escalationLevel === 'SUPER_ADMIN', desc: 'Critical final governance review' }
      ];
    } else {
      return [
        { key: 'CREATED', label: 'Created', done: true, desc: `Registered: ${ticket.createdAt}` },
        { key: 'ASSIGNED', label: 'Assigned', done: !!ticket.assignedWorkerId, desc: ticket.assignedWorkerId ? `Handled by ${ticket.assignedToName}` : 'Awaiting claim' },
        { key: 'IN_PROGRESS', label: 'Investigation', done: ticket.status === 'IN_PROGRESS' || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' || ticket.status === 'ESCALATED', desc: ticket.status === 'OPEN' ? 'Awaiting triage' : 'Investigation active' },
        { key: 'RESOLVED', label: 'Resolved', done: ticket.status === 'RESOLVED' || ticket.status === 'CLOSED', desc: ticket.status === 'RESOLVED' ? `Resolved by ${ticket.resolvedByName || 'agent'} on ${ticket.resolvedAt || '01-06-2026'}` : 'Awaiting confirmation' }
      ];
    }
  };

  const steps = getTimelineSteps();

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-evera-border pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-[#241E1B] hover:bg-[#38302C] border border-evera-border text-white rounded-xl transition-all"
          >
            <Icons.ChevronDown className="rotate-90" size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-[#f48c25] bg-[#f48c25]/10 border border-[#f48c25]/20 px-2 py-0.5 rounded font-bold">
                {ticket.ticketNumber}
              </span>
              <span className="text-[10px] font-bold text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded uppercase">
                {ticket.category}
              </span>
              {ticket.assignedDepartment && (
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                  <ClipboardList size={10} />
                  <span>{ticket.assignedDepartment} Department</span>
                </span>
              )}
              {ticket.escalationLevel && ticket.escalationLevel !== 'NONE' && (
                <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                  <ShieldAlert size={10} />
                  <span>Escalated to {ticket.escalationLevel.replace('_', ' ')}</span>
                </span>
              )}
            </div>
            <h2 className="text-xl font-black text-white mt-1">{ticket.subject}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#A8A29E]">Status:</span>
          <StatusBadge status={ticket.status} />
          <span className="text-xs text-[#A8A29E] ml-2">Priority:</span>
          <StatusBadge status={ticket.priority} />
        </div>
      </div>

      {/* Visual Timeline Progression Stepper */}
      <div className="card bg-evera-card border-evera-border p-6">
        <h3 className="text-xs font-black text-white uppercase tracking-wider mb-5">Visual Resolution Timeline</h3>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-2">
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;
            const IconComponent = step.done ? CheckCircle2 : HelpCircle;

            return (
              <React.Fragment key={step.key}>
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${step.done
                      ? 'bg-green-500/15 border border-green-500 text-green-400 shadow-md shadow-green-950/20'
                      : 'bg-white/5 border border-white/10 text-evera-muted'
                    }`}>
                    <IconComponent size={14} />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${step.done ? 'text-white' : 'text-evera-muted'}`}>{step.label}</p>
                    <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{step.desc}</p>
                  </div>
                </div>
                {!isLast && (
                  <div className="hidden md:block flex-shrink-0 mx-2 text-evera-muted">
                    <ChevronRight size={14} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Ticket description + comments */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Main Description */}
          <div className="card bg-evera-card border-evera-border p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-evera-border/30 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f48c25] to-[#ffb061] text-white flex items-center justify-center font-bold shadow-md shadow-orange-950/20">
                  {ticket.customerName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{ticket.customerName}</h4>
                  <p className="text-xs text-[#A8A29E]">{ticket.customerEmail}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Submitted</p>
                <p className="text-xs text-white mt-0.5">{ticket.createdAt}</p>
              </div>
            </div>

            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>

            {ticket.providerName && (
              <div className="bg-[#161210]/50 border border-dashed border-[#38302C] p-3 rounded-xl flex items-center justify-between text-xs">
                <span className="text-[#A8A29E]">Linked Service Provider:</span>
                <span className="font-bold text-white bg-evera-primary/5 px-2.5 py-1 rounded border border-evera-primary/10">{ticket.providerName}</span>
              </div>
            )}

            {/* Attachments Section */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="border-t border-evera-border/30 pt-4 mt-4">
                <p className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <Paperclip size={14} className="text-[#f48c25]" />
                  <span>Attachments ({ticket.attachments.length})</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ticket.attachments.map((url, index) => {
                    const fileName = url.split('/').pop() || `Attachment_${index + 1}.png`;
                    return (
                      <a
                        key={index}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPreviewAttachment({ url, name: fileName });
                        }}
                        className="flex items-center gap-2 p-2 bg-[#161210] border border-[#38302C] hover:border-evera-primary/40 rounded-lg text-xs text-gray-300 transition-colors cursor-pointer"
                      >
                        <Icons.Download size={14} className="text-[#A8A29E]" />
                        <span className="truncate flex-1">{fileName}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Conversation Thread */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Icons.Chat size={16} className="text-[#f48c25]" />
              <span>Communication Thread</span>
            </h3>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
              {(!localComments || localComments.length === 0) ? (
                <div className="text-center py-8 text-xs text-[#A8A29E] bg-[#241E1B]/50 border border-dashed border-[#38302C] rounded-xl">
                  No replies or notes yet. Use the editor below to post.
                </div>
              ) : (
                (localComments || []).map((comment) => {
                  const isCommentInternal = comment.isInternal;
                  // Workers see internal notes as "Team Update" — visible to them but labeled differently
                  const internalLabel = hasAdminBypass ? 'INTERNAL NOTE' : 'TEAM UPDATE';
                  return (
                    <div
                      key={comment.id}
                      className={`flex flex-col p-4 rounded-xl border transition-all ${isCommentInternal
                          ? 'bg-[#facc15]/5 border-[#facc15]/20'
                          : comment.authorType === 'ADMIN'
                            ? 'bg-evera-primary/5 border-evera-primary/20'
                            : 'bg-[#161210] border-[#38302C]'
                        }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold ${isCommentInternal ? 'text-[#eab308]' : 'text-white'
                            }`}>
                            {comment.authorName}
                          </span>
                          <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded ${comment.authorType === 'ADMIN'
                              ? 'bg-evera-primary/10 text-[#f48c25] border border-evera-primary/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                            {comment.authorType}
                          </span>
                          {isCommentInternal && (
                            <span className="flex items-center gap-1 text-[9px] text-[#eab308] bg-[#eab308]/10 border border-[#eab308]/20 px-1.5 py-0.5 rounded font-bold">
                              <Lock size={10} />
                              <span>{internalLabel}</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400">{comment.createdAt}</span>
                      </div>
                      {isCommentInternal && !hasAdminBypass && (
                        <p className="text-[10px] text-amber-400/60 italic mb-2">This is an internal team message — visible only to support staff.</p>
                      )}
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Add Comment Editor — gated by contact_users permission */}
          {!canContactUsers ? (
            <div className="card bg-evera-card border-evera-border p-4 flex items-center gap-3 opacity-60">
              <Lock size={14} className="text-red-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-red-400">Permission Required</p>
                <p className="text-[10px] text-[#A8A29E] mt-0.5">You need the <span className="font-bold text-white">Contact Users</span> permission to reply or add notes.</p>
              </div>
            </div>
          ) : ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? (
            <div className="card bg-evera-card border-evera-border p-4 text-center opacity-60">
              <p className="text-xs font-medium text-[#A8A29E]">This ticket is {ticket.status.toLowerCase()}. You cannot add new replies unless it is reopened.</p>
            </div>
          ) : (
            <form onSubmit={handleSendComment} className="card bg-evera-card border-evera-border p-4 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-white">{isInternal ? 'Add Internal Note' : 'Reply to Customer'}</label>
                <button
                  type="button"
                  onClick={() => setIsInternal(!isInternal)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${isInternal
                      ? 'bg-[#eab308]/10 border-[#eab308]/30 text-[#eab308]'
                      : 'bg-transparent border-[#38302C] text-gray-400 hover:text-white'
                    }`}
                >
                  {isInternal ? <Lock size={12} /> : <Unlock size={12} />}
                  <span>{isInternal ? 'Internal Note' : 'Customer Reply'}</span>
                </button>
              </div>

              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={isInternal ? "Write an internal note only visible to team admins..." : "Write a reply to the customer..."}
                rows={4}
                className="w-full bg-[#161210] border border-[#38302C] rounded-xl p-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-evera-primary transition-all resize-none"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all ${isInternal
                      ? 'bg-[#eab308] hover:bg-[#ca8a04] shadow-lg shadow-yellow-950/20'
                      : 'bg-evera-primary hover:bg-[#d9751a] shadow-lg shadow-orange-950/20'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Send size={12} />
                  <span>{isInternal ? 'Post Note' : 'Send to Customer'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Ticket Info & Actions */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Claim Ticket Banner */}
          {!ticket.assignedWorkerId ? (
            <div className="card bg-amber-500/10 border border-amber-500/30 p-4 space-y-3 rounded-xl border-l-4 border-l-amber-500">
              <div className="flex items-center gap-2 text-amber-500">
                <ShieldAlert size={16} className="animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">Unassigned Ticket</span>
              </div>
              <p className="text-[11px] text-[#A8A29E] leading-relaxed">
                This issue currently has no assigned handler. Claim this ticket now to take ownership and begin resolution.
              </p>
              <button
                type="button"
                onClick={async () => {
                  await claimTicketLocal(ticket.id);
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-950/20"
              >
                <span>Claim Ticket</span>
              </button>
            </div>
          ) : (() => {
            const assignedAgent = supportWorkers.find(w => w.id === ticket.assignedWorkerId);

            if (isEscalated) {
              const escalationTitle = ticket.assignedDepartment
                ? ticket.assignedDepartment.replace('_', ' ')
                : ticket.escalationLevel === 'SUPER_ADMIN' ? 'Super Admin' : 'Support Admin';
              return (
                <div className="card bg-gradient-to-br from-red-950/10 to-transparent border border-red-500/25 p-4 space-y-3 rounded-xl border-l-4 border-l-red-500 transition-all duration-300 hover:border-red-500/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-400 border border-red-500/20 flex items-center justify-center font-bold text-xs shadow-sm">
                      <ShieldAlert size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-black text-white truncate">{escalationTitle}</p>
                        <span className="text-[8px] bg-red-500/15 border border-red-500/30 text-red-400 font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                          Escalated
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                        ESCALATION QUEUE • {escalationTitle.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#38302C]/40 pt-2.5 flex items-center justify-between text-[10px]">
                    <span className="text-[#A8A29E] font-bold uppercase tracking-wider">Assignment Status:</span>
                    <span className="text-red-400 font-black uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                      <span>WITH {escalationTitle.toUpperCase()}</span>
                    </span>
                  </div>

                  {assignedAgent && (
                    <div className="mt-2 text-[10px] text-gray-500 italic border-t border-[#38302C]/20 pt-2">
                      Original Handler: {assignedAgent.name}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div className="card bg-gradient-to-br from-green-950/10 to-transparent border border-green-500/25 p-4 space-y-3 rounded-xl border-l-4 border-l-green-500 transition-all duration-300 hover:border-green-500/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-green-500/15 text-green-400 border border-green-500/20 flex items-center justify-center font-bold text-xs shadow-sm">
                    {(assignedAgent?.name || ticket.assignedToName || 'A').charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs font-black text-white truncate">{assignedAgent?.name || ticket.assignedToName}</p>
                      {ticket.assignedWorkerId === currentWorker.id && (
                        <span className="text-[8px] bg-green-500/15 border border-green-500/30 text-green-400 font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                      {assignedAgent?.employeeId || 'EMP-SW-MGR'} • {assignedAgent?.departments?.[0]?.replace(/_/g, ' ') || ticket.assignedDepartment?.replace(/_/g, ' ') || 'SUPPORT TEAM'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#38302C]/40 pt-2.5 flex items-center justify-between text-[10px]">
                  <span className="text-[#A8A29E] font-bold uppercase tracking-wider">Assignment Status:</span>
                  <span className="text-green-400 font-black uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    <span>ACTIVE HANDLER</span>
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Resolution Audit Card */}
          {ticket.status === 'RESOLVED' && (
            <div className="card bg-gradient-to-br from-green-950/20 to-transparent border border-green-500/20 p-5 space-y-3 border-l-4 border-l-green-500">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 size={16} />
                <h4 className="text-xs font-black uppercase tracking-wider">✅ Resolution Audit Summary</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-[#38302C]/40 pb-1.5">
                  <span className="text-[#A8A29E]">Resolved By:</span>
                  <span className="text-white font-bold">{ticket.resolvedByName || ticket.assignedToName || 'Support Team'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#38302C]/40 pb-1.5">
                  <span className="text-[#A8A29E]">Resolved On:</span>
                  <span className="text-white font-mono text-[10px]">{ticket.resolvedAt || ticket.updatedAt || '01-06-2026'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[#A8A29E] block">Resolution Details:</span>
                  <p className="text-[11px] text-gray-300 italic bg-black/25 border border-[#38302C] p-2.5 rounded-lg leading-relaxed">
                    "{ticket.resolutionNotes || 'Payment synced successfully and customer verified.'}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ticket Controls */}
          {isLockedForWorker ? (
            // ── LOCKED STATE: Ticket is escalated, worker must wait ──────────
            <div className="card border-2 border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-transparent p-5 space-y-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </div>
                <div>
                  <p className="text-sm font-black text-amber-400 uppercase tracking-wider">Ticket Locked</p>
                  <p className="text-[10px] text-amber-400/70 font-mono uppercase tracking-wider">Awaiting Resolution</p>
                </div>
              </div>

              <div className="border border-amber-500/20 rounded-xl bg-black/20 p-4 space-y-3">
                <p className="text-xs text-gray-300 leading-relaxed">
                  This ticket has been <span className="font-bold text-amber-400">escalated</span> and is currently being handled by a higher authority. You cannot make changes until the ticket is resolved.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                  <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                    {ticket.assignedDepartment && ['OPERATIONS', 'FINANCE', 'ADMIN'].includes(ticket.assignedDepartment)
                      ? `With ${ticket.assignedDepartment} Department`
                      : 'With Support Admin — Pending Review'}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-gray-500 text-center italic">
                You will be notified once this ticket is resolved or returned to your queue.
              </p>
            </div>
          ) : (
            <div className="card bg-evera-card border-evera-border p-5 space-y-5">
              <h3 className="font-bold text-white text-sm border-b border-evera-border/30 pb-2">Ticket Controls</h3>

              {/* Change Status — gated by resolve_tickets for RESOLVED option */}
              <div className="space-y-2">
                <label className="text-xs text-[#A8A29E] font-medium block">Update Status</label>
                <div className="flex gap-2 items-start">
                  <select
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    disabled={!canModifyControls || (!canResolveTickets && selectedStatus === 'RESOLVED')}
                    className="w-full bg-[#161210] border border-[#38302C] text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-evera-primary cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="OPEN">Open</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="INVESTIGATING">Investigating</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="WAITING_FOR_USER">Waiting for User</option>
                    <option value="WAITING_FOR_PROVIDER">Waiting for Provider</option>
                    {canResolveTickets && <option value="RESOLVED">Resolved</option>}
                    {(hasAdminBypass) && <option value="CLOSED">Closed</option>}
                    {ticket.status === 'ESCALATED' && <option value="ESCALATED" disabled>Escalated (Use Routing Panel)</option>}
                  </select>
                  {selectedStatus !== ticket.status && selectedStatus !== 'RESOLVED' && (
                    <button
                      onClick={() => onStatusChange(selectedStatus)}
                      className="bg-evera-primary hover:bg-evera-primary/80 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-lg shadow-evera-primary/20 whitespace-nowrap h-[34px] flex items-center justify-center"
                    >
                      Apply Status
                    </button>
                  )}
                </div>
                {!canResolveTickets && adminUser?.role === AdminRole.SUPPORT_WORKER && (
                  <p className="text-[10px] text-amber-400 flex items-center gap-1">
                    <AlertTriangle size={10} /> Resolve Tickets permission required to mark as resolved.
                  </p>
                )}
              </div>

              {selectedStatus === 'RESOLVED' && ticket.status !== 'RESOLVED' && (
                <div className="space-y-3 p-3 bg-green-500/5 border border-green-500/20 rounded-xl animate-fade-in">
                  <label className="text-[10px] font-bold text-green-400 uppercase tracking-wider block">Resolution Notes *</label>
                  <textarea
                    value={resNotes}
                    onChange={(e) => setResNotes(e.target.value)}
                    placeholder="Explain how the issue was fixed..."
                    rows={2}
                    className="w-full bg-[#161210] border border-[#38302C] rounded-lg p-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-green-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleResolveSubmit}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-1.5 rounded-lg text-xs transition-all flex items-center justify-center gap-1 shadow-md shadow-green-950/20"
                  >
                    <CheckCircle2 size={12} />
                    <span>Submit Resolution</span>
                  </button>
                </div>
              )}

              {/* Change Priority */}
              <div className="space-y-2">
                <label className="text-xs text-[#A8A29E] font-medium block">Update Priority</label>
                <select
                  value={selectedPriority}
                  onChange={handlePriorityChange}
                  disabled={!canModifyControls || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'}
                  className="w-full bg-[#161210] border border-[#38302C] text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-evera-primary cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              {/* Assign Support Workers */}
              <div className="space-y-2">
                <label className="text-xs text-[#A8A29E] font-medium block">Assigned Support Agent</label>
                <select
                  value={assignee}
                  onChange={handleAssignChange}
                  disabled={!hasAdminBypass || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'}
                  className="w-full bg-[#161210] border border-[#38302C] text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-evera-primary cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">Unassigned</option>
                  {visibleWorkersForTransfer.filter(w => w.status === 'ACTIVE').map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.role.replace(/_/g, ' ')})
                    </option>
                  ))}
                </select>
                {!assignee && hasAdminBypass && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                  <button
                    onClick={assignToMe}
                    className="w-full border border-evera-primary/20 hover:border-evera-primary/50 text-evera-primary bg-evera-primary/5 hover:bg-evera-primary/10 rounded-lg py-1.5 text-[10px] font-bold transition-all flex items-center justify-center gap-1.5">

                    <UserCheck size={12} />
                    <span>Assign to Me</span>
                  </button>
                )}
                {ticket.assignedWorkerId && hasAdminBypass && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                  <button
                    onClick={() => {
                      removeTicketOwnershipLocal(ticket.id);
                      setAssignee('');
                    }}
                    className="w-full border border-red-500/20 hover:border-red-500/50 text-red-400 bg-red-500/5 hover:bg-red-500/10 rounded-lg py-1.5 text-[10px] font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Unlock size={12} />
                    <span>Remove Ownership</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Takeover Requests (Pending Review) */}
          {ticket.takeoverRequest && ticket.takeoverRequest.status === 'PENDING' && (
            <div className="card bg-gradient-to-br from-indigo-950/20 to-transparent border border-indigo-500/20 p-5 space-y-3 border-l-4 border-l-indigo-500 animate-fade-in">
              <div className="flex items-center gap-2 text-indigo-400">
                <ShieldAlert size={16} />
                <h4 className="text-xs font-black uppercase tracking-wider">⚡ Takeover Request Pending</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-[#38302C]/40 pb-1.5">
                  <span className="text-[#A8A29E]">Requested By:</span>
                  <span className="text-white font-bold">{ticket.takeoverRequest.requesterName}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[#A8A29E] block">Reason for Takeover:</span>
                  <p className="text-[11px] text-gray-300 italic bg-black/25 border border-[#38302C] p-2.5 rounded-lg leading-relaxed">
                    "{ticket.takeoverRequest.reason}"
                  </p>
                </div>
                {ticket.takeoverRequest.notes && (
                  <div className="space-y-1">
                    <span className="text-[#A8A29E] block">Additional Notes:</span>
                    <p className="text-[11px] text-gray-400 leading-relaxed bg-[#161210] p-2 rounded">
                      {ticket.takeoverRequest.notes}
                    </p>
                  </div>
                )}
                {/* Approve/Decline actions (Only visible to current owner or support admins) */}
                {canModifyControls && (
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => respondToTakeoverLocal(ticket.id, false)}
                      className="flex-1 bg-transparent border border-red-500/30 hover:bg-red-500/10 text-[10px] py-1.5 rounded text-red-400 font-bold transition-all"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => respondToTakeoverLocal(ticket.id, true)}
                      className="flex-1 bg-green-600 hover:bg-green-500 text-[10px] py-1.5 rounded text-white font-bold transition-all shadow-md shadow-green-950/20"
                    >
                      Approve & Transfer
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Request Takeover Button & Form (Visible to non-owners when ticket is assigned and not pending takeover) */}
          {ticket.assignedWorkerId && !isOwner && !ticket.takeoverRequest && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
            <div className="card bg-evera-card border-evera-border p-5 space-y-4 border-l-2 border-l-indigo-500">
              <h3 className="font-bold text-white text-sm border-b border-evera-border/30 pb-2 flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-indigo-400" />
                <span>Request Ticket Takeover</span>
              </h3>
              <p className="text-[11px] text-[#A8A29E] leading-relaxed">
                If you are currently assisting this customer or can resolve this issue faster, you can request to take over ownership.
              </p>

              {!isRequestingTakeover ? (
                <button
                  type="button"
                  onClick={() => setIsRequestingTakeover(true)}
                  className="w-full border border-indigo-500/20 hover:border-indigo-500/50 text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-lg py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <ArrowUpRight size={12} />
                  <span>Request Takeover</span>
                </button>
              ) : (
                <form onSubmit={handleRequestTakeoverSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Reason *</label>
                    <textarea
                      value={takeoverReason}
                      onChange={(e) => setTakeoverReason(e.target.value)}
                      placeholder="e.g. Customer contacted me directly and I can resolve this issue faster."
                      rows={2}
                      className="w-full bg-[#161210] border border-[#38302C] rounded-lg p-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider block">Investigation Notes</label>
                    <textarea
                      value={takeoverNotes}
                      onChange={(e) => setTakeoverNotes(e.target.value)}
                      placeholder="Any additional context/logs checked..."
                      rows={2}
                      className="w-full bg-[#161210] border border-[#38302C] rounded-lg p-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRequestingTakeover(false);
                        setTakeoverReason('');
                        setTakeoverNotes('');
                      }}
                      className="flex-1 bg-transparent border border-evera-border text-[10px] py-1.5 rounded text-white font-medium hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-[10px] py-1.5 rounded text-white font-bold transition-all"
                    >
                      Submit Request
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Transfer Ticket Form (Visible to Owner or Admin when ticket is assigned and active) */}
          {ticket.assignedWorkerId && canModifyControls && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
            <div className="card bg-evera-card border-evera-border p-5 space-y-4 border-l-2 border-l-purple-500">
              <h3 className="font-bold text-white text-sm border-b border-evera-border/30 pb-2 flex items-center gap-1.5">
                <ArrowUpRight size={14} className="text-purple-400" />
                <span>Transfer Ticket</span>
              </h3>
              <p className="text-[11px] text-[#A8A29E] leading-relaxed">
                Hand off this issue to another active support specialist. Add notes detailing investigation context.
              </p>

              {!isTransferring ? (
                <button
                  type="button"
                  onClick={() => setIsTransferring(true)}
                  className="w-full border border-purple-500/20 hover:border-purple-500/50 text-purple-400 bg-purple-500/5 hover:bg-purple-500/10 rounded-lg py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <ArrowUpRight size={12} />
                  <span>Transfer Ownership</span>
                </button>
              ) : (
                <form onSubmit={handleTransferSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Target Worker *</label>
                    <select
                      value={transferTargetWorker}
                      onChange={(e) => setTransferTargetWorker(e.target.value)}
                      className="w-full bg-[#161210] border border-[#38302C] text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
                      required
                    >
                      <option value="">Select recipient worker...</option>
                      {visibleWorkersForTransfer.filter(w => w.id !== currentWorker.id).map(w => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.role.replace(/_/g, ' ')})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider block">Transfer Notes *</label>
                    <textarea
                      value={transferNotes}
                      onChange={(e) => setTransferNotes(e.target.value)}
                      placeholder="Specify investigation logs, customer context, or reasons for transfer..."
                      rows={2}
                      className="w-full bg-[#161210] border border-[#38302C] rounded-lg p-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsTransferring(false);
                        setTransferTargetWorker('');
                        setTransferNotes('');
                      }}
                      className="flex-1 bg-transparent border border-evera-border text-[10px] py-1.5 rounded text-white font-medium hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!transferTargetWorker || !transferNotes.trim()}
                      className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-[10px] py-1.5 rounded text-white font-bold transition-all"
                    >
                      Confirm Transfer
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Department-Based Escalation System Panel — gated by escalate_tickets permission */}
          {(ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && canModifyControls) && (
            !canEscalate ? (
              <div className="card bg-evera-card border-evera-border p-4 flex items-center gap-3 opacity-60 border-l-2 border-l-red-500/30">
                <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-red-400">Permission Required</p>
                  <p className="text-[10px] text-[#A8A29E] mt-0.5">You need the <span className="font-bold text-white">Escalate Tickets</span> permission to route this issue.</p>
                </div>
              </div>
            ) : (
              <div className="card bg-evera-card border-evera-border p-5 space-y-4 border-l-2 border-l-red-500">
                <h3 className="font-bold text-white text-sm border-b border-evera-border/30 pb-2 flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-red-400" />
                  <span>Escalate & Route Issue</span>
                </h3>
                <p className="text-[11px] text-[#A8A29E] leading-relaxed">
                  Escalate this issue to a specialized department or support administrator. This locks standard load and notifies specific operators.
                </p>

                {!isEscalating ? (
                  <div className="space-y-2">
                    {/* Specialized Departments (Only visible to Support Admins and Higher) */}
                    {adminUser?.role !== AdminRole.SUPPORT_WORKER && (
                      <>
                        <button
                          onClick={() => {
                            setEscalationTarget('OPERATIONS');
                            setIsEscalating(true);
                          }}
                          className="w-full text-left bg-gradient-to-r from-white/5 to-transparent border border-white/5 hover:border-evera-primary/30 p-2.5 rounded-lg text-xs font-semibold text-white transition-all flex items-center justify-between"
                        >
                          <span>💼 Operations Department</span>
                          <Icons.ChevronRight size={12} className="text-evera-muted" />
                        </button>

                        <button
                          onClick={() => {
                            setEscalationTarget('VENDOR');
                            setIsEscalating(true);
                          }}
                          className="w-full text-left bg-gradient-to-r from-white/5 to-transparent border border-white/5 hover:border-evera-primary/30 p-2.5 rounded-lg text-xs font-semibold text-white transition-all flex items-center justify-between"
                        >
                          <span>🤝 Vendor Department</span>
                          <Icons.ChevronRight size={12} className="text-evera-muted" />
                        </button>

                        <button
                          onClick={() => {
                            setEscalationTarget('FINANCE');
                            setIsEscalating(true);
                          }}
                          className="w-full text-left bg-gradient-to-r from-white/5 to-transparent border border-white/5 hover:border-evera-primary/30 p-2.5 rounded-lg text-xs font-semibold text-white transition-all flex items-center justify-between"
                        >
                          <span>💳 Finance Department</span>
                          <Icons.ChevronRight size={12} className="text-evera-muted" />
                        </button>

                        <button
                          onClick={() => {
                            setEscalationTarget('TECHNICAL');
                            setIsEscalating(true);
                          }}
                          className="w-full text-left bg-gradient-to-r from-white/5 to-transparent border border-white/5 hover:border-evera-primary/30 p-2.5 rounded-lg text-xs font-semibold text-white transition-all flex items-center justify-between"
                        >
                          <span>💻 Technical Department</span>
                          <Icons.ChevronRight size={12} className="text-evera-muted" />
                        </button>
                      </>
                    )}

                    {/* Support Admin (Only visible to Support Workers) */}
                    {adminUser?.role === AdminRole.SUPPORT_WORKER && (
                      <button
                        onClick={() => {
                          setEscalationTarget('SUPPORT_ADMIN');
                          setIsEscalating(true);
                        }}
                        className="w-full text-left bg-gradient-to-r from-[#f59e0b]/5 to-transparent border border-[#f59e0b]/15 hover:border-[#f59e0b]/30 p-2.5 rounded-lg text-xs font-semibold text-[#f59e0b] transition-all flex items-center justify-between"
                      >
                        <span>👤 Support Admin (Manager)</span>
                        <Icons.ChevronRight size={12} className="text-[#f59e0b]" />
                      </button>
                    )}

                    {/* Super Admin Governance (Only visible to Support Admins) */}
                    {adminUser?.role === AdminRole.SUPPORT_ADMIN && (
                      <button
                        onClick={() => {
                          setEscalationTarget('SUPER_ADMIN');
                          setIsEscalating(true);
                        }}
                        className="w-full text-left bg-gradient-to-r from-red-500/5 to-transparent border border-red-500/15 hover:border-red-500/30 p-2.5 rounded-lg text-xs font-semibold text-red-400 transition-all flex items-center justify-between"
                      >
                        <span>🚨 Super Admin Governance</span>
                        <Icons.ChevronRight size={12} className="text-red-400" />
                      </button>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleEscalationSubmit} className="space-y-3 pt-2">
                    <div className="bg-[#161210] p-2.5 rounded-lg border border-[#38302C]">
                      <span className="text-[9px] text-[#A8A29E] font-black uppercase tracking-wider block">Escalating To:</span>
                      <span className="text-xs font-bold text-white mt-1 block">
                        {['OPERATIONS', 'VENDOR', 'FINANCE', 'TECHNICAL'].includes(escalationTarget || '')
                          ? `${escalationTarget} Department`
                          : escalationTarget === 'SUPPORT_ADMIN'
                            ? 'Support Admin (Manager)'
                            : 'Super Admin Governance'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">Reason for Escalation *</label>
                      <textarea
                        value={escalationReason}
                        onChange={(e) => setEscalationReason(e.target.value)}
                        placeholder="e.g. Requires daily refund override code, or system bug check."
                        rows={2}
                        className="w-full bg-[#161210] border border-[#38302C] rounded-lg p-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-400"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider block">Internal Notes</label>
                      <textarea
                        value={escalationNotes}
                        onChange={(e) => setEscalationNotes(e.target.value)}
                        placeholder="Enter investigation history details..."
                        rows={2}
                        className="w-full bg-[#161210] border border-[#38302C] rounded-lg p-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#f48c25]"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEscalating(false);
                          setEscalationReason('');
                          setEscalationNotes('');
                          setEscalationTarget(null);
                        }}
                        className="flex-1 bg-transparent border border-evera-border text-[10px] py-1.5 rounded text-white font-medium hover:bg-white/5"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-red-500 hover:bg-red-600 text-[10px] py-1.5 rounded text-white font-bold transition-all shadow-md shadow-red-950/20"
                      >
                        Escalate
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )
          )}

          {/* Customer Profile Card */}
          <div className="card bg-evera-card border-evera-border p-5 space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-evera-border/30 pb-2">Customer Profile</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#A8A29E]">Name:</span>
                <span className="text-white font-medium">{ticket.customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#A8A29E]">Email:</span>
                <span className="text-white font-medium truncate max-w-[180px]">{ticket.customerEmail}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#A8A29E]">Customer ID:</span>
                <span className="text-white font-mono text-[10px]">{ticket.customerId}</span>
              </div>
            </div>
          </div>

          {/* Activity & Action Audit Logs */}
          <div className="card bg-evera-card border-evera-border p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-evera-border/30 pb-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <History size={16} className="text-[#f48c25] animate-pulse" />
                <span>Action Audit Trail</span>
              </h3>
              <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg text-[#A8A29E] font-bold">
                {ticket.timelineActions?.length || 0} Events
              </span>
            </div>

            <div className="relative pl-6 border-l border-[#38302C] space-y-6 ml-3 pt-1">
              {ticket.timelineActions && ticket.timelineActions.length > 0 ? (
                ticket.timelineActions.map((action, idx) => {
                  const getActionConfig = (actionName: string) => {
                    switch (actionName) {
                      case 'CREATED':
                        return {
                          label: 'Ticket Created',
                          bgClass: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                          iconBg: 'bg-[#1e293b] text-blue-400 border border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.15)]',
                          Icon: Plus
                        };
                      case 'ASSIGNED':
                        return {
                          label: 'Agent Assigned',
                          bgClass: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                          iconBg: 'bg-[#2d2015] text-amber-400 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
                          Icon: User
                        };
                      case 'OPENED':
                        return {
                          label: 'Ticket Opened',
                          bgClass: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
                          iconBg: 'bg-[#1e1b4b] text-indigo-400 border border-indigo-500/30 shadow-[0_0_8px_rgba(99,102,241,0.15)]',
                          Icon: Activity
                        };
                      case 'CONTACTED_USER':
                      case 'WAITING_FOR_USER':
                        return {
                          label: 'Customer Contacted',
                          bgClass: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
                          iconBg: 'bg-[#2e1065] text-purple-400 border border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.15)]',
                          Icon: MessageSquare
                        };
                      case 'WAITING_FOR_PROVIDER':
                        return {
                          label: 'Provider Contacted',
                          bgClass: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
                          iconBg: 'bg-[#3b0764] text-pink-400 border border-pink-500/30 shadow-[0_0_8px_rgba(236,72,153,0.15)]',
                          Icon: MessageSquare
                        };
                      case 'RESOLVED':
                        return {
                          label: 'Issue Resolved',
                          bgClass: 'bg-green-500/10 border-green-500/20 text-green-400',
                          iconBg: 'bg-[#062f17] text-green-400 border border-green-500/30 shadow-[0_0_8px_rgba(34,197,94,0.15)]',
                          Icon: Check
                        };
                      case 'CLOSED':
                        return {
                          label: 'Ticket Closed',
                          bgClass: 'bg-stone-500/10 border-stone-500/20 text-stone-400',
                          iconBg: 'bg-[#1c1917] text-stone-400 border border-stone-500/30 shadow-[0_0_8px_rgba(120,113,108,0.15)]',
                          Icon: Lock
                        };
                      case 'ESCALATED':
                      case 'ESCALATED_SUPPORT_ADMIN':
                      case 'ESCALATED_SUPER_ADMIN':
                      case 'ESCALATED_DEPARTMENT':
                        return {
                          label: 'Case Escalated',
                          bgClass: 'bg-red-500/10 border-red-500/20 text-red-400',
                          iconBg: 'bg-[#450a0a] text-red-400 border border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.15)]',
                          Icon: AlertTriangle
                        };
                      case 'TAKEOVER_REQUESTED':
                        return {
                          label: 'Takeover Requested',
                          bgClass: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
                          iconBg: 'bg-[#1e1b4b] text-indigo-400 border border-indigo-500/30 shadow-[0_0_8px_rgba(99,102,241,0.15)]',
                          Icon: ShieldAlert
                        };
                      case 'TAKEOVER_APPROVED':
                        return {
                          label: 'Takeover Approved',
                          bgClass: 'bg-green-500/10 border-green-500/20 text-green-400',
                          iconBg: 'bg-[#062f17] text-green-400 border border-green-500/30 shadow-[0_0_8px_rgba(34,197,94,0.15)]',
                          Icon: UserCheck
                        };
                      case 'TAKEOVER_REJECTED':
                        return {
                          label: 'Takeover Declined',
                          bgClass: 'bg-red-500/10 border-red-500/20 text-red-400',
                          iconBg: 'bg-[#450a0a] text-red-400 border border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.15)]',
                          Icon: AlertOctagon
                        };
                      case 'TRANSFERRED':
                        return {
                          label: 'Ticket Transferred',
                          bgClass: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
                          iconBg: 'bg-[#2e1065] text-purple-400 border border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.15)]',
                          Icon: ArrowUpRight
                        };
                      case 'OWNERSHIP_REMOVED':
                        return {
                          label: 'Ownership Removed',
                          bgClass: 'bg-stone-500/10 border-stone-500/20 text-stone-400',
                          iconBg: 'bg-[#1c1917] text-stone-400 border border-stone-500/30 shadow-[0_0_8px_rgba(120,113,108,0.15)]',
                          Icon: Unlock
                        };
                      default:
                        return {
                          label: actionName.replace(/_/g, ' '),
                          bgClass: 'bg-evera-primary/10 border-evera-primary/20 text-[#f48c25]',
                          iconBg: 'bg-[#2a1b15] text-[#f48c25] border border-evera-primary/30',
                          Icon: Clock
                        };
                    }
                  };

                  const config = getActionConfig(action.action);
                  const Icon = config.Icon;

                  return (
                    <div key={action.id || idx} className="relative group/item transition-all duration-300">
                      {/* Icon Node centered exactly on the vertical line */}
                      <div className={`absolute -left-[36px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${config.iconBg}`}>
                        <Icon size={11} className="stroke-[2.5]" />
                      </div>

                      {/* Modern Content Card */}
                      <div className="bg-[#161210]/40 hover:bg-[#161210]/80 border border-[#38302C]/50 hover:border-evera-primary/20 p-3 rounded-xl transition-all duration-300 relative">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${config.bgClass}`}>
                            {config.label}
                          </span>
                          <span className="text-[9px] text-[#A8A29E] font-medium flex items-center gap-1">
                            <Clock size={10} className="text-[#A8A29E]" />
                            <span>{action.timestamp}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-gray-300 font-semibold mt-1">
                          <span className="text-[#A8A29E] font-medium text-[10px]">Actor:</span>
                          <span className="text-white text-[10px] bg-white/5 border border-[#38302C] px-2 py-0.5 rounded-lg flex items-center gap-1 font-bold">
                            <User size={10} className="text-[#f48c25]" />
                            {action.actorName}
                          </span>
                        </div>

                        {action.note && (
                          <div className="bg-gradient-to-r from-[#161210]/60 to-transparent border border-white/5 pl-3 pr-2 py-2 text-gray-400 italic text-[10px] rounded-lg mt-2 relative border-l-2 border-l-[#f48c25]/40 leading-relaxed group-hover/item:border-l-[#f48c25] transition-colors">
                            "{action.note}"
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-evera-muted italic pl-2 py-4">No activity actions logged in audit trail.</div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* File Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-evera-card border border-evera-border rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-evera-border bg-[#161210]">
              <h3 className="text-white font-bold flex items-center gap-2">
                {previewAttachment.name.endsWith('.pdf') ? <FileText size={18} className="text-blue-400" /> : <FileImage size={18} className="text-green-400" />}
                {previewAttachment.name}
              </h3>
              <button
                onClick={() => setPreviewAttachment(null)}
                className="text-gray-400 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[300px] bg-[#0d0a09]">
              {previewAttachment.name.endsWith('.pdf') ? (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-500">
                    <FileText size={40} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">PDF Document</h4>
                    <p className="text-gray-400 text-sm mt-1">{previewAttachment.name}</p>
                  </div>
                  <button
                    onClick={() => {
                      addNotification(`Downloading ${previewAttachment.name}...`);
                      setPreviewAttachment(null);
                    }}
                    className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Icons.Download size={16} />
                    Download PDF
                  </button>
                </div>
              ) : (
                <div className="relative group">
                  <img
                    src={previewAttachment.url.startsWith('http') ? previewAttachment.url : `https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800&h=600`}
                    alt={previewAttachment.name}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg border border-[#38302C]"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <button
                      onClick={() => {
                        addNotification(`Downloading ${previewAttachment.name}...`);
                        setPreviewAttachment(null);
                      }}
                      className="px-6 py-2 bg-evera-primary hover:bg-[#d9751a] text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Icons.Download size={16} />
                      Download Image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
