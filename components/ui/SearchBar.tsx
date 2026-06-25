import React from 'react';
import { Icons } from './Icons';

interface SearchBarProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = "Search...", className = "" }) => {
    return (
        <div className={`relative ${className}`}>
            <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-evera-muted" size={18} />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 bg-black/20 border border-evera-border rounded-lg focus:outline-none focus:border-evera-primary text-white text-sm placeholder:text-evera-muted/50"
            />
        </div>
    );
};
