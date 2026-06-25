import React from 'react';
import { Icons } from './Icons';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onCancel}
      />

      {/* Dialog Body */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-[#241E1B] border border-[#38302C] p-6 text-left shadow-2xl transition-all animate-scale-in">
        <div className="flex items-start gap-4">
          <div 
            className={`p-3 rounded-full flex-shrink-0 ${
              isDestructive 
                ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                : 'bg-[#f48c25]/10 text-[#f48c25] border border-[#f48c25]/20'
            }`}
          >
            {isDestructive ? <Icons.Reject size={22} /> : <Icons.Check size={22} />}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white leading-6">{title}</h3>
            <p className="mt-2 text-sm text-[#A8A29E] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-[#161210] border border-[#38302C] hover:bg-[#38302C]/20 text-[#A8A29E] hover:text-white rounded-xl text-xs font-semibold transition-all"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 font-semibold text-white rounded-xl text-xs transition-all shadow-md ${
              isDestructive 
                ? 'bg-red-600 hover:bg-red-500 shadow-red-950/20' 
                : 'bg-[#f48c25] hover:bg-[#d9751a] shadow-orange-950/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
