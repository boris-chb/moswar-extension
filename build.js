import esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["client/index.js"],
    bundle: true,
    format: "iife",
    globalName: "utils_",
    outfile: "dist/bundle.js",
    minify: true,
    sourcemap: true,
    banner: {
      js: `
// ==UserScript==
// @name           Moswar assistant
// @author         barifan
// @namespace      акулы
// @version        4.20
// @description    лучшатора для мосвара
// @include        https://*.moswar.ru*
// @include        https://*.moswar.net*
// @include        https://*.moswar.mail.ru*
// @match          https://www.moswar.ru/*
// @match          https://*.moswar.net/*
// @updateURL      https://raw.githubusercontent.com/boris-chb/moswar-extension/refs/heads/main/dist/bundle.js
// @downloadURL    https://raw.githubusercontent.com/boris-chb/moswar-extension/refs/heads/main/dist/bundle.js
// @grant          none
// ==/UserScript==
(async function () {\n`,
    },
    footer: {
      js: `\nwindow.utils_ = utils_;\nutils_.init();\n})();`,
    },
  })
  .catch(() => process.exit(1));
