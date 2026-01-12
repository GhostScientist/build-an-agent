/**
 * Architectural Wiki Module
 *
 * A comprehensive documentation generation system that uses AST analysis,
 * semantic understanding, and business domain mapping to create meaningful
 * architectural documentation.
 *
 * Features:
 * - AST-based code chunking for intelligent parsing
 * - Pattern detection for architectural insights
 * - Business domain inference and mapping
 * - Semantic search for code relationships
 * - Automated wiki generation with proper frontmatter
 *
 * Usage:
 * ```typescript
 * import { WikiGenerator, CodeAnalyzer, DomainMapper } from './wiki'
 *
 * const generator = new WikiGenerator({
 *   outputPath: './docs/wiki',
 *   projectName: 'My Project',
 *   includeTechnicalDetails: true,
 *   includeBusinessContext: true,
 *   includeCodeLinks: true,
 *   generateIndex: true,
 *   maxDepth: 3
 * })
 *
 * const documents = await generator.generateWiki('./src')
 * ```
 */

// AST Chunking
export {
  ASTChunker,
  type ASTChunk,
  type ChunkType,
  type Dependency,
  type ChunkMetadata,
  type ParameterInfo,
  type FileAnalysis,
  type ImportInfo,
  type ExportInfo,
  type FileSummary
} from './ast-chunker'

// Code Analysis
export {
  CodeAnalyzer,
  type CodebaseAnalysis,
  type DependencyGraph,
  type GraphNode,
  type GraphEdge,
  type EdgeType,
  type ArchitecturalPattern,
  type PatternType,
  type PatternLocation,
  type ModuleInfo,
  type ModulePurpose,
  type PublicApiInfo,
  type CodebaseMetrics,
  type Hotspot
} from './code-analyzer'

// Domain Mapping
export {
  DomainMapper,
  type DomainModel,
  type DomainEntity,
  type EntityAttribute,
  type EntityBehavior,
  type EntityRelationship,
  type DomainAggregate,
  type DomainService,
  type ServiceCapability,
  type DomainEvent,
  type BusinessWorkflow,
  type WorkflowStep,
  type BoundedContext,
  type DomainMapping,
  type DomainConcept,
  type DomainConceptType,
  type BusinessContext
} from './domain-mapper'

// Wiki Generation
export {
  WikiGenerator,
  type WikiConfig,
  type WikiDocument,
  type WikiFrontmatter,
  type WikiSection,
  type WikiIndex,
  type WikiCategory,
  type WikiIndexEntry
} from './wiki-generator'

// Semantic Search
export {
  SemanticSearch,
  RelationshipGraph,
  type EmbeddingVector,
  type SemanticIndex,
  type IndexedChunk,
  type ChunkIndexMetadata,
  type SemanticSearchResult,
  type RelationshipResult,
  type RelationshipType,
  type EmbeddingConfig
} from './semantic-search'

// ─── Convenience Functions ─────────────────────────────────────────────────

import { ASTChunker, FileAnalysis } from './ast-chunker'
import { CodeAnalyzer, CodebaseAnalysis } from './code-analyzer'
import { DomainMapper, DomainModel } from './domain-mapper'
import { WikiGenerator, WikiConfig, WikiDocument } from './wiki-generator'
import { SemanticSearch, SemanticIndex } from './semantic-search'

/**
 * Quick analysis of a single file
 */
export async function analyzeFile(filePath: string, basePath?: string): Promise<FileAnalysis> {
  const chunker = new ASTChunker()
  return chunker.analyzeFile(filePath, basePath)
}

/**
 * Full codebase analysis
 */
export async function analyzeCodebase(
  basePath: string,
  patterns?: string[],
  ignorePatterns?: string[]
): Promise<CodebaseAnalysis> {
  const analyzer = new CodeAnalyzer()
  return analyzer.analyzeCodebase(basePath, patterns, ignorePatterns)
}

/**
 * Infer domain model from codebase analysis
 */
export function inferDomainModel(analysis: CodebaseAnalysis): DomainModel {
  const mapper = new DomainMapper()
  return mapper.inferDomainModel(analysis)
}

/**
 * Build semantic index for code search
 */
export async function buildSemanticIndex(analysis: CodebaseAnalysis): Promise<SemanticIndex> {
  const search = new SemanticSearch()
  return search.buildIndex(analysis)
}

/**
 * Generate complete wiki for a codebase
 */
export async function generateWiki(
  basePath: string,
  config: Partial<WikiConfig>
): Promise<WikiDocument[]> {
  const fullConfig: WikiConfig = {
    outputPath: './docs/wiki',
    projectName: 'Project',
    includeTechnicalDetails: true,
    includeBusinessContext: true,
    includeCodeLinks: true,
    generateIndex: true,
    maxDepth: 3,
    ...config
  }

  const generator = new WikiGenerator(fullConfig)
  return generator.generateWiki(basePath)
}

/**
 * Generate wiki with full analysis and semantic indexing
 */
export async function generateComprehensiveWiki(
  basePath: string,
  config: Partial<WikiConfig>
): Promise<{
  documents: WikiDocument[]
  analysis: CodebaseAnalysis
  domainModel: DomainModel
  semanticIndex: SemanticIndex
}> {
  // Analyze codebase
  const analysis = await analyzeCodebase(basePath)

  // Infer domain model
  const domainModel = inferDomainModel(analysis)

  // Build semantic index
  const semanticIndex = await buildSemanticIndex(analysis)

  // Generate wiki
  const documents = await generateWiki(basePath, config)

  return { documents, analysis, domainModel, semanticIndex }
}
