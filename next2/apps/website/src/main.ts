import { registerOnPage } from "user";
import { z } from "zod";

const { server, client } = await registerOnPage({});

window._server = server;
window._client = client;
window._z = z;

setTimeout(async () => {
  console.log("Calling client.listTools()...");
  try {
    const tools = await client.listTools();
    console.log("Tools:", tools);
  } catch (error) {
    console.error("Error calling listTools:", error);
  }
}, 1000);
