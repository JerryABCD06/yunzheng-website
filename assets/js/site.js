(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  var systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  var pageLang = root.getAttribute("data-page-lang") || "bilingual";
  var bilingual = pageLang !== "zh";
  var currentLang = root.getAttribute("data-lang") === "en" ? "en" : "zh";
  var currentThemeMode = root.getAttribute("data-theme-mode") || "auto";

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function safeStorageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      if (value === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      // Preference persistence is optional; the current view still updates.
    }
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  var liveRegion = qs("#live-region");
  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.id = "live-region";
    liveRegion.className = "sr-only";
    liveRegion.setAttribute("aria-live", "polite");
    document.body.appendChild(liveRegion);
  }

  function announce(message) {
    liveRegion.textContent = "";
    window.setTimeout(function () {
      liveRegion.textContent = message;
    }, 30);
  }

  var UI_COPY = {
    zh: {
      themeSystem: "主题设置，当前跟随系统",
      themeLight: "主题设置，当前浅色",
      themeDark: "主题设置，当前深色",
      switchToEnglish: "切换到英文",
      switchToChinese: "切换到中文",
      langChanged: "已切换到简体中文",
      themeChangedSystem: "主题已改为跟随系统",
      themeChangedLight: "主题已改为浅色",
      themeChangedDark: "主题已改为深色",
      navOpen: "打开导航",
      navClose: "关闭导航"
    },
    en: {
      themeSystem: "Theme settings, currently system",
      themeLight: "Theme settings, currently light",
      themeDark: "Theme settings, currently dark",
      switchToEnglish: "Switch to English",
      switchToChinese: "Switch to Chinese",
      langChanged: "Switched to English",
      themeChangedSystem: "Theme set to system",
      themeChangedLight: "Theme set to light",
      themeChangedDark: "Theme set to dark",
      navOpen: "Open navigation",
      navClose: "Close navigation"
    }
  };

  function getDocumentMetaForLang(lang) {
    var title = root.getAttribute(lang === "zh" ? "data-title-zh" : "data-title-en");
    if (title) {
      document.title = title;
    }
    var description = qs('meta[name="description"]');
    if (description) {
      var text = description.getAttribute(lang === "zh" ? "data-desc-zh" : "data-desc-en");
      if (text) {
        description.setAttribute("content", text);
      }
    }
  }

  function applyLanguageAttributes(lang) {
    qsa("[data-aria-zh][data-aria-en]").forEach(function (element) {
      element.setAttribute("aria-label", element.getAttribute(lang === "zh" ? "data-aria-zh" : "data-aria-en"));
    });
  }

  function updateLanguageControl(lang) {
    var langToggle = qs("[data-language-toggle]");
    if (!langToggle) {
      return;
    }
    var copy = UI_COPY[lang];
    langToggle.setAttribute("aria-label", lang === "zh" ? copy.switchToEnglish : copy.switchToChinese);
    langToggle.setAttribute("title", lang === "zh" ? copy.switchToEnglish : copy.switchToChinese);
  }

  function updateThemeControl(lang) {
    var trigger = qs("[data-theme-trigger]");
    if (!trigger) {
      return;
    }
    var copy = UI_COPY[lang];
    var label = copy.themeSystem;
    if (currentThemeMode === "light") {
      label = copy.themeLight;
    } else if (currentThemeMode === "dark") {
      label = copy.themeDark;
    }
    trigger.setAttribute("aria-label", label);
    trigger.setAttribute("title", label);
  }

  function updateNavToggleLabel(lang) {
    var toggle = qs("[data-nav-toggle]");
    var nav = qs("[data-mobile-nav]");
    if (!toggle) {
      return;
    }
    var isOpen = nav && !nav.hidden;
    toggle.setAttribute("aria-label", isOpen ? UI_COPY[lang].navClose : UI_COPY[lang].navOpen);
  }

  function applyLanguage(lang, options) {
    var settings = options || {};
    currentLang = lang === "en" && bilingual ? "en" : "zh";
    if (!bilingual) {
      currentLang = "zh";
    }
    root.setAttribute("data-lang", currentLang);
    root.setAttribute("lang", currentLang === "zh" ? "zh-CN" : "en");
    getDocumentMetaForLang(currentLang);
    applyLanguageAttributes(currentLang);
    updateLanguageControl(currentLang);
    updateThemeControl(currentLang);
    updateNavToggleLabel(currentLang);
    if (settings.persist) {
      safeStorageSet("wyz.lang", currentLang);
    }
    if (settings.announce) {
      announce(UI_COPY[currentLang].langChanged);
    }
  }

  function setMetaThemeColor(theme) {
    var meta = qs('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#1b1b1b" : "#f3f3f3");
    }
  }

  function resolveTheme(mode) {
    if (mode === "light" || mode === "dark") {
      return mode;
    }
    return systemDark.matches ? "dark" : "light";
  }

  function paintTheme(mode) {
    currentThemeMode = mode;
    var resolved = resolveTheme(mode);
    root.setAttribute("data-theme-mode", mode);
    root.setAttribute("data-theme", resolved);
    setMetaThemeColor(resolved);
    qsa("[data-theme-choice]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-theme-choice") === mode));
    });
    updateThemeControl(currentLang);
  }

  function applyTheme(mode, options) {
    var settings = options || {};
    var nextMode = mode === "light" || mode === "dark" ? mode : "auto";
    paintTheme(nextMode);
    safeStorageSet("wyz.theme", nextMode === "auto" ? null : nextMode);

    if (settings.announce) {
      var message = UI_COPY[currentLang].themeChangedSystem;
      if (nextMode === "light") {
        message = UI_COPY[currentLang].themeChangedLight;
      } else if (nextMode === "dark") {
        message = UI_COPY[currentLang].themeChangedDark;
      }
      announce(message);
    }
  }

  function initThemePicker() {
    var picker = qs("[data-theme-picker]");
    var trigger = qs("[data-theme-trigger]");
    var menu = qs("[data-theme-menu]");
    if (!picker || !trigger || !menu) {
      return;
    }

    function closeMenu(returnFocus) {
      if (menu.hidden) {
        return;
      }
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      if (returnFocus) {
        trigger.focus();
      }
    }

    function openMenu() {
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      var active = qs('[data-theme-choice][aria-pressed="true"]', menu) || qs("[data-theme-choice]", menu);
      if (active) {
        active.focus();
      }
    }

    trigger.addEventListener("click", function () {
      if (menu.hidden) {
        openMenu();
      } else {
        closeMenu(false);
      }
    });

    trigger.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        openMenu();
      }
    });

    menu.addEventListener("click", function (event) {
      var option = event.target.closest("[data-theme-choice]");
      if (!option) {
        return;
      }
      var mode = option.getAttribute("data-theme-choice");
      closeMenu(false);
      applyTheme(mode, { announce: true });
      trigger.focus();
    });

    menu.addEventListener("keydown", function (event) {
      var options = qsa("[data-theme-choice]", menu);
      var index = options.indexOf(document.activeElement);
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (!options.length) {
          return;
        }
        var nextIndex = event.key === "ArrowDown" ? index + 1 : index - 1;
        nextIndex = (nextIndex + options.length) % options.length;
        options[nextIndex].focus();
      }
    });

    picker.addEventListener("focusout", function (event) {
      if (!picker.contains(event.relatedTarget)) {
        closeMenu(false);
      }
    });

    document.addEventListener("pointerdown", function (event) {
      if (!picker.contains(event.target)) {
        closeMenu(false);
      }
    });

    menu.hidden = true;
    paintTheme(currentThemeMode);
  }

  function initLanguageToggle() {
    var toggle = qs("[data-language-toggle]");
    if (!toggle || !bilingual) {
      return;
    }
    toggle.addEventListener("click", function () {
      var next = currentLang === "zh" ? "en" : "zh";
      applyLanguage(next, { persist: true, announce: true });
    });
  }

  function initMobileNav() {
    var header = qs("[data-site-header]");
    var toggle = qs("[data-nav-toggle]");
    var nav = qs("[data-mobile-nav]");
    if (!header || !toggle || !nav) {
      return;
    }

    function closeNav(returnFocus) {
      if (nav.hidden) {
        return;
      }
      nav.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", UI_COPY[currentLang].navOpen);
      if (returnFocus) {
        toggle.focus();
      }
    }

    function openNav() {
      nav.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", UI_COPY[currentLang].navClose);
      var firstLink = qs("a", nav);
      if (firstLink) {
        firstLink.focus();
      }
    }

    toggle.addEventListener("click", function () {
      if (nav.hidden) {
        openNav();
      } else {
        closeNav(true);
      }
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        nav.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", UI_COPY[currentLang].navOpen);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !nav.hidden) {
        closeNav(true);
      }
    });

    document.addEventListener("pointerdown", function (event) {
      if (!nav.hidden && !header.contains(event.target)) {
        closeNav(false);
      }
    });

    document.addEventListener("focusin", function (event) {
      if (!nav.hidden && !nav.contains(event.target) && event.target !== toggle) {
        closeNav(false);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) {
        closeNav(false);
      }
    });
  }

  function initHeaderState() {
    var header = qs("[data-site-header]");
    if (!header) {
      return;
    }
    var update = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function initPointerEffects() {
    if (!finePointer.matches || reduceMotion.matches) {
      return;
    }

    var header = qs("[data-site-header]");
    var brand = qs("[data-brand]");
    var raf = 0;
    var lastEvent = null;

    function flush() {
      raf = 0;
      var event = lastEvent;
      if (!event || !header || !brand) {
        return;
      }

      var headerRect = header.getBoundingClientRect();
      var brandRect = brand.getBoundingClientRect();
      var headerPercent = ((event.clientX - headerRect.left) / headerRect.width) * 100;
      var brandPercent = ((event.clientX - brandRect.left) / brandRect.width) * 100;

      header.style.setProperty("--hx", clamp(headerPercent, 0, 100).toFixed(2) + "%");
      brand.style.setProperty("--brand-x", clamp(brandPercent, -20, 120).toFixed(2));
      root.style.setProperty("--pointer-x", ((event.clientX / window.innerWidth) * 100).toFixed(2) + "%");
      root.style.setProperty("--pointer-y", ((event.clientY / window.innerHeight) * 100).toFixed(2) + "%");

      var reveal = event.target.closest(".reveal");
      if (reveal) {
        var revealRect = reveal.getBoundingClientRect();
        reveal.style.setProperty("--mx", (event.clientX - revealRect.left).toFixed(1) + "px");
        reveal.style.setProperty("--my", (event.clientY - revealRect.top).toFixed(1) + "px");
      }
    }

    document.addEventListener(
      "pointermove",
      function (event) {
        lastEvent = event;
        if (!raf) {
          raf = window.requestAnimationFrame(flush);
        }
      },
      { passive: true }
    );

    if (brand) {
      brand.addEventListener("pointerleave", function () {
        brand.style.removeProperty("--brand-x");
      });
    }
  }

  function initTilt() {
    if (!finePointer.matches || reduceMotion.matches) {
      return;
    }
    qsa("[data-tilt]").forEach(function (element) {
      var frame = 0;
      var last = null;

      function update() {
        frame = 0;
        if (!last) {
          return;
        }
        var rect = element.getBoundingClientRect();
        var x = clamp((last.clientX - rect.left) / rect.width, 0, 1);
        var y = clamp((last.clientY - rect.top) / rect.height, 0, 1);
        var rotateX = (0.5 - y) * 5;
        var rotateY = (x - 0.5) * 7;
        element.style.setProperty("--rx", rotateX.toFixed(2) + "deg");
        element.style.setProperty("--ry", rotateY.toFixed(2) + "deg");
        element.style.setProperty("--lift", "8px");
      }

      element.addEventListener(
        "pointermove",
        function (event) {
          last = event;
          element.classList.add("is-tilting");
          if (!frame) {
            frame = window.requestAnimationFrame(update);
          }
        },
        { passive: true }
      );

      element.addEventListener("pointerleave", function () {
        last = null;
        element.classList.remove("is-tilting");
        element.style.setProperty("--rx", "0deg");
        element.style.setProperty("--ry", "0deg");
        element.style.setProperty("--lift", "0px");
      });
    });
  }

  function initScrollProgress() {
    var fill = qs("[data-scroll-progress]");
    if (!fill) {
      return;
    }
    var update = function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
      fill.style.transform = "scaleX(" + ratio.toFixed(4) + ")";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  function initReveal() {
    if (reduceMotion.matches || typeof window.IntersectionObserver !== "function") {
      return;
    }

    var items = qsa("[data-reveal]");
    var viewportHeight = window.innerHeight;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    items.forEach(function (element) {
      var rect = element.getBoundingClientRect();
      if (rect.top < viewportHeight * 0.94) {
        return;
      }
      element.classList.add("reveal-ready");
      observer.observe(element);
    });
  }

  function initDownloadLinks() {
    var links = window.WYZ_LINKS || {};
    var groups = {};

    qsa("[data-download]").forEach(function (link) {
      var project = link.getAttribute("data-download");
      var provider = link.getAttribute("data-provider");
      var data = links[project] || {};
      var url = typeof data[provider] === "string" ? data[provider].trim() : "";
      groups[project] = groups[project] || [];
      groups[project].push({ link: link, ready: Boolean(url) });

      if (url) {
        link.setAttribute("href", url);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
        link.removeAttribute("aria-disabled");
        link.classList.add("is-ready");
      } else {
        link.removeAttribute("href");
        link.setAttribute("aria-disabled", "true");
      }
    });

    qsa("[data-download-note]").forEach(function (note) {
      var project = note.getAttribute("data-download-note");
      var items = groups[project] || [];
      var allReady = items.length > 0 && items.every(function (item) {
        return item.ready;
      });
      note.hidden = allReady;
    });
  }

  function initYear() {
    qsa("[data-year]").forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });
  }

  function initSystemThemeListener() {
    var listener = function () {
      if (root.getAttribute("data-theme-mode") !== "auto") {
        return;
      }
      var resolved = resolveTheme("auto");
      root.setAttribute("data-theme", resolved);
      setMetaThemeColor(resolved);
      updateThemeControl(currentLang);
    };
    if (typeof systemDark.addEventListener === "function") {
      systemDark.addEventListener("change", listener);
    } else if (typeof systemDark.addListener === "function") {
      systemDark.addListener(listener);
    }
  }

  function initStorageSync() {
    window.addEventListener("storage", function (event) {
      if (event.key === "wyz.theme") {
        var mode = event.newValue === "light" || event.newValue === "dark" ? event.newValue : "auto";
        paintTheme(mode);
      }
      if (event.key === "wyz.lang" && bilingual) {
        var lang = event.newValue === "en" ? "en" : "zh";
        applyLanguage(lang, { persist: false, announce: false });
      }
    });
  }

  function init() {
    applyLanguage(currentLang, { persist: false, announce: false });
    initThemePicker();
    initLanguageToggle();
    initMobileNav();
    initHeaderState();
    initPointerEffects();
    initTilt();
    initScrollProgress();
    initReveal();
    initDownloadLinks();
    initYear();
    initSystemThemeListener();
    initStorageSync();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
