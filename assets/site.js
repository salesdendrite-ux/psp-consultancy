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
    function show(i) {
      idx = i;
      items.forEach(function (el) { el.setAttribute('aria-selected', el.getAttribute('data-i') === String(i) ? 'true' : 'false'); });
      panels.forEach(function (el) { el.classList.toggle('active', el.getAttribute('data-i') === String(i)); });
    }
    function next() { show((idx + 1) % items.length); }
    function start() { stop(); timer = setInterval(function () { if (!paused) next(); }, 6000); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    items.forEach(function (el) {
      el.addEventListener('mouseenter', function () { paused = true; show(parseInt(el.getAttribute('data-i'), 10)); });
      el.addEventListener('click', function () { paused = true; show(parseInt(el.getAttribute('data-i'), 10)); });
      el.addEventListener('focus', function () { paused = true; show(parseInt(el.getAttribute('data-i'), 10)); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.location.href = el.getAttribute('data-href'); }
      });
    });
    rot.addEventListener('mouseleave', function () { paused = false; });
    document.addEventListener('click', function (e) { if (!rot.contains(e.target)) paused = false; });
    window.addEventListener('scroll', function () { paused = false; }, { passive: true });
    start();
  }

  // How we work: auto-cycle the active step 01 -> 04
  var steps = document.getElementById('step-rotator');
  if (steps) {
    var sEls = Array.prototype.slice.call(steps.children);
    var sIdx = 0;
    setInterval(function () {
      sIdx = (sIdx + 1) % sEls.length;
      sEls.forEach(function (el, i) { el.classList.toggle('active', i === sIdx); });
    }, 2800);
  }
})();
