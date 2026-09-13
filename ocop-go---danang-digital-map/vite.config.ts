import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        // Mirror nginx on goocop.vn, which 301-redirects /map to /map/.
        // Without this the map's dev server answers a bare /map with a 404.
        name: 'map-trailing-slash-redirect',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const [pathname, query] = (req.url ?? '').split('?');
            if (pathname !== '/map') return next();
            res.statusCode = 301;
            res.setHeader('Location', query ? `/map/?${query}` : '/map/');
            res.end();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // The Map System is a separate Vite app served under /map/ (see `base`
      // in frontend/vite.config.ts). Forward that path to its dev server so
      // http://localhost:3000/map/ serves the map in the same tab and origin,
      // mirroring nginx on goocop.vn. `ws` carries the map's HMR socket.
      // A regex, so only /map and /map/... match — not e.g. /mapping.
      proxy: {
        '^/map(/|$)': {
          target: process.env.MAP_DEV_URL || 'http://localhost:5173',
          changeOrigin: true,
          ws: true,
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
