import React, { useState } from 'react';
import { Column as ColumnType, Card as CardType } from '../types';
import { CardItem } from './CardItem';
import { Plus, X, Trash2, GripVertical } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { hexToRgba, isDarkColor } from '../colorUtils';

interface ColumnProps {
  column: ColumnType;
  cards: CardType[];
  onAddCard: (columnId: string, title: string) => void;
  onEditColumnTitle: (columnId: string, newTitle: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onCardClick: (card: CardType) => void;
  onToggleCardComplete: (e: React.MouseEvent, cardId: string) => void;
  onDragStartCard: (e: React.DragEvent, cardId: string, sourceColId: string) => void;
  onDragEndCard: (e: React.DragEvent) => void;
  onDropCard: (e: React.DragEvent, targetColId: string) => void;
  onDragStartColumn?: (e: React.DragEvent, columnId: string) => void;
  onDragEndColumn?: (e: React.DragEvent) => void;
  onDragOverColumn?: (e: React.DragEvent, columnId: string) => void;
  onDragLeaveColumn?: (columnId: string) => void;
  onDropColumn?: (targetColId: string) => void;
  isDraggingColumn?: boolean;
  isColumnDragOver?: boolean;
  isAnyColumnDragging?: boolean;
  listColor?: string;
  listOpacity?: number;
}

export const Column: React.FC<ColumnProps> = ({
  column,
  cards,
  onAddCard,
  onEditColumnTitle,
  onDeleteColumn,
  onCardClick,
  onToggleCardComplete,
  onDragStartCard,
  onDragEndCard,
  onDropCard,
  onDragStartColumn,
  onDragEndColumn,
  onDragOverColumn,
  onDragLeaveColumn,
  onDropColumn,
  isDraggingColumn = false,
  isColumnDragOver = false,
  isAnyColumnDragging = false,
  listColor = '#ffffff',
  listOpacity = 70,
}) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [columnTitle, setColumnTitle] = useState(column.title);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isDark = isDarkColor(listColor, listOpacity);

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    onAddCard(column.id, newCardTitle.trim());
    setNewCardTitle('');
    setIsAddingCard(false);
  };

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (columnTitle.trim()) {
      onEditColumnTitle(column.id, columnTitle.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (isAnyColumnDragging) {
          onDragOverColumn?.(e, column.id);
        } else {
          setIsDragOver(true);
        }
      }}
      onDragLeave={() => {
        if (isAnyColumnDragging) {
          onDragLeaveColumn?.(column.id);
        } else {
          setIsDragOver(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (isAnyColumnDragging) {
          onDropColumn?.(column.id);
        } else {
          onDropCard(e, column.id);
        }
      }}
      className={`column-container flex flex-col w-72 shrink-0 backdrop-blur-xl rounded-xl p-2.5 border shadow-xs max-h-full transition-all duration-150 ${
        isDark ? 'border-white/20' : 'border-white/40'
      } ${isDragOver && !isAnyColumnDragging ? 'ring-2 ring-blue-400/80' : ''} ${
        isDraggingColumn ? 'opacity-40 scale-[0.98]' : ''
      } ${
        isColumnDragOver ? 'ring-2 ring-blue-500 shadow-xl scale-[1.01]' : ''
      }`}
      style={{
        backgroundColor: hexToRgba(listColor, listOpacity),
      }}
    >
      {/* Column Header (Draggable Handle for reordering) */}
      <div
        draggable={!isEditingTitle}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', column.id);
          e.dataTransfer.effectAllowed = 'move';
          onDragStartColumn?.(e, column.id);
        }}
        onDragEnd={(e) => {
          onDragEndColumn?.(e);
        }}
        className="flex items-center justify-between px-1.5 py-1 mb-1.5 group/header cursor-grab active:cursor-grabbing select-none"
        title="Sleep om volgorde van lijst te wijzigen"
      >
        <div className="flex items-center gap-1 flex-1 min-w-0 mr-1">
          <GripVertical
            className={`w-3.5 h-3.5 opacity-30 group-hover/header:opacity-80 shrink-0 transition-opacity cursor-grab active:cursor-grabbing ${
              isDark ? 'text-white' : 'text-slate-500'
            }`}
          />
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex-1 mr-2">
              <input
                type="text"
                autoFocus
                value={columnTitle}
                onChange={(e) => setColumnTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                className={`w-full text-[14px] font-semibold px-2 py-0.5 rounded-md border focus:outline-hidden ${
                  isDark
                    ? 'text-white bg-slate-900/90 border-blue-400'
                    : 'text-slate-800 bg-white/90 border-blue-400'
                }`}
              />
            </form>
          ) : (
            <h3
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
              className={`text-[14px] font-semibold tracking-tight cursor-pointer truncate py-0.5 transition-colors ${
                isDark ? 'text-white hover:text-white/90' : 'text-slate-800 hover:text-slate-900'
              }`}
            >
              {column.title}
            </h3>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(true);
          }}
          className={`opacity-0 group-hover/header:opacity-100 p-1 rounded transition-all cursor-pointer ${
            isDark
              ? 'text-white/60 hover:text-red-400 hover:bg-white/10'
              : 'text-slate-400 hover:text-red-500 hover:bg-black/5'
          }`}
          title="Lijst verwijderen"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cards Area */}
      <div className="cards-scroll-area flex-1 overflow-y-auto space-y-2 pr-0.5 min-h-[30px]">
        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            columnId={column.id}
            onClick={() => onCardClick(card)}
            onDragStart={onDragStartCard}
            onDragEnd={onDragEndCard}
            onToggleComplete={onToggleCardComplete}
          />
        ))}
      </div>

      {/* Add Card Section */}
      <div className="mt-2 pt-1">
        {isAddingCard ? (
          <form onSubmit={handleAddCardSubmit} className="space-y-2">
            <textarea
              autoFocus
              placeholder="Voer een titel voor deze kaart in..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddCardSubmit(e);
                }
              }}
              rows={2}
              className="w-full p-2 text-sm bg-white border border-slate-200/90 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 resize-none shadow-2xs"
            />
            <div className="flex items-center gap-1.5">
              <button
                type="submit"
                disabled={!newCardTitle.trim()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
              >
                Kaart toevoegen
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                }}
                className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                  isDark ? 'text-white/60 hover:text-white' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className={`w-full flex items-center gap-1.5 py-1.5 px-2 text-[13px] rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-white/80 hover:text-white hover:bg-white/10'
                : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
            }`}
          >
            <Plus className={`w-4 h-4 ${isDark ? 'text-white/70' : 'text-slate-500'}`} />
            <span>Voeg een kaart toe</span>
          </button>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Lijst verwijderen"
        message={`Weet je zeker dat je "${column.title}" en alle kaarten hierin wilt verwijderen?`}
        confirmLabel="Verwijderen"
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDeleteColumn(column.id);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
