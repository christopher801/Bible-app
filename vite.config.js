import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Stamps a unique build id into dist/sw.js so every deployment gets a new
// versioned shell cache and the old one is removed on activation.
function stampServiceWorker() {
  return {
    name: 'stamp-service-worker',
    apply: 'build',
    closeBundle() {
      const file = resolve('dist', 'sw.js');
      if (!existsSync(file)) return;
      const src = readFileSync(file, 'utf8').replace(/__BUILD_ID__/g, String(Date.now()));
      writeFileSync(file, src);
    }
  };
}

export default defineConfig({
  plugins: [react(), stampServiceWorker()],
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Bible text chunks live in /data/ so the service worker can keep them
        // in a dedicated, long-lived cache that is not wiped on app updates.
        chunkFileNames: (chunk) =>
          chunk.facadeModuleId && chunk.facadeModuleId.replace(/\\/g, '/').includes('/src/data/bible/')
            ? 'data/[name]-[hash].js'
            : 'assets/[name]-[hash].js'
      }
    }
  }
});
