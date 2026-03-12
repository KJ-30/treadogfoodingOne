import { useState } from 'react'
import { Snippet } from '../../../main/database/database-service'
import { useSnippetStore } from '../../stores/snippet-store'
import { Input } from '../ui/input'

interface SnippetListProps {
  snippets: Snippet[]
  selectedSnippetId: string | null
  onSelectSnippet: (id: string | null) => void
}

export function SnippetList({ snippets, selectedSnippetId, onSelectSnippet }: SnippetListProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const { createSnippet } = useSnippetStore()

  const handleCreate = async () => {
    if (newTitle.trim()) {
      const snippet = await createSnippet({ title: newTitle.trim() })
      onSelectSnippet(snippet.id)
      setNewTitle('')
      setIsCreating(false)
    }
  }

  const getLanguageIcon = (language: string): string => {
    const icons: Record<string, string> = {
      javascript: 'JS',
      typescript: 'TS',
      python: 'PY',
      java: 'JV',
      go: 'GO',
      rust: 'RS',
      html: 'HT',
      css: 'CS',
      json: '{}',
      sql: 'DB',
      shell: 'SH',
    }
    return icons[language] || 'TXT'
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-app-border flex items-center justify-between">
        <span className="text-sm font-medium">片段列表</span>
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
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreate()
              if (e.key === 'Escape') setIsCreating(false)
            }}
            placeholder="片段标题"
            autoFocus
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {snippets.length === 0 ? (
          <div className="p-4 text-center text-app-text-muted text-sm">
            暂无片段
          </div>
        ) : (
          snippets.map(snippet => (
            <div
              key={snippet.id}
              onClick={() => onSelectSnippet(snippet.id)}
              className={`px-3 py-2 cursor-pointer border-b border-app-border ${
                selectedSnippetId === snippet.id
                  ? 'bg-app-bg-tertiary border-l-2 border-l-app-accent'
                  : 'hover:bg-app-bg-hover'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-8 h-5 flex items-center justify-center text-xs bg-app-bg-secondary rounded">
                  {getLanguageIcon(snippet.language)}
                </span>
                <span className="text-sm truncate">{snippet.title}</span>
              </div>
              {snippet.tags.length > 0 && (
                <div className="flex gap-1 mt-1 ml-10">
                  {snippet.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-1 text-xs bg-app-bg-secondary rounded text-app-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
