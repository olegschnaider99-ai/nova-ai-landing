# Nova AI Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page, bilingual (UA/EN), cosmic-themed landing page for the fictional "Nova AI" AI-creator agency, matching `docs/superpowers/specs/2026-08-03-nova-ai-landing-design.md`, and deploy it live via GitHub + Vercel.

**Architecture:** Static vanilla HTML/CSS/JS, no build step. One `index.html`, several focused CSS files (variables/base/components/sections/intro/responsive), and ES-module JS files split by responsibility (i18n, intro animation, nav, services, form, validation). Pure-logic functions (translation lookup, form validation, intro skip decision) are unit tested with Node's built-in test runner; everything visual/animated is verified manually in the browser.

**Tech Stack:** HTML5, CSS3 (custom properties, grid/flexbox, canvas 2D for the intro), vanilla JS (ES modules), Node built-in test runner (`node --test`, no dependencies), Google Fonts (Space Grotesk + Inter), Git, GitHub, Vercel.

## Global Constraints

- No build tool, no npm dependencies — pure static site (per spec "Стек").
- Bilingual UA/EN via client-side toggle only, no separate URLs (per spec "Мовний перемикач").
- No fabricated reviews, prices, or statistics anywhere in copy (per spec "Поза межами обсягу").
- Contact form is UI-only — validates and shows a success message, does not actually transmit data (per spec, Task 8 of this plan).
- Intro animation plays once per session (`sessionStorage`) and is skipped entirely when `prefers-reduced-motion: reduce` is set (per spec, Task 4).
- Colors, fonts, and button styles must match the exact values in the spec's "Візуальна система" section.
- Mobile-first responsive breakpoints: ~480px, ~768px, ~1024px (per spec "Адаптивність").

---

## File Structure

```
index.html
css/
  variables.css      — CSS custom properties, font imports
  base.css            — reset, body background, base typography
  components.css      — buttons, cards, form fields, chips
  sections.css        — per-section layout (hero, services, portfolio, process, advantages, contact, footer)
  intro.css           — intro overlay + canvas + logo reveal
  responsive.css       — media queries for all breakpoints
js/
  i18n-data.js        — dictionary + pure `translate()` (unit tested)
  i18n.js             — DOM layer: `applyLanguage()`, `initI18n()`, `getCurrentLang()`
  intro.js            — canvas particle animation + pure `shouldPlayIntro()` (unit tested)
  nav.js              — sticky header on scroll
  services.js         — "Обрати послугу" chip → scroll + checkbox sync
  validation.js       — pure form validation functions (unit tested)
  form.js             — DOM layer: wires validation.js to the contact form
  main.js             — entry point, calls all `init*()` functions
tests/
  i18n-data.test.mjs
  intro.test.mjs
  validation.test.mjs
package.json          — `"type": "module"`, `test` script
README.md             — concept description + tools used (for submission)
```

---

### Task 1: HTML skeleton, base styles, fonts

**Files:**
- Create: `index.html`
- Create: `css/variables.css`
- Create: `css/base.css`

**Interfaces:**
- Produces: full page markup with ids `#intro-overlay`, `#hero`, `#about`, `#services`, `#portfolio`, `#process`, `#advantages`, `#contact`, and `data-i18n` / `data-i18n-placeholder` attributes on every text node, matching the dictionary keys used in Task 2.

- [ ] **Step 1: Create `css/variables.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&display=swap');

:root {
  --bg-deep: #020409;
  --bg-mid: #071224;
  --accent-blue: #5fc4ff;
  --accent-blue-2: #3f8fe0;
  --accent-violet: #b98cff;
  --accent-teal: #7fe0d0;
  --text-primary: #eaf6ff;
  --text-secondary: #9fc7e6;
  --text-muted: #6a86a0;
  --glass-bg: rgba(255, 255, 255, 0.05);
  --border-glass: rgba(255, 255, 255, 0.16);
  --font-heading: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

- [ ] **Step 2: Create `css/base.css`**

```css
* { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  background: radial-gradient(ellipse at 50% 25%, #0a1b30 0%, #030710 60%, #000103 100%) fixed;
  color: var(--text-primary);
  font-family: var(--font-body);
  line-height: 1.5;
  min-height: 100vh;
  overflow-x: hidden;
}

h1, h2, h3 {
  font-family: var(--font-heading);
  font-weight: 700;
  line-height: 1.2;
}

a { color: inherit; text-decoration: none; }

.container {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-subtitle {
  color: var(--text-secondary);
  margin-top: 8px;
}

button { font-family: inherit; }
```

- [ ] **Step 3: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="ua">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nova AI — AI-креатор агентство</title>
<link rel="stylesheet" href="css/variables.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/sections.css">
<link rel="stylesheet" href="css/intro.css">
<link rel="stylesheet" href="css/responsive.css">
</head>
<body>

<div id="intro-overlay">
  <canvas id="intro-canvas"></canvas>
  <div class="intro-logo">Nova AI</div>
  <button class="intro-skip" id="intro-skip" data-i18n="intro.skip">Пропустити</button>
</div>

<header class="site-header">
  <div class="container header-inner">
    <span class="logo">Nova AI</span>
    <nav class="main-nav">
      <a href="#services" data-i18n="nav.services">Послуги</a>
      <a href="#portfolio" data-i18n="nav.portfolio">Роботи</a>
      <a href="#process" data-i18n="nav.process">Процес</a>
      <a href="#contact" data-i18n="nav.contact">Контакти</a>
    </nav>
    <button class="lang-toggle" data-lang-toggle type="button">EN</button>
  </div>
</header>

<main>
  <section id="hero" class="hero">
    <div class="container hero-inner">
      <h1 data-i18n="hero.title">Твоя ідея заслуговує вибухового старту</h1>
      <p class="hero-subtitle" data-i18n="hero.subtitle">Ми запускаємо її в реальність за допомогою AI</p>
      <p class="hero-description" data-i18n="hero.description">AI-креатор агентство, що перетворює ваші ідеї на візуали, відео та контент, готові підкорювати аудиторію.</p>
      <div class="hero-actions">
        <a href="#contact" class="btn btn-primary" data-i18n="hero.ctaPrimary">Залишити заявку</a>
        <a href="#services" class="btn btn-secondary" data-i18n="hero.ctaSecondary">Дізнатись більше</a>
      </div>
    </div>
  </section>

  <section id="about" class="about">
    <div class="container">
      <h2 data-i18n="about.title">Про нас</h2>
      <p data-i18n="about.text">Nova AI — команда, що поєднує креативність людини з можливостями штучного інтелекту. Ми створюємо візуали, відео та контент, які виглядають так, ніби над ними працювала ціла студія — швидше і доступніше.</p>
    </div>
  </section>

  <section id="services" class="services">
    <div class="container">
      <h2 data-i18n="services.title">Послуги</h2>
      <p class="section-subtitle" data-i18n="services.subtitle">Повний цикл AI-креативу для вашого бренду</p>
      <div class="services-grid">

        <article class="service-card">
          <span class="service-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"/><circle cx="18" cy="17" r="2"/></svg></span>
          <h3 data-i18n="services.items.visuals.title">AI-генерація візуалів та брендинг</h3>
          <p data-i18n="services.items.visuals.subtitle">Бренд, який запам'ятовується з першого погляду</p>
          <button class="btn-chip" data-service-chip="visuals" type="button" data-i18n="services.cta">Обрати послугу</button>
        </article>

        <article class="service-card">
          <span class="service-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3V9z"/></svg></span>
          <h3 data-i18n="services.items.video.title">AI-відео та моушн-дизайн</h3>
          <p data-i18n="services.items.video.subtitle">Відео, що говорить голосніше за слова</p>
          <button class="btn-chip" data-service-chip="video" type="button" data-i18n="services.cta">Обрати послугу</button>
        </article>

        <article class="service-card">
          <span class="service-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h13v10H8l-4 4V4z"/></svg></span>
          <h3 data-i18n="services.items.social.title">AI-контент для соцмереж</h3>
          <p data-i18n="services.items.social.subtitle">Контент, який не пролистають повз</p>
          <button class="btn-chip" data-service-chip="social" type="button" data-i18n="services.cta">Обрати послугу</button>
        </article>

        <article class="service-card">
          <span class="service-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg></span>
          <h3 data-i18n="services.items.automation.title">AI-автоматизація та боти</h3>
          <p data-i18n="services.items.automation.subtitle">Робота, що триває навіть уночі</p>
          <button class="btn-chip" data-service-chip="automation" type="button" data-i18n="services.cta">Обрати послугу</button>
        </article>

        <article class="service-card">
          <span class="service-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 20l3.5-1 11-11-2.5-2.5-11 11L4 20z"/><path d="M14 5l2.5 2.5"/></svg></span>
          <h3 data-i18n="services.items.copywriting.title">AI-копірайтинг</h3>
          <p data-i18n="services.items.copywriting.subtitle">Тексти, що продають, а не просто заповнюють простір</p>
          <button class="btn-chip" data-service-chip="copywriting" type="button" data-i18n="services.cta">Обрати послугу</button>
        </article>

        <article class="service-card">
          <span class="service-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5c.7.6 1 1.3 1 2.5h6c0-1.2.3-1.9 1-2.5A6 6 0 0012 3z"/></svg></span>
          <h3 data-i18n="services.items.consulting.title">Консалтинг з впровадження AI</h3>
          <p data-i18n="services.items.consulting.subtitle">Перший крок до AI без хаосу</p>
          <button class="btn-chip" data-service-chip="consulting" type="button" data-i18n="services.cta">Обрати послугу</button>
        </article>

      </div>
    </div>
  </section>

  <section id="portfolio" class="portfolio">
    <div class="container">
      <h2 data-i18n="portfolio.title">Приклади робіт</h2>
      <p class="section-subtitle" data-i18n="portfolio.subtitle">Навчальні AI-візуали, що демонструють стиль подачі</p>
      <div class="portfolio-grid">
        <figure class="portfolio-card portfolio-card--1"><figcaption data-i18n="portfolio.items.1">AI-візуал · Абстрактна композиція</figcaption></figure>
        <figure class="portfolio-card portfolio-card--2"><figcaption data-i18n="portfolio.items.2">AI-візуал · Продуктова сцена</figcaption></figure>
        <figure class="portfolio-card portfolio-card--3"><figcaption data-i18n="portfolio.items.3">AI-моушн · Цикл переходів</figcaption></figure>
        <figure class="portfolio-card portfolio-card--4"><figcaption data-i18n="portfolio.items.4">AI-візуал · Портретне світло</figcaption></figure>
        <figure class="portfolio-card portfolio-card--5"><figcaption data-i18n="portfolio.items.5">AI-контент · Соціальний пост</figcaption></figure>
        <figure class="portfolio-card portfolio-card--6"><figcaption data-i18n="portfolio.items.6">AI-візуал · Архітектурна форма</figcaption></figure>
      </div>
    </div>
  </section>

  <section id="process" class="process">
    <div class="container">
      <h2 data-i18n="process.title">Як ми працюємо</h2>
      <p class="section-subtitle" data-i18n="process.subtitle">П'ять кроків від ідеї до результату</p>
      <ol class="process-timeline">
        <li><span class="step-number">1</span><h3 data-i18n="process.steps.1.title">Заявка та брифінг</h3><p data-i18n="process.steps.1.desc">Розповідаєте про мету, ми уточнюємо деталі</p></li>
        <li><span class="step-number">2</span><h3 data-i18n="process.steps.2.title">Концепція та стратегія</h3><p data-i18n="process.steps.2.desc">Пропонуємо підхід і AI-інструменти під задачу</p></li>
        <li><span class="step-number">3</span><h3 data-i18n="process.steps.3.title">Генерація та розробка</h3><p data-i18n="process.steps.3.desc">Створюємо контент за допомогою AI</p></li>
        <li><span class="step-number">4</span><h3 data-i18n="process.steps.4.title">Узгодження та доопрацювання</h3><p data-i18n="process.steps.4.desc">Враховуємо правки, доводимо до ідеалу</p></li>
        <li><span class="step-number">5</span><h3 data-i18n="process.steps.5.title">Запуск та підтримка</h3><p data-i18n="process.steps.5.desc">Публікуємо результат і залишаємось на зв'язку</p></li>
      </ol>
    </div>
  </section>

  <section id="advantages" class="advantages">
    <div class="container">
      <h2 data-i18n="advantages.title">Переваги</h2>
      <div class="advantages-grid">
        <div class="advantage-item"><h3 data-i18n="advantages.items.1.title">Швидкість завдяки AI</h3><p data-i18n="advantages.items.1.desc">Результат у рази швидше за традиційний підхід</p></div>
        <div class="advantage-item"><h3 data-i18n="advantages.items.2.title">Індивідуальний підхід</h3><p data-i18n="advantages.items.2.desc">Кожен проєкт під ваш бренд, без шаблонів</p></div>
        <div class="advantage-item"><h3 data-i18n="advantages.items.3.title">Все в одному місці</h3><p data-i18n="advantages.items.3.desc">Візуал, відео, текст і автоматизація в одній команді</p></div>
        <div class="advantage-item"><h3 data-i18n="advantages.items.4.title">Прозорість процесу</h3><p data-i18n="advantages.items.4.desc">Узгоджуємо кожен крок разом з вами</p></div>
        <div class="advantage-item"><h3 data-i18n="advantages.items.5.title">Сучасні AI-інструменти</h3><p data-i18n="advantages.items.5.desc">Використовуємо найновіші моделі та технології</p></div>
      </div>
    </div>
  </section>

  <section id="contact" class="contact">
    <div class="container">
      <h2 data-i18n="contact.title">Залишити заявку</h2>
      <p class="section-subtitle" data-i18n="contact.subtitle">Розкажіть про свою ідею — ми зв'яжемось найближчим часом</p>

      <form id="contact-form" novalidate>
        <div class="field">
          <label for="name" data-i18n="contact.fieldName">Ім'я</label>
          <input type="text" id="name" name="name">
          <span class="field-error" data-error-for="name"></span>
        </div>
        <div class="field">
          <label for="contact-value" data-i18n="contact.fieldContact">Email або телефон</label>
          <input type="text" id="contact-value" name="contact">
          <span class="field-error" data-error-for="contact"></span>
        </div>
        <div class="field">
          <label for="message" data-i18n="contact.fieldMessage">Повідомлення</label>
          <textarea id="message" name="message" rows="4"></textarea>
          <span class="field-error" data-error-for="message"></span>
        </div>
        <fieldset class="interest-fieldset">
          <legend data-i18n="contact.fieldInterest">Що вас цікавить?</legend>
          <label><input type="checkbox" name="interest" value="visuals"><span data-i18n="services.items.visuals.title">AI-генерація візуалів та брендинг</span></label>
          <label><input type="checkbox" name="interest" value="video"><span data-i18n="services.items.video.title">AI-відео та моушн-дизайн</span></label>
          <label><input type="checkbox" name="interest" value="social"><span data-i18n="services.items.social.title">AI-контент для соцмереж</span></label>
          <label><input type="checkbox" name="interest" value="automation"><span data-i18n="services.items.automation.title">AI-автоматизація та боти</span></label>
          <label><input type="checkbox" name="interest" value="copywriting"><span data-i18n="services.items.copywriting.title">AI-копірайтинг</span></label>
          <label><input type="checkbox" name="interest" value="consulting"><span data-i18n="services.items.consulting.title">Консалтинг з впровадження AI</span></label>
        </fieldset>
        <button type="submit" class="btn btn-primary" data-i18n="contact.submit">Відправити заявку</button>
      </form>
      <div id="contact-success" class="contact-success" hidden data-i18n="contact.successMessage">Дякуємо! Ми зв'яжемось з вами найближчим часом.</div>
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="container">
    <span class="logo">Nova AI</span>
    <p data-i18n="footer.tagline">Творимо майбутнє за допомогою штучного інтелекту</p>
    <p class="copyright" data-i18n="footer.copyright">© 2026 Nova AI. Усі права захищено.</p>
  </div>
</footer>

<script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 4: Manual verification**

Open `index.html` directly in a browser (or via the preview tool). Expected: page renders with the deep-space gradient background, white/light text using Space Grotesk (headings) and Inter (body) — visually check via DevTools computed `font-family` on an `<h1>` and a `<p>`. No styling for buttons/cards yet is expected at this stage (they'll look like plain text/unstyled buttons — that's fine, Task 5+ adds their styles).

- [ ] **Step 5: Commit**

```bash
git add index.html css/variables.css css/base.css
git commit -m "Add HTML skeleton and base styles for Nova AI landing page"
```

---

### Task 2: i18n system (dictionary + engine + language toggle)

**Files:**
- Create: `package.json`
- Create: `js/i18n-data.js`
- Create: `js/i18n.js`
- Create: `tests/i18n-data.test.mjs`

**Interfaces:**
- Consumes: `data-i18n`, `data-i18n-placeholder`, `data-lang-toggle` attributes from Task 1's `index.html`.
- Produces: `translate(key, lang)` (pure, from `i18n-data.js`), `applyLanguage(lang)`, `initI18n()`, `getCurrentLang()` (from `i18n.js`) — consumed by `main.js` in Task 12 and `form.js` in Task 10.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "nova-ai-landing",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/"
  }
}
```

- [ ] **Step 2: Write the failing test**

Create `tests/i18n-data.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { translate, dictionary } from '../js/i18n-data.js';

test('translate returns the Ukrainian string for a known key', () => {
  assert.equal(translate('hero.title', 'ua'), 'Твоя ідея заслуговує вибухового старту');
});

test('translate returns the English string for a known key', () => {
  assert.equal(translate('hero.title', 'en'), 'Your idea deserves an explosive start');
});

test('translate falls back to a visible marker for an unknown key', () => {
  assert.equal(translate('nonexistent.key', 'ua'), '[[nonexistent.key]]');
});

test('every dictionary entry has both ua and en strings', () => {
  const missing = Object.entries(dictionary).filter(
    ([, value]) => !value.ua || !value.en
  );
  assert.deepEqual(missing, []);
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../js/i18n-data.js'`

- [ ] **Step 4: Write `js/i18n-data.js`**

```js
export const dictionary = {
  'intro.skip': { ua: 'Пропустити', en: 'Skip' },

  'nav.services': { ua: 'Послуги', en: 'Services' },
  'nav.portfolio': { ua: 'Роботи', en: 'Work' },
  'nav.process': { ua: 'Процес', en: 'Process' },
  'nav.contact': { ua: 'Контакти', en: 'Contact' },

  'hero.title': { ua: 'Твоя ідея заслуговує вибухового старту', en: 'Your idea deserves an explosive start' },
  'hero.subtitle': { ua: 'Ми запускаємо її в реальність за допомогою AI', en: 'We launch it into reality with AI' },
  'hero.description': { ua: "AI-креатор агентство, що перетворює ваші ідеї на візуали, відео та контент, готові підкорювати аудиторію.", en: 'An AI-creator agency turning your ideas into visuals, video and content ready to win over your audience.' },
  'hero.ctaPrimary': { ua: 'Залишити заявку', en: 'Get in touch' },
  'hero.ctaSecondary': { ua: 'Дізнатись більше', en: 'Learn more' },

  'about.title': { ua: 'Про нас', en: 'About us' },
  'about.text': { ua: "Nova AI — команда, що поєднує креативність людини з можливостями штучного інтелекту. Ми створюємо візуали, відео та контент, які виглядають так, ніби над ними працювала ціла студія — швидше і доступніше.", en: 'Nova AI is a team that combines human creativity with the power of artificial intelligence. We create visuals, video and content that look like the work of a full studio — faster and more accessible.' },

  'services.title': { ua: 'Послуги', en: 'Services' },
  'services.subtitle': { ua: "Повний цикл AI-креативу для вашого бренду", en: 'A full cycle of AI-powered creative for your brand' },
  'services.cta': { ua: 'Обрати послугу', en: 'Choose this service' },

  'services.items.visuals.title': { ua: 'AI-генерація візуалів та брендинг', en: 'AI Visuals & Branding' },
  'services.items.visuals.subtitle': { ua: "Бренд, який запам'ятовується з першого погляду", en: "A brand that's unforgettable from first glance" },
  'services.items.video.title': { ua: 'AI-відео та моушн-дизайн', en: 'AI Video & Motion Design' },
  'services.items.video.subtitle': { ua: 'Відео, що говорить голосніше за слова', en: 'Video that speaks louder than words' },
  'services.items.social.title': { ua: 'AI-контент для соцмереж', en: 'AI Content for Social Media' },
  'services.items.social.subtitle': { ua: 'Контент, який не пролистають повз', en: 'Content that stops the scroll' },
  'services.items.automation.title': { ua: 'AI-автоматизація та боти', en: 'AI Automation & Bots' },
  'services.items.automation.subtitle': { ua: 'Робота, що триває навіть уночі', en: 'Work that never sleeps' },
  'services.items.copywriting.title': { ua: 'AI-копірайтинг', en: 'AI Copywriting' },
  'services.items.copywriting.subtitle': { ua: 'Тексти, що продають, а не просто заповнюють простір', en: 'Words that sell, not just fill space' },
  'services.items.consulting.title': { ua: 'Консалтинг з впровадження AI', en: 'AI Consulting' },
  'services.items.consulting.subtitle': { ua: 'Перший крок до AI без хаосу', en: 'Your first step into AI, without the chaos' },

  'portfolio.title': { ua: 'Приклади робіт', en: 'Selected work' },
  'portfolio.subtitle': { ua: 'Навчальні AI-візуали, що демонструють стиль подачі', en: 'Illustrative AI visuals demonstrating our creative style' },
  'portfolio.items.1': { ua: 'AI-візуал · Абстрактна композиція', en: 'AI Visual · Abstract composition' },
  'portfolio.items.2': { ua: 'AI-візуал · Продуктова сцена', en: 'AI Visual · Product scene' },
  'portfolio.items.3': { ua: 'AI-моушн · Цикл переходів', en: 'AI Motion · Transition loop' },
  'portfolio.items.4': { ua: 'AI-візуал · Портретне світло', en: 'AI Visual · Portrait lighting' },
  'portfolio.items.5': { ua: 'AI-контент · Соціальний пост', en: 'AI Content · Social post' },
  'portfolio.items.6': { ua: 'AI-візуал · Архітектурна форма', en: 'AI Visual · Architectural form' },

  'process.title': { ua: 'Як ми працюємо', en: 'How we work' },
  'process.subtitle': { ua: "П'ять кроків від ідеї до результату", en: 'Five steps from idea to result' },
  'process.steps.1.title': { ua: 'Заявка та брифінг', en: 'Request & Briefing' },
  'process.steps.1.desc': { ua: 'Розповідаєте про мету, ми уточнюємо деталі', en: 'You tell us your goal, we clarify the details' },
  'process.steps.2.title': { ua: 'Концепція та стратегія', en: 'Concept & Strategy' },
  'process.steps.2.desc': { ua: 'Пропонуємо підхід і AI-інструменти під задачу', en: 'We propose an approach and AI tools for the task' },
  'process.steps.3.title': { ua: 'Генерація та розробка', en: 'Generation & Development' },
  'process.steps.3.desc': { ua: 'Створюємо контент за допомогою AI', en: 'We create content with AI' },
  'process.steps.4.title': { ua: 'Узгодження та доопрацювання', en: 'Review & Refinement' },
  'process.steps.4.desc': { ua: 'Враховуємо правки, доводимо до ідеалу', en: 'We factor in feedback and polish the result' },
  'process.steps.5.title': { ua: 'Запуск та підтримка', en: 'Launch & Support' },
  'process.steps.5.desc': { ua: 'Публікуємо результат і залишаємось на зв\'язку', en: 'We publish the result and stay in touch' },

  'advantages.title': { ua: 'Переваги', en: 'Why Nova AI' },
  'advantages.items.1.title': { ua: 'Швидкість завдяки AI', en: 'Speed powered by AI' },
  'advantages.items.1.desc': { ua: 'Результат у рази швидше за традиційний підхід', en: 'Results many times faster than a traditional approach' },
  'advantages.items.2.title': { ua: 'Індивідуальний підхід', en: 'A tailored approach' },
  'advantages.items.2.desc': { ua: 'Кожен проєкт під ваш бренд, без шаблонів', en: 'Every project built around your brand, no templates' },
  'advantages.items.3.title': { ua: 'Все в одному місці', en: 'Everything in one place' },
  'advantages.items.3.desc': { ua: 'Візуал, відео, текст і автоматизація в одній команді', en: 'Visuals, video, copy and automation, one team' },
  'advantages.items.4.title': { ua: 'Прозорість процесу', en: 'A transparent process' },
  'advantages.items.4.desc': { ua: 'Узгоджуємо кожен крок разом з вами', en: 'We align on every step together with you' },
  'advantages.items.5.title': { ua: 'Сучасні AI-інструменти', en: 'Cutting-edge AI tools' },
  'advantages.items.5.desc': { ua: 'Використовуємо найновіші моделі та технології', en: 'We use the latest models and technologies' },

  'contact.title': { ua: 'Залишити заявку', en: 'Get in touch' },
  'contact.subtitle': { ua: 'Розкажіть про свою ідею — ми зв\'яжемось найближчим часом', en: "Tell us about your idea — we'll be in touch shortly" },
  'contact.fieldName': { ua: "Ім'я", en: 'Name' },
  'contact.fieldContact': { ua: 'Email або телефон', en: 'Email or phone' },
  'contact.fieldMessage': { ua: 'Повідомлення', en: 'Message' },
  'contact.fieldInterest': { ua: 'Що вас цікавить?', en: 'What are you interested in?' },
  'contact.submit': { ua: 'Відправити заявку', en: 'Send request' },
  'contact.successMessage': { ua: 'Дякуємо! Ми зв\'яжемось з вами найближчим часом.', en: "Thank you! We'll be in touch with you shortly." },
  'contact.errorRequired': { ua: "Заповніть це поле", en: 'Please fill in this field' },
  'contact.errorEmail': { ua: 'Введіть коректний email або телефон', en: 'Enter a valid email or phone number' },

  'footer.tagline': { ua: 'Творимо майбутнє за допомогою штучного інтелекту', en: 'Building the future with artificial intelligence' },
  'footer.copyright': { ua: '© 2026 Nova AI. Усі права захищено.', en: '© 2026 Nova AI. All rights reserved.' }
};

export function translate(key, lang) {
  const entry = dictionary[key];
  if (!entry) return `[[${key}]]`;
  return entry[lang] ?? entry.ua;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS — 4 tests passing.

- [ ] **Step 6: Write `js/i18n.js`**

```js
import { translate } from './i18n-data.js';

const STORAGE_KEY = 'novaAiLang';
let currentLang = localStorage.getItem(STORAGE_KEY) || 'ua';

export function getCurrentLang() {
  return currentLang;
}

export function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = translate(el.dataset.i18n, lang);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', translate(el.dataset.i18nPlaceholder, lang));
  });
  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    btn.textContent = lang === 'ua' ? 'EN' : 'UA';
  });
}

export function initI18n() {
  applyLanguage(currentLang);
  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      applyLanguage(currentLang === 'ua' ? 'en' : 'ua');
    });
  });
}
```

- [ ] **Step 7: Manual verification**

This module isn't wired into the page yet (that happens in Task 12's `main.js`); no browser check yet. Confirm only that `npm test` still passes after adding this file (it doesn't import `i18n.js`, so it should be unaffected).

- [ ] **Step 8: Commit**

```bash
git add package.json js/i18n-data.js js/i18n.js tests/i18n-data.test.mjs
git commit -m "Add i18n dictionary and language-switching engine"
```

---

### Task 3: Signature button component + service/portfolio/advantage card components

**Files:**
- Create: `css/components.css`

**Interfaces:**
- Produces: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-chip`, `.service-card`, `.advantage-item`, `.field`, `.field-error`, `.interest-fieldset` classes consumed by `index.html` (Task 1) and `css/sections.css` (Task 5+).

- [ ] **Step 1: Write `css/components.css`**

```css
/* Buttons — signature style approved during brainstorming */
.btn {
  display: inline-block;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.3px;
  border: none;
  cursor: pointer;
  text-align: center;
}

.btn-primary {
  position: relative;
  padding: 15px 34px;
  border-radius: 999px;
  color: var(--text-primary);
  background: linear-gradient(180deg, rgba(120, 200, 255, 0.16), rgba(60, 140, 220, 0.08));
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  isolation: isolate;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.5px;
  background: conic-gradient(from var(--angle, 0deg), var(--accent-blue), var(--accent-violet), var(--accent-blue), var(--accent-teal), var(--accent-blue));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: spin 4s linear infinite;
  z-index: -1;
}

.btn-primary::after {
  content: '';
  position: absolute;
  top: 0;
  left: -60%;
  width: 40%;
  height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  transform: skewX(-20deg);
  animation: sweep 2.6s ease-in-out infinite;
}

@keyframes spin { to { --angle: 360deg; } }
@property --angle { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
@keyframes sweep { 0% { left: -60%; } 50% { left: 120%; } 100% { left: 120%; } }

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(95, 196, 255, 0.55), 0 10px 28px rgba(0, 0, 0, 0.4);
}

.btn-secondary {
  padding: 14px 30px;
  border-radius: 999px;
  color: var(--text-secondary);
  background: var(--glass-bg);
  border: 1px solid var(--border-glass);
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.btn-chip {
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 12px;
  color: var(--accent-blue);
  background: rgba(95, 196, 255, 0.08);
  border: 1px solid rgba(95, 196, 255, 0.4);
  transition: all 0.2s ease;
}

.btn-chip:hover {
  background: rgba(95, 196, 255, 0.18);
  box-shadow: 0 0 14px rgba(95, 196, 255, 0.4);
}

/* Cards */
.service-card, .advantage-item {
  background: var(--glass-bg);
  border: 1px solid var(--border-glass);
  border-radius: 16px;
  padding: 28px;
  backdrop-filter: blur(6px);
}

.service-icon svg {
  width: 28px;
  height: 28px;
  color: var(--accent-blue);
  margin-bottom: 12px;
}

.service-card h3, .advantage-item h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.service-card p, .advantage-item p {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 16px;
}

/* Form fields */
.field {
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 13px;
  color: var(--text-secondary);
}

.field input, .field textarea {
  background: var(--glass-bg);
  border: 1px solid var(--border-glass);
  border-radius: 8px;
  padding: 12px 14px;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 14px;
}

.field input:focus, .field textarea:focus {
  outline: none;
  border-color: var(--accent-blue);
}

.field-error {
  color: #ff8fa3;
  font-size: 12px;
  min-height: 14px;
}

.interest-fieldset {
  border: none;
  margin: 8px 0 24px;
  padding: 0;
}

.interest-fieldset legend {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.interest-fieldset label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-bottom: 8px;
}
```

- [ ] **Step 2: Manual verification**

Open `index.html` in the browser. Expected: the primary CTA buttons in the hero now show the rotating holographic border and shimmer sweep; hovering lifts them slightly. Service cards show a glass background with a rounded border. Form fields (further down, still unstyled section layout) show the glass input style.

- [ ] **Step 3: Commit**

```bash
git add css/components.css
git commit -m "Add signature button, card, and form-field components"
```

---

### Task 4: Intro animation (canvas particles + logo reveal)

**Files:**
- Create: `css/intro.css`
- Create: `js/intro.js`
- Create: `tests/intro.test.mjs`

**Interfaces:**
- Consumes: `#intro-overlay`, `#intro-canvas`, `.intro-logo`, `#intro-skip` from Task 1's HTML.
- Produces: `initIntro()` (called by `main.js` in Task 12), `shouldPlayIntro({ prefersReducedMotion, alreadyPlayed })` (pure, unit tested here).

- [ ] **Step 1: Write the failing test**

Create `tests/intro.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldPlayIntro } from '../js/intro.js';

test('plays intro on a fresh session with no motion preference', () => {
  assert.equal(shouldPlayIntro({ prefersReducedMotion: false, alreadyPlayed: false }), true);
});

test('skips intro if already played this session', () => {
  assert.equal(shouldPlayIntro({ prefersReducedMotion: false, alreadyPlayed: true }), false);
});

test('skips intro if the user prefers reduced motion, even on a fresh session', () => {
  assert.equal(shouldPlayIntro({ prefersReducedMotion: true, alreadyPlayed: false }), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../js/intro.js'`

- [ ] **Step 3: Write `js/intro.js`**

```js
const SESSION_KEY = 'novaAiIntroPlayed';

export function shouldPlayIntro({ prefersReducedMotion, alreadyPlayed }) {
  return !prefersReducedMotion && !alreadyPlayed;
}

export function initIntro() {
  const overlay = document.getElementById('intro-overlay');
  const canvas = document.getElementById('intro-canvas');
  const skipBtn = document.getElementById('intro-skip');

  const alreadyPlayed = sessionStorage.getItem(SESSION_KEY) === '1';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  sessionStorage.setItem(SESSION_KEY, '1');

  if (!shouldPlayIntro({ prefersReducedMotion, alreadyPlayed })) {
    overlay.remove();
    return;
  }

  runParticleAnimation(canvas, overlay);
  skipBtn.addEventListener('click', () => finishIntro(overlay));
}

function runParticleAnimation(canvas, overlay) {
  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particleCount = window.innerWidth < 768 ? 60 : 140;
  const particles = Array.from({ length: particleCount }, () => {
    const side = Math.random() < 0.5 ? -1 : 1;
    return {
      side,
      startX: width / 2 + side * (10 + Math.random() * 20),
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 0.4,
      speed: 0.5 + Math.random() * 0.5,
      opacity: 0.4 + Math.random() * 0.6
    };
  });

  const duration = 2500;
  const startTime = performance.now();

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function frame(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(t);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#020409';
    ctx.fillRect(0, 0, width, height);

    particles.forEach((p) => {
      const travel = eased * (width / 2) * p.speed;
      const x = p.startX + p.side * travel;
      ctx.beginPath();
      ctx.arc(x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(191, 232, 255, ${p.opacity * (1 - eased * 0.3)})`;
      ctx.fill();
    });

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      revealLogo(overlay);
    }
  }
  requestAnimationFrame(frame);
}

function revealLogo(overlay) {
  const logo = overlay.querySelector('.intro-logo');
  logo.classList.add('is-visible');
  setTimeout(() => finishIntro(overlay), 900);
}

function finishIntro(overlay) {
  overlay.classList.add('is-hidden');
  setTimeout(() => overlay.remove(), 500);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — 7 tests passing total (4 from Task 2 + 3 here).

- [ ] **Step 5: Write `css/intro.css`**

```css
#intro-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #020409;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.5s ease;
}

#intro-overlay.is-hidden {
  opacity: 0;
  pointer-events: none;
}

#intro-canvas {
  position: absolute;
  inset: 0;
}

.intro-logo {
  position: relative;
  font-family: var(--font-heading);
  font-size: clamp(28px, 6vw, 48px);
  font-weight: 700;
  color: var(--text-primary);
  text-shadow: 0 0 30px rgba(95, 196, 255, 0.7), 0 0 60px rgba(63, 143, 224, 0.4);
  opacity: 0;
  transform: scale(0.9);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.intro-logo.is-visible {
  opacity: 1;
  transform: scale(1);
}

.intro-skip {
  position: absolute;
  bottom: 24px;
  right: 24px;
  font-size: 12px;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid var(--border-glass);
  padding: 8px 16px;
  border-radius: 999px;
  cursor: pointer;
}

.intro-skip:hover {
  color: var(--text-primary);
  border-color: var(--text-primary);
}
```

- [ ] **Step 6: Manual verification (deferred)**

This isn't wired into the page until `main.js` exists (Task 12). Skip browser verification for now; confirm `npm test` passes.

- [ ] **Step 7: Commit**

```bash
git add css/intro.css js/intro.js tests/intro.test.mjs
git commit -m "Add canvas particle intro animation with reduced-motion and session skip logic"
```

---

### Task 5: Hero, About, and header/nav layout

**Files:**
- Create: `css/sections.css` (hero, about, header sections only — more appended in later tasks)
- Create: `js/nav.js`

**Interfaces:**
- Produces: `initStickyHeader()` consumed by `main.js` (Task 12).

- [ ] **Step 1: Write `js/nav.js`**

```js
export function initStickyHeader() {
  const header = document.querySelector('.site-header');
  const hero = document.getElementById('hero');

  const observer = new IntersectionObserver(
    ([entry]) => header.classList.toggle('is-sticky', !entry.isIntersecting),
    { threshold: 0 }
  );
  observer.observe(hero);
}
```

- [ ] **Step 2: Write `css/sections.css` (header, hero, about)**

```css
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: transparent;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.site-header.is-sticky {
  background: rgba(2, 4, 9, 0.85);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 0 var(--border-glass);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 18px;
  padding-bottom: 18px;
}

.logo {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 20px;
}

.main-nav {
  display: flex;
  gap: 28px;
  font-size: 14px;
  color: var(--text-secondary);
}

.lang-toggle {
  background: var(--glass-bg);
  border: 1px solid var(--border-glass);
  color: var(--text-primary);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding-top: 80px;
}

.hero-inner {
  text-align: center;
  max-width: 760px;
  margin: 0 auto;
}

.hero h1 {
  font-size: clamp(32px, 5.5vw, 56px);
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 18px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.hero-description {
  color: var(--text-muted);
  margin-bottom: 32px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.about {
  padding: 100px 0;
  text-align: center;
}

.about h2 {
  font-size: 32px;
  margin-bottom: 20px;
}

.about p {
  max-width: 680px;
  margin: 0 auto;
  color: var(--text-secondary);
}
```

- [ ] **Step 3: Manual verification (deferred)**

`nav.js` isn't wired in until Task 12. Confirm `npm test` still passes (unaffected — no tests reference nav.js, per spec it's DOM-only).

- [ ] **Step 4: Commit**

```bash
git add css/sections.css js/nav.js
git commit -m "Add header, hero, and about section layout"
```

---

### Task 6: Services section layout + chip-to-form sync

**Files:**
- Modify: `css/sections.css` (append services section styles)
- Create: `js/services.js`

**Interfaces:**
- Consumes: `[data-service-chip]` buttons and `#contact input[name="interest"]` checkboxes from Task 1's HTML.
- Produces: `initServiceChips()` consumed by `main.js` (Task 12).

- [ ] **Step 1: Write `js/services.js`**

```js
export function initServiceChips() {
  document.querySelectorAll('[data-service-chip]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const serviceId = btn.dataset.serviceChip;
      const checkbox = document.querySelector(
        `#contact-form input[name="interest"][value="${serviceId}"]`
      );
      if (checkbox) checkbox.checked = true;
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    });
  });
}
```

- [ ] **Step 2: Append to `css/sections.css`**

```css
.services {
  padding: 100px 0;
}

.services h2, .portfolio h2, .process h2, .advantages h2, .contact h2 {
  font-size: 32px;
  text-align: center;
}

.services .section-subtitle, .portfolio .section-subtitle, .process .section-subtitle, .contact .section-subtitle {
  text-align: center;
  margin-bottom: 48px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
```

- [ ] **Step 3: Manual verification (deferred)**

`services.js` isn't wired in until Task 12. Confirm `npm test` still passes.

- [ ] **Step 4: Commit**

```bash
git add css/sections.css js/services.js
git commit -m "Add services section grid and service-to-contact-form chip sync"
```

---

### Task 7: Portfolio section (procedural AI-style visuals)

**Files:**
- Modify: `css/sections.css` (append portfolio section styles)

**Interfaces:**
- Consumes: `.portfolio-card--1` through `.portfolio-card--6` from Task 1's HTML.

- [ ] **Step 1: Append to `css/sections.css`**

```css
.portfolio {
  padding: 100px 0;
}

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.portfolio-card {
  aspect-ratio: 4 / 3;
  border-radius: 16px;
  border: 1px solid var(--border-glass);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.portfolio-card figcaption {
  position: relative;
  z-index: 1;
  padding: 14px 16px;
  font-size: 13px;
  color: var(--text-primary);
  background: linear-gradient(to top, rgba(0, 0, 0, 0.55), transparent);
  width: 100%;
}

.portfolio-card--1 { background: radial-gradient(circle at 30% 30%, var(--accent-blue), transparent 60%), radial-gradient(circle at 70% 70%, var(--accent-violet), transparent 60%), var(--bg-deep); }
.portfolio-card--2 { background: linear-gradient(135deg, var(--accent-teal), var(--bg-mid) 70%); }
.portfolio-card--3 { background: conic-gradient(from 90deg, var(--accent-blue), var(--accent-violet), var(--accent-teal), var(--accent-blue)); }
.portfolio-card--4 { background: radial-gradient(ellipse at 50% 20%, var(--accent-violet), var(--bg-deep) 70%); }
.portfolio-card--5 { background: linear-gradient(160deg, var(--accent-blue-2), var(--bg-deep)); }
.portfolio-card--6 { background: repeating-linear-gradient(45deg, var(--bg-mid), var(--bg-mid) 12px, rgba(95,196,255,0.15) 12px, rgba(95,196,255,0.15) 24px); }
```

- [ ] **Step 2: Manual verification**

Open `index.html` in the browser and scroll to the "Приклади робіт" section. Expected: 6 distinct gradient cards (blue/violet radial, teal diagonal, conic rainbow, violet glow, blue linear, diagonal stripes), each with a caption at the bottom.

- [ ] **Step 3: Commit**

```bash
git add css/sections.css
git commit -m "Add procedural gradient portfolio cards"
```

---

### Task 8: Process timeline + Advantages section layout

**Files:**
- Modify: `css/sections.css` (append process and advantages styles)

- [ ] **Step 1: Append to `css/sections.css`**

```css
.process {
  padding: 100px 0;
}

.process-timeline {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  counter-reset: step;
}

.process-timeline li {
  position: relative;
  padding: 24px 16px;
  border-top: 2px solid var(--border-glass);
}

.step-number {
  display: inline-block;
  width: 32px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  border-radius: 50%;
  background: var(--glass-bg);
  border: 1px solid var(--accent-blue);
  color: var(--accent-blue);
  font-family: var(--font-heading);
  font-weight: 700;
  margin-bottom: 12px;
  margin-top: -33px;
}

.process-timeline h3 {
  font-size: 16px;
  margin-bottom: 6px;
}

.process-timeline p {
  font-size: 13px;
  color: var(--text-secondary);
}

.advantages {
  padding: 100px 0;
}

.advantages-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
```

- [ ] **Step 2: Manual verification**

Scroll to "Як ми працюємо" and "Переваги". Expected: 5 process steps in a horizontal row, each with a numbered circle sitting on the top border; 5 advantage cards in a 3-column grid (last row has 2 items, which is fine).

- [ ] **Step 3: Commit**

```bash
git add css/sections.css
git commit -m "Add process timeline and advantages grid layout"
```

---

### Task 9: Contact form validation (pure logic)

**Files:**
- Create: `js/validation.js`
- Create: `tests/validation.test.mjs`

**Interfaces:**
- Produces: `isValidEmailOrPhone(value)`, `validateForm({ name, contact, message })` consumed by `js/form.js` (Task 10).

- [ ] **Step 1: Write the failing test**

Create `tests/validation.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidEmailOrPhone, validateForm } from '../js/validation.js';

test('accepts a valid email', () => {
  assert.equal(isValidEmailOrPhone('someone@example.com'), true);
});

test('accepts a valid phone number', () => {
  assert.equal(isValidEmailOrPhone('+380 67 123 4567'), true);
});

test('rejects a string with neither an email nor a phone shape', () => {
  assert.equal(isValidEmailOrPhone('not-a-contact'), false);
});

test('validateForm passes with all fields filled correctly', () => {
  const { valid, errors } = validateForm({ name: 'Олег', contact: 'test@test.com', message: 'Привіт' });
  assert.equal(valid, true);
  assert.deepEqual(errors, {});
});

test('validateForm flags a missing name as required', () => {
  const { valid, errors } = validateForm({ name: '', contact: 'test@test.com', message: 'Привіт' });
  assert.equal(valid, false);
  assert.equal(errors.name, 'required');
});

test('validateForm flags an invalid contact value', () => {
  const { valid, errors } = validateForm({ name: 'Олег', contact: 'xyz', message: 'Привіт' });
  assert.equal(valid, false);
  assert.equal(errors.contact, 'invalid');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../js/validation.js'`

- [ ] **Step 3: Write `js/validation.js`**

```js
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+\d][\d\s().-]{6,}$/;

export function isValidEmailOrPhone(value) {
  const trimmed = value.trim();
  return EMAIL_PATTERN.test(trimmed) || PHONE_PATTERN.test(trimmed);
}

export function validateForm({ name, contact, message }) {
  const errors = {};
  if (!name || !name.trim()) errors.name = 'required';
  if (!contact || !isValidEmailOrPhone(contact)) errors.contact = 'invalid';
  if (!message || !message.trim()) errors.message = 'required';
  return { valid: Object.keys(errors).length === 0, errors };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — 13 tests passing total (7 from Tasks 2+4 + 6 here).

- [ ] **Step 5: Commit**

```bash
git add js/validation.js tests/validation.test.mjs
git commit -m "Add pure contact-form validation logic"
```

---

### Task 10: Contact form wiring + Contact/Footer section layout

**Files:**
- Create: `js/form.js`
- Modify: `css/sections.css` (append contact and footer styles)

**Interfaces:**
- Consumes: `validateForm` (Task 9), `translate`/`getCurrentLang` (Tasks 2).
- Produces: `initContactForm(getCurrentLang)` consumed by `main.js` (Task 12).

- [ ] **Step 1: Write `js/form.js`**

```js
import { validateForm } from './validation.js';
import { translate } from './i18n-data.js';

export function initContactForm(getCurrentLang) {
  const form = document.getElementById('contact-form');
  const successEl = document.getElementById('contact-success');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = {
      name: form.elements.name.value,
      contact: form.elements.contact.value,
      message: form.elements.message.value
    };
    const { valid, errors } = validateForm(data);
    clearFieldErrors(form);

    if (!valid) {
      showFieldErrors(form, errors, getCurrentLang());
      return;
    }

    form.hidden = true;
    successEl.hidden = false;
    successEl.textContent = translate('contact.successMessage', getCurrentLang());
  });
}

function clearFieldErrors(form) {
  form.querySelectorAll('.field-error').forEach((el) => {
    el.textContent = '';
  });
}

function showFieldErrors(form, errors, lang) {
  Object.entries(errors).forEach(([field, type]) => {
    const key = type === 'required' ? 'contact.errorRequired' : 'contact.errorEmail';
    const el = form.querySelector(`[data-error-for="${field}"]`);
    if (el) el.textContent = translate(key, lang);
  });
}
```

- [ ] **Step 2: Append to `css/sections.css`**

```css
.contact {
  padding: 100px 0 60px;
}

.contact form {
  max-width: 560px;
  margin: 0 auto;
}

.contact-success {
  max-width: 560px;
  margin: 0 auto;
  text-align: center;
  padding: 40px 24px;
  background: var(--glass-bg);
  border: 1px solid var(--accent-blue);
  border-radius: 16px;
  color: var(--text-primary);
}

.site-footer {
  padding: 48px 0;
  text-align: center;
  border-top: 1px solid var(--border-glass);
  color: var(--text-muted);
  font-size: 13px;
}

.site-footer .logo {
  display: block;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.site-footer p {
  margin-top: 4px;
}
```

- [ ] **Step 3: Manual verification (deferred)**

`form.js` isn't wired in until Task 12. Confirm `npm test` still passes.

- [ ] **Step 4: Commit**

```bash
git add js/form.js css/sections.css
git commit -m "Add contact form submission handling and contact/footer layout"
```

---

### Task 11: Wire everything together in `main.js`

**Files:**
- Create: `js/main.js`

**Interfaces:**
- Consumes: `initI18n` (Task 2), `initIntro` (Task 4), `initStickyHeader` (Task 5), `initServiceChips` (Task 6), `initContactForm`, `getCurrentLang` (Tasks 2, 10).

- [ ] **Step 1: Write `js/main.js`**

```js
import { initI18n, getCurrentLang } from './i18n.js';
import { initIntro } from './intro.js';
import { initStickyHeader } from './nav.js';
import { initServiceChips } from './services.js';
import { initContactForm } from './form.js';

document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  initIntro();
  initStickyHeader();
  initServiceChips();
  initContactForm(getCurrentLang);
});
```

- [ ] **Step 2: Add the script tag to `index.html`**

Confirm `index.html` (Task 1) already ends with:

```html
<script type="module" src="js/main.js"></script>
```

If not present, add it just before `</body>`.

- [ ] **Step 3: Manual verification — full flow**

Open `index.html` in a browser (first load, fresh session):
1. Expected: intro overlay shows particles parting from the center, "Nova AI" logo fades in with a glow, then the overlay fades out after ~3.4s revealing the hero.
2. Click the "Пропустити" button on a fresh reload — expected: overlay fades out immediately.
3. Reload the page again (same tab/session) — expected: intro does NOT play, hero shows immediately.
4. Click "EN" in the header — expected: all visible text switches to English instantly, button label switches to "UA".
5. Scroll down — expected: header background becomes solid/blurred once the hero is scrolled past.
6. In the Services section, click "Обрати послугу" / "Choose this service" on any card — expected: page smooth-scrolls to the contact form and that service's checkbox is checked.
7. Submit the contact form empty — expected: inline error messages appear under each empty/invalid field.
8. Fill in Name, a valid email, and a message, submit — expected: form is replaced by the "Дякуємо!" success message.

- [ ] **Step 4: Commit**

```bash
git add js/main.js index.html
git commit -m "Wire i18n, intro, nav, services, and form modules into main.js"
```

---

### Task 12: Responsive pass (mobile-first breakpoints)

**Files:**
- Create: `css/responsive.css`

- [ ] **Step 1: Write `css/responsive.css`**

```css
@media (max-width: 1024px) {
  .services-grid, .portfolio-grid, .advantages-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .process-timeline {
    grid-template-columns: repeat(1, 1fr);
  }
  .process-timeline li {
    border-top: none;
    border-left: 2px solid var(--border-glass);
    padding-left: 20px;
  }
  .step-number {
    margin-top: 0;
    margin-left: -33px;
  }
}

@media (max-width: 768px) {
  .main-nav {
    display: none;
  }
  .services-grid, .portfolio-grid, .advantages-grid {
    grid-template-columns: 1fr;
  }
  .hero h1 {
    font-size: 32px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 16px;
  }
  .hero-actions {
    flex-direction: column;
    width: 100%;
  }
  .btn-primary, .btn-secondary {
    width: 100%;
  }
}
```

- [ ] **Step 2: Manual verification**

Resize the browser viewport (or use device toolbar) to 1024px, 768px, and 375px widths. At each: confirm no horizontal scrollbar appears, grids collapse to 2 then 1 column, the nav links hide below 768px (language toggle remains visible), hero buttons stack full-width below 480px, and the process timeline switches from a horizontal row to a left-bordered vertical list below 1024px.

- [ ] **Step 3: Commit**

```bash
git add css/responsive.css
git commit -m "Add responsive breakpoints for mobile and tablet"
```

---

### Task 13: README for submission

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# Nova AI — Landing Page Concept

Навчальна концепція оновленого сайту для AI-креатор агентства (практичне ТЗ), натхненна референсом nashe.agency (тільки рівень подачі, без копіювання).

## Стек і інструменти

- Vanilla HTML5 / CSS3 / JavaScript (ES modules), без білд-кроку
- Node.js built-in test runner (`node --test`) для unit-тестів логіки (i18n, валідація форми, умова показу інтро)
- Google Fonts: Space Grotesk, Inter
- Claude (Anthropic) — асистент для брейнштормінгу концепції, дизайну та написання коду

## Запуск локально

Відкрити `index.html` у браузері — build-кроку не потрібно.

## Тести

```bash
npm test
```

## Структура

Див. `docs/superpowers/specs/2026-08-03-nova-ai-landing-design.md` для повного опису дизайн-рішень.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "Add README with concept summary and tooling used"
```

---

### Task 14: Push to GitHub and deploy to Vercel

**Files:** none (infrastructure task)

> **Important:** This task publishes content to a public GitHub repository and a live Vercel URL. Confirm with the user immediately before running the `git push` and any Vercel deployment command — do not run them automatically as part of batch execution.

- [ ] **Step 1: Confirm the user has an authenticated GitHub CLI session**

Run: `gh auth status`
Expected: shows a logged-in account. If not authenticated, the user must run `gh auth login` themselves (interactive browser login) before continuing.

- [ ] **Step 2: Ask the user for explicit confirmation to publish**

Ask: "Ready to push this repo to a new public GitHub repository named `nova-ai-landing` and deploy it to Vercel — confirm?" Wait for an explicit yes before Step 3.

- [ ] **Step 3: Create the GitHub repo and push**

```bash
gh repo create nova-ai-landing --public --source=. --remote=origin --push
```

Expected: prints the new repo URL, and `git remote -v` now shows `origin` pointing at it.

- [ ] **Step 4: Deploy to Vercel**

Confirm the user has an authenticated Vercel CLI session (`vercel whoami`; if not, they run `vercel login` themselves), then run:

```bash
vercel --prod --yes
```

Expected: prints a live `https://nova-ai-landing-*.vercel.app` URL.

- [ ] **Step 5: Verify the live site**

Open the printed Vercel URL in a browser and repeat the Task 11 Step 3 manual verification checklist (intro, language toggle, sticky header, service chip sync, form validation, success message) against the live deployment.

---

## Self-Review Notes

- **Spec coverage:** intro animation (Task 4), hero/about/header (Task 5), services + chip sync (Task 6), portfolio (Task 7), process + advantages (Task 8), contact form + validation (Tasks 9–10), i18n (Task 2), responsive (Task 12), buttons/cards (Task 3), deploy (Task 14) — every section of the spec's "Структура сторінки" has a corresponding task.
- **Placeholder scan:** no TBD/TODO — all copy, colors, and code are final values from the approved spec.
- **Type/name consistency:** `translate(key, lang)`, `getCurrentLang()`, `initI18n()`, `initIntro()`, `shouldPlayIntro()`, `initStickyHeader()`, `initServiceChips()`, `validateForm()`, `isValidEmailOrPhone()`, `initContactForm(getCurrentLang)` are each defined once and referenced identically in every later task that consumes them.
