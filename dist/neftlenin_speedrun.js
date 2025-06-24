// ==UserScript==
// @name         НЕФТЬ все варианты мос
// @namespace    https://moswar.ru/
// @version      10.10.21
// @description  try to take over the world!
// @author       whoknows
// @match        https://*.moswar.ru/*
// @grant        none
// @noframes
// ==/UserScript==
String.prototype._sub = function (be, en, inc, tr) {
  var i, j, ss;
  if (inc === undefined) inc = false;
  if (tr === undefined) tr = false;
  if (be === undefined) {
    i = 0;
  } else {
    i = this.indexOf(be);
    if (i == -1) {
      i = this.length;
    } else {
      i += inc ? 0 : be.length;
    }
  }
  if (en === undefined) {
    j = -1;
  } else {
    j = this.indexOf(en, i);
  }
  if (j == -1) {
    ss = this.substring(i);
  } else {
    ss = this.substring(i, j);
  }
  if (tr) {
    var st = "";
    if (j !== -1) st = this.substring(j + en.length);
    return [ss, st];
  } else {
    return ss;
  }
};
var tr = {
  t: 0,
  hour: 0,
  min: 0,
  sec: 0,
  day: 0, // время последнего запроса ситуации
  toString: function () {
    return (
      ("0" + tr.hour).slice(-2) +
      ":" +
      ("0" + tr.min).slice(-2) +
      ":" +
      ("0" + tr.sec).slice(-2)
    );
  },
  upd: function (ti) {
    tr.t = ti;
    ti = (ti + 10800) % (86400 * 7);
    tr.sec = ti % 60;
    tr.min = ((ti - tr.sec) / 60) % 60;
    tr.hour = ((ti - tr.sec - tr.min * 60) / 3600) % 24;
    tr.day =
      ((((ti - tr.sec - tr.min * 60 - tr.hour * 3600) / 86400) % 7) + 4) % 7;
  },
  sub: function (t1) {
    //разница между текущим временем и t1 в формте HH:MM[:SS] в секундах с учетом перехода суток
    var tt = { hour: 0, min: 0, sec: 0 };
    var ss = t1.split(":");
    tt.hour = ss[0] ? Number(ss[0]) : 0;
    tt.min = ss[1] ? Number(ss[1]) : 0;
    tt.sec = ss[2] ? Number(ss[2]) : 0;
    var t =
      (tt.hour - tr.hour) * 3600 + (tt.min - tr.min) * 60 + (tt.sec - tr.sec);
    if (t < 0) {
      t = t + 86400;
    }
    return t + 60;
  },
};
var neft = {};
neft.actions = 0;
neft.forcetemn = false;
neft.usetonus = false;
neft.temn = true;
neft.run = true;
neft.delay = 1;
neft.shot = false;
neft.hard = function () {
  $.post(
    "/neftlenin/",
    { action: "selectType", type: "hard" },
    function (data) {
      if (data.result) {
        neft.cons("Переходим на темное");
        neft.temn = true;
      }
    },
    "json"
  );
};
neft.usual = function () {
  $.post(
    "/neftlenin/",
    { action: "selectType", type: "usual" },
    function (data) {
      if (data.result) {
        neft.cons("Переходим на обычный");
        neft.temn = false;
      }
    },
    "json"
  );
};
neft.cons = function (t) {
  if (tr.t > 0) {
    console.log(tr + "   neft:  " + t);
  } else {
    console.log("          neft:  " + t);
  }
};
neft.get = function () {
  var st, ss, spr, i;
  var prize, tt, pp, pps, step;
  if (--neft.delay > 0) return;
  neft.delay = 10;
  neft.ogr = false;

  $.get(
    "/neftlenin/",
    function (data) {
      if (data && data.return_url && data.return_url.search("/fight/") != -1) {
        $.get(
          "/phone/contacts/",
          function (data) {
            tr.upd(data.servertime);
            neft.cons("групповой бой");
            neft.delay = 5;
          },
          "json"
        );
        return;
      }
      if (data && data.return_url && data.return_url.search("dungeon") != -1) {
        $.get(
          "/phone/contacts/",
          function (data) {
            tr.upd(data.servertime);
            neft.cons("подвал");
            neft.delay = 15;
          },
          "json"
        );
        return;
      }
      if (
        data &&
        data.leftblock &&
        data.leftblock.search("Ожидание боя") != -1
      ) {
        neft.ogr = true;
      }
      tr.upd(data.servertime);
      neft.temn = data.content.indexOf("Темный нефтепровод им. Ленина") != -1;
      $.post(
        "/player/checkhp/",
        { action: "restorehp" },
        function (data) {
          if (data.result) {
            neft.cons("лечимся");
          }
        },
        "json"
      );
      $.post(
        "/neftlenin/",
        { ajax: 1, action: "getTimer" },
        function (data) {
          if (
            data &&
            data.return_url &&
            (data.return_url.search("/fight/") != -1 ||
              data.return_url.search("dungeon") != -1)
          ) {
            neft.delay = 1;
            return;
          }
          if (data.step == "31") {
            neft.cons(
              "Нефтепровод пройден ждем " +
                Math.round(data.timerRestart / 60) +
                " минут"
            );
            neft.delay = data.timerRestart;
            return;
          }
          if (
            data.typeStep == "m" &&
            data.mission_step == 0 &&
            data.suspicion > 150 - data.price_gamble[0]
          ) {
            neft.cons(
              "Подозрительность " +
                data.suspicion +
                ", ждем " +
                (data.suspicion + data.price_gamble[0] - 150) +
                " минут"
            );
            neft.delay = 60 * (data.suspicion + data.price_gamble[0] - 150);
            return;
          }
          if (
            (data.typeStep == "d" ||
              data.typeStep == "g" ||
              data.typeStep == "b") &&
            data.suspicion > 120
          ) {
            neft.cons(
              "Подозрительность " +
                data.suspicion +
                ", ждем " +
                (data.suspicion - 120) +
                " минут"
            );
            neft.delay = 60 * (data.suspicion - 120);
            return;
          }
          if (data.typeStep == "m" && !neft.temn && neft.forcetemn) {
            neft.hard();
            neft.delay = 1;
            return;
          }
          if (data.typeStep == "m" && data.timer) {
            neft.cons("Ждем кубиков " + data.timer + " секунд");
            neft.delay = data.timer;
            return;
          }
          if (data.typeStep == "m" && data.mission_step == 5) {
            neft.cons("Выиграли кубики, продолжаем");
            $.post("/neftlenin/", { ajax: 1, action: "nextStep" });
            neft.delay = 1;
            return;
          }
          if (data.typeStep == "m" && data.mission_step == 0) {
            neft.cons("Убегаем");
            $.post("/neftlenin/", { ajax: 1, action: "nextStep" });
            neft.delay = 1;
            return;
          }
          if (data.typeStep == "m" && data.game) {
            neft.cons("Кидаем кубики");
            $.post("/neftlenin/", { ajax: 1, action: "play" });
            neft.delay = 1;
            return;
          }
          if (data.typeStep == "m") {
            neft.cons("Запускаем кубики");
            $.post("/neftlenin/", { ajax: 1, action: "preMission" });
            neft.delay = 1;
            return;
          }
          if (neft.ogr) {
            neft.cons("Ожидание группового боя");
            neft.delay = 5;
            return;
          }
          if (
            (data.typeStep == "d" ||
              data.typeStep == "g" ||
              data.typeStep == "b") &&
            data.battle == 1 &&
            neft.shot
          ) {
            if (neft.temn && neft.forcetemn) {
              neft.usual();
              neft.delay = 2;
              return;
            }
            $.post(
              "/neftlenin/",
              { ajax: 1, action: "startAction" },
              function (data1) {
                if (
                  (data1 &&
                    data1.alertbox &&
                    data1.alertbox.indexOf("Вы слишком часто деретесь") !=
                      -1) ||
                  (data1.error &&
                    data1.error.indexOf("Вы слишком часто деретесь") != -1)
                ) {
                  if (neft.usetonus) {
                    neft.cons("Таймаут дуэли... убираем тонусом");
                    $.post(
                      "/alley/",
                      { action: "rest_cooldown", code: "tonus", ajax: true },
                      function (data) {
                        if (data.result == "Не хватает тонуса") {
                          neft.cons(
                            "Не хватает тонуса. Восстанавливаем банкой"
                          );
                          $.get(
                            "/job/tonus-buy-alert/",
                            function (data) {
                              if (data && data["restore_tonus"]) {
                                $.get(
                                  "/player/json/use/" +
                                    data["restore_tonus"] +
                                    "/"
                                );
                              } else {
                                neft.cons("Нет банки, ждем минуту");
                                neft.delay = 60;
                              }
                            },
                            "json"
                          );
                        }
                      },
                      "json"
                    );
                    neft.delay = 2;
                    return;
                  } else {
                    neft.cons("Таймаут дуэли... ждем минуту");
                    neft.delay = 60;
                    return;
                  }
                } else {
                  neft.cons("Шаг " + data.step + " атакуем");
                  neft.actions = 0;
                  neft.delay = 1;
                  return;
                }
              },
              "json"
            );
            return;
          }
          if (!neft.temn && neft.forcetemn) {
            neft.hard();
            neft.delay = 2;
            return;
          }
          if (
            (data.typeStep == "d" ||
              data.typeStep == "g" ||
              data.typeStep == "b") &&
            (!data.battle || !neft.shot)
          ) {
            neft.cons("Шаг " + data.step + " готовимся к атаке");
            $.post(
              "/neftlenin/",
              { ajax: 1, action: "getPrize" },
              function (data1) {
                if (
                  data1 &&
                  data1.error &&
                  data1.error.indexOf("Вы слишком часто деретесь") != -1
                ) {
                  if (neft.usetonus) {
                    neft.cons("Таймаут дуэли... убираем тонусом");
                    $.post(
                      "/alley/",
                      { action: "rest_cooldown", code: "tonus", ajax: true },
                      function (data) {
                        if (data.result == "Не хватает тонуса") {
                          neft.cons(
                            "Не хватает тонуса. Восстанавливаем банкой"
                          );
                          $.get(
                            "/job/tonus-buy-alert/",
                            function (data) {
                              if (data && data["restore_tonus"]) {
                                $.get(
                                  "/player/json/use/" +
                                    data["restore_tonus"] +
                                    "/"
                                );
                              } else {
                                neft.cons("Нет банки, ждем минуту");
                                neft.delay = 60;
                              }
                            },
                            "json"
                          );
                        }
                      },
                      "json"
                    );
                    neft.delay = 2;
                    return;
                  } else {
                    neft.cons("Таймаут дуэли... ждем минуту");
                    neft.delay = 60;
                    return;
                  }
                }
                //      debugger;
                //data.error=="Вы слишком заняты, чтобы драться."
                if (!data1.data) {
                  neft.delay = 1;
                  return;
                } //возможно групповой бой
                st = data1.data;
                prize = {};
                spr = "";
                if (data1.eventNeftlenin) {
                  //есть акционные
                  neft.actions = data1.eventNeftlenin.max;
                  spr = "Максимум - " + neft.actions + " / ";
                }

                while (st) {
                  ss = st._sub(
                    '<span class="object-thumb">',
                    "</span>",
                    false,
                    true
                  );
                  st = ss[1];
                  if (ss[0]) {
                    prize[ss[0]._sub('title="', '"')] = Number(
                      ss[0]._sub('"count">#', "</div>")
                    );
                    spr +=
                      ss[0]._sub('title="', '"') +
                      " - " +
                      ss[0]._sub('"count">#', "</div>") +
                      ", ";
                  }
                }
                if (!spr) {
                  spr = "Дают: ничего, ";
                }
                spr = "Дают: " + spr;
                neft.shot = false;
                pp = 0;
                for (i in prize) {
                  if (neft.prize[i]) {
                    //              pp+=neft.prize[i];
                    if (neft.actions > 0) {
                      //учитывать только акционные
                      if (neft.act[i]) {
                        if (
                          neft.actions - prize[i] <= razn ||
                          neft.actions / prize[i] >= koeff
                        ) {
                          pp = 1;
                          neft.shot = true;
                          break;
                        }
                      }
                    } else {
                      pp +=
                        neft.prize[i] *
                        (neft.forcepos &&
                        (data.typeStep == "g" ||
                          data.typeStep == "b" ||
                          data.step == 1)
                          ? 0
                          : 1);
                      if (i == "Посадочный билет") {
                        if (data.typeStep == "g" || data.typeStep == "b") {
                          pps = neft.grouppos[data.step];
                        }
                        if (data.typeStep == "d") {
                          pps = neft.duelpos;
                        }
                        if (prize[i] >= pps) pp = 1;
                      }
                      if (i == "Историческая пуля") {
                        if (data.typeStep == "g" || data.typeStep == "b") {
                          pps = neft.groupprize[data.step];
                        }
                        if (data.typeStep == "d") {
                          pps = neft.duelprize;
                        }
                        if (prize[i] >= pps) pp = 1;
                      }
                    }
                    if (pp >= 1) {
                      neft.shot = true;
                      break;
                    }
                  }
                }
                tt = Math.round(data.timerRestart / 60) + 150 - data.suspicion;
                if (tt <= neft.time[data.step]) {
                  spr += " таймаут шага";
                  neft.shot = true;
                }
                if (neft.shot) {
                  neft.cons(spr + " лупим");
                } else {
                  neft.cons(spr + " сбегаем");
                  $.post("/neftlenin/", { ajax: 1, action: "escape" });
                }
              },
              "json"
            );
            neft.delay = 2;
            return;
          }
          console.log(" neft: Что-то не предусмотрели");
          neft.delay = 1;
          //debugger;
        },
        "json"
      );
    },
    "json"
  );
};
neft.act = {
  //список акционных плюшек
  //         'Искра':1,
  //         'Снежинка':1,
  //         'Историческая пуля':1,
  //        'Сердечко':1,
};
neft.prize = {
  "Гигантская шкатулка партии": 1,
  "Очень большая шкатулка партии": 1,
  "Большая шкатулка партии": 0.7,
  "Средняя шкатулка партии": 0.5,
  "Малая шкатулка партии": 0,
  "Ключ партии": 0.5,
  "Автомобильный сундук": 1,
  //   'Масонский заговор':1,
  //     'Искра':1,
  //  'Историческая пуля':1,
  //    'Снежинка':1,
  //    'Мельдоний':1,
  //    'Сердечко':1,
  //    'Ненастоящая заначка':1,
  "Куфия шейха": 1,
  "Мерседес С-класса": 1,
  "Лампа джина": 1,
  "Личный лифт": 1,
  "Арабская принцесса": 1,
  "Личная охрана": 1,
  "Золотое тронное кресло": 1,
  "Груда вещей": 1,
};
neft.time = {
  //время до начала крайнего боя

  1: 1590, // долго с переборами
  2: 1560,
  4: 1479,
  5: 1434,
  7: 1353,
  8: 1278,
  10: 1191,
  11: 1146,
  13: 1059,
  14: 1014,
  16: 921,
  17: 846,
  19: 738,
  20: 678,
  22: 562,
  23: 502,
  25: 386,
  26: 311,
  28: 191,
  29: 116,
  30: 46,

  /*1 :1590,  // БЫСТРО
    2 :1590,
    4 :1589,
    5 :1589,
    7 :1580,
    8 :1580,
    10:1575,
    11:1575,
    13:1560,
    14:1560,
    16:1555,
    17:1555,
    19:1550,
    20:1550,
    22:1545,
    23:1545,
    25:1540,
    26:1540,
    28:1535,
    29:1530,
 //  30:1530
    30:30*/
};
neft.forcetemn = true; // ПЕРЕКЛЮЧАТЕЛЬ юзать темное/обычное автоматом(//-не переключать)
//neft.usetonus=true;  // снимать тайаут тонусом
//neft.forcepos=false;  //искать посадочные в группах и 1 дуэли
//neft.duelpos=1;  //посадочные в 1 дуэли
//neft.grouppos={8:1, 17:1, 26:1, 29:1, 30:1};  //посадочные на группах
//neft.duelprize=6;  //мельдоний в дуэлях
//neft.groupprize={8:10, 17:13, 26:15, 29:18, 30:21};  //мельдоний на группах
var koeff = 0.8;
var razn = 2;

console.log("Inject oil...");
// debugger
setInterval(neft.get, 1000);
