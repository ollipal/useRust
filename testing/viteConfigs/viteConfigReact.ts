import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Enables 'userust watch', even better line would be 'ignored: ["!**/node_modules/my-rust/**/"]',
  // but it does not work on all systems: https://github.com/vitejs/vite/issues/8619
  server: {
    watch: {
      ignored: ["!**/node_modules/**"],
    },
  },
  // This enables .wasm files to be served properly
  optimizeDeps: {
    exclude: ["my-rust"],
  },
});