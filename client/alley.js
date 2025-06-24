/* global $ Gypsy player cooldownReset jobShowTonusAlert groupFightMakeStep AngryAjax showAlert */

import { HUNT_CLUB_PREYS } from "./data.js";
import { heal, restoreHP, useItem } from "./dopings.js";
import { aIsGroupFight, sendAlert, waitForCooldown } from "./index.js";
import { addToContacts, removeFromContacts } from "./phone.js";
import { getMoscowTime } from "./utils.js";
import {
  delay,
  formatTime,
  getElementsOnThePage,
  getPlayerId,
  parseHtml,
} from "./utils.js";

// work & patrol
export async function workMode(timeHours = 1) {
  async function workBurgers() {
    const workFinished = await getElementsOnThePage(
      "#workForm > div.time > span.error",
      "/shaurburgers/"
    );

    if (workFinished) return;

    // AngryAjax.goToUrl("/shaurburgers/");

    await fetch(new URL(window.location.href).origin + "/shaurburgers/", {
      headers: {
        accept: "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
      },
      referrer: new URL(window.location.href).origin + "/shaurburgers/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: `action=work&time=${timeHours}&__ajax=1&return_url=%2Fshaurburgers%2F`,
      method: "POST",
      mode: "cors",
      credentials: "include",
    });
  }
  const workCooldown = await getElementsOnThePage(
    "form.shaurburgers-work td#shaurma.value",
    "/shaurburgers/"
  );

  const workCooldownSeconds = workCooldown?.getAttribute("timer");
  if (workCooldownSeconds) {
    console.log(
      `⏱️ Shaurburgers work cooldown. Retry in ${formatTime(workCooldownSeconds)}.`
    );
    setTimeout(
      async () => await workMode(timeHours),
      (workCooldownSeconds + 5) * 1000
    );
    return;
  }
  // start working now
  await workBurgers(timeHours);
  // AngryAjax.reload();
  // and work every hour
  setTimeout(async () => workMode(timeHours), 60.05 * 60 * 1000);
}

export async function patrolMode(minutes = 10) {
  try {
    const patrolForm = $(
      await getElementsOnThePage("form#patrolForm", "/alley/")
    );

    const patrolIsOver = patrolForm.find(".timeleft").text();

    if (
      patrolIsOver === "На сегодня Вы уже истратили все время патрулирования."
    ) {
      const secondsUntilNextPatrol = Math.floor(
        (new Date(
          new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" })
        ).setHours(24, 1, 0, 0) -
          new Date()) /
          1000
      );

      console.log(
        `⏰ Patrol is over. Retrying in ${formatTime(secondsUntilNextPatrol)}`
      );

      return setTimeout(
        async () => await patrolMode(minutes),
        secondsUntilNextPatrol * 1000
      );
    }

    const patrolTimerSeconds = patrolForm?.find("td.value")?.attr("timer");
    if (patrolTimerSeconds) {
      console.log(
        `⏱️❄️ Patrol cooldown. Retry in ${formatTime(patrolTimerSeconds)}.`
      );
      setTimeout(
        async () => await patrolMode(minutes),
        (+patrolTimerSeconds + 3) * 1000
      );
      return;
    }

    console.log(`[🚔] Patrol Mode (${minutes} minutes).`);
    await startPatrol(minutes);
    setTimeout(() => patrolMode(minutes), minutes * 60 * 1000 + 3000);
  } catch (e) {
    console.log("Could not start patrol mode\n", e);
  }
}

export async function joinBankRobbery() {
  const fightId = await getElementsOnThePage(
    '.bank-robbery input[name="fight"]',
    "/bank/"
  );
}

export async function placeHuntOrder(preyList) {
  if (!preyList) {
    preyList = HUNT_CLUB_PREYS;
  }
  preyList.forEach(async (playerName) => {
    await fetch(new URL(window.location.href).origin + "/huntclub/zakaz/", {
      headers: {
        accept: "*/*",
        "accept-language": "en-GB,en;q=0.9",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "x-requested-with": "XMLHttpRequest",
      },
      body: `player=7059277&nickname=${playerName}&comment=&award=${+player.level * 100}&vip=on&__ajax=1&return_url=%2Fhuntclub%2F`,
      method: "POST",
    });
  });
}

// region 3 === вокзальный
export async function startPatrol(timeMin = 10, region = 1) {
  // AngryAjax.goToUrl("/alley/");
  await fetch(new URL(window.location.href).origin + "/alley/", {
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer: new URL(window.location.href).origin + "/alley/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: `action=patrol&region=${region}&time=${timeMin}&__ajax=1&return_url=%2Falley%2F`,
    method: "POST",
    mode: "cors",
    credentials: "include",
  });

  await fetch(new URL(window.location.href).origin + "/desert/");
  await fetch(new URL(window.location.href).origin + "/desert/rob/");
}

export async function watchTv() {
  await fetch(new URL(window.location.href).origin + "/alley/", {
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer: new URL(window.location.href).origin + "/alley/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: "action=patriottv&time=1&__ajax=1&return_url=%2Falley%2F",
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
}

function isInGroupFight() {
  const currentUrl = AngryAjax.getCurrentUrl();
  const normalFightRegex = /^\/fight\/\d+\/?$/;
  return normalFightRegex.test(currentUrl);
}

export async function smackMyBitchUp() {
  await attackPlayer(7362678);
  await attackPlayer(7241223);
}

export async function handleSmurfFight() {
  try {
    let cooldownSeconds = await getAlleyCooldown();

    if (cooldownSeconds && cooldownSeconds > 0) {
      console.log(`[SMURF] Alley Cooldown ${formatTime(cooldownSeconds + 5)}`);
      setTimeout(
        async () => await handleSmurfFight(),
        (cooldownSeconds + 5) * 1000
      );
      return;
    }

    await restoreHP();
    await smackMyBitchUp();
    await attackByCriteria({
      criteria: "type",
      minLvl: +player.level + 4,
      maxLvl: +player.level + 6,
    });

    cooldownSeconds = await getAlleyCooldown();

    console.log(`[SMURF] Attack again in ${formatTime(cooldownSeconds + 5)}`);
    setTimeout(
      async () => await handleSmurfFight(),
      1000 * (cooldownSeconds + 5)
    );
  } catch (e) {
    console.log("Could not handle smurf fight\n", e);
  }
}

export async function checkBubble(cb, extraDelaySeconds = 0, ...args) {
  try {
    let bubble = document.querySelector(
      "#personal > a.bubble > span > span.string"
    );
    let bubbleText = bubble.querySelector("span.text").innerText;

    if (bubbleText === "Задержан за бои") {
      console.log("Задержан за бои. Налаживаю связи...");
      await fetch(new URL(window.location.href).origin + "/police/relations/");
      AngryAjax.goToUrl("/alley/");
    } else if (bubbleText === "Ожидание боя") {
      try {
        let bubbleTimeLeft = +bubble
          .querySelector("span.timeleft")
          .getAttribute("timer");

        console.log(bubbleText, "\nПробую заново через: ", bubbleTimeLeft);
        setTimeout(
          () => cb(...args),
          (bubbleTimeLeft + extraDelaySeconds) * 1000
        );
        return true;
      } catch (e) {
        console.log("Waiting for fight. Time unknown... skipping...\n", e);
        return false;
      }
    }
  } catch (error) {
    console.log("[✅] All checks passed.\n");
    return false;
  }
}

export async function attackOrReschedule(cb, extraDelaySeconds = 0, args = {}) {
  const isInFight = await aIsGroupFight();
  if (isInFight) {
    console.log("🚨 Идет групповой бой, пробую заново через минуту...");
    setTimeout(
      () => {
        AngryAjax.goToUrl("/alley/");
        cb(args);
      },
      (60 + extraDelaySeconds) * 1000
    );
    return true;
  }

  const alleyCooldown = await getAlleyCooldown();
  if (alleyCooldown) {
    console.log(
      `⏱️ Кулдаун в закоулках. Пробую через ${formatTime(alleyCooldown)}.`
    );
    setTimeout(() => cb(args), (alleyCooldown + extraDelaySeconds) * 1000);
    return true;
  }

  return false;
}

// fights
export async function farmVictims() {
  if (await waitForCooldown(farmVictims)) {
    return;
  }
  console.log("🍼 Searching for victims...");

  let res = await fetch(
    new URL(window.location.href).origin + "/alley/search/type/",
    {
      headers: {
        accept: "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
      },
      referrer: new URL(window.location.href).origin + "/alley/search/type/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: "type=victim&werewolf=0&nowerewolf=1&__ajax=1&return_url=%2Falley%2F",
      method: "POST",
      mode: "cors",
      credentials: "include",
    }
  );
  let data = await res.text();

  const { content: htmlString } = JSON.parse(data);

  const doc = parseHtml(htmlString);

  const playerId = getPlayerId(doc);
  if (!playerId) {
    return console.log("🔎 Could not find victim.");
  }

  console.log("🔎 Found victim:", playerId);

  const fightId = await attackPlayer(playerId);
  if (fightId) {
    console.log("✅ Fight completed. ", fightId);
    await checkVictimWorthy(fightId);
  }

  return setTimeout(() => farmVictims(), 5.1 * 60 * 1000);
}

export async function farmEnemies(intervalMin = 5) {
  if (await waitForCooldown(farmEnemies)) {
    return;
  }

  const response = await fetch(
    new URL(window.location.href).origin + "/alley/search/type/",
    {
      headers: {
        accept: "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
      },
      referrer: new URL(window.location.href).origin + "/alley/search/type/",
      referrerPolicy: "strict-origin-when-cross-origin",
      // body in this format:
      // `werewolf=0&nowerewolf=1&minlevel=${minLevel}&maxlevel=${maxLevel}&__ajax=1&return_url=%2Falley%2F`
      body: "type=enemy&werewolf=0&__ajax=1&return_url=%2Falley%2F",
      method: "POST",
      mode: "cors",
      credentials: "include",
    }
  );

  const data = await response.text();
  const { content: htmlString } = JSON.parse(data);

  const doc = parseHtml(htmlString);

  // attack any emeny regardless of stats
  const playerId = getPlayerId(doc);

  if (!playerId) {
    console.log("🔎 Could not find enemy, searching again in 1 minute...");
    return setTimeout(() => farmEnemies(), 60 * 1000);
  }

  console.log("🥊 Found enemy, attacking:", playerId);
  const fightId = await attackPlayer(playerId);
  if (fightId) {
    console.log("✅ Fight completed. Searching again in 5 minutes.");
    setTimeout(() => farmEnemies(), intervalMin * 60 * 1000);
  }
}

export function shouldAttack(doc, statsDiff = 10) {
  // checks if should attack based on stats
  // returns the ID of the opponent if should attack, otherwise returns false
  let oppStats = [
    ...doc.querySelectorAll(".fighter2-cell .stats > .stat span.num"),
  ]
    .slice(0, -1)
    .map((el) => +el.innerText)
    .reduce((a, b) => a + b, 0);

  let myStats = [
    ...doc.querySelectorAll(".fighter1-cell .stats > .stat span.num"),
  ]
    .slice(0, -1)
    .map((el) => +el.innerText)
    .reduce((a, b) => a + b, 0);

  if (myStats - oppStats < statsDiff) {
    console.log("Opponent too strong, looking for another opponent.");
    return false;
  }
  return true;
}

export async function checkVictimWorthy(fightId) {
  const res = await fetch(
    new URL(window.location.href).origin + "/fight/" + fightId
  );
  const htmlString = await res.text();
  const parser = new DOMParser();
  const fightDocument = parser.parseFromString(htmlString, "text/html");

  try {
    const fightLoot = +fightDocument
      .querySelector(".result .tugriki")
      .innerText.split(",")
      .join("");

    const opponentName = fightDocument
      .querySelector(".fighter2 .user a")
      .innerHTML.slice(1);

    // const opponentId = getPlayerId(fightDocument);

    console.log(`🔎 Loot: ${fightLoot} 💵 from opponent: ${opponentName} `);
    if (fightLoot < 200_000) {
      const opponentName = fightDocument
        .querySelector(".fighter2 .user a")
        .innerHTML.slice(1);
      const opponentId = getPlayerId(fightDocument);
      await removeFromContacts(opponentName, opponentId);
    } else if (fightLoot > 300_000) {
      await addToContacts(opponentName, "victim");
    }
    return fightId;
  } catch (e) {
    console.log("Fight not found", e);
  }
  return false;
}

export async function checkBronikPieces() {
  try {
    let bronikPieceOffer = await getElementsOnThePage(
      "#content > div > table > tbody > tr > td:nth-child(1) > div > div > div.change-area > div.exchange > div.get > div > div > img",
      "/factory/build/bronevik/"
    );

    let pieceName = bronikPieceOffer.getAttribute("alt");

    let cooldown = await getElementsOnThePage(
      "#content > div > table > tbody > tr > td:nth-child(1) > div > div > div.change-area > div.cooldown-wrapper > span.cooldown",
      "/factory/build/bronevik/"
    );

    let unixEndTime = +cooldown.getAttribute("endtime");

    const targetPieces = [
      "красный стяг",
      "дух революции",
      "гусеницы",
      "наклейки с лозунгами",
      "станковый пулемет",
    ];

    // Check piece for a match
    if (targetPieces.includes(pieceName.toLowerCase())) {
      showAlert(
        `🚩 Бронепоезд Революции`,
        ` Покупаю деталь! (${pieceName} ✅)\nПробую заново через 10 минут.`
      );

      await fetch(new URL(window.location.href).origin + "/factory/exchange/", {
        headers: {
          accept: "*/*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "x-requested-with": "XMLHttpRequest",
        },
        referrer:
          new URL(window.location.href).origin + "/factory/build/bronevik/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: "action=exchange&code=bronevik&__referrer=%2Ffactory%2Fbuild%2Fbronevik%2F&return_url=%2Ffactory%2Fbuild%2Fbronevik%2F",
        method: "POST",
        mode: "cors",
        credentials: "include",
      });

      return setTimeout(checkBronikPieces, 2000);
    }

    // Schedule the next check
    let delay = unixEndTime * 1000 - Date.now() + 3000;
    if (delay && delay > 0) {
      showAlert(
        `🚩 Бронепоезд Революции`,
        ` Не нашел нужную деталь. (пропускаю ${pieceName})\nПробую заново через ${formatTime(Math.floor(delay / 1000))}.`
      );
      setTimeout(checkBronikPieces, delay);
    } else {
      await checkBronikPieces(); // If delay has already passed, call immediately
    }
  } catch (e) {
    showAlert("Ошибка!", "[🚩] Не удалось найти деталь.\n Смотри консоль.");
    console.log("[🚩] Could not find Bronik piece.\n", e);
    setTimeout(checkBronikPieces(), 1000);
  }
}

export async function checkInjury() {
  let injuryIcon = await getElementsOnThePage(
    "#content > table.layout > tbody > tr > td.slots-cell > ul > li.avatar.avatar-back-12 > div.icons-place > a > i",
    "player/"
  );

  return injuryIcon ? true : false;
}

export async function fightMode({ intervalMinutes, minLvl, maxLvl, criteria }) {
  const hasInjury = await checkInjury();
  if (hasInjury) {
    console.log("🚨 You have an injury. Skipping fight mode.");
    return;
  }
  await restoreHP();

  console.log(
    `[🥊] Fight mode started.\nSearching by level (${minLvl}-${maxLvl})`
  );
  try {
    await attackByCriteria({ minLvl, maxLvl });
  } catch (e) {
    console.log("🚧 Could not find opponent. Retrying in 1 minute...");
    setTimeout(
      () => fightMode({ intervalMinutes, minLvl, maxLvl, criteria }),
      60 * 1000
    );
  }

  setTimeout(
    () =>
      fightMode({
        intervalMinutes,
        minLvl,
        maxLvl,
        criteria,
      }),
    intervalMinutes * 60 * 1000
  );
}

export async function trackRatMode(frequencyMin = 5) {
  try {
    const hasInjury = await checkInjury();
    if (hasInjury) {
      console.log("🚨 You have an injury. Skipping rat mode.");
      return;
    }

    const isBusy = await checkBubble(trackRatMode, frequencyMin);

    if (isBusy) {
      console.log("🚨 You are busy. Skipping rat mode.");
      return;
    }

    const ratOver = await getElementsOnThePage(
      "#content-no-rat > tbody > tr > td:nth-child(1) > div:nth-child(1) > div > div > p.holders > small",
      "/metro/"
    );
    if (ratOver) {
      const secondsLeft = +ratOver.getAttribute("timer");
      console.log(`🐀 Rat over. Retrying in ${formatTime(secondsLeft)}.`);
      return setTimeout(
        () => trackRatMode(frequencyMin),
        (secondsLeft + 2) * 1000
      );
    }

    // check for group fight (TODO: IMPROVE TO ACCOUNT FOR OTHER GROUP FIGHTS)
    if (AngryAjax.getCurrentUrl().includes("fight")) {
      // eslint-disable-next-line no-undef
      let fightId = setInterval(groupFightMakeStep, 500);
      setTimeout(() => clearInterval(fightId), 4000);
    }

    const alleyCooldown = await getAlleyCooldown();
    if (alleyCooldown) {
      console.log(
        `[🐀 Track Rat] ❄️ Alley Cooldown.\n Retrying in ${formatTime(alleyCooldown)}`
      );
      setTimeout(() => trackRatMode(), alleyCooldown * 1000);
      return;
    }

    // check for cooldown
    const ratCooldownSeconds = (
      await getElementsOnThePage("#timer-rat-fight .value", "/metro/")
    )?.getAttribute("timer");

    if (ratCooldownSeconds && +ratCooldownSeconds > 0) {
      const secondsLeft = +ratCooldownSeconds;
      console.log(
        `[🐀 Track Rat] Rat Cooldown.\nRetrying in ${formatTime(secondsLeft)}.`
      );
      return setTimeout(() => trackRatMode(), secondsLeft * 1000);
    }

    console.log("[🐀 Track Rat] ATTACK!!1");
    await restoreHP();
    await trackAndAttackRat();
    setTimeout(() => trackRatMode(), frequencyMin * 60 * 1000);
  } catch (e) {
    console.log("[🐀 Track Rat] Could not find rat.\n", e);
  }
}

export async function trackAndAttackRat() {
  await restoreHP();
  await fetch(new URL(window.location.href).origin + "/metro/track-rat/", {
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer: new URL(window.location.href).origin + "/metro/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: "__referrer=%2Fmetro%2F&return_url=%2Fmetro%2F",
    method: "POST",
    mode: "cors",
    credentials: "include",
  });

  await delay(0.5);

  await fetch(new URL(window.location.href).origin + "/metro/fight-rat/", {
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer: new URL(window.location.href).origin + "/metro/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: "__referrer=%2Fmetro%2F&return_url=%2Fmetro%2F",
    method: "POST",
    mode: "cors",
    credentials: "include",
  });

  await AngryAjax.goToUrl("/metro");
}

async function workMetro(action = "work") {
  await fetch(new URL(window.location.href).origin + "/metro/", {
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    },
    body: `action=${action}&__referrer=%2Fmetro%2F&return_url=%2Fmetro%2F`,
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
}

async function attackRatMetro() {
  await fetch(new URL(window.location.href).origin + "/alley/attack-npc/1/", {
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    },
    body: `player=${player.id}&__referrer=%2Fmetro%2F&return_url=%2Fmetro%2F`,
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
}

export async function metroWorkMode() {
  const metroWorkCooldown = await getElementsOnThePage(
    "#kopaem .process td#metrodig",
    "/metro/"
  );

  const timer = metroWorkCooldown?.getAttribute("timer");

  if (timer) {
    console.log(
      `[⛏️ Metro] Metro work cooldown. Retry in ${formatTime(+timer)}.`
    );

    sendAlert({
      title: "Уже в метро ⛏️",
      img: "/@/images/pers/npc1_thumb.png",
      text: `Следующий спуск через ${formatTime(+timer)}.`,
    });

    setTimeout(async () => await metroWorkMode(), (+timer + 3) * 1000);
    return;
  }

  sendAlert({
    title: "Копаем ветку метро ⛏️",
    img: "/@/images/pers/npc1_thumb.png",
    text: `Следующий спуск через 10:00.`,
  });

  await attackRatMetro();
  await workMetro("dig");
  await workMetro("work");

  // Ensures a delay before calling itself again
  setTimeout(
    async () => {
      await metroWorkMode();
    },
    10.1 * 60 * 1000
  );
}

export async function attackByCriteria({
  minLvl = +player.level - 1,
  maxLvl = +player.level - 1,
  criteria = "level",
  performChecks = true,
  werewolf = 0,
} = {}) {
  // const hasInjury = await checkInjury();

  // if (hasInjury) {
  //   console.log("🚨 You have an injury. Skipping...");
  //   return;
  // }

  if (performChecks) {
    const shouldReschedule = await attackOrReschedule(attackByCriteria, 0, {
      minLvl,
      maxLvl,
      criteria,
      performChecks,
      werewolf,
    });
    if (shouldReschedule) return;
  }

  let attackPayload = {
    level: `werewolf=${Number(werewolf)}&nowerewolf=${Number(!werewolf)}&minlevel=${minLvl}&maxlevel=${maxLvl}&__ajax=1&return_url=%2Falley%2F`,
    type: `type=weak&=${Number(werewolf)}=${Number(werewolf)}&nowerewolf=${Number(!werewolf)}&__ajax=1&return_url=%2Falley%2F`,
  };

  let res = await fetch(
    `${new URL(window.location.href).origin}/alley/search/${criteria}/`,
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-ch-ua": '"Chromium";v="131", "Not_A Brand";v="24"',
        "sec-fetch-mode": "cors",
        "x-requested-with": "XMLHttpRequest",
      },
      referrer: new URL(window.location.href).origin + "/alley/search/level/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: attackPayload[criteria],
      method: "POST",
      mode: "cors",
      credentials: "include",
    }
  );

  let data = await res.text();
  let htmlStr = await JSON.parse(data).content;
  let doc = parseHtml(htmlStr);

  console.log(criteria, attackPayload[criteria]);

  let opponentName = doc.querySelector(".fighter2")?.innerText;
  if (!opponentName) return false;
  let opponentLevel = +doc
    .querySelector(".fighter2 .level")
    ?.innerText.slice(1, -1);
  let onclick = doc
    .querySelector("#content > div > div.button.button-fight > a")
    ?.getAttribute("onclick");

  if (criteria === "type") {
    if (opponentLevel < minLvl || opponentLevel > maxLvl) {
      console.log(
        "Opponent:",
        opponentName,
        opponentLevel,
        `\nLevel is too high or too low (${minLvl}-${maxLvl}). Retrying...`
      );
      await attackByCriteria({
        minLvl,
        maxLvl,
        criteria,
        performChecks,
        werewolf,
      });
      return;
    }
  }

  console.log("🥊 Found enemy, attacking:", opponentName);
  eval(onclick.split(";")[0]);
}

export async function farm(count = 25) {
  for (let i = 0; i < count; i++) {
    // resetAlleyCooldown();
    await eatSnickers();
    await attackByCriteria({
      minLvl: +player.level - 2,
      maxLvl: +player.level - 2,
      criteria: "level",
      performChecks: false,
      werewolf: true,
    });

    await delay(0.2);
    sendAlert({
      title: "Всё правильно сделал!",
      text: "Бой №" + (i + 1) + " завершен.",
      img: "/@/images/pers/npc2.png",
    });
  }
}

export async function eatSnickers() {
  if (player.energy >= 32) {
    console.log("Using tonus instead of snickers");
    cooldownReset("tonus");
    return;
  }
  await fetch(new URL(window.location.href).origin + "/alley/", {
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "accept-language": "en-GB,en;q=0.9",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer: new URL(window.location.href).origin + "/alley/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: "action=rest_cooldown&code=snikers&ajax=true",
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
}

export async function resetAlleyCooldown() {
  if (player.energy >= 32) {
    console.log("Using tonus instead of snickers");
    cooldownReset("tonus");
    return;
  } else {
    jobShowTonusAlert();
  }
}

export async function attackPlayer(playerId, werewolf = false) {
  const res = await fetch(new URL(window.location.href).origin + "/alley/", {
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer: new URL(window.location.href).origin + "/alley/search/type/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: `action=attack&player=${playerId}&werewolf=${werewolf ? 1 : 0}&useitems=0&__referrer=%2Falley%2Fsearch%2Ftype%2F&return_url=%2Falley%2Fsearch%2Ftype%2F`,
    method: "POST",
    mode: "cors",
    credentials: "include",
  });

  const data = await res.json();

  if (data.return_url && data.return_url.includes("alley/fight/")) {
    return new URL(window.location.href).origin + "" + data.return_url;
  }

  return null;
}

export async function getAlleyCooldown() {
  try {
    let cooldown = await getElementsOnThePage(
      "#alley-search-myself span.timer",
      "/alley/"
    );

    let cooldownSeconds = cooldown.getAttribute("timer");

    if (+cooldownSeconds < 0) {
      return false;
    }

    return +cooldownSeconds;
  } catch (e) {
    console.log("🚧 Could not find cooldown");
    return false;
  }
}

export async function joinChaoticFight() {
  await restoreHP();
  AngryAjax.reload();

  // try for money
  await fetch(new URL(window.location.href).origin + "/fight/", {
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en;q=0.9",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer: new URL(window.location.href).origin + "/fight/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: "action=join+fight&fight=0&price=money&type=chaotic&__ajax=1&return_url=%2Falley%2F",
    method: "POST",
    mode: "cors",
    credentials: "include",
  });

  // try for жетон
  await fetch(new URL(window.location.href).origin + "/fight/", {
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en;q=0.9",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer: new URL(window.location.href).origin + "/fight/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: "action=join+fight&fight=0&price=huntbadge&type=chaotic&__ajax=1&return_url=%2Falley%2F",
    method: "POST",
    mode: "cors",
    credentials: "include",
  });

  // try for зуб
  await fetch(new URL(window.location.href).origin + "/fight/", {
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en;q=0.9",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer: new URL(window.location.href).origin + "/fight/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: "action=join+fight&fight=0&price=zub&type=chaotic&__ajax=1&return_url=%2Falley%2F",
    method: "POST",
    mode: "cors",
    credentials: "include",
  });

  AngryAjax.reload();
}

export async function chaoticFightMode() {
  function isWithinMoscowTimeRange() {
    const now = new Date();
    const options = { timeZone: "Europe/Moscow", hour12: false };
    const moscowTime = new Intl.DateTimeFormat("en-US", {
      ...options,
      hour: "2-digit",
      minute: "2-digit",
    }).format(now);

    const [hour, minute] = moscowTime.split(":").map(Number);
    const currentMinutes = hour * 60 + minute;

    return currentMinutes >= 690 && currentMinutes <= 1411; // 11:30 (690 min) to 23:31 (1411 min)
  }

  if (!isWithinMoscowTimeRange()) return;

  console.log(
    "[🤺] Chaotic fight mode. Waiting for the next scheduled fight..."
  );
  async function scheduleFight() {
    const now = new Date();
    const currentMinutes = now.getMinutes();

    // Calculate the next target time
    const nextMinute = [14, 29, 44, 59].find(
      (minute) => currentMinutes < minute
    );
    const nextHour =
      nextMinute === undefined ? now.getHours() + 1 : now.getHours();
    const targetMinute = nextMinute !== undefined ? nextMinute : 14;
    const targetTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      nextHour,
      targetMinute,
      30
    );

    const delayMs = targetTime.getTime() - now.getTime();

    showAlert(
      "Всё правильно сделал!",
      `Запись на хаот в ${targetTime.toUTCString()} (через ${formatTime(Math.floor(delayMs / 1000))})`
    );

    if (delayMs > 0) {
      setTimeout(async () => {
        await joinChaoticFight();
        setTimeout(async () => await scheduleFight(), 60 * 1000); // Schedule the next fight after one minute
      }, delayMs);
    } else {
      await joinChaoticFight();
      setTimeout(async () => await scheduleFight(), 60 * 1000); // Schedule the next fight after one minute
    }
  }

  scheduleFight();
}

export async function makeTurn(turns = 10) {
  if (!AngryAjax.getCurrentUrl().includes("fight")) return;

  for (let i = 0; i < turns; i++) {
    const isFightOver = document.querySelector("#fight-actions > div.waiting");
    if (isFightOver) {
      console.log(isFightOver);
      return;
    }
    console.log("Пропускаю ход...");
    groupFightMakeStep();
    AngryAjax.reload();
    await delay(0.5);
  }
}

export async function signUpForSiri() {
  const battleHours = [11, 15, 19, 23]; // Moscow time

  // Get Moscow time
  const moscowTime = getMoscowTime();
  const currentHour = moscowTime.getHours();

  let nextBattleHour =
    battleHours.find((hour) => hour > currentHour) || battleHours[0];
  if (
    nextBattleHour === battleHours[0] &&
    currentHour > battleHours[battleHours.length - 1]
  ) {
    nextBattleHour = battleHours[0]; // Next battle hour is the first one of the next day
  }

  const nextBattleDate = getMoscowTime();
  if (nextBattleHour <= currentHour) {
    nextBattleDate.setDate(nextBattleDate.getDate() + 1);
  }

  const nextBattleSeconds = player.nickname === "Toni Kroos" ? 58 : 57;
  nextBattleDate.setHours(nextBattleHour - 1, 59, nextBattleSeconds, 0);

  let msTillNextBattle = nextBattleDate.getTime() - moscowTime.getTime();

  sendAlert({
    title: "Всё правильно сделал!",
    text: `Записываюсь на ИИ через ${formatTime(msTillNextBattle / 1000)}.<br><i>(в ${nextBattleDate.toLocaleTimeString("ru-RU")})</i>`,
    img: "/@/images/pers/man131_thumb.png",
  });

  setTimeout(async () => await joinSiri(), msTillNextBattle);

  setTimeout(
    async () => {
      await signUpForSiri();
    },
    msTillNextBattle + 20 * 1000
  );
}

export async function joinSiri() {
  await restoreHP();

  await fetch(
    new URL(window.location.href).origin + "/phone/call/joinPhoneBoss/",
    {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
      },
      body: "ajax=1&slot=phone3&type=phoneboss3",
      method: "POST",
      mode: "cors",
      credentials: "include",
    }
  );
}

export async function signUpForDeps() {
  const battleHours = [12, 16, 20, 24]; // Moscow time

  // Get Moscow time
  const moscowTime = getMoscowTime();
  const currentHour = moscowTime.getHours();

  let nextBattleHour =
    battleHours.find((hour) => hour > currentHour) || battleHours[0];
  if (
    nextBattleHour === battleHours[0] &&
    currentHour > battleHours[battleHours.length - 1]
  ) {
    nextBattleHour = battleHours[0]; // Next battle hour is the first one of the next day
  }

  const nextBattleDate = getMoscowTime();
  if (nextBattleHour <= currentHour) {
    nextBattleDate.setDate(nextBattleDate.getDate() + 1);
  }

  nextBattleDate.setHours(nextBattleHour - 1, 50, 0, 0);

  let msTillNextBattle = nextBattleDate.getTime() - moscowTime.getTime();

  sendAlert({
    title: "Всё правильно сделал!",
    img: "/@/images/pers/npc_dps_thumb.png",
    text: `Записываюсь на Дэпса через ${formatTime(msTillNextBattle / 1000)}.<br> <i>(в ${nextBattleDate.toLocaleTimeString("ru-RU")})</i>`,
  });

  setTimeout(async () => await joinDeps(), msTillNextBattle);
}

export async function joinDeps() {
  await restoreHP();
  await fetch(
    new URL(window.location.href).origin + "/phone/call/joinPhoneBoss/",
    {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "x-requested-with": "XMLHttpRequest",
      },
      body: "ajax=1&slot=phone2&type=phoneboss2",
      method: "POST",
      mode: "cors",
      credentials: "include",
    }
  );
}

export async function joinGypsy() {
  const gypsyCooldown = await getElementsOnThePage(
    "#divSignInCampBattle ",
    "camp/gypsy/"
  );
  if (!gypsyCooldown) {
    showAlert(
      "Бой с Вождем. ☄️",
      "Нету боя в данный момент. Попробуйте позже."
    );
    return false;
  }
  console.log(gypsyCooldown);

  $.post(
    "/camp/gypsy/",
    { action: "gypsyJoinFight" },
    function (data) {
      if (data.return_url) {
        document.location.href = data.return_url;
      }
      if (!Gypsy.showError(data)) {
        Gypsy.renderBattleState(data.battle);
      }
    },
    "json"
  );
}

export async function playGypsy() {
  await fetch(new URL(window.location.href).origin + "/camp/gypsy/", {
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer: new URL(window.location.href).origin + "/camp/gypsy/",
    body: "action=gypsyStart&gametype=0",
    method: "POST",
    mode: "cors",
    credentials: "include",
  });

  await fetch(new URL(window.location.href).origin + "/camp/gypsy/", {
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer: new URL(window.location.href).origin + "/camp/gypsy/",
    body: "action=gypsyAuto",
    method: "POST",
    mode: "cors",
  });

  AngryAjax.goToUrl("/camp/gypsy/");
}

function searchInventory(query, inventory) {
  query = query.toLowerCase();
  return Object.values(inventory).filter((item) =>
    item.name.toLowerCase().includes(query)
  );
}

function formatStackList(stackList) {
  return Object.values(stackList).map((entry) => ({
    expiryDate: entry[0],
    count: Number(entry[1]),
    itemId: entry[3],
  }));
}

async function tradeSiri(itemId) {
  await fetch(
    new URL(window.location.href).origin + "/phone/call/tradeItemView/",
    {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-ch-ua": '"Not:A-Brand";v="24", "Chromium";v="134"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
      },
      body: `ajax=1&item=${itemId}&slot=phone3`,
      method: "POST",
      mode: "cors",
      credentials: "include",
    }
  );

  const res = await fetch(
    new URL(window.location.href).origin + "/phone/call/giveItem/",
    {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
      },
      referrer: new URL(window.location.href).origin + "/phone/call",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: "ajax=1&slot=phone3",
      method: "POST",
      mode: "cors",
      credentials: "include",
    }
  );

  const data = await res.text();
  const { prize } = JSON.parse(data);
  console.log(prize);
  return $(`<div class="prize-container">${prize}</div>`);
}

export async function tradeAllSiri() {
  const inventory = await useItem(0);

  const siris = searchInventory("сири", inventory)[0];
  const siriStack = formatStackList(siris.stackList);
  console.log(siriStack);

  for (const item of siriStack) {
    for (let i = 0; i < item.count; i++) {
      // console.log(item);
      await tradeSiri(item.itemId);
    }
  }
}
