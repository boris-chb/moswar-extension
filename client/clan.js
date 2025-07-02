/* global $ */

import { addToContacts, clearEnemies } from "./phone";
import { sendAlert } from "./ui";
import { formatNumber, getElementsOnThePage } from "./utils";

async function renderCoolnessByPlayer() {
  const players = $("#players .user").toArray();

  for (const player of players) {
    const $player = $(player);
    const playerId = $player
      .find('a[href*="/player/"]')
      .attr("href")
      ?.split("/")[2];
    if (!playerId) continue;

    const coolness = await getElementsOnThePage(
      "#pers-player-info .cool-1",
      `/player/${playerId}/`
    );

    if (!coolness || !coolness[0]) continue;

    const originalCoolness = $(coolness[0]).clone();
    const numberSpan = originalCoolness.find("span.cool-1");
    const number = parseInt(numberSpan.text().replace(/\D/g, ""), 10);

    if (isNaN(number)) continue; // Skip if parsing failed

    const formatted = formatNumber(number);
    numberSpan.attr("title", number);
    numberSpan.text(formatted);
    $player.append(originalCoolness);
  }
}

export async function sortClanPlayersByCoolness() {
  await renderCoolnessByPlayer();
  const users = [];

  $("#players .user").each(function () {
    const coolnessValue = parseInt(
      $(this).find("span.cool-1").last().attr("title"),
      10
    );

    if (!isNaN(coolnessValue)) {
      // Ensure coolness is valid
      users.push({ element: $(this), coolness: coolnessValue });
    }
  });

  users.sort((a, b) => b.coolness - a.coolness);

  const $players = $("#players").empty();
  users.forEach((user) => $players.append(user.element, "<br>"));
}

export async function addClanToEnemies() {
  await clearEnemies();
  const playerNames = $('#players .user a[href^="/player/"]')
    .map((_, el) => $(el).text().trim())
    .get();

  for (const name of playerNames) {
    await addToContacts(name, "enemy");
  }
  sendAlert({
    title: "Всё правильно сделал!",
    img: "/@/images/pers/man102_thumb.png",
    text: `Добавил всех игроков в контакты (враги).`,
  });
}

export async function payEmerald(count) {
  if (!count) {
    console.log("💎 No count provided for emerald payment.");
    return;
  }

  await fetch("https://www.moswar.ru/clanbeast/", {
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "sec-ch-ua": '"Chromium";v="137", "Not/A)Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer: "https://www.moswar.ru/clanbeast/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: `action=pay_emerald&amount=${count}&ajax=1&__referrer=%2Fclanbeast%2F&return_url=%2Fclanbeast%2F`,
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
}
