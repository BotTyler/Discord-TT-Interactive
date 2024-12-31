import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// NOTE: building for prod will not work with a linked package
// You should install directly from the repo in order to make the build work
// if you need to get the package to use a modified version, one solution
// is to manually copy the build result into the node_modules here

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: "./",
  server: {
    host: "0.0.0.0",
    port: 3000,
    hmr: true,
  },
});
