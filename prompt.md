# Prompt to Generate Evera Admin Panel with Complete RBAC Architecture

## Context
You are building a comprehensive admin panel for Evera, a service booking platform. The application needs to support four distinct admin roles with different access scopes and responsibilities. The current implementation only has basic ADMIN/SUB_ADMIN roles without proper role-based access control.

## Project Overview

**Tech Stack:**
- React 18 with TypeScript
- Vite as build tool
- Tailwind CSS for styling
- Mock API service (simulating backend)
- Component-based architecture

**Design System:**
- Dark theme with orange accent (#FF6B35 as primary)
- Mobile-first responsive design (max-width: 448px)
- Glassmorphism and modern UI patterns
- Smooth animations and transitions

## Required Admin Roles & Responsibilities

### 1. Operations Admin
**Access Scope:** Bookings & Vendors
**Responsibilities:**
- Monitor booking operations
- Manage vendor approvals and suspensions
- Resolve disputes between customers and vendors
- Track booking performance metrics
- Handle booking conflicts and reschedules

### 2. Finance Admin
**Access Scope:** Payments & Settlements
**Responsibilities:**
- Process payment transactions
- Manage vendor settlements
- Generate and send invoices
- Perform financial reconciliation
- Handle refunds and payment disputes
- Track financial metrics and reports

### 3. Support Admin
**Access Scope:** Users & Support Tickets
**Responsibilities:**
- Manage customer support tickets
- Assist users with platform issues
- Track and resolve customer complaints
- Maintain customer communication
- Monitor support metrics (response time, resolution rate)
- Create support documentation

### 4. Super Admin
**Access Scope:** Full System Access
**Responsibilities:**
- Configure system settings
- Manage all admin users and permissions
- View comprehensive audit logs
- Control security settings
- Manage feature flags
- Platform governance and compliance

## Implementation Requirements

### Phase 1: Core RBAC System

#### 1.1 Update Type Definitions (`types.ts`)

```typescript
export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  OPERATIONS_ADMIN = 'OPERATIONS_ADMIN',
  FINANCE_ADMIN = 'FINANCE_ADMIN',
  SUPPORT_ADMIN = 'SUPPORT_ADMIN'
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
}

// Finance Module Types
export interface Payment {
  id: string;
  bookingId: string;
  vendorId: string;
  customerId: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  method: 'CARD' | 'UPI' | 'WALLET' | 'NET_BANKING';
  transactionId: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
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

// Support Module Types
export interface Ticket {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  description: string;
  category: 'BOOKING' | 'PAYMENT' | 'VENDOR' | 'TECHNICAL' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  tags: string[];
  attachments: string[];
  comments: TicketComment[];
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
```

#### 1.2 Permission Manager (`utils/permissions.ts`)

Create a permission manager to check access rights:

```typescript
export class PermissionManager {
  static hasPermission(
    adminRole: AdminRole,
    module: string,
    action: string
  ): boolean {
    // Implementation here
  }

  static canAccessModule(adminRole: AdminRole, module: string): boolean {
    // Implementation here
  }

  static getAccessibleRoutes(adminRole: AdminRole): string[] {
    // Implementation here
  }
}
```

#### 1.3 Update AppContext (`context/AppContext.tsx`)

Add RBAC support:
- Current admin user with role
- Permission checking functions
- Role-based navigation filtering
- Admin user management state

### Phase 2: Finance Admin Module

#### 2.1 Components to Create

1. **PaymentManagement.tsx**
   - List all payments with filters
   - Payment status tracking
   - Payment details view
   - Refund processing interface
   - Payment search and filters

2. **SettlementTracking.tsx**
   - Pending settlements list
   - Settlement processing interface
   - Settlement history
   - Vendor-wise settlement view
   - Settlement reports

3. **InvoiceGenerator.tsx**
   - Invoice creation form
   - Invoice template preview
   - Invoice list with status
   - Send invoice via email
   - Download invoice as PDF

4. **ReconciliationTool.tsx**
   - Payment vs Settlement matching
   - Discrepancy detection
   - Reconciliation reports
   - Manual adjustment interface

5. **FinancialReports.tsx**
   - Revenue analytics
   - Payment trends
   - Settlement analytics
   - Commission reports
   - Export to Excel/PDF

#### 2.2 Mock Data for Finance Module

Generate realistic mock data for:
- 50+ payment transactions
- 20+ settlement records
- 15+ invoices
- Financial metrics

### Phase 3: Support Admin Module

#### 3.1 Components to Create

1. **SupportDashboard.tsx**
   - Open tickets count
   - Average response time
   - Resolution rate metrics
   - Ticket priority distribution
   - Recent activity feed

2. **TicketManagement.tsx**
   - Ticket list with filters
   - Ticket details view
   - Assign ticket to admin
   - Update ticket status
   - Add internal/external comments
   - Ticket search

3. **TicketDetails.tsx**
   - Full ticket information
   - Customer details
   - Communication timeline
   - Add attachments
   - Status workflow
   - Resolution interface

4. **UserSupport.tsx**
   - Customer list
   - Customer details view
   - Customer ticket history
   - Add support notes
   - Communication center

5. **SupportAnalytics.tsx**
   - Ticket volume trends
   - Category breakdown
   - Response time analytics
   - Admin performance metrics
   - Customer satisfaction scores

#### 3.2 Mock Data for Support Module

Generate realistic mock data for:
- 100+ support tickets
- Various priorities and categories
- Ticket comments and updates
- Customer information

### Phase 4: Operations Admin Enhancements

#### 4.1 Components to Create

1. **DisputeResolution.tsx**
   - Active disputes list
   - Dispute details view
   - Evidence management
   - Resolution workflow
   - Escalation interface

2. **VendorPerformance.tsx**
   - Vendor ratings overview
   - Performance metrics
   - Booking completion rate
   - Customer feedback summary
   - Warning system

3. **BookingConflicts.tsx**
   - Double-booking detection
   - Schedule conflict resolution
   - Vendor availability management
   - Customer notification interface

4. **OperationsAnalytics.tsx**
   - Booking trends
   - Vendor utilization
   - Service performance
   - Geographic analytics
   - Peak time analysis

#### 4.2 Mock Data for Operations Module

Generate realistic mock data for:
- 30+ disputes
- Vendor performance metrics
- Booking conflict scenarios

### Phase 5: Super Admin Module

#### 5.1 Components to Create

1. **SystemConfiguration.tsx**
   - Platform settings
   - Feature flags management
   - Business rules configuration
   - Email/SMS templates
   - API configuration

2. **AdminManagement.tsx**
   - Admin user list
   - Create/Edit admin
   - Role assignment
   - Permission management
   - Admin activity tracking

3. **AuditLogs.tsx**
   - Comprehensive activity log
   - Filter by admin/action/module
   - Export audit reports
   - Security events tracking

4. **SecuritySettings.tsx**
   - Password policies
   - Two-factor authentication
   - IP whitelisting
   - Session management
   - Security alerts

5. **FeatureFlags.tsx**
   - Toggle features on/off
   - A/B testing configuration
   - Gradual rollout settings

#### 5.2 Mock Data for Super Admin Module

Generate realistic mock data for:
- Admin users
- Audit logs
- System configurations
- Security events

### Phase 6: Enhanced UI Components

#### 6.1 Reusable Components to Create

1. **DataTable.tsx** - Advanced table with sorting, filtering, pagination
2. **SearchBar.tsx** - Global search component
3. **FilterPanel.tsx** - Advanced filtering interface
4. **ExportButton.tsx** - Export data as CSV/Excel/PDF
5. **StatusBadge.tsx** - Consistent status indicators
6. **ActionMenu.tsx** - Dropdown actions menu
7. **ConfirmDialog.tsx** - Confirmation modal
8. **Toast.tsx** - Better notification system
9. **PermissionGuard.tsx** - Route/component access guard
10. **EmptyState.tsx** - Empty state illustrations

### Phase 7: API Service Expansion

#### 7.1 Add API Methods (`api/service.ts`)

Finance APIs:
```typescript
export const fetchPayments = async (filters?: PaymentFilters)
export const processRefund = async (paymentId: string, amount: number)
export const fetchSettlements = async (status?: string)
export const processSettlement = async (settlementId: string)
export const generateInvoice = async (data: InvoiceData)
export const sendInvoice = async (invoiceId: string)
```

Support APIs:
```typescript
export const fetchTickets = async (filters?: TicketFilters)
export const createTicket = async (data: TicketData)
export const updateTicketStatus = async (ticketId: string, status: string)
export const assignTicket = async (ticketId: string, adminId: string)
export const addTicketComment = async (ticketId: string, comment: string)
```

Operations APIs:
```typescript
export const fetchDisputes = async (status?: string)
export const resolveDispute = async (disputeId: string, resolution: string)
export const escalateDispute = async (disputeId: string)
export const getVendorPerformance = async (vendorId: string)
```

Admin APIs:
```typescript
export const fetchAdmins = async ()
export const createAdmin = async (data: AdminData)
export const updateAdminRole = async (adminId: string, role: AdminRole)
export const fetchAuditLogs = async (filters?: AuditFilters)
export const updateSystemConfig = async (key: string, value: any)
```

## Detailed Implementation Instructions

### Navigation Structure

Update `Sidebar.tsx` to show role-based navigation:

```typescript
const navigationConfig = {
  [AdminRole.SUPER_ADMIN]: [
    'dashboard', 'bookings', 'payments', 'settlements', 
    'tickets', 'disputes', 'vendors', 'admins', 
    'audit-logs', 'settings'
  ],
  [AdminRole.OPERATIONS_ADMIN]: [
    'dashboard', 'bookings', 'disputes', 'vendors', 'analytics'
  ],
  [AdminRole.FINANCE_ADMIN]: [
    'dashboard', 'payments', 'settlements', 'invoices', 
    'reconciliation', 'reports'
  ],
  [AdminRole.SUPPORT_ADMIN]: [
    'dashboard', 'tickets', 'users', 'analytics'
  ]
};
```

### Dashboard Customization

Create role-specific dashboards:
- **Operations Admin**: Booking stats, pending approvals, active disputes
- **Finance Admin**: Revenue metrics, pending settlements, payment status
- **Support Admin**: Open tickets, response times, satisfaction scores
- **Super Admin**: System overview, all metrics, recent activities

### Color Scheme

Maintain consistency with existing design:
```css
--evera-primary: #FF6B35 (orange)
--evera-bg: #0A0A0B (dark background)
--evera-card: #1A1A1B
--evera-border: #2A2A2B
--evera-muted: #666666
--evera-text: #FFFFFF
```

### Responsive Design

Ensure all components work within mobile constraints:
- Max width: 448px
- Touch-friendly interactions
- Mobile-optimized tables (card view on mobile)
- Swipe gestures where appropriate

## Testing Requirements

Create mock scenarios for:
1. Role switching (simulate different admin logins)
2. Permission denials (try accessing restricted features)
3. Data loading states
4. Error handling
5. Form validations
6. Optimistic UI updates

## Documentation

Include:
1. README with setup instructions
2. Component documentation
3. API service documentation
4. Permission matrix
5. User guide for each admin role

## Deliverables

1. Complete React + TypeScript application
2. All 4 admin role implementations
3. RBAC system with permission management
4. Mock data for all modules
5. Responsive UI components
6. Role-based routing
7. Comprehensive documentation
8. Clean, maintainable code with comments

## Quality Standards

- TypeScript strict mode enabled
- No console errors or warnings
- Accessible UI (ARIA labels, keyboard navigation)
- Smooth animations (60fps)
- Loading states for all async operations
- Error boundaries for error handling
- Consistent code formatting
- Reusable component architecture

## Success Criteria

The implementation is successful when:
1. ✅ All 4 admin roles are fully functional
2. ✅ Role-based permissions work correctly
3. ✅ All CRUD operations are implemented
4. ✅ UI is consistent with existing design
5. ✅ Mock data simulates realistic scenarios
6. ✅ Navigation adapts based on user role
7. ✅ All components are responsive
8. ✅ Code is well-documented and maintainable

---

## Additional Guidelines

- Use functional components with hooks
- Implement proper TypeScript typing
- Follow existing naming conventions
- Maintain dark theme consistency
- Add smooth micro-interactions
- Implement optimistic UI updates
- Show loading skeletons
- Handle edge cases gracefully
- Add helpful error messages
- Include empty states with illustrations

---

Would you like me to:
1. Generate the complete implementation?
2. Start with a specific phase?
3. Create additional mock data?
4. Design specific components first?
