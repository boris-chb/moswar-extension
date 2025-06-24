import puppeteer from "puppeteer";
import fs from "fs/promises";

import { auth, reinjectScript, URLs } from "./src/utils/index.js";
import { loadSession } from "./src/utils/session.js";

const headless = process.env.headless === "true";

let utils_;

const BROWSER_OPTIONS = {
  headless,
  defaultViewport: null,
  args: ["--disable-infobars", "--no-sandbox", "--incognito"],
};

if (process.platform === "linux") {
  BROWSER_OPTIONS.executablePath = "/usr/bin/chromium-browser";
}

async function main() {
  // Launch Puppeteer browser instance
  const browser = await puppeteer.launch({
    ...BROWSER_OPTIONS,
    devtools: true,
  });
  const [page] = await browser.pages();
  await page.goto(URLs.home);

  // auth
  const sessionExists = await loadSession(page, "delucsmd@gmail.com");
  if (!sessionExists) {
    await auth(page, "delucsmd@gmail.com", "Uvp3G!__");
  }
  await page.goto(URLs.player, { waitUntil: "networkidle2" });
  reinjectScript(page);
  // await page.evaluate(() => window.document.addEventListener("DOMContentLoaded", reinjectScript));

  process.on("exit", async () => {
    console.log("Closing browser...");
    await browser.close();
  });

  process.on("SIGINT", async () => {
    console.log("SIGINT received. Closing browser...");
    await browser.close();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("SIGTERM received. Closing browser...");
    await browser.close();
    process.exit(0);
  });
}

main();

// const { app } = electron;

// app.whenReady().then(main);

// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") {
//     app.quit();
//   }
// });
