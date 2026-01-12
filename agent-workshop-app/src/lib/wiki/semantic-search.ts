/**
 * Semantic Search Module
 *
 * Provides embedding-based semantic search capabilities for finding
 * relationships between code elements based on their meaning, not just
 * text patterns. This enables more intelligent documentation linking
 * and understanding of code relationships.
 *
 * The module supports both local embedding generation (using simple
 * TF-IDF-like approaches) and external embedding APIs for more
 * sophisticated semantic understanding.
 */

import { ASTChunk, FileAnalysis } from './ast-chunker'
import { CodebaseAnalysis, ModuleInfo } from './code-analyzer'
import { DomainModel } from './domain-mapper'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface EmbeddingVector {
  id: string
  vector: number[]
  magnitude: number
}

export interface SemanticIndex {
  chunks: IndexedChunk[]
  vocabulary: Map<string, number>
  idf: Map<string, number>
  documentCount: number
  timestamp: string
}

export interface IndexedChunk {
  id: string
  type: string
  name: string
  filePath: string
  content: string
  embedding: EmbeddingVector
  metadata: ChunkIndexMetadata
}

export interface ChunkIndexMetadata {
  tokens: string[]
  termFrequency: Map<string, number>
  keywords: string[]
  category: string
  importance: number
}

export interface SemanticSearchResult {
  chunk: IndexedChunk
  score: number
  matchedTerms: string[]
  explanation: string
}

export interface RelationshipResult {
  source: IndexedChunk
  target: IndexedChunk
  relationship: RelationshipType
  strength: number
  explanation: string
}

export type RelationshipType =
  | 'similar-functionality'
  | 'same-domain'
  | 'dependency'
  | 'collaborator'
  | 'alternative'
  | 'extension'

export interface EmbeddingConfig {
  dimensions: number
  useExternalApi: boolean
  apiEndpoint?: string
  apiKey?: string
  maxTokens: number
}

// ─── Semantic Search Class ─────────────────────────────────────────────────

export class SemanticSearch {
  private config: EmbeddingConfig
  private index: SemanticIndex | null = null

  constructor(config?: Partial<EmbeddingConfig>) {
    this.config = {
      dimensions: 128,
      useExternalApi: false,
      maxTokens: 512,
      ...config
    }
  }

  /**
   * Build a semantic index from codebase analysis
   */
  async buildIndex(analysis: CodebaseAnalysis): Promise<SemanticIndex> {
    const allChunks = analysis.files.flatMap(f => f.chunks)

    // Build vocabulary and IDF
    const { vocabulary, idf, documentCount } = this.buildVocabulary(allChunks)

    // Index each chunk
    const indexedChunks: IndexedChunk[] = []

    for (const chunk of allChunks) {
      const indexed = await this.indexChunk(chunk, vocabulary, idf, documentCount)
      indexedChunks.push(indexed)
    }

    this.index = {
      chunks: indexedChunks,
      vocabulary,
      idf,
      documentCount,
      timestamp: new Date().toISOString()
    }

    return this.index
  }

  /**
   * Search for semantically similar chunks
   */
  async search(query: string, limit: number = 10): Promise<SemanticSearchResult[]> {
    if (!this.index) {
      throw new Error('Index not built. Call buildIndex() first.')
    }

    const queryTokens = this.tokenize(query)
    const queryEmbedding = this.computeEmbedding(
      queryTokens,
      this.index.vocabulary,
      this.index.idf,
      this.index.documentCount
    )

    const results: SemanticSearchResult[] = []

    for (const chunk of this.index.chunks) {
      const score = this.cosineSimilarity(queryEmbedding, chunk.embedding)
      const matchedTerms = queryTokens.filter(t => chunk.metadata.tokens.includes(t))

      if (score > 0.1) {
        results.push({
          chunk,
          score,
          matchedTerms,
          explanation: this.generateSearchExplanation(chunk, queryTokens, matchedTerms, score)
        })
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  /**
   * Find semantically related chunks for a given chunk
   */
  async findRelated(chunkId: string, limit: number = 10): Promise<SemanticSearchResult[]> {
    if (!this.index) {
      throw new Error('Index not built. Call buildIndex() first.')
    }

    const sourceChunk = this.index.chunks.find(c => c.id === chunkId)
    if (!sourceChunk) {
      throw new Error(`Chunk not found: ${chunkId}`)
    }

    const results: SemanticSearchResult[] = []

    for (const chunk of this.index.chunks) {
      if (chunk.id === chunkId) continue

      const score = this.cosineSimilarity(sourceChunk.embedding, chunk.embedding)
      const matchedTerms = sourceChunk.metadata.tokens.filter(t => chunk.metadata.tokens.includes(t))

      if (score > 0.2) {
        results.push({
          chunk,
          score,
          matchedTerms,
          explanation: this.generateRelatedExplanation(sourceChunk, chunk, matchedTerms, score)
        })
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  /**
   * Discover relationships between chunks based on semantic similarity
   */
  async discoverRelationships(threshold: number = 0.3): Promise<RelationshipResult[]> {
    if (!this.index) {
      throw new Error('Index not built. Call buildIndex() first.')
    }

    const relationships: RelationshipResult[] = []

    for (let i = 0; i < this.index.chunks.length; i++) {
      for (let j = i + 1; j < this.index.chunks.length; j++) {
        const source = this.index.chunks[i]
        const target = this.index.chunks[j]

        const similarity = this.cosineSimilarity(source.embedding, target.embedding)

        if (similarity >= threshold) {
          const relationship = this.inferRelationshipType(source, target, similarity)
          relationships.push({
            source,
            target,
            relationship: relationship.type,
            strength: similarity,
            explanation: relationship.explanation
          })
        }
      }
    }

    return relationships.sort((a, b) => b.strength - a.strength)
  }

  /**
   * Get keywords for a given chunk
   */
  getKeywords(chunkId: string): string[] {
    if (!this.index) return []

    const chunk = this.index.chunks.find(c => c.id === chunkId)
    return chunk?.metadata.keywords ?? []
  }

  /**
   * Find chunks by category
   */
  findByCategory(category: string): IndexedChunk[] {
    if (!this.index) return []

    return this.index.chunks.filter(c =>
      c.metadata.category.toLowerCase() === category.toLowerCase()
    )
  }

  /**
   * Get chunk importance ranking
   */
  getImportanceRanking(limit: number = 20): IndexedChunk[] {
    if (!this.index) return []

    return [...this.index.chunks]
      .sort((a, b) => b.metadata.importance - a.metadata.importance)
      .slice(0, limit)
  }

  // ─── Private Methods ─────────────────────────────────────────────────────

  private buildVocabulary(chunks: ASTChunk[]): {
    vocabulary: Map<string, number>
    idf: Map<string, number>
    documentCount: number
  } {
    const vocabulary = new Map<string, number>()
    const documentFrequency = new Map<string, number>()
    let vocabIndex = 0

    // First pass: build vocabulary and document frequency
    for (const chunk of chunks) {
      const tokens = this.tokenize(this.getChunkText(chunk))
      const uniqueTokens = new Set(tokens)

      for (const token of uniqueTokens) {
        if (!vocabulary.has(token)) {
          vocabulary.set(token, vocabIndex++)
        }
        documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1)
      }
    }

    // Calculate IDF (Inverse Document Frequency)
    const idf = new Map<string, number>()
    const n = chunks.length

    for (const [term, df] of documentFrequency) {
      idf.set(term, Math.log((n + 1) / (df + 1)) + 1)
    }

    return { vocabulary, idf, documentCount: n }
  }

  private async indexChunk(
    chunk: ASTChunk,
    vocabulary: Map<string, number>,
    idf: Map<string, number>,
    documentCount: number
  ): Promise<IndexedChunk> {
    const content = this.getChunkText(chunk)
    const tokens = this.tokenize(content)
    const termFrequency = this.computeTermFrequency(tokens)
    const keywords = this.extractKeywords(tokens, termFrequency, idf)
    const category = this.inferCategory(chunk)
    const importance = this.computeImportance(chunk, keywords)

    const embedding = this.computeEmbedding(tokens, vocabulary, idf, documentCount)

    return {
      id: chunk.id,
      type: chunk.type,
      name: chunk.name,
      filePath: chunk.filePath,
      content,
      embedding,
      metadata: {
        tokens,
        termFrequency,
        keywords,
        category,
        importance
      }
    }
  }

  private getChunkText(chunk: ASTChunk): string {
    const parts = [
      chunk.name,
      chunk.documentation ?? '',
      chunk.signature ?? '',
      chunk.type
    ]

    // Add parameter names and types
    if (chunk.metadata.parameters) {
      for (const param of chunk.metadata.parameters) {
        parts.push(param.name, param.type)
      }
    }

    // Add return type
    if (chunk.metadata.returnType) {
      parts.push(chunk.metadata.returnType)
    }

    return parts.filter(Boolean).join(' ')
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/([A-Z])/g, ' $1')  // Split camelCase
      .replace(/[^a-z0-9]/g, ' ')   // Remove non-alphanumeric
      .split(/\s+/)
      .filter(t => t.length > 2)    // Remove very short tokens
      .filter(t => !this.isStopWord(t))
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'for', 'that', 'this', 'with', 'from', 'are', 'was',
      'were', 'been', 'have', 'has', 'had', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'not',
      'get', 'set', 'new', 'var', 'let', 'const', 'function', 'class',
      'interface', 'type', 'return', 'void', 'null', 'undefined', 'true',
      'false', 'string', 'number', 'boolean', 'object', 'array', 'any',
      'public', 'private', 'protected', 'static', 'async', 'await',
      'export', 'import', 'default', 'extends', 'implements'
    ])
    return stopWords.has(word)
  }

  private computeTermFrequency(tokens: string[]): Map<string, number> {
    const tf = new Map<string, number>()
    for (const token of tokens) {
      tf.set(token, (tf.get(token) ?? 0) + 1)
    }

    // Normalize by document length
    const maxFreq = Math.max(...tf.values())
    for (const [term, freq] of tf) {
      tf.set(term, freq / maxFreq)
    }

    return tf
  }

  private computeEmbedding(
    tokens: string[],
    vocabulary: Map<string, number>,
    idf: Map<string, number>,
    documentCount: number
  ): EmbeddingVector {
    const tf = this.computeTermFrequency(tokens)
    const vector = new Array(this.config.dimensions).fill(0)

    // Compute TF-IDF weighted vector
    for (const [term, freq] of tf) {
      const termIdf = idf.get(term) ?? 1
      const tfidf = freq * termIdf

      // Hash term to embedding dimension
      const index = this.hashToDimension(term, this.config.dimensions)
      vector[index] += tfidf
    }

    // Normalize vector
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0))

    if (magnitude > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= magnitude
      }
    }

    return {
      id: tokens.join(':').slice(0, 50),
      vector,
      magnitude
    }
  }

  private hashToDimension(term: string, dimensions: number): number {
    let hash = 0
    for (let i = 0; i < term.length; i++) {
      hash = ((hash << 5) - hash) + term.charCodeAt(i)
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash) % dimensions
  }

  private cosineSimilarity(a: EmbeddingVector, b: EmbeddingVector): number {
    let dotProduct = 0
    for (let i = 0; i < a.vector.length; i++) {
      dotProduct += a.vector[i] * b.vector[i]
    }
    return dotProduct // Vectors are already normalized
  }

  private extractKeywords(
    tokens: string[],
    tf: Map<string, number>,
    idf: Map<string, number>
  ): string[] {
    const scored = tokens.map(t => ({
      term: t,
      score: (tf.get(t) ?? 0) * (idf.get(t) ?? 1)
    }))

    const unique = [...new Map(scored.map(s => [s.term, s])).values()]

    return unique
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(s => s.term)
  }

  private inferCategory(chunk: ASTChunk): string {
    const name = chunk.name.toLowerCase()
    const type = chunk.type

    if (type === 'interface' || type === 'type') return 'types'
    if (type === 'enum') return 'enums'
    if (/service|handler|controller|manager/i.test(name)) return 'services'
    if (/repository|store|dao/i.test(name)) return 'data'
    if (/component|view|ui/i.test(name)) return 'ui'
    if (/util|helper|common/i.test(name)) return 'utilities'
    if (/config|settings/i.test(name)) return 'config'
    if (/test|spec/i.test(name)) return 'tests'
    if (type === 'class') return 'classes'
    if (type === 'function') return 'functions'

    return 'general'
  }

  private computeImportance(chunk: ASTChunk, keywords: string[]): number {
    let importance = 0

    // Exported items are more important
    if (chunk.exports) importance += 2

    // Top-level items are more important
    if (!chunk.parent) importance += 1

    // Documented items are more important
    if (chunk.documentation) importance += 1

    // Items with more children are more important
    importance += Math.min(chunk.children.length * 0.5, 2)

    // Complex items are potentially more important
    importance += Math.min(chunk.metadata.complexity * 0.1, 1)

    // Items with meaningful keywords are more important
    importance += Math.min(keywords.length * 0.2, 1)

    return importance
  }

  private inferRelationshipType(
    source: IndexedChunk,
    target: IndexedChunk,
    similarity: number
  ): { type: RelationshipType; explanation: string } {
    // Same type = similar functionality
    if (source.type === target.type) {
      return {
        type: 'similar-functionality',
        explanation: `Both are ${source.type}s with similar implementations`
      }
    }

    // Same category = same domain
    if (source.metadata.category === target.metadata.category) {
      return {
        type: 'same-domain',
        explanation: `Both belong to the ${source.metadata.category} domain`
      }
    }

    // One is interface, other is class = extension
    if (
      (source.type === 'interface' && target.type === 'class') ||
      (source.type === 'class' && target.type === 'interface')
    ) {
      return {
        type: 'extension',
        explanation: 'Interface-implementation relationship'
      }
    }

    // High keyword overlap = collaborator
    const commonKeywords = source.metadata.keywords.filter(k =>
      target.metadata.keywords.includes(k)
    )
    if (commonKeywords.length >= 3) {
      return {
        type: 'collaborator',
        explanation: `Share common concepts: ${commonKeywords.join(', ')}`
      }
    }

    // Default to similar functionality
    return {
      type: 'similar-functionality',
      explanation: `Semantic similarity: ${Math.round(similarity * 100)}%`
    }
  }

  private generateSearchExplanation(
    chunk: IndexedChunk,
    queryTokens: string[],
    matchedTerms: string[],
    score: number
  ): string {
    if (matchedTerms.length === 0) {
      return `Semantic match (${Math.round(score * 100)}% similar)`
    }

    return `Matches: ${matchedTerms.join(', ')} (${Math.round(score * 100)}% similar)`
  }

  private generateRelatedExplanation(
    source: IndexedChunk,
    target: IndexedChunk,
    matchedTerms: string[],
    score: number
  ): string {
    const commonKeywords = source.metadata.keywords.filter(k =>
      target.metadata.keywords.includes(k)
    )

    if (commonKeywords.length > 0) {
      return `Shared concepts: ${commonKeywords.join(', ')}`
    }

    return `Semantic similarity: ${Math.round(score * 100)}%`
  }
}

// ─── Relationship Graph Builder ────────────────────────────────────────────

export class RelationshipGraph {
  private search: SemanticSearch
  private nodes: Map<string, IndexedChunk> = new Map()
  private edges: RelationshipResult[] = []

  constructor(search: SemanticSearch) {
    this.search = search
  }

  /**
   * Build a relationship graph from the semantic index
   */
  async buildGraph(threshold: number = 0.3): Promise<void> {
    const relationships = await this.search.discoverRelationships(threshold)

    for (const rel of relationships) {
      this.nodes.set(rel.source.id, rel.source)
      this.nodes.set(rel.target.id, rel.target)
      this.edges.push(rel)
    }
  }

  /**
   * Get neighbors for a given chunk
   */
  getNeighbors(chunkId: string): { chunk: IndexedChunk; relationship: RelationshipResult }[] {
    const results: { chunk: IndexedChunk; relationship: RelationshipResult }[] = []

    for (const edge of this.edges) {
      if (edge.source.id === chunkId) {
        results.push({ chunk: edge.target, relationship: edge })
      } else if (edge.target.id === chunkId) {
        results.push({ chunk: edge.source, relationship: edge })
      }
    }

    return results
  }

  /**
   * Find paths between two chunks
   */
  findPath(sourceId: string, targetId: string, maxDepth: number = 5): IndexedChunk[][] {
    const paths: IndexedChunk[][] = []
    const visited = new Set<string>()

    const dfs = (currentId: string, path: IndexedChunk[], depth: number) => {
      if (depth > maxDepth) return
      if (currentId === targetId) {
        paths.push([...path])
        return
      }

      visited.add(currentId)
      const neighbors = this.getNeighbors(currentId)

      for (const { chunk } of neighbors) {
        if (!visited.has(chunk.id)) {
          dfs(chunk.id, [...path, chunk], depth + 1)
        }
      }

      visited.delete(currentId)
    }

    const sourceChunk = this.nodes.get(sourceId)
    if (sourceChunk) {
      dfs(sourceId, [sourceChunk], 0)
    }

    return paths
  }

  /**
   * Get clusters of related chunks
   */
  getClusters(): IndexedChunk[][] {
    const visited = new Set<string>()
    const clusters: IndexedChunk[][] = []

    for (const [id, chunk] of this.nodes) {
      if (visited.has(id)) continue

      const cluster: IndexedChunk[] = []
      const queue = [chunk]

      while (queue.length > 0) {
        const current = queue.shift()!
        if (visited.has(current.id)) continue

        visited.add(current.id)
        cluster.push(current)

        const neighbors = this.getNeighbors(current.id)
        for (const { chunk: neighbor } of neighbors) {
          if (!visited.has(neighbor.id)) {
            queue.push(neighbor)
          }
        }
      }

      if (cluster.length > 1) {
        clusters.push(cluster)
      }
    }

    return clusters.sort((a, b) => b.length - a.length)
  }

  /**
   * Export graph in DOT format for visualization
   */
  toDOT(): string {
    const lines = ['digraph CodeRelationships {', '  rankdir=LR;']

    for (const [id, chunk] of this.nodes) {
      const label = `${chunk.name}\\n(${chunk.type})`
      lines.push(`  "${id}" [label="${label}"];`)
    }

    for (const edge of this.edges) {
      const label = edge.relationship
      lines.push(`  "${edge.source.id}" -> "${edge.target.id}" [label="${label}"];`)
    }

    lines.push('}')
    return lines.join('\n')
  }
}
