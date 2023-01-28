import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Allow live updates to the package
  // ignored: ["!**/node_modules/my-rust/**/"] would be better solution,
  // but it does not work on all systems: https://github.com/vitejs/vite/issues/8619
  server: {
    watch: {
      ignored: ["!**/node_modules/**"],
    },
  },
  // The watched package must be excluded from optimization,
  // so that it can appear in the dependency graph and trigger hot reload.
  optimizeDeps: {
    exclude: ["my-rust"],
  },
});