'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Callout } from '@/components/docs/Callout';

export default function IntegrationsPage() {
  return (
    <DocsLayout
      title="Integration Patterns"
      description="Patterns for integrating generated agents with other systems."
    >
      <p>
        Generated agents can be integrated into various environments beyond the
        default CLI. This reference covers common integration patterns.
      </p>

      <h2>Interface Types</h2>
      <p>
        Agent Workshop supports multiple interface types:
      </p>

      <table>
        <thead>
          <tr>
            <th>Interface</th>
            <th>Status</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>CLI</strong></td>
            <td>Full Support</td>
            <td>Interactive command-line interface</td>
          </tr>
          <tr>
            <td><strong>Web</strong></td>
            <td>Scaffolding</td>
            <td>Web-based chat interface</td>
          </tr>
          <tr>
            <td><strong>API</strong></td>
            <td>Scaffolding</td>
            <td>REST API endpoint</td>
          </tr>
          <tr>
            <td><strong>Discord</strong></td>
            <td>Scaffolding</td>
            <td>Discord bot</td>
          </tr>
          <tr>
            <td><strong>Slack</strong></td>
            <td>Scaffolding</td>
            <td>Slack bot</td>
          </tr>
        </tbody>
      </table>

      <Callout type="info">
        <p>
          Scaffolding interfaces provide a starting structure but require
          additional configuration and deployment setup.
        </p>
      </Callout>

      <h2>Programmatic Usage</h2>
      <p>
        Import and use the agent directly in your code:
      </p>

      <CodeBlock
        language="typescript"
        code={`import { MyAgent } from './src/agent';

// Create agent instance
const agent = new MyAgent({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-sonnet-4-5-20250929'
});

// Send a query
const response = await agent.query('Analyze the codebase structure');

// Handle streaming response
for await (const chunk of agent.stream('Explain this file')) {
  process.stdout.write(chunk);
}`}
      />

      <h2>Express API Integration</h2>
      <p>
        Wrap your agent in an Express API:
      </p>

      <CodeBlock
        language="typescript"
        filename="src/api.ts"
        code={`import express from 'express';
import { MyAgent } from './agent';

const app = express();
app.use(express.json());

const agent = new MyAgent({
  apiKey: process.env.ANTHROPIC_API_KEY
});

app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  try {
    const response = await agent.query(message, { sessionId });
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chat/stream', async (req, res) => {
  const { message, sessionId } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  for await (const chunk of agent.stream(message, { sessionId })) {
    res.write(\`data: \${JSON.stringify({ chunk })}\\n\\n\`);
  }

  res.write('data: [DONE]\\n\\n');
  res.end();
});

app.listen(3000);`}
      />

      <h2>Discord Bot Integration</h2>
      <p>
        Create a Discord bot with your agent:
      </p>

      <CodeBlock
        language="typescript"
        filename="src/discord-bot.ts"
        code={`import { Client, GatewayIntentBits } from 'discord.js';
import { MyAgent } from './agent';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const agent = new MyAgent({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Store sessions per channel
const sessions = new Map<string, string>();

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!agent')) return;

  const query = message.content.slice(7).trim();
  const sessionId = sessions.get(message.channelId) || message.channelId;

  try {
    await message.channel.sendTyping();

    const response = await agent.query(query, { sessionId });

    // Discord has a 2000 character limit
    if (response.length > 2000) {
      const chunks = response.match(/.{1,2000}/g) || [];
      for (const chunk of chunks) {
        await message.reply(chunk);
      }
    } else {
      await message.reply(response);
    }
  } catch (error) {
    await message.reply('Sorry, I encountered an error.');
  }
});

client.login(process.env.DISCORD_TOKEN);`}
      />

      <h2>Slack Bot Integration</h2>
      <p>
        Create a Slack bot using Bolt:
      </p>

      <CodeBlock
        language="typescript"
        filename="src/slack-bot.ts"
        code={`import { App } from '@slack/bolt';
import { MyAgent } from './agent';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

const agent = new MyAgent({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Respond to mentions
app.event('app_mention', async ({ event, say }) => {
  const query = event.text.replace(/<@[^>]+>/g, '').trim();

  try {
    const response = await agent.query(query, {
      sessionId: event.channel
    });

    await say({
      text: response,
      thread_ts: event.thread_ts || event.ts
    });
  } catch (error) {
    await say('Sorry, I encountered an error.');
  }
});

// Respond to slash commands
app.command('/agent', async ({ command, ack, respond }) => {
  await ack();

  const response = await agent.query(command.text, {
    sessionId: command.channel_id
  });

  await respond(response);
});

app.start(process.env.PORT || 3000);`}
      />

      <h2>Webhook Integration</h2>
      <p>
        Trigger agent actions via webhooks:
      </p>

      <CodeBlock
        language="typescript"
        code={`import express from 'express';
import { MyAgent } from './agent';

const app = express();
app.use(express.json());

const agent = new MyAgent({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// GitHub webhook handler
app.post('/webhook/github', async (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;

  if (event === 'pull_request' && payload.action === 'opened') {
    const prNumber = payload.number;
    const prTitle = payload.pull_request.title;

    const response = await agent.query(
      \`Review PR #\${prNumber}: \${prTitle}\`
    );

    // Post review as comment (implement as needed)
    console.log('Review:', response);
  }

  res.status(200).send('OK');
});`}
      />

      <h2>CI/CD Integration</h2>
      <p>
        Run agent as part of CI/CD pipeline:
      </p>

      <CodeBlock
        language="yaml"
        filename=".github/workflows/agent-review.yml"
        code={`name: Agent Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install agent
        run: |
          cd my-agent
          npm install
          npm run build

      - name: Run review
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          cd my-agent
          node dist/cli.js --query "Review the changes in this PR"`}
      />

      <h2>Best Practices</h2>

      <h3>Session Management</h3>
      <p>
        Use session IDs to maintain conversation context:
      </p>
      <ul>
        <li>Generate unique session IDs per user/channel</li>
        <li>Store session state for continuity</li>
        <li>Clean up old sessions periodically</li>
      </ul>

      <h3>Error Handling</h3>
      <p>
        Always handle errors gracefully:
      </p>
      <ul>
        <li>Catch and log exceptions</li>
        <li>Return user-friendly error messages</li>
        <li>Implement retry logic for transient failures</li>
      </ul>

      <h3>Rate Limiting</h3>
      <p>
        Protect against abuse:
      </p>
      <ul>
        <li>Implement per-user rate limits</li>
        <li>Queue requests during high load</li>
        <li>Monitor API usage and costs</li>
      </ul>
    </DocsLayout>
  );
}
