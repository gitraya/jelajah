import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: true,
      preview: {
        host: true,
        port: 4173,
        allowedHosts: import.meta.env.VITE_ALLOWED_HOSTS
          ? import.meta.env.VITE_ALLOWED_HOSTS.split(",")
          : [],
      },
    },
  };
});
