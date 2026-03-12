import { useState, useEffect } from 'react'

export function SettingsPage() {
  const [githubToken, setGithubToken] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const token = await window.api.settings.get('github_token')
    if (token) {
      setGithubToken(token)
      setIsConnected(true)
    }
  }

  const handleConnect = async () => {
    if (!githubToken.trim()) return
    
    const success = await window.api.sync.connectGitHub(githubToken)
    if (success) {
      setIsConnected(true)
    }
  }

  const handleSync = async () => {
    try {
      await window.api.sync.pullAll()
      alert('同步完成')
    } catch (error) {
      alert('同步失败: ' + error)
    }
  }

  return (
    <div className="h-full p-6 overflow-y-auto">
      <h1 className="text-xl font-semibold mb-6">设置</h1>
      
      <section className="mb-8">
        <h2 className="text-lg font-medium mb-4">GitHub 同步</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-app-text-secondary mb-2">
              Personal Access Token
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={githubToken}
                onChange={e => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                className="flex-1 px-3 py-2 bg-app-bg-secondary border border-app-border rounded text-app-text-primary placeholder:text-app-text-muted"
              />
              <button
                onClick={handleConnect}
                className="px-4 py-2 bg-app-accent hover:bg-app-accent-hover rounded text-white"
              >
                {isConnected ? '已连接' : '连接'}
              </button>
            </div>
          </div>
          
          {isConnected && (
            <button
              onClick={handleSync}
              className="px-4 py-2 bg-app-bg-secondary hover:bg-app-bg-hover border border-app-border rounded"
            >
              从 GitHub 拉取片段
            </button>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-medium mb-4">快捷键</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-app-border">
            <span>全局搜索</span>
            <kbd className="px-2 py-1 bg-app-bg-secondary rounded text-app-text-muted">
              {navigator.platform.includes('Mac') ? '⌘⇧Space' : 'Ctrl+Shift+Space'}
            </kbd>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-4">变量说明</h2>
        <div className="text-sm space-y-2">
          <p className="text-app-text-secondary">在片段中使用 <code className="px-1 bg-app-bg-secondary rounded">{'{{变量名}}'}</code> 格式插入动态内容：</p>
          <ul className="list-disc list-inside space-y-1 text-app-text-muted">
            <li><code>{'{{date}}'}</code> - 当前日期</li>
            <li><code>{'{{time}}'}</code> - 当前时间</li>
            <li><code>{'{{datetime}}'}</code> - 日期和时间</li>
            <li><code>{'{{timestamp}}'}</code> - Unix 时间戳</li>
            <li><code>{'{{year}}'}</code> - 年份</li>
            <li><code>{'{{month}}'}</code> - 月份</li>
            <li><code>{'{{day}}'}</code> - 日期</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
