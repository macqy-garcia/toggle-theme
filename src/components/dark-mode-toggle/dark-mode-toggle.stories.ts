import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../index.js';

const meta: Meta = {
  title: 'Components/DarkModeToggle',
  component: 'dark-mode-toggle',
  tags: ['autodocs'],
  argTypes: {
    dark: {
      control: 'boolean',
      description: 'When true, dark mode is active',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A toggle button that switches the page between light and dark mode. Fires a `dark-mode-change` CustomEvent and sets `data-theme` on `<html>`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const LightMode: Story = {
  name: 'Light mode (default)',
  render: (args) =>
    html`<dark-mode-toggle .dark=${args['dark']}></dark-mode-toggle>`,
  args: { dark: false },
};

export const DarkMode: Story = {
  name: 'Dark mode',
  render: () => html`<dark-mode-toggle dark></dark-mode-toggle>`,
};

export const Interactive: Story = {
  name: 'Interactive (click me)',
  render: () => {
    const onToggle = (e: Event) => {
      const detail = (e as CustomEvent<{ dark: boolean }>).detail;
      console.log('dark-mode-change fired:', detail);
    };
    return html`
      <dark-mode-toggle @dark-mode-change=${onToggle}></dark-mode-toggle>
      <p style="font-size:0.875rem; opacity:0.7;">
        Open the console to see the fired event.
      </p>
    `;
  },
};
