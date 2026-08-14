/// <reference types="vitest/config" />

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "https://memoir.test/",
      },
    },
    setupFiles: "./src/test/setup.ts",
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
  },
});
