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
})();
