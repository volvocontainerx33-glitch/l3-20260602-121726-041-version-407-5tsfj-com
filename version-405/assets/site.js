document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.querySelector('.mobile-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var opened = menu.hasAttribute('hidden');
      if (opened) {
        menu.removeAttribute('hidden');
      } else {
        menu.setAttribute('hidden', '');
      }
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, idx) {
      slide.classList.toggle('active', idx === current);
    });
    dots.forEach(function (dot, idx) {
      dot.classList.toggle('active', idx === current);
    });
  }

  dots.forEach(function (dot, idx) {
    dot.addEventListener('click', function () {
      showSlide(idx);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-search]'));
  var emptyTip = document.querySelector('[data-empty-tip]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }
    var keyword = normalize(searchInput ? searchInput.value : '');
    var year = yearFilter ? yearFilter.value : '';
    var type = typeFilter ? typeFilter.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var cardYear = card.getAttribute('data-year') || '';
      var cardType = card.getAttribute('data-type') || '';
      var matched = (!keyword || text.indexOf(keyword) !== -1) && (!year || cardYear === year) && (!type || cardType === type);
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (emptyTip) {
      emptyTip.style.display = visible ? 'none' : 'block';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      searchInput.value = q;
    }
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', filterCards);
  }

  if (typeFilter) {
    typeFilter.addEventListener('change', filterCards);
  }

  filterCards();

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (box) {
    var video = box.querySelector('video');
    var layer = box.querySelector('.play-layer');

    if (!video || !layer) {
      return;
    }

    var src = video.getAttribute('data-src');
    var hlsInstance = null;

    function bindSource() {
      if (video.getAttribute('src') || hlsInstance) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.setAttribute('src', src);
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
      } else {
        video.setAttribute('src', src);
      }
    }

    function playVideo() {
      bindSource();
      box.classList.add('is-playing');
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    layer.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
  });
});
