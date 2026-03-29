import { http, HttpResponse } from 'msw';

/**
 * Shared MSW request handlers.
 * Add your API mocks here — they are used in both
 * the browser (Storybook) and Node (test) environments.
 */
export const handlers = [
  http.get('/api/theme', () => {
    return HttpResponse.json({ theme: 'light' });
  }),
];
