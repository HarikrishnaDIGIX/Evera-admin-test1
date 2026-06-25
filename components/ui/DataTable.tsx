import React from 'react';
import { Icons } from './Icons';

export interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
    renderExpansion?: (item: T) => React.ReactNode;
    expandedKey?: string | number;
}

export function DataTable<T>({
    columns,
    data,
    isLoading,
    onRowClick,
    emptyMessage = "No data available",
    renderExpansion,
    expandedKey
}: DataTableProps<T>) {
    if (isLoading) {
        return (
            <div className="w-full p-8 flex justify-center items-center text-evera-muted">
                <Icons.Undo className="animate-spin mr-2" /> Loading...
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="w-full p-8 text-center text-evera-muted border border-dashed border-evera-border rounded-lg">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto rounded-lg border border-evera-border/50">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-evera-muted bg-white/5 uppercase">
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} className={`px-4 py-3 font-medium ${col.className || ''}`}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIdx) => {
                        const isExpanded = expandedKey !== undefined && (row as any).id === expandedKey;
                        return (
                            <React.Fragment key={rowIdx}>
                                <tr
                                    onClick={() => onRowClick && onRowClick(row)}
                                    className={`
                                        border-b border-evera-border/30 last:border-0 hover:bg-white/5 transition-colors
                                        ${onRowClick ? 'cursor-pointer' : ''}
                                        ${isExpanded ? 'bg-white/5' : ''}
                                    `}
                                >
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className={`px-4 py-3 ${col.className || ''}`}>
                                            {col.cell ? col.cell(row) : (col.accessorKey ? String(row[col.accessorKey] ?? '') : '')}
                                        </td>
                                    ))}
                                </tr>
                                {isExpanded && renderExpansion && (
                                    <tr className="bg-evera-bg/50 border-b border-evera-border/30">
                                        <td colSpan={columns.length} className="p-0 animate-fade-in">
                                            {renderExpansion(row)}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
