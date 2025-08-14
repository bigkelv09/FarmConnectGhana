import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(async () => {
  const plugins = [react()];

  // Only load Replit plugins when running in Replit environment
  if (process.env.REPL_ID !== undefined) {
    try {
      const runtimeErrorOverlay = await import("@replit/vite-plugin-runtime-error-modal");
      plugins.push(runtimeErrorOverlay.default());

      if (process.env.NODE_ENV !== "production") {
        const cartographer = await import("@replit/vite-plugin-cartographer");
        plugins.push(cartographer.cartographer());
      }
    } catch (error) {
      console.warn("Replit plugins not available, skipping...");
    }
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
