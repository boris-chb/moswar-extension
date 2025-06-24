/* eslint-disable no-undef */
// NeftLeninMode()

import { BASE_URL } from "./index.js";
import { formatTime, parseHtml } from "./utils.js";

// 1. negotiate rewards
// 2. check mission type (NPC, mission, group) from NeftLenin.typeStep
// 3. check npc level (if > 20, eat dopings)
// 4.

async function delay(s = 1) {
  return new Promise((res) => setTimeout(res, s * 1000));
}

function getTime() {
  const now = new Date();
  const pad = (num) => String(num).padStart(2, "0");
  const day = pad(now.getDate());
  const month = pad(now.getMonth() + 1);
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  return `[${day}/${month} | ${hours}:${minutes}:${seconds}]`;
}

async function handleNpcGroupFight() {
  const pathName = AngryAjax.getCurrentUrl();
  if (!pathName.includes("fight")) {
    console.log("Not in fight page. Ending fight...");
    return;
  }
  const aliveOpponents = await utils_.getElementsOnThePage(
    ".list-users--right .alive",
    pathName
  );

  if (!aliveOpponents || aliveOpponents?.length < 1) {
    console.log("No alive opponents found. Ending fight...");

    return;
  }

  console.log(`[Group Fight] Attacking...`);

  groupFightMakeStep();
}

export class FightLenin {
  constructor() {
    this._suspicion = this.suspicion;
    this.desiredRewards = [
      "Большая шкатулка партии",
      "Средняя шкатулка партии",
      // "Малая шкатулка партии",
      "Ключ партии",
      "Посадочный билет",
    ];
    this.log = (...args) => {
      const formattedTime = getTime();
      console.log(
        `%c${formattedTime}%c[🛢️ L E N I N]\n%c > `,
        "color: #4CAF50; font-weight: bold;",
        "color: #FF5722; font-weight: bold;",
        "color: inherit; font-style: italic;",
        ...args
      );
    };
  }

  get type() {
    // 'm' | 'd' | '??'
    return NeftLenin.typeStep;
  }

  get suspicion() {
    return NeftLenin.suspicion;
  }

  // main
  async play() {
    AngryAjax.goToUrl("/neftlenin");
    const alleyCooldown = await getAlleyCooldown();
    if (alleyCooldown) {
      this.log(
        `[PLAY] ❄️ Alley Cooldown. ${formatTime(alleyCooldown)} minutes.`
      );
      setTimeout(() => this.play(), alleyCooldown * 1000);
      return;
    }
    await delay();

    let currentUrl = new URL(window.location.href);

    if (!AngryAjax.getCurrentUrl().includes("neftlenin")) {
      this.log(`[PLAY] Not in NeftLenin page. Retrying in 1 minute...`);
      setTimeout(() => this.play(), 60 * 1000);
      return;
    }

    if (this.type === "d") {
      this.log(`[PLAY] Handling NPC.`);
      await this.handleNpc();
    } else if (this.type === "m") {
      this.log(`[PLAY] Handling mission.`);
      await this.handleMission();
    } else if (this.type === "g") {
      this.log("[PLAY] Handling group fight.");
      await this.handleGroupFight();
    } else {
      this.log(`[PLAY] Unknown fight type.`);
      return;
    }

    this.log(`Play cycle finished. Calling again in 1 minute...`);

    // play every minute
    setTimeout(() => this.play(), 60 * 1000);
  }
  async handleNpc() {
    if (this.type !== "d") return;
    const shouldAttack = await this.negotiateReward();
    if (shouldAttack) this.attack();
  }
  async handleMission() {
    if (this.type !== "m") return;
    // open pop-up
    NeftLenin.viewPreMission();

    await delay(2);

    // start mission
    NeftLenin.viewPreMission2();

    await delay(2);

    // // wait for 10 minutes for mission to finish...
    // // const timer = TODO:
    // await delay(10 * 60);

    try {
      for (let i = 1; i < 5; i++) {
        const { gamble, play, nextStep } = NeftLenin;
        const gambleTurn = `${i}`;

        if (i === 1 && gamble[gambleTurn].enemy > 4) {
          this.log(`[Mission] Opponent highrolled, skipping...`);
          break;
        }

        play();
        await delay();

        // lost
        if (gamble[gambleTurn].enemy > gamble[gambleTurn].my) {
          this.log(`[Mission] Opponent won :(`);
          break;
        }
        // won
      }
    } catch (e) {
      this.log(`[Mission] Mission not ready.`);
      return;
    }

    NeftLenin.nextStep();
  }
  async handleGroupFight() {
    if (this.type !== "g") return;
    const shouldAttack = await this.negotiateReward();
    if (shouldAttack) this.attack();
    await handleNpcGroupFight();
  }

  // helpers
  async getNeftRewards() {
    try {
      AngryAjax.goToUrl("/neftlenin");
      await delay(2);
      NeftLenin.viewPrize();
      await delay(2);
      const neftDocument = await parseHtml(NeftLenin.data);
      const rewardsArr = [
        ...neftDocument.querySelectorAll(".object-thumb img"),
      ].map((el) => el.getAttribute("title"));

      return rewardsArr;
    } catch (e) {
      this.log(`Could not get Neft Rewards\n`, e);
      return false;
    }
  }

  async negotiateReward() {
    const isGood = await this.checkRewards();

    if (isGood) return isGood;

    if (this.suspicion > 135) {
      const minutesRemaining = this.suspicion - 135;
      this.log(`${getTime()} Suspicion too high (${this.suspicion}).`);
      return false;
    }

    if (!isGood) {
      this.log(`[Negotiate] Rerolling reward...`);
      NeftLenin.escape();
      await delay(1);
      return false;
    }

    this.log(`[Negotiate] Reward is good, suspicion is low.\nReady to attack!`);
    return isGood;
  }

  async checkRewards() {
    try {
      const npcRewards = await this.getNeftRewards();
      const shouldAttack = npcRewards.some((reward) =>
        this.desiredRewards.includes(reward)
      );

      if (shouldAttack) this.log(`[check rewards] GOOD!`);
      return shouldAttack;
    } catch (e) {
      this.log(`Could not compare Neft Rewards.\n`, e);
      return false;
    }
  }

  async attack() {
    // check suspicion
    if (this.suspicion > 120) {
      const minutesLeft = this.suspicion - 120;
      this.log(`[attack] Suspicion too high (${this.suspicion}).`);
      return;
    }

    // check NPC level
    if (NeftLenin.npc[0].level > 20) {
      this.log("TODO: use dopings and buffs");
      return;
    }

    // heal
    // if (m.player.maxhp - m.player.currenthp > 5000) {
    //   showHPAlert();
    // }
    showHPAlert();

    this.log(`[attack] FIGHT!`);
    NeftLenin.attack();
  }
}

/*
 * @param {puppeteer.Page} page - The Puppeteer page object.
 * @returns {Promise<void>} - A promise that resolves when the neft mode is complete.
 */
// export async function neftMode(page) {
//   await page.goto(new URL(window.location.href).origin + "/neftlenin/", {
//     waitUntil: "networkidle2",
//   });

//   console.log("🏋️ Neft mode started.");
//   await page.evaluate(() => {
//     NeftLenin.viewPrize();
//     let oppName = document.querySelectorAll(".enemy-place.fight .enemy .name");

//     console.log(oppName);
//     let suspicionCounter = +document.querySelector("table i.counter").innerText;

//     let opponentLevel = document
//       .querySelector('.enemy-place[style="opacity: 1;"] .enemy .name')
//       .innerText.split(" ")[1]
//       .slice(1, -1);

//     console.log("suspicionCounter", suspicionCounter);
//     console.log("opponentLevel", opponentLevel);
//   });
// }
