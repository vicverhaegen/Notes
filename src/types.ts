export interface Card {
  id: string;
  title: string;
  description?: string;
  dueDate?: string | null; // e.g. "2026-10-05"
  completed: boolean;
  createdAt: number;
}

export interface Column {
  id: string;
  title: string;
  cardIds: string[];
}

export interface Board {
  id: string;
  title: string;
  background?: string;
  bgFilterColor?: string; // hex color for photo filter, default #000000
  bgFilterOpacity?: number; // 0 to 100, default 0 (no filter)
  listColor?: string; // hex or rgb base, default #ffffff
  listOpacity?: number; // 0 to 100, default 70
  columns: Column[];
  cards: Record<string, Card>;
  createdAt: number;
  updatedAt: number;
}

export interface AppData {
  boards: Board[];
  activeBoardId: string | null;
}
