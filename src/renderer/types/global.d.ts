import { Snippet, Folder, Tag } from '../../main/database/database-service'

declare global {
  interface Window {
    api: {
      snippet: {
        getAll: () => Promise<Snippet[]>
        getById: (id: string) => Promise<Snippet | null>
        create: (data: Partial<Snippet>) => Promise<Snippet>
        update: (id: string, data: Partial<Snippet>) => Promise<Snippet | null>
        delete: (id: string) => Promise<boolean>
        search: (query: string) => Promise<Snippet[]>
      }
      folder: {
        getAll: () => Promise<Folder[]>
        create: (data: Partial<Folder>) => Promise<Folder>
        update: (id: string, data: Partial<Folder>) => Promise<Folder | null>
        delete: (id: string) => Promise<boolean>
      }
      tag: {
        getAll: () => Promise<Tag[]>
      }
      clipboard: {
        copyText: (text: string) => Promise<boolean>
        copyWithVariables: (text: string, variables: Record<string, string>) => Promise<string>
      }
      search: {
        toggleWindow: () => Promise<void>
        hideWindow: () => Promise<void>
      }
      sync: {
        connectGitHub: (token: string) => Promise<boolean>
        pushSnippet: (snippetId: string) => Promise<string | null>
        pullAll: () => Promise<Snippet[]>
      }
      settings: {
        get: (key: string) => Promise<string | null>
        set: (key: string, value: string) => Promise<void>
      }
    }
  }
}

export {}
