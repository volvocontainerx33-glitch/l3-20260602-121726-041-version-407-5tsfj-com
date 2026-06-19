(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");

        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")));
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var wraps = Array.prototype.slice.call(document.querySelectorAll("[data-filter-wrap]"));

        wraps.forEach(function (wrap) {
            var input = wrap.querySelector("[data-search-input]");
            var regionSelect = wrap.querySelector("[data-region-select]");
            var typeSelect = wrap.querySelector("[data-type-select]");
            var yearSelect = wrap.querySelector("[data-year-select]");
            var sortSelect = wrap.querySelector("[data-sort-select]");
            var list = wrap.querySelector("[data-card-list]") || wrap;
            var count = wrap.querySelector("[data-result-count]");
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

            function cardText(card) {
                return normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-category"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-year")
                ].join(" "));
            }

            function applySort() {
                if (!sortSelect) {
                    return;
                }

                var mode = sortSelect.value;
                var sorted = cards.slice();

                sorted.sort(function (a, b) {
                    if (mode === "rating") {
                        return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
                    }

                    if (mode === "views") {
                        return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
                    }

                    if (mode === "year") {
                        return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                    }

                    return Number(a.getAttribute("data-index")) - Number(b.getAttribute("data-index"));
                });

                sorted.forEach(function (card) {
                    list.appendChild(card);
                });
            }

            function applyFilter() {
                var query = normalize(input ? input.value : "");
                var region = regionSelect ? regionSelect.value : "";
                var type = typeSelect ? typeSelect.value : "";
                var year = yearSelect ? yearSelect.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var matches = true;

                    if (query && cardText(card).indexOf(query) === -1) {
                        matches = false;
                    }

                    if (region && card.getAttribute("data-region") !== region) {
                        matches = false;
                    }

                    if (type && card.getAttribute("data-type") !== type) {
                        matches = false;
                    }

                    if (year && card.getAttribute("data-year") !== year) {
                        matches = false;
                    }

                    card.classList.toggle("is-hidden", !matches);

                    if (matches) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = "当前显示 " + visible + " 部影片";
                }
            }

            [input, regionSelect, typeSelect, yearSelect, sortSelect].forEach(function (control) {
                if (!control) {
                    return;
                }

                control.addEventListener("input", function () {
                    applySort();
                    applyFilter();
                });

                control.addEventListener("change", function () {
                    applySort();
                    applyFilter();
                });
            });

            applySort();
            applyFilter();
        });
    }

    function initPlayer() {
        var player = document.querySelector("[data-player]");

        if (!player) {
            return;
        }

        var video = player.querySelector("video");
        var button = player.querySelector("[data-play-button]");
        var source = player.getAttribute("data-source");
        var hlsInstance = null;
        var initialized = false;

        function setup() {
            if (initialized || !video || !source) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            initialized = true;
        }

        function play() {
            setup();
            player.classList.add("is-playing");
            video.setAttribute("controls", "controls");

            var promise = video.play();

            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                play();
            });
        }

        player.addEventListener("click", function (event) {
            if (event.target === video && initialized) {
                return;
            }

            play();
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initFilters();
        initPlayer();
    });
}());
