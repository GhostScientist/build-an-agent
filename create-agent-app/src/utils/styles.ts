import chalk from 'chalk';

export const styles = {
  // Branding
  brand: chalk.bold.cyan,

  // Status
  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,

  // Text
  dim: chalk.dim,
  bold: chalk.bold,
  highlight: chalk.cyan,

  // Prompts
  question: chalk.bold.white,
  hint: chalk.dim.italic,
  selected: chalk.cyan,

  // Risk levels
  lowRisk: chalk.green,
  mediumRisk: chalk.yellow,
  highRisk: chalk.red,
};

export function printHeader(): void {
  console.log();
  console.log(styles.brand('   ╔═══════════════════════════════════════╗'));
  console.log(styles.brand('   ║') + chalk.bold.white('     Agent Workshop CLI               ') + styles.brand('║'));
  console.log(styles.brand('   ║') + chalk.dim('     Build AI agents with Claude/OpenAI') + styles.brand('║'));
  console.log(styles.brand('   ╚═══════════════════════════════════════╝'));
  console.log();
}

export function printSuccess(projectName: string, provider: string): void {
  console.log();
  console.log(styles.success('   ✨ Success!') + ` Created ${styles.bold(projectName)}`);
  console.log();
  console.log(styles.dim('   Next steps:'));
  console.log();
  console.log(`   ${styles.highlight('cd')} ${projectName}`);
  console.log(`   ${styles.highlight('cp')} .env.example .env`);

  const envVar = provider === 'claude' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';
  console.log(styles.dim(`   # Add your ${envVar} to .env`));

  console.log(`   ${styles.highlight('npm run')} build`);
  console.log(`   ${styles.highlight('npm')} start`);
  console.log();
  console.log(styles.dim('   Want to add MCP servers for extended capabilities?'));
  console.log(styles.dim('   → Visit https://agent-workshop.dev/docs/features/mcp-servers'));
  console.log(styles.dim('   → Or use the web builder at https://agent-workshop.dev'));
  console.log();
}

export function printError(message: string): void {
  console.log();
  console.log(styles.error('   ✖ Error:') + ` ${message}`);
  console.log();
}

export function getRiskLabel(level?: 'low' | 'medium' | 'high'): string {
  switch (level) {
    case 'low':
      return styles.lowRisk('low');
    case 'medium':
      return styles.mediumRisk('medium');
    case 'high':
      return styles.highRisk('high risk');
    default:
      return styles.lowRisk('low');
  }
}
