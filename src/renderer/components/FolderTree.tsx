import React from 'react'
import { Folder, ChevronDown, ChevronRight } from 'lucide-react'
import { Folder as FolderType } from '../../shared/types'

interface FolderTreeProps {
  folders: FolderType[]
  selectedFolderId: string | null
  onSelectFolder: (id: string | null) => void
}

function FolderTree({ folders, selectedFolderId, onSelectFolder }: FolderTreeProps) {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const renderFolder = (folder: FolderType, level: number = 0) => {
    const childFolders = folders.filter(f => f.parentId === folder.id)
    const isExpanded = expanded[folder.id] || childFolders.length === 0

    return (
      <div key={folder.id}>
        <div
          className={`folder-tree-item ${selectedFolderId === folder.id ? 'active' : ''}`}
          style={{ paddingLeft: `${level * 16 + 4}px` }}
          onClick={() => onSelectFolder(folder.id)}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {childFolders.length > 0 && (
              <span style={{ marginRight: 2, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); toggleExpand(folder.id) }}>
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            )}
            {childFolders.length === 0 && <span style={{ width: 16 }}></span>}
            <Folder size={16} style={{ marginRight: 4 }} />
            <span style={{ fontSize: '13px' }}>{folder.name}</span>
          </div>
        </div>
        {isExpanded && childFolders.map(child => renderFolder(child, level + 1))}
      </div>
    )
  }

  const rootFolders = folders.filter(f => f.parentId === null)

  return (
    <div className="folder-tree">
      <div
        className={`folder-tree-item ${selectedFolderId === null ? 'active' : ''}`}
        onClick={() => onSelectFolder(null)}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ width: 16, marginRight: 4 }}></span>
          <Folder size={16} style={{ marginRight: 4 }} />
          <span style={{ fontSize: '13px' }}>全部片段</span>
        </div>
      </div>
      {rootFolders.map(folder => renderFolder(folder))}
    </div>
  )
}

export default FolderTree
