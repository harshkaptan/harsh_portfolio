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
   Counts every page load on the live site, using the free Abacus counter API.
   Local previews only read the number so testing doesn't inflate it. */
(async function () {
  const API = 'https://abacus.jasoncameron.dev';
  const KEY = 'harshkaptan-portfolio/visitors';
  const el = document.getElementById('view-count');
  const isLocal = ['localhost', '127.0.0.1', ''].includes(location.hostname);
  const action = isLocal ? 'get' : 'hit';
  try {
    const res = await fetch(`${API}/${action}/${KEY}`);
    const data = await res.json();
    el.textContent = typeof data.value === 'number' ? data.value.toLocaleString('en-US') : '0';
  } catch (e) {
    el.parentElement.style.display = 'none';
  }
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

/* ---------- Spotify: Blinding Lights ----------
   Spotify's player is heavy and sets third-party cookies, so it is only
   loaded when the visitor first interacts or scrolls near the music card.
   Browsers block audio until an interaction, so the track starts on the
   first click / tap / key press. */
const card = document.getElementById('music-card');
const statusEl = document.getElementById('music-status');
const hint = document.getElementById('music-hint');
let spotify = null, started = false, wantPlay = false, apiRequested = false;

window.onSpotifyIframeApiReady = (IFrameAPI) => {
  IFrameAPI.createController(
    document.getElementById('spotify-embed'),
    { uri: SPOTIFY_TRACK, width: '100%', height: 152 },
    (controller) => {
      spotify = controller;
      const frame = card.querySelector('iframe');
      if (frame) frame.title = 'Spotify player: Blinding Lights by The Weeknd';
      controller.addListener('playback_update', e => {
        const playing = !e.data.isPaused;
        card.classList.toggle('playing', playing);
        statusEl.textContent = playing ? 'Now playing' : 'On repeat';
        if (playing) { started = true; hint.textContent = 'Blinding Lights · The Weeknd'; }
      });
      controller.addListener('ready', () => { if (wantPlay && !started) { controller.play(); started = true; } });
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
new IntersectionObserver((entries, obs) => {
  if (entries.some(e => e.isIntersecting)) { loadSpotify(); obs.disconnect(); }
}, { threshold: 0.5 }).observe(card);

function startMusic(e) {
  if (started) return;
  if (e && e.target.closest && e.target.closest('#spotify-embed')) return; // let the embed handle its own clicks
  if (e && e.type === 'keydown' && e.key && e.key.toLowerCase() === 'm') return; // 'M' is the music shortcut; let it handle play
  ['pointerdown', 'keydown', 'touchstart'].forEach(t => removeEventListener(t, startMusic));
  wantPlay = true;
  if (spotify) { spotify.play(); started = true; } else loadSpotify();
}
['pointerdown', 'keydown', 'touchstart'].forEach(t => addEventListener(t, startMusic, { passive: true }));

function toggleMusic() {
  if (spotify) { spotify.togglePlay(); started = true; }
  else { wantPlay = true; loadSpotify(); }
}


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
    // hide home off-screen (not display:none) so the music iframe keeps playing
    homeMain.classList.toggle('view-off', fav);
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
