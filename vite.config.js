import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Netlify serves the site from the root, so base is '/'. In-app asset links
// use absolute '/assets/...' paths. (The GitHub Pages subpath handling that
// once required import.meta.env.BASE_URL was removed in v3.0 — Pages is retired.)
export default defineConfig({
  base: '/',
  plugins: [react()],
});
