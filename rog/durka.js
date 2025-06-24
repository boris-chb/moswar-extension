import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import { readFile } from "fs/promises";
import pLimit from "p-limit";

// 3 wave
let regularGifts = {
  1: { маленький: 15242, средний: 15243, большой: 15244 },
  2: { маленький: 15245, средний: 12246, большой: 12247 },
  3: { маленький: 15248, средний: 15249, большой: 15250 },
};

let honeyGifts = {
  1: { маленький: 15230, средний: 15231, большой: 15232 },
  2: { маленький: 15234, средний: 15235, большой: 15236 },
  3: { маленький: 15238, средний: 15239, большой: 15240 },
};

const fromDate = "28.01.2025T19:43";
// const untilDate = "29.01.2025T14:46";
const playersData = await readFile("playersToCheck.json", "utf-8");
const playersToCheck = JSON.parse(playersData);

function parseCustomDate(dateStr) {
  const [datePart, timePart] = dateStr.split("T");
  const [day, month, year] = datePart.split(".").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes); // Month is 0-indexed
}

async function getPlayerGifts(
  playerId,
  fromDateStr,
  honeyGiftsIds = honeyGifts,
  regularGiftsIds = regularGifts,
  untilDateStr
) {
  try {
    let fromDate, untilDate;

    // Only parse fromDateStr if provided
    if (fromDateStr) {
      fromDate = parseCustomDate(fromDateStr);
    }

    // Only parse untilDateStr if provided
    if (untilDateStr) {
      untilDate = parseCustomDate(untilDateStr);
    }

    const response = await axios.get(
      `${new URL(window.location.href).origin}/player/${playerId}`
    );

    const $ = cheerio.load(response.data);

    // Combine #gifts2 and #gifts2-hider by selecting both, then filter for img only
    const giftsContainers = $("#gifts2, #gifts2-hider");

    const results = [];
    giftsContainers.find("img[data-st]").each((_, img) => {
      // Skip if the element is not an img tag
      if (img.tagName !== "img") return;

      const $img = $(img);
      const dataSt = parseInt($img.attr("data-st"), 10);
      let wave = null;
      let type = null;
      let label = null;

      // Check if the gift is in honeyGiftsIds
      for (const [waveKey, giftTypes] of Object.entries(honeyGiftsIds)) {
        for (const [giftType, giftId] of Object.entries(giftTypes)) {
          if (giftId === dataSt) {
            wave = parseInt(waveKey, 10);
            type = giftType;
            label = "🍯";
            break;
          }
        }
        if (label) break;
      }

      // Check if the gift is in regularGiftsIds if not found in honeyGiftsIds
      if (!label) {
        for (const [waveKey, giftTypes] of Object.entries(regularGiftsIds)) {
          for (const [giftType, giftId] of Object.entries(giftTypes)) {
            if (giftId === dataSt) {
              wave = parseInt(waveKey, 10);
              type = giftType;
              label = "❄️";
              break;
            }
          }
          if (label) break;
        }
      }

      if (wave && type && label) {
        const dataId = parseInt($img.attr("data-id"), 10);
        const title = $img.attr("title") || "";
        const match = title.match(/Подарен:\s*([\d.]+)\s*([\d:]+)/);
        const isOpened = $img.attr("data-unlocked");

        if (match) {
          const formattedDateStr = `${match[1]}T${match[2]}`;
          const formattedDate = parseCustomDate(formattedDateStr);

          // Apply date range check only if dates are provided
          const dateInRange =
            (!fromDate || formattedDate > fromDate) &&
            (!untilDate || formattedDate <= untilDate);

          if (dateInRange) {
            results.push({
              id: dataId,
              wave,
              type: `${type} ${label}`,
              date: formattedDateStr,
              open: Boolean(+isOpened),
              playerId: `${new URL(window.location.href).origin}/player/${playerId}/`,
            });
          }
        }
      }
    });

    console.log(playerId, results.length);
    return results;
  } catch (error) {
    console.error(`Failed to fetch gifts for player ${playerId}:`, error);
    return [];
  }
}

async function getAllPlayersGifts(playersArray, fromDateStr, untilDateStr) {
  const allGifts = [];
  const limit = pLimit(25); // Limit to 5 concurrent executions (adjust as needed)

  // Wrap fetching with the limit
  const promises = playersArray.map((playerId) =>
    limit(() =>
      getPlayerGifts(playerId, fromDateStr, undefined, undefined, untilDateStr)
    )
  );

  // Wait for all promises to resolve
  const giftsArray = await Promise.all(promises);

  // Flatten the gifts array
  giftsArray.forEach((gifts) => {
    if (gifts.length > 0) {
      allGifts.push(...gifts);
    }
  });

  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate().toString().padStart(2, "0")}.${(currentDate.getMonth() + 1).toString().padStart(2, "0")} - ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;

  fs.writeFileSync(
    `gift-data/${formattedDate}.json`,
    JSON.stringify(allGifts, null, 2)
  );

  return allGifts;
}

await getAllPlayersGifts(playersToCheck, fromDate);
// let futura = await getPlayerGifts(
//   7241223,
//   undefined,
//   undefined,
//   undefined,
//   untilDate
// );
// console.log(futura.length);
