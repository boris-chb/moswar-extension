const ITEMS_IDS = {
  necklace: "44",
  kalash: "2638",
};

let FUTURA_KEY = "cf6a53d197cb3e3f752cc69134aa43f41bb613b6";

// shop
async function buyItem(itemId = "44", key = FUTURA_KEY) {
  await fetch(new URL(window.location.href).origin + "/shop/json/", {
    referrer: new URL(window.location.href).origin + "/shop/section/jewellery/",
    method: "POST",

    body: new URLSearchParams({
      key,
      action: "buy",
      item: itemId,
      type: "",
      ajax_ext: "2",
      autochange_honey: "0",
    }),
  });
}

async function delay(s = 1) {
  return new Promise((res) => setTimeout(res, s * 1000));
}

async function sellItem(itemId) {
  const url = new URL(window.location.href).origin + "/shop/";

  await fetch(url, {
    method: "POST",
    body: new URLSearchParams({
      action: "sell",
      item: itemId,
      count: 1,
      __referrer: "/shop/section/mine/",
    }),
  });
}

async function processItems(itemId = ITEMS_IDS.necklace) {
  const itemIdsArr = getFactoryItemIdsArr(itemId).slice(0, 500);

  console.log("🛠️ N(items) to upgrade:\n", itemIdsArr.length);

  try {
    await Promise.all(
      itemIdsArr.map(async (id) => {
        await modifyItem(id); // Modify item
        await delay(0.5);
        await sellItem(id); // Sell item after modifying
      })
    );

    return AngryAjax.goToUrl("/factory/mf/");
  } catch (e) {
    console.log("🛠️ Error while upgrading items! ❌");
    console.log(e);
    return;
  }
}

async function buyNecklaces(count = 500) {
  const purchases = Array.from({ length: count }, () =>
    buyItem(ITEMS_IDS.necklace)
  );

  await Promise.all(purchases);
  return AngryAjax.goToUrl("/factory/mf/");
}

// factory
async function modifyItem(itemId) {
  fetch(new URL(window.location.href).origin + "/factory/mf-item/", {
    method: "POST",
    body: new URLSearchParams({
      inventory: itemId,
      action: "mf-item",
      __ajax: "1",
    }),
  });
}

function getFactoryItemIdsArr(dataSt) {
  //eslint-disable-next-line no-undef
  return [...document.querySelectorAll(".object-thumb")]
    .filter(
      (thumb) =>
        !thumb.querySelector(".mf") && // Exclude .object-thumb with .mf child
        [...thumb.querySelectorAll(".padding img")].some(
          (el) => el.getAttribute("data-st") === dataSt
        )
    )
    .flatMap((thumb) =>
      [...thumb.querySelectorAll(".padding img")]
        .filter((el) => el.getAttribute("data-st") === dataSt)
        .map((el) => el.getAttribute("data-id"))
    );
}

async function farmMod() {
  await buyNecklaces(50);
  await delay(1);
  await processItems();
  setTimeout(async () => await farmMod(), 1000);
}

async function processItemSell(itemNameStr = "Серебряная цепочка") {
  // eslint-disable-next-line no-undef
  const rels = Array.from($$(".object"))
    .filter((el) => el.querySelector("h2")?.innerText.includes(itemNameStr))
    .map((el) => el.getAttribute("rel"))
    .slice(0, 500);

  console.log("🛠️ N(items) to sell:\n", rels.length);
  await Promise.all(rels.map((id) => sellItem(id)));
}

// export function closeAlerts() {
//   // eslint-disable-next-line no-undef
//   $$(".alert.infoalert.alert-big span.close-cross").forEach((item) =>
//     item.click()
//   );
// }

// export async function makeGift(
//   itemId = 309,
//   playerName = "barifan",
//   key = "522ea292c4961968c75afb5a71a0725e5328cbb0"
// ) {
//   // dopings: 309 (valuyiki), 670 (respirator), 671 (mask)
//   fetch(new URL(window.location.href).origin + "/shop/", {
//     headers: {
//       accept: "*/*",
//       "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
//       "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
//       "sec-ch-ua": '"Chromium";v="131", "Not_A Brand";v="24"',
//       "sec-ch-ua-mobile": "?0",
//       "sec-ch-ua-platform": '"macOS"',
//       "sec-fetch-dest": "empty",
//       "sec-fetch-mode": "cors",
//       "sec-fetch-site": "same-origin",
//       "x-requested-with": "XMLHttpRequest",
//     },
//     referrer: new URL(window.location.href).origin + "/shop/",
//     referrerPolicy: "strict-origin-when-cross-origin"//     method: "POST",
//     mode: "cors",
//     credentials: "include",
//   });
// }

// sequentially

// async function processItemUpgrades(itemId) {
//   let itemIdsArr = getFactoryItemIdsArr(itemId);

//   console.log("🛠️ N(items) to upgrade:\n", itemIdsArr.length);
//   for (const id of itemIdsArr) {
//     await modifyItem(id);
//     // await delay(1);
//   }
//   console.log("🛠️ Items upgraded! ✅");
// }

// async function processItemSell(itemNameStr) {
//   // eslint-disable-next-line no-undef
//   const rels = Array.from($$(".object"))
//     .filter((el) => el.querySelector("h2")?.innerText.includes(itemNameStr))
//     .map((el) => el.getAttribute("rel"));

//   for (const id of rels) {
//     await sellItem(id);
//     // await delay(1);
//   }
//   console.log("💰 Items sold! ✅");
// }

// async function buyNecklaces(count) {
//   for (let i = 0; i < count; i++) {
//     await buyItem(ITEMS_IDS.necklace);
//     await delay(1);
//   }

//   console.log("💰 Necklaces purchased! ✅");
// }
