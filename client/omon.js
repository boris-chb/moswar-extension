/* global $  AngryAjax */
function groupFightAjaxCheck() {
  // eslint-disable-next-line no-undef
  noAjaxLoader = true;
  $.post("/fight/", { checkBattleState: 1 }, function (data) {
    // eslint-disable-next-line no-undef
    noAjaxLoader = false;
    if (data == 1) {
      AngryAjax.reload();
      setTimeout(handleOmonTurn, 3000);
    } else {
      $("#waitdots").html(
        Array((($("#waitdots").text().length + 1) % 4) + 1).join(".")
      );
      window.AngryAjax.setTimeout(groupFightAjaxCheck, 1000);
    }
  });
}

let ABILITY_USED = false;

let INVENTORY_MAP = {
  coconut: "/@/images/obj/gifts2023/coconut.png",
  helmet: "/@/images/obj/helmet_mf1.png",
  cheese: "/@/images/obj/gifts2023/cheese.png",

  // shamanFood: "?????",
};

let SELECTORS = {
  inventory:
    "#fightGroupForm > table > tbody > tr > td.log > div.log-panel > div:nth-child(1) > table > tbody > tr > td > li > label > img",
  abilities:
    "#fightGroupForm > table > tbody > tr > td.log > div.log-panel > div.fight-slots-ability.fight-slots.clear > table > tbody > tr > td > li > label > img",
};

let ABILITIES_IDS = {
  air: 478,
  jump: 470,
  northstream: 449,
  twiceAsNice: 383,
};

function getInventory() {
  const fightSlots = $(".fight-slots.clear").filter(function () {
    return $(this).find(".log-panel-title").text().trim() === "Боевые предметы";
  });

  const itemsImgs = fightSlots.find("li.filled img").toArray();

  if (!itemsImgs) {
    console.log("Could not find inventory.");
    return;
  }

  let items = {};

  itemsImgs.forEach((img) => {
    const src = img.getAttribute("src");
    const id = img.getAttribute("data-id");

    for (const [key, value] of Object.entries(INVENTORY_MAP)) {
      if (value === src) {
        items[key] = id;
        break;
      }
    }
  });

  return items;
}

function getAbilities() {
  let activeAbilities = $(".fight-slots-ability label img")
    .filter(function () {
      return $(this).siblings("b").find("input[type='radio']").length > 0;
    })
    .map(function () {
      return $(this).attr("data-id");
    })
    .get();

  return activeAbilities;
}

async function handleOmonTurn() {
  const currentTurn = getCurrentTurn();
  const abilities = getOmonAbilities();
  const inv = getInventory();

  if (currentTurn < 9 && inv.cheese) {
    console.log(`[⚔️🪖] ОМОН ХОД ${currentTurn}: СЫР 🧀`);
    await useItem(inv.cheese);
  } else if (currentTurn === 9) {
    console.log(`[⚔️🪖] ОМОН ХОД ${currentTurn}: АБИЛКА ВОЗДУХ 💨`);
    await useAbility(abilities.air);
  } else if (currentTurn > 9) {
    // INVENTORY ONLY during first turns
    if (inv.helmet) {
      console.log(`[⚔️🪖] ОМОН ХОД ${currentTurn}: КАСКА 🪖`);
      await useItem(inv.helmet);
    } else if (inv.coconut) {
      console.log(`[⚔️🪖] ОМОН ХОД ${currentTurn}: КОКОС 🥥`);
      await useItem(inv.coconut);
    }
  } else if (currentTurn >= 35 && !ABILITY_USED) {
    // no more inventory after turn 35 => use ability
    if (!inv.helmet && !inv.coconut) {
      if (abilities.northstream) {
        await useAbility(abilities.northstream);
        console.log(`[⚔️🪖] ОМОН ХОД ${currentTurn}: АБИЛКА ИЗЛЕЧЕНИЕ ❤️‍🩹`);
      } else if (abilities.jump) {
        console.log(`[⚔️🪖] ОМОН ХОД ${currentTurn}: АБИЛКА ПРИЖОК 🦘`);
        await useAbility(abilities.jump);
      }
      ABILITY_USED = true;
    }
  } else {
    console.log(
      `[⚔️🪖] ОМОН ХОД ${currentTurn}: АБИЛКИ ПРОЖАТЫ. ИНВЕНТАРЬ ПУСТ. СКИП... 🤷`
    );
  }

  $(".log-panel").prepend($(".fight-slots-actions"));
  console.log("abilities:", abilities);
  console.log("inventory:", inv);
  // }
}

function getOmonAbilities() {
  let activeAbilities = getAbilities();
  let mappedAbilities = {};

  Object.entries(ABILITIES_IDS).forEach(([key, value]) => {
    if (activeAbilities.includes(value.toString())) {
      mappedAbilities[key] = value;
    }
  });

  return mappedAbilities;
}

function getSuperhits() {
  return $(".superhits-menu .superhit-wrapper:not(.disabled)").toArray();
}

function getCurrentTurn() {
  try {
    let currentTurn = document.querySelector(
      "#fightGroupForm > div > div > strong.current"
    ).innerText;

    if (currentTurn === "Начало") {
      currentTurn = 0;
    }

    return +currentTurn + 1;
  } catch (error) {
    console.log("Could not get current turn.");
  }
}

async function useItem(itemId) {
  await fetch(new URL(window.location.href).origin + "/fight/", {
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: `action=useitem&json=1&target=${itemId}`,
    method: "POST",
    credentials: "include",
  });
}

async function useAbility(id) {
  await fetch(new URL(window.location.href).origin + "/fight/", {
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: `action=useabl&json=1&target=${id}`,
    method: "POST",
    credentials: "include",
  });
}

async function checkDead() {
  let me = await utils_.getElementsOnThePage(
    "li.me",
    AngryAjax.getCurrentUrl()
  );

  return me.classList.contains("dead");
}

async function omon() {
  const { turn, secondsLeft } = await getCurrentTurn();
  const imDead = await checkDead();

  if (imDead) {
    console.log("👮🏿‍♂️ Y O U  D I E D.\n Ending OMON...");
    clearTimeout(gameLoopId);
    return;
  }

  if (turn > 10) {
    console.log("using air ability");
    await useAbility(ABILITIES_MAP.air);
  }

  console.log("turn finished", turn, "\nseconds left", secondsLeft);
  gameLoopId = setTimeout(() => omon(), (secondsLeft + 2) * 1000);
}

// meetings
async function joinMeetings() {
  await fetch(new URL(window.location.href).origin + "/meetings/", {
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: "action=signup&ajax=1",
    method: "POST",
    credentials: "include",
  });

  // await delay();

  await fetch(new URL(window.location.href).origin + "/meetings/", {
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: "action=findPair&ajax=1",
    method: "POST",
    credentials: "include",
  });
}

function parseHtml(htmlString) {
  const parser = new DOMParser();

  const cleanedHtmlString = htmlString
    .replace(/\\&quot;/g, '"') // Handle escaped quotes if they exist
    .replace(/\\"/g, '"'); // Normalize double-escaped quotes

  const doc = parser.parseFromString(cleanedHtmlString, "text/html");

  return doc;
}

async function getElementsOnThePage(selector, url) {
  const response = await fetch(url);
  const data = await response.text();

  const doc = await parseHtml(data);
  const elements = doc.querySelectorAll(selector);

  if (elements.length === 0) return undefined;

  return elements.length === 1 ? elements[0] : Array.from(elements);
}
