import { useState } from 'react'
import { Folder } from '../../../main/database/database-service'
import { useFolderStore } from '../../stores/folder-store'
import { Input } from '../ui/input'

interface SidebarProps {
  folders: Folder[]
  selectedFolderId: string | null
  onSelectFolder: (id: string | null) => void
}

export function Sidebar({ folders, selectedFolderId, onSelectFolder }: SidebarProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const { createFolder } = useFolderStore()

  const handleCreate = async () => {
    if (newFolderName.trim()) {
      await createFolder({ name: newFolderName.trim() })
      setNewFolderName('')
      setIsCreating(false)
    }
  }

  const buildTree = (folders: Folder[], parentId: string | null = null): Folder[] => {
    return folders
      .filter(f => f.parent_id === parentId)
      .sort((a, b) => a.sort_order - b.sort_order)
  }

  const rootFolders = buildTree(folders)

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-app-border flex items-center justify-between">
        <span className="text-sm font-medium">文件夹</span>
        <button
          onClick={() => setIsCreating(true)}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-app-bg-hover text-app-text-muted"
        >
          +
        </button>
      </div>

      {isCreating && (
        <div className="p-2 border-b border-app-border">
          <Input
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreate()
              if (e.key === 'Escape') setIsCreating(false)
            }}
            placeholder="文件夹名称"
            autoFocus
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div
          onClick={() => onSelectFolder(null)}
          className={`px-3 py-2 cursor-pointer text-sm ${
            selectedFolderId === null
              ? 'bg-app-accent text-white'
              : 'hover:bg-app-bg-hover'
          }`}
        >
          全部片段
        </div>
        
        {rootFolders.map(folder => (
          <FolderItem
            key={folder.id}
            folder={folder}
            allFolders={folders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={onSelectFolder}
          />
        ))}
      </div>

      <div className="p-3 border-t border-app-border">
        <button
          className="w-full text-left text-sm px-2 py-1 rounded hover:bg-app-bg-hover"
          onClick={() => window.location.hash = '/settings'}
        >
          ⚙️ 设置
        </button>
      </div>
    </div>
  )
}

function FolderItem({
  folder,
  allFolders,
  selectedFolderId,
  onSelectFolder,
}: {
  folder: Folder
  allFolders: Folder[]
  selectedFolderId: string | null
  onSelectFolder: (id: string | null) => void
}) {
  const children = allFolders.filter(f => f.parent_id === folder.id)
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div>
      <div
        onClick={() => onSelectFolder(folder.id)}
        className={`px-3 py-2 cursor-pointer text-sm flex items-center gap-2 ${
          selectedFolderId === folder.id
            ? 'bg-app-accent text-white'
            : 'hover:bg-app-bg-hover'
        }`}
      >
        {children.length > 0 && (
          <span
            onClick={e => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="w-4 text-center text-app-text-muted"
          >
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
        <span className={children.length === 0 ? 'ml-6' : ''}>📁 {folder.name}</span>
      </div>
      
      {isExpanded && children.length > 0 && (
        <div className="ml-4">
          {children.map(child => (
            <FolderItem
              key={child.id}
              folder={child}
              allFolders={allFolders}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
            />
          ))}
        </div>
      )}
    </div>
  )
}
