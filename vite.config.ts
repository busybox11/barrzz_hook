import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    monkey({
      entry: "src/main.tsx",
      userscript: {
        icon: "https://www.barrzz.fr/favicon.ico",
        namespace: "npm/vite-plugin-monkey",
        grant: ["unsafeWindow"],
        "run-at": "document-start",
        match: ["https://www.barrzz.fr/*"],
      },
    }),
  ],
});
