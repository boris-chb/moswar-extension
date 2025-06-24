async function slotRoll(count) {
  const fishkiCount = +document.querySelectorAll("#fishki-balance-num")[0]
    .innerText;

  if (fishkiCount < 50) {
    console.log(`[${new Date().toLocaleDateString()}]\nNot enough fishki...`);
    return;
  }
  const res = await fetch(
    new URL(window.location.href).origin + "/casino/slots/",
    {
      method: "POST",
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Cookie:
          "PHPSESSID=tdqson49qtuann5lh9dlje4r30; chat_lastId=19c354c85432b100b15582daf1f16d65; _lbn_rt=rt_c5e13b48c9068c025ca6439be730b7f9; _lbn_d=1731077702; _lbn_rf=https%3A%2F%2Fwww.google.com%2F; register_fraction=resident; player=barifan; alleysearchtab=; chat_force=false; werewolf_search=0; metro_show_search_other_rat=0; player_id=7390418; authkey=0190c46015f80643922afcca0791ef9e8bdfe062; userid=7390418; travelpage=default; mfPassatiji=true; chat_state=minimized; minimized=1; minichat-battle=%7B%22x%22%3A%22-160.994px%22%2C%22y%22%3A%22318.989px%22%2C%22w%22%3A%22175.18181800000002px%22%2C%22h%22%3A%22170.18181800000002px%22%7D; type=weak; minlevel=13; maxlevel=13; search_type=level; sound_slots=1; sovetpage=career; _lbn_l=1731722021; chat_active=1731722153038",
        DNT: "1",
        Host: "www.moswar.ru",
        Origin: new URL(window.location.href).origin + "",
        Referer: new URL(window.location.href).origin + "/casino/slots/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest",
        "sec-ch-ua": '"Not?A_Brand";v="99", "Chromium";v="130"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
      },
      body: new URLSearchParams({
        action: "spin",
        count: count,
      }),
    }
  );

  const data = await res.json();

  const timestamp = new Date().toTimeString().split(" ")[0];
  const log = { timestamp, count, profit: data.win ? data.profit : 0 };

  // Retrieve existing logs from localStorage
  const logs = JSON.parse(localStorage.getItem("slotLogs")) || [];

  // Add the new log
  logs.push(log);

  // Save updated logs back to localStorage
  localStorage.setItem("slotLogs", JSON.stringify(logs));

  console.log(`[${log.timestamp}] ${log.count} -> ${log.profit}`);

  return data;
}

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function startSlotRolling() {
  setInterval(
    async () => {
      await slotRoll(10);
    },
    getRandomDelay(8000, 12000)
  );
}

export async function rollKubovich(spins = 10) {
  async function roll(action = "black", type = "black") {
    await fetch(new URL(window.location.href).origin + "/casino/kubovich/", {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
      },
      body: `action=${action}&type=${type}`,
      method: "POST",
      mode: "cors",
      credentials: "include",
    });
    AngryAjax.reload();
  }

  if (!document.querySelector("#push-ellow").classList.contains("disabled")) {
    console.log("roll yellow");
    await roll("load", "yellow");
    await roll("yellow", "black");
  } else {
    await roll();
    await roll("load");
  }
}

export async function playBlackjack() {
  let response = await fetch(
    new URL(window.location.href).origin + "/casino/blackjack/",
    {
      method: "POST",
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "x-requested-with": "XMLHttpRequest",
      },
      body: "action=new&bet=10",
      credentials: "include",
    }
  );

  let game = await response.json();
  let total = game.newRightHand.reduce((sum, card) => sum + card[2], 0);

  while (total < 17) {
    await new Promise((res) => setTimeout(res, 500)); // Small delay
    let hitResponse = await fetch(
      new URL(window.location.href).origin + "/casino/blackjack/",
      {
        method: "POST",
        headers: {
          accept: "application/json, text/javascript, */*; q=0.01",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "x-requested-with": "XMLHttpRequest",
        },
        body: "action=more",
        credentials: "include",
      }
    );

    let hit = await hitResponse.json();
    if (!hit.card) break;
    total += hit.card[0][2];

    if (total > 21) break; // Lost, restart
  }

  await new Promise((res) => setTimeout(res, 500)); // Small delay
  await fetch(new URL(window.location.href).origin + "/casino/blackjack/", {
    method: "POST",
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    },
    body: "action=stop",
    credentials: "include",
  });
}
