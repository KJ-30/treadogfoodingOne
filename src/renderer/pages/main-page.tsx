import { useState, useEffect } from 'react'
import { Sidebar } from '../components/sidebar/sidebar'
import { SnippetList } from '../components/list/snippet-list'
import { PreviewEditor } from '../components/preview/preview-editor'
import { useSnippetStore } from '../stores/snippet-store'
import { useFolderStore } from '../stores/folder-store'

export function MainPage() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedSnippetId, setSelectedSnippetId] = useState<string | null>(null)
  
  const { snippets, fetchSnippets } = useSnippetStore()
  const { folders, fetchFolders } = useFolderStore()

  useEffect(() => {
    fetchSnippets()
    fetchFolders()
  }, [])

  const filteredSnippets = selectedFolderId
    ? snippets.filter(s => s.folder_id === selectedFolderId)
    : snippets

  const selectedSnippet = snippets.find(s => s.id === selectedSnippetId)

  return (
    <div className="h-full flex">
      <div className="w-56 flex-shrink-0 border-r border-app-border">
        <Sidebar
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
        />
      </div>
      
      <div className="w-72 flex-shrink-0 border-r border-app-border">
        <SnippetList
          snippets={filteredSnippets}
          selectedSnippetId={selectedSnippetId}
          onSelectSnippet={setSelectedSnippetId}
        />
      </div>
      
      <div className="flex-1">
        {selectedSnippet ? (
          <PreviewEditor snippet={selectedSnippet} />
        ) : (
          <div className="h-full flex items-center justify-center text-app-text-muted">
            选择一个片段进行编辑
          </div>
        )}
      </div>
    </div>
  )
}
