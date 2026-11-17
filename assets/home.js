/* ---------- Typed tagline ---------- */
(function () {
  const lines = ['Arguing with LLMs most of the time.'];
  const el = document.getElementById('typed');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = lines[0]; return; }
  let li = 0, ci = 0, del = false;
  (function tick() {
    const s = lines[li];
    el.textContent = s.slice(0, ci);
    if (!del && ci < s.length) { ci++; setTimeout(tick, 55); }
    else if (!del) { del = true; setTimeout(tick, 2600); }
    else if (ci > 0) { ci--; setTimeout(tick, 25); }
    else { del = false; li = (li + 1) % lines.length; setTimeout(tick, 400); }
  })();
})();

/* ---------- View counter ----------
   Counts every page load on the live site with our own counter
   (/api/views on Vercel, stored in Upstash Redis). If that isn't
   available, it falls back to the free Abacus counter API.
   The number shows instantly from the last known count and updates when
   the counter answers. Local previews only read, so testing doesn't count. */
(function () {
  const ABACUS = 'https://abacus.jasoncameron.dev';
  const KEY = 'harshkaptan-portfolio/visitors';
  const el = document.getElementById('view-count');
  if (!el) return;
  const isLocal = ['localhost', '127.0.0.1', ''].includes(location.hostname);
  const show = n => { el.textContent = Number(n).toLocaleString('en-US'); };

  // 1) show something right away: this browser's last count, else the baseline in the HTML
  let cached = null;
  try { cached = parseInt(localStorage.getItem('hk-views'), 10); } catch (e) {}
  show(Math.max(cached || 0, parseInt(el.dataset.fallback, 10) || 0));

  async function getJSON(url, opts = {}, ms = 8000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
      const res = await fetch(url, { ...opts, signal: ctrl.signal, cache: 'no-store' });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      if (typeof data.value !== 'number') throw new Error('bad');
      return data.value;
    } finally { clearTimeout(t); }
  }

  // 2) our own counter first, then the old free one as a backup
  (async () => {
    let value = null;
    try { value = await getJSON('/api/views', { method: isLocal ? 'GET' : 'POST' }); }
    catch (e) {
      const action = isLocal ? 'get' : 'hit';
      try { value = await getJSON(`${ABACUS}/${action}/${KEY}`, {}, 25000); }
      catch (e2) { try { value = await getJSON(`${ABACUS}/get/${KEY}`, {}, 25000); } catch (e3) {} }
    }
    if (value == null) return;               // keep the instant number on screen
    show(value);
    try { localStorage.setItem('hk-views', String(value)); } catch (e) {}
  })();
})();

/* ---------- Pixel cat ----------
   Hand-drawn 22×14 pixel sprite. Sleeps with floating "zzz";
   click (or Enter) to wake it for a moment. */
(function () {
  const SPRITE = [
    '..K......K............',
    '.KPK....KPK...........',
    '.KPWK..KWPK...........',
    '.KWWWKKWWWK...KKKKK...',
    'KWWWWWWWWWWK.KWWWWWKK.',
    'KWWWWWWWWWWWKWWWWWWWWK',
    'KWEEWWWWEEWWWWWWWWWWWK',
    'KWWWWWNWWWWWWWWWWWGGWK',
    '.KWWWWWWWWWKWWWWWGGWWK',
    '..KBBBOBBBKWWWWWWWWWWK',
    '..KWWWWWWWWWWWWWWWWWWK',
    '.KWWWWKKWWWWWWWWWWWKK.',
    '.KGGGGGGGKWWWWWWWKK...',
    '..KKKKKKKKKKKKKKK.....',
  ];
  const COLORS = { K: 'var(--cat-line)', W: '#f5f5f4', G: '#d6d3d1', P: '#f9a8b8', B: '#7c4a2d', O: '#f59e0b', N: '#f472b6', E: '#3f3f46' };
  const svg = document.getElementById('cat-svg');
  const cat = document.getElementById('cat');
  function draw(awake) {
    let out = '';
    SPRITE.forEach((row, y) => [...row].forEach((c, x) => {
      if (c === '.') return;
      let fill = COLORS[c];
      if (c === 'E') {
        // closed eyes = a flat line; open eyes = a dark pixel one row up
        if (awake) { fill = COLORS.W; }
      }
      out += `<rect x="${x}" y="${y}" width="1" height="1" fill="${fill}"/>`;
    }));
    if (awake) out += '<rect x="2" y="5" width="1" height="2" fill="#3f3f46"/><rect x="9" y="5" width="1" height="2" fill="#3f3f46"/>';
    svg.innerHTML = out;
  }
  draw(false);
  const bubble = document.createElement('span'); bubble.className = 'bubble'; bubble.textContent = '!'; bubble.setAttribute('aria-hidden', 'true'); cat.appendChild(bubble);
  let t = null;
  function wake() {
    cat.classList.remove('awake'); void cat.offsetWidth;
    cat.classList.add('awake'); draw(true);
    clearTimeout(t);
    t = setTimeout(() => { cat.classList.remove('awake'); draw(false); }, 1800);
  }
  cat.addEventListener('click', wake);
  cat.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); wake(); } });
})();

/* ---------- Scroll reveal ---------- */
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
}), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ---------- Spotify: Blinding Lights (Dynamic Island) ----------
   The real Spotify player is loaded invisibly behind a Dynamic Island style
   card; the island shows the artwork, waveform, progress and controls and
   drives the player through Spotify's IFrame API.
   It tries to start playing (from 0:07) the moment the page loads. Browsers
   decide whether sound may play before the visitor interacts: where they
   allow it, it just plays; otherwise the first click / tap / key starts it. */
const card = document.getElementById('music-card');
const island = document.getElementById('island');
const hint = document.getElementById('music-hint');
const els = { cur: document.getElementById('isl-cur'), left: document.getElementById('isl-left'), fill: document.getElementById('isl-fill'), bar: island.querySelector('.isl-bar') };
let spotify = null, started = false, wantPlay = true, apiRequested = false;
const START_AT = 7;        // seconds: skip the intro on the first play
let introSkipped = false;
const EVENTS = ['pointerdown', 'pointerup', 'click', 'keydown', 'touchend'];
const track = { pos: START_AT * 1000, dur: 200000, playing: false, at: performance.now() };

const fmt = ms => { const t = Math.max(0, Math.round(ms / 1000)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };
function paintProgress() {
  const pos = Math.min(track.dur, track.pos + (track.playing ? performance.now() - track.at : 0));
  els.cur.textContent = fmt(pos);
  els.left.textContent = '-' + fmt(track.dur - pos);
  els.fill.style.width = (track.dur ? (pos / track.dur) * 100 : 0) + '%';
}
(function tick() { if (track.playing) paintProgress(); requestAnimationFrame(tick); })();

function setPlaying(playing) {
  track.playing = playing;
  island.classList.toggle('is-playing', playing);
  island.classList.toggle('is-compact', !playing && !started);
  island.querySelector('#isl-play').setAttribute('aria-label', playing ? 'Pause' : 'Play');
}

window.onSpotifyIframeApiReady = (IFrameAPI) => {
  IFrameAPI.createController(
    document.getElementById('spotify-embed'),
    { uri: SPOTIFY_TRACK, width: '100%', height: 152 },
    (controller) => {
      spotify = controller;
      const frame = card.querySelector('iframe');
      if (frame) { frame.title = 'Spotify player: Blinding Lights by The Weeknd'; frame.tabIndex = -1; }
      controller.addListener('playback_update', e => {
        const playing = !e.data.isPaused;
        // first time the song plays, jump to 0:07 (only once, so replays/seeks are left alone)
        if (playing && !introSkipped) {
          introSkipped = true;
          if (e.data.position < (START_AT - 1) * 1000) controller.seek(START_AT);
        }
        track.pos = e.data.position; track.at = performance.now();
        if (e.data.duration) track.dur = e.data.duration;
        if (playing && !started) {
          started = true;
          if (hint) hint.textContent = '';
          EVENTS.forEach(t => removeEventListener(t, startMusic, true));
        }
        setPlaying(playing);
        paintProgress();
      });
      // autoplay: only try when this browser allows sound without a click.
      // (A blocked play() leaves Spotify's player stuck, so we check first
      // with a tiny silent clip; otherwise the first click starts it.)
      controller.addListener('ready', () => {
        if (!wantPlay || started) return;
        if (interacted) { controller.play(); return; }
        const probe = new Audio('/assets/silence.wav');
        const ok = probe.play();
        if (ok && ok.then) ok.then(() => { probe.pause(); if (!started) controller.play(); }).catch(() => {});
      });
    }
  );
};

function loadSpotify() {
  if (apiRequested) return;
  apiRequested = true;
  const s = document.createElement('script');
  s.src = 'https://open.spotify.com/embed/iframe-api/v1';
  s.async = true;
  document.head.appendChild(s);
}
// When to load Spotify's (heavy) player:
//  - straight away if this browser allows sound without a click (true autoplay);
//  - otherwise on the visitor's first interaction, or once the page has been idle
//    for a few seconds, so it never slows down the first paint.
let interacted = false;
(function scheduleSpotify() {
  const probe = new Audio('/assets/silence.wav');
  const ok = probe.play();
  const later = () => setTimeout(() => (window.requestIdleCallback || setTimeout)(loadSpotify), 6000);
  if (ok && ok.then) ok.then(() => { probe.pause(); loadSpotify(); }).catch(later);
  else later();
})();

// fallback: if the browser blocked autoplay, the first interaction starts it
function startMusic(e) {
  if (started) return;
  if (e && e.target.closest && e.target.closest('#island')) return;     // the island handles its own taps
  if (e && e.type === 'keydown' && e.key && e.key.toLowerCase() === 'm') return; // 'M' is the music shortcut
  interacted = true;
  if (spotify) spotify.play();               // inside the click itself = allowed to play sound
  else loadSpotify();                        // plays as soon as it's ready
}
EVENTS.forEach(t => addEventListener(t, startMusic, { capture: true, passive: true }));

function toggleMusic() {
  interacted = true;
  if (!spotify) { wantPlay = true; loadSpotify(); return; }
  if (!started) spotify.play(); else spotify.togglePlay();
}

// island controls
island.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) { if (island.classList.contains('is-compact')) toggleMusic(); return; }
  if (btn.id === 'isl-play') toggleMusic();
  else if (spotify && (btn.id === 'isl-back' || btn.id === 'isl-fwd')) {
    const now = track.pos + (track.playing ? performance.now() - track.at : 0);
    const to = Math.max(0, Math.min(track.dur - 1000, now + (btn.id === 'isl-fwd' ? 10000 : -10000)));
    spotify.seek(to / 1000); track.pos = to; track.at = performance.now(); paintProgress();
  }
});
els.bar.addEventListener('click', e => {
  if (!spotify) return;
  const r = els.bar.getBoundingClientRect();
  const to = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * track.dur;
  spotify.seek(to / 1000); track.pos = to; track.at = performance.now(); paintProgress();
});
paintProgress();


/* ---------- Terminal traffic lights (macOS style) ----------
   Red / yellow fold the terminal away (click again to reopen), green zooms it. */
(function () {
  const term = document.querySelector('.terminal');
  if (!term) return;
  term.querySelector('.lights').addEventListener('click', e => {
    const btn = e.target.closest('.light'); if (!btn) return;
    if (btn.dataset.act === 'max') { term.classList.remove('is-min'); term.classList.toggle('is-max'); }
    else { term.classList.remove('is-max'); term.classList.toggle('is-min'); }
  });
})();

/* ---------- Router: one page, clean URLs ----------
   Everything (home sections + Favourites) lives in this one page, so the
   browser never reloads and the Spotify player never restarts.
   Addresses look like /about, /work, /favourites (no .html, no #). */
(function () {
  const homeMain = document.getElementById('home');
  const favMain = document.getElementById('fav-view');
  if (!homeMain || !favMain) return;
  const ROUTES = {
    '/': null, '/about': 'about', '/stack': 'stack', '/work': 'experience', '/projects': 'projects',
    '/achievements': 'achievements', '/education': 'education', '/contact': 'contact', '/favourites': 'FAV',
  };
  const ID_TO_PATH = Object.fromEntries(Object.entries(ROUTES).filter(([, id]) => id && id !== 'FAV').map(([p, id]) => [id, p]));
  const TITLES = { home: 'Harsh Kaptan', fav: 'Favourites · Harsh Kaptan' };
  const norm = p => { p = p.replace(/\/index(\.html)?$/, '/').replace(/\.html$/, '').replace(/(.)\/$/, '$1'); return p in ROUTES ? p : null; };

  function render(path, smooth) {
    const target = ROUTES[path];
    const fav = target === 'FAV';
    // keep the music card on screen as a mini player so the song never stops
    homeMain.classList.toggle('fav-mode', fav);
    favMain.hidden = !fav;
    document.title = fav ? TITLES.fav : TITLES.home;
    document.querySelectorAll('.nav-links a[data-route]').forEach(a => a.classList.toggle('active', a.getAttribute('href') === path && path !== '/'));
    if (fav) { scrollTo(0, 0); return; }
    const el = target && document.getElementById(target);
    if (el) {
      el.classList.add('in'); // make sure scroll-reveal sections are visible
      requestAnimationFrame(() => el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' }));
    } else scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
  }

  function navigate(path, smooth = true) {
    path = norm(path) || '/';
    if (location.pathname !== path) history.pushState({}, '', path);
    render(path, smooth);
  }
  window.__navigate = navigate;
  window.__navigateToId = id => navigate(ID_TO_PATH[id] || '/');

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    const path = norm(url.pathname);
    if (path === null) return;
    e.preventDefault();
    navigate(path);
  });
  addEventListener('popstate', () => render(norm(location.pathname) || '/', false));

  // first load: honour the URL (and tidy up old #hash / .html links)
  let start = norm(location.pathname) || '/';
  const legacy = location.hash && ID_TO_PATH[location.hash.slice(1)];
  if (start === '/' && legacy) start = legacy;
  if (location.pathname !== start || location.hash) history.replaceState({}, '', start);
  if (start !== '/') render(start, false);
})();

/* ---------- Banner video ----------
   Plays muted on loop. Paused when scrolled out of view (saves battery)
   and for visitors who prefer reduced motion (the poster frame shows). */
(function () {
  const v = document.querySelector('.banner-video');
  if (!v) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { v.removeAttribute('autoplay'); v.pause(); return; }
  const play = () => { const p = v.play(); if (p) p.catch(() => {}); };
  new IntersectionObserver(([e]) => (e.isIntersecting ? play() : v.pause())).observe(v);
})();

/* ---------- Profile photo switch ----------
   The avatar softly crossfades between the illustration and the real
   photo every 30 seconds. Clicking it (or pressing P) switches straight
   away and restarts the 30-second timer. Pauses while the tab is hidden. */
(function () {
  const card = document.getElementById('avatar-flip');
  if (!card) return;
  const EVERY = 30000;
  let timer = null;
  function swap() {
    const real = !card.classList.contains('flipped');
    card.classList.toggle('flipped', real);
    card.setAttribute('aria-pressed', String(real));
    card.setAttribute('aria-label', real ? 'Switch to the illustration' : 'Switch to my real photo');
  }
  function restart() { clearInterval(timer); timer = setInterval(() => { if (!document.hidden) swap(); }, EVERY); }
  function manual() { swap(); restart(); }
  card.addEventListener('click', manual);
  window.__flipAvatar = manual;
  restart();
})();

/* ---------- Visitor's local time ----------
   Shows the viewer's own city and current time, with a little sky arc:
   the sun travels across it from 6am to 6pm, the moon from 6pm to 6am.
   City comes from /api/geo (Vercel's IP-based location); if that isn't
   available, it's guessed from the browser's time zone. */
(function () {
  const placeEl = document.getElementById('lt-place');
  const timeEl = document.getElementById('lt-time');
  const body = document.getElementById('lt-body');
  if (!placeEl || !timeEl || !body) return;
  const fmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });

  function tick() {
    const now = new Date();
    timeEl.textContent = fmt.format(now).replace(/\s?([AP])\.?M\.?/i, (m, a) => a.toLowerCase() + 'm').replace(/\s/g, '');
    timeEl.dateTime = now.toISOString();
    const h = now.getHours() + now.getMinutes() / 60;
    const day = h >= 6 && h < 18;
    const p = day ? (h - 6) / 12 : ((h - 18 + 24) % 24) / 12;      // 0 → 1 across the arc
    const a = Math.PI * (1 - p);
    const x = (15 + 11 * Math.cos(a)).toFixed(2), y = (14 - 11 * Math.sin(a)).toFixed(2);
    body.innerHTML = day
      ? `<circle class="lt-sun" cx="${x}" cy="${y}" r="2.8"/>`
      : `<circle class="lt-moon" cx="${x}" cy="${y}" r="2.8"/><circle class="lt-moon-cut" cx="${(+x + 1.4).toFixed(2)}" cy="${(+y - 1).toFixed(2)}" r="2.4"/>`;
    if (window.__ltAvail) window.__ltAvail(now);
  }
  tick();
  setTimeout(function again() { tick(); setTimeout(again, 60000 - (Date.now() % 60000) + 50); }, 60000 - (Date.now() % 60000) + 50);

  // place: guess from time zone first (instant), then refine with the real city
  const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').split('/').pop().replace(/_/g, ' ');
  const tzCity = ({ Calcutta: 'Kolkata', Saigon: 'Ho Chi Minh City', Kiev: 'Kyiv' })[tz] || tz;
  if (tzCity) placeEl.textContent = tzCity;
  const countryName = code => { try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(code); } catch (e) { return code; } };
  fetch('/api/geo', { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)).then(g => {
    if (!g || (!g.city && !g.country)) return;
    placeEl.textContent = [g.city, g.country && countryName(g.country)].filter(Boolean).join(', ');
  }).catch(() => {});
})();

/* ---------- Availability card on the time pill (after xevrion.dev) ----------
   Hover (or tap) the pill and it grows into a card saying whether I'm free
   to talk right now, based on my calling hours in India time, converted to
   the visitor's own time. */
(function () {
  const wrap = document.getElementById('lt-wrap');
  const card = document.getElementById('lt-card');
  const pill = document.getElementById('localtime');
  const statusEl = document.getElementById('lt-status');
  const noteEl = document.getElementById('lt-note');
  if (!wrap || !card || !pill) return;

  // ---- my calling hours (24h clock, India time) ----
  // Mon–Fri evenings, Sat–Sun all day. 24 = midnight.
  const MY_TZ = 'Asia/Kolkata';
  const WEEKDAY = [19, 24], WEEKEND = [7, 24];
  const hoursFor = dow => (dow === 0 || dow === 6 ? WEEKEND : WEEKDAY);   // 0 = Sunday

  const parts = (tz, d) => new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short' }).formatToParts(d);
  const minutesIn = (tz, d) => { const p = parts(tz, d); const v = t => Number(p.find(x => x.type === t).value); return (v('hour') % 24) * 60 + v('minute'); };
  const dayIn = (tz, d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts(tz, d).find(x => x.type === 'weekday').value);
  const short = d => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', hour12: true }).format(d)
    .replace(/:00/, '').replace(/\s?([AP])\.?M\.?/i, (m, a) => a.toLowerCase() + 'm').replace(/\s/g, '');
  const label = h => (h % 24 === 0 ? 'midnight' : (h % 12 || 12) + (h < 12 ? 'am' : 'pm'));

  window.__ltAvail = now => {
    const mine = minutesIn(MY_TZ, now), dow = dayIn(MY_TZ, now);
    const [f, t] = hoursFor(dow);
    let text = 'Free to talk right now';
    if (!(mine >= f * 60 && mine < t * 60)) {
      // minutes until the next window opens (today or a later day)
      let wait = Infinity;
      for (let d = 0; d < 8 && wait === Infinity; d++) {
        const start = d * 1440 + hoursFor((dow + d) % 7)[0] * 60 - mine;
        if (start > 0) wait = start;
      }
      const h = Math.floor(wait / 60), m = wait % 60;
      text = `Free for calls in ${h ? h + 'h' : ''}${h && m ? ' ' : ''}${m ? m + 'm' : ''}`;
    }
    statusEl.textContent = text;

    let note = `Weekdays ${label(WEEKDAY[0])} to ${label(WEEKDAY[1])}, weekends ${label(WEEKEND[0])} to ${label(WEEKEND[1])}, India time.`;
    const visitorTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (minutesIn(visitorTz, now) !== mine) {
      // the moment it's hh:00 in India today, shown on the visitor's own clock
      const inst = hh => new Date(now.getTime() - mine * 60000 - now.getSeconds() * 1000 + hh * 3600000);
      // "next day" when the window runs past midnight on the visitor's clock
      const span = ([f, t]) => {
        const a = inst(f), b = inst(t), crosses = minutesIn(visitorTz, b) <= minutesIn(visitorTz, a) && minutesIn(visitorTz, b) !== 0;
        return `${short(a)}–${short(b)}${crosses ? ' next day' : ''}`;
      };
      note += ` For you: ${span(WEEKDAY)} on weekdays, ${span(WEEKEND)} at weekends.`;
    }
    noteEl.textContent = note + ' Booking a slot reaches me fastest.';
  };
  window.__ltAvail(new Date());

  // ---- grow / shrink ----
  let open = false, closeT = null;
  function measure() {
    const pw = pill.offsetWidth + 2, ph = pill.offsetHeight + 2;
    wrap.style.setProperty('--pill-w', pw + 'px');
    if (!open) {
      card.style.setProperty('--r', Math.max(0, card.offsetWidth - pw) + 'px');
      card.style.setProperty('--b', Math.max(0, card.offsetHeight - ph) + 'px');
    }
  }
  function setOpen(v) {
    open = v;
    wrap.classList.toggle('open', v);
    pill.setAttribute('aria-expanded', String(v));
    if (v) {
      // keep the card on screen on narrow phones
      const r = wrap.getBoundingClientRect(), over = r.left + card.offsetWidth - (innerWidth - 16);
      card.style.setProperty('--shift', over > 0 ? -over + 'px' : '0px');
      card.style.setProperty('--r', '0px'); card.style.setProperty('--b', '0px');
    } else { card.style.setProperty('--shift', '0px'); measure(); }
  }
  new ResizeObserver(measure).observe(pill);
  addEventListener('resize', measure);
  measure();

  wrap.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { clearTimeout(closeT); setOpen(true); } });
  wrap.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { clearTimeout(closeT); closeT = setTimeout(() => setOpen(false), 120); } });
  pill.addEventListener('click', e => { if (e.pointerType !== 'mouse') setOpen(!open); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) setOpen(false); });
  document.addEventListener('pointerdown', e => { if (open && !wrap.contains(e.target)) setOpen(false); });
  wrap.addEventListener('focusout', e => { if (!wrap.contains(e.relatedTarget)) setOpen(false); });
  // keyboard: Tab to the pill, then Enter/Space opens it (a click with no pointer type)
})();
