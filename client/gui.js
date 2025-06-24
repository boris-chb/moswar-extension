(function () {
  moswar.oldUsedItem = null;
  var m = moswar;
  var l = moswar.lang;

  m.toSort = {
    accessory1: 0,
    weapon: 0,
    pouch: 0,
    cloth: 0,
    cologne: 0,
    talisman: 0,
    shoe: 0,
    hat: 0,
    tech: 0,
    jewellery: 0,
    phone: 0,
    glasses: 0,
    dungeon1: 0,
    phone2: 0,
    hand: 0,
    usableitem: 1,
    drug: 5,
    drug2: 5,
    gift: 3,
    gift2: 4,
    autousableitem: 10,
    d: 999,
  };

  m.showAlert = function (alert, i, button, serviceInfo) {
    if (typeof i == "undefined") {
      i = 0;
    }
    if (typeof alert == "object") {
      var obj = {
        title: alert.title,
        content:
          alert.text + '<div class="actions">' + alert.actions + "</div>",
      };
    } else {
      var l = moswar.lang;
      if (
        typeof l == "undefined" ||
        typeof l[alert] == "undefined" ||
        l[alert] == null
      )
        return;
      var b = typeof button == "undefined" ? alertButton : button;
      var obj = {
        title: l[alert].title,
        content:
          l[alert].content +
          "</br>" +
          Mustache.to_html(m.tpl[b], {
            text: l.CLOSE,
          }),
      };
    }
    var msgHtml = Mustache.to_html(m.tpl.tooltip, obj);
    if (serviceInfo) {
      msgHtml += '<span style="display:none;">' + serviceInfo + "</span>";
    }
    var message = $(
      '<div class="overtip alert ' +
        (alert.class2 ? alert.class2 : "") +
        '" style="display:none;"></div>'
    ).html(msgHtml);
    $("body").append(message);
    var l = $(window).width() / 2 + 20 * i;
    var t = $(window).height() / 3 + $(window).scrollTop() + 20 * i;

    $(".data", message).css({
      float: "none",
      clear: "both",
    });
    message
      .css({
        left: l,
        top: t,
      })
      .show(0);
    if (message.hasClass("alert-auto")) {
      var fix = function () {
        message.css(
          "left",
          parseInt(($("body").width() - message.width()) / 2) + "px"
        );
        message.css(
          "top",
          parseInt(($("body").height() - message.height()) / 2) + "px"
        );
      };
      fix();
      message.find("img").load(fix);
    }
    $("div.alert *[timer]:not([endtime])").each(function () {
      countdown($(this));
    });
  };

  m.sortItems = function (inventory, selector, container) {
    var inv = m.qsort(inventory, selector);
    var s = $(container);
    //s.empty();
    $(".overtip:visible").hide();
    for (i in inv) {
      if (selector) {
        var id = $(inv[i]).data("id");
      } else {
        var id = inv[i].id;
      }
      if (typeof m.items[id] != "undefined") {
        s.append(m.items[id].shell);
        //m.items[id].rebuilt();
      }
    }
    tutorial.go.apply(tutorial);
  };

  m.fastBuy = function (id) {
    var item = m.items[id];
    if (item) {
      item.btn.attr("fast-buy", 1);
      item.btn.click();
      if (m.items[id]) {
        m.items[id].btn.attr("fast-buy", null);
      }
    }
    return false;
  };

  m.fastUse = function (id, params, cb) {
    if (typeof params == "undefined") {
      var params = {};
    }
    if (typeof cb == "undefined") {
      var cb = 1;
    }
    postUrl("/player/use/" + id + "/", params, "get", cb);
  };

  m.actionManager = (function () {
    function action(toClose) {
      m.oldUsedItem = this;
      this.changed = false;
      var self = this;
      var sendData = this.d;
      if (this.btn.attr("fast-buy")) {
        if (sendData != undefined) {
          sendData.fastbuy = "1";
        } else {
          sendData = {
            fastbuy: "1",
          };
        }
      }
      $.ajax({
        url:
          m.url.player +
          "json/" +
          this.btn.data("action") +
          "/" +
          this.id +
          "/",
        dataType: "json",
        type: this.method,
        success: function (response) {
          if (response.return_url) {
            AngryAjax.goToUrl(response.return_url);
            return;
          }
          var action = self.btn.data("action");
          if (
            action == "dress" &&
            self.slot &&
            (self.slot == "phone" ||
              self.slot == "glasses" ||
              self.slot == "dungeon1" ||
              self.slot == "phone2" ||
              self.slot == "gadget")
          ) {
            $("td.slots-cell").addClass("showbag");
          }
          if (
            response.refresh != null &&
            typeof response.refresh != "undefined" &&
            response.refresh
          ) {
            AngryAjax.goToUrl("/player/");
            return;
          }
          m.makeAction("enable", m.items);
          if (response.error) {
            m.showAlerts(response);
            return;
          }

          if (typeof response.result == "undefined" || response.result) {
            AnimatedItems.kill();
            m.remakeStats(response);
            m.redrawInventory(response);
            m.redrawEquipment(response.inventory);
            m.redrawKickedSlots(response.kickedslots);
            m.redrawEmptySlots();
            if (m.items[self.id] && !self.changed) {
              m.items[self.id].info.content = m.items[
                self.id
              ].info.content.replace(/&nbsp;&nbsp;([0-9]+)/, function (n) {
                return (
                  "&nbsp;&nbsp;" +
                  (parseInt(n.replace("&nbsp;&nbsp;", ""), 10) - 1)
                );
              });
            }
            if (response.fi) {
              m.redrawFightItems(response.fi, response.maxSlots);
            }
            if ($("#slots-superhits-place").is(":visible")) {
              playerRedrawSuperhitSlots();
            }
            m.redrawIcon(response);
            m.redrawWallet(response.wallet);
          }
          $(".overtip:visible").hide();
          AngryAjax.setTimeout(function () {
            m.showAlerts(response);
            AnimatedItems.init();
          }, 1);
          if (toClose) {
            toClose.hide();
          } else {
            $(".alert.infoalert").hide();
          }
          /*if (tutorial.started && (tutorial.curStep == 'puton_clothes' || tutorial.curStep == 'puton_clothes2') ) {
          tutorial.nextStep();
          tutorial.go(tutorial.curStep);
        }*/
          if (tutorial.started && tutorial.curStep != response.tutorial) {
            tutorial.go(response.tutorial);
          }
          if (response.lastfight == 0) {
            setMainTimer(0);
          }
          AnimatedItems.init();
        },
        data: sendData,
      });
    }

    return {
      performAction: function (toClose) {
        action.apply(this, [toClose]);
      },
    };
  })();

  m.redrawIcon = function (response) {
    summary = "";
    summary += m.tpl.iconFD + m.tpl.iconD;
    $("div.icons-place").html(summary);
    for (ii = 0; ii < 2; ii++) {
      var ra = ii == 1 ? "ratings-icon" : "affects-icon";
      var content = ii == 1 ? response.fd : response.d;
      var title = ii == 1 ? l.FULL_BUFF : l.TEMP_BUFF;
      try {
        m.items[$("i." + ra + "").data("id")].destroy();
      } catch (e) {}
      if (content.split("||").length > 1) {
        var arr = content.split("||");
        if (arr[2]) {
          var desc = arr[0];
          content = arr[1];
        } else {
          content = arr[0];
        }
      }
      if (content.split("|").length > 1) {
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
        }
        if (desc) {
          content = desc + "<br />" + content;
        }
      }
      var image = "";
      if (content != "") {
        if (image == "") {
          var html =
            "<div class='overtip' style='position: absolute; display: none; max-width: 266px; z-index:90;'><div class='help' id='" +
            ra +
            ii +
            "'>" +
            "<h2>" +
            title +
            "</h2><div class='data'>" +
            content +
            "</div></div>" +
            ($("i." + ra).attr("clickable")
              ? "<span class='close-cross' style='display:none;'>&#215;</span>"
              : "") +
            "</div>";
        } else {
          var html =
            "<div class='overtip' style='position: absolute; display: none; max-width: 266px; z-index:90;'><div class='object' id='" +
            ra +
            ii +
            "'>" +
            "<h2>" +
            title +
            "</h2><div class='data'>" +
            content +
            "<i class='thumb'>" +
            image +
            "</i></div></div>" +
            ($("i." + ra).attr("clickable")
              ? "<span class='close-cross'  style='display:none;'>&#215;</span>"
              : "") +
            "</div>";
        }
        m.items[$("i." + ra).data("id")] = new m.item("i." + ra, html);
      } else {
        $("i." + ra).remove();
      }
    }
  };

  m.statBar = function (p1, p2, p3, p4, p5) {
    var bar = {
      percent1: p1 || 0,
      percent2: p2 || 0,
      percent4: p4 || 0,
      percent5: p5 || 0,
      percent3: p3 || 0,
    };
    return Mustache.to_html(m.tpl.stat_bar, bar);
  };

  m.petTooltip = function (pet) {
    if (m.items[pet.id] == undefined || pet.items) return;
    var conObj = {
      info: pet.info,
      procent: pet.procent,
      hp: pet.hp,
      maxhp: pet.maxhp,
      health: pet.health,
      strength: pet.strength,
      dexterity: pet.dexterity,
      image: pet.image,
      intuition: pet.intuition,
      resistance: pet.resistance,
      attention: pet.attention,
      charism: pet.charism,
    };
    var content = Mustache.to_html(m.tpl.tooltipPet, conObj);
    var tooltip = {
      content: content,
      title: pet.name,
      image: true,
      image_src: '<img src="/@/images/obj/' + conObj.image + '">',
    };
    m.items[pet.id].info = tooltip;
  };

  m.statTooltip = function (baseStat, finStat, addStat, addStat2, statType) {
    var conObj = {
      baseStat: baseStat,
      bonusadd: addStat,
      bonusadd2: addStat2,
      statname: l[statType.substring(0, 3).toUpperCase()].toLowerCase(),
      bonus: finStat - baseStat - addStat,
      isbonus: function () {
        if (finStat - baseStat != 0) return true;
        return false;
      },
      sign: function () {
        if (finStat - baseStat < 0) return "";
        return "+";
      },
    };
    var content = Mustache.to_html(m.tpl.tooltipStat, conObj);
    var tooltip = {
      content: content,
      title: m.statType[statType],
      image: false,
      id: Math.random() * 99,
    };
    return tooltip;
  };

  m.remakeStats = function (response) {
    var stats = response.stats;
    if (stats == undefined) return;
    $.each(m.stats, function () {
      var sType = this.type;
      var n = stats.relative[sType];
      if (n) {
        var baseStat = stats[sType];
        var finStat = Math.round(stats[sType + "_finish"]);
        var addStat = Math.round(stats[sType + "_add_finish"]);
        var addStat2 = Math.round(stats[sType + "_add2"]);
        this.bar.html(m.statBar(n.p1, n.p2, n.p3, n.p4, n.p5));
        this.obj.html(finStat);
        this.info = m.statTooltip(baseStat, finStat, addStat, addStat2, sType);
      }
    });
    //var c = $(".coolness").text().replace(/[0-9]+/, '');
    //$(".coolness").html(c+Math.round(stats.statsum));
    if ($(".coolness span").length) {
      $(".coolness span").html(
        $(".coolness span")
          .html()
          .replace(/[0-9]+/, stats.statsum)
      );
    }

    m.hp.setHP(stats.hp, stats.maxhp);
    $.each(response.pets, function (i) {
      m.petTooltip(this);
    });

    m.setEnergy(stats.energy, stats.maxenergy);

    $.each(m.skills, function () {
      var skill = response.skills[this.type];
      this.bar.html(
        Mustache.to_html(m.tpl.skill_bar, {
          procent: skill.percent,
        })
      );
      this.rank.html(
        Mustache.to_html(m.tpl.skill_rank, {
          rank: skill.name,
        })
      );
      this.obj.html(skill.value + "/" + skill.nextlevel);
    });
  };

  m.setEnergy = function (energy, maxenergy) {
    /*$('#currenttonus').text(Math.round(energy));
  $('#maxenergy').text(Math.round(maxenergy));
  $('#playerEnergyBar').css({
    'width':(energy/maxenergy)*100
  });*/
    setEnergy(energy);
    if (energy == maxenergy) {
      player["fullenergyin"] = $("#servertime").attr("rel");
    }
  };

  m.qsort2 = function (inv, selector) {
    if (inv.length == 0) return [];
    inv.sort(function (a, b) {
      var t = $(a).data("type");
      var p = typeof m.toSort[t] != "undefined" ? m.toSort[t] : m.toSort.d;
      var t2 = $(b).data("type");
      var p2 = typeof m.toSort[t2] != "undefined" ? m.toSort[t2] : m.toSort.d;
      //if (p == p2) return 0;
      if (p < p2) {
        return -1;
      } else {
        return 1;
      }
    });
  };
  m.qsort = function (inv, selector) {
    if (inv.length == 0) return [];
    var left = [],
      right = [];
    var pivot = inv[0];
    var i = 0;
    /*$.each(inv, function(){
    if (i > 0) {
      if (selector) {
        var t = $(pivot).data('type');
      } else {
        var t = pivot.type;
      }
      var p = (typeof(m.toSort[t]) != 'undefined') ? m.toSort[t] : m.toSort.d;
      if (selector) {
        var t = $(this).data('type');
      } else {
        var t = this.type;
      }

      m.toSort[t] < p ? left.push(this) : right.push(this);
    }
    i++;
  });*/
    $.each(inv, function () {
      if (i > 0) {
        var elm1, elm2, t, pos1, pos2;

        if (selector) {
          t = $(pivot).data("type");
          elm1 = $(pivot).data("mf");
          pos1 = $(pivot).data("position");
        } else {
          t = pivot.type;
          elm1 = pivot.mf;
          pos1 = pivot.position;
        }

        var p = typeof m.toSort[t] != "undefined" ? m.toSort[t] : m.toSort.d;
        if (selector) {
          t = $(this).data("type");
          elm2 = $(this).data("mf");
          pos2 = $(this).data("position");
        } else {
          t = this.type;
          elm2 = this.mf;
          pos2 = this.position;
        }

        // для тех у кого 0 в сортировке (одеваемые вещи) для них сортировка по mf
        /*if (m.toSort[t] != 0 || (elm1 == 0 && elm2 == 0)) {
        m.toSort[t] < p ? left.push(this) : right.push(this);
      } else {
        elm1 < elm2 ? left.push(this) : right.push(this);
      }*/
        if (pos1 == pos2) {
          m.toSort[t] < p ? left.push(this) : right.push(this);
        } else {
          pos1 < pos2 ? left.push(this) : right.push(this);
        }
      }
      i++;
    });
    return m.qsort(left, selector).concat(pivot, m.qsort(right, selector));
  };

  m.redrawInventory = function (response) {
    var ts = Math.round(new Date().getTime() / 1000);

    $.each(response.boost_inventory, function (i) {
      if (
        m.oldUsedItem &&
        m.oldUsedItem.st == response.boost_inventory[i].standard_item &&
        m.oldUsedItem.id != response.boost_inventory[i].id &&
        response.boost_inventory[i].stackList
      ) {
        //document.location.href = document.location.href;
        var newId = response.boost_inventory[i].id;
        var oldItem = m.items[m.oldUsedItem.id];
        delete m.items[m.oldUsedItem.id];
        oldItem.id = newId;
        oldItem.obj.data("id", newId);
        oldItem.obj.attr("data-id", newId);
        oldItem.btn.data("id", newId);
        oldItem.btn.attr("data-id", newId);
        oldItem.info.content = oldItem.info.content.replace(
          /<br \/><span class='brown'>&nbsp;&nbsp;1.+?<\/span>/,
          ""
        );
        oldItem.changed = true;

        var stackStr = "";
        var cnt = 0;
        if (response.boost_inventory[i].stackList) {
          for (var prop in response.boost_inventory[i].stackList) {
            stackStr +=
              "</span><br /><span class='brown'>&nbsp;&nbsp;" +
              response.boost_inventory[i].stackList[prop][1] +
              " шт. " +
              (response.boost_inventory[i].stackList[prop][2] ? "до " : "") +
              response.boost_inventory[i].stackList[prop][0] +
              "</span>";
            cnt++;
          }
          if (cnt > 1 && stackStr != "") {
            stackStr =
              "<b>" + "Предметы в пачке:" + "</b>" + stackStr + "<br />";
          }
          //console.log(response.boost_inventory[i]);
          //console.log(stackStr);
        }
        if (cnt < 2 && response.boost_inventory[i].outDate) {
          stackStr = "Срок годности: " + response.boost_inventory[i].outDate;
        } else if (!response.boost_inventory[i].outDate) {
          stackStr = "";
        }
        oldItem.info.content = oldItem.info.content.replace(
          new RegExp(
            "<b>" + "Предметы в пачке" + ":<\\/b>\\s*<\\/span>.+<br \\/>"
          ),
          stackStr
        );
        m.items[newId] = oldItem;
      }
      if (typeof m.items[i] != "undefined" && m.items[i] != "null") {
        if (
          typeof this.durability != "undefined" &&
          this.durability.length > 0
        ) {
          m.items[i].count.html(
            "#" + response.boost_inventory[this.id].durability
          );
        }
        var boost = this;
        $.each(response.boost, function () {
          if (
            this.code == boost.code ||
            ((this.code == "gum_health" ||
              this.code == "gum_health2" ||
              this.code == "gum_strength" ||
              this.code == "gum_strength2" ||
              this.code == "gum_dexterity" ||
              this.code == "gum_dexterity2" ||
              this.code == "gum_attention" ||
              this.code == "gum_attention2" ||
              this.code == "gum_resistance" ||
              this.code == "gum_resistance2" ||
              this.code == "gum_intuition" ||
              this.code == "gum_intuition2") &&
              boost.code === "teahouse_doping")
          ) {
            m.items[i].btn.html("<span>" + l.ALREADY_BUFFED + "</span>");
            m.items[i].btn.unbind("click").addClass("disabled");
          }
        });
      }
    });

    $.each(response.inventory, function (i) {
      if (
        response.inventory[i].id == 0 ||
        response.inventory[i].type == "bunker" ||
        response.inventory[i].type.match("home_") ||
        response.inventory[i].type.match("petfood") ||
        response.inventory[i].type.match("petautofood")
      ) {
        return;
      }
      if (m.items[response.inventory[i].id]) {
        m.items[response.inventory[i].id].unlocked =
          response.inventory[i].unlocked;
      }
      if (
        m.oldUsedItem &&
        m.oldUsedItem.st == response.inventory[i].standard_item &&
        m.oldUsedItem.id != response.inventory[i].id &&
        (response.inventory[i].stackList ||
          response.inventory[i].type == "gift")
      ) {
        //document.location.href = document.location.href;
        var newId = response.inventory[i].id;
        var oldItem = m.items[m.oldUsedItem.id];
        delete m.items[m.oldUsedItem.id];
        oldItem.id = newId;
        oldItem.obj.data("id", newId);
        oldItem.obj.attr("data-id", newId);
        oldItem.btn.data("id", newId);
        oldItem.btn.attr("data-id", newId);
        oldItem.changed = true;
        var stackStr = "";
        var cnt = 0;
        if (response.inventory[i].stackList) {
          for (var prop in response.inventory[i].stackList) {
            stackStr +=
              "</span><br /><span class='brown'>&nbsp;&nbsp;" +
              response.inventory[i].stackList[prop][1] +
              " шт. " +
              (response.inventory[i].stackList[prop][2] ? "до " : "") +
              response.inventory[i].stackList[prop][0] +
              "</span>";
            cnt++;
          }
          if (cnt > 1 && stackStr != "") {
            stackStr =
              "<b>" + "Предметы в пачке:" + "</b>" + stackStr + "<br />";
          }
        }
        if (cnt < 2 && response.inventory[i].outDate) {
          stackStr = "Срок годности: " + response.inventory[i].outDate;
        } else if (!response.inventory[i].outDate) {
          stackStr = "";
        }
        oldItem.info.content = oldItem.info.content.replace(
          new RegExp(
            "<b>" + "Предметы в пачке" + ":<\\/b>\\s*<\\/span>.+<br \\/>"
          ),
          stackStr
        );
        m.items[newId] = oldItem;
      }
      if (typeof m.items[i] != "undefined" && m.items[i] != "null") {
        if (
          typeof this.durability != "undefined" &&
          this.durability.length > 0
        ) {
          m.items[i].count.html("#" + response.inventory[this.id].durability);
          $(
            ".object-thumb#object-thumb" + response.inventory[i].id + " .count"
          ).text("#" + response.inventory[i].durability);
        }
      }
    });
    AngryAjax.setTimeout(function () {
      simple_tooltip("*[tooltip=1]", "tooltip");
    }, 100);

    $.each(m.items, function () {
      if (
        this == undefined ||
        this.id == undefined ||
        this.isFightItem ||
        this.job
      )
        return;
      if (
        this.id > 0 &&
        response.inventory[this.id] == undefined &&
        response.pets[this.id] == undefined &&
        response.boost_inventory[this.id] == undefined &&
        !this.obj.attr("bear")
      ) {
        this.destroy();
        return;
      }

      if (this.count.length > 0) {
        if (response.inventory[this.id]) {
          this.count.html("#" + response.inventory[this.id].durability);
        } else if (response.boost_inventory[this.id]) {
          this.count.html("#" + response.boost_inventory[this.id].durability);
        }
      }

      try {
        if (
          response.inventory[this.id] &&
          response.inventory[this.id].unlockedby &&
          $.parseJSON(response.inventory[this.id].unlockedby || "null") &&
          $.parseJSON(response.inventory[this.id].unlockedby || "null").b
        ) {
          this.btn.unbind("click");
          var self = this;
          this.btn.click(function () {
            showObjectOvertip(
              this,
              response.inventory[self.id].unlockedby,
              self.id
            );
          });
        }
      } catch (e) {}
    });
  };

  m.showAlerts = function (response) {
    if (response.error) {
      m.showAlert(response.error, 0);
    }
    if (response.alerts == false || typeof response.alerts == "undefined")
      return false;
    $.each(response.alerts, function (i, alert) {
      m.showAlert(alert, i);
    });
  };

  m.titleGlue = function (item) {
    var t = "";
    t += item.name + "||";
    t += item.info + "||";
    t += "|" + "Используется в бою";
    if (item.hp != "" && item.hp > 0) {
      t +=
        "|" +
        "Жизни:" +
        " +" +
        (item.hp <= 0.1 ? item.hp * 1000 + "%" : item.hp);
    }
    for (var i = 1; i < 8; i++) {
      if (item["special" + i + "name"] == "") continue;
      var s = item["special" + i + "name"] + ": ";
      if (item["special" + i + "before"]) {
        s += item["special" + i + "before"];
      }
      s += item["special" + i];
      if (item["special" + i + "after"]) {
        s += item["special" + i + "after"];
      }
      /*var c = false;
    if (/;/.test(s) ) {
      s = s.replace(/;/i, item['special'+i]);
      c = true;
    } else {
      s = s.replace(/;/i, '');
    }
    if (/\|/.test(s)){
      s = s.replace(/\|/ig, ': ');
    }
    if (!/:/.test(s)) {
      s = s + ': ';
    }
    if (!c) s = s + item['special'+i];*/
      t += "|" + s;
    }
    var stackStr = "";
    var cnt = 0;
    if (item.stackList) {
      for (var prop in item.stackList) {
        stackStr +=
          "|{nbsp}" +
          item.stackList[prop][1] +
          " шт. " +
          (item.stackList[prop][2] ? "до " : "") +
          item.stackList[prop][0];
        cnt++;
      }
      if (cnt > 1 && stackStr != "") {
        t += "|{b}" + "Предметы в пачке:" + "{/b}" + stackStr;
      }
    }
    if (cnt < 2 && item.outDate) {
      t += "|" + "Срок годности:" + " " + item.outDate;
    }
    return t;
  };

  m.getFieldByIndex = function (object, index) {
    var result = false;
    var j = 0;
    $.each(object, function (i, val) {
      if (result) return;
      if (index == j) {
        result = val;
      }
      j++;
    });
    return result;
  };

  m.redrawFightItems = function (items, maxSlots) {
    if (items == undefined) return;
    var slots = $(".object-thumbs", ".slots-groupfight").children();
    //var oS = $('div[rel="fight"]').not('.slots-groupfight');
    //oS = $('.object-thumbs', oS).empty();
    var oS = $('div[htab="fight"][rel="fight"]')
      .not(".slots-groupfight")
      .empty();

    if (maxSlots == undefined) maxSlots = 4;
    var fslot = maxSlots - 1;
    // index поэтому - 1

    if ($("b", slots[fslot]).hasClass("unfunctional")) {
      var buffer = m.tpl.buyFightSlot;
      fslot = fslot - 1;
    } else {
      var buffer = m.tpl.blankItem;
    }
    var s = "";
    $.each(items.fi, function () {
      if (m.items[this.id]) m.items[this.id].destroy();
      var previousItem = 0;
      var pos;
      if (this.subtype == "fight_grenade" && items.afi[this.code]) {
        if (items.afi[this.code].id) {
          previousItem = items.afi[this.code].id;
        }
      } else if (this.subtype != "fight_grenade" && items.afi[this.subtype]) {
        if (items.afi[this.subtype].id) {
          previousItem = items.afi[this.subtype].id;
        }
      } else if (
        m.getFieldByIndex(items.afi, fslot) &&
        m.getFieldByIndex(items.afi, 1)
      ) {
        previousItem = m.getFieldByIndex(items.afi, 1).id;
      }
      s = oS.html();
      if (this.type != "fight_passive") {
        s +=
          '<div class="object-thumb"><div class="padding"><img tooltip="1" title="' +
          m.titleGlue(this) +
          '" src="/@/images/obj/' +
          this.image +
          '" data-id="' +
          $.trim(this.id) +
          '"/><div class="count">#' +
          this.durability +
          '</div><div class="action" data-d=\'' +
          '{"unlocked":1, "inventory":' +
          this.id +
          ', "previousItemId":' +
          previousItem +
          "}" +
          "' data-id=\"" +
          $.trim(this.id) +
          '" data-m="1" data-action="item-special/switch-weapon-group" data-fightitem="1" ><span>' +
          l.DRESS_FIGHT_ITEM +
          "</span></div></div></div></div>";
      } else {
        if (this.usestate == "fight") {
          s +=
            '<div class="object-thumb"><div class="padding"><img tooltip="1" title="' +
            m.titleGlue(this) +
            '" src="/@/images/obj/' +
            this.image +
            '" data-id="' +
            $.trim(this.id) +
            '"/><div class="count">#' +
            this.durability +
            '</div><div class="action" data-id="' +
            $.trim(this.id) +
            '" id="' +
            this.code +
            '-btn" onclick="showObjectOvertip(this, \'' +
            this.unlockedby.replace(/"/g, "&quot;") +
            "', " +
            this.id +
            ');"><span>выбрать</span></div></div></div></div>';
        } else {
          s +=
            '<div class="object-thumb"><div class="padding"><img tooltip="1" title="' +
            m.titleGlue(this) +
            '" src="/@/images/obj/' +
            this.image +
            '" data-id="' +
            $.trim(this.id) +
            '"/><div class="count">#' +
            this.durability +
            "</div></div></div></div>";
        }
      }
      /*oS.append(Mustache.to_html(m.tpl.objectThumb, {
      title:m.titleGlue(this),
      image:this.image,
      id:$.trim(this.id),
      count:this.durability,
      data:'{"unlocked":1, "inventory":'+this.id+', "previousItemId":'+previousItem+'}',
      btn:l.DRESS_FIGHT_ITEM
      }));*/
      oS.html(s);
    });

    var i = 0;
    $.each(items.afi, function () {
      if (m.items["_" + this.id]) m.items["_" + this.id].destroy(true);
      if (this.active == 1) {
        $(slots[i]).html(
          Mustache.to_html(m.tpl.itemFight, {
            title: m.titleGlue(this),
            image: this.image,
            id: "_" + this.id,
            count: this.durability,
            data: '{"unlocked":0, "inventory":' + this.id + "}",
            btn: l.WITHDRAW_FIGHT_ITEM,
          })
        );
        i++;
      }
    });

    if (i < maxSlots) {
      $(slots[i]).html(m.tpl.blankItem);
      if (i == maxSlots - 1) $(slots[i]).html(buffer);
    }
    simple_tooltip(
      {
        s: "*[tooltip=1]",
        context: 'div[rel="fight"]',
      },
      "tooltip"
    );
    simple_tooltip(
      {
        s: "*[tooltip=1]",
        context: "#slots-groupfight-place",
      },
      "tooltip"
    );
  };

  m.redrawEquipment = function (items) {
    var slotsEq = {};
    var slotsFi = {};
    var defHtml = "";
    for (var i = 0; i < 17; i++) {
      if (i == 8) {
        defHtml = "";
        //buttonGadgetHtml();
      } else {
        defHtml = "";
      }
      m.slotsObj
        .children(".slot" + i)
        .html(defHtml)
        .unbind("mouseover")
        .unbind("mousemove")
        .unbind("mouseout")
        .removeClass("injured")
        .removeClass("notempty");
    }
    $.each(m.items, function () {
      if (
        this.id == undefined ||
        this.slot == "" ||
        items[this.id] == undefined ||
        this.slot == undefined
      )
        return;
      var obj = m.slotsObj.children(".slot" + m.slotArr[this.slot]);
      if (items[this.id].equipped == 1 && slotsEq[this.slot] == undefined) {
        if (this.btn.children().length > 0) {
          this.btn.html("<span>" + l.LANG_INVENTORY_PUTOFF + "</span>");
        } else {
          this.btn.text(l.LANG_INVENTORY_PUTOFF);
        }
        //obj.empty();
        if (
          $(this.obj).attr("src") !=
          "/@/images/obj/" + items[this.id].image
        ) {
          $(this.obj).attr("src", "/@/images/obj/" + items[this.id].image);
        }
        obj.prepend(this.obj.clone()).prepend(this.mf.clone());

        obj.mouseover(this._mouseover);
        obj.mousemove(this._mousemove);
        obj.mouseout(this._mouseout);
        slotsEq[this.slot] = 1;
        this.btn.data("action", "withdraw");
      } else {
        if (this.btn.children().length > 0) {
          this.btn.html("<span>" + l.LANG_INVENTORY_PUTON + "</span>");
        } else {
          this.btn.text(l.LANG_INVENTORY_PUTON);
        }
        this.btn.data("action", "dress");
      }
    });
  };

  m.slots = {
    hat: "slot1",
    talisman: "slot2",
    cloth: "slot3",
    weapon: "slot4",
    accessory1: "slot5",
    tech: "slot6",
    shoe: "slot7",
    pouch: "slot8",
    jewellery: "slot9",
    cologne: "slot10",
    phone: "slot11",
    glasses: "slot12",
    dungeon1: "slot13",
    phone2: "slot14",
    gadget: "slot15",
    hand: "slot16",
  };

  m.redrawEmptySlots = function () {
    var slots = $("#content .slots li[class^=slot]");
    var onclicks = {
      slot1: "AngryAjax.goToUrl('/shop/section/hats')",
      slot2: "AngryAjax.goToUrl('/shop/section/talismans')",
      slot3: "AngryAjax.goToUrl('/shop/section/clothes')",
      slot4: "AngryAjax.goToUrl('/shop/section/weapons')",
      slot5: "AngryAjax.goToUrl('/berezka/section/accessory')",
      slot6: "AngryAjax.goToUrl('/shop/section/tech')",
      slot7: "AngryAjax.goToUrl('/shop/section/shoes')",
      slot8: "AngryAjax.goToUrl('/shop/section/pouches')",
      slot9: "AngryAjax.goToUrl('/shop/section/jewellery')",
      slot10: "AngryAjax.goToUrl('/shop/section/perfumery')",
    };
    for (var i = 0, slot; (slot = slots[i]); i++) {
      slot = $(slot);
      if (slot.children().length) {
        slot.removeClass("empty").addClass("notempty");
        slot.removeAttr("onclick");
        var item = m.items[slot.data("id")];
        if (item) {
          item.obj.unbind("mouseover", item._mouseover);
          item.obj.unbind("mousemove", item._mousemove);
          item.obj.unbind("mouseout", item._mouseout);
        }
      } else if (typeof slot.attr("data-slot-disabled") == "undefined") {
        var slotClass = slot.attr("class").match(/slot([0-9])+/);
        if (slotClass) {
          slotClass = slotClass[0];
        }
        if (onclicks[slotClass]) {
          slot.addClass("empty").removeClass("notempty");
          slot.attr("onclick", onclicks[slotClass]);
        }
        if (l.LANG_PROFILE_TOOLTIP_TITLES[slotClass]) {
          m.items["_" + slot.data("id")] = new m.item(slot, null, null, {
            title: l.LANG_PROFILE_TOOLTIP_TITLES[slotClass],
            content: l.LANG_PROFILE_TOOLTIP_MSGS[slotClass],
          });
        }
      } else if (slot.attr("data-slot-disabled") == 1) {
        slot.css("background-position", "50% -280px");
      }
    }
  };

  m.redrawKickedSlots = function (kickedslots) {
    if (kickedslots && kickedslots.kicked) {
      $.each(kickedslots.kicked, function (index, value) {
        var time = value - Math.round(new Date().getTime() / 1000);

        var treatSlot =
          '<span class="time" timer="' +
          time +
          '" endtime="' +
          value +
          '" style=""></span>';
        treatSlot +=
          '<div style="font-size:11px; margin-top:16px;"><span class="dashedlink" style="color:#9f3f0b; border-color:#9f3f0b;" onclick="treatSlot(this);" slot="shoe">';
        treatSlot += moswar.lang.TREAT_SLOT_TITLE_SLOT;
        treatSlot += "</span></div>";
        $("." + m.slots[index])
          .addClass("injured")
          .html(treatSlot);
        countdown($("." + m.slots[index] + " .time"));
      });
    }
  };

  m.makeAction = function (act, target, params) {
    if (typeof params == "undefined") {
      params = new Array();
    }
    $.each(target, function (i) {
      if (
        typeof this[act] !== "undefined" &&
        typeof this[act].apply != "undefined"
      )
        this[act].apply(this, params);
    });
  };

  m.newTooltip = function (info) {
    return info.title
      ? Mustache.to_html(moswar.tpl.genericTooltip, info)
      : Mustache.to_html(moswar.tpl.noTitleGenericTooltip, info);
  };

  m.superhitSlotItems = null;

  m.item = function (item, html, job, info) {
    this.obj = $(item);
    this.info = info;
    if (html != null) {
      this.tooltip = $(html).appendTo("body");
      this.tooltip.attr("id", Math.floor(Math.random() * 999999));
      var h2 = this.tooltip.find("h2:first");
      if (h2.lenght && !this.tooltip.find("h2").text()) {
        h2.css("display", "none");
      }
    }
    this.job = job;
    this.mf = this.obj.siblings(".mf");
    this.btn = this.obj.parent().children(".action").not("[rel='notfreeze']");
    this.id = this.obj.data("id");
    this.st = this.obj.data("st");
    this.unlocked = this.obj.data("unlocked");
    this.disabled = false;
    this.count = $(".count", this.obj.parent());
    this.slot = this.btn.data("slot");
    var self = this;
    if (this.slot == "phone") {
      this.obj.css("cursor", "pointer");
      this.obj.attr(
        "onclick",
        "AngryAjax.goToUrl('/phone/call/" + self.id + "');"
      );
    }
    if (this.obj.data("type") == "superhit_slot") {
      if (!m.superhitSlotItems) {
        m.superhitSlotItems = {};
      }
      m.superhitSlotItems[this.id] = this;
    }
    this.d = this.btn.data("d");
    this.isFightItem = this.btn.data("fightitem");
    m.method = "GET";
    if (this.btn.data("m")) this.method = "POST";
    this.shell = this.obj.parents(".object-thumb:first");
    self.nohide = this.obj.attr("nohide");
    var tooltipOnMouseMove = function (e) {
      if (!self.nohide) {
        var tooltip = $("#tooltipHolder");
        var left = e.pageX + 15;
        var width = tooltip.width();
        var windowWidth = jqWindow.width();
        if (left + width - jqWindow.scrollLeft() > windowWidth - 10) {
          left = windowWidth + jqWindow.scrollLeft() - width - 10;
        }
        var top =
          e.pageY +
          15 -
          (self.obj.attr("data-tooltip-up") == 1 ? tooltip.height() + 25 : 0);
        var height = tooltip.height();
        var windowHeight = jqWindow.height();
        if (top + height - jqWindow.scrollTop() > windowHeight - 10) {
          top = e.pageY - height - 10;
        }
        var t = tooltip;
        if (self.tooltip) {
          var t = self.tooltip;
        }
        t.css({
          left: left,
          top: top,
        });
      }
    };
    this._mouseover = function (e) {
      if (!self.nohide && $(this).attr("data-tooltip-dsb") != 1) {
        if (self.tooltip) {
          self.tooltip.show();
          if (self.tooltip.find("img[src$='_spr.png']").length > 0) {
            AnimatedItems.add(self.tooltip.find("img[src$='_spr.png']"));
          }
          tooltipOnMouseMove(e);
        } else {
          $("#tooltipHolder").remove();
          $(m.newTooltip(self.info)).appendTo("body");
          countdown($("#tooltipHolder *[timer]"));
          if ($("#tooltipHolder img[src$='_spr.png']").length > 0) {
            AnimatedItems.add($("#tooltipHolder img[src$='_spr.png']"));
          }
          tooltipOnMouseMove(e);
        }
      }
    };
    var jqWindow = $(window);
    this._mousemove = tooltipOnMouseMove;
    this._mouseout = function () {
      if (!self.nohide) {
        var t = $("#tooltipHolder");
        if (self.tooltip) {
          var t = self.tooltip;
        }
        t.hide();
        AnimatedItems.removeFromContainer(t);
      }
    };

    if (this.btn && this.btn.data("action") && !this.btn.hasClass("disabled")) {
      this.btn.bindEx(
        "click",
        function () {
          m.actionManager.performAction.apply(self);
          m.makeAction("disable", m.items);
        },
        this.id
      );
    }

    this.obj.mouseover(this._mouseover);
    this.obj.mousemove(this._mousemove);
    this.obj.mouseout(this._mouseout);
    if (this.obj.attr("clickable")) {
      self.tooltip.find("span.close-cross").click(function () {
        self.tooltip.hide();
        self.nohide = 0;
      });
      this.obj.click(function () {
        if (self.nohide && self.tooltip.is(":visible")) {
          self.nohide = 0;
          self.tooltip.find("span.close-cross").hide();
        } else {
          self.tooltip.show();
          self.nohide = 1;
          self.tooltip.find("span.close-cross").show();
        }
        $(self).attr("title", m.lang.LANG_MAIN_129);
      });
    }

    if (this.obj.hasClass("num")) {
      this.stat = true;
      this.type = this.obj.parents(".stat:first").data("type");
      this.mf = this.obj.siblings(".mf");
      this.bar = this.obj.parent().siblings(".bar");
      this.rank = this.obj.parent().siblings(".rank");
      m[this.obj.parents(".stats:first").data("type")][this.type] = this;
    }
    return this;
  };

  m.item.prototype.enable = function () {
    if (!this.disabled) return;
    this.btn.eventOn("click", this.id);
    this.btn.removeClass("disabled");
  };

  m.item.prototype.disable = function () {
    if (this.btn.hasClass("disabled")) return;
    this.btn.eventOff("click", this.id);
    this.btn.addClass("disabled");
    this.disabled = true;
  };

  m.item.prototype.destroy = function (f) {
    this.obj.unbind("mouseover").unbind("mousemove").unbind("mouseout");
    if (this.tooltip) {
      this.tooltip.hide().remove();
    } else {
      $("#tooltipHolder").remove();
    }
    m.items[this.id] = undefined;
    if (f) {
      this.obj.parents(".padding:first").remove();
    } else {
      this.obj.parents(".object-thumb:first").remove();
    }
  };

  m.hpBar = function () {
    this.obj = $("div.life", "#personal");
  };

  m.hpBar.prototype.setHP = function (hp, maxhp) {
    setHP(hp, maxhp);
    $("#maxhp").text(Math.round(maxhp));
  };

  m.item.prototype.rebuilt = function () {
    this.obj.mouseover(this._mouseover);
    this.obj.mousemove(this._mousemove);
    this.obj.mouseout(this._mouseout);
    var self = this;
    if (this.btn && this.btn.data("action") && !this.btn.hasClass("disabled")) {
      this.btn.bindEx(
        "click",
        function () {
          m.actionManager.performAction.apply(self);
          m.makeAction("disable", m.items);
        },
        this.id
      );
    }
  };

  m._format = function (nStr) {
    if (typeof nStr == "undefined") return false;
    nStr += "";
    x = nStr.split(".");
    x1 = x[0];
    x2 = x.length > 1 ? "." + x[1] : "";
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, "$1" + "," + "$2");
    }
    return x1 + x2;
  };

  m.redrawWallet = function (wallet) {
    if (wallet == undefined) return;

    wallet.money = wallet.m || wallet.money;
    wallet.oil = wallet.n || wallet.oil;
    wallet.honey = wallet.h || wallet.honey;
    wallet.ore = wallet.o || wallet.ore;
    updateWallet(wallet);
    return;
    var money = m._format(wallet.money) || m._format(wallet.m);
    m.player.money.html(money).parents("li:first").attr("title", money);
    var oil = m._format(wallet.oil) || m._format(wallet.n);
    m.player.oil.html(oil).parents("li:first").attr("title", oil);
    var honey = m._format(wallet.honey) || m._format(wallet.h);
    m.player.honey.html(honey).parents("li:first").attr("title", honey);
    var ore = m._format(wallet.ore) || m._format(wallet.o);
    m.player.ore.html(ore).parents("li:first").attr("title", ore);
    $(".pet-golden.counter").html(wallet.medals + "<i></i>");
  };

  m.fillScreen = {
    show: function (options) {
      var o = $.extend(
        {
          zIndex: 25,
          background: "#000",
          opacity: 0.25,
          onclick: function () {},
        },
        options
      );
      var screen = $(
        '<div id="fill-screen" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: ' +
          o.background +
          "; opacity: " +
          o.opacity +
          "; filter: alpha(opacity=" +
          100 * o.opacity +
          "); z-index: " +
          o.zIndex +
          ';"></div>'
      );
      $("#fill-screen").remove();
      $("body").append(screen);
      //screen.height($('.body-bg').height() + $('.main-bg').offset().top);
      screen.click(o.onclick);
    },
    hide: function () {
      $("#fill-screen").remove();
    },
  };
})();
