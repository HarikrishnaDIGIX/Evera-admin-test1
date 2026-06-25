import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminRole, SupportDepartment, SupportWorker } from '../../types';
import { User, Mail, Phone, ClipboardList, Check, ArrowLeft } from 'lucide-react';
import { Icons } from '../ui/Icons';

import * as api from '../../api/service';

export const CreateWorker: React.FC<{ onBack: () => void; managerId?: string }> = ({ onBack, managerId }) => {
  const { addNotification, supportWorkers, adminUser, refreshData } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  
  const isOpsAdmin = adminUser?.role === AdminRole.OPERATIONS_ADMIN;

  const [formData, setFormData] = useState({
    name: '',
    employeeId: isOpsAdmin ? `EMP-OPS-0${supportWorkers.length + 1}` : `EMP-SW-0${supportWorkers.length + 1}`,
    email: '',
    phone: '',
    role: isOpsAdmin ? 'OPERATIONS_WORKER' : 'LEVEL_1_AGENT',
    status: 'ACTIVE' as 'ACTIVE' | 'BLOCKED',
    departments: ['CUSTOMER_SUPPORT'] as SupportDepartment[],
    permissions: ['read_tickets', 'contact_users']
  });

  const availablePermissions = [
    { key: 'read_tickets', label: 'View Tickets', desc: 'Allows agent to browse and read ticket histories' },
    { key: 'resolve_tickets', label: 'Resolve Tickets', desc: 'Allows agent to close disputes or resolve issues' },
    { key: 'contact_users', label: 'Contact Users', desc: 'Allows agent to write comments and reach out to customers/vendors' },
    { key: 'escalate_tickets', label: 'Escalate Tickets', desc: 'Allows agent to forward tickets to Support Admin/Super Admin' }
  ];

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
      setErrorModal('Please enter all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorModal('Please enter a valid email address.');
      return;
    }

    const phoneRegex = /^\+?[\d\s\-]{8,20}$/;
    if (!phoneRegex.test(formData.phone)) {
      setErrorModal('Please enter a valid phone number (e.g., +91 9876543210).');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = managerId ? { ...formData, managerId } : formData;
      const res = await api.createSupportWorker(payload as any);
      if (res.success && res.data) {
        addNotification(`Support worker ${formData.name} created successfully!`);
        refreshData();
        onBack();
      } else {
        setErrorModal(res.error || 'Failed to create support worker');
      }
    } catch (err: any) {
      console.error(err);
      setErrorModal(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">Register New Worker</h2>
          <p className="text-xs text-[#A8A29E]">Configure system access, employee IDs, and granular permissions.</p>
        </div>
      </div>

      <div className="bg-evera-card border border-evera-border rounded-2xl shadow-xl overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-[#38302C] pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label htmlFor="full-name" className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Full Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <User size={14} />
                  </span>
                  <input
                    id="full-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                    className="w-full bg-[#161210] border border-[#38302C] rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#f48c25] transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="employee-id" className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Employee ID *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <ClipboardList size={14} />
                  </span>
                  <input
                    id="employee-id"
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                    placeholder="EMP-SW-001"
                    className="w-full bg-[#161210] border border-[#38302C] rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#f48c25] transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label htmlFor="email-address" className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Email Address *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Mail size={14} />
                  </span>
                  <input
                    id="email-address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john.doe@evera.com"
                    className="w-full bg-[#161210] border border-[#38302C] rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#f48c25] transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="phone-number" className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Phone Number *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Phone size={14} />
                  </span>
                  <input
                    id="phone-number"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^[\+\d\s\-]*$/.test(val)) {
                        setFormData(prev => ({ ...prev, phone: val }));
                      }
                    }}
                    placeholder="+91 9876543210"
                    className="w-full bg-[#161210] border border-[#38302C] rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#f48c25] transition-colors"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-[#38302C] pb-2">Role & Departments</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">System Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full bg-[#161210] border border-[#38302C] rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#f48c25] cursor-pointer"
                  disabled={isOpsAdmin}
                >
                  {isOpsAdmin ? (
                    <option value="OPERATIONS_WORKER">Operations Worker</option>
                  ) : (
                    <>
                      <option value="LEVEL_1_AGENT">Level 1 Agent</option>
                      <option value="LEVEL_2_AGENT">Level 2 Agent</option>
                      <option value="SPECIALIST">Specialist</option>
                      {adminUser?.role === AdminRole.SUPER_ADMIN && (
                        <option value="OPERATIONS_WORKER">Operations Worker</option>
                      )}
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Account Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full bg-[#161210] border border-[#38302C] rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#f48c25] cursor-pointer"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="BLOCKED">Disabled</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider block">Assigned Departments</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#161210] p-4 rounded-xl border border-evera-border/30">
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
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${
                        isSelected
                          ? 'bg-green-500/10 border-green-500/30 text-green-400'
                          : 'bg-[#241E1B] border-[#38302C] text-[#A8A29E] hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? 'bg-green-500 text-white' : 'bg-[#161210] border border-[#38302C]'
                      }`}>
                        {isSelected && <Check size={14} />}
                      </div>
                      <span className="text-xs font-bold leading-none">{dept.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-[#38302C] pb-2">Access Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#161210] p-4 rounded-xl border border-evera-border/30">
              {availablePermissions.map(perm => {
                const isChecked = formData.permissions.includes(perm.key);
                return (
                  <div
                    key={perm.key}
                    onClick={() => handlePermissionToggle(perm.key)}
                    className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer border transition-all ${
                      isChecked 
                        ? 'bg-[#f48c25]/10 border-[#f48c25]/30' 
                        : 'bg-[#241E1B] border-[#38302C] hover:border-white/20'
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                      isChecked ? 'bg-[#f48c25] text-white' : 'bg-[#161210] border border-[#38302C]'
                    }`}>
                      {isChecked && <Check size={14} />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold leading-none ${isChecked ? 'text-white' : 'text-gray-300'}`}>
                        {perm.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-1.5">{perm.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-[#38302C]">
            <button
              type="button"
              onClick={onBack}
              className="bg-[#241E1B] border border-[#38302C] px-6 py-2.5 rounded-lg text-sm text-white font-bold hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#f48c25] hover:bg-[#d9751a] px-8 py-2.5 rounded-lg text-sm text-white font-bold transition-all shadow-lg shadow-orange-900/20 disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Create Worker'
              )}
            </button>
          </div>
        </form>
      </div>

      {errorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#161210] border border-red-500/30 rounded-2xl shadow-2xl shadow-red-900/20 max-w-sm w-full overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                <div className="text-red-500 text-xl font-bold">!</div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Validation Error</h3>
                <p className="text-sm text-gray-400 mt-2">{errorModal}</p>
              </div>
            </div>
            <div className="p-4 bg-[#241E1B] border-t border-[#38302C]">
              <button
                type="button"
                onClick={() => setErrorModal(null)}
                className="w-full bg-[#f48c25] hover:bg-[#d9751a] py-2.5 rounded-lg text-sm text-white font-bold transition-colors"
              >
                Okay, I'll fix it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
