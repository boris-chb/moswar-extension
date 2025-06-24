import fs from "fs";

// Example rogue dates
let rog1 = {
  id: 253003772,
  type: "big",
  date: "25.01.2025T12:57",
};

let rog2 = {
  id: 253000180,
  type: "big",
  date: "25.01.2025T09:27",
};

// Function to format date to something JavaScript can parse
function formatDate(dateStr) {
  const [day, month, yearTime] = dateStr.split(".");
  const [year, time] = yearTime.split("T");
  return `${year}-${month}-${day}T${time}`;
}

// Convert rogue dates to Date objects
const dateRog1 = new Date(formatDate(rog1.date));
const dateRog2 = new Date(formatDate(rog2.date));

// Log the dates
console.log(`rog1 date: ${dateRog1}`);
console.log(`rog2 date: ${dateRog2}`);

// Load the JSON file containing all gifts
const allGifts = JSON.parse(
  fs.readFileSync("giftsData_25.01 - 15:47.json", "utf8")
);

const giftsInRange = allGifts
  .filter((gift) => {
    const giftDate = new Date(formatDate(gift.date));
    if (giftDate >= dateRog2 && giftDate <= dateRog1) {
      // console.log(`Gift date: ${giftDate}, Type: ${gift.type}`); // Log date and type
      return true;
    }
    return false;
  })
  .sort((a, b) => new Date(formatDate(a.date)) - new Date(formatDate(b.date))); // Sort by date

giftsInRange.forEach((gift) => {
  console.log(`Type: ${gift.type}, Date: ${gift.date}`);
});

const count = { big: 0, mid: 0, small: 0 };

giftsInRange.forEach((gift) => {
  count[gift.type]++;
});

console.log(`Big gifts: ${count.big}`);
console.log(`Mid gifts: ${count.mid}`);
console.log(`Small gifts: ${count.small}`);
