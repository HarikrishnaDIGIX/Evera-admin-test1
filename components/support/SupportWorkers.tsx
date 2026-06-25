import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../ui/DataTable';
import { StatusBadge } from '../ui/StatusBadge';
import { SupportWorker, AdminRole } from '../../types';
import { Icons } from '../ui/Icons';
import { User, Mail, Phone, Shield, Edit3, Power, ClipboardList, Eye, Circle, Check } from 'lucide-react';
import { WorkerActivityPanel } from './WorkerActivityPanel';

export const SupportWorkers: React.FC<{ dateRangeLabel?: string, onNavigate: (screen: string) => void }> = ({ dateRangeLabel = 'Last 30 Days', onNavigate }) => {
  const { supportWorkers, createSupportWorkerLocal, updateSupportWorkerLocal, toggleSupportWorkerLocal, addNotification, tickets, adminUser } = useApp();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingWorker, setEditingWorker] = useState<SupportWorker | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<SupportWorker | null>(null);
  const isOpsAdmin = adminUser?.role === AdminRole.OPERATIONS_ADMIN;

  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    email: '',
    phone: '',
    role: 'LEVEL_1_AGENT' as import('../../types').SupportWorker['role'],
    status: 'ACTIVE' as 'ACTIVE' | 'DISABLED',
    departments: ['CUSTOMER_SUPPORT'] as import('../../types').SupportDepartment[],
    permissions: [] as string[]
  });

  const availablePermissions = [
    { key: 'read_tickets', label: 'View Tickets', desc: 'Allows agent to browse and read ticket histories' },
    { key: 'resolve_tickets', label: 'Resolve Tickets', desc: 'Allows agent to close disputes or resolve issues' },
    { key: 'contact_users', label: 'Contact Users', desc: 'Allows agent to write comments and reach out to customers/vendors' },
    { key: 'escalate_tickets', label: 'Escalate Tickets', desc: 'Allows agent to forward tickets to Support Admin/Super Admin' }
  ];



  const handleOpenEdit = (worker: SupportWorker) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      employeeId: worker.employeeId,
      email: worker.email,
      phone: worker.phone,
      role: worker.role,
      status: worker.status,
      departments: worker.departments || ['CUSTOMER_SUPPORT'],
      permissions: worker.permissions || []
    });
    setIsModalOpen(true);
  };

  const handlePermissionToggle = (permKey: string) => {
    setFormData(prev => {
      const hasPerm = prev.permissions.includes(permKey);
      const nextPerms = hasPerm
        ? prev.permissions.filter(p => p !== permKey)
        : [...prev.permissions, permKey];
      return { ...prev, permissions: nextPerms };
    });
  };

  const handleDepartmentToggle = (deptKey: any) => {
    setFormData(prev => {
      const hasDept = prev.departments.includes(deptKey);
      const nextDepts = hasDept
        ? prev.departments.filter(d => d !== deptKey)
        : [...prev.departments, deptKey];
      return { ...prev, departments: nextDepts };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!formData.name || !formData.email || !formData.phone || !formData.employeeId) {
      addNotification('Please enter all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingWorker) {
        await updateSupportWorkerLocal(editingWorker.id, formData);
      } else {
        await createSupportWorkerLocal(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      addNotification('Error saving support worker');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleLabel = (role: string) => {
    return role.replace(/_/g, ' ');
  };

  const baseWorkers = supportWorkers.filter(w => {
    if (adminUser?.role === AdminRole.OPERATIONS_ADMIN) {
      return w.role === 'OPERATIONS_WORKER';
    } else if (adminUser?.role === AdminRole.SUPPORT_ADMIN) {
      return ['LEVEL_1_AGENT', 'LEVEL_2_AGENT', 'SPECIALIST', 'SUPPORT_WORKER'].includes(w.role);
    } else if (adminUser?.role === AdminRole.SUPER_ADMIN) {
      // Super Admin sees all non-admin workers in this directory
      return !w.role.includes('ADMIN');
    }
    // Operations worker or others shouldn't see anything if they happen to access this
    return false;
  });

  const filteredWorkers = baseWorkers.filter(w => {
    return w.name.toLowerCase().includes(search.toLowerCase()) ||
           w.employeeId.toLowerCase().includes(search.toLowerCase()) ||
           w.email.toLowerCase().includes(search.toLowerCase());
  });

  // Only Support Admins, Super Admins, and Operations Admins can view worker activity
  const canViewActivity = adminUser?.role === AdminRole.SUPPORT_ADMIN || adminUser?.role === AdminRole.SUPER_ADMIN || adminUser?.role === AdminRole.OPERATIONS_ADMIN;

  // Worker active ticket count helper
  const getActiveTicketCount = (workerId: string) =>
    (tickets as any[]).filter(t =>
      t.assignedWorkerId === workerId &&
      (t.status === 'OPEN' || t.status === 'IN_PROGRESS' || t.status === 'WAITING_FOR_USER' || t.status === 'WAITING_FOR_PROVIDER')
    ).length;

  const getResolvedCount = (workerId: string) =>
    (tickets as any[]).filter(t =>
      t.resolvedByWorkerId === workerId ||
      (t.assignedWorkerId === workerId && (t.status === 'RESOLVED' || t.status === 'CLOSED'))
    ).length;

  const getEscalatedCount = (workerId: string) =>
    (tickets as any[]).filter(t =>
      t.assignedWorkerId === workerId &&
      (t.status === 'ESCALATED' || (t.escalationLevel && t.escalationLevel !== 'NONE') || t.assignedDepartment)
    ).length;

  const columns: Column<SupportWorker>[] = [
    {
      header: 'Worker Profile',
      cell: (w) => (
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-evera-primary/10 border border-evera-primary/20 flex items-center justify-center text-evera-primary font-bold text-sm">
              {w.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-evera-bg ${
              w.status === 'ACTIVE' ? 'bg-green-400' : 'bg-stone-500'
            }`} />
          </div>
          <div>
            <div className="font-bold text-sm text-white">{w.name}</div>
            <div className="text-[11px] text-evera-muted font-mono">{w.employeeId}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Contact Info',
      cell: (w) => (
        <div>
          <div className="text-xs text-white">{w.email}</div>
          <div className="text-[10px] text-evera-muted">{w.phone}</div>
        </div>
      )
    },
    {
      header: 'System Role',
      cell: (w) => (
        <span className="text-xs px-2.5 py-1 bg-[#161210] border border-[#38302C] rounded-lg text-[#f48c25] font-semibold uppercase tracking-wider">
          {getRoleLabel(w.role)}
        </span>
      )
    },
    {
      header: 'Department',
      cell: (w) => (
        <div className="flex flex-wrap gap-1 max-w-[120px]">
          {w.departments && w.departments.length > 0 ? (
            w.departments.map(d => (
              <span key={d} className="text-[9px] px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-green-400 font-bold uppercase tracking-wider">
                {d.replace('_', ' ')}
              </span>
            ))
          ) : (
            <span className="text-[9px] px-2 py-0.5 bg-[#161210] border border-[#38302C] rounded text-gray-500 font-bold uppercase tracking-wider">
              UNASSIGNED
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Permissions Granted',
      cell: (w) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {w.permissions && w.permissions.length > 0 ? (
            w.permissions.map(p => (
              <span key={p} className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-300">
                {p.replace(/_/g, ' ')}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-red-400 italic">No permissions assigned</span>
          )}
        </div>
      )
    },
    // Activity columns — only visible to Support Admins
    ...(canViewActivity ? [
      {
        header: 'Active Tickets',
        cell: (w: SupportWorker) => {
          const count = getActiveTicketCount(w.id);
          return (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
              count > 5 ? 'bg-red-500/10 border-red-500/20 text-red-400' :
              count > 2 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
              'bg-green-500/10 border-green-500/20 text-green-400'
            }`}>
              {count}
            </span>
          );
        }
      },
      {
        header: 'Resolved',
        cell: (w: SupportWorker) => (
          <span className="text-xs font-bold text-green-400">{getResolvedCount(w.id)}</span>
        )
      },
      {
        header: 'Escalated',
        cell: (w: SupportWorker) => {
          const count = getEscalatedCount(w.id);
          return (
            <span className={`text-xs font-bold ${count > 0 ? 'text-red-400' : 'text-gray-500'}`}>{count}</span>
          );
        }
      },
    ] as Column<SupportWorker>[] : []),
    {
      header: 'Status',
      cell: (w) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={w.status === 'ACTIVE' ? 'ACTIVE' : 'FAILED'} className={w.status === 'ACTIVE' ? '' : 'bg-red-500/10 text-red-400 border-red-500/20'} />
          <button
            onClick={() => toggleSupportWorkerLocal(w.id)}
            className={`p-1 rounded-lg border transition-all ${
              w.status === 'ACTIVE'
                ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                : 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
            }`}
            title={w.status === 'ACTIVE' ? 'Disable Agent' : 'Enable Agent'}
          >
            <Power size={13} />
          </button>
        </div>
      )
    },
    {
      header: 'Actions',
      cell: (w) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(w);
            }}
            className="text-xs text-[#f48c25] hover:underline font-bold flex items-center gap-1"
          >
            <Edit3 size={12} />
            <span>Edit</span>
          </button>
        </div>
      )
    }
  ];

  // ── Worker Activity Detail View ───────────────────────────────────────────
  if (selectedWorker) {
    const liveWorker = supportWorkers.find(w => w.id === selectedWorker.id) || selectedWorker;
    return (
      <WorkerActivityPanel
        worker={liveWorker}
        allWorkers={filteredWorkers}
        tickets={tickets as any[]}
        onBack={() => setSelectedWorker(null)}
        dateRangeLabel={dateRangeLabel}
      />
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">{isOpsAdmin ? 'Operations Team Directory' : 'Support Workers Directory'}</h2>
          <p className="text-xs text-[#A8A29E]">{isOpsAdmin ? 'Configure access and permissions for your operations team.' : 'Configure system access, employee IDs, email addresses, and granular permissions for level 1 & 2 support workers.'}</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agents or employee IDs..."
              className="w-full bg-[#241E1B] border border-[#38302C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#f48c25] placeholder-[#A8A29E]/50"
            />
          </div>
          <button
            onClick={() => onNavigate('create-worker')}
            className="bg-evera-primary hover:bg-[#d9751a] px-4 py-2 text-xs rounded-lg text-white font-bold transition-all shadow-md shadow-orange-955/20 whitespace-nowrap"
          >
            + Create Worker
          </button>
        </div>
      </div>

      {/* Summary strip — only for Support Admins */}
      {canViewActivity && baseWorkers.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Total Workers',
              value: baseWorkers.length,
              color: '#f48c25',
              sub: `${baseWorkers.filter(w => w.status === 'ACTIVE').length} active`
            },
            {
              label: 'Active Tickets',
              value: (tickets as any[]).filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
              color: '#f59e0b',
              sub: 'In queue'
            },
            {
              label: 'Resolved Today',
              value: (tickets as any[]).filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
              color: '#10b981',
              sub: 'Total resolved'
            },
            {
              label: 'Escalations',
              value: (tickets as any[]).filter(t => t.status === 'ESCALATED' || (t.escalationLevel && t.escalationLevel !== 'NONE')).length,
              color: '#ef4444',
              sub: 'Requiring attention'
            },
          ].map((item, i) => (
            <div key={i} className="card bg-evera-card border-evera-border px-4 py-3 flex items-center gap-3">
              <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <div>
                <p className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">{item.label}</p>
                <p className="text-xl font-black text-white leading-tight" style={{ color: item.color }}>{item.value}</p>
                <p className="text-[9px] text-[#A8A29E]">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card bg-evera-card border-evera-border p-1">
        <DataTable
          columns={columns}
          data={filteredWorkers}
          emptyMessage="No support workers found."
          onRowClick={(w) => setSelectedWorker(w)}
        />
      </div>

      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-[#241E1B] border border-[#38302C] w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-evera-border pb-3">
              <h3 className="text-base font-black text-white">
                {editingWorker ? `Edit ${isOpsAdmin ? 'Operations Worker' : 'Support Worker'} Profile` : `Register ${isOpsAdmin ? 'Operations Worker' : 'Support Worker'}`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Icons.Reject size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Full Name *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <User size={14} />
                    </span>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                      className="w-full bg-[#161210] border border-[#38302C] rounded-lg py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-[#f48c25]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Employee ID *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <ClipboardList size={14} />
                    </span>
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                      placeholder="EMP-SW-001"
                      className="w-full bg-[#161210] border border-[#38302C] rounded-lg py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-[#f48c25]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Email Address *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <Mail size={14} />
                    </span>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john.doe@evera.com"
                      className="w-full bg-[#161210] border border-[#38302C] rounded-lg py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-[#f48c25]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Phone Number *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <Phone size={14} />
                    </span>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 9876543210"
                      className="w-full bg-[#161210] border border-[#38302C] rounded-lg py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-[#f48c25]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">System Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full bg-[#161210] border border-[#38302C] rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[#f48c25] cursor-pointer"
                    disabled={isOpsAdmin}
                  >
                    {isOpsAdmin ? (
                      <option value="OPERATIONS_WORKER">Operations Worker</option>
                    ) : (
                      <>
                        <option value="LEVEL_1_AGENT">Level 1 Agent</option>
                        <option value="LEVEL_2_AGENT">Level 2 Agent</option>
                        <option value="SPECIALIST">Specialist</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Account Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full bg-[#161210] border border-[#38302C] rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[#f48c25] cursor-pointer"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="DISABLED">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 mb-4 mt-4">
                  <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider block">Assigned Departments</label>
                  <div className="grid grid-cols-2 gap-2 bg-[#161210] p-3 rounded-xl border border-evera-border/30">
                    {[
                      { key: 'CUSTOMER_SUPPORT', label: 'Customer Support' },
                      { key: 'VENDOR_SUPPORT', label: 'Vendor Support' },
                      { key: 'FINANCE_SUPPORT', label: 'Finance Support' },
                      { key: 'TECHNICAL_SUPPORT', label: 'Technical Support' }
                    ].map(dept => {
                      const isSelected = formData.departments.includes(dept.key as any);
                      return (
                        <div
                          key={dept.key}
                          onClick={() => handleDepartmentToggle(dept.key)}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-all ${
                            isSelected
                              ? 'bg-green-500/10 border-green-500/30 text-green-400'
                              : 'bg-transparent border-[#38302C] text-[#A8A29E] hover:border-white/20'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-green-500 border-green-500 text-white' : 'border-gray-500'
                          }`}>
                            {isSelected && <Check size={12} />}
                          </div>
                          <span className="text-[11px] font-bold">{dept.label}</span>
                        </div>
                      );
                    })}
                  </div>
              </div>

              {/* Checkbox Permissions */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider block">Assign Permissions</label>
                <div className="grid grid-cols-1 gap-2 bg-[#161210] p-3 rounded-xl border border-evera-border/30 max-h-48 overflow-y-auto">
                  {availablePermissions.map(perm => {
                    const isChecked = formData.permissions.includes(perm.key);
                    return (
                      <div
                        key={perm.key}
                        onClick={() => handlePermissionToggle(perm.key)}
                        className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          isChecked ? 'bg-evera-primary/5 border border-evera-primary/20' : 'border border-transparent hover:bg-white/5'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by onClick on row
                          className="mt-1 cursor-pointer accent-[#f48c25]"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-white leading-none">{perm.label}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{perm.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t border-evera-border pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-transparent border border-evera-border text-xs px-4 py-2.5 rounded-lg text-white font-semibold hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#f48c25] hover:bg-[#d9751a] text-xs px-4 py-2.5 rounded-lg text-white font-bold transition-all shadow-md shadow-orange-950/20"
                >
                  {editingWorker ? 'Save Changes' : 'Create Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
