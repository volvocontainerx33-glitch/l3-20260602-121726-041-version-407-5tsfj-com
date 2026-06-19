(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  var filterInput = document.querySelector('[data-filter-input]');

  if (filterInput) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-filter-empty]');

    filterInput.addEventListener('input', function () {
      var value = filterInput.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
        var matched = text.indexOf(value) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible === 0 ? 'block' : 'none';
      }
    });
  }

  var searchRoot = document.querySelector('[data-search-page]');

  if (searchRoot && window.SiteSearchItems) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = searchRoot.querySelector('[data-search-input]');
    var grid = searchRoot.querySelector('[data-search-grid]');
    var title = searchRoot.querySelector('[data-search-title]');
    var emptySearch = searchRoot.querySelector('[data-search-empty]');

    if (input) {
      input.value = query;
    }

    function createCard(item) {
      return [
        '<article class="movie-card">',
        '<a class="poster-link" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">',
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '<span class="score-badge">★ ' + item.rating + '</span>',
        '<span class="type-badge">' + escapeHtml(item.type) + '</span>',
        '<span class="play-hover">▶</span>',
        '</a>',
        '<div class="movie-card-body">',
        '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
        '<p>' + escapeHtml(item.one) + '</p>',
        '<div class="meta-row"><span>' + escapeHtml(item.region) + '</span><span>' + item.year + '</span><span>' + escapeHtml(item.duration) + '</span></div>',
        '<div class="tag-row"><span>' + escapeHtml(item.category) + '</span></div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function render(value) {
      var term = String(value || '').trim().toLowerCase();
      var list = window.SiteSearchItems;

      if (term) {
        list = window.SiteSearchItems.filter(function (item) {
          return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.one, item.category]
            .join(' ')
            .toLowerCase()
            .indexOf(term) !== -1;
        });
      } else {
        list = window.SiteSearchItems.slice(0, 36);
      }

      list = list.slice(0, 120);

      if (title) {
        title.textContent = term ? '相关结果' : '热门内容';
      }

      if (grid) {
        grid.innerHTML = list.map(createCard).join('');
      }

      if (emptySearch) {
        emptySearch.style.display = list.length ? 'none' : 'block';
      }
    }

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }

    render(query);
  }
})();
