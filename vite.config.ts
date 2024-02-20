import { defineConfig } from "vite";
import { fileURLToPath } from "url";

export default defineConfig({
  base:
    process.env.NODE_ENV === "production"
      ? "/javascript-action-multiplayer/"
      : "/",
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
      {
        find: "@root",
        replacement: fileURLToPath(new URL("./", import.meta.url)),
      },
    ],
  },
});
