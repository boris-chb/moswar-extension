import fs from "fs/promises";

const getCookiesPath = (email) => `src/session/${email}-cookies.json`;
// const getLocalStoragePath = (email) => `src/session/${email}-localStorage.json`;

export async function saveSession(page, email) {
  // save cookies
  const cookies = await page.cookies();
  await fs.writeFile(getCookiesPath(email), JSON.stringify(cookies));

  console.log("Session saved!");
}

export async function loadSession(page, email) {
  // Load cookies
  if (await fileExists(getCookiesPath(email))) {
    try {
      const cookies = await fs.readFile(getCookiesPath(email), "utf8");
      await page.setCookie(...JSON.parse(cookies));
      console.log("Cookies loaded!");
      return true;
    } catch (error) {
      console.error("Error loading cookies:", error);
      return false;
    }
  }
  return false;
}

export async function fileExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch (error) {
    return false;
  }
}

export async function logIn(
  page,
  login = "delucsmd@gmail.com",
  password = "Uvp3G!__"
) {
  await page.type("#login-email", login);
  await page.type("#login-password", password);

  const loginForm = await page.$("form");

  await loginForm.evaluate((form) => {
    form.submit();
  });

  await page.waitForNavigation({ timeout: 0 });
  console.log("Logged in!");

  await saveSession(page, login);
}
