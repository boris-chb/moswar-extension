/* global $ petarenaSetActive */

import { createButton } from "./ui";
import { createContainer } from "./ui/container";
import { getElementsOnThePage } from "./utils";

async function getPetAbilities(petId) {
  const petInfo = await getElementsOnThePage(
    ".petarena-training",
    `/petarena/train/${petId}/`
  );

  if (!petInfo) return;

  let abilities;

  abilities = $(petInfo).find(".abilities.hint-msg");

  if (!abilities.length) {
    abilities = $(petInfo).find(".pet-info").next();
  }

  abilities = abilities.find(".object-thumb").filter((_, el) => {
    const $el = $(el);
    const hasAction = $el.find(".action").length;
    const timerDiv = $el.find(".timer");
    const hasTimer = timerDiv.length;
    const img = $el.find("img");

    // if (!hasAction || !hasTimer) return false;

    timerDiv.css({
      borderCollapse: "collapse",
      emptyCells: "show",
      lineHeight: "1.3",
      listStyleType: "none",
      display: "block",
      background: "#ab6a33",
      border: "1px solid #804600",
      color: "white",
      fontSize: "12px",
      fontWeight: "bold",
      textAlign: "center",
      position: "absolute",
      left: "2px",
      top: "26px",
      padding: "0px 3px",
      borderRadius: "5px",
      cursor: "default",
    });

    simple_tooltip(img);
    countdown(timerDiv);
    return hasAction || hasTimer;
  });

  abilities.each((_, el) => {});

  console.log(abilities);

  return abilities;
}

function getPetsIds() {
  return $(".object-thumb")
    .map((_, el) => {
      const $thumb = $(el);
      $thumb.css({ height: "auto" });
      const $action = $thumb.find(".action span:contains('обучить')").parent();
      const id = $action.attr("onclick")?.match(/\/(\d+)\//)?.[1];
      if (!id) return;
      return id;
    })
    .get();
}

async function renderAbilitiesContainer() {
  if ($("#pets-abilities").length > 0) return;
  const container = $('<div id="pets-abilities"></div>').css({
    display: "flex",
    flexWrap: "wrap",
    maxWidth: "330px",
    gap: "4px",
    overflow: "auto",
    justifyContent: "center",
    alignItems: "center",
  });

  const showAbilitiesBtn = createButton({
    text: "Показать абилки питомцев",
    onClick: async () => {
      const petsIds = getPetsIds();
      for (const petId of petsIds) {
        const ability = await getPetAbilities(petId);
        container.append(ability);
      }
    },
    className: "show-abilities",
    disableAfterClick: true,
  });

  const wrapper = createContainer({
    title: "Абилки питомцев",
    children: [container, showAbilitiesBtn],
  });

  $(".inventary .equipment-cell").last().prepend(wrapper);
}

export async function redrawPetarena() {
  if ($("#pets-table").length) return; // rerendering occured if #pets-table is present
  redrawLayout();

  const [cage, relict] = $(".block-bordered .center.clear")
    .filter(function () {
      const text = $(this).find("h3").text().trim();
      return (
        text === "Боевая Переноска питомцев" || text === "Та самая реликва"
      );
    })
    .get();

  // append relic pets table
  const relictPetsTable = await getElementsOnThePage(
    "table",
    "/petarena/cage-relic/"
  );

  if (relictPetsTable) {
    $(relictPetsTable)
      .find("#equipment-accordion, dd, .object-thumbs")
      .css({ width: "auto", scrollbarWidth: "none", overflowY: "scroll" })
      .attr("id", "pets-table");

    $(relict).append(relictPetsTable);
  }

  // append cage table
  const cageTable = await getElementsOnThePage("table", "/petarena/cage/");

  if (cageTable) {
    $(cageTable).find("#equipment-accordion, dd, .object-thumbs").css({
      width: "auto",
      height: "auto",
      scrollbarWidth: "none",
      overflowY: "scroll",
    });

    $(cage).append(cageTable);
  }

  await renderAbilitiesContainer();
}

function redrawLayout() {
  const table = $(".inventary");

  table.find("tr").each(function () {
    const tds = $(this).find("td");

    const firstChild1 = tds.eq(0).children().first();
    const firstChild2 = tds.eq(1).children().first(); // Might not exist

    if (firstChild1.length) {
      table.find("tr:first td:first").append(firstChild1);
    }
    if (firstChild2.length) {
      table.find("tr:first td:last").append(firstChild2);
    }

    // Remove empty rows (tr) if both tds are now empty
    if (tds.eq(0).is(":empty") && tds.eq(1).is(":empty")) {
      $(this).remove();
    }
  });

  // remove useless info taking up space...
  $(".dopings-cell").first().find(".block-bordered").slice(0, 2).remove();

  // append button to take to battle for each pet
  $("#equipment-accordion .object-thumbs")
    .first()
    .children(".object-thumb")
    // .filter((_, el) => {
    //   const src = $(el).find("img").attr("src");
    //   return ![
    //     "/@/images/obj/pets/40-5.png",
    //     "/@/images/obj/pets/42-6.png",
    //   ].includes(src);
    // })
    .each((_, el) => {
      const $thumb = $(el);
      $thumb.css({ height: "auto" });
      const $action = $thumb.find(".action span:contains('обучить')").parent();
      const id = $action.attr("onclick")?.match(/\/(\d+)\//)?.[1];
      if (!id) return;

      let takeWithMeBtn = $("<div>", {
        class: "take-pet action",
        html: "<span>в бой</span>",
        click: function () {
          petarenaSetActive(id, "battle");
        },
      });

      takeWithMeBtn.insertAfter($action);
    });
}
