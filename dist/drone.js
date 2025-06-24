/* global $ AngryAjax QuadrocopterGroupfightBlock */

async function useAbility(id, targetId) {
  let body = `action=usesuper&json=1&target=${id}`;

  if (targetId) {
    body += `&targets%5B%5D=${targetId}`;
  }

  await fetch("https://www.moswar.ru/fight/", {
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    },
    body: body,
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
}

async function restoreEnergy() {
  await fetch("https://www.moswar.ru/fight/", {
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    },
    body: "action=energy",
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
}

function getTargetId() {
  try {
    return $(".group-right .list-users li")
      .first()
      .find("input[type='radio']")
      .attr("id")
      .split("-")[1];
  } catch (error) {
    console.log("No drone targets");
    return null;
  }
}

function getCurrentTurn() {
  return $(".fight-log li h4").first().text();
}

async function monitorDroneHealth() {
  const healthText = $(".me .fighter_hp").text().split("/");
  const currentHealth = parseFloat(healthText[0].replace("M", "").trim());
  const maxHealth = parseFloat(healthText[1].replace("M", "").trim());

  console.log(`❤️‍🩹 Жизнь: ${currentHealth}M/${maxHealth}M`);

  if (currentHealth / maxHealth < 0.5) {
    console.log("Жизнь ниже 50%. Кушаем. 🍔");
    await useAbility(4);
    return true;
  }

  return false;
}

async function monitorDroneEnergy() {
  const currentEnergy = QuadrocopterGroupfightBlock.myEnergy;
  console.log("🔋 Энергия:", currentEnergy);
  if (currentEnergy < 30) {
    console.log("🪫 Мало энергии. Восстанавливаем. ⬆️");
    await restoreEnergy();
    return true;
  }
}

async function droneMode() {
  const $logsContainer = $(".log .fight-log .text");
  const currentTurn = $(".log .fight-log h4")?.text()?.split(" ")?.[1];

  $logsContainer.prepend($logsContainer.find(".attack_me"));

  console.log(currentTurn);

  const needsHealing = await monitorDroneHealth();
  await monitorDroneEnergy();

  if (needsHealing) {
    return;
  }

  const list = $("ul.list-users.list-users--right li");

  if (list.length < 2) {
    console.log("Flamethrower mode. 🔥");
  }

  const targetId = getTargetId();
  if (targetId) {
    console.log("🔥 Атакую цель:", targetId);
    await useAbility(9, targetId);
  }
}

function initDroneMode() {
  window.groupFightAjaxCheck = function groupFightAjaxCheck() {
    // eslint-disable-next-line no-undef
    noAjaxLoader = true;
    $.post("/fight/", { checkBattleState: 1 }, function (data) {
      // eslint-disable-next-line no-undef
      noAjaxLoader = false;
      if (data == 1) {
        AngryAjax.goToUrl(AngryAjax.getCurrentUrl());
        // setTimeout(async () => await droneMode(), 1000);
        $(document).one("ajaxStop", async () => await droneMode());
        // console.log("bro");
      } else {
        $("#waitdots").html(
          Array((($("#waitdots").text().length + 1) % 4) + 1).join(".")
        );
        window.AngryAjax.setTimeout(groupFightAjaxCheck, 1000);
      }
    });
  };
}

initDroneMode();
