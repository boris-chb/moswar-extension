import { getElementsOnThePage } from "./utils.js";

export const DOPINGS_DATA_ST = {
  heal: 51, // Микстура
  pyani: 52, // Пяни
  tvorog: 53, // Творог
  vitaminsHealth: 3397, // Витаминки «9.5 жизней»
  pillsHealth: 3840, // Таблетки «Новая жизнь»
  deMinerale: 3841, // Аква ДеМинерале
  bomjori: 3381, // Бутылка «Бомжори»
  kukuruza: [9904, 9905, 9906, 9907, 9908, 9909], // Кукуруза
  pryaniki: [7375, 7376, 7377, 7378, 7379, 7380], // Тульские Пряники
  pasta: [3551, 3552, 3553, 3554, 3555, 3556], // Термопаста
  caramels: [1209, 1210, 1211, 1212, 1213, 1214], // Карамельки
  cocktails: [2656, 2657, 2658, 2659, 2660, 2661], // Коктейли «Неповторимые»
  glupaya: 2872, // Конфета «Глупая»
};

// !!! IMPORTANT !!!
export async function mapDataStToDataId(dataSt) {
  const values = Array.isArray(dataSt) ? dataSt : [dataSt]; // Ensure it's an array

  // why so many promises? get the document once and query it for all the elements
  let stuff = await Promise.all(
    values.map(async (st) => {
      let img = await getElementsOnThePage(`img[data-st="${st}"]`, "/player/");

      let id = img?.getAttribute("data-id");

      return id;
    })
  );

  return stuff;
}

export async function useDopings(dopingsStArr) {
  const idsToEat = await mapDataStToDataId(dopingsStArr);
  await Promise.all(idsToEat.map((id) => useItem(id)));
}

export async function heal() {
  await useDopings(DOPINGS_DATA_ST.heal);
}

export async function useItem(itemId = "2474213164") {
  // default item is health potion
  const res = await fetch(
    `${new URL(window.location.href).origin}/player/json/use/${itemId}/`
  );
  const data = await res.text();
  const { inventory } = JSON.parse(data);
  return inventory;
}

export async function takeDailyDose(eatGlupaya = true) {
  const {
    bomjori,
    kukuruza,
    pryaniki,
    pasta,
    caramels,
    pillsHealth,
    vitaminsHealth,
    glupaya,
  } = DOPINGS_DATA_ST;

  const toEat = [
    ...kukuruza,
    ...caramels,
    ...pryaniki,
    ...pasta,
    pillsHealth,
    vitaminsHealth,
    bomjori,
    eatGlupaya ? glupaya : null,
  ];

  await Promise.all(toEat.map((itemId) => useDopings(itemId)));
}

export async function restoreHP() {
  await fetch(new URL(window.location.href).origin + "/player/checkhp/", {
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en;q=0.9",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
    },
    referrerPolicy: "strict-origin-when-cross-origin",
    body: "action=restorehp",
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
}

export async function eatSilly() {
  let sillyId = await mapDataStToDataId(DOPINGS_DATA_ST.glupaya);
  await useItem(sillyId);
}
