import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getPlatform: () => ipcRenderer.invoke('app:get-platform'),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  hideQuickSearch: () => ipcRenderer.invoke('quick-search:hide'),
  copyToClipboard: (text: string) => ipcRenderer.invoke('clipboard:copy', text),
  onQuickSearchOpen: (callback: () => void) => {
    ipcRenderer.on('quick-search:open', callback);
    return () => ipcRenderer.removeListener('quick-search:open', callback);
  },
  getFolders: () => ipcRenderer.invoke('db:get-folders'),
  getSnippets: () => ipcRenderer.invoke('db:get-snippets'),
  saveFolder: (folder: any) => ipcRenderer.invoke('db:save-folder', folder),
  saveSnippet: (snippet: any) => ipcRenderer.invoke('db:save-snippet', snippet),
  deleteFolder: (id: string) => ipcRenderer.invoke('db:delete-folder', id),
  deleteSnippet: (id: string) => ipcRenderer.invoke('db:delete-snippet', id),
});
