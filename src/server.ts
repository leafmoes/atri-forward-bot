import { webhookCallback } from "grammyjs";
import { bot } from "./bot.ts";

const handleUpdate = webhookCallback(bot, "std/http");
Deno.serve(async (req: Request) => {
  if (req.method == "POST") {
    const url = new URL(req.url);
    if (url.pathname.slice(1) == bot.token) {
      try {
        console.debug("Received a new message !");
        return await handleUpdate(req);
      } catch (err) {
        console.error(err);
      }
    }
  }
  return new Response();
});