import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { http, HttpResponse, delay } from 'msw';
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
  title: 'Components/DataReviewModal',
  component: 'data-review-modal',
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'When true, the modal is visible and triggers a fetch to GET /api/personal-data',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Data review modal that fetches personal data from `GET /api/personal-data` each time it opens. ' +
          'Fires `modal-close`, `modal-confirm`, and `modal-adjust` CustomEvents. ' +
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
    withBackdrop(html`<data-review-modal .open=${args['open']}></data-review-modal>`),
  args: { open: true },
};

export const DarkMode: Story = {
  name: 'Dark mode',
  decorators: [withTheme('dark')],
  render: (args) =>
    withBackdrop(html`<data-review-modal .open=${args['open']}></data-review-modal>`),
  args: { open: true },
};

export const Closed: Story = {
  name: 'Closed',
  decorators: [withTheme('light')],
  render: () => html`
    <p style="padding: 24px; font-family: sans-serif; opacity: 0.6;">
      Modal is closed — toggle <code>open</code> in the Controls panel to show it.
    </p>
    <data-review-modal></data-review-modal>
  `,
  args: { open: false },
};

export const Loading: Story = {
  name: 'Loading state',
  decorators: [withTheme('light')],
  parameters: {
    msw: {
      handlers: [
        http.get('/api/personal-data', async () => {
          await delay('infinite');
          return HttpResponse.json({ fields: [] });
        }),
      ],
    },
  },
  render: () => withBackdrop(html`<data-review-modal open></data-review-modal>`),
};

export const Error: Story = {
  name: 'Error state',
  decorators: [withTheme('light')],
  parameters: {
    msw: {
      handlers: [
        http.get('/api/personal-data', () => {
          return HttpResponse.error();
        }),
      ],
    },
  },
  render: () => withBackdrop(html`<data-review-modal open></data-review-modal>`),
};

export const Interactive: Story = {
  name: 'Interactive (open console)',
  render: () => {
    const onClose = () => console.log('modal-close fired');
    const onConfirm = () => console.log('modal-confirm fired');
    const onAdjust = () => console.log('modal-adjust fired');
    return withBackdrop(html`
      <data-review-modal
        open
        @modal-close=${onClose}
        @modal-confirm=${onConfirm}
        @modal-adjust=${onAdjust}
      ></data-review-modal>
    `);
  },
};
