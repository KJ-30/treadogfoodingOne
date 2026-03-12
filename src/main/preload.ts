import { contextBridge, ipcRenderer } from 'electron'

const api = {
  snippet: {
    getAll: () => ipcRenderer.invoke('snippet:get-all'),
    getById: (id: string) => ipcRenderer.invoke('snippet:get-by-id', id),
    create: (data: any) => ipcRenderer.invoke('snippet:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('snippet:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('snippet:delete', id),
    search: (query: string) => ipcRenderer.invoke('snippet:search', query),
  },
  folder: {
    getAll: () => ipcRenderer.invoke('folder:get-all'),
    create: (data: any) => ipcRenderer.invoke('folder:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('folder:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('folder:delete', id),
  },
  tag: {
    getAll: () => ipcRenderer.invoke('tag:get-all'),
  },
  clipboard: {
    copyText: (text: string) => ipcRenderer.invoke('clipboard:copy-text', text),
    copyWithVariables: (text: string, variables: Record<string, string>) => 
      ipcRenderer.invoke('clipboard:copy-with-variables', text, variables),
  },
  search: {
    toggleWindow: () => ipcRenderer.invoke('search:toggle-window'),
    hideWindow: () => ipcRenderer.invoke('search:hide-window'),
  },
  sync: {
    connectGitHub: (token: string) => ipcRenderer.invoke('sync:connect-github', token),
    pushSnippet: (snippetId: string) => ipcRenderer.invoke('sync:push-snippet', snippetId),
    pullAll: () => ipcRenderer.invoke('sync:pull-all'),
  },
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: string) => ipcRenderer.invoke('settings:set', key, value),
  },
}

contextBridge.exposeInMainWorld('api', api)
