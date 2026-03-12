import { create } from 'zustand'
import { Folder } from '../../main/database/database-service'

interface FolderState {
  folders: Folder[]
  isLoading: boolean
  fetchFolders: () => Promise<void>
  createFolder: (data: Partial<Folder>) => Promise<Folder>
  updateFolder: (id: string, data: Partial<Folder>) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
}

export const useFolderStore = create<FolderState>((set, get) => ({
  folders: [],
  isLoading: false,

  fetchFolders: async () => {
    set({ isLoading: true })
    const folders = await window.api.folder.getAll()
    set({ folders, isLoading: false })
  },

  createFolder: async (data) => {
    const folder = await window.api.folder.create(data)
    set(state => ({ folders: [...state.folders, folder] }))
    return folder
  },

  updateFolder: async (id, data) => {
    const updated = await window.api.folder.update(id, data)
    if (updated) {
      set(state => ({
        folders: state.folders.map(f => f.id === id ? updated : f)
      }))
    }
  },

  deleteFolder: async (id) => {
    await window.api.folder.delete(id)
    set(state => ({
      folders: state.folders.filter(f => f.id !== id)
    }))
  },
}))
