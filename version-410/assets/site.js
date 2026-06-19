(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-main-nav]');

    if (menuButton && nav) {
      menuButton.addEventListener('click', function () {
        nav.classList.toggle('open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var nextButton = document.querySelector('[data-hero-next]');
    var prevButton = document.querySelector('[data-hero-prev]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startHero() {
      if (slides.length < 2) {
        return;
      }

      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (slides.length) {
      showSlide(0);
      startHero();

      if (nextButton) {
        nextButton.addEventListener('click', function () {
          showSlide(current + 1);
          startHero();
        });
      }

      if (prevButton) {
        prevButton.addEventListener('click', function () {
          showSlide(current - 1);
          startHero();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          showSlide(index);
          startHero();
        });
      });
    }

    var filter = document.querySelector('[data-filter-panel]');
    if (filter) {
      var input = filter.querySelector('[data-filter-keyword]');
      var yearSelect = filter.querySelector('[data-filter-year]');
      var regionSelect = filter.querySelector('[data-filter-region]');
      var typeSelect = filter.querySelector('[data-filter-type]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
      var empty = document.querySelector('[data-empty-state]');

      function includesText(source, keyword) {
        return !keyword || source.toLowerCase().indexOf(keyword) !== -1;
      }

      function applyFilter() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var region = regionSelect ? regionSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var shown = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-genre') || ''
          ].join(' ');
          var ok = includesText(haystack, keyword);
          ok = ok && (!year || (card.getAttribute('data-year') || '') === year);
          ok = ok && (!region || (card.getAttribute('data-region') || '') === region);
          ok = ok && (!type || (card.getAttribute('data-type') || '') === type);
          card.style.display = ok ? '' : 'none';
          if (ok) {
            shown += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('show', shown === 0);
        }
      }

      [input, yearSelect, regionSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });

      applyFilter();
    }
  });
})();

(function () {
  if (!window.location.search) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var value = params.get('q');
  if (!value) {
    return;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var input = document.querySelector('[data-filter-keyword]');
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
})();
