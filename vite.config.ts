import { readFileSync } from "node:fs";
import { defineConfig } from "vite";

export default defineConfig({
  publicDir: false,
  plugins: [{
    name: "wasm-debug-source",
    apply: "build",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "assets/validator.c",
        source: readFileSync(new URL("./src/wasm/validator.c", import.meta.url)),
      });
    },
  }],
  build: {
    sourcemap: true,
    minify: true,
    assetsInlineLimit: 0,
  },
});