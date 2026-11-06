import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://calchub.oleksandrdemcuk72.workers.dev',
  trailingSlash: 'always',
  redirects: {
    '/': '/sv/',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
