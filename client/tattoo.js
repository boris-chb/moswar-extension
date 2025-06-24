/* global $ AngryAjax */

import { createButton } from "./ui";
import { createPopover } from "./ui";

function getTattooDetails(imgSrc) {
  const parts = imgSrc.split("/");
  const type = parts.at(-2); // 'symbol'
  const category = parts.at(-1).split(".")[0]; // '4_1'

  return [type, category];
}

function getActiveTattoo() {
  try {
    const thumb = $(".object-thumbs .object-thumb")
      .has(".action.disabled")
      .find("img")
      .attr("src");

    return thumb;
  } catch (error) {
    console.log("Could not find active tattoo.\n", error);
  }
}

export async function handleModifyManyTattoos(count = 10) {
  const activeTattoo = getActiveTattoo();

  for (let i = 0; i < count; i++) {
    if (activeTattoo) {
      await modifyTattoo(activeTattoo);
    }
  }

  $(document).one("ajaxStop", () => gatherAlerts());
  AngryAjax.goToUrl(AngryAjax.getCurrentUrl());
}

export async function modifyTattoo(imgSrc) {
  const [type, category] = getTattooDetails(imgSrc);
  await fetch(new URL(window.location.href).origin + "/tattoo/", {
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer: new URL(window.location.href).origin + "/tattoo/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: `action=tattoo_mf&honey=0&style=${type}&id=${category}&ajax=1&__referrer=%2Ftattoo%2F&return_url=%2Ftattoo%2F`,
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
}

export const modifyManyButton = createButton({
  text: "☯️ x10",
  onClick: async () => {
    await handleModifyManyTattoos(10);
    modifyManyButton.classList.remove("disabled");
  },
  title: "10 модификаций выбранных татуирок",
});

function gatherAlerts() {
  let alertsContainer = $("#tattoo-alerts");

  // create the container if doesn't exist
  if (!alertsContainer.length) {
    alertsContainer = createPopover("tattoo-alerts");
  }

  // Append, style, and filter success alerts in one go
  $(".alert").each((_, alert) => {
    if (!alertsContainer.has(alert).length) {
      $(alert).css("position", "static").css("display", "inline-block");

      if ($(alert).find("#alert-text").text().includes("успешно улучшили")) {
        $(alert).find("#alert-title").css("background", "green");
        $(alert).find(".close-cross").remove();
        alertsContainer.append(alert);
      }
    }
  });
}
