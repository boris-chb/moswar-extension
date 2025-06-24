import { createButton } from "./button";

/* global $ AngryAjax */
export function createPopover(id, customCss = "") {
  let $container = $(`#${id}`);
  if (!$container.length) {
    $container = $("<div>", { id }).css({
      position: "fixed",
      width: "50%",
      top: "30%",
      left: "50%",
      transform: "translateX(-50%)",
      minHeight: "35vh",
      "overflow-y": "auto",
      "overflow-x": "hidden",
      display: "flex",
      "flex-wrap": "wrap",
      "justify-content": "center",
      "align-items": "center",
      gap: "10px",
      padding: "10px",
      "border-radius": "8px",
      background: "rgba(0, 0, 0, 0.8)",
      "box-shadow": "0px 4px 10px rgba(0, 0, 0, 0.3)",
      "z-index": 9999,
      "scrollbar-width": "thin",
      "pointer-events": "auto",
      border: "none",
    });

    if (customCss) {
      $container.attr("style", `${$container.attr("style")}; ${customCss}`);
    }

    const closeButton = createButton({
      text: "X",
      onClick: () => {
        $container.remove(), AngryAjax.reload();
      },
      title: "Закрыть окно",
    });

    const $closeButton = $(closeButton).css({
      position: "absolute",
      top: "2%",
      right: "2%",
      "z-index": 99999,
    });

    $container.append($closeButton);
    $("body").prepend($container);
  }
  return $container;
}
