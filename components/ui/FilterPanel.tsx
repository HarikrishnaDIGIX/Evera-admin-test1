import React from 'react';
import { Icons } from './Icons';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  id: string;
  label: string;
  type: 'select' | 'text' | 'date';
  options?: FilterOption[];
  placeholder?: string;
}

interface FilterPanelProps {
  fields: FilterField[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  onClear: () => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  fields,
  values,
  onChange,
  onClear,
  className = ''
}) => {
  return (
    <div className={`bg-[#241E1B] border border-[#38302C] rounded-xl p-4 space-y-4 ${className}`}>
      <div className="flex justify-between items-center pb-2 border-b border-[#38302C]/50">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Icons.Filter size={16} className="text-[#f48c25]" />
          <span>Filters</span>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-[#A8A29E] hover:text-white transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {fields.map(field => (
          <div key={field.id} className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider">
              {field.label}
            </label>
            {field.type === 'select' ? (
              <div className="relative">
                <select
                  value={values[field.id] || ''}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  className="w-full bg-[#161210] border border-[#38302C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#f48c25] transition-all cursor-pointer appearance-none"
                >
                  <option value="">All</option>
                  {field.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-[#A8A29E]">
                  <Icons.ChevronDown size={14} />
                </span>
              </div>
            ) : field.type === 'date' ? (
              <input
                type="date"
                value={values[field.id] || ''}
                onChange={(e) => onChange(field.id, e.target.value)}
                className="w-full bg-[#161210] border border-[#38302C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#f48c25] transition-all"
              />
            ) : (
              <input
                type="text"
                value={values[field.id] || ''}
                onChange={(e) => onChange(field.id, e.target.value)}
                placeholder={field.placeholder || 'Search...'}
                className="w-full bg-[#161210] border border-[#38302C] rounded-lg px-3 py-2 text-xs text-white placeholder-[#A8A29E]/45 focus:outline-none focus:border-[#f48c25] transition-all"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
