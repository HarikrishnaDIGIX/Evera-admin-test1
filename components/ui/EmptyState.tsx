import React from 'react';
import { Icons } from './Icons';

interface EmptyStateProps {
    message?: string;
    description?: string;
    action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    message = "No items found",
    description,
    action
}) => (
    <div className="flex flex-col items-center justify-center py-12 text-evera-muted border border-dashed border-evera-border/50 rounded-lg">
        <Icons.Search size={48} className="mb-4 opacity-20" />
        <h3 className="text-lg font-medium text-white mb-1">{message}</h3>
        {description && <p className="text-sm mb-4">{description}</p>}
        {action}
    </div>
);
