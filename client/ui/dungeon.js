/* global $ AngryAjax  DungeonViewer Dungeon postUrl */

export function dungeonSpeedUp() {
  DungeonViewer.tryToGoToRoom = function (id) {
    if ($("#preview-map").hasClass("data-prevent-click")) {
      $("#preview-map").removeClass("data-prevent-click");
      return;
    }

    if (DungeonViewer.activePlayerMoving) {
      return;
    }

    if (Dungeon.isCanGoToRoom(id)) {
      Dungeon.goToRoom(id, function (data) {
        DungeonViewer.movePlayerToRoom(0, id, data);
      });
    }
  };

  Dungeon.goToRoom = function (id, cb) {
    if (Dungeon.activeRequest) {
      return;
    }
    Dungeon.activeRequest = true;
    if (typeof id != "number") {
      id = id.replace("room-", "");
    }
    postUrl(
      "/dungeon/gotoroom/",
      { action: "gotoroom", room: id },
      "post",
      function (data) {
        Dungeon.activeRequest = false;
        DungeonViewer.initCooldown(data.cooldown);
        if (data.result || data.return_url) {
          AngryAjax.goToUrl(AngryAjax.getCurrentUrl());
        }
      }
    );
  };
}
