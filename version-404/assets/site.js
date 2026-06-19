(function () {
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var current = 0;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      setSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      setSlide(current + 1);
    }, 5200);
  }

  var input = document.getElementById('siteSearch');
  var results = document.getElementById('searchResults');

  function clearResults() {
    if (results) {
      results.innerHTML = '';
      results.hidden = true;
    }
  }

  if (input && results && window.SEARCH_MOVIES) {
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();

      if (q.length < 1) {
        clearResults();
        return;
      }

      var matched = window.SEARCH_MOVIES.filter(function (item) {
        return [item.title, item.type, item.year, item.category]
          .join(' ')
          .toLowerCase()
          .indexOf(q) !== -1;
      }).slice(0, 10);

      if (!matched.length) {
        results.innerHTML = '<a href="./categories.html"><span></span><strong>查看更多分类片单</strong><span>分类</span></a>';
        results.hidden = false;
        return;
      }

      results.innerHTML = matched.map(function (item) {
        return '<a href="' + item.href + '">' +
          '<img src="' + item.image + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
          '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.type + ' · ' + item.category + '</span></span>' +
          '<span>播放</span>' +
          '</a>';
      }).join('');
      results.hidden = false;
    });

    document.addEventListener('click', function (event) {
      if (!results.contains(event.target) && event.target !== input) {
        clearResults();
      }
    });
  }
})();
