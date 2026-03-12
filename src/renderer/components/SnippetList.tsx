import React from 'react'
import { Snippet } from '../../shared/types'

interface SnippetListProps {
  snippets: Snippet[]
  selectedSnippet: Snippet | null
  onSelectSnippet: (snippet: Snippet) => void
}

function SnippetList({ snippets, selectedSnippet, onSelectSnippet }: SnippetListProps) {
  return (
    <div className="snippet-items">
      {snippets.map(snippet => (
        <div
          key={snippet.id}
          className={`snippet-item ${selectedSnippet?.id === snippet.id ? 'active' : ''}`}
          onClick={() => onSelectSnippet(snippet)}
        >
          <div className="title">{snippet.title}</div>
          <div className="language">{snippet.language}</div>
        </div>
      ))}
    </div>
  )
}

export default SnippetList
