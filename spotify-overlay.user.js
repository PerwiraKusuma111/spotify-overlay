// ==UserScript==
// @name         Spotify Overlay
// @namespace    spotify-overlay
// @version      3.2
// @description  Tampilan ringan dan sederhana di atas web player Spotify asli
// @match        https://open.spotify.com/*
// @run-at       document-start
// @downloadURL  https://raw.githubusercontent.com/PerwiraKusuma111/spotify-overlay/main/spotify-overlay.user.js
// @updateURL    https://raw.githubusercontent.com/PerwiraKusuma111/spotify-overlay/main/spotify-overlay.user.js
// ==/UserScript==

(function () {
  'use strict';

  var html = document.documentElement;
  var off = false;
  try { off = localStorage.getItem('sl_off') === '1'; } catch (e) {}
  if (!off) html.classList.add('sl');

  function calcK() {
    var sw = (window.innerHeight >= window.innerWidth)
      ? Math.min(screen.width || 360, screen.height || 360)
      : Math.max(screen.width || 360, screen.height || 360);
    if (!sw) sw = 360;
    var iw = window.innerWidth || sw;
    return Math.max(1, Math.min(4, iw / sw));
  }

  function applyScale() {
    html.style.setProperty('--sl-k', calcK().toFixed(3));
  }
  applyScale();
  window.addEventListener('resize', applyScale);
  window.addEventListener('load', applyScale);

  var css =
    ':root { --sl-k: 1; }' +
    'html, body { touch-action: pan-x pan-y !important; }' +
    '* { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; text-shadow: none !important; }' +
    'html.sl #main-view * { transition: none !important; animation: none !important; }' +

    // sembunyikan bagian asli tapi global-nav-bar & now-playing-bar tetap aktif di DOM
    'html.sl #Desktop_LeftSidebar_Id,' +
    'html.sl [data-testid="footer-div"],' +
    'html.sl [data-testid="language-selection-modal"] { display: none !important; }' +

    'html.sl [data-testid="global-nav-bar"],' +
    'html.sl [data-testid="now-playing-bar"] {' +
    ' position: fixed !important; left: 0 !important; top: -9999px !important;' +
    ' width: 100% !important; opacity: 0 !important; pointer-events: none !important; }' +

    // isi halaman memenuhi layar di antara bar atas dan bawah
    'html.sl #main-view { position: fixed !important; left: 0 !important; right: 0 !important;' +
    ' width: auto !important; height: auto !important; margin: 0 !important;' +
    ' top: calc(52px * var(--sl-k)) !important; bottom: calc(74px * var(--sl-k)) !important; }' +

    // container bar atas, bawah, saran, dan tombol toggle
    '#sl-top, #sl-bot, #sl-sug, #sl-tg {' +
    ' display: none; position: fixed; z-index: 2147483000; left: 0; right: 0;' +
    ' box-sizing: border-box; color: #fff;' +
    ' font-family: var(--encore-body-font-stack, var(--font-family, "SpotifyMixUI", "CircularSp", sans-serif));' +
    ' font-size: calc(13px * var(--sl-k)); line-height: 1.2; }' +

    'html.sl #sl-top, html.sl #sl-bot {' +
    ' display: flex; align-items: center; gap: calc(8px * var(--sl-k)); padding: 0 calc(10px * var(--sl-k)); }' +

    '#sl-top { top: 0; height: calc(52px * var(--sl-k)); background: #121212; border-bottom: 1px solid #242424; }' +
    '#sl-bot { bottom: 0; height: calc(74px * var(--sl-k)); background: #181818; border-top: 1px solid #282828; padding-top: calc(4px * var(--sl-k)); }' +

    // tombol Spotify (tanpa rounded, font bold web Spotify)
    '#sl-h {' +
    ' background: transparent; color: #fff; border: 0; border-radius: 0;' +
    ' padding: calc(4px * var(--sl-k)) 0; margin: 0; cursor: pointer; flex: none;' +
    ' font-family: var(--encore-title-font-stack, var(--encore-body-font-stack, var(--font-family, "SpotifyMixUITitle", "CircularSpTitle", "CircularSp", sans-serif)));' +
    ' font-size: calc(20px * var(--sl-k)); font-weight: 800; letter-spacing: -0.03em; }' +

    '#sl-sp { flex: 1; }' +

    // tombol kaca pembesar & tutup search
    '#sl-sbtn, #sl-cls {' +
    ' background: #282828; color: #fff; border: 0; border-radius: 50%;' +
    ' width: calc(36px * var(--sl-k)); height: calc(36px * var(--sl-k)); padding: 0;' +
    ' display: inline-flex; align-items: center; justify-content: center; flex: none; cursor: pointer; }' +

    // input cari & tombol Cari (muncul saat mengetik)
    '#sl-q {' +
    ' display: none; flex: 1; min-width: 0; border: 0; border-radius: calc(18px * var(--sl-k));' +
    ' background: #282828; color: #fff; padding: calc(8px * var(--sl-k)) calc(12px * var(--sl-k));' +
    ' font: inherit; outline: 0; }' +

    '#sl-go {' +
    ' display: none; background: #1db954; color: #000; font-weight: 700; border: 0;' +
    ' border-radius: calc(16px * var(--sl-k)); padding: calc(8px * var(--sl-k)) calc(12px * var(--sl-k));' +
    ' font: inherit; flex: none; cursor: pointer; }' +

    '#sl-o, #sl-tg {' +
    ' background: #282828; color: #fff; border: 0; border-radius: calc(16px * var(--sl-k));' +
    ' padding: calc(7px * var(--sl-k)) calc(11px * var(--sl-k)); font: inherit; flex: none; cursor: pointer; }' +

    // mode pencarian aktif di bar atas
    '#sl-top.s-on #sl-h, #sl-top.s-on #sl-sp, #sl-top.s-on #sl-sbtn, #sl-top.s-on #sl-o { display: none; }' +
    '#sl-top:not(.s-on) #sl-cls, #sl-top:not(.s-on) #sl-q, #sl-top:not(.s-on) #sl-go { display: none !important; }' +
    '#sl-top.s-on #sl-cls { display: inline-flex; }' +
    '#sl-top.s-on #sl-q { display: block; }' +

    // dropdown saran pencarian
    '#sl-sug {' +
    ' top: calc(52px * var(--sl-k)); max-height: 45vh; overflow-y: auto;' +
    ' background: #181818; border-bottom: 1px solid #2e2e2e; }' +
    'html.sl #sl-sug.show { display: block; }' +
    '.sl-si {' +
    ' display: flex; align-items: center; gap: calc(10px * var(--sl-k));' +
    ' padding: calc(10px * var(--sl-k)) calc(14px * var(--sl-k));' +
    ' border-top: 1px solid #242424; cursor: pointer; }' +
    '.sl-si:active { background: #2a2a2a; }' +
    '.sl-si-t { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
    '.sl-si-tag { font-size: calc(10px * var(--sl-k)); color: #9a9a9a; flex: none; }' +

    // slider progress musik (area sentuh lega + garis + titik)
    '#sl-pb {' +
    ' position: absolute; left: 0; right: 0; top: calc(-8px * var(--sl-k));' +
    ' height: calc(20px * var(--sl-k)); display: flex; align-items: center;' +
    ' touch-action: none; cursor: pointer; }' +
    '#sl-pt { position: relative; width: 100%; height: calc(4px * var(--sl-k)); background: #3a3a3a; }' +
    '#sl-pf { position: relative; height: 100%; width: 0; background: #1db954; }' +
    '#sl-pd {' +
    ' position: absolute; right: calc(-5px * var(--sl-k)); top: 50%; transform: translateY(-50%);' +
    ' width: calc(10px * var(--sl-k)); height: calc(10px * var(--sl-k));' +
    ' border-radius: 50%; background: #fff; }' +

    // info lagu
    '#sl-im {' +
    ' width: calc(44px * var(--sl-k)); height: calc(44px * var(--sl-k));' +
    ' border-radius: calc(4px * var(--sl-k)); background: #333; flex: none; object-fit: cover; display: none; }' +
    '#sl-tx { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: calc(3px * var(--sl-k)); }' +
    '#sl-t { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
    '#sl-sub { display: flex; align-items: center; gap: calc(6px * var(--sl-k)); font-size: calc(11px * var(--sl-k)); color: #a7a7a7; }' +
    '#sl-a { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }' +
    '#sl-tm { flex: none; color: #1db954; font-variant-numeric: tabular-nums; white-space: nowrap; }' +

    // tombol kontrol musik berbentuk lingkaran
    '#sl-ctl { display: flex; align-items: center; gap: calc(6px * var(--sl-k)); flex: none; }' +
    '#sl-ctl button {' +
    ' width: calc(36px * var(--sl-k)); height: calc(36px * var(--sl-k));' +
    ' padding: 0; border: 0; border-radius: 50%; background: #2a2a2a; color: #fff;' +
    ' display: inline-flex; align-items: center; justify-content: center; flex: none; cursor: pointer; }' +
    '#sl-pp {' +
    ' width: calc(40px * var(--sl-k)) !important; height: calc(40px * var(--sl-k)) !important;' +
    ' background: #1db954 !important; color: #000 !important; }' +

    'html:not(.sl) #sl-tg { display: block; left: auto; right: calc(8px * var(--sl-k)); bottom: calc(8px * var(--sl-k)); width: auto; }';

  var st = document.createElement('style');
  st.textContent = css;
  (document.head || html).appendChild(st);

  function q(t) { return document.querySelector('[data-testid="' + t + '"]'); }
  function press(t) { var e = q(t); if (e) e.click(); }
  function el(tag, id, text) {
    var n = document.createElement(tag);
    if (id) n.id = id;
    if (text != null) n.textContent = text;
    return n;
  }

  function svgIcon(d, sizePx) {
    var ns = 'http://www.w3.org/2000/svg';
    var s = document.createElementNS(ns, 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('fill', 'currentColor');
    s.style.width = 'calc(' + sizePx + 'px * var(--sl-k))';
    s.style.height = 'calc(' + sizePx + 'px * var(--sl-k))';
    s.style.display = 'block';
    var p = document.createElementNS(ns, 'path');
    p.setAttribute('d', d);
    s.appendChild(p);
    return s;
  }

  var IC_SEARCH = 'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z';
  var IC_BACK = 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z';
  var IC_PREV = 'M6 6h2v12H6zm3.5 6l8.5 6V6z';
  var IC_NEXT = 'M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z';
  var IC_PLAY = 'M8 5v14l11-7z';
  var IC_PAUSE = 'M6 19h4V5H6v14zm8-14v14h4V5h-4z';

  function sec(node) {
    if (!node) return 0;
    var p = (node.textContent || '').trim().split(':').map(Number);
    if (p.some(isNaN)) return 0;
    if (p.length === 2) return p[0] * 60 + p[1];
    if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
    return 0;
  }

  function fmt(s) {
    s = Math.max(0, Math.floor(s || 0));
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var ss = s % 60;
    var p = ss < 10 ? '0' + ss : '' + ss;
    return h ? (h + ':' + (m < 10 ? '0' + m : m) + ':' + p) : (m + ':' + p);
  }

  function seekTo(ratio) {
    ratio = Math.max(0, Math.min(1, ratio));
    var pbc = q('playback-progressbar');
    var rng = pbc && pbc.querySelector('input[type="range"]');
    if (rng) {
      var min = parseFloat(rng.min) || 0;
      var max = parseFloat(rng.max) || sec(q('playback-duration')) || 100;
      var val = min + ratio * (max - min);
      var d = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
      if (d && d.set) d.set.call(rng, String(Math.round(val)));
      else rng.value = String(Math.round(val));
      rng.dispatchEvent(new Event('input', { bubbles: true }));
      rng.dispatchEvent(new Event('change', { bubbles: true }));
    }
    var bar = q('progress-bar') || q('progress-bar-background') || pbc;
    if (bar) {
      var r = bar.getBoundingClientRect();
      if (r.width > 0) {
        var cx = r.left + ratio * r.width;
        var cy = r.top + r.height / 2;
        var o1 = { bubbles: true, cancelable: true, clientX: cx, clientY: cy, button: 0, buttons: 1 };
        var o0 = { bubbles: true, cancelable: true, clientX: cx, clientY: cy, button: 0, buttons: 0 };
        bar.dispatchEvent(new PointerEvent('pointerdown', o1));
        bar.dispatchEvent(new MouseEvent('mousedown', o1));
        bar.dispatchEvent(new PointerEvent('pointermove', o1));
        bar.dispatchEvent(new MouseEvent('mousemove', o1));
        bar.dispatchEvent(new PointerEvent('pointerup', o0));
        bar.dispatchEvent(new MouseEvent('mouseup', o0));
        bar.dispatchEvent(new MouseEvent('click', o0));
      }
    }
  }

  // Riwayat pencarian lokal untuk saran instan
  function loadHist() {
    try { return JSON.parse(localStorage.getItem('sl_hist') || '[]') || []; } catch (e) { return []; }
  }
  function saveHist(term) {
    term = (term || '').trim();
    if (!term) return;
    var h = loadHist().filter(function (x) { return x.toLowerCase() !== term.toLowerCase(); });
    h.unshift(term);
    if (h.length > 12) h.length = 12;
    try { localStorage.setItem('sl_hist', JSON.stringify(h)); } catch (e) {}
  }

  function doSearch(v, force) {
    v = (v || '').trim();
    if (!v) {
      if (!force) {
        var cb = q('clear-button');
        if (cb) cb.click();
      }
      return;
    }
    var i = q('search-input');
    if (i) {
      var d = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
      if (d && d.set) d.set.call(i, v);
      else i.value = v;
      i.dispatchEvent(new Event('input', { bubbles: true }));
      i.dispatchEvent(new Event('change', { bubbles: true }));
      if (force) {
        i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
      }
    } else if (force) {
      location.href = 'https://open.spotify.com/search/' + encodeURIComponent(v);
    }
  }

  function hideRight() {
    var mv = document.getElementById('main-view');
    if (!mv) return;
    var a = q('lyrics-npv-section') || q('npv-artist-link') || q('npv-artist-bio-button');
    if (!a || mv.contains(a)) return;
    var node = a;
    while (node.parentElement && !node.parentElement.contains(mv)) node = node.parentElement;
    if (!node.contains(mv)) node.style.display = 'none';
  }

  var wrap, elTop, elSug, elIm, elT, elA, elTm, elPP, elPf, elQ, elGo;
  var icPlayEl, icPauseEl, lastPlaying = null;
  var seeking = false, curDur = 0;

  function renderSuggestions(query) {
    if (!elSug) return;
    var qLow = (query || '').trim().toLowerCase();
    var items = [];
    var seen = {};

    function add(text, tag) {
      text = (text || '').trim();
      if (!text || text.length > 60) return;
      var k = text.toLowerCase();
      if (seen[k]) return;
      seen[k] = 1;
      items.push({ text: text, tag: tag });
    }

    // 1. Riwayat pencarian yang cocok
    var hist = loadHist();
    for (var i = 0; i < hist.length && items.length < 4; i++) {
      if (!qLow || hist[i].toLowerCase().indexOf(qLow) > -1) add(hist[i], 'Riwayat');
    }

    // 2. Saran live dari hasil pencarian Spotify di #main-view
    if (qLow) {
      var mv = document.getElementById('main-view');
      if (mv) {
        var nodes = mv.querySelectorAll('a[href*="/track/"], a[href*="/artist/"], a[href*="/album/"], a[href*="/playlist/"]');
        for (var j = 0; j < nodes.length && items.length < 8; j++) {
          var txt = (nodes[j].textContent || '').trim();
          if (txt && txt.toLowerCase() !== qLow) {
            var href = nodes[j].getAttribute('href') || '';
            var tag = href.indexOf('/artist/') > -1 ? 'Artis'
              : href.indexOf('/track/') > -1 ? 'Lagu'
              : href.indexOf('/album/') > -1 ? 'Album' : 'Playlist';
            add(txt, tag);
          }
        }
      }
    }

    while (elSug.firstChild) elSug.removeChild(elSug.firstChild);
    if (!items.length || !elTop.classList.contains('s-on')) {
      elSug.classList.remove('show');
      return;
    }

    for (var m = 0; m < items.length; m++) {
      (function (it) {
        var row = el('div', '');
        row.className = 'sl-si';
        var tSpan = el('span', '', it.text);
        tSpan.className = 'sl-si-t';
        var tagSpan = el('span', '', it.tag);
        tagSpan.className = 'sl-si-tag';
        row.append(svgIcon(IC_SEARCH, 15), tSpan, tagSpan);
        row.onmousedown = function (ev) { ev.preventDefault(); };
        row.onclick = function () {
          elQ.value = it.text;
          elGo.style.display = 'block';
          saveHist(it.text);
          doSearch(it.text, true);
          elSug.classList.remove('show');
          elQ.blur();
        };
        elSug.appendChild(row);
      })(items[m]);
    }
    elSug.classList.add('show');
  }

  function tick() {
    if (document.hidden) return;
    if (wrap && !wrap.isConnected && document.body) {
      document.body.appendChild(wrap);
    }
    if (!elT) return;

    var npw = q('now-playing-widget-v2');
    var im = (npw && npw.querySelector('[data-testid="cover-art-image"]')) || q('cover-art-image');
    var t = (npw && npw.querySelector('[data-testid="context-item-link"]')) || q('context-item-link');
    var a = q('now-playing-widget-v2-byline');
    var pp = q('control-button-playpause');

    if (im && im.src) {
      if (elIm.src !== im.src) elIm.src = im.src;
      elIm.style.display = 'block';
    } else {
      elIm.style.display = 'none';
    }

    elT.textContent = t ? t.textContent : 'Belum ada lagu';
    elA.textContent = a ? a.textContent : '';

    var l = pp ? (pp.getAttribute('aria-label') || '').toLowerCase() : '';
    var playing = l.indexOf('jeda') > -1 || l.indexOf('pause') > -1;
    if (playing !== lastPlaying) {
      lastPlaying = playing;
      while (elPP.firstChild) elPP.removeChild(elPP.firstChild);
      elPP.appendChild(playing ? icPauseEl : icPlayEl);
    }

    var posEl = q('playback-position');
    var durEl = q('playback-duration');
    var s = sec(posEl), e = sec(durEl);
    curDur = e;

    if (!seeking) {
      var posTxt = posEl ? (posEl.textContent || '').trim() : '';
      var durTxt = durEl ? (durEl.textContent || '').trim() : '';
      elTm.textContent = (posTxt && durTxt) ? (posTxt + ' / ' + durTxt) : '0:00 / 0:00';
      elPf.style.width = (e ? Math.min(100, (s / e) * 100) : 0) + '%';
    }
  }

  function start() {
    if (wrap) return;
    applyScale();

    wrap = el('div', 'sl-root');

    // Bar atas
    elTop = el('div', 'sl-top');
    var btnH = el('button', 'sl-h', 'Spotify');
    var sp = el('div', 'sl-sp');
    var btnSearch = el('button', 'sl-sbtn');
    btnSearch.setAttribute('aria-label', 'Cari');
    btnSearch.appendChild(svgIcon(IC_SEARCH, 19));

    var btnCls = el('button', 'sl-cls');
    btnCls.setAttribute('aria-label', 'Tutup');
    btnCls.appendChild(svgIcon(IC_BACK, 19));

    elQ = el('input', 'sl-q');
    elQ.type = 'search';
    elQ.placeholder = 'Cari lagu, artis...';
    elQ.autocomplete = 'off';

    elGo = el('button', 'sl-go', 'Cari');
    var btnO = el('button', 'sl-o', 'Asli');

    elTop.append(btnH, sp, btnSearch, btnCls, elQ, elGo, btnO);

    // Dropdown saran pencarian
    elSug = el('div', 'sl-sug');

    // Bar bawah (player)
    var bot = el('div', 'sl-bot');
    var pb = el('div', 'sl-pb');
    var pt = el('div', 'sl-pt');
    elPf = el('div', 'sl-pf');
    var pd = el('div', 'sl-pd');
    elPf.appendChild(pd);
    pt.appendChild(elPf);
    pb.appendChild(pt);

    elIm = el('img', 'sl-im');
    elIm.alt = '';

    var tx = el('div', 'sl-tx');
    elT = el('div', 'sl-t', 'Belum ada lagu');
    var sub = el('div', 'sl-sub');
    elA = el('div', 'sl-a', '');
    elTm = el('div', 'sl-tm', '0:00 / 0:00');
    sub.append(elA, elTm);
    tx.append(elT, sub);

    var ctl = el('div', 'sl-ctl');
    var btnPv = el('button', 'sl-pv');
    btnPv.appendChild(svgIcon(IC_PREV, 18));

    elPP = el('button', 'sl-pp');
    icPlayEl = svgIcon(IC_PLAY, 20);
    icPauseEl = svgIcon(IC_PAUSE, 20);
    elPP.appendChild(icPlayEl);

    var btnNx = el('button', 'sl-nx');
    btnNx.appendChild(svgIcon(IC_NEXT, 18));

    ctl.append(btnPv, elPP, btnNx);
    bot.append(pb, elIm, tx, ctl);

    var btnTg = el('button', 'sl-tg', 'Ringan');

    wrap.append(elTop, elSug, bot, btnTg);
    document.body.appendChild(wrap);

    // Event slider musik (tap & drag)
    var lastRatio = 0;
    function updateSliderVisual(clientX) {
      var r = pb.getBoundingClientRect();
      if (!r.width) return 0;
      var ratio = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
      lastRatio = ratio;
      elPf.style.width = (ratio * 100) + '%';
      if (curDur > 0) elTm.textContent = fmt(ratio * curDur) + ' / ' + fmt(curDur);
      return ratio;
    }

    pb.addEventListener('pointerdown', function (ev) {
      seeking = true;
      if (pb.setPointerCapture) {
        try { pb.setPointerCapture(ev.pointerId); } catch (e) {}
      }
      updateSliderVisual(ev.clientX);
    });
    pb.addEventListener('pointermove', function (ev) {
      if (!seeking) return;
      updateSliderVisual(ev.clientX);
    });
    function endSeek(ev) {
      if (!seeking) return;
      if (ev && typeof ev.clientX === 'number') updateSliderVisual(ev.clientX);
      seeking = false;
      seekTo(lastRatio);
    }
    pb.addEventListener('pointerup', endSeek);
    pb.addEventListener('pointercancel', endSeek);

    // Event bar atas & search
    btnH.onclick = function () { press('home-button'); };

    function openSearch() {
      elTop.classList.add('s-on');
      elGo.style.display = elQ.value.trim() ? 'block' : 'none';
      elQ.focus();
      renderSuggestions(elQ.value);
    }
    function closeSearch() {
      elTop.classList.remove('s-on');
      elSug.classList.remove('show');
      elQ.blur();
    }

    btnSearch.onclick = openSearch;
    btnCls.onclick = closeSearch;

    var timer = null, sugTimer = null;
    elQ.oninput = function () {
      var v = elQ.value;
      elGo.style.display = v.trim() ? 'block' : 'none';
      renderSuggestions(v);
      clearTimeout(timer);
      clearTimeout(sugTimer);
      timer = setTimeout(function () {
        doSearch(v, false);
        sugTimer = setTimeout(function () { renderSuggestions(elQ.value); }, 550);
      }, 280);
    };
    elQ.onfocus = function () {
      if (elTop.classList.contains('s-on')) renderSuggestions(elQ.value);
    };
    elQ.onkeydown = function (ev) {
      if (ev.key === 'Enter') {
        clearTimeout(timer);
        saveHist(elQ.value);
        doSearch(elQ.value, true);
        elSug.classList.remove('show');
        elQ.blur();
      }
    };
    elGo.onclick = function () {
      clearTimeout(timer);
      saveHist(elQ.value);
      doSearch(elQ.value, true);
      elSug.classList.remove('show');
      elQ.blur();
    };

    document.addEventListener('pointerdown', function (ev) {
      if (elSug.classList.contains('show') && !elTop.contains(ev.target) && !elSug.contains(ev.target)) {
        elSug.classList.remove('show');
      }
    });

    btnPv.onclick = function () { press('control-button-skip-back'); };
    elPP.onclick = function () { press('control-button-playpause'); };
    btnNx.onclick = function () { press('control-button-skip-forward'); };

    function toggle() {
      var on = html.classList.toggle('sl');
      try { localStorage.setItem('sl_off', on ? '0' : '1'); } catch (e) {}
    }
    btnO.onclick = toggle;
    btnTg.onclick = toggle;

    tick();
    setInterval(tick, 1000);

    var t2 = null;
    new MutationObserver(function () {
      if (!t2) t2 = setTimeout(function () { t2 = null; hideRight(); }, 800);
    }).observe(document.body, { childList: true, subtree: true });
    hideRight();
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
