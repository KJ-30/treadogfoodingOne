import { create } from 'zustand'
import { Snippet } from '../../main/database/database-service'

interface SnippetState {
  snippets: Snippet[]
  isLoading: boolean
  fetchSnippets: () => Promise<void>
  createSnippet: (data: Partial<Snippet>) => Promise<Snippet>
  updateSnippet: (id: string, data: Partial<Snippet>) => Promise<void>
  deleteSnippet: (id: string) => Promise<void>
}

export const useSnippetStore = create<SnippetState>((set, get) => ({
  snippets: [],
  isLoading: false,

  fetchSnippets: async () => {
    set({ isLoading: true })
    const snippets = await window.api.snippet.getAll()
    set({ snippets, isLoading: false })
  },

  createSnippet: async (data) => {
    const snippet = await window.api.snippet.create(data)
    set(state => ({ snippets: [snippet, ...state.snippets] }))
    return snippet
  },

  updateSnippet: async (id, data) => {
    const updated = await window.api.snippet.update(id, data)
    if (updated) {
      set(state => ({
        snippets: state.snippets.map(s => s.id === id ? updated : s)
      }))
    }
  },

  deleteSnippet: async (id) => {
    await window.api.snippet.delete(id)
    set(state => ({
      snippets: state.snippets.filter(s => s.id !== id)
    }))
  },
}))
