/**
 * AST Chunking Module
 *
 * Provides intelligent code chunking using Abstract Syntax Tree parsing.
 * Unlike simple text chunking, AST chunking preserves semantic boundaries
 * and extracts meaningful code structures for documentation generation.
 */

import ts from 'typescript'
import { readFileSync, existsSync } from 'fs'
import { extname, basename, dirname, join, relative } from 'path'
import { glob } from 'glob'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ASTChunk {
  id: string
  type: ChunkType
  name: string
  filePath: string
  startLine: number
  endLine: number
  code: string
  documentation?: string
  signature?: string
  modifiers: string[]
  dependencies: Dependency[]
  exports: boolean
  parent?: string
  children: string[]
  metadata: ChunkMetadata
}

export type ChunkType =
  | 'class'
  | 'interface'
  | 'type'
  | 'enum'
  | 'function'
  | 'method'
  | 'property'
  | 'variable'
  | 'import'
  | 'export'
  | 'namespace'
  | 'module'

export interface Dependency {
  name: string
  source: string
  type: 'import' | 'reference' | 'extends' | 'implements' | 'uses'
  isExternal: boolean
}

export interface ChunkMetadata {
  complexity: number
  lineCount: number
  parameters?: ParameterInfo[]
  returnType?: string
  decorators?: string[]
  genericTypes?: string[]
  accessModifier?: 'public' | 'private' | 'protected'
}

export interface ParameterInfo {
  name: string
  type: string
  optional: boolean
  defaultValue?: string
}

export interface FileAnalysis {
  filePath: string
  relativePath: string
  chunks: ASTChunk[]
  imports: ImportInfo[]
  exports: ExportInfo[]
  summary: FileSummary
}

export interface ImportInfo {
  source: string
  specifiers: { name: string; alias?: string }[]
  isDefault: boolean
  isNamespace: boolean
  isType: boolean
}

export interface ExportInfo {
  name: string
  type: ChunkType
  isDefault: boolean
  isReExport: boolean
  source?: string
}

export interface FileSummary {
  totalLines: number
  codeLines: number
  commentLines: number
  blankLines: number
  complexity: number
  chunkCount: Record<ChunkType, number>
  mainExports: string[]
  externalDependencies: string[]
}

// ─── AST Chunker Class ─────────────────────────────────────────────────────

export class ASTChunker {
  private printer: ts.Printer

  constructor() {
    this.printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
  }

  /**
   * Analyze a single file and extract all semantic chunks
   */
  async analyzeFile(filePath: string, basePath?: string): Promise<FileAnalysis> {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }

    const ext = extname(filePath).toLowerCase()
    if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
      throw new Error(`Unsupported file type: ${ext}. Only TypeScript/JavaScript files are supported.`)
    }

    const sourceText = readFileSync(filePath, 'utf-8')
    const sourceFile = ts.createSourceFile(
      filePath,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      ext.includes('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    )

    const chunks: ASTChunk[] = []
    const imports: ImportInfo[] = []
    const exports: ExportInfo[] = []

    this.visitNode(sourceFile, sourceFile, chunks, imports, exports, filePath)

    // Build parent-child relationships
    this.buildRelationships(chunks)

    const summary = this.computeSummary(sourceText, chunks, imports)

    return {
      filePath,
      relativePath: basePath ? relative(basePath, filePath) : filePath,
      chunks,
      imports,
      exports,
      summary
    }
  }

  /**
   * Analyze an entire codebase directory
   */
  async analyzeCodebase(
    basePath: string,
    patterns: string[] = ['**/*.ts', '**/*.tsx'],
    ignorePatterns: string[] = ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/build/**']
  ): Promise<FileAnalysis[]> {
    const files: string[] = []

    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        cwd: basePath,
        ignore: ignorePatterns,
        absolute: true
      })
      files.push(...matches)
    }

    const analyses: FileAnalysis[] = []
    for (const file of files) {
      try {
        const analysis = await this.analyzeFile(file, basePath)
        analyses.push(analysis)
      } catch (error) {
        console.warn(`Failed to analyze ${file}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    return analyses
  }

  /**
   * Get chunks of a specific type from multiple file analyses
   */
  getChunksByType(analyses: FileAnalysis[], type: ChunkType): ASTChunk[] {
    return analyses.flatMap(a => a.chunks.filter(c => c.type === type))
  }

  /**
   * Find all dependencies for a given chunk across the codebase
   */
  findDependencies(chunk: ASTChunk, analyses: FileAnalysis[]): ASTChunk[] {
    const deps: ASTChunk[] = []

    for (const dep of chunk.dependencies) {
      for (const analysis of analyses) {
        const found = analysis.chunks.find(c =>
          c.name === dep.name ||
          (c.exports && c.name === dep.name)
        )
        if (found) {
          deps.push(found)
        }
      }
    }

    return deps
  }

  // ─── Private Methods ─────────────────────────────────────────────────────

  private visitNode(
    node: ts.Node,
    sourceFile: ts.SourceFile,
    chunks: ASTChunk[],
    imports: ImportInfo[],
    exports: ExportInfo[],
    filePath: string,
    parentId?: string
  ): void {
    // Handle imports
    if (ts.isImportDeclaration(node)) {
      imports.push(this.parseImport(node, sourceFile))
      return
    }

    // Handle exports
    if (ts.isExportDeclaration(node)) {
      exports.push(...this.parseExportDeclaration(node, sourceFile))
      return
    }

    // Handle class declarations
    if (ts.isClassDeclaration(node)) {
      const chunk = this.parseClass(node, sourceFile, filePath, parentId)
      chunks.push(chunk)

      // Process class members
      node.members.forEach(member => {
        this.visitNode(member, sourceFile, chunks, imports, exports, filePath, chunk.id)
      })
      return
    }

    // Handle interface declarations
    if (ts.isInterfaceDeclaration(node)) {
      chunks.push(this.parseInterface(node, sourceFile, filePath, parentId))
      return
    }

    // Handle type alias declarations
    if (ts.isTypeAliasDeclaration(node)) {
      chunks.push(this.parseTypeAlias(node, sourceFile, filePath, parentId))
      return
    }

    // Handle enum declarations
    if (ts.isEnumDeclaration(node)) {
      chunks.push(this.parseEnum(node, sourceFile, filePath, parentId))
      return
    }

    // Handle function declarations
    if (ts.isFunctionDeclaration(node)) {
      chunks.push(this.parseFunction(node, sourceFile, filePath, parentId))
      return
    }

    // Handle method declarations (inside classes)
    if (ts.isMethodDeclaration(node)) {
      chunks.push(this.parseMethod(node, sourceFile, filePath, parentId))
      return
    }

    // Handle property declarations
    if (ts.isPropertyDeclaration(node)) {
      chunks.push(this.parseProperty(node, sourceFile, filePath, parentId))
      return
    }

    // Handle variable statements (const, let, var)
    if (ts.isVariableStatement(node)) {
      const varChunks = this.parseVariableStatement(node, sourceFile, filePath, parentId)
      chunks.push(...varChunks)
      return
    }

    // Handle module/namespace declarations
    if (ts.isModuleDeclaration(node)) {
      const chunk = this.parseModule(node, sourceFile, filePath, parentId)
      chunks.push(chunk)

      if (node.body && ts.isModuleBlock(node.body)) {
        node.body.statements.forEach(stmt => {
          this.visitNode(stmt, sourceFile, chunks, imports, exports, filePath, chunk.id)
        })
      }
      return
    }

    // Recurse into other nodes
    ts.forEachChild(node, child => {
      this.visitNode(child, sourceFile, chunks, imports, exports, filePath, parentId)
    })
  }

  private parseImport(node: ts.ImportDeclaration, sourceFile: ts.SourceFile): ImportInfo {
    const moduleSpecifier = node.moduleSpecifier
    const source = ts.isStringLiteral(moduleSpecifier) ? moduleSpecifier.text : ''

    const specifiers: { name: string; alias?: string }[] = []
    let isDefault = false
    let isNamespace = false
    let isType = node.importClause?.isTypeOnly ?? false

    if (node.importClause) {
      // Default import
      if (node.importClause.name) {
        isDefault = true
        specifiers.push({ name: node.importClause.name.text })
      }

      // Named imports
      if (node.importClause.namedBindings) {
        if (ts.isNamespaceImport(node.importClause.namedBindings)) {
          isNamespace = true
          specifiers.push({ name: node.importClause.namedBindings.name.text })
        } else if (ts.isNamedImports(node.importClause.namedBindings)) {
          node.importClause.namedBindings.elements.forEach(element => {
            specifiers.push({
              name: element.propertyName?.text ?? element.name.text,
              alias: element.propertyName ? element.name.text : undefined
            })
          })
        }
      }
    }

    return { source, specifiers, isDefault, isNamespace, isType }
  }

  private parseExportDeclaration(node: ts.ExportDeclaration, sourceFile: ts.SourceFile): ExportInfo[] {
    const exports: ExportInfo[] = []
    const source = node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)
      ? node.moduleSpecifier.text
      : undefined

    if (node.exportClause && ts.isNamedExports(node.exportClause)) {
      node.exportClause.elements.forEach(element => {
        exports.push({
          name: element.name.text,
          type: 'export' as ChunkType,
          isDefault: false,
          isReExport: !!source,
          source
        })
      })
    }

    return exports
  }

  private parseClass(
    node: ts.ClassDeclaration,
    sourceFile: ts.SourceFile,
    filePath: string,
    parentId?: string
  ): ASTChunk {
    const name = node.name?.text ?? 'AnonymousClass'
    const id = this.generateId(filePath, 'class', name)
    const { startLine, endLine } = this.getLineNumbers(node, sourceFile)

    const modifiers = this.getModifiers(node)
    const isExported = modifiers.includes('export')

    const dependencies: Dependency[] = []

    // Check for extends
    if (node.heritageClauses) {
      node.heritageClauses.forEach(clause => {
        if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
          clause.types.forEach(type => {
            dependencies.push({
              name: type.expression.getText(sourceFile),
              source: '',
              type: 'extends',
              isExternal: false
            })
          })
        }
        if (clause.token === ts.SyntaxKind.ImplementsKeyword) {
          clause.types.forEach(type => {
            dependencies.push({
              name: type.expression.getText(sourceFile),
              source: '',
              type: 'implements',
              isExternal: false
            })
          })
        }
      })
    }

    // Get decorators
    const decorators = this.getDecorators(node)

    // Get generic types
    const genericTypes = node.typeParameters?.map(tp => tp.name.text)

    return {
      id,
      type: 'class',
      name,
      filePath,
      startLine,
      endLine,
      code: node.getText(sourceFile),
      documentation: this.getJsDoc(node, sourceFile),
      signature: this.getClassSignature(node, sourceFile),
      modifiers,
      dependencies,
      exports: isExported,
      parent: parentId,
      children: [],
      metadata: {
        complexity: this.calculateComplexity(node, sourceFile),
        lineCount: endLine - startLine + 1,
        decorators,
        genericTypes,
        accessModifier: this.getAccessModifier(modifiers)
      }
    }
  }

  private parseInterface(
    node: ts.InterfaceDeclaration,
    sourceFile: ts.SourceFile,
    filePath: string,
    parentId?: string
  ): ASTChunk {
    const name = node.name.text
    const id = this.generateId(filePath, 'interface', name)
    const { startLine, endLine } = this.getLineNumbers(node, sourceFile)

    const modifiers = this.getModifiers(node)
    const isExported = modifiers.includes('export')

    const dependencies: Dependency[] = []

    // Check for extends
    if (node.heritageClauses) {
      node.heritageClauses.forEach(clause => {
        clause.types.forEach(type => {
          dependencies.push({
            name: type.expression.getText(sourceFile),
            source: '',
            type: 'extends',
            isExternal: false
          })
        })
      })
    }

    const genericTypes = node.typeParameters?.map(tp => tp.name.text)

    return {
      id,
      type: 'interface',
      name,
      filePath,
      startLine,
      endLine,
      code: node.getText(sourceFile),
      documentation: this.getJsDoc(node, sourceFile),
      signature: `interface ${name}${genericTypes?.length ? `<${genericTypes.join(', ')}>` : ''}`,
      modifiers,
      dependencies,
      exports: isExported,
      parent: parentId,
      children: [],
      metadata: {
        complexity: 1,
        lineCount: endLine - startLine + 1,
        genericTypes
      }
    }
  }

  private parseTypeAlias(
    node: ts.TypeAliasDeclaration,
    sourceFile: ts.SourceFile,
    filePath: string,
    parentId?: string
  ): ASTChunk {
    const name = node.name.text
    const id = this.generateId(filePath, 'type', name)
    const { startLine, endLine } = this.getLineNumbers(node, sourceFile)

    const modifiers = this.getModifiers(node)
    const isExported = modifiers.includes('export')
    const genericTypes = node.typeParameters?.map(tp => tp.name.text)

    return {
      id,
      type: 'type',
      name,
      filePath,
      startLine,
      endLine,
      code: node.getText(sourceFile),
      documentation: this.getJsDoc(node, sourceFile),
      signature: `type ${name}${genericTypes?.length ? `<${genericTypes.join(', ')}>` : ''} = ...`,
      modifiers,
      dependencies: [],
      exports: isExported,
      parent: parentId,
      children: [],
      metadata: {
        complexity: 1,
        lineCount: endLine - startLine + 1,
        genericTypes
      }
    }
  }

  private parseEnum(
    node: ts.EnumDeclaration,
    sourceFile: ts.SourceFile,
    filePath: string,
    parentId?: string
  ): ASTChunk {
    const name = node.name.text
    const id = this.generateId(filePath, 'enum', name)
    const { startLine, endLine } = this.getLineNumbers(node, sourceFile)

    const modifiers = this.getModifiers(node)
    const isExported = modifiers.includes('export')

    return {
      id,
      type: 'enum',
      name,
      filePath,
      startLine,
      endLine,
      code: node.getText(sourceFile),
      documentation: this.getJsDoc(node, sourceFile),
      signature: `enum ${name}`,
      modifiers,
      dependencies: [],
      exports: isExported,
      parent: parentId,
      children: [],
      metadata: {
        complexity: 1,
        lineCount: endLine - startLine + 1
      }
    }
  }

  private parseFunction(
    node: ts.FunctionDeclaration,
    sourceFile: ts.SourceFile,
    filePath: string,
    parentId?: string
  ): ASTChunk {
    const name = node.name?.text ?? 'anonymousFunction'
    const id = this.generateId(filePath, 'function', name)
    const { startLine, endLine } = this.getLineNumbers(node, sourceFile)

    const modifiers = this.getModifiers(node)
    const isExported = modifiers.includes('export')

    const parameters = this.parseParameters(node.parameters, sourceFile)
    const returnType = node.type ? node.type.getText(sourceFile) : 'void'
    const genericTypes = node.typeParameters?.map(tp => tp.name.text)

    // Find dependencies from function body
    const dependencies = this.findFunctionDependencies(node, sourceFile)

    return {
      id,
      type: 'function',
      name,
      filePath,
      startLine,
      endLine,
      code: node.getText(sourceFile),
      documentation: this.getJsDoc(node, sourceFile),
      signature: this.getFunctionSignature(name, parameters, returnType, genericTypes),
      modifiers,
      dependencies,
      exports: isExported,
      parent: parentId,
      children: [],
      metadata: {
        complexity: this.calculateComplexity(node, sourceFile),
        lineCount: endLine - startLine + 1,
        parameters,
        returnType,
        genericTypes
      }
    }
  }

  private parseMethod(
    node: ts.MethodDeclaration,
    sourceFile: ts.SourceFile,
    filePath: string,
    parentId?: string
  ): ASTChunk {
    const name = node.name.getText(sourceFile)
    const id = this.generateId(filePath, 'method', `${parentId?.split(':').pop() ?? 'unknown'}.${name}`)
    const { startLine, endLine } = this.getLineNumbers(node, sourceFile)

    const modifiers = this.getModifiers(node)
    const decorators = this.getDecorators(node)

    const parameters = this.parseParameters(node.parameters, sourceFile)
    const returnType = node.type ? node.type.getText(sourceFile) : 'void'
    const genericTypes = node.typeParameters?.map(tp => tp.name.text)

    const dependencies = this.findFunctionDependencies(node, sourceFile)

    return {
      id,
      type: 'method',
      name,
      filePath,
      startLine,
      endLine,
      code: node.getText(sourceFile),
      documentation: this.getJsDoc(node, sourceFile),
      signature: this.getFunctionSignature(name, parameters, returnType, genericTypes),
      modifiers,
      dependencies,
      exports: false,
      parent: parentId,
      children: [],
      metadata: {
        complexity: this.calculateComplexity(node, sourceFile),
        lineCount: endLine - startLine + 1,
        parameters,
        returnType,
        decorators,
        genericTypes,
        accessModifier: this.getAccessModifier(modifiers)
      }
    }
  }

  private parseProperty(
    node: ts.PropertyDeclaration,
    sourceFile: ts.SourceFile,
    filePath: string,
    parentId?: string
  ): ASTChunk {
    const name = node.name.getText(sourceFile)
    const id = this.generateId(filePath, 'property', `${parentId?.split(':').pop() ?? 'unknown'}.${name}`)
    const { startLine, endLine } = this.getLineNumbers(node, sourceFile)

    const modifiers = this.getModifiers(node)
    const decorators = this.getDecorators(node)
    const propertyType = node.type ? node.type.getText(sourceFile) : 'unknown'

    return {
      id,
      type: 'property',
      name,
      filePath,
      startLine,
      endLine,
      code: node.getText(sourceFile),
      documentation: this.getJsDoc(node, sourceFile),
      signature: `${name}: ${propertyType}`,
      modifiers,
      dependencies: [],
      exports: false,
      parent: parentId,
      children: [],
      metadata: {
        complexity: 1,
        lineCount: endLine - startLine + 1,
        returnType: propertyType,
        decorators,
        accessModifier: this.getAccessModifier(modifiers)
      }
    }
  }

  private parseVariableStatement(
    node: ts.VariableStatement,
    sourceFile: ts.SourceFile,
    filePath: string,
    parentId?: string
  ): ASTChunk[] {
    const chunks: ASTChunk[] = []
    const modifiers = this.getModifiers(node)
    const isExported = modifiers.includes('export')
    const { startLine, endLine } = this.getLineNumbers(node, sourceFile)

    node.declarationList.declarations.forEach(decl => {
      if (ts.isIdentifier(decl.name)) {
        const name = decl.name.text
        const id = this.generateId(filePath, 'variable', name)
        const varType = decl.type ? decl.type.getText(sourceFile) : 'inferred'

        chunks.push({
          id,
          type: 'variable',
          name,
          filePath,
          startLine,
          endLine,
          code: node.getText(sourceFile),
          documentation: this.getJsDoc(node, sourceFile),
          signature: `${modifiers.includes('const') ? 'const' : modifiers.includes('let') ? 'let' : 'var'} ${name}: ${varType}`,
          modifiers,
          dependencies: [],
          exports: isExported,
          parent: parentId,
          children: [],
          metadata: {
            complexity: 1,
            lineCount: endLine - startLine + 1,
            returnType: varType
          }
        })
      }
    })

    return chunks
  }

  private parseModule(
    node: ts.ModuleDeclaration,
    sourceFile: ts.SourceFile,
    filePath: string,
    parentId?: string
  ): ASTChunk {
    const name = node.name.getText(sourceFile)
    const id = this.generateId(filePath, 'namespace', name)
    const { startLine, endLine } = this.getLineNumbers(node, sourceFile)

    const modifiers = this.getModifiers(node)
    const isExported = modifiers.includes('export')

    return {
      id,
      type: 'namespace',
      name,
      filePath,
      startLine,
      endLine,
      code: node.getText(sourceFile),
      documentation: this.getJsDoc(node, sourceFile),
      signature: `namespace ${name}`,
      modifiers,
      dependencies: [],
      exports: isExported,
      parent: parentId,
      children: [],
      metadata: {
        complexity: 1,
        lineCount: endLine - startLine + 1
      }
    }
  }

  // ─── Helper Methods ──────────────────────────────────────────────────────

  private generateId(filePath: string, type: string, name: string): string {
    const fileName = basename(filePath, extname(filePath))
    return `${fileName}:${type}:${name}`
  }

  private getLineNumbers(node: ts.Node, sourceFile: ts.SourceFile): { startLine: number; endLine: number } {
    const start = sourceFile.getLineAndCharacterOfPosition(node.getStart())
    const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd())
    return { startLine: start.line + 1, endLine: end.line + 1 }
  }

  private getModifiers(node: ts.Node): string[] {
    const modifiers: string[] = []

    if (ts.canHaveModifiers(node)) {
      const nodeModifiers = ts.getModifiers(node)
      if (nodeModifiers) {
        nodeModifiers.forEach(mod => {
          modifiers.push(ts.tokenToString(mod.kind) ?? '')
        })
      }
    }

    return modifiers.filter(Boolean)
  }

  private getDecorators(node: ts.Node): string[] {
    const decorators: string[] = []

    if (ts.canHaveDecorators(node)) {
      const nodeDecorators = ts.getDecorators(node)
      if (nodeDecorators) {
        nodeDecorators.forEach(dec => {
          decorators.push(dec.getText())
        })
      }
    }

    return decorators
  }

  private getAccessModifier(modifiers: string[]): 'public' | 'private' | 'protected' | undefined {
    if (modifiers.includes('private')) return 'private'
    if (modifiers.includes('protected')) return 'protected'
    if (modifiers.includes('public')) return 'public'
    return undefined
  }

  private getJsDoc(node: ts.Node, sourceFile: ts.SourceFile): string | undefined {
    const fullText = sourceFile.getFullText()
    const nodeStart = node.getFullStart()
    const beforeNode = fullText.substring(0, nodeStart)

    // Look for JSDoc comment immediately before the node
    const jsDocMatch = beforeNode.match(/\/\*\*[\s\S]*?\*\/\s*$/)
    if (jsDocMatch) {
      return jsDocMatch[0]
        .replace(/^\/\*\*\s*/, '')
        .replace(/\s*\*\/$/, '')
        .split('\n')
        .map(line => line.replace(/^\s*\*\s?/, '').trim())
        .filter(Boolean)
        .join('\n')
    }

    return undefined
  }

  private getClassSignature(node: ts.ClassDeclaration, sourceFile: ts.SourceFile): string {
    const name = node.name?.text ?? 'AnonymousClass'
    const generics = node.typeParameters
      ? `<${node.typeParameters.map(tp => tp.getText(sourceFile)).join(', ')}>`
      : ''

    let heritage = ''
    if (node.heritageClauses) {
      const parts = node.heritageClauses.map(clause => {
        const keyword = clause.token === ts.SyntaxKind.ExtendsKeyword ? 'extends' : 'implements'
        const types = clause.types.map(t => t.getText(sourceFile)).join(', ')
        return `${keyword} ${types}`
      })
      heritage = ' ' + parts.join(' ')
    }

    return `class ${name}${generics}${heritage}`
  }

  private getFunctionSignature(
    name: string,
    parameters: ParameterInfo[],
    returnType: string,
    genericTypes?: string[]
  ): string {
    const generics = genericTypes?.length ? `<${genericTypes.join(', ')}>` : ''
    const params = parameters
      .map(p => `${p.name}${p.optional ? '?' : ''}: ${p.type}`)
      .join(', ')
    return `${name}${generics}(${params}): ${returnType}`
  }

  private parseParameters(
    params: ts.NodeArray<ts.ParameterDeclaration>,
    sourceFile: ts.SourceFile
  ): ParameterInfo[] {
    return params.map(param => ({
      name: param.name.getText(sourceFile),
      type: param.type ? param.type.getText(sourceFile) : 'any',
      optional: !!param.questionToken,
      defaultValue: param.initializer ? param.initializer.getText(sourceFile) : undefined
    }))
  }

  private findFunctionDependencies(
    node: ts.FunctionDeclaration | ts.MethodDeclaration,
    sourceFile: ts.SourceFile
  ): Dependency[] {
    const dependencies: Dependency[] = []

    const visit = (n: ts.Node) => {
      // Look for call expressions
      if (ts.isCallExpression(n)) {
        const expr = n.expression
        if (ts.isIdentifier(expr)) {
          dependencies.push({
            name: expr.text,
            source: '',
            type: 'uses',
            isExternal: false
          })
        } else if (ts.isPropertyAccessExpression(expr)) {
          dependencies.push({
            name: expr.getText(sourceFile),
            source: '',
            type: 'uses',
            isExternal: false
          })
        }
      }

      ts.forEachChild(n, visit)
    }

    if (node.body) {
      visit(node.body)
    }

    // Deduplicate
    const seen = new Set<string>()
    return dependencies.filter(d => {
      const key = `${d.name}:${d.type}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  private calculateComplexity(node: ts.Node, sourceFile: ts.SourceFile): number {
    let complexity = 1

    const visit = (n: ts.Node) => {
      // Increment for control flow statements
      if (
        ts.isIfStatement(n) ||
        ts.isForStatement(n) ||
        ts.isForInStatement(n) ||
        ts.isForOfStatement(n) ||
        ts.isWhileStatement(n) ||
        ts.isDoStatement(n) ||
        ts.isCaseClause(n) ||
        ts.isConditionalExpression(n) ||
        ts.isCatchClause(n)
      ) {
        complexity++
      }

      // Increment for logical operators
      if (ts.isBinaryExpression(n)) {
        if (
          n.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
          n.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
          n.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
        ) {
          complexity++
        }
      }

      ts.forEachChild(n, visit)
    }

    visit(node)
    return complexity
  }

  private buildRelationships(chunks: ASTChunk[]): void {
    const chunkMap = new Map(chunks.map(c => [c.id, c]))

    for (const chunk of chunks) {
      if (chunk.parent) {
        const parent = chunkMap.get(chunk.parent)
        if (parent) {
          parent.children.push(chunk.id)
        }
      }
    }
  }

  private computeSummary(
    sourceText: string,
    chunks: ASTChunk[],
    imports: ImportInfo[]
  ): FileSummary {
    const lines = sourceText.split('\n')
    let codeLines = 0
    let commentLines = 0
    let blankLines = 0
    let inBlockComment = false

    for (const line of lines) {
      const trimmed = line.trim()

      if (!trimmed) {
        blankLines++
        continue
      }

      if (inBlockComment) {
        commentLines++
        if (trimmed.includes('*/')) {
          inBlockComment = false
        }
        continue
      }

      if (trimmed.startsWith('/*')) {
        commentLines++
        if (!trimmed.includes('*/')) {
          inBlockComment = true
        }
        continue
      }

      if (trimmed.startsWith('//')) {
        commentLines++
        continue
      }

      codeLines++
    }

    const chunkCount: Record<ChunkType, number> = {
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

    for (const chunk of chunks) {
      chunkCount[chunk.type]++
    }

    const mainExports = chunks.filter(c => c.exports && !c.parent).map(c => c.name)
    const externalDependencies = imports
      .filter(i => !i.source.startsWith('.'))
      .map(i => i.source)
      .filter((v, i, a) => a.indexOf(v) === i)

    const totalComplexity = chunks.reduce((sum, c) => sum + c.metadata.complexity, 0)

    return {
      totalLines: lines.length,
      codeLines,
      commentLines,
      blankLines,
      complexity: totalComplexity,
      chunkCount,
      mainExports,
      externalDependencies
    }
  }
}
