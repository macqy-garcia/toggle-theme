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

  http.get('/api/personal-data', () => {
    return HttpResponse.json({
      fields: [
        { label: 'Name', value: 'Frau Alex Mustermensch' },
        { label: 'Meldeadresse', value: 'Musterstraße 10\n12345 Musterstadt' },
        { label: 'Mobilnummer', value: '+49 151 12345678' },
        { label: 'E-Mail-Adresse', value: 'alex.mustermensch@mail.com' },
        { label: 'Date of birth', value: '22.06.1988\nDarmstadt, Deutschland' },
        { label: 'Country or Nationality', value: 'Deutschland\nKein weiteres Land' },
      ],
    });
  }),
];
