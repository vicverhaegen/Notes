import React, { useState } from 'react';
import { Card as CardType } from '../types';
import { X, Calendar, AlignLeft, Trash2 } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

interface CardModalProps {
  card: CardType;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedCard: CardType) => void;
  onDelete: (cardId: string) => void;
}

export const CardModal: React.FC<CardModalProps> = ({
  card,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [dueDate, setDueDate] = useState<string>(card.dueDate || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    onUpdate({
      ...card,
      title: title.trim() || 'Naamloze kaart',
      description,
      dueDate: dueDate || null,
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-in fade-in duration-150"
        style={{
          paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
          paddingLeft: 'calc(1rem + env(safe-area-inset-left, 0px))',
          paddingRight: 'calc(1rem + env(safe-area-inset-right, 0px))',
        }}
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 pb-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              placeholder="Kaart titel"
              className="flex-1 text-base font-semibold text-slate-800 bg-transparent border-0 focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 rounded-lg px-2 py-1 -ml-2"
            />
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="px-5 pb-5 space-y-4">
            {/* Due date row */}
            <div>
              <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5" /> Vervaldatum
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    onUpdate({
                      ...card,
                      title,
                      description,
                      dueDate: e.target.value || null,
                    });
                  }}
                  className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
                />
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => {
                      setDueDate('');
                      onUpdate({
                        ...card,
                        title,
                        description,
                        dueDate: null,
                      });
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Datum wissen
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1.5">
                <AlignLeft className="w-3.5 h-3.5" /> Beschrijving
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleSave}
                placeholder="Voeg een gedetailleerdere beschrijving toe..."
                rows={4}
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-5 py-3 bg-slate-50/60 border-t border-slate-100">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Verwijderen
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              Sluiten
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Kaart verwijderen"
        message={`Weet je zeker dat je "${card.title}" wilt verwijderen?`}
        confirmLabel="Verwijderen"
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDelete(card.id);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};
