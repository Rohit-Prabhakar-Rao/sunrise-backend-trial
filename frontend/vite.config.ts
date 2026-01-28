import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import basicSsl from '@vitejs/plugin-basic-ssl' // <--- Import this

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8081,
  },
  plugins: [react(), basicSsl()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
