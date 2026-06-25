import React from 'react';
import { Icons } from './Icons';

interface ExportButtonProps {
    onExport: () => void;
    isLoading?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ onExport, isLoading }) => {
    return (
        <button
            onClick={onExport}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-2 bg-evera-card border border-evera-border rounded-lg text-sm hover:bg-white/5 transition-colors disabled:opacity-50"
        >
            <Icons.Download size={16} />
            <span>{isLoading ? 'Exporting...' : 'Export'}</span>
        </button>
    );
};
