import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base defaults to '/' (Netlify serves from the site root). The GitHub Pages
// build sets VITE_BASE to '/Supplier-Engagement-Portal/' since Pages serves a
// project repo from a subpath. All in-app asset links are prefixed with
// import.meta.env.BASE_URL so they resolve correctly under either base.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
});
