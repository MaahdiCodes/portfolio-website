/* Import duty & landed-cost calculator — Bangladesh.
   Cascade used by Bangladesh Customs (bangladeshcustoms.gov.bd enquiry #81 and
   standard practice):
     AV  = CIF + landing charge (1% of CIF)
     CD  = AV × CD%          RD = AV × RD%
     SD  = (AV + CD + RD) × SD%
     VAT = (AV + CD + RD + SD) × VAT%
     AIT = AV × AIT%         AT = (AV + CD + RD + SD) × AT%
   CD, RD and SD are sunk costs. VAT and AT are creditable for VAT-registered
   importers in their VAT return; AIT is adjustable against income tax.
   Rates change by HS code and by budget, so every rate is an input. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.MHCalc = root.MHCalc || {}; root.MHCalc.duty = api; }
})(typeof self !== 'undefined' ? self : this, function () {

  var PRESETS = {
    // Starting values only — confirm against the tariff for the HS code.
    commercial:   { cd: 25, rd: 3, sd: 0, vat: 15, ait: 5, at: 7.5 },
    manufacturer: { cd: 5, rd: 0, sd: 0, vat: 15, ait: 4, at: 0 },
    capital:      { cd: 1, rd: 0, sd: 0, vat: 15, ait: 1, at: 0 }
  };
  var LANDING_PCT = 1;

  function n(v) { v = Number(v); return isFinite(v) ? v : 0; }

  /* i: fob, freight, insurance (foreign currency), fx (BDT per unit), qty,
        cd, rd, sd, vat, ait, at (percent), localCosts (BDT: C&F, port, transport),
        vatRegistered (bool) */
  function calculate(i) {
    var fx = n(i.fx);
    var cifFx = n(i.fob) + n(i.freight) + n(i.insurance);
    var cif = cifFx * fx;
    var landing = cif * LANDING_PCT / 100;
    var av = cif + landing;
    var cd = av * n(i.cd) / 100;
    var rd = av * n(i.rd) / 100;
    var sdBase = av + cd + rd;
    var sd = sdBase * n(i.sd) / 100;
    var vatBase = sdBase + sd;
    var vat = vatBase * n(i.vat) / 100;
    var ait = av * n(i.ait) / 100;
    var at = vatBase * n(i.at) / 100;
    var taxes = cd + rd + sd + vat + ait + at;
    var sunk = cd + rd + sd;
    var recoverable = i.vatRegistered ? vat + at : 0;
    var adjustable = ait; // against income tax — cash flow, not cost
    var nonRecoverable = i.vatRegistered ? 0 : vat + at;
    var local = n(i.localCosts);
    var landed = cif + sunk + nonRecoverable + local;
    var qty = n(i.qty);
    return {
      cifFx: cifFx, cif: cif, landing: landing, av: av,
      cd: cd, rd: rd, sd: sd, vat: vat, ait: ait, at: at,
      taxes: taxes, tti: av > 0 ? taxes / av * 100 : 0,
      sunk: sunk, recoverable: recoverable, adjustable: adjustable, nonRecoverable: nonRecoverable,
      cashAtPort: taxes + local, landed: landed, perUnit: qty > 0 ? landed / qty : null,
      landedUplift: cif > 0 ? (landed - cif) / cif * 100 : 0
    };
  }

  return { PRESETS: PRESETS, LANDING_PCT: LANDING_PCT, calculate: calculate };
});
