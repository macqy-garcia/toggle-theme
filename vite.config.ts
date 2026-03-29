import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      // Externalize lit so consuming apps don't bundle it twice
      external: ['lit', /^lit\//],
    },
  },
});
