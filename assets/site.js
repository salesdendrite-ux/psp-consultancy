(function () {
  var hdr = document.querySelector('.site-header');
  var btn = document.querySelector('.nav-toggle');
  if (btn && hdr) {
    btn.addEventListener('click', function () {
      var open = hdr.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  var y = document.getElementById('yr'); if (y) y.textContent = new Date().getFullYear();

  // Contact form: opens the visitor's email app with the enquiry pre-filled (static site, no server)
  var f = document.getElementById('enquiry-form');
  if (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (id) { return (document.getElementById(id) || {}).value || ''; };
      var subject = 'Enquiry: ' + (v('f-service') || 'General') + ' - ' + v('f-name');
      var body = 'Name: ' + v('f-name') + '\nEmail: ' + v('f-email') + '\nPhone: ' + v('f-phone') +
                 '\nService: ' + v('f-service') + '\n\n' + v('f-message') +
                 '\n\n(Consent given to be contacted about this enquiry.)';
      window.location.href = 'mailto:' + f.getAttribute('data-to') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }

  // Services rotator: auto-advance every 6s, pause on hover/focus, resume after
  var rot = document.getElementById('svc-rotator');
  if (rot) {
    var items = Array.prototype.slice.call(rot.querySelectorAll('.svc-list li'));
    var panels = Array.prototype.slice.call(rot.querySelectorAll('.svc-panel'));
    var idx = 0, timer = null, paused = false;
    function setPaused(v) {
      paused = v;
      items.forEach(function (el) { el.classList.toggle('paused', v); });
    }
    function restartBar() {
      // The progress fill is the active item's own bottom border (no separate
      // bar element). Drop 'run' from every item and reflow, then add it back
      // only to the now-active one, so its border-line fill restarts from 0%.
      items.forEach(function (el) { el.classList.remove('run'); });
      void rot.offsetWidth;
      items[idx].classList.add('run');
      items.forEach(function (el) { el.classList.toggle('paused', paused); });
    }
    function show(i) {
      idx = i;
      items.forEach(function (el) { el.setAttribute('aria-selected', el.getAttribute('data-i') === String(i) ? 'true' : 'false'); });
      panels.forEach(function (el) { el.classList.toggle('active', el.getAttribute('data-i') === String(i)); });
      restartBar();
    }
    function next() { show((idx + 1) % items.length); }
    function start() { stop(); timer = setInterval(function () { if (!paused) next(); }, 6000); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    items.forEach(function (el) {
      el.addEventListener('mouseenter', function () { setPaused(true); show(parseInt(el.getAttribute('data-i'), 10)); });
      el.addEventListener('click', function () { setPaused(true); show(parseInt(el.getAttribute('data-i'), 10)); });
      el.addEventListener('focus', function () { setPaused(true); show(parseInt(el.getAttribute('data-i'), 10)); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.location.href = el.getAttribute('data-href'); }
      });
    });
    rot.addEventListener('mouseleave', function () { setPaused(false); });
    document.addEventListener('click', function (e) { if (!rot.contains(e.target)) setPaused(false); });
    window.addEventListener('scroll', function () { setPaused(false); }, { passive: true });
    restartBar(); // start the first item's border-line fill immediately, not just on first auto-advance
    start();
  }

  // Insights carousel: always-rotating window of full cards. The DOM holds the real
  // cards once plus one decorative (aria-hidden) copy, just enough to let the strip
  // step forward forever and snap back invisibly once it lines up with the real set
  // again - never a "wall" of duplicated, readable content.
  var iCarousel = document.getElementById('insight-carousel');
  var iTrack = document.getElementById('insight-track');
  if (iCarousel && iTrack) {
    var iCount = parseInt(iCarousel.getAttribute('data-count'), 10) || 0;
    var iIdx = 0, iPaused = false;
    function iCardStep() {
      var first = iTrack.children[0];
      if (!first) return 0;
      var w = first.getBoundingClientRect().width;
      var gap = parseFloat(getComputedStyle(iTrack).columnGap || getComputedStyle(iTrack).gap || '0') || 0;
      return w + gap;
    }
    function iVisibleCount() {
      var step = iCardStep();
      return step ? Math.max(1, Math.round(iCarousel.clientWidth / step)) : 1;
    }
    function iReset() {
      iTrack.style.transition = 'none';
      iIdx = 0;
      iTrack.style.transform = 'translateX(0px)';
      void iTrack.offsetWidth;
      iTrack.style.transition = '';
    }
    function iTick() {
      if (iPaused || iCount < 2 || iCount < iVisibleCount()) return;
      if (iIdx >= iCount) iReset();
      iIdx += 1;
      iTrack.style.transform = 'translateX(-' + (iIdx * iCardStep()) + 'px)';
    }
    setInterval(iTick, 4500);
    iCarousel.addEventListener('mouseenter', function () { iPaused = true; });
    iCarousel.addEventListener('mouseleave', function () { iPaused = false; });
    window.addEventListener('resize', iReset);
  }

  // How we work: auto-cycle the active step 01 -> 04. Below the cards, a
  // 4-segment progress bar (one segment per step, story-style) fills the
  // current step's segment over its dwell time and marks earlier ones done.
  var steps = document.getElementById('step-rotator');
  if (steps) {
    var sEls = Array.prototype.slice.call(steps.querySelectorAll(':scope > div[data-i]'));
    var segs = Array.prototype.slice.call(document.querySelectorAll('#step-progress .step-seg'));
    var sIdx = 0;
    function updateSegs() {
      segs.forEach(function (seg) { seg.classList.remove('run'); });
      void (segs[0] && segs[0].offsetWidth);
      segs.forEach(function (seg, i) {
        seg.classList.toggle('done', i < sIdx);
        if (i === sIdx) seg.classList.add('run');
      });
    }
    updateSegs();
    setInterval(function () {
      sIdx = (sIdx + 1) % sEls.length;
      sEls.forEach(function (el, i) { el.classList.toggle('active', i === sIdx); });
      updateSegs();
    }, 2800);
  }
})();
