/* ======================================================
   CONFIG — Cal.com booking page (30-min call on Google Meet).
   ====================================================== */
const CALENDAR_URL = 'https://cal.com/harsh-kaptan-vn7q9v/secret';
const EMAIL = 'harshkaptan@gmail.com';
const SPOTIFY_TRACK = 'spotify:track:0VjIjW4GlUZAMYd2vXMi3b'; // Blinding Lights — The Weeknd

/* ---------- Theme toggle ---------- */
document.querySelectorAll('.theme-toggle').forEach(btn => btn.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
}));

/* ---------- Booking ---------- */
const modal = document.getElementById('booking-modal');
if (modal) {
const frame = document.getElementById('booking-frame');
document.querySelectorAll('.book-call').forEach(b => b.addEventListener('click', () => {
  if (!CALENDAR_URL) {
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Booking a 30-min call')}&body=${encodeURIComponent('Hi Harsh,\n\nI would like to book a 30-minute Google Meet call. Here are a few times that work for me:\n\n')}`;
    return;
  }
  if (!frame.src) frame.src = CALENDAR_URL + (CALENDAR_URL.includes('?') ? '&' : '?') + 'embed=true&theme=' + document.documentElement.getAttribute('data-theme');
  modal.classList.add('open');
}));
function closeModal() { modal.classList.remove('open'); }
document.getElementById('close-modal').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

/* ---------- Click sound ----------
   A short, soft "tick" (like a trackpad click) synthesised with Web Audio,
   played whenever a link or button is pressed. No audio file needed. */
(function () {
  let ctx = null;
  function tick() {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      const t = ctx.currentTime;
      // body of the click: a quick high sine that drops in pitch
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, t);
      osc.frequency.exponentialRampToValueAtTime(900, t + 0.04);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.07);
      // crisp transient: a few ms of filtered noise
      const len = Math.floor(ctx.sampleRate * 0.012);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
      const noise = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), ng = ctx.createGain();
      noise.buffer = buf; hp.type = 'highpass'; hp.frequency.value = 3000; ng.gain.value = 0.25;
      noise.connect(hp).connect(ng).connect(ctx.destination);
      noise.start(t);
    } catch (e) {}
  }
  document.addEventListener('pointerdown', e => {
    if (e.button === 0 && e.target.closest('a, button')) tick();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.activeElement && document.activeElement.matches('a, button')) tick();
  });
})();

/* ---------- Hover tooltips ----------
   Anything with data-tip gets a small label under it on hover.
   Chips, tags, icons and logos get their label automatically. */
(function () {
  const auto = [
    ['.chip, .tag', el => el.textContent.trim()],
    ['.icon-btn, .dock a, .dock button, .exp-logo, .hero-socials a', el => el.getAttribute('data-tip') || el.getAttribute('aria-label')],
    ['.exp-link', () => 'Visit website'],
    ['.project', el => /github\.com/.test(el.href) ? 'View on GitHub' : 'Open live demo'],
    ['.book-call', () => 'Pick a time on my calendar'],
    ['a[href^="mailto:"]', () => 'harshkaptan@gmail.com'],
    ['.verified', () => 'Verified'],
    ['.views', () => 'Page views'],
  ];
  auto.forEach(([sel, fn]) => document.querySelectorAll(sel).forEach(el => {
    if (el.hasAttribute('data-tip')) return;
    const t = fn(el); if (t) el.setAttribute('data-tip', t);
  }));
  document.querySelectorAll('[data-tip][title]').forEach(el => el.removeAttribute('title'));

  const tip = document.createElement('div');
  tip.className = 'tip'; tip.setAttribute('aria-hidden', 'true');
  document.body.appendChild(tip);
  let current = null;

  function show(el) {
    current = el;
    tip.textContent = el.getAttribute('data-tip');
    tip.classList.toggle('mac', !!el.closest('.dock'));
    place(el);
    requestAnimationFrame(() => tip.classList.add('show'));
  }
  function place(el) {
    const r = el.getBoundingClientRect();
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    const above = r.bottom + th + 12 > innerHeight || !!el.closest('.dock');
    const gap = el.closest('.dock') ? 12 : 8;
    let left = r.left + r.width / 2 - tw / 2;
    left = Math.max(8, Math.min(left, innerWidth - tw - 8));
    tip.style.left = left + 'px';
    tip.style.top = (above ? r.top - th - gap : r.bottom + gap) + 'px';
    tip.classList.toggle('above', above);
  }
  // the dock magnifies icons, so keep its label glued to the growing icon
  window.__placeTip = () => { if (current && current.closest('.dock')) place(current); };
  function hide() { current = null; tip.classList.remove('show'); }

  document.addEventListener('pointerover', e => {
    if (e.pointerType === 'touch') return;
    const el = e.target.closest('[data-tip]');
    if (el && el !== current) show(el);
    else if (!el && current) hide();
  });
  document.addEventListener('pointerleave', hide);
  addEventListener('scroll', hide, { passive: true });
  document.addEventListener('pointerdown', hide);
})();
/* ---------- Command palette (⌘K / Ctrl+K) ---------- */
(function () {
  const root = document.getElementById('cmdk');
  const input = document.getElementById('cmdk-q');
  const list = document.getElementById('cmdk-list');
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  if (!isMac) document.querySelectorAll('.mod-key').forEach(k => { k.textContent = 'Ctrl'; });
  const openBtn = document.getElementById('cmdk-open');
  if (!isMac) openBtn.setAttribute('data-tip', 'Search (Ctrl K)');

  const svg = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const brand = file => `<span class="brand" style="--m:url('${new URL('/assets/icons/' + file, location.href).href}')"></span>`;
  const I = {
    home: svg('<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
    user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    layers: svg('<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 12 10 5 10-5M2 17l10 5 10-5"/>'),
    brief: svg('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
    box: svg('<path d="m21 8-9-5-9 5v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>'),
    trophy: svg('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>'),
    cap: svg('<path d="M22 10 12 5 2 10l10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>'),
    mail: svg('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>'),
    cal: svg('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
    link: svg('<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>'),
    file: svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>'),
    sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    up: svg('<path d="M12 19V5M5 12l7-7 7 7"/>'),
    music: svg('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'),
    cat: svg('<path d="M4 20V8l3-4 3 4h4l3-4 3 4v12z"/><path d="M9 13h.01M15 13h.01"/>'),
    search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    film: svg('<rect x="2" y="3" width="20" height="18" rx="2"/><path d="M7 3v18M17 3v18M2 8h5M2 13h5M2 18h5M17 8h5M17 13h5M17 18h5"/>'),
  };

  const onHome = !!document.getElementById('about');
  // the router (home.js) handles clean URLs without reloading the page
  const go = id => () => window.__navigateToId ? window.__navigateToId(id) : document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const top = () => window.__navigate ? window.__navigate('/') : scrollTo({ top: 0, behavior: 'smooth' });
  const open = url => () => window.open(url, '_blank', 'noopener');
  const prompt = () => `Summarize Harsh Kaptan's portfolio at ${location.origin + location.pathname}: work, skills, projects and experience.`;
  const kbd = keys => keys.map(k => `<kbd class="kbd">${k}</kbd>`).join('');

  const groups = [
    { name: 'Ask AI', items: [
      { label: 'Open in ChatGPT', icon: brand('openai.svg'), run: () => open('https://chatgpt.com/?q=' + encodeURIComponent(prompt()))() },
      { label: 'Open in Claude', icon: brand('claude.svg'), run: () => open('https://claude.ai/new?q=' + encodeURIComponent(prompt()))() },
      { label: 'Open in Perplexity', icon: brand('perplexity.svg'), run: () => open('https://www.perplexity.ai/search?q=' + encodeURIComponent(prompt()))() },
      { label: 'Open in Markdown', icon: I.file, run: open('/harsh-kaptan.md') },
    ]},
    { name: 'Navigation', items: [
      { label: 'Home', icon: I.home, run: top },
      { label: 'About', icon: I.user, run: go('about') },
      { label: 'Tech Stack', icon: I.layers, run: go('stack'), kw: 'skills python react' },
      { label: 'Experience', icon: I.brief, run: go('experience'), kw: 'work weam coinveda' },
      { label: 'Projects', icon: I.box, run: go('projects'), kw: 'shipped previously selected work spendly nft pdf' },
      { label: 'Achievements', icon: I.trophy, run: go('achievements'), kw: 'hackathon' },
      { label: 'Education', icon: I.cap, run: go('education'), kw: 'parul university' },
      { label: 'Contact', icon: I.mail, run: go('contact') },
      { label: 'Favourites', icon: I.film, run: () => window.__navigate ? window.__navigate('/favourites') : (location.href = '/favourites'), kw: 'movies series anime spider-man suits breaking bad one piece' },
    ]},
    { name: 'Connect', items: [
      { label: 'Book a 30-min call', icon: I.cal, run: () => { const b = document.querySelector('.book-call'); b ? b.click() : window.open(CALENDAR_URL, '_blank', 'noopener'); }, kw: 'meet calendar cal' },
      { label: 'Email me', icon: I.mail, run: () => { location.href = 'mailto:harshkaptan@gmail.com'; } },
      { label: 'LinkedIn', icon: I.link, run: open('https://www.linkedin.com/in/harsh-kaptan-ab0a1a253') },
      { label: 'X (Twitter)', icon: I.link, run: open('https://x.com/harshkaptan') },
      { label: 'GitHub', icon: I.link, run: open('https://github.com/harshkaptan') },
      { label: 'Instagram', icon: I.link, run: open('https://www.instagram.com/harsh_kaptan_06') },
    ]},
    { name: 'Feature', items: [
      { label: 'Toggle theme', icon: I.sun, keys: ['D'], run: () => document.querySelector('.theme-toggle').click(), kw: 'dark light mode' },
      ...(onHome ? [
        { label: 'Play / pause music', icon: I.music, keys: ['M'], run: () => toggleMusic(), kw: 'spotify blinding lights' },
        { label: 'Wake the cat', icon: I.cat, run: () => { top(); setTimeout(() => { const c = document.getElementById('cat'); c.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => c.click(), 600); }, 50); } },
      ] : []),
      { label: 'Scroll to top', icon: I.up, keys: ['Shift', '↑'], run: () => scrollTo({ top: 0, behavior: 'smooth' }) },
      { label: 'Close command palette', icon: I.search, run: () => {} },
    ]},
  ];

  let flat = [], sel = 0;

  function render() {
    const q = input.value.trim().toLowerCase();
    flat = []; let html = '';
    groups.forEach(g => {
      const items = g.items.filter(it => !q || (it.label + ' ' + (it.kw || '') + ' ' + g.name).toLowerCase().includes(q));
      if (!items.length) return;
      html += `<div class="cmdk-group" role="presentation">${g.name}</div>`;
      items.forEach(it => {
        const i = flat.push(it) - 1;
        html += `<button class="cmdk-item" role="option" id="cmdk-${i}" data-i="${i}" aria-selected="${i === sel}" tabindex="-1">
          <span class="ico">${it.icon}</span><span class="label">${it.label}</span>${it.keys ? `<span class="keys">${kbd(it.keys)}</span>` : ''}</button>`;
      });
    });
    list.innerHTML = html || '<div class="cmdk-empty">No results found.</div>';
    if (sel >= flat.length) sel = 0;
    highlight();
  }
  function highlight() {
    list.querySelectorAll('.cmdk-item').forEach(b => b.setAttribute('aria-selected', String(+b.dataset.i === sel)));
    const cur = document.getElementById('cmdk-' + sel);
    if (cur) { cur.scrollIntoView({ block: 'nearest' }); input.setAttribute('aria-activedescendant', cur.id); }
  }
  function show() {
    if (!root.hidden) return;
    root.hidden = false; document.body.classList.add('cmdk-lock');
    input.value = ''; sel = 0; render();
    setTimeout(() => input.focus(), 0);
  }
  function hide() {
    root.hidden = true; document.body.classList.remove('cmdk-lock');
    openBtn.focus({ preventScroll: true });
  }
  function run(i) { const it = flat[i]; if (!it) return; hide(); it.run(); }

  openBtn.addEventListener('click', show);
  document.getElementById('cmdk-close').addEventListener('click', hide);
  root.addEventListener('click', e => { if (e.target === root) hide(); });
  input.addEventListener('input', () => { sel = 0; render(); });
  list.addEventListener('click', e => { const b = e.target.closest('.cmdk-item'); if (b) run(+b.dataset.i); });
  list.addEventListener('pointermove', e => {
    const b = e.target.closest('.cmdk-item'); if (b && +b.dataset.i !== sel) { sel = +b.dataset.i; highlight(); }
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(flat.length, 1); highlight(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + flat.length) % Math.max(flat.length, 1); highlight(); }
    else if (e.key === 'Enter') { e.preventDefault(); run(sel); }
  });

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); root.hidden ? show() : hide(); return; }
    if (!root.hidden) { if (e.key === 'Escape') { e.preventDefault(); hide(); } return; }
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '/') { e.preventDefault(); show(); }
    else if (e.key.toLowerCase() === 'd' && !e.shiftKey) document.querySelector('.theme-toggle').click();
    else if (e.key.toLowerCase() === 'm' && !e.shiftKey && typeof toggleMusic === 'function') toggleMusic();
    else if (e.key === 'ArrowUp' && e.shiftKey) { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); }
  });
})();

/* ---------- macOS dock magnification ----------
   Icons near the cursor grow (and push neighbours apart) like the Mac dock. */
(function () {
  const dock = document.querySelector('.dock');
  if (!dock || matchMedia('(hover: none)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const items = [...dock.querySelectorAll('a, button')];
  const RANGE = 130, GROW = 0.75; // influence radius in px, max extra size (75%)
  let x = null, raf = 0;
  function frame() {
    raf = 0;
    const base = parseFloat(getComputedStyle(items[0]).getPropertyValue('--s')) || 40;
    items.forEach(it => {
      if (x === null) { it.style.width = it.style.height = ''; return; }
      const r = it.getBoundingClientRect();
      const d = Math.abs(x - (r.left + r.width / 2));
      const k = d < RANGE ? Math.cos((d / RANGE) * Math.PI / 2) : 0;
      const size = base * (1 + GROW * k * k);
      it.style.width = it.style.height = size.toFixed(1) + 'px';
    });
    if (window.__placeTip) window.__placeTip();
    if (x !== null) setTimeout(() => window.__placeTip && window.__placeTip(), 150);
  }
  dock.addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; x = e.clientX; if (!raf) raf = requestAnimationFrame(frame); });
  dock.addEventListener('pointerleave', () => { x = null; if (!raf) raf = requestAnimationFrame(frame); });
})();
