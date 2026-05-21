import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

const REPO = "busybox11/barrzz_hook";
const RELEASE_ASSET = `https://github.com/${REPO}/releases/latest/download/barrzz_hook.user.js`;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    monkey({
      entry: "src/main.tsx",
      userscript: {
        icon: "https://www.barrzz.fr/favicon.ico",
        namespace: `https://github.com/${REPO}`,
        homepage: `https://github.com/${REPO}`,
        updateURL: RELEASE_ASSET,
        downloadURL: RELEASE_ASSET,
        grant: ["unsafeWindow"],
        "run-at": "document-start",
        match: ["https://www.barrzz.fr/*"],
      },
    }),
  ],
});
