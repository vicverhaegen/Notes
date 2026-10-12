import React, { useState } from 'react';
import { Board, Card } from '../types';
import {
  Calendar,
  ChevronRight,
  Clock,
  Layout,
  Plus,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { formatTrelloDate, isDateOverdue } from '../dateUtils';
import { ConfirmDialog } from './ConfirmDialog';
import { hexToRgba } from '../colorUtils';

interface HomePageProps {
  boards: Board[];
  onSelectBoard: (boardId: string) => void;
  onNavigateToCard: (boardId: string, card: Card) => void;
  onCreateBoard: (title: string) => void;
  onDeleteBoard: (boardId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  boards,
  onSelectBoard,
  onNavigateToCard,
  onCreateBoard,
  onDeleteBoard,
}) => {
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);

  // Collect all dated tasks across all boards
  const datedTasks: Array<{
    boardId: string;
    boardTitle: string;
    card: Card;
    columnTitle: string;
  }> = [];

  boards.forEach((b) => {
    b.columns.forEach((col) => {
      col.cardIds.forEach((cardId) => {
        const card = b.cards[cardId];
        if (card && card.dueDate) {
          datedTasks.push({
            boardId: b.id,
            boardTitle: b.title,
            card,
            columnTitle: col.title,
          });
        }
      });
    });
  });

  // Sort by date ascending
  datedTasks.sort((a, b) => {
    const da = a.card.dueDate || '';
    const db = b.card.dueDate || '';
    return da.localeCompare(db);
  });

  const pendingTasks = datedTasks.filter((t) => !t.card.completed);
  const completedTasks = datedTasks.filter((t) => t.card.completed);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    onCreateBoard(newBoardTitle.trim());
    setNewBoardTitle('');
    setIsCreatingBoard(false);
  };

  return (
    <div
      className="flex-1 overflow-y-auto bg-gradient-to-br from-[#f1f5f9] via-[#f8fafc] to-[#e2e8f0] p-6 sm:p-10 select-none"
      style={{
        paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
        {/* Header Banner */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Welkom bij Notes
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Selecteer een bord of bekijk je geplande taken hieronder.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreatingBoard(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nieuw bord
          </button>
        </div>

        {/* Create Board Inline Modal / Form */}
        {isCreatingBoard && (
          <form
            onSubmit={handleCreateSubmit}
            className="p-4 bg-white/90 backdrop-blur-xl rounded-2xl border border-white/80 shadow-md flex items-center gap-3 animate-in fade-in zoom-in-95 duration-150"
          >
            <input
              type="text"
              autoFocus
              placeholder="Voer bordnaam in..."
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              className="flex-1 p-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/40"
            />
            <button
              type="submit"
              disabled={!newBoardTitle.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Aanmaken
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreatingBoard(false);
                setNewBoardTitle('');
              }}
              className="px-3 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Annuleren
            </button>
          </form>
        )}

        {/* Section 1: Borden Grid */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-slate-400" /> Jouw Borden ({boards.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {boards.map((b) => (
              <div
                key={b.id}
                onClick={() => onSelectBoard(b.id)}
                className="group relative h-28 rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 border border-white/60 shadow-xs hover:shadow-lg hover:scale-[1.015] overflow-hidden"
                style={{ background: b.background || '#cbd5e1' }}
              >
                {/* Background filter overlay if configured */}
                {Boolean(b.bgFilterOpacity && b.bgFilterOpacity > 0) && (
                  <div
                    className="absolute inset-0 pointer-events-none transition-all"
                    style={{
                      backgroundColor: hexToRgba(b.bgFilterColor || '#000000', b.bgFilterOpacity || 0),
                    }}
                  />
                )}

                {/* Overlay backdrop */}
                <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors" />

                <div className="relative z-10 flex items-start justify-between">
                  <span className="text-base font-bold text-white drop-shadow-sm truncate pr-2">
                    {b.title}
                  </span>

                  {boards.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBoardToDelete(b);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-white/80 hover:text-red-300 hover:bg-black/20 rounded-lg transition-all cursor-pointer"
                      title="Bord verwijderen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative z-10 flex items-center justify-between text-xs text-white/80 font-medium">
                  <span>
                    {b.columns.reduce((acc, c) => acc + c.cardIds.length, 0)} taken
                  </span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Openen</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Takenlijst met data */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" /> Geplande Taken ({pendingTasks.length})
            </h2>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="p-8 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md text-center text-xs text-slate-400 shadow-2xs">
              Geen openstaande taken met een vervaldatum gevonden over je borden.
            </div>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map((t) => {
                const overdue = t.card.dueDate ? isDateOverdue(t.card.dueDate) : false;
                return (
                  <div
                    key={t.card.id}
                    onClick={() => onNavigateToCard(t.boardId, t.card)}
                    className="group flex items-center justify-between p-3.5 rounded-xl border border-white/60 hover:border-blue-300/80 bg-white/80 hover:bg-white backdrop-blur-md transition-all cursor-pointer shadow-xs hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                      {/* Date badge */}
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 ${
                          overdue
                            ? 'bg-[#ffebee] text-[#c62828]'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 stroke-[2]" />
                        <span>{formatTrelloDate(t.card.dueDate!)}</span>
                      </div>

                      {/* Title & Board name */}
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-slate-800 block truncate">
                          {t.card.title}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                          {t.boardTitle} • {t.columnTitle}
                        </span>
                      </div>
                    </div>

                    {/* Ga naar taak button */}
                    <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0">
                      <span>Ga naar taak</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Completed Accordion */}
          {completedTasks.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200/60">
              <span className="text-xs font-semibold text-slate-400 block mb-2">
                Voltooide taken ({completedTasks.length})
              </span>
              <div className="space-y-1.5 opacity-60 hover:opacity-100 transition-opacity">
                {completedTasks.map((t) => (
                  <div
                    key={t.card.id}
                    onClick={() => onNavigateToCard(t.boardId, t.card)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/60 text-xs text-slate-500 cursor-pointer hover:bg-white transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="line-through truncate text-slate-600 font-medium">
                        {t.card.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <span>{t.boardTitle}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
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
