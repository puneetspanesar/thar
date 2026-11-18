(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/hello@thar.co';

  /* dropdown menus */
  document.querySelectorAll('.has-dd').forEach(function (li) {
    var btn = li.querySelector('button');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = li.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
    li.addEventListener('mouseenter', function () { if (window.innerWidth > 860) { li.classList.add('open'); btn.setAttribute('aria-expanded', true); } });
    li.addEventListener('mouseleave', function () { li.classList.remove('open'); btn.setAttribute('aria-expanded', false); });
  });
  document.addEventListener('click', function () { document.querySelectorAll('.has-dd.open').forEach(function (li) { li.classList.remove('open'); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { document.querySelectorAll('.has-dd.open').forEach(function (li) { li.classList.remove('open'); }); closeM(); } });

  /* mobile menu */
  var m = document.querySelector('.mnav');
  function closeM() { if (m) { m.classList.remove('open'); document.body.style.overflow = ''; } }
  document.querySelectorAll('[data-open-menu]').forEach(function (b) { b.addEventListener('click', function () { m.classList.add('open'); document.body.style.overflow = 'hidden'; m.querySelector('a').focus(); }); });
  document.querySelectorAll('[data-close-menu]').forEach(function (b) { b.addEventListener('click', closeM); });

  /* reveal on scroll */
  var rv = document.querySelectorAll('.rv');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el, i) { el.style.transitionDelay = ((el.dataset.d || 0) * 90) + 'ms'; io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  /* carousel */
  document.querySelectorAll('.car').forEach(function (car) {
    var track = car.querySelector('.track'), slides = track.children, i = 0, timer = null, playing = !reduce;
    var pause = car.parentNode.querySelector('[data-pause]');
    function go(n) {
      i = (n + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-(slides[i].offsetLeft - slides[0].offsetLeft)) + 'px)';
    }
    function play() { stop(); if (playing) timer = setInterval(function () { go(i + 1); }, 6000); }
    function stop() { if (timer) clearInterval(timer); }
    car.parentNode.querySelector('[data-prev]').addEventListener('click', function () { go(i - 1); play(); });
    car.parentNode.querySelector('[data-next]').addEventListener('click', function () { go(i + 1); play(); });
    if (pause) pause.addEventListener('click', function () {
      playing = !playing; pause.setAttribute('aria-label', playing ? 'Pause' : 'Play');
      pause.innerHTML = playing ? '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="2" y="1" width="3.5" height="12" fill="#fff"/><rect x="8.5" y="1" width="3.5" height="12" fill="#fff"/></svg>' : '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1 L12 7 L3 13 Z" fill="#fff"/></svg>';
      playing ? play() : stop();
    });
    window.addEventListener('resize', function () { go(i); });
    play();
  });

  /* hero particle wave */
  var cv = document.querySelector('.hero canvas');
  if (cv && !reduce && cv.getContext) {
    var ctx = cv.getContext('2d'), glow = document.createElement('canvas'), gctx = glow.getContext('2d');
    var W, H, DPR = Math.min(window.devicePixelRatio || 1, 1.5), t0 = performance.now(), running = true, last = 0;
    var NX = 280, NZ = 100, N = NX * NZ, KB = 6, AB = 10;
    var bx = [], by = [], bs = [], bn = [];
    for (var k = 0; k < KB * AB; k++) { bx.push(new Float32Array(N)); by.push(new Float32Array(N)); bn.push(0); }
    var styles = [];
    for (var c = 0; c < KB; c++) for (var q = 0; q < AB; q++) {
      var cr = c / (KB - 1), al = (q + 1) / AB;
      styles.push('rgba(255,' + Math.round(70 + cr * 150) + ',' + Math.round(25 + cr * 170) + ',' + al.toFixed(2) + ')');
    }
    function size() {
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      glow.width = Math.max(1, Math.round(W / 5)); glow.height = Math.max(1, Math.round(H / 5));
    }
    size(); window.addEventListener('resize', size);
    new IntersectionObserver(function (es) { running = es[0].isIntersecting; if (running) requestAnimationFrame(frame); }).observe(cv);
    function frame(now) {
      if (!running) return;
      requestAnimationFrame(frame);
      if (now - last < 30) return;
      last = now;
      var t = (now - t0) / 1000; window.__tharFrame = (window.__tharFrame || 0) + 1;
      for (var k = 0; k < bn.length; k++) bn[k] = 0;
      var narrow = W < 860, cx = narrow ? W * 0.5 : W * 0.66, sx = narrow ? W * 0.55 : W * 0.38;
      for (var iz = 0; iz < NZ; iz++) {
        var Z = 0.2 + iz / NZ * 2.0, fade = Math.max(0, Math.min(1, 1.3 - Z / 2.2));
        for (var ix = 0; ix < NX; ix++) {
          var X = -1.8 + ix / NX * 3.6;
          var Y = 0.18 * Math.sin(2.6 * X + 1.7 * Z + t * 0.6) + 0.08 * Math.sin(4.7 * X - 2.9 * Z + 1.3 - t * 0.4) + 0.05 * Math.cos(7 * Z + X + t * 0.3);
          var px = cx + X / Z * sx, py = H * 0.3 + (Y + 0.36) / Z * H * 0.56;
          if (px < 0 || px > W || py < 0 || py > H) continue;
          var crest = Math.max(0, Math.min(1, (Y + 0.18) / 0.36));
          var side = narrow ? 1 : Math.max(0, Math.min(1, (px - W * 0.18) / (W * 0.3)));
          var a = Math.min(1, (0.22 + crest * crest * crest * 1.1) * fade * side * (narrow ? 0.45 : 1));
          if (a < 0.05) continue;
          var bk = Math.min(KB - 1, Math.floor(crest * KB)) * AB + Math.min(AB - 1, Math.floor(a * AB));
          var n = bn[bk]; bx[bk][n] = px; by[bk][n] = py; bn[bk] = n + 1;
        }
      }
      ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (var k2 = 0; k2 < bn.length; k2++) {
        var cnt = bn[k2]; if (!cnt) continue;
        ctx.fillStyle = styles[k2];
        var s = 1.3 + (Math.floor(k2 / AB) / (KB - 1)) * 1.1, X2 = bx[k2], Y2 = by[k2];
        for (var i2 = 0; i2 < cnt; i2++) ctx.fillRect(X2[i2], Y2[i2], s, s);
      }
      gctx.clearRect(0, 0, glow.width, glow.height);
      gctx.drawImage(cv, 0, 0, glow.width, glow.height);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.filter = 'blur(' + Math.round(12 * DPR) + 'px)';
      ctx.drawImage(glow, 0, 0, cv.width, cv.height); if (!narrow) ctx.drawImage(glow, 0, 0, cv.width, cv.height);
      ctx.restore(); ctx.filter = 'none';
    }
    requestAnimationFrame(function (n) { frame(n); var p = document.querySelector('.hero .poster'); if (p) p.style.opacity = 0; cv.style.opacity = 1; });
  }

  /* forms */
  document.querySelectorAll('form[data-send]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (f.querySelector('.hp input') && f.querySelector('.hp input').value) return;
      var data = {}; new FormData(f).forEach(function (v, k) { data[k] = v; });
      data._subject = 'Thar website: ' + (f.dataset.send || 'Enquiry');
      var btn = f.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Sending...';
      fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(); f.innerHTML = '<p class="done">Thank you. We will be in touch within one working day.</p>'; })
        .catch(function () { btn.disabled = false; btn.textContent = 'Send'; alertBox(f, 'Something went wrong. Please email hello@thar.co instead.'); });
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
    out.innerHTML = '<p class="label or">Your score</p><p class="big" style="margin-top:12px">' + pct + ' / 100</p><div class="meter"><i></i></div><p class="h4">' + band[0] + '</p><p style="margin-top:12px;max-width:720px">' + band[1] + '</p>' +
      '<div class="rows"><div><span class="small">Data and tools</span><b>' + p('data') + '%</b></div><div><span class="small">Workflows</span><b>' + p('work') + '%</b></div><div><span class="small">People and governance</span><b>' + p('people') + '%</b></div></div>' +
      '<p style="margin-top:36px"><a class="go" href="/contact/">Talk to us about your results <span class="sq"><svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5 L10.5 8 L6 12.5" fill="none" stroke="#fff" stroke-width="2"/></svg></span></a></p>';
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
    bp.addEventListener('input', calc); calc();
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
    roi.addEventListener('input', rc); rc();
  }
})();
