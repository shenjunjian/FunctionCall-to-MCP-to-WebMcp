import { createApp } from "vue";
import IframeApp from "./iframeApp.vue";
import { registerPageAgentTool } from "next-agent";

// registerPageAgentTool();
const app = createApp(IframeApp);
app.mount("#app");
