import React from 'react';
import { useApp } from '../context/AppContext';
import { AdminRole } from '../types';
import { Icons } from './ui/Icons';
import { PermissionManager } from '../utils/permissions';

interface SidebarProps {
  currentScreen: string;
  setScreen: (screen: string) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Navigation: React.FC<SidebarProps> = ({ currentScreen, setScreen, mobileOpen, setMobileOpen }) => {
  const { adminUser, logout } = useApp();

  // If no user, show nothing or skeleton
  if (!adminUser) return null;

  const accessibleRoutes = PermissionManager.getAccessibleRoutes(adminUser.role);

  const LINKS = [
    // Common / Dashboard
    { id: 'dashboard', icon: Icons.Dashboard, label: 'Dashboard', roles: [] },

    // Operations
    { id: 'bookings', icon: Icons.Calendar, label: 'Bookings', roles: [AdminRole.SUPER_ADMIN, AdminRole.OPERATIONS_ADMIN] },
    { id: 'disputes', icon: Icons.AlertTriangle, label: 'Disputes', roles: [AdminRole.SUPER_ADMIN, AdminRole.OPERATIONS_ADMIN] },
    { id: 'vendors', icon: Icons.Briefcase, label: 'Vendors', roles: [AdminRole.SUPER_ADMIN, AdminRole.OPERATIONS_ADMIN, AdminRole.SUPPORT_ADMIN, AdminRole.OPERATIONS_WORKER] },
    { id: 'people', icon: Icons.Users, label: 'Operations Team', roles: [AdminRole.OPERATIONS_ADMIN, AdminRole.OPERATIONS_WORKER] },


    // Finance
    { id: 'payments', icon: Icons.Dollar, label: 'Payments', roles: [AdminRole.SUPER_ADMIN, AdminRole.FINANCE_ADMIN] },
    { id: 'settlements', icon: Icons.Check, label: 'Settlements', roles: [AdminRole.SUPER_ADMIN, AdminRole.FINANCE_ADMIN] },
    { id: 'withdrawals', icon: Icons.Upload, label: 'Withdrawals', roles: [AdminRole.SUPER_ADMIN, AdminRole.FINANCE_ADMIN] },
    { id: 'invoices', icon: Icons.FileText, label: 'Invoices', roles: [AdminRole.SUPER_ADMIN, AdminRole.FINANCE_ADMIN] },
    { id: 'reconciliation', icon: Icons.Filter, label: 'Reconciliation', roles: [AdminRole.SUPER_ADMIN, AdminRole.FINANCE_ADMIN] },

    // Support
    { id: 'users', icon: Icons.Users, label: 'Users', roles: [AdminRole.SUPER_ADMIN, AdminRole.SUPPORT_ADMIN, AdminRole.SUPPORT_WORKER, AdminRole.OPERATIONS_ADMIN, AdminRole.FINANCE_ADMIN] },
    { id: 'tickets', icon: Icons.Ticket, label: 'Tickets', roles: [AdminRole.SUPER_ADMIN, AdminRole.SUPPORT_ADMIN, AdminRole.SUPPORT_WORKER, AdminRole.OPERATIONS_ADMIN, AdminRole.FINANCE_ADMIN, AdminRole.OPERATIONS_WORKER] },
    { id: 'conversations', icon: Icons.Chat, label: 'Conversations', roles: [AdminRole.SUPER_ADMIN, AdminRole.SUPPORT_ADMIN, AdminRole.SUPPORT_WORKER] },
    { id: 'support-workers', icon: Icons.ShieldCheck, label: adminUser.role === AdminRole.OPERATIONS_ADMIN ? 'Operations Team' : 'Support Workers', roles: [AdminRole.SUPER_ADMIN, AdminRole.SUPPORT_ADMIN, AdminRole.OPERATIONS_ADMIN] },
    { id: 'support-reports', icon: Icons.Analytics, label: 'Support Reports', roles: [AdminRole.SUPER_ADMIN, AdminRole.SUPPORT_ADMIN] },

    // Super Admin
    { id: 'admins', icon: Icons.Settings, label: 'Admins', roles: [AdminRole.SUPER_ADMIN] },
    { id: 'audit-logs', icon: Icons.More, label: 'Audit Logs', roles: [AdminRole.SUPER_ADMIN] },
    { id: 'settings', icon: Icons.Settings, label: 'Settings', roles: [AdminRole.SUPER_ADMIN] },

    // Analytics (Shared but possibly different views)
    { id: 'analytics', icon: Icons.Analytics, label: adminUser.role === AdminRole.SUPPORT_ADMIN ? 'Support Analytics' : 'Analytics', roles: [AdminRole.SUPER_ADMIN, AdminRole.OPERATIONS_ADMIN, AdminRole.FINANCE_ADMIN, AdminRole.SUPPORT_ADMIN] },
  ];

  // Filter links based on Role + Explicit Route Access
  const visibleLinks = LINKS.filter(link => {
    // 1. Check if role is allowed for this link item (UI logic)
    const roleAllowed = link.roles.length === 0 || link.roles.includes(adminUser.role);
    // 2. Check if route is accessible (Business Logic)
    const routeAllowed = accessibleRoutes.includes(link.id);

    return roleAllowed && routeAllowed;
  });

  const initials = adminUser.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <Icons.Briefcase size={24} className="text-evera-primary" />
        <span>Admin Panel</span>
      </div>

      <div className="sidebar-nav no-scrollbar">
        {visibleLinks.map(link => {
          const isActive = currentScreen === link.id;
          const Icon = link.icon;

          return (
            <button
              key={link.id}
              onClick={() => setScreen(link.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{link.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
          {adminUser.avatar ? (
            <img src={adminUser.avatar} alt={adminUser.name} className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-evera-primary flex items-center justify-center text-white font-bold text-xs">
              {initials}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{adminUser.name}</p>
            <p className="text-[10px] text-gray-400 truncate uppercase tracking-wider">
              {adminUser.role.replace('_', ' ')}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 bg-transparent hover:bg-red-500/10 text-[#A8A29E] hover:text-red-400 rounded-xl transition-all text-sm font-semibold border border-transparent hover:border-red-500/20"
        >
          <Icons.Reject size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};