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
