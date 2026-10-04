import { readFile, writeFile, mkdir, stat } from 'fs/promises'
import { resolve, dirname, extname, basename } from 'path'
import pdf from 'pdf-parse'
import mammoth from 'mammoth'
import { PermissionManager } from '../permissions.js'

export interface DocumentMetadata {
  title: string
  source: string
  format: string
  pageCount?: number
  wordCount: number
  charCount: number
  estimatedReadTime: string
  extractedAt: string
}

export interface ExtractResult {
  text: string
  source: string
  metadata: DocumentMetadata
}

export interface ChunkResult {
  chunks: string[]
  metadata: DocumentMetadata
}

export interface TableResult {
  tables: Array<{
    rows: string[][]
    format: 'csv' | 'tsv' | 'markdown' | 'unknown'
  }>
  source: string
}

export class KnowledgeTools {
  private permissionManager: PermissionManager
  private notesPath: string

  constructor(permissionManager: PermissionManager, notesPath = resolve(process.cwd(), 'data', 'notes.md')) {
    this.permissionManager = permissionManager
    this.notesPath = notesPath
  }

  /**
   * Extract text from various document formats
   * Supports: PDF, DOCX, TXT, MD, HTML, CSV, JSON
   */
  async extractText(filePath: string, captureSources = true): Promise<ExtractResult> {
    const absolutePath = resolve(filePath)
    await this.ensureReadable(absolutePath)
    const ext = extname(absolutePath).toLowerCase()
    const fileName = basename(absolutePath)

    let text = ''
    let pageCount: number | undefined

    try {
      switch (ext) {
        case '.pdf': {
          const buffer = await readFile(absolutePath)
          const data = await pdf(buffer)
          text = data.text
          pageCount = data.numpages
          break
        }
        case '.docx': {
          const result = await mammoth.extractRawText({ path: absolutePath })
          text = result.value
          if (result.messages.length > 0) {
            console.warn('DOCX warnings:', result.messages.map(m => m.message).join(', '))
          }
          break
        }
        case '.html':
        case '.htm': {
          const html = await readFile(absolutePath, 'utf-8')
          text = this.stripHtml(html)
          break
        }
        case '.json': {
          const json = await readFile(absolutePath, 'utf-8')
          text = JSON.stringify(JSON.parse(json), null, 2)
          break
        }
        case '.csv': {
          text = await readFile(absolutePath, 'utf-8')
          break
        }
        default:
          text = await readFile(absolutePath, 'utf-8')
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to extract text from ${fileName}: ${msg}`)
    }

    // Clean up text
    text = this.cleanText(text)

    const metadata = this.computeMetadata(fileName, absolutePath, ext, text, pageCount)
    const source = captureSources ? absolutePath : ''

    return { text, source, metadata }
  }

  /**
   * Extract text in chunks for large documents (reduces token usage)
   * @param chunkSize - Target characters per chunk (default 4000 ~= 1000 tokens)
   * @param overlap - Characters to overlap between chunks (default 200)
   */
  async extractChunked(filePath: string, chunkSize = 4000, overlap = 200): Promise<ChunkResult> {
    const { text, metadata } = await this.extractText(filePath, true)

    const chunks: string[] = []
    let start = 0

    while (start < text.length) {
      let end = start + chunkSize

      // Try to break at paragraph or sentence boundary
      if (end < text.length) {
        const paragraphBreak = text.lastIndexOf('\n\n', end)
        const sentenceBreak = text.lastIndexOf('. ', end)

        if (paragraphBreak > start + chunkSize * 0.5) {
          end = paragraphBreak + 2
        } else if (sentenceBreak > start + chunkSize * 0.5) {
          end = sentenceBreak + 2
        }
      }

      chunks.push(text.slice(start, end).trim())
      start = end - overlap
    }

    return { chunks, metadata }
  }

  /**
   * Extract tables from documents with better detection
   */
  async extractTables(filePath: string): Promise<TableResult> {
    const { text, source } = await this.extractText(filePath, true)
    const tables: TableResult['tables'] = []

    // Detect CSV-style tables (comma-separated)
    const csvBlocks = this.detectTableBlocks(text, ',')
    for (const block of csvBlocks) {
      tables.push({ rows: block, format: 'csv' })
    }

    // Detect TSV-style tables (tab-separated)
    const tsvBlocks = this.detectTableBlocks(text, '\t')
    for (const block of tsvBlocks) {
      tables.push({ rows: block, format: 'tsv' })
    }

    // Detect markdown tables
    const mdTables = this.detectMarkdownTables(text)
    for (const table of mdTables) {
      tables.push({ rows: table, format: 'markdown' })
    }

    return { tables, source }
  }

  /**
   * Get document summary without full extraction (faster for large docs)
   */
  async getDocumentInfo(filePath: string): Promise<DocumentMetadata> {
    const absolutePath = resolve(filePath)
    await this.ensureReadable(absolutePath)

    const ext = extname(absolutePath).toLowerCase()
    const fileName = basename(absolutePath)
    const stats = await stat(absolutePath)

    // For PDFs, we can get page count without full extraction
    if (ext === '.pdf') {
      try {
        const buffer = await readFile(absolutePath)
        const data = await pdf(buffer, { max: 1 }) // Only parse first page
        return {
          title: fileName,
          source: absolutePath,
          format: 'PDF',
          pageCount: data.numpages,
          wordCount: 0, // Unknown without full extraction
          charCount: stats.size,
          estimatedReadTime: `~${Math.ceil(data.numpages * 2)} min (based on page count)`,
          extractedAt: new Date().toISOString()
        }
      } catch {
        // Fall through to basic info
      }
    }

    return {
      title: fileName,
      source: absolutePath,
      format: ext.slice(1).toUpperCase(),
      wordCount: 0,
      charCount: stats.size,
      estimatedReadTime: 'Unknown',
      extractedAt: new Date().toISOString()
    }
  }

  async saveNote(title: string, source: string, content: string): Promise<string> {
    await this.permissionManager.requestPermission({
      action: 'write_file',
      resource: this.notesPath,
      details: 'Appending to local notes'
    })
    await mkdir(dirname(this.notesPath), { recursive: true })

    const timestamp = new Date().toISOString().split('T')[0]
    const entry = [
      '',
      `## ${title}`,
      `*Source: ${source}*`,
      `*Added: ${timestamp}*`,
      '',
      content,
      '',
      '---'
    ].join('\n')

    await writeFile(this.notesPath, entry, { flag: 'a' })
    return `Saved note "${title}" to ${this.notesPath}`
  }

  async searchLocal(query: string, limit = 5): Promise<string> {
    try {
      const { text } = await this.extractText(this.notesPath, false)
      const lines = text.split('\n').filter(Boolean)

      // Score lines by relevance (simple term frequency)
      const queryTerms = query.toLowerCase().split(/\s+/)
      const scored = lines.map(line => {
        const lower = line.toLowerCase()
        const score = queryTerms.reduce((s, term) => s + (lower.includes(term) ? 1 : 0), 0)
        return { line, score }
      })

      const matches = scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(s => s.line)

      if (matches.length === 0) {
        return `No matches found for "${query}" in local notes.`
      }

      return [`Found ${matches.length} matches for "${query}":`, '', ...matches].join('\n')
    } catch {
      return 'No notes found. Use saveNote to create notes first.'
    }
  }

  // ─── Private Helpers ─────────────────────────────────────────────

  private async ensureReadable(path: string) {
    await this.permissionManager.requestPermission({
      action: 'read_file',
      resource: path,
      details: 'Reading document for analysis'
    })
  }

  private cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')           // Normalize line endings
      .replace(/\n{3,}/g, '\n\n')        // Collapse multiple blank lines
      .replace(/[ \t]+/g, ' ')           // Collapse whitespace
      .replace(/^\s+|\s+$/gm, '')        // Trim lines
      .trim()
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')  // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')    // Remove styles
      .replace(/<[^>]+>/g, ' ')                            // Remove tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
  }

  private computeMetadata(
    fileName: string,
    source: string,
    ext: string,
    text: string,
    pageCount?: number
  ): DocumentMetadata {
    const words = text.split(/\s+/).filter(Boolean)
    const wordCount = words.length
    const charCount = text.length
    const readingSpeed = 200 // words per minute
    const minutes = Math.ceil(wordCount / readingSpeed)

    return {
      title: fileName,
      source,
      format: ext.slice(1).toUpperCase(),
      pageCount,
      wordCount,
      charCount,
      estimatedReadTime: minutes < 1 ? '< 1 min' : `~${minutes} min`,
      extractedAt: new Date().toISOString()
    }
  }

  private detectTableBlocks(text: string, delimiter: string): string[][][] {
    const lines = text.split('\n')
    const tables: string[][][] = []
    let currentTable: string[][] = []

    for (const line of lines) {
      const cells = line.split(delimiter)
      // Consider it a table row if it has 2+ cells and consistent structure
      if (cells.length >= 2 && cells.every(c => c.trim().length < 100)) {
        currentTable.push(cells.map(c => c.trim()))
      } else if (currentTable.length >= 2) {
        // End of table block (need at least 2 rows)
        tables.push(currentTable)
        currentTable = []
      } else {
        currentTable = []
      }
    }

    if (currentTable.length >= 2) {
      tables.push(currentTable)
    }

    return tables
  }

  private detectMarkdownTables(text: string): string[][][] {
    const tables: string[][][] = []
    const lines = text.split('\n')

    let i = 0
    while (i < lines.length) {
      // Look for markdown table header separator (|---|---|)
      if (/^\|?[\s-:|]+\|[\s-:|]+\|?$/.test(lines[i])) {
        const table: string[][] = []

        // Get header (previous line)
        if (i > 0 && lines[i - 1].includes('|')) {
          table.push(this.parseMarkdownRow(lines[i - 1]))
        }

        // Skip separator
        i++

        // Get body rows
        while (i < lines.length && lines[i].includes('|')) {
          table.push(this.parseMarkdownRow(lines[i]))
          i++
        }

        if (table.length >= 2) {
          tables.push(table)
        }
      } else {
        i++
      }
    }

    return tables
  }

  private parseMarkdownRow(line: string): string[] {
    return line
      .split('|')
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0)
  }
}
