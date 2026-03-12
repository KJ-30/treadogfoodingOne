import React, { useState, useEffect } from 'react'
import { Minus, Square, X, Folder, FileCode, Plus, Settings } from 'lucide-react'
import MonacoEditor from '@monaco-editor/react'
import { Folder as FolderType, Snippet } from '../shared/types'
import TitleBar from './components/TitleBar'
import FolderTree from './components/FolderTree'
import SnippetList from './components/SnippetList'

const defaultFolders: FolderType[] = [
  { id: '1', name: '收藏夹', parentId: null, createdAt: Date.now() },
  { id: '2', name: 'JavaScript', parentId: null, createdAt: Date.now() },
  { id: '3', name: 'Python', parentId: null, createdAt: Date.now() },
]

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

function App() {
  const [folders, setFolders] = useState<FolderType[]>(defaultFolders)
  const [snippets, setSnippets] = useState<Snippet[]>(defaultSnippets)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null)

  const filteredSnippets = selectedFolderId
    ? snippets.filter(s => s.folderId === selectedFolderId)
    : snippets

  const handleEditorChange = (value: string | undefined) => {
    if (selectedSnippet && value !== undefined) {
      setSnippets(prev =>
        prev.map(s =>
          s.id === selectedSnippet.id
            ? { ...s, content: value, updatedAt: Date.now() }
            : s
        )
      )
    }
  }

  return (
    <div className="app-container">
      <TitleBar />
      <div className="main-content">
        <div className="sidebar">
          <div className="sidebar-header">文件夹</div>
          <FolderTree
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
          />
        </div>
        <div className="snippet-list">
          <div className="snippet-list-header">代码片段 ({filteredSnippets.length})</div>
          <SnippetList
            snippets={filteredSnippets}
            selectedSnippet={selectedSnippet}
            onSelectSnippet={setSelectedSnippet}
          />
        </div>
        <div className="editor-container">
          <div className="editor-header">
            {selectedSnippet ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{selectedSnippet.title}</span>
                <span style={{ fontSize: '12px', color: '#888' }}>{selectedSnippet.language}</span>
              </div>
            ) : (
              '请选择一个代码片段'
            )}
          </div>
          <div className="editor-content">
            {selectedSnippet && (
              <MonacoEditor
                theme="vs-dark"
                language={selectedSnippet.language}
                value={selectedSnippet.content}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
