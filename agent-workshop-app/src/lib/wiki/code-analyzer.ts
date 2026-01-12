/**
 * Code Analyzer Module
 *
 * Analyzes AST chunks to build a semantic understanding of the codebase.
 * Extracts patterns, relationships, and architectural insights that can
 * be used for documentation generation.
 */

import { ASTChunker, ASTChunk, FileAnalysis, ChunkType, Dependency } from './ast-chunker'
import { basename, dirname, relative, extname } from 'path'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface CodebaseAnalysis {
  files: FileAnalysis[]
  graph: DependencyGraph
  patterns: ArchitecturalPattern[]
  modules: ModuleInfo[]
  metrics: CodebaseMetrics
  timestamp: string
}

export interface DependencyGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface GraphNode {
  id: string
  type: ChunkType | 'file' | 'directory' | 'module'
  name: string
  path: string
  metadata: Record<string, unknown>
}

export interface GraphEdge {
  from: string
  to: string
  type: EdgeType
  weight: number
}

export type EdgeType =
  | 'imports'
  | 'exports'
  | 'extends'
  | 'implements'
  | 'uses'
  | 'contains'
  | 'references'

export interface ArchitecturalPattern {
  type: PatternType
  name: string
  description: string
  confidence: number
  locations: PatternLocation[]
  evidence: string[]
}

export type PatternType =
  | 'mvc'
  | 'mvvm'
  | 'repository'
  | 'factory'
  | 'singleton'
  | 'observer'
  | 'strategy'
  | 'decorator'
  | 'adapter'
  | 'service-layer'
  | 'data-transfer-object'
  | 'dependency-injection'
  | 'event-driven'
  | 'layered-architecture'
  | 'domain-model'
  | 'api-gateway'
  | 'middleware'
  | 'hook-pattern'
  | 'provider-pattern'
  | 'composition'

export interface PatternLocation {
  file: string
  chunks: string[]
  role: string
}

export interface ModuleInfo {
  name: string
  path: string
  description: string
  purpose: ModulePurpose
  exports: string[]
  dependencies: string[]
  internalDependencies: string[]
  externalDependencies: string[]
  publicApi: PublicApiInfo[]
  complexity: number
  cohesion: number
}

export type ModulePurpose =
  | 'ui-component'
  | 'business-logic'
  | 'data-access'
  | 'utility'
  | 'configuration'
  | 'api-client'
  | 'state-management'
  | 'routing'
  | 'middleware'
  | 'testing'
  | 'types'
  | 'infrastructure'
  | 'unknown'

export interface PublicApiInfo {
  name: string
  type: ChunkType
  signature: string
  documentation?: string
}

export interface CodebaseMetrics {
  totalFiles: number
  totalLines: number
  totalCodeLines: number
  totalChunks: number
  averageComplexity: number
  maxComplexity: number
  chunkDistribution: Record<ChunkType, number>
  dependencyCount: number
  circularDependencies: string[][]
  hotspots: Hotspot[]
}

export interface Hotspot {
  file: string
  type: 'high-complexity' | 'high-coupling' | 'god-class' | 'hub'
  score: number
  details: string
}

// ─── Code Analyzer Class ───────────────────────────────────────────────────

export class CodeAnalyzer {
  private chunker: ASTChunker

  constructor() {
    this.chunker = new ASTChunker()
  }

  /**
   * Perform a full analysis of a codebase
   */
  async analyzeCodebase(
    basePath: string,
    patterns?: string[],
    ignorePatterns?: string[]
  ): Promise<CodebaseAnalysis> {
    const files = await this.chunker.analyzeCodebase(basePath, patterns, ignorePatterns)

    const graph = this.buildDependencyGraph(files)
    const architecturalPatterns = this.detectPatterns(files, graph)
    const modules = this.analyzeModules(files, basePath)
    const metrics = this.computeMetrics(files, graph)

    return {
      files,
      graph,
      patterns: architecturalPatterns,
      modules,
      metrics,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Build a dependency graph from file analyses
   */
  buildDependencyGraph(files: FileAnalysis[]): DependencyGraph {
    const nodes: GraphNode[] = []
    const edges: GraphEdge[] = []
    const seenNodes = new Set<string>()
    const seenEdges = new Set<string>()

    // Add file nodes
    for (const file of files) {
      const fileId = `file:${file.relativePath}`
      if (!seenNodes.has(fileId)) {
        nodes.push({
          id: fileId,
          type: 'file',
          name: basename(file.filePath),
          path: file.relativePath,
          metadata: {
            lines: file.summary.totalLines,
            complexity: file.summary.complexity,
            exports: file.summary.mainExports
          }
        })
        seenNodes.add(fileId)
      }

      // Add chunk nodes
      for (const chunk of file.chunks) {
        if (!seenNodes.has(chunk.id)) {
          nodes.push({
            id: chunk.id,
            type: chunk.type,
            name: chunk.name,
            path: file.relativePath,
            metadata: {
              signature: chunk.signature,
              complexity: chunk.metadata.complexity,
              exported: chunk.exports
            }
          })
          seenNodes.add(chunk.id)
        }

        // Add contains edge from file to chunk
        const containsEdgeId = `${fileId}->contains->${chunk.id}`
        if (!seenEdges.has(containsEdgeId)) {
          edges.push({
            from: fileId,
            to: chunk.id,
            type: 'contains',
            weight: 1
          })
          seenEdges.add(containsEdgeId)
        }

        // Add parent-child edges
        if (chunk.parent) {
          const parentEdgeId = `${chunk.parent}->contains->${chunk.id}`
          if (!seenEdges.has(parentEdgeId)) {
            edges.push({
              from: chunk.parent,
              to: chunk.id,
              type: 'contains',
              weight: 1
            })
            seenEdges.add(parentEdgeId)
          }
        }

        // Add dependency edges
        for (const dep of chunk.dependencies) {
          const targetChunk = this.findChunkByName(files, dep.name)
          if (targetChunk) {
            const edgeType = this.mapDependencyType(dep.type)
            const depEdgeId = `${chunk.id}->${edgeType}->${targetChunk.id}`
            if (!seenEdges.has(depEdgeId)) {
              edges.push({
                from: chunk.id,
                to: targetChunk.id,
                type: edgeType,
                weight: 1
              })
              seenEdges.add(depEdgeId)
            }
          }
        }
      }

      // Add import edges between files
      for (const imp of file.imports) {
        if (imp.source.startsWith('.')) {
          // Internal import
          const targetFile = this.resolveImportPath(file.relativePath, imp.source)
          const targetFileNode = files.find(f =>
            f.relativePath === targetFile ||
            f.relativePath === targetFile + '.ts' ||
            f.relativePath === targetFile + '.tsx' ||
            f.relativePath === targetFile + '/index.ts'
          )

          if (targetFileNode) {
            const targetFileId = `file:${targetFileNode.relativePath}`
            const importEdgeId = `${fileId}->imports->${targetFileId}`
            if (!seenEdges.has(importEdgeId)) {
              edges.push({
                from: fileId,
                to: targetFileId,
                type: 'imports',
                weight: imp.specifiers.length
              })
              seenEdges.add(importEdgeId)
            }
          }
        }
      }
    }

    return { nodes, edges }
  }

  /**
   * Detect architectural patterns in the codebase
   */
  detectPatterns(files: FileAnalysis[], graph: DependencyGraph): ArchitecturalPattern[] {
    const patterns: ArchitecturalPattern[] = []

    // Detect Repository Pattern
    const repositoryPattern = this.detectRepositoryPattern(files)
    if (repositoryPattern) patterns.push(repositoryPattern)

    // Detect Service Layer Pattern
    const serviceLayerPattern = this.detectServiceLayerPattern(files)
    if (serviceLayerPattern) patterns.push(serviceLayerPattern)

    // Detect Factory Pattern
    const factoryPattern = this.detectFactoryPattern(files)
    if (factoryPattern) patterns.push(factoryPattern)

    // Detect Singleton Pattern
    const singletonPattern = this.detectSingletonPattern(files)
    if (singletonPattern) patterns.push(singletonPattern)

    // Detect Observer Pattern
    const observerPattern = this.detectObserverPattern(files)
    if (observerPattern) patterns.push(observerPattern)

    // Detect Provider Pattern (React)
    const providerPattern = this.detectProviderPattern(files)
    if (providerPattern) patterns.push(providerPattern)

    // Detect Hook Pattern (React)
    const hookPattern = this.detectHookPattern(files)
    if (hookPattern) patterns.push(hookPattern)

    // Detect Middleware Pattern
    const middlewarePattern = this.detectMiddlewarePattern(files)
    if (middlewarePattern) patterns.push(middlewarePattern)

    // Detect DTO Pattern
    const dtoPattern = this.detectDTOPattern(files)
    if (dtoPattern) patterns.push(dtoPattern)

    // Detect Dependency Injection
    const diPattern = this.detectDependencyInjectionPattern(files)
    if (diPattern) patterns.push(diPattern)

    // Detect Layered Architecture
    const layeredPattern = this.detectLayeredArchitecture(files, graph)
    if (layeredPattern) patterns.push(layeredPattern)

    return patterns.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Analyze modules and their purposes
   */
  analyzeModules(files: FileAnalysis[], basePath: string): ModuleInfo[] {
    const directories = new Map<string, FileAnalysis[]>()

    // Group files by directory
    for (const file of files) {
      const dir = dirname(file.relativePath)
      if (!directories.has(dir)) {
        directories.set(dir, [])
      }
      directories.get(dir)!.push(file)
    }

    const modules: ModuleInfo[] = []

    for (const [dir, dirFiles] of directories) {
      const allChunks = dirFiles.flatMap(f => f.chunks)
      const allImports = dirFiles.flatMap(f => f.imports)
      const allExports = dirFiles.flatMap(f => f.exports)

      const internalDeps = new Set<string>()
      const externalDeps = new Set<string>()

      for (const imp of allImports) {
        if (imp.source.startsWith('.')) {
          internalDeps.add(imp.source)
        } else {
          externalDeps.add(imp.source)
        }
      }

      const publicApi: PublicApiInfo[] = allChunks
        .filter(c => c.exports && !c.parent)
        .map(c => ({
          name: c.name,
          type: c.type,
          signature: c.signature ?? c.name,
          documentation: c.documentation
        }))

      const purpose = this.inferModulePurpose(dir, dirFiles, allChunks)
      const description = this.generateModuleDescription(dir, purpose, publicApi)

      const totalComplexity = allChunks.reduce((sum, c) => sum + c.metadata.complexity, 0)
      const cohesion = this.calculateCohesion(allChunks, allImports)

      modules.push({
        name: basename(dir) || 'root',
        path: dir,
        description,
        purpose,
        exports: publicApi.map(a => a.name),
        dependencies: allImports.map(i => i.source),
        internalDependencies: Array.from(internalDeps),
        externalDependencies: Array.from(externalDeps),
        publicApi,
        complexity: totalComplexity,
        cohesion
      })
    }

    return modules
  }

  /**
   * Compute overall codebase metrics
   */
  computeMetrics(files: FileAnalysis[], graph: DependencyGraph): CodebaseMetrics {
    const allChunks = files.flatMap(f => f.chunks)

    const totalLines = files.reduce((sum, f) => sum + f.summary.totalLines, 0)
    const totalCodeLines = files.reduce((sum, f) => sum + f.summary.codeLines, 0)
    const totalComplexity = allChunks.reduce((sum, c) => sum + c.metadata.complexity, 0)
    const maxComplexity = Math.max(...allChunks.map(c => c.metadata.complexity), 0)

    const chunkDistribution: Record<ChunkType, number> = {
      class: 0,
      interface: 0,
      type: 0,
      enum: 0,
      function: 0,
      method: 0,
      property: 0,
      variable: 0,
      import: 0,
      export: 0,
      namespace: 0,
      module: 0
    }

    for (const chunk of allChunks) {
      chunkDistribution[chunk.type]++
    }

    // Detect circular dependencies
    const circularDependencies = this.detectCircularDependencies(graph)

    // Identify hotspots
    const hotspots = this.identifyHotspots(files, graph)

    return {
      totalFiles: files.length,
      totalLines,
      totalCodeLines,
      totalChunks: allChunks.length,
      averageComplexity: allChunks.length > 0 ? totalComplexity / allChunks.length : 0,
      maxComplexity,
      chunkDistribution,
      dependencyCount: graph.edges.length,
      circularDependencies,
      hotspots
    }
  }

  // ─── Pattern Detection Methods ───────────────────────────────────────────

  private detectRepositoryPattern(files: FileAnalysis[]): ArchitecturalPattern | null {
    const locations: PatternLocation[] = []
    const evidence: string[] = []

    for (const file of files) {
      const hasRepositoryName = /repository|repo/i.test(file.filePath)
      const hasDataMethods = file.chunks.some(c =>
        /^(get|find|save|update|delete|create|fetch|load)/i.test(c.name)
      )
      const hasInterface = file.chunks.some(c =>
        c.type === 'interface' && /repository|repo/i.test(c.name)
      )

      if (hasRepositoryName && hasDataMethods) {
        locations.push({
          file: file.relativePath,
          chunks: file.chunks.filter(c => c.exports).map(c => c.id),
          role: 'repository'
        })
        evidence.push(`${file.relativePath} contains repository methods`)
      }

      if (hasInterface) {
        evidence.push(`${file.relativePath} defines repository interface`)
      }
    }

    if (locations.length === 0) return null

    return {
      type: 'repository',
      name: 'Repository Pattern',
      description: 'Abstracts data access logic behind a collection-like interface, separating domain logic from data persistence.',
      confidence: Math.min(0.9, 0.3 + locations.length * 0.2),
      locations,
      evidence
    }
  }

  private detectServiceLayerPattern(files: FileAnalysis[]): ArchitecturalPattern | null {
    const locations: PatternLocation[] = []
    const evidence: string[] = []

    for (const file of files) {
      const isServiceFile = /service|svc/i.test(file.filePath) && !/mock|test|spec/i.test(file.filePath)
      const hasServiceClass = file.chunks.some(c =>
        c.type === 'class' && /service|svc/i.test(c.name)
      )
      const hasBusinessMethods = file.chunks.some(c =>
        c.type === 'method' && /^(process|handle|execute|validate|calculate|perform)/i.test(c.name)
      )

      if (isServiceFile && (hasServiceClass || hasBusinessMethods)) {
        locations.push({
          file: file.relativePath,
          chunks: file.chunks.filter(c => c.type === 'class' || (c.type === 'function' && c.exports)).map(c => c.id),
          role: 'service'
        })
        evidence.push(`${file.relativePath} implements service layer`)
      }
    }

    if (locations.length === 0) return null

    return {
      type: 'service-layer',
      name: 'Service Layer Pattern',
      description: 'Encapsulates business logic in dedicated service classes, providing a clear API between the application and domain layers.',
      confidence: Math.min(0.9, 0.3 + locations.length * 0.15),
      locations,
      evidence
    }
  }

  private detectFactoryPattern(files: FileAnalysis[]): ArchitecturalPattern | null {
    const locations: PatternLocation[] = []
    const evidence: string[] = []

    for (const file of files) {
      const hasFactoryName = /factory|creator|builder/i.test(file.filePath)
      const hasFactoryMethod = file.chunks.some(c =>
        /^(create|make|build|new|construct|generate)/i.test(c.name) &&
        (c.type === 'function' || c.type === 'method')
      )

      if (hasFactoryName || hasFactoryMethod) {
        const factoryChunks = file.chunks.filter(c =>
          /^(create|make|build|new|construct|generate)/i.test(c.name) ||
          /factory|creator|builder/i.test(c.name)
        )

        if (factoryChunks.length > 0) {
          locations.push({
            file: file.relativePath,
            chunks: factoryChunks.map(c => c.id),
            role: 'factory'
          })
          evidence.push(`${file.relativePath} contains factory methods: ${factoryChunks.map(c => c.name).join(', ')}`)
        }
      }
    }

    if (locations.length === 0) return null

    return {
      type: 'factory',
      name: 'Factory Pattern',
      description: 'Creates objects without exposing instantiation logic, allowing for flexible object creation based on configuration or context.',
      confidence: Math.min(0.9, 0.3 + locations.length * 0.2),
      locations,
      evidence
    }
  }

  private detectSingletonPattern(files: FileAnalysis[]): ArchitecturalPattern | null {
    const locations: PatternLocation[] = []
    const evidence: string[] = []

    for (const file of files) {
      for (const chunk of file.chunks) {
        if (chunk.type === 'class') {
          const code = chunk.code.toLowerCase()
          const hasPrivateConstructor = code.includes('private constructor')
          const hasStaticInstance = /static\s+(?:readonly\s+)?(?:_?instance|shared|default)/i.test(chunk.code)
          const hasGetInstance = chunk.children.some(childId => {
            const child = file.chunks.find(c => c.id === childId)
            return child && /get\s*instance|shared|default/i.test(child.name)
          })

          if (hasPrivateConstructor || (hasStaticInstance && hasGetInstance)) {
            locations.push({
              file: file.relativePath,
              chunks: [chunk.id],
              role: 'singleton'
            })
            evidence.push(`${chunk.name} implements singleton pattern`)
          }
        }
      }
    }

    if (locations.length === 0) return null

    return {
      type: 'singleton',
      name: 'Singleton Pattern',
      description: 'Ensures a class has only one instance and provides global access to it.',
      confidence: Math.min(0.9, 0.4 + locations.length * 0.25),
      locations,
      evidence
    }
  }

  private detectObserverPattern(files: FileAnalysis[]): ArchitecturalPattern | null {
    const locations: PatternLocation[] = []
    const evidence: string[] = []

    const observerIndicators = [
      'subscribe', 'unsubscribe', 'notify', 'emit', 'on', 'off',
      'addListener', 'removeListener', 'addEventListener', 'observer',
      'publish', 'dispatch'
    ]

    for (const file of files) {
      const hasObserverMethods = file.chunks.some(c =>
        observerIndicators.some(ind => c.name.toLowerCase().includes(ind.toLowerCase()))
      )

      if (hasObserverMethods) {
        const observerChunks = file.chunks.filter(c =>
          observerIndicators.some(ind => c.name.toLowerCase().includes(ind.toLowerCase()))
        )

        locations.push({
          file: file.relativePath,
          chunks: observerChunks.map(c => c.id),
          role: 'observer'
        })
        evidence.push(`${file.relativePath} implements observer/event pattern`)
      }
    }

    if (locations.length === 0) return null

    return {
      type: 'observer',
      name: 'Observer Pattern',
      description: 'Defines a subscription mechanism allowing objects to be notified of state changes in other objects.',
      confidence: Math.min(0.9, 0.3 + locations.length * 0.15),
      locations,
      evidence
    }
  }

  private detectProviderPattern(files: FileAnalysis[]): ArchitecturalPattern | null {
    const locations: PatternLocation[] = []
    const evidence: string[] = []

    for (const file of files) {
      const hasProvider = file.chunks.some(c =>
        /provider|context/i.test(c.name) &&
        (c.type === 'function' || c.type === 'variable')
      )

      const hasCreateContext = file.imports.some(i =>
        i.specifiers.some(s => s.name === 'createContext')
      )

      if (hasProvider || hasCreateContext) {
        const providerChunks = file.chunks.filter(c =>
          /provider|context/i.test(c.name)
        )

        if (providerChunks.length > 0 || hasCreateContext) {
          locations.push({
            file: file.relativePath,
            chunks: providerChunks.map(c => c.id),
            role: 'provider'
          })
          evidence.push(`${file.relativePath} implements React Context/Provider pattern`)
        }
      }
    }

    if (locations.length === 0) return null

    return {
      type: 'provider-pattern',
      name: 'Provider Pattern (React Context)',
      description: 'Uses React Context to provide data and functionality to component subtrees without prop drilling.',
      confidence: Math.min(0.9, 0.4 + locations.length * 0.2),
      locations,
      evidence
    }
  }

  private detectHookPattern(files: FileAnalysis[]): ArchitecturalPattern | null {
    const locations: PatternLocation[] = []
    const evidence: string[] = []

    for (const file of files) {
      const hooks = file.chunks.filter(c =>
        c.type === 'function' &&
        /^use[A-Z]/.test(c.name) &&
        c.exports
      )

      if (hooks.length > 0) {
        locations.push({
          file: file.relativePath,
          chunks: hooks.map(c => c.id),
          role: 'custom-hook'
        })
        evidence.push(`${file.relativePath} exports hooks: ${hooks.map(h => h.name).join(', ')}`)
      }
    }

    if (locations.length === 0) return null

    return {
      type: 'hook-pattern',
      name: 'React Hooks Pattern',
      description: 'Encapsulates reusable stateful logic in custom hooks that can be shared across components.',
      confidence: Math.min(0.95, 0.5 + locations.length * 0.1),
      locations,
      evidence
    }
  }

  private detectMiddlewarePattern(files: FileAnalysis[]): ArchitecturalPattern | null {
    const locations: PatternLocation[] = []
    const evidence: string[] = []

    for (const file of files) {
      const isMiddleware = /middleware/i.test(file.filePath)
      const hasMiddlewareSignature = file.chunks.some(c => {
        const params = c.metadata.parameters ?? []
        return params.length >= 2 &&
          (params.some(p => p.name === 'req' || p.name === 'request') ||
            params.some(p => p.name === 'next'))
      })

      if (isMiddleware || hasMiddlewareSignature) {
        locations.push({
          file: file.relativePath,
          chunks: file.chunks.filter(c => c.exports).map(c => c.id),
          role: 'middleware'
        })
        evidence.push(`${file.relativePath} implements middleware pattern`)
      }
    }

    if (locations.length === 0) return null

    return {
      type: 'middleware',
      name: 'Middleware Pattern',
      description: 'Chains request/response handlers to process data through a pipeline of transformations.',
      confidence: Math.min(0.9, 0.3 + locations.length * 0.2),
      locations,
      evidence
    }
  }

  private detectDTOPattern(files: FileAnalysis[]): ArchitecturalPattern | null {
    const locations: PatternLocation[] = []
    const evidence: string[] = []

    for (const file of files) {
      const isTypeFile = /types?|dto|model|schema/i.test(file.filePath)
      const hasDataTypes = file.chunks.filter(c =>
        (c.type === 'interface' || c.type === 'type') &&
        !/props|state|context|config/i.test(c.name)
      )

      if (isTypeFile && hasDataTypes.length > 0) {
        locations.push({
          file: file.relativePath,
          chunks: hasDataTypes.map(c => c.id),
          role: 'dto'
        })
        evidence.push(`${file.relativePath} defines data transfer types: ${hasDataTypes.map(t => t.name).join(', ')}`)
      }
    }

    if (locations.length === 0) return null

    return {
      type: 'data-transfer-object',
      name: 'Data Transfer Object Pattern',
      description: 'Defines typed structures for data transfer between layers or systems, ensuring type safety and documentation.',
      confidence: Math.min(0.9, 0.4 + locations.length * 0.1),
      locations,
      evidence
    }
  }

  private detectDependencyInjectionPattern(files: FileAnalysis[]): ArchitecturalPattern | null {
    const locations: PatternLocation[] = []
    const evidence: string[] = []

    for (const file of files) {
      for (const chunk of file.chunks) {
        if (chunk.type === 'class') {
          // Look for constructor injection
          const hasConstructorInjection = chunk.children.some(childId => {
            const child = file.chunks.find(c => c.id === childId)
            if (!child) return false
            const params = child.metadata.parameters ?? []
            return params.length > 0 && params.some(p =>
              /service|repository|client|provider|manager|handler/i.test(p.type)
            )
          })

          const hasDecorators = chunk.metadata.decorators?.some(d =>
            /injectable|inject|autowired/i.test(d)
          )

          if (hasConstructorInjection || hasDecorators) {
            locations.push({
              file: file.relativePath,
              chunks: [chunk.id],
              role: 'injectable'
            })
            evidence.push(`${chunk.name} uses dependency injection`)
          }
        }
      }
    }

    if (locations.length === 0) return null

    return {
      type: 'dependency-injection',
      name: 'Dependency Injection Pattern',
      description: 'Injects dependencies through constructors or decorators, enabling loose coupling and testability.',
      confidence: Math.min(0.9, 0.4 + locations.length * 0.15),
      locations,
      evidence
    }
  }

  private detectLayeredArchitecture(files: FileAnalysis[], graph: DependencyGraph): ArchitecturalPattern | null {
    const layers = new Map<string, string[]>()

    // Identify common layer directories
    const layerPatterns: [string, RegExp][] = [
      ['presentation', /components?|pages?|views?|ui/i],
      ['application', /services?|usecases?|handlers?/i],
      ['domain', /domain|models?|entities/i],
      ['infrastructure', /infrastructure|data|api|repositories?/i],
      ['shared', /shared|common|utils?|lib/i]
    ]

    for (const file of files) {
      for (const [layer, pattern] of layerPatterns) {
        if (pattern.test(file.relativePath)) {
          if (!layers.has(layer)) {
            layers.set(layer, [])
          }
          layers.get(layer)!.push(file.relativePath)
          break
        }
      }
    }

    const detectedLayers = Array.from(layers.entries()).filter(([, files]) => files.length > 0)

    if (detectedLayers.length < 2) return null

    const evidence = detectedLayers.map(([layer, files]) =>
      `${layer} layer: ${files.length} files`
    )

    const locations = detectedLayers.map(([layer, fileList]) => ({
      file: fileList[0],
      chunks: [],
      role: layer
    }))

    return {
      type: 'layered-architecture',
      name: 'Layered Architecture',
      description: 'Organizes code into distinct layers (presentation, business, data) with clear separation of concerns.',
      confidence: Math.min(0.9, 0.3 + detectedLayers.length * 0.15),
      locations,
      evidence
    }
  }

  // ─── Helper Methods ──────────────────────────────────────────────────────

  private findChunkByName(files: FileAnalysis[], name: string): ASTChunk | undefined {
    for (const file of files) {
      const chunk = file.chunks.find(c => c.name === name)
      if (chunk) return chunk
    }
    return undefined
  }

  private mapDependencyType(type: Dependency['type']): EdgeType {
    switch (type) {
      case 'import': return 'imports'
      case 'extends': return 'extends'
      case 'implements': return 'implements'
      case 'uses': return 'uses'
      case 'reference': return 'references'
      default: return 'uses'
    }
  }

  private resolveImportPath(fromFile: string, importPath: string): string {
    const fromDir = dirname(fromFile)
    const segments = fromDir.split('/').filter(Boolean)
    const importSegments = importPath.split('/').filter(Boolean)

    for (const seg of importSegments) {
      if (seg === '..') {
        segments.pop()
      } else if (seg !== '.') {
        segments.push(seg)
      }
    }

    return segments.join('/')
  }

  private inferModulePurpose(dir: string, files: FileAnalysis[], chunks: ASTChunk[]): ModulePurpose {
    const dirLower = dir.toLowerCase()

    if (/components?|ui|views?|pages?/.test(dirLower)) return 'ui-component'
    if (/services?|business|domain/.test(dirLower)) return 'business-logic'
    if (/data|repositories?|api/.test(dirLower)) return 'data-access'
    if (/utils?|helpers?|lib/.test(dirLower)) return 'utility'
    if (/config|settings/.test(dirLower)) return 'configuration'
    if (/client|http|fetch/.test(dirLower)) return 'api-client'
    if (/store|state|redux|zustand/.test(dirLower)) return 'state-management'
    if (/routes?|routing|navigation/.test(dirLower)) return 'routing'
    if (/middleware/.test(dirLower)) return 'middleware'
    if (/test|spec|__tests__/.test(dirLower)) return 'testing'
    if (/types?|interfaces?|models?/.test(dirLower)) return 'types'
    if (/infra|infrastructure/.test(dirLower)) return 'infrastructure'

    // Infer from content
    const hasComponents = chunks.some(c => /component|^use[A-Z]/.test(c.name))
    if (hasComponents) return 'ui-component'

    const hasDataMethods = chunks.some(c => /get|find|save|fetch/.test(c.name))
    if (hasDataMethods) return 'data-access'

    return 'unknown'
  }

  private generateModuleDescription(dir: string, purpose: ModulePurpose, publicApi: PublicApiInfo[]): string {
    const purposeDescriptions: Record<ModulePurpose, string> = {
      'ui-component': 'Provides reusable UI components',
      'business-logic': 'Implements core business logic and domain rules',
      'data-access': 'Handles data fetching and persistence operations',
      'utility': 'Provides utility functions and helpers',
      'configuration': 'Manages application configuration',
      'api-client': 'Handles external API communication',
      'state-management': 'Manages application state',
      'routing': 'Handles application routing and navigation',
      'middleware': 'Provides request/response processing middleware',
      'testing': 'Contains test utilities and specifications',
      'types': 'Defines TypeScript types and interfaces',
      'infrastructure': 'Provides infrastructure and cross-cutting concerns',
      'unknown': 'Module purpose could not be determined'
    }

    let description = purposeDescriptions[purpose]

    if (publicApi.length > 0) {
      const topExports = publicApi.slice(0, 5).map(a => a.name)
      description += `. Exports: ${topExports.join(', ')}${publicApi.length > 5 ? '...' : ''}`
    }

    return description
  }

  private calculateCohesion(chunks: ASTChunk[], imports: { source: string }[]): number {
    if (chunks.length === 0) return 0

    // Simple cohesion metric: ratio of internal references to total chunks
    let internalRefs = 0
    const chunkNames = new Set(chunks.map(c => c.name))

    for (const chunk of chunks) {
      for (const dep of chunk.dependencies) {
        if (chunkNames.has(dep.name)) {
          internalRefs++
        }
      }
    }

    const maxRefs = chunks.length * (chunks.length - 1)
    return maxRefs > 0 ? internalRefs / maxRefs : 1
  }

  private detectCircularDependencies(graph: DependencyGraph): string[][] {
    const cycles: string[][] = []
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const path: string[] = []

    const adjacency = new Map<string, string[]>()
    for (const edge of graph.edges) {
      if (edge.type === 'imports') {
        if (!adjacency.has(edge.from)) {
          adjacency.set(edge.from, [])
        }
        adjacency.get(edge.from)!.push(edge.to)
      }
    }

    const dfs = (node: string) => {
      visited.add(node)
      recursionStack.add(node)
      path.push(node)

      for (const neighbor of adjacency.get(node) ?? []) {
        if (!visited.has(neighbor)) {
          dfs(neighbor)
        } else if (recursionStack.has(neighbor)) {
          const cycleStart = path.indexOf(neighbor)
          if (cycleStart >= 0) {
            cycles.push([...path.slice(cycleStart), neighbor])
          }
        }
      }

      path.pop()
      recursionStack.delete(node)
    }

    for (const node of graph.nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id)
      }
    }

    return cycles
  }

  private identifyHotspots(files: FileAnalysis[], graph: DependencyGraph): Hotspot[] {
    const hotspots: Hotspot[] = []

    // High complexity files
    for (const file of files) {
      if (file.summary.complexity > 50) {
        hotspots.push({
          file: file.relativePath,
          type: 'high-complexity',
          score: file.summary.complexity,
          details: `Cyclomatic complexity: ${file.summary.complexity}`
        })
      }

      // God classes
      for (const chunk of file.chunks) {
        if (chunk.type === 'class') {
          const methodCount = chunk.children.length
          if (methodCount > 20) {
            hotspots.push({
              file: file.relativePath,
              type: 'god-class',
              score: methodCount,
              details: `${chunk.name} has ${methodCount} members`
            })
          }
        }
      }
    }

    // Hub files (high coupling)
    const incomingEdges = new Map<string, number>()
    const outgoingEdges = new Map<string, number>()

    for (const edge of graph.edges) {
      if (edge.type === 'imports') {
        outgoingEdges.set(edge.from, (outgoingEdges.get(edge.from) ?? 0) + 1)
        incomingEdges.set(edge.to, (incomingEdges.get(edge.to) ?? 0) + 1)
      }
    }

    for (const [file, count] of incomingEdges) {
      if (count > 10) {
        hotspots.push({
          file: file.replace('file:', ''),
          type: 'hub',
          score: count,
          details: `Imported by ${count} other files`
        })
      }
    }

    for (const [file, count] of outgoingEdges) {
      if (count > 15) {
        hotspots.push({
          file: file.replace('file:', ''),
          type: 'high-coupling',
          score: count,
          details: `Imports ${count} other files`
        })
      }
    }

    return hotspots.sort((a, b) => b.score - a.score)
  }
}
