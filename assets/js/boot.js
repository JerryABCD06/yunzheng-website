(function () {
  "use strict";

  var root = document.documentElement;
  var pageLang = root.getAttribute("data-page-lang") || "bilingual";
  var lang = "zh";
  var themeMode = "auto";
  var theme = "light";

  try {
    var storedLang = window.localStorage.getItem("wyz.lang");
    if (pageLang !== "zh") {
      if (storedLang === "zh" || storedLang === "en") {
        lang = storedLang;
      } else {
        var browserLang = (navigator.languages && navigator.languages[0]) || navigator.language || "zh";
        lang = /^zh\b/i.test(browserLang) ? "zh" : "en";
      }
    }

    var storedTheme = window.localStorage.getItem("wyz.theme");
    if (storedTheme === "light" || storedTheme === "dark") {
      themeMode = storedTheme;
    }
  } catch (error) {
    // Storage can be unavailable in strict privacy modes; system settings still work.
  }

  if (pageLang === "zh") {
    lang = "zh";
  }

  var systemDark = false;
  try {
    systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch (error) {
    // The light theme remains a safe default.
  }

  theme = themeMode === "auto" ? (systemDark ? "dark" : "light") : themeMode;

  root.setAttribute("data-lang", lang);
  root.setAttribute("lang", lang === "zh" ? "zh-CN" : "en");
  root.setAttribute("data-theme-mode", themeMode);
  root.setAttribute("data-theme", theme);

  var themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) {
    themeColor.setAttribute("content", theme === "dark" ? "#1b1b1b" : "#f3f3f3");
  }
})();
