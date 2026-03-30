import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 忽略 remoter-src 目录中的文件
  build: {
    rollupOptions: {
      external: (id) => id.includes("remoter-src"),
    },
  },
  optimizeDeps: {
    exclude: ["remoter-src"],
  },
});
