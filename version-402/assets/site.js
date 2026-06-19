(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function filterCards() {
    var searchInput = document.querySelector('[data-card-search]');
    var categorySelect = document.querySelector('[data-category-select]');
    var keyword = normalize(searchInput ? searchInput.value : '');
    var category = categorySelect ? categorySelect.value : 'all';
    var cards = document.querySelectorAll('[data-card]');

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year'),
        card.getAttribute('data-category')
      ].join(' '));
      var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchedCategory = category === 'all' || card.getAttribute('data-category') === category;
      card.classList.toggle('is-hidden', !(matchedKeyword && matchedCategory));
    });
  }

  var cardSearch = document.querySelector('[data-card-search]');
  var categorySelect = document.querySelector('[data-category-select]');

  if (cardSearch) {
    var query = new URLSearchParams(window.location.search).get('q');
    if (query) {
      cardSearch.value = query;
    }
    cardSearch.addEventListener('input', filterCards);
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', filterCards);
  }

  document.querySelectorAll('[data-filter-chip]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      window.location.href = 'category-' + chip.getAttribute('data-filter-chip') + '.html';
    });
  });

  filterCards();

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }
})();
