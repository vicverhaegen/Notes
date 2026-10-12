import React from 'react';
import { Board } from '../types';
import { ChevronDown, Sliders } from 'lucide-react';

interface TopNavbarProps {
  board: Board | null;
  isHome: boolean;
  onGoHome: () => void;
  onToggleSidebar: () => void;
  onOpenSettingsModal: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  board,
  isHome,
  onGoHome,
  onToggleSidebar,
  onOpenSettingsModal,
}) => {
  return (
    <header className="h-12 bg-white/40 backdrop-blur-md border-b border-white/40 flex items-center justify-between px-4 z-30 select-none">
      <div className="flex items-center gap-2">
        {/* Home / Notes Logo button */}
        <button
          onClick={onGoHome}
          className={`flex items-center gap-2 px-2 py-1 rounded-lg font-bold text-sm tracking-tight transition-colors cursor-pointer ${
            isHome ? 'bg-black/5 text-blue-600' : 'text-slate-800 hover:bg-black/5'
          }`}
          title="Naar startpagina"
        >
          <img src="./icon.svg" alt="Notes Logo" className="w-5 h-5 rounded-md shadow-2xs" />
          <span>Notes</span>
        </button>

        {/* Board Title dropdown when on a board */}
        {!isHome && board && (
          <button
            onClick={onToggleSidebar}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700 hover:bg-black/5 transition-colors cursor-pointer border-l border-slate-300/60 pl-3 ml-1"
            title="Wissel van bord"
          >
            <span>{board.title}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
      </div>

      {/* Right Side: Board Settings */}
      {!isHome && board && (
        <button
          onClick={onOpenSettingsModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 hover:bg-black/5 transition-colors cursor-pointer"
          title="Bord instellingen (achtergrond, lijsten, transparantie)"
        >
          <Sliders className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Instellingen</span>
        </button>
      )}
    </header>
  );
};
