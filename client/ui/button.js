/* global $  simple_tooltip */

import { strToHtml } from "../utils.js";

export function createButton({
  text,
  onClick = async () => {},
  title,
  className,
  disableAfterClick = true,
  special = false,
}) {
  let btn = strToHtml(
    `<button type="button" class="${className ? className + "-btn" : ""} ${special ? "autopilot-action" : "button"}"><span style="float: none;" class="f"><i class="rl"></i><i class="bl"></i><i class="brc"></i><div class="c">${text}</div></span></button>`
  );

  // Function to update button text without breaking the structure
  btn.setText = function (newText) {
    $(btn).find(".c").text(newText);
  };

  btn.addEventListener("click", async (event) => {
    if (btn.classList.contains("disabled")) return;

    btn.classList.add("disabled");

    try {
      await onClick(event);
    } catch (e) {
      console.error(onClick.toString(), e);
    }

    if (!disableAfterClick) {
      btn.classList.remove("disabled");
    }
  });

  if (title) {
    btn.title = title;
  }

  if (special) {
    $(btn).css({
      border: "2px solid #3048a5",
      fontSize: "10px",
      minWidth: "120px",
      lineHeight: "18px",
    });
  }

  simple_tooltip($(btn));

  return btn;
}

export function createDropdown({
  toggleText,
  className,
  items,
  isOpen = true,
}) {
  let $container = $(`<div class="dropdown ${className}"></div>`).css({
    display: "flex",
    gap: "8px",
    justifyContent: "center",
    flexWrap: "wrap",
    alignItems: "center",
  });

  if (!isOpen) {
    $container.hide();
  }

  items.forEach((item) => {
    $container.append(item);
  });

  const toggleBtn = createButton({
    text: toggleText,
    onClick: (e) => {
      const btn = e.currentTarget;
      $container.toggle("fast");
      btn.classList.remove("disabled");
    },
  });

  const $dropdown = $("<div>")
    .css({
      display: "flex",
      gap: "8px",
      justifyContent: "center",
      flexDirection: "column",
      alignItems: "center",
    })
    .append(toggleBtn, $container);

  // Expose append method
  $dropdown.append = (item) => {
    $container.append(item);
  };

  return $dropdown;
}

// createDropdown({
//   className: "abilitied-dropdown",
//   toggleText: "Показать абилки",
//   items: $("#abls").children().toArray(),
//   isOpen: true,
// });

export function createNumberAction({
  label,
  action,
  className,
  min = 0,
  max = 500,
}) {
  let $container = $(`<div class="${className} btn-input-field"></div>`).css({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    padding: "4px",
  });

  let $input = $("<input>", {
    type: "number",
    min,
    max,
    value: min,
    class: "input-field",
  })
    .css({
      width: "60px",
      textAlign: "center",
    })
    .on("input", function () {
      let val = parseInt($(this).val(), 10);
      if (!val) $(this).val(min);
      if (val > max) {
        $(this).val(max);
      }
      if (val < min) {
        $(this).val(min);
      }

      // Update button text dynamically
      button.setText(`${label} x${$(this).val()}`);
    });

  let button = createButton({
    text: `${label} x${min}`,
    className,
    onClick: async () => {
      let count = parseInt($input.val(), 10);
      if (isNaN(count) || count <= min || count > max) return;

      button.classList.add("disabled");

      // Track start time
      const startTime = Date.now();

      for (let i = 0; i < count; i++) {
        await action();
      }

      // Track end time and calculate the difference
      const endTime = Date.now();
      const diffMs = endTime - startTime;

      button.classList.remove("disabled");

      // // Call showAlert with the formatted message
      // showAlert(
      //   "Готово",
      //   `Повторил действие ${count} раз за ${formatTime(Math.floor(diffMs / 1000))}.`
      // );
    },
  });

  $container.append($input, $(button));
  return $container;
}
