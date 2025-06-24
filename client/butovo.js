import { goTo } from "./index.js";
import { formatTime } from "./utils.js";

export const PLANE_IDS = [0, 3, 8];

export async function buyTruck(truckId, mode = "airport") {
  // 0 and 8 are the cheapest trucks
  const res = await fetch(
    new URL(window.location.href).origin + "/butovo/crimea/",
    {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-ch-ua": '"Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
      },
      referrer: new URL(window.location.href).origin + "/butovo/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: `action=patriot-buy&truck=${truckId}&currency=0&mode=airport`,
      method: "POST",
      mode: "cors",
      credentials: "include",
    }
  );

  const data = await res.json();

  if (data.result === 1) {
    console.log("Truck bought successfully!");
    return;
  }

  if (data.error) {
    console.log("Error:", data.error);
  }
}

export async function patriotSend(
  truckId,
  mode = "airport",
  autoProlong = true
) {
  const res = await fetch(
    new URL(window.location.href).origin + "/butovo/crimea/",
    {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-ch-ua": '"Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
      },
      referrer: new URL(window.location.href).origin + "/butovo/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: `action=patriot-send&mode=${mode}&truck=${truckId}&autoprolong=checked&upgrade0=1&upgrade1=1&upgrade2=1&upgrade3=1&upgrade4=1&upgrade5=1`,
      method: "POST",
      mode: "cors",
      credentials: "include",
    }
  );

  const data = await res.json();

  if (data.result === 1) {
    console.log("Patriot sent successfully!");
    return;
  }

  if (data.error) {
    console.log("Error:", data.error);
  }
}

export async function patriotSendMode() {
  await goTo(new URL(window.location.href).origin + "/butovo/");
  let Crimea = window.Crimea;
  Crimea.show("airport");
  const planes = PLANE_IDS.map((id) => ({
    element: document.querySelector(`#crimea-plane${id}`),
    id,
  }));

  planes.forEach(({ element, id }) => {
    const setupPlaneInterval = (delay = 0) => {
      setTimeout(() => {
        patriotSend(id); // Send plane immediately after delay
        setInterval(() => patriotSend(id), 90.02 * 60 * 1000); // Default interval
      }, delay);
    };

    if (element.classList.contains("busy")) {
      const secondsLeft = +element
        .querySelector(".timer")
        .getAttribute("timer");

      console.log(
        `[✈️] Plane busy. Cooldown ends in ${formatTime(secondsLeft)}.`
      );
      setupPlaneInterval(secondsLeft * 1000); // Start interval after cooldown
    } else {
      console.log(`[Patriot] Plane ${id} is ready. Sending now.`);
      setupPlaneInterval(); // Start immediately
    }
  });

  Crimea.hide();
}
