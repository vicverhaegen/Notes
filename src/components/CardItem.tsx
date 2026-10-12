import React, { useState } from 'react';
import { Card as CardType } from '../types';
import { Clock, Check } from 'lucide-react';
import { formatTrelloDate, isDateOverdue } from '../dateUtils';

interface CardItemProps {
  card: CardType;
  columnId: string;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, cardId: string, sourceColId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onToggleComplete: (e: React.MouseEvent, cardId: string) => void;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  columnId,
  onClick,
  onDragStart,
  onDragEnd,
  onToggleComplete,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [justToggled, setJustToggled] = useState(false);

  const overdue = card.dueDate ? isDateOverdue(card.dueDate) : false;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setJustToggled(true);
    setTimeout(() => setJustToggled(false), 300);
    onToggleComplete(e, card.id);
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        setIsDragging(true);
        e.dataTransfer.setData('text/plain', JSON.stringify({ cardId: card.id, sourceColId: columnId }));
        onDragStart(e, card.id, columnId);
      }}
      onDragEnd={(e) => {
        setIsDragging(false);
        onDragEnd(e);
      }}
      onClick={onClick}
      className={`group relative bg-white/90 backdrop-blur-md rounded-lg p-3 shadow-xs border border-white/60 hover:border-slate-300 hover:shadow-md transition-shadow duration-150 cursor-pointer overflow-hidden ${
        isDragging ? 'opacity-30 scale-95' : 'opacity-100'
      }`}
    >
      {/* Card Content Row */}
      <div className="relative flex items-start">
        {/*
          Trello-style sliding checkbox:
          - Normally hidden (translateX(-100%) and opacity-0)
          - Slides into view and becomes visible on group hover OR when completed
        */}
        <button
          type="button"
          onClick={handleCheckboxClick}
          title={card.completed ? 'Als onvoltooid markeren' : 'Als voltooid markeren'}
          className={`absolute left-0 top-0.5 w-[18px] h-[18px] rounded-full border flex items-center justify-center transition-all duration-200 ease-out z-10 cursor-pointer ${
            card.completed
              ? 'translate-x-0 opacity-100 bg-emerald-500 border-emerald-500 text-white'
              : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50 bg-white -translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
          } ${justToggled ? 'scale-125' : 'scale-100'}`}
        >
          {card.completed && (
            <Check className="w-3 h-3 stroke-[2.8] animate-in zoom-in-75 duration-150" />
          )}
        </button>

        {/*
          Card title:
          - Starts fully left-aligned (pl-0)
          - Smoothly shifts right (pl-7) when hovered OR when completed
        */}
        <div
          className={`flex-1 transition-all duration-200 ease-out select-text ${
            card.completed ? 'pl-7' : 'pl-0 group-hover:pl-7'
          }`}
        >
          <span
            className={`text-[14px] font-normal leading-snug block transition-colors duration-150 ${
              card.completed ? 'line-through text-slate-400' : 'text-slate-800'
            }`}
          >
            {card.title}
          </span>
        </div>
      </div>

      {/* Subtle Trello-like Date Badge */}
      {card.dueDate && (
        <div
          className={`mt-2 flex items-center transition-all duration-200 ease-out ${
            card.completed ? 'pl-7' : 'pl-0 group-hover:pl-7'
          }`}
        >
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[12px] font-normal tracking-tight transition-colors ${
              card.completed
                ? 'bg-emerald-50 text-emerald-700'
                : overdue
                ? 'bg-[#ffebee] text-[#c62828]'
                : 'bg-slate-100/90 text-slate-600'
            }`}
          >
            <Clock
              className={`w-3.5 h-3.5 stroke-[1.8] ${
                overdue && !card.completed ? 'text-[#c62828]' : ''
              }`}
            />
            <span>{formatTrelloDate(card.dueDate)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
