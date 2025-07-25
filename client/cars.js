/* global showAlert $*/
import { createPopover, sendAlert } from "./index.js";
import { createButton } from "./ui/button.js";
import { delay, formatTime, getElementsOnThePage, parseHtml } from "./utils.js";

// машины на откат и абилки
export const EXCEPTION_CARS = [
  160, 198, 64, 48, 165, 46, 167, 40, 211, 221, 197, 50, 122, 215, 47, 110, 115,
  220, 196, 133, 87, 222, 179, 161,
];

export const EXCEPTION_PLANES_AND_BOATS_RIDES_IDS = [158, 219, 155, 121]; // zeppelin, kosmospas (mars-25), kosmospas, mi-8 (десант)

// вв
export const PLANES_AND_BOATS_RIDES_IDS = [
  158, 121, 219, 155, 192, 190, 223, 93, 97, 135, 182, 178, 195, 59, 216, 212,
  183, 173, 159, 156, 149, 146, 134, 119, 111, 95, 88, 84, 78, 74, 69, 68, 65,
  58, 55, 54, 52, 51, 49, 44, 38, 36, 35,
];

export const BANNED_CARS_RIDES_IDS = [
  141, 19, 85, 174, 175, 176, 166, 177, 61, 187, 188, 33,
];

const PRESETS = [
  {
    name: "🚙 Тачки 6 ч.",
    rides: [1, 2, 3, 4, 5, 6, 86, 162, 42],
  },
  {
    name: "🏎️ Тачки 10-12 ч.",
    rides: [
      7, 8, 9, 10, 11, 12, 45, 50, 80, 83, 98, 163, 164, 191, 213, 214, 222,
      110, 197, 92, 96, 221,
    ],
  },
  {
    name: "🚙 Тачки 13-15 ч.",
    rides: [215, 47, 53, 43, 169, 70, 157, 57, 62, 145, 170],
  },
  {
    name: "🚗 ВСЕ ТАЧКИ! 💯",
    rides: [],
  },
];

export async function carBringup(carId = "979786") {
  await checkCarTank(carId);
  fetch(new URL(window.location.href).origin + "/automobile/bringup/", {
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer: new URL(window.location.href).origin + "/automobile/bringup/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: `car=${carId}&__ajax=1&return_url=%2Farbat%2F`,
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
}

export async function carBringupMode(carId = "979786") {
  const isMonday =
    new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      timeZone: "Europe/Moscow",
    }).format(new Date()) === "Monday";

  if (!isMonday) {
    showAlert("🚕", "Не понедельник.");
    return;
  }
  const cooldownTimer = await getElementsOnThePage("#cooldown", `/arbat/`);

  if (cooldownTimer) {
    try {
      const secondsLeft = await cooldownTimer.getAttribute("timer");
      console.log(`[🚕] Retrying in ${formatTime(secondsLeft)} minutes.`);
      setTimeout(() => carBringupMode(carId), +secondsLeft * 1000);
      return;
    } catch (e) {
      console.log("[🚕] Cooldown timer not found.");
    }
  }

  await carBringup(carId);

  await delay(3);

  // Get new cooldown after triggering carBringup
  const newCooldownTimer = await getElementsOnThePage("#cooldown", `/arbat/`);
  const newSecondsLeft = await newCooldownTimer.getAttribute("timer");

  console.log(
    `[🚕] ✅ Done. Retrying in ${formatTime(newSecondsLeft)} minutes.`
  );
  setTimeout(() => carBringupMode(carId), +newSecondsLeft * 1000);
}

export async function fillCarTank(carId = "1095154") {
  await fetch(
    `${new URL(window.location.href).origin}/automobile/buypetrol/${carId}/`,
    {
      headers: {
        accept: "*/*",
        "accept-language": "en-GB,en;q=0.9",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-ch-ua": '"Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
      },
      referrer: `${new URL(window.location.href).origin}/automobile/buypetrol/${carId}/`,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: `__ajax=1&return_url=%2Fautomobile%2Fcar%2F${carId}`,
      method: "POST",
      mode: "cors",
      credentials: "include",
    }
  );
}

export async function fuelAllCars() {
  try {
    const carsLinks = await getElementsOnThePage(
      "#home-garage > div > div > a",
      "/home/"
    );

    const carsIds = carsLinks.map(
      (el) => el.getAttribute("href").split("/").splice(-2, 1)[0]
    );

    await Promise.all(carsIds.map((id) => fillCarTank(id)));
  } catch (e) {
    console.log("Could not fuel all cars");
  }
}

export function getGarageRides() {
  return [...document.querySelectorAll("li")]
    .filter((el) => el.getAttribute("id") && !el.querySelector("span.timeout"))
    .map((li) => {
      let carId = +li
        .querySelector('.actions input[name="car"]')
        .getAttribute("value");
      let rideId = +li
        .querySelector('.actions input[name="direction"]')
        .getAttribute("value");
      return { carId, rideId };
    });
}

export async function sendRide(carId, rideId) {
  await checkCarTank(carId);

  let res = await fetch(
    new URL(window.location.href).origin + "/automobile/ride/",
    {
      body: new URLSearchParams({
        direction: rideId,
        car: carId,
        __ajax: "1",
      }),
      method: "POST",
      mode: "cors",
      credentials: "include",
    }
  );

  let data = await res.text();
  let resDoc = parseHtml(data);
  let resAlert = resDoc.querySelector("body > .alert");

  resAlert.style.display = "block";
  resAlert.style.position = "static"; // Remove absolute centering
  resAlert.style.margin = "5px"; // Add some spacing
  resAlert.querySelector(".close-cross").remove();

  let alertsContainer = $("#ride-alerts");
  if (alertsContainer.length < 1) {
    alertsContainer = createPopover("ride-alerts");
  }

  alertsContainer.css({
    "align-items": "flex-start",
    overflowY: "scroll",
    maxHeight: "65vh",
    width: "90vw",
  });

  alertsContainer.append(resAlert);
}

export async function sendPlanesAndBoats() {
  const garageRides = getGarageRides();

  // { title, carId, rideId }
  let planesAndBoatsRides = garageRides.filter(
    (ride) =>
      PLANES_AND_BOATS_RIDES_IDS.includes(ride.rideId) &&
      !EXCEPTION_PLANES_AND_BOATS_RIDES_IDS.includes(ride.rideId)
  );

  if (!planesAndBoatsRides || planesAndBoatsRides.length === 0) {
    sendAlert({
      title: "Ошибка!",
      img: "/@/images/loc/auto/trip34.jpg",
      text: `Не нашлось ВВ для отправки.`,
    });
    return;
  }

  for (const ride of planesAndBoatsRides) {
    await sendRide(ride.carId, ride.rideId);
  }
  sendAlert({
    title: "Все правильно сделал!",
    img: "/@/images/loc/auto/trip22.jpg",
    text: `Отправлено ВВ: ${planesAndBoatsRides.length} ✈️🚢.`,
  });
}

export async function sendCars(rideIds = []) {
  const garageRides = getGarageRides();

  let cars = garageRides.filter(
    ({ rideId, carId }) =>
      !PLANES_AND_BOATS_RIDES_IDS.includes(rideId) &&
      !EXCEPTION_CARS.includes(carId) &&
      !BANNED_CARS_RIDES_IDS.includes(carId) &&
      (rideIds.length === 0 || rideIds.includes(rideId))
  );

  if (!cars || cars.length === 0) {
    sendAlert({
      title: "Ошибка!",
      img: "/@/images/loc/auto/trip34.jpg",
      text: `Не нашлось тачек для отправки.`,
    });
    return;
  }

  for (const car of cars) {
    await sendRide(car.carId, car.rideId);
  }
  sendAlert({
    title: "Все правильно сделал!",
    img: "/@/images/loc/auto/trip22.jpg",
    text: `Отправлено тачек: ${cars.length} 🚙.`,
  });
}

export async function checkCarTank(carId = "979786") {
  let carTankSpan = await getElementsOnThePage(
    ".fuel .neft",
    `/automobile/car/${carId}/`
  );

  try {
    const fuelLeft = +carTankSpan.innerText.split(":")[1].split("/")[0];

    if (fuelLeft === 0) {
      console.log("[Check Car Tank] Car tank is empty!");
      await fillCarTank(carId);
    }
  } catch (e) {
    console.log("[Check Car Tank] Car tank not found");
  }
}

export function sortGarage() {
  if ($("#send-cars-controls").length > 0) return;

  const sendPlanesAndBoatsBtn = createButton({
    text: "🚢 ✈️ Отправить вв",
    onClick: sendPlanesAndBoats,
    special: true,
    disableAfterClick: false,
  });

  const sendCarsPresetsBtns = PRESETS.map((preset) => {
    const btn = createButton({
      text: preset.name,
      onClick: async () => {
        if (confirm(`Отправить ${preset.name}?`)) {
          await sendCars(preset.rides);
        }
      },
      disableAfterClick: false,
      special: true,
    });

    return btn;
  });

  let $items = $("#content > div > div.cars-trip-choose.clearfix > div ul li");

  // fill tank before sending car
  $items.each(function () {
    const id = $(this).data("direction-id");
    if (id) {
      const span = $("<span>").text(id).css({
        position: "absolute",
        color: "whitesmoke",
        right: "3%",
        zIndex: 10,
        background: "black",
        borderRadius: "4px",
        padding: "2px",
      });

      $(this).prepend(span);
    }

    const $btn = $(this).find(".ride-button");
    $btn.on("click", async function (e) {
      e.preventDefault();
      const carId = $(this).closest("li").find("input.car-id").val();
      await fillCarTank(carId);
      $(this).closest("form").submit();
    });
  });

  function sortAndReattach($items) {
    let { exceptionCars, planesAndBoats, rest, bannedCars } =
      categorizeCars($items);

    const allCars = [...exceptionCars, ...rest, ...bannedCars];

    let sortedItems = [
      ...exceptionCars,
      ...planesAndBoats,
      ...sortCarsByCooldown(rest.reverse()),
      ...bannedCars,
    ];

    const cooldownBoatsCount = planesAndBoats.filter(
      (el) => getCarCooldown($(el)) > 0
    ).length;

    const cooldownCarsCount = allCars.filter((el) => {
      const [chinuk, buksir] = [64, 198];
      const rideId = +$(el).attr("data-direction-id");
      if (rideId === chinuk || rideId === buksir) {
        return false;
      }

      return getCarCooldown($(el)) > 0;
    }).length;

    const carsCountDiv = $(`
      <div id="cars-count">
        <span>• Отправлено вв: <b>${cooldownBoatsCount} /  ${planesAndBoats.length}</b> ✈️ 🚢</span>
        <span>• Отправлено тачек: <b>${cooldownCarsCount} / ${allCars.length}</b> 🚙</span>
      </div>
    `).css({
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "start",
      gap: "8px",
      fontSize: "18px",
      lineHeight: "16px",
      textTransform: "uppercase",
      fontFamily: "bloccregular",
      padding: "8px 0px",
    });

    const buttonsGrid = $("<div id='send-cars-buttons'></div>")
      .css({
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "8px",
        width: "80%",
      })
      .append(sendPlanesAndBoatsBtn)
      .append(sendCarsPresetsBtns);

    buttonsGrid.children().css({
      flex: "1 0 30%",
      maxWidth: "30%",
    });

    const carsControlDiv = $("<div id='send-cars-controls'>")
      .css({
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        justifyContent: "center",
        alignItems: "center",
      })
      .append(buttonsGrid)
      .append(carsCountDiv);

    $("#content > div > div.block-bordered").html(carsControlDiv);

    let $parent = $("#content > div > div.cars-trip-choose.clearfix > div ul");
    $(sortedItems).appendTo($parent);
  }

  function redrawCards($items) {
    $items.each((_, el) => {
      $(el).find("table.title").remove();
      $(el).find("table.ride-info").remove();
      $(el).css({ minHeight: "auto", height: "auto" });
      $(el)
        .find(".picture .timeout")
        .each((_, el) => {
          $(el).css({ height: "auto" });
          $(el).contents().not("span.ride-cooldown").remove();
        });
      if ($(el).find(".car .timeout").length) {
        $(el).css("opacity", 0.7);
      }
    });
  }

  sortAndReattach($items);
  redrawCards($items);

  // Append the sorted items back to the parent without overwriting
  let garageContainer = $(
    "#content > div > div.cars-trip-choose.clearfix > div ul"
  );

  // STYLE GARAGE
  // add shadow to car cards
  $items.css("box-shadow", "0px 1px 9px 2px rgba(24, 22, 38, 0.5)");

  garageContainer.css({
    display: "grid",
    "grid-template-columns": "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "10px",
  });

  $(".cars-trip-choose.clearfix").css({
    position: "relative",
    left: "35%",
    transform: "translateX(-50%)",
    width: "80vw",
    margin: "auto",
    "z-index": 101,
  });

  $(".cars-trip-accordion").css({
    background: "rgba(255, 255, 255, 0.2)",
    "backdrop-filter": "blur(10px)",
    "-webkit-backdrop-filter": "blur(10px)",
    "border-radius": "10px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    padding: "20px",
    width: "100%",
    "box-shadow": "0 4px 10px rgba(0, 0, 0, 0.1)",
  });
}

function getCarCooldown($el) {
  let timer = $el.find(".car .car-cooldown").attr("timer");
  return timer ? parseInt(timer, 10) : -1; // -1 if missing
}

function sortCarsByCooldown($items) {
  if (!Array.isArray($items)) $items = $items.toArray();
  return $items.sort((a, b) => getCarCooldown($(b)) - getCarCooldown($(a)));
}

function categorizeCars($items) {
  let exceptionCars = [];
  let planesAndBoats = [];
  let rest = [];
  let bannedCars = [];

  $items.each((_, el) => {
    let $el = $(el);
    let directionId = +$el.attr("data-direction-id");

    if (EXCEPTION_CARS.includes(directionId)) {
      // $el.css("background", "#b9dfc7"); // EXCEPTION_CARS
      exceptionCars.push(el);
    } else if (PLANES_AND_BOATS_RIDES_IDS.includes(directionId)) {
      $el.css("background", "#aad7f8"); // PLANES_AND_BOATS
      planesAndBoats.push(el);
    } else if (BANNED_CARS_RIDES_IDS.includes(directionId)) {
      $el.css("background", "#b9060e"); // BANNED CARS
      bannedCars.push(el);
    } else {
      // $el.css("background", "#f8d7aa"); // REST
      rest.push(el);
    }

    // Sort by predefined order
    function getSortIndex(directionId, list) {
      let index = list.indexOf(directionId);
      return index === -1 ? Infinity : index; // If not found, place it at the end
    }

    exceptionCars.sort((a, b) => {
      let idA = +$(a).attr("data-direction-id");
      let idB = +$(b).attr("data-direction-id");
      return (
        getSortIndex(idA, EXCEPTION_CARS) - getSortIndex(idB, EXCEPTION_CARS)
      );
    });

    planesAndBoats.sort((a, b) => {
      let idA = +$(a).attr("data-direction-id");
      let idB = +$(b).attr("data-direction-id");
      return (
        getSortIndex(idA, PLANES_AND_BOATS_RIDES_IDS) -
        getSortIndex(idB, PLANES_AND_BOATS_RIDES_IDS)
      );
    });

    return [...exceptionCars, ...planesAndBoats, ...rest];
  });

  return { exceptionCars, planesAndBoats, rest, bannedCars };
}
