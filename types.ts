export enum UserRole {
  ADMIN = 'ADMIN',
  SUB_ADMIN = 'SUB_ADMIN'
}

export enum WorkerStatus {
  PENDING = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}

export interface Worker {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string; // e.g. "Electrician", "Event Planner"
  avatar: string;
  status: WorkerStatus;
  joinedDate: string;
  jobsCompleted: number;
  rating: number;
  totalEarned: number;
  documentsVerified?: boolean;
}

export interface Booking {
  id: string;
  date: string; // YYYY-MM-DD
  vendorId?: string;
  customerName: string;
  service?: string;
  serviceType?: string;
  provider?: string;
  amount: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  time?: string;
  location?: string;
  bookingDetails?: {
    packageName?: string;
    pricingType?: string;
    guestCount?: number;
    addons?: string[];
    [key: string]: any;
  };
}

export interface MetricCard {
  label: string;
  value: string;
  trend?: string; // e.g. "+12%"
  trendUp?: boolean;
  icon: string;
  colorClass: string;
}

export interface RevenueData {
  date: string;
  amount: number;
}

export interface ServiceBreakdown {
  name: string;
  amount: number;
  color: string;
}


export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  OPERATIONS_ADMIN = 'OPERATIONS_ADMIN',
  OPERATIONS_WORKER = 'OPERATIONS_WORKER',
  FINANCE_ADMIN = 'FINANCE_ADMIN',
  SUPPORT_ADMIN = 'SUPPORT_ADMIN',
  SUPPORT_WORKER = 'SUPPORT_WORKER'
}

export interface Permission {
  id: string;
  module: string; // 'bookings', 'payments', 'tickets', 'users', 'system'
  action: string; // 'view', 'create', 'edit', 'delete', 'approve'
  granted: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  permissions: Permission[];
  avatar: string;
  createdAt: string;
  lastLogin: string;
  isActive: boolean;
  department?: string;
  phone?: string;
  employee_id?: string;
}

// Finance Module Types
export interface Payment {
  id: string;
  bookingId: string;
  vendorId: string;
  customerId: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  method: 'CARD' | 'UPI' | 'WALLET' | 'NET_BANKING' | 'BANK_TRANSFER';
  transactionId: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
  tax?: number;
  commission?: number;
  platform_fee?: number;
  net_amount?: number;
  serviceName?: string;
  category?: string;
  location?: string;
  bookingDetails?: any;
  customer?: { name: string; email: string; phone: string };
  vendor?: { name: string; email: string; phone: string; rating: number; joinedDate: string; totalJobs: number } | null;
  bankDetails?: { account_no: string; bank_name: string; ifsc_code: string; holder_name?: string } | null;
  requestedAt?: string | null;
  acceptedAt?: string | null;
  settlement_time?: string;
  holding_status?: string;
  refundDetails?: { reason: string; refundedAt: string; refundTxnId: string };
}

export interface Settlement {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  commission: number;
  netAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  scheduledDate: string;
  completedDate?: string;
  transactionIds: string[];
  period: {
    from: string;
    to: string;
  };
  utrDetails?: {
    utrNumber: string;
    transactionNo: string;
    date: string;
    time: string;
  };
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  tax: number;
  totalAmount: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
  generatedDate: string;
  dueDate: string;
  paidDate?: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;

}

export interface SupportWorker {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  role: 'LEVEL_1_AGENT' | 'LEVEL_2_AGENT' | 'SPECIALIST' | 'OPERATIONS_WORKER' | 'SUPPORT_ADMIN' | 'OPERATIONS_ADMIN' | 'FINANCE_ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'DISABLED';
  permissions?: string[];
  departments?: SupportDepartment[];
  avatar?: string;
  aadhaarVerified?: boolean;
  managerId?: string | null;
  rating?: number;
}

export type SupportDepartment = 'CUSTOMER_SUPPORT' | 'VENDOR_SUPPORT' | 'FINANCE_SUPPORT' | 'TECHNICAL_SUPPORT' | 'OPERATIONS';

export interface TakeoverRequest {
  id: string;
  ticketId: string;
  requesterId: string;
  requesterName: string;
  reason: string;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface TicketTimelineAction {
  id: string;
  action: 'CREATED' | 'ASSIGNED' | 'OPENED' | 'CONTACTED_USER' | 'WAITING_FOR_USER' | 'WAITING_FOR_PROVIDER' | 'ESCALATED_SUPPORT_ADMIN' | 'ESCALATED_SUPER_ADMIN' | 'ESCALATED_DEPARTMENT' | 'RESOLVED' | 'CLOSED' | 'TAKEOVER_REQUESTED' | 'TAKEOVER_APPROVED' | 'TAKEOVER_REJECTED' | 'TRANSFERRED' | 'OWNERSHIP_REMOVED';
  actorName: string;
  timestamp: string;
  note?: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  type?: string;
  description: string;
  category: 'BOOKING' | 'PAYMENT' | 'VENDOR' | 'TECHNICAL' | 'SERVICE_QUALITY' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'WAITING_FOR_PROVIDER' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedByWorkerId?: string;
  resolvedByName?: string;
  resolutionNotes?: string;
  closedAt?: string;
  tags: string[];
  attachments: string[];
  comments: TicketComment[];
  assignedWorkerId?: string;
  escalationLevel?: 'NONE' | 'SUPPORT_ADMIN' | 'SUPER_ADMIN';
  escalationReason?: string;
  providerName?: string;
  timelineActions?: TicketTimelineAction[];
  assignedDepartment?: SupportDepartment;
  assignedDepartmentAdminId?: string;
  assignedDepartmentAdminName?: string;
  departmentAssignedAt?: string;
  takeoverRequest?: TakeoverRequest;
  transfersCount?: number;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorType: 'ADMIN' | 'CUSTOMER';
  content: string;
  createdAt: string;
  isInternal: boolean;
}

// Operations Module Types
export interface Dispute {
  id: string;
  disputeNumber: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  vendorId: string;
  vendorName: string;
  type: 'SERVICE_QUALITY' | 'PAYMENT' | 'CANCELLATION' | 'BEHAVIOR' | 'OTHER';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'ESCALATED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  evidence: DisputeEvidence[];
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  reason?: string;
  amount?: number;
}

export interface DisputeEvidence {
  id: string;
  type: 'IMAGE' | 'DOCUMENT' | 'VIDEO' | 'TEXT';
  url: string;
  description: string;
  uploadedAt: string;
  uploadedBy: 'CUSTOMER' | 'VENDOR';
}

// System Module Types
export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  module: string;
  resourceId?: string;
  changes?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: string | number | boolean;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  description: string;
  category: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}