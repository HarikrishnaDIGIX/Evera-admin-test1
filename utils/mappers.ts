import { AdminRole, AdminUser } from '../types';

export const mapRoleToFrontend = (backendRole: string): AdminRole => {
  if (!backendRole) return AdminRole.SUPER_ADMIN;
  
  const formattedRole = backendRole.toUpperCase();
  
  switch (formattedRole) {
    case 'SUPER_ADMIN':
      return AdminRole.SUPER_ADMIN;
    case 'OPERATIONS_ADMIN':
      return AdminRole.OPERATIONS_ADMIN;
    case 'FINANCE_ADMIN':
      return AdminRole.FINANCE_ADMIN;
    case 'SUPPORT_ADMIN':
      return AdminRole.SUPPORT_ADMIN;
    case 'VENDOR_ADMIN': // if used
      return AdminRole.OPERATIONS_ADMIN; 
    case 'OPERATIONS_WORKER':
      return AdminRole.OPERATIONS_WORKER;
    case 'SUPPORT_WORKER':
      return AdminRole.SUPPORT_WORKER;
    default:
      return AdminRole.SUPER_ADMIN;
  }
};

export const mapAdminUserToFrontend = (backendAdmin: any): AdminUser => {
  // The backend might return { user: {...}, profile: {...} } or just the user directly
  const userData = backendAdmin.user ? backendAdmin.user : backendAdmin;
  
  // Construct name from first/last if available, else username
  let fullName = userData.name || userData.username || 'Admin';
  if (userData.first_name || userData.last_name) {
    fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
  }
  
  // Role might be an object (role.name) or just a string
  let roleStr = 'super_admin';
  if (userData.role) {
    roleStr = typeof userData.role === 'string' ? userData.role : userData.role.name;
  }
  
  return {
    id: userData.id ? userData.id.toString() : '1',
    name: fullName,
    email: userData.email,
    role: mapRoleToFrontend(roleStr),
    permissions: [],
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=f48c25&color=fff`,
    createdAt: userData.created_at || userData.date_joined || new Date().toISOString(),
    lastLogin: userData.updated_at || new Date().toISOString(),
    isActive: userData.status === 'ACTIVE' || userData.is_active || true,
    phone: userData.number || userData.phone || '',
    employee_id: userData.employee_id || `EMP-${userData.id || ''}`
  };
};
