import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Navigation } from './components/Sidebar';
import { Icons } from './components/ui/Icons';
import { PermissionGuard } from './components/ui/PermissionGuard';
import { Login } from './components/Login';

// Core
import { Dashboard } from './components/Dashboard';

// Operations
import { DisputeResolution } from './components/operations/DisputeResolution';
import { VendorPerformance } from './components/operations/VendorPerformance';
import { BookingConflicts } from './components/operations/BookingConflicts';
import { OperationsAnalytics } from './components/operations/OperationsAnalytics';
import { VendorDetails } from './components/operations/VendorDetails';
import { OperationsPeople } from './components/operations/OperationsPeople';
import { UserDetails } from './components/operations/UserDetails';
import { Bookings } from './components/Bookings';

// Finance
import { PaymentManagement } from './components/finance/PaymentManagement';
import { SettlementTracking } from './components/finance/SettlementTracking';
import { Withdrawals } from './components/finance/Withdrawals';
import { InvoiceGenerator } from './components/finance/InvoiceGenerator';
import { ReconciliationTool } from './components/finance/ReconciliationTool';
import { RevenueAnalytics } from './components/RevenueAnalytics';

// Support
import { TicketManagement } from './components/support/TicketManagement';
import { UserSupport } from './components/support/UserSupport';
import { SupportDashboard } from './components/support/SupportDashboard';
import { SupportAnalytics } from './components/support/SupportAnalytics';
import { SupportWorkers } from './components/support/SupportWorkers';
import { SupportReports } from './components/support/SupportReports';
import { CreateWorker } from './components/support/CreateWorker';
import { Conversations } from './components/support/Conversations';

// Super Admin
import { SystemConfiguration } from './components/super/SystemConfiguration';
import { AdminManagement } from './components/super/AdminManagement';
import { AuditLogs } from './components/super/AuditLogs';
import { SecuritySettings } from './components/super/SecuritySettings';
import { FeatureFlags } from './components/super/FeatureFlags';
import { AdminRole } from './types';

const MainLayout = () => {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dateRangeLabel, setDateRangeLabel] = useState('Last 7 Days');
  const [dateRangeValue, setDateRangeValue] = useState('May 21, 2024 - May 27, 2024');
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { notifications, adminUser, setAdminRole, logout } = useApp();

  const handleNavigate = (screen: string, id?: number | string) => {
    if (typeof id === 'number') setSelectedVendorId(id);
    if (typeof id === 'string') setSelectedUserId(id);
    setCurrentScreen(screen);
    setMobileMenuOpen(false);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard': return <Dashboard onNavigate={handleNavigate} dateRangeLabel={dateRangeLabel} dateRangeValue={dateRangeValue} />;
      case 'bookings': return <PermissionGuard route="bookings" fallback={<AccessDenied />}><Bookings onBack={() => handleNavigate('dashboard')} /></PermissionGuard>;
      case 'disputes': return <PermissionGuard route="disputes" fallback={<AccessDenied />}><DisputeResolution /></PermissionGuard>;
      case 'vendors': return <PermissionGuard route="vendors" fallback={<AccessDenied />}><VendorPerformance onVendorClick={(id) => handleNavigate('vendor-details', id)} /></PermissionGuard>;
      case 'vendor-details': return (
        <PermissionGuard route="vendors" fallback={<AccessDenied />}>
          <VendorDetails vendorId={selectedVendorId} onBack={() => handleNavigate('vendors')} />
        </PermissionGuard>
      );
      case 'payments': return <PermissionGuard route="payments" fallback={<AccessDenied />}><PaymentManagement dateRangeLabel={dateRangeLabel} /></PermissionGuard>;
      case 'settlements': return <PermissionGuard route="settlements" fallback={<AccessDenied />}><SettlementTracking dateRangeLabel={dateRangeLabel} dateRangeValue={dateRangeValue} /></PermissionGuard>;
      case 'withdrawals': return <PermissionGuard route="withdrawals" fallback={<AccessDenied />}><Withdrawals /></PermissionGuard>;
      case 'invoices': return <PermissionGuard route="invoices" fallback={<AccessDenied />}><InvoiceGenerator dateRangeLabel={dateRangeLabel} dateRangeValue={dateRangeValue} /></PermissionGuard>;
      case 'reconciliation': return <PermissionGuard route="reconciliation" fallback={<AccessDenied />}><ReconciliationTool dateRangeLabel={dateRangeLabel} dateRangeValue={dateRangeValue} /></PermissionGuard>;
      case 'tickets': return <PermissionGuard route="tickets" fallback={<AccessDenied />}><TicketManagement /></PermissionGuard>;
      case 'conversations': return <PermissionGuard route="conversations" fallback={<AccessDenied />}><Conversations /></PermissionGuard>;
      case 'people': return <PermissionGuard route="vendors" fallback={<AccessDenied />}><OperationsPeople key="people-vendors" /></PermissionGuard>;
      case 'user-details': return (
        <PermissionGuard route="users" fallback={<AccessDenied />}>
          <UserDetails userId={selectedUserId} onBack={() => handleNavigate('users')} />
        </PermissionGuard>
      );
      case 'users': return (
        <PermissionGuard route="users" fallback={<AccessDenied />}>
          {adminUser?.role === AdminRole.OPERATIONS_ADMIN || adminUser?.role === AdminRole.OPERATIONS_WORKER
            ? <OperationsPeople key="people-users" usersOnly defaultTab="users" onUserClick={(id) => handleNavigate('user-details', id)} />
            : <UserSupport dateRangeLabel={dateRangeLabel} dateRangeValue={dateRangeValue} />
          }
        </PermissionGuard>
      );
      case 'support-workers': return <PermissionGuard route="support-workers" fallback={<AccessDenied />}><SupportWorkers dateRangeLabel={dateRangeLabel} onNavigate={handleNavigate} /></PermissionGuard>;
      case 'create-worker': return <PermissionGuard route="support-workers" fallback={<AccessDenied />}><CreateWorker onBack={() => handleNavigate('support-workers')} /></PermissionGuard>;
      case 'support-reports': return <PermissionGuard route="support-reports" fallback={<AccessDenied />}><SupportReports /></PermissionGuard>;
      case 'admins': return <PermissionGuard route="admins" fallback={<AccessDenied />}><AdminManagement dateRangeLabel={dateRangeLabel} /></PermissionGuard>;
      case 'audit-logs': return <PermissionGuard route="audit-logs" fallback={<AccessDenied />}><AuditLogs /></PermissionGuard>;
      case 'settings': return <PermissionGuard route="settings" fallback={<AccessDenied />}>
        <div className="space-y-8">
          <SecuritySettings />
          <FeatureFlags />
          <SystemConfiguration />
        </div>
      </PermissionGuard>;
      case 'analytics': 
        if (adminUser?.role === AdminRole.SUPPORT_ADMIN) {
          return <PermissionGuard route="analytics" fallback={<AccessDenied />}><SupportAnalytics onBack={() => handleNavigate('dashboard')} /></PermissionGuard>;
        }
        return <PermissionGuard route="analytics" fallback={<AccessDenied />}><RevenueAnalytics onBack={() => handleNavigate('dashboard')} /></PermissionGuard>;
      default: return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex">
      <Navigation
        currentScreen={currentScreen}
        setScreen={handleNavigate}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      <div className="main-content flex-1 flex flex-col h-screen overflow-hidden">
        <header className="header px-6">
          <div className="header-title">
            <h1 className="capitalize text-white">
              {currentScreen === 'support-workers' && (adminUser?.role === AdminRole.OPERATIONS_ADMIN || adminUser?.role === AdminRole.OPERATIONS_WORKER) 
                ? 'Operations Team Overview'
                : `${currentScreen.replace('-', ' ')} Overview`
              }
            </h1>
            <p className="text-evera-muted">Welcome back, Admin! Here's what's happening in your application.</p>
          </div>

          <div className="flex items-center gap-6">
            {/* Interactive Date Range Picker Mock */}
            <div className="relative">
              <div 
                onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
                className="bg-evera-card border border-evera-border rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm cursor-pointer hover:border-evera-primary/50 transition-colors"
              >
                <Icons.Calendar size={16} className="text-evera-primary" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white leading-none">{dateRangeLabel}</span>
                  {dateRangeLabel !== 'Custom' && <span className="text-[10px] text-evera-muted mt-0.5">{dateRangeValue}</span>}
                </div>
                <Icons.ChevronDown size={14} className={`text-evera-muted transition-transform ml-1 ${isDateMenuOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isDateMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDateMenuOpen(false)} />
                  <div className="absolute top-full right-0 mt-2 w-64 bg-evera-card border border-[#38302C] rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-fade-in origin-top-right">
                    <div className="p-2 space-y-1">
                      {[
                        { label: 'Today', value: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                        { label: 'Yesterday', value: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                        { label: 'Last 7 Days', value: `${new Date(Date.now() - 7 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` },
                        { label: 'Last 30 Days', value: `${new Date(Date.now() - 30 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` },
                        { label: 'This Month', value: `${new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` },
                      ].map(opt => (
                        <button
                          key={opt.label}
                          onClick={() => {
                            setDateRangeLabel(opt.label);
                            setDateRangeValue(opt.value);
                            setIsCustomDate(false);
                            setIsDateMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors flex items-center justify-between ${
                            dateRangeLabel === opt.label && !isCustomDate
                              ? 'bg-[#f48c25]/10 text-[#f48c25] font-bold' 
                              : 'text-gray-300 hover:bg-[#38302C] hover:text-white'
                          }`}
                        >
                          {opt.label}
                          {dateRangeLabel === opt.label && !isCustomDate && <Icons.Check size={14} />}
                        </button>
                      ))}

                      {/* Custom Range Option */}
                      <div className="border-t border-[#38302C] my-1 pt-1">
                        <button
                           onClick={() => setIsCustomDate(true)}
                           className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors flex items-center justify-between ${
                             isCustomDate 
                               ? 'bg-[#f48c25]/10 text-[#f48c25] font-bold' 
                               : 'text-gray-300 hover:bg-[#38302C] hover:text-white'
                           }`}
                         >
                           Custom Range
                         </button>
                         
                         {isCustomDate && (
                           <div className="p-3 space-y-3 mt-1 bg-[#161210] rounded-lg border border-[#38302C]">
                              <div>
                                <label className="text-[10px] text-evera-muted uppercase tracking-wider font-bold mb-1.5 block">From Date</label>
                                <input 
                                  type="date" 
                                  className="w-full bg-[#241E1B] text-white text-xs p-2 rounded-md border border-[#38302C] outline-none focus:border-evera-primary" 
                                  value={customStart} 
                                  onChange={e => setCustomStart(e.target.value)} 
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-evera-muted uppercase tracking-wider font-bold mb-1.5 block">To Date</label>
                                <input 
                                  type="date" 
                                  className="w-full bg-[#241E1B] text-white text-xs p-2 rounded-md border border-[#38302C] outline-none focus:border-evera-primary" 
                                  value={customEnd} 
                                  onChange={e => setCustomEnd(e.target.value)} 
                                />
                              </div>
                              <button 
                                onClick={() => {
                                  if (customStart && customEnd) {
                                     setDateRangeLabel(`${customStart} to ${customEnd}`);
                                     setDateRangeValue('');
                                     setIsDateMenuOpen(false);
                                  }
                                }}
                                disabled={!customStart || !customEnd}
                                className="w-full bg-[#f48c25] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d9751a] transition-colors text-white text-xs font-bold py-2 rounded-md mt-2"
                              >
                                Apply Custom Range
                              </button>
                           </div>
                         )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="relative cursor-pointer hover:scale-105 transition-transform">
                <Icons.Bell size={22} className="text-evera-muted" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold border-2 border-evera-bg">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </div>
              <div className="relative">
                <div 
                  className="flex items-center gap-3 pl-4 border-l border-evera-border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold m-0 leading-none text-white">{adminUser?.name || 'Admin'}</p>
                    {(adminUser?.role === AdminRole.SUPER_ADMIN || (adminUser as any)?.originalRole === AdminRole.SUPER_ADMIN) && (
                      <div className="relative inline-block mt-1" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={adminUser?.role}
                          onChange={(e) => {
                            setAdminRole(e.target.value as AdminRole);
                            handleNavigate('dashboard');
                          }}
                          className="bg-[#161210] border border-[#38302C] hover:border-[#f48c25]/50 text-[9px] text-[#f48c25] hover:text-white transition-all uppercase tracking-wider font-black rounded-md px-1.5 py-0.5 cursor-pointer focus:outline-none"
                          title="Switch Active Demo Role"
                        >
                          <option value={AdminRole.SUPER_ADMIN}>Super Admin</option>
                          <option value={AdminRole.OPERATIONS_ADMIN}>Operations Admin</option>
                          <option value={AdminRole.OPERATIONS_WORKER}>Operations Worker</option>
                          <option value={AdminRole.FINANCE_ADMIN}>Finance Admin</option>
                          <option value={AdminRole.SUPPORT_ADMIN}>Support Admin</option>
                          <option value={AdminRole.SUPPORT_WORKER}>Support Worker</option>
                        </select>
                      </div>
                    )}
                  </div>
                  {adminUser?.avatar ? (
                    <img
                      src={adminUser.avatar}
                      alt={adminUser.name}
                      className="w-10 h-10 rounded-full border border-evera-border object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-evera-primary text-white flex items-center justify-center font-bold shadow-md shadow-orange-900/20">
                      {adminUser?.name?.charAt(0) || 'A'}
                    </div>
                  )}
                </div>

                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 w-72 bg-evera-card border border-[#38302C] rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-fade-in origin-top-right">
                      <div className="p-5 border-b border-[#38302C] flex items-center gap-4">
                        {adminUser?.avatar ? (
                          <img src={adminUser.avatar} alt={adminUser.name} className="w-14 h-14 rounded-full border border-evera-border object-cover" />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-evera-primary text-white flex items-center justify-center text-xl font-bold">
                            {adminUser?.name?.charAt(0) || 'A'}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white text-base">{adminUser?.name}</p>
                          <p className="text-xs text-evera-muted">{adminUser?.email}</p>
                          <p className="text-[10px] text-evera-primary font-black uppercase mt-1 tracking-wider bg-evera-primary/10 inline-block px-1.5 py-0.5 rounded">{adminUser?.role.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-bold text-white mb-3">Assigned Permissions</p>
                        <div className="flex flex-wrap gap-2">
                          {adminUser?.permissions.map(p => (
                            <span key={p.id} className="text-[9px] bg-[#38302C] text-gray-300 px-2 py-1 rounded font-bold uppercase tracking-wider">{`${p.module} ${p.action}`}</span>
                          ))}
                        </div>
                      </div>
                      <div className="p-2 border-t border-[#38302C] bg-black/20">
                        <button 
                          onClick={() => { setIsProfileOpen(false); logout(); }} 
                          className="w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors text-red-500 hover:bg-red-500/10 font-bold flex items-center justify-center gap-2"
                        >
                          <Icons.Reject size={16} /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-auto p-6 scroll-smooth animate-fade-in no-scrollbar">
          {renderScreen()}
        </main>
      </div>

      <div className="fixed bottom-8 right-8 w-80 space-y-3 z-[100] pointer-events-none">
        {notifications.map((note, idx) => (
          <div key={idx} className="bg-evera-card text-white px-5 py-4 rounded-xl shadow-2xl flex items-center animate-slide-in pointer-events-auto border border-evera-border border-l-4 border-l-evera-primary">
            <div className="w-6 h-6 bg-evera-primary/20 rounded-full flex items-center justify-center mr-3">
              <Icons.Check size={14} className="text-evera-primary" />
            </div>
            <span className="text-sm font-bold">{note}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AccessDenied = () => (
  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-fade-in">
    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
      <Icons.Reject size={32} />
    </div>
    <h2 className="text-xl font-bold text-evera-primary">Access Denied</h2>
    <p className="text-evera-muted max-w-xs">You do not have permission to access this module.</p>
  </div>
);

const MainAppContent = () => {
  const { adminUser } = useApp();

  if (!adminUser) {
    return <Login />;
  }

  return <MainLayout />;
};

export default function App() {
  return <MainAppContent />;
}