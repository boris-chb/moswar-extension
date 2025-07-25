/* global AngryAjax, $, showAlert, simple_tooltip  Worldtour2 */

import { makeTurn } from ".";
import { parseHtml } from "./utils";

export const ABILITIES = {
  roar: -310,
  topot: -311,
  krovotok: -313,
  secondSelf: 363,
  vampirism: 540,
  invincible: 541,
  mass: 543,
};

export async function skipPvpFight() {
  if (!AngryAjax.getCurrentUrl().includes("fight")) return;
  if (!$(".block-rounded").children().first().hasClass("current")) {
    showAlert("Ошибка", "Перейдите на последний ход!");
    return;
  }

  if (
    $(
      "#fightGroupForm > table > tbody > tr > td.log > ul > li:nth-child(1) > div.result"
    ).length > 0
  ) {
    showAlert("Ошибка", "Бой уже закончен.");
    return;
  }

  console.info("Скип боя");
  await useAbility(ABILITIES.roar);
  await useAbility(ABILITIES.secondSelf);
  await useAbility(ABILITIES.krovotok);
  await useAbility(ABILITIES.vampirism);
  await useAbility(ABILITIES.topot);
  await useAbility(ABILITIES.mass);
  await useAbility(ABILITIES.invincible);
  await makeTurn(1);
}

export async function useAbility(abilityId) {
  await fetch(new URL(window.location.href).origin + "/fight/", {
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: `action=useabl&json=1&target=${abilityId}`,
    method: "POST",
    credentials: "include",
  });
}

export async function useItem(itemId) {
  await fetch(new URL(window.location.href).origin + "/fight/", {
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: `action=useabl&json=1&target=${itemId}`,
    method: "POST",
    credentials: "include",
  });
}

export async function pvpStartFight() {
  console.log("[PVP] START FIGHT...");
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
    body: "action=fight",
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
  AngryAjax.reload();
}

export async function onEndOfTurn() {
  // restoreHP();

  AngryAjax.goToUrl("/travel2/");
  $(document).one("ajaxStop", () =>
    setTimeout(() => $(document).trigger("endOfTurn"), 1000)
  );
}

function restoreHP() {
  $.post(
    "/player/checkhp/",
    {
      action: "restorehp",
    },
    function (data) {}
  );
}

async function customRoll(top = false) {
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

  let newStats = $(resHtml).find(".worldtour-stats");
  let newOpponentStats = $(resHtml).find(
    ".worldtour__team.worldtour__team--right"
  );
  let footerReward = $(resHtml).find(".worldtour__footer-reward");
  // if there are rewards, append them
  if (footerReward.length) {
    $(".worldtour__footer-reward").first().replaceWith(footerReward);
  }

  // replace glory points stats
  $(".worldtour-stats").replaceWith(newStats);
  // replace worldtour container
  $(".worldtour__team.worldtour__team--right").replaceWith(newOpponentStats);
  // add tooltip to opponent stats
  console.log(newOpponentStats.children().first());
  simple_tooltip(newOpponentStats.children().first());

  replaceRollBtnHandlers();
}

function renderPvpTotals() {
  if ($("#pvp-totals").length) return;
  const totals = { current: 0, max: 0 };

  $("#travel-2-country option").each(function () {
    const match = $(this)
      .text()
      .match(/(\d+)\/(\d+)/);
    if (match) {
      totals.current += Number(match[1]);
      totals.max += Number(match[2]);
    }
  });

  const $totalsElement = $(
    `<span id="pvp-totals" style="font-size:140%" class="dpoints">
    <br>${totals.current} / ${totals.max}<i></i>
    </span>`
  );
  $(".worldtour-stats__content")
    .css({ background: "#00034a" })
    .append($totalsElement);

  $("span.dpoints").css({
    "text-shadow": "1px 1px 1px #00000073",
  });
}

function redrawPvpContent() {
  if (Worldtour2.step === Worldtour2.maxStep) return;

  const agiotage = [
    ...$("#slava_info")
      .text()
      .matchAll(/сейчас ты получаешь лишь\s+([\d.]+%)/g),
  ].pop()?.[1];

  const currentBestStr = $(".worldtour-stats__p").first().text();
  const currentBest = parseInt(
    currentBestStr.match(/лучший результат.*?(\d+)\s+славы/)?.[1]
  );

  const maxStr = $(".worldtour-stats__p").first().next().text();
  const maxOffer = parseInt(
    maxStr.match(/можете получить до\s+(\d+)\s+славы/)?.[1]
  );
  const maxTotal = parseInt(maxStr.match(/максимум.*?(\d+)/)?.[1]);

  $(".worldtour-stats__content .worldtour-stats__p").each((_, el) =>
    $(el).remove()
  );

  const container = $("<div>")
    .addClass("worldtour-stats__p")
    .css({
      display: "flex",
      gap: "4px",
      alignItems: "center",
      justifyContent: "center",
      textShadow: "none",
      fontSize: "120%",
    })
    .append("Сейчас:")
    .append($("<span>").addClass("dpoints").text(currentBest).append("<i></i>"))
    .append("Можете получить:")
    .append($("<span>").addClass("dpoints").text(maxOffer).append("<i></i>"))
    .append(`Максимум (${agiotage}):`)
    .append($("<span>").addClass("dpoints").text(maxTotal).append("<i></i>"));

  $(".worldtour-stats__content").append(container);
  $(".worldtour__map-wrapper").css({ height: "350px" });
}

function replaceRollBtnHandlers() {
  $(
    "#content > div.worldtour.worldtour--2.worldtour--atlantida > div.worldtour__footer > div.worldtour__footer-actions-2 button"
  ).each((index, btn) => {
    const $btn = $(btn);
    $btn
      .off("click")
      .removeAttr("onclick")
      .on("click", async () => {
        await customRoll(index === 1);
        renderPvpTotals();
      });
  });

  $(".worldtour__button-border-blue .worldtour__button-small").on(
    "click",
    helpersUI
  );
}

function helpersUI() {
  const $parent = $(".worldtour-helpers-inner");
  $parent.html($parent.children().slice(0, 10));
  $parent.css({
    width: "auto",
    "margin-left": "0%",
    display: "flex",
    "flex-direction": "column",
    height: "100%",
  });

  // Worldtour2.paginateHelpersPageAnimation(1);
  $(".worldtour__pagination").remove();
}

function highlightFullCountries() {
  $("#travel-2-country option").each(function () {
    let text = $(this).text();
    const match = text.match(/(\d+)\/(\d+)/);
    if (!match) return;

    const current = parseInt(match[1], 10);
    const total = parseInt(match[2], 10);

    text = text.replace(/[✔?]/, current === total ? "✅" : "⏳");
    $(this).text(text);
  });
}

export function initPvpUI() {
  if ($("#skip-fight-btn").length) return;
  replaceRollBtnHandlers();
  helpersUI();
  renderPvpTotals();
  highlightFullCountries();
  redrawPvpContent();

  // fix rating misalignment
  $(".worldtour-rating-place").css({ position: "absolute" });

  // move геометки banner to the bottom
  $(".worldtour-banner").appendTo($(".worldtour-banner").parent());

  // $("#travel-classic-button").after(farmStarsBtn);
}
