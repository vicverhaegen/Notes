import React from 'react';
import { X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Verwijderen',
  cancelLabel = 'Annuleren',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-2xs animate-in fade-in duration-100"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-xs bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-xl shadow-xl p-4 overflow-hidden animate-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h3 className="text-xs font-semibold text-slate-800 tracking-tight">
            {title}
          </h3>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-[12px] text-slate-500 mt-2 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-1.5 mt-3.5 pt-2.5 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-3 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
              isDestructive
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
