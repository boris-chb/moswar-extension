/* global $ updateWallet CasinoKubovich */

export function kubovichSpeedUp() {
  CasinoKubovich.rotate = function () {
    CasinoKubovich.rotateInterval = null;
    if (!CasinoKubovich.mayRotate) return false;
    CasinoKubovich.mayRotate = false;
    var balance = parseInt($("#fishki-balance-num").html().replace(",", ""));
    var cost = parseInt($("#push .fishki").text());
    if (!isNaN(cost) && cost > balance) {
      CasinoKubovich.errorChip();
      return;
    }
    CasinoKubovich.endPosition = null;
    CasinoKubovich.result = null;
    //	CasinoKubovich.takeResult();
    var kaction = "";
    if ($("div.reel-yellow").length) {
      kaction = "yellow";
    } else {
      kaction = "black";
    }
    $.post(
      "/casino/kubovich/",
      { action: kaction },
      function (data) {
        CasinoKubovich.result = data;
        if (CasinoKubovich.result) {
          if (CasinoKubovich.result.success) {
            CasinoKubovich.showMessage(CasinoKubovich.result.text);
          } else {
            if (!CasinoKubovich.result.ready) {
              clearInterval(CasinoKubovich.rotateInterval);
              CasinoKubovich.rotateInterval = null;
              CasinoKubovich.mayRotate = true;
              $("#prizes").empty();
              $("#reel-turning").attr("class", "");
              $("#push .cost").html(" - скоро");
              $("#push").addClass("disabled");
              $("#push-ellow").addClass("disabled");
              $("#steps tr.my").removeClass("my");
              $("#kubovich-smile").show();
              CasinoKubovich.showError(
                "К сожалению в данный момент Кубович отдыхает, приходите позже."
              );
              // кубович устал
            } else {
              if (CasinoKubovich.result.reload) {
                var isYellow = false;
                if ($("div.reel-yellow").length) {
                  isYellow = true;
                }
                CasinoKubovich.loadData(isYellow);
              } else {
                CasinoKubovich.errorChip();
              }
            }
          }
        }
        if (CasinoKubovich.result.wallet) {
          var wallet = {};
          wallet["money"] = CasinoKubovich.result.wallet.money;
          wallet["ore"] = CasinoKubovich.result.wallet.ore;
          wallet["honey"] = CasinoKubovich.result.wallet.honey;
          updateWallet(wallet);
        }
        CasinoKubovich.rotateInterval = null;
        CasinoKubovich.mayRotate = true;
        var count = 0;
        var current = 0;
        $("#kubovich-message button").unbind("click");
        $("#kubovich-message button").bind("click", function () {
          $("#kubovich-message").hide();
          $("#kubovich-message .data .text").html("");
        });
        CasinoKubovich.nextStep();
      },
      "json"
    );
  };
}
