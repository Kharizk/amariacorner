import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    base: './', // Ensures assets load correctly on GitHub Pages/Netlify subdirectories
    define: {
      // Robustly handle API Key: Check API_KEY first, then VITE_API_KEY, then empty string.
      // This ensures functionality whether the user sets "API_KEY" or follows Vite convention "VITE_API_KEY" in Netlify.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.VITE_API_KEY || '')
    }
  };
});