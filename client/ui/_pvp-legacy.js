/* global AngryAjax, $, showAlert, showConfirm, groupFightMakeStep,  */

export let OPTIONS = {
  // если вы готовы пожертвовать 2% славы, то задайте значение 0.02:
  // если теоретический макс 1000, то -2% значит что вы готовы атаковать противника
  // у которога теоретическая макс слава 980 ... 1000
  gloryLossCoefficient: 0.02,

  // список целей для "Поиска Сильных"
  targets: [
    "МоСкВиЧкА",
    "Коди Бакстер",
    "error 404",
    "KREATOR_007",
    "_Татарин_",
    "Реактивный",
    "Kitsune",
    "Федор Мармеладович",
    "Чудо Юдо",
    "Sid_Ss",
    "Квазимодыч",
    "чешинога",
  ],
};

function getOpponent() {
  try {
    let name = document.querySelector(".worldtour__enemy-nickname").innerText;
    let rewards = getPointsReward(document);

    return {
      name,
      ...rewards,
    };
  } catch (error) {
    showAlert("Could not get opponent name.");
    return;
  }
}
async function delay(seconds = 1) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function getPvpTicketsCount() {
  try {
    const normal = (
      await getElementsOnThePage(
        `.object-thumb img[src="/@/images/obj/travel/shuffle.png"] + .count`,
        new URL(window.location.href).origin + "/player/"
      )
    ).innerText.slice(1);

    const boss = (
      await getElementsOnThePage(
        `.object-thumb img[src="/@/images/obj/travel/shuffle2.png"] + .count`,
        new URL(window.location.href).origin + "/player/"
      )
    ).innerText.slice(1);

    return { normal, boss };
  } catch (e) {
    console.log("Could not get PvP tickets count.");
  }
}

async function aGetPointsReward() {
  try {
    let maxPoints = +(
      await getElementsOnThePage(
        "#content > div.worldtour-stats > div > p:nth-child(3) > span:nth-child(4)",
        new URL(window.location.href).origin + "/travel2"
      )
    ).innerText.split(" ")[0];

    let victoryPoints = +(
      await getElementsOnThePage(
        "#content > div.worldtour-stats > div > p:nth-child(3) > span:nth-child(1)",
        new URL(window.location.href).origin + "/travel2"
      )
    ).innerText.split(" ")[0];
    return { maxPoints, victoryPoints };
  } catch (error) {
    console.log("[🌎]Could not get PvP points rewards.");
  }
}

function getPointsReward(doc = window.document) {
  try {
    let maxPoints = +doc
      .querySelector(
        "#content > div.worldtour-stats > div > p:nth-child(3) > span:nth-child(4)"
      )
      .innerText.split(" ")[0];

    let victoryPoints = +doc
      .querySelector(
        "#content > div.worldtour-stats > div > p:nth-child(3) > span:nth-child(1)"
      )
      .innerText.split(" ")[0];
    return { maxPoints, victoryPoints };
  } catch (error) {
    console.log("[🌎]Could not get PvP points rewards.");
  }
}

async function checkPointsDiff(lossCoefficient = 0.02) {
  const { maxPoints, victoryPoints } = await aGetPointsReward();
  let threshold = maxPoints * lossCoefficient;
  let diff = maxPoints - victoryPoints;
  if (diff < threshold) {
    return { maxPoints, victoryPoints };
  }

  return false;
}

async function aGetCurrentCountryIndex() {
  try {
    let country = await getElementsOnThePage(
      "#content > div.worldtour-stats > div > h3",
      new URL(window.location.href).origin + "/travel2/"
    );
    let index = country.innerText.match(/\d+/)[0];

    return +index;
  } catch (e) {
    console.log("Could not get current country index.");
  }
}

function getCurrentCountryIndex() {
  try {
    let countryIndex = +document
      .querySelector("#content > div.worldtour-stats > div > h3")
      .innerText.match(/\d+/)[0];

    return countryIndex;
  } catch (e) {
    console.log("Could not get current country index.");
  }
}

function getHelpersIds() {
  let helpers = [...document.querySelectorAll(".worldtour-helper")];

  return helpers
    .map((helper) => {
      const onclickString = helper
        .querySelector("div.worldtour-helper__stats > div > span > button")
        .getAttribute("onclick");
      if (!onclickString) return;
      return onclickString.match(
        /Worldtour2\.mfHelper\((\d+)\s*,\s*(\d+)\)/
      )[1];
    })
    .filter(Boolean);
}

async function modifyHelper(helperId) {
  await fetch(new URL(window.location.href).origin + "/travel2/", {
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer: new URL(window.location.href).origin + "/travel2/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: `action=helper_mf&helper_id=${helperId}&ajax=1&__referrer=%2Ftravel2%2F&return_url=%2Ftravel2%2F`,
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
}

async function maxOutHelpers(count = 5) {
  if (AngryAjax.getCurrentUrl() !== "/travel2/") {
    AngryAjax.goToUrl("/travel2/");
  }

  const helpers = getHelpersIds();

  const promises = Array.from({ length: 20 }).flatMap(() =>
    helpers.slice(0, count).map(async (id) => {
      if (id) {
        await modifyHelper(id);
      }
    })
  );

  await Promise.all(promises);
  AngryAjax.goToUrl("/travel2/");

  showAlert(
    "Всё правильно сделал!",
    `Помошники (${count}) успешно улучшены! <br>`
  );
}

async function goToLevel(level) {
  try {
    await fetch(new URL(window.location.href).origin + "/travel2/", {
      headers: {
        accept: "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,ru;q=0.7,ro;q=0.6",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
      },
      referrer: new URL(window.location.href).origin + "/travel2/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: `action=get_level&getLevel=${level}&ajax=1&__referrer=%2Ftravel2%2F&return_url=%2Ftravel2%2F`,
      method: "POST",
      mode: "cors",
      credentials: "include",
    });

    return AngryAjax.goToUrl("/travel2/");
  } catch (e) {
    console.log("Could not go to level.");
  }
}

async function goNextLevel() {
  const currentIndex = await aGetCurrentCountryIndex();
  if (currentIndex >= 28) {
    console.log("Highest level reached.");
    return;
  }
  await goToLevel(currentIndex + 1);
}

async function goPreviousLevel() {
  const currentIndex = await aGetCurrentCountryIndex();
  if (currentIndex <= 1) {
    console.log("Lowest level reached.");
    return;
  }
  await goToLevel(currentIndex - 1);
}

function getMaxCountryIndex() {
  try {
    return [...document.querySelector("#travel-2-country")]
      .pop()
      .innerText.split(".")[0];
  } catch (error) {
    console.log("Could not get max level. Error:", error);
  }
}

function canAttack() {
  const attackBtn = document.querySelector(".worldtour__button-big");

  return !attackBtn.classList.contains("disabled");
}

async function makeTurn(turns = 10) {
  if (!AngryAjax.getCurrentUrl().includes("fight")) return;

  for (let i = 0; i < turns; i++) {
    const isFightOver = document.querySelector("#fight-actions > div.waiting");
    console.log(isFightOver);
    if (isFightOver) {
      checkLastFightLost();
      return;
    }
    console.log("Making turn...");
    groupFightMakeStep();
    AngryAjax.reload();
    await delay(0.5);
  }
}

function checkLastFightLost() {
  const fightLost =
    document
      .querySelector("#fightGroupForm > h3 > div.group1")
      .innerText.split(" ")[1]
      .slice(1, -1)
      .split("/")[0] === "0";

  lostLastFight = fightLost;
  return fightLost;
}

async function rollTargetOpponent() {
  if (!OPTIONS.targets || OPTIONS.targets.length === 0) {
    showAlert("Ошибка!", "Укажите список целей для поиска сильных.");
    return;
  }
  let { name, maxPoints, victoryPoints } = getOpponent();
  try {
    for (let i = 0; i <= 10; i++) {
      if (!name) {
        throw new Error("Nickname not found");
      }
      console.log("[📁pvp.js:175] ", name, maxPoints, victoryPoints);

      if (OPTIONS.targets.includes(name)) {
        showConfirm(
          `<b>${name}</b> <br> За победу вы получите <b>${victoryPoints}</b> / <b>${maxPoints}</b> очков! (${maxPoints - victoryPoints})`,
          [
            {
              title: "Напасть!",
              callback: handleFarmStrongHelpers,
            },
            {
              title: "Отмена",
              callback: function (obj) {
                closeAlert(obj);
              },
            },
          ],
          { __title: "Противник найден!" }
        );
        return;
      }

      showAlert(
        `Поиск достойного противника`,
        `Попытка ${i + 1}: <b>${name}</b>.<br>Ищем дальше...`
      );
      let opponent = await rollPvp(i === 0); // First reroll for boss
      name = opponent.name;
      maxPoints = opponent.maxPoints;
      victoryPoints = opponent.victoryPoints;
    }
    showConfirm(
      "Никого из списка не нашел. Дальнейшие действия?",
      [
        {
          title: "Продолжить поиск!",
          callback: rollTargetOpponent,
        },
        {
          title: "Отмена",
          callback: function (obj) {
            closeAlert(obj);
          },
        },
      ],
      { __title: "Без успеха... :(" }
    );
  } catch (e) {
    console.log("Could not search for opponent:\n", e);
  }
}

async function rollByMaxPoints() {
  if (AngryAjax.getCurrentUrl() !== "/travel2/") {
    AngryAjax.goToUrl("/travel2/");
  }

  try {
    const maxPoints = document.querySelector(
      "#content > div.worldtour-stats > div > p:nth-child(3) > span:nth-child(4)"
    ).innerText;
    let opponent = getOpponent();
    let lossThreshold = maxPoints * OPTIONS.gloryLossCoefficient;

    for (let i = 0; i <= 10; i++) {
      console.log("[📁pvp.js:251] opponent:", opponent);
      const victoryLoss = maxPoints - opponent.victoryPoints;
      if (victoryLoss < lossThreshold) {
        // FOUND!
        showConfirm(
          `<b>${opponent.name}</b> <br> За победу вы получите <b>${opponent.victoryPoints}</b> / <b>${maxPoints}</b> очков! (${maxPoints - opponent.victoryPoints})`,
          [
            {
              title: "Напасть!",
              callback: handleFarmStrongHelpers,
            },
            {
              title: "Отмена",
              callback: function (obj) {
                closeAlert(obj);
              },
            },
          ],
          { __title: "Противник найден!" }
        );
        return;
      }

      // keep searching
      showAlert(
        `Поиск противника с максимум славой`,
        `Попытка ${i + 1}: <b>${opponent.name}</b> (<b>${opponent.victoryPoints}</b>).<br>Ищем дальше в диапазоне (<span class="dpoints"><i></i> ${Math.floor(maxPoints - lossThreshold)} ... ${maxPoints}</span>)`
      );
      opponent = await rollPvp(i === 0); // First reroll for boss
    }

    // NOT FOUND after 10 retries... next steps?!
    showConfirm(
      "Не удалось найти противника с максимум славы. Дальнейшие действия?",
      [
        {
          title: "Продолжить поиск!",
          callback: rollTargetOpponent,
        },
        {
          title: "Отмена",
          callback: function (obj) {
            closeAlert(obj);
          },
        },
      ],
      { __title: "Без успеха... :(" }
    );
  } catch (e) {
    console.log("Could not search for opponent:\n", e);
  }
}

async function rollPvp(top = false) {
  if (pvpTickets.boss < 50) {
    showAlert(
      "Билеты заканчиваются!",
      `У вас осталось <span class="shuffle2">${pvpTickets.boss}<i></i></span> билетов для Поиска Топ 20. <br> Попробуйте позже, или снимите ограничение.`
    );
    throw new Error("Not enough boss tickets!");
  }
  if (pvpTickets.normal < 100) {
    showAlert(
      "Билеты заканчиваются!",
      `У вас осталось <span class="shuffle">${pvpTickets.boss}<i></i></span> билетов для смены противника. <br> Попробуйте позже, или снимите ограничение.`
    );
    throw new Error("Not enough normal tickets!");
  }
  try {
    let res = await fetch(new URL(window.location.href).origin + "/travel2/", {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9,ru;q=0.8",
        "cache-control": "max-age=0",
        "content-type": "application/x-www-form-urlencoded",
        "upgrade-insecure-requests": "1",
      },
      referrer: new URL(window.location.href).origin + "/travel2/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: `action=roll${top ? "2" : ""}&ajax=1&__referrer=%2Ftravel2%2F&return_url=%2Ftravel2%2F`,
      method: "POST",
      mode: "cors",
      credentials: "include",
    });

    let resHtmlStr = await res.text();
    let resHtml = parseHtml(resHtmlStr);
    let name = resHtml.querySelector(".worldtour__enemy-nickname").innerText;
    let pointsReward = getPointsReward(resHtml);

    if (top) {
      pvpTickets.boss--;
    } else {
      pvpTickets.normal--;
    }

    return { name, ...pointsReward };
  } catch (e) {
    console.log("Could not reroll PvP.");
    return false;
  }
}

async function speedRun() {
  if (AngryAjax.getCurrentUrl() !== "/travel2/") {
    console.log("[PVP] Not on Travel2 page. Navigating there...");
    AngryAjax.goToUrl("/travel2/");
  }

  const currentCountryIndex = getCurrentCountryIndex();
  const maxCountryIndex = getMaxCountryIndex();

  if (currentCountryIndex == maxCountryIndex) {
    showAlert(
      "Вы уже на последнем уровне!",
      "Перейдите в другую страну чтобы начать спидран. <br>"
    );
    return;
  }

  console.log("[PVP] Speedrun started.");
  restoreHP();

  await pvpStartFight();
  $(document).one("ajaxStop", () => setTimeout(handlePvpFight, 1000));
  $(document).one("endOfTurn", () => setTimeout(speedRun, 3000));
}

async function handleSpeedrun() {
  if (!AngryAjax.getCurrentUrl().includes("fight")) {
    console.log("NOT IN FIGHT");
    return;
  }

  // $(document).off("ajaxStop", handleSpeedrun);
  console.log("[PVP] Speedrun started.");
  await handlePvpFight();
}

async function farmStrongHelpers() {
  if (!AngryAjax.getCurrentUrl() !== "/travel2/") {
    AngryAjax.goToUrl("/travel2/");
  }

  await rollTargetOpponent();
}

async function handleFarmStrongHelpers() {
  $(document).one("ajaxStop", handlePvpFight); // Attach handler to trigger only once
  Worldtour2.startFight();
  await delay(2);
  // if (!AngryAjax.getCurrentUrl().includes("fight")) {
  //   console.log("NOT IN FIGHT");
  //   return;
  // }
  // await handlePvpFight();
}

async function handleFarmStars() {
  if (!AngryAjax.getCurrentUrl().includes("fight")) {
    console.log("NOT IN FIGHT");
    return;
  }

  $(document).off("ajaxStop", handleFarmStars);
  console.log("[PVP] Farming stars.");
  await handlePvpFight();
  // await goToTravel();
  // await delay(5);
  // await farmStars();
}

async function getElementsOnThePage(selector, url) {
  const response = await fetch(url);
  const data = await response.text();

  const doc = parseHtml(data);
  const elements = doc.querySelectorAll(selector);

  if (elements.length === 0) return undefined;

  return elements.length === 1 ? elements[0] : Array.from(elements);
}

function parseHtml(htmlString) {
  const parser = new DOMParser();

  const cleanedHtmlString = htmlString
    .replace(/\\&quot;/g, '"') // Handle escaped quotes if they exist
    .replace(/\\"/g, '"'); // Normalize double-escaped quotes

  const doc = parser.parseFromString(cleanedHtmlString, "text/html");

  return doc;
}

function strToHtml(htmlString) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlString.trim();
  return tempDiv.firstChild;
}

async function farmStars() {
  if (AngryAjax.getCurrentUrl() !== "/travel2/") {
    console.log("[PVP] Not on Travel2 page. Navigating there...");
    AngryAjax.goToUrl("/travel2/");
  }

  let prevCountry = getCurrentCountryIndex();

  console.log(`[PVP] ⭐️ Farming stars in ${prevCountry}.`);
  restoreHP();

  await pvpStartFight();
  $(document).one("ajaxStop", () => setTimeout(handlePvpFight, 1000));
  $(document).one("endOfTurn", () => setTimeout(farmStars, 1000));
  // $(document).one("endOfTurn", farmStars);
}
// modify the default to redirect to travel2 after fight is over
function groupFightAjaxCheck() {
  // eslint-disable-next-line no-undef
  noAjaxLoader = true;
  $.post("/fight/", { checkBattleState: 1 }, function (data) {
    // eslint-disable-next-line no-undef
    noAjaxLoader = false;
    if (data == 1) {
      //if ($.cookie("userid") == 4158644) {
      AngryAjax.goToUrl(AngryAjax.getCurrentUrl());
      setTimeout(onEndOfTurn, 1000);

      //} else {
      //	document.location.href = AngryAjax.getCurrentUrl().replace(/#/, "");
      //}
    } else {
      $("#waitdots").html(
        Array((($("#waitdots").text().length + 1) % 4) + 1).join(".")
      );
      window.AngryAjax.setTimeout(groupFightAjaxCheck, 1000);
    }
  });
}
