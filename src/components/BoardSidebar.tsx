import React, { useState } from 'react';
import { Board as BoardType } from '../types';
import { Plus, Trash2, X } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

interface BoardSidebarProps {
  boards: BoardType[];
  activeBoardId: string | null;
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: (title: string) => void;
  onDeleteBoard: (boardId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const BoardSidebar: React.FC<BoardSidebarProps> = ({
  boards,
  activeBoardId,
  onSelectBoard,
  onCreateBoard,
  onDeleteBoard,
  isOpen,
  onClose,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [boardToDelete, setBoardToDelete] = useState<BoardType | null>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateBoard(newTitle.trim());
    setNewTitle('');
    setIsCreating(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex bg-black/20 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200/80 flex flex-col h-full shadow-xl animate-in slide-in-from-left duration-150"
        onClick={(e) => e.stopPropagation()}
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-semibold text-slate-800 text-sm">Borden</span>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Board List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {boards.map((b) => {
            const isActive = b.id === activeBoardId;
            return (
              <div
                key={b.id}
                onClick={() => {
                  onSelectBoard(b.id);
                  onClose();
                }}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-700 hover:bg-slate-100/70'
                }`}
              >
                <span className="truncate">{b.title}</span>

                {boards.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setBoardToDelete(b);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 transition-opacity cursor-pointer"
                    title="Bord verwijderen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Create Board Section */}
        <div className="p-3 border-t border-slate-100">
          {isCreating ? (
            <form onSubmit={handleCreateSubmit} className="space-y-2">
              <input
                type="text"
                autoFocus
                placeholder="Bord naam..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/40"
              />
              <div className="flex items-center gap-1.5">
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Bord maken
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="py-1.5 px-2 text-xs text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Annuleren
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" /> Nieuw bord
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(boardToDelete)}
        title="Bord verwijderen"
        message={`Weet je zeker dat je bord "${boardToDelete?.title}" wilt verwijderen?`}
        confirmLabel="Verwijderen"
        onConfirm={() => {
          if (boardToDelete) {
            onDeleteBoard(boardToDelete.id);
            setBoardToDelete(null);
          }
        }}
        onCancel={() => setBoardToDelete(null)}
      />
    </div>
  );
};
