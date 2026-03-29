import { setupServer } from 'msw/node';
import { handlers } from './handlers.js';

/**
 * Node-side MSW server (used in @web/test-runner tests).
 * No service worker needed — uses HTTP interceptors.
 */
export const server = setupServer(...handlers);
