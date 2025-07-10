/* global Dungeon, AngryAjax */

// import { sendAlert } from ".";
// import { ABILITIES, useAbility } from "./pvp";

let testPath = [
  41, 1, 4, 2, 3, 5, 11, 12, 11, 6, 46, 7, 46, 6, 11, 5, 3, 2, 13, 14, 15, 16,
  25, 17, 18, 19, 20, 21, 20, 22, 23, 24, 8, 24, 23, 22, 20, 19, 18, 17, 25, 26,
  27, 28, 42, 43, 29, 43, 31, 32, 33, 34, 9, 34, 33, 32, 31, 43, 30, 35, 36, 44,
  45, 44, 37, 38, 39, 40, 10,
].map((roomId) => `room-${roomId}`);

let objectActions = {
  // матрешка
  "room-7": [
    async () => {
      await useObject(7, 3);
      AngryAjax.reload();
      await utils_.delay(0.1);
      while (isGroupFight()) {
        console.log("room 7 boss fight");
        await utils_.delay(5);
      }
      await useObject(7, 4);
      await useObject(7, 0);
      await useObject(7, 1);
    },
  ],
  // запрещенный человек
  "room-8": [
    async () => {
      await useObject(8, 3);
      AngryAjax.reload();
      await utils_.delay(0.1);
      while (isGroupFight()) {
        console.log("room 8 boss fight");
        await utils_.delay(5);
      }
      await useObject(8, 4);
      AngryAjax.reload();
      await utils_.delay(0.1);
    },
  ],
  // бургер мэн
  "room-9": [
    async () => {
      await useObject(9, 4);
      AngryAjax.reload();
      await utils_.delay(0.1);
      while (isGroupFight()) {
        console.log("room 9 boss fight");
        await utils_.delay(5);
      }
      await useObject(9, 3);
      await useObject(9, 3);
      await useObject(9, 0);
    },
  ],
  // человек америка
  "room-10": [
    async () => {
      await useObject(10, 2);
      AngryAjax.reload();
      await utils_.delay(0.1);
      while (isGroupFight()) {
        console.log("room 9 boss fight");
        await utils_.delay(5);
      }
      await useObject(10, 1);
      await useObject(10, 1);
      AngryAjax.reload();
      await utils_.delay(0.1);
    },
  ],
  "room-12": [
    async () => {
      await useObject(12, 0);
      await utils_.delay(0.5);
      AngryAjax.reload();
    },
  ],
  "room-19": [
    async () => {
      await dungeonHeal();
    },
  ],
  "room-21": [
    async () => {
      await useObject(21, 0);
      await utils_.delay(0.1);
      AngryAjax.reload();
    },
  ],
  "room-29": [
    async () => {
      await useObject(29, 0);
      await utils_.delay(0.1);
      AngryAjax.reload();
    },
  ],
  "room-35": [
    async () => {
      await useObject(35, 0);
      await utils_.delay(0.5);
      AngryAjax.reload();
    },
  ],
  "room-36": [
    async () => {
      await dungeonHeal();
    },
  ],
  "room-38": [
    async () => {
      await dungeonHeal();
    },
  ],
  "room-39": [
    async () => {
      await dungeonHeal();
    },
  ],
  "room-45": [
    async () => {
      await useObject(45, 0);
      await utils_.delay(0.5);
      AngryAjax.reload();
    },
  ],
};

async function explore(path) {
  const current = DungeonViewer.roomCurrent;
  const startIndex = path.indexOf(current);
  if (startIndex === -1) {
    console.error("Current room not on provided path");
    return;
  }

  for (let i = startIndex + 1; i < path.length; i++) {
    const roomStrId = path[i];
    const room = DungeonViewer.rooms[roomStrId];

    if (!room) {
      console.warn(`Missing data for ${roomStrId}`);
      continue;
    }

    while (isGroupFight()) {
      console.log("Групповой бой. РЫЧУ!\nПопробую заново через 5 секунд.");
      // await useAbility(ABILITIES.roar);
      await utils_.delay(5);
    }

    try {
      console.log(`Going to ${roomStrId}`);
      await goToRoom(roomStrId);
      await utils_.delay(0.1);
      if (objectActions[roomStrId]) {
        for (const action of objectActions[roomStrId]) {
          await action();
        }
      }
    } catch (err) {
      console.error(`Failed to go to ${roomStrId}:`, err);
      return;
    }
  }

  // sendAlert({
  //   title: "Все пройдено!",
  //   text: "Все пройдено, можете выйти из подземки!",
  // });
}

async function goToRoom(roomId) {
  if (typeof roomId === "string") {
    roomId = Number(roomId.replace("room-", ""));
  }

  console.log(`Going to room ${roomId}...`);
  await fetch(new URL(window.location.href).origin + "/dungeon/gotoroom/", {
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    },
    body: `action=gotoroom&room=${roomId}&__referrer=%2Fdungeon%2Finside%2F&return_url=%2Fdungeon%2Finside%2F`,
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
  await new Promise((res) => {
    AngryAjax.reload();
    const check = () => {
      if (DungeonViewer.roomCurrent === `room-${roomId}`) {
        res();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

function isGroupFight() {
  const url = location.pathname;
  if (url.match(/^(?!.*\/alley\/).*\/fight\//)) {
    return true;
  } else {
    return false;
  }
}

async function dungeonHeal() {
  await fetch(new URL(window.location.href).origin + "/dungeon/heal/", {
    headers: {
      accept: "*/*",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer: new URL(window.location.href).origin + "/dungeon/inside/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: "action=heal&price_type=free",
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
}

async function useObject(roomId, objectId) {
  await fetch(new URL(window.location.href).origin + "/dungeon/useobject/", {
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    },
    body: `action=useobject&room=${roomId}&object=${objectId}&__referrer=%2Fdungeon%2Finside%2F&return_url=%2Fdungeon%2Finside%2F`,
    method: "POST",
    mode: "cors",
    credentials: "include",
  });

  AngryAjax.reload();
}
