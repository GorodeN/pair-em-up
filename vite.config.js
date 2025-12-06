import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  root: '.',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        silenceDeprecations: ['import'],
      },
    },
  },
});
