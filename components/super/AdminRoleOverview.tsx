import React, { useState } from 'react';
import { 
  FileText, Shield, Settings, DollarSign, Headphones, 
  Monitor, Wrench, Users, GitBranch, ClipboardList, 
  XCircle, AlertTriangle, ShieldAlert, Sliders, Globe, 
  UserX, Database, Link, Key, ChevronRight, ArrowLeft, 
  Activity, Coins, Star, ShieldCheck, CheckCircle2,
  TrendingUp, Award, UserCheck, MessageSquare, Info,
  Sparkles, CheckSquare, RefreshCw, PlayCircle, Eye,
  Compass, Zap, Briefcase, Crown, Server, BarChart3,
  ShieldAlert as ShieldIcon, Landmark, Bell, CheckSquare as CheckIcon,
  ChevronDown, Calendar
} from 'lucide-react';

interface DepartmentDetailProps {
  onBack: () => void;
}

export const AdminRoleOverview: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'super_admin'>('admin');
  const [activeDept, setActiveDept] = useState<'main' | 'operations' | 'finance' | 'support'>('main');

  const handleNavigateDept = (dept: 'main' | 'operations' | 'finance' | 'support') => {
    setActiveDept(dept);
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTop = 0;
  };

  const handleRoleToggle = (role: 'admin' | 'super_admin') => {
    setSelectedRole(role);
    setActiveDept('main');
  };

  if (activeDept === 'operations') {
    return <OperationsDeptDetail onBack={() => handleNavigateDept('main')} />;
  }

  if (activeDept === 'finance') {
    return <FinanceDeptDetail onBack={() => handleNavigateDept('main')} />;
  }

  if (activeDept === 'support') {
    return <SupportDeptDetail onBack={() => handleNavigateDept('main')} />;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* HIGH-LEVEL NAVIGATION: ROLE TOGGLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-evera-border/40 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Sparkles size={20} className="text-evera-primary animate-pulse" />
            Platform Role & Department Governance
          </h2>
          <p className="text-xs text-[#A8A29E]">Select a role below to explore detailed responsibilities, access criteria, restrictions, and core system workflows.</p>
        </div>

        {/* Global Role Tabs */}
        <div className="bg-[#161210] border border-evera-border p-1 rounded-xl flex items-center gap-1 shadow-inner self-start md:self-auto">
          <button
            onClick={() => handleRoleToggle('admin')}
            className={`px-4 py-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
              selectedRole === 'admin' 
                ? 'bg-gradient-to-r from-[#4c1d95] to-[#5c21bd] text-white shadow-md' 
                : 'text-evera-muted hover:text-white'
            }`}
          >
            <Shield size={14} />
            <span>Admin Overview</span>
          </button>
          <button
            onClick={() => handleRoleToggle('super_admin')}
            className={`px-4 py-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
              selectedRole === 'super_admin' 
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md' 
                : 'text-evera-muted hover:text-white'
            }`}
          >
            <Crown size={14} />
            <span>Super Admin Overview</span>
          </button>
        </div>
      </div>

      {selectedRole === 'admin' ? (
        /* ============================================================================
           ADMIN OVERVIEW DASHBOARD
           ============================================================================ */
        <div className="space-y-8 animate-fade-in">
          {/* SECTION 1: CORE SUMMARY */}
          <div className="grid grid-cols-12 gap-6">
            {/* Description Card */}
            <div className="col-span-12 md:col-span-4 card bg-evera-card/50 border-evera-border/80 flex flex-col justify-between hover:border-evera-primary/30 transition-all group duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-evera-primary">
                  <div className="p-2 bg-evera-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                    <FileText size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider">Description</span>
                </div>
                <p className="text-sm font-semibold text-white/90 leading-relaxed">
                  Admin manages daily application activities, monitors departments, and ensures smooth operations across the entire platform.
                </p>
              </div>
              <div className="border-t border-evera-border/40 pt-4 mt-6 flex items-center gap-2 text-[10px] text-evera-muted">
                <Info size={12} className="text-evera-primary" />
                <span>Platform Operations Hub</span>
              </div>
            </div>

            {/* Brand Core Center Card */}
            <div className="col-span-12 md:col-span-4 card relative overflow-hidden bg-gradient-to-br from-[#4c1d95] via-[#5c21bd] to-[#1e1b4b] border-[#6d28d9]/50 flex flex-col items-center justify-center text-center p-6 shadow-xl shadow-purple-950/20 group hover:border-[#8b5cf6] transition-all duration-500">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-5 -mt-5 group-hover:bg-white/10 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -ml-5 -mb-5"></div>
              
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-4 group-hover:scale-105 transition-transform duration-300 shadow-md">
                <Users size={32} className="text-white drop-shadow-md animate-pulse" />
              </div>
              
              <h3 className="text-xl font-black text-white uppercase tracking-widest mb-1">ADMIN</h3>
              <div className="h-0.5 w-12 bg-white/30 mb-3 group-hover:w-20 transition-all duration-300"></div>
              <p className="text-xs text-purple-100/90 font-medium px-4 leading-relaxed">
                Manages daily application activities and departments.
              </p>
            </div>

            {/* Access Departments Tags */}
            <div className="col-span-12 md:col-span-4 card bg-evera-card/50 border-evera-border/80 flex flex-col justify-between hover:border-evera-primary/30 transition-all group duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#10b981]">
                  <div className="p-2 bg-[#10b981]/10 rounded-lg group-hover:scale-110 transition-transform">
                    <ShieldCheck size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider">Access</span>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer transition-colors" onClick={() => handleNavigateDept('operations')}>
                    <div className="flex items-center gap-2.5">
                      <Activity size={14} className="text-[#10b981]" />
                      <span className="text-xs font-bold text-white">Operations Department</span>
                    </div>
                    <ChevronRight size={14} className="text-evera-muted group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer transition-colors" onClick={() => handleNavigateDept('finance')}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-black text-[#3b82f6] px-1">₹</span>
                      <span className="text-xs font-bold text-white">Finance Department</span>
                    </div>
                    <ChevronRight size={14} className="text-evera-muted group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer transition-colors" onClick={() => handleNavigateDept('support')}>
                    <div className="flex items-center gap-2.5">
                      <Headphones size={14} className="text-[#f59e0b]" />
                      <span className="text-xs font-bold text-white">Support Department</span>
                    </div>
                    <ChevronRight size={14} className="text-evera-muted group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: RESPONSIBILITIES MATRIX */}
          <div className="space-y-5">
            <div className="flex items-center justify-center py-2 px-6 bg-[#5c21bd]/15 border border-[#5c21bd]/30 rounded-xl max-w-xs mx-auto shadow-md">
              <span className="text-[11px] font-black text-purple-300 uppercase tracking-widest">Responsibilities Matrix</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Card 1 */}
              <div className="card bg-evera-card/40 border-evera-border p-4.5 flex flex-col justify-between hover:border-[#3b82f6]/40 hover:bg-[#3b82f6]/5 hover:shadow-lg hover:shadow-[#3b82f6]/5 hover:-translate-y-1 transition-all duration-300 group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/10 text-[#3b82f6] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Monitor size={20} />
                  </div>
                  <h4 className="text-[11px] font-extrabold text-[#3b82f6] uppercase tracking-wider">Monitor Departments</h4>
                  <p className="text-[11px] text-[#A8A29E] leading-relaxed">
                    Monitor Operations, Finance and Support and track their performance.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="card bg-evera-card/40 border-evera-border p-4.5 flex flex-col justify-between hover:border-[#10b981]/40 hover:bg-[#10b981]/5 hover:shadow-lg hover:shadow-[#10b981]/5 hover:-translate-y-1 transition-all duration-300 group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#10b981]/10 text-[#10b981] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wrench size={20} />
                  </div>
                  <h4 className="text-[11px] font-extrabold text-[#10b981] uppercase tracking-wider">Resolve Platform Issues</h4>
                  <p className="text-[11px] text-[#A8A29E] leading-relaxed">
                    Identify platform issues and ensure timely resolution for smooth operations.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="card bg-evera-card/40 border-evera-border p-4.5 flex flex-col justify-between hover:border-[#a855f7]/40 hover:bg-[#a855f7]/5 hover:shadow-lg hover:shadow-[#a855f7]/5 hover:-translate-y-1 transition-all duration-300 group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#a855f7]/10 text-[#a855f7] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users size={20} />
                  </div>
                  <h4 className="text-[11px] font-extrabold text-[#a855f7] uppercase tracking-wider">Manage Managers</h4>
                  <p className="text-[11px] text-[#A8A29E] leading-relaxed">
                    Create, update and manage department managers and their access structure.
                  </p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="card bg-evera-card/40 border-evera-border p-4.5 flex flex-col justify-between hover:border-[#f59e0b]/40 hover:bg-[#f59e0b]/5 hover:shadow-lg hover:shadow-[#f59e0b]/5 hover:-translate-y-1 transition-all duration-300 group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/10 text-[#f59e0b] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <GitBranch size={20} />
                  </div>
                  <h4 className="text-[11px] font-extrabold text-[#f59e0b] uppercase tracking-wider">Monitor Workflows</h4>
                  <p className="text-[11px] text-[#A8A29E] leading-relaxed">
                    Monitor workflows across departments and ensure tasks are completed efficiently.
                  </p>
                </div>
              </div>

              {/* Card 5 */}
              <div className="card bg-evera-card/40 border-evera-border p-4.5 flex flex-col justify-between hover:border-[#14b8a6]/40 hover:bg-[#14b8a6]/5 hover:shadow-lg hover:shadow-[#14b8a6]/5 hover:-translate-y-1 transition-all duration-300 group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#14b8a6]/10 text-[#14b8a6] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ClipboardList size={20} />
                  </div>
                  <h4 className="text-[11px] font-extrabold text-[#14b8a6] uppercase tracking-wider">Overall Management</h4>
                  <p className="text-[11px] text-[#A8A29E] leading-relaxed">
                    Ensure daily activities are running as per platform policies and guidelines.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: RESTRICTIONS GRID */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Side: RESTRICTIONS (Red) */}
            <div className="col-span-12 lg:col-span-6 card bg-evera-card/40 border-[#ef4444]/25 p-5 relative overflow-hidden group hover:border-[#ef4444]/40 transition-all duration-300">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-red-500/5 rounded-full blur-xl group-hover:bg-red-500/10 transition-all"></div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-md text-[10px] font-black text-red-400 uppercase tracking-widest">
                  Restrictions
                </span>
              </div>

              <div className="flex items-start gap-4 p-3 bg-red-950/10 border border-red-500/10 rounded-xl mb-4.5">
                <div className="p-2 bg-red-500/10 text-red-400 rounded-lg mt-0.5">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Security & Hierarchy Limitations</p>
                  <p className="text-[11px] text-[#A8A29E] mt-0.5 leading-relaxed">
                    Admin has certain structural limitations to maintain overall system security and authorization hierarchies.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white/5 border border-evera-border/60 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-extrabold text-red-400 uppercase tracking-wider">
                  <XCircle size={12} />
                  <span>Cannot Modify Super Admin Settings</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Admin cannot modify Super Admin accounts, global configurations, administrative permissions, or system settings that affect the entire platform.
                </p>
              </div>
            </div>

            {/* Right Side: CANNOT ACCESS (Dark Gray) */}
            <div className="col-span-12 lg:col-span-6 card bg-evera-card/40 border-evera-border p-5 relative overflow-hidden group hover:border-gray-500/30 transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-white/5 border border-evera-border rounded-md text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  Cannot Access / Perform
                </span>
              </div>

              <div className="space-y-3">
                {['Cannot access Super Admin control panel', 'Cannot modify global system settings', 'Cannot change Super Admin permissions', 'Cannot access system level security logs', 'Cannot manage platform-wide integrations'].map((text, idx) => {
                  const IconsList = [Sliders, Globe, UserX, Database, Link];
                  const Icon = IconsList[idx];
                  return (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <div className="p-2 bg-gray-500/10 text-gray-400 rounded-lg">
                        <Icon size={14} />
                      </div>
                      <span className="text-xs font-bold text-gray-200">{text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 4: DEPARTMENT ACCESS TREE & QUICK SUMMARY */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Side: FLOWCHART TREE */}
            <div className="col-span-12 lg:col-span-8 card bg-evera-card/40 border-evera-border p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-[#5c21bd]/15 border border-[#5c21bd]/30 rounded-md text-[10px] font-black text-purple-300 uppercase tracking-widest">
                    Department Access Hierarchy
                  </span>
                </div>
                <p className="text-[11px] text-[#A8A29E] mb-6">
                  Platform flowchart illustrating Admin department oversight. Click on any department node to load its operational detail screen and roles workflow.
                </p>
              </div>

              {/* TREE DIAGRAM */}
              <div className="relative p-6 bg-black/20 rounded-2xl border border-evera-border/40 flex flex-col items-center">
                {/* Top Root node */}
                <div className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#4c1d95] to-[#5c21bd] border border-[#7c3aed]/40 text-center shadow-lg shadow-purple-950/20 z-10">
                  <p className="text-[10px] font-black text-purple-200 uppercase tracking-widest">ADMIN</p>
                  <p className="text-[9px] font-bold text-white/90">Access to Departments</p>
                </div>

                {/* Tree Branching SVG lines */}
                <div className="w-full h-12 relative">
                  <svg className="w-full h-full absolute inset-0 pointer-events-none" style={{ minHeight: '48px' }}>
                    <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#38302C" strokeWidth="2" strokeDasharray="3 3" />
                    <line x1="16.6%" y1="50%" x2="83.3%" y2="50%" stroke="#38302C" strokeWidth="2" />
                    <line x1="16.6%" y1="50%" x2="16.6%" y2="100%" stroke="#38302C" strokeWidth="2" />
                    <line x1="83.3%" y1="50%" x2="83.3%" y2="100%" stroke="#38302C" strokeWidth="2" />
                  </svg>
                </div>

                {/* Bottom Department nodes */}
                <div className="grid grid-cols-3 gap-4 w-full z-10 relative">
                  {/* Operations Node */}
                  <div 
                    onClick={() => handleNavigateDept('operations')}
                    className="card bg-evera-card border-[#10b981]/20 p-3 hover:border-[#10b981]/80 hover:bg-[#10b981]/5 hover:shadow-lg hover:shadow-[#10b981]/5 transition-all text-center cursor-pointer group rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <Activity size={15} />
                    </div>
                    <h5 className="text-[10px] font-extrabold text-[#10b981] uppercase tracking-wider">Operations</h5>
                    <p className="text-[9px] text-[#A8A29E] mt-1 leading-normal">
                      Access to operations team, workflows and activities.
                    </p>
                  </div>

                  {/* Finance Node */}
                  <div 
                    onClick={() => handleNavigateDept('finance')}
                    className="card bg-evera-card border-[#3b82f6]/20 p-3 hover:border-[#3b82f6]/80 hover:bg-[#3b82f6]/5 hover:shadow-lg hover:shadow-[#3b82f6]/5 transition-all text-center cursor-pointer group rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform font-black text-xs">
                      ₹
                    </div>
                    <h5 className="text-[10px] font-extrabold text-[#3b82f6] uppercase tracking-wider">Finance</h5>
                    <p className="text-[9px] text-[#A8A29E] mt-1 leading-normal">
                      Access to finance team, transactions and reports.
                    </p>
                  </div>

                  {/* Support Node */}
                  <div 
                    onClick={() => handleNavigateDept('support')}
                    className="card bg-evera-card border-[#f59e0b]/20 p-3 hover:border-[#f59e0b]/80 hover:bg-[#f59e0b]/5 hover:shadow-lg hover:shadow-[#f59e0b]/5 transition-all text-center cursor-pointer group rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <Headphones size={15} />
                    </div>
                    <h5 className="text-[10px] font-extrabold text-[#f59e0b] uppercase tracking-wider">Support</h5>
                    <p className="text-[9px] text-[#A8A29E] mt-1 leading-normal">
                      Access to support team, tickets and customer issues.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: QUICK SUMMARY */}
            <div className="col-span-12 lg:col-span-4 card bg-gradient-to-b from-[#1e1b4b]/20 to-[#18181b]/35 border-evera-border p-5 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-evera-border/40">
                  <span className="px-3 py-1 bg-[#1e1b4b] border border-[#312e81] rounded-md text-[10px] font-black text-purple-300 uppercase tracking-widest">
                    Quick Summary
                  </span>
                </div>

                <div className="space-y-4.5">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-md">
                      <Users size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Role</p>
                      <p className="text-xs font-black text-white mt-0.5">Admin</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-[#10b981]/10 text-[#10b981] rounded-md">
                      <CheckSquare size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Main Focus</p>
                      <p className="text-xs font-black text-white mt-0.5">Manage & Monitor Departments</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-[#3b82f6]/10 text-[#3b82f6] rounded-md">
                      <Globe size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Departments</p>
                      <p className="text-xs font-black text-white mt-0.5">Operations, Finance, Support</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-[#ef4444]/10 text-[#ef4444] rounded-md">
                      <XCircle size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">Restriction</p>
                      <p className="text-xs font-black text-white mt-0.5">Cannot modify Super Admin settings</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-3 bg-purple-950/15 border border-purple-500/10 rounded-xl flex items-center justify-between group hover:border-purple-500/20 transition-all">
                <span className="text-[10px] text-purple-300 font-bold">Interactive Hierarchy Guide</span>
                <Sparkles size={12} className="text-purple-400 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================================
           SUPER ADMIN OVERVIEW DASHBOARD (Gold Theme matching "Highest Authority")
           ============================================================================ */
        <div className="space-y-8 animate-fade-in text-white">
          {/* SECTION 1: CORE GRID */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Top Cards Bullets */}
            <div className="col-span-12 md:col-span-4 space-y-4 flex flex-col justify-between">
              <div className="card bg-evera-card/50 border-amber-500/10 hover:border-amber-500/30 p-4.5 flex items-start gap-4 transition-all duration-300 group">
                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl group-hover:scale-110 transition-transform">
                  <Sliders size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Full System Access</h4>
                  <p className="text-[11px] text-[#A8A29E] mt-1 leading-normal">Access to all platform modules, system features and raw database records.</p>
                </div>
              </div>

              <div className="card bg-evera-card/50 border-amber-500/10 hover:border-amber-500/30 p-4.5 flex items-start gap-4 transition-all duration-300 group">
                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl group-hover:scale-110 transition-transform">
                  <Users size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">All Departments Access</h4>
                  <p className="text-[11px] text-[#A8A29E] mt-1 leading-normal">Complete oversight, tracking and moderation controls across all departments.</p>
                </div>
              </div>

              <div className="card bg-evera-card/50 border-amber-500/10 hover:border-amber-500/30 p-4.5 flex items-start gap-4 transition-all duration-300 group">
                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl group-hover:scale-110 transition-transform">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">All Modules Access</h4>
                  <p className="text-[11px] text-[#A8A29E] mt-1 leading-normal">Unrestricted access and modification authority across all system modules.</p>
                </div>
              </div>
            </div>

            {/* Center Core Brand Card (Gold) */}
            <div className="col-span-12 md:col-span-4 card relative overflow-hidden bg-gradient-to-br from-[#78350f] via-[#b45309] to-[#451a03] border-amber-500/50 flex flex-col items-center justify-center text-center p-6 shadow-xl shadow-amber-950/20 group hover:border-amber-400 transition-all duration-500">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-5 -mt-5 group-hover:bg-white/10 transition-colors"></div>
              
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-4 group-hover:scale-105 transition-transform duration-300 shadow-md">
                <Crown size={32} className="text-amber-300 drop-shadow-md animate-pulse" />
              </div>
              
              <h3 className="text-lg font-black text-white uppercase tracking-widest mb-1">SUPER ADMIN</h3>
              <span className="px-2.5 py-0.5 bg-black/40 border border-amber-500/30 rounded-full text-[9px] font-black text-amber-400 uppercase tracking-widest mb-3">
                Highest Authority
              </span>
              <p className="text-xs text-amber-100/90 font-medium px-4 leading-relaxed">
                Complete control over the entire application and all operations.
              </p>
            </div>

            {/* Right Top Cards Bullets */}
            <div className="col-span-12 md:col-span-4 space-y-4 flex flex-col justify-between">
              <div className="card bg-evera-card/50 border-amber-500/10 hover:border-amber-500/30 p-4.5 flex items-start gap-4 transition-all duration-300 group">
                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl group-hover:scale-110 transition-transform">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">All Reports & Dashboards</h4>
                  <p className="text-[11px] text-[#A8A29E] mt-1 leading-normal">View and access all financial, operational and support logs & analytics.</p>
                </div>
              </div>

              <div className="card bg-evera-card/50 border-amber-500/10 hover:border-amber-500/30 p-4.5 flex items-start gap-4 transition-all duration-300 group">
                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl group-hover:scale-110 transition-transform">
                  <ShieldIcon size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Permissions & Controls</h4>
                  <p className="text-[11px] text-[#A8A29E] mt-1 leading-normal">Manage global system access roles, credentials and security parameters.</p>
                </div>
              </div>

              <div className="card bg-evera-card/50 border-amber-500/10 hover:border-amber-500/30 p-4.5 flex items-start gap-4 transition-all duration-300 group">
                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl group-hover:scale-110 transition-transform">
                  <Settings size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Admin Management</h4>
                  <p className="text-[11px] text-[#A8A29E] mt-1 leading-normal">Create, edit, suspend and moderate administrator system credentials.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: RESPONSIBILITIES */}
          <div className="space-y-5">
            <div className="flex items-center justify-center py-2 px-6 bg-amber-500/10 border border-amber-500/20 rounded-xl max-w-xs mx-auto shadow-md">
              <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest">Global Responsibilities</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="card bg-evera-card/40 border-evera-border p-4.5 flex flex-col justify-between hover:border-amber-500/30 hover:bg-amber-500/5 hover:-translate-y-1 transition-all duration-300 group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Server size={18} />
                  </div>
                  <h4 className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">1. Platform Management</h4>
                  <ul className="text-[10px] text-gray-400 space-y-1">
                    <li>• Manage platform setup</li>
                    <li>• Monitor performance</li>
                    <li>• Control settings</li>
                    <li>• Ensure infrastructure security</li>
                  </ul>
                </div>
              </div>

              <div className="card bg-evera-card/40 border-evera-border p-4.5 flex flex-col justify-between hover:border-amber-500/30 hover:bg-amber-500/5 hover:-translate-y-1 transition-all duration-300 group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserCheck size={18} />
                  </div>
                  <h4 className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">2. Admin Management</h4>
                  <ul className="text-[10px] text-gray-400 space-y-1">
                    <li>• Create Admin accounts</li>
                    <li>• Edit/Remove Admins</li>
                    <li>• Assign permissions</li>
                    <li>• Moderate administrator roles</li>
                  </ul>
                </div>
              </div>

              <div className="card bg-evera-card/40 border-evera-border p-4.5 flex flex-col justify-between hover:border-amber-500/30 hover:bg-amber-500/5 hover:-translate-y-1 transition-all duration-300 group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Landmark size={18} />
                  </div>
                  <h4 className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">3. Department Monitoring</h4>
                  <ul className="text-[10px] text-gray-400 space-y-1">
                    <li>• Monitor Operations logs</li>
                    <li>• Monitor Finance ledgers</li>
                    <li>• Monitor Support channels</li>
                    <li>• Track system metrics</li>
                  </ul>
                </div>
              </div>

              <div className="card bg-evera-card/40 border-evera-border p-4.5 flex flex-col justify-between hover:border-amber-500/30 hover:bg-amber-500/5 hover:-translate-y-1 transition-all duration-300 group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BarChart3 size={18} />
                  </div>
                  <h4 className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">4. Reports & Analytics</h4>
                  <ul className="text-[10px] text-gray-400 space-y-1">
                    <li>• Access all reports</li>
                    <li>• View booking analytics</li>
                    <li>• Monitor platform revenue</li>
                    <li>• Track CSAT & QA logs</li>
                  </ul>
                </div>
              </div>

              <div className="card bg-evera-card/40 border-evera-border p-4.5 flex flex-col justify-between hover:border-amber-500/30 hover:bg-amber-500/5 hover:-translate-y-1 transition-all duration-300 group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Key size={18} />
                  </div>
                  <h4 className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">5. Security & Permissions</h4>
                  <ul className="text-[10px] text-gray-400 space-y-1">
                    <li>• Manage global permissions</li>
                    <li>• Setup role limits</li>
                    <li>• Monitor access logs</li>
                    <li>• Secure user transaction data</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: ACCESS OVERVIEW FLOW */}
          <div className="card bg-evera-card/40 border-evera-border p-6 space-y-5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md text-[10px] font-black text-amber-400 uppercase tracking-widest">
                Access Overview Lifecycle
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="w-full p-4 bg-white/5 border border-white/5 rounded-xl hover:border-amber-500/30 transition-all text-center">
                <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto mb-2">
                  <Sliders size={14} />
                </div>
                <h5 className="text-xs font-extrabold text-white uppercase tracking-wider">Full System Access</h5>
                <p className="text-[10px] text-gray-400 mt-1">Unrestricted access to the entire platform database and settings.</p>
              </div>

              <div className="hidden md:block text-[#A8A29E]">→</div>

              <div className="w-full p-4 bg-white/5 border border-white/5 rounded-xl hover:border-amber-500/30 transition-all text-center">
                <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto mb-2">
                  <Users size={14} />
                </div>
                <h5 className="text-xs font-extrabold text-white uppercase tracking-wider">All Departments Access</h5>
                <p className="text-[10px] text-gray-400 mt-1">Access to Operations, Finance and Support departments.</p>
              </div>

              <div className="hidden md:block text-[#A8A29E]">→</div>

              <div className="w-full p-4 bg-white/5 border border-white/5 rounded-xl hover:border-amber-500/30 transition-all text-center">
                <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto mb-2">
                  <Briefcase size={14} />
                </div>
                <h5 className="text-xs font-extrabold text-white uppercase tracking-wider">All Modules Access</h5>
                <p className="text-[10px] text-gray-400 mt-1">Direct management access to all individual micro-modules.</p>
              </div>

              <div className="hidden md:block text-[#A8A29E]">→</div>

              <div className="w-full p-4 bg-white/5 border border-white/5 rounded-xl hover:border-amber-500/30 transition-all text-center">
                <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto mb-2">
                  <Database size={14} />
                </div>
                <h5 className="text-xs font-extrabold text-white uppercase tracking-wider">All Data & Reports Access</h5>
                <p className="text-[10px] text-gray-400 mt-1">Unrestricted visibility to all analytical summaries and logs.</p>
              </div>
            </div>
          </div>

          {/* SECTION 4: ACCESSIBLE MODULES GRID */}
          <div className="card bg-evera-card/40 border-evera-border p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-evera-border/60 pb-3">
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md text-[10px] font-black text-amber-400 uppercase tracking-widest">
                Accessible Modules
              </span>
              <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                <Sparkles size={11} className="animate-spin" /> Unrestricted Access
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { label: 'User Management', desc: 'Manage customers & accounts', color: 'text-purple-400', icon: Users },
                { label: 'Provider Management', desc: 'Verify and approve providers', color: 'text-emerald-400', icon: UserCheck },
                { label: 'Booking Management', desc: 'Manage all platform events', color: 'text-indigo-400', icon: Calendar },
                { label: 'Wallet & Payments', desc: 'Refunds, cards, bank payout model', color: 'text-sky-400', icon: Coins },
                { label: 'Finance Dashboard', desc: 'Deep financial metrics ledger', color: 'text-blue-400', icon: Landmark },
                { label: 'Support Dashboard', desc: 'Monitor tickets & active SLA', color: 'text-amber-400', icon: Headphones },
                { label: 'Reports & Analytics', desc: 'Financial, operational logs', color: 'text-teal-400', icon: BarChart3 },
                { label: 'Notifications System', desc: 'Manage push & alerts configs', color: 'text-pink-400', icon: Bell },
                { label: 'Settings & Permissions', desc: 'Configure system flags & parameters', color: 'text-red-400', icon: Sliders },
                { label: 'KYC Verification', desc: 'Manage document validations', color: 'text-orange-400', icon: ShieldCheck },
                { label: 'Service Management', desc: 'Manage services & categories', color: 'text-yellow-400', icon: Settings }
              ].map((m, idx) => (
                <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-amber-500/20 hover:bg-white/10 hover:shadow-lg transition-all duration-300">
                  <m.icon size={18} className={`${m.color} mb-2`} />
                  <h6 className="text-[11px] font-extrabold text-white truncate">{m.label}</h6>
                  <p className="text-[9px] text-[#A8A29E] mt-0.5 leading-normal">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: ACCESS HIERARCHY TREE */}
          <div className="card bg-evera-card/40 border-evera-border p-6 flex flex-col items-center">
            <div className="w-full flex items-center gap-2 mb-6">
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md text-[10px] font-black text-amber-400 uppercase tracking-widest">
                Department Access Hierarchy
              </span>
            </div>

            {/* Tree */}
            <div className="relative p-6 bg-black/20 rounded-2xl border border-evera-border/40 flex flex-col items-center w-full">
              {/* Root */}
              <div className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 border border-amber-400/40 text-center shadow-lg shadow-amber-950/20 z-10">
                <p className="text-[10px] font-black text-amber-950 uppercase tracking-widest flex items-center gap-1.5 justify-center">
                  <Crown size={12} />
                  SUPER ADMIN
                </p>
                <p className="text-[9px] font-bold text-amber-900">Complete Control & Access</p>
              </div>

              {/* Connector lines */}
              <div className="w-full h-12 relative">
                <svg className="w-full h-full absolute inset-0 pointer-events-none" style={{ minHeight: '48px' }}>
                  <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#38302C" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="16.6%" y1="50%" x2="83.3%" y2="50%" stroke="#38302C" strokeWidth="2" />
                  <line x1="16.6%" y1="50%" x2="16.6%" y2="100%" stroke="#38302C" strokeWidth="2" />
                  <line x1="83.3%" y1="50%" x2="83.3%" y2="100%" stroke="#38302C" strokeWidth="2" />
                </svg>
              </div>

              {/* Bottom Nodes */}
              <div className="grid grid-cols-3 gap-4 w-full z-10 relative">
                <div className="card bg-evera-card border-[#10b981]/10 p-3 text-center rounded-xl hover:border-[#10b981]/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mx-auto mb-2">
                    <Activity size={15} />
                  </div>
                  <h5 className="text-[10px] font-extrabold text-[#10b981] uppercase tracking-wider">Operations Department</h5>
                  <p className="text-[9px] text-[#A8A29E] mt-1">Manage operations and services</p>
                </div>

                <div className="card bg-evera-card border-[#3b82f6]/10 p-3 text-center rounded-xl hover:border-[#3b82f6]/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] flex items-center justify-center mx-auto mb-2 font-black text-xs">
                    ₹
                  </div>
                  <h5 className="text-[10px] font-extrabold text-[#3b82f6] uppercase tracking-wider">Finance Department</h5>
                  <p className="text-[9px] text-[#A8A29E] mt-1">Manage financial activities & reports</p>
                </div>

                <div className="card bg-evera-card border-[#f59e0b]/10 p-3 text-center rounded-xl hover:border-[#f59e0b]/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] flex items-center justify-center mx-auto mb-2">
                    <Headphones size={15} />
                  </div>
                  <h5 className="text-[10px] font-extrabold text-[#f59e0b] uppercase tracking-wider">Support Department</h5>
                  <p className="text-[9px] text-[#A8A29E] mt-1">Manage customer support & issue resolution</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   SUB-COMPONENT: OPERATIONS DEPARTMENT DETAIL SCREEN
   ============================================================================ */
const OperationsDeptDetail: React.FC<DepartmentDetailProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'workflow'>('matrix');

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* HEADER CONTROL */}
      <div className="flex items-center justify-between border-b border-evera-border/40 pb-5">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl bg-white/5 border border-evera-border text-evera-muted hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
            title="Back to Overview"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Activity size={20} className="text-[#10b981]" />
              Operations Department Dashboard
            </h2>
            <p className="text-xs text-[#A8A29E]">Handles all operational activities, provider lifecycles, and verification workflows.</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="bg-[#161210] border border-evera-border p-1 rounded-xl flex items-center gap-1 shadow-inner">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'matrix' 
                ? 'bg-[#10b981] text-white shadow-md' 
                : 'text-evera-muted hover:text-white'
            }`}
          >
            Role & Access Matrix
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'workflow' 
                ? 'bg-[#10b981] text-white shadow-md' 
                : 'text-evera-muted hover:text-white'
            }`}
          >
            Operations Workflow
          </button>
        </div>
      </div>

      {activeTab === 'matrix' ? (
        /* TAB 1: MATRIX */
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-12 gap-6">
            {/* Operations Manager */}
            <div className="col-span-12 lg:col-span-6 card bg-evera-card/40 border-[#10b981]/20 p-6 flex flex-col justify-between group hover:border-[#10b981]/50 transition-all duration-300">
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-[#064e3b] to-[#047857] rounded-2xl border border-[#10b981]/30 flex items-center gap-4.5 shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                    <UserCheck size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">Operations Manager</h3>
                    <p className="text-[10px] text-emerald-100 font-medium">Manages operations team and oversees all operational activities.</p>
                  </div>
                </div>

                {/* Responsibilities */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-[#10b981] uppercase tracking-widest">Responsibilities</h4>
                  <ul className="space-y-1.5">
                    {['Manage operational activities', 'Monitor provider verification process', 'Assign operational tasks', 'Track pending requests', 'Ensure smooth workflow and task completion'].map((item, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] mt-1.5 flex-shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Access */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-[#10b981] uppercase tracking-widest">Access</h4>
                  <ul className="space-y-1.5">
                    {['Full Operations Dashboard Control', 'Operations and Performance Reports', 'Staff Access Management', 'Service Provider Document Approvals', 'Internal Task Management', 'Workflow Process Monitoring'].map((item, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="text-[#10b981] mt-0.5 font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Restrictions */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-[#ef4444] uppercase tracking-widest">Restrictions</h4>
                  <ul className="space-y-1.5">
                    {['No Finance system access', 'No Support ticket management access', 'Cannot modify Super Admin settings', 'Cannot access Finance reports', 'Cannot view Support tickets'].map((item, idx) => (
                      <li key={idx} className="text-xs text-red-400 flex items-start gap-2">
                        <span className="text-[#ef4444] mt-0.5">✗</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Key access modules */}
              <div className="border-t border-evera-border/40 pt-5 mt-8 space-y-3">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Key Access Modules</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white flex items-center gap-1.5">
                    <Monitor size={12} className="text-[#10b981]" /> Operations Dashboard
                  </span>
                  <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white flex items-center gap-1.5">
                    <FileText size={12} className="text-[#10b981]" /> Operations Reports
                  </span>
                  <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white flex items-center gap-1.5">
                    <Users size={12} className="text-[#10b981]" /> Staff Management
                  </span>
                </div>
              </div>
            </div>

            {/* Operations Staff */}
            <div className="col-span-12 lg:col-span-6 card bg-evera-card/40 border-[#3b82f6]/20 p-6 flex flex-col justify-between group hover:border-[#3b82f6]/50 transition-all duration-300">
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-[#1e3a8a] to-[#1d4ed8] rounded-2xl border border-[#3b82f6]/30 flex items-center gap-4.5 shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                    <Users size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">Operations Staff</h3>
                    <p className="text-[10px] text-blue-100 font-medium">Executes assigned operational tasks and supports daily operations.</p>
                  </div>
                </div>

                {/* Responsibilities */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-[#3b82f6] uppercase tracking-widest">Responsibilities</h4>
                  <ul className="space-y-1.5">
                    {['Handle assigned operational tasks', 'Verify provider documents', 'Update workflow status', 'Provide reports and updates to manager', 'Follow operational procedures and guidelines'].map((item, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-1.5 flex-shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Access */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-[#3b82f6] uppercase tracking-widest">Access</h4>
                  <ul className="space-y-1.5">
                    {['Limited Operations Dashboard Access', 'Provider Document Verification center', 'Internal Task Action center', 'Read-only access to standard operational guidelines'].map((item, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="text-[#3b82f6] mt-0.5 font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Restrictions */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-[#ef4444] uppercase tracking-widest">Restrictions</h4>
                  <ul className="space-y-1.5">
                    {['Cannot access Finance systems', 'Cannot access Support tickets', 'Cannot modify system settings or users', 'Cannot manage administrative staff access', 'Limited to assigned operational tasks only'].map((item, idx) => (
                      <li key={idx} className="text-xs text-red-400 flex items-start gap-2">
                        <span className="text-[#ef4444] mt-0.5">✗</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Key access modules */}
              <div className="border-t border-evera-border/40 pt-5 mt-8 space-y-3">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Key Access Modules</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white flex items-center gap-1.5">
                    <Monitor size={12} className="text-[#3b82f6]" /> Dashboard (Limited)
                  </span>
                  <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white flex items-center gap-1.5">
                    <FileText size={12} className="text-[#3b82f6]" /> Document Verification
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Department Overview details */}
          <div className="card bg-evera-card/40 border-evera-border p-6">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 pb-2 border-b border-evera-border/60">
              Department Overview Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#10b981]/15 text-[#10b981] flex items-center justify-center mx-auto">
                  <Compass size={14} />
                </div>
                <p className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider">Focus</p>
                <p className="text-xs font-bold text-white">Financial Accuracy, Transparency & Growth</p>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#3b82f6]/15 text-[#3b82f6] flex items-center justify-center mx-auto">
                  <Users size={14} />
                </div>
                <p className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider">Team Structure</p>
                <p className="text-xs font-bold text-white">1 Manager, Multiple Finance Staff</p>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#a855f7]/15 text-[#a855f7] flex items-center justify-center mx-auto">
                  <Award size={14} />
                </div>
                <p className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider">Main Goal</p>
                <p className="text-xs font-bold text-white">Efficient Financial Management & Revenue Optimization</p>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#14b8a6]/15 text-[#14b8a6] flex items-center justify-center mx-auto">
                  <ShieldCheck size={14} />
                </div>
                <p className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider">Compliance</p>
                <p className="text-xs font-bold text-white">Ensure policy compliance & secure transactions</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: WORKFLOW */
        <div className="space-y-6 animate-fade-in">
          <div className="card bg-evera-card/40 border-evera-border p-6 relative overflow-hidden">
            <div className="text-center max-w-lg mx-auto mb-8">
              <span className="px-3 py-1 bg-[#1e1b4b] border border-[#312e81] rounded-md text-[10px] font-black text-purple-300 uppercase tracking-widest">
                OPERATIONS WORKFLOW STRUCTURE
              </span>
              <p className="text-[11px] text-[#A8A29E] mt-2 leading-relaxed">
                Provider request to final approval process managed by Operations Department
              </p>
            </div>

            {/* WORKFLOW TIMELINE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
              {/* Step 1 */}
              <div className="card bg-evera-card border-[#3b82f6]/25 p-5 relative overflow-hidden group hover:border-[#3b82f6] transition-all duration-300">
                <div className="absolute top-3 right-4 text-2xl font-black text-white/5 group-hover:text-[#3b82f6]/10 transition-colors">01</div>
                <div className="flex items-center gap-3 mb-4 border-b border-evera-border pb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/10 text-[#3b82f6] flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">01. Provider Request</h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-400 mt-1 inline-block">STATUS: PENDING</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed mb-4">
                  Provider submits a request to join the platform or update their active operational information.
                </p>
                <div className="space-y-3 pt-3 border-t border-evera-border/40">
                  <div>
                    <span className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider block">Handled By</span>
                    <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                      <Users size={12} className="text-[#3b82f6]" /> Provider
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider block">Key Actions</span>
                    <ul className="text-[10px] text-gray-400 space-y-1 mt-1">
                      <li>• Submit provider documents</li>
                      <li>• Provide business information</li>
                      <li>• Accept platform terms & conditions</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="card bg-evera-card border-[#10b981]/25 p-5 relative overflow-hidden group hover:border-[#10b981] transition-all duration-300">
                <div className="absolute top-3 right-4 text-2xl font-black text-white/5 group-hover:text-[#10b981]/10 transition-colors">02</div>
                <div className="flex items-center gap-3 mb-4 border-b border-evera-border pb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">02. Staff Verification</h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-yellow-900/40 text-yellow-400 mt-1 inline-block">STATUS: UNDER REVIEW</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed mb-4">
                  Operations Staff verifies the submitted provider documents, registration information, and policy compliance.
                </p>
                <div className="space-y-3 pt-3 border-t border-evera-border/40">
                  <div>
                    <span className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider block">Handled By</span>
                    <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                      <Users size={12} className="text-[#10b981]" /> Operations Staff
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider block">Key Actions</span>
                    <ul className="text-[10px] text-gray-400 space-y-1 mt-1">
                      <li>• Verify documents & validity</li>
                      <li>• Check compliance & credentials</li>
                      <li>• Update verification report logs</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="card bg-evera-card border-[#a855f7]/25 p-5 relative overflow-hidden group hover:border-[#a855f7] transition-all duration-300">
                <div className="absolute top-3 right-4 text-2xl font-black text-white/5 group-hover:text-[#a855f7]/10 transition-colors">03</div>
                <div className="flex items-center gap-3 mb-4 border-b border-evera-border pb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#a855f7]/10 text-[#a855f7] flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">03. Manager Approval</h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-400 mt-1 inline-block">APPROVED / REJECTED</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed mb-4">
                  Operations Manager reviews the staff verification report, coordinates validation and finalizes decision.
                </p>
                <div className="space-y-3 pt-3 border-t border-evera-border/40">
                  <div>
                    <span className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider block">Handled By</span>
                    <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                      <Users size={12} className="text-[#a855f7]" /> Operations Manager
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider block">Key Actions</span>
                    <ul className="text-[10px] text-gray-400 space-y-1 mt-1">
                      <li>• Review verification reports</li>
                      <li>• Approve/Reject registration application</li>
                      <li>• Add system notes & close ticket</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: Workflow timeline summary */}
            <div className="border-t border-evera-border/60 pt-6 mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Workflow Summary</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-white bg-white/5 border border-white/5 px-2 py-1 rounded">01 Provider Request</span>
                  <span className="text-[#A8A29E]">→</span>
                  <span className="text-[10px] font-bold text-white bg-white/5 border border-white/5 px-2 py-1 rounded">02 Staff Verification</span>
                  <span className="text-[#A8A29E]">→</span>
                  <span className="text-[10px] font-bold text-white bg-white/5 border border-white/5 px-2 py-1 rounded">03 Manager Approval</span>
                  <span className="text-[#A8A29E]">→</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-1 rounded flex items-center gap-1">
                    <CheckCircle2 size={10} /> Process Completed
                  </span>
                </div>
              </div>

              {/* Outcomes Box */}
              <div className="p-3 bg-black/35 border border-evera-border rounded-xl flex items-center gap-4.5">
                <span className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider">Possible Outcomes</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
                    <span className="text-[10px] text-white font-medium">Approved → Provider Activated</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#ef4444]"></div>
                    <span className="text-[10px] text-white font-medium">Rejected → Request Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   SUB-COMPONENT: FINANCE DEPARTMENT DETAIL SCREEN
   ============================================================================ */
const FinanceDeptDetail: React.FC<DepartmentDetailProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'workflow'>('matrix');

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* HEADER CONTROL */}
      <div className="flex items-center justify-between border-b border-evera-border/40 pb-5">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl bg-white/5 border border-evera-border text-evera-muted hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
            title="Back to Overview"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <span className="text-lg font-black text-[#3b82f6] px-1 bg-[#3b82f6]/10 rounded-lg">₹</span>
              Finance Department Dashboard
            </h2>
            <p className="text-xs text-[#A8A29E]">Manages all financial activities, transactions, commissions, invoicing, and revenue reconciliation.</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="bg-[#161210] border border-evera-border p-1 rounded-xl flex items-center gap-1 shadow-inner">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'matrix' 
                ? 'bg-[#3b82f6] text-white shadow-md' 
                : 'text-evera-muted hover:text-white'
            }`}
          >
            Role & Access Matrix
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'workflow' 
                ? 'bg-[#3b82f6] text-white shadow-md' 
                : 'text-evera-muted hover:text-white'
            }`}
          >
            Finance Workflow
          </button>
        </div>
      </div>

      {activeTab === 'matrix' ? (
        /* TAB 1: MATRIX */
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-12 gap-6">
            {/* Finance Manager */}
            <div className="col-span-12 lg:col-span-6 card bg-evera-card/40 border-[#3b82f6]/20 p-6 flex flex-col justify-between group hover:border-[#3b82f6]/50 transition-all duration-300">
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-[#1e3a8a] to-[#1d4ed8] rounded-2xl border border-[#3b82f6]/30 flex items-center gap-4.5 shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 font-black text-xl text-white">
                    ₹
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">Finance Manager</h3>
                    <p className="text-[10px] text-blue-100 font-medium">Oversees financial operations and manages the finance team.</p>
                  </div>
                </div>

                {/* Responsibilities */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-[#3b82f6] uppercase tracking-widest">Responsibilities</h4>
                  <ul className="space-y-1.5">
                    {['Monitor all platform financial transactions', 'Handle refund authorizations and dispute resolutions', 'Track revenue ledgers and generate financial reports', 'Manage administrative payment workflows', 'Ensure tax compliance and system financial accuracy'].map((item, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-1.5 flex-shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Access */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-[#3b82f6] uppercase tracking-widest">Access</h4>
                  <ul className="space-y-1.5">
                    {['Full Finance Dashboard Access', 'Global Financial and Revenue Reports', 'Finance Staff Management parameters', 'Payment and Settlement workflow tools', 'Active Transaction Monitoring systems', 'Refund Authorization Management console'].map((item, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="text-[#3b82f6] mt-0.5 font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Restrictions */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-[#ef4444] uppercase tracking-widest">Restrictions</h4>
                  <ul className="space-y-1.5">
                    {['No Operations department management access', 'No Support department ticket reply access', 'Cannot modify system configuration parameters', 'Cannot access Operations logs', 'Cannot access Support tickets'].map((item, idx) => (
                      <li key={idx} className="text-xs text-red-400 flex items-start gap-2">
                        <span className="text-[#ef4444] mt-0.5">✗</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Key Access Modules */}
              <div className="border-t border-evera-border/40 pt-5 mt-8 space-y-3">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Key Access Modules</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white flex items-center gap-1.5">
                    <Monitor size={12} className="text-[#3b82f6]" /> Finance Dashboard
                  </span>
                  <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white flex items-center gap-1.5">
                    <FileText size={12} className="text-[#3b82f6]" /> Financial Reports
                  </span>
                  <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white flex items-center gap-1.5">
                    <Users size={12} className="text-[#3b82f6]" /> Finance Staff
                  </span>
                </div>
              </div>
            </div>

            {/* Finance Staff */}
            <div className="col-span-12 lg:col-span-6 card bg-evera-card/40 border-[#10b981]/20 p-6 flex flex-col justify-between group hover:border-[#10b981]/50 transition-all duration-300">
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-[#064e3b] to-[#047857] rounded-2xl border border-[#10b981]/30 flex items-center gap-4.5 shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                    <Users size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">Finance Staff</h3>
                    <p className="text-[10px] text-emerald-100 font-medium">Handles day-to-day financial tasks and supports finance operations.</p>
                  </div>
                </div>

                {/* Responsibilities */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-[#10b981] uppercase tracking-widest">Responsibilities</h4>
                  <ul className="space-y-1.5">
                    {['Process payments and vendor settlements', 'Verify and validate customer/vendor invoices', 'Monitor daily transaction logs for anomalies', 'Update payment workflows status in database', 'Maintain accurate system financial logs and receipts'].map((item, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] mt-1.5 flex-shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Access */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-[#10b981] uppercase tracking-widest">Access</h4>
                  <ul className="space-y-1.5">
                    {['Limited Finance Dashboard Access', 'View and Process daily payments and payouts', 'Verify Invoices and settlement data', 'Monitor real-time system Transactions', 'Download Financial Reports (Limited parameters)'].map((item, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="text-[#10b981] mt-0.5 font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Restrictions */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-[#ef4444] uppercase tracking-widest">Restrictions</h4>
                  <ul className="space-y-1.5">
                    {['Cannot access Operations department logs', 'Cannot access Support department panels', 'Cannot create users in administrative directories', 'Cannot manage administrative finance staff access', 'Limited to assigned financial tasks only'].map((item, idx) => (
                      <li key={idx} className="text-xs text-red-400 flex items-start gap-2">
                        <span className="text-[#ef4444] mt-0.5">✗</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Key Access Modules */}
              <div className="border-t border-evera-border/40 pt-5 mt-8 space-y-3">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Key Access Modules</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white flex items-center gap-1.5">
                    <Monitor size={12} className="text-[#10b981]" /> Dashboard (Limited)
                  </span>
                  <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white flex items-center gap-1.5">
                    <DollarSign size={12} className="text-[#10b981]" /> Process Payments
                  </span>
                  <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white flex items-center gap-1.5">
                    <FileText size={12} className="text-[#10b981]" /> Verify Invoices
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Department Overview details */}
          <div className="card bg-evera-card/40 border-evera-border p-6">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 pb-2 border-b border-evera-border/60">
              Department Overview Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#10b981]/15 text-[#10b981] flex items-center justify-center mx-auto">
                  <Compass size={14} />
                </div>
                <p className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider">Focus</p>
                <p className="text-xs font-bold text-white">Financial Accuracy, Transparency & Growth</p>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#3b82f6]/15 text-[#3b82f6] flex items-center justify-center mx-auto">
                  <Users size={14} />
                </div>
                <p className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider">Team Structure</p>
                <p className="text-xs font-bold text-white">1 Manager, Multiple Finance Staff</p>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#a855f7]/15 text-[#a855f7] flex items-center justify-center mx-auto">
                  <Award size={14} />
                </div>
                <p className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider">Main Goal</p>
                <p className="text-xs font-bold text-white">Efficient Financial Management & Revenue Optimization</p>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#14b8a6]/15 text-[#14b8a6] flex items-center justify-center mx-auto">
                  <ShieldCheck size={14} />
                </div>
                <p className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider">Compliance</p>
                <p className="text-xs font-bold text-white">Ensure policy compliance & secure transactions</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: WORKFLOW */
        <div className="space-y-6 animate-fade-in">
          <div className="card bg-evera-card/40 border-evera-border p-6 relative overflow-hidden">
            <div className="text-center max-w-lg mx-auto mb-8">
              <span className="px-3 py-1 bg-[#1e1b4b] border border-[#312e81] rounded-md text-[10px] font-black text-purple-300 uppercase tracking-widest">
                FINANCE WORKFLOW STRUCTURE
              </span>
              <p className="text-[11px] text-[#A8A29E] mt-2 leading-relaxed">
                Payment request to final approval process managed by Finance Department
              </p>
            </div>

            {/* WORKFLOW TIMELINE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
              {/* Step 1 */}
              <div className="card bg-evera-card border-[#3b82f6]/25 p-5 relative overflow-hidden group hover:border-[#3b82f6] transition-all duration-300">
                <div className="absolute top-3 right-4 text-2xl font-black text-white/5 group-hover:text-[#3b82f6]/10 transition-colors">01</div>
                <div className="flex items-center gap-3 mb-4 border-b border-evera-border pb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/10 text-[#3b82f6] flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">01. Payment Request</h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-400 mt-1 inline-block">STATUS: PENDING</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed mb-4">
                  User/vendor raises a payment request for platform services rendered or active vendor account settlements.
                </p>
                <div className="space-y-3 pt-3 border-t border-evera-border/40">
                  <div>
                    <span className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider block">Initiated By</span>
                    <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                      <Users size={12} className="text-[#3b82f6]" /> User / Vendor / System
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider block">Key Actions</span>
                    <ul className="text-[10px] text-gray-400 space-y-1 mt-1">
                      <li>• Submit payment request</li>
                      <li>• Attach invoices / documents</li>
                      <li>• Provide payment details</li>
                      <li>• Await finance review</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="card bg-evera-card border-[#10b981]/25 p-5 relative overflow-hidden group hover:border-[#10b981] transition-all duration-300">
                <div className="absolute top-3 right-4 text-2xl font-black text-white/5 group-hover:text-[#10b981]/10 transition-colors">02</div>
                <div className="flex items-center gap-3 mb-4 border-b border-evera-border pb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">02. Finance Staff Review</h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-yellow-900/40 text-yellow-400 mt-1 inline-block">STATUS: UNDER REVIEW</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed mb-4">
                  Finance Staff reviews the raised request, verifies all attached documents and validates transaction details.
                </p>
                <div className="space-y-3 pt-3 border-t border-evera-border/40">
                  <div>
                    <span className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider block">Handled By</span>
                    <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                      <Users size={12} className="text-[#10b981]" /> Finance Staff
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider block">Key Actions</span>
                    <ul className="text-[10px] text-gray-400 space-y-1 mt-1">
                      <li>• Verify invoices & documents</li>
                      <li>• Check payment credentials</li>
                      <li>• Validate compliance & policies</li>
                      <li>• Update review status and notes</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="card bg-evera-card border-[#a855f7]/25 p-5 relative overflow-hidden group hover:border-[#a855f7] transition-all duration-300">
                <div className="absolute top-3 right-4 text-2xl font-black text-white/5 group-hover:text-[#a855f7]/10 transition-colors">03</div>
                <div className="flex items-center gap-3 mb-4 border-b border-evera-border pb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#a855f7]/10 text-[#a855f7] flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">03. Manager Approval</h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-400 mt-1 inline-block">APPROVED / REJECTED</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed mb-4">
                  Finance Manager reviews the verification report and staff remarks, authorizing or rejecting the payout.
                </p>
                <div className="space-y-3 pt-3 border-t border-evera-border/40">
                  <div>
                    <span className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider block">Handled By</span>
                    <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                      <Users size={12} className="text-[#a855f7]" /> Finance Manager
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider block">Key Actions</span>
                    <ul className="text-[10px] text-gray-400 space-y-1 mt-1">
                      <li>• Review staff remarks</li>
                      <li>• Approve or reject payment</li>
                      <li>• Add comments (if any)</li>
                      <li>• Final decision & status update</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: Workflow timeline summary */}
            <div className="border-t border-evera-border/60 pt-6 mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Workflow Summary</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-white bg-white/5 border border-white/5 px-2 py-1 rounded">01 Payment Request</span>
                  <span className="text-[#A8A29E]">→</span>
                  <span className="text-[10px] font-bold text-white bg-white/5 border border-white/5 px-2 py-1 rounded">02 Finance Staff Review</span>
                  <span className="text-[#A8A29E]">→</span>
                  <span className="text-[10px] font-bold text-white bg-white/5 border border-white/5 px-2 py-1 rounded">03 Manager Approval</span>
                  <span className="text-[#A8A29E]">→</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-1 rounded flex items-center gap-1">
                    <CheckCircle2 size={10} /> Process Completed
                  </span>
                </div>
              </div>

              {/* Outcomes Box */}
              <div className="p-3 bg-black/35 border border-evera-border rounded-xl flex items-center gap-4.5">
                <span className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider">Possible Outcomes</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
                    <span className="text-[10px] text-white font-medium">Approved → Payment Processed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#ef4444]"></div>
                    <span className="text-[10px] text-white font-medium">Rejected → Request Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   SUB-COMPONENT: SUPPORT DEPARTMENT DETAIL SCREEN
   ============================================================================ */
const SupportDeptDetail: React.FC<DepartmentDetailProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'workflow'>('matrix');

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* HEADER CONTROL */}
      <div className="flex items-center justify-between border-b border-evera-border/40 pb-5">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl bg-white/5 border border-evera-border text-evera-muted hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
            title="Back to Overview"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Headphones size={20} className="text-[#f59e0b]" />
              Support Department Dashboard
            </h2>
            <p className="text-xs text-[#A8A29E]">Ensures excellent customer support, handles user issues, manages agent SLA, and ticket moderation.</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="bg-[#161210] border border-evera-border p-1 rounded-xl flex items-center gap-1 shadow-inner">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'matrix' 
                ? 'bg-[#f59e0b] text-white shadow-md' 
                : 'text-evera-muted hover:text-white'
            }`}
          >
            Role & Access Matrix
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'workflow' 
                ? 'bg-[#f59e0b] text-white shadow-md' 
                : 'text-evera-muted hover:text-white'
            }`}
          >
            Support Workflow
          </button>
        </div>
      </div>

      {activeTab === 'matrix' ? (
        /* TAB 1: MATRIX */
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-12 gap-6">
            {/* Super Support */}
            <div className="col-span-12 lg:col-span-6 card bg-evera-card/40 border-[#f59e0b]/20 p-6 flex flex-col justify-between group hover:border-[#f59e0b]/50 transition-all duration-300">
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-[#7c2d12] to-[#c2410c] rounded-2xl border border-[#f59e0b]/30 flex items-center gap-4.5 shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                    <Star size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">Super Support</h3>
                    <p className="text-[10px] text-orange-100 font-medium">Manages the support team and handles escalated tickets.</p>
                  </div>
                </div>

                {/* Responsibilities */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-[#f59e0b] uppercase tracking-widest">Responsibilities</h4>
                  <ul className="space-y-1.5">
                    {['Manage support team shift and workload', 'Handle escalated support tickets and disputes', 'Monitor customer complaints logs', 'Track support performance metrics', 'Ensure SLA and QA standards guidelines are met'].map((item, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] mt-1.5 flex-shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Access */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-[#f59e0b] uppercase tracking-widest">Access</h4>
                  <ul className="space-y-1.5">
                    {['Full Support Dashboard Access', 'Ticket Management center (Read/Write)', 'Support Analytics & Performance Reports', 'Customer Complaints logs', 'Knowledge Base creation and editing', 'Support Staff Management console'].map((item, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="text-[#f59e0b] mt-0.5 font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Restrictions */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-[#ef4444] uppercase tracking-widest">Restrictions</h4>
                  <ul className="space-y-1.5">
                    {['No Finance system access', 'No Operations department parameters access', 'Cannot modify Super Admin settings', 'Cannot access financial reports', 'Cannot manage administrative parameters outside support'].map((item, idx) => (
                      <li key={idx} className="text-xs text-red-400 flex items-start gap-2">
                        <span className="text-[#ef4444] mt-0.5">✗</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Key Access Modules */}
              <div className="border-t border-evera-border/40 pt-5 mt-8 space-y-3">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Super Support Access Modules</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white flex items-center gap-1.5">
                    <Monitor size={12} className="text-[#f59e0b]" /> Support Dashboard
                  </span>
                  <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white flex items-center gap-1.5">
                    <FileText size={12} className="text-[#f59e0b]" /> Ticket Management
                  </span>
                  <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white flex items-center gap-1.5">
                    <TrendingUp size={12} className="text-[#f59e0b]" /> Support Analytics
                  </span>
                </div>
              </div>
            </div>

            {/* Support Persons */}
            <div className="col-span-12 lg:col-span-6 card bg-evera-card/40 border-[#3b82f6]/20 p-6 flex flex-col justify-between group hover:border-[#3b82f6]/50 transition-all duration-300">
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-[#1e3a8a] to-[#1d4ed8] rounded-2xl border border-[#3b82f6]/30 flex items-center gap-4.5 shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                    <Headphones size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">Support Persons</h3>
                    <p className="text-[10px] text-blue-100 font-medium">Handles customer queries and provides first-line support.</p>
                  </div>
                </div>

                {/* Responsibilities */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-[#3b82f6] uppercase tracking-widest">Responsibilities</h4>
                  <ul className="space-y-1.5">
                    {['Handle incoming customer support tickets', 'Resolve basic customer account issues', 'Provide accurate solutions in chats', 'Escalate complex problems to Super Support', 'Update ticket status and log comments'].map((item, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-1.5 flex-shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Access */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-[#3b82f6] uppercase tracking-widest">Access</h4>
                  <ul className="space-y-1.5">
                    {['Limited Support Dashboard Access', 'Assigned Ticket Management console', 'Customer Communication chat dashboard', 'Knowledge Base (Read-only view)', 'Ticket History list (Own Tickets only)'].map((item, idx) => (
                      <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="text-[#3b82f6] mt-0.5 font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Restrictions */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-[#ef4444] uppercase tracking-widest">Restrictions</h4>
                  <ul className="space-y-1.5">
                    {['Cannot access Finance modules', 'Cannot access Operations panels', 'Cannot create users in administrative databases', 'Cannot manage support staff access', 'Limited to assigned tickets only'].map((item, idx) => (
                      <li key={idx} className="text-xs text-red-400 flex items-start gap-2">
                        <span className="text-[#ef4444] mt-0.5">✗</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Key Access Modules */}
              <div className="border-t border-evera-border/40 pt-5 mt-8 space-y-3">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Support Persons Access Modules</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white flex items-center gap-1.5">
                    <Monitor size={12} className="text-[#3b82f6]" /> Dashboard (Limited)
                  </span>
                  <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white flex items-center gap-1.5">
                    <FileText size={12} className="text-[#3b82f6]" /> My Tickets
                  </span>
                  <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-white flex items-center gap-1.5">
                    <MessageSquare size={12} className="text-[#3b82f6]" /> Communication
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Department Overview details */}
          <div className="card bg-evera-card/40 border-evera-border p-6">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 pb-2 border-b border-evera-border/60">
              Department Overview Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#f59e0b]/15 text-[#f59e0b] flex items-center justify-center mx-auto">
                  <Compass size={14} />
                </div>
                <p className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider">Focus</p>
                <p className="text-xs font-bold text-white">Customer Satisfaction & Effective Issue Resolution</p>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#3b82f6]/15 text-[#3b82f6] flex items-center justify-center mx-auto">
                  <Users size={14} />
                </div>
                <p className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider">Team Structure</p>
                <p className="text-xs font-bold text-white">1 Super Support, Multiple Support Persons</p>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#a855f7]/15 text-[#a855f7] flex items-center justify-center mx-auto">
                  <Award size={14} />
                </div>
                <p className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider">Main Goal</p>
                <p className="text-xs font-bold text-white">Fast Resolution, Happy Customers, High Quality</p>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#10b981]/15 text-[#10b981] flex items-center justify-center mx-auto">
                  <TrendingUp size={14} />
                </div>
                <p className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider">Performance Tracking</p>
                <p className="text-xs font-bold text-white">Track Tickets, Response Time, Resolution Rate, CSAT</p>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#14b8a6]/15 text-[#14b8a6] flex items-center justify-center mx-auto">
                  <ShieldCheck size={14} />
                </div>
                <p className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider">Quality Assurance</p>
                <p className="text-xs font-bold text-white">Ensure Quality Support, SLA Compliance & Training</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: WORKFLOW */
        <div className="space-y-6 animate-fade-in">
          <div className="card bg-evera-card/40 border-evera-border p-6 relative overflow-hidden">
            <div className="text-center max-w-lg mx-auto mb-8">
              <span className="px-3 py-1 bg-[#1e1b4b] border border-[#312e81] rounded-md text-[10px] font-black text-purple-300 uppercase tracking-widest">
                SUPPORT WORKFLOW STRUCTURE
              </span>
              <p className="text-[11px] text-[#A8A29E] mt-2 leading-relaxed">
                Customer support request handling process managed by Support Department
              </p>
            </div>

            {/* WORKFLOW TIMELINE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
              {/* Step 1 */}
              <div className="card bg-evera-card border-[#3b82f6]/25 p-5 relative overflow-hidden group hover:border-[#3b82f6] transition-all duration-300">
                <div className="absolute top-3 right-4 text-2xl font-black text-white/5 group-hover:text-[#3b82f6]/10 transition-colors">01</div>
                <div className="flex items-center gap-3 mb-4 border-b border-evera-border pb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/10 text-[#3b82f6] flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">01. Customer Ticket</h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-400 mt-1 inline-block">STATUS: OPEN</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed mb-4">
                  Customer raises a support ticket for a platform issue or general inquiry.
                </p>
                <div className="space-y-3 pt-3 border-t border-evera-border/40">
                  <div>
                    <span className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider block">Initiated By</span>
                    <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                      <Users size={12} className="text-[#3b82f6]" /> Customer / User
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider block">Key Actions</span>
                    <ul className="text-[10px] text-gray-400 space-y-1 mt-1">
                      <li>• Submit support ticket</li>
                      <li>• Select category and priority</li>
                      <li>• Provide details & attachments</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="card bg-evera-card border-[#10b981]/25 p-5 relative overflow-hidden group hover:border-[#10b981] transition-all duration-300">
                <div className="absolute top-3 right-4 text-2xl font-black text-white/5 group-hover:text-[#10b981]/10 transition-colors">02</div>
                <div className="flex items-center gap-3 mb-4 border-b border-evera-border pb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">02. Support Response</h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-yellow-900/40 text-yellow-400 mt-1 inline-block">STATUS: IN PROGRESS</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed mb-4">
                  Support Person reviews the ticket, communicates with the customer, and provides a solution or resolution.
                </p>
                <div className="space-y-3 pt-3 border-t border-evera-border/40">
                  <div>
                    <span className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider block">Handled By</span>
                    <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                      <Users size={12} className="text-[#10b981]" /> Support Person
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider block">Key Actions</span>
                    <ul className="text-[10px] text-gray-400 space-y-1 mt-1">
                      <li>• Review ticket details</li>
                      <li>• Communicate with customer</li>
                      <li>• Provide solution or resolution</li>
                      <li>• Escalate if issue is complex</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="card bg-evera-card border-[#a855f7]/25 p-5 relative overflow-hidden group hover:border-[#a855f7] transition-all duration-300">
                <div className="absolute top-3 right-4 text-2xl font-black text-white/5 group-hover:text-[#a855f7]/10 transition-colors">03</div>
                <div className="flex items-center gap-3 mb-4 border-b border-evera-border pb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#a855f7]/10 text-[#a855f7] flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">03. Support Escalation</h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-400 mt-1 inline-block">STATUS: ESCALATED</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed mb-4">
                  Super Support reviews the escalated ticket details, conducts research and resolves complex platform issues.
                </p>
                <div className="space-y-3 pt-3 border-t border-evera-border/40">
                  <div>
                    <span className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider block">Handled By</span>
                    <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                      <Users size={12} className="text-[#a855f7]" /> Super Support
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider block">Key Actions</span>
                    <ul className="text-[10px] text-gray-400 space-y-1 mt-1">
                      <li>• Review escalated ticket data</li>
                      <li>• Analyze & investigate root issue</li>
                      <li>• Provide final system resolution</li>
                      <li>• Update ticket status and notes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: Workflow timeline summary */}
            <div className="border-t border-evera-border/60 pt-6 mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Workflow Summary</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-white bg-white/5 border border-white/5 px-2 py-1 rounded">01 Customer Ticket</span>
                  <span className="text-[#A8A29E]">→</span>
                  <span className="text-[10px] font-bold text-white bg-white/5 border border-white/5 px-2 py-1 rounded">02 Support Person Response</span>
                  <span className="text-[#A8A29E]">→</span>
                  <span className="text-[10px] font-bold text-white bg-white/5 border border-white/5 px-2 py-1 rounded">03 Support Escalation</span>
                  <span className="text-[#A8A29E]">→</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-1 rounded flex items-center gap-1">
                    <CheckCircle2 size={10} /> Ticket Resolved (Closed)
                  </span>
                </div>
              </div>

              {/* Outcomes Box */}
              <div className="p-3 bg-black/35 border border-evera-border rounded-xl flex items-center gap-4.5">
                <span className="text-[9px] font-extrabold text-[#A8A29E] uppercase tracking-wider">Possible Outcomes</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
                    <span className="text-[10px] text-white font-medium">Resolved → Ticket Closed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#a855f7]"></div>
                    <span className="text-[10px] text-white font-medium">Escalated → Issue Resolved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
