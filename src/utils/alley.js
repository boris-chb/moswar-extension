// import { delay, URLs } from "./index.js";

// export async function fightMode(page, email, searchCriteria) {
//   await page.goto(URLs.alley, { waitUntil: "networkidle2" });

//   await delay(1);

//   // Check if need to rest
//   const restNeeded = await checkIfNeedToRest(page);
//   if (restNeeded) {
//     // If rest is needed, return early and set timeout to restart after timer
//     return;
//   }

//   await delay(2);

//   await findOpponent(page, email, searchCriteria);

//   await delay(2);

//   // Check if should attack based on stats
//   let opponentWeaker = await shouldAttack(page);

//   // Otherwise, search for another opponent
//   if (!opponentWeaker) {
//     console.log("Opponent too strong, looking for another opponent.");
//     return fightMode(page, email, searchCriteria); // Recursively search for another opponent
//   }

//   // Fight
//   const fightBtn = await page.$(".button.button-fight > a");
//   await delay();
//   fightBtn.click();
//   await delay();

//   let delayMinutes = 5.2;
//   console.log(`Fight over. Attacking again in ${delayMinutes} minutes`);
//   return setTimeout(() => fightMode(page), delayMinutes * 60 * 1000);
// }

// export async function shouldAttack(page) {
//   return await page.evaluate(() => {
//     let oppStats = [
//       ...document.querySelectorAll(
//         ".fighter2-cell .stats > .stat span.num",
//         true
//       ),
//     ]
//       .slice(0, -1)
//       .map((el) => +el.innerText)
//       .reduce((a, b) => a + b, 0);
//     let myStats = [
//       ...document.querySelectorAll(
//         ".fighter1-cell .stats > .stat span.num",
//         true
//       ),
//     ]
//       .slice(0, -1)
//       .map((el) => +el.innerText)
//       .reduce((a, b) => a + b, 0);

//     if (myStats - oppStats < 1000) {
//       return false;
//     }

//     return true;
//   });
// }

// async function checkIfNeedToRest(page) {
//   try {
//     const element = await page.waitForSelector(
//       ".need-some-rest .holders span.timer",
//       { visible: true, timeout: 1500 }
//     );
//     const secondsLeft = await element.evaluate((node) =>
//       node.getAttribute("timer")
//     );

//     console.log("Need to rest...\nRetrying in", +secondsLeft, "seconds");
//     setTimeout(() => fightMode(page), +secondsLeft * 1000);
//     return true; // Indicate that rest is needed
//   } catch (e) {
//     console.log("Rest button not found, can fight!");
//     return false; // No rest needed, continue with fight mode
//   }
// }
// async function findOpponent(page, email, criteria = "level") {
//   console.log("🔎 Finding opponent by criteria:", criteria);
//   // find opponent by level based on account
//   await page.evaluate(
//     (email, criteria) => {
//       // heal if possible
//       document.querySelector(".plus-icon")?.click();

//       // find by criteria
//       if (criteria === "level") {
//         if (email === "delucsmd@gmail.com") {
//           // main
//           document.querySelector('input[name="minlevel"]').value = "7";
//           document.querySelector('input[name="maxlevel"]').value = "8";
//           // }
//           // else if (email === "boris.chobyrka@gmail.com") {
//           //   // Крытые Вагоны [6]
//           //   document.querySelector('input[name="minlevel"]').value = "6";
//           //   document.querySelector('input[name="maxlevel"]').value = "7";
//           // } else if (email === "korodimos.d@gmail.com") {
//           //   // ...
//           //   document.querySelector('input[name="minlevel"]').value = "6";
//           //   document.querySelector('input[name="maxlevel"]').value = "7";
//           // } else if (email === "cjb2518@gmail.com") {
//           //   // Марин [5]
//           //   document.querySelector('input[name="minlevel"]').value = "6";
//           //   document.querySelector('input[name="maxlevel"]').value = "7";
//         } else {
//           // everyone else
//           document.querySelector('input[name="minlevel"]').value = "6";
//           document.querySelector('input[name="maxlevel"]').value = "7";
//         }

//         document.querySelector("form.search-detailed.also").submit();
//       } else if (criteria === "victims") {
//         document
//           .querySelector(
//             'form[action="/alley/search/type/"] .button:nth-of-type(2)'
//           )
//           .click();
//       } else if (criteria === "enemies") {
//         // TODO
//         console.log("🚧 Not implemented yet");
//       }
//     },
//     email,
//     criteria
//   );
// }
