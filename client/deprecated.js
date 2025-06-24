export async function joinChaoticFight() {
  await fetch(new URL(window.location.href).origin + "/fight/", {
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
    referrer: new URL(window.location.href).origin + "/fight/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: "action=join+fight&fight=0&price=zub&type=chaotic&__ajax=1&return_url=%2Falley%2F",
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
}

export async function smurfProtect() {
  let timeLeftTillFightStart = document.querySelector(
    "#personal > a.bubble > span > span.string > span.timeleft"
  )?.textContent;

  if (timeLeftTillFightStart) {
    console.log("Time left till fight start:", timeLeftTillFightStart);
    return;
  }

  await joinChaoticFight();
}
