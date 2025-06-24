/* global $ AngryAjax showAlert player */

import { restoreHP } from "./dopings";

const ABILITIES = [
  {
    name: "Разогнать недовольных [3]",
    id: "59",
    title: "OMON",
    description:
      "Все недовольства властью легко пресечь, призвав в бой на своей стороне <b>6</b> бойцов ОМОНа.   ",
  },
  {
    name: "Черная дыра",
    id: "269",
    title: "blackHole",
    description:
      "Создает на вашей стороне в бою Дыру, которая переманивает на вашу сторону NPC соперника!   ",
  },
  {
    name: "Тушить пожар",
    id: "282",
    title: "extinguishFire",
    description:
      "Снимает отравление с владельца и 3х случайных союзников, образует облако на 3 хода, которое поглощает удары!   ",
  },
  {
    name: "Катушка Тесла",
    id: "295",
    description:
      "Катушка Тесла — это новая способность для групповых боёв, которая совмещает в себе разрушительную мощь и защитные качества!   ",
  },
  {
    name: "Десант",
    id: "303",
    description:
      "Призывает в бой десант, который уничтожит врага мощными способностями   ",
  },
  {
    name: "Ледяное дыхание",
    id: "325",
    description: "Ледяное дыхание дракона!   ",
  },
  {
    name: "Сход лавины",
    id: "152",
    description: "Противник теряет часть жизней и оглушен на 1 ход   ",
  },
  {
    name: "Скинуть два спутника",
    id: "302",
    description:
      "Наносит урон по 4-м выбранным противникам на 30% от текущих жизней!   ",
  },
  {
    name: "Медовая заначка",
    id: "54",
    description:
      "Используя медовую заначку, вы не только восстановите ваши жизни до 30% от вашего максимума к концу хода, но и оживете, если вас вдруг убьют в процессе.   ",
  },
  {
    name: "Удар с воздуха",
    id: "353",
    description:
      "Мощные взрывы наносят огромный урон противнику, не оставляя шансов на победу!   ",
  },
  {
    name: "В облака III",
    id: "451",
    description:
      "Заставляет команду противника улететь на небо. На жопной тяге..   ",
  },
  {
    name: "Зеркальный клон   ",
    id: "514",
    description: "",
  },
  {
    name: "Космоспас 2.0",
    id: "519",
    description:
      "С помощью своей ракеты вы можете совершить виток вокруг Земли и вернуться в бой полностью обновлённым с максимальной яростью!   ",
  },
  {
    name: "Электро-удар SUPER III",
    id: "521",
    description:
      "Наносит урон по цепочке до 3-х противников на 65%, 40%, 15% с шансом 100%, 100%, 75%, 50% до трех раз за бой!   ",
  },
  {
    name: "Воронка",
    id: "482",
    description:
      "Создает на вашей стороне в бою Воронку, которая переманивает на вашу сторону NPC соперника!   ",
  },
  {
    name: "Дубиночка",
    id: "477",
    description: "Наносит урон за каждого ОМОНОВца/Агента/Иноагентика   ",
  },
  {
    name: "Разогнать толпу",
    id: "389",
    description:
      "Прогоняет из боя 3 вражеских мигранта или штурмовика и наносит за каждого 5/7/10% урона призвавшему игроку!   ",
  },
  {
    name: "Пылающий след III   ",
    id: "523",
    description: "",
  },
  {
    name: "Гейм-овер",
    id: "524",
    description:
      "Открывается на М15. Игра в Кальмара жестока, а жизнь не стоит ничего. Убивает случайного противника (не NPC).   ",
  },
  {
    name: "Камешки",
    id: "525",
    description:
      "Детская игра, у кого больше — тот и сильнее! Используй камешки вместо кулаков. Каждый камешек наносит 15% урона противнику и сжигает 15% ярости. Действует прицельно.   ",
  },
  {
    name: "Маска Босса",
    id: "526",
    description:
      "Открывается на М10. Стань Боссом игры в Кальмара. Меняет облик, добавляет усиленную крутость, наносит урон анонимным игрокам, становится боссом на 5 ходов (на тебя не работают большинство сильных способностей).   ",
  },
  {
    name: "Канаты",
    id: "527",
    description:
      "Сила команды в единстве. Если у тебя есть канат, примени его в конце хода! Срабатывает только у стороны с большим количеством канатов. Уменьшает характеристики противников: до -40% по 6 игрокам в зависимости от количества канатов.   ",
  },
  {
    name: "Печенька",
    id: "528",
    description:
      "Вырежи фигурку, не сломав печеньку. Если есть китайская печенька, поедание лечит 50% жизней и наносит -30% урона случайному противнику (не NPC).   ",
  },
  {
    name: "Кукла",
    id: "529",
    description:
      "Красный свет — стой, Зеленый свет — иди! Останавливает ходы выбранного противника каждые 2 хода на 8 ходов.   ",
  },
  {
    name: "Призвать Мэра",
    id: "370",
    description: "Позовите Мэра в бой, чтобы он поверг всех врагов в шок!   ",
  },
  {
    name: "Электро-выхлоп",
    id: "490",
    description:
      "Будут наносить урон нескольким вашим противникам несколько ходов неблокируемый урон.   ",
  },
  {
    name: "Стать Великим   ",
    id: "435",
    description: "",
  },
  {
    name: "Кальян «Арбузный» Ультра",
    id: "33",
    description:
      "Ароматный кальян покрывает защитной арбузной коркой и <b>снижает урон от ударов</b> по вам на 40% на ближайшие 5 ходов.   ",
  },
  {
    name: "Кальян «Ледяной» Ультра",
    id: "32",
    description:
      "Замечательный кальян, в котором в качестве жидкости используется вода из растаявших снеговиков, приобрел уникальные свойства — в бою он окружит вас настоящими ледяными шипами, опасными для врага! 40% полученного урона возвращается врагу в течение 5 ходов.   ",
  },
  {
    name: "Кальян «Гранатовый» Ультра",
    id: "34",
    description:
      "Задорный вкус гранатового кальяна увеличит урон от бросаемых вами гранат <b>на 35% в течение 3 ходов</b>.   ",
  },
  {
    name: "Медвежий Рынок",
    id: "444",
    description:
      "Тратит все тугрики на урон, равный их количеству, по случайному противнику   ",
  },
  {
    name: "Реликт питомца   ",
    id: "462",
    description: "",
  },
  {
    name: "Стихия: Вода",
    id: "480",
    description:
      "<b>Обычная</b>: Смывает негативные эффекты с 3 случайных союзников (игроков) (отравление, кровотечение.. ) каждые 2 хода до конца боя. <br/><b>Усиленная</b>: Смывает негативные эффекты с 4 случайных союзников (игроков) (отравление, кровотечение ) каждые ход  до конца боя   ",
  },
  {
    name: "Стихия: Огонь",
    id: "479",
    description:
      "<b>Обычная</b>: наносит жгучий урон 3 случайным противникам урон -15% от текущего хп каждый ход до конца боя. <br/><b>Усиленная</b>: наносит жгучий урон 5 случайным противникам урон -15% от текущего хп до конца боя   ",
  },
  {
    name: "Стихия: Воздух",
    id: "478",
    description:
      "Начните делать селфи в бою, чтобы получить защиту от ударов кулаками и гранат.   ",
  },
  {
    name: "Стихия: Земля",
    id: "481",
    description:
      "<b>Обычная</b>: Снижает текущую и максимальную ярость в бою на 15% каждый ход, пока шкала не дойдет до 0 (случайно по 3м игрокам)<br/><b>Усиленная</b>: Снижает текущую и максимальную ярость в бою на 25% каждый ход, пока шкала ярости не дойдет до 0 (случайно по 3м игрокам)   ",
  },
  {
    name: "Панцирь",
    id: "-312",
    description: "Даёт хозяину полную неуязвимость на срок до 3-х ходов!   ",
  },
  {
    name: "Кровотечение II",
    id: "-314",
    description: "Враг теряет здоровье в начале каждого хода, от 5 до 30%!   ",
  },
  null,
];

export async function joinProt() {
  await restoreHP();
  AngryAjax.goToUrl("/alley/");
  $(document).one("ajaxStop", async () => {
    function getMetroFightKey() {
      const onclickValue = $('.alley-sovet h3:contains("Противостояние")')
        .parent()
        .find("span.f")
        .attr("onclick");

      if (!onclickValue) return null;

      const match = onclickValue.match(/'([^']+)'(?:\s*\))/);
      return match ? match[1] : null;
    }

    const key = getMetroFightKey();
    await fetch(
      new URL(window.location.href).origin + "/sovet/join_metro_fight/",
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
        },
        body: `action=join_metro_fight&metro=2&type=metro&joinkey=${key}&__referrer=%2Falley%2F&return_url=%2Falley%2F`,
        method: "POST",
        mode: "cors",
      }
    );

    AngryAjax.goToUrl("/sovet/map/");
    Groups.showCreateGroup("sovet");
  });
}

export async function boostClan() {
  await fetch(new URL(window.location.href).origin + "/clan/profile/banzai/", {
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer: new URL(window.location.href).origin + "/clan/profile/banzai/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: `player=${player.id}&boost%5Bratingaccur%5D=10000&boost%5Bratingdamage%5D=10000&boost%5Bratingcrit%5D=10000&boost%5Bratingdodge%5D=10000&boost%5Bratingresist%5D=10000&boost%5Bratinganticrit%5D=10000&hours=8&__ajax=1&return_url=%2Fclan%2Fprofile%2Fbanzai%2F`,
    method: "POST",
    mode: "cors",
    credentials: "include",
  });

  AngryAjax.goToUrl("/clan/profile/banzai/");
}

export async function protMode() {
  showAlert(
    "👔 Режим противостояния включен!",
    "Записываюсь в прот каждые 30 минут, 5 минут до боя."
  );
}

export async function attackRandom(fightId) {
  await fetch(new URL(window.location.href).origin + "/fight/", {
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
    referrer: `${new URL(window.location.href).origin}/fight/${fightId}/`,
    referrerPolicy: "strict-origin-when-cross-origin",
    body: `action=attack&json=1&__referrer=%2Ffight%2F${fightId}%2F&return_url=%2Ffight%2F${fightId}%2F`,
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
}

async function useItem(fightId, itemId, targetId = "146130036") {
  await fetch(new URL(window.location.href).origin + "/fight/", {
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
    referrer: `${new URL(window.location.href).origin}/fight/${fightId}/`,
    referrerPolicy: "strict-origin-when-cross-origin",
    body: `action=useitem&json=1&target=${targetId}&__referrer=%2Ffight%2F${fightId}%2F&return_url=%2Ffight%2F${fightId}%2F`,
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
}

class GroupFight {
  constructor() {
    this.activeAbilities = ABILITIES;
    this.activeAbilitiesIds = [];
    this.abilitiesMap = {}; // This will map title to ability for easy access
    this.init();
  }

  // Initialize the active abilities
  init() {
    this.getActiveAbilities();
    this.mapAbilities();

    window.groupFightAjaxCheck = () => {
      noAjaxLoader = true;
      $.post("/fight/", { checkBattleState: 1 }, (data) => {
        noAjaxLoader = false;
        if (data == 1) {
          AngryAjax.goToUrl(AngryAjax.getCurrentUrl());
          setTimeout(() => this.onEndOfTurn(), 1000); // Arrow function binds `this` automatically
        } else {
          $("#waitdots").html(
            Array((($("#waitdots").text().length + 1) % 4) + 1).join(".")
          );
          window.AngryAjax.setTimeout(groupFightAjaxCheck, 1000);
        }
      });
    };
  }

  getActiveAbilities() {
    this.activeAbilitiesIds = $(".fight-slots-ability td")
      .filter((_, el) => $(el).find('input[type="radio"]').length)
      .map((_, el) => {
        const $abl = $(el).find("img");
        const id = $abl.attr("data-id");
        return id;
      })
      .toArray();
  }

  getInventory() {}

  mapAbilities() {
    this.abilitiesMap = this.activeAbilitiesIds.reduce((map, id) => {
      // Find the ability object by id
      const ability = ABILITIES.find((abl) => abl.id === id);

      if (ability) {
        map[ability.title] = ability;
      }

      return map;
    }, {});
  }

  useAbility(abilityTitle) {
    const ability = this.abilitiesMap[abilityTitle];
    if (ability) {
      console.log(`Using ability: ${ability.name}`);
      // Implement ability logic here (e.g., triggering ability effects)
    } else {
      console.log("Ability not found or not active");
    }
  }

  isFightOver() {
    return $("#fight-actions > div.waiting").length > 0;
  }

  onEndOfTurn() {
    console.log("End of turn");
    if (this.isFightOver()) {
      console.log("Fight is over. Cleaning up");
      this.cleanUp();
    }
  }

  // Restore the default fight check function
  cleanUp() {
    window.groupFightAjaxCheck = function () {
      noAjaxLoader = true;
      $.post("/fight/", { checkBattleState: 1 }, function (data) {
        noAjaxLoader = false;
        if (data == 1) {
          AngryAjax.goToUrl(AngryAjax.getCurrentUrl());
        } else {
          $("#waitdots").html(
            Array((($("#waitdots").text().length + 1) % 4) + 1).join(".")
          );
          window.AngryAjax.setTimeout(groupFightAjaxCheck, 1000);
        }
      });
    };
  }
}
