import solid from "solid-start/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [solid()],
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