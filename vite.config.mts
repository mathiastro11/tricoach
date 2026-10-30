import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: resolve(projectRoot, "native"),
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@": projectRoot,
    },
  },
  publicDir: resolve(projectRoot, "public"),
  css: {
    postcss: projectRoot,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
