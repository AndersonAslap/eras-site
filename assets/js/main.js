// Eras site: progressive enhancement only. Every piece of content works without JavaScript.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mobile menu */
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  if (header && toggle) {
    toggle.addEventListener('click', () => {
      const open = header.dataset.open !== 'true';
      header.dataset.open = String(open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    header.querySelectorAll('.site-nav a').forEach((link) =>
      link.addEventListener('click', () => {
        header.dataset.open = 'false';
        toggle.setAttribute('aria-expanded', 'false');
      }),
    );
  }

  /* Close the language menu when clicking outside or pressing Escape */
  const lang = document.querySelector('.lang');
  if (lang) {
    document.addEventListener('click', (event) => {
      if (!lang.contains(event.target)) lang.removeAttribute('open');
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') lang.removeAttribute('open');
    });
  }

  /* Hero: era tickets swap the life shown on the phone (with a page turn) */
  const tickets = document.querySelectorAll('[data-story-target]');
  tickets.forEach((ticket) =>
    ticket.addEventListener('click', () => {
      const id = ticket.dataset.storyTarget;
      tickets.forEach((t) => t.setAttribute('aria-pressed', String(t === ticket)));
      document.querySelectorAll('[data-story]').forEach((story) => {
        const show = story.dataset.story === id;
        story.hidden = !show;
        if (show && !reduceMotion) {
          story.classList.remove('is-turning');
          void story.offsetWidth; // restart the animation
          story.classList.add('is-turning');
        }
      });
    }),
  );

  /* Examples shelf: previous / next buttons */
  const track = document.querySelector('[data-shelf-track]');
  document.querySelectorAll('[data-shelf]').forEach((button) =>
    button.addEventListener('click', () => {
      if (!track) return;
      const card = track.querySelector('li');
      const step = card ? card.getBoundingClientRect().width + 24 : 300;
      track.scrollBy({ left: Number(button.dataset.shelf) * step, behavior: reduceMotion ? 'auto' : 'smooth' });
    }),
  );

  /* Realistic x fantastic switch (mobile) */
  const compareGrid = document.querySelector('[data-compare-grid]');
  const compareButtons = document.querySelectorAll('[data-compare]');
  compareButtons.forEach((button) =>
    button.addEventListener('click', () => {
      compareButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      if (compareGrid) compareGrid.dataset.active = button.dataset.compare;
    }),
  );

  /* Examples page filter */
  const filterButtons = document.querySelectorAll('[data-filter]');
  filterButtons.forEach((button) =>
    button.addEventListener('click', () => {
      const mode = button.dataset.filter;
      filterButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      document.querySelectorAll('[data-filter-list] [data-mode]').forEach((item) => {
        item.hidden = mode !== 'all' && item.dataset.mode !== mode;
      });
    }),
  );

  /* Open the example linked by the URL hash */
  if (location.hash) {
    const target = document.querySelector(`${CSS.escape(location.hash)} details`);
    if (target) target.open = true;
  }

  /* Reveal sections on scroll (content stays visible if this never runs) */
  const revealables = document.querySelectorAll('[data-reveal]');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }),
      { rootMargin: '0px 0px -10% 0px' },
    );
    revealables.forEach((el) => observer.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-visible'));
  }

  /* Pass UTM parameters from this page to the sign-up links */
  const params = new URLSearchParams(location.search);
  const utms = [...params].filter(([key]) => key.startsWith('utm_'));
  if (utms.length) {
    document.querySelectorAll('[data-app-link]').forEach((link) => {
      const url = new URL(link.href);
      utms.forEach(([key, value]) => url.searchParams.set(key, value));
      link.href = url.toString();
    });
  }

  /* Plausible analytics: loaded only when a domain is configured (no cookies) */
  const plausibleDomain = document.querySelector('meta[name="eras:plausible"]')?.content;
  if (plausibleDomain) {
    window.plausible =
      window.plausible ||
      function (...args) {
        (window.plausible.q = window.plausible.q || []).push(args);
      };
    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = plausibleDomain;
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);
    const names = { cta: 'Criar minha historia', language: 'Troca de idioma', example: 'Abertura de exemplo' };
    document.addEventListener('click', (event) => {
      const el = event.target.closest('[data-event]');
      if (el) window.plausible(names[el.dataset.event] || el.dataset.event, { props: { lang: document.documentElement.lang } });
    });
  }
})();
