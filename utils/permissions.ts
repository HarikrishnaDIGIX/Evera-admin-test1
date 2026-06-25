import { AdminRole, Permission } from '../types';

export class PermissionManager {
    private static permissions: Record<AdminRole, Record<string, string[]>> = {
        [AdminRole.SUPER_ADMIN]: {
            // Inherited Operations Permissions
            'bookings': ['view', 'edit', 'delete', 'approve'],
            'vendors': ['view', 'edit', 'approve', 'suspend'],
            'disputes': ['view', 'resolve'],
            'analytics': ['view'],
            // Inherited Finance Permissions
            'payments': ['view', 'process', 'refund'],
            'settlements': ['view', 'process'],
            'withdrawals': ['view', 'process'],
            'invoices': ['view', 'create', 'send'],
            'reports': ['view', 'export'],
            // Inherited Support Permissions
            'tickets': ['view', 'create', 'edit', 'resolve', 'delete'],
            'users': ['view', 'edit'],
            'support-workers': ['view', 'create', 'edit', 'delete'],
            'support-reports': ['view'],
            // Super Admin Governance Permissions
            'admins': ['view', 'create', 'edit', 'delete', 'role-change'],
            'audit-logs': ['view', 'export'],
            'settings': ['view', 'edit'],
            'dashboard': ['view']
        },
        [AdminRole.OPERATIONS_ADMIN]: {
            'bookings': ['view', 'edit', 'delete', 'approve'],
            'vendors': ['view', 'edit', 'approve', 'suspend'],
            'people': ['view', 'edit'],
            'users': ['view', 'edit'],
            'disputes': ['view', 'resolve'],
            'analytics': ['view'],
            'tickets': ['view', 'resolve'],
            'support-workers': ['view', 'create', 'edit', 'delete'],
        },
        [AdminRole.FINANCE_ADMIN]: {
            'payments': ['view', 'process', 'refund'],
            'settlements': ['view', 'process'],
            'withdrawals': ['view', 'process'],
            'invoices': ['view', 'create', 'send'],
            'reports': ['view', 'export'],
            'tickets': ['view', 'create', 'edit'],
            'dashboard': ['view']
        },
        [AdminRole.SUPPORT_ADMIN]: {
            'tickets': ['view', 'create', 'edit', 'resolve', 'delete'],
            'users': ['view', 'edit'],
            'vendors': ['view'],
            'support-workers': ['view', 'create', 'edit', 'delete'],
            'support-reports': ['view'],
            'analytics': ['view'],
            'dashboard': ['view']
        },
        [AdminRole.SUPPORT_WORKER]: {
            'tickets': ['view', 'edit', 'resolve'],
            'users': ['view'],
            'dashboard': ['view']
        },
        [AdminRole.OPERATIONS_WORKER]: {
            'vendors': ['view', 'verify_docs'],
            'bookings': ['view'],
            'tickets': ['view', 'edit', 'resolve'],
            'people': ['view'],
            'dashboard': ['view']
        }
    };

    private static accessibleRoutes: Record<AdminRole, string[]> = {
        [AdminRole.SUPER_ADMIN]: [
            'dashboard', 'bookings', 'payments', 'settlements', 'withdrawals',
            'tickets', 'disputes', 'vendors', 'admins', 'people',
            'audit-logs', 'settings', 'users', 'invoices', 'reports',
            'support-workers', 'support-reports'
        ],
        [AdminRole.OPERATIONS_ADMIN]: [
            'dashboard', 'bookings', 'disputes', 'vendors', 'analytics', 'people', 'tickets', 'users', 'support-workers'
        ],
        [AdminRole.FINANCE_ADMIN]: [
            'dashboard', 'payments', 'settlements', 'withdrawals', 'invoices',
            'reconciliation', 'reports', 'tickets'
        ],
        [AdminRole.SUPPORT_ADMIN]: [
            'dashboard', 'tickets', 'users', 'vendors', 'analytics',
            'support-workers', 'support-reports'
        ],
        [AdminRole.SUPPORT_WORKER]: [
            'dashboard', 'tickets', 'users'
        ],
        [AdminRole.OPERATIONS_WORKER]: [
            'dashboard', 'vendors', 'tickets', 'people'
        ]
    };

    static hasPermission(
        adminRole: AdminRole,
        module: string,
        action: string
    ): boolean {
        const rolePermissions = this.permissions[adminRole];
        if (!rolePermissions) return false;

        // Check module access
        if (!rolePermissions[module]) return false;

        // Check specific action or wildcard
        const moduleActions = rolePermissions[module];
        return moduleActions.includes('*') || moduleActions.includes(action);
    }

    static canAccessModule(adminRole: AdminRole, module: string): boolean {
        return !!this.permissions[adminRole]?.[module];
    }

    static getAccessibleRoutes(adminRole: AdminRole): string[] {
        return this.accessibleRoutes[adminRole] || [];
    }
}
