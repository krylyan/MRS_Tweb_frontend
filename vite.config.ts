import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: "esnext",
    outDir: "build",
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Orice request catre /api/* va fi trimis catre backend
      "/api": {
        target: "http://localhost:5227",
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path  // pastram /api prefix (nu-l stergem)
      },
    },
  },
});
