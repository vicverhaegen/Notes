import React, { useState, useEffect, useRef } from 'react';
import { AppData, Board, Column as ColumnType, Card as CardType } from './types';
import { loadAppData, saveAppData, subscribeToCloudUpdates } from './storage';
import { Column } from './components/Column';
import { CardModal } from './components/CardModal';
import { BoardSidebar } from './components/BoardSidebar';
import { TopNavbar } from './components/TopNavbar';
import { BoardSettingsModal } from './components/BoardSettingsModal';
import { HomePage } from './components/HomePage';
import { Plus, X } from 'lucide-react';
import { hexToRgba, isDarkColor } from './colorUtils';

export function App() {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHomePage, setIsHomePage] = useState(true);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  // Drag-and-drop state
  const [draggedCardInfo, setDraggedCardInfo] = useState<{
    cardId: string;
    sourceColId: string;
  } | null>(null);
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  useEffect(() => {
    loadAppData().then((data) => {
      setAppData(data);

      // Check for tasks due today or tomorrow to send a desktop notification
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const dueSoonTasks: string[] = [];
        data.boards.forEach((b) => {
          Object.values(b.cards).forEach((c) => {
            if (!c.completed && c.dueDate) {
              if (c.dueDate === todayStr) {
                dueSoonTasks.push(`Vandaag: ${c.title}`);
              } else if (c.dueDate === tomorrowStr) {
                dueSoonTasks.push(`Morgen: ${c.title}`);
              }
            }
          });
        });

        if (dueSoonTasks.length > 0 && typeof window !== 'undefined' && window.electronAPI?.sendNotification) {
          window.electronAPI.sendNotification(
            'Notes Herinnering',
            dueSoonTasks.slice(0, 3).join('\n') + (dueSoonTasks.length > 3 ? ` (+${dueSoonTasks.length - 3} meer)` : '')
          );
        }
      } catch (err) {
        console.error('Notification error:', err);
      }
    });

    // Listen for live updates from iPhone / other tabs / devices
    const unsubscribe = subscribeToCloudUpdates((remoteData) => {
      setAppData(remoteData);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const boardScrollRef = useRef<HTMLDivElement>(null);

  // Handle wheel scrolling:
  // - Scrolling over a column scrolls that list vertically
  // - Scrolling beside a list (board background, gaps, margins) scrolls the board horizontally
  useEffect(() => {
    const el = boardScrollRef.current;
    if (!el || isHomePage) return;

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      const columnEl = target?.closest('.column-container') as HTMLElement | null;
      const scrollableCards = columnEl?.querySelector('.cards-scroll-area') as HTMLElement | null;

      // If the cursor is on/over a list:
      if (columnEl && scrollableCards) {
        // If scrolling inside the cards area, allow native vertical scroll
        if (target?.closest('.cards-scroll-area')) {
          return;
        }

        // If scrolling on column header or footer, scroll the cards area vertically
        if (scrollableCards.scrollHeight > scrollableCards.clientHeight) {
          e.preventDefault();
          scrollableCards.scrollTop += e.deltaY;
          return;
        }
        return;
      }

      // If scrolling BESIDE a list (board background, spaces between columns, + Voeg nog een lijst toe):
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [isHomePage, appData?.activeBoardId]);

  const updateAppData = (updater: (prev: AppData) => AppData) => {
    setAppData((prev) => {
      if (!prev) return prev;
      const updated = updater(prev);
      saveAppData(updated);
      return updated;
    });
  };

  if (!appData) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-100 text-slate-500">
        <span className="text-sm">Laden...</span>
      </div>
    );
  }

  const currentBoard: Board | undefined =
    appData.boards.find((b) => b.id === appData.activeBoardId) || appData.boards[0];

  // Board operations
  const handleSelectBoard = (boardId: string) => {
    setIsHomePage(false);
    updateAppData((prev) => ({
      ...prev,
      activeBoardId: boardId,
    }));
  };

  const handleCreateBoard = (title: string) => {
    const newBoardId = `board-${Date.now()}`;
    const newBoard: Board = {
      id: newBoardId,
      title,
      background: 'linear-gradient(to bottom right, #dfe7ef, #e2e8f0, #cbd5e1)',
      bgFilterColor: '#000000',
      bgFilterOpacity: 0,
      listColor: '#ffffff',
      listOpacity: 70,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      columns: [
        { id: `col-${Date.now()}-1`, title: 'Te doen', cardIds: [] },
        { id: `col-${Date.now()}-2`, title: 'Bezig', cardIds: [] },
        { id: `col-${Date.now()}-3`, title: 'Gedaan', cardIds: [] },
      ],
      cards: {},
    };

    setIsHomePage(false);
    updateAppData((prev) => ({
      ...prev,
      boards: [...prev.boards, newBoard],
      activeBoardId: newBoardId,
    }));
  };

  const handleDeleteBoard = (boardId: string) => {
    updateAppData((prev) => {
      const remaining = prev.boards.filter((b) => b.id !== boardId);
      return {
        ...prev,
        boards: remaining,
        activeBoardId: remaining.length > 0 ? remaining[0].id : null,
      };
    });
  };

  const handleUpdateSettings = (settings: {
    background?: string;
    bgFilterColor?: string;
    bgFilterOpacity?: number;
    listColor?: string;
    listOpacity?: number;
  }) => {
    if (!currentBoard) return;
    updateAppData((prev) => ({
      ...prev,
      boards: prev.boards.map((b) =>
        b.id === currentBoard.id
          ? {
              ...b,
              ...settings,
              updatedAt: Date.now(),
            }
          : b
      ),
    }));
  };

  // Column operations
  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim() || !currentBoard) return;

    const newColumn: ColumnType = {
      id: `col-${Date.now()}`,
      title: newColumnTitle.trim(),
      cardIds: [],
    };

    updateAppData((prev) => ({
      ...prev,
      boards: prev.boards.map((b) =>
        b.id === currentBoard.id
          ? {
              ...b,
              columns: [...b.columns, newColumn],
              updatedAt: Date.now(),
            }
          : b
      ),
    }));

    setNewColumnTitle('');
    setIsAddingColumn(false);
  };

  const handleEditColumnTitle = (columnId: string, newTitle: string) => {
    if (!currentBoard) return;
    updateAppData((prev) => ({
      ...prev,
      boards: prev.boards.map((b) =>
        b.id === currentBoard.id
          ? {
              ...b,
              columns: b.columns.map((col) =>
                col.id === columnId ? { ...col, title: newTitle } : col
              ),
              updatedAt: Date.now(),
            }
          : b
      ),
    }));
  };

  const handleDeleteColumn = (columnId: string) => {
    if (!currentBoard) return;
    updateAppData((prev) => ({
      ...prev,
      boards: prev.boards.map((b) =>
        b.id === currentBoard.id
          ? {
              ...b,
              columns: b.columns.filter((col) => col.id !== columnId),
              updatedAt: Date.now(),
            }
          : b
      ),
    }));
  };

  // Card operations
  const handleAddCard = (columnId: string, title: string) => {
    if (!currentBoard) return;
    const newCardId = `card-${Date.now()}`;
    const newCard: CardType = {
      id: newCardId,
      title,
      description: '',
      dueDate: null,
      completed: false,
      createdAt: Date.now(),
    };

    updateAppData((prev) => ({
      ...prev,
      boards: prev.boards.map((b) => {
        if (b.id !== currentBoard.id) return b;
        return {
          ...b,
          cards: { ...b.cards, [newCardId]: newCard },
          columns: b.columns.map((col) =>
            col.id === columnId
              ? { ...col, cardIds: [...col.cardIds, newCardId] }
              : col
          ),
          updatedAt: Date.now(),
        };
      }),
    }));
  };

  const handleUpdateCard = (updatedCard: CardType) => {
    if (!currentBoard) return;
    setSelectedCard(updatedCard);
    updateAppData((prev) => ({
      ...prev,
      boards: prev.boards.map((b) => {
        if (b.id !== currentBoard.id) return b;
        return {
          ...b,
          cards: { ...b.cards, [updatedCard.id]: updatedCard },
          updatedAt: Date.now(),
        };
      }),
    }));
  };

  const handleDeleteCard = (cardId: string) => {
    if (!currentBoard) return;
    setSelectedCard(null);
    updateAppData((prev) => ({
      ...prev,
      boards: prev.boards.map((b) => {
        if (b.id !== currentBoard.id) return b;
        const newCards = { ...b.cards };
        delete newCards[cardId];
        return {
          ...b,
          cards: newCards,
          columns: b.columns.map((col) => ({
            ...col,
            cardIds: col.cardIds.filter((id) => id !== cardId),
          })),
          updatedAt: Date.now(),
        };
      }),
    }));
  };

  const handleToggleCardComplete = (e: React.MouseEvent, cardId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!currentBoard || !currentBoard.cards[cardId]) return;
    const currentCard = currentBoard.cards[cardId];
    const updatedCard = {
      ...currentCard,
      completed: !currentCard.completed,
    };

    updateAppData((prev) => ({
      ...prev,
      boards: prev.boards.map((b) => {
        if (b.id !== currentBoard.id) return b;
        return {
          ...b,
          cards: { ...b.cards, [cardId]: updatedCard },
          updatedAt: Date.now(),
        };
      }),
    }));
  };

  // Drag and drop handlers
  const handleDragStartCard = (
    _e: React.DragEvent,
    cardId: string,
    sourceColId: string
  ) => {
    setDraggedCardInfo({ cardId, sourceColId });
  };

  const handleDragEndCard = () => {
    setDraggedCardInfo(null);
  };

  const handleDropCard = (_e: React.DragEvent, targetColId: string) => {
    if (!draggedCardInfo || !currentBoard) return;
    const { cardId, sourceColId } = draggedCardInfo;

    updateAppData((prev) => ({
      ...prev,
      boards: prev.boards.map((b) => {
        if (b.id !== currentBoard.id) return b;

        const sourceCol = b.columns.find((c) => c.id === sourceColId);
        const targetCol = b.columns.find((c) => c.id === targetColId);
        if (!sourceCol || !targetCol) return b;

        if (sourceColId === targetColId) return b;

        return {
          ...b,
          columns: b.columns.map((col) => {
            if (col.id === sourceColId) {
              return {
                ...col,
                cardIds: col.cardIds.filter((id) => id !== cardId),
              };
            }
            if (col.id === targetColId) {
              return {
                ...col,
                cardIds: [...col.cardIds, cardId],
              };
            }
            return col;
          }),
          updatedAt: Date.now(),
        };
      }),
    }));

    setDraggedCardInfo(null);
  };

  // Column drag and drop handlers
  const handleDragStartColumn = (_e: React.DragEvent, columnId: string) => {
    setDraggedColumnId(columnId);
  };

  const handleDragEndColumn = () => {
    setDraggedColumnId(null);
    setDragOverColId(null);
  };

  const handleDragOverColumn = (e: React.DragEvent, columnId: string) => {
    if (draggedColumnId && draggedColumnId !== columnId) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (dragOverColId !== columnId) {
        setDragOverColId(columnId);
      }
    }
  };

  const handleDragLeaveColumn = (columnId: string) => {
    if (dragOverColId === columnId) {
      setDragOverColId(null);
    }
  };

  const handleDropColumn = (targetColId: string) => {
    if (!draggedColumnId || draggedColumnId === targetColId || !currentBoard) {
      setDraggedColumnId(null);
      setDragOverColId(null);
      return;
    }

    updateAppData((prev) => ({
      ...prev,
      boards: prev.boards.map((b) => {
        if (b.id !== currentBoard.id) return b;
        const cols = [...b.columns];
        const fromIndex = cols.findIndex((c) => c.id === draggedColumnId);
        const toIndex = cols.findIndex((c) => c.id === targetColId);
        if (fromIndex === -1 || toIndex === -1) return b;

        const [movedCol] = cols.splice(fromIndex, 1);
        cols.splice(toIndex, 0, movedCol);

        return {
          ...b,
          columns: cols,
          updatedAt: Date.now(),
        };
      }),
    }));

    setDraggedColumnId(null);
    setDragOverColId(null);
  };

  const boardBackground =
    currentBoard?.background || 'linear-gradient(to bottom right, #dfe7ef, #e2e8f0, #cbd5e1)';

  const bgFilterColor = currentBoard?.bgFilterColor || '#000000';
  const bgFilterOpacity = currentBoard?.bgFilterOpacity ?? 0;

  const listColor = currentBoard?.listColor || '#ffffff';
  const listOpacity = currentBoard?.listOpacity ?? 70;
  const isListDark = isDarkColor(listColor, listOpacity);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#edf2f7] text-slate-800 overflow-hidden font-sans select-none">
      {/* Top Bar with Notes branding, Board Selector and Settings */}
      <TopNavbar
        board={currentBoard}
        isHome={isHomePage}
        onGoHome={() => setIsHomePage(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Main View: Either Startpagina (HomePage) or Kanban Board View */}
      {isHomePage ? (
        <HomePage
          boards={appData.boards}
          onSelectBoard={handleSelectBoard}
          onNavigateToCard={(boardId, card) => {
            handleSelectBoard(boardId);
            setSelectedCard(card);
          }}
          onCreateBoard={handleCreateBoard}
          onDeleteBoard={handleDeleteBoard}
        />
      ) : (
        <div className="flex flex-1 overflow-hidden relative">
          <BoardSidebar
            boards={appData.boards}
            activeBoardId={appData.activeBoardId}
            onSelectBoard={handleSelectBoard}
            onCreateBoard={handleCreateBoard}
            onDeleteBoard={handleDeleteBoard}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <main
            className="flex-1 flex flex-col overflow-hidden relative transition-all duration-300"
            style={{
              background: boardBackground,
            }}
          >
            {/* Background Filter Overlay (for photos) */}
            {bgFilterOpacity > 0 && (
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-200 z-0"
                style={{
                  backgroundColor: hexToRgba(bgFilterColor, bgFilterOpacity),
                }}
              />
            )}

            {/* Columns Container */}
            <div
              ref={boardScrollRef}
              className="flex-1 flex gap-3 p-4 md:p-5 overflow-x-auto overflow-y-hidden items-start relative z-10"
            >
              {currentBoard?.columns.map((column) => {
                const columnCards = column.cardIds
                  .map((id) => currentBoard.cards[id])
                  .filter(Boolean);

                return (
                  <Column
                    key={column.id}
                    column={column}
                    cards={columnCards}
                    onAddCard={handleAddCard}
                    onEditColumnTitle={handleEditColumnTitle}
                    onDeleteColumn={handleDeleteColumn}
                    onCardClick={(card) => setSelectedCard(card)}
                    onToggleCardComplete={handleToggleCardComplete}
                    onDragStartCard={handleDragStartCard}
                    onDragEndCard={handleDragEndCard}
                    onDropCard={handleDropCard}
                    onDragStartColumn={handleDragStartColumn}
                    onDragEndColumn={handleDragEndColumn}
                    onDragOverColumn={handleDragOverColumn}
                    onDragLeaveColumn={handleDragLeaveColumn}
                    onDropColumn={handleDropColumn}
                    isDraggingColumn={draggedColumnId === column.id}
                    isColumnDragOver={dragOverColId === column.id}
                    isAnyColumnDragging={Boolean(draggedColumnId)}
                    listColor={listColor}
                    listOpacity={listOpacity}
                  />
                );
              })}

              {/* Add list button / inline form */}
              <div
                onDragOver={(e) => {
                  if (draggedColumnId) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedColumnId && currentBoard && currentBoard.columns.length > 0) {
                    const lastCol = currentBoard.columns[currentBoard.columns.length - 1];
                    if (lastCol && lastCol.id !== draggedColumnId) {
                      handleDropColumn(lastCol.id);
                    }
                  }
                }}
                className="w-72 shrink-0"
              >
                {isAddingColumn ? (
                  <form
                    onSubmit={handleAddColumn}
                    className="backdrop-blur-xl p-2.5 rounded-xl border shadow-xs space-y-2 transition-all"
                    style={{
                      backgroundColor: hexToRgba(listColor, Math.max(listOpacity, 75)),
                      borderColor: isListDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    <input
                      type="text"
                      autoFocus
                      placeholder="Lijsttitel invoeren..."
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      className={`w-full p-2 text-sm rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 ${
                        isListDark
                          ? 'bg-slate-900/90 border border-white/20 text-white placeholder-white/50'
                          : 'bg-white border border-slate-200/90 text-slate-800 placeholder-slate-400'
                      }`}
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        type="submit"
                        disabled={!newColumnTitle.trim()}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
                      >
                        Lijst toevoegen
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingColumn(false)}
                        className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                          isListDark ? 'text-white/60 hover:text-white' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsAddingColumn(true)}
                    className="w-full flex items-center gap-2 p-2.5 rounded-xl font-medium text-xs backdrop-blur-md transition-all cursor-pointer shadow-2xs border"
                    style={{
                      backgroundColor: hexToRgba(listColor, Math.max(25, Math.min(listOpacity, 60))),
                      borderColor: isListDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.4)',
                      color: isListDark ? '#ffffff' : '#334155',
                    }}
                  >
                    <Plus className={`w-4 h-4 ${isListDark ? 'text-white/80' : 'text-slate-500'}`} />
                    <span>Voeg nog een lijst toe</span>
                  </button>
                )}
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          isOpen={Boolean(selectedCard)}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleUpdateCard}
          onDelete={handleDeleteCard}
        />
      )}

      {/* Board Settings Modal (Achtergrond, Lijstkleur, Transparantie) */}
      <BoardSettingsModal
        currentBackground={boardBackground}
        currentBgFilterColor={bgFilterColor}
        currentBgFilterOpacity={bgFilterOpacity}
        currentListColor={listColor}
        currentListOpacity={listOpacity}
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}
export default App;
