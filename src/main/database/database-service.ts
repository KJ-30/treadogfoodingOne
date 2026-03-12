import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

export interface Snippet {
  id: string;
  title: string;
  content: string;
  language: string;
  folder_id: string | null;
  tags: string[];
  variables: Record<string, string>;
  sort_order: number;
  created_at: string;
  updated_at: string;
  gist_id: string | null;
}

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export class DatabaseService {
  private db: SqlJsDatabase | null = null;
  private dbPath: string;
  private initialized = false;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    const SQL = await initSqlJs();

    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    if (fs.existsSync(this.dbPath)) {
      const buffer = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(buffer);
    } else {
      this.db = new SQL.Database();
    }

    this.initializeTables();
    this.initialized = true;
  }

  private saveDatabase(): void {
    if (!this.db) return;
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.dbPath, buffer);
  }

  private initializeTables(): void {
    if (!this.db) return;

    this.db.run(`
      CREATE TABLE IF NOT EXISTS tb_folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES tb_folders(id) ON DELETE CASCADE
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS tb_snippets (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        language TEXT DEFAULT 'plaintext',
        folder_id TEXT,
        tags TEXT DEFAULT '[]',
        variables TEXT DEFAULT '{}',
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        gist_id TEXT,
        FOREIGN KEY (folder_id) REFERENCES tb_folders(id) ON DELETE SET NULL
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS tb_tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        color TEXT DEFAULT '#3b82f6'
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS tb_snippet_tags (
        snippet_id TEXT,
        tag_id TEXT,
        PRIMARY KEY (snippet_id, tag_id),
        FOREIGN KEY (snippet_id) REFERENCES tb_snippets(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tb_tags(id) ON DELETE CASCADE
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS tb_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);

    this.saveDatabase();
  }

  private ensureInit(): void {
    if (!this.initialized || !this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
  }

  getAllSnippets(): Snippet[] {
    this.ensureInit();
    const result = this.db!.exec('SELECT * FROM tb_snippets ORDER BY sort_order, created_at DESC');
    if (result.length === 0) return [];

    const columns = result[0].columns;
    return result[0].values.map((row) => {
      const obj: any = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return {
        ...obj,
        tags: JSON.parse(obj.tags || '[]'),
        variables: JSON.parse(obj.variables || '{}'),
      };
    });
  }

  getSnippetById(id: string): Snippet | null {
    this.ensureInit();
    const result = this.db!.exec('SELECT * FROM tb_snippets WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;

    const columns = result[0].columns;
    const row = result[0].values[0];
    const obj: any = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return {
      ...obj,
      tags: JSON.parse(obj.tags || '[]'),
      variables: JSON.parse(obj.variables || '{}'),
    };
  }

  createSnippet(data: Partial<Snippet>): Snippet {
    this.ensureInit();
    const id = uuidv4();
    this.db!.run(
      `INSERT INTO tb_snippets (id, title, content, language, folder_id, tags, variables, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.title || 'Untitled', data.content || '', data.language || 'plaintext', data.folder_id || null, JSON.stringify(data.tags || []), JSON.stringify(data.variables || {}), data.sort_order || 0],
    );
    this.saveDatabase();
    return this.getSnippetById(id)!;
  }

  updateSnippet(id: string, data: Partial<Snippet>): Snippet | null {
    this.ensureInit();
    const fields: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }
    if (data.content !== undefined) {
      fields.push('content = ?');
      values.push(data.content);
    }
    if (data.language !== undefined) {
      fields.push('language = ?');
      values.push(data.language);
    }
    if (data.folder_id !== undefined) {
      fields.push('folder_id = ?');
      values.push(data.folder_id);
    }
    if (data.tags !== undefined) {
      fields.push('tags = ?');
      values.push(JSON.stringify(data.tags));
    }
    if (data.variables !== undefined) {
      fields.push('variables = ?');
      values.push(JSON.stringify(data.variables));
    }
    if (data.gist_id !== undefined) {
      fields.push('gist_id = ?');
      values.push(data.gist_id);
    }

    fields.push('updated_at = datetime("now")');
    values.push(id);

    this.db!.run(`UPDATE tb_snippets SET ${fields.join(', ')} WHERE id = ?`, values);
    this.saveDatabase();
    return this.getSnippetById(id);
  }

  deleteSnippet(id: string): boolean {
    this.ensureInit();
    this.db!.run('DELETE FROM tb_snippets WHERE id = ?', [id]);
    this.saveDatabase();
    return true;
  }

  searchSnippets(query: string): Snippet[] {
    this.ensureInit();
    const searchTerm = `%${query}%`;
    const result = this.db!.exec(`SELECT * FROM tb_snippets WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC`, [searchTerm, searchTerm]);
    if (result.length === 0) return [];

    const columns = result[0].columns;
    return result[0].values.map((row) => {
      const obj: any = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return {
        ...obj,
        tags: JSON.parse(obj.tags || '[]'),
        variables: JSON.parse(obj.variables || '{}'),
      };
    });
  }

  getAllFolders(): Folder[] {
    this.ensureInit();
    const result = this.db!.exec('SELECT * FROM tb_folders ORDER BY sort_order, name');
    if (result.length === 0) return [];

    const columns = result[0].columns;
    return result[0].values.map((row) => {
      const obj: any = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  }

  createFolder(data: Partial<Folder>): Folder {
    this.ensureInit();
    const id = uuidv4();
    this.db!.run(`INSERT INTO tb_folders (id, name, parent_id, sort_order) VALUES (?, ?, ?, ?)`, [id, data.name || 'New Folder', data.parent_id || null, data.sort_order || 0]);
    this.saveDatabase();

    const result = this.db!.exec('SELECT * FROM tb_folders WHERE id = ?', [id]);
    const columns = result[0].columns;
    const row = result[0].values[0];
    const obj: any = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  }

  updateFolder(id: string, data: Partial<Folder>): Folder | null {
    this.ensureInit();
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.parent_id !== undefined) {
      fields.push('parent_id = ?');
      values.push(data.parent_id);
    }
    if (data.sort_order !== undefined) {
      fields.push('sort_order = ?');
      values.push(data.sort_order);
    }

    values.push(id);
    this.db!.run(`UPDATE tb_folders SET ${fields.join(', ')} WHERE id = ?`, values);
    this.saveDatabase();

    const result = this.db!.exec('SELECT * FROM tb_folders WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    const columns = result[0].columns;
    const row = result[0].values[0];
    const obj: any = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  }

  deleteFolder(id: string): boolean {
    this.ensureInit();
    this.db!.run('DELETE FROM tb_folders WHERE id = ?', [id]);
    this.saveDatabase();
    return true;
  }

  getAllTags(): Tag[] {
    this.ensureInit();
    const result = this.db!.exec('SELECT * FROM tb_tags ORDER BY name');
    if (result.length === 0) return [];

    const columns = result[0].columns;
    return result[0].values.map((row) => {
      const obj: any = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  }

  getSetting(key: string): string | null {
    this.ensureInit();
    const result = this.db!.exec('SELECT value FROM tb_settings WHERE key = ?', [key]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    return result[0].values[0][0] as string;
  }

  setSetting(key: string, value: string): void {
    this.ensureInit();
    this.db!.run(`INSERT OR REPLACE INTO tb_settings (key, value) VALUES (?, ?)`, [key, value]);
    this.saveDatabase();
  }
}
