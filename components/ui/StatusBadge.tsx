import React from 'react';

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
    const getStatusColor = (status: string | undefined | null) => {
        if (!status) return 'bg-evera-muted/10 text-evera-muted border-evera-muted/20';
        const s = status.toUpperCase();

        // Success / Active
        if (['ACTIVE', 'COMPLETED', 'PAID', 'RESOLVED', 'CONFIRMED'].includes(s)) {
            return 'bg-green-500/10 text-green-500 border-green-500/20';
        }

        // Warning / Pending
        if (['PENDING', 'PROCESSING', 'IN_PROGRESS', 'INVESTIGATING', 'PENDING_APPROVAL'].includes(s)) {
            return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        }
        
        // Escalated / Critical
        if (['ESCALATED'].includes(s)) {
            return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
        }

        // Waiting states
        if (['WAITING_FOR_USER'].includes(s)) {
            return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
        }
        if (['WAITING_FOR_PROVIDER'].includes(s)) {
            return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
        }

        // Muted / Initial
        if (['START_REVIEW', 'DOCUMENTS_REQUIRED'].includes(s)) {
            return 'bg-evera-muted/10 text-evera-muted border-evera-muted/20';
        }

        // Error / Failed / Critical
        if (['FAILED', 'OVERDUE', 'URGENT', 'HIGH', 'SUSPENDED', 'DELETED', 'CANCELLED', 'REJECTED', 'REFUNDED'].includes(s)) {
            return 'bg-red-500/10 text-red-500 border-red-500/20';
        }

        // Info / Draft
        if (['DRAFT', 'SENT', 'OPEN'].includes(s)) {
            return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        }

        // Default
        return 'bg-evera-muted/10 text-evera-muted border-evera-muted/20';
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)} ${className}`}>
            {status ? status.replace(/_/g, ' ') : 'UNKNOWN'}
        </span>
    );
};
