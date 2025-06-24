var m = moswar;

var updateWalletIntToK = function () {
  $(
    ".tugriki-block span, .ruda-block span, .med-block span, .neft-block span"
  ).each(function () {
    $(this).text(intToKM($(this).text().replace(/,/g, ""), $(this).text()));
  });
};

var noAjaxLoader = false;
var __fp = false;

function prepareDynamicGui() {
  m.pops = 0;
  m.e = {};
  m.actionObj = $("div.action");
  m.url.player = "/player/";
  m.url.shop = "/shop/json/";
  m.statsObj = $("ul.stats");
  m.slotsObj = $(".slots");
  m.slotArr = [];
  m.slotArr["hat"] = 1;
  m.slotArr["talisman"] = 2;
  m.slotArr["cloth"] = 3;
  m.slotArr["weapon"] = 4;
  m.slotArr["accessory1"] = 5;
  m.slotArr["tech"] = 6;
  m.slotArr["shoe"] = 7;
  m.slotArr["pouch"] = 8;
  m.slotArr["jewellery"] = 9;
  m.slotArr["cologne"] = 10;
  m.slotArr["phone"] = 11;
  m.slotArr["glasses"] = 12;
  m.slotArr["dungeon1"] = 13;
  m.slotArr["phone2"] = 14;
  m.slotArr["gadget"] = 15;
  m.slotArr["hand"] = 16;
  var $personalName = $("#personal").find(".name");
  if ($personalName.length > 0 && $personalName.text().match("[0-9]+")) {
    m.player.level = $personalName.text().match("[0-9]+").toString();
  } else {
    m.player.level = 1;
  }
  m.player.money = $('span[rel="money"]');
  m.player.ore = $('span[rel="ore"]');

  m.player.oil = $('span[rel="oil"]');
  m.player.honey = $('span[rel="honey"]');

  if ($("#currenthp").attr("title") !== undefined) {
    m.player.currenthp = parseInt($("#currenthp").attr("title"));
  } else {
    m.player.currenthp = parseInt($("#currenthp").html());
  }
  if ($("#maxhp").attr("title") !== undefined) {
    m.player.maxhp = parseInt($("#maxhp").attr("title"));
  } else {
    m.player.maxhp = parseInt($("#maxhp").html());
  }

  currenthp = m.player.currenthp;
  maxhp = m.player.maxhp;

  setHP(m.player.currenthp, m.player.maxhp);

  //m.player.money = $('li.tugriki-block').attr("title").replace(/[^\d]/g, "");
  m.player.wallet = {};
  if (m.player.money.length) {
    //m.player.wallet.money = m.player.money.html().replace(/,+/g, '') * 1;
    m.player.wallet.money = m.player.money
      .parents("li:first")
      .attr("title")
      .replace(/[^\d]/g, "");
  }
  if (m.player.ore.length) {
    m.player.wallet.ore = m.player.ore
      .parents("li:first")
      .attr("title")
      .replace(/[^\d]/g, "");
  }
  if (m.player.oil.length) {
    m.player.wallet.oil = m.player.oil
      .parents("li:first")
      .attr("title")
      .replace(/[^\d]/g, "");
  }
  if (m.player.money.length) {
    m.player.wallet.honey = m.player.honey
      .parents("li:first")
      .attr("title")
      .replace(/[^\d]/g, "");
  }
  m.statType = [];
  m.statType["health"] = "Здоровье";
  m.statType["strength"] = "Сила";
  m.statType["dexterity"] = "Ловкость";
  m.statType["attention"] = "Внимательность";
  m.statType["intuition"] = "Хитрость";
  m.statType["resistance"] = "Выносливость";
  m.statType["charism"] = "Харизма";

  m.statTypeShort = [];
  m.statTypeShort["health"] = "Здор.";
  m.statTypeShort["strength"] = "Сила";
  m.statTypeShort["dexterity"] = "Ловк.";
  m.statTypeShort["attention"] = "Вним.";
  m.statTypeShort["intuition"] = "Хитр.";
  m.statTypeShort["resistance"] = "Выносл.";
  m.statTypeShort["charism"] = "Харизма";

  m.statNameArchieved = [];
  m.statNameArchieved["h"] = "health";
  m.statNameArchieved["s"] = "strength";
  m.statNameArchieved["d"] = "dexterity";
  m.statNameArchieved["a"] = "attention";
  m.statNameArchieved["i"] = "intuition";
  m.statNameArchieved["r"] = "resistance";
  m.statNameArchieved["c"] = "charism";

  m.statNameUnarchieved = [];
  m.statNameUnarchieved["health"] = "h";
  m.statNameUnarchieved["strength"] = "s";
  m.statNameUnarchieved["dexterity"] = "d";
  m.statNameUnarchieved["attention"] = "a";
  m.statNameUnarchieved["intuition"] = "i";
  m.statNameUnarchieved["resistance"] = "r";
  m.statNameUnarchieved["charism"] = "c";

  m.fi = [];
  m.fi["fight_cheese"] = 1;
  m.fi["fight_fog_grenade"] = 1;
  m.fi["fight_whistle"] = 1;
}

$(document).ready(function () {
  $.ajaxSetup({
    error: function (jqXHR, textStatus, errorThrown) {
      if (
        (textStatus != "error" || jqXHR.status != 0) &&
        textStatus != "abort" &&
        jqXHR.status != 504
      ) {
        var serviceInfo =
          "status:'" +
          jqXHR.status +
          "', textStatus:'" +
          textStatus +
          "', errorThrown:'" +
          errorThrown +
          "', response:'" +
          escape(jqXHR.responseText) +
          "'";
        moswar.showAlert("SMTH_WRONG", 0, "refreshButton", serviceInfo);
      }
    },
  });
  if (!getCookie("chat_lastId") && typeof Fingerprint2 === "function") {
    Fingerprint2.getV18(function (result, components) {
      __fp = result;
      setCookie("chat_lastId", __fp, "/", new Date(2030, 0, 1).toUTCString());
    });
  }
});
$(document).ajaxStart(function () {
  if (!noAjaxLoader) {
    $(".loading-top").show();
  }
});
$(document).ajaxStop(function () {
  $(".loading-top").hide();
});
/**
 * Генерация сcылки игрока
 * @param object player
 * @return string
 */
moswar.generatePlayerLink = function (player) {
  return (
    '<span class="user "><i title="' +
    (player.fraction == "arrived" ? LANG_REGISTER_6 : LANG_REGISTER_8) +
    '" class="' +
    player.fraction +
    '"></i><a href="/player/' +
    player.id +
    '/">' +
    player.nickname +
    '</a><span class="level">[' +
    player.level +
    "]</span></span>"
  );
};

/**
 * Показать блок дарения части новогоднего (2012) комплекта
 */
function checkPresents() {
  $.post(
    "/player/json/send_gift_set/",
    {},
    function (response) {
      var html = '<div style="height:70px; text-align:left;">';
      html +=
        '<img src="/@/images/obj/gift40.png" align="left" style="margin-right:20px;" />';
      html +=
        '<div class="hint" style="margin-bottom:5px;"><small>' +
        "Выберите предмет, который хотите упаковать и подарить." +
        "</small></div>";
      var buttonId = Math.floor(Math.random() * 9999);
      if (response.error) {
        html += '<select id="choose_ny_present" style="margin-bottom:5px;">';
        html += "<option>" + m.lang.NO_PRESENTS + "</option>";
        html += "</select><br />";
      } else {
        html += '<select id="choose_ny_present" style="margin-bottom:5px;">';
        for (var i = 0; i < response.length; i++) {
          //html += '<option value=' + response[i].id + '>' + response[i].name + ' [мф: '+response[i].mf+']</option>';
          html +=
            "<option value=" +
            response[i].id +
            ">" +
            response[i].name +
            "</option>";
        }
        html += "</select><br />";
        html += Mustache.to_html(m.tpl.button, {
          title: m.lang.GIVE_PRESENT_NY,
          id: buttonId,
          path: "",
        });
      }
      html += "</div>";
      var giftsShare = $("#pers-gifts-share");
      giftsShare.find("div.data").replaceWith(html);
      giftsShare.toggle("fast");
      $("#" + buttonId).bind("click", function (e) {
        $(this).addClass("disabled");
        //$(this).eventOff('click', buttonId);
        var choice = $("#choose_ny").find("option:selected").val();
        $.post("send_gift_set/" + choice + "/", {}, function (alerts) {
          $("#" + buttonId)
            .removeClass("disabled")
            .eventOn("click", buttonId);
          try {
            alerts = $.parseJSON(alerts);
          } catch (e) {
            moswar.showAlert("SMTH_WRONG");
            return;
          }
          moswar.showAlerts(alerts);
          if (alerts.result == "OK") {
            var nypresents = $("#choose_ny_present");
            nypresents.find(":selected").remove();
            if (nypresents.children().length == 0) {
              nypresents.append("<option>" + m.lang.NO_PRESENTS + "</option>");
              $("#" + buttonId).remove();
            }
          }
        });
      });
      /*$('#'+buttonId).unbind('click').click(function(){
		 $('#pers-gifts-share').toggle('fast');
		 });*/
    },
    "json"
  );
}

function buyPetrol(id, ob) {
  $.post(
    "/automobile/buypetrol/" + id + "/ajax/",
    {},
    function (response) {
      if (response.result == "OK") {
        $(ob).parents("div.alert:first").hide();
      }
      moswar.showAlerts(response);
    },
    "json"
  );
}

function countProperties(obj) {
  var count = "__count__",
    hasOwnProp = Object.prototype.hasOwnProperty;

  // __count__ - нативное свойство объектов в Firefox
  if (typeof obj[count] === "number" && !hasOwnProp.call(obj, count)) {
    return obj[count];
  }
  count = 0;
  for (var prop in obj) {
    if (hasOwnProp.call(obj, prop)) {
      count++;
    }
  }
  return count;
}
$.fn.bindEx = function (event, callback, id) {
  if (id == undefined) return;
  this.bind(event, callback);
  var o = {};
  o[event] = callback;
  m.storedEvents[id] = o;
};

$.fn.eventOff = function (event, id) {
  if (id == undefined) return;
  if (m.storedEvents[id]) {
    this.unbind(event);
  }
};

$.fn.eventOn = function (event, id) {
  if (id == undefined) return;
  if (m.storedEvents[id]) {
    this.unbind(event);
    this.bind(event, m.storedEvents[id][event]);
  }
};

if (!Array.indexOf) {
  Array.prototype.indexOf = function (obj) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] == obj) {
        return i;
      }
    }
    return -1;
  };
}

//" + LANG_MAIN_81 + "

var area = "";

if (typeof postVerifyKey == "undefined") {
  var postVerifyKey = "";
}

var glob = new Object();

var ENERGY_RECOVERY_SPEED = 300;

//" + LANG_MAIN_50 + "

function setTitle(str) {
  if (_top.frames.length > 1) {
    _top.document.title = str;
  } else {
    document.title = str;
  }
}

function setCaretPosition(ctrl, pos) {
  if (ctrl.setSelectionRange) {
    ctrl.focus();
    ctrl.setSelectionRange(pos, pos);
  } else if (ctrl.createTextRange) {
    var range = ctrl.createTextRange();
    range.collapse(true);
    range.moveEnd("character", pos);
    range.moveStart("character", pos);
    range.select();
  }
}

function getCaretPosition(ctrl) {
  var CaretPos = 0;
  // IE Support
  if (document.selection) {
    ctrl.focus();
    var Sel = document.selection.createRange();
    Sel.moveStart("character", -ctrl.value.length);
    CaretPos = Sel.text.length;
  } // Firefox support
  else if (ctrl.selectionStart || ctrl.selectionStart == "0")
    CaretPos = ctrl.selectionStart;
  return CaretPos;
}

function reloadTextSize(obj) {
  var maxTextSize = $(obj)
    .parents("form:first")
    .find("input[name='maxTextSize']")
    .val();
  var currentTextSize = $(obj).val().length;
  if (currentTextSize > maxTextSize) {
    var pos = getCaretPosition(obj);
    $(obj).val($(obj).val().substr(0, maxTextSize));
    setCaretPosition(obj, pos);
    obj.scrollTop = obj.scrollHeight;
    currentTextSize = $(obj).val().length;
  }
  $(obj)
    .parents("form:first")
    .find("span[rel='currentTextSize']")
    .html(maxTextSize - currentTextSize);
  return true;
}

var AnimatedItems = {
  items: [],

  inited: false,

  interval: null,

  removeFromContainer: function (cont) {
    cont
      .find("img[src='/@/images/1x1.png'][data-animated-index]")
      .each(function () {
        AnimatedItems.remove($(this));
      });
  },

  add: function (obj) {
    var obj = $(obj);
    if (obj.length > 1) {
      obj.each(function () {
        AnimatedItems.add(this);
      });
      return;
    }
    var newImg = new Image();

    if ($(obj).attr("data-animated-process") == 1) {
      return;
    }

    newImg.onload = function () {
      var width = newImg.width;
      var height = newImg.height;
      var i = AnimatedItems.items.length;
      var anim = {
        obj: obj,
      };
      anim.frames = width / height - 1;
      if (width > 0 && height > 0 && anim.frames == 0) {
        $(obj).removeAttr("data-animated-process");
        return;
      }
      if (anim.frames < 0) {
        setTimeout(function () {
          AnimatedItems.add(obj);
        }, 100);
        return;
      }
      anim.current = 0;
      anim.height = height;
      anim.src = $(obj).attr("src");
      obj
        .css("background-image", "url(" + $(obj).attr("src") + ")")
        .css("background-repeat", "no-repeat")
        .css("width", height + "px")
        .css("height", height + "px")
        .attr("data-animated-index", i)
        .attr("src", "/@/images/1x1.png")
        .css("background-color", "transparent");
      AnimatedItems.items[i] = anim;
      $(obj).removeAttr("data-animated-process");
      delete newImg;
    };
    newImg.src = $(obj).attr("src");
    $(obj).attr("data-animated-process", "1");
  },

  initAnimator: function () {
    if (AnimatedItems.interval) {
      clearInterval(AnimatedItems.interval);
    }
    AnimatedItems.interval = setInterval(function () {
      if (AnimatedItems.items.length == 0) {
        return;
      }
      for (var i in AnimatedItems.items) {
        AnimatedItems.items[i].current =
          AnimatedItems.items[i].current == AnimatedItems.items[i].frames
            ? 0
            : AnimatedItems.items[i].current + 1;
        AnimatedItems.items[i].obj.css(
          "background-position",
          AnimatedItems.items[i].current * -AnimatedItems.items[i].height +
            "px 0px"
        );
      }
    }, 150);
  },

  killAnimator: function () {
    if (AnimatedItems.interval) {
      clearInterval(AnimatedItems.interval);
    }
  },

  init: function () {
    AnimatedItems.kill();
    AnimatedItems.inited = true;
    $("img[src$='_spr.png']").each(function () {
      if ($(this)[0].complete) {
        AnimatedItems.add($(this));
      } else {
        $(this).load(function () {
          AnimatedItems.add($(this));
        });
      }
    });
    AnimatedItems.initAnimator();
  },

  remove: function (obj) {
    var i = $(obj).attr("data-animated-index");
    if (AnimatedItems.items[i]) {
      $(obj)
        .removeAttr("data-animated-index")
        .removeAttr("data-animated-process")
        .removeAttr("style")
        .attr("src", AnimatedItems.items[i].src);
      delete AnimatedItems.items[i];
    }
  },

  kill: function () {
    if (!AnimatedItems.inited) {
      return;
    }
    AnimatedItems.inited = false;
    for (var i in AnimatedItems.items) {
      AnimatedItems.remove(AnimatedItems.items[i].obj);
    }
    AnimatedItems.items = [];
    AnimatedItems.killAnimator();
  },
};

function initPage() {
  $(".messages-add textarea")
    .not("[data-reload-text-size=1]")
    .each(function (i) {
      var o = $(this);
      o.attr("data-reload-text-size", "1");
      var tim = AngryAjax.setInterval(
        (function (o) {
          return function () {
            reloadTextSize(o);
          };
        })(o),
        100
      );
      //$("body").one("gotourl_before", function() {
      //	clearInterval(tim);
      //});
    });
  mouseMoveTime();
  HTabs.initHTabs(
    $("td.equipment-cell div[rel='normal'][htab]"),
    function (tabName, tabCont) {
      $.get(
        "/player/loadjobinventory/",
        function (data) {
          $(tabCont).html(data["html"]);
          simple_tooltip(
            {
              s: $(tabCont).find("*[tooltip=1]"),
              context: "",
            },
            "tooltip_htab_" + tabName,
            true
          );
        },
        "json"
      );
    }
  );
  if (typeof player != "undefined") {
    AngryAjax.handleLinks();
    AngryAjax.handleForms();
  }

  m.superhitSlotItems = null;

  simple_tooltip("*[tooltip=1]", "tooltip");
  var $smiles = $("#smiles");
  $smiles.find("img").click(function () {
    emoticon(" :" + $(this).attr("alt") + ": ", $smiles.attr("rel"));
    if ($smiles.attr("alt") == "1") {
      $("#overtip-smiles").hide();
    }
  });
  // alert
  $("div.alert[rel='show']")
    .show()
    .each(function (i) {
      var th = $(this);
      th.css(
        "top",
        th.position().top - th.height() / 2 + $(document).scrollTop()
      );
      if (th.hasClass("alert-auto")) {
        th.css("left", parseInt(($("body").width() - th.width()) / 2) + "px");
        th.css("top", parseInt(($("body").height() - th.height()) / 2) + "px");
      }
    })
    .attr("rel", "");
  alertRenderContentItems();
  initTimers();
  initSpinner();

  // frooze links & buttons
  //m.actionObj.not("[rel='notfreeze']").not(".disabled").bindEx('click', m.performAction);
  jobInit();

  updateWalletIntToK();
  //	$(".tugriki-block span").text(intToKM($(".tugriki-block span").text().replace(/,/g, ""), $(".tugriki-block span").text()));
  //	$(".ruda-block span").text(intToKM($(".ruda-block span").text().replace(/,/g, ""), $(".ruda-block span").text()));
  //	$(".med-block span").text(intToKM($(".med-block span").text().replace(/,/g, ""), $(".med-block span").text()));
  //	$(".neft-block span").text(intToKM($(".neft-block span").text().replace(/,/g, ""), $(".neft-block span").text()));
  prepareDynamicGui();

  healInit();
  var serverTimeInterval;
  if (!window["$servertime"]) {
    window["$servertime"] = $("#servertime");
  }
  var setServerTimeInterval = function () {
    var timeOffset = parseInt($("#timeoffset").attr("rel"));
    if (window.serverTimeInterval) {
      clearInterval(window.serverTimeInterval);
    }
    window.serverTimeInterval = AngryAjax.setInterval(function () {
      setServerTimeInterval();
      var time = parseInt($servertime.attr("rel"));
      var d = new Date();
      d.setTime((time + timeOffset) * 1000);
      // серверное время здесь
      var m = d.getUTCMinutes();
      if (m < 10) {
        m = "0" + m;
      }
      var s = d.getUTCSeconds();
      if (s < 10) {
        s = "0" + s;
      }
      $servertime.html(d.getUTCHours() + ":" + m + ":" + s);
      time++;
      $servertime.attr("rel", time);
    }, "1000");
  };
  //var serverTimeCheckDate = Date.now();
  setServerTimeInterval();
  /*window.serverTimeInterval = AngryAjax.setInterval(function() {
		var now = Date.now();
		if (now - serverTimeCheckDate > 2000) {
			//clearInterval(serverTimeInterval);
			var newServerTime = parseInt($("#servertime").attr("rel")) + Math.round((now - serverTimeCheckDate - 500) / 1000);
			$("#servertime").attr("rel", newServerTime);
			setServerTimeInterval();
			serverTimeCheckDate = now;
		} else {
			serverTimeCheckDate = now;
		}
	}, 500);*/
  intervals["energyTicker"] = AngryAjax.setInterval(function () {
    energyTicker();
  }, "1000");
  /*
	if (_top.DEV_SERVER != undefined) {
		AngryAjax.setInterval(function() {
			var now = $("#servertime").attr("rel");
            if (getCookie(_top.DEV_SERVER = 1 ? 'ptr_' + 'notification' : 'notification') != '') {
                var notifications = eval('(' + getCookie(_top.DEV_SERVER = 1 ? 'ptr_' + 'notification' : 'notification') + ')');
                if (notify.permissionLevel() === notify.PERMISSION_GRANTED) {
                    if(notifications != null && notifications[now] != undefined) {
                        var notification = notify.createNotification("Оповещение " + document.domain, {
                            body: eval ('l.NOTIFICATION_' + notifications[now]),
                            icon: "/css/images/logo.png",
                            timeout: 3000
                        });
                        setTimeout(function(){
                            notification.close();
                        }, 3000);
                        delete notifications[now];
                    }
                }
            }
		}, 1000);
	}*/

  if (_top.DEV_SERVER != undefined) {
    AngryAjax.setInterval(function () {
      var now = $("#servertime").attr("rel");
      var cookieName =
        _top.DEV_SERVER != 0 ? "ptr_" + "notification" : "notification";
      var cookieData = getCookie(cookieName);
      if (cookieData != "") {
        var notifications = JSON.parse(cookieData);
        if (notify.permissionLevel() === notify.PERMISSION_GRANTED) {
          if (notifications != null && notifications[now] != undefined) {
            var notification = notify.createNotification(
              "Оповещение " + document.domain,
              {
                body: eval("l.NOTIFICATION_" + notifications[now]),
                icon: "/css/images/logo.png",
                timeout: 3000,
              }
            );

            setTimeout(function () {
              notification.close();
            }, 3000);

            delete notifications[now];
            setCookie(
              cookieName,
              JSON.stringify(notifications),
              "/",
              new Date(2030, 0, 1).toUTCString(),
              "." + location.host
            );
          }
        }
      }
    }, 1000);
  }

  $("input.ui").checkBox();
  $("input[disabled=''],button[disabled='']").each(function () {
    this.disabled = false;
  });

  // inttokm init
  $("[data-inttokm]").each((i, item) => {
    var $item = $(item);
    if ($item.attr("inited")) {
      return;
    }
    var value = parseInt($item.html());
    $item.attr("title", formatNumber(value, 0, "", ","));
    $item.html(intToKM(value));
    $item.attr("inited", true);
  });

  $(window).trigger("initpage");
  alertBindMove();
  AnimatedItems.init();
  paymentBonusHandle();

  if (window.self == window.top && $("#battletanks").length <= 0) {
    tankbattleHandle();
  }
}
var tankbattleHandle = function () {
  $(document).ready(function () {
    var localPlayer = window._top.player;
    if (
      localPlayer !== undefined &&
      localPlayer.state == "tankbattle" &&
      localPlayer.stateparam !== undefined
    ) {
      Tanks.show(localPlayer.stateparam);
    }
  });
};

var paymentBonusHandle = function () {
  if (window.payment_bonus_action && window.payment_bonus_action.text) {
    $(".header")
      .find(".stash")
      .html(
        '<span class="timer">' + window.payment_bonus_action.text + "</span>"
      );
  } else if (
    window.payment_bonus_action &&
    window.payment_bonus_action.special1 &&
    window.payment_bonus_action.dt2 >= window["$servertime"].attr("rel")
  ) {
    $(".header")
      .find(".stash")
      .html(
        '<span class="timer" timer="1" endtime="' +
          window.payment_bonus_action.dt2 +
          '" trigger="$(this).remove();">24:00:00</span>'
      );
    countdown($(".header").find(".stash").find(".timer"));
  } else if ($(".header").find(".stash").find(".timer").length > 0) {
    $(".header").find(".stash").html("");
  }
};

$(window).load(function () {
  tutorial.go.apply(tutorial);
});

var checkFightTimer = null;

$(document).ready(function () {
  if (typeof player != "undefined" && !iframeInit) {
    AngryAjax.init();
  }
  initPage();
  SoundingMain.init();
  var checkFightTimeCb = function () {
    checkFightTimer = setTimeout(function () {
      $.post(
        "/player/",
        {
          action: "check",
        },
        function (data) {
          if (data.return_url) {
            if (
              !player.soundDisabled &&
              data.return_url.search("/fight/") != -1
            ) {
              SoundingMain.playSound("gong", "layer1");
              if (_top.DEV_SERVER != undefined) {
                if (notify.permissionLevel() === notify.PERMISSION_GRANTED) {
                  var notification = notify.createNotification(
                    "Оповещение " + document.domain,
                    {
                      body: "Битва за район началась!",
                      icon: "/css/images/logo.png",
                      timeout: 3000,
                    }
                  );
                  setTimeout(function () {
                    notification.close();
                  }, 3000);
                }
              }
            }
            AngryAjax.goToUrl(data.return_url);
          } else {
            if (player.checkFightStart) {
              checkFightTimeCb();
            }
          }
        },
        "json"
      );
    }, 10000);
  };
  var checkFightTime = function () {
    if (window.player && player.checkFightStart) {
      if (checkFightTimer !== null) {
        clearTimeout(checkFightTimer);
      }
      checkFightTimeCb();
    }
  };
  $("body").bind("gotourl_after", checkFightTime);
  checkFightTime();
});

function mouseMoveTime() {
  $(window).mousemove(function () {
    _top.MOUSEMOVE_TIME = new Date().getTime();
  });
}

function initSpinner(obj) {
  if (typeof obj == "undefined") {
    var obj = "body";
  }
  $(obj)
    .find("input[spinner=1]:visible,input[data-spinner=1]:visible")
    .not("*[data-spinner-inited]")
    .each(function (i) {
      var c = {
        min: 0,
        step: 1,
      };
      if ($(this).attr("min")) {
        c.min = parseInt($(this).attr("min"));
      }
      if ($(this).attr("data-min")) {
        c.min = parseInt($(this).attr("data-min"));
      }
      if ($(this).attr("max")) {
        c.max = parseInt($(this).attr("max"));
      }
      if ($(this).attr("data-max")) {
        c.max = parseInt($(this).attr("data-max"));
      }
      if ($(this).attr("step")) {
        c.step = parseInt($(this).attr("step"));
      }
      if ($(this).attr("data-step")) {
        c.step = parseInt($(this).attr("data-step"));
      }
      if ($(this).attr("data-spinner-min")) {
        c.min = parseInt($(this).attr("data-spinner-min"));
      }
      if ($(this).attr("data-spinner-max")) {
        c.max = parseInt($(this).attr("data-spinner-max"));
      }
      if ($(this).attr("data-spinner-step")) {
        c.step = parseInt($(this).attr("data-spinner-step"));
      }
      $(this).attr("data-spinner-inited", 1).spinner(c);
    });
}

function animateNumber(holder, newValue, speed, shortNumber) {
  if ($(holder).length == 0) {
    return;
  }
  if (typeof speed == "undefined") {
    var speed = 50;
  }
  var current = parseInt(
    $(holder)
      .text()
      .replace(/[^0-9]/g, "")
  );
  if (isNaN(current)) {
    current = 0;
  }

  if (typeof shortNumber == "undefined") {
    var shortNumber = false;
  }

  var moneyNumber = kmToInt($(holder).text());

  if (moneyNumber > 0) {
    current = moneyNumber;
  }
  var diff = 0;
  var step = 0;
  if (current > newValue) {
    diff = current - newValue;
    step = Math.ceil(diff / 16) * -1;
  } else {
    diff = newValue - current;
    step = Math.ceil(diff / 16);
  }
  if (step != 0) {
    var changed = current;
    var changeInterval = AngryAjax.setInterval(function () {
      changed += step;
      if (
        (changed >= newValue && step > 0) ||
        (changed <= newValue && step < 0)
      ) {
        clearInterval(changeInterval);
        if (moneyNumber > 0 && !shortNumber) {
          $(holder).html(
            $(holder)
              .html()
              .replace(/[0-9\,]+[kMB]?/, intToKM(newValue))
          );
        } else {
          $(holder).html(
            $(holder)
              .html()
              .replace(
                /[0-9\,]+/,
                shortNumber == -1 ? newValue : formatNumber(newValue)
              )
          );
        }
      } else {
        if (moneyNumber > 0 && !shortNumber) {
          $(holder).html(
            $(holder)
              .html()
              .replace(/[0-9\,]+[kMB]?/, intToKM(changed))
          );
        } else {
          $(holder).html(
            $(holder)
              .html()
              .replace(
                /[0-9\,]+/,
                shortNumber == -1 ? newValue : formatNumber(newValue)
              )
          );
        }
      }
    }, speed);
  }
}

countdownDictionary = {};

function countdown(obj, timeWeight, ascending, prevTimerId) {
  /*if (typeof(prevTimerId) != "undefined" && countdownDictionary[prevTimerId] && countdownDictionary[prevTimerId][1] == 0) {
	 clearTimeout(countdownDictionary[prevTimerId][0]);
	 delete countdownDictionary[prevTimerId];
	 }*/
  var curObj = $(obj);
  if (
    curObj.length ==
    0 /* || (curObj.is(":hidden") && curObj.html().length == 0)*/
  ) {
    return;
  }
  curObj.attr("process", 1);

  curObj.attr("timercomplete", null);
  ascending =
    curObj.attr("asc") == undefined ? ascending : parseInt(curObj.attr("asc"));

  var timer = curObj.attr("timer");
  if (curObj.attr("endtime") > 0) {
    timer = curObj.attr("endtime") - $("#servertime").attr("rel");
  }
  if (timer < 0) {
    timer = 0;
  }
  var s = timer % 60;
  var m = Math.floor(timer / 60) % 60;
  var h = Math.floor(timer / 3600);
  if (s < 10) {
    s = "0" + s;
  }
  if (m < 10) {
    m = "0" + m;
  }
  if (h < 10) {
    h = "0" + h;
  }
  if (curObj.attr("data-no-hours") == 1) {
    var sTime = m + ":" + s;
  } else {
    var sTime = h + ":" + m + ":" + s;
  }
  if (!timeWeight) {
    var attrWeight = parseInt(curObj.attr("weight"));
    if (attrWeight > 0) {
      timeWeight = attrWeight;
    }
  }
  if (typeof curObj.attr("data-no-visible-change") == "undefined") {
    switch (timeWeight) {
      case 1:
        curObj.text(m + ":" + s);
        break;
      case 2:
        curObj.text(s);
        break;
      case 3:
        curObj.text(h + ":" + m);
        break;
      case 4:
        h = h.replace(/^0/g, "");
        curObj.text(h && Number(h) ? h + ":" + m + ":" + s : m + ":" + s);
        break;
      default:
        curObj.text(sTime);
        break;
    }
  }
  if (ascending) {
    timer++;
  } else {
    timer--;
  }
  curObj.attr("timer", timer);
  /* write to title */
  if (curObj.attr("intitle") == 1) {
    var sTitle = document.title;
    if (/^\s?\[[^\]]*\]/.test(sTitle)) {
      sTitle = sTitle.replace(/^\s?\[([^\]]*)\]/, "[" + sTime + "]");
    } else {
      sTitle = "[" + sTime + "] " + sTitle;
    }
    sTitle = sTitle
      .replace("0-1", "00")
      .replace("0-1", "00")
      .replace("0-1", "00");
    // костыль
    setTitle(sTitle);
  }

  // bar
  if (curObj[0].id != "" && $("#" + curObj[0].id + "bar")[0] != null) {
    var bar = $("#" + curObj[0].id + "bar");
    if (bar.attr("reverse") == "1") {
      bar.css(
        "width",
        100 -
          Math.round(
            ((curObj.attr("timer2") - timer) / curObj.attr("timer2")) * 100
          ) +
          "%"
      );
    } else {
      bar.css(
        "width",
        Math.round(
          ((curObj.attr("timer2") - timer) / curObj.attr("timer2")) * 100
        ) + "%"
      );
    }
  }

  if (timer >= 0) {
    //var k = curObj[0].id || Math.floor(Math.random() * 10000);
    if (curObj.attr("ontick")) {
      eval(curObj.attr("ontick"));
    }
    if (curObj.attr("data-no-stop") == 1) {
      var timerf = window.setTimeout;
    } else {
      var timerf = AngryAjax.setTimeout;
    }
    var timer = timerf(
      function () {
        countdown(obj, timeWeight, ascending);
      },
      1000,
      curObj
    );
    //if (countdownDictionary[k]) {
    //	clearTimeout(countdownDictionary[k]);
    //}
    //countdownDictionary[k] = [timer,0];
  } else {
    if (
      curObj.is("td.value") &&
      curObj.parents("table:first").is("table.process")
    ) {
      // if this is table.process
      curObj.parents("table.process:first").addClass("process-blinking");
    } else {
      if (typeof curObj.attr("data-no-blinking") == "undefined") {
        var interval = AngryAjax.setInterval(function () {
          if ("hidden" == curObj.css("visibility")) {
            curObj.css("visibility", "visible");
          } else {
            curObj.css("visibility", "hidden");
          }
        }, "800");
      } else if (!curObj.attr("data-no-hide")) {
        curObj.hide();
      }
      //var k = curObj[0].id || Math.floor(Math.random() * 10000);
      //if (countdownDictionary[k]) {
      //	clearInterval(countdownDictionary[k]);
      //}
      //countdownDictionary[k] = [interval,1];
    }
    curObj.attr("timercomplete", 1);

    if (curObj.attr("trigger")) {
      if (curObj.attr("data-trigger-timeout")) {
        setTimeout(function () {
          eval(curObj.attr("trigger"));
        }, curObj.attr("data-trigger-timeout"));
      } else {
        eval(curObj.attr("trigger"));
      }
    } else {
      onTimerCompleteEvent(curObj.id);
    }
  }
}

function tabsController(obj) {
  var mainframe = obj.parents(".tab-content");
  var tab_c = mainframe.children('div[id="' + obj.attr("id") + '_content"]');
  if (obj.parent().find("li").size() <= 2) {
    if (obj.hasClass("active") && !obj.hasClass("collapsed")) {
      obj.parent().children(".hider").hide();
      obj.addClass("collapsed");
      tab_c.children("*").animate(
        {
          opacity: 0,
        },
        "fast"
      );
      tab_c.slideUp("fast", function () {
        mainframe.addClass("collapsed");
      });
    } else {
      obj.parent().children(".hider").show();
      obj.removeClass("collapsed");
      tab_c.children("*").animate(
        {
          opacity: 1,
        },
        "normal"
      );
      tab_c.slideDown("fast", function () {
        mainframe.removeClass("collapsed");
      });
    }
  } else {
    obj.parent().children(".active").removeClass("active");
    obj.addClass("active");
    mainframe.children('div:not([id="' + obj.attr("id") + '_content"])').hide();
    mainframe.children('div[id="' + obj.attr("id") + '_content"]').show();
  }
}

function doMarkofPosition(cont, coord, action) {
  $("#markofTarget").stop().show();
  var offset = cont.offset();
  if (coord == undefined || coord == "" || coord == null) {
    var coord = $("#markofTarget").parent().offset();
  } else {
    var coord = coord.offset();
  }
  var width = cont.outerWidth();
  var height = cont.outerHeight();
  if (action != false) {
    $("#markofTarget").animate(
      {
        top: offset.top - coord.top,
        left: offset.left - coord.left,
        width: width,
        height: height,
      },
      350,
      "easeOutBack"
    );
  } else {
    $("#markofTarget").css(
      {
        top: offset.top - coord.top,
        left: offset.left - coord.left,
        width: width,
        height: height,
      },
      350,
      "easeOutBack"
    );
  }
}

var currenthp, maxhp;
function healInit() {
  currenthp = new Number($("#currenthp").prop("title"));
  maxhp = new Number($("#maxhp").prop("title"));

  if (currenthp < maxhp) {
    AngryAjax.setTimeout(heal, 10000);
    if (!player.regenerationOff) {
      if (player.state != "dungeon") {
        $("#personal").find("div.life i.plus-icon").show();
      }
    }
  } else {
    $("#personal").find("div.life i.plus-icon").hide();
  }
}
function heal() {
  if (typeof player == "undefined") return;
  if (player.regenerationOff) {
    AngryAjax.setTimeout(heal, 10000);
    return;
  }
  var inc = 180;
  var playerInfo = $("#personal").find("a.name b").text();
  if (playerInfo.length) {
    var level = parseInt(playerInfo.match("\\[([0-9]+)\\]")[1]);
    if (level == 1) {
      inc = inc / 6;
    }
  }

  currenthp += maxhp / inc;
  if (currenthp > maxhp) {
    currenthp = maxhp;
    $("#personal").find("div.life i.plus-icon").hide();
  }
  setHP(currenthp);
  if (currenthp < maxhp) {
    $("#personal").find("div.life i.plus-icon").show();
    AngryAjax.setTimeout(heal, 10000);
  }
}

function setHP(hp, newmaxhp, ignoreRegenerationOff) {
  if (typeof ignoreRegenerationOff == "undefined") {
    var ignoreRegenerationOff = false;
  }
  //if (!ignoreRegenerationOff) {
  //	if (player != undefined) {
  //		if (player.regenerationOff) {
  //			return false;
  //		}
  //	}
  //}
  currenthp = hp;
  if (newmaxhp != undefined) {
    maxhp = newmaxhp;
  }

  $("#currenthp")
    .text(intToKM(Math.round(currenthp)))
    .attr("title", currenthp);
  $("#maxhp")
    .text(intToKM(Math.round(maxhp)))
    .attr("title", maxhp);
  var percent = Math.min(100, Math.round((currenthp / maxhp) * 100));
  var time = 1500;
  $("#playerHpBar").animate(
    {
      width: percent + "%",
    },
    time
  );
  /* if ($("#equipment-accordion").length) {
	 $('.pers-statistics .life .bar .percent').animate({width: percent + '%'}, time);
	 $(".pers-statistics .life .currenthp").text(Math.round(currenthp));
	 } */
  if (currenthp >= maxhp) {
    $("#personal").find("div.life i.plus-icon").hide();
  } else {
    $("#personal").find("div.life i.plus-icon").show();
  }
}

function showHPAlert() {
  $.get(
    "/player/checkhp/",
    function (data) {
      /*if (data['sirop']) {
		 var count = data['sirop']['count'];
		 if (count >1){
		 var title = "2х«Сироп»";
		 } else {
		 var title = "«Сироп»";
		 }
		 }
		 if (data['mikstura']) {
		 var title = "«Микстура»";
		 }*/
      if (data["sirop"] || data["mikstura"]) {
        $.post(
          "/player/checkhp/",
          {
            action: "restorehp",
          },
          function (data) {
            if (data["result"] == 0) {
              showAlert(m.lang.LANG_MAIN_105, data["error"], true);
            } else {
              setHP(maxhp);
            }
          },
          "json"
        );
      } else if (data.error) {
        showAlert(m.lang.LANG_MAIN_105, data["error"], true);
      } else {
        var buttons = [];
        buttons.push({
          title:
            m.lang.LANG_ALERT_HEAL +
            " - <span class='tugriki'>100<i></i></span>",
          callback: function (obj, params) {
            $.post(
              "/player/restorehp/",
              {
                action: "restorehp",
              },
              function (data) {
                if (data["result"] == 0) {
                  showAlert(m.lang.LANG_MAIN_105, data["error"], true);
                } else {
                  updateWallet(data["wallet"]);
                  setHP(data["hp"]);
                }
                closeAlert(obj);
              },
              "json"
            );
          },
        });
        showConfirm(
          "<img align='left' src='/@/images/obj/drugs4.png' style='margin: 0 10px 0 0' /><p style='margin:0pt; padding:5px 0;'>" +
            "Со временем здоровье восстановится само. Но вы можете мгновенно восстановить жизни, выпив баночку лечебной микстуры." +
            "</p>",
          buttons,
          {
            __title: m.lang.LANG_HEAL_BUTTON,
          }
        );
      }
    },
    "json"
  );
}

function numbersonly(myfield, e, dec) {
  var key;
  var keychar;

  if (window.event) {
    key = window.event.keyCode;
  } else if (e) {
    key = e.which;
  } else {
    return true;
  }
  keychar = String.fromCharCode(key);

  if (
    key == null ||
    key == 0 ||
    key == 8 ||
    key == 9 ||
    key == 13 ||
    key == 27
  ) {
    return true;
  } else if ("0123456789".indexOf(keychar) > -1) {
    return true;
  } else if (dec && keychar == ".") {
    myfield.form.elements[dec].focus();
    return false;
  } else {
    return false;
  }
}

var intervals = new Object();
var initTimers = function () {
  $('*[timer]:not([process]):not([data-no-timer-init="1"])').each(function () {
    if ($(this).attr("process") == 1 && $(this).attr("id") != "timeout") {
      return;
    }
    if ($(this).attr("timer") > 0 && !$(this).attr("endtime")) {
      $(this).attr(
        "endtime",
        parseInt($("#servertime").attr("rel")) + parseInt($(this).attr("timer"))
      );
    }
    if (
      $(this).attr("timer") > 0 &&
      $(this).attr("timer") != "" &&
      !$(this).hasClass("short") &&
      !$(this).hasClass("shortly")
    ) {
      if ($(this).attr("notitle") != 1) {
        $(this).show();
      }
      countdown($(this));
    }
    if (
      $(this).attr("timer") > 0 &&
      $(this).attr("timer") != "" &&
      $(this).hasClass("short")
    ) {
      countdown($(this), 1);
    }
    if (
      $(this).attr("timer") > 0 &&
      $(this).attr("timer") != "" &&
      $(this).hasClass("shortly")
    ) {
      countdown($(this), 2);
    }
  });
};

$(document).ready(function () {
  /* events */
  setTitle(document.title);
  if (window.event_onefraction) {
    $("body").addClass("onefraction");
    $(window).bind("initpage", function () {
      $("i.arrived,i.resident").attr("title", LANG_ONEFRACTION);
    });
  }
  if (
    window.event_swap_arrows_locations &&
    $(".square-leftstreet,.square-rightstreet".length == 2)
  ) {
    var item1 = $(".square-leftstreet");
    var item2 = $(".square-rightstreet");
    item1.addClass("square-rightstreet").removeClass("square-leftstreet");
    item2.addClass("square-leftstreet").removeClass("square-rightstreet");
    $(window).bind("initpage", function () {
      if (AngryAjax.getCurrentUrl() == "/square/") {
        var item1 = $("#square-tverskaya-button");
        var item2 = $("#square-arbat-button");
        var tmp = [
          item1.find("a").attr("href"),
          item2.find("a").attr("href"),
          item1.find("div.c").text().slice(2),
          item2.find("div.c").text().slice(0, -2),
        ];
        item1.find("a").attr("href", tmp[1]);
        item2.find("a").attr("href", tmp[0]);
        item1.find("div.c").html("&#8592; " + tmp[3]);
        item2.find("div.c").html(tmp[2] + " &#8594;");
      }
    });
  }
  Alley.Suslik.init();
  Alley.onFirstLoad();
  Shaurburgers.onFirstLoad();
  FactoryMf.onFirstLoad();
  HolidayPage.onFirstLoad();
  Groups.onFirstLoad();
  // if (!window.DEV_SERVER) {
  //   $("body").addClass("prod");
  // }
  // remove chat & logout links if in another iframe
  try {
    top.document;
  } catch (e) {
    $("#chat-link").hide();
    $(".links-more").find(".dropdown").find(".dropdown-item:last").hide();
  }
});

function energyTicker() {
  if (
    typeof player == "undefined" ||
    typeof player["fullenergyin"] == "undefined" ||
    player["fullenergyin"] == 0
  ) {
    return;
  }
  var timeleft = player["fullenergyin"] - $("#servertime").attr("rel");
  if (timeleft <= 0) {
    $("div.tonus-overtip-increase").html();
    $("div.tonus div.bar i.plus-icon").hide();
    return;
  }
  setEnergy(player["maxenergy"] - Math.ceil(timeleft / ENERGY_RECOVERY_SPEED));

  if (player["fullenergyin"] == 0) {
    $("div.tonus-overtip-increase").html();
    $("div.tonus div.bar i.plus-icon").hide();
  } else {
    $("div.tonus-overtip-increase").html(
      "<span class='textline'><span class='tonus'>+1<i></i></span> через <span>" +
        date("i:s", timeleft % ENERGY_RECOVERY_SPEED) +
        "</span></span>"
    );
    $("div.tonus div.bar i.plus-icon").show();
  }
}

var intToKM = function (count, orig, digits) {
  if (typeof orig != "undefined" && parseInt(count) != count) {
    return orig;
  }

  var K = 10;
  if (typeof digits != "undefined") {
    for (var i = 1; i < digits; i++) {
      K *= 10;
    }
  }

  if (count >= 1000000000) {
    count = count / 1000000000;
    if (count < 100) {
      count = Math.floor(count * K) / K;
    } else {
      count = Math.floor(count);
    }
    count += "B";
  } else {
    if (count >= 1000000) {
      count = count / 1000000;
      if (count < 100) {
        count = Math.floor(count * K) / K;
      } else {
        count = Math.floor(count);
      }
      count += "M";
    } else {
      if (count >= 1000) {
        count = count / 1000;
        if (count < 100) {
          count = Math.floor(count * K) / K;
        } else {
          count = Math.floor(count);
        }
        count += "k";
      }
    }
  }
  return count.toString().replace(".", ",");

  //if (typeof(digits) == 'undefined') {
  //    digits = 1;
  //}
  //var si = [
  //    //{ value: 1E18, symbol: "E" },
  //    //{ value: 1E15, symbol: "P" },
  //    //{ value: 1E12, symbol: "T" },
  //    { value: 1E9,  symbol: "B" },
  //    { value: 1E6,  symbol: "M" },
  //    { value: 1E3,  symbol: "k" }
  //], rx = /\.0+$|(\.[0-9]*[1-9])0+$/, i;
  //for (i = 0; i < si.length; i++) {
  //    if (count >= si[i].value) {
  //        return (count / si[i].value).toFixed(digits).replace(rx, "$1").toString().replace(".", ",") + si[i].symbol;
  //    }
  //}
  //return count.toFixed(digits).replace(rx, "$1").toString().replace(".", ",");
};

var kmToInt = function (str_number) {
  var sum = 0;
  var kArr = str_number.split("k");
  var mArr = str_number.split("M");

  if (kArr.length == 2) {
    sum = parseInt(kArr[0].toString().replace(",", ".") * 1000);
  } else if (mArr.length == 2) {
    sum = parseInt(mArr[0].toString().replace(",", ".") * 1000000);
  } else {
    sum = parseInt(str_number.replace(/,/g, ""));
  }
  return sum;
};

/*function postUrl(path, params, method) {
 if ($('#service-form').length > 0) {
 return false;
 }
 var formHtml = '<form action="' + path + '" method="' + method + '" style="display:none;" id="service-form">';
 for(var key in params) {
 formHtml += '<input type="hidden" name="' + key + '" value="' + params[key] + '" />';
 }
 formHtml += '</form>';

 $("#main").append(formHtml);
 $("#service-form").submit();
 }*/

function postUrl(path, params, method, callback, visible) {
  if (typeof method == "undefined") {
    method = "post";
  }
  if (typeof params == "undefined") {
    params = {};
  }
  if (typeof params["__csrf"] == "undefined") {
    //params["__csrf"] = CSRF;
  }
  //params["static_version"] = STATIC_VERSION;
  params["__referrer"] = AngryAjax.getCurrentUrl();
  if (typeof params.return_url == "undefined") {
    params.return_url = params["__referrer"];
  }
  if (
    path == "/dungeon/inside/" &&
    Object.keys(Groups.activeGroups).length == 0
  ) {
    params.getActiveGroups = 1;
  }
  //if (LAST_LEFTBLOCK_LOAD + 10 < Math.round(new Date().getTime()/1000)) {
  //	params.render_leftblock = 1;
  //}

  if ($("#service-form").length > 0) {
    return false;
  }
  if (visible == undefined) {
    visible = true;
  }
  //controlButtons(0);
  if (typeof callback != "undefined" && callback !== 0 && callback !== null) {
    if (path.match(/^\/chat\//)) {
    } else {
      var handleAnswer = function (data) {
        if (AngryAjax.inProcess) {
          AngryAjax.notWorkHashChange = false;
          AngryAjax.inProcess = false;
        }
        data = parseIfJsonString(data);
        //if (data.flash) {
        //	Form.showFlash(data.flash);
        //}
        if (!params["__cbBefore"]) {
          AngryAjax.handleData(data);
        }
        if (typeof callback == "function") {
          if (typeof data.data != "undefined") {
            callback(data.data);
          } else {
            callback(data);
          }
        }
        if (params["__cbBefore"]) {
          AngryAjax.handleData(data);
        }
      };
    }

    var ajaxParams;
    if (method == "post") {
      ajaxParams = {
        type: "POST",
        url: path,
        data: params,
        global: visible,
        success: handleAnswer,
      };
      $.ajax(ajaxParams);
    } else {
      ajaxParams = {
        type: "GET",
        url: path,
        data: params,
        global: visible,
        cache: false,
        success: handleAnswer,
      };
      $.ajax(ajaxParams);
    }
  } else {
    var formHtml =
      '<form action="' +
      path +
      '" method="' +
      method +
      '" style="display:none;" id="service-form">';
    for (var key in params) {
      formHtml +=
        '<input type="hidden" name="' +
        key +
        '" value="' +
        params[key] +
        '" />';
    }
    formHtml += "</form>";

    $("body").append(formHtml);
    $("#service-form").submit();
  }
}

function input(query, value, path) {
  var value = prompt(query, value);
  if (value != null) {
    postUrl(
      path,
      {
        param: value,
      },
      "post",
      1
    );
  }
}

function showCaptcha(returnUrl) {
  if ($("#captcha").length > 0) {
    $("#captcha").remove();
  }
  //$("body").append("<div id='captcha' class='overtip' style='background-color: !important; position: absolute; display: block; width: 300px; height: auto; top: 40%; left: 40%; min-width: 300px; min-height: 100px; text-align: center;'><h2>" + LANG_MAIN_58 + "</h2><div class='data'>" + LANG_MAIN_10 + "<div id='captcha_inside'><img src='/captcha/&" + Math.random() +  "' /><br /><input type='text' id='captcha_code' name='captcha' value='' /><br /><input type='button' onclick='checkCaptcha(\"" + returnUrl + "\");' value='" + m.lang.LANG_MAIN_64 + "' /></div></div></div>");
  $("body").append(
    "<div id='captcha' class='overtip passport-check'><div class='text'><div id='captcha_inside'>" +
      m.lang.LANG_MAIN_25 +
      "<br />—" +
      m.lang.LANG_MAIN_24 +
      "<b>" +
      m.lang.LANG_MAIN_44 +
      "</b>" +
      m.lang.LANG_MAIN_72 +
      "</div></div><div class='number'><input type='text' id='captcha_code' name='captcha' value='' /><br /><button class='button' type='button' onclick='checkCaptcha(\"" +
      returnUrl +
      "\");'><span class='f'><i class='rl'></i><i class='bl'></i><i class='brc'></i><div class='c'>" +
      m.lang.LANG_MAIN_71 +
      "</div></span></button></div><div class='captcha'><img src='/captcha/&" +
      Math.random() +
      "' /></div></div>"
  );
}

function checkCaptcha(returnUrl) {
  var code = $("#captcha_code").val();
  $("#captcha_inside").html(
    "<br /><i>" + m.lang.LANG_MAIN_42 + "</i><br />&nbsp;"
  );
  $.post(
    "/captcha/",
    {
      action: "check_captcha",
      code: code,
    },
    function (data) {
      if (data == "ok") {
        $("#captcha_inside").html(
          "<br /><i>" + m.lang.LANG_MAIN_46 + "</i><br />&nbsp;"
        );
        AngryAjax.setTimeout(function () {
          document.location.href = returnUrl;
        }, "500");
      } else {
        $("#captcha_inside").html(
          "<br /><i>" + m.lang.LANG_MAIN_63 + "</i><br />&nbsp;"
        );
        AngryAjax.setTimeout(function () {
          showCaptcha(returnUrl);
        }, "500");
      }
    }
  );
}

function emoticon(text, elementId) {
  if (
    document.getElementById(elementId).createTextRange &&
    document.getElementById(elementId).caretPos
  ) {
    var caretPos = document.getElementById(elementId).caretPos;
    caretPos.text =
      caretPos.text.charAt(caretPos.text.length - 1) == " " ? text + " " : text;
  } else {
    document.getElementById(elementId).value += text;
  }
  $("#" + elementId).trigger("focus");
}

function simple_tooltip_hide(tooltipid) {
  var tooltip = $("#" + tooltipid);
  tooltip.parents("div.overtip:first").hide();
  tooltip.attr("nohide", "");
  tooltip.parents("div.overtip:first").find("span.close-cross").hide();
}

function render_content_items(content, is_alert) {
  if (is_alert) {
    content = content.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  }
  var arr = content.match(/<<.*>>/g) || [];
  for (var j = 0, text, items, html; (text = arr[j]); j++) {
    items = text.replace("<<", "").replace(">>", "").split("|");
    html = Mustache.to_html(m.tpl.tooltipSpecialItems, {
      title: items.splice(0, 1),
      items: items,
    });
    if (is_alert) {
      html = html.replace(/{/g, "<").replace(/}/g, ">");
    }
    content = content.replace(text, html);
  }
  return content;
}

var alertRenderContentItems = function () {
  $(".alert:visible")
    .find("#alert-text")
    .each(function () {
      $(this).html(render_content_items($(this).html(), true));
    });
};

function simple_tooltip(target_items, name, job) {
  if (typeof name == "undefined") {
    name = "r" + Math.round(Math.random() * 100000);
  }

  if (target_items.jquery) {
    __target = target_items;
  } else if (typeof target_items == "object") {
    __target = $(target_items.s, target_items.context);
  } else {
    __target = $(target_items);
  }

  $.each(__target, function (i) {
    var html = null;
    if ($(this).attr("rel") == "special_tonus") {
      info = {};
      info.content =
        l.LANG_ENERGY_DESCRIPTION +
        '<div class="clear tonus-overtip-increase"></div>';
      info.id = name + i;
      info.clickable = !!$(this).attr("clickable");
      info.title = title;
      info.object = true;
      info.image = true;
      info.image_src = "<img src='/@/images/obj/tonus.png'>";
    } else {
      if ($(this).attr("title") == undefined) return;
      var content = $(this)
        .attr("title")
        .replace(/\s{2,}/m, "")
        .replace(/{w-heavy}/g, '<i class="w-heavy"></i>')
        .replace(/{w-gun}/g, '<i class="w-gun"></i>')
        .replace(/{w-cold}/g, '<i class="w-cold"></i>')
        .replace(/{w-mace}/g, '<i class="w-mace"></i>')
        .replace(/{fraction_icon_resident}/g, '<i class="resident"></i>')
        .replace(/{fraction_icon_arrived}/g, '<i class="arrived"></i>')
        .replace(
          /\{money\|([^}]*)\}/g,
          '<span class="tugriki">$1<i></i></span>'
        )
        .replace(/\{med\|([^}]*)\}/g, '<span class="med">$1<i></i></span>')
        .replace(/\{honey\|([^}]*)\}/g, '<span class="med">$1<i></i></span>')
        .replace(/\{img\|([^}]*)\}/g, '<img src="$1" />')
        .replace(/{nbsp}/g, "&nbsp;")
        .replace(/{/g, "<")
        .replace(/}/g, ">");
      var info = null;
      var title = "";
      if (content.split("||").length > 1) {
        var arr = content.split("||");
        title = arr[0];
        if (arr[2]) {
          var desc = arr[1].replace(/\|/g, "<br />");
          content = arr[2];
        } else {
          content = arr[1];
        }
      }

      if (content.split("|").length > 1 || $(this).hasClass("num")) {
        content = render_content_items(content);
        var arr = content.split("|");
        if (arr) {
          content = "";
          for (var j = 0; j < arr.length; j++) {
            if (arr[j] && arr[j].replace("	", "").length > 2) {
              content += "<span class='brown'>" + arr[j] + "</span>";
              if (j != arr.length) {
                content += "<br />";
              }
            }
          }
        } else if ($(this).hasClass("num")) {
          content = "<span class='brown'>" + content + "</span>";
        }

        if (desc) {
          content = desc + "<br />" + content;
        }
      }
      var image = "";
      var src = "";
      if ($(this).attr("src") && $(this).attr("src").length > 0) {
        src = $(this).attr("src");
      }
      if ($(this).attr("data-image") && $(this).attr("data-image").length > 0) {
        src = $(this).attr("data-image");
      }
      if ($(this).attr("data-no-image")) {
        src = "";
      }
      if (src.length > 0) {
        image = '<img src="' + src + '"';

        if (typeof $(this).attr("data-no-style") == "undefined") {
          var style = $(this).attr("style");
          if (style) {
            image += ' style="' + style + '" ';
          }
        }

        image += " />";
      }
      info = {
        id: name + i,
        title: title,
        content: content,
        image: !!image,
        image_src: image,
        clickable: !!$(this).attr("clickable"),
      };
      if ($(this).attr("clickable")) {
        var html =
          "<div class='overtip' style='position: absolute; display: none; max-width: 266px; z-index:90;'>" +
          "<div class='" +
          (info.image ? "object" : "help") +
          "' id='" +
          info.id +
          "'>";
        if (title) {
          html += "<h2>" + title + "</h2>";
        }
        html += "<div class='data'>" + content;
        if (info.image) {
          html += "<i class='thumb'>" + image + "</i>";
        }
        html +=
          "</div></div>" +
          "<span class='close-cross' onclick='simple_tooltip_hide(\"" +
          info.id +
          "\");' style='display:none;'>&#215;</span>" +
          "</div>";
      }
    }
    if (info !== null) {
      m.items[$(this).data("id")] = new m.item(this, html, job, info);
      $(this).removeAttr("title");
    }
  });

  if (m.superhitSlotItems) {
    playerRedrawSuperhitSlots();
  }
}

function setCookie(name, value, path, expires, domain, secure) {
  path = "/";
  document.cookie =
    name +
    "=" +
    escape(value) +
    (expires ? "; expires=" + expires : "") +
    (path ? "; path=" + path : "") +
    (domain ? "; domain=" + domain : "") +
    (secure ? "; secure" : "");
}

function getCookie(name) {
  var cookie = " " + document.cookie;
  var search = " " + name + "=";
  var setStr = null;
  var offset = 0;
  var end = 0;
  if (cookie.length > 0) {
    offset = cookie.indexOf(search);
    if (offset != -1) {
      offset += search.length;
      end = cookie.indexOf(";", offset);
      if (end == -1) {
        end = cookie.length;
      }
      setStr = unescape(cookie.substring(offset, end));
    }
  }
  return setStr;
}

function formatNumber(number, decimals, decimalsPoint, thousandsSeparator) {
  number = Number(number) || 0;
  if (decimals > 0) {
    number = Math.round(number * (decimals * 10)) / (decimals * 10);
  }
  var a = Math.floor(number);
  var b = number - a;
  a = a + "";
  //" + LANG_MAIN_51 + "
  var a2 = "";
  var j = 0;
  for (var i = a.length - 1; i >= 0; i--) {
    a2 += a.charAt(j);
    j++;
    if (i % 3 == 0 && i != 0) {
      a2 += thousandsSeparator;
    }
  }
  if (decimals > 0) {
    a2 = a2 + decimalsPoint + b;
  }
  return a2;
}

function updatePlayerBlockMoney(sum, op) {
  var money = $("#personal").find(".tugriki-block").attr("title");
  money = money.split(":");
  money = parseInt($.trim(money[1]));
  switch (op) {
    case "+":
      money += sum;
      break;
    case "-":
      money -= sum;
      break;
  }
  updateWallet({
    money: money,
  });
}

function updatePlayerBlockHoney(sum, op) {
  var honey = $("#personal").find(".med-block").attr("title");
  honey = honey.split(":");
  honey = parseInt($.trim(honey[1]));
  switch (op) {
    case "+":
      honey += sum;
      break;
    case "-":
      honey -= sum;
      break;
  }
  updateWallet({
    honey: honey,
  });
}

function updatePlayerBlockOre(sum, op) {
  var ore = $("#personal").find(".ruda-block").attr("title");
  ore = ore.split(":");
  ore = parseInt($.trim(ore[1]));
  switch (op) {
    case "+":
      ore += sum;
      break;
    case "-":
      ore -= sum;
      break;
  }
  updateWallet({
    ore: ore,
  });
}

var showHelpTips = function () {
  $("#overtip-help-alley").show("normal");
  if (!jQuery.browser.msie) $("#background").show();
};

var closeHelpTips = function (obj) {
  $(obj).parents("div.overtip:first").hide("fast");
  $("#background").hide();
  setCookie("hideHelpTips", "1");
};

function onTimerCompleteEvent(type) {
  if (typeof type != "undefined") {
    area = type;
  }
  switch (area) {
    case "timeout":
      setMainTimer(0);
      break;

    case "metro":
      $("#kopaem").hide();
      var myRat = $.ajax({
        url: "/metro/myrat/",
        async: false,
      }).responseText;
      if (myRat != "0") {
        $("#welcome-no-rat").hide();
        $("#content-no-rat").hide();
        $("#welcome-rat").show();
        $("#ratlevel").html(myRat);
      } else {
        $("#ore_chance").html(
          $.ajax({
            url: "/metro/myorechance/",
            async: false,
          }).responseText + "%"
        );
        $("#vykopali").show();
      }
      break;

    case "metro_rat":
      $("#timer-rat-fight").hide();
      $("#action-rat-fight").show();
      break;

    case "factory_petrik":
      $("#factory_petrik_1").hide();
      $("#factory_petrik_2").show();
      break;

    case "trainer_vip":
      $("#trainer_vip_1").hide();
      $("#trainer_vip_2").show();
      break;

    case "alley":
      $("#leave-patrol-button").hide();
      break;

    case "neft":
      $("#neft-attack-now").hide();
      break;

    case "petarena_train":
      petarenaTrainComplete();
      break;
    case "oilpump_neft":
      $("#oilprocesstake")
        .removeClass("disabled")
        .unbind("click")
        .click(function () {
          $(this).parent().submit();
        });
      break;
    case "oreminer_metro":
      $("#oreprocesstake")
        .removeClass("disabled")
        .unbind("click")
        .click(function () {
          $(this).parent().submit();
        });
      break;
    case "end_alley_cooldown":
      $(".need-some-rest ").hide();
      $(".no-rest").show();
      break;
  }
}

/*
 $.post($("#" + formId)[0].action, $("#" + formId).serialize(), function(status)
 {
 if (status == "1") {
 eval(onSuccess + "();");
 }
 });
 */

function openChat(room) {
  if (jQuery.browser.mobile) {
    alert("На мобильных устройствах чат недоступен!");
    return;
  } else if ($(_top.window).width() <= 1024) {
    alert(
      "Чат может быть открыт только если ширина окна браузера превышает 1024 пикселей."
    );
    return;
  }
  if (room && room.length) {
    setCookie("chat_room", room);
  }
  var chatFrame = _top.$("#chat-frame");

  if (!chatFrame.length && getCookie("chat_active") > Date.now() - 1000) {
    $.post(
      "/settings/",
      {
        chatDisable: 0,
      },
      function () {
        setCookie("chat_state", "opened");
        window.location.reload();
      }
    );
  } else if (_top.player.chatDisabled) {
    $.post(
      "/settings/",
      {
        chatDisable: 0,
      },
      function () {
        setCookie("chat_state", "opened");
        window.location.reload();
      }
    );
  } else {
    if (getCookie("chat_state") == "minimized") {
      _top.ChatUI.showChat();
    } else {
      _top.ChatUI.showChat(false);
      setCookie(
        "chat_state",
        "minimized",
        "/",
        new Date(2030, 0, 1).toUTCString()
      );
    }
  }
}
function closeChat() {
  $.post(
    "/settings/",
    {
      chatDisable: 1,
    },
    function () {
      setCookie("chat_state", "closed");
      _top.location.reload();
    }
  );
  return false;
}
//" + LANG_MAIN_67 + "
function sendForm(formId, formCheckFunction) {
  var checked;
  eval("checked = " + formCheckFunction + "();");
  if (checked) {
    $("#" + formId).submit();
  }
}

//" + LANG_MAIN_106 + "

function forumAddVoteOption() {
  $("input[name='option[]']:last").after(
    '<p><input type="text" name="option[]" /></p>'
  );
}

function forumRemoveVoteOption() {
  $("input[name='option[]']:gt(1):last").parents("p:first").remove();
}

function forumDeletePost(post, topic) {
  if (confirm(m.lang.LANG_MAIN_54) == true) {
    $.post(
      "/forum/topic/" + topic + "/",
      {
        action: "delete",
        post: post,
        topic: topic,
        ajax: 1,
      },
      function (status) {
        if (status == "1") {
          $("#post-" + post + "-li").addClass("deleted");
          $("#post-" + post + "-dellink").remove();
        } else {
          alert(m.lang.LANG_MAIN_105);
        }
      }
    );
    //postUrl("/forum/topic/" + topic + "/", {action: "delete", post: post, topic: topic}, "post");
  }
}

function forumDeleteTopic(topic, forum) {
  var result = confirm(m.lang.LANG_MAIN_37);
  if (result == true) {
    postUrl(
      "/forum/" + forum + "/",
      {
        action: "delete",
        topic: topic,
        forum: forum,
      },
      "post",
      1
    );
  }
}

function forumCloseTopic(topic) {
  postUrl(
    "/forum/topic/" + topic + "/",
    {
      action: "close",
      topic: topic,
    },
    "post",
    1
  );
}

function forumOpenTopic(topic) {
  postUrl(
    "/forum/topic/" + topic + "/",
    {
      action: "open",
      topic: topic,
    },
    "post",
    1
  );
}

function forumCloseForum(forum) {
  postUrl(
    "/forum/" + forum + "/",
    {
      action: "close",
      forum: forum,
    },
    "post",
    1
  );
}

function forumOpenForum(forum) {
  postUrl(
    "/forum/" + forum + "/",
    {
      action: "open",
      forum: forum,
    },
    "post",
    1
  );
}

function forumMoveTopic(topic, forum) {
  postUrl(
    "/forum/topic/" + topic + "/",
    {
      action: "move topic",
      topic: topic,
      forum: forum,
    },
    "post",
    1
  );
}

function forumQuote(post) {
  var text = $(post).find("td:eq(1) > span").html();
  text = text.replace(/<(\/?)(b|i|u)>/gim, "[$1$2]");
  text = text.replace(/<br\s?\/?>/gim, "");
  text = text.replace(
    /<img src=".*\/([^\.]+)\.gif" align="absmiddle"\s?\/?>/gim,
    " :$1: "
  );
  var i = 0;
  while (text.indexOf("<div ", 0) != -1 && i <= 20) {
    text = text.replace(
      /<div align="center">([^<]+)<\/div>/gim,
      "[center]$1[/center]"
    );
    text = text.replace(
      /<div align="right">([^<]+)<\/div>/gim,
      "[right]$1[/right]"
    );
    text = text.replace(
      /<div align="left">([^<]+)<\/div>/gim,
      "[left]$1[/left]"
    );
    text = text.replace(
      /<div class="quote">([^<]+)<\/div>/gim,
      "[quote]$1[/quote]"
    );
    i++;
  }
  var text =
    "[quote][b]" +
    $(post).find("td:eq(1) span.user").text() +
    "[/b] ([i]" +
    $(post).find("td:eq(1) div.date span:first").text() +
    "[/i])\r\n" +
    text +
    "[/quote]\r\n";
  emoticon(text, "posttext");
}

//" + LANG_MAIN_86 + "

function macdonaldsLeave() {
  var result = confirm(m.lang.LANG_MAIN_14);
  if (result == true) {
    postUrl(
      "/shaurburgers/",
      {
        action: "leave",
      },
      "post",
      1
    );
  }
}

/* Alley */

function alleyPatrolLeave() {
  var result = confirm(m.lang.LANG_MAIN_11);
  if (result == true) {
    postUrl(
      "/alley/",
      {
        action: "leave",
      },
      "post",
      1
    );
  }
}

function alleySovetTakeDayPrize(type) {
  postUrl(
    "/alley/sovet-take-day-prize/",
    {
      type: type,
    },
    "post",
    1
  );
}

function alleyInitCarousel(curRegion) {
  $("#regions-choose-id").val(curRegion);
  $("div.regions-choose").jCarouselLite({
    btnNext: "#region-choose-arrow-right",
    btnPrev: "#region-choose-arrow-left",
    visible: 1,
    circular: true,
    start: $(".regions-choose ul li").index(
      $(".regions-choose ul li[data-metro-id=" + curRegion + "]")
    ),
    afterEnd: function (a) {
      if ($(a).find("i.icon-locked").length) {
        $("#alley-patrol-button").addClass("disabled");
        $("#alley-patrol-button").attr("disabled", true);
      } else {
        $("#alley-patrol-button").removeClass("disabled");
        $("#alley-patrol-button").attr("disabled", false);
      }
      /* посмотреть класс иконки и оставить только цифру */
      curRegion = Number(
        $(a).find("i[class*='region']").attr("class").replace(/\D*/i, "")
      );
      $("#regions-choose-id").val(curRegion);
    },
  });
}

function alleyAttack(playerId, force, werewolf, useitems) {
  force = typeof force != "undefined" ? force : 0;
  werewolf = typeof werewolf != "undefined" ? werewolf : 0;
  useitems = typeof useitems != "undefined" ? useitems : 0;
  if (typeof player == "undefined" || player["werewolf"] != 1 || force == 1) {
    postUrl(
      "/alley/",
      {
        action: "attack",
        player: playerId,
        werewolf: werewolf,
        useitems: useitems,
      },
      "post",
      1
    );
  } else {
    $("#attack-panel").remove();
    $("body").append(
      "<div class='alert' style='display: block !important;' id='attack-panel'><div class='padding'><h2>" +
        "Напасть" +
        "</h2><div class='data'>" +
        "У Вас при себе есть маска оборотня. Вы можете воспользоваться ей и напасть анонимно, а можете сделать это открыто. Решайте сами." +
        "<br /><table><tr><td width='50%' align='center'>" +
        "<img src='/@/images/pers/" +
        player["avatar_thumb"] +
        "' /><br /><b>" +
        player["nickname"] +
        " [" +
        player["level"] +
        "]</b><br />\n\
<div class='button' onclick='alleyAttack(" +
        playerId +
        ", 1, 0);'><span class='f'><i class='rl'></i><i class='bl'></i><i class='brc'></i><div class='c'>Напасть собой</div></span></div>" +
        "</td><td width='50%' align='center'>" +
        "<img src='/@/images/pers/npc2_thumb.png' /><br /><b>" +
        m.lang.LANG_WEREWOLF +
        " [" +
        player["werewolf_level"] +
        "]</b><br />\n\
<div class='button' onclick='alleyAttack(" +
        playerId +
        ", 1, 1);'><span class='f'><i class='rl'></i><i class='bl'></i><i class='brc'></i><div class='c'>" +
        m.lang.LANG_WEREWOLF_BUTTON +
        "</div></span></div>" +
        "</td></tr></table></div></div></div>"
    );
    var p = $("#attack-panel").offset();
    $("#attack-panel").css({
      top:
        window.pageYOffset +
        Math.round(window.innerHeight / 2) -
        $("#attack-panel").height(),
    });
  }
}

/* /Alley */

//" + LANG_MAIN_121 + "

function bankUpdateRudaMoneySum(ore) {
  ore = isNaN(ore) ? 0 : Math.abs(ore);
  $("#tugriks").html(ore * 750 + "<i></i>");
}

//" + LANG_MAIN_104 + "

function phoneDeleteMessages(type) {
  if (window.confirm(m.lang.LANG_MAIN_26) == true) {
    postUrl(
      "/phone/messages/" + type + "/",
      {
        action: "delete",
      },
      "post",
      1
    );
  }
}

function phoneConfirmDeleteContact(nickname, id, type) {
  if (window.confirm(m.lang.LANG_MAIN_17 + "" + nickname + "?") == true) {
    postUrl(
      "/phone/contacts/",
      {
        action: "delete",
        id: id,
        nickname: nickname,
        type: type,
      },
      "post",
      1
    );
  }
}

function phoneDeleteLogs() {
  if (window.confirm(m.lang.LANG_MAIN_30) == true) {
    postUrl(
      "/phone/logs/",
      {
        action: "delete",
      },
      "post",
      1
    );
  }
}

function phoneComplainMessage(id) {
  if (
    window.confirm(m.lang.LANG_MAIN_3 + "\n\r" + m.lang.LANG_MAIN_6) == true
  ) {
    postUrl(
      "/phone/messages/",
      {
        action: "complain",
        id: id,
      },
      "post",
      1
    );
  }
}

//" + LANG_MAIN_111 + "

function metroWork() {
  postUrl(
    "/metro/",
    {
      action: "work",
    },
    "post",
    1
  );
}

function metroDig() {
  postUrl(
    "/metro/",
    {
      action: "dig",
    },
    "post",
    1
  );
}

function metroLeave() {
  var result = confirm(m.lang.LANG_MAIN_13);
  if (result == true) {
    postUrl(
      "/metro/",
      {
        action: "leave",
      },
      "post",
      1
    );
  }
}

function metroSearchRat(playerId) {
  postUrl(
    "/metro/search-rat/",
    {
      player: playerId,
    },
    "post",
    1
  );
}

function metroLeave2() {
  postUrl(
    "/metro/",
    {
      action: "leave",
    },
    "post",
    1
  );
}

function metroAttackRat(playerId) {
  postUrl(
    "/alley/attack-npc/1/",
    {
      player: playerId,
    },
    "post",
    1
  );
}

function elevatorToRatByHuntclubBadge() {
  postUrl(
    "/metro/elevator-to-rat/",
    {
      valuta: "huntclub_badge",
    },
    "post",
    1
  );
}

function elevatorToRatByHoney() {
  postUrl(
    "/metro/elevator-to-rat/",
    {
      valuta: "honey",
    },
    "post",
    1
  );
}

function metroTrackRat() {
  postUrl("/metro/track-rat/", {}, "post", 1);
}

function metroFightRat() {
  postUrl("/metro/fight-rat/", {}, "post", 1);
}

function metroLeaveFightRat() {
  postUrl("/metro/leave-fight-rat/", {}, "post", 1);
}
//" + LANG_MAIN_122 + "

// mo to dip int
function clanLeave() {
  var result = confirm(m.lang.LANG_MAIN_35);
  if (result == true) {
    postUrl(
      "/clan/profile/",
      {
        action: "leave",
      },
      "post",
      1
    );
  }
}

// mo to dip int
function clanAccept(player_id) {
  postUrl(
    "/clan/profile/",
    {
      action: "accept",
      player: player_id,
    },
    "post",
    1
  );
}

// mo to dip int
function clanDrop(player_id) {
  if (window.confirm(m.lang.LANG_MAIN_18)) {
    postUrl(
      "/clan/profile/",
      {
        action: "drop",
        player: player_id,
      },
      "post",
      1
    );
  }
}

// mo to dip int
function clanRefuse(player_id) {
  postUrl(
    "/clan/profile/",
    {
      action: "refuse",
      player: player_id,
    },
    "post",
    1
  );
}

// delete
function clanDissolve() {
  var result = confirm(m.lang.LANG_MAIN_8);
  if (result == true) {
    postUrl(
      "/clan/profile/",
      {
        action: "dissolve",
      },
      "post",
      1
    );
  }
}

function clanDiplomacyExt(clanId, diplomacyType) {
  switch (diplomacyType) {
    case "apply":
      confirmText = m.lang.LANG_MAIN_4;
      break;

    case "apply_cancel":
      confirmText = m.lang.LANG_MAIN_5;
      break;

    case "union_propose":
      confirmText = m.lang.LANG_MAIN_9;
      break;

    case "union_propose_cancel":
      confirmText = m.lang.LANG_MAIN_2;
      break;

    case "attack":
    case "teeth_attack":
      confirmText = m.lang.LANG_MAIN_27;
      break;

    default:
      confirmText = m.lang.LANG_MAIN_76;
      break;
  }
  if (confirm(confirmText) == true) {
    postUrl(
      "/clan/" + clanId + "/",
      {
        action: diplomacyType,
      },
      "post",
      1
    );
  }
}

function clanDiplomacyInt(diplomacyId, diplomacyType) {
  switch (diplomacyType) {
    case "canceltitle":
      confirmText = m.lang.LANG_MAIN_1;
      break;

    case "war_exit":
      confirmText = m.lang.LANG_MAIN_32;
      break;

    default:
      confirmText = m.lang.LANG_MAIN_76;
      break;
  }
  if (confirm(confirmText) == true) {
    postUrl(
      "/clan/profile/",
      {
        action: diplomacyType,
        diplomacy: diplomacyId,
      },
      "post",
      1
    );
  }
}

function clanInternalAction(action, param) {
  switch (action) {
    case "canceltitle":
      confirmText = m.lang.LANG_MAIN_23;
      url = "team/canceltitle/";
      break;

    default:
      confirmText = m.lang.LANG_MAIN_76;
      break;
  }
  if (confirm(confirmText) == true) {
    postUrl(
      "/clan/profile/" + url,
      {
        action: action,
        param: param,
      },
      "post",
      1
    );
  }
}

function clanWarehouseTake(inventoryId, itemCode) {
  $.post(
    "/clan/profile/warehouse/take/",
    {
      inventory: inventoryId,
      code: itemCode,
    },
    function (data) {
      //if (data == 1) {
      AngryAjax.goToUrl("/clan/profile/warehouse/");
      /*} else if (data == -1) {
		 showAlert('Ошибка', m.lang.LANG_MAIN_33, 1);
		 } else if (data == -2) {
		 showAlert('Ошибка', 'Этот предмет не продаётся', 1);
		 } else if (data == -3) {
		 showAlert('Ошибка', 'У вас не хватает пплюшек', 1);
		 } else if (data == -4) {
		 showAlert('Ошибка', 'Вы совсем недавно в клане и пока не можете забирать предметы со склада. Клановый склад доступен через неделю после вступления.', 1);
		 }*/
    }
  );
}

function clanWarehousePut(inventoryId, itemCode) {
  $.post(
    "/clan/profile/warehouse/put/",
    {
      inventory: inventoryId,
      code: itemCode,
    },
    function (data) {
      if (data == 1) {
        AngryAjax.goToUrl("/clan/profile/warehouse/");
      } else if (data == -1) {
        alert(m.lang.LANG_MAIN_60);
      }
    }
  );
}

function clanShowWarUserLogs(clan) {
  if (clan == 0) {
    $("#clan-warstat1-table").find("tr.user-logs").hide();
  } else {
    if (
      $("#clan-warstat1-table")
        .find("tr.user-logs[rel=clan" + clan + "] td:first")
        .is(":visible")
    ) {
      $("#clan-warstat1-table")
        .find("tr.user-logs[rel=clan" + clan + "]")
        .hide();
    } else {
      $("#clan-warstat1-table")
        .find("tr.user-logs[rel=clan" + clan + "]")
        .show();
    }
  }
}

function clanTeamCalcCost() {
  var cost = 0;
  if ($("select[name=founder]").val() != curFounderId) {
    cost += 50000;
  }
  if ($("select[name=adviser]").val() != curAdviserId) {
    cost += 5000;
  }
  if ($("select[name=money]").val() != curMoneyId) {
    cost += 5000;
  }
  if ($("select[name=forum]").val() != curForumId) {
    cost += 5000;
  }
  if ($("select[name=diplomat]").val() != curDiplomatId) {
    cost += 5000;
  }
  if ($("select[name=people]").val() != curPeopleId) {
    cost += 5000;
  }
  $("#cur-tugriks").html(formatNumber(cost, 0, ".", ",") + "<i></i>");

  if (cost > 0) {
    $("#button-price").show();
  } else {
    $("#button-price").hide();
  }
  if (cost > clanMoney || cost == 0) {
    $("#roles-submit").addClass("disabled");
    $("#roles-submit").attr("disabled", true);
    if (cost > clanMoney) {
      $("#no-money").show();
    }
  } else {
    $("#roles-submit").removeClass("disabled");
    $("#roles-submit").attr("disabled", false);
    $("#no-money").hide();
  }
}

function clanHireDetective() {
  postUrl(
    "/clan/profile/",
    {
      action: "hire_detective",
    },
    "post",
    1
  );
}

function clanTakeRest() {
  if (confirm(m.lang.LANG_CLAN_TAKEREST_CONFIRM) == true) {
    postUrl(
      "/clan/profile/",
      {
        action: "take_rest",
      },
      "post",
      1
    );
  }
}

//" + LANG_MAIN_96 + "

//" + LANG_MAIN_43 + "
function checkPresentForm() {
  if ($("#present-form-playerid").val() == "") {
    if (!$("#to-me")[0].checked) {
      player = $.trim($("#present-form-player").val());
      if (player == "") {
        $("#present-form").find("div.report").show();
        $("#present-form").find("div.error").html(m.lang.LANG_MAIN_53);
        return false;
      }
      if (
        $.ajax({
          url: "/shop/playerexists/" + encodeURIComponent(player) + "/",
          async: false,
        }).responseText == "0"
      ) {
        $("#present-form").find("div.report").show();
        $("#present-form")
          .find("div.error")
          .html(
            m.lang.LANG_MAIN_114 + "<b>" + player + "</b>" + m.lang.LANG_MAIN_82
          );
        return false;
      }
    }
  } else {
    if (
      $.ajax({
        url: "/shop/playeridexists/" + $("#present-form-playerid").val() + "/",
        async: false,
      }).responseText == "0"
    ) {
      $("#present-form").find("div.report").show();
      $("#present-form")
        .find("div.error")
        .html(
          m.lang.LANG_MAIN_114 + "<b>" + player + "</b>" + m.lang.LANG_MAIN_82
        );
      return false;
    }
  }

  var basePrice = $("#content").data("price");
  if (basePrice) {
    var money = basePrice["tugriki"] || 0,
      ore = basePrice["ruda"] || 0,
      oil = basePrice["neft"] || 0;
    if (
      money > m.player.wallet.money ||
      ore > m.player.wallet.ore ||
      oil > m.player.wallet.oil
    ) {
      $("#present-panel").hide(0);
    }
  } else {
    $("#present-panel").hide(0);
  }

  return true;
}

function checktransferForm() {
  player = $.trim($("#transfer-form-player").val());
  if (player == "") {
    $("#transfer-form").find("div.report").show();
    $("#transfer-form").find("div.error").html(m.lang.LANG_MAIN_53);
    return false;
  }
  if (
    $.ajax({
      url: "/shop/playerexists/" + encodeURIComponent(player) + "/",
      async: false,
    }).responseText == "0"
  ) {
    $("#transfer-form").find("div.report").show();
    $("#transfer-form")
      .find("div.error")
      .html(
        m.lang.LANG_MAIN_114 + "<b>" + player + "</b>" + m.lang.LANG_MAIN_82
      );
    return false;
  }
  return true;
}

//" + LANG_MAIN_39 + "
function showTransferForm(item, itemId) {
  $("#itemid").val(itemId);
  $("#transfer-form-item").text(item);
  $("#transfer-form-player").val("");
  $("#transfer-form-comment").val("");
  $("#transfer-panel").show();
  $("#transfer-panel").css(
    "top",
    $(document).scrollTop() +
      $(window).height() / 2 -
      $("#transfer-panel").height() / 2 -
      200
  );
}

function showPresentForm(key, itemId, itemName) {
  //$("#present-form")[0].action = "/shop/section/gifts/buy/" + itemId + "/";
  $("#itemid").val(itemId);
  $("#present_form_buy_key").val(key);
  $("#present-form-player").val("");
  $("#present-form-comment").val("");
  $("#present-form-private")[0].checked = false;
  $("#present-form-anonimous")[0].checked = false;
  $("#present-form-present").html(itemName);
  $("#present-form").find("div.report").hide();
  $("#present-panel").show();
  $("#present-panel").css(
    "top",
    $(document).scrollTop() +
      $(window).height() / 2 -
      $("#present-panel").height() / 2 -
      200
  );
  /* 200 = $('div.column-right').offset().top */
}

function shopBuyItem(key, item, return_url, amount, type) {
  if (!amount) amount = 1;
  if (!type) type = "normal";
  postUrl(
    "/shop/",
    {
      key: key,
      action: "buy",
      item: item,
      amount: amount,
      return_url: return_url,
      type: type,
    },
    "post",
    1
  );
  $("li.object div.actions div.button").addClass("disabled");
}

function shopSellItem(item, return_url, count) {
  postUrl(
    "/shop/",
    {
      action: "sell",
      item: item,
      return_url: return_url,
      count: count,
    },
    "post",
    1
  );
  //$('li.object div.actions div.button').addClass('disabled');
}

//" + LANG_MAIN_116 + "

function fightDuelSpecialActions(logs, interactive) {
  logs.find("div[data-action]").each(function (i) {
    switch (parseInt($(this).attr("data-action"))) {
      case 16:
        $("td.fighter2 div.pet").attr("data-noactive", 1);
      case 17:
        if (interactive) {
          $("td.fighter2 div.pet").animate(
            {
              opacity: 0.5,
            },
            500
          );
        } else {
          $("td.fighter2 div.pet").css("opacity", 0.5);
        }
        break;
    }
  });
}

function fightShowLog(element) {
  if (!element) {
    element = $(".fight-log li:hidden:last");
  }
  element.slideDown("normal");
  fightDuelSpecialActions(element, true);
  lifes = element.attr("rel").split(":");

  fighter1_life = lifes[0].split("/");
  $("#fighter1-life").html(
    intToKM(Math.max(fighter1_life[0], 0)) + "/" + intToKM(fighter1_life[1])
  );
  $("#fighter1-life")
    .parent()
    .find("div.percent")
    .animate(
      {
        width: Math.ceil((100 * fighter1_life[0]) / fighter1_life[1]) + "%",
      },
      1500
    );

  fighter2_life = lifes[1].split("/");
  $("#fighter2-life").html(
    intToKM(Math.max(fighter2_life[0], 0)) + "/" + intToKM(fighter2_life[1])
  );
  $("#fighter2-life")
    .parent()
    .find("div.percent")
    .animate(
      {
        width: Math.ceil((100 * fighter2_life[0]) / fighter2_life[1]) + "%",
      },
      1500
    );

  if (lifes[2] != "") {
    pet1_life = lifes[2].split("/");
    $("#pet0-life").html(
      intToKM(Math.max(pet1_life[0], 0)) + "/" + intToKM(pet1_life[1])
    );
    $("#pet0-life")
      .parent()
      .parent()
      .find("div.percent")
      .animate(
        {
          width: Math.ceil((100 * pet1_life[0]) / pet1_life[1]) + "%",
        },
        1500
      );
  }

  if (lifes[3] != "") {
    pet2_life = lifes[3].split("/");
    $("td.fighter2 div.pet[data-noactive!=1] #pet1-life").html(
      Math.max(intToKM(pet2_life[0], 0)) + "/" + intToKM(pet2_life[1])
    );
    $("td.fighter2 div.pet[data-noactive!=1] #pet1-life")
      .parent()
      .parent()
      .find("div.percent")
      .animate(
        {
          width: Math.ceil((100 * pet2_life[0]) / pet2_life[1]) + "%",
        },
        1500
      );
  }

  if (interactive && playerId > 0) {
    if (playerId == 1) {
      setHP(fighter1_life[0]);
    } else {
      setHP(fighter2_life[0]);
    }
  }
}

function fightTimer() {
  $("#time-left").html(timeleft);
  timeleft--;
  if (timeleft < 0) {
    var element = $(".fight-log li:hidden:last");
    timeleft = 2;
    var lifes;
    var fighter1_life, fighter2_life;
    if (1 == $(".fight-log li").index(element)) {
      timeleft = 2;
      $("#timer-block").hide();
      fightShowLog(element);
    } else if ($(".fight-log li").index(element) == -1) {
      $("#timer-block").hide();
      window.clearInterval(timer);
      $("#controls-play").addClass("disabled");
      $("#controls-forward").addClass("disabled");
    } else if ($(".fight-log li").index(element) == 0) {
      //fightShowLog(element);
      element.slideDown("normal");
      $("#timer-block").hide();
      window.clearInterval(timer);
      $("#controls-play").addClass("disabled");
      $("#controls-forward").addClass("disabled");
    } else {
      fightShowLog(element);
    }
  }
}

function fightGo() {
  if (interactive) {
    $("#controls-play").addClass("disabled");
    fightShowLog();
    timer = window.AngryAjax.setInterval("fightTimer()", 1000);
  } else {
    fightForward();
  }
}

function fightBack() {
  if ($("#controls-back").hasClass("disabled")) {
    return;
  }

  $("#timer-block").hide();
  window.clearInterval(timer);

  $(".fight-log li").hide();
  $($(".fight-log li")[$(".fight-log li").length - 1]).show();

  $("#controls-back").addClass("disabled");
  $("#controls-play").removeClass("disabled");
  $("#controls-forward").removeClass("disabled");

  lifes = $($(".fight-log > li[rel]")[$(".fight-log > li[rel]").length - 1])
    .attr("rel")
    .split(":");

  fighter1_life = lifes[0].split("/");
  $("#fighter1-life").html(
    intToKM(Math.max(fighter1_life[0], 0)) + "/" + intToKM(fighter1_life[1])
  );
  $("#fighter1-life")
    .parent()
    .find("div.percent")
    .animate(
      {
        width:
          Math.ceil((100 * Math.max(fighter1_life[0], 0)) / fighter1_life[1]) +
          "%",
      },
      1500
    );

  fighter2_life = lifes[1].split("/");
  $("#fighter2-life").html(
    intToKM(Math.max(fighter2_life[0], 0)) + "/" + intToKM(fighter2_life[1])
  );
  $("#fighter2-life")
    .parent()
    .find("div.percent")
    .animate(
      {
        width:
          Math.ceil((100 * Math.max(fighter2_life[0], 0)) / fighter2_life[1]) +
          "%",
      },
      1500
    );

  if (lifes[2] != "") {
    pet1_life = lifes[2].split("/");
    $("#pet0-life").html(
      intToKM(Math.max(pet1_life[0], 0)) + "/" + intToKM(pet1_life[1])
    );
    $("#pet0-life")
      .parent()
      .parent()
      .find("div.percent")
      .animate(
        {
          width:
            Math.ceil((100 * Math.max(pet1_life[0], 0)) / pet1_life[1]) + "%",
        },
        1500
      );
  }

  if (lifes[3] != "") {
    pet2_life = lifes[3].split("/");
    $("#pet1-life").html(
      intToKM(Math.max(pet2_life[0], 0)) + "/" + intToKM(pet2_life[1])
    );
    $("#pet1-life")
      .parent()
      .parent()
      .find("div.percent")
      .animate(
        {
          width:
            Math.ceil((100 * Math.max(pet2_life[0], 0)) / pet2_life[1]) + "%",
        },
        1500
      );
  }
  $("td.fighter1 div.pet,td.fighter2 div.pet")
    .css("opacity", 1)
    .attr("data-noactive", 0);
}

function fightPlay() {
  if ($("#controls-play").hasClass("disabled")) {
    return;
  }

  $("#controls-back").removeClass("disabled");
  $("#controls-play").addClass("disabled");
  $("#controls-forward").removeClass("disabled");

  timeleft = 2;
  fightShowLog();
  timer = window.AngryAjax.setInterval("fightTimer()", 1000);
}

function fightForward() {
  if ($("#controls-forward").hasClass("disabled")) {
    return;
  }

  $("#controls-back").removeClass("disabled");
  $("#controls-play").addClass("disabled");
  $("#controls-forward").addClass("disabled");

  fightDuelSpecialActions($(".fight-log li:hidden"), false);
  $(".fight-log li").show();
  $("#timer-block").hide();
  lifes = $(".fight-log > li[rel]").attr("rel").split(":");

  fighter1_life = lifes[0].split("/");
  $("#fighter1-life").html(
    intToKM(Math.max(fighter1_life[0], 0)) + "/" + intToKM(fighter1_life[1])
  );
  $("#fighter1-life")
    .parent()
    .find("div.percent")
    .animate(
      {
        width:
          Math.ceil((100 * Math.max(fighter1_life[0], 0)) / fighter1_life[1]) +
          "%",
      },
      1500
    );

  fighter2_life = lifes[1].split("/");
  $("#fighter2-life").html(
    intToKM(Math.max(fighter2_life[0], 0)) + "/" + intToKM(fighter2_life[1])
  );
  $("#fighter2-life")
    .parent()
    .find("div.percent")
    .animate(
      {
        width:
          Math.ceil((100 * Math.max(fighter2_life[0], 0)) / fighter2_life[1]) +
          "%",
      },
      1500
    );

  if (lifes[2] != "") {
    pet1_life = lifes[2].split("/");
    $("#pet0-life").html(
      intToKM(Math.max(pet1_life[0], 0)) + "/" + intToKM(pet1_life[1])
    );
    $("#pet0-life")
      .parent()
      .parent()
      .find("div.percent")
      .animate(
        {
          width:
            Math.ceil((100 * Math.max(pet1_life[0], 0)) / pet1_life[1]) + "%",
        },
        1500
      );
  }

  if (lifes[3] != "") {
    pet2_life = lifes[3].split("/");
    $("td.fighter2 div.pet[data-noactive!=1] #pet1-life").html(
      intToKM(Math.max(pet2_life[0], 0)) + "/" + intToKM(pet2_life[1])
    );
    $("td.fighter2 div.pet[data-noactive!=1] #pet1-life")
      .parent()
      .parent()
      .find("div.percent")
      .animate(
        {
          width:
            Math.ceil((100 * Math.max(pet2_life[0], 0)) / pet2_life[1]) + "%",
        },
        1500
      );
  }
}

//" + LANG_MAIN_70 + "

function groupFightPlayerDie(id, hp) {
  if (hp <= 0) {
    $("#fighter" + id + "-life")
      .parents("li:first")
      .addClass("dead");
  }
}

function groupFightShowLog(element) {
  return;
  if (!element) {
    element = $(".fight-log li:hidden:last");
  }
  element.slideDown("normal");
  if (element.attr("rel")) {
    var players = element.attr("rel").split(":");
    for (var i = 0; i < players.length; i++) {
      var lifes = players[i].split("/");
      var hp = lifes[1];
      var id = lifes[0];
      $("#fighter" + id + "-life").html(hp + "/" + lifes[2]);
      $("#fighter" + id + "-life")
        .parent()
        .find("span.percent")
        .animate(
          {
            width: Math.ceil((100 * hp) / lifes[2]) + "%",
          },
          1000,
          false,
          groupFightPlayerDie(id, hp)
        );
    }
  }
  element.next().find("div.text").slideToggle();
  /*" + m.lang.LANG_MAIN_41 + "*/
}

function groupFightTimer() {
  $("#time-left").html(timeleft);
  timeleft--;
  if (timeleft == -1) {
    if ($("#timerShowTimer").length > 0) {
      $("#timerShowTimer").get(0).style.display = "none";
    }
    if ($("#timerWaitForUpdate").length > 0) {
      $("#timerWaitForUpdate").get(0).style.display = "";
    }
    if ($("#fightHint").length > 0) {
      $("#fightHint").hide();
      $("#fightAction").hide();
    }
    groupFightAjaxCheck();
  } else {
    window.AngryAjax.setTimeout(groupFightTimer, 1000);
  }
}

function groupFightAjaxCheck() {
  noAjaxLoader = true;
  $.post(
    "/fight/",
    {
      checkBattleState: 1,
    },
    function (data) {
      noAjaxLoader = false;
      if (data == 1) {
        //if ($.cookie("userid") == 4158644) {
        AngryAjax.goToUrl(AngryAjax.getCurrentUrl());
        //} else {
        //	document.location.href = AngryAjax.getCurrentUrl().replace(/#/, "");
        //}
      } else {
        $("#waitdots").html(
          Array((($("#waitdots").text().length + 1) % 4) + 1).join(".")
        );
        window.AngryAjax.setTimeout(groupFightAjaxCheck, 1000);
      }
    }
  );
}

function groupFigthBindClick() {
  $("#fightGroupForm")
    .find("input[name^=target]")
    .bind("click", function () {
      this.disabled = false;

      if ($(this).parents("li:first").hasClass("dead")) {
        return false;
      }
      if (this.id.indexOf("checkbox-attack") >= 0) {
        if (this.checked) {
          $(this).parents("label:first").addClass("selected");
        } else {
          $(this).parents("label:first").removeClass("selected");
        }
      } else if (this.id.indexOf("super-attack") >= 0) {
        //пока ничего
      } else if (this.id.indexOf("attack") >= 0) {
        $("#fightGroupForm").find("label").removeClass("selected");
        var username = $(this).parents("li:first").find("span.user").text();
        //" + m.lang.LANG_MAIN_77 + "
        $(this).parents("label:first").addClass("selected");
        if ($(this).attr("name") === "target") {
          $("#fight-button-text").html(m.lang.LANG_MAIN_78 + "" + username);
          $("#actionfield").val("attack");
        }
      } else if (this.id.indexOf("defence") >= 0) {
        $("#fightGroupForm").find("label").removeClass("selected");
        var username = $(this).parents("li:first").find("span.user").text();
        //" + m.lang.LANG_MAIN_77 + "
        $(this).parents("label:first").addClass("selected");
        if ($(this).attr("name") === "target") {
          $("#actionfield").val("defence");
          $("#fight-button-text").html(m.lang.LANG_MAIN_83 + "" + username);
        }
      } else if (
        this.id.indexOf("useabl") >= 0 &&
        $(this)
          .parents(".superhit-wrapper:first")
          .find(".superhit")
          .not(".superhit-empty")
      ) {
        $("#fightGroupForm").find(".superhit").removeClass("superhit-checked");
        $("#fightGroupForm").find("label").removeClass("selected");
        var itemname = $(this).attr("rel");
        //" + m.lang.LANG_MAIN_45 + "

        if (typeof fightType != "undefined" && fightType == "quadrocopter") {
          $(".fight-slots-actions").addClass(function () {
            setTimeout(function () {
              $(".fight-slots-actions").removeClass("blink");
            }, 1500);
            return "blink";
          });
        }
        var price = "";
        if (
          typeof copterFightPrices != "undefined" &&
          typeof copterFightPrices[$(this).val()] != "undefined"
        ) {
          price +=
            " " +
            '<span class="tonus"><i class="tonus-icon-small"></i><b>' +
            copterFightPrices[$(this).val()] +
            "</b></span>";
        }
        $("#fight-button-text").html(itemname + price);
        $(this)
          .parents(".superhit-wrapper:first")
          .find(".superhit")
          .addClass("superhit-checked");
        $("#actionfield").val("useabl");
      } else if (
        this.id.indexOf("useabl") >= 0 &&
        $(this).parents("li:first").hasClass("filled")
      ) {
        $("#fightGroupForm").find(".superhit").removeClass("superhit-checked");
        $("#fightGroupForm").find("label").removeClass("selected");
        var itemname = $(this).attr("rel");
        //" + m.lang.LANG_MAIN_45 + "
        $("#fight-button-text").html(m.lang.LANG_MAIN_69 + "" + itemname);
        $(this).parents("label:first").addClass("selected");
        $("#actionfield").val("useabl");
      } else if (
        this.id.indexOf("use") >= 0 &&
        $(this).parents("li:first").hasClass("filled")
      ) {
        $("#fightGroupForm").find(".superhit").removeClass("superhit-checked");
        $("#fightGroupForm").find("label").removeClass("selected");
        var itemname = $(this).attr("rel");
        //" + m.lang.LANG_MAIN_45 + "
        $("#fight-button-text").html(m.lang.LANG_MAIN_69 + "" + itemname);
        $(this).parents("label:first").addClass("selected");
        $("#actionfield").val("useitem");
      }
    });

  /* ie label bug fix */
  $("#fightGroupForm")
    .find("li.filled")
    .bind("click", function () {
      if ($.browser.msie) {
        $(this).find("input")[0].click();
      }
    });
}

function groupFightInitHP() {
  $(".fighter_hp").each(function () {
    var t = $(this).text().split("/");
    t[0] = intToKM(parseInt(t[0]));
    t[1] = intToKM(parseInt(t[1]));
    $(this).html(t[0] + "/" + t[1]);
  });
}

function groupFightMakeStep() {
  $("button[type=submit]").addClass("disabled").attr("disabled", "disabled");
  $("button[type=submit]").parents("div.center:first").find("div.hint").hide();
  //$.post("/fight/", {action: $('#actionfield').val(), item: $("input:radio[name=item]:checked").val(), target: $("input:radio[name=target]:checked").val(), json: 1}, function(data) {
  //});
  var actionVal = $("#actionfield").val();
  var postData = {
    action: actionVal,
    item: $("input:radio[name=item]:checked").val(),
    json: 1,
  };

  if (actionVal === "usesuper") {
    postData.target = $("input:radio[name=superhit]:checked").val();
    var targets = [];
    $('input[name="targets[]"]:checked').each(function () {
      targets.push($(this).val());
    });
    postData["targets[]"] = targets;
  } else if (
    actionVal === "useabl" &&
    $('input[name="targets[]"]:checked').length > 0
  ) {
    postData.target = $("input:radio[name=target]:checked").val();
    var targets = [];
    $('input[name="targets[]"]:checked').each(function () {
      targets.push($(this).val());
    });
    postData["targets[]"] = targets;
  } else {
    postData.target = $("input:radio[name=target]:checked").val();
  }
  postUrl("/fight/", postData, "post", function (data) {
    if (data.refresh) {
      AngryAjax.goToUrl(AngryAjax.getCurrentUrl());
    } else if (!data.standard_ajax) {
      $("button[type=submit]").hide();
      $("div.waiting").show();
    }
  });
}

function groupFightChangePet() {
  $.post(
    "/fight/",
    {
      action: "cage_pet",
      json: 1,
    },
    function (data) {
      $("#cage").html("<i>питомец сменится в следующем ходу</i>");
    }
  );
}

function groupFightExit() {
  $("button[type=submit]").addClass("disabled").attr("disabled", "disabled");
  $.post(
    "/fight/",
    {
      action: "exit",
      key: exitkey,
    },
    function (data) {
      if (data == 1) {
        $("button[type=submit]")
          .attr("disabled", false)
          .removeClass("disabled");
        ChatMini.close();
        AngryAjax.goToUrl("/player/");
      }
    }
  );
}

function groupFightRupor() {
  if (typeof $("#rupor").val() != "undefined") {
    $("#rupor-div").find("button").addClass("disabled");
    $.post(
      "/fight/",
      {
        action: "rupor",
        rupor: $("#rupor").val(),
        json: 1,
      },
      function (data) {
        $("#rupor-div").html("<i>— " + $("#rupor").val() + "</i>");
      }
    );
  }
}
function groupFightTurret() {
  $("#turret-div").find("button").addClass("disabled");
  $.post(
    "/fight/",
    {
      action: "turret",
      json: 1,
    },
    function (data) {
      //$("#rupor-div").html("<i>— " + data.val() + "</i>");
    }
  );
}

function groupFightForceJoin(fightId) {
  postUrl(
    "/fight/",
    {
      action: "join fight",
      fight: fightId,
      force_join: 1,
    },
    "post",
    1
  );
}

function groupFightTryRedirect() {
  $.get(
    "/player/ajax/state/" + offset + "/",
    {},
    function (data) {
      if (data.state == "fight" && !isNaN(data.stateparam)) {
        AngryAjax.goToUrl("/fight/" + data.stateparam + "/");
      }
    },
    "json"
  );
  AngryAjax.setTimeout("groupFightTryRedirect()", 10000);
}

function groupFightRuporNoenter(event) {
  if ($.browser.msie) {
    if (window.event && window.event.keyCode == 13) {
      groupFightRupor();
      return false;
    }
  } else if (event && event.which == 13) {
    groupFightRupor();
    return false;
  }
}

var groupFightHitTgtLimit = 0;

function groupFightOnEventCheckbox(evt) {
  if (
    $(".checkbox-attack:checked,.checkbox-attack:checked").length >
    groupFightHitTgtLimit
  ) {
    this.checked = false;
    showAlert(
      "Упс :(",
      "Вы не можете выбрать больше " +
        groupFightHitTgtLimit +
        " целей для атаки!"
    );
  }
}

function groupFightSwitchHitPrepare(obj) {
  $("#fightGroupForm").find("label").removeClass("selected");
  $("#fightGroupForm").find("input[name=target]").removeAttr("checked");
  $(".superhits-menu")
    .find(".superhit-checked")
    .removeClass("superhit-checked");
  $(obj).parents("label").find(".superhit").addClass("superhit-checked");
}
function groupFightSwitchHit(tgt, tgtNum, hitName, slotId) {
  var radioAttack = $(".radio-attack");
  var radioDefend = $(".radio-defend");
  var replaceLabelFunc = function (i, val) {
    var prefix = "";
    if (tgtNum > 1) {
      prefix = "checkbox-";
    }
    if (typeof val != "undefined") {
      return prefix + val.replace("checkbox-", "");
    }
  };

  if (tgt === 0) {
    radioAttack
      .attr("checked", null)
      .attr("disabled", null)
      .attr("name", "target")
      .show();
    radioDefend
      .attr("checked", null)
      .attr("disabled", null)
      .attr("name", "target")
      .show();
    $(".checkbox-attack").attr("checked", null).hide();
    $(".checkbox-defend").attr("checked", null).hide();

    radioAttack
      .parents("label")
      .removeClass("selected")
      .attr("for", replaceLabelFunc);
    radioDefend
      .parents("label")
      .removeClass("selected")
      .attr("for", replaceLabelFunc);

    $("#fight-button-text").html(m.lang.LANG_MAIN_78 + LANG_BUNKER_1);

    $("#actionfield").val("attack");
  } else if (tgt === -2) {
    console.log("абилка выбор целей", tgtNum);
    $("#fight-button-text").html("«" + hitName + "»");
    $("#actionfield").val("useabl");
    if (tgtNum < 1) {
      radioAttack.attr("checked", null).attr("disabled", "disabled").show();
      radioDefend.attr("checked", null).attr("disabled", "disabled").show();
      $(".checkbox-attack").attr("checked", null).hide();
      $(".checkbox-defend").attr("checked", null).hide();
      radioAttack
        .parents("label")
        .removeClass("selected")
        .attr("for", replaceLabelFunc);
      radioDefend
        .parents("label")
        .removeClass("selected")
        .attr("for", replaceLabelFunc);
    } else if (tgtNum === 1) {
      radioAttack
        .attr("checked", null)
        .attr("disabled", null)
        .attr("name", "targets[]")
        .show();
      radioDefend.attr("checked", null).attr("disabled", "disabled").show();
      $(".checkbox-attack").attr("checked", null).hide();
      $(".checkbox-defend").attr("checked", null).hide();

      radioAttack
        .parents("label")
        .removeClass("selected")
        .attr("for", replaceLabelFunc);
      radioDefend
        .parents("label")
        .removeClass("selected")
        .attr("for", replaceLabelFunc);
    } else {
      radioAttack.attr("checked", null).hide();
      radioDefend.attr("checked", null).hide();
      $(".checkbox-attack").attr("checked", null).show();
      $(".checkbox-defend").attr("checked", null).hide();
      radioAttack
        .parents("label")
        .removeClass("selected")
        .attr("for", replaceLabelFunc);
      radioDefend
        .parents("label")
        .removeClass("selected")
        .attr("for", replaceLabelFunc);
    }
  } else if (tgt === -1) {
    $("#fight-button-text").html("Суперудар «" + hitName + "»");
    $("#actionfield").val("usesuper");
    if (tgtNum < 1) {
      radioAttack.attr("checked", null).attr("disabled", "disabled").show();
      radioDefend.attr("checked", null).attr("disabled", "disabled").show();
      $(".checkbox-attack").attr("checked", null).hide();
      $(".checkbox-defend").attr("checked", null).hide();

      radioAttack
        .parents("label")
        .removeClass("selected")
        .attr("for", replaceLabelFunc);
      radioDefend
        .parents("label")
        .removeClass("selected")
        .attr("for", replaceLabelFunc);
    } else if (tgtNum === 1) {
      radioAttack
        .attr("checked", null)
        .attr("disabled", null)
        .attr("name", "targets[]")
        .show();
      radioDefend.attr("checked", null).attr("disabled", "disabled").show();
      $(".checkbox-attack").attr("checked", null).hide();
      $(".checkbox-defend").attr("checked", null).hide();

      radioAttack
        .parents("label")
        .removeClass("selected")
        .attr("for", replaceLabelFunc);
      radioDefend
        .parents("label")
        .removeClass("selected")
        .attr("for", replaceLabelFunc);
    } else {
      radioAttack.attr("checked", null).hide();
      radioDefend.attr("checked", null).hide();
      $(".checkbox-attack").attr("checked", null).show();
      $(".checkbox-defend").attr("checked", null).hide();

      radioAttack
        .parents("label")
        .removeClass("selected")
        .attr("for", replaceLabelFunc);
      radioDefend
        .parents("label")
        .removeClass("selected")
        .attr("for", replaceLabelFunc);
    }
  } else {
    $("#fight-button-text").html("Суперудар «" + hitName + "»");
    $("#actionfield").val("usesuper");
    if (tgtNum < 1) {
      radioAttack.attr("checked", null).attr("disabled", "disabled").show();
      radioDefend.attr("checked", null).attr("disabled", "disabled").show();
      $(".checkbox-attack").attr("checked", null).hide();
      $(".checkbox-defend").attr("checked", null).hide();

      radioAttack
        .parents("label")
        .removeClass("selected")
        .attr("for", replaceLabelFunc);
      radioDefend
        .parents("label")
        .removeClass("selected")
        .attr("for", replaceLabelFunc);
    } else if (tgtNum === 1) {
      radioAttack.attr("checked", null).attr("disabled", "disabled").show();
      radioDefend
        .attr("checked", null)
        .attr("disabled", null)
        .attr("name", "targets[]")
        .show();
      $(".checkbox-attack").attr("checked", null).hide();
      $(".checkbox-defend").attr("checked", null).hide();

      radioAttack
        .parents("label")
        .removeClass("selected")
        .attr("for", replaceLabelFunc);
      radioDefend
        .parents("label")
        .removeClass("selected")
        .attr("for", replaceLabelFunc);
    } else {
      radioAttack.attr("checked", null).hide();
      radioDefend.attr("checked", null).hide();
      $(".checkbox-attack").attr("checked", null).hide();
      $(".checkbox-defend").attr("checked", null).show();

      radioAttack
        .parents("label")
        .removeClass("selected")
        .attr("for", replaceLabelFunc);
      radioDefend
        .parents("label")
        .removeClass("selected")
        .attr("for", replaceLabelFunc);
    }
  }

  if (
    fightType == "quadrocopter" &&
    typeof copterFightPrices != "undefined" &&
    typeof copterFightPrices[slotId] != "undefined"
  ) {
    var price = copterFightPrices[slotId];
    $("#fight-button-text").html(
      hitName +
        ' — <span class="tonus">' +
        price +
        '<i class="tonus-icon-small"></i></span>'
    );
  }

  if (fightType == "quadrocopter" && typeof copterFightPrices != "undefined") {
    $(".fight-slots-actions").addClass(function () {
      setTimeout(function () {
        $(".fight-slots-actions").removeClass("blink");
      }, 1500);
      return "blink";
    });

    var $fighters = "";
    if (tgt == 0 && tgtNum == 0) {
      $fighters = $(".group.group-right").find(".list-users > li");
    } else if (slotId == 1 || slotId == 10) {
      $fighters = $(".group.group-left").find(".list-users > li").not(".me");
    } else if (slotId == 2 || slotId == 3 || slotId == 4) {
      $fighters = $(".group.group-left").find(".list-users > li.me");
    } else if (tgt == 1) {
      $fighters = $(".group.group-left").find(".list-users > li");
    } else if (tgt == -1) {
      $fighters = $(".group.group-right").find(".list-users > li");
    } else if (tgt == 0) {
      $fighters = $(".group.group-left").find(".list-users > li.me");
    }

    if ($fighters.length > 0) {
      $fighters.addClass(function () {
        setTimeout(function () {
          $fighters.removeClass("blink");
        }, 600);
        return "blink";
      });
    }
  }

  groupFightHitTgtLimit = tgtNum;
  if (tgtNum >= 1) {
    $(".checkbox-attack,.checkbox-attack").on(
      "change",
      groupFightOnEventCheckbox
    );
  } else {
    $(".checkbox-attack,.checkbox-attack").off(
      "change",
      groupFightOnEventCheckbox
    );
  }
}

$.fn.isOnScreen = function () {
  var win = $(window);

  var viewport = {
    top: win.scrollTop(),
    left: win.scrollLeft(),
  };
  viewport.right = viewport.left + win.width();
  viewport.bottom = viewport.top + win.height();

  var bounds = this.offset();
  bounds.right = bounds.left + this.outerWidth();
  bounds.bottom = bounds.top + this.outerHeight();

  return !(
    viewport.right < bounds.left ||
    viewport.left > bounds.right ||
    viewport.bottom < bounds.top ||
    viewport.top > bounds.bottom
  );
};

function groupfightInitGrumpyHits() {
  $(window)
    .unbind("scroll.grumpy")
    .bind("scroll.grumpy", function () {
      console.log("scroll grumpy");
      groupfightShowGrumpyHits();
    });

  groupfightShowGrumpyHits();
}

function groupfightShowGrumpyHits() {
  var $damagedPlayers = $(".grumpy-damaged");

  if ($damagedPlayers.length <= 0) {
    $(window).unbind("scroll.grumpy");
  }

  $damagedPlayers.each(function () {
    if ($(this).isOnScreen()) {
      groupfightAddGrumpyHit($(this));
    }
  });
}

function groupfightAddGrumpyHit($parentObj) {
  var html = "";
  html += '<div class="fight-hit-grumpy">';
  html += '<i class="fight-hit-grumpy__light"></i>';
  html += '<i class="fight-hit-grumpy__paw"></i>';
  html += '<i class="fight-hit-grumpy__sprite i-1"></i>';
  html += '<i class="fight-hit-grumpy__sprite i-2"></i>';
  html += '<i class="fight-hit-grumpy__sprite i-3"></i>';
  html += "</div>";

  var $obj = $(html);

  $parentObj.find(".fight-hit-grumpy").remove();
  $parentObj.append($obj);
  $parentObj.removeClass("grumpy-damaged");

  var $light = $obj.find(".fight-hit-grumpy__light");
  var $paw = $obj.find(".fight-hit-grumpy__paw");
  var $hit1 = $obj.find(".fight-hit-grumpy__sprite.i-1");
  var $hit2 = $obj.find(".fight-hit-grumpy__sprite.i-2");
  var $hit3 = $obj.find(".fight-hit-grumpy__sprite.i-3");

  // light
  TweenLite.set($light, {
    opacity: 0,
    scale: 0,
  });
  TweenLite.to($light, 0.3, {
    opacity: 1,
    scale: 1,
    ease: Back.easeOut.config(1.4),
    onComplete: function () {
      TweenLite.to($light, 1.5, {
        opacity: 0,
        scale: 0,
        ease: Back.easeOut.config(1.4),
        onComplete: function () {
          // $obj.remove();
          TweenLite.set($paw, {
            left: "100%",
            top: 0,
            margin: "-12px 0 0 -24px",
            scale: 0,
            opacity: 0,
          });
          TweenLite.to($paw, 0.2, {
            opacity: 1,
            scale: 0.5,
            ease: Back.easeOut.config(1.4),
          });
        },
      });
    },
  });

  // paw
  TweenLite.set($paw, {
    opacity: 0,
    scale: 0,
  });
  TweenLite.to($paw, 0.4, {
    opacity: 1,
    scale: 1,
    ease: Back.easeOut.config(1.4),
    onComplete: function () {
      TweenLite.to($paw, 0.4, {
        opacity: 0,
        scale: 0,
        ease: Linear.easeNone,
      });
    },
  });

  var hits = random(1, 3);

  // hit 1
  // TweenLite.set($hit1, { rotation: '-45deg', left: ((hits == 1) ? random(10, 90) : random(10, 35)) + '%' });
  TweenLite.set($hit1, {
    rotation: "-" + random(10, 55) + "deg",
    left: (hits == 1 ? random(10, 90) : random(10, 35)) + "%",
  });
  TweenLite.to($hit1, 0.4, {
    delay: 0.3,
    backgroundPosition: "-180px 0",
    ease: SteppedEase.config(9),
    onComplete: function () {
      TweenLite.to($hit1, 0.5, {
        opacity: "0",
        ease: Linear.easeNone,
      });
    },
  });
  // hit 2
  if (hits < 2) {
    TweenLite.set($hit2, {
      display: "none",
    });
  } else {
    // TweenLite.set($hit2, { rotation: '-135deg', left: ((hits == 2) ? random(50, 90) : random(40, 60)) + '%' });
    TweenLite.set($hit2, {
      rotation: "-" + random(80, -145) + "deg",
      left: (hits == 2 ? random(50, 90) : random(40, 60)) + "%",
    });
    TweenLite.to($hit2, 0.4, {
      delay: 0.5,
      backgroundPosition: "-180px 0",
      ease: SteppedEase.config(9),
      onComplete: function () {
        TweenLite.to($hit2, 0.5, {
          opacity: "0",
          ease: Linear.easeNone,
        });
      },
    });
  }
  // hit 3
  if (hits < 3) {
    TweenLite.set($hit3, {
      display: "none",
    });
  } else {
    // TweenLite.set($hit3, { rotation: '-45deg', left: random(65, 90) + '%' });
    TweenLite.set($hit3, {
      rotation: "-" + random(10, 55) + "deg",
      left: random(65, 90) + "%",
    });
    TweenLite.to($hit3, 0.4, {
      delay: 0.7,
      backgroundPosition: "-180px 0",
      ease: SteppedEase.config(9),
      onComplete: function () {
        TweenLite.to($hit3, 0.5, {
          opacity: "0",
          ease: Linear.easeNone,
        });
      },
    });
  }
}

//" + LANG_MAIN_80 + "

/*" + LANG_MAIN_19 + "*/
function photoModerate(photo, action) {
  if (action == "---") {
    return;
  }
  var reason = "";
  if (action != "accept" && action != "accept_check") {
    reason = action;
    action = "cancel";
    if (reason == m.lang.LANG_MAIN_115) {
      reason = prompt(m.lang.LANG_MAIN_62);
      if (reason == null || reason == "") {
        alert(m.lang.LANG_MAIN_47);
        return;
      }
    } else if (reason == m.lang.LANG_MAIN_136) {
      reason = m.lang.LANG_MAIN_137;
    }
  }
  $.post(
    "/photos/",
    {
      action: action,
      photo: photo,
      reason: reason,
    },
    function () {
      $("#photo" + photo).remove();
      if (!$("ul.photos-moderate-list li").length) {
        AngryAjax.reload();
      }
    }
  );
}

function photoAction(photo) {
  var action = $("#photoAction").find("option:selected").val();
  if (action == "---") {
    return;
  }
  var reason = "";
  if (action == "cancel") {
    reason = $("#photoAction").find("option:selected").text();

    if (reason == m.lang.LANG_MAIN_115) {
      reason = prompt(m.lang.LANG_MAIN_62);
      if (reason == null || reason == "") {
        alert(m.lang.LANG_MAIN_47);
        return;
      }
    } else if (reason == m.lang.LANG_MAIN_136) {
      reason = m.lang.LANG_MAIN_137;
    }
  }
  postUrl(
    "/photos/",
    {
      action: action,
      photo: photo,
      reason: reason,
    },
    "post",
    1
  );
}

function photoRate(photo, value, type) {
  postUrl(
    "/photos/",
    {
      action: "rate",
      photo: photo,
      value: value,
      type: type,
    },
    "post",
    1
  );
}

function photoDelete(photo) {
  if (confirm(m.lang.LANG_MAIN_29) == true) {
    postUrl(
      "/photos/",
      {
        action: "delete",
        photo: photo,
      },
      "post",
      1
    );
  }
}

function photoAccept(photo) {
  postUrl(
    "/photos/",
    {
      action: "accept",
      photo: photo,
    },
    "post",
    1
  );
}

function photoCancel(photo) {
  postUrl(
    "/photos/",
    {
      action: "cancel",
      photo: photo,
    },
    "post",
    1
  );
}

function photoSetInProfile(photo) {
  postUrl(
    "/photos/",
    {
      action: "set in profile",
      photo: photo,
    },
    "post",
    1
  );
}

function photoShow(key) {
  var toShow = null;
  if (key == "next") {
    key = photoCurrent + 1;
  } else if (key == "prev") {
    key = photoCurrent - 1;
  }
  if (photos[key]) {
    toShow = photos[key];
    if (photoCurrent != key) {
      //document.location.hash = toShow['id'];
      AngryAjax.setCurrentUrl(
        "/photos/" + photos[key].player + "/" + photos[key].id + "/"
      );
    }
    photoCurrent = key;
  }
  if (toShow != null) {
    $("#imgRating").html(toShow["rating"]);
    $("#imgVotes").html(toShow["amount"]);
    $("#img").attr("src", toShow["src"]);
    $("#img").attr("rel", toShow["id"]);

    $("#img_orig").attr("href", toShow["src_orig"]);
    $("#ten-id").val(toShow["id"]);
    $("#pers-photos-thumbs").find("a").removeClass("current");
    $("#pers-photos-thumbs")
      .find("a img[rel=" + toShow["id"] + "]")
      .parents("a:first")
      .addClass("current");
    if (photos[key - 1]) {
      $("div.photo-vote a.previous").show();
    } else {
      $("div.photo-vote a.previous").hide();
    }
    if (photos[key + 1]) {
      $("div.photo-vote a.next").show();
    } else {
      $("div.photo-vote a.next").hide();
    }
    if (toShow["for_contest"] > 0) {
      $("#photoInContest").show();
      $("#photoInContest")
        .find("a")
        .attr("href", "/photos/contest/" + toShow["for_contest"] + "/");
    } else {
      $("#photoInContest").hide();
    }
    if (toShow["status"] == "new") {
      $("#newPhoto").show();
    } else {
      $("#newPhoto").hide();
    }
    if (toShow["status"] == "canceled") {
      $("#photoCanceled").show();
    } else {
      $("#photoCanceled").hide();
    }
    if (toShow["in_profile"] == 1) {
      $("#photoInProfile").show();
    } else {
      $("#photoInProfile").hide();
    }
    if (toShow["for_check"] == 1) {
      $("#showInProfileLink").hide();
      $("#checkPhotoAccepted").show();
    } else {
      $("#showInProfileLink").show();
      $("#checkPhotoAccepted").hide();
    }
    if (toShow["for_check"] == 1 && toShow["status"] == "check_accepted") {
      $("#deletePhotoLink").hide();
    } else {
      $("#deletePhotoLink").show();
    }
    $("h3[rel=playerlink]").html(renderPlayerlink(toShow));
    $("#linkToThisPage").val(
      $("#linkToThisPage")
        .val()
        .replace(/[0-9]+\/$/, toShow["id"] + "/")
    );
    $("#linkToThisPage").val(
      $("#linkToThisPage")
        .val()
        .replace(/[0-9]+$/, toShow["id"])
    );
    photoCreateSocialButtons($("#linkToThisPage").val(), toShow["src"]);
  } else {
    $(".social-votes").hide();
  }
  return false;
}

function photoCreateSocialButtons(url, image) {
  var html =
    '\
	<!-- VK -->\
	<div style="float: left; width: 100px;">\
	<div id="vk_like"></div>\
	<script type="text/javascript">\
	VK.Widgets.Like("vk_like", {type: "mini", pageUrl: "' +
    url +
    '", pageImage : "' +
    image +
    '", height: 20 });\
	</script>\
	</div>\
	<!-- /VK -->\
\
	<!-- Mail/OK -->\
	<div style="float: left; width: 140px;">\
	<a target="_blank" class="mrc__plugin_uber_like_button" href="http://connect.mail.ru/share?url=' +
    encodeURIComponent(url) +
    "&imageurl=" +
    encodeURIComponent(image) +
    "\" data-mrc-config=\"{'nt' : '1', 'cm' : '1', 'ck' : '3', 'sz' : '20', 'st' : '3', 'tp' : 'combo'}\">\
		" +
    "Нравится" +
    '\
	</a>\
	<script src="http://cdn.connect.mail.ru/js/loader.js" type="text/javascript" charset="UTF-8"></script>\
	</div>\
	<!-- /Mail/OK -->\
\
	<!-- Facebook -->\
	<div style="float: left; width: 140px;">\
	<div class="fb-like" data-href="' +
    url +
    '" data-send="false" data-layout="button_count" data-width="140" data-show-faces="true"></div>\
	<script> try{ FB.XFBML.parse(); }catch(ex){}</script>\
	<div>\
	<!-- /Facebook -->\
	';
  $(".social-votes").show();
  $(".social-votes-buttons").html(html);
}

function renderPlayerlink(player) {
  var ret = '<span class="user">';
  var id;
  if (player["player_id"]) {
    id = player["player_id"];
  } else {
    id = player["id"];
  }
  if (player["fraction"] == "resident") {
    ret += '<i class="resident" title="' + m.lang.LANG_REGISTER_8 + '"></i>';
  } else {
    ret += '<i class="arrived" title="' + m.lang.LANG_REGISTER_6 + '"></i>';
  }
  if (player["clan"] > 0) {
    ret +=
      '<a href="/clan/' +
      player["clan"] +
      '/"><img src="/@images/clan/clan_' +
      player["clan"] +
      '_ico.png" class="clan-icon" title="' +
      player["clan_name"] +
      '"></a>';
  }
  ret +=
    '<a href="/player/' +
    id +
    '/">' +
    player["nickname"] +
    '</a><span class="level">[' +
    player["level"] +
    "]</span>";
  return ret;
}
function photoGetNumberById(id) {
  for (var i = 0; i < photos.length; i++) {
    if (photos[i]["id"] == id) {
      return i;
    }
  }
  return false;
}

//" + LANG_MAIN_90 + "

function playerSellPet(id) {
  var result = confirm(m.lang.LANG_MAIN_31);
  if (result == true) {
    postUrl("/shop/section/zoo/sell/" + id + "/", {}, "get");
  }
}

/* Слоты для группового боя и суперудары */
function playerShowInventory(type, fromLoad) {
  $("td.equipment-cell dd > div[rel!='" + type + "']").hide();
  $("td.equipment-cell dd > div[rel='" + type + "']").show();
  if (type == "normal" || type == "inventory") {
    $("#slots-groupfight-place").hide(0);
    $("#slots-superhits-place").hide(0);
    $("td.equipment-cell dd > div[htab='inventory']").show();
    $("td.equipment-cell dd > .hint[rel='inventory']").show();
  } else if (type == "superhits") {
    if (!fromLoad) {
      playerRedrawSuperhitSlots();
    }
    $("#slots-superhits-place").show(0);
    $("#slots-groupfight-place").hide(0);
  } else {
    $("#slots-groupfight-place").show(0);
    $("#slots-superhits-place").hide(0);
  }
}
function playerShowInventorySubmenu(type) {
  if (
    type == "job" &&
    parseInt($(".object-thumbs[htab=job] .empty").length) +
      parseInt($(".object-thumbs[htab=" + type + "] .object-thumb").length) ==
      0
  ) {
    $.get(
      "/player/loadjobinventory/",
      function (data) {
        $(".object-thumbs[htab=job][rel=inventory]").append(data["html"]);
        //simple_tooltip({s:$(tabCont).find("*[tooltip=1]"), context:''}, "tooltip_htab_job", true);
      },
      "json"
    );
  }

  $(".object-thumbs[rel=inventory]").hide();
  $(".object-thumbs[htab=" + type + "]").show();
}

var shSlotsNum = 3;

function playerRedrawSuperhitSlots() {
  if (shSlotsNum != "undefined") {
    var slotsNum = shSlotsNum;
  } else {
    var slotsNum = 3;
  }

  var emptySlot =
    '<div class="object-thumb empty"><div class="padding" title="Пустая визитница"></div></div>';
  var filledSlots = 0;
  var shSlotContainer = $("#superhit-slots-container");
  shSlotContainer.find(".empty").remove();
  if (m.superhitSlotItems) {
    for (var itemId in m.superhitSlotItems) {
      if (m.superhitSlotItems[itemId].unlocked == 1) {
        ++filledSlots;
        shSlotContainer.append(
          $(m.superhitSlotItems[itemId].obj[0]).parent().parent()
        );
      } else {
        $(m.superhitSlotItems[itemId].obj[0])
          .parent()
          .parent()
          .prependTo("#superhit-inventory-container");
      }
    }
  }
  for (var i = 0; i < slotsNum - filledSlots; i++) {
    shSlotContainer.append(emptySlot);
  }
  if (shSlotTimers != "undefined" && shSlotTimers.length > 0) {
    shSlotTimers.forEach(function (value) {
      shSlotContainer.append(
        '<div class="object-thumb empty"><div class="padding" title="Пустая визитница"><span class="time" timer="' +
          value +
          '">00:00:00</span></div></div>'
      );
    });
    initTimers();
  }
}

/* Возможность увеличить набитый инвентарь */
var inventaryExpand = {
  expandButton: {},
  containers: function () {
    return $("table.inventary div.object-thumbs");
  },
  startheight: 0,
  maxheight: function () {
    var n = 0;
    inventaryExpand.containers().each(function (i) {
      n = Math.max(n, this.scrollHeight - 4);
    });
    //if(n > 2000) { n = 2000; }
    return n;
  },
  init: function () {
    inventaryExpand.expandButton = $("#inventary-expand").find("i");
    inventaryExpand.startheight =
      $("table.inventary div.object-thumbs")[0].offsetHeight - 4 || 270;
    // взяли первый попавшийся, т.к. они одинаковые. 4px - это паддинг

    // показываем кнопку
    if (inventaryExpand.maxheight() > inventaryExpand.startheight) {
      inventaryExpand.expandButton.bind("click", inventaryExpand.toggle);
      $("#inventary-expand").show();
    }
  },
  toggle: function () {
    if (inventaryExpand.expandButton.hasClass("collapse")) {
      inventaryExpand.containers().each(function (i) {
        $(this).css("height", inventaryExpand.startheight);
      });
      inventaryExpand.expandButton.removeClass("collapse");
    } else {
      inventaryExpand.containers().each(function (i) {
        $(this).css("height", inventaryExpand.maxheight());
      });
      inventaryExpand.expandButton.addClass("collapse");
    }
  },
};

function playerFightItemSwitch(itemId, unlocked, previousItemId) {
  postUrl(
    "/player/item-special/switch-weapon-group/",
    {
      unlocked: unlocked,
      inventory: itemId,
      previousItemId: previousItemId,
      return_url: "/player/#fightitems",
    },
    "post"
  );
}

// покупка слота для предметов в групповом бое
function playerBuyGfSlot(slot) {
  var params = {
    __title: "Покупка слота",
  };
  var text;
  if (slot == 6) {
    text =
      "Дополнительный слот для групповых боев стоит <span class='ruda'>199<i></i></span> / <span class='med'>49<i></i></span> за 2 недели. Купить?";
  } else {
    text =
      "Дополнительный слот для групповых боев стоит <span class='ruda'>99<i></i></span> за 2 недели. Купить?";
  }

  var buttons = [
    {
      title: "Купить",
      callback: playerDoBuyGfSlot,
    },
  ];
  showConfirm(text, buttons, params);
}

function playerDoBuyGfSlot() {
  postUrl(
    "/player/item-special/buy-slot/",
    {
      return_url: "/player/#fightitems",
    },
    "post"
  );
}

function playerBuyBfSlot() {
  var params = {
    __title: "Покупка слота",
  };
  var text =
    "Дополнительный слот для боев в бункере стоит <span class='ruda'>99<i></i></span> за 2 недели. Купить?";
  var buttons = [
    {
      title: "Купить",
      callback: playerDoBuyBfSlot,
    },
  ];
  showConfirm(text, buttons, params);
}

function playerLngBfSlot() {
  var params = {
    __title: "Продление слота",
  };
  var text =
    "Дополнительный слот для боев в бункере стоит <span class='ruda'>99<i></i></span> за 2 недели. Продлить?";
  var buttons = [
    {
      title: "Продлить",
      callback: playerDoBuyBfSlot,
    },
  ];
  showConfirm(text, buttons, params);
}

function playerDoBuyBfSlot() {
  postUrl("/bunker/buy-slot/", {}, "post");
}

var HTabs = {
  initHTabs: function (mainContainer, contentGenerator) {
    $(mainContainer)
      .find(".htab")
      .click(function () {
        HTabs.changeHTab(this, contentGenerator);
      });
  },

  changeHTab: function (obj, contentGenerator) {
    var tabName = $(obj).attr("htab");
    var cont = $(obj).parents("*[htab='cont']:first");
    var tabs = $(cont).find("*[htab='htabs']:first");
    $(tabs).children("*[htab]").hide();
    $(cont).find(".htab-current").removeClass("htab-current");
    $(obj).addClass("htab-current");
    if ($(tabs).children("*[htab='" + tabName + "']").length == 0) {
      $(tabs)
        .children("*[htab]:last")
        .after(
          $(tabs)
            .children("*[htab]:first")
            .clone()
            .attr("htab", tabName)
            .html(
              '<div align="center" style="margin: 50% 0 0 0; position: relative; "><img src="/@/images/ico/loading.gif" style="margin: -24px 0 0 0;" valign="bottom"></div>'
            )
            .show()
        );
      contentGenerator(tabName, $(tabs).children("*[htab='" + tabName + "']"));
    } else {
      $(tabs)
        .children("*[htab='" + tabName + "']")
        .show();
    }
  },
};

function changePetName(oldName) {
  var newName = prompt(m.lang.LANG_MAIN_38, oldName);
  if (newName != null) {
    /*$.post('/player/changepetname/', {name: newName}, function(data){
		 document.location.href = '/player/';
		 });*/
    postUrl(
      "/player/changepetname/",
      {
        action: "changePetName",
        name: newName,
      },
      "post",
      1
    );
  }
}

function adminFormActionOnChange(select) {
  //$('#admin-form-period')[0].disabled = (select.selectedIndex < 3 || select.selectedIndex == 11) ? true : false;
  $("#admin-form").find("tr[rel]").hide();
  var v = select.options[select.selectedIndex].value;
  if (v != "") {
    $("#admin-form")
      .find("tr[rel='" + v + "']")
      .show();
  }
}

function loadPlayerComments(playerId, offset) {
  $.get(
    "/player/" + playerId + "/admin-history/" + offset + "/",
    {},
    function (data) {
      if (data.length > 0) {
        html =
          "<table class='datatable'><tr><td class='d'><b>" +
          m.lang.LANG_MAIN_125 +
          "</b></td><td class='m'><b>" +
          m.lang.LANG_MAIN_87 +
          "</b></td><td class='a'><b>" +
          m.lang.LANG_MAIN_93 +
          "</b></td><td><b>" +
          m.lang.LANG_MAIN_113 +
          "</b></td><td><b>" +
          m.lang.LANG_MAIN_79 +
          "</b></td></tr>";
        for (i = 0; i < data.length - 1; i++) {
          if (data[i].id > 0) {
            html +=
              "<tr " +
              (i % 2 ? "class='odd'" : "") +
              "><td>" +
              data[i].d +
              "</td><td><a href='/player/" +
              data[i].id +
              "/'>" +
              data[i].nm +
              "</a></td><td>" +
              data[i].a +
              "</td><td>" +
              data[i].p +
              "</td><td>" +
              data[i].c +
              "</td></tr>";
          } else {
            html +=
              "<tr " +
              (i % 2 ? "class='odd'" : "") +
              "><td>" +
              data[i].d +
              "</td><td>" +
              data[i].nm +
              "</td><td>" +
              data[i].a +
              "</td><td>" +
              data[i].p +
              "</td><td>" +
              data[i].c +
              "</td></tr>";
          }
        }
        html += "</table>";
        html += showAdminReportPager(
          data[data.length - 1].id,
          offset,
          playerId,
          "loadPlayerComments"
        );

        $("#pers-admin2-block").html(html);
      }
    },
    "json"
  );
}

function loadPlayerDuels(playerId, offset) {
  $.get(
    "/player/" + playerId + "/admin-duels/" + offset + "/",
    {},
    function (data) {
      if (data.length > 0) {
        html =
          "<table class='datatable'><tr><td class='d'><b>" +
          m.lang.LANG_MAIN_125 +
          "</b></td><td><b>" +
          m.lang.LANG_MAIN_127 +
          "</b></td><td><b>" +
          m.lang.LANG_MAIN_88 +
          "</b></td><td><b>" +
          m.lang.LANG_MAIN_99 +
          "</b></td></tr>";
        for (i = 0; i < data.length - 1; i++) {
          html +=
            "<tr " +
            (i % 2 ? "class='odd'" : "") +
            "><td>" +
            data[i].dt +
            "</td>" +
            "<td><a href='/alley/fight/" +
            data[i].d +
            "/" +
            data[i].sk +
            "/'>" +
            (data[i].type == "fight_defended"
              ? m.lang.LANG_MAIN_112
              : m.lang.LANG_MAIN_91) +
            " &rarr; " +
            (data[i].r == "win"
              ? m.lang.LANG_MAIN_103
              : (data[i].r = "loose"
                  ? m.lang.LANG_MAIN_89
                  : m.lang.LANG_MAIN_123)) +
            "</td>" +
            "<td><a href='/player/" +
            data[i].pid +
            "/'>" +
            data[i].pnm +
            " [" +
            data[i].plv +
            "]</a></td>" +
            "<td>" +
            m.lang.LANG_MAIN_117 +
            "" +
            data[i].x +
            "<br />" +
            m.lang.LANG_MAIN_95 +
            "" +
            data[i].m +
            "<br />" +
            m.lang.LANG_MAIN_118 +
            "" +
            data[i].z +
            "</td></tr>";
        }
        html += "</table>";
        //html += showAdminReportPager(data[data.length - 1].id, offset, playerId, "loadPlayerDuels");
        html += "<p>" + m.lang.LANG_MAIN_84;
        for (var i in data[data.length - 1]) {
          if (typeof data[data.length - 1][i].title == "undefined") {
            continue;
          }
          if (
            data[data.length - 1][i].dt == offset ||
            (offset == 0 && i == 0)
          ) {
            html += " <b>" + data[data.length - 1][i].title + "</b>&nbsp;";
          } else {
            html +=
              " <a href='javascript:void(0);' onclick='loadPlayerDuels(" +
              playerId +
              ", " +
              data[data.length - 1][i].dt +
              ");'>" +
              data[data.length - 1][i].title +
              "</a>&nbsp;";
          }
        }
        html += "</p>";

        $("#pers-admin2-block").html(html);
      }
    },
    "json"
  );
}

function loadPlayerMessages(playerId, offset) {
  $.get(
    "/player/" + playerId + "/admin-messages/" + offset + "/",
    {},
    function (data) {
      if (data.length > 0) {
        var html =
          "<table class='datatable'><tr><td class='d'><b>" +
          m.lang.LANG_MAIN_125 +
          "</b></td><td><b>" +
          m.lang.LANG_MAIN_100 +
          "</b></td><td><b>" +
          m.lang.LANG_MAIN_126 +
          "</b></td>" +
          "<td><b>" +
          m.lang.LANG_MAIN_127 +
          "</b></td><td><b>" +
          m.lang.LANG_MAIN_92 +
          "</b></td></tr>";
        for (i = 0; i < data.length - 1; i++) {
          html +=
            "<tr " +
            (i % 2 ? "class='odd'" : "") +
            "><td>" +
            data[i].dt +
            "</td>" +
            "<td>" +
            (data[i].p1 == 0
              ? m.lang.LANG_MAIN_128
              : "<a href='/player/" +
                data[i].p1 +
                "'>" +
                data[i].pnm1 +
                " [" +
                data[i].plv1 +
                "]</a></td>") +
            "<td>" +
            (data[i].p2 == 0
              ? m.lang.LANG_MAIN_128
              : "<a href='/player/" +
                data[i].p2 +
                "'>" +
                data[i].pnm2 +
                " [" +
                data[i].plv2 +
                "]</a></td>") +
            "<td>" +
            (data[i].type == "message"
              ? m.lang.LANG_MAIN_109
              : (data[i].type = "clan_message"
                  ? m.lang.LANG_MAIN_98
                  : (data[i].type = "system_notice"
                      ? m.lang.LANG_MAIN_75
                      : ""))) +
            "</td>" +
            "<td>" +
            data[i].text +
            "</td></tr>";
        }
        html += "</table>";
        html += showAdminReportPager(
          data[data.length - 1].id,
          offset,
          playerId,
          "loadPlayerMessages"
        );

        $("#pers-admin2-block").html(html);
      }
    },
    "json"
  );
}

function loadPlayerMeetingsTeam(playerId) {
  $.get(
    "/player/" + playerId + "/admin-meetings/",
    {},
    function (data) {
      var html = "";
      if (data.id) {
        html =
          '<form action="/player/admin/" method="post"><input type="hidden" name="adminaction" value="1"><input type="hidden" name="action" value="meeting_edit"><input type="hidden" name="player" value="' +
          playerId +
          '">' +
          m.lang.LANG_MAIN_130 +
          ': <input type="text" name="name" value="' +
          data.name +
          '" /><br />' +
          m.lang.LANG_MAIN_131 +
          ': <input type="text" name="slogan" value="' +
          data.slogan +
          '" /><br />' +
          m.lang.LANG_MAIN_132 +
          ': <textarea name="description">' +
          data.description +
          "</textarea><br />" +
          '<button class="button" type="submit"><span class="f"><i class="rl"></i><i class="bl"></i><i class="brc"></i><div class="c">' +
          "Отправить" +
          "</div></span></button></form>";
      } else {
        html = m.lang.LANG_MAIN_133;
      }
      $("#pers-admin2-block").html(html);
    },
    "json"
  );
}

function loadPlayerStats(playerId) {
  $.get("/player/" + playerId + "/admin-stats/", {}, function (data) {
    $("#pers-admin2-block").html(data);
  });
}

function showAdminReportPager(total, offset, playerId, func) {
  var html = "<p>" + m.lang.LANG_MAIN_84;
  if (total > 20) {
    pages = Math.floor(total / 20);
    if (pages != total / 20) {
      pages++;
    }
    for (i = 0; i < pages; i++) {
      offset2 = i * 20;
      if (offset2 == offset) {
        html += " <b>" + (i + 1) + "</b>&nbsp;";
      } else {
        html +=
          " <a href='javascript:void(0);' onclick='" +
          func +
          "(" +
          playerId +
          ", " +
          offset2 +
          ");'>" +
          (i + 1) +
          "</a>&nbsp;";
      }
    }
  } else {
    html += "<b>1</b>";
  }
  html += "</p>";
  return html;
}

//" + LANG_MAIN_73 + "

function trainStat(url, stat) {
  if ($("#train-" + stat).hasClass("disabled")) {
    return false;
  }
  var freezedbuttons = $("li.stat div.button:not(.disabled)");
  freezedbuttons.addClass("disabled");
  $.ajax({
    url: url,
    type: "POST",
    dataType: "json",
    success: function (data) {
      freezedbuttons.removeClass("disabled");
      if (data.error.length) {
        showAlert(moswar.lang.ERROR_TITLE, data.error, true);
      } else {
        updatePlayerBlockMoney(data.spent, "-");
        for (var stat in data.stats) {
          if (!data.maxstats) {
            var maxStat = maxValueStat(data.stats);
          } else {
            var maxStat = data.maxstats[stat];
          }

          var text = "";
          var newPrice = 0;
          var oldPrice =
            $("#train-" + stat + " .c .tugriki").html() || "6<i></i>";

          var freeTutorialStat = false;
          if (
            (stat == "health" && tutorial.curStep == "stats1") ||
            (stat == "strength" &&
              (tutorial.curStep == "stats2" || tutorial.curStep == "stats3")) ||
            (stat == "dexterity" &&
              (tutorial.curStep == "stats4" || tutorial.curStep == "stats5"))
          ) {
            freeTutorialStat = true;
          }

          $(".stat[rel=" + stat + "] .num").html(data.stats[stat].val);
          $(".stat[rel=" + stat + "] .bar .percent").animate(
            {
              width: Math.ceil((data.stats[stat].val / maxStat) * 100) + "%",
            },
            "slow"
          );

          if (data.maxstats && data.stats[stat].val >= data.maxstats[stat]) {
            $("#train-" + stat)
              .addClass("disabled")
              .attr("rel", "maxstat")
              .unbind("click");
            $("#train-" + stat + " .c").html(l.TRAIN_MAX);
          } else if (
            $(".stat[rel=" + stat + "] div.button.disabled[rel='maxstat']")
              .length == 0
          ) {
            if (data.stats[stat].notEnough < 0 && !freeTutorialStat) {
              $("#train-" + stat).addClass("disabled");
              text =
                moswar.lang.TRAIN_NOT_ENOUGH +
                '<span class="tugriki">' +
                oldPrice +
                "</span>";
              newPrice = data.stats[stat].notEnough;
            } else {
              if (freeTutorialStat) {
                text = moswar.lang.TRAIN_UP + "бесплатно";
                $("#train-" + stat).removeClass("disabled");
              } else {
                text =
                  moswar.lang.TRAIN_UP +
                  '<span class="tugriki">' +
                  oldPrice +
                  "</span>";
              }
              newPrice = data.stats[stat].cost;
            }

            $("#train-" + stat + " .c").html(text);
            animateNumber(
              $("#train-" + stat + " .c .tugriki"),
              Math.abs(newPrice),
              50,
              true
            );
          }
        }

        if (data.tutorial) {
          tutorial.hideArrow();
          tutorial.curStepI++;
          tutorial.curStep = tutorial.stepsI[tutorial.curStepI];
          tutorial.processStep();
        }
      }
    },
  });
}

function maxValueStat(stats) {
  var max = 0;
  for (var stat in stats) {
    max = stats[stat].val > max ? stats[stat].val : max;
  }
  return max;
}

function maxOfArguments() {
  var m = 0;
  for (var arg in arguments) {
    m = arguments[arg] > m ? arguments[arg] : m;
  }
  return m;
}

function socialProfileFormInit() {
  $("#city-tr").hide();
  $("#metro-tr").hide();
  if ($("#country-select").val() != "") {
    $("#city-tr").show();
  }
  if ($("#city-select").val() != "") {
    $("#metro-tr").show();
  }
}

function socialProfileFormShowHide() {
  if (
    $("#city-select").val() == "" ||
    $("#metro-select")[0].options.length == 1
  ) {
    $("#metro-tr").hide();
  }
  if (
    $("#country-select").val() == "" ||
    $("#city-select")[0].options.length == 1
  ) {
    $("#city-tr").hide();
  }
}

function socialProfileLoadCities() {
  $("#metro-tr").hide();
  $("#city-tr").hide();
  if ($("#country-select").val() != "") {
    $.ajax({
      url: "/settings/load-items/city/" + $("#country-select").val() + "/",
      async: false,
      success: function (data) {
        if (data.length > 0) {
          $("#city-select").html("");
          $("#city-select").append(
            '<option value="">' + m.lang.LANG_MAIN_68 + "</option>"
          );
          for (i = 0; i < data.length; i++) {
            $("#city-select").append(
              '<option value="' + data[i].id + '">' + data[i].nm + "</option>"
            );
          }
          $("#city-tr").show();
        }
      },
      dataType: "json",
    });
  }
}

function socialProfileLoadMetros() {
  $("#metro-tr").hide();
  if ($("#city-select").val() != "") {
    $.ajax({
      url: "/settings/load-items/metro/" + $("#city-select").val() + "/",
      async: false,
      success: function (data) {
        if (data.length > 0) {
          $("#metro-select").html("");
          $("#metro-select").append(
            '<option value="">' + m.lang.LANG_MAIN_68 + "</option>"
          );
          for (i = 0; i < data.length; i++) {
            $("#metro-select").append(
              '<option value="' + data[i].id + '">' + data[i].nm + "</option>"
            );
          }
          $("#metro-tr").show();
        }
      },
      dataType: "json",
    });
  }
}

//" + LANG_MAIN_85 + "

function alleyNaperstkiPlay(cells) {
  $.get(
    "/alley/naperstki/play/" + cells + "/",
    {},
    function (data) {
      if (data != "") {
        $("#naperstki-step1").hide();
        $("#naperstki-step3").hide();
        $("#naperstki-step2-cells" + (data.c == 3 ? 9 : 3)).hide();
        $("#naperstki-step2-cells" + data.c).show();
        desk = "";
        for (var i = 0; i < data.c; i++) {
          if (i == 3 || i == 6) {
            desk += "<br />";
          }
          switch (data.d[i]) {
            case "0":
              desk +=
                '<i id="thimble' +
                i +
                '" class="icon thimble-closed-active" onclick="alleyNaperstkiGuess(' +
                i +
                ');"></i>';
              break;
            case "1":
              desk +=
                '<i id="thimble' + i + '" class="icon thimble-closed"></i>';
              break;
            case "2":
              desk +=
                '<i id="thimble' + i + '" class="icon thimble-guessed"></i>';
              break;
            case "3":
              desk +=
                '<i id="thimble' + i + '" class="icon thimble-empty"></i>';
              break;
          }
        }
        $("#naperstki-step2").find(".thimbles").html(desk);
        $("#naperstki-ruda").html(data.r + "<i></i>");
        $("#naperstki-left").html(data.c == 3 ? 1 - data.g : 3 - data.g);
        $("#naperstki-step2").show();

        updatePlayerBlockMoney(cells == 3 ? 500 : cells == 9 ? 1500 : 0, "-");
      } else {
        alert(m.lang.LANG_MAIN_0);
        alleyNaperstkiLeave();
      }
    },
    "json"
  );
}

function alleyNaperstkiGuess(cell) {
  $.get(
    "/alley/naperstki/guess/" + cell + "/",
    {},
    function (data) {
      if (data != "") {
        if (data.left == 0) {
          $("#naperstki-step2")
            .find(".thimbles i")
            .removeClass("thimble-closed-active")
            .addClass("thimble-closed");
          $("#naperstki-step3").show();
        }
        $("#naperstki-left").html(data.left);
        $("#naperstki-ruda").html(data.ruda + "<i></i>");
        $("#thimble" + cell).removeClass("thimble-closed");
        if (data.result == "1") {
          $("#thimble" + cell).addClass("thimble-guessed");
        } else {
          $("#thimble" + cell).addClass("thimble-empty");
        }
      }
    },
    "json"
  );
}

function alleyNaperstkiLeave() {
  $.get("/alley/naperstki/leave/", {}, function (data) {}, "json");
  $("#naperstki").hide();
}

//" + LANG_MAIN_66 + "

var huntclubAward = 0;
var huntclubPrice = 0;
var huntclubCheckPlayer = false;

function huntclubShowForm() {
  var player = $("#nickname2");

  if (player.length) {
    player = player.val();
    if (player == "") {
      $("#nickname-error").show();
      $("#nickname-error").html(m.lang.LANG_MAIN_53);
    } else {
      $("#nickname").val(player);
      huntclubCheckNicknameAndMoney(player);
      $("#hunting-order-form-cost-tugriki").html(
        formatNumber(huntclubPrice, 0, "", ",")
      );
    }
  } else {
    if ($("#nickname").val().length) {
      huntclubCheckNicknameAndMoney($("#nickname").val());
    }
  }
  $("#hunting-order-form").show();
  return false;
}

function huntclubZakazCost(level, playerZakaz, myZakaz) {
  var cost = 60 * (level - 2) * (playerZakaz > myZakaz ? playerZakaz : myZakaz);
  if (GAME_LOCALE == "ru") {
    cost *= 10;
  }
  return cost;
}

function huntclubCheckForm() {
  var player = $("#nickname").val();
  huntclubAward = $("#award").val();
  huntclubAward = isNaN(huntclubAward) ? 0 : Math.abs(huntclubAward);
  $("#award").val(huntclubAward);
  huntclubCheckNicknameAndMoney(player);

  var ok2 = true;
  if (
    $("#hunting-order-form-grand")[0].checked &&
    (myOre + myHoney < 5 ||
      ($("#hunting-order-form-private") &&
        $("#hunting-order-form-private")[0].checked &&
        myOre + myHoney < 10))
  ) {
    $("#vip-error").html(m.lang.LANG_MAIN_56 + "/" + m.lang.LANG_MAIN_124);
    $("#vip-error").show();
    ok2 = false;
  } else {
    $("#vip-error").hide();
  }
  var ok = true;
  if (
    $("#hunting-order-form-private") &&
    $("#hunting-order-form-private")[0].checked &&
    (myHoney < 5 ||
      ($("#hunting-order-form-grand")[0].checked &&
        (myOre + myHoney < 10 || myHoney < 5)))
  ) {
    $("#private-error").html(m.lang.LANG_MAIN_59);
    $("#private-error").show();
    ok = false;
  } else {
    $("#private-error").hide();
  }
  var ok3 = true;
  if (huntclubAward > myLevel * 1000) {
    $("#award-error").html(
      m.lang.LANG_MAIN_34 +
        "— <span class='tugriki'>" +
        myLevel * 1000 +
        "<i></i></span>"
    );
    $("#award-error").show();
    ok3 = false;
  } else {
    $("#award-error").hide();
  }
  if (huntclubCheckPlayer && ok && ok2 && ok3) {
    $("#hunt-form").submit();
  }
}

function huntclubCheckForm2() {
  var player = $("#nickname").val();
  huntclubAward = $("#award").val();
  huntclubAward = isNaN(huntclubAward) ? 0 : Math.abs(huntclubAward);
  $("#award").val(huntclubAward);
  huntclubCheckNicknameAndMoney(player);
}

function huntclubCheckNicknameAndMoney(player) {
  $.ajax({
    url: "/huntclub/checkplayer/" + encodeURIComponent(player) + "/",
    async: false,
    dataType: "json",
    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
    success: function (data) {
      $("#nickname-ok").hide();
      if (data.id <= 0) {
        $("#nickname-error").show();
        huntclubCheckPlayer = false;
      }
      if (data.id == 0) {
        $("#nickname-error").html(m.lang.LANG_MAIN_65);
      } else if (data.id == -1) {
        $("#nickname-error").html(m.lang.LANG_MAIN_7);
      } else if (data.id == -2) {
        $("#nickname-error").html(m.lang.LANG_MAIN_20);
      } else if (data.id == -3) {
        $("#nickname-error").html(m.lang.LANG_MAIN_36);
      } else if (data.id == -4) {
        $("#nickname-error").html(m.lang.LANG_MAIN_21);
      } else if (data.id == -5) {
        $("#nickname-error").html(m.lang.LANG_MAIN_22);
      } else if (data.id == -6) {
        $("#nickname-error").html(m.lang.LANG_MAIN_12);
      } else if (data.id == -7) {
        $("#nickname-error").html(m.lang.LANG_MAIN_134);
      } else if (data.level < 3) {
        $("#nickname-error").show();
        $("#nickname-error").html(m.lang.LANG_MAIN_15);
        huntclubCheckPlayer = false;
      } else if (data.playerzakaz >= 3) {
        $("#nickname-error").show();
        $("#nickname-error").html(m.lang.LANG_MAIN_16);
        huntclubCheckPlayer = false;
      } else {
        $("#nickname-error").hide();
        $("#nickname-ok").show();
        huntclubPrice = huntclubZakazCost(
          data.level,
          data.playerzakaz,
          data.myzakaz
        );
        $("#hunting-order-form-cost-tugriki").html(
          formatNumber(huntclubPrice + huntclubAward, 0, "", ",")
        );
        if (huntclubPrice + huntclubAward > myMoney) {
          $("#money-error").html(m.lang.LANG_MAIN_55);
          $("#money-error").show();
          //$("#form-submit").addClass("disabled");
          //$("#form-submit").attr("disabled", true);
          huntclubCheckPlayer = false;
        } else {
          $("#money-error").hide();
          //$("#form-submit").removeClass("disabled");
          //$("#form-submit").attr("disabled", false);
          huntclubCheckPlayer = true;
        }
      }
    },
  });
}

function huntclubCancel() {
  $("#hunting-order-form").hide();
  $("#nickname2").val("");
  $("#nickname").val("");
  $("#award").val("");
  $("#hunting-order-form-cost-tugriki")[0].checked = false;
  $("#comment").val("");
  huntclubAward = 0;
  huntclubPrice = 0;
  huntclubCheckPlayer = false;
  return false;
}

function huntclubVipCheck() {
  if ($("#hunting-order-form-grand")[0].checked) {
    $("#hunting-order-form-cost-grand").show();
    $("#hunting-order-form-levels")
      .html("[0&hellip;+2]")
      .css("font-weight", "bold");
    /*
		 if ($("#hunting-order-form-grand")[0].checked && ((myOre + (myHoney * 4)) < 5 || ($("#hunting-order-form-private")[0].checked && (myOre + myHoney) < 10))) {
		 $("#vip-error").html(m.lang.LANG_MAIN_56 + "/" + m.lang.LANG_MAIN_124);
		 $("#vip-error").show();
		 } else {
		 $("#vip-error").hide();
		 }
		 */
  } else {
    $("#hunting-order-form-cost-grand").hide();
    $("#vip-error").hide();
    $("#hunting-order-form-levels")
      .html("[-1&hellip;+1]")
      .css("font-weight", "normal");
  }
}

function huntclubPrivateCheck() {
  if ($("#hunting-order-form-private")[0].checked) {
    $("#hunting-order-form-cost-private").show();
    /*
		 if ($("#hunting-order-form-private")[0].checked && (myHoney < 5 || ($("#hunting-order-form-grand")[0].checked && ((myOre + myHoney) < 10 || myHoney < 5)))) {
		 $("#private-error").html(m.lang.LANG_MAIN_59);
		 $("#private-error").show();
		 } else {
		 $("#private-error").hide();
		 }
		 */
  } else {
    $("#hunting-order-form-cost-private").hide();
    $("#private-error").hide();
  }
}

function huntclubAwardKeyUp() {
  if (!isNaN($("#award").val())) {
    $("#hunting-order-form-cost-tugriki").html(
      formatNumber(huntclubPrice + parseInt($("#award").val()), 0, "", ",")
    );
  }
}

function huntclubPayFee(huntId) {
  if (window.confirm(m.lang.LANG_MAIN_28)) {
    postUrl(
      "/huntclub/me/pay-fee/",
      {
        hunt: huntId,
      },
      "post",
      1
    );
  }
}

function huntclubOpen(huntId) {
  if (window.confirm(m.lang.LANG_MAIN_40)) {
    postUrl(
      "/huntclub/me/open/",
      {
        hunt: huntId,
      },
      "post",
      1
    );
  }
}

function huntclubClearComment(id) {
  if (window.confirm(m.lang.LANG_MAIN_94) == true) {
    $.ajax({
      url: "/huntclub/clear-comment/" + id + "/",
      async: false,
    });
    $("#comment" + id).html("");
  }
}

/*" + LANG_MAIN_102 + "*/

$(".filter_topphotos").live("click", function () {
  $("#photostop-" + $(".filter_topphotos.current").attr("rel")).hide();
  $(".filter_topphotos").removeClass("current");
  $(this).addClass("current");
  $("#photostop-" + $(".filter_topphotos.current").attr("rel")).show();
  //setCookie("filter_topphotos", $(this).attr("rel"))
  //window.location.reload();
});

$(".filter_toppeople").live("click", function () {
  $("#peopletop-" + $(".filter_toppeople.current").attr("rel")).hide();
  $(".filter_toppeople").removeClass("current");
  $(this).addClass("current");
  $("#peopletop-" + $(".filter_toppeople.current").attr("rel")).show();
  //setCookie("filter_toppeople", $(this).attr("rel"))
  //window.location.reload();
});

function loadPhotosSearchFamilies(value) {
  $("#family-select").load("/photos/load-items/families/" + value + "/");
}

function loadPhotosSearchCities(value) {
  $("#city-select").load("/photos/load-items/cities/" + value + "/");
  $("#metro-select").html("<option>" + m.lang.LANG_MAIN_120 + "</option>");
}

function loadPhotosSearchMetros(value) {
  $("#metro-select").load("/photos/load-items/metros/" + value + "/");
}
/* /" + LANG_MAIN_110 + "*/

/* Home */
function homeThimbleGuess(collectionId, position) {
  postUrl(
    "/home/collection/" + collectionId + "/thimble/",
    {
      action: "guess",
      position: position,
    },
    "post",
    1
  );
}
/* /Home */

//" + LANG_MAIN_107 + "

function sovetAutoHideLozung(param) {
  var html = $("#council-speach-text" + param).html();
  if (html && html.length > 400) {
    html = html.replace(
      /((\n|.){1,320}\s)((\n|.)*)/,
      '$1<span class="hidden" style="display:none">$3</span><span class="show dashedlink" onclick=\' $(this).parent().find("span.hidden").show("fast"); $(this).hide().parent().find("span.hide").show();\'>' +
        m.lang.LANG_MAIN_97 +
        "</span><span class='hide dashedlink' onclick='$(this).parent().find(\"span.hidden\").hide(\"fast\"); $(this).hide().parent().find(\"span.show\").show();' style='display:none;'>" +
        m.lang.LANG_MAIN_108 +
        "</span>"
    );
  }
  $("#council-speach-text" + param).html(html);
}

/* Police */

function policeWerewolfBegin(level, withItem) {
  if (level == 0) {
    $("#police-werewolf-error").html(m.lang.LANG_POLICE_WEREWOLF_ERROR);
    $("#police-werewolf-error").show();
    return false;
  } else {
    withItem = typeof withItem != "undefined" ? withItem : 0;
    $("#police-werewolf-error").hide();
    postUrl(
      "/police/",
      {
        action: "werewolf_begin",
        level: level,
        with_item: withItem,
      },
      "post",
      1
    );
  }
}

function policeWerewolfExtension(return_url) {
  return_url = typeof return_url != "undefined" ? return_url : "";
  postUrl(
    "/police/",
    {
      action: "werewolf_extension",
      return_url: return_url,
    },
    "post",
    1
  );
}

function policeWerewolfCancel() {
  postUrl(
    "/police/",
    {
      action: "werewolf_cancel",
      return_url: "/police/",
    },
    "post",
    1
  );
}

function policeWerewolfRegeneration() {
  $("#loading-stats").show();
  $('#id="policeWerewolfRegenerationButton"')
    .attr("disabled", "disabled")
    .addClass("disabled");
  AngryAjax.setTimeout(function () {
    $.post(
      "/police/",
      {
        action: "werewolf_regeneration",
        ajax: 1,
      },
      function (data) {
        var max1 = (max2 = 0);
        if (data["error"]) {
          showAlert(l.LANG_STR_ERROR, data["error"]);
          $("#loading-stats").hide();
          $('#id="policeWerewolfRegenerationButton"')
            .removeAttr("disabled")
            .removeClass("disabled");
          return;
        }
        for (i in data["stats"]) {
          if (i.substr(0, 6) == "rating") {
            if (data["stats"][i] > max2) {
              max2 = data["stats"][i];
            }
          } else {
            if (data["stats"][i] > max1) {
              max1 = data["stats"][i];
            }
          }
        }
        $("#loading-stats").hide();
        $('#id="policeWerewolfRegenerationButton"')
          .removeAttr("disabled")
          .removeClass("disabled");
        for (i in data["stats"]) {
          $("li[rel='" + i + "'] span.num").html(data["stats"][i]);
          if (i.substr(0, 6) == "rating") {
            $("li[rel='" + i + "'] div.bar div.percent").animate(
              {
                width: Math.round((data["stats"][i] / max2) * 100) + "%",
              },
              "slow"
            );
          } else {
            $("li[rel='" + i + "'] div.bar div.percent").animate(
              {
                width: Math.round((data["stats"][i] / max1) * 100) + "%",
              },
              "slow"
            );
          }
        }
        $("p.borderdata span.icon")
          .addClass("icon-star-empty")
          .removeClass("icon-star-filled");
        $("p.borderdata span.icon:lt(" + data["stars"] + ")")
          .removeClass("icon-star-empty")
          .addClass("icon-star-filled");
        $("div.life span[rel='hp']").html(data["hp"] + "/" + data["hp"]);
        if (data["increase_drop"]) {
          $(".borderdata .increase").text(data["increase_drop"]);
        }
        if (data["wallet"]) {
          updateWallet(data["wallet"]);
        }
      },
      "json"
    );
  }, "2000");
}

function policeFineFormSubmit(div) {
  //$(div).disable();
  $(div).addClass("disabled");
  $(div).bind("click", function () {
    return false;
  });
  $("#fine-form").submit();
}

function showAlleySearchTab(flag) {
  if ("werewolf" == flag && $("#alley-search-werewolf-tab").length > 0) {
    $("#alley-search-myself").hide();
    $("#alley-search-myself-tab").removeClass("current");
    $("#alley-search-werewolf").show();
    $("#alley-search-werewolf-tab").addClass("current");
    setCookie("alleysearchtab", "werewolf");
  } else {
    $("#alley-search-myself").show();
    $("#alley-search-myself-tab").addClass("current");
    $("#alley-search-werewolf").hide();
    $("#alley-search-werewolf-tab").removeClass("current");
    setCookie("alleysearchtab", "");
  }
}

/* /Police */

function updateWallet(wallet) {
  if (typeof wallet["money"] != "undefined") {
    $("div#personal .wallet .tugriki-block").attr(
      "title",
      $("div#personal .wallet .tugriki-block")
        .attr("title")
        .replace(/[0-9]+/, wallet["money"])
    );
    animateNumber($("div#personal .wallet span[rel='money']"), wallet["money"]);
  }
  if (typeof wallet["ore"] != "undefined") {
    $("div#personal .wallet .ruda-block").attr(
      "title",
      $("div#personal .wallet .ruda-block")
        .attr("title")
        .replace(/[0-9]+/, wallet["ore"])
    );
    animateNumber($("div#personal ul.wallet span[rel='ore']"), wallet["ore"]);
  }
  if (typeof wallet["honey"] != "undefined") {
    $("div#personal .wallet .med-block").attr(
      "title",
      $("div#personal .wallet .med-block")
        .attr("title")
        .replace(/[0-9]+/, wallet["honey"])
    );
    animateNumber(
      $("div#personal ul.wallet span[rel='honey']"),
      wallet["honey"]
    );
  }
  if (
    typeof wallet["oil"] != "undefined" &&
    $("div#personal ul.wallet li.neft-block").length != 0
  ) {
    $("div#personal ul.wallet li.neft-block").attr(
      "title",
      $("div#personal ul.wallet li.neft-block")
        .attr("title")
        .replace(/[0-9]+/, wallet["oil"])
    );
    animateNumber($("div#personal ul.wallet span[rel='oil']"), wallet["oil"]);
  }
}

function formatNumber(nStr) {
  nStr += "";
  x = nStr.split(".");
  x1 = x[0];
  x2 = x.length > 1 ? "." + x[1] : "";
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, "$1" + "," + "$2");
  }
  return x1 + x2;
}

function formatDate(timestamp) {
  var date = new Date(timestamp * 1000),
    d = [
      date.getDate(),
      date.getMonth() + 1,
      date.getFullYear() % 1000,
      date.getHours(),
      date.getMinutes(),
    ];
  for (var i = 0, x; typeof (x = d[i]) !== "undefined"; i++) {
    if (x < 10) d[i] = "0" + x;
  }
  return d[0] + "." + d[1] + "." + d[2] + " " + d[3] + ":" + d[4];
}

function showObjectOvertip(obj, params, itemId, ajax) {
  var offset_left = Math.round(
    $(obj).offset().left -
      $("div.column-right").offset().left +
      $(obj).width() / 2
  );
  var offset_top = Math.round(
    $(obj).offset().top -
      $("div.column-right").offset().top +
      $(obj).height() / 3
  );
  $("#object-overtip-place").css({
    left: offset_left,
    top: offset_top,
  });
  $("#object-overtip-place").show();

  params = eval("(" + params + ")");
  //$("#object-overtip-place form").submit(function(){return false;});
  $("#object-overtip-place").find("h2").html(params.c);
  if (params.fa != "") {
    $("#object-overtip-place").find("form")[0].action = params.fa;
  }
  $($("#object-overtip-place").find("form div")[0]).html("");
  if (params.t != "") {
    $($("#object-overtip-place").find("form div")[0]).append(
      "<p>" + params.t + "</p>"
    );
  }

  if (params.b != "") {
    var btn = $("#object-overtip-place").find("button.button div");
    $("#object-overtip-place").find("button.button div").html(params.b);
    m.items[$(obj).data("id")].btn = $(obj);
    m.items[$(obj).data("id")].method = "POST";
    if (params.fa) {
      m.items[$(obj).data("id")].btn.data(
        "action",
        params.fa.replace(/^\/[\w]+\//i, "").replace(/\/$/i, "")
      );
    }
    $("#object-overtip-place").find("button.button").unbind("click");
    $("#object-overtip-place")
      .find("button.button")
      .click(function (e) {
        e.preventDefault();
        m.items[$(obj).data("id")].d = {
          inventory: $(obj).data("id"),
          unlocked: $("#object-overtip-place").find(
            "input[type=checkbox]:checked"
          ).length,
        };
        $("#object-overtip-place").find("button.button").unbind("click");
        m.makeAction("disable", m.items);
        $("#object-overtip-place")
          .find("button.button")
          .click(function (e) {
            e.preventDefault();
          });
        $("#object-overtip-place").find("div.button").unbind("click");
        m.actionManager.performAction.apply(m.items[$(obj).data("id")], [
          $("#object-overtip-place"),
        ]);
      });
    $("#object-overtip-place").find("button.button").data("m", "1");
  }
  if (params.ff && params.ff.length > 0) {
    for (var i in params.ff) {
      var field = params.ff[i];
      $($("#object-overtip-place").find("form div")[0]).append(
        showObjectOvertip_getField(field.c, field.n, field.t, field.v, field.p)
      );
    }
  }
  $($("#object-overtip-place").find("form div")[0]).append(
    showObjectOvertip_getField("", "inventory", "hidden", itemId, "")
  );
  $(".overtip", "#object-overtip-place").show();
}

function showObjectOvertip_getField(caption, name, type, value, params) {
  var html = "";
  switch (type) {
    case "text":
      html =
        caption +
        ': <input type="text" name="' +
        name +
        '" value="' +
        (value ? value : "") +
        '" />';
      break;
    case "checkbox":
      html =
        '<input type="checkbox" name="' +
        name +
        '" ' +
        (value == 1 ? "checked" : "") +
        " /> " +
        caption;
      break;
    case "hidden":
      html =
        '<input type="hidden" name="' + name + '" value="' + value + '" />';
      break;
  }
  return '<div style="margin:5px 0">' + html + "</div>";
}

function hidePerks(important) {
  if (important) {
    /* hide if cross pressed */
    $("#perks-popup").hide();
    $("#perks-popup").attr("nohide", "");
    $("#perks-popup").find("span.close-cross").hide();
  } else {
    var nohide = $("#perks-popup").attr("nohide");
    if (!nohide) {
      $("#perks-popup").hide();
    }
  }
}

function showPerks(obj, nohide) {
  var offset_left = Math.round(
    $(obj).offset().left - $("div.column-right").offset().left + $(obj).width()
  );
  var offset_top = Math.round(
    $(obj).offset().top - $("div.column-right").offset().top + $(obj).height()
  );
  $("#perks-popup").css({
    left: offset_left,
    top: offset_top,
  });
  if (nohide) {
    $("#perks-popup").show();
    $("#perks-popup").attr("nohide", "1");
    $("#perks-popup").find("span.close-cross").show();
  } else {
    $("#perks-popup").show();
  }
}

function citymapMouseover(i) {
  $("#citymap")
    .find(".citymap-land-" + i)
    .each(function () {
      if (
        $("#citymap")
          .find(".citymap-switch .citymap-land-" + i)
          .attr("data-active")
      ) {
        $(this).addClass("hover");
      }
    });
}

function citymapMouseout(i) {
  $(".citymap-land-" + i).each(function () {
    $(this).removeClass("hover");
  });
}

function citymapClick(i, data) {
  if (
    !$("#citymap")
      .find(".citymap-switch .citymap-land-" + i)
      .is("[data-active='true']")
  ) {
    return false;
  }

  $(".council-citymap-tooltip").remove();
  var obj = $("#map-area-" + i);
  data = {};
  data.title = m.items[i].info.title.replace(/\s\[.*\]/, "");
  data.maxCool = data.minCool + random(1, 10000);
  data.lvl = parseInt(obj.attr("data-minlevel"));
  data.playerLevel = parseInt(player.level);
  data.residentScore = parseInt(obj.attr("data-rvotes"));
  data.arrivedScore = parseInt(obj.attr("data-avotes"));
  data.playerCool = parseInt(obj.attr("data-player-statsum"));
  data.maxCool = parseInt(obj.attr("data-maxstatsum"));
  var totalScore = data.residentScore + data.arrivedScore;
  data.percent =
    totalScore > 0
      ? Math.ceil(
          (Math.max(data.residentScore, data.arrivedScore) * 100) / totalScore
        )
      : 50;
  data.percentText = "Силы равны";
  data.belongText = "Жуликам и ворам";
  data.winnerClass = "";
  if (data.residentScore > data.arrivedScore) {
    data.percentText = "Коренные побеждают";
    data.belongText = "Коренным";
    data.winnerClass = "resident";
  } else if (data.arrivedScore > data.residentScore) {
    data.percentText = "Понаехавшие побеждают";
    data.belongText = "Понаехавшим";
    data.winnerClass = "arrived";
  }
  data.rewardHtml =
    "Призовой фонд: " +
    Camp.getPriceHtml(JSON.parse(obj.attr("data-reward")), false);
  if (obj.attr("data-box-chance") > 0) {
    data.rewardHtml +=
      "<br/>Шанс получить «<b>Армейский сундук</b>» за победу: <b>" +
      obj.attr("data-box-chance") +
      "%</b>";
  }
  if (data.lvl + 1 <= data.playerLevel) {
    data.rewardHtml +=
      '<p class="err">Вы слишком сильны для этого района, поэтому ваша награда уменьшена.</p>';
  }
  var showButton = true;
  if (data.lvl - data.playerLevel > 1) {
    data.errorHtml2 =
      '<p class="err2">Ваш уровень слишком мал для защиты этого района.</p>';
    showButton = false;
  } else if (data.lvl - data.playerLevel < -3) {
    data.errorHtml2 =
      '<p class="err2">Ваш уровень слишком велик для защиты этого района.</p>';
    showButton = false;
  } else if (data.playerCool > data.maxCool) {
    data.errorHtml =
      '<p class="err">Вы слишком сильны для этого района, <i class="question-icon" tooltip="1" title="Слишком сильный||Тебе здесь будет неинтересно."></i><br/>поэтому ваши характеристики в бою будут снижены.</p>';
  }
  var title = "Район «" + data.title + "» [" + data.lvl + "]";
  var html = Mustache.to_html(moswar.tpl.councilCitymapRegion, data);
  showAlert(
    title,
    html,
    false,
    "council-citymap-tooltip",
    ".council-citymap-place",
    [
      {
        isdefault: true,
        label: "Защищать «" + data.title + "»",
        onclick: "return citymapSelectMetro(" + i + ");",
        empty: !showButton,
      },
    ]
  );

  $(".council-citymap-tooltip").css({
    top: $("#citymap_img").offset().top + 40 + "px",
  });
  simple_tooltip(".council-citymap-tooltip [tooltip=1]", "tooltip");

  return false;
}

function citymapSelectMetro(metro) {
  postUrl(
    "/sovet/select_active_metro/",
    {
      action: "select_active_metro",
      metro: metro,
    },
    "post",
    1
  );
  return false;
}

function citymapInit() {
  var mode = $.cookie("mapmode");
  if (mode === null) {
    mode = 1;
  }
  if (mode && mode > 0) {
    var obj = $("#switch-citymap");
    obj.attr("data-mode", 0);
    obj.attr("checked", "checked");
    citymapSwitch(obj, true);
  }
}

function citymapSwitch(obj, instantly) {
  function show(obj) {
    if (instantly) {
      obj.css("display", "block");
    } else {
      obj.fadeIn(300);
    }
  }

  function hide(obj) {
    if (instantly) {
      obj.css("display", "none");
    } else {
      obj.fadeOut(300);
    }
  }

  obj = $(obj);
  switch (obj.attr("data-mode")) {
    case "0":
      obj.attr("data-mode", 1);
      $.cookie("mapmode", 1);

      var citymapHover = $("#citymap").find(".citymap-switch div");
      show(citymapHover);
      citymapHover.not("[data-active]").each(function () {
        //var id = $(this).index() + 1;
        var id = parseInt($(this).attr("class").replace("citymap-land-", ""));
        var building = $("#citymap-buildings").find(".build-" + id);
        hide(building);
        building.addClass("disabled");

        m.items[id] = {};
        m.items[id].nohide = true;
      });
      $("#citymap-legend").find(".mode-0").css("display", "none");
      $("#citymap-legend").find(".mode-1").css("display", "block");

      $("#citymap-buildings")
        .find(".disabled")
        .each(function () {
          var id = $(this)
            .attr("class")
            .replace(" disabled", "")
            .replace("build-", "");
          $("#map-area-" + id).attr("data-tooltip-dsb", 1);
        });

      break;
    case "1":
      obj.attr("data-mode", 0);
      $.cookie("mapmode", 0);

      var disabledBuildings = $("#citymap-buildings").find(".disabled");
      show(disabledBuildings.css("display", "none").removeClass("disabled"));
      hide($("#citymap").find(".citymap-switch div"));
      $("#citymap-legend").find(".mode-0").css("display", "block");
      $("#citymap-legend").find(".mode-1").css("display", "none");

      disabledBuildings.each(function () {
        var id = $(this).index() + 1;
        m.items[id] = {};
        m.items[id].nohide = $("#map-area-" + id).attr("nohide");
        $("#map-area-" + id).attr("data-tooltip-dsb", 0);
      });

      break;
  }
  return false;
}

function initObjectsChoose(id, radioname) {
  if ($.browser.msie) {
    $("#" + id + " .object-thumb").bind("click", function () {
      $(this).find("input")[0].click();
    });
  }
  $("#" + id + " input[name=" + radioname + "]").bind("click", function () {
    $("#" + id + " label").removeClass("selected");
    $(this).parents("label:first").addClass("selected");
  });
  $("#" + id + " input[name=" + radioname + "]:last")
    .attr("checked", true)
    .parents("label:first")
    .addClass("selected");
}

function showAlertSelectItem(
  title,
  text,
  button_title,
  items,
  field_name,
  form_action,
  params
) {
  if (items.length == 0) {
    return;
  }

  var html =
    '<div class="alert alert-big" id="' +
    field_name +
    '-alert" style="display:block">\
	<div class="padding">\
		<h2>' +
    title +
    '</h2>\
		<div class="clear data">\
			<form action="' +
    form_action +
    '" method="post">';
  for (var i in params) {
    html +=
      '<input type="hidden" name="' + i + '" value="' + params[i] + '" />';
  }
  html +=
    "<p>" +
    text +
    '</p>\
				<div class="objects objects-choose" id="reward1">\
					<h3>' +
    m.lang.LANG_ALERT_SELECT_ITEM +
    "</h3>";
  var j = 1;
  for (i in items) {
    if (typeof items[i]["image"] == "undefined") {
      continue;
    }
    html +=
      '<span class="object-thumb">\
						<label class="" for="objects-' +
      j +
      '">\
							<img src="/@/images/obj/' +
      items[i]["image"] +
      '" title="' +
      items[i]["name"] +
      '" alt="' +
      items[i]["name"] +
      '">';
    if (items[i]["amount"] > 1) {
      html += '<span class="count">' + items[i]["amount"] + "</span>";
    }
    html +=
      '			<b class="radio"><input type="radio" name="' +
      field_name +
      '" id="objects-' +
      j +
      '" value="' +
      i +
      '"></b>\
						</label>\
					</span>';
    j++;
  }
  html +=
    '<div class="actions">\
					<button class="button" type="submit">\
						<span class="f"><i class="rl"></i><i class="bl"></i><i class="brc"></i>\
							<div class="c">' +
    button_title +
    '</div>\
						</span>\
					</button>\
				</div>\
				<script type="text/javascript">\
					initObjectsChoose("reward1","' +
    field_name +
    '");\
				</script>\
			</form>\
		</div>\
	</div>\
</div>';
  $("body").append(html);
  $("#" + field_name + "-alert").css(
    "top",
    $(document).scrollTop() +
      $(window).height() / 2 -
      $("#" + field_name + "-alert").height() / 2
  );
}

function sovetBoostsX2(cb, id, sp1) {
  if (cb.checked) {
    $("#chars-" + id).html(
      $("#chars-" + id)
        .html()
        .replace(sp1 + "%", "<b>" + sp1 * 2 + "%</b>")
    );
    $("#price-" + id).html(
      formatNumber(
        $("#price-" + id)
          .html()
          .replace(/[^\d]/g, "") * 2,
        0,
        "",
        ","
      ) + "<i></i>"
    );
  } else {
    $("#chars-" + id).html(
      $("#chars-" + id)
        .html()
        .replace("<b>" + sp1 * 2 + "%</b>", sp1 + "%")
    );
    $("#price-" + id).html(
      formatNumber(
        $("#price-" + id)
          .html()
          .replace(/[^\d]/g, "") / 2,
        0,
        "",
        ","
      ) + "<i></i>"
    );
  }
}

function sovetJoinTeam(teamId) {
  postUrl(
    "/sovet/join-team/",
    {
      action: "join-team",
      teamId: teamId,
    },
    "post",
    1
  );
}

function sovetKickFromTeam(playerId) {
  postUrl(
    "/sovet/kick-from-team/",
    {
      action: "kick-from-team",
      playerId: playerId,
    },
    "post",
    1
  );
}

function sovetRestoreMe() {
  postUrl(
    "/sovet/restore-me/",
    {
      action: "restore-me",
    },
    "post",
    1
  );
}

function sovetTakePrize() {
  postUrl(
    "/sovet/take-prize/",
    {
      action: "take-prize",
    },
    "post",
    1
  );
}

function sovetTeamMessage() {
  postUrl(
    "/sovet/teams-message/",
    {
      action: "teams-message",
      text: $("#sovet-team-message").val(),
    },
    "post",
    1
  );
}

/* neft */

function pipelineScroll(pWidth) {
  if (typeof pWidth == "undefined") {
    pWidth = 1980;
  }

  $("#pipeline-scroll")
    .parents("div.pipeline-scroll-place:first")
    .css(
      "backgroundPosition",
      "-" + Math.round($("#pipeline-scroll").scrollLeft() / 6) + "px 0px"
    );
  if ($("#pipeline-scroll").scrollLeft() == 0) {
    $("#pipeline-arrow-left").hide();
  } else if (
    $("#pipeline-scroll")[0].offsetWidth + $("#pipeline-scroll").scrollLeft() >=
    pWidth
  ) {
    $("#pipeline-arrow-right").hide();
  } else {
    $("#pipeline-arrow-left").show();
    $("#pipeline-arrow-right").show();
  }
}
function neftPrepare() {
  $("#pipeline-scroll").bind("scroll", pipelineScroll);
  pipelineScroll();

  $("#pipeline-scroll").animate(
    {
      scrollLeft:
        Math.round(
          $("#pipeline-scroll").find("div.enemy-place:first").offset().left -
            $("#pipeline-scroll").offset().left -
            320
        ) + "px",
    },
    100
  );

  $("#pipeline-arrow-right").bind("click", function () {
    $("#pipeline-scroll").animate(
      {
        scrollLeft: "+=332px",
      },
      600
    );
  });
  $("#pipeline-arrow-left").bind("click", function () {
    $("#pipeline-scroll").animate(
      {
        scrollLeft: "-=332px",
      },
      600
    );
  });

  $("#ventel-avatar")
    .bind("mouseover", function (kmouse) {
      $("#ventel-overtip").show();
    })
    .bind("mousemove", function (kmouse) {
      var relative = $("#pipeline-scroll")
        .parents("div.pipeline-scroll-place:first")
        .offset();
      $("#ventel-overtip").css({
        left: kmouse.pageX + 15 - relative.left,
        top: kmouse.pageY + 15 - relative.top,
      });
    });
  $("#ventel-avatar").bind("mouseout", function () {
    $("#ventel-overtip").hide();
  });
}

function neftAttack(now) {
  postUrl(
    "/alley/",
    {
      now: now ? 1 : 0,
      action: "attack-npc3",
    },
    "post",
    1
  );
}

function generateTimerTable(obj, id, title, timer, timetotal, trigger) {
  var out =
    "<table class='process'>\
					<tr>\
						<td class='label'>" +
    title +
    "</td>\
						<td class='progress'>\
							<div class='exp'>\
								<div class='bar'>\
									<div>\
										<div class='percent' style='width:0%;' id='" +
    id +
    "bar'></div>\
									</div>\
								</div>\
							</div>\
						</td>\
						<td class='value'>\
							<span timer='" +
    timer +
    "' timer2='" +
    timetotal +
    "' id='train' intitle='1' trigger='" +
    trigger +
    "'>xx:xx</span>\
						</td>\
					</tr>\
				</table>";
  $(obj).html(out);
  countdown($("#" + id));
}

function generateMoney(money) {
  var out = "";
  for (var i in money) {
    if (money[i] < 1) {
      continue;
    }
    var cl = null;
    switch (i) {
      case "money":
        var cl = "tugriki";
        break;

      case "ore":
        var cl = "ruda";
        break;

      case "honey":
        var cl = "med";
        break;

      case "oil":
        var cl = "neft";
        break;

      case "medal":
      case "petarena_medal":
        var cl = "pet-golden";
        break;

      case "fight_star":
        var cl = "star";
        break;

      case "huntclub_mobile":
        var cl = "mobila";
        break;
      case "power_points":
        var cl = "power_points";
        break;
      case "huntbadge":
        var cl = "badge";
        break;
    }
    if (cl != null) {
      out +=
        "<span class='" + cl + "'>" + formatNumber(money[i]) + "<i></i></span>";
    }
  }
  return out;
}

/**
 * Всплывающее сообщение
 * @param string title
 * @param string text
 * @param bool error
 */
function showAlert(title, text, error, class2, relation, actions) {
  var cl;
  if (class2) {
    cl = class2;
  } else if (error) {
    cl = "alert-error";
  } else {
    cl = "";
  }
  if (title != "") {
    title = "<h2 id='alert-title'>" + title + "</h2>";
  }
  title +=
    '<span class="close-cross" onclick="closeAlert(this);" style="">×</span>';
  var l = $("div.alert").length + 1;
  var buttonHtml = "";
  var buttonDefault = false;
  var actionsHtml = "";
  if (actions) {
    if (typeof actions == "string") {
      var buttonDefault = true;
      var actionsHtml = actions;
    } else {
      var action;
      for (var i in actions) {
        action = actions[i];
        if (!action.empty) {
          if (action.isdisabled) {
            actionsHtml +=
              "&nbsp;<div class='button disabled'><span class='f'><i class='rl'></i><i class='bl'></i><i class='brc'></i><div class='c'>" +
              action.label +
              "</div></span></div>&nbsp;";
          } else if (action.onclick) {
            actionsHtml +=
              "&nbsp;<div class='button'><span class='f' onclick='" +
              action.onclick +
              "'><i class='rl'></i><i class='bl'></i><i class='brc'></i><div class='c'>" +
              action.label +
              "</div></span></div>&nbsp;";
          } else {
            actionsHtml +=
              "&nbsp;<div class='button'><a class='f' href='" +
              action.url +
              "' target='" +
              (action.target ? action.target : "_blank") +
              "'><i class='rl'></i><i class='bl'></i><i class='brc'></i><div class='c'>" +
              action.label +
              "</div></a></div>&nbsp;";
          }
        }
        if (action.isdefault) {
          buttonDefault = true;
          if (action.empty) {
            actionsHtml +=
              "<div class='button'><span class='f' onclick='$(this).parents(\"div.alert:first\").remove();'><i class='rl'></i><i class='bl'></i><i class='brc'></i><div class='c'>" +
              action.label +
              "</div></span></div>";
          }
        }
      }
    }
  }
  if (!buttonDefault) {
    buttonHtml =
      "<div class='button'><span class='f' onclick='$(this).parents(\"div.alert:first\").remove();'><i class='rl'></i><i class='bl'></i><i class='brc'></i><div class='c'>OK</div></span></div>";
  }
  buttonHtml += actionsHtml;
  text = render_content_items(text, true);
  var html =
    "<div class='alert " +
    cl +
    " alert" +
    l +
    "'><div class='padding'>" +
    title +
    "<div class='data'><div id='alert-text'>" +
    text +
    "</div><div class='actions'>" +
    buttonHtml +
    "</div></div></div></div>";
  var alert = $(html);
  $("body").append(alert);
  alert.show();

  var cssTop =
    alert.position().top - alert.height() / 2 + $(window).scrollTop();
  var cssLeft =
    parseInt(
      ($("body").width() -
        alert.width() -
        parseInt(alert.css("margin-left") * 2) / 2) /
        2
    ) + "px";

  if ($(".dungeon-map-view").length > 0) {
    var cssLeft = $(".welcome").offset().left + $(".welcome").width() / 2;
    var cssTop =
      $(".welcome").offset().top +
      $(".welcome").height() / 2 -
      $(".alert").height() / 2;
    $(".alert").css("top", cssTop);
  }

  alert.css("top", cssTop);
  //if (alert.is(".alert-auto")) {
  alert.css("left", cssLeft);
  //}

  if (relation) {
    relation = $(relation).length
      ? $(relation)
      : _top.$(ChatUI.getIframe("game-frame")).find(relation);
    if (relation && relation.offset()) {
      var left =
        relation.offset().left + relation.width() / 2 - alert.width() / 2;
      alert
        .offset({
          left: left,
        })
        .offset({
          left: left,
        });
    }
  }
  alertBindMove(alert);
  return alert;
}

function alertBindMove(alertobj) {
  if (typeof alertobj == "undefined") {
    var alertobj = "div.alert";
  }
  $(alertobj)
    .not("[data-bind-move=1]")
    .find("h2:first")
    .bind("mousedown.movealert", alertMoveEvent);
  $(alertobj).attr("data-bind-move", "1");
}

var __alertStartPage = null;
function alertMoveEvent(e, bind) {
  var alertobj = $(this).parents("div.alert:first");
  __alertStartPage = {
    x: e.screenX,
    y: e.screenY,
  };
  var b = $("body");
  b.bind("mousemove.movealert", function (e) {
    var diff = {
      x: e.screenX - __alertStartPage.x,
      y: e.screenY - __alertStartPage.y,
    };
    __alertStartPage = {
      x: __alertStartPage.x + diff.x,
      y: __alertStartPage.y + diff.y,
    };
    $(alertobj).offset({
      top: $(alertobj).offset().top + diff.y,
      left: $(alertobj).offset().left + diff.x,
    });
  });
  b.addClass("noselect");
  b.bind("mouseup.movealert", function () {
    $("body")
      .removeClass("noselect")
      .unbind("mousemove.movealert")
      .unbind("mouseup.movealert");
  });
}

/**
 * Обработка массива алертов (как бы это делал Page, но без actions)
 * @param string title
 * @param string text
 * @param bool error
 */
function showPageAlerts(alerts) {
  var alert;
  for (var i = 0; i < alerts.length; i++) {
    alert = alerts[i];
    showAlert(alert.title, alert.text, null, alert.class2);
  }
}

function showPrompt(title, input, text, value, func) {
  if (title != "") {
    title = "<h2 id='alert-title'>" + title + "</h2>";
  }
  var l = $("div.alert").length + 1;
  var html =
    "<div class='alert alert" +
    l +
    "'><div class='padding'>" +
    title +
    "<div class='data'>\n\
			<div id='alert-text'>\n\
			<p><b>" +
    "Имя питомца:" +
    '</b><br />\n\
			<input name="' +
    input +
    '" type="text" style="width: 100%" maxlength="30" value="' +
    value +
    '" /></p>\n\
			<p>' +
    text +
    "</p>\n\
			</div><div class='actions'><div class='button'><span class='f' onclick=" +
    func +
    "><i class='rl'></i><i class='bl'></i><i class='brc'></i><div class='c'>" +
    "Отправить" +
    "</div></span></div></div></div></div></div>";
  $("body").append(html);
  $("div.alert" + l).show();
  $("div.alert" + l).css(
    "top",
    $("div.alert" + l).position().top + $(window).scrollTop()
  );
}

var callbacks = [];
function serialize(obj) {
  var returnVal;
  if (obj != undefined) {
    switch (obj.constructor) {
      case Array:
        var vArr = "[";
        for (var i = 0; i < obj.length; i++) {
          if (i > 0) vArr += ",";
          vArr += serialize(obj[i]);
        }
        vArr += "]";
        return vArr;

      case String:
        returnVal = escape("'" + obj + "'");
        return returnVal;
      case Number:
        returnVal = isFinite(obj) ? obj.toString() : null;
        return returnVal;
      case Date:
        returnVal = "#" + obj + "#";
        return returnVal;
      default:
        if (typeof obj == "object") {
          var vobj = [];
          for (attr in obj) {
            if (typeof obj[attr] != "function") {
              vobj.push('"' + attr + '":' + serialize(obj[attr]));
            }
          }
          if (vobj.length > 0) return "{" + vobj.join(",") + "}";
          else return "{}";
        } else {
          return obj.toString();
        }
    }
  }
  return null;
}
function closeAlert(obj) {
  $(obj).parents("div.alert:first").remove();
}
function unfreezeButton(obj) {
  $(obj).removeAttr("disabled").removeClass("disabled");
  $(obj)[0].disabled = false;
}

function showConfirm(text, buttons, params) {
  if (!params) {
    params = {};
  }
  if (params["__title"]) {
    var title = "<h2 id='alert-title'>" + params["__title"] + "</h2>";
    params["__title"] = null;
  } else {
    var title = "<h2 id='alert-title'>" + m.lang.LANG_MAIN_CONFIRM + "</h2>";
  }

  var l = $("div.alert").length + 1;
  var paramsCss;
  if (typeof params == "undefined") {
    params = {};
  } else {
    if (params["__image"]) {
      var image = params["__image"];
      params["__image"] = null;
    }
    if (params["__hint"]) {
      var hint = params["__hint"];
      params["__hint"] = null;
    }
    if (params["__css"]) {
      paramsCss = params["__css"];
      params["__css"] = null;
    }
  }

  var html =
    "<div class='alert alert" +
    l +
    "' " +
    (params["__id"] ? "id='" + params["__id"] + "'" : "") +
    "><div class='padding'>" +
    title +
    "<div class='data'><div id='alert-text' class='clear'>";
  if (image) {
    html +=
      "<img align='left' src='/@/images/obj/" +
      image +
      "' style='margin: -25px 10px 0pt 0pt;' /><p style='margin: 0pt; padding: 22px 0pt 0pt;'>" +
      text +
      "</p>";
  } else {
    html += text;
  }
  html += "</div><div class='actions'>";
  for (var i = 0; i < buttons.length; i++) {
    if (
      buttons[i] != null &&
      buttons[i] != "IndexOf" &&
      typeof buttons[i]["title"] != "undefined"
    ) {
      var title = buttons[i]["title"];
      var callback = buttons[i]["callback"];
    } else {
      var title = i;
      var callback = buttons[i];
    }
    if (callback === null || callback == "") {
      callback = function (obj, params) {
        closeAlert(obj);
      };
    }
    var n = callbacks.length;
    callbacks[n] = callback;
    html +=
      "<button class='button' style='margin:5px 0 0' onclick='callbacks[" +
      n +
      "](this, " +
      new String(JSON.stringify(params)).replace("'", "\\'") +
      ");'><span class='f'><i class='rl'></i><i class='bl'></i><i class='brc'></i><div class='c'>" +
      title +
      "</div></span></button>&nbsp; &nbsp;";
  }
  if (hint) {
    html += "<div class='hint' style='margin-top:5px'>" + hint + "</div>";
  }
  html +=
    "</div></div></div><span class='close-cross' onclick='closeAlert(this);'>&#215;</span></div>";
  $("body").append(html);
  //$('.action.disabled').removeClass('disabled');
  var alert = $("div.alert" + l);
  alert.show();
  alert.css(
    "top",
    alert.position().top - alert.height() / 2 + $(window).scrollTop()
  );
  if (paramsCss) {
    for (var style in paramsCss) {
      $("div.alert" + l).css(style, paramsCss[style]);
    }
  }
  alertBindMove();
}

/* alley - flash fight */

function thisMovie(movieName) {
  if (navigator.appName.indexOf("Microsoft") != -1) {
    return window[movieName];
  } else {
    return document[movieName];
  }
}

function fightAnimationBack() {
  if ($("#controls-back").hasClass("disabled")) {
    return;
  }
  $("#controls-back").addClass("disabled");
  $("#controls-play").removeClass("disabled");
  $("#controls-forward").removeClass("disabled");
  fightAnimationResultHide();
  $("#fight-animation-result-link").hide();

  // метод, определенный во флешке
  thisMovie("fightgame").rewindFlashFromJS();
}
function fightAnimationPlay() {
  if ($("#controls-play").hasClass("disabled")) {
    return;
  }
  $("#controls-back").removeClass("disabled");
  $("#controls-play").addClass("disabled");
  $("#controls-forward").removeClass("disabled");
  fightAnimationResultHide();

  // метод, определенный во флешке
  thisMovie("fightgame").playFlashFromJS();
}
function fightAnimationForward() {
  if ($("#controls-forward").hasClass("disabled")) {
    return;
  }
  $("#controls-back").removeClass("disabled");
  $("#controls-play").addClass("disabled");
  $("#controls-forward").addClass("disabled");
  fightAnimationResultShow();

  // метод, определенный во флешке
  thisMovie("fightgame").goForwardFlashFromJS();
}
function fightAnimationResultHide() {
  $("#fight-animation-result").hide();
  $("#fight-animation-result-link").show("fast");
}
function fightAnimationResultShow() {
  $("#fight-animation-result").show();
  $("#fight-animation-result-link").hide();
}

function showOverFlashWin() {
  //метод, вызываемый из флешки
  fightAnimationResultShow();
}

/* Pyramid */
function pyramidBuy(amount) {
  $("button.button").attr("disabled", "disabled").addClass("disabled");
  $.post(
    "/pyramid/buy/" + amount + "/",
    {
      action: "buy",
      amount: amount,
      ajax: 1,
      postkey: postVerifyKey,
    },
    function (data) {
      $("button.button").removeAttr("disabled").removeClass("disabled");
      pyramidProcessResult(data);
    },
    "json"
  );
}

function pyramidSell(amount) {
  $("button.button").attr("disabled", "disabled").addClass("disabled");
  $.post(
    "/pyramid/sell/" + amount + "/",
    {
      action: "sell",
      ajax: 1,
      postkey: postVerifyKey,
    },
    function (data) {
      $("button.button").removeAttr("disabled").removeClass("disabled");
      pyramidProcessResult(data);
    },
    "json"
  );
}

function pyramidForecast() {
  $("button.button").attr("disabled", "disabled").addClass("disabled");
  $("#pyramid-forecast-advice").html(
    '<div class="hint">' + m.lang.LANG_PYRAMID_BABUSHKA + "</div>"
  );
  $.post(
    "/pyramid/forecast/",
    {
      action: "forecast",
      ajax: 1,
      postkey: postVerifyKey,
    },
    function (data) {
      $("button.button").removeAttr("disabled").removeClass("disabled");
      pyramidProcessResult(data);
    },
    "json"
  );
}

function pyramidProcessResult(data) {
  if (data["wallet"]) {
    updateWallet(data["wallet"]);
  }
  if (data["result"] == 0) {
    showAlert(m.lang.LANG_MAIN_105, data["error"], 1);
  } else if (data["text"]) {
    showAlert("", data["text"], 1);
  }
  if (data["pyramid"]) {
    animateNumber($("#pyramid_cost"), data["pyramid"]["pyramid_cost"]);
    animateNumber($("#pyramid_partners"), data["pyramid"]["pyramid_partners"]);
    animateNumber($("#pyramid_fond"), data["pyramid"]["pyramid_fond"]);
    if (data["pyramid"]["pyramid_state"] == "crashed") {
      $("#pyramid-working").hide();
      $("#pyramid-crashed")
        .find("span.timeleft")
        .attr("timer", data["pyramid"]["pyramid_start_in"]);
      countdown($("#pyramid-crashed").find("span.timeleft"));
      $("#pyramid-crashed").show();
    }
  }
  if (data["player"]) {
    animateNumber($("#your_pyramids"), data["player"]["your_pyramids"]);
    animateNumber(
      $("#your_pyramids_sum"),
      data["player"]["your_pyramids"] * data["pyramid"]["pyramid_cost"]
    );
    $("#pyramidButtonSell").show();
    if (data["player"]["when_action_avail"] != 0) {
      $("#pyramid-buy-form").remove();
      $("#pyramidButtonSell").remove();
      $("#nextactiondt")
        .find("span.timeleft")
        .html(data["player"]["when_action_avail"]);
      $("#nextactiondt").show();
    }
  }
  if (data["advise"]) {
    $("#pyramid-forecast-advice").html(
      '<div class="hint">' + data["advise"] + "</div>"
    );
  }
}
/* /Pyramid */

/* Tutorial */

function moveTutorialArrow(arrow) {
  if (arrow == "slogan") {
    if (
      tutorial.curStep &&
      tutorial.curStep == "slogan" &&
      $("#slogan-input").val().length > 10
    ) {
      tutorial.hideArrow();
      tutorial.moveArrow($("#slogan-save"));
    }
  } else if (arrow == "nickname") {
    if (
      tutorial.curStep &&
      tutorial.curStep == "start" &&
      $("#person-name").val().length > 5
    ) {
      tutorial.hideArrow();
      tutorial.moveArrow($("#startquest-btn"));
    }
  } else if (arrow == "sportloto") {
    if (tutorial.curStep && tutorial.curStep == "sportloto") {
      tutorial.hideArrow();
      tutorial.moveArrow($("#button-ticket-get"));
    }
  }
}

/* Factory */
function factoryAutopetriks() {
  postUrl(
    "/factory/autopetriks/",
    {
      action: "autopetriks",
    },
    "post",
    function () {
      AngryAjax.reload();
    }
  );
}

/* Factory */
function factoryBadlab() {
  postUrl(
    "/factory/badlab/",
    {
      action: "badlab",
    },
    "post",
    function () {
      AngryAjax.reload();
    }
  );
}

function factoryAutopetriksOn() {
  postUrl(
    "/factory/autopetriks-on/",
    {
      action: "autopetriks-on",
    },
    "post",
    function () {
      AngryAjax.reload();
    }
  );
}

function factoryAutopetriksOff() {
  postUrl(
    "/factory/autopetriks-off/",
    {
      action: "autopetriks-off",
    },
    "post",
    function () {
      AngryAjax.reload();
    }
  );
}

function factoryAutopetriksAutoextension() {
  if ($("#autopetriks-extension").is("[disabled='disabled']")) {
    return false;
  }
  $("#autopetriks-extension").attr("disabled", "disabled");
  if ($("#autopetriks-extension").is(":checked")) {
    var st = 1;
  } else {
    var st = 0;
  }
  $.post(
    "/factory/autoextension-" + (st == 1 ? "on" : "off") + "/",
    {
      action: "autoextension-" + (st == 1 ? "on" : "off"),
      ajax: 1,
    },
    function (data) {
      $("#autopetriks-extension").removeAttr("disabled");
    }
  );
}

function factoryAutopetriksAutoChange() {
  if ($("#autopetriks-autochange").is("[disabled='disabled']")) {
    return false;
  }
  $("#autopetriks-autochange").attr("disabled", "disabled");
  if ($("#autopetriks-autochange").is(":checked")) {
    var st = 1;
  } else {
    var st = 0;
  }
  $.post(
    "/factory/autochange-" + (st == 1 ? "on" : "off") + "/",
    {
      action: "autochange-" + (st == 1 ? "on" : "off"),
      ajax: 1,
    },
    function (data) {
      $("#autopetriks-autochange").removeAttr("disabled");
    }
  );
}

function factoryInitStripeMf() {
  $("#elementNumStripes").text("#" + factoryHaveStripes);
  $("#elementItemStripes").text(
    factoryItemStripes + "/" + factoryItemMaxStripes
  );
  /*if (factoryHaveStripes > 0) {
	 $('#buttonMfStripeDo').removeClass('disabled');
	 } else {
	 $('#buttonMfStripeDo').addClass('disabled');
	 }*/

  var pctStats = [];
  for (var stat in factoryStripeBonus) {
    var statVal = factoryStripeBonus[stat];
    var intStat = parseInt(statVal);
    var pctStat = ((statVal - intStat) * 1000).toFixed(2);
    if (pctStat != "0.00") {
      if (pctStat[pctStat.length - 1] == 0) {
        pctStat = pctStat.substr(0, pctStat.length - 1);
      }

      pctStats.push([l[stat.substr(0, 3).toUpperCase()], pctStat]);
    }
  }
  if (pctStats.length > 0) {
    var ulDom = $("<ul></ul>");
    for (var i in pctStats) {
      ulDom.append(
        "<li><span>" +
          pctStats[i][0] +
          ": </span><b>+" +
          pctStats[i][1] +
          "%</b></li>"
      );
    }
    $("#divPctStats").html(ulDom);
  } else {
    $("#divPctStats").html("У этой шмотки еще нет процентных усилений.");
  }

  if (factoryItemStripes >= factoryItemMaxStripes) {
    if (!factoryStripeFull) {
      $("#buttonStripeExpand").show();
      $("#buttonMfStripeDo").hide();
    } else {
      $("#buttonStripeExpand").hide();
      $("#buttonMfStripeDo").hide();
      $("#stripeFull").fadeIn("slow");
    }
  } else {
    $("#buttonStripeExpand").hide();
    $("#buttonMfStripeDo").show();
  }

  if (factoryHaveStripes == 0) {
    $("#buttonStripeExpand").hide();
    $("#buttonMfStripeDo").hide();
    $("#stripeEmpty").fadeIn("slow");
  }
}

function factoryMfStripeDo(item_id) {
  $.post(
    "/factory/mf-stripe/",
    {
      ajax: 1,
      action: "mf-stripe",
      item: item_id,
    },
    function (data) {
      if (data["result"]) {
        factoryStripeBonus = data["stripe_bonus"];
        factoryHaveStripes = data["stripe_have"];
        factoryItemStripes = data["stripe_uses"];
        factoryStripeFull = data["stripe_full"];
        factoryItemStripesCount = data["stripe_count"];
        factoryInitStripeMf();

        $("div.stripe-block div.stat span.num").text(
          data["prof_value"] + "/" + data["prof_nextlevel"]
        );
        $("div.stripe-block div.stat div.rank span").text(data["prof_name"]);
        $("div.stripe-block div.stat div.bar .percent").width(
          data["prof_percent"] + "%"
        );

        var percent = parseInt((data["stripe"] * 100) / data["max_stripe"]);
        $("div.stripe-block div.stripe-bar .percent").width(percent + "%");

        var stripesAmount = $(".stripe-slot-active").length;
        if (stripesAmount > 0) {
          if (data["stripe"] == data["max_stripe"]) {
            var percent2 = 100;
          } else {
            var percent2 = Math.round(
              ((data["stripe"] % (data["max_stripe"] / stripesAmount)) /
                (data["max_stripe"] / stripesAmount)) *
                100
            );
          }
          if (percent2 == 0) {
            $(".stripe-slot-active")
              .not(".full")
              .first()
              .addClass("full")
              .find(".percent")
              .width("100%");
          }
          $(".stripe-slot-active")
            .not(".full")
            .first()
            .find(".percent")
            .width(percent2 + "%");
        }

        $("div.stripe-block .prob_stripe_excelent").text(
          data["prob_stripe_excelent"]
        );

        if (data["text"]) {
          showAlert(
            m.lang.LANG_ALERT_SUCCESS_TITLE,
            data["text"],
            false,
            "",
            ".welcome"
          );
        }
      } else {
        if (data["error"]) {
          showAlert(m.lang.LANG_MAIN_105, data["error"], true, "", ".welcome");
        }
      }
    },
    "json"
  );
  return true;
}

function factoryMfZingerDo(item_id) {
  $.post(
    "/factory/mf-zinger/",
    {
      ajax: 1,
      action: "mf-zinger",
      item: item_id,
    },
    function (data) {
      if (data["result"]) {
        if (data["ok"]) {
          AngryAjax.reload();
        }
      } else {
        if (data["error"]) {
          showAlert(m.lang.LANG_MAIN_105, data["error"], true, "", ".welcome");
        }
      }
    },
    "json"
  );
  return true;
}

/* Factory end */

/* Respect */
$("#respect-reset").live("click", function () {
  var buttons = [];
  buttons.push({
    title: "Да" + '<span class="med">35<i></i></span>',
    callback: function () {
      postUrl(
        "/player/",
        {
          action: "respectReset",
        },
        "post",
        1
      );
    },
  });
  buttons.push({
    title: "Нет",
    callback: null,
  });
  showConfirm("<center>Хотите сбросить респект в ноль?</center>", buttons, {
    __title: "Сбросить респект",
  });
});
/* /Respect */

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function array_shuffle(arr) {
  return arr.sort(function () {
    return 0.5 - Math.random();
  });
}

function russianNumeral(n, form1, form2, form5) {
  n = Math.abs(n) % 100;
  n1 = n % 10;

  if (n > 10 && n < 20) return form5;
  if (n1 > 1 && n1 < 5) return form2;
  if (n1 == 1) return form1;
  return form5;
}

/* function buttonGadgetHtml() {
 return '<div class="showbag-button" onclick="$(\'td.slots-cell\').toggleClass(\'showbag\');"><div class="text"><span class="dashedlink">Гаджеты</span></div></div>';
 } */

/* TREAT SLOT */
function treatSlot(dom) {
  var slot = $(dom).attr("slot");
  if (!slot) {
    showAlert(moswar.lang.ERROR_TITLE, moswar.lang.TREAT_SLOT_UNDEFINED_SLOT);
    return false;
  }

  var buttons = new Array();

  /* Medicine chest */
  buttons.push({
    title:
      moswar.lang.TREAT_SLOT_MEDICINE_CHEST_TITLE +
      " - <span class='" +
      moswar.lang.TREAT_SLOT_MEDICINE_CHEST_VALUTE +
      "'>" +
      moswar.lang.TREAT_SLOT_MEDICINE_CHEST_PRICE +
      "<i></i></span>",
    callback: function (obj, params) {
      doTreatSlot(slot, "medicine_chest", dom);
      closeAlert(obj);
      return false;
    },
  });

  /* Honey */
  buttons.push({
    title:
      moswar.lang.TREAT_SLOT_INSTANT_TITLE +
      " - <span class='" +
      moswar.lang.TREAT_SLOT_INSTANT_VALUTE +
      "'>" +
      moswar.lang.TREAT_SLOT_INSTANT_PRICE +
      "<i></i></span>",
    callback: function (obj, params) {
      doTreatSlot(slot, "instant", dom);
      closeAlert(obj);
      return false;
    },
  });

  /* Cancel */
  buttons.push({
    title: moswar.lang.CLOSE,
    callback: null,
  });

  showConfirm(moswar.lang.TREAT_SLOT_DESCRIPTION, buttons, {
    __title: moswar.lang.TREAT_SLOT_TITLE,
    __css: {
      width: "auto",
    },
  });

  return false;
}

function doTreatSlot(slot, treatType, dom) {
  switch (treatType) {
    case "instant":
    case "medicine_chest":
      break;
    default:
      showAlert(moswar.lang.ERROR_TITLE, moswar.lang.TREAT_SLOT_UNDEFINED_TYPE);
      return false;
      break;
  }

  $.ajax({
    url: "/player/treat-slot/",
    type: "POST",
    data: {
      treatType: treatType,
      slot: slot,
    },
    dataType: "json",
    success: function (data) {
      if (data.error) {
        showAlert(moswar.lang.ERROR_TITLE, data.error.join("<br />"));
      } else {
        $(dom).parent().parent().empty().removeClass("injured");

        if (treatType == "medicine_chest") {
          updateInventoryMedicineChest(1, "-");
        }

        var honey = data.spend.before.honey - data.spend.after.honey;
        var ore = data.spend.before.ore - data.spend.after.ore;

        updatePlayerBlockHoney(honey, "-");
        updatePlayerBlockOre(ore, "-");

        showAlert(
          moswar.lang.TREAT_SLOT_OK_TITLE,
          moswar.lang.TREAT_SLOT_OK_DESCRIPTION +
            "<b>" +
            data.slot +
            "</b>" +
            "."
        );
      }
    },
  });
}

function updateInventoryMedicineChest(count, op) {
  var medicineChestObj = $("#inventory-antitravmer-btn");
  if (medicineChestObj.length) {
    var countObj = $("#inventory-antitravmer-btn").prev();
    var countHave = parseInt(countObj.html().replace(/#/, ""));

    /* Calculate */
    if (op == "-") {
      countHave -= count;
    } else if (op == "+") {
      countHave += count;
    }

    /* Replace or remove */
    if (countHave == 0) {
      medicineChestObj.parent().parent().remove();
    } else {
      countObj.html("#" + countHave);
    }
  }
}

function setMainTimer(timer, location, endtime) {
  var obj = $("#timeout");
  if (timer == 0 || location === null) {
    obj.attr("timer", 0).hide();
    return;
  }
  obj
    .attr("href", "/" + location + "/")
    .attr("timer", timer)
    .attr("endtime", endtime)
    .show();
  countdown(obj);
}

function cooldownReset(type) {
  var cost = $(".need-some-rest:first .hint-msg .button .c .tonus").text();
  if (
    type == "tonus" &&
    player.energy < cost &&
    player.energy < player.maxenergy
  ) {
    jobShowTonusAlert();
    return;
  }
  $.post(
    "/alley/",
    {
      action: "rest_cooldown",
      code: type,
      ajax: true,
    },
    function (data) {
      if (data["result"] == "ok") {
        $(".need-some-rest .holders .timer").attr("timer", 0);
        if (data["energy"] != undefined) {
          setEnergy(data["energy"]);
        }
        $(".need-some-rest ").hide();
        $("#timeout").hide();
        $(".no-rest").show();
      } else {
        showAlert(l.LANG_STR_ERROR, data["result"], true);
      }
    },
    "json"
  );
}

function setClanTimer(timer, location, endtime, tooltip) {
  var obj = $("#timeout2");
  if (timer == 0 || location === null) {
    obj.attr("timer", 0).hide();
    return;
  }
  obj
    .attr({
      href: "/" + location + "/",
      timer: timer,
      endtime: endtime,
      title: tooltip,
    })
    .show();
  simple_tooltip(obj, "tooltip");
  countdown(obj);
}

var PlayerView = {
  noobShield: false,

  showRegalias: function () {
    var header = $("#gifts").find("h3");
    if (header.hasClass("showed-t")) {
      header.removeClass("showed-t");
      var giftsPreviewAmount = $("#gifts").attr("data-preview-amount");
      header.html(
        "Регалии (" +
          giftsPreviewAmount +
          "/" +
          $("#gifts").attr("data-count") +
          ') <span class="link-dashed" onclick="PlayerView.showRegalias();">' +
          "Показать все" +
          "</span>"
      );
      $("#gifts-hider").hide();
    } else {
      $("#gifts h3").html(
        "Регалии (" +
          $("#gifts img").length +
          ')<span class="link-dashed" onclick="PlayerView.showRegalias();">' +
          "Свернуть" +
          "</span>"
      );
      header.addClass("showed-t");
      $("#gifts-hider").show();
    }
  },

  showRegalias2: function () {
    var header = $("#gifts3").find("h3");
    if (header.hasClass("showed-t")) {
      header.removeClass("showed-t");
      header.html(
        "Регалии (" +
          $("#gifts").attr("data-preview-amount") +
          "/" +
          $("#gifts").attr("data-count") +
          ') <span class="link-dashed" onclick="PlayerView.showRegalias2();">' +
          "Показать все" +
          "</span>"
      );
      $("#gifts-hider").hide();
    } else {
      $("#gifts h3").html(
        "Регалии (" +
          $("#gifts img").length +
          ')<span class="link-dashed" onclick="PlayerView.showRegalias2();">' +
          "Свернуть" +
          "</span>"
      );
      header.addClass("showed-t");
      $("#gifts-hider").show();
    }
  },

  init: function () {
    $("#gifts3").find("img:gt(9)").wrapAll('<div id="gifts3-hider" />');
    $("#gifts3-hider").hide();

    var giftsPreviewAmount = $("#gifts").attr("data-preview-amount") - 1;
    $("#gifts")
      .find("img:gt(" + giftsPreviewAmount + ")")
      .wrapAll('<div id="gifts-hider" />');
    $("#gifts-hider").hide();

    var gifts2PreviewAmount = $("#gifts2").attr("data-preview-amount") - 1;
    $("#gifts2")
      .find("img:gt(" + gifts2PreviewAmount + ")")
      .wrapAll('<div id="gifts2-hider" />');
    $("#gifts2-hider").append($("#allgifts").parent());
    $("#gifts2-hider").hide();

    if ($(".relict-block").length) {
      Relict.init();
    }

    // submarine
    if ($("#submarine").length > 0) {
      var $submarine = $("#submarine");

      if (parseInt($(window).height()) < 1000) {
        var newWidth = Math.max(
          (250 * parseInt($(window).height())) / 1000,
          200
        );
        $submarine.find(".submarine__wrapper").css({
          bottom: 300,
        });
        //$submarine.find('.submarine__nose_img').css({width: newWidth});
        //$submarine.find('.submarine__tail_img').css({width: newWidth});
      }

      var submarineCSS = {
        bottom: -550,
        display: "block",
      };
      if (parseInt($("body").css("margin-right")) > 0) {
        submarineCSS["left"] = -parseInt($("body").css("margin-right")) + "px";
      }
      $submarine.css(submarineCSS).animate(
        {
          bottom: 0,
        },
        500
      );

      $("body").one("gotourl_before", function () {
        $submarine.removeClass("transition").animate(
          {
            bottom: -550,
          },
          500
        );
        $(window).off("scroll.submarine");
      });
      var scrollMax = Math.max(
        $(document).height() - $(window).height() - 200,
        50
      );
      $(window).on("scroll.submarine", window, function () {
        $submarine.addClass("transition").css({
          bottom: -550 * ($(document).scrollTop() / scrollMax) * 2,
        });
      });
    }

    $("#allgifts").click(function (e) {
      e.preventDefault();
      $.get(document.location.href + "allgifts", {}, function (data) {
        $("#gifts2").append(data);
        PlayerView.gifts2 = $("#gifts2").find("img").length;

        var giftsPreviewAmount = $("#gifts2").attr("data-preview-amount");
        $("#gifts2")
          .find("img:gt(" + (giftsPreviewAmount - 1) + ")")
          .wrapAll('<div id="gifts2-hider" />');
        var header = $("#gifts2").find("h3");
        $("#gifts2")
          .find("h3")
          .html(
            "Подарки (" +
              $("#gifts2").find("img").length +
              ')<span class="link-dashed" onclick="PlayerView.showGifts();">' +
              "Свернуть" +
              "</span>"
          );
        header.addClass("showed-t");
        $("#gifts2-hider").show();
        simple_tooltip("#gifts2 img:gt(100)", "tooltip");
        $("#allgifts").remove();
      });
    });
  },

  gifts2: null,

  showGifts: function () {
    var header = $("#gifts2").find("h3");
    if (header.hasClass("showed-t")) {
      header.removeClass("showed-t");
      var giftsPreviewAmount = $("#gifts2").attr("data-preview-amount");
      header.html(
        "Подарки (" +
          giftsPreviewAmount +
          "/" +
          this.gifts2 +
          ')<span class="link-dashed" onclick="PlayerView.showGifts();">' +
          "Показать все" +
          "</span>"
      );
      $("#gifts2-hider").hide();
    } else {
      $("#gifts2")
        .find("h3")
        .html(
          "Подарки (" +
            $("#gifts2").find("img").length +
            ')<span class="link-dashed" onclick="PlayerView.showGifts();">' +
            "Свернуть" +
            "</span>"
        );
      header.addClass("showed-t");
      $("#gifts2-hider").show();
    }
  },

  switchExtendedEquipment: function () {
    if ($("#content").hasClass("extended")) {
      $("td.dopings-cell dt span.htab[htab='dopings']").click();
      $("#content").removeClass("extended");
      $(
        "td.dopings-cell div.object-thumbs[htab=cocktails] div.action[data-id*='shake']"
      )
        .parents("div.object-thumb")
        .prependTo($("td.dopings-cell div.object-thumbs[htab=dopings]"));
    } else {
      $("#content").addClass("extended");
      HTabs.initHTabs($("td.dopings-cell"));
      $(
        "td.dopings-cell div.object-thumbs[htab=dopings] div.action[data-id*='shake']"
      )
        .parents("div.object-thumb")
        .prependTo($("td.dopings-cell div.object-thumbs[htab=cocktails]"));
    }
  },

  switchBackground: function (obj, img) {
    if (!$(obj).hasClass("active")) {
      $(obj).parent().find(".active").removeClass("active");
      $(obj).addClass("active");
      $("#personal-bg").css("backgroundImage", "url(" + img + ")");
    }
  },

  switchProfile: function (state) {
    state = parseInt(state);
    $("#pers-profile-toggle").find(".state").removeClass("active");
    $("#pers-profile-toggle")
      .find(".state:eq(" + state + ")")
      .addClass("active");
    var slots = $("#pers-player-info").find(".slots").detach();
    if (state) {
      // $('li.avatar')[0].style="top:80px;";
      // $('.slot-pet')[0].style="top:220px;";
      // $('.slot-pet2')[0].style="top:160px;";

      $("#pers-player-info").find(".personal-layout").show().append(slots);
      $("#pers-player-info").find(".layout").hide();

      if (PlayerView.noobShield) {
        $(".slot9, .slot10")
          .html('<img src="/@/images/obj/noob_shield.png" tooltip="1">')
          .removeClass("empty")
          .addClass("notempty")
          .find("img")
          .css("opacity", "0.3");
      }
    } else {
      // $('li.avatar')[0].style="";
      // $('.slot-pet')[0].style="top:200px;";
      // $('.slot-pet2')[0].style="top:140px;";
      $("#pers-player-info")
        .find(".layout")
        .show()
        .find(".slots-cell")
        .append(slots);
      $("#pers-player-info").find(".personal-layout").hide();
      if (PlayerView.noobShield) {
        $(
          ".slot1, .slot2, .slot3, .slot4, .slot5, .slot6, .slot6, .slot7, .slot8"
        )
          .html('<img src="/@/images/obj/noob_shield.png" tooltip="1">')
          .removeClass("empty")
          .addClass("notempty")
          .find("img")
          .css("opacity", "0.3");
        $(".slot9")
          .find("img")
          .css({
            opacity: 1,
            width: "128px",
            height: "128px",
            "max-width": "128px",
            "z-index": 2,
            position: "relative",
            background: "none",
            top: "-64px",
            left: "3px",
          })
          .attr("data-no-style", 1)
          .attr("src", "/@/images/obj/noob_shield128.png")
          .attr("data-image", "/@/images/obj/noob_shield.png");
        $(".slot10").html("<img />");
      }
    }
  },

  flowerOnChange: function (newVal) {
    if (typeof newVal == "undefined") {
      var newVal = parseInt($(".flowerNum").val());
    }
    var origFlowerNum = parseInt($(".origFlowerNum").val());
    var maxFlowers = origFlowerNum;
    if ($("#buy-more-flowers").is(":checked")) {
      maxFlowers += parseInt($(".honeyNum").val());
    }
    if (newVal > maxFlowers) {
      newVal = maxFlowers;
      $(".flowerNum").val(newVal);
    }
    var honeyFlowers = newVal - origFlowerNum;
    if (honeyFlowers > 0) {
      $(".flowerHoneyValue").html(
        '<span class="med">' + honeyFlowers + "<i></i></span>"
      );
    } else {
      $(".flowerHoneyValue").html("");
    }
  },

  flowerEventChooseAll: function (target) {
    //var $tgt = $(target);
    //var $inputContainer = $tgt.parent().siblings('.c');
    var $inputContainer = $(".bouquet");
    var totalNum = 0;
    var honeyNum = 0;
    totalNum += parseInt($inputContainer.find(".origFlowerNum").val());
    if ($(".buy-more").find("input:checked").length > 0) {
      honeyNum = parseInt($inputContainer.find(".honeyNum").val());
      totalNum += honeyNum;
    }
    $inputContainer.find(".flowerNum").val(totalNum);
    if (honeyNum > 0) {
      $(".flowerHoneyValue").html(
        '<span class="med">' + honeyNum + "<i></i></span>"
      );
    } else {
      $(".flowerHoneyValue").html("");
    }
  },

  flowerEventSwitchHoney: function (target) {
    if (!target.checked) {
      var $tgt = $(target);
      var $inputContainer = $tgt.parent().siblings(".bouquet");
      var currentNum = parseInt($inputContainer.find(".flowerNum").val());
      var haveFlowers = parseInt($inputContainer.find(".origFlowerNum").val());
      if (currentNum > haveFlowers) {
        $inputContainer.find(".flowerNum").val(haveFlowers);
      }
      $inputContainer.siblings(".button").find(".flowerHoneyValue").html("");
    }
  },

  flowerEventInputFocusout: function (target) {
    var $tgt = $(target);
    var currentNum = parseInt($tgt.val());
    var $inputContainer = $tgt.parent();
    var maxNum = 0;

    maxNum += parseInt($inputContainer.find(".origFlowerNum").val());
    if (
      $inputContainer.parent().siblings(".buy-more").find("input:checked")
        .length > 0
    ) {
      maxNum += parseInt($inputContainer.find(".honeyNum").val());
    }

    if (currentNum < 0) {
      $tgt.val(0);
    } else if (maxNum < currentNum) {
      $tgt.val(maxNum);
    }
  },

  flowerEventSend: function (target) {
    // var $tgt = $(target);
    // var $inputContainer = $tgt.siblings('.bouquet');
    // return m.fastUse($inputContainer.find('.flowerStid').val(), {checkKey: $inputContainer.find('.checkKey').val(), flowers: $inputContainer.find('.flowerNum').val(), tgtName: $tgt.siblings('p').find('input').val()});
    var $inputContainer = $(".bouquet");
    return m.fastUse($inputContainer.find(".flowerStid").val(), {
      checkKey: $inputContainer.find(".checkKey").val(),
      flowers: $inputContainer.find(".flowerNum").val(),
      tgtName: $(".name").find("input[name='tgtName']").val(),
    });
  },

  flowerGetPrize: function () {
    // var $tgt = $(target);
    // var $inputContainer = $tgt.siblings('.bouquet');
    // return m.fastUse($inputContainer.find('.flowerStid').val(), {checkKey: $inputContainer.find('.checkKey').val(), flowers: $inputContainer.find('.flowerNum').val(), tgtName: $tgt.siblings('p').find('input').val()});
    var $inputContainer = $(".bouquet");
    return m.fastUse($inputContainer.find(".flowerStid").val(), {
      checkKey: $inputContainer.find(".checkKey").val(),
      getPrize: 1,
    });
  },

  flowerAlertInit: function () {
    setTimeout(function () {
      $(".buty-sendflowers .flowerNum").bind(
        "keydown keyup change blur",
        function () {
          PlayerView.flowerOnChange();
        }
      );
      $.each($("#flower-images").children(), function () {
        $(this).attr("title", $(this).attr("title2"));
      });
      simple_tooltip("*[tooltip=1]", "tooltip");
    }, 100);
    initTimers();
  },

  flowerShowRating: function (type) {
    var currentType = $("#square-flower-rating")
      .find("table:visible")
      .attr("rel");
    if (currentType == type) {
      return;
    }
    $("#square-flower-rating")
      .find("table[rel='" + currentType + "']")
      .hide();
    $("#square-flower-rating")
      .find("table[rel='" + type + "']")
      .show();
    var labelCurrent = $("#square-flower-rating")
      .parents(".best-woman__info-col:first")
      .find("span.dashedlink[rel='" + currentType + "']");
    var labelNew = $("#square-flower-rating")
      .parents(".best-woman__info-col:first")
      .find("span.dashedlink[rel='" + type + "']");
    labelCurrent.css("font-weight", "normal");
    labelNew.css("font-weight", "bold");
  },

  clanShowRating: function (type) {
    var currentType = $("#square-clan-rating")
      .find("table:visible")
      .attr("rel");
    if (currentType == type) {
      return;
    }
    $("#square-clan-rating")
      .find("table[rel='" + currentType + "']")
      .hide();
    $("#square-clan-rating")
      .find("table[rel='" + type + "']")
      .show();
    var labelCurrent = $("#square-clan-rating")
      .parents(".best-woman__info-col:first")
      .find("span.dashedlink[rel='" + currentType + "']");
    var labelNew = $("#square-clan-rating")
      .parents(".best-woman__info-col:first")
      .find("span.dashedlink[rel='" + type + "']");
    labelCurrent.css("font-weight", "normal");
    labelNew.css("font-weight", "bold");
  },

  selectBack: function (backId) {
    $(".bgs .bg").removeClass("selected");
    $("[data-back-id= " + backId + "]").addClass("selected");
    if ($(".data .actions .spring").length) {
      $(".data .actions .spring").text(eval("l.BACK_NAME_" + backId));
    } else {
      $(".data .actions .back").append(
        '— <span class="spring">' + eval("l.BACK_NAME_" + backId) + "</span>"
      );
    }
  },

  backgroundSubmit: function (itemId) {
    return m.fastUse(itemId, {
      choose_back: $(".bgs .bg.selected").attr("data-back-id"),
    });
  },

  initNoobShield: function () {
    if (
      $(".slot9").find("img").attr("src") == "/@/images/obj/noob_shield.png"
    ) {
      PlayerView.noobShield = true;
      $(
        ".slot1, .slot2, .slot3, .slot4, .slot5, .slot6, .slot6, .slot7, .slot8"
      )
        .html('<img src="/@/images/obj/noob_shield.png" tooltip="1">')
        .removeClass("empty")
        .addClass("notempty")
        .find("img")
        .css("opacity", "0.3");
      $(".slot9")
        .removeClass("empty")
        .addClass("notempty")
        .find("img")
        .css({
          width: "128px",
          height: "128px",
          "max-width": "128px",
          "z-index": 2,
          position: "relative",
          background: "none",
          top: "-64px",
          left: "3px",
        })
        .attr("data-no-style", 1)
        .attr("src", "/@/images/obj/noob_shield128.png")
        .attr("data-image", "/@/images/obj/noob_shield.png");
      $(".slot10").removeClass("empty").addClass("notempty").html("<img />");
    } else {
      PlayerView.noobShield = false;
    }
  },

  shieldProlong: function () {
    postUrl(
      "/player/buyshield/",
      {
        action: "buyshield",
      },
      "post",
      function (data) {}
    );
  },
};

var Alley = {
  Suslik: {
    init: function () {
      $(window).bind("initpage", function () {
        Alley.Suslik.addSuslik();
      });
    },

    addSuslik: function () {
      if (!window.event_suslik || AngryAjax.getCurrentUrl() != "/alley/") {
        return;
      }
      $("#event_suslik").remove();
      $(".welcome .block-rounded").before(
        '<img id="event_suslik" src="/@/images/loc/alley_ono.png" style="position: absolute; left: 389px; top: 133px; cursor: pointer;" onclick="Alley.Suslik.getReward();" />'
      );
      $("body").one("gotourl_before", function () {
        window.event_suslik = null;
        delete window.event_suslik;
      });
    },

    getReward: function () {
      postUrl(
        "/alley/",
        {
          action: "event_suslik",
        },
        "post",
        1
      );
    },
  },
  Patrol: {
    init: function () {
      $(window).bind("initpage", function () {
        Alley.Patrol.patrolBonus();
      });
      if (!AngryAjax.turned) {
        Alley.Patrol.patrolBonus();
      }
    },
    patrolBonus: function () {
      if (AngryAjax.getCurrentUrl() != "/alley/") {
        return;
      }
      if (document.getElementById("patrolChance")) {
        var b = ($("select[name=time] option:selected").val() / 10) * 25;
        b = Math.min(b, 100);
        $("#patrolChance").append(m.lang.LANG_MAIN_138 + b + "%");
        $("select[name=time]").change(function () {
          var b = ($("select[name=time] option:selected").val() / 10) * 25;
          b = Math.min(b, 100);
          $("#patrolChance").empty();
          $("#patrolChance").append(m.lang.LANG_MAIN_138 + b + "%");
        });
      }
    },
  },
  onFirstLoad: function () {
    if (window.event_logo) {
      var l = $("#logo");
      l.css("background-image", "url(/@/images/" + window.event_logo + ")");
      if (window.event_class) {
        l.addClass(window.event_class);
      }
      if (window.event_logo_link) {
        l.attr("href", window.event_logo_link);
      }
    }
    Alley.Patrol.init();
  },

  joinMetroFight: function (metro, checkFine, joinKey) {
    /*if (event && (event.target || event.srcElement)) {
			var tgtTag = event.target ? event.target.tagName : event.srcElement.tagName;
			if (tgtTag !== 'DIV' && tgtTag !== 'SPAN') {
				return;
			}
		} else {
			return;
		}*/
    if (typeof checkFine == "undefined") {
      var checkFine = false;
    }
    if (
      checkFine &&
      $(".area-danger").length > 0 &&
      $(".difficulty .hard,.difficulty .recommended").length > 0
    ) {
      showAlert(l.ERROR_TITLE, l.SOVET_ERROR_LOW_STATSUM_FOR_HIGH_METRO, 1);
    } else if (checkFine && $(".area-danger").length > 0) {
      showConfirm($(".area-danger").html(), [
        {
          title: l.JOIN_FIGHT,
          callback: function () {
            Alley.joinMetroFight(metro, false, joinKey);
          },
        },
        {
          title: l.LANG_ALERT_CANCEL,
          callback: null,
        },
      ]);
    } else {
      postUrl(
        "/sovet/join_metro_fight/",
        {
          action: "join_metro_fight",
          metro: metro,
          type: "metro",
          joinkey: joinKey,
        },
        "post",
        1
      );
    }
  },

  signOutFromMetroFight: function () {
    postUrl(
      "/sovet/signout_from_metro_fight/",
      {
        action: "signout_from_metro_fight",
      },
      "post",
      1
    );
  },
};

var Shaurburgers = {
  Shaur: {
    init: function () {
      $(window).bind("initpage", function () {
        Shaurburgers.Shaur.shaurBonus();
      });
      if (!AngryAjax.turned) {
        Shaurburgers.Shaur.shaurBonus();
      }
    },
    shaurBonus: function () {
      if (AngryAjax.getCurrentUrl() != "/shaurburgers/") {
        return;
      }
      if (document.getElementById("shaurChance")) {
        var b = $("select[name=time] option:selected").val() * 25;
        b = Math.min(b, 100);
        $("#shaurChance").append(m.lang.LANG_MAIN_138 + b + "%");
        $("select[name=time]").change(function () {
          var b = $("select[name=time] option:selected").val() * 25;
          b = Math.min(b, 100);
          $("#shaurChance").empty();
          $("#shaurChance").append(m.lang.LANG_MAIN_138 + b + "%");
        });
      }
    },
  },
  onFirstLoad: function () {
    Shaurburgers.Shaur.init();
  },
};

var FactoryMf = {
  mfPassatiji: {
    init: function () {
      $(window).bind("initpage", function () {
        FactoryMf.mfPassatiji.PassatijiCheck();
      });
      if (!AngryAjax.turned) {
        FactoryMf.mfPassatiji.PassatijiCheck();
      }
    },
    PassatijiCheck: function () {
      if (document.getElementById("factory-mf-passatiji-use")) {
        $("#factory-mf-passatiji-use").each(function () {
          var mycookie = $.cookie("mfPassatiji");
          if (mycookie && mycookie == "true") {
            $(this).prop("checked", mycookie);
          }
        });
        $("#factory-mf-passatiji-use").change(function () {
          $.cookie("mfPassatiji", $(this).prop("checked"), {
            path: "/",
            expires: 365,
          });
        });
      }
    },
  },
  onFirstLoad: function () {
    FactoryMf.mfPassatiji.init();
  },
};

function changeDangerTooltipHeader() {
  $("#danger_tooltip_header")
    .html("Сейчас ты в опасности")
    .css("color", "#9c0000");
}

var Fight = {
  checkHint: function () {
    var hint = $("#content").find(".shop-hint");
    if (hint.length) {
      hint.show(0);
    }
  },
  checkRage: function () {
    var $rage = $(".fight-rage");
    if ($rage.length) {
      $rage
        .find("#player-rage-ssbase")
        .html(intToKM($("#player-rage-ssbase").html()));
      $rage
        .find("#player-rage-ssrage")
        .html(intToKM($("#player-rage-ssrage").html()));

      var $ragePercent = $rage.find(".percent-rage");
      var $ragePercentLabel = $ragePercent.find(".label");

      if ($ragePercent.width() > $ragePercentLabel.width() + 10) {
        $ragePercentLabel.addClass("inside");
      }
    }

    $(".rage-log-gain").each(function () {
      $(this).text(intToKM($(this).text()));
    });
  },
};

var Factory = {
  prolongCoffeeBonus: function () {
    postUrl("/factory/treat-coffee-prolong/", {}, "post", 1);
  },
};

var ddestinyidStart = function () {
  alert(1);
};
function initDdestinyBar(player_id, project) {
  var game = project ? project : "roswar";
  // $("body").append('<link rel="stylesheet" type="text/css" href="/@/css/ddestinyid.css" />');
  $("body").prepend(
    '<div style="position: relative; height: 26px;" class="dd-bar-outer-game"><div class="dd-bar"></div></div>'
  );
  $.getScript("https://id.ddestiny.ru/js/bar/destinyid.js", function () {
    var controlmargin = function (speed) {
      if (typeof speed == "undefined") {
        var speed = 200;
      }
      $(".main-bg").animate(
        {
          "margin-top": DestinyID.is_disabled() ? "-26px" : 0,
        },
        speed
      );
    };
    var init = function () {
      var opts = {
        url: "https://id.ddestiny.ru/",
        project: game,
        allow_iframe: true,
        toggle_button: true,
        on_enable: controlmargin,
        on_disable: controlmargin,
        theme: "moswar",
      };
      if (typeof player_id != "undefined" && player_id == "index") {
        opts.toggle_button = false;
      } else if (typeof player_id != "undefined" && player_id > 0) {
        opts.account = player_id;
      }
      DestinyID.init(opts);
      controlmargin(0);
    };
    init();
  });
}

var openPayment = function () {
  showAlert(
    "Купить мёд",
    '<iframe src="http://localhost:8000/index.php" />',
    false,
    "alert-payment",
    false,
    [
      {
        isdefault: true,
        empty: true,
      },
    ]
  );
};

var SoundingMain = {
  sound: null,

  init: function () {
    if (SoundingMain.sound !== null) {
      return;
    }
    SoundingMain.initSwf();
  },

  afterInitSwf: function () {
    SoundingMain.sound = $("#musicswfmain")[0];
    SoundingMain.sound.loadSound("gong", "/@/snd/gong.mp3");
  },

  initSwf: function () {
    if ($("#musicSwfmain").length > 0) {
      $("#musicSwfmain").remove();
    }
    if ($("#musicswfmain").length > 0) {
      $("#musicswfmain").remove();
    }
    $("body").append('<div id="musicSwfmain"></div>');
    var flashvars = {};
    var params = {};
    params.allowscriptaccess = "always";
    var attributes = {};
    attributes.type = "application/x-shockwave-flash";
    attributes.id = "musicswfmain";
    attributes.name = "music";
    attributes.style = "position: absolute;bottom: 0;";
    swfobject.embedSWF(
      "/@/swf/sounding.swf",
      "musicSwfmain",
      "1",
      "1",
      "9.0.0",
      "/@/swf/expressInstall.swf",
      flashvars,
      params,
      attributes
    );
  },

  getSound: function () {
    return SoundingMain.sound;
  },

  playSound: function (name, layer) {
    SoundingMain.sound.playSound(name, layer, false);
  },

  stopSound: function (layer) {
    SoundingMain.sound.stopSound(layer);
  },
};

var alertAction = function (id, action, obj, params) {
  postUrl(
    "/alert/" + id + "/",
    {
      action: action,
      params: JSON.stringify(params),
    },
    "post",
    function (data) {
      $(obj).parents(".alert:first").remove();
    }
  );
};

var InactiveReward = {
  takeReward: function () {
    postUrl(
      "/player/inactivereward/",
      {
        action: "inactivereward",
      },
      "post",
      function (data) {}
    );
  },

  activateTakeRewardBlock: function () {
    $(".pers-secret-bonus").hide();
    $(".pers-secret-bonus-available").show();
  },
};

var Relict = {
  slide: 0,
  animating: 0,

  slideStep: 46,
  pageSize: 6,
  // Number of items to slide per page

  $list: null,
  $arrowLeft: null,
  $arrowRight: null,

  init: function () {
    this.$list = $(".relict-obj-list");

    // Если больше 7 элементов - нужен слайдер
    if (this.$list.children().length >= 7) {
      this.initSlider();
    }

    return true;
  },

  initSlider: function () {
    this.slide = 0;
    this.$arrowLeft = $(".relict-arrow-left");
    this.$arrowRight = $(".relict-arrow-right");

    // Прячем все камни дальше 7-ого
    this.$list.width(this.slideStep * this.$list.children().length);
    this.$list.children().slice(7).css({
      opacity: 0,
    });

    // Активируем кнопки
    this.$arrowRight.removeClass("relict-arrow-inactive");
    this.$arrowLeft.attr({
      onclick: "Relict.slideLeft();",
    });
    this.$arrowRight.attr({
      onclick: "Relict.slideRight();",
    });
  },

  slideRight: function () {
    if (this.animating) return false;

    var nextSlide = this.slide + this.pageSize;
    if (nextSlide > this.$list.children().length - 1) {
      return false;
    }

    this.slide = nextSlide;
    this.animating = 1;

    // Identify which items will be visible after sliding
    var $visibleItems = this.$list.children().slice(this.slide, this.slide + 7);

    // Fade in visible items now (no mass fade-out at the start)
    $visibleItems.animate(
      {
        opacity: 1,
      },
      200
    );

    var that = this;
    this.$list.animate(
      {
        marginLeft: -1 * this.slideStep * this.slide,
      },
      400,
      function () {
        that.animating = 0;
        that.$arrowLeft.removeClass("relict-arrow-inactive");
        if (that.slide >= that.$list.children().length - 7) {
          that.$arrowRight.addClass("relict-arrow-inactive");
        }

        // AFTER the slide completes, fade out the rest (items not in the visible range)
        that.$list.children().not($visibleItems).css({
          opacity: 0,
        });
      }
    );
  },

  slideLeft: function () {
    if (this.animating) return false;

    var nextSlide = this.slide - this.pageSize;
    if (nextSlide < 0) {
      return false;
    }

    this.slide = nextSlide;
    this.animating = 1;

    // Identify which items will be visible
    var $visibleItems = this.$list.children().slice(this.slide, this.slide + 7);

    // Fade in visible items now
    $visibleItems.animate(
      {
        opacity: 1,
      },
      200
    );

    var that = this;
    this.$list.animate(
      {
        marginLeft: -1 * this.slideStep * this.slide,
      },
      400,
      function () {
        that.animating = 0;
        that.$arrowRight.removeClass("relict-arrow-inactive");
        if (that.slide <= 0) {
          that.$arrowLeft.addClass("relict-arrow-inactive");
        }

        // AFTER the slide completes, fade out the rest
        that.$list.children().not($visibleItems).css({
          opacity: 0,
        });
      }
    );
  },
};

var Bloodattack = {
  $bloodattackAlert: false,

  getAttackAlert: function () {
    $.post(
      "/alley/show_bloodattack/",
      {},
      function (response) {
        Bloodattack.initAttackAlert();

        if (!response.players) {
          //showAlert('Ошибка', 'К сожалению на вашем уровне нет игроков, которым можно отомстить.', true);
          //return false; // Не найдено целей для кровной мести, ты можешь найти врага сам
          $(".bloodattack__list-text").text(
            "Не найдено целей для кровной мести,"
          );
          $(".bloodattack__search-block-text").text(
            "ты можешь найти врага сам:"
          );
        }

        var attackListHTML = "";
        for (var i in response.players) {
          // Получим максимальный стат игрока
          var maxStat = 0;
          for (var j in response.players[i].stats) {
            if (j == "statsum2") {
              continue;
            }
            maxStat =
              parseInt(response.players[i].stats[j]) > parseInt(maxStat)
                ? response.players[i].stats[j]
                : maxStat;
          }

          // Соберем список статов
          var playerStats = "";
          for (var j in response.players[i].stats) {
            if (j == "statsum2") {
              continue;
            }
            playerStats += '<div class="bloodattack-bar">';
            playerStats +=
              '<div class="bloodattack-bar-percent" style="width: ' +
              (response.players[i].stats[j] / maxStat) * 100 +
              '%;"></div>';
            playerStats +=
              '<div class="bloodattack-bar-label">' +
              m.statType[j] +
              '<span class="bloodattack-bar-label-value">' +
              response.players[i].stats[j] +
              "</span>";
            playerStats += "</div>";
            playerStats += "</div>";
          }

          // Соберем блок игрока
          attackListHTML += '<li class="bloodattack__item">';
          attackListHTML += '<div class="bloodattack__item-left-col">';
          attackListHTML +=
            '<img src="' + response.players[i].avatar + '" alt="" title="" />';
          attackListHTML +=
            '<p class="bloodattack__counter"><span class="cool-1"><i></i>' +
            response.players[i].stats.statsum2 +
            "</span></p>";
          attackListHTML +=
            '<p class="bloodattack__counter"><span class="bloodattack-knife"><i></i>' +
            response.players[i].countAttackers +
            "</span></p>";
          attackListHTML += "</div>";
          attackListHTML += '<div class="bloodattack__item-right-col">';
          attackListHTML +=
            '<div class="bloodattack__item-user">' +
            response.players[i].player +
            "</div>";
          attackListHTML += '<div class="bloodattack__item-user-stats">';
          attackListHTML += playerStats;
          attackListHTML += "</div>";
          attackListHTML +=
            '<button class="bloodattack__button button"><span class="f" onclick="Bloodattack.attackPlayer(' +
            i +
            '); return false;"><i class="rl"></i><i class="bl"></i><i class="brc"></i><div class="c">Отомстить!</div></span></button>';
          attackListHTML += "</div>";
          attackListHTML += "</li>";
        }

        Bloodattack.$bloodattackAlert
          .find(".bloodattack__list")
          .html(attackListHTML);
        Bloodattack.show();
      },
      "json"
    );
  },

  attackPlayer: function (playerId) {
    $.post(
      "/alley/blood_select_target/",
      {
        playerId: playerId,
      },
      function (response) {
        if (response.error) {
          showAlert("Ошибка", response.error, true);
          return false;
        }
        if (response.return_url) {
          AngryAjax.goToUrl(response.return_url);
        }
      },
      "json"
    );
  },

  findPlayer: function (nickname) {
    $.post(
      "/alley/blood_findplayer/",
      {
        nickname: nickname,
      },
      function (response) {
        if (response.error) {
          showAlert("Ошибка", response.error, true);
          return false;
        }

        var params = {
          __title: "Отомстить!",
          __css: {
            "text-align": "center",
          },
        };
        var buttons = [
          {
            title: "Отомстить!",
            callback: function () {
              Bloodattack.attackPlayer(response.targetId);
            },
          },
        ];

        showConfirm(response.confirm, buttons, params);
      },
      "json"
    );
  },

  initAttackAlert: function () {
    if ($(".bloodattack").length > 1) {
      $(".bloodattack").not(":last").remove();
    }

    this.$bloodattackAlert = $(".bloodattack");

    $("body").bind("gotourl_after", function () {
      Bloodattack.hide();
    });
    $(".bloodattack").detach().appendTo("body");
  },

  show: function () {
    m.fillScreen.show({
      onclick: Bloodattack.hide,
    });
    $(".bloodattack").show();
  },
  hide: function () {
    m.fillScreen.hide();
    $(".bloodattack").hide();
  },
};

var showResourceMedalAlert = function (image, name, amount, totalAmount) {
  // удалить мок
  var image = "medal-1D-money";
  var name = "Серебряная";
  var amount = 5;
  var totalAmount = 28;
  // удалить мок

  var htmlClass = "resource-medal-alert";
  var returnUrl = "/square/rating/medium/day/money";
  var html = "";

  html += '<div class="resource-medal-alert__glow"></div>';
  html +=
    '<img class="resource-medal-alert__img" src="/@/images/obj/resource_rating/' +
    image +
    '_128.png">';
  html += '<div class="resource-medal-alert__info">';
  html += '<div class="resource-medal-alert__name">' + name + "</div>";
  html +=
    '<div class="resource-medal-alert__amount">Заработано: <span>' +
    amount +
    " медалей!</span></div>";
  html += '<div class="res-rating-medal-bar">';
  html +=
    '<div class="res-rating-medal-percent" style="width: ' +
    totalAmount +
    '%;"></div>';
  html +=
    '<div class="res-rating-medal-label"><span class="res-rating-medal-label-cur">' +
    totalAmount +
    "</span>/100</div>";
  html += "</div>";
  html +=
    '<div class="resource-medal-alert__hint">Собери 100 медалей и получи орден!</div>';
  html += "</div>";

  showAlert("", html, false, htmlClass, 1, [
    {
      label: "К медалям",
      onclick: 'return AngryAjax.goToUrl("' + returnUrl + '", event);',
      isdefault: true,
    },
  ]);
};

var showResourceTopMedalAlert = function (image, objects) {
  // удалить мок
  var image = "medal-1D-money";
  var objects = ["accessory25.png", "accessory26.png", "accessory27.png"];
  // удалить мок

  var htmlClass = "resource-medal-alert";
  var returnUrl = "/square/rating/medium/day/money";
  var html = "";

  html += '<div class="resource-medal-alert__glow"></div>';
  html +=
    '<img class="resource-medal-alert__img" src="/@/images/obj/resource_rating/' +
    image +
    '_128.png">';
  html += '<div class="resource-medal-alert__info">';
  html += '<div class="resource-medal-alert__name">Вы получили орден</div>';
  html += '<div class="res-rating-medal-bar">';
  html += '<div class="res-rating-medal-percent" style="width: 100%;"></div>';
  html +=
    '<div class="res-rating-medal-label"><span class="res-rating-medal-label-cur">100</span>/100</div>';
  html += "</div>";
  if (objects.length > 0) {
    html += '<div class="resource-medal-alert__objects">';
    for (var i = 0; i < objects.length; i++) {
      html +=
        '<img class="resource-medal-alert__obj" src="/@/images/obj/' +
        objects[i] +
        '">';
    }
    html += "</div>";
  }
  html += "</div>";

  showAlert("", html, false, htmlClass, 1, [
    {
      label: "К медалям",
      onclick: 'return AngryAjax.goToUrl("' + returnUrl + '", event);',
      isdefault: true,
    },
  ]);
};

var statsSmallAccordion = {
  init: function () {
    this.$statsAccordBlock = $("#statistics-accordion");
    this.$statsAccordMedalsBtn = this.$statsAccordBlock.find("dt:eq(0)");
    this.$statsAccordMedals = this.$statsAccordBlock.find("dd:eq(0)");
    this.$statsAccordStatsBtn = this.$statsAccordBlock.find("dt:eq(1)");
    this.$statsAccordStats = this.$statsAccordBlock.find("dd:eq(1)");
    this.$statsAccordStatsSmall = this.$statsAccordBlock.find("dd:eq(2)");
    this.statsAccordMedalsH = this.$statsAccordMedals.find("tr").length * 57;
    this.$statsAccordStats.show();
    // для правильного расчета высоты надо показать блок
    this.statsAccordFullStatsH = this.$statsAccordStats.children().height();

    this.$statsAccordMedals.height(this.statsAccordMedalsH);
    this.$statsAccordStats.height(this.$statsAccordStats.children().height());
    this.$statsAccordStatsSmall.height(
      this.$statsAccordStatsSmall.children().height()
    );

    this.showStats();

    this.$statsAccordStatsBtn
      .removeClass("selected active")
      .attr("onclick", "statsSmallAccordion.getStats()");
  },
  getMedals: function () {
    this.$statsAccordMedals.show(0);
    this.$statsAccordMedalsBtn
      .addClass("selected active")
      .removeAttr("onclick");
    this.$statsAccordStatsBtn
      .removeClass("selected active")
      .attr("onclick", "statsSmallAccordion.getStats()");
    this.showStats();
  },
  getStats: function () {
    this.$statsAccordMedals.hide(0);
    this.$statsAccordMedalsBtn
      .removeClass("selected active")
      .attr("onclick", "statsSmallAccordion.getMedals()");
    this.$statsAccordStatsBtn.addClass("selected active").removeAttr("onclick");
    this.showFullStats();
  },
  showStats: function () {
    if (217 - this.statsAccordMedalsH > this.statsAccordFullStatsH) {
      this.showFullStats();
    } else {
      this.showSmallStats();
    }
  },
  showSmallStats: function () {
    this.$statsAccordStatsSmall.show(0);
    this.$statsAccordStats.hide(0);
  },
  showFullStats: function () {
    this.$statsAccordStatsSmall.hide(0);
    this.$statsAccordStats.show(0);
  },
};

var showResetExpAlert = function (exp, price) {
  var text =
    "Ты собираешься воспользоваться своим законным правом и обнулить набранный опыт в размере <span class='expa'><i></i>" +
    exp +
    "</span>. <br> Эта сложная процедура обойдется тебе в <span class='med'><i></i>" +
    price +
    "</span>.";

  var buttons = [];
  buttons.push({
    title: "Öбнулиться",
    callback: function () {
      postUrl(
        "/player/reset-exp/",
        {
          action: "reset-exp",
        },
        "post"
      );
    },
  });
  buttons.push({
    title: "Отложить",
    callback: null,
  });

  showConfirm(text, buttons, {
    __title: "Öбнулись",
  });
  event.preventDefault();
};
