(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero-carousel]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === index);
      });
    }
    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        show(current);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function setupSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-search]'));
    if (!inputs.length) {
      return;
    }
    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        var query = normalize(input.value);
        var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' '));
          card.classList.toggle('search-hidden', query && haystack.indexOf(query) === -1);
        });
      });
    });
  }

  function setupFilters() {
    var wrap = document.querySelector('[data-filter-buttons]');
    if (!wrap) {
      return;
    }
    var buttons = Array.prototype.slice.call(wrap.querySelectorAll('button'));
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = normalize(button.getAttribute('data-filter-value'));
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        Array.prototype.slice.call(document.querySelectorAll('.searchable-card')).forEach(function (card) {
          var content = normalize(card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags'));
          card.classList.toggle('search-hidden', value !== 'all' && content.indexOf(value) === -1);
        });
      });
    });
  }

  window.setupPlayer = function (options) {
    ready(function () {
      var video = document.getElementById(options.videoId);
      var overlay = document.getElementById(options.overlayId);
      var button = document.getElementById(options.buttonId);
      var started = false;
      if (!video || !overlay || !button || !options.url) {
        return;
      }
      function start() {
        if (started) {
          video.play();
          return;
        }
        started = true;
        overlay.classList.add('hidden');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = options.url;
          video.play();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(options.url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play();
          });
          return;
        }
        video.src = options.url;
        video.play();
      }
      overlay.addEventListener('click', start);
      button.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (!started) {
          start();
        }
      });
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupFilters();
  });
})();
