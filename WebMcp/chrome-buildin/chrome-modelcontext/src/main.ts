import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { initializeWebMCPPolyfill } from "@mcp-b/webmcp-polyfill";
import { registerTools } from "./webmcp";

initializeWebMCPPolyfill();
registerTools();

createApp(App).mount("#app");
