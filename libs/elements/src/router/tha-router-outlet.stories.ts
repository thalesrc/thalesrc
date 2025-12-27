import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './tha-router';
import './tha-route';
import './tha-router-link';
import './tha-router-outlet';

const meta: Meta = {
  title: 'Router/Router Outlet',
  component: 'tha-router-outlet',
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

        .outlet-wrapper {
          border: 3px dashed #007bff;
          padding: 1rem;
          border-radius: 8px;
          position: relative;
        }

        .outlet-wrapper::before {
          content: "Router Outlet";
          position: absolute;
          top: -12px;
          left: 10px;
          background: white;
          padding: 0 8px;
          color: #007bff;
          font-size: 0.875rem;
          font-weight: bold;
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

export const BasicOutlet: Story = {
  render: () => html`
    <nav>
      <tha-router-link to="/">Home</tha-router-link>
      <tha-router-link to="/page1">Page 1</tha-router-link>
      <tha-router-link to="/page2">Page 2</tha-router-link>
    </nav>

    <tha-router>
      <tha-route path="/">
        <template>
          <h1>Home</h1>
          <p>The router outlet renders the active route's template content.</p>
        </template>
      </tha-route>

      <tha-route path="/page1">
        <template>
          <h1>Page 1</h1>
          <p>This content is rendered in the outlet below.</p>
        </template>
      </tha-route>

      <tha-route path="/page2">
        <template>
          <h1>Page 2</h1>
          <p>Each route's template is rendered in the outlet.</p>
        </template>
      </tha-route>

      <div class="outlet-wrapper">
        <tha-router-outlet></tha-router-outlet>
      </div>
    </tha-router>
  `,
};

export const OutletPlacement: Story = {
  render: () => html`
    <tha-router id="router-without-inner-outlet">
      <tha-route path="/">
        <template>
          <h1>Top Outlet</h1>
          <p>This content is rendered at the top.</p>
        </template>
      </tha-route>

      <tha-route path="/middle">
        <template>
          <h1>Middle Outlet</h1>
          <p>This content is rendered in the middle.</p>
        </template>
      </tha-route>

      <tha-route path="/bottom">
        <template>
          <h1>Bottom Outlet</h1>
          <p>This content is rendered at the bottom.</p>
        </template>
      </tha-route>
    </tha-router>
    <div style="background: #f0f0f0; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
      <h2>Static Header</h2>
      <nav>
        <tha-router-link to="/">Top</tha-router-link>
        <tha-router-link to="/middle">Middle</tha-router-link>
        <tha-router-link to="/bottom">Bottom</tha-router-link>
      </nav>
    </div>

    <div class="outlet-wrapper">
      <tha-router-outlet for="router-without-inner-outlet"></tha-router-outlet>
    </div>

    <div style="background: #f0f0f0; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
      <h3>Static Footer</h3>
      <p>The outlet can be placed anywhere in the router.</p>
    </div>
  `,
};

export const ConditionalContent: Story = {
  render: () => html`
    <nav>
      <tha-router-link to="/">Empty Route</tha-router-link>
      <tha-router-link to="/with-content">With Content</tha-router-link>
    </nav>

    <tha-router>
      <tha-route path="/">
        <template>
          <!-- Empty template -->
        </template>
      </tha-route>

      <tha-route path="/with-content">
        <template>
          <h1>Content Loaded</h1>
          <p>This route has content in its template.</p>
        </template>
      </tha-route>

      <div class="outlet-wrapper">
        <tha-router-outlet></tha-router-outlet>
      </div>

      <div style="margin-top: 1rem; padding: 1rem; background: #fff3cd; border-radius: 8px;">
        <strong>Note:</strong> When navigating to "Empty Route", the outlet will be empty.
      </div>
    </tha-router>
  `,
};
