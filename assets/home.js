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

/* ---------- Favourites without a page reload ----------
   A normal link to favourites.html would reload the page and cut the music.
   On the home page we load Favourites in place instead: fetch it, show its
   content, and hide (not remove) the home content so the Spotify player
   keeps playing. The address bar and back button still behave normally. */
(function () {
  const homeMain = document.querySelector('main#home');
  if (!homeMain) return;
  const live = !['localhost', '127.0.0.1', ''].includes(location.hostname);
  const FAV_URL = live ? '/favourites' : 'favourites.html';
  const HOME_URL = live ? '/' : 'index.html';
  const homeTitle = document.title;
  const favLink = document.querySelector('.nav-links a[href$="favourites.html"]');
  let favMain = null, favTitle = 'Favourites · Harsh Kaptan', homeScroll = 0, loading = null;

  const favShown = () => !!favMain && document.contains(favMain);
  const isFavPath = p => /\/favourites(\.html)?$/.test(p);
  const isHomePath = p => /\/(index\.html)?$/.test(p);

  async function load() {
    if (favMain) return;
    if (!loading) loading = fetch('favourites.html').then(r => r.text()).then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      favMain = document.importNode(doc.querySelector('main'), true);
      favMain.id = 'fav-view';
      favTitle = doc.title;
    });
    await loading;
  }

  async function showFav(push = true) {
    try { await load(); } catch (e) { location.href = 'favourites.html'; return; }
    if (!favShown()) {
      homeScroll = scrollY;
      homeMain.style.display = 'none';
      homeMain.after(favMain);
    }
    document.title = favTitle;
    if (favLink) favLink.classList.add('active');
    if (push) history.pushState({ view: 'fav' }, '', FAV_URL);
    scrollTo(0, 0);
  }

  function showHome(hash = '', push = true) {
    if (favShown()) favMain.remove();
    homeMain.style.display = '';
    document.title = homeTitle;
    if (favLink) favLink.classList.remove('active');
    if (push) history.pushState({ view: 'home' }, '', HOME_URL + hash);
    const target = hash && document.getElementById(hash.slice(1));
    if (target) target.scrollIntoView(); else scrollTo(0, hash ? 0 : homeScroll);
  }

  window.__showFav = () => showFav(true);
  window.__showHome = hash => showHome(hash, true);

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const raw = a.getAttribute('href');
    if (raw.startsWith('#') && favShown()) { e.preventDefault(); showHome(raw, true); return; }
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (isFavPath(url.pathname)) { e.preventDefault(); showFav(true); }
    else if (favShown() && isHomePath(url.pathname)) { e.preventDefault(); showHome(url.hash, true); }
  });

  addEventListener('popstate', () => {
    if (isFavPath(location.pathname)) showFav(false); else showHome(location.hash, false);
  });

  // warm the cache so the switch feels instant
  if (favLink) favLink.addEventListener('pointerenter', () => load().catch(() => {}), { once: true });
})();
