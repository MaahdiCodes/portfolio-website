/* Odoo ROI model — Bangladesh. Pure functions, no DOM.
   Mirrors the method in /lab/0048-odoo-roi-calculator-bangladesh:
   5 benefit categories, 3-year TCO, and a realistic post-go-live ramp
   (benefits don't start on day 1). Works in the browser (window.MHCalc.roi)
   and in Node (module.exports) so it can be unit-tested. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.MHCalc = root.MHCalc || {}; root.MHCalc.roi = api; }
})(typeof self !== 'undefined' ? self : this, function () {

  // Month (post go-live) each benefit starts, and months to reach full run-rate.
  // From the ramp curve in article 0048: hypercare months 1–3 ≈ zero benefit;
  // labour + procurement from month 4; inventory + finance from month 7;
  // production/waste from month 10 once BOM accuracy has history behind it.
  var RAMP = {
    labour:      { start: 4,  rampMonths: 3 },
    procurement: { start: 4,  rampMonths: 3 },
    inventory:   { start: 7,  rampMonths: 3 },
    finance:     { start: 7,  rampMonths: 3 },
    production:  { start: 10, rampMonths: 4 }
  };

  var DEFAULTS = {
    // Benefits
    adminStaff: 10, adminSalary: 25000, labourGainPct: 20,
    inventoryValue: 30000000, inventoryCutPct: 12, costOfCapitalPct: 11, carryingCostPct: 3,
    procurementSpend: 50000000, procurementSavePct: 2,
    productionValue: 0, wasteNowPct: 4, wasteAfterPct: 3,
    arBalance: 20000000, dsoNow: 45, dsoCutDays: 10,
    // Costs (BDT)
    implementation: 1800000, internalTeam: 500000, trainingInitial: 250000, hardwareOneTime: 100000,
    licenceAnnual: 300000, hostingAnnual: 150000, supportAnnual: 300000, trainingAnnual: 50000,
    // Scenario multiplier applied to all benefits
    scenario: 'conservative'
  };

  var SCENARIO = { conservative: 1.0, expected: 1.25, optimistic: 1.5 };

  function n(v) { v = Number(v); return isFinite(v) ? v : 0; }

  // Full run-rate annual benefit per category (BDT/year)
  function annualBenefits(i) {
    var labour = n(i.adminStaff) * n(i.adminSalary) * 12 * n(i.labourGainPct) / 100;
    var freed = n(i.inventoryValue) * n(i.inventoryCutPct) / 100;
    var inventory = freed * (n(i.costOfCapitalPct) + n(i.carryingCostPct)) / 100;
    var procurement = n(i.procurementSpend) * n(i.procurementSavePct) / 100;
    var wasteCut = Math.max(0, n(i.wasteNowPct) - n(i.wasteAfterPct));
    var production = n(i.productionValue) * wasteCut / 100;
    var dsoNow = n(i.dsoNow);
    var dailyRevenue = dsoNow > 0 ? n(i.arBalance) / dsoNow : 0;
    var cutDays = Math.min(n(i.dsoCutDays), dsoNow);
    var freedAR = dailyRevenue * cutDays;
    var finance = freedAR * n(i.costOfCapitalPct) / 100;
    var mult = SCENARIO[i.scenario] || 1;
    return {
      labour: labour * mult, inventory: inventory * mult, procurement: procurement * mult,
      production: production * mult, finance: finance * mult,
      freedInventory: freed, freedAR: freedAR
    };
  }

  // Share of full run-rate realised in a given month (1-based, post go-live)
  function rampFactor(cat, month) {
    var r = RAMP[cat];
    if (month < r.start) return 0;
    var k = (month - r.start + 1) / r.rampMonths;
    return Math.min(1, k);
  }

  function calculate(input) {
    var i = Object.assign({}, DEFAULTS, input || {});
    var ab = annualBenefits(i);
    var cats = ['labour', 'inventory', 'procurement', 'production', 'finance'];

    var oneTime = n(i.implementation) + n(i.internalTeam) + n(i.trainingInitial) + n(i.hardwareOneTime);
    var recurring = n(i.licenceAnnual) + n(i.hostingAnnual) + n(i.supportAnnual) + n(i.trainingAnnual);

    var monthly = []; // cumulative net cash position by month 0..36
    var cum = -oneTime;
    monthly.push(cum);
    var yearBenefit = [0, 0, 0];
    var paybackMonth = null;
    for (var m = 1; m <= 36; m++) {
      var b = 0;
      cats.forEach(function (c) { b += ab[c] / 12 * rampFactor(c, m); });
      yearBenefit[Math.floor((m - 1) / 12)] += b;
      cum += b - recurring / 12;
      monthly.push(cum);
      if (paybackMonth === null && cum >= 0) paybackMonth = m;
    }

    var fullAnnual = cats.reduce(function (s, c) { return s + ab[c]; }, 0);
    var benefits3 = yearBenefit[0] + yearBenefit[1] + yearBenefit[2];
    var tco3 = oneTime + recurring * 3;
    var roiPct = tco3 > 0 ? (benefits3 - tco3) / tco3 * 100 : 0;
    // The simple formula from article 0048 (no ramp) — shown for comparison.
    var simplePayback = fullAnnual > 0 ? tco3 / (fullAnnual / 12) : null;

    var verdict;
    if (tco3 <= 0 || fullAnnual <= 0) verdict = 'incomplete';
    else if (roiPct < 0) verdict = 'negative';
    else if (roiPct < 100) verdict = 'caution';
    else if (roiPct < 200) verdict = 'acceptable';
    else if (roiPct <= 400) verdict = 'good';
    else verdict = 'check';

    return {
      annual: ab, fullAnnual: fullAnnual, yearBenefit: yearBenefit,
      oneTime: oneTime, recurring: recurring, tco3: tco3,
      benefits3: benefits3, net3: benefits3 - tco3, roiPct: roiPct,
      paybackMonth: paybackMonth, simplePaybackMonths: simplePayback,
      cumulative: monthly, verdict: verdict
    };
  }

  return { DEFAULTS: DEFAULTS, RAMP: RAMP, SCENARIO: SCENARIO, annualBenefits: annualBenefits, rampFactor: rampFactor, calculate: calculate };
});
