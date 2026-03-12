import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Snippet } from '../../../main/database/database-service'
import { useSnippetStore } from '../../stores/snippet-store'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface PreviewEditorProps {
  snippet: Snippet
}

export function PreviewEditor({ snippet }: PreviewEditorProps) {
  const [title, setTitle] = useState(snippet.title)
  const [content, setContent] = useState(snippet.content)
  const [language, setLanguage] = useState(snippet.language)
  const [tags, setTags] = useState(snippet.tags.join(', '))
  const [isSaving, setIsSaving] = useState(false)
  const { updateSnippet, deleteSnippet } = useSnippetStore()

  useEffect(() => {
    setTitle(snippet.title)
    setContent(snippet.content)
    setLanguage(snippet.language)
    setTags(snippet.tags.join(', '))
  }, [snippet.id])

  const handleSave = async () => {
    setIsSaving(true)
    await updateSnippet(snippet.id, {
      title,
      content,
      language,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    })
    setIsSaving(false)
  }

  const handleCopy = async () => {
    await window.api.clipboard.copyWithVariables(content, {})
  }

  const handleDelete = async () => {
    if (confirm('确定要删除这个片段吗？')) {
      await deleteSnippet(snippet.id)
    }
  }

  const handleSync = async () => {
    try {
      await window.api.sync.pushSnippet(snippet.id)
      alert('同步成功')
    } catch (error) {
      alert('同步失败: ' + error)
    }
  }

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
    'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'html', 'css',
    'json', 'yaml', 'markdown', 'sql', 'shell', 'plaintext'
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-app-border space-y-3">
        <div className="flex items-center gap-2">
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="flex-1"
          />
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="px-2 py-1 bg-app-bg-secondary border border-app-border rounded text-app-text-primary text-sm"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="标签（逗号分隔）"
            className="flex-1"
          />
          <Button onClick={handleCopy} variant="secondary">
            复制
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? '保存中...' : '保存'}
          </Button>
          <Button onClick={handleSync} variant="ghost">
            同步
          </Button>
          <Button onClick={handleDelete} variant="danger">
            删除
          </Button>
        </div>
      </div>

      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={content}
          onChange={value => setContent(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 10 },
          }}
        />
      </div>
    </div>
  )
}
