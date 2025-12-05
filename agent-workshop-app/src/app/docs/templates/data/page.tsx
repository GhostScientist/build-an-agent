'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { Callout } from '@/components/docs/Callout';

export default function DataTemplatesPage() {
  return (
    <DocsLayout
      title="Data & Analytics Templates"
      description="Templates for data analysis, visualization, and ML workflows."
    >
      <p>
        Data templates are designed for data analysis, visualization, and machine
        learning workflows.
      </p>

      <h2>Data Analysis Agent</h2>
      <p>
        A comprehensive data analysis assistant for statistical analysis and insights.
      </p>

      <h3>Default Tools</h3>
      <ul>
        <li><code>read-file</code> - Read data files</li>
        <li><code>write-file</code> - Create analysis reports</li>
        <li><code>find-files</code> - Locate data sources</li>
        <li><code>database-query</code> - Query databases</li>
        <li><code>run-command</code> - Execute analysis scripts</li>
      </ul>

      <h3>Sample Prompts</h3>
      <ul>
        <li>&quot;Analyze this CSV and identify statistical outliers&quot;</li>
        <li>&quot;Calculate correlation between these variables&quot;</li>
        <li>&quot;Generate summary statistics for the dataset&quot;</li>
        <li>&quot;Find patterns in the customer behavior data&quot;</li>
      </ul>

      <h3>Best For</h3>
      <ul>
        <li>Exploratory data analysis</li>
        <li>Statistical testing</li>
        <li>Data profiling</li>
        <li>Insight generation</li>
      </ul>

      <Callout type="info">
        <p>
          This template enables <code>run-command</code> for executing Python/R
          scripts. Ensure appropriate permission settings.
        </p>
      </Callout>

      <hr className="my-8" />

      <h2>Visualization Agent</h2>
      <p>
        Focused on creating charts, graphs, and interactive dashboards.
      </p>

      <h3>Default Tools</h3>
      <ul>
        <li><code>read-file</code> - Read data</li>
        <li><code>write-file</code> - Create visualization code</li>
        <li><code>find-files</code> - Locate data sources</li>
        <li><code>run-command</code> - Generate visualizations</li>
      </ul>

      <h3>Sample Prompts</h3>
      <ul>
        <li>&quot;Create a bar chart comparing quarterly sales&quot;</li>
        <li>&quot;Generate a dashboard with key metrics&quot;</li>
        <li>&quot;Build an interactive time series visualization&quot;</li>
        <li>&quot;Create a heatmap of user engagement&quot;</li>
      </ul>

      <h3>Best For</h3>
      <ul>
        <li>Chart generation</li>
        <li>Dashboard creation</li>
        <li>Interactive visualizations</li>
        <li>Report graphics</li>
      </ul>

      <hr className="my-8" />

      <h2>ML Pipeline Builder</h2>
      <p>
        Specialized for machine learning workflow development.
      </p>

      <h3>Default Tools</h3>
      <ul>
        <li><code>read-file</code> - Read data and models</li>
        <li><code>write-file</code> - Create pipeline code</li>
        <li><code>find-files</code> - Locate datasets</li>
        <li><code>search-files</code> - Find model definitions</li>
        <li><code>run-command</code> - Execute training and evaluation</li>
      </ul>

      <h3>Sample Prompts</h3>
      <ul>
        <li>&quot;Create a data preprocessing pipeline&quot;</li>
        <li>&quot;Build a classification model for this dataset&quot;</li>
        <li>&quot;Implement cross-validation for the model&quot;</li>
        <li>&quot;Generate feature engineering code&quot;</li>
      </ul>

      <h3>Best For</h3>
      <ul>
        <li>ML pipeline development</li>
        <li>Model training</li>
        <li>Feature engineering</li>
        <li>Model evaluation</li>
      </ul>

      <h2>Comparing Data Templates</h2>

      <table>
        <thead>
          <tr>
            <th>Template</th>
            <th>Database Access</th>
            <th>Command Execution</th>
            <th>Primary Focus</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Data Analysis Agent</strong></td>
            <td>Yes</td>
            <td>Yes</td>
            <td>Statistical analysis</td>
          </tr>
          <tr>
            <td><strong>Visualization Agent</strong></td>
            <td>No</td>
            <td>Yes</td>
            <td>Charts and dashboards</td>
          </tr>
          <tr>
            <td><strong>ML Pipeline Builder</strong></td>
            <td>No</td>
            <td>Yes</td>
            <td>ML workflows</td>
          </tr>
        </tbody>
      </table>

      <Callout type="tip" title="Python environment">
        <p>
          Data templates work best with a configured Python environment. Ensure
          pandas, numpy, matplotlib, and scikit-learn are available for full
          functionality.
        </p>
      </Callout>
    </DocsLayout>
  );
}
