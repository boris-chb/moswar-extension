/* global $ AngryAjax myphone */

export function phoneSpeedUp() {
  myphone.appShowHide = function (app, action) {
    if (action == "hide") {
      app.attr("style", "display: none");
    } else if (action == "show") {
      var app_id = app.attr("id");
      app
        .css({ opacity: 0, display: "block" })
        .css("transform", "scale(0.5)")
        .animate(
          {
            opacity: 1,
          },
          {
            duration: 1,
            easing: "easeInOutQuint",
            step: function (now, fx) {
              app.css("-webkit-transform", "scale(" + now + ")");
              app.css("-moz-transform", "scale(" + now + ")");
              app.css("-ms-transform", "scale(" + now + ")");
              app.css("transform", "scale(" + now + ")");
            },
            complete: function () {
              $("#amulet-reward_buffs").fadeOut("slow");

              switch (app_id) {
                case "app-trade":
                  myphone.getTradeContract();
                  break;

                case "app-trade2":
                  myphone.getTradeItem();
                  break;

                case "app-messages":
                  myphone.getFightList();
                  break;

                case "app-mfphone":
                  $("button", app)
                    .unbind("click")
                    .bind("click", function () {
                      AngryAjax.goToUrl(
                        "/phone/call/mf-item/" + myphone.currentPhone + "/"
                      );
                    });
                  break;
              }

              console.log("Колбэк появления объекта");
              if (
                app.hasClass("scrollable") &&
                !app.hasClass("jspScrollable")
              ) {
                console.log("Инициация скроллбаров");
                app.jScrollPane();
              }
            },
          }
        );
    }
  };
}
