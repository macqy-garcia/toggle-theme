import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '../../index.js';

/** Wraps a modal in a centred backdrop and includes a theme toggle in the corner. */
const withBackdrop = (slot: ReturnType<typeof html>) => html`
  <div
    style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.4);
      padding: 24px;
      position: relative;
    "
  >
    <div style="position: absolute; top: 16px; right: 16px;">
      <dark-mode-toggle></dark-mode-toggle>
    </div>
    ${slot}
  </div>
`;

/** Story-level decorator that sets data-theme on <html> before rendering. */
const withTheme =
  (theme: 'light' | 'dark') =>
  (story: () => ReturnType<typeof html>) => {
    document.documentElement.setAttribute('data-theme', theme);
    return story();
  };

const meta: Meta = {
  title: 'Components/DataIntroModal',
  component: 'data-intro-modal',
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'When true, the modal is visible',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Intro modal prompting the user to begin the personal data collection flow. ' +
          'Fires a `modal-close` CustomEvent on close and `modal-next` CustomEvent on Next. ' +
          'Theme follows the `data-theme` attribute on `<html>` set by `<dark-mode-toggle>`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const LightMode: Story = {
  name: 'Light mode',
  decorators: [withTheme('light')],
  render: (args) =>
    withBackdrop(
      html`<data-intro-modal .open=${args['open']}></data-intro-modal>`
    ),
  args: { open: true },
};

export const DarkMode: Story = {
  name: 'Dark mode',
  decorators: [withTheme('dark')],
  render: (args) =>
    withBackdrop(
      html`<data-intro-modal .open=${args['open']}></data-intro-modal>`
    ),
  args: { open: true },
};

export const Closed: Story = {
  name: 'Closed',
  decorators: [withTheme('light')],
  render: () => html`
    <p style="padding: 24px; font-family: sans-serif; opacity: 0.6;">
      Modal is closed — toggle <code>open</code> in the Controls panel to show it.
    </p>
    <data-intro-modal></data-intro-modal>
  `,
  args: { open: false },
};

export const Interactive: Story = {
  name: 'Interactive (open console)',
  render: () => {
    const onClose = () => console.log('modal-close fired');
    const onNext = () => console.log('modal-next fired');
    return withBackdrop(html`
      <data-intro-modal
        open
        @modal-close=${onClose}
        @modal-next=${onNext}
      ></data-intro-modal>
    `);
  },
};
