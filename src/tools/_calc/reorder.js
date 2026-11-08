/* Reorder point, safety stock and order quantity. Pure functions, no DOM.
   Works in the browser (window.MHReorder) and in Node (module.exports) for tests.

   Safety stock uses the standard combined-variability formula:
     SS = z × √( L × σd² + d² × σL² )
   where d = average daily usage, σd = std. deviation of daily usage,
   L = average lead time in days, σL = std. deviation of lead time in days.
   Reorder point = d × L + SS.
   Order quantity is the economic order quantity (EOQ):
     EOQ = √( 2 × D × S / H ),  D = annual usage, S = cost per order, H = holding cost per unit per year. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MHReorder = factory();
})(typeof self !== "undefined" ? self : this, function () {
  // One-sided normal z-scores for common cycle service levels.
  var Z = { 0.85: 1.036, 0.9: 1.282, 0.95: 1.645, 0.975: 1.96, 0.98: 2.054, 0.99: 2.326, 0.995: 2.576 };
  // Coefficient of variation used when the user picks "how steady is usage" instead of a std. deviation.
  var CV = { steady: 0.25, variable: 0.5, lumpy: 0.9 };

  function z(level) {
    if (Z[level] != null) return Z[level];
    throw new Error("Unsupported service level: " + level);
  }

  function calc(inp) {
    var d = Math.max(0, +inp.dailyUsage || 0);
    var L = Math.max(0, +inp.leadDays || 0);
    var sdD = inp.usageSd != null && inp.usageSd !== "" ? Math.max(0, +inp.usageSd) : d * (CV[inp.variability] != null ? CV[inp.variability] : CV.variable);
    var sdL = Math.max(0, +inp.leadSd || 0);
    var level = +inp.serviceLevel || 0.95;
    var days = Math.max(1, +inp.workDays || 300);
    var cost = Math.max(0, +inp.unitCost || 0);
    var orderCost = Math.max(0, +inp.orderCost || 0);
    var holdPct = Math.max(0, +inp.holdPct || 0) / 100;
    var moq = Math.max(0, +inp.moq || 0);

    var sigma = Math.sqrt(L * sdD * sdD + d * d * sdL * sdL);
    var ss = z(level) * sigma;
    var leadDemand = d * L;
    var rop = leadDemand + ss;

    var annual = d * days;
    var H = cost * holdPct;
    var eoq = H > 0 && orderCost > 0 ? Math.sqrt((2 * annual * orderCost) / H) : NaN;
    var q = isFinite(eoq) ? Math.max(eoq, moq) : moq || NaN;

    var avgStock = ss + (isFinite(q) ? q / 2 : 0);
    var res = {
      sdUsed: sdD,
      sigmaLead: sigma,
      z: z(level),
      safetyStock: Math.ceil(ss),
      leadDemand: leadDemand,
      reorderPoint: Math.ceil(rop),
      annualUsage: annual,
      eoq: eoq,
      orderQty: isFinite(q) ? Math.ceil(q) : NaN,
      ordersPerYear: isFinite(q) && q > 0 ? annual / q : NaN,
      daysBetweenOrders: isFinite(q) && d > 0 ? q / d : NaN,
      safetyStockValue: Math.ceil(ss) * cost,
      avgStockUnits: avgStock,
      avgStockValue: avgStock * cost,
      holdingCostYear: avgStock * H,
      orderingCostYear: isFinite(q) && q > 0 ? (annual / q) * orderCost : NaN,
      coverDays: d > 0 ? Math.ceil(rop) / d : NaN
    };
    // Same item at other service levels, to show what the last few percent cost.
    res.levels = [0.9, 0.95, 0.975, 0.99].map(function (lv) {
      var s = Math.ceil(z(lv) * sigma);
      return { level: lv, safetyStock: s, reorderPoint: Math.ceil(leadDemand + s), value: s * cost, holding: s * H };
    });
    return res;
  }

  return { calc: calc, Z: Z, CV: CV };
});
