import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

export default defineConfig({
  // The Map System lives under /map/ — https://goocop.vn/map/ in production
  // (nginx) and http://localhost:3000/map/ locally (proxied by the landing
  // page's dev server). Prefixes every built asset and dev module URL so
  // nothing collides with the landing page served at /.
  base: "/map/",

  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    // The landing's /map proxy targets this exact port. Fail loudly if it is
    // taken rather than silently moving to 5174 and leaving /map/ broken.
    port: 5173,
    strictPort: true,
  },
})