'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';

export default function CreativeTemplatesPage() {
  return (
    <DocsLayout
      title="Creative Templates"
      description="Templates for content creation and marketing."
    >
      <p>
        Creative templates are designed for content creation, copywriting, and
        marketing workflows.
      </p>

      <h2>Creative Agent</h2>
      <p>
        A general-purpose creative assistant for brainstorming and content ideation.
      </p>

      <h3>Default Tools</h3>
      <ul>
        <li><code>read-file</code> - Read reference materials</li>
        <li><code>write-file</code> - Create content</li>
        <li><code>web-search</code> - Research topics</li>
      </ul>

      <h3>Sample Prompts</h3>
      <ul>
        <li>&quot;Brainstorm 10 tagline ideas for our new product&quot;</li>
        <li>&quot;Create an outline for a thought leadership article&quot;</li>
        <li>&quot;Generate variations of this headline&quot;</li>
        <li>&quot;Write a creative brief for the campaign&quot;</li>
      </ul>

      <h3>Best For</h3>
      <ul>
        <li>Ideation and brainstorming</li>
        <li>Creative briefs</li>
        <li>Content outlines</li>
        <li>Concept development</li>
      </ul>

      <hr className="my-8" />

      <h2>Social Media Manager</h2>
      <p>
        Specialized for social media content planning and creation.
      </p>

      <h3>Default Tools</h3>
      <ul>
        <li><code>read-file</code> - Read brand guidelines</li>
        <li><code>write-file</code> - Create content</li>
        <li><code>web-search</code> - Research trends</li>
        <li><code>web-fetch</code> - Analyze competitor content</li>
      </ul>

      <h3>Sample Prompts</h3>
      <ul>
        <li>&quot;Create a week&apos;s worth of LinkedIn posts&quot;</li>
        <li>&quot;Write Twitter thread ideas for our product launch&quot;</li>
        <li>&quot;Generate Instagram captions for these product photos&quot;</li>
        <li>&quot;Plan a social media calendar for Q1&quot;</li>
      </ul>

      <h3>Best For</h3>
      <ul>
        <li>Social post creation</li>
        <li>Content calendars</li>
        <li>Platform-specific content</li>
        <li>Engagement strategies</li>
      </ul>

      <hr className="my-8" />

      <h2>Blog Writing Agent</h2>
      <p>
        Focused on SEO-optimized blog content creation.
      </p>

      <h3>Default Tools</h3>
      <ul>
        <li><code>read-file</code> - Read research and references</li>
        <li><code>write-file</code> - Create blog posts</li>
        <li><code>web-search</code> - Research topics and keywords</li>
        <li><code>web-fetch</code> - Analyze top-ranking content</li>
      </ul>

      <h3>Sample Prompts</h3>
      <ul>
        <li>&quot;Write a 1500-word blog post on [topic]&quot;</li>
        <li>&quot;Create an SEO-optimized article outline&quot;</li>
        <li>&quot;Research and write about industry trends&quot;</li>
        <li>&quot;Generate meta descriptions for these posts&quot;</li>
      </ul>

      <h3>Best For</h3>
      <ul>
        <li>Blog post writing</li>
        <li>SEO content</li>
        <li>Long-form articles</li>
        <li>Content research</li>
      </ul>

      <hr className="my-8" />

      <h2>Marketing Copywriter</h2>
      <p>
        Specialized for persuasive marketing copy and campaigns.
      </p>

      <h3>Default Tools</h3>
      <ul>
        <li><code>read-file</code> - Read brand materials</li>
        <li><code>write-file</code> - Create copy</li>
        <li><code>web-search</code> - Research competitors</li>
      </ul>

      <h3>Sample Prompts</h3>
      <ul>
        <li>&quot;Write email subject lines for our sale&quot;</li>
        <li>&quot;Create landing page copy for the new feature&quot;</li>
        <li>&quot;Write ad copy variations for A/B testing&quot;</li>
        <li>&quot;Generate product descriptions for the catalog&quot;</li>
      </ul>

      <h3>Best For</h3>
      <ul>
        <li>Ad copy</li>
        <li>Email marketing</li>
        <li>Landing pages</li>
        <li>Product descriptions</li>
      </ul>

      <h2>Comparing Creative Templates</h2>

      <table>
        <thead>
          <tr>
            <th>Template</th>
            <th>Web Research</th>
            <th>Primary Focus</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Creative Agent</strong></td>
            <td>Yes</td>
            <td>Ideation and concepts</td>
          </tr>
          <tr>
            <td><strong>Social Media Manager</strong></td>
            <td>Yes</td>
            <td>Social content</td>
          </tr>
          <tr>
            <td><strong>Blog Writing Agent</strong></td>
            <td>Yes</td>
            <td>Long-form SEO content</td>
          </tr>
          <tr>
            <td><strong>Marketing Copywriter</strong></td>
            <td>Yes</td>
            <td>Persuasive copy</td>
          </tr>
        </tbody>
      </table>
    </DocsLayout>
  );
}
