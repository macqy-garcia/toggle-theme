import { initialize, mswLoader } from 'msw-storybook-addon';
import { handlers } from '../src/mocks/handlers.js';

// Initialize MSW — must run before any story renders
initialize({ onUnhandledRequest: 'bypass' });

const preview = {
  loaders: [mswLoader],
  parameters: {
    msw: {
      handlers,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
