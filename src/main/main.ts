import { app, BrowserWindow, ipcMain, globalShortcut, clipboard } from 'electron';
import { join } from 'path';
import { DatabaseService } from './database/database-service';
import { ShortcutManager } from './shortcut/shortcut-manager';
import { ClipboardService } from './clipboard/clipboard-service';
import { SyncService } from './sync/sync-service';

let mainWindow: BrowserWindow | null = null;
let searchWindow: BrowserWindow | null = null;
let databaseService: DatabaseService;
let shortcutManager: ShortcutManager;
let clipboardService: ClipboardService;
let syncService: SyncService;

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: '#1e1e1e',
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createSearchWindow() {
  searchWindow = new BrowserWindow({
    width: 600,
    height: 450,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    searchWindow.loadURL(VITE_DEV_SERVER_URL + '/search');
  } else {
    searchWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: '/search',
    });
  }

  searchWindow.on('blur', () => {
    searchWindow?.hide();
  });

  searchWindow.hide();
}

async function initializeServices() {
  const dbPath = join(app.getPath('userData'), 'snippets.db');
  databaseService = new DatabaseService(dbPath);
  await databaseService.init();

  clipboardService = new ClipboardService();
  syncService = new SyncService(databaseService);
  shortcutManager = new ShortcutManager(mainWindow!, searchWindow!);
}

function registerIpcHandlers() {
  ipcMain.handle('snippet:get-all', async () => {
    return databaseService.getAllSnippets();
  });

  ipcMain.handle('snippet:get-by-id', async (_, id: string) => {
    return databaseService.getSnippetById(id);
  });

  ipcMain.handle('snippet:create', async (_, data) => {
    return databaseService.createSnippet(data);
  });

  ipcMain.handle('snippet:update', async (_, id: string, data) => {
    return databaseService.updateSnippet(id, data);
  });

  ipcMain.handle('snippet:delete', async (_, id: string) => {
    return databaseService.deleteSnippet(id);
  });

  ipcMain.handle('snippet:search', async (_, query: string) => {
    return databaseService.searchSnippets(query);
  });

  ipcMain.handle('folder:get-all', async () => {
    return databaseService.getAllFolders();
  });

  ipcMain.handle('folder:create', async (_, data) => {
    return databaseService.createFolder(data);
  });

  ipcMain.handle('folder:update', async (_, id: string, data) => {
    return databaseService.updateFolder(id, data);
  });

  ipcMain.handle('folder:delete', async (_, id: string) => {
    return databaseService.deleteFolder(id);
  });

  ipcMain.handle('tag:get-all', async () => {
    return databaseService.getAllTags();
  });

  ipcMain.handle('clipboard:copy-text', async (_, text: string) => {
    clipboard.writeText(text);
    return true;
  });

  ipcMain.handle('clipboard:copy-with-variables', async (_, text: string, variables: Record<string, string>) => {
    const processedText = clipboardService.replaceVariables(text, variables);
    clipboard.writeText(processedText);
    return processedText;
  });

  ipcMain.handle('search:toggle-window', async () => {
    if (searchWindow?.isVisible()) {
      searchWindow.hide();
    } else {
      searchWindow?.show();
      searchWindow?.focus();
    }
  });

  ipcMain.handle('search:hide-window', async () => {
    searchWindow?.hide();
  });

  ipcMain.handle('sync:connect-github', async (_, token: string) => {
    return syncService.connectGitHub(token);
  });

  ipcMain.handle('sync:push-snippet', async (_, snippetId: string) => {
    return syncService.pushSnippet(snippetId);
  });

  ipcMain.handle('sync:pull-all', async () => {
    return syncService.pullAll();
  });

  ipcMain.handle('settings:get', async (_, key: string) => {
    return databaseService.getSetting(key);
  });

  ipcMain.handle('settings:set', async (_, key: string, value: string) => {
    return databaseService.setSetting(key, value);
  });
}

app.whenReady().then(async () => {
  createMainWindow();
  createSearchWindow();
  await initializeServices();
  registerIpcHandlers();
  shortcutManager.registerGlobalShortcut();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
