import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    printWidth: 160,
  },
  lint: { options: { typeAware: true, typeCheck: true } },
});
