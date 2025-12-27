import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './tha-router';
import './tha-route';
import './tha-router-link';
import './tha-router-outlet';

const meta: Meta = {
  title: 'Router/Basic Navigation',
  component: 'tha-router',
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
          font-weight: bold;
        }

        .route-content {
          padding: 2rem;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          min-height: 200px;
        }

        .route-content h1 {
          margin-top: 0;
          color: #333;
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

export const BasicRouting: Story = {
  render: () => html`
    <nav>
      <tha-router-link to="/">Home</tha-router-link>
      <tha-router-link to="/about">About</tha-router-link>
      <tha-router-link to="/contact">Contact</tha-router-link>
    </nav>

    <tha-router>
      <tha-route path="/">
        <template>
          <h1>🏠 Home Page</h1>
          <p>Welcome to the home page!</p>
          <p>Click on the navigation links above to see routing in action.</p>
        </template>
      </tha-route>

      <tha-route path="/about">
        <template>
          <h1>ℹ️ About Page</h1>
          <p>This is the about page.</p>
          <p>Learn more about how this router works!</p>
        </template>
      </tha-route>

      <tha-route path="/contact">
        <template>
          <h1>📧 Contact Page</h1>
          <p>Get in touch with us!</p>
          <p>Email: contact@example.com</p>
        </template>
      </tha-route>

      <tha-router-outlet></tha-router-outlet>
    </tha-router>
  `,
};

export const WithFallback: Story = {
  render: () => html`
    <nav>
      <tha-router-link to="/">Home</tha-router-link>
      <tha-router-link to="/page1">Page 1</tha-router-link>
      <tha-router-link to="/page2">Page 2</tha-router-link>
      <tha-router-link to="/not-found">Invalid Link</tha-router-link>
    </nav>

    <tha-router>
      <tha-route path="/">
        <template>
          <h1>Home</h1>
          <p>This is the home page.</p>
        </template>
      </tha-route>

      <tha-route path="/page1">
        <template>
          <h1>Page 1</h1>
          <p>Content for page 1.</p>
        </template>
      </tha-route>

      <tha-route path="/page2">
        <template>
          <h1>Page 2</h1>
          <p>Content for page 2.</p>
        </template>
      </tha-route>

      <tha-route path="*">
        <template>
          <h1>❌ 404 - Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <tha-router-link to="/">Go back home</tha-router-link>
        </template>
      </tha-route>

      <tha-router-outlet></tha-router-outlet>
    </tha-router>
  `,
};
