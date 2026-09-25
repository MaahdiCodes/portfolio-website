/* RMG minimum wage + payroll calculator — Bangladesh.
   Source data (verified September 2026):
   - Grades: Minimum Wage Board gazette for the RMG sector, effective 1 Dec 2023
     (5 worker grades + apprentice). Medical 750, conveyance 450, food 1,250 are fixed;
     house rent is 50% of basic.
   - Annual increment: 5% of basic under the 2023 gazette; raised to 9% by the
     January 2025 gazette, effective 1 Dec 2024, "until the Minimum Wage Board
     announces the next minimum wage". Applied here on basic, each December.
   - Overtime: Bangladesh Labour Act 2006 s.108 — twice the ordinary basic rate;
     hourly basic = basic ÷ 208 (standard 48-hour week × 52 ÷ 12).
   - Festival bonus: Bangladesh Labour Rules 2015 r.111 — two per year, each up to
     one month's basic, for workers with ≥ 1 year continuous service.
   Pure functions — window.MHCalc.wage in the browser, module.exports in Node. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.MHCalc = root.MHCalc || {}; root.MHCalc.wage = api; }
})(typeof self !== 'undefined' ? self : this, function () {

  var FIXED = { medical: 750, conveyance: 450, food: 1250 };
  var GRADES = [
    { id: 'g1', basic: 8200, en: 'Grade 1', bn: 'গ্রেড ১' },
    { id: 'g2', basic: 7800, en: 'Grade 2', bn: 'গ্রেড ২' },
    { id: 'g3', basic: 7400, en: 'Grade 3', bn: 'গ্রেড ৩' },
    { id: 'g4', basic: 7050, en: 'Grade 4', bn: 'গ্রেড ৪' },
    { id: 'g5', basic: 6700, en: 'Grade 5 (entry)', bn: 'গ্রেড ৫ (এন্ট্রি)' },
    { id: 'app', basic: 4950, en: 'Apprentice (max 3+3 months)', bn: 'শিক্ষানবিশ (সর্বোচ্চ ৩+৩ মাস)', apprentice: true }
  ];
  var STRUCTURE_START = new Date(Date.UTC(2023, 11, 1)); // 1 Dec 2023
  var INCREMENT_HISTORY = [ // effective December of year → rate on basic
    { year: 2024, pct: 9 }   // 5% + 4% additional (gazette Jan 2025, effective 1 Dec 2024)
  ];
  var DEFAULT_INCREMENT = 9;
  var OT_DIVISOR = 208;

  function grade(id) { for (var i = 0; i < GRADES.length; i++) if (GRADES[i].id === id) return GRADES[i]; return GRADES[4]; }

  // Number of December increments a worker has received by `asOf`,
  // given they were on this structure since `joined` (never earlier than Dec 2023).
  // An increment is due each December after completing one year of service.
  function incrementsDue(joined, asOf) {
    var start = joined > STRUCTURE_START ? joined : STRUCTURE_START;
    var count = 0;
    var anniversary = new Date(Date.UTC(start.getUTCFullYear() + 1, start.getUTCMonth(), start.getUTCDate()));
    while (anniversary <= asOf) { count++; anniversary = new Date(Date.UTC(anniversary.getUTCFullYear() + 1, anniversary.getUTCMonth(), anniversary.getUTCDate())); }
    return count;
  }

  function breakdown(basic) {
    var houseRent = basic * 0.5;
    return { basic: basic, houseRent: houseRent, medical: FIXED.medical, conveyance: FIXED.conveyance, food: FIXED.food,
             gross: basic + houseRent + FIXED.medical + FIXED.conveyance + FIXED.food };
  }

  /* opts: gradeId, joined (Date), asOf (Date), incrementPct, otHours, absentDays,
           attendanceBonus, workingDays (month length for absence), stampDeduction */
  function payslip(opts) {
    var g = grade(opts.gradeId);
    var inc = g.apprentice ? 0 : incrementsDue(opts.joined || STRUCTURE_START, opts.asOf || new Date());
    var pct = opts.incrementPct == null ? DEFAULT_INCREMENT : Number(opts.incrementPct);
    var basic = g.basic * Math.pow(1 + pct / 100, inc);
    basic = Math.round(basic);
    var b = breakdown(basic);
    var otRate = basic / OT_DIVISOR * 2;
    var ot = otRate * (Number(opts.otHours) || 0);
    var days = Number(opts.workingDays) || 30;
    var absent = Math.min(Number(opts.absentDays) || 0, days);
    var absenceDeduction = basic / days * absent;
    var attendance = absent > 0 ? 0 : (Number(opts.attendanceBonus) || 0);
    var stamp = Number(opts.stampDeduction) || 0;
    var net = b.gross + ot + attendance - absenceDeduction - stamp;
    var serviceYears = opts.joined ? (opts.asOf - opts.joined) / (365.25 * 864e5) : 0;
    return {
      grade: g, increments: inc, incrementPct: pct, b: b, otRate: otRate, ot: ot,
      absenceDeduction: absenceDeduction, attendance: attendance, stamp: stamp, net: net,
      festivalBonusEach: serviceYears >= 1 ? basic : 0, festivalEligible: serviceYears >= 1
    };
  }

  /* Factory-level monthly and annual payroll cost.
     headcount: { g1: n, ... }, otHoursAvg, incrementsAvg (years on structure), attendanceBonus */
  function factory(opts) {
    var pct = opts.incrementPct == null ? DEFAULT_INCREMENT : Number(opts.incrementPct);
    var rows = [], monthly = 0, festival = 0, workers = 0, otTotal = 0;
    GRADES.forEach(function (g) {
      var n = Number((opts.headcount || {})[g.id]) || 0;
      if (!n) return;
      var basic = Math.round(g.basic * Math.pow(1 + pct / 100, g.apprentice ? 0 : (Number(opts.incrementsAvg) || 0)));
      var b = breakdown(basic);
      var ot = basic / OT_DIVISOR * 2 * (Number(opts.otHoursAvg) || 0);
      var att = Number(opts.attendanceBonus) || 0;
      var perHead = b.gross + ot + att;
      rows.push({ grade: g, n: n, basic: basic, gross: b.gross, ot: ot, perHead: perHead, total: perHead * n });
      monthly += perHead * n; otTotal += ot * n; workers += n;
      if (!g.apprentice) festival += basic * 2 * n;
    });
    return { rows: rows, workers: workers, monthly: monthly, otMonthly: otTotal, annual: monthly * 12 + festival, festivalAnnual: festival };
  }

  return { FIXED: FIXED, GRADES: GRADES, INCREMENT_HISTORY: INCREMENT_HISTORY, DEFAULT_INCREMENT: DEFAULT_INCREMENT,
           OT_DIVISOR: OT_DIVISOR, STRUCTURE_START: STRUCTURE_START, grade: grade, incrementsDue: incrementsDue,
           breakdown: breakdown, payslip: payslip, factory: factory };
});
