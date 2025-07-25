/* global $ showAlert  countdown AngryAjax fightForward  moswar player setEnergy  */

import { playBlackjack } from "../../src/locations/casino.js";
import {
  chaoticFightMode,
  checkBronikPieces,
  eatSnickers,
  farm,
  joinPahan,
  metroWorkMode,
  patrolMode,
  playGypsy,
  signUpForDeps,
  signUpForSiri,
  trackRatMode,
  tradeAllSiri,
  workMode,
} from "../alley.js";
import { carBringupMode, sortGarage } from "../cars.js";
import {
  addClanToEnemies,
  payEmerald,
  sortClanPlayersByCoolness,
} from "../clan.js";
import { eatSilly, getStats, restoreHP } from "../dopings.js";
import startDungeon from "../dungeon-solo.js";
import { boostClan, joinProt } from "../group-fight.js";
import { redrawPetarena } from "../pets.js";
import { skipPvpFight, initPvpUI } from "../pvp.js";
import { handleModifyManyTattoos } from "../tattoo.js";
import { formatNumber, getElementsOnThePage, strToHtml } from "../utils.js";
import {
  initEatDops,
  initMultiItemUI,
  LEGACY_initGroupFightLogs,
} from "./_legacy.js";
import { createButton, createNumberAction } from "./button.js";
import {
  enhanceGroupFightLogs,
  redrawLogsPagination,
  sortGroupFightPlayers,
} from "./logs.js";
import { phoneSpeedUp } from "./phone.js";
import { createPopover } from "./popover.js";

const ASSISTANT_BTN_PROPS = [
  {
    text: "🍔",
    title: "Работа и патруль",
    onClick: async () => {
      await workMode(1);
      await patrolMode(10);
    },
  },
  {
    text: "🐀",
    title: "Крысы автопилот",
    onClick: async () => await trackRatMode(5),
  },
  {
    text: "💵",
    title: "Показать валюту",
    className: "show-currency",
    onClick: async (event) => {
      let btn = event.currentTarget; // Get the clicked button
      let $currencyContainer = await getCurrencyContainer();

      if ($("#currency-container").length) {
        $("#currency-container").replaceWith($currencyContainer);
      } else {
        $currencyContainer.hide();
        $(btn).parent().append($currencyContainer);
        $currencyContainer.slideToggle();
      }
    },
    disableAfterClick: false,
  },
  // { text: "♉️", title: "Зодиак", onClick: async () => await zodiacMode() },
  {
    text: "🔮",
    title: "Сири отложка (за 3 секунды)",
    onClick: async () => await signUpForSiri(),
  },
  {
    text: "🅿️",
    title: "Дэпс отложка (за 10 минут)",
    onClick: async () => await signUpForDeps(),
  },
  {
    text: "🔱",
    title: "Бой с Паханом",
    onClick: async () => {
      if (confirm("Записаться на пахана?")) {
        joinPahan();
      }
    },
    disableAfterClick: false,
  },
  {
    text: "👊",
    title:
      "50 боев в закоулки оборотнем (уровень оборотня - 1)\nнужны: оборотень + мажор + сникерсы/тонус)",
    onClick: async () => await farm(50),
    disableAfterClick: false,
  },
  {
    text: `<img src="/@/images/obj/jobs/item6.png" style="width: 16px; height: 16px; transform: scale(1.5);">`,
    onClick: eatSnickers,
    title: "Кушать сникерс",
    disableAfterClick: false,
  },
  {
    text: "🗼",
    title: "Турель + металлодетектор (если есть)",
    onClick: async () => {
      await fetch("/turret/23018/", {
        headers: {
          accept: "*/*",
          "accept-language": "en-GB,en;q=0.9",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
        },
        referrer: new URL(window.location.href).origin + "/turret/23018/",
        body: "action=search&__ajax=1&return_url=%2Fturret%2F23018%2F",
        method: "POST",
        mode: "cors",
      });

      await fetch(new URL(window.location.href).origin + "/turret/23018/", {
        headers: {
          accept: "*/*",
          "accept-language": "en-GB,en;q=0.9",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
        },
        referrer: new URL(window.location.href).origin + "/turret/23018/",
        body: "action=metaldetector&__ajax=1&return_url=%2Fturret%2F23018%2F",
        method: "POST",
        mode: "cors",
      });

      await fetch(new URL(window.location.href).origin + "/turret/23018/", {
        headers: {
          accept: "*/*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "x-requested-with": "XMLHttpRequest",
        },
        referrer: new URL(window.location.href).origin + "/turret/23018/",
        body: "action=install",
        method: "POST",
        mode: "cors",
        credentials: "include",
      });

      AngryAjax.goToUrl(AngryAjax.getCurrentUrl());
    },
  },
  {
    text: "🤺",
    title: "Запись на хаот за 30 секунд до боя, каждые 15 минут.",
    onClick: chaoticFightMode,
  },
  {
    text: "👔",
    title: "Запись на прот.\n(Вокзальный)",
    onClick: joinProt,
    disableAfterClick: false,
  },
  {
    text: "⚡️",
    title: "Прилив бодрости (Банзай!).",
    onClick: boostClan,
    disableAfterClick: false,
  },
  {
    text: "⛏️",
    title: "Спуск в метро каждые 10 минут. (Коллекция Шелкунчик)",
    onClick: async () => await metroWorkMode(),
  },
  {
    text: "🚩",
    title: "Собираем детали Бронепоезда Революции",
    onClick: async () => await checkBronikPieces(),
  },
  {
    text: "🕳️",
    title: "Одиночная подземка, автопрохождение",
    onClick: startDungeon,
  },
];

const NAVLINKS = [
  { href: "/dungeon", text: "🕳️ Подземка" },
  { href: "/neftlenin/", text: "🛢️ Нефть" },
  { href: "/metro/", text: "🐀 Крысы" },
  { href: "/bank/", text: "🏦 Банк" },
  { href: "/square/tvtower/", text: "📺 ТВ" },
  { href: "/nightclub/", text: "🪩 Клуб" },
  { href: "/huntclub/wanted/", text: "🎯 ОК" },
  { href: "/home/relic/", text: "🧩 Реликты" },
  { href: "/camp/gypsy/", text: "✨ Цыганка" },
  { href: "/berezka/section/mixed/", text: "🛍️ Березка" },
  { href: "/metrowar/clan/", text: "🚇 Метровар" },
  { href: "/sovet/career/", text: "👔 ГосПром" },
  { href: "/meetings/team/", text: "🪧 Миты" },
  { href: "/petarena/", text: "🦮 Петы" },
  { href: "/squid/", text: "🦑 Кальмар" },
  { href: "/travel2/", text: "🌍 Рейды" },
  { href: "/automobile/ride/", text: "🚕 Поездка" },
];

export function sendAlert({ title, img, text }) {
  const container = $("<div>").css({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "8px",
    borderRadius: "5px",
    overflow: "hidden",
  });

  const message = $("<span>").text(text);
  const image = $("<img>").attr("src", img).css({
    width: "84px",
    height: "84px",
    objectFit: "cover",
    objectPosition: "right",
  });

  if (img) {
    container.append(image);
  }

  container.append(message);

  showAlert(title, container.prop("outerHTML"));
}

export async function renderPanel() {
  try {
    let $assistantContainer = $('<div id="assistant-container"></div>').css({
      position: "absolute",
      display: "flex",
      maxWidth: "120px",
      maxHeight: "600px",
      height: "auto",
      gap: "20px",
      flexDirection: "column",
      alignItems: "flex-end",
      backgroundColor: "rgb(255, 244, 225)",
      top: "258px",
      padding: "12px 10px",
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: "rgb(209, 148, 92)",
      borderRadius: "12px",
      zIndex: "999999",
    });

    $(".body-bg").append($assistantContainer);

    $assistantContainer.hide(); // hidden by default
    $(document).on("click", () => $assistantContainer.hide());

    $assistantContainer.on("click", (e) => e.stopPropagation());

    $(document).on("contextmenu", (event) => {
      event.preventDefault();
      $assistantContainer
        .css({ left: event.pageX, top: event.pageY })
        .slideToggle("fast");
    });

    let $autopilotBtnContainer = $('<div id="assistant-autopilot"></div>').css({
      display: "flex",
      gap: "8px",
      width: "100%",
      minWidth: "80px",
      flexWrap: "wrap",
      justifyContent: "space-around",
    });

    ASSISTANT_BTN_PROPS.forEach(
      ({ text, title, onClick, condition, disableAfterClick }) => {
        if (condition === false) return;
        let $btn = createButton({
          text,
          title,
          onClick,
          disableAfterClick,
        });

        $autopilotBtnContainer.append($btn);
      }
    );

    $assistantContainer.append($autopilotBtnContainer);
  } catch (e) {
    console.log("Не удалось нарисовать панель навигации.\n", e);
  }
}

export async function renderNavbar() {
  if ($("#navbar-links").length > 0) return;
  let $navLinks = $('<div id="navbar-links" class="borderdata"></div>').css({
    display: "flex",
    position: "sticky",
    top: "8px",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "16px 32px",
    alignItems: "center",
    padding: "10px 12px",
    zIndex: "102",
    border: "2px solid #ffd591",
    background: "#f9f6ec",
    borderRadius: "8px",
    margin: "14px",
    boxShadow: "rgba(0, 0, 0, 0.25) 0px 0px 8px 4px",
  });

  // const cosmodromeBtn = await getElementsOnThePage(
  //   "#square-stadium-button > a",
  //   new URL(window.location.href).origin + "/tverskaya/"
  // );

  // const comsodromeOnClickHandler = () => {
  //   if (cosmodromeBtn) {
  //     eval(cosmodromeBtn.getAttribute("onclick"));
  //   }
  // };

  // links.push({
  //   text: "🚀 Космодром",
  //   onClick: comsodromeOnClickHandler,
  // });

  NAVLINKS.forEach(({ href, text, onClick }) => {
    let $a = $("<a></a>").text(text).css("text-decoration", "none");

    if (onClick) {
      $a.attr("href", "#").on("click", (e) => {
        e.preventDefault();
        onClick();
      });
    } else {
      $a.attr({ href, onclick: "return AngryAjax.goToUrl(this, event);" });
    }

    $navLinks.append($a);
  });

  let mainBlock = $("#main");
  mainBlock.children().eq(1).before($navLinks);
}

async function getCurrencyContainer() {
  let borderdata = await getElementsOnThePage(
    ".borderdata",
    "/berezka/section/mixed/"
  );

  let container = $('<div id="currency-container"></div>');
  container.css({
    width: "100%",
    "min-width": "120px",
    display: "flex",
    "flex-wrap": "wrap",
    gap: "12px 2px",
    "justify-content": "space-between",
  });

  const currency = [
    ...Array.from(borderdata.children),
    // ...playerPageCurrency,
  ].map((span) => {
    const originalText = span.innerText;
    const number = parseInt(originalText.replace(/[^0-9]/g, ""), 10);

    if (!isNaN(number)) {
      span.title = originalText;

      // format & reinsert the icon
      span.innerHTML = formatNumber(number) + span.querySelector("i").outerHTML;
    }
    $(span).css({
      display: "inline-flex",
      alignItems: "center",
    });

    return span;
  });

  container.empty().append(currency);
  return container;
}

export async function redrawMain() {
  // eslint-disable-next-line
  if (AngryAjax.getCurrentUrl() !== "/player/") {
    return;
  }

  if (location.pathname.search(/\/player\/$/) !== -1) {
    initMultiItemUI();
  }

  function expandInventory() {
    document.querySelector(
      "#content > table.inventary > tbody > tr > td.equipment-cell > div"
    ).style.width = "577px";
    document.querySelector(
      "#content > table.inventary > tbody > tr > td.equipment-cell > div > dl"
    ).style.width = "577px";
    document.querySelector(
      "#content > table.inventary > tbody > tr > td.equipment-cell > div > dl > dd"
    ).style.width = "577px";
  }

  function expandDopings() {
    document.querySelector("#dopings-accordion").style.width = "80px";
    document.querySelector("#dopings-accordion > dd").style.width = "80px";
    $("#dopings-accordion > dd > .object-thumbs").css({ height: "955.5px" });

    if ($(".action.use-all-siri").length) {
      return;
    }

    const div = $(`
      <div class="action use-all-siri"><span>обмен все</span></div>
    `);

    div.on("click", async () => {
      if (div.hasClass("disabled")) return;

      div.addClass("disabled");

      await tradeAllSiri();

      div.removeClass("disabled");
    });

    $(
      '.object-thumbs[htab="inventory"] img[src="/@/images/obj/phones/siri_64.png"]'
    )
      .parent()
      .append(div);
  }

  function expandPetTab() {
    document.querySelector("#pet-accordion").style.width = "220px";
    document.querySelector(
      "#pet-accordion > dd > div.object-thumbs"
    ).style.width = "220px";
  }

  function modifyPayEmerald() {
    const $target = $(`img[data-st='10483']`).closest(".padding");
    const count = parseInt($target.find(".count").text().replace("#", ""), 10);
    $target
      .find(".action span")
      .text("внести")
      .parent()
      .removeAttr("onclick")
      .on("click", async () => {
        await payEmerald(count);

        AngryAjax.reload();
        sendAlert({
          title: "Все правильно сделал!",
          text: `Вы внесли ${count} изумрудов.`,
          img: "/@/images/obj/clan/emerald.png",
        });
      });
  }

  function sortInventory() {
    const topItems = [14820, 10292, 8799, 813, 10097, 14730, 3347, 4020];
    const container = $('.htabs-submenu[rel="inventory"]').first();
    const fragments = $();

    topItems.forEach((id) => {
      const item = $(`.object-thumb:has(img[data-st='${id}'])`);
      if (item.length) fragments.push(item[0]);
    });

    container.after(fragments);
  }

  // eslint-disable-next-line no-undef
  const inventoryContainer = document.querySelector(
    "#content > table.inventary > tbody > tr > td.equipment-cell > div > dl > dd > div:nth-child(1)"
  );

  expandDopings();
  expandInventory();
  expandPetTab();
  initMultiItemUI();
  initEatDops();
  modifyPayEmerald();

  setTimeout(sortInventory, 500);

  if (inventoryContainer && inventoryContainer.offsetHeight < 300) {
    console.log("[i] toggle inventory expand");
    // eslint-disable-next-line
    inventaryExpand.toggle();
  }

  // removePetTab();
}

export function renderCandyCountdown() {
  function parseDate(dateString) {
    const datePattern = /^(\d\d).(\d\d).(\d{4}) (\d\d):(\d\d)$/;
    const match = datePattern.exec(dateString);
    if (match) {
      const [_, day, month, year, hours, minutes] = match;
      return new Date(
        Date.UTC(year, month - 1, day, hours - 3, minutes, 59) // Moscow is UTC+3
      );
    }
    return null;
  }

  function initializeCountdown() {
    let timerSeconds = 0;
    let endTime = 0;

    const findCandyExpiration = async (candyName) => {
      const candyElement = $(".help").find(`.brown:contains("${candyName}")`);
      if (candyElement.length > 0) {
        const expirationText = candyElement.html().split("до ")[1];
        if (expirationText) {
          localStorage["candyExpiration"] = expirationText.split(" —")[0];
        }
      }
    };

    findCandyExpiration("Конфета «Умная»");
    findCandyExpiration("Конфета «Глупая»");

    if (localStorage["candyExpiration"]) {
      const serverTime = Number($("#servertime").attr("rel"));
      const candyEndDate = parseDate(localStorage["candyExpiration"]);
      if (candyEndDate) {
        endTime = Math.round(candyEndDate.getTime() / 1000); // Convert to seconds
        timerSeconds = endTime - serverTime;
      }
    }

    if (timerSeconds < 0) timerSeconds = 0;

    if (!$("#candyTimer")[0] && timerSeconds > 0) {
      $("#personal").prepend(
        `<span id="candyTimer" style="position:absolute;top: -11px;left: 46px;padding: 2px;background-color:rgb(255, 227, 179);border-radius: 8px;border-bottom-right-radius: 0px;border-bottom-left-radius: 0px;border: 2px solid rgb(240 114 53);">
          <span style="display: flex; gap: 2px;" class="expa"><i></i><b id="countdownTimer" timer="${10}" endtime="${endTime}"></b></span>
        </span>`
      );

      countdown("#countdownTimer", 0, false, async function () {
        await eatSilly();
      });
      countdown("#countdownTimer", 0);
    }
  }

  initializeCountdown();
}

export async function aIsGroupFight() {
  return new Promise((resolve) => {
    AngryAjax.goToUrl("/alley/");

    $(document).one("ajaxStop", () => {
      const url = location.pathname;
      resolve(/\/fight\/(?!.*\/alley\/)/.test(url));
    });
  });
}

function redrawTattoo() {
  if ($("#modify-many-container").length) return;
  try {
    $(".tattoo").css("height", "1000px");
    $(".tattoo-slider").css("height", "700px");
    $(".tattoo-slider-slides").css("height", "100%");
    $(".tattoo-slider-slide__container").css("height", "100%");

    const modifyManyContainer = strToHtml(
      '<div id="modify-many-container" style="display: flex; gap: 10px;"></div>'
    );

    [4, 8, 12].forEach((count) => {
      const modifyManyButton = createButton({
        text: `☯️ x${count}`,
        onClick: async () => await handleModifyManyTattoos(count),
        title: `Попробовать самому х${count} раз`,
      });

      modifyManyContainer.appendChild(modifyManyButton);
    });

    createNumberAction({
      action: async () => await handleModifyManyTattoos(1),
      min: 1,
      max: 100,
    });

    $(".tattoo-draft-color-actions").append(modifyManyContainer);
    $(".tattoo-draft-color-actions").append(
      createNumberAction({
        action: async () => await handleModifyManyTattoos(1),
        label: "Попробовать самому",
        min: 1,
        max: 100,
      })
    );
  } catch (e) {
    console.log("could not redraw tattoo");
  }
}

function redrawTVTower() {
  const priorityKeywords = [
    "пельмень",
    "Кубики Московополии",
    "Элемент случайной коллекции",
    "Хрустящие вафли",
    "подземку",
    "Набор ключей",
    "Распылитель для духов",
    "Огненные Коктейли",
    // "Паспорт Китайского Мигранта",
    // "Термопаста",
  ];

  $(".tv-tower-news-tab-content").each(function () {
    const $parent = $(this);
    const $articles = $parent.find(".tv-tower-news-article").toArray();

    $articles.sort((a, b) => {
      const rewardA = $(a).find(".tv-tower-award").text().trim();
      const rewardB = $(b).find(".tv-tower-award").text().trim();

      const hasPriorityA = priorityKeywords.some((keyword) =>
        rewardA.includes(keyword)
      );
      const hasPriorityB = priorityKeywords.some((keyword) =>
        rewardB.includes(keyword)
      );

      return hasPriorityB - hasPriorityA; // Sorts priority items to the top
    });

    $parent.append($articles);
  });
}

function redrawRats() {
  function replaceRatSearch() {
    $("#welcome-rat button:nth-child(3)").replaceWith(
      $("#search_other_rat > div > div > div:nth-child(4)")
        .clone()
        .on("click", function () {
          $(document).one("ajaxStop", function () {
            replaceRatSearch();
            setRatRedirect();
          });
        })
    );
  }

  function setRatRedirect() {
    async function attackRat() {
      await fetch(new URL(window.location.href).origin + "/metro/fight-rat/", {
        headers: {
          accept: "*/*",
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
      });
    }

    $('button[onclick="metroFightRat();"]')
      .removeAttr("onclick")
      .off("click")
      .on("click", async function () {
        await attackRat();
        $(document).one("ajaxStop", async function () {
          if (isGroupFight()) {
            await skipPvpFight();
          }
        });

        AngryAjax.goToUrl("/metro/");
      });
  }

  replaceRatSearch();
  setRatRedirect();
}

function handleEndOfGroupFight() {
  const REDIRECT_URLS = [
    "/metro/",
    "/travel2/",
    "/neftlenin/from_battle",
    "/dungeon/inside/",
  ];
  const redirectUrl = $(".result a.f").attr("href");

  if (!redirectUrl) {
    return;
  }

  if (REDIRECT_URLS.includes(redirectUrl)) {
    console.log("redirecting to", redirectUrl);
    restoreHP();
    AngryAjax.goToUrl(redirectUrl);
  }
}

function handleGroupFightUI() {
  // chat fixed position
  const miniChat = $("#miniChat");
  if (miniChat.length > 0) {
    miniChat.css({
      left: "3px",
      top: "570px",
      width: "200px",
      height: "470px",
      position: "absolute",
    });

    const $content = miniChat.find(".content");
    if ($content) {
      $content.scrollTop($content[0]?.scrollHeight);
    }
  }

  // redraw group fight logs
  enhanceGroupFightLogs();
  sortGroupFightPlayers();
  redrawLogsPagination();
}

function isGroupFight() {
  const url = location.pathname;
  if (url.match(/^(?!.*\/alley\/).*\/fight\//)) {
    return true;
  } else {
    return false;
  }
}

function expandContainers() {
  $(".object-thumbs").css({
    height: "auto",
    maxHeight: "850px",
    overflowY: "scroll",
    scrollbarWidth: "none",
  });
}

function redrawCollectins() {
  if ($(".home-collections-redrawn").length > 0) {
    return;
  }

  $("#home-collections")
    .css({
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr 1fr",
    })
    .attr("class", "home-collections-redrawn");

  $(".object-thumb").each(function () {
    $(this).css({ height: "auto" });
    let imageTitle = $(this).find("img").attr("title");

    // Check if title contains "Коллекция" (case-insensitive)
    if (/коллекция/i.test(imageTitle)) {
      imageTitle = imageTitle.replace(/коллекция/i, ""); // Replace with "к"
    }

    const titleSpan = $("<span>").text(imageTitle).css({
      "word-break": "break-all",
      "font-size": "smaller",
    });

    // Append the <span> to the image parent
    $(this).find("a").append(titleSpan);
  });
}

function redrawArbat() {
  if ($(".bringup-mode-btn").length) return;
  $(".progress .num").html(function (_, html) {
    return html.replace(/Баллов набрано:\s*/, "");
  });

  const bringupBtn = createButton({
    text: "🚕",
    title: "Бомбить бесплатно (пока вкладка открыта)",
    className: "bringup-mode",
    onClick: async () => {
      if (window.BRINGUP_MODE) {
        showAlert("Бомбила 🚕", "Режим уже активен.");
        return;
      }
      const carId = $(
        'form[action="/automobile/bringup/"] input[name="car"]'
      ).val();

      if (!carId) {
        sendAlert({
          title: "Бомбила 🚕",
          img: "/@/images/link/taxi.jpg",
          text: `
          Не удалось найти ID автомобиля.
          `,
        });
        return;
      }

      await carBringupMode(carId);
      window.BRINGUP_MODE = true;
      AngryAjax.reload();

      sendAlert({
        title: "Бомбила 🚕",
        img: "/@/images/link/taxi.jpg",
        text: `
        Режим бомбить бесплатно.
        <br>Чтобы отключить, обновите страницу.<br>
        <i>(id тачки: ${carId})</i>.
        `,
      });
    },
  });

  const actions = $(".auto-bombila .actions");

  actions.find("form").css({ display: "inline-block" });
  actions.append(bringupBtn);
}

function redrawNeftLenin() {
  if ($("#neftlenin-switch").length) return;
  const wrapper = $('<div id="neftlenin-switch"></div>').css({
    position: "absolute",
    top: "20px",
    right: "5px",
    display: "flex",
    gap: "2px",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "rgba(0, 0, 0, 0.25) 0px 0px 8px 4px",
  });

  const light = createButton({
    text: "⚪️",
    title: "Обычный нефтепровод",
    onClick: () =>
      $.post(
        "/neftlenin/",
        { action: "selectType", type: "usual" },
        function () {
          AngryAjax.reload();
        }
      ),
  });

  const dark = createButton({
    text: "⚫️",
    title:
      "Темный нефтепровод\n(❗️вне акции вводит персонажа в тюрьму на 20 минут❗️)",
    onClick: () =>
      $.post(
        "/neftlenin/",
        { action: "selectType", type: "hard" },
        function () {
          AngryAjax.reload();
        }
      ),
  });

  wrapper.append(light, dark);

  $(".welcome").append(wrapper);
}

function redrawTonusRestore() {
  window.jobShowTonusAlert = function () {
    $.get(
      "/job/tonus-buy-alert/",
      function (data) {
        if (data["error"]) {
          showAlert(moswar.lang.LANG_MAIN_105, data["error"], true);
        } else {
          $.get(
            "/player/json/use/" + data["restore_tonus"] + "/",
            function (data) {
              console.log(data["restore_tonus"]);
              if (data["fullenergyin"]) {
                player["fullenergyin"] = 0;
                $("div.tonus-overtip-increase").html();
                $(".plus-icon").eq(1).css("display", "");
              }
              if (data["stats"]["energy"]) {
                setEnergy(data["stats"]["energy"]);
                $(".plus-icon").eq(1).css("display", "");
              }
            },
            "json"
          );
        }
      },
      "json"
    );
  };
}

export function handleUI() {
  const url = location.pathname;

  renderCandyCountdown();
  expandContainers();
  redrawTonusRestore();
  phoneSpeedUp();

  // alley fight
  if (url.match(/\/alley\/fight\//)) {
    console.log("Alley fight");
    fightForward();
  } else if (url.match(/^(?!.*\/alley\/).*\/fight\//)) {
    // group fight

    console.log("Group fight");

    handleEndOfGroupFight();
    handleGroupFightUI();
  } else if (url === "/player/") {
    // player page
    redrawMain();
    $("#stats-accordion .selected.active")
      .css("cursor", "pointer")
      .on("click", getStats);
    // document.querySelector("#assistant-container").scrollIntoView();
  } else if (url === "/automobile/ride/") {
    // rides
    sortGarage();
  } else if (url === "/tattoo/") {
    // tattoo
    redrawTattoo();
  } else if (url === "/neftlenin/") {
    redrawNeftLenin();
  } else if (url === "/square/tvtower/") {
    // TV tower
    redrawTVTower();
    $("#breaking-news-normal")[0].scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  } else if (url === "/metrowar/clan/") {
    let $list = $(".clan-members > ul");

    $(".clan-members > ul li")
      .sort((a, b) => {
        let coolA = parseInt($(a).find(".cool-1").text().trim(), 10);
        let coolB = parseInt($(b).find(".cool-1").text().trim(), 10);
        return coolB - coolA; // Сортировка по крутости
      })
      .appendTo($list);
  } else if (url === "/home/relic/") {
    $("#relic-reinforced-list").css({
      marginBottom: "0px",
      scrollbarWidth: "none",
    });
    $(".relic-reinforced-wnd").css({ height: "auto" });
    $(".relic-reinforced-wnd-list").css({ height: "100%" });
  } else if (url === "/travel2/") {
    initPvpUI();
    $("#content")[0].scrollIntoView({ behavior: "smooth", block: "start" });
  } else if (url === "/metro/") {
    // redraw rats (maybe player is already searching)
    redrawRats();
    // redraw rats search when clicking on "Напасть на монстра" or "Прокатиться"
    $(
      "#action-rat-fight > div.button-big.button, #timer-rat-fight > div:contains('Прокатиться')"
    ).on("click", function () {
      $(document).one("ajaxStop", redrawRats);
    });
  } else if (url === "/petarena/") {
    redrawPetarena();
  } else if (url === "/home/") {
    redrawCollectins();
  } else if (url === "/camp/gypsy/") {
    let normalGameContainer = $(".game-types td:first");

    if (!$(".multi-play-gypsy").length) {
      normalGameContainer.append(
        createNumberAction({
          label: "Мне повезет",
          action: async () => await playGypsy(),
          className: "multi-play-gypsy",
        })
      );
    }

    if ($(".multi-play-gypsy-flowers").length) {
      return;
    }

    const flowersGameContainer = $(".game-types-col").first();

    console.log(flowersGameContainer);

    flowersGameContainer.append(
      createNumberAction({
        label: "Мне повезет",
        action: async () => await playGypsy(),
        className: "multi-play-gypsy-flowers",
      })
    );
  } else if (url === "/casino/blackjack/") {
    if ($(".blackjack-multi").length) return;
    const btnInputField = createNumberAction({
      label: "Играть за 10",
      action: async () => await playBlackjack(),
      className: "blackjack-multi",
    });
    $(".actions.bets").append(btnInputField);
  } else if (url === "/arbat/") {
    redrawArbat();
  } else if (url === "/pyramid/") {
    $("#pyramid-buy-form input").css({ width: "70px" });
  } else if (url.includes("clan")) {
    if ($("#reorder-clan").length) return;
    const coolnessSpan = $(
      '<span id="reorder-clan" class="cool-1"><i></i></span>'
    ).css({
      cursor: "pointer",
    });
    coolnessSpan.on("click", sortClanPlayersByCoolness);

    const addToEnemiesBtn = createButton({
      text: "+Враги",
      title: "Добавить в список врагов (для кланвара)",
      onClick: () => addClanToEnemies(),
      className: "add-to-enemies",
      disableAfterClick: true,
    });

    $(addToEnemiesBtn).css({
      display: "block",
      marginLeft: "auto",
    });

    $('td.label:contains("Кланеры")').append(addToEnemiesBtn);
    coolnessSpan.insertAfter("a[onclick=\"$('#players').toggle();\"]");
  } else if (["/squid/", "/meetings/", "/sovet/career/"].includes(url)) {
    $("#content")[0].scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export { createButton, createPopover };
export { dungeonSpeedUp } from "./dungeon.js";
export { kubovichSpeedUp } from "./kubovich.js";
export { neftLeninSpeedUp } from "./neftlenin.js";
