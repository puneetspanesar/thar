(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/puneet@thar.co';
  var OR = '#F04A12', LN = '#D9CEC5';
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function onView(node, fn, opts) {
    if (!('IntersectionObserver' in window)) { fn(true); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { fn(e.isIntersecting, e); }); }, opts || { threshold: 0.25 });
    io.observe(node);
  }

  /* dropdown menus */
  document.querySelectorAll('.has-dd').forEach(function (li) {
    var btn = li.querySelector('button');
    btn.addEventListener('click', function (e) { e.stopPropagation(); var o = li.classList.toggle('open'); btn.setAttribute('aria-expanded', o); });
    li.addEventListener('mouseenter', function () { if (window.innerWidth > 1100) { li.classList.add('open'); btn.setAttribute('aria-expanded', true); } });
    li.addEventListener('mouseleave', function () { li.classList.remove('open'); btn.setAttribute('aria-expanded', false); });
  });
  document.addEventListener('click', function () { document.querySelectorAll('.has-dd.open').forEach(function (li) { li.classList.remove('open'); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { document.querySelectorAll('.has-dd.open').forEach(function (li) { li.classList.remove('open'); }); closeM(); } });

  /* mobile menu */
  var m = document.querySelector('.mnav');
  function closeM() { if (m) { m.classList.remove('open'); document.body.style.overflow = ''; } }
  document.querySelectorAll('[data-open-menu]').forEach(function (b) { b.addEventListener('click', function () { m.classList.add('open'); document.body.style.overflow = 'hidden'; }); });
  document.querySelectorAll('[data-close-menu]').forEach(function (b) { b.addEventListener('click', closeM); });

  /* reveal */
  var rv = document.querySelectorAll('.rv');
  if (!reduce && 'IntersectionObserver' in window) {
    var rio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { threshold: 0.12 });
    rv.forEach(function (n) { rio.observe(n); });
  } else rv.forEach(function (n) { n.classList.add('in'); });

  /* hero pixel field: a slanted band of squares that drifts and lights up under the cursor */
  var cv = document.querySelector('.hero canvas');
  if (cv) {
    var ctx = cv.getContext('2d'), W, H, DPR = Math.min(window.devicePixelRatio || 1, 2), mx = -999, my = -999, t0 = performance.now(), live = true, last = 0, GR = 13, SQ = 9;
    var size = function () { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); };
    size(); window.addEventListener('resize', size);
    cv.parentElement.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    cv.parentElement.addEventListener('pointerleave', function () { mx = my = -999; });
    onView(cv, function (v) { live = v; if (v) requestAnimationFrame(draw); }, { threshold: 0 });
    function band(x, y, t) {
      // two soft slanted strokes, echoing the Thar mark
      var u = (x - W * 0.62) + (y - H * 0.5) * 0.42, w = 150 + 40 * Math.sin(t * 0.0004 + y * 0.004);
      var a = Math.exp(-(u * u) / (2 * w * w));
      var v = y - H * 0.18 - 22 * Math.sin(t * 0.0003 + x * 0.003);
      var top = (x > W * 0.38 && x < W * 0.98) ? Math.exp(-(v * v) / (2 * 46 * 46)) : 0;
      return Math.max(a * (y > H * 0.18 ? 1 : 0.2), top * 0.9);
    }
    function draw(now) {
      if (!live) return;
      if (now - last > 40 || reduce) {
        last = now; var t = reduce ? 0 : now - t0;
        ctx.clearRect(0, 0, W, H);
        for (var y = 6; y < H; y += GR) for (var x = 6; x < W; x += GR) {
          var a = band(x, y, t);
          var n = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1; n = n < 0 ? -n : n;
          var tw = 0.5 + 0.5 * Math.sin(t * 0.002 + n * 40);
          var d = Math.hypot(x - mx, y - my), hov = d < 110 ? 1 - d / 110 : 0;
          var cx = (Math.abs(x - W / 2) < Math.min(480, W * 0.46) && y > H * 0.22 && y < H * 0.8) ? (W < 700 ? 0.08 : 0.14) : (W < 700 ? 0.5 : 1); // keep text area calm
          if (hov > 0.02) { ctx.fillStyle = 'rgba(240,74,18,' + (0.25 + hov * 0.75) + ')'; ctx.fillRect(x, y, SQ, SQ); continue; }
          if (a * cx < 0.06) continue;
          if (n < 0.06 && a > 0.4) { ctx.fillStyle = 'rgba(240,74,18,' + (0.5 + 0.5 * tw) * cx + ')'; }
          else ctx.fillStyle = 'rgba(205,190,178,' + (a * (0.35 + 0.35 * tw)) * cx + ')';
          ctx.fillRect(x, y, SQ, SQ);
        }
      }
      if (!reduce) requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* moving packets along an svg path */
  function packet(svg, path, dur, color, done) {
    var len = path.getTotalLength(), g = svg.querySelector('.pk') || svg;
    var r = el('rect', { width: 7, height: 7, fill: color || OR }, g), s = performance.now();
    (function step(n) {
      var k = Math.min(1, (n - s) / dur), p = path.getPointAtLength(len * k);
      r.setAttribute('x', p.x - 3.5); r.setAttribute('y', p.y - 3.5);
      if (k < 1) requestAnimationFrame(step); else { r.remove(); if (done) done(); }
    })(s);
  }
  function countTo(node, to, ms) {
    var from = +node.textContent.replace(/\D/g, '') || 0, s = performance.now();
    (function st(n) { var k = Math.min(1, (n - s) / ms); node.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(st); })(s);
  }

  var G = {};
  G.growth = function (svg) {
    var paths = [0, 1, 2, 3].map(function (i) { return svg.querySelector('#gp' + i); }), px = svg.querySelector('#gpx'), py = svg.querySelector('#gpy');
    var count = svg.querySelector('.count'), n = 0, focus = -1, timer;
    svg.querySelectorAll('.chan').forEach(function (c) {
      var i = +c.dataset.i;
      c.style.cursor = 'pointer';
      c.addEventListener('pointerenter', function () { focus = i; paths.forEach(function (p, j) { p.setAttribute('stroke', j === i ? OR : LN); p.setAttribute('stroke-width', j === i ? 2.5 : 1.5); }); c.querySelector('rect').setAttribute('stroke', OR); });
      c.addEventListener('pointerleave', function () { focus = -1; paths.forEach(function (p) { p.setAttribute('stroke', LN); p.setAttribute('stroke-width', 1.5); }); c.querySelector('rect').setAttribute('stroke', LN); });
    });
    function tick() {
      var i = focus >= 0 && Math.random() < 0.7 ? focus : Math.floor(Math.random() * 4);
      packet(svg, paths[i], 1100, OR, function () {
        if (Math.random() < 0.55) packet(svg, px, 700, OR, function () { packet(svg, py, 700, '#101010', function () { n += 1 + Math.floor(Math.random() * 3); countTo(count, n, 400); }); });
      });
    }
    return { start: function () { if (!timer) timer = setInterval(tick, 420); }, stop: function () { clearInterval(timer); timer = null; } };
  };
  G.content = function (svg) {
    var f = svg.querySelectorAll('.fmt'), w = svg.querySelectorAll('.wire'), timer, k = 0;
    function reset() { f.forEach(function (g) { g.style.opacity = 0.18; g.querySelector('.ok').setAttribute('opacity', 0); }); w.forEach(function (p) { p.setAttribute('stroke', LN); }); }
    function step() {
      if (k === 0) reset();
      if (k < 6) { f[k].style.transition = 'opacity .5s'; f[k].style.opacity = 1; w[k].setAttribute('stroke', OR); }
      else if (k < 12) { f[k - 6].querySelector('.ok').setAttribute('opacity', 1); }
      k = (k + 1) % 15;
    }
    reset();
    return { start: function () { if (!timer) timer = setInterval(step, 420); }, stop: function () { clearInterval(timer); timer = null; } };
  };
  G.agents = function (svg) {
    var sts = svg.querySelectorAll('.ag .st'), rev = svg.querySelector('.review .st'), flow = svg.querySelector('.flow'), timer, k = 0;
    function set(g, label, bg, fg) { g.querySelector('rect').setAttribute('fill', bg); var t = g.querySelector('text'); t.textContent = label; t.setAttribute('fill', fg); }
    function step() {
      var phase = k % 8;
      sts.forEach(function (g, i) { if (phase < 2 + i) set(g, 'RUNNING', '#E7EEFF', '#2747C9'); else set(g, 'DONE', '#E3F4EA', '#1D7A45'); });
      if (phase < 5) set(rev, 'WAITING', '#FDEDE6', OR); else set(rev, 'APPROVED', '#E3F4EA', '#1D7A45');
      flow.setAttribute('stroke-dasharray', '4 4'); flow.setAttribute('stroke-dashoffset', -k * 8);
      k++;
    }
    return { start: function () { if (!timer) { step(); timer = setInterval(step, 700); } }, stop: function () { clearInterval(timer); timer = null; } };
  };
  G.platform = function (svg) {
    var b = svg.querySelectorAll('.blk'), sp = svg.querySelector('.spark'), gs = svg.querySelectorAll('.gauge'), run = false, to = [];
    function play() {
      b.forEach(function (r) { r.style.transition = 'none'; r.setAttribute('opacity', 0); }); sp.setAttribute('opacity', 0);
      gs.forEach(function (g) { g.querySelector('.gv').textContent = 0; g.querySelector('.gb').setAttribute('width', 0); });
      b.forEach(function (r, i) { to.push(setTimeout(function () { r.style.transition = 'opacity .4s'; r.setAttribute('opacity', 1); }, 150 + i * 160)); });
      to.push(setTimeout(function () { sp.setAttribute('opacity', 1); var L = sp.getTotalLength(); sp.style.transition = 'none'; sp.setAttribute('stroke-dasharray', L); sp.setAttribute('stroke-dashoffset', L); sp.getBoundingClientRect(); sp.style.transition = 'stroke-dashoffset 1s'; sp.setAttribute('stroke-dashoffset', 0); }, 1800));
      to.push(setTimeout(function () { gs.forEach(function (g) { var v = +g.dataset.v; countTo(g.querySelector('.gv'), v, 1200); var bb = g.querySelector('.gb'); bb.style.transition = 'width 1.2s'; bb.setAttribute('width', 70 * v / 100); }); }, 2200));
      to.push(setTimeout(function () { if (run) play(); }, 7000));
    }
    return { start: function () { if (!run) { run = true; play(); } }, stop: function () { run = false; to.forEach(clearTimeout); to = []; } };
  };
  G.events = function (svg) {
    var crowd = svg.querySelector('.crowd'), dots = [], timer, raf, v = 0, c = 0, m = 0;
    var spots = [[105, 331], [105, 411], [495, 331], [495, 411], [300, 230], [220, 250], [380, 250]];
    for (var i = 0; i < 26; i++) { var d = { x: 300, y: 470, tx: 300, ty: 300, r: el('rect', { width: 7, height: 7, fill: i % 5 === 0 ? OR : '#101010' }, crowd) }; dots.push(d); }
    function retarget(d) { var s = spots[Math.floor(Math.random() * spots.length)]; d.tx = s[0] + (Math.random() - 0.5) * 60; d.ty = s[1] + (Math.random() - 0.5) * 30; }
    dots.forEach(function (d, i) { d.x = 280 + Math.random() * 40; d.y = 460; retarget(d); });
    function frame() { dots.forEach(function (d) { d.x += (d.tx - d.x) * 0.03; d.y += (d.ty - d.y) * 0.03; d.r.setAttribute('x', d.x - 3.5); d.r.setAttribute('y', d.y - 3.5); }); raf = requestAnimationFrame(frame); }
    function tick() { dots[Math.floor(Math.random() * dots.length)] && retarget(dots[Math.floor(Math.random() * dots.length)]); v += 3 + Math.floor(Math.random() * 4); c += Math.random() < 0.6 ? 1 : 0; m += Math.random() < 0.25 ? 1 : 0; countTo(svg.querySelector('.cv'), v, 300); countTo(svg.querySelector('.cc'), c, 300); countTo(svg.querySelector('.cm'), m, 300); }
    return { start: function () { if (!timer) { timer = setInterval(tick, 600); frame(); } }, stop: function () { clearInterval(timer); timer = null; cancelAnimationFrame(raf); } };
  };
  G.mark = function (svg) {
    var p = svg.querySelector('.mk'), L = p.getTotalLength(), done = false;
    p.setAttribute('stroke-dasharray', L); p.setAttribute('stroke-dashoffset', L); p.style.fillOpacity = 0;
    return { start: function () { if (done) return; done = true; p.style.transition = 'stroke-dashoffset 2.4s cubic-bezier(.4,.1,.2,1), fill-opacity 1s 2s'; p.setAttribute('stroke-dashoffset', 0); p.style.fillOpacity = 1; }, stop: function () {} };
  };
  G.tile = function () { return { start: function () {}, stop: function () {} }; };
  document.querySelectorAll('svg[data-gfx]').forEach(function (svg) {
    var k = svg.getAttribute('data-gfx'); if (!G[k]) return;
    var c = G[k](svg);
    if (reduce) { c.start(); setTimeout(c.stop, 50); return; }
    onView(svg, function (v) { v ? c.start() : c.stop(); }, { threshold: 0.2 });
  });

  /* engine dashboard: tabs switch the series, line draws, hover shows values */
  var mock = document.querySelector('.mock');
  if (mock) {
    var plot = mock.querySelector('svg.plot'), tip = mock.querySelector('.tipv'), views = JSON.parse(mock.dataset.views), view = 'report', data = views.report.series, cur = Object.keys(data)[0];
    var dfmt = function (v) { return (Math.round(v * 10) / 10).toLocaleString('en-IN'); };
    function render(key) {
      cur = key; var s = data[key], mx = Math.max.apply(null, s), mn = Math.min.apply(null, s), pad = (mx - mn) * 0.15 || 1, max = mx + pad, min = Math.max(0, mn - pad), w = 600, h = 180;
      plot.innerHTML = '';
      [0.25, 0.5, 0.75].forEach(function (f) { el('path', { d: 'M0 ' + h * f + ' H' + w, stroke: '#EFE8E2', 'stroke-dasharray': '3 5' }, plot); });
      var pts = s.map(function (v, i) { return [i * w / (s.length - 1), h - 10 - (v - min) / (max - min) * (h - 30)]; });
      var d = 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L ');
      el('path', { d: d + ' L ' + w + ' ' + h + ' L 0 ' + h + ' Z', fill: OR, opacity: 0.07 }, plot);
      var line = el('path', { d: d, fill: 'none', stroke: OR, 'stroke-width': 2.2 }, plot), L = line.getTotalLength();
      line.setAttribute('stroke-dasharray', L); line.setAttribute('stroke-dashoffset', L); line.getBoundingClientRect();
      line.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(.3,.6,.2,1)'; line.setAttribute('stroke-dashoffset', 0);
      var dot = el('rect', { width: 8, height: 8, fill: OR, x: pts[pts.length - 1][0] - 8, y: pts[pts.length - 1][1] - 4 }, plot);
      var vl = el('path', { d: '', stroke: '#101010', 'stroke-dasharray': '2 3', opacity: 0, 'vector-effect': 'non-scaling-stroke' }, plot);
      var last = function () { return 'Week ' + s.length + ': ' + dfmt(s[s.length - 1]); };
      plot.onpointermove = function (e) {
        var r = plot.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * w, i = Math.round(x / (w / (s.length - 1))); i = Math.max(0, Math.min(s.length - 1, i));
        vl.setAttribute('d', 'M' + pts[i][0] + ' 0 V' + h); vl.setAttribute('opacity', 1); dot.setAttribute('x', pts[i][0] - 4); dot.setAttribute('y', pts[i][1] - 4);
        tip.textContent = 'Week ' + (i + 1) + ': ' + dfmt(s[i]);
      };
      plot.onpointerleave = function () { vl.setAttribute('opacity', 0); tip.textContent = last(); };
      tip.textContent = last();
    }
    function bindTabs() {
      mock.querySelectorAll('.tabs button').forEach(function (b) { b.addEventListener('click', function () { mock.querySelectorAll('.tabs button').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); render(b.dataset.k); }); });
    }
    function esc(t) { return String(t).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
    function show(k) {
      var v = views[k]; if (!v) return; view = k; data = v.series;
      var body = mock.querySelector('.body');
      body.classList.remove('swap'); void body.offsetWidth; body.classList.add('swap');
      mock.querySelector('.title b').textContent = v.title;
      mock.querySelector('.crumbs').innerHTML = v.crumbs.map(function (c) { return '<span>' + esc(c) + '</span>'; }).join('');
      mock.querySelector('.bar .id').textContent = 'wk_12' + (k === 'report' ? '' : ' / ' + k);
      mock.querySelector('.tabs').innerHTML = Object.keys(v.series).map(function (s, i) { return '<button type="button" data-k="' + esc(s) + '"' + (i ? '' : ' class="on"') + '>' + esc(s) + '</button>'; }).join('');
      mock.querySelector('thead tr').innerHTML = v.head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('');
      mock.querySelector('tbody').innerHTML = v.rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('');
      bindTabs(); render(Object.keys(v.series)[0]);
      track('dashboard_view', { view: k });
    }
    bindTabs();
    mock.querySelectorAll('.dnav .a').forEach(function (a) { a.addEventListener('click', function () {
      mock.querySelectorAll('.dnav .a').forEach(function (x) { x.classList.toggle('on', x === a); x.setAttribute('aria-pressed', x === a ? 'true' : 'false'); });
      if (window.matchMedia('(max-width: 820px)').matches) a.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      show(a.dataset.v);
    }); });
    var drawn = false; onView(mock, function (v) { if (v && !drawn) { drawn = true; render(cur); } });
  }

  /* principles light up one by one */
  var pr = document.querySelectorAll('.principles ol li');
  pr.forEach(function (li) { onView(li, function (v) { if (v) li.classList.add('on'); }, { threshold: 0.9, rootMargin: '0px 0px -25% 0px' }); });

  /* steps line */
  document.querySelectorAll('.steps-wrap').forEach(function (w) { onView(w, function (v) { if (v) { w.querySelector('.steps-line i').style.width = '100%'; w.querySelectorAll('.step').forEach(function (s, i) { setTimeout(function () { s.classList.add('on'); }, 300 + i * 380); }); } }); });

  /* industries: photo follows the cursor */
  document.querySelectorAll('.hlist').forEach(function (hl) {
    var fl = hl.querySelector('.float'), img = fl && fl.querySelector('img');
    if (!fl || window.matchMedia('(hover: none)').matches) return;
    hl.querySelectorAll('a[data-img]').forEach(function (a) {
      a.addEventListener('pointerenter', function () { img.src = a.dataset.img; fl.classList.add('on'); });
      a.addEventListener('pointerleave', function () { fl.classList.remove('on'); });
      a.addEventListener('pointermove', function (e) { fl.style.left = (e.clientX + 24) + 'px'; fl.style.top = (e.clientY - 100) + 'px'; });
    });
  });

  /* analytics */
  function track(name, params) { try { if (window.gtag) window.gtag('event', name, params || {}); } catch (e) {} }
  var used = {};
  function once(tool) { if (!used[tool]) { used[tool] = 1; track('tool_use', { tool_name: tool }); } }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (a) track('email_click', { link_url: a.getAttribute('href') });
  });

  /* consent: only asked where the law expects it (Europe and the UK) */
  (function () {
    var tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    var stored = null; try { stored = localStorage.getItem('thar-consent'); } catch (e) {}
    if (stored || !/^(Europe\/|Atlantic\/(Reykjavik|Canary|Madeira|Azores|Faroe))/.test(tz)) return;
    var b = document.createElement('div'); b.className = 'consent'; b.setAttribute('role', 'region'); b.setAttribute('aria-label', 'Cookie choice');
    b.innerHTML = '<p>We use Google Analytics cookies to see how this site is used. <a class="ul" href="/cookies/">Cookie Policy</a></p><div><button class="btn or" data-c="yes">Accept</button><button class="btn" data-c="no">Decline</button></div>';
    document.body.appendChild(b);
    b.addEventListener('click', function (e) {
      var c = e.target.getAttribute && e.target.getAttribute('data-c'); if (!c) return;
      try { localStorage.setItem('thar-consent', c); } catch (er) {}
      if (c === 'yes' && window.gtag) window.gtag('consent', 'update', { analytics_storage: 'granted' });
      b.remove();
    });
  })();

  /* campaign attribution: first touch in this visit, sent with every form */
  var ATTR = {};
  try {
    var q = new URLSearchParams(location.search), keys = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','gbraid','wbraid','fbclid','li_fat_id','msclkid'];
    ATTR = JSON.parse(sessionStorage.getItem('thar-attr') || 'null') || {};
    if (keys.some(function (k) { return q.get(k); }) || !ATTR.landing_page) {
      if (keys.some(function (k) { return q.get(k); })) ATTR = {};
      keys.forEach(function (k) { if (q.get(k)) ATTR[k] = q.get(k).slice(0, 200); });
      ATTR.landing_page = ATTR.landing_page || location.pathname;
      ATTR.referrer = ATTR.referrer || (document.referrer || '').slice(0, 200);
      sessionStorage.setItem('thar-attr', JSON.stringify(ATTR));
    }
  } catch (e) {}

  /* work filter */
  document.querySelectorAll('.wk-tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.dataset.f;
      document.querySelectorAll('.wk-tabs button').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
      document.querySelectorAll('.cs').forEach(function (c) { c.hidden = !(f === 'all' || c.dataset.sector === f); });
      track('work_filter', { sector: f });
    });
  });

  /* forms */
  document.querySelectorAll('form[data-send]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (f.querySelector('.hp input') && f.querySelector('.hp input').value) return; if (!f.checkValidity()) { f.reportValidity(); alertBox(f, 'Please fill in your name, a valid work email and the other required fields.'); return; } var e0 = f.querySelector('.err'); if (e0) e0.remove();
      var data = {}; new FormData(f).forEach(function (v, k) { data[k] = v; });
      Object.keys(ATTR).forEach(function (k) { if (ATTR[k]) data[k] = ATTR[k]; }); data.page = location.pathname; data._subject = 'Thar website: ' + (f.dataset.send || 'Enquiry') + (ATTR.utm_campaign ? ' (' + ATTR.utm_campaign + ')' : ''); data._template = 'table';
      var btn = f.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Sending...';
      fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(); return r.json().catch(function () { return {}; }); })
        .then(function (j) { if (j && (j.success === false || j.success === 'false')) { window.__formMsg = j.message || ''; throw new Error(); } track('generate_lead', { form_name: f.dataset.send || 'Enquiry', campaign: ATTR.utm_campaign || '', source: ATTR.utm_source || '' });
          if (f.dataset.download) { f.innerHTML = '<p class="done">Thank you. Your report is ready.</p><p style="margin-top:18px"><a class="btn or dl" href="' + f.dataset.download + '" download="Thar Labs Faster to Market.pdf">Download the PDF</a></p>'; var a = f.querySelector('a.dl'); a.addEventListener('click', function () { track('file_download', { file_name: 'faster-to-market' }); }); a.click(); }
          else f.innerHTML = '<p class="done">Thank you. We will be in touch within one working day.</p>'; })
        .catch(function () { btn.disabled = false; btn.textContent = 'Send'; alertBox(f, 'Something went wrong. Please try again in a moment.'); });
    });
  });
  function alertBox(f, msg) { var p = f.querySelector('.err') || document.createElement('p'); p.className = 'err'; p.setAttribute('role', 'alert'); p.textContent = msg; f.appendChild(p); }

  /* tools */
  var fmt = function (cur, n) {
    try { return new Intl.NumberFormat(cur === 'INR' ? 'en-IN' : 'en-GB', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n); }
    catch (e) { return cur + ' ' + Math.round(n).toLocaleString(); }
  };

  var rd = document.getElementById('readiness');
  if (rd) rd.addEventListener('submit', function (e) {
    e.preventDefault();
    var groups = { data: [0, 0], work: [0, 0], people: [0, 0] }, answered = 0, total = 0;
    rd.querySelectorAll('.q').forEach(function (q) {
      var c = q.querySelector('input:checked'); var g = q.dataset.g;
      groups[g][1] += 3;
      if (c) { answered++; groups[g][0] += +c.value; total += +c.value; }
    });
    var out = document.getElementById('readiness-out');
    if (answered < 12) { out.classList.add('show'); out.innerHTML = '<p class="h4">Please answer all twelve questions.</p>'; return; }
    var pct = Math.round(total / 36 * 100);
    var band = pct < 35 ? ['Getting started', 'There is a lot of easy value here. Start with one well-defined workflow, such as weekly reporting or content repurposing, and prove the time saved before going further.']
      : pct < 70 ? ['Building momentum', 'You have the basics in place. The next step is to connect AI to your real workflows and data, with clear owners and review steps, so it saves hours every week rather than minutes.']
      : ['Ready to scale', 'You are ahead of most teams. Focus on agent workflows across research, content and sales, and on measuring the time and money they return.'];
    function p(g) { return Math.round(groups[g][0] / groups[g][1] * 100); }
    out.classList.add('show');
    out.innerHTML = '<p class="eyebrow">Your score</p><p class="big" style="margin-top:12px">' + pct + ' / 100</p><div class="meter"><i></i></div><p class="d3" style="margin-top:6px">' + band[0] + '</p><p style="margin-top:12px;max-width:720px">' + band[1] + '</p>' +
      '<div class="rows"><div><span class="small">Data and tools</span><b>' + p('data') + '%</b></div><div><span class="small">Workflows</span><b>' + p('work') + '%</b></div><div><span class="small">People and governance</span><b>' + p('people') + '%</b></div></div>' +
      '<p style="margin-top:36px"><a class="btn or" href="/contact/">Talk to us about your results <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" stroke-width="1.7"/></svg></a></p>';
    track('tool_complete', { tool_name: 'AI Readiness Score', score: pct });
    requestAnimationFrame(function () { out.querySelector('.meter i').style.width = pct + '%'; });
    out.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  });

  var bp = document.getElementById('budget');
  if (bp) {
    var splits = {
      'B2B-leads': [45, 10, 35, 10], 'B2B-awareness': [20, 25, 45, 10], 'B2B-sales': [55, 10, 25, 10],
      'B2C-leads': [45, 40, 5, 10], 'B2C-awareness': [20, 70, 0, 10], 'B2C-sales': [50, 40, 0, 10]
    };
    var calc = function () {
      var amt = parseFloat(bp.budget.value) || 0, cur = bp.currency.value, key = bp.audience.value + '-' + bp.goal.value, s = splits[key];
      var names = ['Google Ads', 'Meta', 'LinkedIn', 'Testing reserve'];
      var html = '<div class="rows" style="grid-template-columns:repeat(4,minmax(0,1fr))">' + s.map(function (v, i) { return '<div><span class="small">' + names[i] + ' (' + v + '%)</span><b>' + fmt(cur, amt * v / 100) + '</b></div>'; }).join('') + '</div>';
      document.getElementById('budget-out').innerHTML = html;
    };
    bp.addEventListener('input', function () { calc(); once('Ad Budget Planner'); }); calc();
  }

  var roi = document.getElementById('roi');
  if (roi) {
    var rc = function () {
      var v = function (n) { return parseFloat(roi[n].value) || 0; };
      var cur = roi.currency.value, spend = v('spend'), pieces = v('pieces'), visits = v('visits'), cr = v('cr') / 100, close = v('close') / 100, value = v('value');
      var totalVisits = 0;
      for (var m = 1; m <= 12; m++) { var live = pieces * (m - 1); totalVisits += live * visits; }
      var leads = totalVisits * cr, customers = leads * close, revenue = customers * value, cost = spend * 12;
      var mult = cost ? revenue / cost : 0;
      document.getElementById('roi-out').innerHTML = '<div class="rows"><div><span class="small">Visits in 12 months</span><b>' + Math.round(totalVisits).toLocaleString() + '</b></div><div><span class="small">Leads</span><b>' + Math.round(leads).toLocaleString() + '</b></div><div><span class="small">Customers</span><b>' + Math.round(customers).toLocaleString() + '</b></div><div><span class="small">Revenue</span><b>' + fmt(cur, revenue) + '</b></div><div><span class="small">Content spend</span><b>' + fmt(cur, cost) + '</b></div><div><span class="small">Return on spend</span><b>' + mult.toFixed(1) + 'x</b></div></div>';
    };
    roi.addEventListener('input', function () { rc(); once('Content ROI Calculator'); }); rc();
  }

  /* mobile: practice tabs on the homepage */
  document.querySelectorAll('.ptabs button').forEach(function (b) { b.addEventListener('click', function () {
    document.querySelectorAll('.ptabs button').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
    document.querySelectorAll('.psec').forEach(function (s) { var on = s.querySelector('.practice').dataset.p === b.dataset.p; s.classList.toggle('on', on); if (on) s.querySelectorAll('.rv').forEach(function (r) { r.classList.add('in'); }); });
    b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }); });
  /* mobile: case study detail toggle */
  document.querySelectorAll('.cs-toggle').forEach(function (b) { b.addEventListener('click', function () {
    var cs = b.closest('.cs'), open = !cs.classList.contains('deep');
    cs.classList.toggle('deep', open); b.setAttribute('aria-expanded', open ? 'true' : 'false');
  }); });

  /* landing page: practice explorer */
  var lpxNav = document.querySelectorAll('.lpx-nav button');
  if (lpxNav.length) {
    var mobile = function () { return window.matchMedia('(max-width: 820px)').matches; };
    var setOn = function (p) { lpxNav.forEach(function (x) { var on = x.dataset.p === p; x.classList.toggle('on', on); x.setAttribute('aria-selected', on ? 'true' : 'false'); }); };
    lpxNav.forEach(function (b) { b.addEventListener('click', function () {
      var p = b.dataset.p, s = document.querySelector('.lpx[data-p="' + p + '"]');
      setOn(p);
      if (mobile()) { document.querySelectorAll('.lpx').forEach(function (x) { x.classList.toggle('on', x === s); }); s.querySelectorAll('.rv').forEach(function (r) { r.classList.add('in'); }); b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); var nv = document.querySelector('.lpx-navsec'); if (nv.getBoundingClientRect().top < 70) window.scrollTo({ top: nv.getBoundingClientRect().top + scrollY - 64, behavior: 'smooth' }); }
      else s.scrollIntoView({ behavior: 'smooth' });
      track('lp_practice', { practice: b.textContent.trim() });
    }); });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { if (mobile()) return; es.forEach(function (e) { if (e.isIntersecting) setOn(e.target.dataset.p); }); }, { rootMargin: '-45% 0px -50% 0px' });
      document.querySelectorAll('.lpx').forEach(function (s) { io.observe(s); });
    }
  }
  document.querySelectorAll('[data-pick]').forEach(function (b) { b.addEventListener('click', function () {
    var sel = document.getElementById('lin'); if (sel) sel.value = b.dataset.pick;
    var f = document.getElementById('lead'); if (f) { f.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(function () { var i = document.getElementById('lfn'); if (i) i.focus({ preventScroll: true }); }, 600); }
    track('lp_pick', { practice: b.dataset.pick });
  }); });
})();
(function(){var w=document.getElementById('film');if(!w)return;var v=w.querySelector('video'),b=w.querySelector('.film-tg'),loaded=false,user=false;
var rm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function load(){if(loaded)return;loaded=true;var a=document.createElement('source');a.src=v.dataset.srcWebm;a.type='video/webm';var c=document.createElement('source');c.src=v.dataset.srcMp4;c.type='video/mp4';v.appendChild(a);v.appendChild(c);v.load();}
function play(){load();var p=v.play();if(p&&p.catch)p.catch(function(){});b.classList.remove('paused');b.setAttribute('aria-label','Pause film');}
function pause(){v.pause();b.classList.add('paused');b.setAttribute('aria-label','Play film');}
if(rm){b.classList.add('paused');b.setAttribute('aria-label','Play film');}
b.addEventListener('click',function(){user=true;if(v.paused){play();if(window.gtag)gtag('event','film_play');}else pause();});
var ready=false,inv=false;function go(){if(ready)return;ready=true;if(inv&&!rm)play();}
if(document.readyState==='complete')setTimeout(go,1800);else window.addEventListener('load',function(){setTimeout(go,1800);});
['scroll','pointerdown','keydown','touchstart'].forEach(function(n){window.addEventListener(n,function(){setTimeout(go,300);},{once:true,passive:true});});
if('IntersectionObserver' in window){new IntersectionObserver(function(es){es.forEach(function(e){inv=e.isIntersecting;if(!ready||rm||user&&v.paused&&loaded)return;if(e.isIntersecting)play();else if(loaded)v.pause();});},{rootMargin:'200px 0px'}).observe(w);}
})();
