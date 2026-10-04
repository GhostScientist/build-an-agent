import { Agent, run, tool } from '@openai/agents';
import { FileOperations } from './tools/file-operations.js';
import { CommandRunner } from './tools/command-runner.js';
import { WebTools } from './tools/web-tools.js';
import { KnowledgeTools } from './tools/knowledge-tools.js';
import { z } from 'zod';
import { PermissionManager, type PermissionPolicy } from './permissions.js';

export interface ResearcherAgentAgentConfig {
  verbose?: boolean;
  apiKey?: string;
  model?: string;
  permissionManager?: PermissionManager;
  permissions?: PermissionPolicy;
  auditPath?: string;
}

export class ResearcherAgentAgent {
  private config: ResearcherAgentAgentConfig;
  private agent: Agent;
  private permissionManager: PermissionManager;
  private fileOps: FileOperations;
  private commandRunner: CommandRunner;
  private webTools: WebTools;
  private knowledgeTools: KnowledgeTools;

  constructor(config: ResearcherAgentAgentConfig = {}) {
    this.config = config;
    this.permissionManager = config.permissionManager || new PermissionManager({ policy: config.permissions, auditPath: config.auditPath });

    if (!config.apiKey && !process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required. Set it via config.apiKey or OPENAI_API_KEY environment variable.');
    }

    // Set API key in environment for OpenAI SDK
    if (config.apiKey) {
      process.env.OPENAI_API_KEY = config.apiKey;
    }
    this.fileOps = new FileOperations(this.permissionManager);
    this.commandRunner = new CommandRunner(this.permissionManager);
    this.webTools = new WebTools(this.permissionManager);
    this.knowledgeTools = new KnowledgeTools(this.permissionManager);

    // Create OpenAI agent with tools
    this.agent = new Agent({
      name: 'Researcher Agent',
      instructions: this.buildInstructions(),
      tools: this.createTools()
    });
  }

  async *query(userQuery: string, history: Array<{role: string, content: string}> = []) {
    try {
      // Build input: if history provided, pass as array; otherwise just the string
      const input = history.length > 0
        ? [...history, { role: 'user', content: userQuery }]
        : userQuery;

      // Run the OpenAI agent with the input (string or messages array)
      const result = await run(this.agent, input as any);
      const output = result.finalOutput || 'No response generated.';

      // Yield the response as a stream event so CLI displays it
      yield {
        type: 'stream_event',
        event: {
          type: 'content_block_delta',
          delta: {
            type: 'text_delta',
            text: output
          }
        }
      };

      // Also yield as result for programmatic access
      yield {
        type: 'result',
        subtype: 'success',
        result: output
      };
    } catch (error) {
      console.error('OpenAI Agents API error:', error);
      throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createTools(): any[] {
    const tools: any[] = [];
    
    
    // File operations tools
    const readFileTool = tool({
      name: 'read_file',
      description: 'Read contents of a file',
      parameters: z.object({
        filePath: z.string().describe('Path to the file to read')
      }),
      execute: async ({ filePath }: { filePath: string }) => {
        return await this.fileOps.readFile(filePath);
      }
    });
    tools.push(readFileTool);
    
    const writeFileTool = tool({
      name: 'write_file', 
      description: 'Write content to a file',
      parameters: z.object({
        filePath: z.string().describe('Path to the file to write'),
        content: z.string().describe('Content to write to the file')
      }),
      execute: async ({ filePath, content }: { filePath: string; content: string }) => {
        await this.fileOps.writeFile(filePath, content);
        return `File written successfully: ${filePath}`;
      }
    });
    tools.push(writeFileTool);

    const findFilesTool = tool({
      name: 'find_files',
      description: 'Find files matching a pattern',
      parameters: z.object({
        pattern: z.string().describe('Glob pattern to match files')
      }),
      execute: async ({ pattern }: { pattern: string }) => {
        const files = await this.fileOps.findFiles(pattern);
        return files.join(', ');
      }
    });
    tools.push(findFilesTool);
    
    
    // Command execution tool
    const runCommandTool = tool({
      name: 'run_command',
      description: 'Execute a system command',
      parameters: z.object({
        command: z.string().describe('Command to execute')
      }),
      execute: async ({ command }: { command: string }) => {
        const result = await this.commandRunner.execute(command);
        return this.commandRunner.formatResult(result);
      }
    });
    tools.push(runCommandTool);
    
    
    // Web tools
    const fetchUrlTool = tool({
      name: 'fetch_url',
      description: 'Fetch content from a URL',
      parameters: z.object({
        url: z.string().describe('URL to fetch')
      }),
      execute: async ({ url }: { url: string }) => {
        return await this.webTools.fetch(url);
      }
    });
    tools.push(fetchUrlTool);

    const fetchTextTool = tool({
      name: 'fetch_text',
      description: 'Fetch and extract text content from a URL',
      parameters: z.object({
        url: z.string().describe('URL to fetch and extract text from')
      }),
      execute: async ({ url }: { url: string }) => {
        return await this.webTools.fetchText(url);
      }
    });
    tools.push(fetchTextTool);
    
    
    const knowledgeToolsEnabled = new Set(["doc-ingest","table-extract","source-notes","local-rag"]);

    if (knowledgeToolsEnabled.has('doc-ingest')) {
      tools.push(
        tool({
          name: 'doc_ingest',
          description: 'Extract text from documents (pdf, docx, txt)',
          parameters: z.object({
            filePath: z.string(),
            captureSources: z.boolean().default(true)
          }),
          execute: async ({ filePath, captureSources }: { filePath: string; captureSources: boolean }) => {
            const result = await this.knowledgeTools.extractText(filePath, captureSources);
            return result.text;
          }
        })
      );
    }

    if (knowledgeToolsEnabled.has('table-extract')) {
      tools.push(
        tool({
          name: 'table_extract',
          description: 'Extract tables from documents into CSV/JSON',
          parameters: z.object({
            filePath: z.string()
          }),
          execute: async ({ filePath }: { filePath: string }) => {
            const result = await this.knowledgeTools.extractTables(filePath);
            if (result.tables.length === 0) return 'No tables found in document.';
            return result.tables.map((t, i) =>
              `Table ${i + 1} (${t.format}):\n${t.rows.slice(0, 5).map(r => r.join(' | ')).join('\n')}${t.rows.length > 5 ? `\n... and ${t.rows.length - 5} more rows` : ''}`
            ).join('\n\n');
          }
        })
      );
    }

    if (knowledgeToolsEnabled.has('source-notes')) {
      tools.push(
        tool({
          name: 'source_notes',
          description: 'Append a note with source + citation to the local notebook',
          parameters: z.object({
            title: z.string(),
            source: z.string(),
            content: z.string()
          }),
          execute: async ({ title, source, content }: { title: string; source: string; content: string }) => {
            return await this.knowledgeTools.saveNote(title, source, content);
          }
        })
      );
    }

    if (knowledgeToolsEnabled.has('local-rag')) {
      tools.push(
        tool({
          name: 'local_retrieval',
          description: 'Search local notes/corpus for grounded snippets',
          parameters: z.object({
            query: z.string(),
            limit: z.number().default(5)
          }),
          execute: async ({ query, limit }: { query: string; limit: number }) => {
            return await this.knowledgeTools.searchLocal(query, limit);
          }
        })
      );
    }
    
    return tools;
  }

  private buildInstructions(): string {
    return `You are Researcher Agent, a specialized AI assistant for knowledge.

Optimized for knowledge work: structured evidence gathering, citation-safe summaries, and repeatable research workflows. Designed for analysts and scientists who need traceable sources.

## Your Capabilities:
- **Read File**: Read contents of any file in the project
- **Write File**: Create new files with specified content
- **Edit File**: Modify existing files with find-and-replace
- **Find Files**: Search for files using glob patterns
- **Search in Files**: Search for text content across multiple files
- **Run Command**: Execute shell commands and scripts
- **Git Operations**: Git commands for version control
- **Web Search**: Search the web for information
- **Web Fetch**: Fetch and analyze web page content
- **Database Query**: Query SQL databases
- **API Client**: Make HTTP requests to external APIs
- **Document Ingestion**: Extract text from PDFs, DOCX, and text files with source capture
- **Table to CSV**: Extract tables from documents into structured CSV/JSON
- **Source Notebook**: Track sources, citations, and summaries in a local notebook
- **Local Retrieval**: Search local notes/corpus for grounded snippets (no remote calls)

## Instructions:
- Provide helpful, accurate, and actionable assistance
- Use your available tools when appropriate
- Be thorough and explain your reasoning
- Track and cite sources when summarizing. Keep responses grounded in retrieved text.

Always be helpful, accurate, and focused on knowledge tasks. Use the provided tools when needed to accomplish tasks effectively.`;
  }

  // File operation helpers
  async readFile(filePath: string): Promise<string> {
    return this.fileOps.readFile(filePath);
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    return this.fileOps.writeFile(filePath, content);
  }

  async findFiles(pattern: string): Promise<string[]> {
    return this.fileOps.findFiles(pattern);
  }

  // Command execution helpers
  async runCommand(command: string): Promise<void> {
    const result = await this.commandRunner.execute(command);
    console.log(this.commandRunner.formatResult(result));
  }

  // Web tools helpers  
  async searchWeb(query: string): Promise<string[]> {
    return this.webTools.search(query);
  }

  async fetchUrl(url: string): Promise<string> {
    return this.webTools.fetch(url);
  }

  // Knowledge helpers
  async extractDocument(filePath: string): Promise<string> {
    const result = await this.knowledgeTools.extractText(filePath, true);
    return result.text;
  }

  async retrieveLocal(query: string, limit = 5): Promise<string> {
    return this.knowledgeTools.searchLocal(query, limit);
  }
}