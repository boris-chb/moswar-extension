/* eslint-disable no-undef */
import { logIn } from "./session.js";
import fs from "fs/promises";

export function delay(s = 1) {
  return new Promise((res) => setTimeout(res, s * 1000));
}

export async function reinjectScript(page) {
  try {
    const script = await fs.readFile("./dist/bundle.js", "utf8");

    // Inject script after navigation completes
    await page.evaluate(script);
  } catch (e) {
    console.log("Could not inject bundle\n", e);
  }
}
//
// //
// // //
// // // // // // // // // //
//              functions  //
// // // // // // // // // //
// // //
// //
//

export async function auth(page, email, password) {
  await page.goto("https://www.moswar.ru/", {
    waitUntil: "networkidle2",
    timeout: 0,
  });

  await page.waitForSelector("#login-email", { visible: true, timeout: 5000 });
  await page.waitForSelector("#login-password");

  await logIn(page, email, password);
}

export async function carBringup(page) {
  await page.goto("https://www.moswar.ru/arbat/", {
    waitUntil: "networkidle2",
  });

  await delay(1);

  const autoBombila = await page.$(".auto-bombila");

  if (!autoBombila) {
    console.log("Bombile not taking place today.");
    return;
  }

  const cooldownTimer = await page.$("#cooldown", {
    visible: true,
    timeout: 1500,
  });

  if (cooldownTimer) {
    const secondsLeft = await page.evaluate(
      (el) => el.getAttribute("timer"),
      cooldownTimer
    );

    console.log("Cooldown timer. Retrying in", secondsLeft / 60, "minutes.");

    setTimeout(() => carBringup(page), +secondsLeft * 1000);
    return;
  }

  // try to submit
  await page.evaluate(async (el) => {
    document.querySelector('form[action="/automobile/bringup/"]').submit();

    // wait after submission
    new Promise((res) => setTimeout(res, 2 * 1000));

    const cooldown =
      +document.querySelector("#cooldown").getAttribute("timer") ??
      16 * 60 + 45;

    setTimeout(() => carBringup(page), cooldown * 1000);
    console.log("Submitted. Next car bringup after", cooldown, "seconds.");
  }, cooldownTimer);

  await delay(2);

  const errorAlertBtn = await page.$(
    ".alert.infoalert.alert-error.alert1 span.f"
  );

  if (errorAlertBtn) {
    console.log('Alert is displayed. Clicking "Заправить" button.');
    await page.evaluate((btn) => {
      btn.click();
      document.querySelector('form[action="/automobile/bringup/"]').submit();
    }, errorAlertBtn);
  } else {
    console.log("Alert is not displayed.");
  }

  await delay(2);
}
