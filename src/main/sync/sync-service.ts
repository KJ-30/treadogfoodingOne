import { Octokit } from 'octokit'
import { DatabaseService, Snippet } from '../database/database-service'

export class SyncService {
  private db: DatabaseService
  private octokit: Octokit | null = null

  constructor(db: DatabaseService) {
    this.db = db
  }

  connectGitHub(token: string): boolean {
    try {
      this.octokit = new Octokit({ auth: token })
      this.db.setSetting('github_token', token)
      return true
    } catch (error) {
      console.error('Failed to connect GitHub:', error)
      return false
    }
  }

  async pushSnippet(snippetId: string): Promise<string | null> {
    if (!this.octokit) {
      throw new Error('GitHub not connected')
    }

    const snippet = this.db.getSnippetById(snippetId)
    if (!snippet) {
      throw new Error('Snippet not found')
    }

    try {
      if (snippet.gist_id) {
        await this.octokit.rest.gists.update({
          gist_id: snippet.gist_id,
          files: {
            [`${this.sanitizeFilename(snippet.title)}.${this.getExtension(snippet.language)}`]: {
              content: snippet.content
            }
          }
        })
        return snippet.gist_id
      } else {
        const response = await this.octokit.rest.gists.create({
          public: false,
          description: snippet.title,
          files: {
            [`${this.sanitizeFilename(snippet.title)}.${this.getExtension(snippet.language)}`]: {
              content: snippet.content
            }
          }
        })
        
        this.db.updateSnippet(snippetId, { gist_id: response.data.id })
        return response.data.id
      }
    } catch (error) {
      console.error('Failed to push snippet:', error)
      throw error
    }
  }

  async pullAll(): Promise<Snippet[]> {
    if (!this.octokit) {
      throw new Error('GitHub not connected')
    }

    try {
      const response = await this.octokit.rest.gists.list({
        per_page: 100
      })

      const pulledSnippets: Snippet[] = []

      for (const gist of response.data) {
        const files = Object.values(gist.files || {})
        if (files.length > 0) {
          const file = files[0]
          const content = await this.fetchGistContent(gist.id)
          
          const existingSnippet = this.db.getSnippetById(gist.id)
          
          if (existingSnippet) {
            this.db.updateSnippet(gist.id, {
              title: gist.description || file?.filename || 'Untitled',
              content: content || '',
            })
          } else {
            const snippet = this.db.createSnippet({
              id: gist.id,
              title: gist.description || file?.filename || 'Untitled',
              content: content || '',
              language: this.detectLanguage(file?.filename || ''),
              gist_id: gist.id,
            })
            pulledSnippets.push(snippet)
          }
        }
      }

      return pulledSnippets
    } catch (error) {
      console.error('Failed to pull gists:', error)
      throw error
    }
  }

  private async fetchGistContent(gistId: string): Promise<string | null> {
    if (!this.octokit) return null
    
    const response = await this.octokit.rest.gists.get({ gist_id: gistId })
    const files = Object.values(response.data.files || {})
    return files[0]?.content || null
  }

  private sanitizeFilename(name: string): string {
    return name.replace(/[^a-zA-Z0-9_-]/g, '_')
  }

  private getExtension(language: string): string {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      csharp: 'cs',
      go: 'go',
      rust: 'rs',
      ruby: 'rb',
      php: 'php',
      swift: 'swift',
      kotlin: 'kt',
      html: 'html',
      css: 'css',
      json: 'json',
      yaml: 'yaml',
      markdown: 'md',
      sql: 'sql',
      shell: 'sh',
      bash: 'sh',
    }
    return extensions[language.toLowerCase()] || 'txt'
  }

  private detectLanguage(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    const languages: Record<string, string> = {
      js: 'javascript',
      ts: 'typescript',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      go: 'go',
      rs: 'rust',
      rb: 'ruby',
      php: 'php',
      swift: 'swift',
      kt: 'kotlin',
      html: 'html',
      css: 'css',
      json: 'json',
      yaml: 'yaml',
      yml: 'yaml',
      md: 'markdown',
      sql: 'sql',
      sh: 'shell',
    }
    return languages[ext] || 'plaintext'
  }
}
