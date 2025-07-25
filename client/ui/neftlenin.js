/* global $ AngryAjax showAlert m intToKM NeftLenin */

export function neftLeninSpeedUp() {
  // skip single fight animation
  NeftLenin.attack = function () {
    $.post(
      "/neftlenin/",
      { ajax: 1, action: "startAction" },
      function (data) {
        if (data["result"]) {
          AngryAjax.reload();
        } else {
          if (data["return_url"]) {
            AngryAjax.goToUrl(data["return_url"]);
          }
          if (data["error"]) {
            showAlert(
              m.lang.LANG_MAIN_105,
              data["error"],
              true,
              "",
              ".welcome"
            );
          }
        }
      },
      "json"
    );
  };

  // skip prize reroll animation
  NeftLenin.escape = function () {
    $.post(
      "/neftlenin/",
      { ajax: 1, action: "escape" },
      function (data) {
        if (data["result"]) {
          var elm = NeftLenin.getAlertForStep();

          //elm.find('.awards').html(data['data']);
          elm
            .find(".progress-wrapper")
            .css({ opacity: 1 })
            .animate(
              {
                opacity: 0,
              },
              {
                duration: 1,
                complete: function () {
                  elm.find(".awards").html(data["data"]);
                  $(this).animate({ opacity: 1 }, 1);
                },
              }
            );

          NeftLenin.init(data);
          $(".enemy-place").hide();
        } else {
          if (data["return_url"]) {
            AngryAjax.goToUrl(data["return_url"]);
          }
          if (data["error"]) {
            showAlert(
              m.lang.LANG_MAIN_105,
              data["error"],
              true,
              "",
              ".welcome"
            );
          }
        }
      },
      "json"
    );
  };

  // skip alert reset animation
  NeftLenin.reset = function (type) {
    if ($(".pipeline-actions .button").hasClass("disabled")) {
      return;
    }

    $.post(
      "/neftlenin/",
      { ajax: 1, action: "reset", type: type },
      function (data) {
        $(".pipeline-actions .button").removeClass("disabled");

        if (data["result"]) {
          NeftLenin.init(data);

          var elm = NeftLenin.getAlertForStep();
          if (elm.css("display") == "block") {
            elm.find(".awards").html(data["data"]);
            elm.fadeIn("slow");
          }

          if (data["honey"]) {
            $(".med-block span").text(intToKM(data["honey"]));
            $(".med-block").attr("title", "Меда: " + data["honey"]);
          }
        } else {
          if (data["return_url"]) {
            AngryAjax.goToUrl(data["return_url"]);
          }
          if (data["error"]) {
            showAlert(
              m.lang.LANG_MAIN_105,
              data["error"],
              true,
              "",
              ".welcome"
            );
          }
        }

        NeftLenin.fixAlertPosition(elm);
      },
      "json"
    );
  };

  NeftLenin.viewPreMission = NeftLenin.viewPreMission2;
}
