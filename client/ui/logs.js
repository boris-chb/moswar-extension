/* global $ $log showAlert */

import { formatNumber } from "../utils";
import { createButton, createDropdown } from "./button.js";

const primaryKeywords = [
  {
    text: "внезапно оживает при помощи таинственной чёрной кошки, возникшей из Матрицы",
    img: "/@/images/obj/beast_ability/ability40.png",
  },
  {
    text: "с помощью реанемобиля возвращается в бой",
    img: "/@/images/obj/cars/162-big.png",
  },
  {
    text: "громко читает QR-код",
    img: "/@/images/ico/ability/bigbro_3.png",
  },
  {
    text: "надевает тюрбан",
    img: "/@/images/ico/ability/bentley_abil.png",
  },
  {
    text: "Игра в Кальмара Жестока",
    img: "/@/images/loc/squid2025/abils/1.png",
  },
  {
    text: "негативные эффекты",
    img: "/@/images/ico/ability/abil_dyson.png",
  },
  {
    text: "облетев вокруг Земли",
    img: "/@/images/ico/ability/abil_kosmo2.png",
  },

  {
    text: "видит красный свет и застывает",
    img: "/@/images/loc/squid2025/abils/6.png",
  },
  {
    text: "в куклу и тот начинает застывать каждые 2 хода",
    img: "/@/images/loc/squid2025/abils/6.png",
  },
  {
    text: "ностальгирует и восстанавливает",
    img: "https://www.moswar.ru/@/images/ico/ability/car220.png",
  },
];

const secondaryKeywords = [
  {
    text: "пускает на котошаверму сердитого котика",
    img: "/@/images/obj/../ico/ability/burrito_abil.png",
  },
  {
    text: "так потянул канат",
    img: "/@/images/obj/../ico/ability/squid_4.png",
  },
  // {
  //   text: "делает кусь питомцу",
  //   img: "/@/images/obj/../ico/ability/wolfie_2.png",
  // },
  // {
  //   text: "бьет хвостом и игрок",
  //   img: "/@/images/ico/ability/dino5.png",
  // },
  {
    text: "привез на бронепоезде могучего союзника",
    img: "/@/images/ico/ability/kim_sum2.png",
  },
  {
    text: "Черная дыра приходит на помощь",
    img: "/@/images/ico/ability/black_hole.png",
  },
  {
    text: "Воронка приходит на помощь",
    img: "/@/images/ico/ability/tugboat.png",
  },
];

function sortPlayersList(parent) {
  if (!parent) parent = $(".list-users--left");
  const me = parent.find("li.me");
  if (me.length) me.prependTo(parent);

  // helpers
  const getRageWidth = (el) => {
    const match = $(el)
      .find('.player-rage .bar[tooltip="1"] .percent')
      .attr("style")
      ?.match(/width:(\d+(\.\d+)?)%/);
    return match ? parseFloat(match[1]) : 0;
  };

  const getName = (el) => $(el).find('.user a[href^="/player/"]').text().trim();

  const parseHP = (el) => {
    const raw = $(el).find(".fighter_hp").text().split("/")[1]?.trim();
    if (!raw) return 0;

    const match = raw.match(/([\d.,]+)([BkM]?)/);
    if (!match) return 0;

    let num = parseFloat(match[1].replace(",", "."));
    const unit = match[2];

    switch (unit) {
      case "B":
        return num * 1e9;
      case "M":
        return num * 1e6;
      case "k":
        return num * 1e3;
      default:
        return num;
    }
  };

  // categorize
  const players = [],
    clones = [],
    specialNpcs = [],
    secondaryNpcs = [];

  parent
    .find("li")
    .not(".me")
    .each(function () {
      const el = this;
      const hasRage = $(el).find(
        '.player-rage .bar[tooltip="1"] .percent'
      ).length;

      if (hasRage) {
        const name = getName(el);
        if (/^Клон «/.test(name)) clones.push(el);
        else if (name === "Брат Михалыча") specialNpcs.push(el);
        else players.push(el);
      } else {
        secondaryNpcs.push(el);
      }
    });

  // sort
  const sortByRage = (arr) =>
    arr.sort((a, b) => getRageWidth(b) - getRageWidth(a));
  const sortByMaxHP = (arr) => arr.sort((a, b) => parseHP(b) - parseHP(a));

  sortByRage(players);
  sortByRage(clones);
  sortByRage(specialNpcs);
  sortByMaxHP(secondaryNpcs);

  // containers
  const playerContainer = $('<div class="sorted-players-container">');
  const cloneContainer = $('<div class="sorted-clones-container">');
  const specialNpcContainer = $('<div class="sorted-special-npcs-container">');
  const secondaryNpcContainer = $(
    '<div class="sorted-secondary-npcs-container">'
  );

  players.forEach((el) => playerContainer.append(el));
  clones.forEach((el) => cloneContainer.append(el));
  specialNpcs.forEach((el) => specialNpcContainer.append(el));
  secondaryNpcs.forEach((el) => secondaryNpcContainer.append(el));

  // insert containers in order
  if (me.length) {
    secondaryNpcContainer.insertAfter(me);
    specialNpcContainer.insertAfter(me);
    cloneContainer.insertAfter(me);
    playerContainer.insertAfter(me);
  } else {
    parent.prepend(secondaryNpcContainer);
    parent.prepend(specialNpcContainer);
    parent.prepend(cloneContainer);
    parent.prepend(playerContainer);
  }
}

export function enhanceGroupFightLogs() {
  if ($("#enhanced-logs").length) return;

  const $allLogs = $log.find("div.text");
  const $container = $("<div id='enhanced-logs'>").css({
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginBottom: "8px",
  });

  const allKeywords = [
    ...secondaryKeywords.map((k) => ({ ...k, priority: 0 })),
    ...primaryKeywords.map((k) => ({ ...k, priority: 1 })),
  ];

  const $matching = $log.find("div.text p").filter((_, p) => {
    const $p = $(p);
    // remove Брат Михалыча rupor logs
    if ($p.hasClass("rupor") && $p.text().includes("Брат Михалыча")) {
      $p.remove();
      return false;
    }
    return allKeywords.some(({ text }) => $p.text().includes(text));
  });

  const entries = [];

  $matching.each((_, p) => {
    const $p = $(p);
    const entry = allKeywords.find(({ text }) => $p.text().includes(text));
    if (!entry) return;

    const $logWrapper = $("<div>").css({
      display: "flex",
      alignItems: "center",
      gap: "4px",
      border: "1px solid rgb(103, 63, 0)",
      borderRadius: "4px",
      padding: "4px",
    });

    const $img = $("<img>")
      .attr("src", entry.img)
      .css({ width: "32px", height: "32px" });

    $logWrapper.append($img, $p.clone());
    entries.push({ priority: entry.priority, $wrapper: $logWrapper });
    $p.remove();
  });

  entries
    .sort((a, b) => b.priority - a.priority)
    .forEach(({ $wrapper }) => $container.append($wrapper));

  $allLogs.prepend($container);

  $(".forcejoin").each((_, el) => {
    $(el).prependTo($allLogs);
  });
}

export function sortGroupFightPlayers() {
  // Run the function on both left and right lists
  $(".list-users--left, .list-users--right").each(function () {
    sortPlayersList($(this));
  });
}

export function LEGAGY_enhanceLogs() {
  const currentPlayerName = getCurrentPlayerName();
  const $logsContainer = $(".log > ul.fight-log .text");

  let $myLogsContainer = $("#logs-me");

  if (!$myLogsContainer.length) {
    $myLogsContainer = $("<div id='logs-me'></div>")
      .css("display", "flex")
      .css("flexDirection", "column");
  }

  // Run the function on both left and right lists
  $(".list-users--left, .list-users--right").each(function () {
    sortPlayersList($(this));
  });

  // sort logs
  const logActions = [
    { text: "Воронка", icon: "/@/images/obj/../ico/ability/tugboat.png" },
    {
      text: "пускает на котошаверму сердитого котика",
      icon: "/@/images/obj/../ico/ability/burrito_abil.png",
    },
    { text: "Дымовую завесу", icon: "/@/images/ico/ability/kuzn_abil.png" },
    { text: "Компьютерный Вирус", icon: "/@/images/loc/hacker/abil_1.png" },
    // { text: "привез на бронепоезде", action: formatTrainAttackLog },
    // { text: "Незримый защитник", action: formatDefenderLogs },
    {
      text: "Брат Михалыча",
      condition: (el) => el.hasClass("rupor"),
      action: (el) => el.remove(),
    },
    { text: "никто не пострадал", action: (el) => el.remove() },
    { text: "батарейки Теслы", icon: "/@/images/ico/ability/tesla_expl.png" },
    {
      text: "с помощью реликта снижает крутость",
      icon: "/@/images/obj/relict/rock77_128.png",
    },
    { text: "поджигает трон", icon: "/@/images/obj/relict/rock38_128.png" },
    {
      text: "Реликт делают великим",
      icon: "/@/images/obj/relict/rock47_128.png",
    },
    { text: "увозит у игрока", icon: "/@/images/obj/cars/129-big.png" },
    {
      text: "командует ОМОНу разгонять несогласных",
      icon: "/@/images/obj/confr_ability/fight_ability6.png",
    },
    { text: "превращает в куклу", icon: "/@/images/loc/squid2025/abils/6.png" },
    {
      text: "призывает Боевого мигранта, размахивая Трудовой книжкой",
      icon: "/@/images/obj/fight_item/migrant.png",
    },
    {
      text: "ест китайски печеньки и восстанавливает себе",
      icon: "/@/images/loc/squid2025/abils/5.png",
    },
    { text: "играет в Камешки", icon: "/@/images/loc/squid2025/abils/2.png" },
    { text: "дёргает за струны!", icon: "/@/images/ico/ability/balalajka.png" },
    { text: "делает кусь питомцу", icon: "/@/images/ico/ability/wolfie_2.png" },
    {
      text: "яростно призывает в бой клона",
      icon: "/@/images/ico/ability/fury_7.png",
    },
    {
      text: "Пришелец призывает на помощь мини-Пришельца!",
      icon: "/@/images/ico/ability/alien_many.png",
    },
    {
      text: "объединяет трех мини-пришельцев",
      icon: "/@/images/ico/ability/alien_uber.png",
    },
    {
      text: "привозит в бой на своем Майбабахе",
      icon: "/@/images/obj/gifts2017/mers/invite-big.png",
    },
    {
      text: "проводит удар с беспилотника!",
      icon: "/@/images/ico/ability/bpla_abil.png",
    },
    {
      text: "Космическая Пыль приходит на помощь",
      icon: "/@/images/ico/ability/cloud3.png",
    },
    { text: "стреляет как в кино", icon: "/@/images/ico/ability/gru_1.png" },
    { text: "бьет с помощью лапищи", icon: "/@/images/ico/ability/lion_1.png" },
    {
      text: "предъявить документы",
      icon: "/@/images/ico/ability/tetris_abil.png",
    },
    {
      text: "используя Джейл Брейк, снимает",
      icon: "/@/images/loc/hacker/abil_2.png",
    },
    {
      text: "Катушку Теслу",
      icon: "/@/images/obj/gifts2018/car/tesla_coil_128.png",
    },
    { text: "Хакер [??] чипирует", icon: "/@/images/ico/ability/bigbro_2.png" },
    {
      text: "Хакер мобилизуется и приходит на помощь",
      icon: "/@/images/loc/hacker/abil_6.png",
    },
    { text: "становится Боссом", icon: "/@/images/loc/squid2025/abils/3.png" },
    {
      text: "громко читает QR-код",
      icon: "/@/images/ico/ability/bigbro_3.png",
    },
    {
      text: "призывает сильнейших духов соперников",
      icon: "/@/images/ico/ability/abil_shaman_ultra.png",
    },
    { text: "Мэр", icon: "/@/images/ico/ability/major.png" },
    { text: "МосГосСтрах!", icon: "/@/images/obj/relict/rock72_128.png" },
    { text: "Пылающий след", icon: "/@/images/ico/ability/car220.png" },
    {
      text: "использует дубиночку и наносит 50% урона",
      icon: "/@/images/ico/ability/omon_weapon.png",
    },
    {
      text: "призывает Штурмовика, размахивая удостоверением",
      icon: "/@/images/obj/fight_item/migrant4_128.png",
    },
    {
      text: "высаживает в бой Десант",
      icon: "/@/images/ico/ability/heli_cage.png",
    },
    {
      text: "возвращается и сбрасывает Балласт",
      icon: "/@/images/ico/ability/afg.png",
    },
    {
      text: "пролетает на джете и увеличивает свою максимальную ярость",
      icon: "/@/images/obj/cars/361-big.png",
    },
    {
      text: "прогоняет всех вторых питомцев",
      icon: "/@/images/obj/../ico/ability/burrito_abil.png",
    },
    {
      text: "Пришелец заражает паразитом",
      icon: "/@/images/ico/ability/alien_par.png",
    },
    {
      text: "Марсианин",
      icon: "/@/images/loc/mars/abils/abil5.png",
    },
    {
      text: "ракету DIY",
      icon: "/@/images/loc/rocket/rocket.png",
    },
    {
      text: "горячую картошку",
      icon: "/@/images/loc/mars/potato@2x.png",
    },
    {
      text: "гипнотизирует",
      icon: "/@/images/ico/ability/abys_abil.png",
    },
    {
      text: "Титанос делает великим",
      icon: "/@/images/loc/tanos/talant_3.png",
    },
    {
      text: "рой пчёл",
      icon: "/@/images/obj/bear_ability/bear_ability_1.png",
    },
    {
      text: "рой пчёл",
      icon: "/@/images/obj/bear_ability/bear_ability_1.png",
    },
    {
      text: "БПЛА",
      icon: "/@/images/obj/cars/338-big.png",
    },
    {
      text: "прячется под крылом самолёта и его здоровье не падает ниже",
      icon: "/@/images/obj/cars/319-big.png",
    },
    {
      text: "кубрик-рубика",
      icon: "/@/images/obj/gifts2025/ny/rubik/8_256.png",
    },
    {
      text: "с помощью реанемобиля возвращается в бой",
      icon: "/@/images/obj/cars/162-big.png",
    },
  ];

  function looselyIncludes(html, text) {
    if (!text) console.log(html);
    return text.split(/\s+/).every((word) => html.includes(word));
  }

  const dropdownContainer = $("<div>").css({
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  });
  const dropdownMap = new Map();

  $logsContainer.children().each(function () {
    const el = $(this);
    const logText = el.text();

    for (const { text, icon, action, condition } of logActions) {
      if (looselyIncludes(logText, text) && (!condition || condition(el))) {
        if (text.includes(""))
          if (!dropdownMap.has(text)) {
            dropdownMap.set(
              text,
              createDropdown({
                toggleText: `<img src="${icon}" style="height:64px; width: 64px;" class="ability-log-icon" />`,
                items: [],
                className: "ability-log-container",
                isOpen: false,
              })
            );
          }

        if (icon) addIcon(el, icon);
        if (action) action(el);

        dropdownMap.get(text).append(el);
      }
    }

    if (
      currentPlayerName &&
      logText.includes(currentPlayerName) &&
      !logText.toLowerCase().includes("клон")
    ) {
      $myLogsContainer.append(el);
    }
  });

  // Append all dropdowns at the end
  dropdownMap.forEach((dropdown) => dropdownContainer.append(dropdown));
  $logsContainer.append(dropdownContainer);

  const $myLogsDropdown = createDropdown({
    toggleText: "Мои логи",
    className: "me-logs",
    items: [$myLogsContainer],
    isOpen: true,
  }).css({
    outline: "4px inset lightseagreen",
    borderRadius: "2px",
    padding: "6px 0px",
  });

  if (!$(".me-logs").length && $myLogsContainer.length > 0) {
    $logsContainer.prepend($myLogsDropdown);
  }
}

function addIcon($p, src) {
  $p.css({
    display: "flex",
    alignItems: "center",
    gap: "4px",
  });

  const $img = $("<img>").attr("src", src).css({
    width: "32px",
    height: "32px",
  });

  const $span = $("<span>").html($p.html());

  $p.empty().append($img).append($span);
}

function getCurrentPlayerName() {
  return $(".me .user a[href*='player']")?.text();
}

export function extractFightLogEntries() {
  const selector =
    "#fightGroupForm > table > tbody > tr > td.log > ul > li > div > p";
  const elements = document.querySelectorAll(
    `${selector} span.name-resident, ${selector} span.name-arrived`
  );

  return [
    ...new Set(Array.from(elements).map((el) => el.closest("p").outerHTML)),
  ];
}

export function replaceGroupFightLogs(logs) {
  if (!logs) {
    logs = extractFightLogEntries();
  }

  // count before
  const logsCountBefore = $(
    "#sign_ufl > tbody > tr > td.log > ul > li > div.text"
  )
    .children()
    .filter(function () {
      // Keep elements that have a 'class' attribute, even if it's empty
      return $(this).is("[class]");
    })
    .not(".line").length;

  // replace logs
  $("#sign_ufl > tbody > tr > td.log > ul > li > div.text").html(
    [...logs].join("")
  );

  // count after
  const logsCountAfter = $(
    "#sign_ufl > tbody > tr > td.log > ul > li > div.text"
  ).children().length;

  // alert
  var alert = showAlert(
    "✅ Очитска логов от НПС",
    `Кол-во логов до очистки: <strong>${logsCountBefore}</strong> <br>Кол-во логов после очистки: <strong>${logsCountAfter}</strong><br>Логов убрано: <strong>${logsCountBefore - logsCountAfter}</strong>`
  );

  var fightGroup = $(".fight-group");
  if (fightGroup.length) {
    var position = fightGroup.offset();
    var top = position.top;
    var left = position.left + fightGroup.outerWidth();
    var positionOffset = 100;

    // Place the alert at the top-right corner
    alert.css({
      top: top + "px",
      left: positionOffset + left + "px",
    });
  }
}
