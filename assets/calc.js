(function () {
  var $ = function (id) { return document.getElementById(id); };
  var inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
  var inr0 = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  var num = function (id) { var v = parseFloat(($(id) || {}).value); return isFinite(v) && v >= 0 ? v : 0; };
  var row = function (k, v) { return '<div class="row"><span>' + k + '</span><b>' + v + '</b></div>'; };
  var root = document.querySelector('[data-calc]'); if (!root) return;
  var type = root.getAttribute('data-calc'), out = $('result');

  function gst() {
    var amt = num('amount'), sel = $('rate').value;
    var rate = sel === 'custom' ? num('custom') : parseFloat(sel);
    $('custom-field').style.display = sel === 'custom' ? 'block' : 'none';
    var inclusive = $('mode').value === 'inclusive', inter = $('supply').value === 'inter';
    var base = inclusive ? amt / (1 + rate / 100) : amt;
    var tax = inclusive ? amt - base : amt * rate / 100;
    var total = base + tax, h = '';
    h += '<h3>GST breakdown</h3><div class="big">' + inr.format(tax) + '</div><div class="meta" style="color:#B7C4D3;margin-bottom:14px">GST at ' + rate + '%</div>';
    h += row('Value before GST', inr.format(base));
    if (inter) { h += row('IGST (' + rate + '%)', inr.format(tax)); }
    else { h += row('CGST (' + rate / 2 + '%)', inr.format(tax / 2)) + row('SGST/UTGST (' + rate / 2 + '%)', inr.format(tax / 2)); }
    h += row('Total invoice value', inr.format(total));
    out.innerHTML = h;
  }

  function epf() {
    var w = num('wages'), ceil = parseFloat($('ceiling').value), actual = $('actual').checked;
    function calc(c) {
      var epsW = Math.min(w, c), pfW = actual ? w : epsW;
      var emp = Math.round(pfW * 0.12), eps = Math.round(epsW * 0.0833), erPf = Math.round(pfW * 0.12) - eps;
      var admin = pfW * 0.005, edli = epsW * 0.005;
      return { pfW: pfW, emp: emp, eps: eps, erPf: erPf, admin: admin, edli: edli, erTotal: emp + admin + edli };
    }
    var n = calc(ceil), o = calc(15000), h = '';
    h += '<h3>Monthly EPF contribution</h3><div class="big">' + inr0.format(n.emp) + '</div><div class="meta" style="color:#B7C4D3;margin-bottom:14px">Employee share (12% of ' + inr0.format(n.pfW) + ')</div>';
    h += row('Employer to EPS (8.33%)', inr0.format(n.eps)) + row('Employer to EPF (3.67%)', inr0.format(n.erPf));
    h += row('EDLI (0.5%, indicative)', inr.format(n.edli)) + row('EPF admin charge (0.5%, indicative)', inr.format(n.admin));
    h += row('Total employer cost / month', inr.format(n.erTotal)) + row('Total employer cost / year', inr0.format(n.erTotal * 12));
    if (ceil === 25000 && w > 15000 && !actual) {
      h += '<div class="warn">Versus the old \u20b915,000 ceiling: employee share +' + inr0.format(n.emp - o.emp) + ' and employer cost +' + inr0.format(n.erTotal - o.erTotal) + ' per month.</div>';
    }
    out.innerHTML = h;
  }

  function upi() {
    var a = num('amount'), cat = $('category').value, gstOn = $('gston').checked, count = Math.max(1, Math.floor(num('count')) || 1);
    var m = 0, why = '';
    if (cat === 'small') { m = 0; why = 'Exempt while the merchant qualifies as a small merchant (up to \u20b91 lakh a month received through UPI QR into a bank account).'; }
    else if (a <= 2000) { m = 0; why = 'Payments up to \u20b92,000 carry no MDR.'; }
    else if (cat === 'standard') { m = Math.min(a * 0.004, 300); why = a * 0.004 > 300 ? 'The \u20b9300 cap applies (0.4% would be ' + inr.format(a * 0.004) + ').' : '0.4% of the payment value.'; }
    else if (cat === 'sector') { m = 5; why = 'Flat \u20b95 for specified sectors (railways, telecom, insurance, fuel, agricultural inputs, utility bills) above \u20b92,000.'; }
    else if (cat === 'capital') { m = Math.min(a * 0.0002, 300); why = '0.02% for mutual funds, securities and stockbrokers, capped at \u20b9300.'; }
    var g = gstOn ? m * 0.18 : 0, cost = m + g, h = '';
    h += '<h3>Cost per payment</h3><div class="big">' + inr.format(cost) + '</div><div class="meta" style="color:#B7C4D3;margin-bottom:14px">' + (a ? (cost / a * 100).toFixed(3) + '% of the payment' : '') + '</div>';
    h += row('MDR', inr.format(m)) + row('GST on MDR (18%, reported)', inr.format(g)) + row('Net received per payment', inr.format(a - cost));
    if (count > 1) h += row('Total MDR + GST for ' + count + ' payments', inr.format(cost * count));
    h += '<div class="warn">' + why + ' Confirm the final charge on your acquiring bank\u2019s invoice.</div>';
    out.innerHTML = h;
  }

  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var fmt = function (d) { return d.getUTCDate() + ' ' + MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); };
  function addMonths(d, n) {
    var y = d.getUTCFullYear(), m = d.getUTCMonth() + n, day = d.getUTCDate();
    var ty = y + Math.floor(m / 12), tm = ((m % 12) + 12) % 12;
    var dim = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate();
    return new Date(Date.UTC(ty, tm, Math.min(day, dim)));
  }
  function exp() {
    var v = $('date').value, kind = $('kind').value, cur = $('cur').value;
    if (!v) { out.innerHTML = '<h3>Realisation date</h3><p>Choose a date to see the deadline.</p>'; return; }
    var p = v.split('-'), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
    var months = cur === 'inr' ? 12 : 9, due = addMonths(d, months);
    var now = new Date(), today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    var left = Math.round((due - today) / 86400000);
    var h = '<h3>Realisation deadline</h3><div class="big">' + fmt(due) + '</div><div class="meta" style="color:#B7C4D3;margin-bottom:14px">' + months + ' months from the ' + (kind === 'goods' ? 'date of shipment' : 'invoice date') + '</div>';
    h += row(kind === 'goods' ? 'Shipment date' : 'Invoice date', fmt(d));
    h += row('Days remaining', left >= 0 ? left + ' days' : 'Overdue by ' + Math.abs(left) + ' days');
    if (kind === 'services') {
      var eom = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)), edf = new Date(eom.getTime() + 30 * 86400000);
      h += row('EDF for this invoice month due by', fmt(edf));
    }
    if (d < new Date(Date.UTC(2026, 5, 5))) h += '<div class="warn">This date falls before 5 June 2026, when an earlier, longer window (15 months) may have applied. Confirm with your authorised dealer bank.</div>';
    h += '<div class="warn">Banks can extend the period on request. This tool shows the standard period only.</div>';
    out.innerHTML = h;
  }

  var fn = { gst: gst, epf: epf, upi: upi, export: exp }[type];
  root.addEventListener('input', fn); root.addEventListener('change', fn); fn();
})();
