/* global HomeNyTree countdown AngryAjax */

import { getElementsOnThePage, strToHtml } from "./utils.js";

const timersData = [
  // shaman
  {
    selector:
      "#content > div > div.boss-common-block > div.boss-common-bottom-panel > div > div > span.boss-common-active-from-value",
    url: new URL(window.location.href).origin + "/shaman/",
    imgSrc: "/@/images/loc/shaman/abil_6.png",
    targetHref: "/shaman/",
  },

  // grumpy cat
  {
    selector:
      "#content > div > div > div.grumpy2019-bottom-panel > div.grumpy2019-available-block > span.grumpy2019-available-value",
    url: new URL(window.location.href).origin + "/grumpy/",
    imgSrc: "/@/images/loc/grumpy/abils/abil_1.png",
    targetHref: "/grumpy/",
  },

  // matrix
  {
    selector: "#spanMatrixTimer",
    url: new URL(window.location.href).origin + "/matrix/",
    imgSrc: "/@/images/obj/beast_ability/ability54.png",
    targetHref: "/matrix/",
  },

  // tarrifs
  {
    selector: ".worldwar2025-available-value",
    url: new URL(window.location.href).origin + "/tariffs/",
    imgSrc: "/@/images/obj/gifts2025/may/box_worldwar.png",
    targetHref: "/tariffs/",
  },

  // karlsson
  {
    selector: ".carlson2025-available-value",
    url: new URL(window.location.href).origin + "/karlsson/",
    imgSrc: "/@/images/obj/gifts2025/may/box_carlson.png",
    targetHref: "/karlsson/",
  },

  // SMOKE SCREEN
  {
    selector:
      "#content > div > div.rocket2023-block > div.rocket2023-available-block > span.rocket2023-available-value",
    url: new URL(window.location.href).origin + "/kosmodromx/",
    imgSrc: "/@/images/obj/gifts2023/may/abil_kosm_smoke.png",
    targetHref: "/kosmodromx/",
  },
  // DYI
  {
    selector: "TODO dyi selector",
    url: new URL(window.location.href).origin + "/kosmodromx/",
    imgSrc: "/@/images/loc/rocket/rocket.png",
    targetHref: "/kosmodromx/",
  },

  // hawthorn
  {
    selector:
      "#hawthorn-popup > div > div.hawthorn-popup__actions > div > span",
    url: new URL(window.location.href).origin + "/trainer/vip/",
    imgSrc: "/@/images/loc/vip/hawthorn_icon.png",
    targetHref: "/trainer/vip/hawthorn/",
  },

  // tattoo press
  {
    selector:
      "#content > table > tbody > tr > td:nth-child(2) > div.block-bordered-tattoo > p:nth-child(3) > span",
    url: new URL(window.location.href).origin + "/nightclub/",
    imgSrc: "/@/images/obj/8march6/tattoo_mach.png",
    targetHref: "/nightclub/",
  },

  // dino
  {
    selector:
      "#dino-tab-content-2 > div.dinopark-dino-stats > div:last-child > div.dinopark-dino-stat__value > span",
    url: new URL(window.location.href).origin + "/dinopark/",
    imgSrc: "/@/images/loc/dinopark/dinoegg.png",
    targetHref: "/dinopark/",
  },

  // chaikhana69
  {
    selector:
      "#content > div > div.pilaf-actions .pilaf-activate-button-inner2",
    url: new URL(window.location.href).origin + "/teahouse/",
    imgSrc: "/@/images/loc/pilaf/objs/obj_3.png",
    targetHref: "/teahouse/",
  },

  // bender
  {
    selector:
      "#content > div > div.bender-content > div.bender-use > div > div > button",
    url: new URL(window.location.href).origin + "/badasrobot/",
    imgSrc: "/@/images/obj/gifts2017/futurama/bender/head.png",
    targetHref: "/badasrobot/",
  },

  // gifts
  // {
  //   selector: "#nytreetimer",
  //   url: new URL(window.location.href).origin + "/home/",
  //   imgSrc: "/@/images/obj/gifts/mj_ny24/3-3_64.png",
  //   onclick: window.HomeNyTree.showGiftsBlock,
  // },

  // tonic
  // {
  //   selector:
  //     "#content > div > div.icecream-fabric > div:nth-child(2) > div.icecream-fabric-item__content > div.icecream-fabric-item-actions > div > span.time",
  //   url: new URL(window.location.href).origin + "/toniks/",
  //   imgSrc: "/@/images/loc/cocktails/pink_3.png",
  //   targetHref: "/toniks/",
  // },

  // hacker
  // {
  //   selector:
  //     "#content > div > div > div.boss-common-available-block > span.boss-common-available-value",
  //   url: new URL(window.location.href).origin + "/hacker/",
  //   imgSrc: "/@/images/obj/gifts2024/may/hacker.png",
  //   targetHref: "/hacker/",
  // },
  // mars
  // {
  //   selector:
  //     "#content > div > div.musk2020-bottom-panel > div > div.musk2020-mars-actions.disabled > div > span",
  //   url: new URL(window.location.href).origin + "/mars2024/",
  //   imgSrc: "/@/images/loc/musk/musk2020-mars2024.png",
  //   targetHref: "/mars2024/",
  // },
];

async function getTimer({ selector, url, imgSrc, targetHref, onclick }) {
  if (!selector || !url || !imgSrc) {
    console.log("Could not fetch timer. Data missing.");
    return;
  }

  let timerSpan = await getElementsOnThePage(selector, new URL(url).pathname);

  if (targetHref === "/dinopark/") {
    const dinoImg = await getElementsOnThePage(
      ".dinopark-dino-pic__img",
      "/dinopark/"
    );
    imgSrc = dinoImg.getAttribute("src");
  }

  let imgTag = strToHtml(
    `<img style="width: 56px; height: 56px; cursor: pointer; ${targetHref === "/shaman/" && "transform: scale(1.4);transform-origin: center;"}" src=${imgSrc} />`
  );

  if (!timerSpan || timerSpan === null) {
    timerSpan = strToHtml("<span>Готово</span>");
  } else {
    if (timerSpan?.innerText === "Забрать пойло!") {
      timerSpan.innerText = "Готово";
    } else {
      countdown(timerSpan);
    }
  }

  timerSpan.style.cssText = STYLES.hawthorn;

  if (timerSpan?.getAttribute("class")?.includes("button")) {
    $(timerSpan).css({
      lineHeight: "24px",
      padding: "3px 12px",
    });
  }

  if (targetHref === "/badasrobot/") {
    // fix bender button styles
    timerSpan.styles;
  }

  let container = strToHtml(`<div></div>`);

  container.style.cssText = `display: flex; align-items: center; flex-direction: column;`;

  container.appendChild(imgTag);
  container.appendChild(timerSpan);

  if (targetHref) {
    imgTag.addEventListener("click", () => AngryAjax.goToUrl(targetHref));
  }
  if (onclick) {
    imgTag.addEventListener("click", onclick);
  }

  return container;
}

async function drawTimers() {
  const renderTimers = async () => {
    const timers = await Promise.all(
      timersData.map(async (timerData) => {
        try {
          return await getTimer(timerData);
        } catch (error) {
          console.log("Error processing timer:", timerData, error);
          return null; // Skip the timer that failed (does not exist?)
        }
      })
    );

    const validTimers = timers.filter(Boolean);
    const container = strToHtml(
      `<div class="timers-container" style="${STYLES.timersContainer}"></div>`
    );

    function handleResize() {
      if (window.innerWidth < 1330) {
        container.style.display = "none";
      } else {
        container.style.display = "grid";
      }
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    container.replaceChildren(...validTimers);
    document.querySelector(".main-block").appendChild(container);
  };

  const button = strToHtml(`
      <div class="button" style="position: fixed; top: 32px; right: 8px;" id="timers-trigger"><span class="f"><i class="rl"></i><i class="bl"></i><i class="brc"></i><div class="c" style="padding: 1px 3px;">
      Показать Таймеры
      </div></span></div>
      `);

  button.addEventListener("click", () => {
    renderTimers();
    button.remove(); // Remove the button after clicking
  });

  document.querySelector(".main-block").appendChild(button);
}

async function getPetsTimers() {
  // TODO ??
}

async function getPetsIds(imgIdsArr = ["45-7", "84-4", "42-6", "85-5"]) {
  try {
    const petsList = await getElementsOnThePage(".object-thumbs", "/petarena/");

    const ids = Array.from(petsList[0].querySelectorAll(".object-thumb"))
      .filter((thumb) => {
        const imgId = thumb
          .querySelector("img")
          .src.match(/\/obj\/pets\/(.*?)\.png/)[1];
        return ["45-7", "84-4", "42-6", "85-5"].includes(imgId);
      })
      .map(
        (thumb) =>
          thumb
            .querySelector("#train-parrot")
            .getAttribute("onclick")
            .match(/\/petarena\/train\/(\d+)\//)[1]
      );

    return ids;
  } catch (error) {
    console.log("Could not fetch pets ids\n", error);
  }
}

let STYLES = {
  hawthorn: `
    text-align: center;
    margin: auto 4px;
    font-family: 'bloccregular'; 
    font-size: 16px; 
    color: #ffffff; 
    text-shadow: rgb(73, 73, 73) 2px 0px 0px, rgb(73, 73, 73) 1.75517px 0.958851px 0px, rgb(73, 73, 73) 1.0806px 1.68294px 0px, rgb(73, 73, 73) 0.141474px 1.99499px 0px, rgb(73, 73, 73) -0.832294px 1.81859px 0px, rgb(73, 73, 73) -1.60229px 1.19694px 0px, rgb(73, 73, 73) -1.97998px 0.28224px 0px, rgb(73, 73, 73) -1.87291px -0.701566px 0px, rgb(73, 73, 73) -1.30729px -1.5136px 0px, rgb(73, 73, 73) -0.421592px -1.95506px 0px, rgb(73, 73, 73) 0.567324px -1.91785px 0px, rgb(73, 73, 73) 1.41734px -1.41108px 0px, rgb(73, 73, 73) 1.92034px -0.558831px 0px;
  `,
  timersContainer: `
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    min-width: 190px;
    position: fixed;
    top: 32px;
    right: 8px;
    font-size: 79%;
    font-family: Tahoma, Arial, sans-serif;
    line-height: 1.3;
    padding: 12px 6px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.8);
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
    border: none;
    min-width: 190px;
    `,
};

function getGiftsTimer() {
  const timerSpan = strToHtml(
    // eslint-disable-next-line no-undef
    `<span timer="${HomeNyTree.nextGameTimeleft}" process="1">02:43:38</span>`
  );

  const imgTag = strToHtml(
    `<img style="width: 48px; height: 48px;" src="/@/images/obj/gifts/mj_ny24/3-3_64.png" />`
  );

  let container = strToHtml(
    `<div style="display: flex; cursor: pointer;"></div>`
  );

  timerSpan.style.cssText = STYLES.hawthorn;
  countdown(timerSpan);

  container.appendChild(timerSpan);
  container.appendChild(imgTag);

  return container;
}

export { drawTimers };
