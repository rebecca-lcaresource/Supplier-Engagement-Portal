import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Netlify serves the site from the root, so the base is '/'. In-app asset
// links are prefixed with import.meta.env.BASE_URL and resolve correctly.
export default defineConfig({
  base: '/',
  plugins: [react()],
});
