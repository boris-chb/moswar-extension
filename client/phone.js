import { getElementsOnThePage } from "./utils";

export async function addToContacts(playerName, contactType = "victim") {
  await fetch(new URL(window.location.href).origin + "/phone/contacts/add/", {
    headers: {
      accept: "*/*",
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
    referrer: new URL(window.location.href).origin + "/phone/contacts/add/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: `name=+${playerName}&clan=&info=&type=${contactType}&__ajax=1&return_url=%2Fphone%2Fcontacts%2Fadd%2F7178077%2F`,
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
}

export async function removeFromContacts(playerName, playerId) {
  console.log(`🔥 Removing ${playerName} from contacts.`);
  await fetch(new URL(window.location.href).origin + "/phone/contacts/", {
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
    referrer: new URL(window.location.href).origin + "/phone/contacts/victims/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: `action=delete&id=${playerId}&nickname=+${playerName}&type=contact&__referrer=%2Fphone%2Fcontacts%2Fvictims%2F&return_url=%2Fphone%2Fcontacts%2Fvictims%2F`,
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
}

export async function sendMessage(recipientName, message) {
  try {
    let postkey = (
      await getElementsOnThePage(
        'input[name="post_key"]',
        new URL(window.location.href).origin + "/phone/"
      )
    ).value;

    await fetch(
      new URL(window.location.href).origin + "/phone/messages/send/",
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
        referrer:
          new URL(window.location.href).origin + "/phone/messages/send/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: `maxTextSize=10000&post_key=${postkey}&name=${recipientName}&text=${message}&__ajax=1&return_url=%2Fphone%2F`,
        method: "POST",
        mode: "cors",
        credentials: "include",
      }
    );
    showAlert("Phone ✅", `Message sent to ${recipientName}`);
  } catch (e) {
    showAlert(`Phone ❌`, "Could not send message");
    console.log("Could not send message");
  }
}

export async function clearEnemies() {
  await fetch("https://www.moswar.ru/phone/clear-contacts/enemies/", {
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
    referrer: "https://www.moswar.ru/phone/clear-contacts/enemies/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: "__ajax=1&return_url=%2Fphone%2Fcontacts%2Fenemies%2F",
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
}
