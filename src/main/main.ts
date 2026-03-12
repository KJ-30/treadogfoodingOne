import { app, BrowserWindow, globalShortcut, ipcMain, shell } from 'electron';
import path from 'path';
import Store from 'electron-store';

let mainWindow: BrowserWindow | null;
let quickSearchWindow: BrowserWindow | null;

const store = new Store();

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hidden',
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createQuickSearchWindow() {
  quickSearchWindow = new BrowserWindow({
    width: 600,
    height: 400,
    show: false,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.env.NODE_ENV === 'development') {
    quickSearchWindow.loadURL('http://localhost:3000/#/quick-search');
  } else {
    quickSearchWindow.loadFile(path.join(__dirname, '../renderer/index.html'), {
      hash: 'quick-search',
    });
  }

  quickSearchWindow.on('blur', () => {
    quickSearchWindow?.hide();
  });
}

function registerGlobalShortcuts() {
  const shortcut = process.platform === 'darwin' ? 'Command+Shift+Space' : 'Ctrl+Shift+Space';

  const ret = globalShortcut.register(shortcut, () => {
    if (!quickSearchWindow) {
      createQuickSearchWindow();
    }

    if (quickSearchWindow) {
      const { x, y } = require('electron').screen.getCursorScreenPoint();
      quickSearchWindow.setPosition(x - 300, y - 200);
      quickSearchWindow.show();
      quickSearchWindow.focus();
      quickSearchWindow.webContents.send('quick-search:open');
    }
  });

  if (!ret) {
    console.log('快捷键注册失败');
  }
}

app.whenReady().then(() => {
  createMainWindow();
  createQuickSearchWindow();
  registerGlobalShortcuts();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

ipcMain.handle('app:get-platform', () => {
  return process.platform;
});

ipcMain.handle('window:minimize', () => {
  BrowserWindow.getFocusedWindow()?.minimize();
});

ipcMain.handle('window:maximize', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win?.isMaximized()) {
    win.unmaximize();
  } else {
    win?.maximize();
  }
});

ipcMain.handle('window:close', () => {
  BrowserWindow.getFocusedWindow()?.close();
});

ipcMain.handle('quick-search:hide', () => {
  quickSearchWindow?.hide();
});

ipcMain.handle('clipboard:copy', (_, text: string) => {
  const { clipboard } = require('electron');
  clipboard.writeText(text);
});

ipcMain.handle('db:get-folders', () => {
  return store.get('folders', []) as any[];
});

ipcMain.handle('db:get-snippets', () => {
  return store.get('snippets', []) as any[];
});

ipcMain.handle('db:save-folder', (_, folder) => {
  const folders = store.get('folders', []) as any[];
  const index = folders.findIndex((f: any) => f.id === folder.id);
  if (index >= 0) {
    folders[index] = folder;
  } else {
    folders.push(folder);
  }
  store.set('folders', folders);
  return folder;
});

ipcMain.handle('db:save-snippet', (_, snippet) => {
  const snippets = store.get('snippets', []) as any[];
  const index = snippets.findIndex((s: any) => s.id === snippet.id);
  if (index >= 0) {
    snippets[index] = snippet;
  } else {
    snippets.push(snippet);
  }
  store.set('snippets', snippets);
  return snippet;
});

ipcMain.handle('db:delete-folder', (_, id) => {
  const folders = store.get('folders', []) as any[];
  const newFolders = folders.filter((f: any) => f.id !== id);
  store.set('folders', newFolders);
  return true;
});

ipcMain.handle('db:delete-snippet', (_, id) => {
  const snippets = store.get('snippets', []) as any[];
  const newSnippets = snippets.filter((s: any) => s.id !== id);
  store.set('snippets', newSnippets);
  return true;
});
