# TaskBoard - Trello Desktop for Windows

A modern, fast Windows desktop Kanban application built with **Electron**, **React 19**, **TypeScript**, and **Tailwind CSS**.

---

## Features

- **Kanban Board & Columns**: Drag-and-drop cards between columns or reorder tasks seamlessly.
- **Multiple Boards**: Create unlimited boards with customizable color and gradient themes (Ocean Blue, Emerald, Sunset, Midnight, etc.).
- **Card Detail View**:
  - Full title and rich markdown description with live preview tab.
  - Interactive checklists with progress tracking and celebratory confetti effects.
  - Color-coded labels & tags (High Priority, In Progress, Feature, Bug Fix, Design, Done).
  - Due date picker with automated status badges (*Overdue*, *Due Today*, *Scheduled*).
- **Offline-First Persistence**: Automatically saves boards to local disk storage using native Electron IPC and file system backups.
- **Data Export & Import**: Backup boards anytime to `.json` files or restore previous data.
- **Dark & Light Mode**: Built-in instant theme switcher.
- **Live Search**: Instant card filtering across titles, descriptions, and tag names.

---

## How to Run

### 1. Launch the Desktop Application
```bash
npm start
```

### 2. Run in Development Mode (Hot-Reloading)
```bash
npm run dev
```

### 3. Build Production Executable / Installer (.exe)
```bash
npm run build
npm run build:electron
```
The Windows installer and standalone `.exe` binaries will be packaged into the `dist/` directory.
