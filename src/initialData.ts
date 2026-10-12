import { Board, AppData } from './types';

export const INITIAL_BOARDS: Board[] = [
  {
    id: 'board-1',
    title: 'Taken',
    background: 'linear-gradient(to bottom right, #dfe7ef, #e2e8f0, #cbd5e1)',
    bgFilterColor: '#000000',
    bgFilterOpacity: 0,
    listColor: '#ffffff',
    listOpacity: 70,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
    columns: [
      {
        id: 'col-todo',
        title: 'Te doen',
        cardIds: ['card-1', 'card-2'],
      },
      {
        id: 'col-doing',
        title: 'Bezig',
        cardIds: ['card-3'],
      },
      {
        id: 'col-done',
        title: 'Gedaan',
        cardIds: ['card-4'],
      },
    ],
    cards: {
      'card-1': {
        id: 'card-1',
        title: 'Eplan 2025 v2 installeren',
        description: 'Installatiebestand downloaden en configureren volgens de handleiding.',
        dueDate: '2026-10-05',
        completed: false,
        createdAt: Date.now() - 86400000 * 2,
      },
      'card-2': {
        id: 'card-2',
        title: 'Project documentatie bijwerken',
        description: '',
        dueDate: '2026-10-18',
        completed: false,
        createdAt: Date.now() - 86400000,
      },
      'card-3': {
        id: 'card-3',
        title: 'Back-up maken van werkbestanden',
        description: 'Externe schijf aansluiten en sync starten.',
        dueDate: null,
        completed: false,
        createdAt: Date.now() - 86400000,
      },
      'card-4': {
        id: 'card-4',
        title: 'Windows updates installeren',
        description: '',
        dueDate: null,
        completed: true,
        createdAt: Date.now() - 86400000 * 3,
      },
    },
  },
];

export const INITIAL_DATA: AppData = {
  boards: INITIAL_BOARDS,
  activeBoardId: 'board-1',
};
