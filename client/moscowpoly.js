/* global $ postUrl mt_rand Power1 */
import { HEADERS, showAlert } from "./index.js";
import { createButton, createNumberAction } from "./ui/button.js";
import { delay } from "./utils.js";

let Moscowpoly = window.Moscowpoly;
let SteppedEase = window.SteppedEase;
let TweenLite = window.TweenLite;

export function moscowpolySpeedUp() {
  Moscowpoly.animateDices = function (result) {
    var self = this;

    var $dice1 = this.$dice1;
    var $dice2 = this.$dice2;

    $dice1.unbind("click");
    $dice2.unbind("click");

    // первый кубик спрайтовая анимация
    $dice1.removeAttr("style");
    $dice1.css({ "background-position": "0 0" }).show(0);
    var dice1Steps = mt_rand(10, 20);
    var dice1AnimationTime = (mt_rand(1, 2) * dice1Steps) / 1000;
    var dice1TweenFrames = TweenLite.to($dice1, dice1AnimationTime, {
      backgroundPosition: -1 * 65 * dice1Steps + "px 0",
      ease: SteppedEase.config(dice1Steps),
      paused: true,
      onComplete: function () {
        $dice1
          .css("background-position", "")
          .removeClass("i-1 i-2 i-3 i-4 i-5 i-6")
          .addClass("i-" + result[0]);

        if (dice1AnimationTime >= dice2AnimationTime) {
          self.onAnimateDicesComplete();
        }
      },
    });

    // второй кубик спрайтовая анимация
    $dice2.removeAttr("style");
    $dice2.css("background-position", "0 -65px").show(0);
    var dice2Steps = mt_rand(10, 20);
    var dice2AnimationTime = (mt_rand(1, 2) * dice2Steps) / 1000;
    var dice2TweenFrames = TweenLite.to($dice2, dice2AnimationTime, {
      backgroundPosition: -1 * 65 * dice2Steps + "px -65px",
      ease: SteppedEase.config(dice2Steps),
      paused: true,
      onComplete: function () {
        $dice2
          .css("background-position", "")
          .removeClass("i-1 i-2 i-3 i-4 i-5 i-6")
          .addClass("i-" + result[1]);

        if (dice1AnimationTime < dice2AnimationTime) {
          self.onAnimateDicesComplete();
        }
      },
    });

    // угол откуда кинем кубик
    var dicePosition =
      Moscowpoly.dicePositions[mt_rand(0, Moscowpoly.dicePositions.length - 1)];

    // первый кубик бросок
    $dice1.css(dicePosition);
    var dice1Params = { ease: Power1.easeOut, paused: true };
    for (var i in dicePosition) {
      dice1Params[i] = mt_rand(90, 350);
    }
    var dice1TweenPosition = TweenLite.to(
      $dice1,
      dice1AnimationTime,
      dice1Params
    );

    // первый кубик бросок
    $dice2.css(dicePosition);
    var dice2Params = { ease: Power1.easeOut, paused: true };
    for (var i in dicePosition) {
      dice2Params[i] = mt_rand(90, 350);
      if (Math.abs(dice1Params[i] - dice2Params[i]) < 35) {
        dice1Params[i] += dice1Params[i] > dice2Params[i] ? 50 : -50;
      }
    }
    var dice2TweenPosition = TweenLite.to(
      $dice2,
      dice2AnimationTime,
      dice2Params
    );

    // погнали
    dice1TweenFrames.play();
    dice2TweenFrames.play();

    dice1TweenPosition.play();
    dice2TweenPosition.play();
  };
  Moscowpoly.animateFigureRoute = function (steps) {
    if (steps.length == 0) {
      this.setInAction(false);

      this.setCellActive(this.data.current);
      this.updateInfoHTML();
      this.initState();
      return;
    }

    var self = this;
    var position = Moscowpoly.getFigurePositionByCell(steps[0]);

    TweenLite.to(this.$figure, 0.1, {
      top: position.top,
      left: position.left,
      // ease: Power2.easeOut, // Притормаживать на каждой клетке
      ease: Linear.easeNone, // Плавно пройти по всем клеткам
      paused: false,
      onComplete: function () {
        steps = steps.splice(1, steps.length - 1);

        self.animateFigureRoute(steps);
      },
    });
  };

  Moscowpoly.dropDices = function () {
    this.setInAction(true);

    var self = this;

    // posturl
    postUrl(
      "/home/moscowpoly_roll/",
      { action: "moscowpoly_roll", ajax: 1 },
      "post",
      function (data) {
        self.lastMove = data;
        self.state = data.state;
        self.animateDices(data.rollResult);

        if (data.text_m) {
          if (
            data.text_m?.text?.includes(
              "За прохождение клетки старт вы получаете:"
            )
          )
            return;

          self.addAlert(data.text_m);
        }
      }
    );

    setTimeout(() => {
      Moscowpoly.setInAction(false);
      Moscowpoly.doActivate();
    }, 500);
  };

  Moscowpoly.doActivate = function () {
    if (this.inAction) {
      return;
    }
    this.setInAction(true);
    var self = this;

    postUrl(
      "/home/moscowpoly_activate/",
      { action: "moscowpoly_activate", ajax: 1 },
      "post",
      function (data) {
        self.state = data.state;
        self.setInAction(false);

        if (
          data.text_m &&
          !data.text_m?.text?.includes("Бонус уже активирован")
        ) {
          self.addAlert(data.text_m);
        }

        self.updateInfoHTML();
        self.initState();
      }
    );
  };

  Moscowpoly.show = function () {
    var self = this;

    postUrl(
      "/home/moscowpoly_state/",
      { action: "moscowpoly_state", ajax: 1 },
      "post",
      function (data) {
        self.open(data);

        if (data.text_m) {
          self.addAlert(data.text_m);
        }

        if ($(".moscowpoly-multi-btn").length) return;

        const btnInputField = createNumberAction({
          label: "Бросить кубики",
          action: () => {
            Moscowpoly.dropDices();
            return new Promise((resolve) => setTimeout(resolve, 1000));
          },
          className: "moscowpoly-multi",
          disableAfterClick: false,
        });

        $(".moscowpoly-panel__td-center").append(btnInputField);
      }
    );
  };
}

export async function throwDices(count = 10, delaySeconds = 0.5) {
  for (let i = 0; i < count; i++) {
    await fetch(
      new URL(window.location.href).origin + "/home/moscowpoly_roll/",
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
        },
        referrer: new URL(window.location.href).origin + "/home/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: "action=moscowpoly_roll&ajax=1&__referrer=%2Fhome%2F&return_url=%2Fhome%2F",
        method: "POST",
        mode: "cors",
        credentials: "include",
      }
    );

    const activateResponse = await fetch(
      new URL(window.location.href).origin + "/home/moscowpoly_activate/",
      {
        headers: HEADERS,
        referrer: new URL(window.location.href).origin + "/home/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: "action=moscowpoly_activate&ajax=1&__referrer=%2Fhome%2F&return_url=%2Fhome%2F",
        method: "POST",
        mode: "cors",
        credentials: "include",
      }
    );

    const data = await activateResponse.json();

    if (data.result) {
      showAlert(data.title, data.data.text_m.text);
    }

    await delay(delaySeconds);
  }
}
