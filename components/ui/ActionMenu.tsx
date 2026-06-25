import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';

export interface ActionMenuItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  isDestructive?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  align?: 'left' | 'right';
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  items,
  align = 'right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-[#A8A29E] hover:text-white rounded-lg hover:bg-white/5 transition-colors focus:outline-none"
      >
        <Icons.More size={16} />
      </button>

      {isOpen && (
        <div 
          className={`absolute z-30 mt-1 w-44 rounded-xl bg-[#241E1B] border border-[#38302C] shadow-2xl py-1 focus:outline-none animate-fade-in ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-white/5 transition-colors ${
                item.isDestructive 
                  ? 'text-red-400 hover:text-red-300' 
                  : 'text-[#F5F5F4] hover:text-[#f48c25]'
              }`}
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
