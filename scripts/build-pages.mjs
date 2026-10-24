#!/usr/bin/env node
// Generates the static HTML pages of the site in the 3 languages from scripts/content/*.mjs.
// The output is committed: the site has NO build step to open or to publish (ADR 0014).
// Usage: node scripts/build-pages.mjs   (run from site/ or anywhere)
//        SITE_URL=https://user.github.io/eras node scripts/build-pages.mjs   (other domain or sub-path)
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import en from './content/en-US.mjs';
import es from './content/es-ES.mjs';
import pt from './content/pt-BR.mjs';
import { scenes } from './content/scenes.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Site configuration. Change here and run the script again. */
const config = {
  // Public URL of the site, without a trailing slash. SITE_URL overrides it at build time: the GitHub Pages
  // workflow passes the URL of the Pages site (e.g. https://user.github.io/eras). [A CONFIRMAR domínio]
  domain: (process.env.SITE_URL || 'https://eras.app').replace(/\/+$/, ''),
  appLogin: 'https://app.eras.app/login', // [A CONFIRMAR domínio]
  appSignup: 'https://app.eras.app/signup', // [A CONFIRMAR domínio]
  plausibleDomain: '', // e.g. "eras.app" turns Plausible on (no cookies)
  email: 'contato@eras.app', // [A CONFIRMAR]
  instagram: 'https://www.instagram.com/eras.app', // [A CONFIRMAR]
  tiktok: 'https://www.tiktok.com/@eras.app', // [A CONFIRMAR]
  assetVersion: '2.0.0', // bump to bust the long cache of CSS/JS (see README)
};
/** Path of the site inside the domain: "" at the root, "/eras" on a GitHub Pages project site. */
const basePath = new URL(config.domain).pathname.replace(/\/+$/, '');

const locales = [
  { copy: pt, dir: '', hreflang: 'pt-BR' },
  { copy: en, dir: 'locales/en', hreflang: 'en' },
  { copy: es, dir: 'locales/es', hreflang: 'es' },
];

const pages = [
  { key: 'index', file: 'index.html', clean: '', nav: null },
  { key: 'examples', file: 'exemplos.html', clean: 'exemplos', nav: 'examples' },
  { key: 'about', file: 'sobre.html', clean: 'sobre', nav: 'about' },
  { key: 'privacy', file: 'privacy.html', clean: 'privacy', nav: null },
  { key: 'terms', file: 'termos.html', clean: 'termos', nav: null },
  { key: 'notFound', file: '404.html', clean: '404', nav: null },
];

/** Old addresses kept alive (the app and shared links may still use them). */
const redirects = [{ file: 'privacidade.html', to: 'privacy' }];

const esc = (value) =>
  String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

let sceneCounter = 0;
/** Inline scene with unique gradient ids (a scene can appear twice on a page). */
const scene = (name) => {
  sceneCounter += 1;
  return scenes[name].replaceAll(/sky-([a-z]+)/g, `sky-$1-${sceneCounter}`);
};

const svg = (viewBox, body) => `<svg viewBox="${viewBox}" aria-hidden="true" focusable="false">${body}</svg>`;
const stroke = (d, width = 2) =>
  `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;

const icon = {
  hourglass: svg(
    '0 0 24 32',
    `${stroke('M3 2h18M3 30h18M5 2c0 8 7 9 7 14S5 22 5 30M19 2c0 8-7 9-7 14s7 6 7 14', 2.2)}<path d="M8 27c1.5-3 3-3.5 4-3.5s2.5.5 4 3.5Z" fill="currentColor"/>`,
  ),
  menu: svg('0 0 24 24', stroke('M4 7h16M4 12h16M4 17h16')),
  globe: svg('0 0 24 24', `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/>${stroke('M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18', 1.8)}`),
  arrow: svg('0 0 24 24', stroke('M5 12h14M13 6l6 6-6 6')),
  arrowLeft: svg('0 0 24 24', stroke('M19 12H5M11 6l-6 6 6 6')),
  chevron: svg('0 0 24 24', stroke('M9 6l6 6-6 6', 2.2)),
  plus: svg('0 0 24 24', stroke('M12 5v14M5 12h14', 2.2)),
  share: svg('0 0 24 24', stroke('M12 15V4M8 8l4-4 4 4M5 13v6h14v-6')),
  check: svg('0 0 24 24', stroke('M5 12.5l4.5 4.5L19 7', 2.4)),
  sparkle: svg(
    '0 0 24 24',
    '<path d="M10 3.5l1.9 5.1 5.1 1.9-5.1 1.9L10 17.5l-1.9-5.1L3 10.5l5.1-1.9Z" fill="currentColor"/><path d="M18.5 13.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9Z" fill="currentColor"/>',
  ),
};

/** One icon per feature card, in the order of content.features.items. */
const featureIcons = [
  svg('0 0 24 24', stroke('M4 5h16v11H10l-5 4v-4H4Z M8 9h8M8 12h5')),
  svg('0 0 24 24', `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/>${stroke('M15.5 8.5l-2 5-5 2 2-5Z')}`),
  svg('0 0 24 24', `${stroke('M4 8h9M17 8h3M4 16h3M11 16h9')}<circle cx="15" cy="8" r="2.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="16" r="2.2" fill="none" stroke="currentColor" stroke-width="2"/>`),
  svg('0 0 24 24', `${stroke('M4 5h16v14H4Z M4 16l5-5 4 4 2-2 5 5')}<circle cx="15.5" cy="9" r="1.6" fill="currentColor"/>`),
  svg('0 0 24 24', stroke('M4 5.5C6.5 4 9.5 4 12 6c2.5-2 5.5-2 8-.5V19c-2.5-1.5-5.5-1.5-8 .5-2.5-2-5.5-2-8-.5Z M12 6v13.5')),
  svg('0 0 24 24', stroke('M12 15V4M8 8l4-4 4 4M5 13v6h14v-6')),
];

/** The glass hourglass of the app icon and splash (same drawing as app/src/shared/components/hourglass.tsx). */
const glassHourglass = (id) => `<svg class="glass" viewBox="0 0 240 320" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="glass-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f3ff" stop-opacity=".55"/><stop offset="1" stop-color="#b58aff" stop-opacity=".25"/></linearGradient>
    <linearGradient id="sand-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f3ff"/><stop offset="1" stop-color="#b58aff"/></linearGradient>
  </defs>
  <path d="M58 40C58 120 112 132 112 160C112 188 58 200 58 280L182 280C182 200 128 188 128 160C128 132 182 120 182 40Z" fill="url(#glass-${id})" stroke="#e0d4ff" stroke-width="10" stroke-linejoin="round"/>
  <path d="M80 92C96 120 112 130 120 146C128 130 144 120 160 92Z" fill="url(#sand-${id})"/>
  <path d="M120 160L120 236" stroke="#b58aff" stroke-width="5" stroke-linecap="round"/>
  <path d="M72 272C84 236 104 226 120 226C136 226 156 236 168 272Z" fill="url(#sand-${id})"/>
  <rect x="34" y="20" width="172" height="26" rx="13" fill="#e0d4ff"/>
  <rect x="34" y="274" width="172" height="26" rx="13" fill="#e0d4ff"/>
</svg>`;

/** Order and metadata of the example stories (copy lives in content/*.mjs). */
const exampleMeta = [
  { id: 'plague', scene: 'plague', mode: 'realistic', age: 70 },
  { id: 'pompeii', scene: 'pompeii', mode: 'fantastic', age: 27 },
  { id: 'paris', scene: 'paris', mode: 'fantastic', age: 22 },
  { id: 'edo', scene: 'edo', mode: 'realistic', age: 34 },
  { id: 'mali', scene: 'mali', mode: 'fantastic', age: 35 },
  { id: 'west', scene: 'west', mode: 'realistic', age: 41 },
  { id: 'viking', scene: 'viking', mode: 'realistic', age: 40 },
];

/** Mascot costumes shown on the home page (images in assets/img, same art as the app). */
const costumes = ['explorer', 'navigator', 'peasant', 'plague-doctor'];

function context(locale, page) {
  const depth = locale.dir ? locale.dir.split('/').length : 0;
  const up = '../'.repeat(depth);
  const href = (pageKey) => pages.find((p) => p.key === pageKey).file;
  // Clean URLs (served as-is by GitHub Pages and by Vercel with cleanUrls).
  const urlOf = (loc, p) =>
    `${config.domain}${loc.dir ? `/${loc.dir}` : ''}${p.clean ? `/${p.clean}` : loc.dir ? '' : '/'}`;
  return { c: locale.copy, locale, page, up, href, urlOf };
}

function head(ctx, extra = '') {
  const { c, locale, page, up, urlOf } = ctx;
  const meta = c.meta[page.key];
  const canonical = urlOf(locale, page);
  const alternates =
    page.key === 'notFound'
      ? ''
      : locales.map((l) => `<link rel="alternate" hreflang="${l.hreflang}" href="${urlOf(l, page)}">`).join('\n  ') +
        `\n  <link rel="alternate" hreflang="x-default" href="${urlOf(locales[0], page)}">`;
  const v = config.assetVersion;
  return `<!doctype html>
<html lang="${c.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(meta.title)}</title>
  <meta name="description" content="${esc(meta.description)}">
  ${page.key === 'notFound' ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canonical}">`}
  ${alternates}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Eras">
  <meta property="og:locale" content="${c.ogLocale}">
  <meta property="og:title" content="${esc(meta.title)}">
  <meta property="og:description" content="${esc(meta.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${config.domain}/assets/img/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(meta.title)}">
  <meta name="twitter:description" content="${esc(meta.description)}">
  <meta name="twitter:image" content="${config.domain}/assets/img/og-image.png">
  <meta name="theme-color" content="#0d0d14">
  <meta name="color-scheme" content="dark">
  <meta name="eras:plausible" content="${config.plausibleDomain}">
  <link rel="icon" href="${up}favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="${up}site.webmanifest">
  <link rel="preload" href="${up}assets/fonts/plus-jakarta-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${up}assets/css/tokens.css?v=${v}">
  <link rel="stylesheet" href="${up}assets/css/base.css?v=${v}">
  <link rel="stylesheet" href="${up}assets/css/components.css?v=${v}">
  <link rel="stylesheet" href="${up}assets/css/pages.css?v=${v}">
  <script>document.documentElement.classList.add('js')</script>
  ${extra}
</head>`;
}

/** Logo: the hourglass on the brand gradient (like the app icon) + the wordmark. */
const brand = (href) =>
  `<a class="brand" href="${href}" aria-label="Eras"><span class="brand__badge">${icon.hourglass}</span><span>Eras</span></a>`;

function header(ctx) {
  const { c, locale, page, href, up } = ctx;
  const navItems = [
    ['how', page.key === 'index' ? '#como-funciona' : `${href('index')}#como-funciona`],
    ['examples', href('examples')],
    ['free', page.key === 'index' ? '#gratis' : `${href('index')}#gratis`],
    ['faq', page.key === 'index' ? '#perguntas' : `${href('index')}#perguntas`],
    ['about', href('about')],
  ];
  const langs = locales
    .map((l) => {
      const target = `${up}${l.dir ? `${l.dir}/` : ''}${page.key === 'notFound' ? 'index.html' : page.file}`;
      const current = l === locale;
      return `<li><a href="${target}" hreflang="${l.hreflang}" lang="${l.copy.lang}" data-event="language" ${current ? 'aria-current="true"' : ''}>${l.copy.name}</a></li>`;
    })
    .join('');
  return `<a class="skip-link" href="#conteudo">${c.skip}</a>
<header class="site-header" data-header>
  <div class="container site-header__inner">
    ${brand(href('index'))}
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" data-menu-toggle><span class="visually-hidden">${c.menu}</span>${icon.menu}</button>
    <nav class="site-nav" id="site-nav" aria-label="Principal">
      <ul>${navItems.map(([key, url]) => `<li><a href="${url}"${page.nav === key ? ' aria-current="page"' : ''}>${c.nav[key]}</a></li>`).join('')}</ul>
    </nav>
    <div class="header-actions">
      <details class="lang">
        <summary aria-label="${c.language}: ${c.name}">${icon.globe}<span>${c.short}</span></summary>
        <ul>${langs}</ul>
      </details>
      <a class="link-login" href="${config.appLogin}" data-app-link>${c.login}</a>
      <a class="btn btn--primary" href="${config.appSignup}" data-app-link data-event="cta">${c.cta}</a>
    </div>
  </div>
</header>`;
}

function footer(ctx) {
  const { c, href, up, page } = ctx;
  const langLinks = locales
    .map((l) => `<li><a href="${up}${l.dir ? `${l.dir}/` : ''}${page.key === 'notFound' ? 'index.html' : page.file}" hreflang="${l.hreflang}" lang="${l.copy.lang}" data-event="language">${l.copy.name}</a></li>`)
    .join('');
  return `<footer class="site-footer">
  <div class="container">
    <div class="site-footer__grid">
      <div>
        ${brand(href('index'))}
        <p class="site-footer__tagline">${c.footer.tagline}</p>
      </div>
      <div>
        <h2>${c.footer.product}</h2>
        <ul>
          <li><a href="${href('examples')}">${c.nav.examples}</a></li>
          <li><a href="${href('about')}">${c.nav.about}</a></li>
          <li><a href="${config.appSignup}" data-app-link data-event="cta">${c.footer.signup}</a></li>
          <li><a href="${config.appLogin}" data-app-link>${c.login}</a></li>
        </ul>
      </div>
      <div>
        <h2>${c.footer.legal}</h2>
        <ul>
          <li><a href="${href('privacy')}">${c.footer.privacy}</a></li>
          <li><a href="${href('terms')}">${c.footer.terms}</a></li>
        </ul>
        <h2 class="site-footer__subhead">${c.language}</h2>
        <ul>${langLinks}</ul>
      </div>
      <div>
        <h2>${c.footer.contact}</h2>
        <ul>
          <li><a href="mailto:${config.email}">${config.email}</a></li>
          <li><a href="${config.instagram}" rel="noopener">Instagram @eras.app</a></li>
          <li><a href="${config.tiktok}" rel="noopener">TikTok @eras.app</a></li>
        </ul>
      </div>
    </div>
    <p class="site-footer__legal">${c.footer.rights}</p>
  </div>
</footer>
<script src="${up}assets/js/main.js?v=${config.assetVersion}" defer></script>
</body>
</html>
`;
}

/** Year pill over an illustration, like the thumbnails of the app ("⌛ 1350"). */
const yearBadge = (year) => `<span class="year-badge" aria-hidden="true">${icon.hourglass}${esc(year)}</span>`;

/** Story as it appears inside the phone (hero) or as a card (shelf). */
function storyBody(ctx, meta, { level = 'h3' } = {}) {
  const { c } = ctx;
  const e = c.examples[meta.id];
  return `<div class="story__art">${scene(meta.scene)}${yearBadge(e.year)}</div>
    <div class="story__body">
      <span class="story__mode">${meta.mode === 'realistic' ? c.realistic : c.fantastic} · <span lang="${c.lang}">${c.exampleTag}</span></span>
      <${level} class="story__title">${esc(e.title)}</${level}>
      <p class="story__ending">“${esc(e.ending)}”</p>
      <p class="story__fact"><b>${c.realFact}</b> ${esc(e.facts[0])}</p>
    </div>`;
}

/** Era ring, like the stories tray at the top of the app. */
const ringDisc = (year) => {
  const bc = String(year).match(/^(\d+)\s*(a\.C\.|BC|a\. C\.)$/i);
  return `<span class="ring__disc"><strong>${esc(bc ? bc[1] : year)}</strong>${bc ? `<small>${esc(bc[2])}</small>` : ''}</span>`;
};

/** Hero title with the highlighted part in lavender (second line, as in the app's "teria sido?"). */
const highlight = (text, part) =>
  part && text.includes(part) ? esc(text).replace(esc(part), `<span class="hl">${esc(part)}</span>`) : esc(text);

function indexPage(ctx) {
  const { c, href, up } = ctx;
  const heroIds = ['plague', 'pompeii', 'paris'];
  const heroStories = heroIds
    .map((id, i) => {
      const meta = exampleMeta.find((m) => m.id === id);
      return `<article class="story" id="hero-story-${id}" data-story="${id}"${i ? ' hidden' : ''}>
    ${storyBody(ctx, meta, { level: 'p' })}
    <div class="story__actions" aria-hidden="true"><span>${icon.share} ${c.share}</span><span>${c.variation}</span></div>
  </article>`;
    })
    .join('\n');
  const rings = heroIds
    .map((id, i) => {
      const e = c.examples[id];
      return `<button class="ring" type="button" aria-pressed="${i === 0}" aria-controls="hero-story-${id}" data-story-target="${id}" data-event="example">${ringDisc(e.year)}<span class="ring__label">${esc(e.place.split(',')[0])}</span></button>`;
    })
    .join('');

  const shelf = exampleMeta
    .map(
      (meta) => `<li><a class="story-card" href="${href('examples')}#${meta.id}" data-event="example">
        ${storyBody(ctx, meta)}
      </a></li>`,
    )
    .join('\n');

  const wizardScreens = c.how.steps
    .map((step, i) => {
      const fields = i === 0 ? c.how.fields.slice(0, 3) : i === 1 ? c.how.fields.slice(3, 5) : null;
      const screen = fields
        ? `<div class="wizard"><p class="wizard__title">${esc(step.screen)}</p><div class="wizard__progress" aria-hidden="true">${[0, 1, 2].map((n) => `<span${n <= i ? ' class="is-on"' : ''}></span>`).join('')}</div>${fields.map((f) => `<span class="wizard__field">${esc(f)}</span>`).join('')}<span class="wizard__button">${i === 0 ? '→' : c.cta}</span></div>`
        : `<div class="story story--mini">${storyBody(ctx, exampleMeta[0], { level: 'p' })}</div>`;
      return `<li class="step" data-reveal>
        <div class="phone phone--small" aria-hidden="true"><div class="phone__screen">${screen}</div></div>
        <div class="step__text"><h3><span class="step__number">${i + 1}</span> ${esc(step.title)}</h3><p>${esc(step.text)}</p></div>
      </li>`;
    })
    .join('\n');

  const faq = c.faq.items
    .map((item) => `<details><summary>${esc(item.q)}${icon.plus}</summary><div><p>${esc(item.a)}</p></div></details>`)
    .join('\n');

  return `<main id="conteudo">
  <section class="hero band" aria-labelledby="hero-title">
    <div class="container hero__grid">
      <div class="hero__copy">
        <p class="pill"><span class="pill__dot" aria-hidden="true"></span>${esc(c.hero.note)}</p>
        <h1 id="hero-title">${highlight(c.hero.title, c.hero.highlight)}</h1>
        <p class="lead hero__lead">${esc(c.hero.lead)}</p>
        <div class="hero__actions">
          <a class="btn btn--primary btn--large" href="${config.appSignup}" data-app-link data-event="cta">${icon.sparkle} ${c.cta}</a>
          <a class="btn btn--ghost btn--large" href="${href('examples')}">${c.nav.examples} ${icon.arrow}</a>
        </div>
        <div class="hero__eras">
          <p id="eras-label">${esc(c.hero.pick)}</p>
          <div class="ring-row" role="group" aria-labelledby="eras-label">
            <a class="ring ring--new" href="${config.appSignup}" data-app-link data-event="cta"><span class="ring__disc">${icon.plus}</span><span class="ring__label">${esc(c.hero.newRing)}</span></a>${rings}
          </div>
        </div>
      </div>
      <div class="hero__device">
        <div class="phone" role="region" aria-label="${esc(c.hero.phoneLabel)}" aria-live="polite">
          <div class="phone__screen">
  ${heroStories}
          </div>
        </div>
        <figure class="hero__mascot" aria-hidden="true">
          <img src="${up}assets/img/mascot.webp" alt="" width="96" height="96" loading="lazy" decoding="async">
          <figcaption>${esc(c.hero.mascot)}</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="quiz section" aria-labelledby="quiz-title">
    <div class="container quiz__grid">
      <div class="quiz__copy" data-reveal>
        <h2 id="quiz-title">${esc(c.quiz.title)}</h2>
        <p class="lead">${esc(c.quiz.body)}</p>
      </div>
      <figure class="clipping" data-reveal aria-hidden="true">
        <p class="clipping__title">${esc(c.quiz.clipTitle)}</p>
        <ol class="clipping__answers">${c.quiz.answers.map((a) => `<li>${esc(a)}</li>`).join('')}</ol>
        <p class="clipping__note">${esc(c.quiz.note)}</p>
      </figure>
    </div>
  </section>

  <section class="formula band section" aria-labelledby="formula-title">
    <div class="container">
      <h2 id="formula-title" class="formula__title" data-reveal>${esc(c.formula.title)}</h2>
      <ol class="formula__parts" data-reveal>
        ${c.formula.parts.map((p, i) => `<li class="formula__part${i === 3 ? ' formula__part--result' : ''}"><span class="formula__term">${esc(p.term)}</span><span class="formula__text">${esc(p.text)}</span></li>`).join('\n        ')}
      </ol>
    </div>
  </section>

  <section class="features section" aria-labelledby="features-title">
    <div class="container">
      <div class="section-head" data-reveal>
        <h2 id="features-title">${esc(c.features.title)}</h2>
        <p class="lead">${esc(c.features.lead)}</p>
      </div>
      <ul class="feature-grid">
        ${c.features.items.map((f, i) => `<li class="feature" data-reveal><span class="feature__icon">${featureIcons[i]}</span><h3>${esc(f.name)}</h3><p>${esc(f.benefit)}</p></li>`).join('\n        ')}
      </ul>
    </div>
  </section>

  <section class="how section" id="como-funciona" aria-labelledby="how-title">
    <div class="container">
      <h2 id="how-title" data-reveal>${esc(c.how.title)}</h2>
      <ol class="steps">${wizardScreens}</ol>
    </div>
  </section>

  <section class="mascot section" aria-labelledby="mascot-title">
    <div class="container mascot__grid">
      <div class="section-head" data-reveal>
        <h2 id="mascot-title">${esc(c.mascot.title)}</h2>
        <p class="lead">${esc(c.mascot.lead)}</p>
      </div>
      <ul class="costumes">
        ${costumes.map((id, i) => `<li class="costume" data-reveal><img src="${up}assets/img/mascot-${id}.webp" alt="${esc(c.mascot.alt.replace('{costume}', c.mascot.costumes[i].toLowerCase()))}" width="360" height="360" loading="lazy" decoding="async"><span>${esc(c.mascot.costumes[i])}</span></li>`).join('\n        ')}
      </ul>
    </div>
  </section>

  <section class="examples band section" aria-labelledby="examples-title">
    <div class="container">
      <div class="examples__head">
        <div>
          <h2 id="examples-title">${esc(c.shelf.title)}</h2>
          <p class="lead">${esc(c.shelf.lead)}</p>
        </div>
        <div class="shelf-controls">
          <button class="round-btn" type="button" data-shelf="-1" aria-label="${c.prev}">${icon.arrowLeft}</button>
          <button class="round-btn" type="button" data-shelf="1" aria-label="${c.next}">${icon.arrow}</button>
        </div>
      </div>
      <ul class="shelf" data-shelf-track>
${shelf}
      </ul>
      <a class="text-link" href="${href('examples')}">${c.shelf.more} ${icon.chevron}</a>
    </div>
  </section>

  <section class="compare section" aria-labelledby="compare-title">
    <div class="container">
      <div class="compare__head" data-reveal>
        <h2 id="compare-title">${esc(c.compare.title)}</h2>
        <p class="lead">${esc(c.compare.lead)}</p>
        <p class="compare__person">${esc(c.compare.person)} <span class="example-tag">${c.exampleTag}</span></p>
      </div>
      <div class="compare__switch" role="group" aria-label="${esc(c.compare.title)}">
        <button type="button" aria-pressed="true" data-compare="realistic">${c.realistic}</button>
        <button type="button" aria-pressed="false" data-compare="fantastic">${c.fantastic}</button>
      </div>
      <div class="compare__grid" data-compare-grid data-active="realistic">
        ${['realistic', 'fantastic']
          .map(
            (mode) => `<article class="compare__page compare__page--${mode}" data-mode="${mode}" data-reveal>
          <div class="compare__art">${scene('mill')}</div>
          <p class="story__mode">${c[mode]}</p>
          <h3>${esc(c.compare[mode].title)}</h3>
          <p>${esc(c.compare[mode].text)}</p>
          <p class="story__ending">“${esc(c.compare[mode].ending)}”</p>
        </article>`,
          )
          .join('\n        ')}
      </div>
    </div>
  </section>

  <section class="free section" id="gratis" aria-labelledby="free-title">
    <div class="container">
      <div class="hero-card free__card" data-reveal>
        ${glassHourglass('free')}
        <div class="free__main">
          <h2 id="free-title">${esc(c.free.title)}</h2>
          <p class="lead">${esc(c.free.text)}</p>
          <a class="btn btn--primary btn--large" href="${config.appSignup}" data-app-link data-event="cta">${icon.sparkle} ${c.cta}</a>
        </div>
        <ul class="free__points">${c.free.points.map((p) => `<li>${icon.check}<span>${esc(p)}</span></li>`).join('')}</ul>
      </div>
    </div>
  </section>

  <section class="faq-section section" id="perguntas" aria-labelledby="faq-title">
    <div class="container faq-section__grid">
      <h2 id="faq-title">${esc(c.faq.title)}</h2>
      <div class="faq">
${faq}
      </div>
    </div>
  </section>

  <section class="final band" aria-labelledby="final-title">
    <div class="container final__inner">
      <img class="final__mascot" src="${up}assets/img/mascot.webp" alt="" width="120" height="120" loading="lazy" decoding="async">
      <h2 id="final-title">${esc(c.final.title)}</h2>
      <p class="lead">${esc(c.final.text)}</p>
      <a class="btn btn--primary btn--large" href="${config.appSignup}" data-app-link data-event="cta">${icon.sparkle} ${c.cta}</a>
      <div class="final__rings" aria-hidden="true">${exampleMeta
        .slice(0, 5)
        .map((m) => `<span class="ring">${ringDisc(c.examples[m.id].year)}</span>`)
        .join('')}</div>
    </div>
  </section>
</main>
<script type="application/ld+json">${JSON.stringify([
    { '@context': 'https://schema.org', '@type': 'Organization', name: 'Eras', url: config.domain, logo: `${config.domain}/favicon.svg`, email: config.email, sameAs: [config.instagram, config.tiktok] },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Eras',
      url: config.domain,
      applicationCategory: 'EntertainmentApplication',
      operatingSystem: 'iOS, Android',
      inLanguage: c.lang,
      description: c.meta.index.description,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: c.faq.items.map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
    },
  ]).replaceAll('<', '\\u003c')}</script>`;
}

function examplesPage(ctx) {
  const { c } = ctx;
  const items = exampleMeta
    .map((meta) => {
      const e = c.examples[meta.id];
      return `<article class="example" id="${meta.id}" data-mode="${meta.mode}">
        <div class="example__art">${scene(meta.scene)}${yearBadge(e.year)}</div>
        <div class="example__body">
          <p class="story__mode">${meta.mode === 'realistic' ? c.realistic : c.fantastic} · ${esc(e.place)}, ${esc(e.year)} · <span class="example-tag">${c.exampleTag}</span></p>
          <h2>${esc(e.title)}</h2>
          <p class="story__ending">“${esc(e.ending)}”</p>
          <details class="example__more">
            <summary data-event="example">${c.readStory} ${icon.chevron}</summary>
            <p>${esc(e.story)}</p>
            <h3>${c.realFact.replace(':', '')}</h3>
            <ul>${e.facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
          </details>
        </div>
      </article>`;
    })
    .join('\n');
  return `<main id="conteudo">
  <section class="page-hero band">
    <div class="container">
      <h1>${esc(c.examplesPage.title)}</h1>
      <p class="lead">${esc(c.examplesPage.lead)}</p>
      <div class="filter" role="group" aria-label="${esc(c.examplesPage.title)}">
        <button type="button" aria-pressed="true" data-filter="all">${c.examplesPage.filters.all}</button>
        <button type="button" aria-pressed="false" data-filter="realistic">${c.examplesPage.filters.realistic}</button>
        <button type="button" aria-pressed="false" data-filter="fantastic">${c.examplesPage.filters.fantastic}</button>
      </div>
    </div>
  </section>
  <section class="section">
    <div class="container examples-list" data-filter-list>
${items}
    </div>
  </section>
  ${finalCard(c, c.examplesPage.cta)}
</main>`;
}

/** Closing call to action of the inner pages: the gradient card of the app's home. */
function finalCard(c, title) {
  return `<section class="section section--tight">
    <div class="container">
      <div class="hero-card cta-card">
        ${glassHourglass('cta')}
        <h2>${esc(title)}</h2>
        <a class="btn btn--primary btn--large" href="${config.appSignup}" data-app-link data-event="cta">${icon.sparkle} ${c.cta}</a>
      </div>
    </div>
  </section>`;
}

/** Sections of a text page; `ids` adds anchors (s1, s2…) for the table of contents. */
function proseSections(sections, { ids = false } = {}) {
  return sections
    .map(
      (s, i) =>
        `<h2${ids ? ` id="s${i + 1}"` : ''}>${esc(s.h)}</h2>\n${s.p.map((p) => `<p>${esc(p)}</p>`).join('\n')}${s.list ? `\n<ul>${s.list.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>` : ''}`,
    )
    .join('\n');
}

function aboutPage(ctx) {
  const { c, up } = ctx;
  return `<main id="conteudo">
  <section class="page-hero band">
    <div class="container"><h1>${esc(c.about.title)}</h1><p class="lead">${esc(c.about.lead)}</p></div>
  </section>
  <section class="section">
    <div class="container about__grid">
      <div class="prose">
${proseSections(c.about.sections)}
      </div>
      <aside class="about__aside" aria-hidden="true">
        <div class="phone phone--small"><div class="phone__screen"><div class="story story--mini">${storyBody(ctx, exampleMeta[3], { level: 'p' })}</div></div></div>
        <img class="about__mascot" src="${up}assets/img/mascot.webp" alt="" width="120" height="120" loading="lazy" decoding="async">
      </aside>
    </div>
  </section>
  ${finalCard(c, c.final.title)}
</main>`;
}

function legalPage(ctx, key) {
  const { c } = ctx;
  const doc = c[key];
  const toc = doc.sections.map((s, i) => `<li><a href="#s${i + 1}">${esc(s.h)}</a></li>`).join('');
  return `<main id="conteudo">
  <section class="page-hero band">
    <div class="container">
      <h1>${esc(doc.title)}</h1>
      ${doc.lead ? `<p class="lead">${esc(doc.lead)}</p>` : ''}
      <p class="page-hero__meta">${esc(doc.updated || c.legal.updated)}</p>
    </div>
  </section>
  <section class="section">
    <div class="container legal__grid">
      <nav class="legal__toc" aria-label="${esc(doc.title)}"><ol>${toc}</ol></nav>
      <div class="prose legal">
        <p class="legal-review">${esc(c.legal.review)}</p>
${proseSections(doc.sections, { ids: true })}
      </div>
    </div>
  </section>
</main>`;
}

function notFoundPage(ctx) {
  const { c, href, up } = ctx;
  return `<main id="conteudo" class="lost band">
  <div class="container lost__inner">
    <img class="lost__mascot" src="${up}assets/img/mascot-explorer.webp" alt="" width="180" height="180">
    <h1>${esc(c.notFound.title)}</h1>
    <p class="lead">${esc(c.notFound.text)}</p>
    <div class="lost__actions">
      <a class="btn btn--primary btn--large" href="${href('index')}">${esc(c.notFound.home)}</a>
      <a class="btn btn--ghost btn--large" href="${href('examples')}">${c.nav.examples}</a>
    </div>
  </div>
</main>`;
}

/** Tiny page that sends an old address to its new one (works on any static host). */
function redirectPage(ctx, target) {
  const { c } = ctx;
  const url = ctx.urlOf(ctx.locale, target);
  return `<!doctype html>
<html lang="${c.lang}">
<head>
  <meta charset="utf-8">
  <title>${esc(c.meta[target.key].title)}</title>
  <meta name="robots" content="noindex">
  <link rel="canonical" href="${url}">
  <meta http-equiv="refresh" content="0; url=${target.file}">
  <script>location.replace('${target.file}' + location.hash)</script>
</head>
<body>
  <p><a href="${target.file}">${esc(c.meta[target.key].title)}</a></p>
</body>
</html>
`;
}

const renderers = {
  index: indexPage,
  examples: examplesPage,
  about: aboutPage,
  privacy: (ctx) => legalPage(ctx, 'privacy'),
  terms: (ctx) => legalPage(ctx, 'terms'),
  notFound: notFoundPage,
};

let count = 0;
for (const locale of locales) {
  for (const page of pages) {
    // A single 404 page, at the root: the host serves it for any missing URL.
    if (page.key === 'notFound' && locale.dir) continue;
    sceneCounter = 0;
    const ctx = context(locale, page);
    if (page.key === 'notFound') {
      // Served for any missing URL, at any depth: assets and links must be absolute (with the base path).
      ctx.up = `${basePath}/`;
      ctx.href = (pageKey) => `${basePath}/${pages.find((p) => p.key === pageKey).clean}`;
    }
    const body = renderers[page.key](ctx);
    const html = `${head(ctx)}\n<body class="page-${page.key}">\n${header(ctx)}\n${body}\n${footer(ctx)}`;
    const out = join(root, locale.dir, page.file);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, html);
    count += 1;
  }
  for (const redirect of redirects) {
    const target = pages.find((p) => p.key === redirect.to);
    writeFileSync(join(root, locale.dir, redirect.file), redirectPage(context(locale, target), target));
  }
}

// Sitemap with clean URLs and hreflang alternates.
const ctx0 = context(locales[0], pages[0]);
const urls = pages
  .filter((p) => p.key !== 'notFound')
  .flatMap((p) =>
    locales.map(
      (l) => `  <url>
    <loc>${ctx0.urlOf(l, p)}</loc>
${locales.map((alt) => `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${ctx0.urlOf(alt, p)}"/>`).join('\n')}
  </url>`,
    ),
  );
writeFileSync(
  join(root, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`,
);
writeFileSync(join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${config.domain}/sitemap.xml\n`);
console.log(`✓ ${count} páginas, sitemap.xml e robots.txt gerados (${config.domain})`);
