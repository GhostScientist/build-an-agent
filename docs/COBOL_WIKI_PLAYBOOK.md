# COBOL Repository Wiki Generation Playbook

A step-by-step guide to analyze a COBOL codebase and generate architectural documentation using AST chunking, semantic indexing, and wiki generation.

## Prerequisites

```bash
# Ensure you have Node.js 18+
node --version

# Install dependencies in the agent-workshop-app
cd agent-workshop-app
npm install

# You'll also need TypeScript for the COBOL chunker
npm install -D typescript ts-node @types/node
```

## Overview

The pipeline has 4 stages:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  1. CHUNK   │ -> │  2. INDEX   │ -> │  3. WIKI    │ -> │  4. SITE    │
│  (Parse)    │    │  (Embed)    │    │  (Generate) │    │  (Build)    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

## Stage 0: Setup COBOL Chunker

The default AST chunker uses TypeScript's compiler. For COBOL, we need a specialized chunker that understands COBOL's structure (DIVISIONS, SECTIONS, PARAGRAPHS, COPYBOOKS).

Create this file in your project:

### `scripts/cobol-analyzer.ts`

```typescript
/**
 * COBOL Analyzer Script
 *
 * Analyzes COBOL source files and generates wiki documentation.
 * COBOL Structure:
 *   - IDENTIFICATION DIVISION (program metadata)
 *   - ENVIRONMENT DIVISION (file definitions)
 *   - DATA DIVISION (variables, records)
 *   - PROCEDURE DIVISION (business logic)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs'
import { join, basename, dirname, extname, relative } from 'path'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface CobolChunk {
  id: string
  type: 'program' | 'division' | 'section' | 'paragraph' | 'copybook' | 'data-item' | 'file-definition'
  name: string
  filePath: string
  startLine: number
  endLine: number
  code: string
  documentation?: string
  parent?: string
  children: string[]
  metadata: {
    level?: number          // For data items (01, 05, 10, etc.)
    picture?: string        // PIC clause
    usage?: string          // COMP, DISPLAY, etc.
    redefines?: string      // REDEFINES clause
    copySource?: string     // For COPY statements
    performsTo?: string[]   // PERFORM targets
    callsTo?: string[]      // CALL targets
  }
}

interface CobolFile {
  path: string
  relativePath: string
  programId: string
  divisions: string[]
  sections: string[]
  paragraphs: string[]
  dataItems: string[]
  copybooks: string[]
  calls: string[]
  performs: string[]
  chunks: CobolChunk[]
  metrics: {
    totalLines: number
    codeLines: number
    commentLines: number
    blankLines: number
    complexity: number
  }
}

interface CobolCodebase {
  files: CobolFile[]
  copybooks: Map<string, string>
  callGraph: Map<string, string[]>
  programIndex: Map<string, CobolFile>
  timestamp: string
}

interface WikiDocument {
  path: string
  title: string
  content: string
}

// ═══════════════════════════════════════════════════════════════════════════
// COBOL CHUNKER
// ═══════════════════════════════════════════════════════════════════════════

class CobolChunker {
  private divisionPattern = /^\s{6}\s*(IDENTIFICATION|ENVIRONMENT|DATA|PROCEDURE)\s+DIVISION/i
  private sectionPattern = /^\s{6}\s*(\w[\w-]*)\s+SECTION\s*\./i
  private paragraphPattern = /^\s{6}\s*(\w[\w-]*)\s*\.\s*$/i
  private programIdPattern = /^\s{6}\s*PROGRAM-ID\s*\.\s*(\w[\w-]*)/i
  private copyPattern = /^\s{6}\s*COPY\s+(\w[\w-]*)/i
  private callPattern = /\bCALL\s+['"]?(\w[\w-]*)['"]?/gi
  private performPattern = /\bPERFORM\s+(\w[\w-]*)/gi
  private dataItemPattern = /^\s{6}\s*(\d{2})\s+(\w[\w-]*)/i
  private picPattern = /\bPIC(?:TURE)?\s+(?:IS\s+)?([SX9AV()+-]+)/i

  /**
   * Analyze a single COBOL file
   */
  analyzeFile(filePath: string, basePath: string): CobolFile {
    const content = readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    const relativePath = relative(basePath, filePath)

    const chunks: CobolChunk[] = []
    let programId = basename(filePath, extname(filePath))
    let currentDivision: CobolChunk | null = null
    let currentSection: CobolChunk | null = null
    let currentParagraph: CobolChunk | null = null

    const divisions: string[] = []
    const sections: string[] = []
    const paragraphs: string[] = []
    const dataItems: string[] = []
    const copybooks: string[] = []
    const calls: string[] = []
    const performs: string[] = []

    let codeLines = 0
    let commentLines = 0
    let blankLines = 0
    let complexity = 1

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNum = i + 1

      // Skip sequence numbers (columns 1-6) and handle comments
      const effectiveLine = line.length > 6 ? line.substring(6) : ''
      const indicator = line.length > 6 ? line[6] : ' '

      // Count line types
      if (!line.trim()) {
        blankLines++
        continue
      }
      if (indicator === '*' || indicator === '/') {
        commentLines++
        continue
      }
      codeLines++

      // Extract PROGRAM-ID
      const programIdMatch = line.match(this.programIdPattern)
      if (programIdMatch) {
        programId = programIdMatch[1]
      }

      // Detect DIVISION
      const divisionMatch = line.match(this.divisionPattern)
      if (divisionMatch) {
        if (currentDivision) {
          currentDivision.endLine = lineNum - 1
        }
        currentDivision = {
          id: `${programId}:division:${divisionMatch[1]}`,
          type: 'division',
          name: `${divisionMatch[1]} DIVISION`,
          filePath,
          startLine: lineNum,
          endLine: lineNum,
          code: line,
          children: [],
          metadata: {}
        }
        chunks.push(currentDivision)
        divisions.push(divisionMatch[1])
        currentSection = null
        currentParagraph = null
      }

      // Detect SECTION
      const sectionMatch = line.match(this.sectionPattern)
      if (sectionMatch && currentDivision) {
        if (currentSection) {
          currentSection.endLine = lineNum - 1
        }
        currentSection = {
          id: `${programId}:section:${sectionMatch[1]}`,
          type: 'section',
          name: sectionMatch[1],
          filePath,
          startLine: lineNum,
          endLine: lineNum,
          code: line,
          parent: currentDivision.id,
          children: [],
          metadata: {}
        }
        chunks.push(currentSection)
        sections.push(sectionMatch[1])
        currentDivision.children.push(currentSection.id)
        currentParagraph = null
      }

      // Detect PARAGRAPH (in PROCEDURE DIVISION)
      if (currentDivision?.name.includes('PROCEDURE')) {
        const paragraphMatch = line.match(this.paragraphPattern)
        if (paragraphMatch && !line.match(this.sectionPattern)) {
          if (currentParagraph) {
            currentParagraph.endLine = lineNum - 1
          }
          currentParagraph = {
            id: `${programId}:paragraph:${paragraphMatch[1]}`,
            type: 'paragraph',
            name: paragraphMatch[1],
            filePath,
            startLine: lineNum,
            endLine: lineNum,
            code: line,
            parent: currentSection?.id || currentDivision.id,
            children: [],
            metadata: {
              performsTo: [],
              callsTo: []
            }
          }
          chunks.push(currentParagraph)
          paragraphs.push(paragraphMatch[1])
          if (currentSection) {
            currentSection.children.push(currentParagraph.id)
          }
        }
      }

      // Detect DATA items (in DATA DIVISION)
      if (currentDivision?.name.includes('DATA')) {
        const dataMatch = line.match(this.dataItemPattern)
        if (dataMatch) {
          const level = parseInt(dataMatch[1])
          const name = dataMatch[2]
          const picMatch = line.match(this.picPattern)

          const dataChunk: CobolChunk = {
            id: `${programId}:data:${name}`,
            type: 'data-item',
            name,
            filePath,
            startLine: lineNum,
            endLine: lineNum,
            code: line,
            parent: currentSection?.id || currentDivision.id,
            children: [],
            metadata: {
              level,
              picture: picMatch?.[1]
            }
          }
          chunks.push(dataChunk)
          dataItems.push(name)
        }
      }

      // Detect COPY statements
      const copyMatch = line.match(this.copyPattern)
      if (copyMatch) {
        copybooks.push(copyMatch[1])
      }

      // Detect CALL statements
      let callMatch
      while ((callMatch = this.callPattern.exec(line)) !== null) {
        calls.push(callMatch[1])
        if (currentParagraph) {
          currentParagraph.metadata.callsTo?.push(callMatch[1])
        }
        complexity += 2  // Calls add complexity
      }

      // Detect PERFORM statements
      let performMatch
      while ((performMatch = this.performPattern.exec(line)) !== null) {
        performs.push(performMatch[1])
        if (currentParagraph) {
          currentParagraph.metadata.performsTo?.push(performMatch[1])
        }
        complexity++
      }

      // Count complexity indicators
      if (/\bIF\b/i.test(line)) complexity++
      if (/\bEVALUATE\b/i.test(line)) complexity++
      if (/\bPERFORM\s+.*\s+UNTIL\b/i.test(line)) complexity++
    }

    // Close any open chunks
    if (currentParagraph) currentParagraph.endLine = lines.length
    if (currentSection) currentSection.endLine = lines.length
    if (currentDivision) currentDivision.endLine = lines.length

    // Extract code for each chunk
    for (const chunk of chunks) {
      chunk.code = lines.slice(chunk.startLine - 1, chunk.endLine).join('\n')
    }

    return {
      path: filePath,
      relativePath,
      programId,
      divisions,
      sections,
      paragraphs,
      dataItems,
      copybooks: [...new Set(copybooks)],
      calls: [...new Set(calls)],
      performs: [...new Set(performs)],
      chunks,
      metrics: {
        totalLines: lines.length,
        codeLines,
        commentLines,
        blankLines,
        complexity
      }
    }
  }

  /**
   * Analyze an entire COBOL codebase
   */
  analyzeCodebase(basePath: string): CobolCodebase {
    const files: CobolFile[] = []
    const copybooks = new Map<string, string>()
    const callGraph = new Map<string, string[]>()
    const programIndex = new Map<string, CobolFile>()

    // Find all COBOL files
    const cobolFiles = this.findCobolFiles(basePath)

    for (const filePath of cobolFiles) {
      try {
        const analysis = this.analyzeFile(filePath, basePath)
        files.push(analysis)
        programIndex.set(analysis.programId, analysis)

        // Build call graph
        if (analysis.calls.length > 0) {
          callGraph.set(analysis.programId, analysis.calls)
        }

        // Track copybooks
        for (const copy of analysis.copybooks) {
          copybooks.set(copy, filePath)
        }
      } catch (error) {
        console.warn(`Failed to analyze ${filePath}: ${error}`)
      }
    }

    return {
      files,
      copybooks,
      callGraph,
      programIndex,
      timestamp: new Date().toISOString()
    }
  }

  private findCobolFiles(dir: string): string[] {
    const files: string[] = []
    const cobolExtensions = ['.cob', '.cbl', '.cpy', '.cobol', '.COB', '.CBL', '.CPY', '.COBOL']

    const walk = (currentDir: string) => {
      const entries = readdirSync(currentDir)
      for (const entry of entries) {
        const fullPath = join(currentDir, entry)
        const stat = statSync(fullPath)

        if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
          walk(fullPath)
        } else if (stat.isFile() && cobolExtensions.some(ext => entry.endsWith(ext))) {
          files.push(fullPath)
        }
      }
    }

    walk(dir)
    return files
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SEMANTIC INDEX
// ═══════════════════════════════════════════════════════════════════════════

interface SemanticEntry {
  id: string
  type: string
  name: string
  file: string
  keywords: string[]
  score: number
}

class CobolSemanticIndex {
  private entries: SemanticEntry[] = []

  buildIndex(codebase: CobolCodebase): void {
    for (const file of codebase.files) {
      // Index program
      this.entries.push({
        id: file.programId,
        type: 'program',
        name: file.programId,
        file: file.relativePath,
        keywords: this.extractKeywords(file),
        score: this.calculateImportance(file)
      })

      // Index chunks
      for (const chunk of file.chunks) {
        this.entries.push({
          id: chunk.id,
          type: chunk.type,
          name: chunk.name,
          file: file.relativePath,
          keywords: this.extractChunkKeywords(chunk),
          score: chunk.type === 'paragraph' ? 2 : 1
        })
      }
    }
  }

  search(query: string, limit = 10): SemanticEntry[] {
    const terms = query.toLowerCase().split(/\s+/)

    return this.entries
      .map(entry => ({
        entry,
        matchScore: terms.filter(t =>
          entry.keywords.some(k => k.includes(t)) ||
          entry.name.toLowerCase().includes(t)
        ).length
      }))
      .filter(r => r.matchScore > 0)
      .sort((a, b) => (b.matchScore * b.entry.score) - (a.matchScore * a.entry.score))
      .slice(0, limit)
      .map(r => r.entry)
  }

  findRelated(id: string, limit = 5): SemanticEntry[] {
    const source = this.entries.find(e => e.id === id)
    if (!source) return []

    return this.entries
      .filter(e => e.id !== id)
      .map(entry => ({
        entry,
        similarity: this.calculateSimilarity(source.keywords, entry.keywords)
      }))
      .filter(r => r.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(r => r.entry)
  }

  private extractKeywords(file: CobolFile): string[] {
    const keywords: string[] = [
      file.programId.toLowerCase(),
      ...file.sections.map(s => s.toLowerCase()),
      ...file.paragraphs.map(p => p.toLowerCase()),
      ...file.calls.map(c => c.toLowerCase())
    ]
    return [...new Set(keywords)]
  }

  private extractChunkKeywords(chunk: CobolChunk): string[] {
    const keywords = [chunk.name.toLowerCase()]

    // Extract words from name
    const words = chunk.name.split(/[-_]/).map(w => w.toLowerCase())
    keywords.push(...words)

    // Add metadata
    if (chunk.metadata.callsTo) {
      keywords.push(...chunk.metadata.callsTo.map(c => c.toLowerCase()))
    }
    if (chunk.metadata.performsTo) {
      keywords.push(...chunk.metadata.performsTo.map(p => p.toLowerCase()))
    }

    return [...new Set(keywords)]
  }

  private calculateImportance(file: CobolFile): number {
    let score = 1
    score += file.calls.length * 0.5  // Programs that call others are important
    score += file.paragraphs.length * 0.1
    return score
  }

  private calculateSimilarity(a: string[], b: string[]): number {
    const setA = new Set(a)
    const setB = new Set(b)
    const intersection = [...setA].filter(x => setB.has(x)).length
    const union = new Set([...a, ...b]).size
    return union > 0 ? intersection / union : 0
  }

  getStats() {
    return {
      totalEntries: this.entries.length,
      byType: this.entries.reduce((acc, e) => {
        acc[e.type] = (acc[e.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// WIKI GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

class CobolWikiGenerator {
  private codebase: CobolCodebase
  private index: CobolSemanticIndex
  private outputPath: string
  private projectName: string

  constructor(
    codebase: CobolCodebase,
    index: CobolSemanticIndex,
    outputPath: string,
    projectName: string
  ) {
    this.codebase = codebase
    this.index = index
    this.outputPath = outputPath
    this.projectName = projectName
  }

  generate(): WikiDocument[] {
    const docs: WikiDocument[] = []

    // Overview
    docs.push(this.generateOverview())

    // Architecture
    docs.push(this.generateArchitecture())

    // Call Graph
    docs.push(this.generateCallGraph())

    // Program documentation
    for (const file of this.codebase.files) {
      docs.push(this.generateProgramDoc(file))
    }

    // Data Dictionary
    docs.push(this.generateDataDictionary())

    // Index
    docs.push(this.generateIndex(docs))

    return docs
  }

  writeAll(docs: WikiDocument[]): void {
    for (const doc of docs) {
      const fullPath = join(this.outputPath, doc.path)
      mkdirSync(dirname(fullPath), { recursive: true })
      writeFileSync(fullPath, doc.content, 'utf-8')
    }
    console.log(`Generated ${docs.length} wiki documents in ${this.outputPath}`)
  }

  private frontmatter(title: string, description: string, sources: string[] = []): string {
    return `---
title: ${title}
generated: '${new Date().toISOString()}'
description: >-
  ${description}
related: []
sources:
${sources.length > 0 ? sources.map(s => `  - ${s}`).join('\n') : '  []'}
---`
  }

  private generateOverview(): WikiDocument {
    const stats = this.index.getStats()
    const totalLines = this.codebase.files.reduce((sum, f) => sum + f.metrics.totalLines, 0)
    const totalPrograms = this.codebase.files.length

    const content = `${this.frontmatter(
      `${this.projectName} - Overview`,
      'COBOL codebase architectural overview'
    )}

## Summary

This COBOL codebase contains **${totalPrograms} programs** with approximately **${totalLines.toLocaleString()} lines** of code.

## Quick Stats

| Metric | Value |
|--------|-------|
| Total Programs | ${totalPrograms} |
| Total Lines | ${totalLines.toLocaleString()} |
| Copybooks Used | ${this.codebase.copybooks.size} |
| Inter-program Calls | ${this.codebase.callGraph.size} |

## Programs by Complexity

${this.codebase.files
  .sort((a, b) => b.metrics.complexity - a.metrics.complexity)
  .slice(0, 10)
  .map((f, i) => `${i + 1}. **${f.programId}** - Complexity: ${f.metrics.complexity}`)
  .join('\n')}

## Semantic Index Stats

| Type | Count |
|------|-------|
${Object.entries(stats.byType).map(([type, count]) => `| ${type} | ${count} |`).join('\n')}
`

    return { path: 'overview.md', title: `${this.projectName} Overview`, content }
  }

  private generateArchitecture(): WikiDocument {
    const content = `${this.frontmatter(
      'System Architecture',
      'COBOL system architecture and program organization'
    )}

## Program Structure

COBOL programs in this codebase follow the standard division structure:

1. **IDENTIFICATION DIVISION** - Program metadata
2. **ENVIRONMENT DIVISION** - File and system definitions
3. **DATA DIVISION** - Variable and record definitions
4. **PROCEDURE DIVISION** - Business logic

## Division Summary

| Program | Sections | Paragraphs | Data Items |
|---------|----------|------------|------------|
${this.codebase.files
  .slice(0, 20)
  .map(f => `| ${f.programId} | ${f.sections.length} | ${f.paragraphs.length} | ${f.dataItems.length} |`)
  .join('\n')}

## Copybooks

Shared copybooks used across programs:

${[...this.codebase.copybooks.entries()]
  .map(([name, file]) => `- **${name}** - used in ${basename(file)}`)
  .join('\n') || 'No copybooks detected.'}

## Code Metrics

| Program | Lines | Code | Comments | Complexity |
|---------|-------|------|----------|------------|
${this.codebase.files
  .map(f => `| ${f.programId} | ${f.metrics.totalLines} | ${f.metrics.codeLines} | ${f.metrics.commentLines} | ${f.metrics.complexity} |`)
  .join('\n')}
`

    return { path: 'architecture.md', title: 'System Architecture', content }
  }

  private generateCallGraph(): WikiDocument {
    const content = `${this.frontmatter(
      'Program Call Graph',
      'Inter-program dependencies and call relationships'
    )}

## Overview

This diagram shows how programs call each other using COBOL CALL statements.

## Call Relationships

\`\`\`
${[...this.codebase.callGraph.entries()]
  .map(([caller, callees]) => `${caller}\n${callees.map(c => `  └── calls → ${c}`).join('\n')}`)
  .join('\n\n') || 'No inter-program calls detected.'}
\`\`\`

## Dependency Matrix

| Caller | Calls |
|--------|-------|
${[...this.codebase.callGraph.entries()]
  .map(([caller, callees]) => `| ${caller} | ${callees.join(', ')} |`)
  .join('\n') || '| (none) | (none) |'}

## Entry Points

Programs that are NOT called by any other program (potential entry points):

${this.codebase.files
  .filter(f => {
    for (const [, callees] of this.codebase.callGraph) {
      if (callees.includes(f.programId)) return false
    }
    return true
  })
  .map(f => `- **${f.programId}** (${f.relativePath})`)
  .join('\n') || 'All programs are called by other programs.'}
`

    return { path: 'call-graph.md', title: 'Call Graph', content }
  }

  private generateProgramDoc(file: CobolFile): WikiDocument {
    const related = this.index.findRelated(file.programId, 5)

    const content = `${this.frontmatter(
      file.programId,
      `Documentation for COBOL program ${file.programId}`,
      [file.relativePath]
    )}

## Overview

| Property | Value |
|----------|-------|
| Program ID | ${file.programId} |
| File | \`${file.relativePath}\` |
| Total Lines | ${file.metrics.totalLines} |
| Complexity | ${file.metrics.complexity} |

## Structure

### Divisions
${file.divisions.map(d => `- ${d} DIVISION`).join('\n')}

### Sections
${file.sections.length > 0 ? file.sections.map(s => `- ${s}`).join('\n') : 'No sections defined.'}

### Paragraphs
${file.paragraphs.length > 0 ? file.paragraphs.map(p => `- ${p}`).join('\n') : 'No paragraphs defined.'}

## Dependencies

### Copybooks Used
${file.copybooks.length > 0 ? file.copybooks.map(c => `- ${c}`).join('\n') : 'No copybooks.'}

### Programs Called
${file.calls.length > 0 ? file.calls.map(c => `- ${c}`).join('\n') : 'No external calls.'}

### Internal PERFORMs
${file.performs.length > 0 ? file.performs.slice(0, 20).map(p => `- ${p}`).join('\n') : 'No PERFORM statements.'}
${file.performs.length > 20 ? `\n...and ${file.performs.length - 20} more` : ''}

## Data Items

${file.dataItems.length > 0 ? `
| Level | Name |
|-------|------|
${file.chunks
  .filter(c => c.type === 'data-item')
  .slice(0, 30)
  .map(c => `| ${c.metadata.level} | ${c.name} |`)
  .join('\n')}
${file.dataItems.length > 30 ? `\n...and ${file.dataItems.length - 30} more data items` : ''}
` : 'No data items defined.'}

## Related Programs

${related.length > 0 ? related.map(r => `- [${r.name}](programs/${r.name.toLowerCase()}.md)`).join('\n') : 'No related programs found.'}

## Metrics

| Metric | Value |
|--------|-------|
| Code Lines | ${file.metrics.codeLines} |
| Comment Lines | ${file.metrics.commentLines} |
| Blank Lines | ${file.metrics.blankLines} |
| Cyclomatic Complexity | ${file.metrics.complexity} |
`

    return {
      path: `programs/${file.programId.toLowerCase()}.md`,
      title: file.programId,
      content
    }
  }

  private generateDataDictionary(): WikiDocument {
    const allDataItems: { program: string; name: string; level: number; picture?: string }[] = []

    for (const file of this.codebase.files) {
      for (const chunk of file.chunks) {
        if (chunk.type === 'data-item' && chunk.metadata.level) {
          allDataItems.push({
            program: file.programId,
            name: chunk.name,
            level: chunk.metadata.level,
            picture: chunk.metadata.picture
          })
        }
      }
    }

    // Group by first letter
    const grouped = allDataItems.reduce((acc, item) => {
      const letter = item.name[0].toUpperCase()
      if (!acc[letter]) acc[letter] = []
      acc[letter].push(item)
      return acc
    }, {} as Record<string, typeof allDataItems>)

    const content = `${this.frontmatter(
      'Data Dictionary',
      'Comprehensive listing of all data items across programs'
    )}

## Overview

This dictionary contains **${allDataItems.length}** data items from **${this.codebase.files.length}** programs.

## Data Items by Letter

${Object.entries(grouped)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([letter, items]) => `
### ${letter}

| Name | Level | Picture | Program |
|------|-------|---------|---------|
${items.slice(0, 50).map(i => `| ${i.name} | ${i.level} | ${i.picture || '-'} | ${i.program} |`).join('\n')}
${items.length > 50 ? `\n*...and ${items.length - 50} more*` : ''}
`).join('\n')}
`

    return { path: 'data-dictionary.md', title: 'Data Dictionary', content }
  }

  private generateIndex(docs: WikiDocument[]): WikiDocument {
    const content = `${this.frontmatter(
      `${this.projectName} Wiki`,
      'Index of all architectural documentation'
    )}

## Documentation Index

### Overview
- [Overview](overview.md) - Codebase summary and statistics
- [Architecture](architecture.md) - System structure and organization
- [Call Graph](call-graph.md) - Inter-program dependencies
- [Data Dictionary](data-dictionary.md) - All data items

### Programs

${this.codebase.files
  .sort((a, b) => a.programId.localeCompare(b.programId))
  .map(f => `- [${f.programId}](programs/${f.programId.toLowerCase()}.md) - ${f.metrics.totalLines} lines, complexity ${f.metrics.complexity}`)
  .join('\n')}

---

*Generated on ${new Date().toISOString()}*
`

    return { path: 'index.md', title: 'Wiki Index', content }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2)

  if (args.length < 1) {
    console.log(`
COBOL Wiki Generator

Usage: npx ts-node scripts/cobol-analyzer.ts <source-path> [output-path] [project-name]

Arguments:
  source-path   Path to COBOL source directory
  output-path   Output directory for wiki (default: ./docs/wiki)
  project-name  Project name for documentation (default: COBOL System)

Example:
  npx ts-node scripts/cobol-analyzer.ts ./cobol-src ./docs/wiki "My COBOL System"
`)
    process.exit(1)
  }

  const sourcePath = args[0]
  const outputPath = args[1] || './docs/wiki'
  const projectName = args[2] || 'COBOL System'

  console.log(`\n🔍 Analyzing COBOL codebase: ${sourcePath}\n`)

  // Stage 1: Chunk
  console.log('📦 Stage 1: Chunking COBOL files...')
  const chunker = new CobolChunker()
  const codebase = chunker.analyzeCodebase(sourcePath)
  console.log(`   Found ${codebase.files.length} COBOL files`)

  // Stage 2: Index
  console.log('🔎 Stage 2: Building semantic index...')
  const index = new CobolSemanticIndex()
  index.buildIndex(codebase)
  const stats = index.getStats()
  console.log(`   Indexed ${stats.totalEntries} entries`)

  // Stage 3: Generate Wiki
  console.log('📝 Stage 3: Generating wiki documents...')
  const generator = new CobolWikiGenerator(codebase, index, outputPath, projectName)
  const docs = generator.generate()
  generator.writeAll(docs)

  // Output summary
  console.log(`
✅ Wiki generation complete!

Summary:
  - Programs analyzed: ${codebase.files.length}
  - Documents generated: ${docs.length}
  - Output directory: ${outputPath}

Next steps:
  1. Review generated docs in ${outputPath}
  2. Run a static site generator (see Stage 4 in playbook)
`)

  // Save analysis JSON for debugging/further processing
  const analysisPath = join(outputPath, '_analysis.json')
  writeFileSync(analysisPath, JSON.stringify({
    timestamp: codebase.timestamp,
    stats: {
      files: codebase.files.length,
      indexEntries: stats.totalEntries,
      callGraph: Object.fromEntries(codebase.callGraph),
      copybooks: Object.fromEntries(codebase.copybooks)
    },
    programs: codebase.files.map(f => ({
      id: f.programId,
      path: f.relativePath,
      metrics: f.metrics,
      divisions: f.divisions,
      sections: f.sections,
      paragraphs: f.paragraphs.length,
      dataItems: f.dataItems.length,
      calls: f.calls,
      copybooks: f.copybooks
    }))
  }, null, 2))
  console.log(`📊 Analysis data saved to ${analysisPath}`)
}

main().catch(console.error)
```

---

## Stage 1: Chunk the COBOL Codebase

Run the chunker on your COBOL repository:

```bash
# Navigate to your project
cd /path/to/your/project

# Create the script directory
mkdir -p scripts

# Copy the cobol-analyzer.ts content above into scripts/cobol-analyzer.ts

# Run the analyzer
npx ts-node scripts/cobol-analyzer.ts ./cobol-source ./docs/wiki "My COBOL System"
```

### What the chunker extracts:

| Element | Description |
|---------|-------------|
| Programs | Each `.cob`/`.cbl` file |
| Divisions | IDENTIFICATION, ENVIRONMENT, DATA, PROCEDURE |
| Sections | Named sections within divisions |
| Paragraphs | Executable code blocks in PROCEDURE DIVISION |
| Data Items | Variables with level numbers (01, 05, 10, etc.) |
| Copybooks | COPY statement references |
| Calls | CALL statements to other programs |
| Performs | PERFORM statements |

---

## Stage 2: Build Semantic Index

The indexer automatically runs as part of Stage 1. It creates:

- **Keyword index** for each program and chunk
- **Similarity scores** for finding related code
- **Importance rankings** based on call patterns

### Manual search (optional):

```typescript
// In a Node REPL or script
const { CobolSemanticIndex } = require('./scripts/cobol-analyzer')

const index = new CobolSemanticIndex()
index.buildIndex(codebase)

// Search for customer-related code
const results = index.search('customer account balance')
console.log(results)

// Find related programs
const related = index.findRelated('CUSTOMER-PROCESS')
console.log(related)
```

---

## Stage 3: Generate Wiki

The wiki generator creates markdown files with:

1. **overview.md** - Codebase summary and statistics
2. **architecture.md** - Program structure and metrics
3. **call-graph.md** - Program dependencies visualization
4. **data-dictionary.md** - All data items across programs
5. **programs/*.md** - Individual program documentation
6. **index.md** - Navigation index

### Output Structure:

```
docs/wiki/
├── index.md
├── overview.md
├── architecture.md
├── call-graph.md
├── data-dictionary.md
├── _analysis.json
└── programs/
    ├── program1.md
    ├── program2.md
    └── ...
```

---

## Stage 4: Generate Static Site

Convert the wiki markdown to a browsable website.

### Option A: Using Docusaurus

```bash
# Create a new Docusaurus site
npx create-docusaurus@latest wiki-site classic

# Copy generated docs
cp -r docs/wiki/* wiki-site/docs/

# Configure sidebar (wiki-site/sidebars.js)
cat > wiki-site/sidebars.js << 'EOF'
module.exports = {
  wikiSidebar: [
    'index',
    'overview',
    'architecture',
    'call-graph',
    'data-dictionary',
    {
      type: 'category',
      label: 'Programs',
      items: [{ type: 'autogenerated', dirName: 'programs' }],
    },
  ],
};
EOF

# Start dev server
cd wiki-site
npm start
```

### Option B: Using VitePress

```bash
# Create VitePress site
mkdir wiki-site && cd wiki-site
npm init -y
npm install -D vitepress

# Copy docs
mkdir docs
cp -r ../docs/wiki/* docs/

# Create config
mkdir -p .vitepress
cat > .vitepress/config.js << 'EOF'
export default {
  title: 'COBOL Wiki',
  description: 'Architectural Documentation',
  themeConfig: {
    sidebar: [
      { text: 'Overview', link: '/overview' },
      { text: 'Architecture', link: '/architecture' },
      { text: 'Call Graph', link: '/call-graph' },
      { text: 'Data Dictionary', link: '/data-dictionary' },
      {
        text: 'Programs',
        collapsed: false,
        items: [] // Auto-populated
      }
    ]
  }
}
EOF

# Start dev server
npx vitepress dev docs
```

### Option C: Using MkDocs (Python)

```bash
# Install MkDocs
pip install mkdocs mkdocs-material

# Create MkDocs config
cat > mkdocs.yml << 'EOF'
site_name: COBOL System Wiki
theme:
  name: material
  features:
    - navigation.instant
    - navigation.sections
    - search.suggest
docs_dir: docs/wiki
nav:
  - Home: index.md
  - Overview: overview.md
  - Architecture: architecture.md
  - Call Graph: call-graph.md
  - Data Dictionary: data-dictionary.md
  - Programs: programs/
EOF

# Serve locally
mkdocs serve

# Build static site
mkdocs build
```

---

## Quick Start Command

One-liner to run everything:

```bash
# Full pipeline
npx ts-node scripts/cobol-analyzer.ts ./cobol-src ./docs/wiki "My System" && \
  npx create-docusaurus@latest wiki-site classic --skip-install && \
  cp -r docs/wiki/* wiki-site/docs/ && \
  cd wiki-site && npm install && npm start
```

---

## Troubleshooting

### No COBOL files found
- Check file extensions: `.cob`, `.cbl`, `.cpy`, `.cobol`
- Ensure files aren't in ignored directories

### Parser errors
- COBOL has many dialects (IBM, Micro Focus, GnuCOBOL)
- The chunker handles standard COBOL-85 structure
- For dialect-specific features, modify the regex patterns

### Large codebases
- The analyzer processes files sequentially
- For 1000+ files, consider adding progress indicators
- Analysis JSON is saved for caching

---

## Example Output

After running on a sample COBOL codebase:

```
🔍 Analyzing COBOL codebase: ./cobol-src

📦 Stage 1: Chunking COBOL files...
   Found 47 COBOL files

🔎 Stage 2: Building semantic index...
   Indexed 1,234 entries

📝 Stage 3: Generating wiki documents...
Generated 52 wiki documents in ./docs/wiki

✅ Wiki generation complete!

Summary:
  - Programs analyzed: 47
  - Documents generated: 52
  - Output directory: ./docs/wiki
```

---

## Extending the Analyzer

### Add business domain mapping

```typescript
// In cobol-analyzer.ts, add domain inference
function inferBusinessDomain(file: CobolFile): string {
  const name = file.programId.toLowerCase()

  if (/cust|client|account/.test(name)) return 'Customer Management'
  if (/order|invoice|billing/.test(name)) return 'Order Processing'
  if (/report|rpt|print/.test(name)) return 'Reporting'
  if (/batch|job|proc/.test(name)) return 'Batch Processing'
  if (/maint|update|edit/.test(name)) return 'Data Maintenance'

  return 'General'
}
```

### Add JCL analysis

```typescript
// Parse JCL to understand job flows
function analyzeJCL(jclPath: string): JobDefinition {
  // Parse //EXEC PGM= statements
  // Map to COBOL programs
  // Build job dependency graph
}
```
