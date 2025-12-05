'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { Callout } from '@/components/docs/Callout';

export default function ProjectSettingsPage() {
  return (
    <DocsLayout
      title="Project Settings"
      description="Step 6: Configure project metadata and identity."
    >
      <p>
        Configure the metadata for your generated project, including its name,
        version, and licensing information.
      </p>

      <h2>Agent Identity</h2>

      <h3>Agent Name</h3>
      <p>
        The display name for your agent. This appears in the CLI startup message
        and is used throughout the generated code.
      </p>
      <ul>
        <li>Example: &quot;Research Assistant&quot;, &quot;Code Review Bot&quot;, &quot;Data Analyzer&quot;</li>
        <li>Can contain spaces and special characters</li>
      </ul>

      <h3>Description</h3>
      <p>
        A brief description of what your agent does. This is included in the
        generated README and package.json.
      </p>

      <h3>Version</h3>
      <p>
        Semantic version number for your agent. Default: <code>1.0.0</code>
      </p>
      <p>
        Follow <a href="https://semver.org" target="_blank" rel="noopener noreferrer">semantic versioning</a>:
      </p>
      <ul>
        <li><code>MAJOR.MINOR.PATCH</code> (e.g., 1.0.0, 1.2.3, 2.0.0)</li>
        <li>MAJOR - Breaking changes</li>
        <li>MINOR - New features, backward compatible</li>
        <li>PATCH - Bug fixes</li>
      </ul>

      <h2>Project Details</h2>

      <h3>Project Name</h3>
      <p>
        The directory name for your generated project. Must be a valid directory name.
      </p>
      <ul>
        <li>Auto-generated from agent name (lowercase, hyphens)</li>
        <li>Example: &quot;Research Assistant&quot; → &quot;research-assistant&quot;</li>
      </ul>

      <h3>Package Name</h3>
      <p>
        The npm package name. Must follow npm naming conventions.
      </p>
      <ul>
        <li>Lowercase only</li>
        <li>Hyphens allowed, no spaces</li>
        <li>Can be scoped: <code>@myorg/my-agent</code></li>
      </ul>

      <h3>Author</h3>
      <p>
        Your name or organization. Appears in package.json and LICENSE.
      </p>
      <ul>
        <li>Format: &quot;Name&quot; or &quot;Name &lt;email@example.com&gt;&quot;</li>
      </ul>

      <h2>License</h2>
      <p>
        Select a license for your generated project:
      </p>

      <table>
        <thead>
          <tr>
            <th>License</th>
            <th>Description</th>
            <th>Best For</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>MIT</strong></td>
            <td>Permissive, minimal restrictions</td>
            <td>Most projects</td>
          </tr>
          <tr>
            <td><strong>Apache 2.0</strong></td>
            <td>Permissive with patent grant</td>
            <td>Enterprise, commercial use</td>
          </tr>
          <tr>
            <td><strong>GPL 3.0</strong></td>
            <td>Copyleft, derivatives must be open</td>
            <td>Open source advocacy</td>
          </tr>
          <tr>
            <td><strong>BSD 3-Clause</strong></td>
            <td>Permissive, similar to MIT</td>
            <td>Academic, research</td>
          </tr>
          <tr>
            <td><strong>ISC</strong></td>
            <td>Simplified permissive license</td>
            <td>Simple projects</td>
          </tr>
          <tr>
            <td><strong>Proprietary</strong></td>
            <td>All rights reserved</td>
            <td>Internal/private use</td>
          </tr>
        </tbody>
      </table>

      <Callout type="info" title="License selection">
        <p>
          If unsure, <strong>MIT</strong> is a safe default for most open-source projects.
          For commercial or enterprise use, consider <strong>Apache 2.0</strong>.
        </p>
      </Callout>

      <h2>Auto-Generation</h2>
      <p>
        The wizard auto-generates several fields based on your agent name:
      </p>
      <ul>
        <li><strong>Project name</strong> - Derived from agent name</li>
        <li><strong>Package name</strong> - npm-compatible version of project name</li>
        <li><strong>Class name</strong> - PascalCase version for code generation</li>
      </ul>

      <p>
        You can override any auto-generated values if needed.
      </p>
    </DocsLayout>
  );
}
