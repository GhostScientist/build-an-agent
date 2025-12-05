/**
 * Agent templates
 */

import type { AgentTemplate, AgentDomain } from '../types/index.js';

export const AGENT_TEMPLATES: AgentTemplate[] = [
  // Business Domain Templates
  {
    id: 'document-processing-agent',
    name: 'Document Processing Agent',
    description: 'Extract, analyze, and transform business documents at scale.',
    domain: 'business',
    icon: 'CogIcon',
    gradient: 'from-emerald-500 to-green-600',
    defaultTools: ['read-file', 'write-file', 'find-files', 'search-files', 'api-client'],
    samplePrompts: [
      'Extract key information from these invoice PDFs',
      'Categorize and tag incoming support tickets',
      'Generate summary reports from meeting transcripts',
      'Parse and validate contracts for compliance',
    ],
    codeTemplates: {},
    documentation:
      'Automates document processing workflows including extraction, classification, summarization, and data validation for business documents.',
  },
  {
    id: 'business-agent',
    name: 'Business Agent',
    description: 'Document analysis, workflow automation, and business process optimization assistant.',
    domain: 'business',
    icon: 'CogIcon',
    gradient: 'from-green-500 to-emerald-600',
    defaultTools: ['read-file', 'write-file', 'find-files', 'search-files', 'web-search', 'api-client'],
    samplePrompts: [
      'Analyze this quarterly report and summarize key metrics',
      'Create a workflow automation for invoice processing',
      'Research market trends for our product category',
      'Draft a business proposal based on the requirements document',
    ],
    codeTemplates: {},
    documentation:
      'Specialized for business workflows, document processing, data analysis, and process automation. Can integrate with business APIs and generate reports.',
  },
  {
    id: 'data-entry-agent',
    name: 'Data Entry Automation Agent',
    description: 'Automate repetitive data entry and form filling tasks.',
    domain: 'business',
    icon: 'CogIcon',
    gradient: 'from-green-600 to-lime-600',
    defaultTools: ['read-file', 'write-file', 'api-client', 'database-query'],
    samplePrompts: [
      'Transfer data from spreadsheets to CRM system',
      'Populate form fields from structured data',
      'Validate and clean customer data entries',
      'Sync data between multiple business systems',
    ],
    codeTemplates: {},
    documentation:
      'Streamlines data entry workflows, validates data quality, and automates synchronization between business systems.',
  },
  {
    id: 'report-generation-agent',
    name: 'Business Report Generator',
    description: 'Create professional business reports, dashboards, and presentations.',
    domain: 'business',
    icon: 'CogIcon',
    gradient: 'from-lime-500 to-green-700',
    defaultTools: ['read-file', 'write-file', 'find-files', 'web-search', 'api-client'],
    samplePrompts: [
      'Generate monthly sales performance report',
      'Create executive dashboard from KPI data',
      'Build quarterly financial analysis presentation',
      'Compile competitive intelligence report',
    ],
    codeTemplates: {},
    documentation:
      'Generates polished business reports, presentations, and dashboards from raw data with visualizations and insights.',
  },

  // Creative Domain Templates
  {
    id: 'social-media-agent',
    name: 'Social Media Manager Agent',
    description: 'Plan, create, and schedule social media content across platforms.',
    domain: 'creative',
    icon: 'RocketLaunchIcon',
    gradient: 'from-pink-500 to-rose-600',
    defaultTools: ['read-file', 'write-file', 'web-search', 'web-fetch', 'api-client'],
    samplePrompts: [
      'Create a week of engaging LinkedIn posts',
      'Generate Twitter thread about our product launch',
      'Design Instagram caption variations with hashtags',
      'Plan content calendar based on trending topics',
    ],
    codeTemplates: {},
    documentation:
      'Specialized in social media content creation, trend analysis, hashtag research, and multi-platform content adaptation.',
  },
  {
    id: 'creative-agent',
    name: 'Creative Agent',
    description: 'Content creation, marketing copy, social media, and creative writing assistance.',
    domain: 'creative',
    icon: 'RocketLaunchIcon',
    gradient: 'from-purple-500 to-pink-600',
    defaultTools: ['read-file', 'write-file', 'find-files', 'web-search', 'web-fetch'],
    samplePrompts: [
      'Write engaging social media posts for our product launch',
      'Create SEO-optimized blog content on industry trends',
      'Generate creative copy for email marketing campaigns',
      'Develop a content calendar for the next quarter',
    ],
    codeTemplates: {},
    documentation:
      'Focused on content creation, copywriting, social media management, and creative projects. Includes web research capabilities for trend analysis.',
  },
  {
    id: 'blog-writing-agent',
    name: 'SEO Blog Writing Agent',
    description: 'Research and write SEO-optimized blog posts and articles.',
    domain: 'creative',
    icon: 'RocketLaunchIcon',
    gradient: 'from-purple-600 to-indigo-600',
    defaultTools: ['read-file', 'write-file', 'web-search', 'web-fetch'],
    samplePrompts: [
      'Write a 2000-word SEO article on cloud security',
      'Research and create a how-to guide with examples',
      'Optimize existing content for search engines',
      'Generate topic ideas based on keyword research',
    ],
    codeTemplates: {},
    documentation:
      'Expert at researching topics, writing engaging long-form content, and optimizing for search engines with proper keyword usage.',
  },
  {
    id: 'marketing-copy-agent',
    name: 'Marketing Copywriter Agent',
    description: 'Create compelling marketing copy for ads, emails, and landing pages.',
    domain: 'creative',
    icon: 'RocketLaunchIcon',
    gradient: 'from-rose-500 to-pink-700',
    defaultTools: ['read-file', 'write-file', 'web-search'],
    samplePrompts: [
      'Write conversion-focused landing page copy',
      'Create email drip campaign sequence',
      'Generate PPC ad variations for A/B testing',
      'Craft compelling product descriptions',
    ],
    codeTemplates: {},
    documentation:
      'Specializes in persuasive copywriting, conversion optimization, and creating marketing materials that drive action.',
  },

  // Knowledge Domain Templates
  {
    id: 'research-ops-agent',
    name: 'Research Ops Agent',
    description:
      'Synthesize literature, capture sources, and turn notes into structured briefs with citations.',
    domain: 'knowledge',
    icon: 'ChartBarIcon',
    gradient: 'from-amber-500 to-orange-600',
    defaultTools: [
      'read-file',
      'find-files',
      'search-files',
      'web-search',
      'web-fetch',
      'api-client',
      'doc-ingest',
      'table-extract',
      'source-notes',
      'local-rag',
    ],
    samplePrompts: [
      'Perform a rapid literature review on LLM evaluation methods and summarize gaps',
      'Extract key claims and citations from these PDFs and produce an annotated bibliography',
      'Track new papers on retrieval-augmented generation and send me weekly digests',
      'Generate a competitive brief comparing top vector databases with sources',
    ],
    codeTemplates: {},
    documentation:
      'Optimized for knowledge work: structured evidence gathering, citation-safe summaries, and repeatable research workflows. Designed for analysts and scientists who need traceable sources.',
  },

  // Development Domain Templates
  {
    id: 'development-agent',
    name: 'Development Agent',
    description:
      'Full-stack development assistant with file operations, build tools, and code analysis capabilities.',
    domain: 'development',
    icon: 'CodeBracketIcon',
    gradient: 'from-blue-500 to-cyan-600',
    defaultTools: [
      'read-file',
      'write-file',
      'edit-file',
      'find-files',
      'search-files',
      'run-command',
      'git-operations',
    ],
    samplePrompts: [
      'Create a new React component with TypeScript',
      'Fix the build error in the authentication module',
      'Add unit tests for the user service',
      'Refactor the database queries for better performance',
    ],
    codeTemplates: {},
    documentation:
      'A comprehensive development assistant that can read, write, and modify code files, execute build commands, manage git repositories, and help with debugging and optimization.',
  },
  {
    id: 'code-review-agent',
    name: 'Code Review & Quality Agent',
    description: 'Automated code review assistant focused on quality, security, and best practices.',
    domain: 'development',
    icon: 'CodeBracketIcon',
    gradient: 'from-cyan-500 to-teal-600',
    defaultTools: ['read-file', 'find-files', 'search-files', 'git-operations'],
    samplePrompts: [
      'Review this pull request for security issues',
      'Check code quality and suggest improvements',
      'Identify potential performance bottlenecks',
      'Ensure code follows team style guidelines',
    ],
    codeTemplates: {},
    documentation:
      'Performs thorough code reviews, checks for security vulnerabilities, style violations, and suggests improvements based on best practices.',
  },
  {
    id: 'testing-agent',
    name: 'Test Generation Agent',
    description: 'Automated test creation for unit, integration, and E2E testing.',
    domain: 'development',
    icon: 'CodeBracketIcon',
    gradient: 'from-blue-600 to-indigo-700',
    defaultTools: ['read-file', 'write-file', 'find-files', 'search-files', 'run-command'],
    samplePrompts: [
      'Generate unit tests for this React component',
      'Create integration tests for the API endpoints',
      'Write E2E tests using Playwright',
      'Add test coverage for edge cases',
    ],
    codeTemplates: {},
    documentation:
      'Specializes in generating comprehensive test suites, improving test coverage, and ensuring code reliability through automated testing.',
  },

  // Data Domain Templates
  {
    id: 'data-analysis-agent',
    name: 'Data Analysis Agent',
    description: 'Analyze datasets, generate insights, and create visualizations.',
    domain: 'data',
    icon: 'CodeBracketIcon',
    gradient: 'from-orange-500 to-red-600',
    defaultTools: ['read-file', 'write-file', 'database-query', 'api-client'],
    samplePrompts: [
      'Analyze this CSV and identify key trends',
      'Create statistical summary of sales data',
      'Find correlations in customer behavior data',
      'Generate data quality report',
    ],
    codeTemplates: {},
    documentation:
      'Expert at statistical analysis, data exploration, pattern recognition, and generating actionable insights from structured data.',
  },
  {
    id: 'visualization-agent',
    name: 'Data Visualization Agent',
    description: 'Create charts, graphs, and interactive dashboards from data.',
    domain: 'data',
    icon: 'CodeBracketIcon',
    gradient: 'from-red-500 to-orange-600',
    defaultTools: ['read-file', 'write-file', 'database-query'],
    samplePrompts: [
      'Create interactive dashboard from sales data',
      'Generate comparison charts for quarterly metrics',
      'Build geographic heat map from location data',
      'Design time-series visualization of trends',
    ],
    codeTemplates: {},
    documentation:
      'Specializes in creating compelling data visualizations, interactive charts, and dashboards using modern visualization libraries.',
  },
  {
    id: 'ml-pipeline-agent',
    name: 'ML Pipeline Builder Agent',
    description: 'Build and optimize machine learning data pipelines.',
    domain: 'data',
    icon: 'CodeBracketIcon',
    gradient: 'from-yellow-500 to-orange-700',
    defaultTools: ['read-file', 'write-file', 'run-command', 'database-query'],
    samplePrompts: [
      'Create data preprocessing pipeline for ML model',
      'Build feature engineering workflow',
      'Set up model training and evaluation pipeline',
      'Implement data validation and monitoring',
    ],
    codeTemplates: {},
    documentation:
      'Expert at building ML data pipelines, feature engineering, model training workflows, and implementing MLOps best practices.',
  },
];

/**
 * Get templates for a specific domain
 */
export function getTemplatesForDomain(domain: AgentDomain): AgentTemplate[] {
  return AGENT_TEMPLATES.filter((t) => t.domain === domain);
}

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): AgentTemplate | undefined {
  return AGENT_TEMPLATES.find((t) => t.id === id);
}
