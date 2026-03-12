import { useState, useEffect, useRef } from 'react'
import { useSnippetStore } from '../stores/snippet-store'

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { snippets, fetchSnippets } = useSnippetStore()

  useEffect(() => {
    fetchSnippets()
    inputRef.current?.focus()
  }, [])

  const filteredSnippets = query
    ? snippets.filter(s => 
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.content.toLowerCase().includes(query.toLowerCase())
      )
    : snippets

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, filteredSnippets.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filteredSnippets[selectedIndex]) {
      handleCopy(filteredSnippets[selectedIndex].content)
    } else if (e.key === 'Escape') {
      window.api.search.hideWindow()
    }
  }

  const handleCopy = async (content: string) => {
    await window.api.clipboard.copyWithVariables(content, {})
    window.api.search.hideWindow()
  }

  return (
    <div className="h-full bg-app-bg-primary rounded-lg overflow-hidden shadow-2xl border border-app-border">
      <div className="p-3 border-b border-app-border">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setSelectedIndex(0)
          }}
          onKeyDown={handleKeyDown}
          placeholder="搜索代码片段..."
          className="w-full px-3 py-2 bg-app-bg-secondary border border-app-border rounded text-app-text-primary placeholder:text-app-text-muted focus:border-app-accent"
        />
      </div>
      
      <div className="overflow-y-auto" style={{ maxHeight: '350px' }}>
        {filteredSnippets.length === 0 ? (
          <div className="p-4 text-center text-app-text-muted">
            未找到匹配的片段
          </div>
        ) : (
          filteredSnippets.slice(0, 10).map((snippet, index) => (
            <div
              key={snippet.id}
              onClick={() => handleCopy(snippet.content)}
              className={`px-4 py-3 cursor-pointer border-b border-app-border last:border-b-0 ${
                index === selectedIndex
                  ? 'bg-app-accent text-white'
                  : 'hover:bg-app-bg-hover'
              }`}
            >
              <div className="font-medium text-sm">{snippet.title}</div>
              <div className={`text-xs mt-1 truncate ${
                index === selectedIndex ? 'text-white/70' : 'text-app-text-muted'
              }`}>
                {snippet.content.slice(0, 100)}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-2 border-t border-app-border text-xs text-app-text-muted flex justify-between">
        <span>↑↓ 选择 · Enter 复制 · Esc 关闭</span>
        <span>{filteredSnippets.length} 个片段</span>
      </div>
    </div>
  )
}
