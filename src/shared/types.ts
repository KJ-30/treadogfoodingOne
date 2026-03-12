export interface Folder {
  id: string
  name: string
  parentId: string | null
  createdAt: number
}

export interface Snippet {
  id: string
  title: string
  content: string
  language: string
  folderId: string | null
  tags: string[]
  createdAt: number
  updatedAt: number
}

export interface Variable {
  name: string
  description: string
  value: string | (() => string)
}
