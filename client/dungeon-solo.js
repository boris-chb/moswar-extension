import { handlePvpFight } from "./pvp";

/* global showAlert AngryAjax $ */
var _dung = {}; //подвал одиночный
_dung.newstart = true;
_dung.appzone = 1;
_dung.nextzone = 0;
_dung.ss = {
  1: {
    zona: 3,
    goboss: 2,
    goper: [2, 0, 2],
    flapt: 0,
    flboss: "",
    fluseapt: 20,
  },
  2: {
    zona: 3,
    goboss: 13,
    goper: [3, 0, 13],
    flapt: 0,
    flboss: "",
    fluseapt: 20,
  },
  3: {
    zona: 2,
    goboss: 4,
    goper: [4, 0, 2],
    flapt: 0,
    flboss: "",
    fluseapt: 20,
  },
  4: {
    zona: 2,
    goboss: 5,
    goper: [5, 0, 3],
    flapt: 0,
    flboss: "",
    fluseapt: 20,
  },
  5: {
    zona: 2,
    goboss: 6,
    goper: [6, 0, 4],
    flapt: 0,
    flboss: "",
    fluseapt: 20,
  },
  6: {
    zona: 2,
    goboss: 7,
    goper: [7, 0, 5],
    flapt: 0,
    flboss: "",
    fluseapt: 30,
  },
  7: {
    zona: 2,
    goboss: 8,
    goper: [8, 0, 6],
    flapt: 0,
    flboss: "",
    fluseapt: 99,
  },
  8: {
    zona: 2,
    goboss: 9,
    goper: [11, 0, 7],
    flapt: 0,
    flboss: "",
    fluseapt: 99,
  },
  9: {
    zona: 2,
    goboss: 10,
    goper: [8, 0, 8],
    flapt: 0,
    flboss: "",
    fluseapt: 99,
  },
  10: {
    zona: 2,
    goboss: 0,
    goper: [9, 0, 9],
    flapt: 0,
    flboss: "boss",
    fluseapt: 99,
  },
  11: {
    zona: 1,
    goboss: 12,
    goper: [0, 0, 8],
    flapt: 0,
    flboss: "",
    fluseapt: 30,
  },
  12: {
    zona: 1,
    goboss: 0,
    goper: [0, 0, 11],
    flapt: 0,
    flboss: "box",
    fluseapt: 0,
  },
  13: {
    zona: 3,
    goboss: 14,
    goper: [2, 0, 14],
    flapt: 0,
    flboss: "",
    fluseapt: 20,
  },
  14: {
    zona: 3,
    goboss: 15,
    goper: [13, 0, 16],
    flapt: 0,
    flboss: "",
    fluseapt: 20,
  },
  15: {
    zona: 3,
    goboss: 17,
    goper: [14, 0, 14],
    flapt: 0,
    flboss: "",
    fluseapt: 20,
  },
  16: {
    zona: 4,
    goboss: 23,
    goper: [14, 0, 23],
    flapt: 0,
    flboss: "",
    fluseapt: 20,
  },
  17: {
    zona: 3,
    goboss: 21,
    goper: [15, 0, 15],
    flapt: 0,
    flboss: "",
    fluseapt: 20,
  },
  18: {
    zona: 4,
    goboss: 0,
    goper: [23, 0, 23],
    flapt: 0,
    flboss: "box",
    fluseapt: 70,
  },
  19: {
    zona: 5,
    goboss: 20,
    goper: [23, 0, 0],
    flapt: 0,
    flboss: "",
    fluseapt: 20,
  },
  20: {
    zona: 5,
    goboss: 0,
    goper: [19, 0, 0],
    flapt: 0,
    flboss: "",
    fluseapt: 20,
  },
  21: {
    zona: 3,
    goboss: 22,
    goper: [17, 0, 17],
    flapt: 0,
    flboss: "",
    fluseapt: 0,
  },
  22: {
    zona: 3,
    goboss: 0,
    goper: [21, 0, 21],
    flapt: 0,
    flboss: "boss",
    fluseapt: 99,
  },
  23: {
    zona: 4,
    goboss: 18,
    goper: [16, 0, 19],
    flapt: 0,
    flboss: "",
    fluseapt: 70,
  },
};
_dung.zona = {
  1: { boss: 12 },
  2: { boss: 10 },
  3: { boss: 22 },
  4: { boss: 18 },
  5: { boss: 20 },
};
_dung.obj = {
  12: true,
  10: true,
  22: true,
  18: true,
};
_dung.apt = {};
_dung.empty = function () {
  //признак, что все агенты пройдены
  for (var m in _dung.dungObj.rooms) {
    if (!_dung.dungObj.rooms[m].passed && _dung.ss[m].zona != 5) {
      return false;
    }
  }
  return true;
};
_dung.theend = function () {
  //надписи, что все пройдено, выход
  AngryAjax.reload();
  showAlert("Все пройдено", "Можете выйти из подземки.");
};
_dung.xod = function () {
  var nextxod, m;
  $.get(
    "/dungeon/inside/",
    function (data) {
      response = data.content;
      if (data && data.return_url && data.return_url == "/dungeon/") {
        showAlert("Не спустились", "Спуститесь в одиночную подземку сперва.");
        setTimeout(_dung.xod, 5000);
        return;
      }
      if (data && data.return_url && data.return_url.search("/fight/") != -1) {
        $(document).one("ajaxStop", handlePvpFight);
        console.log("Групповой бой ");
        setTimeout(_dung.xod, 5000);
        return;
      }
      _dung.dungObj = $.parseJSON(
        data.content.match(/var json = ({[\s\S]*});/m)[1]
      );
      console.log(_dung.dungObj);
      var klet = Number(_dung.dungObj.room_players[player.id].position);
      if (_dung.newstart) {
        console.log("инициализация...");
        _dung.newstart = false;
        for (m in _dung.obj) {
          if (_dung.ss[m].flboss == "boss") {
            if (
              _dung.dungObj.objects[m] &&
              _dung.dungObj.objects[m].length != 0
            ) {
              _dung.obj[m] = true;
            } else {
              _dung.obj[m] = false;
            }
          }
        }
      }
      console.log("клетка " + klet);
      var zona = _dung.ss[klet].zona;
      var boss = _dung.zona[zona].boss;
      var apt = _dung.ss[klet].flapt;

      if (_dung.ss[klet].flboss && _dung.obj[klet]) {
        console.log("юзаем объект в " + klet);
        postUrl(
          "/dungeon/useobject/",
          { action: "useobject", room: klet, object: 0 },
          "post",
          function (data) {
            if (data.result) {
              _dung.obj[klet] = false;
            }
            _dung.xod();
          },
          "json"
        );
        return;
      }
      if (_dung.empty()) {
        _dung.theend();
        return;
      }
      if (apt > 0 && _dung.apt[apt]) {
        nextxod = apt;
        console.log("идем за аптечкой на " + nextxod);
      } else {
        if (
          !_dung.dungObj.rooms[boss].passed ||
          (_dung.ss[boss].flboss == "boss" &&
            _dung.dungObj.objects[boss] &&
            _dung.dungObj.objects[boss].length != 0)
        ) {
          if (
            _dung.ss[boss].flboss == "boss" &&
            _dung.dungObj.objects[boss] &&
            _dung.dungObj.objects[boss].length != 0
          ) {
            _dung.obj[klet] = true;
          }
          nextxod = _dung.ss[klet].goboss;
          console.log("идем в направлении босса на " + nextxod);
        } else {
          _dung.nextzone = zona + _dung.appzone;
          if (_dung.nextzone > 5) {
            _dung.appzone = -1;
            _dung.nextzone = zona + _dung.appzone;
          }
          if (_dung.nextzone < 1) {
            _dung.appzone = 1;
            _dung.nextzone = zona + _dung.appzone;
          }
          nextxod = _dung.ss[klet].goper[_dung.appzone + 1];
          console.log(
            "идем к переходу в зону " + _dung.nextzone + " на " + nextxod
          );
        }
      }
      $.post(
        "/dungeon/gotoroom/",
        { referrer: "/dungeon/inside/", action: "gotoroom", room: nextxod },
        function (data) {
          AngryAjax.reload();
          _dung.xod();
        },
        "json"
      );
    },
    "json"
  );
};

function startDungeon() {
  _dung.xod();
}

export default startDungeon;
