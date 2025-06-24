let $ = window.$;

export function timeToMs(timeStr) {
  const parts = timeStr.split(":").map(Number);
  let hours = 0,
    minutes = 0,
    seconds = 0;

  if (parts.length === 3) {
    hours = parts[0];
    minutes = parts[1];
    seconds = parts[2];
  } else if (parts.length === 2) {
    minutes = parts[0];
    seconds = parts[1];
  } else if (parts.length === 1) {
    seconds = parts[0];
  }

  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

export function getMoscowTime() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" })
  );
}

export function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const timeParts = [
    hrs > 0 ? String(hrs).padStart(2, "0") : null,
    String(mins).padStart(2, "0"),
    String(secs).padStart(2, "0"),
  ].filter(Boolean); // Exclude null parts

  return timeParts.join(":");
}

export function formatNumber(num) {
  num = `${num}`.split(",").join("");
  if (Math.abs(num) >= 1e9) {
    return Math.floor((num / 1e9) * 10) / 10 + "B"; // Round down to 1 decimal place
  } else if (Math.abs(num) >= 1e6) {
    return Math.floor((num / 1e6) * 10) / 10 + "M"; // Round down to 1 decimal place
  } else if (Math.abs(num) >= 1e3) {
    return Math.floor((num / 1e3) * 10) / 10 + "K"; // Round down to 1 decimal place
  }
  return num.toString();
}

export function delay(s = 1) {
  return new Promise((res) => setTimeout(res, s * 1000));
}

export async function getElementsOnThePage(selector, pathname) {
  const currentOrigin = new URL(window.location.href).origin;
  const pathName = pathname.startsWith("/") ? pathname : "/" + pathname;
  const response = await fetch(currentOrigin + pathName);
  const data = await response.text();
  const doc = parseHtml(data);
  const elements = doc.querySelectorAll(selector);

  if (elements.length === 0) return undefined;

  return elements.length === 1 ? elements[0] : Array.from(elements);
}

export function parseHtml(htmlString) {
  const parser = new DOMParser();

  const cleanedHtmlString = htmlString
    .replace(/\\&quot;/g, '"') // Handle escaped quotes if they exist
    .replace(/\\"/g, '"'); // Normalize double-escaped quotes

  const doc = parser.parseFromString(cleanedHtmlString, "text/html");

  return doc;
}

export function convertPlayerUrlToId(url) {
  const match = url.match(/\player\/(\d+)\//);
  const playerId = match ? match[1] : null;
  return playerId;
}

export function getPlayerId(doc) {
  try {
    const playerUrl = doc.querySelector(".fighter2 .user a").href;
    const playerId = convertPlayerUrlToId(playerUrl);
    return playerId;
  } catch (e) {
    console.log("🚧 Could not find player id");
  }
}

export function filterLogs(doc = window.document) {
  let farmLogs = [...doc.querySelectorAll("tr")].filter(
    (tr) => tr.querySelector("td.actions div.c")?.innerText === "В список жертв"
  );

  let whales = farmLogs
    .map((el) => {
      let tugriki = +el
        .querySelector(".text .tugriki")
        .innerText.split(",")
        .join("");
      const user = el.querySelector(".user a").href;
      if (tugriki > 300000) return user;
    })
    .filter((el) => el);

  let ids = whales.map((url) => convertPlayerUrlToId(url));
  return ids;
}

export async function getTodayScore() {
  const count = +(await getElementsOnThePage(".my .value b", `/rating/wins/`))
    .innerText;

  return count;
}

export function strToHtml(htmlString) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlString.trim();
  return tempDiv.firstChild;
}

export async function scrapeStat(i) {
  // Trigger the tooltip
  const tooltipTriggerSelector = `#stats-accordion > dd:nth-child(2) > ul > li:nth-child(${i}) > div.label > span`;
  const tooltip = $(`${tooltipTriggerSelector}`);
  tooltip.trigger("mouseenter");

  // Wait for the tooltip to appear
  await new Promise((resolve) => setTimeout(resolve, 250));

  // Determine the tooltip container based on i+1
  const tooltipContainer = `#tooltip${i + 1}`;

  // Get the characteristic name (e.g., "Здоровье")
  const keySelector = `${tooltipContainer} > h2`;
  const key = $(keySelector)[0]?.innerText;

  if (!key) {
    console.error(`Key not found for tooltip ${tooltipContainer}`);
    return null;
  }

  // Get the basic stat (Персонаж)
  const basicSelector = `${tooltipContainer} > div > span:nth-child(1)`;
  const basicText = $(basicSelector)[0]?.innerText || "";
  const basicValue = parseInt(basicText.split(":")[1].trim(), 10);

  // Get the super stat (Суперздоровье)
  const superSelector = `${tooltipContainer} > div > span:nth-child(3)`;
  const superText = $(superSelector)[0]?.innerText || "";
  const superValue = parseInt(superText.split("+")[1].trim(), 10);

  // Construct the result object
  const result = {
    [key]: {
      Персонаж: basicValue || 0,
      ["Супер" + key.toLowerCase()]: superValue || 0,
      Сумма: (basicValue || 0) + (superValue || 0),
    },
  };

  return result;
}

export async function gatherStats() {
  const stats = {
    Дата: new Date().toLocaleDateString("ru-RU").replace(/\./g, "/"),
  };

  for (let i = 1; i <= 7; i++) {
    const stat = await scrapeStat(i); // Call the scrapeStat function
    if (stat) {
      Object.assign(stats, stat); // Merge the result into the stats object
    }
  }

  return stats;
}

// const allStats = await gatherStats();

// console.log(allStats);
