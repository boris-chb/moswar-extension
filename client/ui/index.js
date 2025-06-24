/* global $ showAlert showConfirm closeAlert countdown AngryAjax  */

import { playBlackjack } from "../../src/locations/casino.js";
import {
  chaoticFightMode,
  checkBronikPieces,
  eatSnickers,
  farm,
  joinGypsy,
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
import { addClanToEnemies, sortClanPlayersByCoolness } from "../clan.js";
import { eatSilly, restoreHP } from "../dopings.js";
import startDungeon from "../dungeon-solo.js";
import { boostClan, joinProt } from "../group-fight.js";
import { redrawPetarena } from "../pets.js";
import { handlePvpFight, initPvpUI } from "../pvp.js";
import { handleModifyManyTattoos } from "../tattoo.js";
import { formatNumber, getElementsOnThePage, strToHtml } from "../utils.js";
import { createButton, createNumberAction } from "./button.js";
import { enhanceLogs } from "./logs.js";
import { createPopover } from "./popover.js";

const assistantButtonsProps = [
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
    text: "☄️",
    title: "Дух Коммунизма",
    onClick: async () => await joinGypsy(),
  },
  {
    text: "👊",
    title:
      "25 боев в закоулки оборотнем (уровень оборотня - 1)\nнужны: оборотень включен + мажор + сникерсы/тонус!)",
    onClick: async () => await farm(25),
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

const navLinks = [
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
  { href: "/meetings/", text: "🪧 Миты" },
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

    assistantButtonsProps.forEach(
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
    padding: "6px 12px",
    zIndex: "102",
    border: "4px solid #ffd591",
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

  navLinks.forEach(({ href, text, onClick }) => {
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

  // const playerDocumentResponse = await fetch(new URL(window.location.href).origin + "/player/");
  // const playerDocumentHtmlStr = await playerDocumentResponse.text();
  // const playerDocument = parseHtml(playerDocumentHtmlStr);

  // const getCount = (selector) => {
  //   let el = playerDocument.querySelector(selector);
  //   return el ? el.textContent.trim().slice(1) : "0";
  // };

  // let playerPageCurrency = [
  //   `<span class="travel-pass">${getCount('img[src="/@/images/obj/travel/pass.png"] + .count')}<i></i></span>&nbsp;`,
  //   `<span class="shuffle2">${getCount('img[src="/@/images/obj/travel/shuffle2.png"] + .count')}<i></i></span>&nbsp;`,
  //   `<span class="shuffle">${getCount('img[src="/@/images/obj/travel/shuffle.png"] + .count')}<i></i></span>&nbsp;`,
  //   `<span class="travel-magnet">${getCount('img[src="/@/images/obj/travel/magnet.png"] + .count')}<i></i></span>&nbsp;`,
  //   `<span class="travel-ticket">${getCount('img[src="/@/images/obj/travel/ticket.png"] + .count')}<i></i></span>&nbsp;`,
  // ].map(strToHtml);

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
    console.log("[redrawMain] Not on /player page.");
    return;
  }

  if (location.pathname.search(/\/player\/$/) !== -1) {
    initMultiItemUi();
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

  // eslint-disable-next-line no-undef
  const inventoryContainer = document.querySelector(
    "#content > table.inventary > tbody > tr > td.equipment-cell > div > dl > dd > div:nth-child(1)"
  );

  expandDopings();
  expandInventory();
  expandPetTab();
  initMultiItemUi();
  initEatDops();

  if (inventoryContainer && inventoryContainer.offsetHeight < 300) {
    console.log("[i] toggle inventory expand");
    // eslint-disable-next-line
    inventaryExpand.toggle();
  }

  // removePetTab();
}

var initMultiItemUi = function () {
  if (typeof localStorage["mw_alerts"] == "undefined") {
    localStorage["mw_alerts"] = "[]";
  }
  let alertsData = JSON.parse(localStorage["mw_alerts"]);
  if (alertsData.length > 0) {
    for (var i in alertsData) {
      showAlert("Оповещение", alertsData[i]);
    }
    alertsData = [];
    localStorage["mw_alerts"] = "[]";
  }

  window.parseData = function (data, st) {
    var a = JSON.parse(data);
    console.log(a);
    var al = new Array();
    for (var j in a.alerts) {
      al.push(a.alerts[j].text);
    }
    for (var i in a.inventory) {
      if ("inventory-" + a.inventory[i].code + "-btn" == st) {
        var obj = { id: a.inventory[i].id, alerts: al };
        return obj;
      }
    }
    var obj = { alerts: al };
    return obj;
  };

  window.parseDataItem = function (data, st) {
    var a = JSON.parse(data);
    console.log(a);
    var al = new Array();
    for (var j in a.alerts) {
      al.push(a.alerts[j].text);
    }
    for (var i in a.inventory) {
      if ("/@/images/obj/" + a.inventory[i].image == st) {
        var obj = { id: a.inventory[i].id, alerts: al };
        return obj;
      }
    }
    var obj = { alerts: al };
    return obj;
  };

  window.buyNextGift = function (num, id, st, action, title, sp) {
    if (typeof title == "undefined") {
      title = "Подарок";
    }
    if (num > 0) {
      $.get("/player/json/" + action + "/" + id + "/", function (data) {
        moswar.showPopup(title + " открыт!", "Осталось: " + (num - 1), 4000);
        var obj = parseData(data, st);
        if (typeof obj.id != "undefined") {
          var a = JSON.parse(localStorage["mw_alerts"]);
          for (var i in obj.alerts) {
            a.push(obj.alerts[i]);
          }
          localStorage["mw_alerts"] = JSON.stringify(a);
          buyNextGift(num - 1, obj.id, st, action, title, sp);
        } else {
          var a = JSON.parse(localStorage["mw_alerts"]);
          for (var i in obj.alerts) {
            a.push(obj.alerts[i]);
          }
          localStorage["mw_alerts"] = JSON.stringify(a);
          if (sp == "1") {
            localStorage["listGiftsN"] = Number(localStorage["listGiftsN"]) - 1;
            if (Number(localStorage["listGiftsN"]) < 1) {
              setTimeout("AngryAjax.goToUrl('/player/');", 1000);
            }
          } else {
            setTimeout("AngryAjax.goToUrl2('/player/');", 2000);
          }
        }
      });
    } else {
      if (sp == "1") {
        localStorage["listGiftsN"] = Number(localStorage["listGiftsN"]) - 1;
        if (Number(localStorage["listGiftsN"]) < 1) {
          setTimeout("AngryAjax.goToUrl2('/player/');", 1000);
        }
      } else {
        setTimeout("AngryAjax.goToUrl2('/player/');", 2000);
      }
    }
  };

  var buyNextItem = function (num, id, st, action, title, sp) {
    if (typeof title == "undefined") {
      title = "Предмет";
    }
    if (num > 0) {
      $.get("/player/json/" + action + "/" + id + "/", function (data) {
        moswar.showPopup(title + " открыт!", "Осталось: " + (num - 1), 4000);
        var obj = parseDataItem(data, st);
        if (typeof obj.id != "undefined") {
          var a = JSON.parse(localStorage["mw_alerts"]);
          for (var i in obj.alerts) {
            a.push(obj.alerts[i]);
          }
          localStorage["mw_alerts"] = JSON.stringify(a);
          buyNextItem(num - 1, obj.id, st, action, title, sp);
        } else {
          var a = JSON.parse(localStorage["mw_alerts"]);
          for (var i in obj.alerts) {
            a.push(obj.alerts[i]);
          }
          localStorage["mw_alerts"] = JSON.stringify(a);
          if (sp == "1") {
            localStorage["listGiftsN"] = Number(localStorage["listGiftsN"]) - 1;
            if (Number(localStorage["listGiftsN"]) < 1) {
              setTimeout("AngryAjax.goToUrl2('/player/');", 1000);
            }
          } else {
            setTimeout("AngryAjax.goToUrl2('/player/');", 2000);
          }
        }
      });
    } else {
      if (sp == "1") {
        localStorage["listGiftsN"] = Number(localStorage["listGiftsN"]) - 1;
        if (Number(localStorage["listGiftsN"]) < 1) {
          setTimeout("AngryAjax.goToUrl2('/player/');", 1000);
        }
      } else {
        setTimeout("AngryAjax.goToUrl2('/player/');", 2000);
      }
    }
  };

  window.multOpenGift = function (gift) {
    var id = $(gift).parent().parent().find("img").attr("data-id");
    var type = $(gift).parent().parent().find(".action").attr("id");
    var act = $(gift).parent().parent().find(".action").attr("data-action");
    var b = [];
    b.push({
      title: "Открыть",
      callback: function (obj) {
        alertsData = [];
        buyNextGift(
          $("#multbuy").attr("value"),
          id,
          type,
          act,
          m.items[id].info.title,
          "0"
        );
        closeAlert(obj);
      },
    });
    b.push({ title: "Отмена", callback: null });
    showConfirm(
      '<p align="center">Количество: <input id="multbuy" value="' +
        $(gift).parent().parent().find(".count").text().replace(/#/gi, "") +
        '"></p>',
      b,
      { __title: "Открыть много :)" }
    );
  };

  window.multOpenItem = function (gift) {
    var id = $(gift).parent().parent().find("img").attr("data-id");
    var type = $(gift).parent().parent().find("img").attr("src");
    var act = $(gift).parent().parent().find(".action").attr("data-action");
    var b = [];
    b.push({
      title: "Открыть",
      callback: function (obj) {
        alertsData = [];
        buyNextItem(
          $("#multbuy").attr("value"),
          id,
          type,
          act,
          m.items[id].info.title,
          "0"
        );
        closeAlert(obj);
      },
    });
    b.push({ title: "Отмена", callback: null });
    showConfirm(
      '<p align="center">Количество: <input id="multbuy" value="' +
        $(gift).parent().parent().find(".count").text().replace(/#/gi, "") +
        '"></p>',
      b,
      { __title: "Открыть много :)" }
    );
  };

  window.initializePlayerPageEnhancements = function () {
    window.enhancePetItems();
    window.enhanceEquipmentItems();
    window.handleInventoryEnhancements();
  };

  window.enhancePetItems = function () {
    $('.object-thumb img[data-type="pet"]').each(function () {
      const petElement = $(this);
      const actionElement = petElement.parent().find(".action");
      if (actionElement.attr("onclick").match(/train\/\d+\/'/)) {
        const petId = petElement.attr("data-id");
        const petTitle = m.items[petId].info.title.replace(/"/g, "");
        const petActiveMessage = `Ваш питомец ${petTitle} сделан активным!`;
        const onClickAction = `petarenaSetActive(${petId}, 'battle'); moswar.showPopup('Питомец', '${petActiveMessage}', 5000);`;
        const petActionHtml = `
          <div style="position: absolute">
            <span class="agree" onclick="${onClickAction}" style="cursor: pointer">
              <i></i>
            </span>
          </div>`;
        petElement.parent().prepend(petActionHtml);
      }
    });
  };

  window.enhanceEquipmentItems = function () {
    $('.equipment-cell .object-thumb .action[data-action="use"]').each(
      function () {
        const actionElement = $(this);
        if (
          actionElement.prev(".multi-open").length === 0 &&
          actionElement.next(".multi-open").length === 0
        ) {
          const multiOpenHtml = `
          <b class="multi-open" style="cursor: pointer; background-color: #fdf179; color: green; font-size: 11px; position: absolute; margin: 0 1px;" onclick="multOpenItem(this);">
            [#]
          </b>`;
          actionElement.parent().prepend(multiOpenHtml);
        }
      }
    );

    $('.equipment-cell .object-thumb img[data-type="gift"]').each(function () {
      const giftElement = $(this);
      if (
        giftElement.prev(".multi-open").length === 0 &&
        giftElement.next(".count").length === 1
      ) {
        const multiOpenHtml = `
          <b class="multi-open" style="cursor: pointer; background-color: #fdf179; color: green; font-size: 11px; position: absolute; margin: 0 1px;" onclick="multOpenGift(this);">
            [#]
          </b>`;
        giftElement.before(multiOpenHtml);
      }
    });
  };

  window.handleInventoryEnhancements = function () {
    setTimeout(() => {
      moveInventoryItemsToCategories();
    }, 150);
  };

  window.moveInventoryItemsToCategories = function () {
    const inventorySelector = '.object-thumbs[htab="inventory"]';
    const clothesSelector = '.object-thumbs[htab="clothes"]';

    $(`${inventorySelector} img[src$="box_perfume.png"], 
       ${inventorySelector} img[src$="gift-wolf.png"], 
       ${inventorySelector} img[src$="gold_phone_cert.png"], 
       ${inventorySelector} img[src$="eye_phone_cert.png"]`)
      .parents(".object-thumb")
      .appendTo(inventorySelector);

    $(`${clothesSelector} img[data-type="talisman"], 
       ${clothesSelector} img[data-type="cologne"]`)
      .parents(".object-thumb")
      .prependTo(clothesSelector);

    $(`${clothesSelector} img[data-type="phone"]`)
      .parents(".object-thumb")
      .appendTo(clothesSelector);
  };

  if (location.pathname.endsWith("/player/")) {
    eval(
      "AngryAjax.goToUrl2 = " +
        AngryAjax.goToUrl.toString().replace("url = url.replace('#', '');", "")
    );
    initializePlayerPageEnhancements();
  }
};

var initEatDops = function () {
  if (typeof window.GM_deleteValue === "undefined") {
    window.GM_addStyle = (css) => {
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
    };

    window.GM_deleteValue = (name) => {
      localStorage.removeItem(name);
    };

    window.GM_getValue = (name, defaultValue) => {
      const value = localStorage.getItem(name);
      if (value === null) return defaultValue;

      const type = value.charAt(0);
      const rawValue = value.slice(1);

      switch (type) {
        case "b":
          return rawValue === "true";
        case "n":
          return Number(rawValue);
        default:
          return rawValue;
      }
    };

    window.GM_log = (message) => {
      console.log(message);
    };

    window.GM_openInTab = (url) => {
      window.open(url, "_blank");
    };

    window.GM_registerMenuCommand = (name, func) => {
      // Stub function: Add implementation if needed
    };

    window.GM_setValue = (name, value) => {
      let typePrefix;

      if (typeof value === "boolean") {
        typePrefix = "b";
      } else if (typeof value === "number") {
        typePrefix = "n";
      } else if (typeof value === "string") {
        typePrefix = "s";
      } else {
        throw new Error("Unsupported value type");
      }

      const prefixedValue = `${typePrefix}${value}`;
      localStorage.setItem(name, prefixedValue);
    };
  }

  function getCurrentLocation() {
    var spans = $(".heading:first h2 span");
    var cur_loc =
      spans.length > 0
        ? spans[0].getAttribute("class")
        : $(".heading:first h2").html();
    return cur_loc;
  }

  function getRealDoc() {
    var myframe = top.document.getElementById("game-frame");
    if (myframe) {
      return myframe.contentWindow.document;
    } else {
      return top.document;
    }
  }

  function renderEatDopsButton() {
    const dopingAccordion = Adoc.getElementById("dopings-accordion");

    if (
      !Adoc.getElementById("eat-button") &&
      getCurrentLocation() === "pers" &&
      dopingAccordion
    ) {
      const eatButton = document.createElement("div");
      eatButton.className = "button";
      eatButton.id = "eat-button";
      eatButton.innerHTML = `
        <span class="f">
          <i class="rl"></i>
          <i class="bl"></i>
          <i class="brc"></i>
          <div id="aicheck" class="c">Обожраться</div>
        </span>
      `;

      $('div[htab="dopings"]').before(eatButton);

      eatButton.addEventListener("click", selectDops, false);

      setTimeout(() => {
        eatDops();
      }, 1000);
    }
  }

  function selectDops() {
    if (
      getCurrentLocation() == "pers" &&
      Adoc.getElementById("dopings-accordion")
    ) {
      var eatD = document.createElement("DIV");
      eatD.setAttribute("style", "display: block; top: 300px; width: 468px;");
      eatD.setAttribute("class", "alert  alert1");
      eatD.id = "alert-main";
      var padding = document.createElement("DIV");
      padding.setAttribute("class", "padding");
      eatD.appendChild(padding);
      var h2 = document.createElement("H2");
      h2.innerHTML =
        "\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u0434\u043e\u043f\u044b";
      padding.appendChild(h2);
      var dataDiv = document.createElement("DIV");
      dataDiv.setAttribute("class", "data");
      var div1 = document.createElement("DIV");
      dataDiv.appendChild(div1);
      padding.appendChild(dataDiv);
      var tempNode = Adoc.getElementById("dopings-accordion").cloneNode(true);
      var dops = tempNode.getElementsByClassName("object-thumb");
      while (dops.length > 0) {
        var backGroundDiv = document.createElement("DIV");
        backGroundDiv.setAttribute(
          "style",
          "margin: 4px 1px 2px 2px;height: 72px; width: 72px;float:left;"
        );
        backGroundDiv.setAttribute("name", "backGroundDiv");
        var actionDiv = dops[0].getElementsByClassName("action")[0];
        var imgDiv = dops[0]
          .getElementsByClassName("padding")[0]
          .getElementsByTagName("img")[0];
        if (actionDiv) {
          if (actionDiv.className == "action disabled") {
            backGroundDiv.style.backgroundColor = "red";
          } else {
            var actionJS =
              "$.get('/player/json/" +
              actionDiv.getAttribute("data-action") +
              "/" +
              imgDiv.getAttribute("data-id") +
              "/', function(){moswar.showPopup('Готово',m.items[" +
              imgDiv.getAttribute("data-id") +
              "].info.title, 2000);GM_setValue('listDopsN', Number(GM_getValue('listDopsN', ''))-1);if(Number(GM_getValue('listDopsN', ''))<1) {AngryAjax.goToUrl('/player/');}})";
            backGroundDiv.setAttribute("rel", actionJS);
            backGroundDiv.addEventListener(
              "click",
              function () {
                onClickBackGroundDiv(this);
              },
              false
            );
          }
          dops[0].getElementsByClassName("padding")[0].removeChild(actionDiv);
        }
        dops[0].setAttribute("style", "margin: 2px 2px 2px 2px;height: 68px;");
        backGroundDiv.appendChild(dops[0]);
        div1.appendChild(backGroundDiv);
      }
      var actionDiv = document.createElement("DIV");
      actionDiv.setAttribute("class", "actions");
      actionDiv.setAttribute("style", "clear: both;");
      var OKButton = document.createElement("DIV");
      OKButton.setAttribute("class", "button");
      OKButton.innerHTML =
        '<span class="f"><i class="rl"></i><i class="bl"></i><i class="brc"></i><div class="c">\u041e\u041a</div></span>';
      var CancelButton = document.createElement("DIV");
      CancelButton.setAttribute("class", "button");
      CancelButton.innerHTML =
        '<span class="f"><i class="rl"></i><i class="bl"></i><i class="brc"></i><div class="c">\u041e\u0442\u043c\u0435\u043d\u0430</div></span>';
      actionDiv.appendChild(OKButton);
      actionDiv.appendChild(CancelButton);
      dataDiv.appendChild(actionDiv);
      Adoc.body.appendChild(eatD);
      CancelButton.addEventListener(
        "click",
        function () {
          Adoc.body.removeChild(Adoc.getElementById("alert-main"));
        },
        false
      );
      OKButton.addEventListener("click", createListDops, false);
    }
  }
  function createListDops() {
    var backGroundDivs = Adoc.getElementsByName("backGroundDiv");
    var result = "";
    for (var i = 0; i < backGroundDivs.length; i++) {
      if (backGroundDivs[i].style.backgroundColor == "green") {
        result += backGroundDivs[i].getAttribute("rel") + "#|#";
      }
    }
    result = result.substring(0, result.length - 3);
    GM_setValue("listDops", result);
    GM_setValue("listDopsN", result.split("#|#").length);
    Adoc.body.removeChild(Adoc.getElementById("alert-main"));
    eatDops();
  }
  function onClickBackGroundDiv(obj) {
    obj.style.backgroundColor =
      obj.style.backgroundColor == "green" ? "transparent" : "green";
  }
  function eatDops() {
    var listDops = GM_getValue("listDops", "");
    if (listDops) {
      var codeBlocks = listDops.split("#|#");
      var codeBlock = codeBlocks[0];
      var cl = codeBlocks.length;
      eval(codeBlock);
      codeBlocks.shift();
      //      log(cl);
      if (!codeBlocks[0]) {
        GM_setValue("listDops", "");
        //        setTimeout("AngryAjax.goToUrl2('/player/');$('#log').html('');", 1E3)
      } else {
        GM_setValue("listDops", codeBlocks.join("#|#"));
        setTimeout(function () {
          eatDops();
        }, 1e3);
      }
    }
  }

  var Adoc = getRealDoc();
  renderEatDopsButton();
};

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

export function LEGACY_initGroupFightLogs() {
  if (
    typeof window.localStorage.OptionsVar == "undefined" ||
    window.localStorage.OptionsVar == null
  ) {
    window.localStorage.OptionsVar = JSON.stringify({ f_pickabil: "u" });
  }
  var OptionsVar = JSON.parse(window.localStorage.OptionsVar);

  if (location.pathname.search(/^\/fight/) !== -1) {
    // eslint-disable-next-line
    function drawUserLogs() {
      const fightLogs = JSON.parse(window.sessionStorage.fightLog);
      const currentStep = parseInt(
        $(".block-rounded").find(".current").text(),
        10
      );

      if (OptionsVar["f_hidedead"]) {
        $(".list-users").find(".dead").remove();
      }

      for (const userName in fightLogs) {
        if (userName === "Избранный[??]") {
          $(".log")
            .find(".log-panel")
            .append(
              `<div class="fight-log">${fightLogs[userName].Turns}</div>`
            );
          continue;
        }

        let activeIconsHtml = "";
        let counterIconsHtml = "";

        for (const weaponKey in awpn) {
          if (weaponKey in fightLogs[userName]) {
            const weaponLog = fightLogs[userName][weaponKey];
            let remainingTurns = 0;

            if (weaponKey === "Hamsters") {
              remainingTurns = weaponLog.Turns;
            } else {
              remainingTurns = weaponLog.Turns - (currentStep - weaponLog.Step);
              remainingTurns =
                remainingTurns > 0 && remainingTurns <= weaponLog.Turns
                  ? remainingTurns
                  : 0;
            }

            if (remainingTurns > 0) {
              activeIconsHtml += awpn[weaponKey].image;
              if (remainingTurns > 1) {
                activeIconsHtml += `<small>${remainingTurns}</small>`;
              }
            }

            if ("cnt" in weaponLog) {
              counterIconsHtml += `
                <div style="display: inline-block; margin: 6px 0;">
                  ${awpn[weaponKey].image}
                  <small style="margin-top: -3px; display: block; position: absolute;">
                    #${weaponLog.cnt}
                  </small>
                </div>`;
            }
          }
        }

        if (activeIconsHtml || counterIconsHtml) {
          const userElement = $("#fightGroupForm")
            .find(`.user:contains("${userName}")`)
            .first();

          if (activeIconsHtml) {
            userElement.addClass("fight-log").prepend(`${activeIconsHtml}<br>`);
          }

          if (counterIconsHtml) {
            userElement.parent().append(`
                <br>
                <div class="fight-log cnt" style="position: absolute; margin-top: -10px;">
                  ${counterIconsHtml}
                </div>
                <div style="height: 20px;"></div>
              `);
          }
        }
      }
    }

    /* eslint-disable */
    function fightAnalyze() {
      const fightId = location.href.split("/")[2];
      const currentStep = parseInt(
        $(".block-rounded").find(".current").text(),
        10
      );
      const sessionData = window.sessionStorage;

      // Initialize session storage
      if (
        fightId !== sessionData.FightId ||
        !sessionData.fightLog ||
        sessionData.fightLog === "undefined"
      ) {
        sessionData.FightId = fightId;
        sessionData.fightLog = JSON.stringify({});
      }

      var fightLog = JSON.parse(window.sessionStorage.fightLog),
        step = $(".block-rounded").find(".current").text(),
        nik = "",
        slog = "";
      if (
        $(".group")
          .text()
          .search(/Избранный/) !== -1
      ) {
        var izNik = "Избранный" + String.fromCharCode(160) + "[??]";
        fightLog["Избранный[??]"] = { Turns: "", Step: step };
      }

      if ($(".group").text().includes("Избранный")) {
        const specialNik = `Избранный [??]`;
        fightLog[specialNik] = { Turns: "", Step: currentStep };
      }

      function updateFightLog(nik, weapon, step, turns, slog) {
        nik = nik.match(/(.{1,20})\s(\[.+?\])/);
        const cleanNik = nik ? `${nik[1]}${nik[2]}` : null;
        if (!cleanNik) return;

        // Special handling for specific nik
        if (cleanNik === "Избранный[??]" && turns !== "-1") {
          fightLog[cleanNik].Turns += slog === "#" ? slog : `<br>${slog}`;
          return;
        }

        fightLog[cleanNik] = fightLog[cleanNik] || {};
        fightLog[cleanNik][weapon] = fightLog[cleanNik][weapon] || {};

        const weaponLog = fightLog[cleanNik][weapon];

        if (slog === "#") {
          weaponLog.cnt = "#";
          return;
        }

        if (weapon === "Hamshams") {
          fightLog[cleanNik].Hamsters = fightLog[cleanNik].Hamsters || {
            Turns: "0",
          };
          fightLog[cleanNik].Hamsters.Turns =
            parseInt(fightLog[cleanNik].Hamsters.Turns, 10) +
            parseInt(turns, 10);
          return;
        }

        weaponLog.Step = step;
        weaponLog.Turns = turns;

        if (awpn[weapon].cnt) {
          weaponLog.cnt = weaponLog.cnt ? weaponLog.cnt + 1 : 1;
          weaponLog.Steps = weaponLog.Steps || [];
          if (!weaponLog.Steps.includes(step)) weaponLog.Steps.push(step);
        }
      }

      function findNik(item, pn, weapon) {
        const izNikWeapons = [
          "Hamsters",
          "Snake",
          "superhit6",
          "MadTrump",
          "totem",
          "Knockout",
        ];
        let sn,
          relatedItem = null;

        switch (pn) {
          case "f":
            sn = $(item)
              .find('[class^="name-"]')
              .first()
              .text()
              .match(/(.+?\[.+?\])/);
            break;
          case "l":
            sn = $(item)
              .find('[class^="name-"]')
              .last()
              .text()
              .match(/(.+?\[.+?\])/);
            break;
          case "et":
            relatedItem = $(item).next();
            while (!relatedItem.is(".easytarget"))
              relatedItem = relatedItem.next();
            sn = findNik(relatedItem, "f", weapon);
            break;
          case "h":
          case "hh":
            relatedItem = findPreviousKickLog(item);
            if (relatedItem.text().includes("отпружинивает удар")) {
              sn = findNik(relatedItem, pn === "h" ? "f" : "l", weapon);
            } else {
              sn = findNik(relatedItem, pn === "h" ? "l" : "f", weapon);
            }
            break;
          default:
            break;
        }

        if (sn && sn[1] === izNik && izNikWeapons.includes(weapon)) {
          slog = `<small>${
            relatedItem
              .text()
              .replace(/\s{2,}/g, " ")
              .match(/^\d?([\s\S]+?\][\s\S]+?\])/)[1]
          }</small>`;
        }

        return sn;
      }

      function findPreviousKickLog(item) {
        let prevItem = $(item).prev();
        while (true) {
          const text = prevItem.text();
          const containsMultipleBrackets = text.match(/\[.+?\]/g)?.length > 1;
          if (
            containsMultipleBrackets &&
            !text.match(/змея|Тесла|дракон|Ночной страж/)
          )
            break;
          prevItem = prevItem.prev();
        }
        return prevItem;
      }

      // Process fight log
      const fightLogItems = $("#fightGroupForm").find(".fight-log");
      for (const weapon in awpn) {
        const { fstr, cnt, pn, turns } = awpn[weapon];
        if (fstr) {
          fightLogItems.find(fstr).each(function () {
            let nik = findNik(this, pn, weapon);
            if (!nik) {
              nik = findNik(this, pn === "l" ? "f" : "l", weapon);
            }
            if (nik) {
              updateFightLog(
                nik[1],
                weapon,
                currentStep,
                turns ||
                  $(this)
                    .text()
                    .match(/\s(\d)\s/)[1],
                slog || ""
              );
            }
          });
        }
      }

      // Special handling for bikes
      fightLogItems.find('.text:contains("Байк ")').each(function () {
        const bikeLogs = $(this)
          .text()
          .match(/Байк\s.+?оглушает.+?\[.+?\]/g);
        if (bikeLogs) {
          bikeLogs.forEach((log) => {
            const nik = log.match(/оглушает\s(.+?\[.+?\])/)[1];
            const bikeSlog = nik === izNik ? `<small>${log}</small>` : "";
            updateFightLog(nik, "Bike", currentStep, "1", bikeSlog);
          });
        }
      });

      // Save the updated fight log
      sessionData.fightLog = JSON.stringify(fightLog);
    }

    //---укус омон-------------
    //абилки: '-1' - дог, '-65' - догфулл, '59' - омон;  /на изе: '148' - Дежавю, '155' - Позвать Напарника, '146' - Нужно больше Агентов
    var abl = ["148", "-1", "-65", "59", "155", "146"]; //порядок проверки абилок, если выбрано то чего нет
    // eslint-disable-next-line
    function autokick(useabl) {
      if (document.getElementById("sign_kick") == null) {
        document.getElementById("useabl-" + useabl).click();
        if (OptionsVar["f_autokick"]) {
          $("#fightAction").find("button").click();
          $("#useabl-" + useabl)
            .parents("label")
            .find("img")
            .attr("style", "filter:contrast(2.0)");
          $("#f_autokick").prop("checked", false);
          OptionsVar["f_autokick"] = 0;
          window.localStorage.OptionsVar = JSON.stringify(OptionsVar);
        }
        $(".log-panel").attr("id", "sign_kick");
      }
    } //end autokick()

    if (
      !$(".group2 i").is(".npc") &&
      ($(".group1 i").is(".arrived") ||
        $(".group1 img").is('[class^="team-"]')) &&
      !$("h3").is(".welcome-groupfight-flag")
    )
      if (
        $("#fightGroupForm").find("ul.fight-log > li > h4").text() ==
          "Начало" &&
        $("#fightAction").find("button").is(":visible")
      ) {
        switch (OptionsVar["f_pickabil"]) {
          case "u":
            if (document.getElementById("useabl--1") !== null) autokick("-1");
            if (document.getElementById("useabl--65") !== null) autokick("-65");
            if (document.getElementById("useabl-148") !== null) autokick("148");
            break;
          case "o":
            if (document.getElementById("useabl-59") !== null) autokick("59");
            if (document.getElementById("useabl-146") !== null) autokick("146");
            break;
          case "a":
            if (document.getElementById("useabl-155") !== null) autokick("155");
            break;
        }
        if (document.getElementById("sign_kick") == null)
          for (var i = 0; i < abl.length; i++)
            if (document.getElementById("useabl-" + abl[i]) !== null) {
              autokick(abl[i]);
              break;
            }
      }
    function renderFightNavbar() {
      if ($("#sign_ufl").length != 1) {
        fightAnalyze();
        drawUserLogs();

        $(".fight-log")
          .find(
            '[class*="icon"]:not(.icon-bang-poison):not(.icon-antigranata2):not(.question-icon):not(.icon-rocket-1):not(.icon-rocket-2):not(.icon-cheese):not(.icon-helmet):not(.icon-bear):not(.icon-antigranata):not(.icon-forcejoin):not(.icon-heal):not(.antimrr):not(.serial):not(.icon-bang):not(.icon-superhit):not(.icon-reflect):not(.icon-chance):not(.icon-dodge):not(.icon-secondhit):not(.icon-thirdhit):not(.icon-katyusha):not(.icon-weakening-after-madness):not(.icon-foggranade)'
          )
          .each(function () {
            var nik = $(this)
              .next()
              .text()
              .match(/(.*).\[/);
            if (nik !== null) {
              var usr = $(".group")
                .find('li .user:contains("' + nik[1] + '")')
                .first();
              if ($(usr).is(".fight-log"))
                $(usr).children("br").first().before($(this).clone());
              else
                $(usr)
                  .addClass("fight-log")
                  .prepend("<br>")
                  .prepend($(this).clone());
            }
          });

        if (OptionsVar["f_topmylog"]) {
          var flt = $("ul.fight-log").find(".text");
          $('<div style="border:blue 1px solid;"></div>')
            .prepend(flt.find("p.attack_i, p.attack_me").clone())
            .prependTo(flt);
        }

        if (!$(".group2 i").is(".npc")) {
          var lur = $(".list-users--right"),
            luralive = lur.find("li.alive");
          if (OptionsVar["f_topmig"])
            lur
              .prepend(luralive.filter(':contains("Мигрант ")'))
              .prepend(luralive.filter(':contains("Месье ")'));
          if (OptionsVar["f_topmadness"]) lur.prepend(luralive.has(".deaf"));
          if (OptionsVar["f_bottomomon"]) {
            if (lur.find("li.dead").length == 0)
              lur.append(luralive.filter(':contains("Омоновец ")'));
            else
              lur
                .find("li.dead")
                .first()
                .before(luralive.filter(':contains("Омоновец ")'));
          }
        }

        var fightGroupForm = $("#fightGroupForm");
        var fightAction = $("#fightAction");

        var logTurnsNavbar = fightGroupForm.find(".pagescroll").clone();

        // Add the cleanup button inside .block-rounded
        if (!$(".block-rounded .cleanup-logs-btn").length) {
          var cleanupButton = createButton({
            text: "🧹 🧽",
            onClick: () => enhanceLogs(),
            title: "Почистить логи от НПС",
          });

          $(cleanupButton)
            .addClass("cleanup-logs-btn")
            .css({ margin: "2px 6px" });

          var skipNpcFightButton = createButton({
            text: "⏩",
            onClick: async () => await handlePvpFight(),
            title: "Пропустить НПС бой",
          });

          $(skipNpcFightButton)
            .addClass("skip-npc-fight-btn")
            .css({ margin: "2px 6px" });

          logTurnsNavbar.children().first().append(cleanupButton);
          logTurnsNavbar.children().first().append(skipNpcFightButton);
        }

        fightGroupForm.prepend(logTurnsNavbar);

        if ($(".superhit-wrapper").length !== 0) {
          $(".superhit-wrapper").css("zoom", "0.8");
        }

        fightAction.append(
          '<i id="fight-action-reload" class="icon reload-icon" title="Изменить ход"></i>'
        );

        $("#fight-action-reload").on("click", function () {
          fightAction
            .show()
            .find("button")
            .show()
            .removeClass("disabled")
            .prop("disabled", false);
          fightAction.find(".waiting").hide();
        });

        $("#main")
          .find("span.boj")
          .on("click", function () {
            AngryAjax.goToUrl(
              location.pathname.replace(/(\/fight\/\d+?\/)\d+?\//, "$1")
            );
          });

        fightGroupForm.find("table").attr("id", "sign_ufl");
      }
    }

    renderFightNavbar();
    $(".log-panel").prepend($(".fight-slots-actions"));
  }
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

export function kubovichSpeedUp() {
  CasinoKubovich.rotate = function () {
    CasinoKubovich.rotateInterval = null;
    if (!CasinoKubovich.mayRotate) return false;
    CasinoKubovich.mayRotate = false;
    var balance = parseInt($("#fishki-balance-num").html().replace(",", ""));
    var cost = parseInt($("#push .fishki").text());
    if (!isNaN(cost) && cost > balance) {
      CasinoKubovich.errorChip();
      return;
    }
    CasinoKubovich.endPosition = null;
    CasinoKubovich.result = null;
    //	CasinoKubovich.takeResult();
    var kaction = "";
    if ($("div.reel-yellow").length) {
      kaction = "yellow";
    } else {
      kaction = "black";
    }
    $.post(
      "/casino/kubovich/",
      { action: kaction },
      function (data) {
        CasinoKubovich.result = data;
        if (CasinoKubovich.result) {
          if (CasinoKubovich.result.success) {
            CasinoKubovich.showMessage(CasinoKubovich.result.text);
          } else {
            if (!CasinoKubovich.result.ready) {
              clearInterval(CasinoKubovich.rotateInterval);
              CasinoKubovich.rotateInterval = null;
              CasinoKubovich.mayRotate = true;
              $("#prizes").empty();
              $("#reel-turning").attr("class", "");
              $("#push .cost").html(" - скоро");
              $("#push").addClass("disabled");
              $("#push-ellow").addClass("disabled");
              $("#steps tr.my").removeClass("my");
              $("#kubovich-smile").show();
              CasinoKubovich.showError(
                "К сожалению в данный момент Кубович отдыхает, приходите позже."
              );
              // кубович устал
            } else {
              if (CasinoKubovich.result.reload) {
                var isYellow = false;
                if ($("div.reel-yellow").length) {
                  isYellow = true;
                }
                CasinoKubovich.loadData(isYellow);
              } else {
                CasinoKubovich.errorChip();
              }
            }
          }
        }
        if (CasinoKubovich.result.wallet) {
          var wallet = {};
          wallet["money"] = CasinoKubovich.result.wallet.money;
          wallet["ore"] = CasinoKubovich.result.wallet.ore;
          wallet["honey"] = CasinoKubovich.result.wallet.honey;
          updateWallet(wallet);
        }
        CasinoKubovich.rotateInterval = null;
        CasinoKubovich.mayRotate = true;
        var count = 0;
        var current = 0;
        $("#kubovich-message button").unbind("click");
        $("#kubovich-message button").bind("click", function () {
          $("#kubovich-message").hide();
          $("#kubovich-message .data .text").html("");
        });
        CasinoKubovich.nextStep();
      },
      "json"
    );
  };
}

export function phoneSpeedUp() {
  myphone.appShowHide = function (app, action) {
    if (action == "hide") {
      app.attr("style", "display: none");
    } else if (action == "show") {
      var app_id = app.attr("id");
      app
        .css({ opacity: 0, display: "block" })
        .css("transform", "scale(0.5)")
        .animate(
          {
            opacity: 1,
          },
          {
            duration: 1,
            easing: "easeInOutQuint",
            step: function (now, fx) {
              app.css("-webkit-transform", "scale(" + now + ")");
              app.css("-moz-transform", "scale(" + now + ")");
              app.css("-ms-transform", "scale(" + now + ")");
              app.css("transform", "scale(" + now + ")");
            },
            complete: function () {
              $("#amulet-reward_buffs").fadeOut("slow");

              switch (app_id) {
                case "app-trade":
                  myphone.getTradeContract();
                  break;

                case "app-trade2":
                  myphone.getTradeItem();
                  break;

                case "app-messages":
                  myphone.getFightList();
                  break;

                case "app-mfphone":
                  $("button", app)
                    .unbind("click")
                    .bind("click", function () {
                      AngryAjax.goToUrl(
                        "/phone/call/mf-item/" + myphone.currentPhone + "/"
                      );
                    });
                  break;
              }

              console.log("Колбэк появления объекта");
              if (
                app.hasClass("scrollable") &&
                !app.hasClass("jspScrollable")
              ) {
                console.log("Инициация скроллбаров");
                app.jScrollPane();
              }
            },
          }
        );
    }
  };
}

export function neftLeninSpeedUp() {
  // skip single fight animation
  NeftLenin.attack = function () {
    $.post(
      "/neftlenin/",
      { ajax: 1, action: "startAction" },
      function (data) {
        if (data["result"]) {
          AngryAjax.reload();
        } else {
          if (data["return_url"]) {
            AngryAjax.goToUrl(data["return_url"]);
          }
          if (data["error"]) {
            showAlert(
              m.lang.LANG_MAIN_105,
              data["error"],
              true,
              "",
              ".welcome"
            );
          }
        }
      },
      "json"
    );
  };

  // skip prize reroll animation
  NeftLenin.escape = function () {
    $.post(
      "/neftlenin/",
      { ajax: 1, action: "escape" },
      function (data) {
        if (data["result"]) {
          var elm = NeftLenin.getAlertForStep();

          //elm.find('.awards').html(data['data']);
          elm
            .find(".progress-wrapper")
            .css({ opacity: 1 })
            .animate(
              {
                opacity: 0,
              },
              {
                duration: 1,
                complete: function () {
                  elm.find(".awards").html(data["data"]);
                  $(this).animate({ opacity: 1 }, 1);
                },
              }
            );

          NeftLenin.init(data);
          $(".enemy-place").hide();
        } else {
          if (data["return_url"]) {
            AngryAjax.goToUrl(data["return_url"]);
          }
          if (data["error"]) {
            showAlert(
              m.lang.LANG_MAIN_105,
              data["error"],
              true,
              "",
              ".welcome"
            );
          }
        }
      },
      "json"
    );
  };

  // skip alert reset animation
  NeftLenin.reset = function (type) {
    if ($(".pipeline-actions .button").hasClass("disabled")) {
      return;
    }

    $.post(
      "/neftlenin/",
      { ajax: 1, action: "reset", type: type },
      function (data) {
        $(".pipeline-actions .button").removeClass("disabled");

        if (data["result"]) {
          NeftLenin.init(data);

          var elm = NeftLenin.getAlertForStep();
          if (elm.css("display") == "block") {
            elm.find(".awards").html(data["data"]);
            elm.fadeIn("slow");
          }

          if (data["honey"]) {
            $(".med-block span").text(intToKM(data["honey"]));
            $(".med-block").attr("title", "Меда: " + data["honey"]);
          }
        } else {
          if (data["return_url"]) {
            AngryAjax.goToUrl(data["return_url"]);
          }
          if (data["error"]) {
            showAlert(
              m.lang.LANG_MAIN_105,
              data["error"],
              true,
              "",
              ".welcome"
            );
          }
        }

        NeftLenin.fixAlertPosition(elm);
      },
      "json"
    );
  };

  NeftLenin.viewPreMission = NeftLenin.viewPreMission2;
}

export function dungeonSpeedUp() {
  DungeonViewer.tryToGoToRoom = function (id) {
    if ($("#preview-map").hasClass("data-prevent-click")) {
      $("#preview-map").removeClass("data-prevent-click");
      return;
    }

    if (DungeonViewer.activePlayerMoving) {
      return;
    }

    if (Dungeon.isCanGoToRoom(id)) {
      Dungeon.goToRoom(id, function (data) {
        DungeonViewer.movePlayerToRoom(0, id, data);
      });
    }
  };

  Dungeon.goToRoom = function (id, cb) {
    if (Dungeon.activeRequest) {
      return;
    }
    Dungeon.activeRequest = true;
    if (typeof id != "number") {
      id = id.replace("room-", "");
    }
    postUrl(
      "/dungeon/gotoroom/",
      { action: "gotoroom", room: id },
      "post",
      function (data) {
        Dungeon.activeRequest = false;
        DungeonViewer.initCooldown(data.cooldown);
        if (data.result || data.return_url) {
          AngryAjax.goToUrl(AngryAjax.getCurrentUrl());
        }
      }
    );
  };
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
            await handlePvpFight();
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

function isGroupFight() {
  const url = location.pathname;
  if (url.match(/^(?!.*\/alley\/).*\/fight\//)) {
    return true;
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
              if (typeof data["fullenergyin"] != "undefinded") {
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
    LEGACY_initGroupFightLogs();
    handleEndOfGroupFight();
  } else if (url.includes("/player/")) {
    // player page
    redrawMain();
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
  } else if (url.includes("clan")) {
    if ($("#reorder-clan").length) return;
    const coolnessSpan = $(
      '<span id="reorder-clan" class="cool-1"><i></i></span>'
    ).css({
      cursor: "pointer",
    });
    coolnessSpan.on("click", sortClanPlayersByCoolness);

    const addToEnemiesBtn = createButton({
      text: "В список врагов",
      onClick: () => addClanToEnemies(),
      className: "add-to-enemies",
      disableAfterClick: true,
    });

    $('td.label:contains("Кланеры")').prepend(addToEnemiesBtn);
    coolnessSpan.insertAfter("a[onclick=\"$('#players').toggle();\"]");
  } else if (["/squid/", "/meetings/", "/sovet/career/"].includes(url)) {
    $("#content")[0].scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

//
///
//
var awpn = {
  Madness: {
    turns: "2",
    cnt: "",
    pn: "l",
    fstr: 'p:contains("бешенство на 2 хода")',
    image:
      '<i class="icon-madness deaf" style="margin:1px; filter:contrast(2.0);"></i>',
  },
  MadTrump: {
    turns: "1",
    cnt: "",
    pn: "l",
    fstr: 'p:contains("отправляет в безумие")',
    image:
      '<i class="icon-madness deaf" style="margin:1px; filter:contrast(2.0);"></i>',
  },
  superhit6: {
    turns: "1",
    cnt: "",
    pn: "mf",
    fstr: 'p:contains("впадает в безумие на 1 ход!"):not(:contains("змея"))',
    image: '<i class="icon-madness deaf"></i>',
  }, //безумие от суперудара
  Snake: {
    turns: "1",
    cnt: "",
    pn: "mf",
    fstr: 'p:contains("впадает в безумие на 1 ход!"):contains("змея")',
    image:
      '<img class="icon deaf" src="/@/images/obj/pets/28-8.png" style="margin:1px;">',
  },
  Stun: {
    turns: "1",
    cnt: "",
    pn: "l",
    fstr: 'p:contains(" умильно смотрит на")',
    image: '<span class="stun deaf"><i style="margin:1px;"></i></span>',
  },
  totem: {
    turns: "1",
    cnt: "",
    pn: "l",
    fstr: 'p:contains("тотема оглушает")',
    image: '<span class="stun deaf"><i style="margin:1px;"></i></span>',
  },
  Bear: {
    turns: "1",
    cnt: "",
    pn: "l",
    fstr: 'p:contains("случайно оглушает"):not(:contains("Пугало"))',
    image:
      '<i class="icon icon-bear deaf" style="filter: contrast(10.0); margin:1px; zoom:0.8;"></i>',
  },
  Snowman: {
    turns: "1",
    cnt: "",
    pn: "l",
    fstr: 'p:contains("случайно оглушает"):contains("Пугало")',
    image:
      '<img  class="icon deaf" src="/@/images/obj/beast_ability/ability11.png" style="filter:contrast(2.0);">',
  },
  Knockout: {
    turns: "1",
    cnt: "",
    pn: "l",
    fstr: 'p:contains("вызывает лавину")',
    image:
      '<i class="icon icon-set-perk-knockout deaf" style="margin:1px;"></i>',
  },
  Bike: {
    turns: "1",
    cnt: "",
    pn: "",
    fstr: "",
    image: '<i class="icon icon-bike deaf" style="margin:1px;"></i>',
  },
  Hamsters: {
    turns: "",
    cnt: "",
    pn: "h",
    fstr: 'p:contains("жевать провода")',
    image:
      '<img  class="icon" src="/@/images/obj/pets/25-1.png" style="margin:1px; filter:contrast(2.0);">',
  },
  Hamshams: {
    turns: "-1",
    cnt: "",
    pn: "hh",
    fstr: 'p.hamster:contains("прицеливается и нападает")',
    image: "",
  },
  Robots_b: {
    turns: "4",
    cnt: "",
    pn: "l",
    fstr: 'p:contains("силовой броней")',
    image:
      '<img class="icon" src="/@/images/obj/pets/29-4.png" style="margin:1px; filter:contrast(10.0);">',
  },
  Robots_o: {
    turns: "4",
    cnt: "",
    pn: "l",
    fstr: 'p:contains("активирует отражение")',
    image:
      '<img class="icon" src="/@/images/obj/pets/29-4.png" style="margin:1px; position:inherit; filter:hue-rotate(-90deg) opacity(60%);">',
  },
  Zimtime: {
    turns: "",
    cnt: "",
    pn: "f",
    fstr: 'p:contains("зимнее время")',
    image:
      '<span class="sovetabil3"><i class="icon" style="margin:1px;"></i></span>',
  },
  Tornados: {
    turns: "4",
    cnt: "",
    pn: "f",
    fstr: 'p:contains("защиту от урона и гранат на 70%")',
    image:
      '<img class="icon" src="/@/images/obj/superhits/superhit-10-3.png" style="margin:1px;">',
  },
  antigrnt: {
    turns: "4",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Щит"):not(:contains("Стальной"))',
    image:
      '<span class="icon icon-antigranata" style="margin:1px; zoom:0.9;"></span>',
  },
  antigrnt2: {
    turns: "2",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Стальной щит")',
    image:
      '<span class="icon icon-antigranata2" style="margin: 1px; zoom:0.9;"></span>',
  },
  helmet: {
    turns: "2",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Пробковая каска")',
    image: '<span class="icon icon-helmet" style="margin: 1px;"></span>',
  },
  helmet3: {
    turns: "3",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Новогодний напиток")',
    image:
      '<img class="icon" src="/@/images/obj/fight_item/weapon73.png" style="margin:1px;">',
  },
  reflect: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Коварная пружина")',
    image: '<span class="icon icon-reflect" style="margin: 1px;"></span>',
  },
  durian: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Дуриан «Заморский»"):not(:contains("кушает"))',
    image:
      '<img class="icon" src="/@/images/obj/fight_item/weapon76.png" style="margin:1px;">',
  },
  kokos: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Орех «Кокосовый»"):not(:contains("кушает"))',
    image:
      '<img class="icon" src="/@/images/obj/fight_item/weapon74.png" style="margin:1px;">',
  },
  tikva: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Тыква «Колхозная»"):not(:contains("кушает"))',
    image:
      '<img class="icon" src="/@/images/obj/fight_item/weapon75.png" style="margin:1px;">',
  },
  granat: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Гранат «Осколочный»"):not(:contains("кушает"))',
    image:
      '<img class="icon" src="/@/images/obj/fight_item/weapon77.png" style="margin:1px;">',
  },
  rolls: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Роллы")',
    image:
      '<img class="icon" src="/@/images/obj/drugs148.png" style="margin:1px;">',
  },
  vokker: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Вкусный воккер")',
    image:
      '<img class="icon" src="/@/images/obj/drugs179.png" style="margin:1px;">',
  },
  food87: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Аптечный набор «Красный»")',
    image:
      '<img class="icon" src="/@/images/obj/fight_item/weapon87.png" style="margin:1px;">',
  },
  food86: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Аптечный набор «Оранжевый»")',
    image:
      '<img class="icon" src="/@/images/obj/fight_item/weapon86.png" style="margin:1px;">',
  },
  food79: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Леденцы с иголками")',
    image:
      '<img class="icon" src="/@/images/obj/fight_item/weapon79.png" style="margin:1px;">',
  },
  food80: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Новогодняя карамель")',
    image:
      '<img class="icon" src="/@/images/obj/fight_item/weapon80.png" style="margin:1px;">',
  },
  cheese: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Ароматным сыром")',
    image:
      '<span class="icon icon-cheese" style="margin: 1px; zoom:0.9;"></span>',
  },
  migrant: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Трудовой книжкой")',
    image:
      '<img class="icon" src="/@/images/obj/fight_item/migrant.png" style="margin:1px;">',
  },
  lenin: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("призывает Вождя")',
    image:
      '<img class="icon" src="/@/images/obj/neftlenin_head.png" style="margin:1px;">',
  },
  grena82: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Граната «Поразительная»")',
    image:
      '<img class="icon" src="/@/images/obj/fight_item/weapon82.png" style="margin:1px;">',
  },
  grena83: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Граната «Дух»")',
    image:
      '<img class="icon" src="/@/images/obj/fight_item/weapon83.png" style="margin:1px;">',
  },
  grena84: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Граната «Кислотная»")',
    image:
      '<img class="icon" src="/@/images/obj/fight_item/weapon84.png" style="margin:1px;">',
  },
  grena85: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Граната «Светлячок»")',
    image:
      '<img class="icon" src="/@/images/obj/fight_item/weapon85.png" style="margin:1px;">',
  },
  grena66m1: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Коктейль Молотова [Ультра]")',
    image:
      '<img class="icon" src="/@/images/obj/weapon66_mf1.png" style="margin:1px;">',
  },
  grena66: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Коктейль Молотова"):not(:contains("[Ультра]"))',
    image:
      '<img class="icon" src="/@/images/obj/weapon66.png" style="margin:1px;">',
  },
  grena63m2: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Кластерная граната [Мега]")',
    image:
      '<img class="icon" src="/@/images/obj/weapon63_mf2.png" style="margin:1px;">',
  },
  grena63m1: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Кластерная граната [Ультра]")',
    image:
      '<img class="icon" src="/@/images/obj/weapon63_mf1.png" style="margin:1px;">',
  },
  grena63: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Кластерная граната"):not(:contains("[Ультра]")):not(:contains("[Мега]"))',
    image:
      '<img class="icon" src="/@/images/obj/weapon63.png" style="margin:1px;">',
  },
  c4: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Взрывчатка С4")',
    image:
      '<img class="icon" src="/@/images/obj/fight_item/weapon88.png" style="margin:1px;">',
  },
  grena37: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("бомба-вонючка")',
    image:
      '<img class="icon" src="/@/images/obj/weapon37.png" style="margin:1px;">',
  },
  grena38: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Хлопушка—разлучница")',
    image:
      '<img class="icon" src="/@/images/obj/weapon38.png" style="margin:1px;">',
  },
  grena46: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Мощный снежок")',
    image:
      '<img class="icon" src="/@/images/obj/weapon46.png" style="margin:1px;">',
  },
  grena79: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Взрывной мандарин")',
    image:
      '<img class="icon" src="/@/images/obj/fight_item/weapon79.png" style="margin:1px;">',
  },
  grduck: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Граната «Уточка»")',
    image:
      '<img class="icon" src="/@/images/obj/dung_prize/duck.png" style="margin:1px;">',
  },
  easydo: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Светошумовая граната")',
    image:
      '<img class="icon" src="/@/images/obj/weapon62.png" style="margin:1px;">',
  },
  svistok: {
    turns: "1",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("в бой отряд ОМОНа")',
    image:
      '<img class="icon" src="/@/images/obj/item28.png" style="margin:1px;">',
  },
  easytarg: {
    turns: "5",
    cnt: "",
    pn: "et",
    fstr: 'p:contains("Светошумовая граната")',
    image: '<i class="icon icon-easytarget" style="margin:1px;"></i>',
  },
  // 'easytarg2' :{turns: '', cnt: '',  pn: 'nf',fstr: 'p:contains("Светошумовая граната")', image: '<i class="icon icon-easytarget"></i>'},
  dim: {
    turns: "2",
    cnt: "1",
    pn: "f",
    fstr: 'p:contains("Дымовая шашка")',
    image: '<i class="icon icon-foggranade" style="margin:1px;"></i>',
  },
  sovetabil7: {
    turns: "1",
    cnt: "5",
    pn: "f",
    fstr: 'p:contains("командует ОМОНу")',
    image:
      '<span class="sovetabil7"><i class="icon" style="margin:1px;"></i></span>',
  },
  sovetabil1: {
    turns: "1",
    cnt: "",
    pn: "f",
    fstr: 'p:contains("воодушевляет избирателей")',
    image:
      '<span class="sovetabil1"><i class="icon" style="margin:1px;"></i></span>',
  },
  periscope: {
    turns: "1",
    cnt: "",
    pn: "f",
    fstr: 'p:contains("вызывает подлодку")',
    image: '<span class="sub-periscope"><i></i></span>',
  },
  "rage-1": {
    turns: "",
    cnt: "",
    pn: "f",
    fstr: 'p:contains("всплывает со дна")',
    image: '<span class="rage-1"><i style="zoom:0.9; margin:1px;"></i></span>',
  },
  car_sw2: {
    turns: "3",
    cnt: "5",
    pn: "f",
    fstr: 'p:contains("Абсолютную защиту")',
    image:
      '<img class="icon" src="/css/images/obj/beast_ability/ability_sw_hide.png" style="margin:1px;">',
  },
  ruslan: {
    turns: "1",
    cnt: "9",
    pn: "f",
    fstr: 'p:contains("пополняет запасы боеприпасов")',
    image:
      '<img class="icon" src="/@/images/obj/cars/70.png" style="margin:1px; filter: contrast(2.0);">',
  },
  tramp: {
    turns: "1",
    cnt: "5",
    pn: "f",
    fstr: 'p:contains("великим, как")',
    image:
      '<img class="icon" src="/@/images/loc/trump/talant_3.png" style="margin:1px; filter: contrast(2.0);">',
  },
  mgs: {
    turns: "1",
    cnt: "5",
    pn: "l",
    fstr: 'p:contains("МосГосСтрах")',
    image:
      '<img class="icon" src="/@/images/obj/8march2/items/128/6.png" style="margin:1px; filter: contrast(2.0);">',
  },
  rabbit: {
    turns: "1",
    cnt: "5",
    pn: "l",
    fstr: 'p:contains("Пасхальный кролик")',
    image:
      '<img class="icon" src="/@/images/obj/rabbit.png" style="margin:1px;">',
  },
  rocketab1: {
    turns: "1",
    cnt: "",
    pn: "f",
    fstr: 'p:contains("Ракета игрока")',
    image: '<i class="icon icon-rocket-1" style="margin:1px;"></i>',
  },
  sany: {
    turns: "1",
    cnt: "2",
    pn: "f",
    fstr: 'p:contains("катается на санях")',
    image:
      '<img class="icon" src="/@/images/obj/cars/56.png" style="margin:1px;">',
  },
  roketxsany: {
    turns: "1",
    cnt: "",
    pn: "l",
    fstr: 'p:contains("способность Новогоднее выздоровление")',
    image:
      '<img class="icon" src="/@/images/obj/cars/56.png" style="margin:1px;"><span style="color:#001dff; margin-left:-10px; font-size:14px;">&otimes;</span>',
  },
  gazi: {
    turns: "1",
    cnt: "2",
    pn: "f",
    fstr: 'p:contains("Жертва отравляется")',
    image:
      '<img class="icon" src="/@/images/obj/cars/51.png" style="margin:1px;">',
  },
  roketxgazi: {
    turns: "1",
    cnt: "",
    pn: "l",
    fstr: 'p:contains("способность Выхлопные газы")',
    image:
      '<img class="icon" src="/@/images/obj/cars/51.png" style="margin:1px;"><span style="color:#ff0000; margin-left:-10px; font-size:14px;">&otimes;</span>',
  },
  rocketab2: {
    turns: "1",
    cnt: "9",
    pn: "f",
    fstr: 'p:contains("облетев вокруг Земли")',
    image: '<i class="icon icon-rocket-2" style="margin:1px;"></i>',
  },
  noheal: {
    turns: "",
    cnt: "",
    pn: "l",
    fstr: 'p:contains("не может восстановить здоровье ничем")',
    image:
      '<span class="icon icon-heal" style="margin:1px;position:relative;"><span style="color:#ff0000; position:absolute; font-size:14px; left:4px; top:-4px;">&otimes; </span></span>',
  },
  car_sw: {
    turns: "1",
    cnt: "5",
    pn: "f",
    fstr: 'p:contains("Звезда смерти")',
    image:
      '<img class="icon" src="/css/images/obj/beast_ability/ability_sw_deathray_2.png" style="margin:1px;">',
  },
  forcejoin: {
    turns: "1",
    cnt: "",
    pn: "f",
    fstr: 'p:contains("вмешивается в бой")',
    image: '<span class="icon icon-forcejoin" style="margin:1px;"></span>',
  },
  kgranat: {
    turns: "4",
    cnt: "",
    pn: "f",
    fstr: 'p:contains("Кальян «Гранатовый»")',
    image:
      '<img class="icon" src="/@/images/obj/shisha/red1.png" style="margin:1px;">',
  },
  kled: {
    turns: "6",
    cnt: "",
    pn: "f",
    fstr: 'p:contains("Кальян «Ледяной»")',
    image:
      '<img class="icon" src="/@/images/obj/shisha/frost1.png" style="margin:1px;">',
  },
  nokick: {
    turns: "2",
    cnt: "",
    pn: "f",
    fstr: 'p:contains("Не бейте его!")',
    image: '<span class="red">Не бить! </span>',
  },
  malina: {
    turns: "1",
    cnt: "",
    pn: "f",
    fstr: 'p:contains("разгадывает Комбинацию Пахана")',
    image:
      '<img class="icon" src="/@/images/obj/vovan_note.png" style="margin:1px;">',
  },
};

export { createButton, createPopover };
