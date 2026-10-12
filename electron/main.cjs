const { app, BrowserWindow, ipcMain, dialog, Notification, Menu, Tray } = require('electron');
const path = require('path');
const fs = require('fs');

app.name = 'Notes';

// Enable startup with Windows
app.setLoginItemSettings({
  openAtLogin: true,
  path: process.execPath,
  args: ['--hidden'],
});

const DATA_FILE = path.join(app.getPath('userData'), 'notes_data.json');

let mainWindow = null;
let tray = null;
let isQuitting = false;

function createWindow() {
  const isHidden = process.argv.includes('--hidden');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    title: 'Notes',
    icon: path.join(__dirname, '../public/icon.png'),
    frame: true,
    titleBarStyle: 'default',
    autoHideMenuBar: true, // Completely hides the File Edit View Window menu bar
    show: !isHidden,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Remove default application menu
  Menu.setApplicationMenu(null);

  mainWindow.on('page-title-updated', (e) => {
    e.preventDefault();
    mainWindow.setTitle('Notes');
  });

  // Minimize to tray instead of closing completely so it runs in background
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  const distPath = path.join(__dirname, '../dist/index.html');
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev && !process.env.SERVE_DIST) {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      mainWindow.loadFile(distPath);
    });
  } else {
    mainWindow.loadFile(distPath);
  }
}

function createTray() {
  const iconPath = path.join(__dirname, '../public/icon.png');
  tray = new Tray(iconPath);
  tray.setToolTip('Notes');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Notes',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    { type: 'separator' },
    {
      label: 'Afsluiten',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
  tray.on('double-click', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

// Storage IPC Handlers
ipcMain.handle('storage:load', async () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error loading data:', err);
  }
  return null;
});

ipcMain.handle('storage:save', async (_event, data) => {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (err) {
    console.error('Error saving data:', err);
    return { success: false, error: err.message };
  }
});

// Backup Export IPC
ipcMain.handle('dialog:export', async (_event, data) => {
  if (!mainWindow) return false;
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Board Backup',
    defaultPath: `Notes_Backup_${new Date().toISOString().split('T')[0]}.json`,
    filters: [{ name: 'JSON files', extensions: ['json'] }],
  });

  if (filePath) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  }
  return false;
});

// Backup Import IPC
ipcMain.handle('dialog:import', async () => {
  if (!mainWindow) return null;
  const { filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Import Board Backup',
    properties: ['openFile'],
    filters: [{ name: 'JSON files', extensions: ['json'] }],
  });

  if (filePaths && filePaths.length > 0) {
    try {
      const content = fs.readFileSync(filePaths[0], 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Error reading backup file:', err);
    }
  }
  return null;
});

// Pick local image file from PC for background (offline)
ipcMain.handle('dialog:pickImage', async () => {
  if (!mainWindow) return null;
  const { filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Kies een achtergrondafbeelding',
    properties: ['openFile'],
    filters: [
      { name: 'Afbeeldingen', extensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'svg'] },
    ],
  });

  if (filePaths && filePaths.length > 0) {
    try {
      const ext = path.extname(filePaths[0]).replace('.', '').toLowerCase();
      const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      const buffer = fs.readFileSync(filePaths[0]);
      const base64 = buffer.toString('base64');
      return `data:${mime};base64,${base64}`;
    } catch (err) {
      console.error('Error reading image file:', err);
    }
  }
  return null;
});

// Window controls IPC
ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on('window:close', () => mainWindow?.close());

// Native Windows Desktop Notification
ipcMain.on('notify:show', (_event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({
      title: title || 'Notes',
      body: body || '',
      icon: path.join(__dirname, '../public/icon.png'),
      silent: false,
    }).show();
  }
});

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  // Keep background tray alive on Windows
});
