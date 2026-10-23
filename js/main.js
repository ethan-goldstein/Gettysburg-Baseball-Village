/* Gettysburg Baseball Village: page enhancements.
   All content is in the HTML; this only layers behavior on top. */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Header state + scroll progress + parallax ---------- */
  const header = $('#siteHeader');
  const progress = $('#scrollProgress');
  const parallaxEls = reduceMotion ? [] : $$('[data-parallax]');
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-scrolled', y > 24);
    progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;

    const vh = window.innerHeight;
    for (const el of parallaxEls) {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > vh + 200) continue;
      const speed = parseFloat(el.dataset.parallax) || 0;
      // hero layers rest at the top of the page; everything else is centered on the viewport
      const offset = el.closest('.hero')
        ? y * speed
        : (rect.top + rect.height / 2 - vh / 2) * -speed;
      el.style.translate = `0 ${offset.toFixed(1)}px`;
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ---------- Active nav link ---------- */
  const navLinks = $$('.main-nav a');
  const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const navObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const id = `#${entry.target.id}`;
      navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === id));
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => navObserver.observe(s));

  /* ---------- Mobile menu ---------- */
  const toggle = $('#menuToggle');
  const menu = $('#mobileMenu');
  menu.hidden = false;

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    $('.sr-only', toggle).textContent = open ? 'Close menu' : 'Open menu';
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    menu.inert = !open;
    if (open) $('a', menu).focus();
  }
  menu.inert = true;
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });
  // keep focus inside the open menu (header toggle counts as part of it)
  document.addEventListener('focusin', e => {
    if (!menu.classList.contains('is-open')) return;
    if (!menu.contains(e.target) && e.target !== toggle) $('a', menu).focus();
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* ---------- Scroll reveals ---------- */
  const revealEls = $$('.reveal, .wipe');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-in'));
  } else {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ---------- Scoreboard countdown ---------- */
  // Opening weekend: Fri May 28, 2027, 8:00 AM Eastern (EDT, UTC-4)
  const OPENING = Date.UTC(2027, 4, 28, 12, 0, 0);
  const board = $('#scoreboard');
  const units = {
    days: $('[data-unit="days"]'),
    hours: $('[data-unit="hours"]'),
    minutes: $('[data-unit="minutes"]'),
    seconds: $('[data-unit="seconds"]'),
  };
  let countdownTimer = null;

  function setTile(el, value) {
    if (el.textContent === value) return;
    el.textContent = value;
    if (reduceMotion) return;
    el.classList.remove('flip');
    void el.offsetWidth; // restart the animation
    el.classList.add('flip');
  }

  function tick() {
    const diff = OPENING - Date.now();
    if (diff <= 0) {
      clearInterval(countdownTimer);
      board.classList.add('is-live');
      $('.scoreboard-title', board).textContent = 'Play ball! The 2027 season is underway.';
      return;
    }
    const s = Math.floor(diff / 1000);
    setTile(units.days, String(Math.floor(s / 86400)));
    setTile(units.hours, String(Math.floor(s / 3600) % 24).padStart(2, '0'));
    setTile(units.minutes, String(Math.floor(s / 60) % 60).padStart(2, '0'));
    setTile(units.seconds, String(s % 60).padStart(2, '0'));
  }

  function startCountdown() {
    tick();
    clearInterval(countdownTimer);
    countdownTimer = setInterval(tick, 1000);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(countdownTimer);
    else startCountdown();
  });
  startCountdown();

  /* ---------- Age-group filter ---------- */
  const chips = $$('#ageChips .chip');
  const tickets = $$('#tickets .ticket-wrap');
  const status = $('#filterStatus');

  function applyFilter(age) {
    let count = 0;
    for (const t of tickets) {
      const match = age === 'all' || (age >= +t.dataset.min && age <= +t.dataset.max);
      t.classList.toggle('is-dim', !match);
      if (match) count++;
    }
    const noun = count === 1 ? 'tournament' : 'tournaments';
    status.textContent = age === 'all'
      ? `Showing all ${tickets.length} tournaments`
      : `${count} ${noun} for ${age}U`;
  }
  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => {
      const on = c === chip;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-pressed', String(on));
    });
    const age = chip.dataset.age;
    applyFilter(age === 'all' ? 'all' : Number(age));
  }));

  /* ---------- Tournament details dialog ---------- */
  const TOURNAMENTS = [
    { name: 'Memorial Day Weekend', month: 'May 2027', ages: '9U–14U' },
    { name: 'June Weekend 1', month: 'June 2027', ages: '10U–12U' },
    { name: 'June Weekend 2', month: 'June 2027', ages: '13U–14U' },
    { name: 'July Weekend 1', month: 'July 2027', ages: '8U–11U' },
    { name: 'July Weekend 2', month: 'July 2027', ages: '12U–14U' },
  ];
  const dialog = $('#tDialog');
  let lastTrigger = null;

  if (dialog && typeof dialog.showModal === 'function') {
    $$('.ticket-more').forEach(link => link.addEventListener('click', e => {
      const t = TOURNAMENTS[Number(link.dataset.tournament)];
      if (!t) return;
      e.preventDefault();
      lastTrigger = link;
      $('#tDialogTitle').textContent = t.name;
      $('#tDialogMonth').textContent = t.month;
      $('#tDialogAges').textContent = t.ages;
      dialog.showModal();
    }));
    $('#tClose').addEventListener('click', () => dialog.close());
    // "Get Notified" jumps to the signup band, so land focus in the email field
    $('#tDialogCta').addEventListener('click', () => { lastTrigger = $('#regEmail'); dialog.close(); });
    // click on the backdrop closes
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      if (lastTrigger) lastTrigger.focus({ preventScroll: true });
    });
  }

  /* ---------- Register form (demo: nothing is sent) ---------- */
  const form = $('#registerForm');
  const note = $('#formNote');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#regEmail');
    if (!input.checkValidity() || !input.value.trim()) {
      note.textContent = 'Please enter a valid email address.';
      note.classList.add('is-error');
      input.focus();
      return;
    }
    note.classList.remove('is-error');
    form.classList.add('is-done');
    note.textContent = "You're on the list. (Sample site: nothing was actually sent.)";
    input.value = '';
  });
})();
