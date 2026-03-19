'use strict';

(function buildGitGrid() {
  const grid    = document.getElementById('gitGrid');
  const countEl = document.getElementById('gitCount');
  if (!grid) return;

  const COLORS = [
    '#161b22', // 0  — empty
    '#2a3a1e', // 1–2
    '#3d5e28', // 3–5
    '#5a8a34', // 6–9
    '#79c142', // 10+
  ];

  function getLevel(count) {
    if (count === 0)  return 0;
    if (count <= 2)   return 1;
    if (count <= 5)   return 2;
    if (count <= 9)   return 3;
    return 4;
  }

  function renderGrid(weeks, total) {
    const fragment = document.createDocumentFragment();

    weeks.forEach(function(week) {
      week.contributionDays.forEach(function(day) {
        const cell = document.createElement('div');
        cell.className = 'git-cell';
        cell.style.background = COLORS[getLevel(day.contributionCount)];
        cell.setAttribute('title',
          day.contributionCount === 0
            ? 'No contributions on ' + day.date
            : day.contributionCount + ' contribution' + (day.contributionCount !== 1 ? 's' : '') + ' on ' + day.date
        );
        fragment.appendChild(cell);
      });
    });

    grid.appendChild(fragment);

    if (countEl) {
      countEl.textContent = total.toLocaleString() + ' contributions in the last year';
    }
  }

  function renderFallback() {
    const weights  = [0, 0, 0, 0, 1, 1, 1, 2, 2, 3, 4];
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 52 * 7; i++) {
      const lvl  = weights[Math.floor(Math.random() * weights.length)];
      const cell = document.createElement('div');
      cell.className = 'git-cell';
      cell.style.background = COLORS[lvl];
      fragment.appendChild(cell);
    }
    grid.appendChild(fragment);
  }

  fetch('./contributions.json')
    .then(function(res) {
      if (!res.ok) throw new Error('contributions.json not found');
      return res.json();
    })
    .then(function(data) {
      renderGrid(data.weeks, data.totalContributions);
    })
    .catch(function() {
      console.warn('contributions.json not found — showing placeholder grid. Run: node fetch-contributions.js');
      renderFallback();
    });
})();

(function initMobile() {
  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('overlay');

  if (!hamburger || !sidebar || !overlay) return;

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  function toggleSidebar() {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  }

  hamburger.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', closeSidebar);

  document.querySelectorAll('.nav-item').forEach(function(item) {
    item.addEventListener('click', function() {
      if (window.innerWidth <= 700) closeSidebar();
    });
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  });
})();

(function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-item[data-section]');

  if (!sections.length || !navItems.length) return;

  function setActive(id) {
    navItems.forEach(function(item) {
      const isActive = item.getAttribute('data-section') === id;
      item.classList.toggle('active', isActive);
    });
  }

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        setActive(entry.target.id);
      }
    });
  }, {
    rootMargin: '-10% 0px -50% 0px',
    threshold: 0,
  });

  sections.forEach(function(section) {
    observer.observe(section);
  });
})();

(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
