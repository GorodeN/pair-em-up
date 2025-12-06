import { defineConfig } from 'vite';

export default defineConfig({
  base: '/pair-em-up/',
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
