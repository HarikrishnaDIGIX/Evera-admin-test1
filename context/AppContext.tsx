import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminRole, Worker, AdminUser, SupportWorker, Ticket } from '../types';
import * as api from '../api/service';
import { PermissionManager } from '../utils/permissions';

interface AppContextType {
  adminUser: AdminUser | null;
  setAdminRole: (role: AdminRole) => void;
  workers: Worker[];
  bookings: any[];
  users: any[];
  tickets: any[];
  setTickets: React.Dispatch<React.SetStateAction<any[]>>;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  stats: { revenue: number; active: number; pending: number; total: number; totalBookings: number; activeRevenue: number };
  notifications: string[];
  addNotification: (msg: string) => void;
  hasPermission: (module: string, action: string) => boolean;
  canAccessRoute: (route: string) => boolean;
  updateWorkerStatusLocal: (id: string, status: any) => void;
  verifyWorkerDocsLocal: (id: string) => void;
  login: (email: string, password: string, role?: AdminRole) => Promise<{success: boolean, requiresPasswordChange?: boolean, email?: string}>;
  logout: () => void;
  supportWorkers: SupportWorker[];
  createSupportWorkerLocal: (worker: Omit<SupportWorker, 'id'>) => Promise<void>;
  updateSupportWorkerLocal: (id: string, updates: Partial<SupportWorker>) => Promise<void>;
  toggleSupportWorkerLocal: (id: string) => Promise<void>;
  assignTicketToWorkerLocal: (ticketId: string, workerId: string, workerName: string) => Promise<void>;
  escalateTicketLocal: (ticketId: string, level: 'SUPPORT_ADMIN' | 'SUPER_ADMIN', reason: string) => Promise<void>;
  addTicketTimelineActionLocal: (ticketId: string, action: string, note?: string) => Promise<void>;
  assignTicketToDepartmentLocal: (ticketId: string, department: any, reason: string, notes?: string) => Promise<void>;
  claimTicketLocal: (ticketId: string) => Promise<void>;
  requestTakeoverLocal: (ticketId: string, reason: string, notes?: string) => Promise<void>;
  respondToTakeoverLocal: (ticketId: string, approve: boolean) => Promise<void>;
  transferTicketLocal: (ticketId: string, targetWorkerId: string, targetWorkerName: string, notes?: string) => Promise<void>;
  removeTicketOwnershipLocal: (ticketId: string) => Promise<void>;
  createTicketLocal: (ticketData: {
    subject: string;
    description: string;
    category: 'BOOKING' | 'PAYMENT' | 'VENDOR' | 'TECHNICAL' | 'SERVICE_QUALITY' | 'OTHER';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    customerName: string;
    customerEmail: string;
  }) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('admin_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [supportWorkers, setSupportWorkers] = useState<SupportWorker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, active: 0, pending: 0, total: 0, totalBookings: 0, activeRevenue: 0 });
  const [notifications, setNotifications] = useState<string[]>([]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [workersRes, statsRes, bookingsRes, ticketsRes, supportWorkersRes] = await Promise.all([
        api.fetchWorkers(),
        api.getStats(),
        api.fetchBookings(),
        api.fetchTickets(),
        api.fetchSupportWorkers()
      ]);

      if (workersRes.success && workersRes.data) {
        setWorkers(workersRes.data);
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (bookingsRes.success && bookingsRes.data) {
        setBookings(bookingsRes.data);
      }
      const usersRes = await api.fetchUsers();
      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      }
      if (ticketsRes.success && ticketsRes.data) {
        setTickets(ticketsRes.data);
      }
      if (supportWorkersRes.success && supportWorkersRes.data) {
        setSupportWorkers(supportWorkersRes.data);
      }
    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      refreshData();
    } else {
      setAdminUser(null);
      localStorage.removeItem('admin_user');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!adminUser) return;
    
    // Connect to WebSocket
    const ws = new WebSocket(`ws://127.0.0.1:8001/ws/${adminUser.id}`);
    
    ws.onopen = () => {
      console.log('Connected to real-time Admin Notifications');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'VENDOR_UPDATED') {
          addNotification('Live Update: A vendor profile has been updated!');
          refreshData(); // Automatically refresh to show new data
        }
      } catch (e) {
        // Not JSON, ignore or log
        console.log('Received WS Message:', event.data);
      }
    };
    
    return () => {
      ws.close();
    };
  }, [adminUser]);

  const setAdminRole = (role: AdminRole) => {
    if (adminUser) {
      const updated = { ...adminUser, role, originalRole: (adminUser as any).originalRole || adminUser.role };
      setAdminUser(updated);
      localStorage.setItem('admin_user', JSON.stringify(updated));
      addNotification(`Switched to ${role}`);
    }
  };

  const login = async (email: string, password: string, role?: AdminRole): Promise<{success: boolean, requiresPasswordChange?: boolean, email?: string}> => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8001/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      
      if (data.requires_password_change) {
        setIsLoading(false);
        return { success: true, requiresPasswordChange: true, email };
      }
      
      localStorage.setItem('auth_token', data.access_token);

      // Fetch user profile
      const profileResponse = await fetch('http://127.0.0.1:8001/api/v1/user/me', {
        headers: { 'Authorization': `Bearer ${data.access_token}` }
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profileData = await profileResponse.json();
      const { mapAdminUserToFrontend } = await import('../utils/mappers');
      
      const user = mapAdminUserToFrontend(profileData);
      
      setAdminUser(user);
      localStorage.setItem('admin_user', JSON.stringify(user));
      addNotification(`Logged in as ${user.name}`);

      // Load protected backend data after successful login.
      await refreshData();
      return { success: true };
    } catch (e) {
      console.error('Login error:', e);
      setIsLoading(false);
      return { success: false };
    }
  };


  const logout = () => {
    setAdminUser(null);
    localStorage.removeItem('admin_user');
    localStorage.removeItem('auth_token');
  };

  const addNotification = (msg: string) => {
    setNotifications(prev => [msg, ...prev]);
    // Simulate push notification visual
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== msg));
    }, 5000);
  };

  const hasPermission = (module: string, action: string): boolean => {
    if (!adminUser) return false;
    return PermissionManager.hasPermission(adminUser.role, module, action);
  };

  const canAccessRoute = (route: string): boolean => {
    if (!adminUser) return false;
    const accessibleRoutes = PermissionManager.getAccessibleRoutes(adminUser.role);
    return accessibleRoutes.includes(route);
  };

  const verifyWorkerDocsLocal = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const verifyRes = await fetch(`http://127.0.0.1:8001/api/v1/admin/vendors/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (verifyRes.ok) {
        const verifications = await verifyRes.json();
        const match = verifications.find((v: any) => v.vendor_id === parseInt(id));
        if (match) {
          await fetch(`http://127.0.0.1:8001/api/v1/admin/vendors/${match.id}/approve`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      }
      
      await fetch(`http://127.0.0.1:8001/api/v1/admin/workers/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'ACTIVE' })
      });

      addNotification('Documents verified successfully.');
      refreshData();
    } catch (e) {
      console.error(e);
      addNotification('Network error verifying documents');
    }
  };

  const updateWorkerStatusLocal = (id: string, status: any) => {
    setWorkers(prev => prev.map(w => w.id === id ? { ...w, status } : w));
    // Update stats locally as well
    setStats(prev => {
      const worker = workers.find(w => w.id === id);
      if (!worker) return prev;
      
      let newPending = prev.pending;
      let newActive = prev.active;

      if (worker.status === 'PENDING_APPROVAL' && status === 'ACTIVE') {
        newPending = Math.max(0, prev.pending - 1);
        newActive = prev.active + 1;
      }

      return { ...prev, pending: newPending, active: newActive };
    });

    // Create a real timeline event for Ops dashboard reflection if approved or rejected
    if (status === 'ACTIVE' || status === 'REJECTED') {
      const worker = workers.find(w => w.id === id);
      if (worker && adminUser) {
        const isApprove = status === 'ACTIVE';
        const newTicket: any = {
          id: `t-${isApprove ? 'approve' : 'reject'}-${Date.now()}`,
          ticketNumber: `V-${Math.floor(1000 + Math.random() * 9000)}`,
          customerId: worker.id,
          customerName: worker.name,
          customerEmail: worker.email,
          subject: `Vendor Profile ${isApprove ? 'Approved' : 'Rejected'}: ${worker.name}`,
          description: `${isApprove ? 'Approved' : 'Rejected'} vendor profile for ${worker.name}`,
          category: 'VENDOR',
          priority: isApprove ? 'MEDIUM' : 'HIGH',
          status: 'RESOLVED',
          assignedWorkerId: adminUser.id,
          assignedToName: adminUser.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          resolvedAt: new Date().toISOString(),
          resolvedByWorkerId: adminUser.id,
          resolvedByName: adminUser.name,
          tags: [isApprove ? 'approval' : 'rejection', 'vendor'],
          attachments: [],
          comments: [],
          timelineActions: [{
            id: `ta-${Date.now()}`,
            action: isApprove ? 'APPROVED' : 'REJECTED',
            actorName: adminUser.name,
            timestamp: new Date().toISOString(),
            note: `${isApprove ? 'Approved' : 'Rejected'} vendor profile ID #${worker.id}`
          }]
        };
        setTickets(prev => [newTicket, ...prev]);
      }
    }
  };

  const createSupportWorkerLocal = async (worker: Omit<SupportWorker, 'id'>) => {
    const res = await api.createSupportWorker(worker);
    if (res.success && res.data) {
      setSupportWorkers(prev => [...prev, res.data!]);
      addNotification(`Support worker ${worker.name} created`);
    } else {
      addNotification(res.error || 'Failed to create support worker');
      throw new Error(res.error || 'Failed to create support worker');
    }
  };

  const updateSupportWorkerLocal = async (id: string, updates: Partial<SupportWorker>) => {
    const res = await api.updateSupportWorker(id, updates);
    if (res.success && res.data) {
      setSupportWorkers(prev => prev.map(w => w.id === id ? { ...w, ...res.data! } : w));
      addNotification(`Support worker updated successfully`);
    } else {
      addNotification(res.error || 'Failed to update support worker');
      throw new Error(res.error || 'Failed to update support worker');
    }
  };

  const toggleSupportWorkerLocal = async (id: string) => {
    const worker = supportWorkers.find(w => w.id === id);
    if (!worker) return;
    const newStatus = worker.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    const res = await api.updateSupportWorker(id, { status: newStatus });
    if (res.success && res.data) {
      setSupportWorkers(prev => prev.map(w => w.id === id ? { ...w, ...res.data! } : w));
      addNotification(`Support worker status set to ${newStatus}`);
    }
  };

  const assignTicketToWorkerLocal = async (ticketId: string, workerId: string, workerName: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { 'Authorization': `Bearer ${token}` };
      let res;
      if (workerId) {
        res = await fetch(`http://127.0.0.1:8001/api/v1/admin/tickets/${ticketId}/assign?owner_id=${workerId}`, {
          method: 'PATCH',
          headers
        });
      } else {
        res = await fetch(`http://127.0.0.1:8001/api/v1/admin/tickets/${ticketId}/unassign`, {
          method: 'PATCH',
          headers
        });
      }
      if (res.ok) {
        addNotification(workerName ? `Ticket assigned to ${workerName}` : `Ticket unassigned`);
        refreshData();
      } else {
        addNotification('Failed to assign ticket');
      }
    } catch (e) {
      console.error(e);
      addNotification('Network error assigning ticket');
    }
  };

  const escalateTicketLocal = async (ticketId: string, level: 'SUPPORT_ADMIN' | 'SUPER_ADMIN', reason: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://127.0.0.1:8001/api/v1/admin/tickets/${ticketId}/escalate?reason=${encodeURIComponent(reason)}&level=${level}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        addNotification(`Ticket escalated to ${level}`);
        refreshData();
      } else {
        addNotification('Failed to escalate ticket');
      }
    } catch (e) {
      console.error(e);
      addNotification('Network error escalating ticket');
    }
  };

  const addTicketTimelineActionLocal = async (ticketId: string, action: string, note?: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const newActions = [
          ...(t.timelineActions || []),
          {
            id: `ta-${Date.now()}`,
            action: action as any,
            actorName: adminUser?.name || 'Admin',
            timestamp: new Date().toLocaleString(),
            note
          }
        ];
        return {
          ...t,
          timelineActions: newActions,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
  };

  const assignTicketToDepartmentLocal = async (ticketId: string, department: any, reason: string, notes?: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const newActions = [
          ...(t.timelineActions || []),
          {
            id: `ta-${Date.now()}`,
            action: 'ESCALATED_DEPARTMENT' as const,
            actorName: adminUser?.name || 'Support Agent',
            timestamp: new Date().toLocaleString(),
            note: `Escalated to ${department} Department. Reason: ${reason}. Notes: ${notes || 'None'}`
          }
        ];
        return {
          ...t,
          assignedDepartment: department,
          status: 'ESCALATED' as const,
          priority: 'URGENT' as const,
          timelineActions: newActions,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
    addNotification(`Ticket successfully escalated to ${department} Department`);
  };

  const claimTicketLocal = async (ticketId: string) => {
    if (!adminUser) return;
    const matchingWorker = supportWorkers.find(
      w => w.email.toLowerCase() === adminUser.email.toLowerCase()
    );
    const workerId = matchingWorker ? matchingWorker.id : adminUser.id;
    const workerName = matchingWorker ? matchingWorker.name : adminUser.name;
    await assignTicketToWorkerLocal(ticketId, workerId, workerName);
  };

  const requestTakeoverLocal = async (ticketId: string, reason: string, notes?: string) => {
    if (!adminUser) return;
    const matchingWorker = supportWorkers.find(
      w => w.email.toLowerCase() === adminUser.email.toLowerCase()
    );
    const workerId = matchingWorker ? matchingWorker.id : adminUser.id;
    const workerName = matchingWorker ? matchingWorker.name : adminUser.name;

    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const takeover = {
          id: `tr-${Date.now()}`,
          ticketId,
          requesterId: workerId,
          requesterName: workerName,
          reason,
          notes,
          status: 'PENDING' as const,
          createdAt: new Date().toLocaleString()
        };
        const newActions = [
          ...(t.timelineActions || []),
          {
            id: `ta-${Date.now()}`,
            action: 'TAKEOVER_REQUESTED' as const,
            actorName: workerName,
            timestamp: new Date().toLocaleString(),
            note: `Takeover requested by ${workerName}. Reason: ${reason}`
          }
        ];
        return {
          ...t,
          takeoverRequest: takeover,
          timelineActions: newActions,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
    addNotification(`Takeover request submitted by ${workerName}`);
  };

  const respondToTakeoverLocal = async (ticketId: string, approve: boolean) => {
    if (!adminUser) return;
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId && t.takeoverRequest) {
        const req = t.takeoverRequest;
        const newStatus = approve ? ('APPROVED' as const) : ('REJECTED' as const);
        const actionType = approve ? ('TAKEOVER_APPROVED' as const) : ('TAKEOVER_REJECTED' as const);
        const newActions = [
          ...(t.timelineActions || []),
          {
            id: `ta-${Date.now()}`,
            action: actionType,
            actorName: adminUser.name,
            timestamp: new Date().toLocaleString(),
            note: approve 
              ? `Takeover approved. Ownership transferred from ${t.assignedToName || 'previous owner'} to ${req.requesterName}` 
              : `Takeover requested by ${req.requesterName} was declined.`
          }
        ];

        let updatedTicket = {
          ...t,
          takeoverRequest: {
            ...req,
            status: newStatus
          },
          timelineActions: newActions,
          updatedAt: new Date().toISOString()
        };

        if (approve) {
          const newComment = {
            id: `comment-takeover-${Date.now()}`,
            ticketId,
            authorId: req.requesterId,
            authorName: req.requesterName,
            authorType: 'ADMIN' as const,
            content: `I have taken over handling of this ticket. I'll be assisting you moving forward.`,
            createdAt: new Date().toLocaleString(),
            isInternal: false,
          };

          const transfersCount = (t.transfersCount || 0) + 1;

          updatedTicket = {
            ...updatedTicket,
            assignedWorkerId: req.requesterId,
            assignedToName: req.requesterName,
            assignedTo: 'admin-support',
            comments: [...(t.comments || []), newComment],
            transfersCount
          };
        } else {
          // Clear takeoverRequest if rejected to let others request takeover later
          updatedTicket = {
            ...updatedTicket,
            takeoverRequest: undefined
          };
        }

        return updatedTicket;
      }
      return t;
    }));
    
    addNotification(approve ? `Takeover request approved.` : `Takeover request declined.`);
  };

  const transferTicketLocal = async (ticketId: string, targetWorkerId: string, targetWorkerName: string, notes?: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://127.0.0.1:8001/api/v1/admin/tickets/${ticketId}/transfer?target_worker_id=${targetWorkerId}&notes=${encodeURIComponent(notes || '')}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        addNotification(`Ticket successfully transferred to ${targetWorkerName}`);
        refreshData();
      } else {
        addNotification('Failed to transfer ticket');
      }
    } catch (e) {
      console.error(e);
      addNotification('Network error transferring ticket');
    }
  };

  const removeTicketOwnershipLocal = async (ticketId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://127.0.0.1:8001/api/v1/admin/tickets/${ticketId}/unassign`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        addNotification(`Ticket returned to unassigned queue`);
        refreshData();
      } else {
        addNotification('Failed to remove ownership');
      }
    } catch (e) {
      console.error(e);
      addNotification('Network error removing ownership');
    }
  };
  
  const createTicketLocal = async (ticketData: {
    subject: string;
    description: string;
    category: 'BOOKING' | 'PAYMENT' | 'VENDOR' | 'TECHNICAL' | 'SERVICE_QUALITY' | 'OTHER';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    customerName: string;
    customerEmail: string;
  }) => {
    const res = await api.createTicket(ticketData);
    let finalTicket: any;
    if (res.success && res.data) {
      const backendTicket = res.data;
      finalTicket = {
        id: backendTicket.id.toString(),
        ticketNumber: `TCK-${new Date().getFullYear()}-${backendTicket.id}`,
        customerId: `c-${Date.now()}`,
        customerName: ticketData.customerName,
        customerEmail: ticketData.customerEmail,
        subject: backendTicket.title,
        description: backendTicket.description,
        category: ticketData.category,
        priority: ticketData.priority,
        status: backendTicket.status,
        createdAt: backendTicket.created_at || new Date().toISOString(),
        updatedAt: backendTicket.updated_at || new Date().toISOString(),
        tags: [ticketData.category.toLowerCase()],
        attachments: [],
        comments: [],
        timelineActions: [{
          id: `ta-${Date.now()}`,
          action: 'CREATED',
          actorName: ticketData.customerName,
          timestamp: new Date().toISOString(),
          note: 'Ticket created manually by admin'
        }]
      };
    } else {
      finalTicket = {
        id: `t-mock-${Date.now()}`,
        ticketNumber: `TCK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        customerId: `c-${Date.now()}`,
        customerName: ticketData.customerName,
        customerEmail: ticketData.customerEmail,
        subject: ticketData.subject,
        description: ticketData.description,
        category: ticketData.category,
        priority: ticketData.priority,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [ticketData.category.toLowerCase()],
        attachments: [],
        comments: [],
        timelineActions: [{
          id: `ta-${Date.now()}`,
          action: 'CREATED',
          actorName: ticketData.customerName,
          timestamp: new Date().toISOString(),
          note: 'Ticket created manually by admin (mock fallback)'
        }]
      };
    }

    setTickets(prev => [finalTicket, ...prev]);
    addNotification(`Ticket ${finalTicket.ticketNumber} created successfully`);
  };

  return (
    <AppContext.Provider value={{
      adminUser,
      setAdminRole,
      workers,
      bookings,
      users,
      tickets,
      setTickets,
      isLoading,
      refreshData,
      stats,
      notifications,
      addNotification,
      hasPermission,
      canAccessRoute,
      updateWorkerStatusLocal,
      verifyWorkerDocsLocal,
      login,
      logout,
      supportWorkers,
      createSupportWorkerLocal,
      updateSupportWorkerLocal,
      toggleSupportWorkerLocal,
      assignTicketToWorkerLocal,
      escalateTicketLocal,
      addTicketTimelineActionLocal,
      assignTicketToDepartmentLocal,
      claimTicketLocal,
      requestTakeoverLocal,
      respondToTakeoverLocal,
      transferTicketLocal,
      removeTicketOwnershipLocal,
      createTicketLocal
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};