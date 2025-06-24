import fs from "fs";
import path from "path";

const lastRog = "gift-data/29.01 - 16:02.json";
// const lastRog = "gift-data/29.01 - 17:43.json";
let currentSnapshop = "gift-data/29.01 - 20:51.json";
// the rog before
const oldGifts = JSON.parse(fs.readFileSync(lastRog, "utf-8"));
// new time
const newGifts = JSON.parse(fs.readFileSync(currentSnapshop, "utf-8"));
// Create maps for efficient lookup
const oldMap = new Map(oldGifts.map((gift) => [gift.id, gift]));
const newMap = new Map(newGifts.map((gift) => [gift.id, gift]));

// Track changes
const openedGifts = [];
const newGiftsOpened = [];
const newGiftsNotOpened = [];

// Check changes
newMap.forEach((newGift, id) => {
  const oldGift = oldMap.get(id);
  if (oldGift && oldGift.open === false && newGift.open === true) {
    openedGifts.push(newGift);
  } else if (!oldGift) {
    if (newGift.open) {
      newGiftsOpened.push(newGift);
    } else {
      newGiftsNotOpened.push(newGift);
    }
  }
});

// Group by type
const groupByType = (gifts) =>
  gifts.reduce((acc, gift) => {
    if (!acc[gift.wave]) acc[gift.wave] = {};
    acc[gift.wave][gift.type] = (acc[gift.wave][gift.type] || 0) + 1;
    return acc;
  }, {});

// Prepare results
const openedSummary = groupByType(openedGifts);
const newGiftsOpenedSummary = groupByType(newGiftsOpened);
const newGiftsNotOpenedSummary = groupByType(newGiftsNotOpened);

// new gifts, opened
const oldOpenSummary = Object.values(openedSummary).reduce(
  (sum, types) => sum + Object.values(types).reduce((a, b) => a + b, 0),
  0
);

console.log(
  "Старых (купленные до рога) подарков открытыо:",
  Object.entries(openedSummary)
    .map(([wave, types]) => {
      const total = Object.values(types).reduce((a, b) => a + b, 0);
      return `${total} (${wave} волны)`;
    })
    .join(" "),
  `| Общий итог: ${oldOpenSummary}`
);
console.log(openedSummary);

// new gifts, opened
const newGiftsOpenedTotal = Object.values(newGiftsOpenedSummary).reduce(
  (sum, types) => sum + Object.values(types).reduce((a, b) => a + b, 0),
  0
);

console.log(
  "Новых подарков открытыо:",
  Object.entries(newGiftsOpenedSummary)
    .map(([wave, types]) => {
      const total = Object.values(types).reduce((a, b) => a + b, 0);
      return `${total} (${wave} волны)`;
    })
    .join(" "),
  `| Общий итог: ${newGiftsOpenedTotal}`
);
console.log(newGiftsOpenedSummary);

// not opened
const notOpenedTotal = Object.values(newGiftsNotOpenedSummary).reduce(
  (sum, types) => sum + Object.values(types).reduce((a, b) => a + b, 0),
  0
);

console.log(
  "Новых подарков, НЕ открыто:",
  Object.entries(newGiftsNotOpenedSummary)
    .map(([wave, types]) => {
      const total = Object.values(types).reduce((a, b) => a + b, 0);
      return `${total} (${wave} волны)`;
    })
    .join(" "),
  `| Общий итог: ${notOpenedTotal}`
);
console.log(newGiftsNotOpenedSummary);

// save to csv

function convertToCSV(summary, title) {
  const header = ["Wave", "Type", "Count"];
  const rows = [];

  // Collect data and sort by count in descending order within each wave
  Object.entries(summary).forEach(([wave, types]) => {
    const sortedTypes = Object.entries(types).sort(
      ([, countA], [, countB]) => countB - countA
    ); // Sort by Count descending

    sortedTypes.forEach(([type, count]) => {
      rows.push([wave, type, count]);
    });
  });

  const csv = [
    title, // Add title to separate each section
    header.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csv;
}

// Prepare data for CSV export
const openedCSV = convertToCSV(
  openedSummary,
  "Старых (купленные до рога) подарков открыто"
);
const newGiftsOpenedCSV = convertToCSV(
  newGiftsOpenedSummary,
  "Новых подарков открыто"
);
const newGiftsNotOpenedCSV = convertToCSV(
  newGiftsNotOpenedSummary,
  "Новых подарков, НЕ открыто"
);

// Combine all sections into one CSV
const combinedCSV = [openedCSV, newGiftsOpenedCSV, newGiftsNotOpenedCSV].join(
  "\n\n"
);

// Save to a single CSV file
fs.writeFileSync("gifts_summary_sorted_by_count.csv", combinedCSV);

console.log("Data saved as gifts_summary_sorted_by_count.csv!");
//
//
//

// Load and parse the JSON file

const firstRogRange = "gift-data/29.01 - 11:32.json";
const rawData = fs.readFileSync(firstRogRange, "utf-8");
const giftsData = JSON.parse(rawData);

// Get top players who bought the most gifts
function getTopPlayersWithGiftBreakdown(data, topN = 10) {
  const translations = {
    "big regular": "большой обычный",
    "small regular": "маленький обычный",
    "medium regular": "средний обычный",
    "large regular": "большой обычный",
    "big honey": "большой 🍯",
    "small honey": "маленький 🍯",
    "medium honey": "средний 🍯",
    "large honey": "большой 🍯",
  };

  const playerGiftStats = data.reduce((acc, gift) => {
    const { playerId, type } = gift;
    const translatedType = translations[type] || type;

    if (!acc[playerId]) {
      acc[playerId] = { total: 0, giftTypes: {} };
    }

    acc[playerId].total += 1;
    acc[playerId].giftTypes[translatedType] =
      (acc[playerId].giftTypes[translatedType] || 0) + 1;

    return acc;
  }, {});

  return Object.entries(playerGiftStats)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, topN)
    .map(([playerId, { total, giftTypes }]) => ({
      playerId,
      total,
      giftTypes,
    }));
}

// Get the count of each type of gift
function getGiftsCountByType(data) {
  const filteredData = data.filter((gift) => gift.open); // Filter out gifts that are not opened

  const countByType = data.reduce((acc, gift) => {
    acc[gift.type] = (acc[gift.type] || 0) + 1;
    return acc;
  }, {});

  const totalCount = Object.values(countByType).reduce(
    (total, count) => total + count,
    0
  );

  console.log(`Total gifts: ${totalCount}`);
  console.log(countByType);
  return countByType;
}

// Function to compare two gift files and count opened gifts

function compareGiftFiles(file1, file2) {
  // Load and parse the JSON files
  const data1 = JSON.parse(fs.readFileSync(file1, "utf-8"));
  const data2 = JSON.parse(fs.readFileSync(file2, "utf-8"));

  const oldGifts = new Map();
  data1.forEach((gift) => {
    oldGifts.set(gift.id, gift);
  });

  let newOpenedGiftsCount = 0;
  const openedGiftTypes = new Map();

  data2.forEach((gift) => {
    const giftType = gift.type;

    // Check if the gift is new or has changed state to opened
    const oldGift = oldGifts.get(gift.id);

    if (oldGift) {
      // Check if the gift state has changed from "opened": false to "opened": true
      if (!oldGift.open && gift.open) {
        newOpenedGiftsCount++;
        openedGiftTypes.set(giftType, (openedGiftTypes.get(giftType) || 0) + 1);
      }
    } else if (gift.open) {
      // New gift that is already opened
      newOpenedGiftsCount++;
      openedGiftTypes.set(giftType, (openedGiftTypes.get(giftType) || 0) + 1);
    }
  });

  // Build the output message
  const openedGiftDetails = Array.from(openedGiftTypes)
    .map(([type, count]) => `${type}: ${count}`)
    .join(", ");

  return {
    newOpenedGiftsCount,
    openedGiftDetails,
  };
}

// const comparisonResult = compareGiftFiles(lastRogSnapshot, lastSnapshot);
// console.log(
//   `Number of opened gifts between the two files: ${comparisonResult.newOpenedGiftsCount}`
// );
// console.log(`Details of opened gifts: ${comparisonResult.openedGiftDetails}`);

// let topPlayers = getTopPlayersWithGiftBreakdown(giftsData, 20);
// console.log(topPlayers);
// getGiftsCountByType(giftsData);
