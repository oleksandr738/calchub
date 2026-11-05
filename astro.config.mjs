import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://tallora.com',
  trailingSlash: 'always',
  redirects: {
    '/': '/uk/',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
