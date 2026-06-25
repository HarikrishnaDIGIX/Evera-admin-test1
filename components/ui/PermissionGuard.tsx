import React from 'react';
import { useApp } from '../../context/AppContext';

interface PermissionGuardProps {
    module?: string;
    action?: string;
    route?: string;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    module,
    action,
    route,
    fallback = null,
    children
}) => {
    const { hasPermission, canAccessRoute } = useApp();

    if (route) {
        if (canAccessRoute(route)) return <>{children}</>;
        return <>{fallback}</>;
    }

    if (module && action) {
        if (hasPermission(module, action)) return <>{children}</>;
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
