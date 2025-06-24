async function parseHtml(htmlString) {
  const parser = new DOMParser();

  const cleanedHtmlString = htmlString
    .replace(/\\&quot;/g, '"') // Handle escaped quotes if they exist
    .replace(/\\"/g, '"'); // Normalize double-escaped quotes

  const doc = parser.parseFromString(cleanedHtmlString, "text/html");

  return doc;
}

async function getElementsOnThePage(selector, url) {
  const response = await fetch(url);
  const data = await response.text();

  const doc = await parseHtml(data);
  const elements = doc.querySelectorAll(selector);

  if (elements.length === 0) return undefined;

  return elements.length === 1 ? elements[0] : Array.from(elements);
}

async function getMyZodiacTicketsAmount() {
  try {
    // get the html tag that holds the tickets amount
    let [myTicketsTag, _] = await getElementsOnThePage(
      ".zodiak-snake-participiants",
      "/zodiac/"
    );

    // get tickets amount, convert to number, return
    return +myTicketsTag.innerText.trim().slice(-1);
  } catch (e) {
    console.log("♉️ Не нашел билетов зодиака.");
    return;
  }
}

async function buyZodiacTickets(count = 1) {
  await fetch(new URL(window.location.href).origin + "/zodiac/", {
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer: new URL(window.location.href).origin + "/zodiac/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: `action=buy_ticket&value=${count}&__referrer=%2Fzodiac%2F&return_url=%2Fzodiac%2F`,
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
}

async function zodiacMode(
  { count, intervalMin } = { count: 1, intervalMin: 60 }
) {
  const myZodiacTicketsAmount = await getMyZodiacTicketsAmount();

  if (myZodiacTicketsAmount === undefined)
    return showAlert("Ошибка", "Нету зодиака.");

  if (myZodiacTicketsAmount < 1) {
    showAlert("Зодиак ♉️", `Не нашел билетов. Покупаю ${count} шт.`);
    await buyZodiacTickets(1);
  } else {
    showAlert(
      "Зодиак ♉️",
      `Нашел ${myZodiacTicketsAmount} билет зодиака. Скип...`
    );
  }

  showAlert("Зодиак ♉️", `Пробую заново через ${intervalMin} минут(ы).`);
  setTimeout(
    async () => await zodiacMode({ count, intervalMin }),
    intervalMin * 60 * 1000
  );
}

export { zodiacMode };
