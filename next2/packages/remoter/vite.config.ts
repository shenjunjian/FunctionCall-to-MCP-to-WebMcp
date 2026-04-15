import { defineConfig } from "vite-plus";
import svgLoader from "vite-svg-loader";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [
    vue(),
    svgLoader({
      defaultImport: "component",
      svgo: false,
    }),
  ],
  pack: {
    dts: {
      tsgo: true,
    },
    exports: true,
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    printWidth: 160,
  },
  staged: {
    "*": "vp check --fix",
  },
});
