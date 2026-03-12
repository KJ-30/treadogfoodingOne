import React, { useState, useEffect, useRef } from 'react'
import { Snippet } from '../../shared/types'

const defaultSnippets: Snippet[] = [
  {
    id: '1',
    title: '防抖函数',
    content: `function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}`,
    language: 'javascript',
    folderId: '2',
    tags: ['utils', 'javascript'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: '2',
    title: '快速排序',
    content: `def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)`,
    language: 'python',
    folderId: '3',
    tags: ['algorithm', 'python'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
]

function replaceVariables(content: string): string {
  const now = new Date()
  const variables: Record<string, string> = {
    DATE: now.toISOString().split('T')[0],
    TIME: now.toTimeString().split(' ')[0],
    DATETIME: now.toLocaleString(),
    YEAR: String(now.getFullYear()),
    MONTH: String(now.getMonth() + 1).padStart(2, '0'),
    DAY: String(now.getDate()).padStart(2, '0'),
    HOUR: String(now.getHours()).padStart(2, '0'),
    MINUTE: String(now.getMinutes()).padStart(2, '0'),
    SECOND: String(now.getSeconds()).padStart(2, '0'),
    TIMESTAMP: String(Date.now()),
    UUID: crypto.randomUUID(),
    FILENAME: 'snippet'
  }

  return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match
  })
}

function QuickSearch() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Snippet[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const cleanup = window.electronAPI?.onQuickSearchOpen(() => {
      setSearch('')
      setResults([])
      setSelectedIndex(0)
      inputRef.current?.focus()
    })

    inputRef.current?.focus()
    return cleanup
  }, [])

  useEffect(() => {
    if (search) {
      const filtered = defaultSnippets.filter(snippet =>
        snippet.title.toLowerCase().includes(search.toLowerCase()) ||
        snippet.content.toLowerCase().includes(search.toLowerCase()) ||
        snippet.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      )
      setResults(filtered)
      setSelectedIndex(0)
    } else {
      setResults([])
    }
  }, [search])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      window.electronAPI?.hideQuickSearch()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      const processed = replaceVariables(results[selectedIndex].content)
      window.electronAPI?.copyToClipboard(processed)
      window.electronAPI?.hideQuickSearch()
    }
  }

  const handleSelect = (snippet: Snippet) => {
    const processed = replaceVariables(snippet.content)
    window.electronAPI?.copyToClipboard(processed)
    window.electronAPI?.hideQuickSearch()
  }

  return (
    <div className="quick-search-container">
      <div className="quick-search-input">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="搜索代码片段..."
          autoFocus
        />
      </div>
      <div className="quick-search-results">
        {results.map((snippet, index) => (
          <div
            key={snippet.id}
            className={`quick-search-item ${index === selectedIndex ? 'active' : ''}`}
            onClick={() => handleSelect(snippet)}
          >
            <div style={{ fontWeight: 'bold' }}>{snippet.title}</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
              {snippet.language} • {snippet.tags.join(', ')}
            </div>
            <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8, maxHeight: '40px', overflow: 'hidden' }}>
              {snippet.content.substring(0, 100)}...
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default QuickSearch
