import { definePlugin } from "nitro";
import { closeDatabase, initDb } from "../utils/db";

export default definePlugin((app) => {
  initDb();
  app.hooks.hook("close", async () => closeDatabase());
});
