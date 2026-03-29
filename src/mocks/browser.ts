import { setupWorker } from 'msw/browser';
import { handlers } from './handlers.js';

/**
 * Browser-side MSW worker (used in Storybook and dev).
 * Requires public/mockServiceWorker.js — run `npm run msw:init` to generate it.
 */
export const worker = setupWorker(...handlers);
