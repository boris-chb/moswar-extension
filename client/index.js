/* global $ AngryAjax fightForward */

import {
  getAlleyCooldown,
  patrolMode,
  trackRatMode,
  workMode,
} from "./alley.js";

import {
  dungeonSpeedUp,
  handleUI,
  kubovichSpeedUp,
  neftLeninSpeedUp,
  redrawMain,
  renderCandyCountdown,
  renderNavbar,
  renderPanel,
} from "./ui/index.js";

import { carBringupMode } from "./cars.js";
import { moscowpolySpeedUp } from "./moscowpoly.js";
import { drawTimers } from "./timers.js";
import { zodiacMode } from "./zodiac.js";

export const player = window.player;
export const showAlert = window.showAlert;
const BASE_URL = new URL(window.location.href).origin + "";

const goTo = async (url) => {
  window.AngryAjax.goToUrl(url);
};

export const HEADERS = {
  accept: "*/*",
  "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
  "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "x-requested-with": "XMLHttpRequest",
};

export async function buyCasinoTokens() {
  const res = await fetch(new URL(window.location.href).origin + "/casino/", {
    headers: HEADERS,
    referrer: new URL(window.location.href).origin + "/casino/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: "action=ore&count=20",
    method: "POST",
    mode: "cors",
    credentials: "include",
  });

  const { success } = await res.json();

  return { success };
}

export async function waitForCooldown(callback) {
  const cooldownSeconds = await getAlleyCooldown();
  if (cooldownSeconds) {
    showAlert(
      `${callback.name}`,
      `🚧 Cooldown in effect. Retrying in ${cooldownSeconds} seconds.`
    );
    setTimeout(callback, (cooldownSeconds + 5) * 1000);
    return true;
  }
  return false;
}

export async function undressItem(itemId = "196690061") {
  await fetch(
    `${new URL(window.location.href).origin}/player/json/withdraw/${itemId}/`,
    {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "if-modified-since": new Date().toUTCString(),
        "sec-ch-ua": '"Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform":
          player.nickname === "barifan" ? '"macOS"' : '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
      },
      referrer: new URL(window.location.href).origin + "/player/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    }
  );
}

export async function autoPilot() {
  // 979786 - bronepozed
  // 1052323 - electro-volga
  // 1086202 - electro-volga (Даня)
  await carBringupMode("1052323"); // electro-volga
  await workMode();
  await patrolMode();
  await trackRatMode();
  // await checkBronikPieces();
  await zodiacMode();
}

export async function smurfInit() {
  // await joinProt();
  // await joinSiri();
  // await signUpForSiri();
  // await chaoticFightMode();
  // await workMode(1);
  // await patrolMode(10);
  // await trackRatMode(20);
  // await handleSmurfFight();
  // await placeHuntOrder();

  // await takeDailyDose(false);
  // await chaoticFightMode();
  // await joinChaoticFight();

  $(document).ajaxStop(function () {
    if (location.pathname === "/quest/") {
      goNextLevel();
    }
  });
}

export async function init() {
  await renderPanel();
  await renderNavbar();
  await redrawMain();
  await drawTimers();
  renderCandyCountdown();
  moscowpolySpeedUp();
  kubovichSpeedUp();
  neftLeninSpeedUp();
  dungeonSpeedUp();
  handleUI();

  console.log("ℹ️ Enhanced client-side functionality.");

  if (window.SMURF_MODE) {
    console.log("SMURF MODE");
    await smurfInit();
  }

  // event listener, on every page load update UI
  $(document).ajaxStop(handleUI);
}

export * from "./alley.js";
export * from "./cars.js";
export * from "./dopings.js";
export * from "./group-fight.js";
export { sendMessage } from "./phone.js";
export { handlePvpFight } from "./pvp.js";
export * from "./ui/index.js";
export * from "./utils.js";
export { zodiacMode } from "./zodiac.js";
export { drawTimers };
// $(document).one("ajaxStop", init);
