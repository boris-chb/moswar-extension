/* global Dungeon, AngryAjax */

async function delay(s = 1) {
  return new Promise((res) => setTimeout(res, s * 1000));
}

const groupPath = {
  toFirstBoss: [
    4,
    2,
    3,
    5,
    11,
    12, // heal
    11,
    6,
    46,
    7, // useObject(7,3) - attack boss,
  ],
  toSecondBossFromFirst: [
    46, 6, 11, 5, 3, 2, 13, 14, 15, 16, 25, 17, 18, 19, 20, 22, 23, 24, 8,
    // second boss id 3146785548 for group fight attack
  ],
  toThirdBossFromSecond: [
    8, 24, 23, 22, 20, 19, 18, 17, 25, 26, 27, 28, 42, 43, 29, 43, 31, 32, 33,
    34, 9,
  ],
  toLastBossFromThird: [
    34, 33, 32, 31, 43, 30, 35, 36, 44, 45, 44, 37, 38, 39, 40, 10,
  ],
};

const checkpoints = [35];

const healRooms = [12, 21, 29, 45];
const lootRooms = [7];

async function processRoomsSequentially(roomIds) {
  for (const id of roomIds) {
    await goToRoom(id);
    if (healRooms.includes(id) || checkpoints.includes(id)) {
      await useObject(id, 0);
    }
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

// heal rooms: 21, 29, 45,

// checkpoints
// Dungeon.useObject(17, 0);
// Dungeon.useObject(35, 0);

// boss 1 loot

// boss 2 loot
// Dungeon.useObject(8, 1); // buff
// Dungeon.useObject(8, 0); // buff
// Dungeon.useObject(8, 4); // chest

// boss 3 loot
// Dungeon.useObject(9, ?); // buff
// Dungeon.useObject(9, 3); // chest

// boss 4 loot
// Dungeon.useObject(10, 1); // chest

async function goToRoom(roomId) {
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
  AngryAjax.reload();
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

function goToFirstBoss() {
  groupPath.toFirstBoss.forEach((roomId) => {
    try {
      goToRoom(roomId);
    } catch (e) {
      setTimeout(() => goToRoom(roomId), 10000);
    }
  });
}
