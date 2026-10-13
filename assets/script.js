(function () {
  var root = document.documentElement;

  // Theme toggle: follows the system until the visitor picks one
  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var current = root.dataset.theme ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      var next = current === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // Event filters
  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var events = Array.prototype.slice.call(document.querySelectorAll('.ev'));
  var years = Array.prototype.slice.call(document.querySelectorAll('.year'));
  var count = document.getElementById('filter-count');

  function applyFilter(kind) {
    var shown = 0;
    events.forEach(function (ev) {
      var match = kind === 'all' || ev.dataset.kind === kind;
      ev.hidden = !match;
      if (match) shown++;
    });
    years.forEach(function (year) {
      year.hidden = !year.querySelector('.ev:not([hidden])');
    });
    filters.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.filter === kind));
    });
    if (count) count.textContent = shown + (shown === 1 ? ' event' : ' events');
  }

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () { applyFilter(btn.dataset.filter); });
  });
  if (filters.length) applyFilter('all');

  // Highlight the section currently in view
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        var link = byId[entry.target.id];
        if (link) {
          link.setAttribute('aria-current', 'true');
          var nav = link.parentNode;
          if (nav.scrollWidth > nav.clientWidth) {
            nav.scrollTo({ left: link.offsetLeft - nav.offsetLeft - 16, behavior: 'smooth' });
          }
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
