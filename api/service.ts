import {
  Worker,
  AdminUser,
  Payment,
  Ticket,
  Invoice,
  Settlement,
  Dispute,
  SystemConfig,
  AuditLog,
  AdminRole,
  WorkerStatus,
  SupportWorker,
  ApiResponse
} from '../types';
const API_BASE_URL = 'http://127.0.0.1:8001/api/v1';
export const BASE_HOST = API_BASE_URL.replace('/api/v1', '');

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// --- Workers & Bookings ---

export const fetchWorkers = async (): Promise<ApiResponse<any[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/vendors/`, { headers: getHeaders() });
    const data = await response.json();
    // Map backend Provider schema to Admin Dashboard Worker schema
    const mapped = data.map((p: any) => ({
      id: p.id.toString(),
      name: p.name,
      role: p.category || 'Vendor',
      status: p.status === 'approved' ? 'ACTIVE' : (p.status === 'rejected' ? 'REJECTED' : 'PENDING_APPROVAL'),
      image: p.image?.startsWith('/uploads') ? `${BASE_HOST}${p.image}` : (p.image || ''),
      rating: p.rating || 0,
      totalEarned: p.total_earnings || 0,
      documents: p.documents || [],
      certificates: (p.documents || []).map((doc: any) => ({
        ...doc,
        file_url: doc.file_url?.startsWith('/uploads') ? `${BASE_HOST}${doc.file_url}` : doc.file_url
      })).filter((d: any) => !d.title?.toLowerCase().includes('document')),
      businessDocuments: (p.documents || []).map((doc: any) => ({
        ...doc,
        img: doc.file_url?.startsWith('/uploads') ? `${BASE_HOST}${doc.file_url}` : doc.file_url,
        file_url: doc.file_url?.startsWith('/uploads') ? `${BASE_HOST}${doc.file_url}` : doc.file_url
      })).filter((d: any) => d.title?.toLowerCase().includes('document')),
      portfolio: (p.portfolio || []).map((port: any) => ({
        ...port,
        file_url: port.file_url?.startsWith('/uploads') ? `${BASE_HOST}${port.file_url}` : port.file_url
      })),
      pricing_packages: p.pricing_packages || [],
      pricing: p.pricing_packages || [],
      // Email and phone come from User table (backend now enriches this)
      email: p.email || '',
      phone: p.phone || p.contact_details?.phone || '',
      businessDescription: p.description || '',
      address: p.address || p.location || '',
      capacity: { max: p.venue_details?.capacity || '500' },
      venueSize: p.venue_details?.area || '10,000',
      upiId: p.upi_id || ''
    }));
    return { success: true, data: mapped };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Failed to fetch providers' };
  }
};

export const fetchBookings = async (date?: string): Promise<ApiResponse<any[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch bookings');
    const data = await response.json();
    return { success: true, data };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Failed to fetch bookings' };
  }
};

export const fetchUsers = async (): Promise<ApiResponse<any[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch users');
    const data = await response.json();
    const mapped = data.map((u: any) => ({
      id: u.id,
      name: u.name || u.username || 'Unknown',
      username: u.username || '',
      email: u.email || '',
      phone: u.phone || null,
      status: u.status || 'ACTIVE',
      created_at: u.created_at || '',
      totalBookings: u.total_bookings || 0,
      totalSpent: u.total_spent || 0,
      kycStatus: u.kyc_status || 'PENDING',
      lastActive: u.last_active || null,
      joinedDate: u.joined_date || null,
      location: u.location || null,
      city: u.city || null,
      gender: u.gender || null,
      age: u.age || null,
      addresses: [],           // Addresses come from the booking model — no saved address table exists
      address: u.address || null,
      aadhar: u.aadhar_number || null,
      pan: u.pan_number || null,
      tickets: u.total_tickets || 0,
      disputes: 0,
      totalSpentValue: u.total_spent || 0,
      paymentMethods: u.payment_methods || [],
      recentBookings: u.recent_bookings || [],
      preferredServices: u.preferred_services || [],
      appInfo: {
        device: u.app_info?.device || null,
        appVersion: u.app_info?.app_version || null,
        pushNotifications: u.app_info?.push_notifications || null,
        authMethod: u.app_info?.auth_method || null,
        lastSession: u.app_info?.last_session || null
      }
    }));
    return { success: true, data: mapped };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Failed to fetch users' };
  }
};


export const updateWorkerStatus = async (id: string, status: string): Promise<ApiResponse<void>> => {
  try {
    const endpoint = (status === 'approved' || status === 'ACTIVE') ? 'approve' : 'reject';
    const response = await fetch(`${API_BASE_URL}/providers/${id}/${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ reason: "Admin Action" })
    });

    return { success: response.ok };
  } catch (e) {
    return { success: false };
  }
};

export const updateDocumentStatus = async (providerId: string, documentId: string, status: string): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/vendors/${providerId}/documents/${documentId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });

    return { success: response.ok };
  } catch (e) {
    return { success: false };
  }
};

export const getStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch stats');
    const rawData = await response.json();
    const payload = rawData.data ? rawData.data : rawData;
    return {
      success: true,
      data: {
        revenue: payload.total_revenue || 0,
        active: payload.total_providers || 0,
        pending: payload.pending_approvals || 0,
        total: payload.total_users || 0,
        totalBookings: payload.total_bookings || 0,
        activeRevenue: payload.total_revenue || 0
      }
    };
  } catch (e) {
    console.error(e);
    return {
      success: true,
      data: { revenue: 0, active: 0, pending: 0, total: 0, totalBookings: 0, activeRevenue: 0 }
    };
  }
};

// --- Finance Module ---

// Dummy settlement data removed — settlements come from backend API only
export let globalMockSettlements: Settlement[] = [];

export const fetchSettlements = async (): Promise<ApiResponse<Settlement[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/finance/payouts`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch settlements');
    const data = await response.json();
    
    const mapped = data.map((s: any) => ({
      id: s.id.toString(),
      vendorId: s.provider_id ? s.provider_id.toString() : 'V-101',
      vendorName: s.vendor_name || 'Evera Provider',
      amount: s.amount,
      commission: s.amount * 0.1,
      netAmount: s.amount * 0.9,
      status: s.status,
      scheduledDate: s.created_at,
      transactionIds: [s.id.toString()],
      period: { from: s.created_at, to: s.created_at }
    }));
    return { success: true, data: mapped };
  } catch (e) {
    console.error('fetchSettlements error:', e);
    return { success: false, data: [], error: 'Unable to fetch settlements from server' };
  }
};

export const processSettlement = async (settlementId: string, utrData?: any): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/finance/settlements/${settlementId}/process`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(utrData ? { utrData } : {})
    });
    return { success: response.ok };
  } catch (e) {
    return { success: false };
  }
};

export const fetchInvoices = async (): Promise<ApiResponse<Invoice[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/finance/invoices`, { headers: getHeaders() });
    const data = await response.json();
    const mapped = data.map((i: any) => ({
      ...i,
      id: i.id.toString(),
      invoiceNumber: i.invoice_number || i.invoiceNumber,
      vendorId: i.vendor_id?.toString() || i.vendorId,
      vendorName: i.vendor_name || i.vendorName,
      amount: i.amount || 0,
      tax: i.tax || 0,
      totalAmount: i.total_amount || i.totalAmount || 0,
      generatedDate: i.generated_date || i.generatedDate,
      dueDate: i.due_date || i.dueDate,
      status: i.status,
      items: i.items || []
    }));
    return { success: response.ok, data: mapped };
  } catch (e) {
    return { success: false, error: 'Network error' };
  }
};

export const createInvoice = async (invoice: Omit<Invoice, 'id'>): Promise<ApiResponse<Invoice>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/finance/invoices`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        invoice_number: invoice.invoiceNumber,
        vendor_id: 4, // Default to a valid vendor ID from DB
        vendor_name: invoice.vendorName,
        amount: invoice.amount,
        tax: invoice.tax,
        total_amount: invoice.totalAmount,
        status: invoice.status,
        generated_date: invoice.generatedDate,
        due_date: invoice.dueDate,
        items: invoice.items || []
      })
    });
    const data = await response.json();
    return { success: response.ok, data: { ...data, id: data.id.toString(), invoiceNumber: data.invoice_number } };
  } catch (e) {
    return { success: false, error: 'Network error' };
  }
};

export const sendInvoice = async (invoiceId: string): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/finance/invoices/${invoiceId}/send`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return { success: response.ok };
  } catch (e) {
    return { success: false, error: 'Network error' };
  }
};

// --- Support Module ---

export const fetchCustomers = async (): Promise<ApiResponse<any[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch customers');
    const data = await response.json();
    return { success: true, data };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Failed to fetch customers' };
  }
};

export const fetchTickets = async (filters?: any): Promise<ApiResponse<Ticket[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/tickets/`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch tickets');
    const data = await response.json();
    const mapped = data.map((t: any) => ({
      id: t.id.toString(),
      ticketNumber: `T-2026-${t.id}`,
      customerId: t.user_id ? t.user_id.toString() : 'guest',
      customerName: t.customer_name || 'Evera User',
      customerEmail: t.customer_email || 'user@evera.com',
      subject: t.subject,
      description: t.message,
      type: t.type || 'CUSTOMER',
      category: t.subject && t.subject.includes('[') ? t.subject.split(']')[0].replace('[', '') : 'Support',
      priority: t.priority || 'MEDIUM',
      status: t.status,
      createdAt: t.created_at,
      updatedAt: t.replied_at || t.created_at,
      tags: [],
      assignedDepartment: 'CUSTOMER_SUPPORT',
      attachments: [],
      comments: t.admin_reply ? [{
        id: 'reply-1',
        ticketId: t.id.toString(),
        authorId: 'admin',
        authorName: 'Support Agent',
        authorType: 'ADMIN',
        content: t.admin_reply,
        createdAt: t.replied_at,
        isInternal: false
      }] : [],
      assignedWorkerId: '',
      assignedToName: '',
      escalationLevel: 'NONE',
      timelineActions: []
    }));
    return { success: true, data: mapped };
  } catch (e) {
    console.error(e);
    return { success: true, data: [] };
  }
};

export const updateTicketStatus = async (ticketId: string, status: string): Promise<ApiResponse<void>> => {
  try {
    // status mapping
    let backendStatus = status.toLowerCase();
    if (status === 'RESOLVED' || status === 'CLOSED') backendStatus = 'resolved';
    if (status === 'OPEN' || status === 'UNASSIGNED') backendStatus = 'pending';
    
    const response = await fetch(`http://127.0.0.1:8001/api/v1/support/admin/tickets/${ticketId}/status?status=${backendStatus}`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return { success: response.ok };
  } catch (e) {
    return { success: false };
  }
};

export const replyToTicket = async (ticketId: string, content: string): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`http://127.0.0.1:8001/api/v1/support/admin/tickets/${ticketId}/reply`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ reply: content })
    });
    return { success: response.ok };
  } catch (e) {
    return { success: false };
  }
};

// --- Finance Module ---

export const fetchPayments = async (): Promise<ApiResponse<Payment[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/finance/transactions`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch payments');
    const data = await response.json();
    
    const mapped = data.map((t: any) => ({
      id: `PAY-${t.id}`,
      bookingId: `B${t.id}`,
      vendorId: t.provider_id ? t.provider_id.toString() : 'V-101',
      customerId: 'C-101',
      amount: t.amount,
      status: t.status,
      method: (['CARD','UPI','WALLET','NET_BANKING','BANK_TRANSFER'].includes(t.payment_method) ? t.payment_method : 'UPI') as any,
      transactionId: `TXN_${t.id}`,
      createdAt: t.created_at,
      tax: t.amount * 0.18,
      commission: t.amount * 0.1,
      platform_fee: t.amount * 0.05,
      net_amount: t.amount * 0.67,
      serviceName: t.description || 'Evera Service',
      category: 'General',
      customer: t.customer || { name: 'Guest', email: 'N/A', phone: 'N/A' },
      vendor: t.vendor || { name: 'Evera Provider', email: 'N/A', phone: 'N/A', rating: 4.5, joinedDate: '', totalJobs: 0 },
      bankDetails: null,
      requestedAt: t.created_at,
      acceptedAt: t.created_at,
      settlement_time: t.status === 'COMPLETED' ? t.created_at : 'TBD',
      holding_status: t.status
    }));
    return { success: true, data: mapped };
  } catch (e) {
    console.error('fetchPayments error:', e);
    return { success: false, data: [], error: 'Unable to fetch payments from server' };
  }
};

// --- Operations Module ---

export const fetchDisputes = async (status?: string): Promise<ApiResponse<Dispute[]>> => {
  try {
    const url = status ? `${API_BASE_URL}/admin/support/disputes?status=${status}` : `${API_BASE_URL}/admin/support/disputes`;
    const response = await fetch(url, { headers: getHeaders() });
    const data = await response.json();
    const mapped = data.map((d: any) => ({
      id: d.id.toString(),
      disputeNumber: `D-${String(d.id).padStart(3, '0')}`,
      bookingId: d.id.toString(),
      reason: d.message || d.issue_description || 'Support Request',
      status: d.status,
      amount: d.amount || 0,
      createdAt: d.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      customerName: d.customer_name || (d.user_id ? `User ${d.user_id}` : 'Customer'),
      vendorName: 'Vendor',
      type: 'SERVICE_QUALITY',
      customerId: d.user_id?.toString() || 'c1',
      vendorId: 'v1',
      priority: d.status === 'in_progress' ? 'HIGH' : 'MEDIUM',
      description: d.message || d.issue_description || 'Details unavailable',
      evidence: []
    }));
    return { success: response.ok, data: mapped };
  } catch (e) {
    return { success: false, error: 'Network error' };
  }
};

export const resolveDispute = async (disputeId: string, resolution: string): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/support/disputes/${disputeId}/resolve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ resolution })
    });
    return { success: response.ok };
  } catch (e) {
    return { success: false, error: 'Network error' };
  }
};

export const getVendorPerformance = async (vendorId: string): Promise<ApiResponse<any>> => {
  return { success: true, data: { rating: 4.8, jobs: 156 } };
};

// --- Super Admin ---

export const fetchAdmins = async (): Promise<ApiResponse<AdminUser[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/workers/`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch admins');
    const data = await response.json();
    
    // Map backend to frontend schema
    const { mapAdminUserToFrontend } = await import('../utils/mappers');
    const mappedAdmins = data.map((admin: any) => mapAdminUserToFrontend(admin));
    
    return { success: true, data: mappedAdmins };
  } catch (e) {
    console.error(e);
    return { success: true, data: [] };
  }
};

export const createAdmin = async (admin: any): Promise<ApiResponse<AdminUser>> => {
  try {
    const payload = {
      name: admin.name,
      email: admin.email,
      password: admin.password || 'admin123',
      role_name: admin.role,
      status: admin.isActive ? 'ACTIVE' : 'INACTIVE'
    };
    const response = await fetch(`${API_BASE_URL}/admin/workers/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      let errorMsg = 'Failed to create admin';
      if (data.detail) {
        errorMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      }
      return { success: false, error: errorMsg };
    }
    const { mapAdminUserToFrontend } = await import('../utils/mappers');
    return { success: true, data: mapAdminUserToFrontend(data) };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Network error' };
  }
};

export const updateAdmin = async (id: string, updates: any): Promise<ApiResponse<AdminUser>> => {
  try {
    const payload: any = {};
    if (updates.name) payload.name = updates.name;
    if (updates.email) payload.email = updates.email;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.role) payload.role_name = updates.role;
    if (updates.password) payload.password = updates.password;

    const response = await fetch(`${API_BASE_URL}/admin/workers/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      let errorMsg = 'Failed to update admin';
      if (data.detail) {
        errorMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      }
      return { success: false, error: errorMsg };
    }
    const { mapAdminUserToFrontend } = await import('../utils/mappers');
    return { success: true, data: mapAdminUserToFrontend(data) };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Network error' };
  }
};

export const updateAdminRole = async (adminId: string, role: string): Promise<ApiResponse<boolean>> => {
  const res = await updateAdmin(adminId, { role });
  return { success: res.success };
};

export const fetchAuditLogs = async (filters?: any): Promise<ApiResponse<AuditLog[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/audit-logs`, { headers: getHeaders() });
    const data = await response.json();
    const mapped = data.map((log: any) => ({
      id: log.id.toString(),
      adminId: log.actor_id ? log.actor_id.toString() : 'system',
      adminName: log.actor_type ? log.actor_type.toUpperCase() : 'SYSTEM',
      action: log.action,
      module: log.module,
      changes: log.new_value,
      ipAddress: log.ip_address || '127.0.0.1',
      userAgent: log.user_agent || 'Unknown Browser',
      timestamp: log.timestamp || new Date().toISOString()
    }));
    return { success: response.ok, data: mapped };
  } catch (e) {
    return { success: false, error: 'Network error' };
  }
};


export const fetchFullProfile = async (id: number): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/vendors/${id}`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch provider profile');
    const rawData = await response.json();
    const payload = rawData.data || {};
    const worker = payload.vendor || rawData;
    
    // Map the documents to the UI expected format
    const allMappedDocs = (payload.documents || worker.documents || []).map((doc: any, index: number) => {
      const url = doc.file_url || doc.url || '';
      return {
        id: doc.id,
        title: doc.title || doc.name || doc.type || `DOCUMENT ${index + 1}`,
        file_url: url.startsWith('http') ? url : `${BASE_HOST}${url.startsWith('/') ? '' : '/'}${url}`,
        status: doc.status || 'PENDING_APPROVAL'
      };
    });
    
    const businessDocs = allMappedDocs.filter((d: any) => d.title?.toLowerCase().includes('document'));
    const certificateDocs = allMappedDocs.filter((d: any) => !d.title?.toLowerCase().includes('document'));
    
    const mappedPortfolio = (payload.portfolio || worker.portfolio || []).map((port: any, idx: number) => {
      const url = port.file_url || '';
      return {
        id: port.id,
        title: port.title || `Portfolio Item ${idx + 1}`,
        file_url: url.startsWith('http') ? url : `${BASE_HOST}/${url.startsWith('/') ? '' : ''}${url}`
      };
    }) || [];

    let mappedStatus = worker.status;
    if (['start_review', 'documents_required', 'documents_submitted', 'under_review'].includes(worker.status)) {
        mappedStatus = 'PENDING_APPROVAL';
    } else if (worker.status === 'approved') {
        mappedStatus = 'ACTIVE';
    } else if (worker.status === 'rejected') {
        mappedStatus = 'REJECTED';
    }

    return {
      success: true,
      data: {
        ...worker,
        status: mappedStatus,
        // Email & phone now populated by backend from User/UserProfile table
        email: worker.email || '',
        phone: worker.phone || '',
        image: (worker.image || '').startsWith('http') ? worker.image : (worker.image ? `${BASE_HOST}${worker.image.startsWith('/') ? '' : '/'}${worker.image}` : ''),
        address: worker.address || worker.location || '',
        businessDescription: worker.description || worker.businessDescription || '',
        serviceRadius: worker.distance || worker.radius || '',
        amenities: (payload.amenities || []).map((a: any) => a.name || a),
        aadhaar_last4: worker.aadhar_number ? worker.aadhar_number.slice(-4) : null,
        aadhaarNumber: worker.aadhar_number || null,
        panNumber: worker.pan_number || null,
        aadhaar_verified: true,
        availability: {
          status: worker.status === 'approved' ? 'Online' : 'Offline',
          officeTime: '09:00 AM - 06:00 PM',
          onlineTime: worker.status === 'approved' ? 'Online now' : 'Last seen recently'
        },
        businessDocuments: businessDocs,
        certificates: certificateDocs,
        portfolio: mappedPortfolio,
        services: payload.services || [],
        packages: payload.packages || [],
        bookings: [],
        documentsVerified: worker.is_verified || false,
        payments: {
          total_earnings: worker.totalEarned || 0,
          last_payment: 0,
          bankDetails: worker.bank_account ? {
            accountNumber: worker.bank_account,
            ifsc: worker.bank_ifsc,
            bankName: worker.bank_name
          } : null,
          history: []
        },
        tickets: []
      }
    };
  } catch (e) {
    console.error('fetchFullProfile error:', e);
    return { success: false, error: 'Unable to fetch provider profile' };
  }
};

export const updateVendor = async (id: string | number, updates: any): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/providers/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update vendor details');
    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const verifyVendorDocs = async (vendorId: string): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/vendors/${vendorId}/verify-docs`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return { success: response.ok };
  } catch (e) {
    return { success: false, error: 'Network error' };
  }
};
// --- Finance Module ---

// Dummy payment data removed — payments come from backend API only
// This function is kept as a no-op for compatibility
export const addMockPayment = async (_payment: Payment): Promise<void> => {
  // No-op: mock payments are no longer used
  console.warn('[service] addMockPayment called but mock payments are disabled');
};


export const processRefund = async (paymentId: string, amount: number): Promise<ApiResponse<void>> => {
  try {
    const cleanIdStr = paymentId.replace(/\D/g, '');
    const txnId = cleanIdStr ? parseInt(cleanIdStr) : 998877;
    const response = await fetch(`${API_BASE_URL}/admin/finance/transactions/${txnId}/refund`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        amount: amount,
      })
    });
    return { success: response.ok };
  } catch (e) {
    return { success: false };
  }
};

// --- Support Workers API Simulation ---
export const fetchSupportWorkers = async (): Promise<ApiResponse<SupportWorker[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/workers/`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch workers');
    const data = await response.json();
    
    const mapped = data.map((w: any) => ({
      id: w.id.toString(),
      name: w.name,
      employeeId: w.employee_id || `EMP-${w.id}`,
      email: w.email,
      phone: w.phone || 'N/A',
      role: w.role?.name?.toUpperCase() || 'SUPPORT_WORKER',
      status: w.status,
      permissions: w.permissions || [],
      departments: ['CUSTOMER_SUPPORT'],
      managerId: w.manager_id ? w.manager_id.toString() : null
    }));
    return { success: true, data: mapped };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Failed to fetch workers' };
  }
};

export const createSupportWorker = async (worker: Omit<SupportWorker, 'id'>): Promise<ApiResponse<SupportWorker>> => {
  try {
    const payload = {
      name: worker.name,
      email: worker.email,
      phone: worker.phone,
      employee_id: worker.employeeId,
      role_name: worker.role,
      permissions: worker.permissions,
      departments: worker.departments,
      status: worker.status
    };
    const response = await fetch(`${API_BASE_URL}/admin/workers/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      let errorMsg = 'Failed to create worker';
      if (data.detail) {
        errorMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      }
      return { success: false, error: errorMsg };
    }
    
    const newWorker: SupportWorker = {
      ...worker,
      id: data.id.toString()
    };
    return { success: true, data: newWorker };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Network error' };
  }
};

export const updateSupportWorker = async (id: string, updates: Partial<SupportWorker>): Promise<ApiResponse<SupportWorker>> => {
  try {
    const payload: any = {};
    if (updates.name) payload.name = updates.name;
    if (updates.email) payload.email = updates.email;
    if (updates.status) payload.status = updates.status;
    if (updates.permissions) payload.permissions = updates.permissions;
    if (updates.departments) payload.departments = updates.departments;
    if (updates.phone) payload.phone = updates.phone;
    if (updates.employeeId) payload.employee_id = updates.employeeId;
    
    const response = await fetch(`${API_BASE_URL}/admin/workers/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    if (!response.ok) {
      let errorMsg = 'Failed to update worker';
      if (data.detail) {
        errorMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      }
      return { success: false, error: errorMsg };
    }
    
    return { success: true, data: { ...updates, id: data.id.toString() } as SupportWorker };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Network error' };
  }
};

export const deleteSupportWorker = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/workers/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status: 'BLOCKED' })
    });
    if (!response.ok) return { success: false, error: 'Failed to disable worker' };
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Network error' };
  }
};

export const deleteWorker = async (id: string): Promise<ApiResponse<void>> => {
  return { success: true };
};

export const undoDeleteWorker = async (id: string, status?: string): Promise<ApiResponse<void>> => {
  return { success: true };
};

export const createTicket = async (ticketData: {
  subject: string;
  description: string;
  category: string;
  customerName: string;
  customerEmail: string;
}): Promise<ApiResponse<any>> => {
  try {
    let backendType = 'CUSTOMER';
    if (ticketData.category === 'VENDOR') backendType = 'VENDOR';
    else if (ticketData.category === 'PAYMENT') backendType = 'FINANCE';
    else if (ticketData.category === 'TECHNICAL') backendType = 'TECHNICAL';

    const response = await fetch(`${API_BASE_URL}/admin/tickets/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        title: ticketData.subject,
        description: ticketData.description,
        type: backendType,
        status: 'OPEN',
        customer_name: ticketData.customerName,
        customer_email: ticketData.customerEmail
      })
    });
    const data = await response.json();
    if (!response.ok) {
      let errorMsg = 'Failed to create ticket';
      if (data.detail) {
        errorMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      }
      return { success: false, error: errorMsg };
    }
    return { success: true, data };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Network error' };
  }
};

// --- Settings Module ---

export const fetchSettings = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch settings');
    const data = await response.json();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: 'Network error' };
  }
};

export const updateSettings = async (settings: any): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settings)
    });
    return { success: response.ok };
  } catch (e) {
    return { success: false, error: 'Network error' };
  }
};
