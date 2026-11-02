import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://calchub.pages.dev',
  trailingSlash: 'always',
  redirects: {
    '/': '/uk/',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
