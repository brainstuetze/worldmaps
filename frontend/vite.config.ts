import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = dirname(fileURLToPath(import.meta.url));
const worldAtlas110mPath = resolve(workspaceRoot, 'node_modules/world-atlas/world/110m.json');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'world-atlas/world/110m.json': worldAtlas110mPath,
    },
  },
});
