import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './tha-router';
import './tha-route';
import './tha-router-link';
import './tha-router-outlet';

const meta: Meta = {
  title: 'Router/Routes',
  component: 'tha-route',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (story) => html`
      <style>
        .storybook-router-container {
          padding: 20px;
          font-family: system-ui, -apple-system, sans-serif;
        }

        nav {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: #f0f0f0;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        tha-router-link {
          padding: 0.5rem 1rem;
          background: white;
          border-radius: 4px;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
        }

        tha-router-link:hover {
          background: #e0e0e0;
        }

        tha-router-link[active] {
          background: #007bff;
          color: white;
        }

        .route-content {
          padding: 2rem;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
        }

        .user-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .user-card h2 {
          margin: 0 0 0.5rem 0;
        }
      </style>
      <div class="storybook-router-container">
        ${story()}
      </div>
    `,
  ],
};

export default meta;

type Story = StoryObj;

export const StaticRoutes: Story = {
  render: () => html`
    <nav>
      <tha-router-link to="/">Dashboard</tha-router-link>
      <tha-router-link to="/users">Users</tha-router-link>
      <tha-router-link to="/settings">Settings</tha-router-link>
      <tha-router-link to="/help">Help</tha-router-link>
    </nav>

    <tha-router>
      <tha-route path="/">
        <template>
          <h1>📊 Dashboard</h1>
          <p>Welcome to your dashboard.</p>
        </template>
      </tha-route>

      <tha-route path="/users">
        <template>
          <h1>👥 Users</h1>
          <p>Manage your users here.</p>
        </template>
      </tha-route>

      <tha-route path="/settings">
        <template>
          <h1>⚙️ Settings</h1>
          <p>Configure your application settings.</p>
        </template>
      </tha-route>

      <tha-route path="/help">
        <template>
          <h1>❓ Help</h1>
          <p>Get help with using the application.</p>
        </template>
      </tha-route>

      <tha-router-outlet></tha-router-outlet>
    </tha-router>
  `,
};

export const TemplateContent: Story = {
  render: () => html`
    <nav>
      <tha-router-link to="/">Simple Text</tha-router-link>
      <tha-router-link to="/html">Rich HTML</tha-router-link>
      <tha-router-link to="/components">Web Components</tha-router-link>
    </nav>

    <tha-router>
      <tha-route path="/">
        <template>
          <h1>Simple Text Content</h1>
          <p>This template contains simple text and HTML elements.</p>
        </template>
      </tha-route>

      <tha-route path="/html">
        <template>
          <h1>Rich HTML Content</h1>
          <ul>
            <li>Lists</li>
            <li>Tables</li>
            <li>Forms</li>
          </ul>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px;">Feature</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Status</th>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">Routing</td>
              <td style="border: 1px solid #ddd; padding: 8px;">✅ Working</td>
            </tr>
          </table>
        </template>
      </tha-route>

      <tha-route path="/components">
        <template>
          <h1>Web Components</h1>
          <p>Templates can contain any web components!</p>
          <details>
            <summary>Click to expand</summary>
            <p>This is a native HTML details element.</p>
          </details>
        </template>
      </tha-route>

      <tha-router-outlet></tha-router-outlet>
    </tha-router>
  `,
};
