/**
 * Architectural Wiki Generator
 *
 * Generates comprehensive architectural documentation from AST analysis,
 * code patterns, and business domain mapping. Creates well-structured
 * wiki pages that explain both technical implementation and business purpose.
 *
 * IMPORTANT: This generator produces markdown files with proper frontmatter
 * that does NOT duplicate the title in the body. The title should only appear
 * in the frontmatter `title` field, not as an H1 heading in the content.
 */

import { ASTChunker, FileAnalysis, ASTChunk, ChunkType } from './ast-chunker'
import { CodeAnalyzer, CodebaseAnalysis, ArchitecturalPattern, ModuleInfo, Hotspot } from './code-analyzer'
import { DomainMapper, DomainModel, DomainEntity, DomainService, BusinessWorkflow } from './domain-mapper'
import { mkdir, writeFile, readdir, stat } from 'fs/promises'
import { join, dirname, relative, basename } from 'path'
import { existsSync } from 'fs'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface WikiConfig {
  outputPath: string
  projectName: string
  projectDescription?: string
  includeTechnicalDetails: boolean
  includeBusinessContext: boolean
  includeCodeLinks: boolean
  generateIndex: boolean
  maxDepth: number
}

export interface WikiDocument {
  path: string
  frontmatter: WikiFrontmatter
  content: string
  sections: WikiSection[]
}

export interface WikiFrontmatter {
  title: string
  generated: string
  description: string
  related: string[]
  sources: string[]
  tags?: string[]
  category?: string
}

export interface WikiSection {
  id: string
  title: string
  level: number
  content: string
}

export interface WikiIndex {
  title: string
  description: string
  categories: WikiCategory[]
  recentlyUpdated: WikiIndexEntry[]
}

export interface WikiCategory {
  name: string
  description: string
  documents: WikiIndexEntry[]
}

export interface WikiIndexEntry {
  title: string
  path: string
  description: string
  lastUpdated: string
}

// ─── Wiki Generator Class ──────────────────────────────────────────────────

export class WikiGenerator {
  private chunker: ASTChunker
  private analyzer: CodeAnalyzer
  private domainMapper: DomainMapper
  private config: WikiConfig

  constructor(config: WikiConfig) {
    this.config = config
    this.chunker = new ASTChunker()
    this.analyzer = new CodeAnalyzer()
    this.domainMapper = new DomainMapper()
  }

  /**
   * Generate a complete architectural wiki for a codebase
   */
  async generateWiki(
    basePath: string,
    patterns?: string[],
    ignorePatterns?: string[]
  ): Promise<WikiDocument[]> {
    // Analyze the codebase
    const analysis = await this.analyzer.analyzeCodebase(basePath, patterns, ignorePatterns)
    const domainModel = this.domainMapper.inferDomainModel(analysis)

    const documents: WikiDocument[] = []

    // Generate overview document
    documents.push(await this.generateOverview(analysis, domainModel))

    // Generate architecture document
    documents.push(await this.generateArchitectureDoc(analysis, domainModel))

    // Generate pattern documents
    for (const pattern of analysis.patterns) {
      documents.push(await this.generatePatternDoc(pattern, analysis))
    }

    // Generate module documents
    for (const module of analysis.modules) {
      if (module.publicApi.length > 0) {
        documents.push(await this.generateModuleDoc(module, analysis, domainModel))
      }
    }

    // Generate domain model document
    if (this.config.includeBusinessContext) {
      documents.push(await this.generateDomainModelDoc(domainModel, analysis))
    }

    // Generate entity documents
    for (const entity of domainModel.entities) {
      documents.push(await this.generateEntityDoc(entity, analysis, domainModel))
    }

    // Generate service documents
    for (const service of domainModel.services) {
      documents.push(await this.generateServiceDoc(service, analysis, domainModel))
    }

    // Generate workflow documents
    for (const workflow of domainModel.workflows) {
      documents.push(await this.generateWorkflowDoc(workflow, analysis))
    }

    // Generate metrics/health document
    documents.push(await this.generateMetricsDoc(analysis))

    // Generate index
    if (this.config.generateIndex) {
      documents.push(await this.generateIndexDoc(documents))
    }

    // Write all documents
    await this.writeDocuments(documents)

    return documents
  }

  /**
   * Generate a single document for a specific file
   */
  async generateFileDoc(filePath: string, basePath: string): Promise<WikiDocument> {
    const analysis = await this.chunker.analyzeFile(filePath, basePath)
    const codebaseAnalysis: CodebaseAnalysis = {
      files: [analysis],
      graph: this.analyzer.buildDependencyGraph([analysis]),
      patterns: [],
      modules: [],
      metrics: this.analyzer.computeMetrics([analysis], { nodes: [], edges: [] }),
      timestamp: new Date().toISOString()
    }

    const domainModel = this.domainMapper.inferDomainModel(codebaseAnalysis)

    return this.generateSingleFileDoc(analysis, codebaseAnalysis, domainModel)
  }

  // ─── Document Generation Methods ─────────────────────────────────────────

  private async generateOverview(
    analysis: CodebaseAnalysis,
    domainModel: DomainModel
  ): Promise<WikiDocument> {
    const sections: WikiSection[] = []

    // Summary section
    sections.push({
      id: 'summary',
      title: 'Summary',
      level: 2,
      content: this.generateOverviewSummary(analysis, domainModel)
    })

    // Quick stats section
    sections.push({
      id: 'quick-stats',
      title: 'Quick Stats',
      level: 2,
      content: this.generateQuickStats(analysis)
    })

    // Technology stack section
    sections.push({
      id: 'technology-stack',
      title: 'Technology Stack',
      level: 2,
      content: this.generateTechStack(analysis)
    })

    // Key components section
    sections.push({
      id: 'key-components',
      title: 'Key Components',
      level: 2,
      content: this.generateKeyComponents(analysis, domainModel)
    })

    // Getting started section
    sections.push({
      id: 'getting-started',
      title: 'Getting Started',
      level: 2,
      content: this.generateGettingStarted(analysis)
    })

    return this.createDocument(
      'overview.md',
      {
        title: `${this.config.projectName} - Overview`,
        generated: new Date().toISOString(),
        description: `Architectural overview of ${this.config.projectName}`,
        related: ['architecture', 'domain-model'],
        sources: [],
        category: 'overview'
      },
      sections
    )
  }

  private async generateArchitectureDoc(
    analysis: CodebaseAnalysis,
    domainModel: DomainModel
  ): Promise<WikiDocument> {
    const sections: WikiSection[] = []

    // Architecture overview
    sections.push({
      id: 'architecture-overview',
      title: 'Architecture Overview',
      level: 2,
      content: this.generateArchitectureOverview(analysis, domainModel)
    })

    // Detected patterns
    if (analysis.patterns.length > 0) {
      sections.push({
        id: 'detected-patterns',
        title: 'Detected Architectural Patterns',
        level: 2,
        content: this.generatePatternsSummary(analysis.patterns)
      })
    }

    // Module structure
    sections.push({
      id: 'module-structure',
      title: 'Module Structure',
      level: 2,
      content: this.generateModuleStructure(analysis.modules)
    })

    // Dependency overview
    sections.push({
      id: 'dependencies',
      title: 'Dependencies',
      level: 2,
      content: this.generateDependencyOverview(analysis)
    })

    // Code health indicators
    sections.push({
      id: 'code-health',
      title: 'Code Health',
      level: 2,
      content: this.generateCodeHealth(analysis.metrics)
    })

    return this.createDocument(
      'architecture.md',
      {
        title: 'System Architecture',
        generated: new Date().toISOString(),
        description: 'Technical architecture and design patterns of the system',
        related: ['overview', 'domain-model', ...analysis.patterns.map(p => `patterns/${this.slugify(p.name)}`)],
        sources: [],
        category: 'architecture'
      },
      sections
    )
  }

  private async generatePatternDoc(
    pattern: ArchitecturalPattern,
    analysis: CodebaseAnalysis
  ): Promise<WikiDocument> {
    const sections: WikiSection[] = []

    // Pattern description
    sections.push({
      id: 'description',
      title: 'Description',
      level: 2,
      content: pattern.description
    })

    // Implementation details
    sections.push({
      id: 'implementation',
      title: 'Implementation',
      level: 2,
      content: this.generatePatternImplementation(pattern, analysis)
    })

    // Code locations
    sections.push({
      id: 'locations',
      title: 'Code Locations',
      level: 2,
      content: this.generatePatternLocations(pattern)
    })

    // Evidence
    sections.push({
      id: 'evidence',
      title: 'Evidence',
      level: 2,
      content: pattern.evidence.map(e => `- ${e}`).join('\n')
    })

    // Confidence
    sections.push({
      id: 'confidence',
      title: 'Confidence',
      level: 2,
      content: `Detection confidence: **${Math.round(pattern.confidence * 100)}%**`
    })

    return this.createDocument(
      `patterns/${this.slugify(pattern.name)}.md`,
      {
        title: pattern.name,
        generated: new Date().toISOString(),
        description: pattern.description,
        related: ['architecture', ...pattern.locations.map(l => `modules/${this.slugify(l.file)}`)],
        sources: pattern.locations.map(l => l.file),
        tags: ['pattern', pattern.type],
        category: 'patterns'
      },
      sections
    )
  }

  private async generateModuleDoc(
    module: ModuleInfo,
    analysis: CodebaseAnalysis,
    domainModel: DomainModel
  ): Promise<WikiDocument> {
    const sections: WikiSection[] = []

    // Module overview
    sections.push({
      id: 'overview',
      title: 'Overview',
      level: 2,
      content: this.generateModuleOverview(module, domainModel)
    })

    // Public API
    if (module.publicApi.length > 0) {
      sections.push({
        id: 'public-api',
        title: 'Public API',
        level: 2,
        content: this.generatePublicApi(module)
      })
    }

    // Dependencies
    if (module.externalDependencies.length > 0 || module.internalDependencies.length > 0) {
      sections.push({
        id: 'dependencies',
        title: 'Dependencies',
        level: 2,
        content: this.generateModuleDependencies(module)
      })
    }

    // Business context
    if (this.config.includeBusinessContext) {
      const role = this.domainMapper.getModuleRole(module, analysis)
      sections.push({
        id: 'business-context',
        title: 'Business Context',
        level: 2,
        content: `**Role in System**: ${role}\n\n${module.description}`
      })
    }

    return this.createDocument(
      `modules/${this.slugify(module.name)}.md`,
      {
        title: module.name,
        generated: new Date().toISOString(),
        description: module.description,
        related: module.internalDependencies.map(d => `modules/${this.slugify(basename(d))}`),
        sources: [module.path],
        tags: [module.purpose],
        category: 'modules'
      },
      sections
    )
  }

  private async generateDomainModelDoc(
    domainModel: DomainModel,
    analysis: CodebaseAnalysis
  ): Promise<WikiDocument> {
    const sections: WikiSection[] = []

    // Domain overview
    sections.push({
      id: 'domain-overview',
      title: 'Domain Overview',
      level: 2,
      content: domainModel.description
    })

    // Entities summary
    if (domainModel.entities.length > 0) {
      sections.push({
        id: 'entities',
        title: 'Domain Entities',
        level: 2,
        content: this.generateEntitiesSummary(domainModel.entities)
      })
    }

    // Aggregates
    if (domainModel.aggregates.length > 0) {
      sections.push({
        id: 'aggregates',
        title: 'Aggregates',
        level: 2,
        content: this.generateAggregatesSummary(domainModel.aggregates)
      })
    }

    // Services summary
    if (domainModel.services.length > 0) {
      sections.push({
        id: 'services',
        title: 'Domain Services',
        level: 2,
        content: this.generateServicesSummary(domainModel.services)
      })
    }

    // Events
    if (domainModel.events.length > 0) {
      sections.push({
        id: 'events',
        title: 'Domain Events',
        level: 2,
        content: this.generateEventsSummary(domainModel.events)
      })
    }

    // Bounded contexts
    if (domainModel.boundedContexts.length > 0) {
      sections.push({
        id: 'bounded-contexts',
        title: 'Bounded Contexts',
        level: 2,
        content: this.generateBoundedContextsSummary(domainModel.boundedContexts)
      })
    }

    return this.createDocument(
      'domain-model.md',
      {
        title: `${domainModel.name} Domain Model`,
        generated: new Date().toISOString(),
        description: `Business domain model for ${domainModel.name}`,
        related: [
          'overview',
          'architecture',
          ...domainModel.entities.map(e => `entities/${this.slugify(e.technicalName)}`),
          ...domainModel.services.map(s => `services/${this.slugify(s.technicalName)}`)
        ],
        sources: [],
        category: 'domain'
      },
      sections
    )
  }

  private async generateEntityDoc(
    entity: DomainEntity,
    analysis: CodebaseAnalysis,
    domainModel: DomainModel
  ): Promise<WikiDocument> {
    const sections: WikiSection[] = []

    // Entity overview
    sections.push({
      id: 'overview',
      title: 'Overview',
      level: 2,
      content: `${entity.description}\n\n**Purpose**: ${entity.purpose}`
    })

    // Attributes
    if (entity.attributes.length > 0) {
      sections.push({
        id: 'attributes',
        title: 'Attributes',
        level: 2,
        content: this.generateAttributesTable(entity.attributes)
      })
    }

    // Behaviors
    if (entity.behaviors.length > 0) {
      sections.push({
        id: 'behaviors',
        title: 'Behaviors',
        level: 2,
        content: this.generateBehaviorsList(entity.behaviors)
      })
    }

    // Relationships
    if (entity.relationships.length > 0) {
      sections.push({
        id: 'relationships',
        title: 'Relationships',
        level: 2,
        content: this.generateRelationshipsDiagram(entity.relationships)
      })
    }

    // Source code links
    if (this.config.includeCodeLinks) {
      sections.push({
        id: 'source-code',
        title: 'Source Code',
        level: 2,
        content: entity.sourceFiles.map(f => `- \`${f}\``).join('\n')
      })
    }

    return this.createDocument(
      `entities/${this.slugify(entity.technicalName)}.md`,
      {
        title: entity.name,
        generated: new Date().toISOString(),
        description: entity.description,
        related: [
          'domain-model',
          ...entity.relationships.map(r => `entities/${this.slugify(r.targetEntity)}`)
        ],
        sources: entity.sourceFiles,
        tags: ['entity', 'domain'],
        category: 'entities'
      },
      sections
    )
  }

  private async generateServiceDoc(
    service: DomainService,
    analysis: CodebaseAnalysis,
    domainModel: DomainModel
  ): Promise<WikiDocument> {
    const sections: WikiSection[] = []

    // Service overview
    sections.push({
      id: 'overview',
      title: 'Overview',
      level: 2,
      content: service.description
    })

    // Capabilities
    if (service.capabilities.length > 0) {
      sections.push({
        id: 'capabilities',
        title: 'Capabilities',
        level: 2,
        content: this.generateCapabilitiesTable(service.capabilities)
      })
    }

    // Dependencies
    if (service.dependencies.length > 0) {
      sections.push({
        id: 'dependencies',
        title: 'Dependencies',
        level: 2,
        content: service.dependencies.map(d => `- ${d}`).join('\n')
      })
    }

    // Source code links
    if (this.config.includeCodeLinks) {
      sections.push({
        id: 'source-code',
        title: 'Source Code',
        level: 2,
        content: service.sourceFiles.map(f => `- \`${f}\``).join('\n')
      })
    }

    return this.createDocument(
      `services/${this.slugify(service.technicalName)}.md`,
      {
        title: service.name,
        generated: new Date().toISOString(),
        description: service.description,
        related: ['domain-model', ...service.dependencies.map(d => `entities/${this.slugify(d)}`)],
        sources: service.sourceFiles,
        tags: ['service', 'domain'],
        category: 'services'
      },
      sections
    )
  }

  private async generateWorkflowDoc(
    workflow: BusinessWorkflow,
    analysis: CodebaseAnalysis
  ): Promise<WikiDocument> {
    const sections: WikiSection[] = []

    // Workflow overview
    sections.push({
      id: 'overview',
      title: 'Overview',
      level: 2,
      content: `${workflow.description}\n\n**Purpose**: ${workflow.purpose}`
    })

    // Triggers
    sections.push({
      id: 'triggers',
      title: 'Triggers',
      level: 2,
      content: workflow.triggers.map(t => `- ${t}`).join('\n')
    })

    // Steps
    sections.push({
      id: 'steps',
      title: 'Workflow Steps',
      level: 2,
      content: this.generateWorkflowSteps(workflow.steps)
    })

    // Participants
    sections.push({
      id: 'participants',
      title: 'Participants',
      level: 2,
      content: workflow.participants.map(p => `- **${p}**`).join('\n')
    })

    // Outcomes
    sections.push({
      id: 'outcomes',
      title: 'Possible Outcomes',
      level: 2,
      content: workflow.outcomes.map(o => `- ${o}`).join('\n')
    })

    return this.createDocument(
      `workflows/${this.slugify(workflow.name)}.md`,
      {
        title: workflow.name,
        generated: new Date().toISOString(),
        description: workflow.description,
        related: ['domain-model', 'architecture'],
        sources: [],
        tags: ['workflow', 'process'],
        category: 'workflows'
      },
      sections
    )
  }

  private async generateMetricsDoc(analysis: CodebaseAnalysis): Promise<WikiDocument> {
    const sections: WikiSection[] = []

    // Codebase stats
    sections.push({
      id: 'stats',
      title: 'Codebase Statistics',
      level: 2,
      content: this.generateCodebaseStats(analysis.metrics)
    })

    // Complexity analysis
    sections.push({
      id: 'complexity',
      title: 'Complexity Analysis',
      level: 2,
      content: this.generateComplexityAnalysis(analysis.metrics)
    })

    // Hotspots
    if (analysis.metrics.hotspots.length > 0) {
      sections.push({
        id: 'hotspots',
        title: 'Code Hotspots',
        level: 2,
        content: this.generateHotspotsTable(analysis.metrics.hotspots)
      })
    }

    // Circular dependencies
    if (analysis.metrics.circularDependencies.length > 0) {
      sections.push({
        id: 'circular-deps',
        title: 'Circular Dependencies',
        level: 2,
        content: this.generateCircularDepsWarning(analysis.metrics.circularDependencies)
      })
    }

    // Chunk distribution
    sections.push({
      id: 'distribution',
      title: 'Code Distribution',
      level: 2,
      content: this.generateChunkDistribution(analysis.metrics.chunkDistribution)
    })

    return this.createDocument(
      'metrics.md',
      {
        title: 'Code Metrics & Health',
        generated: new Date().toISOString(),
        description: 'Codebase health metrics and quality indicators',
        related: ['architecture', 'overview'],
        sources: [],
        category: 'metrics'
      },
      sections
    )
  }

  private async generateIndexDoc(documents: WikiDocument[]): Promise<WikiDocument> {
    const categories = new Map<string, WikiDocument[]>()

    for (const doc of documents) {
      const category = doc.frontmatter.category || 'general'
      if (!categories.has(category)) {
        categories.set(category, [])
      }
      categories.get(category)!.push(doc)
    }

    const sections: WikiSection[] = []

    // Introduction
    sections.push({
      id: 'introduction',
      title: 'Introduction',
      level: 2,
      content: this.config.projectDescription ||
        `Welcome to the ${this.config.projectName} architectural wiki. This documentation is automatically generated from source code analysis.`
    })

    // Table of contents by category
    for (const [category, docs] of categories) {
      sections.push({
        id: `category-${category}`,
        title: this.humanize(category),
        level: 2,
        content: docs
          .map(d => `- [${d.frontmatter.title}](${d.path}) - ${d.frontmatter.description}`)
          .join('\n')
      })
    }

    // Recently generated
    const recentDocs = [...documents]
      .sort((a, b) => new Date(b.frontmatter.generated).getTime() - new Date(a.frontmatter.generated).getTime())
      .slice(0, 10)

    sections.push({
      id: 'recent',
      title: 'Recently Updated',
      level: 2,
      content: recentDocs
        .map(d => `- [${d.frontmatter.title}](${d.path})`)
        .join('\n')
    })

    return this.createDocument(
      'index.md',
      {
        title: `${this.config.projectName} Wiki`,
        generated: new Date().toISOString(),
        description: `Architectural documentation for ${this.config.projectName}`,
        related: ['overview', 'architecture', 'domain-model'],
        sources: [],
        category: 'index'
      },
      sections
    )
  }

  private async generateSingleFileDoc(
    fileAnalysis: FileAnalysis,
    analysis: CodebaseAnalysis,
    domainModel: DomainModel
  ): Promise<WikiDocument> {
    const sections: WikiSection[] = []

    // File overview
    sections.push({
      id: 'overview',
      title: 'Overview',
      level: 2,
      content: this.generateFileOverview(fileAnalysis)
    })

    // Exports
    const exports = fileAnalysis.chunks.filter(c => c.exports && !c.parent)
    if (exports.length > 0) {
      sections.push({
        id: 'exports',
        title: 'Exports',
        level: 2,
        content: this.generateExportsSection(exports)
      })
    }

    // Dependencies
    if (fileAnalysis.imports.length > 0) {
      sections.push({
        id: 'dependencies',
        title: 'Dependencies',
        level: 2,
        content: this.generateImportsSection(fileAnalysis.imports)
      })
    }

    // Code structure
    sections.push({
      id: 'structure',
      title: 'Code Structure',
      level: 2,
      content: this.generateCodeStructure(fileAnalysis)
    })

    return this.createDocument(
      `files/${this.slugify(basename(fileAnalysis.filePath))}.md`,
      {
        title: basename(fileAnalysis.filePath),
        generated: new Date().toISOString(),
        description: `Documentation for ${fileAnalysis.relativePath}`,
        related: fileAnalysis.imports.filter(i => i.source.startsWith('.')).map(i => i.source),
        sources: [fileAnalysis.relativePath],
        category: 'files'
      },
      sections
    )
  }

  // ─── Content Generation Helpers ──────────────────────────────────────────

  private generateOverviewSummary(analysis: CodebaseAnalysis, domainModel: DomainModel): string {
    return `
${this.config.projectDescription || `${this.config.projectName} is a software system.`}

This codebase contains **${analysis.files.length} files** with **${analysis.metrics.totalLines.toLocaleString()} lines of code**. The system implements ${analysis.patterns.length} recognized architectural patterns and is organized around the **${domainModel.name}** domain.

Key characteristics:
- **${domainModel.entities.length}** domain entities
- **${domainModel.services.length}** domain services
- **${analysis.modules.length}** modules
`.trim()
  }

  private generateQuickStats(analysis: CodebaseAnalysis): string {
    return `
| Metric | Value |
|--------|-------|
| Files | ${analysis.files.length} |
| Lines of Code | ${analysis.metrics.totalCodeLines.toLocaleString()} |
| Total Lines | ${analysis.metrics.totalLines.toLocaleString()} |
| Classes | ${analysis.metrics.chunkDistribution.class} |
| Interfaces | ${analysis.metrics.chunkDistribution.interface} |
| Functions | ${analysis.metrics.chunkDistribution.function} |
| Average Complexity | ${analysis.metrics.averageComplexity.toFixed(2)} |
`.trim()
  }

  private generateTechStack(analysis: CodebaseAnalysis): string {
    const externalDeps = new Set<string>()
    for (const file of analysis.files) {
      for (const dep of file.summary.externalDependencies) {
        externalDeps.add(dep)
      }
    }

    const deps = Array.from(externalDeps).slice(0, 20)
    if (deps.length === 0) {
      return 'No external dependencies detected.'
    }

    return `
**External Dependencies**:
${deps.map(d => `- \`${d}\``).join('\n')}
${externalDeps.size > 20 ? `\n...and ${externalDeps.size - 20} more` : ''}
`.trim()
  }

  private generateKeyComponents(analysis: CodebaseAnalysis, domainModel: DomainModel): string {
    const components = domainModel.entities.slice(0, 5)
    const services = domainModel.services.slice(0, 5)

    let content = '**Core Entities**:\n'
    content += components.map(c => `- **${c.name}**: ${c.description.slice(0, 100)}...`).join('\n')

    if (services.length > 0) {
      content += '\n\n**Key Services**:\n'
      content += services.map(s => `- **${s.name}**: ${s.description.slice(0, 100)}...`).join('\n')
    }

    return content
  }

  private generateGettingStarted(analysis: CodebaseAnalysis): string {
    return `
To explore this codebase:

1. Start with the [Architecture](architecture.md) document for a technical overview
2. Review the [Domain Model](domain-model.md) to understand the business concepts
3. Explore individual [Modules](modules/) for specific functionality
4. Check [Metrics](metrics.md) for code health indicators
`.trim()
  }

  private generateArchitectureOverview(analysis: CodebaseAnalysis, domainModel: DomainModel): string {
    return `
The ${this.config.projectName} system follows a structured architecture with ${analysis.patterns.length} identifiable design patterns.

**Architectural Style**: ${this.inferArchitecturalStyle(analysis.patterns)}

**Layer Organization**:
${analysis.modules.map(m => `- **${m.name}**: ${m.description}`).slice(0, 10).join('\n')}
`.trim()
  }

  private generatePatternsSummary(patterns: ArchitecturalPattern[]): string {
    return patterns
      .map(p => `### ${p.name}\n\n${p.description}\n\n**Confidence**: ${Math.round(p.confidence * 100)}%`)
      .join('\n\n')
  }

  private generateModuleStructure(modules: ModuleInfo[]): string {
    const tree = this.buildModuleTree(modules)
    return '```\n' + tree + '\n```'
  }

  private generateDependencyOverview(analysis: CodebaseAnalysis): string {
    const externalDeps = new Set<string>()
    for (const file of analysis.files) {
      for (const dep of file.summary.externalDependencies) {
        externalDeps.add(dep)
      }
    }

    return `
The codebase has **${analysis.metrics.dependencyCount}** internal dependencies and **${externalDeps.size}** external dependencies.

${analysis.metrics.circularDependencies.length > 0
        ? `**Warning**: ${analysis.metrics.circularDependencies.length} circular dependencies detected.`
        : '**Status**: No circular dependencies detected.'}
`.trim()
  }

  private generateCodeHealth(metrics: CodebaseAnalysis['metrics']): string {
    const healthScore = this.calculateHealthScore(metrics)
    const healthEmoji = healthScore > 80 ? 'green' : healthScore > 60 ? 'yellow' : 'red'

    return `
**Overall Health Score**: ${healthScore}/100

${metrics.hotspots.length > 0
        ? `**Attention Required**: ${metrics.hotspots.length} code hotspots identified`
        : 'No significant code quality issues detected.'}
`.trim()
  }

  private generatePatternImplementation(pattern: ArchitecturalPattern, analysis: CodebaseAnalysis): string {
    return `
This pattern is implemented across ${pattern.locations.length} locations in the codebase.

**How it works**:
${pattern.evidence.slice(0, 5).map(e => `- ${e}`).join('\n')}
`.trim()
  }

  private generatePatternLocations(pattern: ArchitecturalPattern): string {
    return pattern.locations
      .map(l => `- \`${l.file}\` - Role: ${l.role}`)
      .join('\n')
  }

  private generateModuleOverview(module: ModuleInfo, domainModel: DomainModel): string {
    const role = this.domainMapper.getModuleRole(module, { files: [], graph: { nodes: [], edges: [] }, patterns: [], modules: [module], metrics: {} as any, timestamp: '' })

    return `
${module.description}

**Purpose**: ${this.humanize(module.purpose)}
**Role**: ${role}
**Complexity**: ${module.complexity}
**Cohesion**: ${(module.cohesion * 100).toFixed(1)}%
`.trim()
  }

  private generatePublicApi(module: ModuleInfo): string {
    return module.publicApi
      .map(api => `### ${api.name}\n\n\`${api.signature}\`\n\n${api.documentation || 'No documentation available.'}`)
      .join('\n\n')
  }

  private generateModuleDependencies(module: ModuleInfo): string {
    let content = ''

    if (module.internalDependencies.length > 0) {
      content += '**Internal Dependencies**:\n'
      content += module.internalDependencies.map(d => `- \`${d}\``).join('\n')
    }

    if (module.externalDependencies.length > 0) {
      content += '\n\n**External Dependencies**:\n'
      content += module.externalDependencies.map(d => `- \`${d}\``).join('\n')
    }

    return content
  }

  private generateEntitiesSummary(entities: DomainEntity[]): string {
    return entities
      .map(e => `- **${e.name}**: ${e.description}`)
      .join('\n')
  }

  private generateAggregatesSummary(aggregates: DomainModel['aggregates']): string {
    return aggregates
      .map(a => `### ${a.name}\n\n${a.description}\n\n**Root**: ${a.rootEntity}\n**Entities**: ${a.entities.join(', ')}`)
      .join('\n\n')
  }

  private generateServicesSummary(services: DomainService[]): string {
    return services
      .map(s => `- **${s.name}**: ${s.description}`)
      .join('\n')
  }

  private generateEventsSummary(events: DomainModel['events']): string {
    return events
      .map(e => `- **${e.name}**: ${e.description}`)
      .join('\n')
  }

  private generateBoundedContextsSummary(contexts: DomainModel['boundedContexts']): string {
    return contexts
      .map(c => `### ${c.name}\n\n${c.description}\n\n**Responsibility**: ${c.responsibility}`)
      .join('\n\n')
  }

  private generateAttributesTable(attributes: DomainEntity['attributes']): string {
    let table = '| Attribute | Type | Required | Business Meaning |\n'
    table += '|-----------|------|----------|------------------|\n'

    for (const attr of attributes) {
      table += `| ${attr.name} | \`${attr.type}\` | ${attr.required ? 'Yes' : 'No'} | ${attr.businessMeaning} |\n`
    }

    return table
  }

  private generateBehaviorsList(behaviors: DomainEntity['behaviors']): string {
    return behaviors
      .map(b => `- **${b.name}**: ${b.description}`)
      .join('\n')
  }

  private generateRelationshipsDiagram(relationships: DomainEntity['relationships']): string {
    if (relationships.length === 0) return 'No relationships defined.'

    return relationships
      .map(r => `- **${r.type}** → ${r.targetEntity}: ${r.description}`)
      .join('\n')
  }

  private generateCapabilitiesTable(capabilities: DomainService['capabilities']): string {
    let table = '| Capability | Input | Output | Business Value |\n'
    table += '|------------|-------|--------|----------------|\n'

    for (const cap of capabilities) {
      table += `| ${cap.name} | \`${cap.input}\` | \`${cap.output}\` | ${cap.businessValue} |\n`
    }

    return table
  }

  private generateWorkflowSteps(steps: BusinessWorkflow['steps']): string {
    return steps
      .map(s => `${s.order}. **${s.name}**\n   - Actor: ${s.actor}\n   - Action: ${s.action}\n   - Outcome: ${s.outcome}`)
      .join('\n\n')
  }

  private generateCodebaseStats(metrics: CodebaseAnalysis['metrics']): string {
    return `
| Metric | Value |
|--------|-------|
| Total Files | ${metrics.totalFiles} |
| Total Lines | ${metrics.totalLines.toLocaleString()} |
| Code Lines | ${metrics.totalCodeLines.toLocaleString()} |
| Total Chunks | ${metrics.totalChunks} |
| Dependencies | ${metrics.dependencyCount} |
`.trim()
  }

  private generateComplexityAnalysis(metrics: CodebaseAnalysis['metrics']): string {
    return `
**Average Complexity**: ${metrics.averageComplexity.toFixed(2)}
**Maximum Complexity**: ${metrics.maxComplexity}

${metrics.averageComplexity > 10
        ? 'The codebase has elevated complexity that may benefit from refactoring.'
        : 'Complexity levels are within acceptable ranges.'}
`.trim()
  }

  private generateHotspotsTable(hotspots: Hotspot[]): string {
    let table = '| File | Type | Score | Details |\n'
    table += '|------|------|-------|--------|\n'

    for (const hotspot of hotspots.slice(0, 10)) {
      table += `| ${hotspot.file} | ${hotspot.type} | ${hotspot.score} | ${hotspot.details} |\n`
    }

    return table
  }

  private generateCircularDepsWarning(cycles: string[][]): string {
    return `
**Warning**: The following circular dependencies were detected:

${cycles.slice(0, 5).map((cycle, i) => `${i + 1}. ${cycle.join(' → ')}`).join('\n')}

${cycles.length > 5 ? `\n...and ${cycles.length - 5} more` : ''}
`.trim()
  }

  private generateChunkDistribution(distribution: Record<ChunkType, number>): string {
    const entries = Object.entries(distribution)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])

    let table = '| Type | Count |\n'
    table += '|------|-------|\n'

    for (const [type, count] of entries) {
      table += `| ${type} | ${count} |\n`
    }

    return table
  }

  private generateFileOverview(fileAnalysis: FileAnalysis): string {
    return `
**Path**: \`${fileAnalysis.relativePath}\`

| Metric | Value |
|--------|-------|
| Total Lines | ${fileAnalysis.summary.totalLines} |
| Code Lines | ${fileAnalysis.summary.codeLines} |
| Comment Lines | ${fileAnalysis.summary.commentLines} |
| Complexity | ${fileAnalysis.summary.complexity} |
| Exports | ${fileAnalysis.summary.mainExports.join(', ') || 'None'} |
`.trim()
  }

  private generateExportsSection(exports: ASTChunk[]): string {
    return exports
      .map(e => `### ${e.name}\n\n\`${e.signature || e.type}\`\n\n${e.documentation || 'No documentation.'}`)
      .join('\n\n')
  }

  private generateImportsSection(imports: FileAnalysis['imports']): string {
    const internal = imports.filter(i => i.source.startsWith('.'))
    const external = imports.filter(i => !i.source.startsWith('.'))

    let content = ''

    if (external.length > 0) {
      content += '**External**:\n'
      content += external.map(i => `- \`${i.source}\`: ${i.specifiers.map(s => s.name).join(', ')}`).join('\n')
    }

    if (internal.length > 0) {
      content += '\n\n**Internal**:\n'
      content += internal.map(i => `- \`${i.source}\`: ${i.specifiers.map(s => s.name).join(', ')}`).join('\n')
    }

    return content
  }

  private generateCodeStructure(fileAnalysis: FileAnalysis): string {
    const topLevel = fileAnalysis.chunks.filter(c => !c.parent)

    return topLevel
      .map(c => `- **${c.type}** \`${c.name}\` (lines ${c.startLine}-${c.endLine})`)
      .join('\n')
  }

  // ─── Utility Methods ─────────────────────────────────────────────────────

  private createDocument(
    path: string,
    frontmatter: WikiFrontmatter,
    sections: WikiSection[]
  ): WikiDocument {
    // Generate content WITHOUT duplicating the title
    // The title should ONLY be in the frontmatter
    let content = this.generateFrontmatter(frontmatter)
    content += '\n\n'

    // Add sections (starting with the first section, NOT the title)
    for (const section of sections) {
      const prefix = '#'.repeat(section.level)
      content += `${prefix} ${section.title}\n\n${section.content}\n\n`
    }

    return { path, frontmatter, content: content.trim(), sections }
  }

  private generateFrontmatter(fm: WikiFrontmatter): string {
    // Using YAML frontmatter format
    // NOTE: The title is ONLY in the frontmatter, NOT repeated in the body
    const lines = [
      '---',
      `title: ${this.escapeYaml(fm.title)}`,
      `generated: '${fm.generated}'`,
      `description: >-`,
      `  ${this.escapeYaml(fm.description)}`,
      `related:`
    ]

    for (const rel of fm.related) {
      lines.push(`  - ${rel}`)
    }

    lines.push('sources:')
    for (const src of fm.sources) {
      lines.push(`  - ${src}`)
    }

    if (fm.tags && fm.tags.length > 0) {
      lines.push('tags:')
      for (const tag of fm.tags) {
        lines.push(`  - ${tag}`)
      }
    }

    if (fm.category) {
      lines.push(`category: ${fm.category}`)
    }

    lines.push('---')

    return lines.join('\n')
  }

  private escapeYaml(str: string): string {
    if (str.includes(':') || str.includes('#') || str.includes("'")) {
      return `"${str.replace(/"/g, '\\"')}"`
    }
    return str
  }

  private async writeDocuments(documents: WikiDocument[]): Promise<void> {
    for (const doc of documents) {
      const fullPath = join(this.config.outputPath, doc.path)
      await mkdir(dirname(fullPath), { recursive: true })
      await writeFile(fullPath, doc.content, 'utf-8')
    }
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  private humanize(text: string): string {
    return text
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .replace(/^\s+/, '')
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase())
      .trim()
  }

  private inferArchitecturalStyle(patterns: ArchitecturalPattern[]): string {
    if (patterns.some(p => p.type === 'layered-architecture')) {
      return 'Layered Architecture'
    }
    if (patterns.some(p => p.type === 'provider-pattern' || p.type === 'hook-pattern')) {
      return 'Component-Based (React)'
    }
    if (patterns.some(p => p.type === 'service-layer' && p.type === 'repository')) {
      return 'Clean Architecture'
    }
    return 'Modular Architecture'
  }

  private buildModuleTree(modules: ModuleInfo[]): string {
    const lines: string[] = []
    const sorted = [...modules].sort((a, b) => a.path.localeCompare(b.path))

    for (const mod of sorted) {
      const depth = mod.path.split('/').length - 1
      const indent = '  '.repeat(depth)
      const name = basename(mod.path) || mod.name
      lines.push(`${indent}${name}/`)

      for (const exp of mod.exports.slice(0, 3)) {
        lines.push(`${indent}  - ${exp}`)
      }
      if (mod.exports.length > 3) {
        lines.push(`${indent}  ... and ${mod.exports.length - 3} more`)
      }
    }

    return lines.join('\n')
  }

  private calculateHealthScore(metrics: CodebaseAnalysis['metrics']): number {
    let score = 100

    // Penalize high complexity
    if (metrics.averageComplexity > 15) score -= 20
    else if (metrics.averageComplexity > 10) score -= 10

    // Penalize hotspots
    score -= Math.min(20, metrics.hotspots.length * 2)

    // Penalize circular dependencies
    score -= Math.min(20, metrics.circularDependencies.length * 5)

    return Math.max(0, score)
  }
}
