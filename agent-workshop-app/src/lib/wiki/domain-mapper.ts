/**
 * Business Domain Mapper Module
 *
 * Maps code structures to business domain concepts, understanding the functional
 * purpose of code elements beyond their technical implementation. This helps
 * generate documentation that explains not just "what" but "why" and "how it
 * fits into the business domain".
 */

import { ASTChunk, FileAnalysis, ChunkType } from './ast-chunker'
import { CodebaseAnalysis, ModuleInfo, ArchitecturalPattern, ModulePurpose } from './code-analyzer'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface DomainModel {
  name: string
  description: string
  entities: DomainEntity[]
  aggregates: DomainAggregate[]
  services: DomainService[]
  events: DomainEvent[]
  workflows: BusinessWorkflow[]
  boundedContexts: BoundedContext[]
}

export interface DomainEntity {
  name: string
  technicalName: string
  description: string
  purpose: string
  attributes: EntityAttribute[]
  behaviors: EntityBehavior[]
  relationships: EntityRelationship[]
  sourceFiles: string[]
  sourceChunks: string[]
}

export interface EntityAttribute {
  name: string
  type: string
  businessMeaning: string
  required: boolean
  validation?: string
}

export interface EntityBehavior {
  name: string
  description: string
  businessRule?: string
  triggers?: string[]
  effects?: string[]
}

export interface EntityRelationship {
  type: 'has-one' | 'has-many' | 'belongs-to' | 'many-to-many' | 'depends-on'
  targetEntity: string
  description: string
  cardinality?: string
}

export interface DomainAggregate {
  name: string
  rootEntity: string
  entities: string[]
  description: string
  invariants: string[]
}

export interface DomainService {
  name: string
  technicalName: string
  description: string
  capabilities: ServiceCapability[]
  dependencies: string[]
  sourceFiles: string[]
}

export interface ServiceCapability {
  name: string
  description: string
  input: string
  output: string
  businessValue: string
}

export interface DomainEvent {
  name: string
  description: string
  trigger: string
  payload: string[]
  handlers: string[]
  businessSignificance: string
}

export interface BusinessWorkflow {
  name: string
  description: string
  purpose: string
  steps: WorkflowStep[]
  participants: string[]
  triggers: string[]
  outcomes: string[]
}

export interface WorkflowStep {
  order: number
  name: string
  description: string
  actor: string
  action: string
  outcome: string
}

export interface BoundedContext {
  name: string
  description: string
  responsibility: string
  entities: string[]
  services: string[]
  externalDependencies: string[]
  internalModules: string[]
}

export interface DomainMapping {
  chunk: ASTChunk
  domainConcepts: DomainConcept[]
  businessContext: BusinessContext
}

export interface DomainConcept {
  type: DomainConceptType
  name: string
  description: string
  confidence: number
}

export type DomainConceptType =
  | 'entity'
  | 'value-object'
  | 'aggregate'
  | 'repository'
  | 'service'
  | 'factory'
  | 'event'
  | 'command'
  | 'query'
  | 'policy'
  | 'specification'

export interface BusinessContext {
  domain: string
  subdomain?: string
  capability: string
  userStory?: string
  acceptance?: string[]
}

// ─── Domain Name Inference ─────────────────────────────────────────────────

interface DomainTerms {
  entities: string[]
  actions: string[]
  properties: string[]
}

const COMMON_DOMAIN_TERMS: Record<string, DomainTerms> = {
  'e-commerce': {
    entities: ['product', 'cart', 'order', 'customer', 'payment', 'inventory', 'shipping', 'catalog', 'category', 'review', 'wishlist'],
    actions: ['checkout', 'purchase', 'add-to-cart', 'browse', 'search', 'filter', 'refund', 'ship'],
    properties: ['price', 'quantity', 'sku', 'stock', 'discount', 'tax']
  },
  'authentication': {
    entities: ['user', 'session', 'token', 'role', 'permission', 'credential', 'identity', 'account'],
    actions: ['login', 'logout', 'register', 'authenticate', 'authorize', 'verify', 'reset-password', 'impersonate'],
    properties: ['email', 'password', 'username', 'claims', 'scope', 'expiry']
  },
  'content-management': {
    entities: ['article', 'post', 'page', 'media', 'author', 'comment', 'tag', 'category', 'template'],
    actions: ['publish', 'draft', 'archive', 'edit', 'moderate', 'upload'],
    properties: ['title', 'content', 'slug', 'status', 'published-at']
  },
  'analytics': {
    entities: ['event', 'metric', 'report', 'dashboard', 'chart', 'segment', 'cohort'],
    actions: ['track', 'aggregate', 'analyze', 'export', 'visualize'],
    properties: ['timestamp', 'dimension', 'measure', 'period']
  },
  'messaging': {
    entities: ['message', 'conversation', 'channel', 'notification', 'thread', 'recipient'],
    actions: ['send', 'receive', 'read', 'archive', 'notify', 'subscribe'],
    properties: ['subject', 'body', 'sender', 'recipient', 'timestamp']
  },
  'project-management': {
    entities: ['project', 'task', 'sprint', 'milestone', 'team', 'member', 'board', 'backlog'],
    actions: ['assign', 'complete', 'prioritize', 'estimate', 'plan', 'review'],
    properties: ['status', 'priority', 'deadline', 'effort', 'progress']
  },
  'financial': {
    entities: ['transaction', 'account', 'balance', 'ledger', 'invoice', 'payment', 'transfer'],
    actions: ['debit', 'credit', 'reconcile', 'audit', 'report'],
    properties: ['amount', 'currency', 'date', 'reference']
  }
}

// ─── Domain Mapper Class ───────────────────────────────────────────────────

export class DomainMapper {
  /**
   * Infer the business domain model from a codebase analysis
   */
  inferDomainModel(analysis: CodebaseAnalysis): DomainModel {
    const domainName = this.inferDomainName(analysis)
    const entities = this.inferEntities(analysis)
    const services = this.inferServices(analysis)
    const events = this.inferEvents(analysis)
    const aggregates = this.inferAggregates(entities)
    const workflows = this.inferWorkflows(analysis, services, events)
    const boundedContexts = this.inferBoundedContexts(analysis.modules)

    return {
      name: domainName,
      description: this.generateDomainDescription(domainName, entities, services),
      entities,
      aggregates,
      services,
      events,
      workflows,
      boundedContexts
    }
  }

  /**
   * Map a specific code chunk to business domain concepts
   */
  mapChunkToDomain(chunk: ASTChunk, analysis: CodebaseAnalysis): DomainMapping {
    const domainConcepts = this.inferChunkConcepts(chunk, analysis)
    const businessContext = this.inferBusinessContext(chunk, analysis)

    return {
      chunk,
      domainConcepts,
      businessContext
    }
  }

  /**
   * Generate a business-focused description for a code element
   */
  generateBusinessDescription(chunk: ASTChunk, analysis: CodebaseAnalysis): string {
    const mapping = this.mapChunkToDomain(chunk, analysis)
    const topConcept = mapping.domainConcepts[0]

    if (!topConcept) {
      return this.generateTechnicalDescription(chunk)
    }

    const context = mapping.businessContext
    let description = ''

    switch (topConcept.type) {
      case 'entity':
        description = `Represents the ${this.humanize(chunk.name)} in the ${context.domain} domain. `
        description += this.describeEntityPurpose(chunk)
        break

      case 'service':
        description = `Provides ${context.capability} capabilities for the ${context.domain} domain. `
        description += this.describeServicePurpose(chunk)
        break

      case 'repository':
        description = `Manages persistence and retrieval of ${this.humanize(chunk.name.replace(/Repository$/, ''))} data. `
        description += 'Acts as a collection-like abstraction over the underlying data store.'
        break

      case 'event':
        description = `Signals that ${this.humanize(chunk.name.replace(/Event$/, ''))} has occurred in the system. `
        description += 'Other parts of the application can react to this event.'
        break

      case 'command':
        description = `Represents an intent to ${this.humanize(chunk.name.replace(/Command$/, ''))}. `
        description += 'This triggers business logic when executed.'
        break

      case 'query':
        description = `Retrieves ${this.humanize(chunk.name.replace(/Query$/, ''))} information from the system. `
        description += 'This is a read-only operation that does not modify state.'
        break

      case 'factory':
        description = `Creates ${this.humanize(chunk.name.replace(/Factory$/, ''))} instances. `
        description += 'Encapsulates complex object creation logic.'
        break

      default:
        description = topConcept.description
    }

    if (context.userStory) {
      description += `\n\n**User Story**: ${context.userStory}`
    }

    return description
  }

  /**
   * Get the role of a module in the system
   */
  getModuleRole(module: ModuleInfo, analysis: CodebaseAnalysis): string {
    const purpose = module.purpose
    const roleDescriptions: Record<ModulePurpose, string> = {
      'ui-component': 'Provides the user interface layer',
      'business-logic': 'Implements core business rules and domain logic',
      'data-access': 'Handles data persistence and retrieval',
      'utility': 'Provides shared utility functions',
      'configuration': 'Manages application settings and configuration',
      'api-client': 'Communicates with external services',
      'state-management': 'Manages application state',
      'routing': 'Controls navigation and URL handling',
      'middleware': 'Processes requests and responses',
      'testing': 'Supports testing and quality assurance',
      'types': 'Defines data structures and contracts',
      'infrastructure': 'Provides technical infrastructure',
      'unknown': 'General purpose module'
    }

    return roleDescriptions[purpose] || 'General purpose module'
  }

  // ─── Private Inference Methods ───────────────────────────────────────────

  private inferDomainName(analysis: CodebaseAnalysis): string {
    const allChunks = analysis.files.flatMap(f => f.chunks)
    const allNames = allChunks.map(c => c.name.toLowerCase())
    const allPaths = analysis.files.map(f => f.relativePath.toLowerCase())
    const combinedText = [...allNames, ...allPaths].join(' ')

    let bestMatch = 'application'
    let bestScore = 0

    for (const [domain, terms] of Object.entries(COMMON_DOMAIN_TERMS)) {
      let score = 0
      for (const entity of terms.entities) {
        if (combinedText.includes(entity)) score += 2
      }
      for (const action of terms.actions) {
        if (combinedText.includes(action)) score += 1
      }
      for (const prop of terms.properties) {
        if (combinedText.includes(prop)) score += 0.5
      }

      if (score > bestScore) {
        bestScore = score
        bestMatch = domain
      }
    }

    return bestScore > 3 ? bestMatch : 'application'
  }

  private inferEntities(analysis: CodebaseAnalysis): DomainEntity[] {
    const entities: DomainEntity[] = []
    const allChunks = analysis.files.flatMap(f => f.chunks)

    // Find classes and interfaces that look like domain entities
    const entityChunks = allChunks.filter(c =>
      (c.type === 'class' || c.type === 'interface') &&
      !this.isUtilityClass(c) &&
      !this.isServiceClass(c) &&
      !this.isRepositoryClass(c)
    )

    for (const chunk of entityChunks) {
      const file = analysis.files.find(f => f.chunks.some(ch => ch.id === chunk.id))
      if (!file) continue

      const attributes = this.extractAttributes(chunk, file)
      const behaviors = this.extractBehaviors(chunk, file)
      const relationships = this.inferRelationships(chunk, allChunks)

      entities.push({
        name: this.humanize(chunk.name),
        technicalName: chunk.name,
        description: chunk.documentation || this.generateEntityDescription(chunk),
        purpose: this.inferEntityPurpose(chunk, relationships),
        attributes,
        behaviors,
        relationships,
        sourceFiles: [file.relativePath],
        sourceChunks: [chunk.id]
      })
    }

    return entities
  }

  private inferServices(analysis: CodebaseAnalysis): DomainService[] {
    const services: DomainService[] = []

    for (const module of analysis.modules) {
      if (module.purpose === 'business-logic' || /service/i.test(module.name)) {
        const file = analysis.files.find(f => f.relativePath.startsWith(module.path))
        if (!file) continue

        const serviceChunks = file.chunks.filter(c =>
          c.type === 'class' || (c.type === 'function' && c.exports)
        )

        for (const chunk of serviceChunks) {
          if (!this.isServiceClass(chunk) && chunk.type === 'class') continue

          const capabilities = this.extractCapabilities(chunk, file)

          services.push({
            name: this.humanize(chunk.name),
            technicalName: chunk.name,
            description: chunk.documentation || this.generateServiceDescription(chunk, capabilities),
            capabilities,
            dependencies: chunk.dependencies.map(d => d.name),
            sourceFiles: [file.relativePath]
          })
        }
      }
    }

    return services
  }

  private inferEvents(analysis: CodebaseAnalysis): DomainEvent[] {
    const events: DomainEvent[] = []
    const allChunks = analysis.files.flatMap(f => f.chunks)

    const eventChunks = allChunks.filter(c =>
      /event|message|notification/i.test(c.name) &&
      (c.type === 'interface' || c.type === 'type' || c.type === 'class')
    )

    for (const chunk of eventChunks) {
      const file = analysis.files.find(f => f.chunks.some(ch => ch.id === chunk.id))
      const handlers = this.findEventHandlers(chunk.name, allChunks)

      events.push({
        name: this.humanize(chunk.name),
        description: chunk.documentation || `Event: ${this.humanize(chunk.name)}`,
        trigger: this.inferEventTrigger(chunk),
        payload: this.extractEventPayload(chunk, file),
        handlers: handlers.map(h => h.name),
        businessSignificance: this.inferEventSignificance(chunk)
      })
    }

    return events
  }

  private inferAggregates(entities: DomainEntity[]): DomainAggregate[] {
    const aggregates: DomainAggregate[] = []

    // Group entities by relationships
    const visited = new Set<string>()

    for (const entity of entities) {
      if (visited.has(entity.technicalName)) continue

      const relatedEntities = new Set<string>([entity.technicalName])
      const queue = [entity]

      while (queue.length > 0) {
        const current = queue.shift()!
        for (const rel of current.relationships) {
          if (rel.type === 'has-one' || rel.type === 'has-many') {
            const related = entities.find(e => e.technicalName === rel.targetEntity)
            if (related && !relatedEntities.has(related.technicalName)) {
              relatedEntities.add(related.technicalName)
              queue.push(related)
            }
          }
        }
      }

      if (relatedEntities.size > 1) {
        aggregates.push({
          name: `${entity.name} Aggregate`,
          rootEntity: entity.technicalName,
          entities: Array.from(relatedEntities),
          description: `Aggregate rooted at ${entity.name} containing related entities`,
          invariants: this.inferInvariants(entity, entities.filter(e => relatedEntities.has(e.technicalName)))
        })

        for (const name of relatedEntities) {
          visited.add(name)
        }
      }
    }

    return aggregates
  }

  private inferWorkflows(
    analysis: CodebaseAnalysis,
    services: DomainService[],
    events: DomainEvent[]
  ): BusinessWorkflow[] {
    const workflows: BusinessWorkflow[] = []

    // Look for patterns that suggest workflows
    const patterns = analysis.patterns.filter(p =>
      p.type === 'middleware' || p.type === 'service-layer'
    )

    for (const pattern of patterns) {
      if (pattern.locations.length > 2) {
        const steps: WorkflowStep[] = pattern.locations.map((loc, i) => ({
          order: i + 1,
          name: `Step ${i + 1}`,
          description: `Process in ${loc.file}`,
          actor: loc.role,
          action: 'process',
          outcome: i < pattern.locations.length - 1 ? 'continue' : 'complete'
        }))

        workflows.push({
          name: `${pattern.name} Workflow`,
          description: pattern.description,
          purpose: 'Business process flow',
          steps,
          participants: pattern.locations.map(l => l.role),
          triggers: ['API request', 'User action'],
          outcomes: ['Success', 'Failure']
        })
      }
    }

    return workflows
  }

  private inferBoundedContexts(modules: ModuleInfo[]): BoundedContext[] {
    const contexts: BoundedContext[] = []

    // Group modules by high-level directory
    const topLevelDirs = new Map<string, ModuleInfo[]>()

    for (const module of modules) {
      const topDir = module.path.split('/')[0] || 'root'
      if (!topLevelDirs.has(topDir)) {
        topLevelDirs.set(topDir, [])
      }
      topLevelDirs.get(topDir)!.push(module)
    }

    for (const [dir, dirModules] of topLevelDirs) {
      if (dirModules.length > 1) {
        const entities = dirModules.flatMap(m => m.exports)
        const services = dirModules
          .filter(m => m.purpose === 'business-logic')
          .flatMap(m => m.exports)
        const externalDeps = [...new Set(dirModules.flatMap(m => m.externalDependencies))]

        contexts.push({
          name: this.humanize(dir),
          description: `Bounded context for ${this.humanize(dir)} functionality`,
          responsibility: this.inferContextResponsibility(dirModules),
          entities,
          services,
          externalDependencies: externalDeps,
          internalModules: dirModules.map(m => m.path)
        })
      }
    }

    return contexts
  }

  private inferChunkConcepts(chunk: ASTChunk, analysis: CodebaseAnalysis): DomainConcept[] {
    const concepts: DomainConcept[] = []

    // Check for entity pattern
    if (this.isEntityLike(chunk)) {
      concepts.push({
        type: 'entity',
        name: chunk.name,
        description: `Domain entity representing ${this.humanize(chunk.name)}`,
        confidence: 0.8
      })
    }

    // Check for service pattern
    if (this.isServiceClass(chunk)) {
      concepts.push({
        type: 'service',
        name: chunk.name,
        description: `Domain service providing ${this.humanize(chunk.name)} capabilities`,
        confidence: 0.85
      })
    }

    // Check for repository pattern
    if (this.isRepositoryClass(chunk)) {
      concepts.push({
        type: 'repository',
        name: chunk.name,
        description: `Repository for ${this.humanize(chunk.name.replace(/Repository$/, ''))} persistence`,
        confidence: 0.9
      })
    }

    // Check for event pattern
    if (/event/i.test(chunk.name)) {
      concepts.push({
        type: 'event',
        name: chunk.name,
        description: `Domain event: ${this.humanize(chunk.name)}`,
        confidence: 0.85
      })
    }

    // Check for command pattern
    if (/command/i.test(chunk.name)) {
      concepts.push({
        type: 'command',
        name: chunk.name,
        description: `Command to ${this.humanize(chunk.name.replace(/Command$/, ''))}`,
        confidence: 0.85
      })
    }

    // Check for query pattern
    if (/query/i.test(chunk.name)) {
      concepts.push({
        type: 'query',
        name: chunk.name,
        description: `Query for ${this.humanize(chunk.name.replace(/Query$/, ''))}`,
        confidence: 0.85
      })
    }

    // Check for factory pattern
    if (/factory/i.test(chunk.name) || /^create/i.test(chunk.name)) {
      concepts.push({
        type: 'factory',
        name: chunk.name,
        description: `Factory for creating ${this.humanize(chunk.name.replace(/Factory$/, ''))}`,
        confidence: 0.8
      })
    }

    return concepts.sort((a, b) => b.confidence - a.confidence)
  }

  private inferBusinessContext(chunk: ASTChunk, analysis: CodebaseAnalysis): BusinessContext {
    const domain = this.inferDomainName(analysis)
    const capability = this.inferCapability(chunk)

    return {
      domain,
      capability,
      userStory: this.generateUserStory(chunk, domain)
    }
  }

  // ─── Helper Methods ──────────────────────────────────────────────────────

  private isUtilityClass(chunk: ASTChunk): boolean {
    return /utils?|helpers?|common|shared/i.test(chunk.name) ||
      /utils?|helpers?|common|shared/i.test(chunk.filePath)
  }

  private isServiceClass(chunk: ASTChunk): boolean {
    return /service|handler|controller|manager|provider/i.test(chunk.name)
  }

  private isRepositoryClass(chunk: ASTChunk): boolean {
    return /repository|repo|store|dao|gateway/i.test(chunk.name)
  }

  private isEntityLike(chunk: ASTChunk): boolean {
    if (chunk.type !== 'class' && chunk.type !== 'interface') return false
    if (this.isUtilityClass(chunk) || this.isServiceClass(chunk) || this.isRepositoryClass(chunk)) {
      return false
    }
    // Has properties/attributes
    return chunk.children.length > 0 || /model|entity|dto|data/i.test(chunk.name)
  }

  private extractAttributes(chunk: ASTChunk, file: FileAnalysis): EntityAttribute[] {
    const attributes: EntityAttribute[] = []

    for (const childId of chunk.children) {
      const child = file.chunks.find(c => c.id === childId)
      if (child && child.type === 'property') {
        attributes.push({
          name: child.name,
          type: child.metadata.returnType ?? 'unknown',
          businessMeaning: this.humanize(child.name),
          required: !child.modifiers.includes('optional')
        })
      }
    }

    return attributes
  }

  private extractBehaviors(chunk: ASTChunk, file: FileAnalysis): EntityBehavior[] {
    const behaviors: EntityBehavior[] = []

    for (const childId of chunk.children) {
      const child = file.chunks.find(c => c.id === childId)
      if (child && child.type === 'method') {
        behaviors.push({
          name: child.name,
          description: child.documentation || this.humanize(child.name)
        })
      }
    }

    return behaviors
  }

  private inferRelationships(chunk: ASTChunk, allChunks: ASTChunk[]): EntityRelationship[] {
    const relationships: EntityRelationship[] = []

    for (const dep of chunk.dependencies) {
      const target = allChunks.find(c => c.name === dep.name)
      if (target && this.isEntityLike(target)) {
        let type: EntityRelationship['type'] = 'depends-on'
        if (dep.type === 'extends') type = 'belongs-to'
        else if (/\[\]|Array|List|Set/i.test(dep.name)) type = 'has-many'
        else type = 'has-one'

        relationships.push({
          type,
          targetEntity: dep.name,
          description: `${chunk.name} ${type} ${dep.name}`
        })
      }
    }

    return relationships
  }

  private extractCapabilities(chunk: ASTChunk, file: FileAnalysis): ServiceCapability[] {
    const capabilities: ServiceCapability[] = []

    for (const childId of chunk.children) {
      const child = file.chunks.find(c => c.id === childId)
      if (child && child.type === 'method' && child.metadata.accessModifier !== 'private') {
        const params = child.metadata.parameters ?? []
        capabilities.push({
          name: child.name,
          description: child.documentation || this.humanize(child.name),
          input: params.map(p => `${p.name}: ${p.type}`).join(', ') || 'none',
          output: child.metadata.returnType ?? 'void',
          businessValue: this.inferBusinessValue(child.name)
        })
      }
    }

    return capabilities
  }

  private findEventHandlers(eventName: string, chunks: ASTChunk[]): ASTChunk[] {
    return chunks.filter(c =>
      c.type === 'method' || c.type === 'function'
    ).filter(c =>
      c.name.toLowerCase().includes(eventName.toLowerCase().replace('event', '')) ||
      c.name.toLowerCase().includes('handle') ||
      c.name.toLowerCase().includes('on')
    )
  }

  private extractEventPayload(chunk: ASTChunk, file?: FileAnalysis): string[] {
    if (!file) return []
    const payload: string[] = []

    for (const childId of chunk.children) {
      const child = file.chunks.find(c => c.id === childId)
      if (child && child.type === 'property') {
        payload.push(`${child.name}: ${child.metadata.returnType ?? 'unknown'}`)
      }
    }

    return payload
  }

  private inferEventTrigger(chunk: ASTChunk): string {
    const name = chunk.name.toLowerCase()
    if (/created|added|inserted/.test(name)) return 'Entity creation'
    if (/updated|changed|modified/.test(name)) return 'Entity modification'
    if (/deleted|removed/.test(name)) return 'Entity deletion'
    if (/clicked|pressed|submitted/.test(name)) return 'User interaction'
    return 'System action'
  }

  private inferEventSignificance(chunk: ASTChunk): string {
    const name = chunk.name.toLowerCase()
    if (/error|failure|failed/.test(name)) return 'Indicates a system failure that may require attention'
    if (/success|completed|finished/.test(name)) return 'Indicates successful completion of an operation'
    if (/started|began|initiated/.test(name)) return 'Marks the beginning of a process'
    return 'Signals a state change in the system'
  }

  private inferInvariants(root: DomainEntity, entities: DomainEntity[]): string[] {
    const invariants: string[] = []

    // Common invariants based on relationships
    for (const rel of root.relationships) {
      if (rel.type === 'has-many') {
        invariants.push(`${root.name} can have zero or more ${rel.targetEntity}`)
      } else if (rel.type === 'has-one') {
        invariants.push(`${root.name} must have exactly one ${rel.targetEntity}`)
      }
    }

    return invariants
  }

  private inferContextResponsibility(modules: ModuleInfo[]): string {
    const purposes = modules.map(m => m.purpose)
    if (purposes.includes('ui-component')) return 'Handles user interface presentation'
    if (purposes.includes('business-logic')) return 'Implements core business logic'
    if (purposes.includes('data-access')) return 'Manages data persistence'
    if (purposes.includes('api-client')) return 'Handles external integrations'
    return 'Provides supporting functionality'
  }

  private inferCapability(chunk: ASTChunk): string {
    const name = chunk.name.toLowerCase()
    if (/auth|login|session/.test(name)) return 'Authentication and authorization'
    if (/user|profile|account/.test(name)) return 'User management'
    if (/data|store|persist/.test(name)) return 'Data persistence'
    if (/api|fetch|http/.test(name)) return 'External communication'
    if (/ui|component|view/.test(name)) return 'User interface'
    if (/validate|check|verify/.test(name)) return 'Validation'
    if (/transform|convert|map/.test(name)) return 'Data transformation'
    return 'General processing'
  }

  private inferBusinessValue(methodName: string): string {
    const name = methodName.toLowerCase()
    if (/get|find|fetch|load/.test(name)) return 'Retrieves information for display or processing'
    if (/create|add|insert/.test(name)) return 'Creates new records or entities'
    if (/update|modify|change/.test(name)) return 'Updates existing data'
    if (/delete|remove/.test(name)) return 'Removes data from the system'
    if (/validate|check|verify/.test(name)) return 'Ensures data integrity'
    if (/process|handle|execute/.test(name)) return 'Performs business operations'
    return 'Supports system operations'
  }

  private inferEntityPurpose(chunk: ASTChunk, relationships: EntityRelationship[]): string {
    const hasChildren = relationships.some(r => r.type === 'has-many' || r.type === 'has-one')
    const hasParent = relationships.some(r => r.type === 'belongs-to')

    if (hasChildren && !hasParent) {
      return 'Core domain entity that aggregates related data'
    } else if (hasParent) {
      return 'Supporting entity that belongs to a larger aggregate'
    } else {
      return 'Independent domain entity'
    }
  }

  private generateEntityDescription(chunk: ASTChunk): string {
    return `Represents ${this.humanize(chunk.name)} data within the system.`
  }

  private generateServiceDescription(chunk: ASTChunk, capabilities: ServiceCapability[]): string {
    const capNames = capabilities.slice(0, 3).map(c => c.name).join(', ')
    return `Service providing ${capNames}${capabilities.length > 3 ? ' and more' : ''} functionality.`
  }

  private generateDomainDescription(domain: string, entities: DomainEntity[], services: DomainService[]): string {
    return `${this.humanize(domain)} domain with ${entities.length} entities and ${services.length} services.`
  }

  private generateTechnicalDescription(chunk: ASTChunk): string {
    return chunk.documentation || `${chunk.type}: ${chunk.name}`
  }

  private describeEntityPurpose(chunk: ASTChunk): string {
    const childCount = chunk.children.length
    if (childCount > 10) {
      return 'This is a rich domain entity with many attributes and behaviors.'
    } else if (childCount > 5) {
      return 'This entity contains core business data and associated operations.'
    } else {
      return 'This is a lightweight entity representing a specific piece of domain data.'
    }
  }

  private describeServicePurpose(chunk: ASTChunk): string {
    const methodCount = chunk.children.length
    if (methodCount > 10) {
      return 'This is a comprehensive service with many operations.'
    } else if (methodCount > 3) {
      return 'This service provides a focused set of business operations.'
    } else {
      return 'This is a specialized service with a narrow responsibility.'
    }
  }

  private generateUserStory(chunk: ASTChunk, domain: string): string | undefined {
    if (chunk.type === 'function' || chunk.type === 'method') {
      const action = this.humanize(chunk.name)
      return `As a user, I want to ${action.toLowerCase()} so that I can accomplish my ${domain} goals.`
    }
    return undefined
  }

  private humanize(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .replace(/^\s+/, '')
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase())
      .trim()
  }
}
