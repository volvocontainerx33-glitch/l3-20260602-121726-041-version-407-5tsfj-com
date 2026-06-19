(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var willOpen = panel.hasAttribute("hidden");
      if (willOpen) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
      toggle.setAttribute("aria-expanded", String(willOpen));
    });
  }

  function textOf(card) {
    return [
      card.getAttribute("data-title"),
      card.getAttribute("data-tags"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-region"),
      card.getAttribute("data-type"),
      card.getAttribute("data-year"),
      card.getAttribute("data-category")
    ].join(" ").toLowerCase();
  }

  function setupFilters() {
    var scopes = document.querySelectorAll("[data-filter-scope]");
    scopes.forEach(function (scope) {
      var search = scope.querySelector("[data-local-search]");
      var section = scope.closest("section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
      var state = {
        query: "",
        category: "全部",
        type: "全部",
        year: "全部"
      };

      function activate(button, selector) {
        var row = button.closest(".filter-row");
        if (!row) {
          return;
        }
        row.querySelectorAll(selector).forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
      }

      function apply() {
        cards.forEach(function (card) {
          var haystack = textOf(card);
          var okQuery = !state.query || haystack.indexOf(state.query) !== -1;
          var okCategory = state.category === "全部" || card.getAttribute("data-category") === state.category;
          var okType = state.type === "全部" || card.getAttribute("data-type") === state.type;
          var okYear = state.year === "全部" || card.getAttribute("data-year") === state.year;
          card.classList.toggle("is-hidden-card", !(okQuery && okCategory && okType && okYear));
        });
      }

      if (search) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (initial) {
          search.value = initial;
          state.query = initial.trim().toLowerCase();
        }
        search.addEventListener("input", function () {
          state.query = search.value.trim().toLowerCase();
          apply();
        });
      }

      scope.querySelectorAll("[data-filter-category]").forEach(function (button) {
        button.addEventListener("click", function () {
          state.category = button.getAttribute("data-filter-category") || "全部";
          activate(button, "[data-filter-category]");
          apply();
        });
      });

      scope.querySelectorAll("[data-filter-type]").forEach(function (button) {
        button.addEventListener("click", function () {
          state.type = button.getAttribute("data-filter-type") || "全部";
          activate(button, "[data-filter-type]");
          apply();
        });
      });

      scope.querySelectorAll("[data-filter-year]").forEach(function (button) {
        button.addEventListener("click", function () {
          state.year = button.getAttribute("data-filter-year") || "全部";
          activate(button, "[data-filter-year]");
          apply();
        });
      });

      apply();
    });
  }

  function attachHls(video, src) {
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return;
    }
    video.src = src;
  }

  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var button = document.getElementById(options.buttonId);
    var src = options.source;
    var loaded = false;

    if (!video || !overlay || !button || !src) {
      return;
    }

    function ensureLoaded() {
      if (loaded) {
        return;
      }
      attachHls(video, src);
      video.controls = true;
      loaded = true;
    }

    function play() {
      ensureLoaded();
      overlay.classList.add("is-hidden");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    overlay.addEventListener("click", play);
    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        play();
      } else {
        video.pause();
      }
    });
  };

  ready(function () {
    setupMobileMenu();
    setupFilters();
  });
})();
