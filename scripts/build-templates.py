"""
Build the downloadable ERP project templates (Excel + Word) into
src/assets/downloads/. Content mirrors the matching Lab articles so the
templates and the articles never disagree; the Excel→Odoo checklist is parsed
straight from lab article 0008.

Usage:  python scripts/build-templates.py
Needs:  openpyxl, python-docx
"""
import os
import re
import html
from datetime import date

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import CellIsRule, FormulaRule
from docx import Document
from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src", "assets", "downloads")
os.makedirs(OUT, exist_ok=True)

NAVY = "0B2545"
TEAL = "009B8E"
LIGHT = "EEF6F5"
GREY = "F3F5F8"
HEAD_FONT = Font(bold=True, color="FFFFFF", name="Calibri", size=11)
HEAD_FILL = PatternFill("solid", fgColor=NAVY)
SUB_FILL = PatternFill("solid", fgColor=LIGHT)
INPUT_FILL = PatternFill("solid", fgColor="FFF8E1")
THIN = Side(style="thin", color="D5DAE1")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
WRAP = Alignment(wrap_text=True, vertical="top")
CENTER = Alignment(horizontal="center", vertical="center", wrap_text=True)
TODAY = date(2026, 9, 25).strftime("%d %B %Y")
CREDIT = "Free template by Mehedi Hasan, Odoo Certified Functional Consultant · mhasan.me · Free to use and adapt; please keep this credit line."


# ---------------------------------------------------------------- helpers
def about_sheet(wb, title, purpose, how, article):
    ws = wb.active
    ws.title = "About"
    ws["A1"] = title
    ws["A1"].font = Font(bold=True, size=18, color=NAVY)
    ws["A3"] = "What this is"
    ws["A3"].font = Font(bold=True, color=TEAL)
    ws["A4"] = purpose
    ws["A6"] = "How to use it"
    ws["A6"].font = Font(bold=True, color=TEAL)
    r = 7
    for step in how:
        ws.cell(row=r, column=1, value="•  " + step)
        r += 1
    r += 1
    ws.cell(row=r, column=1, value="The full method behind this template").font = Font(bold=True, color=TEAL)
    c = ws.cell(row=r + 1, column=1, value="https://mhasan.me" + article)
    c.hyperlink = "https://mhasan.me" + article
    c.font = Font(color=TEAL, underline="single")
    ws.cell(row=r + 3, column=1, value="Yellow cells are for your input. Formulas are in plain cells, so avoid overwriting them.").font = Font(italic=True, color="666666")
    ws.cell(row=r + 5, column=1, value=CREDIT).font = Font(size=9, color="888888")
    ws.cell(row=r + 6, column=1, value="Version: " + TODAY).font = Font(size=9, color="888888")
    ws.column_dimensions["A"].width = 120
    for row in ws.iter_rows(min_row=1, max_row=r + 6):
        for cell in row:
            cell.alignment = Alignment(wrap_text=True, vertical="top")
    ws.sheet_view.showGridLines = False
    return ws


def table(ws, headers, rows, widths=None, start_row=1, freeze=True):
    for i, h in enumerate(headers, 1):
        c = ws.cell(row=start_row, column=i, value=h)
        c.font = HEAD_FONT
        c.fill = HEAD_FILL
        c.alignment = CENTER
        c.border = BORDER
    for r_i, row in enumerate(rows, start_row + 1):
        for c_i, v in enumerate(row, 1):
            c = ws.cell(row=r_i, column=c_i, value=v)
            c.alignment = WRAP
            c.border = BORDER
    if widths:
        for i, w in enumerate(widths, 1):
            ws.column_dimensions[get_column_letter(i)].width = w
    if freeze:
        ws.freeze_panes = ws.cell(row=start_row + 1, column=1)
    ws.row_dimensions[start_row].height = 32
    return start_row + len(rows)


def dropdown(ws, rng, options):
    dv = DataValidation(type="list", formula1='"' + ",".join(options) + '"', allow_blank=True)
    ws.add_data_validation(dv)
    dv.add(rng)


def input_cells(ws, rng):
    for row in ws[rng]:
        for c in row:
            c.fill = INPUT_FILL


def status_colours(ws, rng):
    ws.conditional_formatting.add(rng, CellIsRule(operator="equal", formula=['"Done"'], fill=PatternFill("solid", fgColor="D8F3E8")))
    ws.conditional_formatting.add(rng, CellIsRule(operator="equal", formula=['"Pass"'], fill=PatternFill("solid", fgColor="D8F3E8")))
    ws.conditional_formatting.add(rng, CellIsRule(operator="equal", formula=['"Resolved"'], fill=PatternFill("solid", fgColor="D8F3E8")))
    ws.conditional_formatting.add(rng, CellIsRule(operator="equal", formula=['"Blocked"'], fill=PatternFill("solid", fgColor="FBE0DF")))
    ws.conditional_formatting.add(rng, CellIsRule(operator="equal", formula=['"Fail"'], fill=PatternFill("solid", fgColor="FBE0DF")))
    ws.conditional_formatting.add(rng, CellIsRule(operator="equal", formula=['"In progress"'], fill=PatternFill("solid", fgColor="FFF1D6")))


def save(wb, name):
    path = os.path.join(OUT, name)
    wb.save(path)
    print("wrote", name, os.path.getsize(path), "bytes")


# ---------------------------------------------------------------- 1. RFP scoring matrix
def rfp_scoring():
    wb = Workbook()
    about_sheet(wb, "Odoo RFP — Vendor Scoring Matrix",
                "Score Odoo implementation partners consistently on 14 weighted criteria. The highest total is your starting point for negotiation, not automatically the winner.",
                ["Disqualify any vendor that triggers a red flag (sheet 'Red flags') before scoring.",
                 "Score each vendor 1–5 per criterion in the yellow cells, using the guidance column.",
                 "Weighted score and total (max 500) calculate automatically.",
                 "Call at least two references per shortlisted vendor using the questions sheet."],
                "/lab/0029-odoo-rfp-template-bangladesh")
    ws = wb.create_sheet("Scoring")
    crit = [
        ("Bangladesh experience", "Reference sites — industry match", 0.12, "1 = no Bangladesh refs · 3 = refs in a different industry · 5 = verified refs in your industry, contacted and positive"),
        ("Bangladesh experience", "Bangladesh compliance demonstrated", 0.10, "1 = claims capability, no demo · 3 = showed Mushak config in demo · 5 = live client using Mushak 6.3 + TDS + payroll"),
        ("Bangladesh experience", "Number of completed BD implementations", 0.08, "1 = fewer than 3 · 3 = 5–10 · 5 = 15+ completed Bangladesh deployments"),
        ("Project methodology", "Quality of project plan presented", 0.10, "1 = no plan / vague · 3 = plan exists, milestones unclear · 5 = week-by-week plan with named deliverables and decision points"),
        ("Project methodology", "UAT and testing approach", 0.08, "1 = no formal UAT · 3 = described, no test scripts · 5 = provides test scripts, defect log, sign-off process"),
        ("Project methodology", "Training methodology", 0.07, "1 = ad hoc · 3 = role-based described · 5 = role matrix, materials, assessment, sign-off sheet"),
        ("Team quality", "Lead consultant experience", 0.10, "1 = no relevant experience · 3 = 2–4 years Odoo, mixed industries · 5 = 5+ years Odoo, multiple BD manufacturing projects"),
        ("Team quality", "Dedicated project manager", 0.06, "1 = consultant is also PM · 3 = PM named but also consults · 5 = dedicated PM, CV provided, full-time"),
        ("Team quality", "Team continuity guarantee", 0.04, "1 = no commitment · 3 = PM committed, consultant may change · 5 = named team committed in contract"),
        ("Commercial terms", "Price scope completeness", 0.07, "1 = lump sum only · 3 = phase breakdown, some gaps · 5 = itemised by module + migration + training + support"),
        ("Commercial terms", "Payment milestone structure", 0.05, "1 = large advance · 3 = 3-milestone structure · 5 = milestones tied to deliverables, final payment after stable go-live"),
        ("Commercial terms", "Post-go-live support terms", 0.03, "1 = no support offer · 3 = described, no SLA · 5 = named SLA per severity, retainer option"),
        ("Technical approach", "Demo quality", 0.06, "1 = PowerPoint · 3 = live Odoo, generic · 5 = live Odoo configured for your industry with BD compliance visible"),
        ("Technical approach", "Customisation approach", 0.04, "1 = customises anything · 3 = standard first · 5 = clear framework for custom dev with documentation and upgrade path"),
    ]
    headers = ["Category", "Criterion", "Weight", "Guidance (1 = weak · 5 = strong)",
               "Vendor A score", "Vendor A weighted", "Vendor B score", "Vendor B weighted", "Vendor C score", "Vendor C weighted"]
    rows = []
    for i, (cat, name, w, g) in enumerate(crit, start=2):
        rows.append([cat, name, w, g, None, f"=IF(E{i}=\"\",\"\",E{i}*C{i}*100)", None, f"=IF(G{i}=\"\",\"\",G{i}*C{i}*100)", None, f"=IF(I{i}=\"\",\"\",I{i}*C{i}*100)"])
    end = table(ws, headers, rows, [20, 34, 9, 60, 12, 12, 12, 12, 12, 12])
    t = end + 1
    ws.cell(row=t, column=2, value="TOTAL (max 500)").font = Font(bold=True)
    ws.cell(row=t, column=3, value=f"=SUM(C2:C{end})").number_format = "0%"
    for col in ("F", "H", "J"):
        c = ws[f"{col}{t}"]
        c.value = f"=SUM({col}2:{col}{end})"
        c.font = Font(bold=True, color=TEAL)
    ws.cell(row=t + 1, column=2, value="Rank")
    for col in ("F", "H", "J"):
        ws[f"{col}{t + 1}"] = f"=RANK({col}{t},($F${t},$H${t},$J${t}))"
    for r in range(2, end + 1):
        ws[f"C{r}"].number_format = "0%"
        for col in ("F", "H", "J"):
            ws[f"{col}{r}"].number_format = "0"
    for col in ("E", "G", "I"):
        input_cells(ws, f"{col}2:{col}{end}")
        dv = DataValidation(type="whole", operator="between", formula1="1", formula2="5", allow_blank=True,
                            error="Score from 1 to 5", errorTitle="Invalid score")
        ws.add_data_validation(dv)
        dv.add(f"{col}2:{col}{end}")
    ws["E1"].value = "Vendor A score"
    input_cells(ws, "E1:E1")

    rf = wb.create_sheet("Red flags")
    flags = [
        "Cannot name a Bangladesh reference site within 24 hours of being asked",
        "Proposes a fixed timeline without reviewing your data or customisation needs",
        "Cannot demo Bangladesh compliance (Mushak 6.3, TDS, payroll) live in a running Odoo instance",
        "No dedicated project manager: salesperson, PM and lead consultant are the same person",
        "Price more than 40% below other vendors with no specific explanation of scope difference",
        "Demands more than 30% advance payment",
        "Refuses to name the reviewed team members in the contract",
    ]
    end = table(rf, ["#", "Red flag (any one = disqualify)", "Vendor A (Y/N)", "Vendor B (Y/N)", "Vendor C (Y/N)"],
                [[i, f, None, None, None] for i, f in enumerate(flags, 1)], [5, 80, 15, 15, 15])
    dropdown(rf, f"C2:E{end}", ["Y", "N"])
    input_cells(rf, f"C2:E{end}")
    rf.conditional_formatting.add(f"C2:E{end}", CellIsRule(operator="equal", formula=['"Y"'], fill=PatternFill("solid", fgColor="FBE0DF")))
    rf.cell(row=end + 2, column=2, value="Disqualified?").font = Font(bold=True)
    for col in ("C", "D", "E"):
        rf[f"{col}{end + 2}"] = f'=IF(COUNTIF({col}2:{col}{end},"Y")>0,"DISQUALIFIED","OK")'

    pq = wb.create_sheet("Pre-qualification")
    table(pq, ["Pre-qualification check (before sending the RFP)", "Vendor A", "Vendor B", "Vendor C"], [
        ["Active Odoo partnership (Ready / Silver / Gold), verifiable on odoo.com", None, None, None],
        ["Can name a Bangladesh reference site in your industry", None, None, None],
        ["Team of at least 1 dedicated PM + 2 Odoo-certified consultants (for a 30–100 user project)", None, None, None],
    ], [80, 15, 15, 15])
    dropdown(pq, "B2:D4", ["Yes", "No"])
    input_cells(pq, "B2:D4")

    rq = wb.create_sheet("Reference questions")
    qs = [
        "On a scale of 1–10, how likely are you to recommend this vendor? What would it take to be a 10?",
        "Did the project finish on time and on budget? If not, what happened?",
        "What was the project team like day-to-day: responsive, proactive, or reactive?",
        "Were there any Bangladesh compliance issues (Mushak, TDS, payroll) the vendor struggled with?",
        "What happened in the first 2 weeks after go-live? Were they on-site?",
        "What would you do differently if you were selecting the vendor again?",
        "Is the same team still supporting you today?",
    ]
    table(rq, ["#", "Question (call, don't email)", "Vendor A — reference answer", "Vendor B — reference answer", "Vendor C — reference answer"],
          [[i, q, None, None, None] for i, q in enumerate(qs, 1)], [5, 60, 35, 35, 35])
    input_cells(rq, "C2:E8")
    save(wb, "odoo-rfp-vendor-scoring-matrix.xlsx")


# ---------------------------------------------------------------- 2. UAT test scripts
def uat():
    wb = Workbook()
    about_sheet(wb, "Odoo UAT Test Script Template",
                "User acceptance testing scripts that test how real people work, not just happy paths. Every case names a person, a moment, a constraint, one variable forced off the happy path, and a measurable result.",
                ["Fill the header sheet once per UAT cycle.",
                 "Write test cases in 'Test cases'. Sample Bangladesh cases are included, so replace them with yours.",
                 "Log every failure in 'Defects' with a severity (S1–S4).",
                 "'Summary' counts progress automatically. Exit when all Must cases pass and no S1/S2 defects are open."],
                "/lab/0009-uat-script-200-users-ago")
    h = wb.create_sheet("Header")
    for i, (k, v) in enumerate([("Project", ""), ("UAT cycle", "Cycle 1"), ("Environment / database", "UAT copy of production config"),
                                ("Data used", "Migrated trial-load data (dry run #2)"), ("Start date", ""), ("End date", ""),
                                ("Test lead", ""), ("Sign-off by (process owners)", "")], start=1):
        h.cell(row=i, column=1, value=k).font = Font(bold=True)
        c = h.cell(row=i, column=2, value=v)
        c.fill = INPUT_FILL
    h.column_dimensions["A"].width = 32
    h.column_dimensions["B"].width = 60

    ws = wb.create_sheet("Test cases")
    headers = ["Case ID", "Module", "Priority", "Persona & moment", "Constraint / off-happy-path variable", "Preconditions",
               "Steps", "Expected result (measurable)", "If it fails, what does the user do?", "Actual result", "Status", "Defect ID", "Tester", "Date"]
    cases = [
        ["P2P-01", "Purchase", "Must", "Karim (procurement), month-end", "Vendor quotes in USD; PO approved above ৳5 lakh limit", "Vendor with TIN and TDS category set; approval rule active",
         "1. Create RFQ in USD\n2. Confirm → approval triggered\n3. Approve as manager\n4. Receive partial quantity", "PO needs approval; partial GRN leaves backorder; stock value = received qty × PO rate × exchange rate on receipt date", "", "", "", "", "", ""],
        ["P2P-02", "Accounting", "Must", "Shila (AP), vendor bill day", "Vendor is a service provider WITHOUT TIN", "Vendor category 'Service — no TIN'",
         "1. Create vendor bill from PO\n2. Post bill\n3. Register payment", "TDS at the no-TIN rate is deducted; payment = bill − TDS; TDS certificate data available", "", "", "", "", "", ""],
        ["P2P-03", "Inventory", "Must", "Rahim (store), receiving an import", "Landed cost: freight + CD + RD + SD arrive after the GRN", "GRN posted; customs bill of entry available",
         "1. Create landed cost with CD, RD, SD, C&F charges\n2. Split by value\n3. Validate", "Unit cost increases by landed cost; VAT/AT at import are NOT added to cost but go to VAT receivable", "", "", "", "", "", ""],
        ["O2C-01", "Sales", "Must", "Nadia (sales), urgent order", "Customer is over credit limit", "Credit limit set on customer",
         "1. Create SO above limit\n2. Try to confirm", "Warning/block according to policy; manager override logged in chatter", "", "", "", "", "", ""],
        ["O2C-02", "Accounting", "Must", "Tareq (accounts), invoicing a local sale", "Customer is a VDS withholding entity", "Customer BIN on record",
         "1. Validate delivery\n2. Create invoice\n3. Print Mushak 6.3\n4. Record receipt net of VDS", "6.3 shows both BINs, VAT 15%; receipt with VDS leaves invoice fully paid and VDS receivable/6.6 tracked", "", "", "", "", "", ""],
        ["O2C-03", "Sales", "Must", "Export desk", "Export customer — zero-rated", "Fiscal position 'Export — Zero VAT'",
         "1. Create SO for foreign customer\n2. Invoice", "Invoice at 0% VAT, shows in export (zero-rated) line of the tax report", "", "", "", "", "", ""],
        ["MRP-01", "Manufacturing", "Must", "PPC planner, Monday plan", "Component short for one MO", "BOM with 3 levels; one RM below required qty",
         "1. Run replenishment\n2. Confirm MO\n3. Check availability", "MO shows waiting; purchase RFQ generated for shortfall; no negative stock", "", "", "", "", "", ""],
        ["MRP-02", "Manufacturing", "Should", "Line supervisor, end of shift", "Actual consumption 3% above BOM", "MO in progress",
         "1. Record actual consumption\n2. Produce\n3. Check cost", "Variance visible; finished goods cost reflects actual consumption", "", "", "", "", "", ""],
        ["HR-01", "Payroll", "Must", "HR officer, pay run", "Worker joined 1 Dec 2023, 40 OT hours, 1 day absent", "Wage-board grade structure configured",
         "1. Generate payslip\n2. Check lines", "Basic after increments; OT = basic÷208×2×hours; absence deduction applied; attendance bonus not paid", "", "", "", "", "", ""],
        ["FIN-01", "Accounting", "Must", "Finance manager, first month-end", "Bank statement has charges not yet booked", "Statement imported",
         "1. Reconcile\n2. Create write-offs for charges\n3. Lock period", "Bank balance = statement balance; lock date prevents back-dated entries", "", "", "", "", "", ""],
        ["FIN-02", "Accounting", "Must", "Accounts, quarter end", "Quarterly VAT return + monthly one-third advance deposits (Finance Act 2026)", "Tax report configured",
         "1. Run tax report for the quarter\n2. Compare with advances paid", "Output VAT, input VAT, SD and net payable reconcile with GL; advances offset", "", "", "", "", "", ""],
        ["SEC-01", "Access rights", "Must", "Store keeper", "Tries to see product cost and vendor prices", "Warehouse user group only",
         "1. Log in as store keeper\n2. Open product, PO, valuation report", "Cost fields and valuation menus are not visible", "", "", "", "", "", ""],
    ]
    end = table(ws, headers, cases + [[None] * 14 for _ in range(28)], [9, 13, 9, 24, 30, 26, 38, 40, 28, 28, 11, 10, 12, 11])
    dropdown(ws, f"C2:C{end}", ["Must", "Should", "Could"])
    dropdown(ws, f"K2:K{end}", ["Not started", "Pass", "Fail", "Blocked", "Retest"])
    input_cells(ws, f"J2:N{end}")
    status_colours(ws, f"K2:K{end}")

    d = wb.create_sheet("Defects")
    dend = table(d, ["Defect ID", "Case ID", "Date", "Module", "Severity", "Description", "Steps to reproduce", "Reported by", "Assigned to", "Status", "Fixed in", "Retest result"],
                 [["D-001", "", "", "", "", "", "", "", "", "", "", ""]] + [[None] * 12 for _ in range(49)], [9, 9, 11, 13, 9, 45, 40, 14, 14, 12, 12, 12])
    dropdown(d, f"E2:E{dend}", ["S1 Critical", "S2 High", "S3 Medium", "S4 Low"])
    dropdown(d, f"J2:J{dend}", ["Open", "In progress", "Resolved", "Closed", "Rejected"])
    dropdown(d, f"L2:L{dend}", ["Pass", "Fail"])
    status_colours(d, f"J2:J{dend}")
    input_cells(d, f"A2:L{dend}")

    s = wb.create_sheet("Summary")
    rows = [["Total cases", f"=COUNTA('Test cases'!A2:A{end})"],
            ["Passed", f"=COUNTIF('Test cases'!K2:K{end},\"Pass\")"],
            ["Failed", f"=COUNTIF('Test cases'!K2:K{end},\"Fail\")"],
            ["Blocked", f"=COUNTIF('Test cases'!K2:K{end},\"Blocked\")"],
            ["Not started", "=B2-B3-B4-B5"],
            ["Pass rate", "=IF(B2=0,0,B3/B2)"],
            ["Must cases not yet passed", f"=COUNTIFS('Test cases'!C2:C{end},\"Must\",'Test cases'!K2:K{end},\"<>Pass\")"],
            ["Open S1 defects", f"=COUNTIFS(Defects!E2:E{dend},\"S1 Critical\",Defects!J2:J{dend},\"<>Closed\",Defects!J2:J{dend},\"<>Resolved\")"],
            ["Open S2 defects", f"=COUNTIFS(Defects!E2:E{dend},\"S2 High\",Defects!J2:J{dend},\"<>Closed\",Defects!J2:J{dend},\"<>Resolved\")"],
            ["UAT exit criteria met?", "=IF(AND(B8=0,B9=0,B10=0),\"YES — ready for sign-off\",\"NO\")"]]
    table(s, ["Measure", "Value"], rows, [34, 30])
    s["B7"].number_format = "0%"
    save(wb, "odoo-uat-test-script-template.xlsx")


# ---------------------------------------------------------------- 3. Data migration checklist
def parse_0008():
    src = open(os.path.join(ROOT, "src", "lab", "0008-excel-odoo-migration-checklist.html"), encoding="utf-8").read()
    phases = re.findall(r'<div class="phase" id="phase-(\d)">([\s\S]*?)</ul>', src)
    items = []
    for num, block in phases:
        title_m = re.search(r"<h2[^>]*>([\s\S]*?)</h2>", block)
        ptitle = re.sub(r"<[^>]+>", "", title_m.group(1)).strip() if title_m else "Phase " + num
        for li in re.findall(r"<li>([\s\S]*?)</li>", block):
            idm = re.search(r'<span class="id">(\d+)</span>', li)
            sub = re.search(r'<span class="sub">([\s\S]*?)</span>', li)
            textm = re.search(r'<span class="text">([\s\S]*?)(<span class="sub">|</span>)', li)
            owner = re.search(r'<span class="owner"><small>Owner</small>([\s\S]*?)</span>', li)
            pill = re.search(r'<span class="pill[^"]*">([\s\S]*?)</span>', li)
            if not idm:
                continue
            clean = lambda s: html.unescape(re.sub(r"<[^>]+>", "", s)).strip() if s else ""
            items.append([f"{num} · {html.unescape(ptitle)}", idm.group(1), clean(textm.group(1)), clean(sub.group(1)) if sub else "",
                          clean(owner.group(1)) if owner else "", clean(pill.group(1)) if pill else ""])
    return items


def migration():
    wb = Workbook()
    about_sheet(wb, "Excel → Odoo Data Migration Checklist (Bangladesh)",
                "The 40-item migration checklist field-tested across manufacturing go-lives, plus the 10 Bangladesh master-data checks (BIN, TIN/TDS, opening stock from a physical count) and a reconciliation sheet.",
                ["Work through '40-item checklist' phase by phase; set status and dates.",
                 "Use 'BD master data' to make sure the Bangladesh-specific fields are captured before import.",
                 "After each trial load, fill 'Reconciliation': counts and sums must match source to the taka.",
                 "Do not start cut-over until every Critical item is Done."],
                "/lab/0008-excel-odoo-migration-checklist")
    items = parse_0008()
    assert len(items) == 40, f"expected 40 checklist items from article 0008, got {len(items)}"
    ws = wb.create_sheet("40-item checklist")
    end = table(ws, ["Phase", "#", "Task", "Why it matters", "Owner", "Priority", "Status", "Named person", "Due", "Notes"],
                [it + ["Not started", None, None, None] for it in items], [22, 5, 55, 45, 16, 12, 13, 16, 11, 30])
    dropdown(ws, f"G2:G{end}", ["Not started", "In progress", "Done", "Blocked", "N/A"])
    status_colours(ws, f"G2:G{end}")
    input_cells(ws, f"G2:J{end}")
    ws.conditional_formatting.add(f"F2:F{end}", CellIsRule(operator="equal", formula=['"Critical"'], font=Font(bold=True, color="C0392B")))
    ws.cell(row=end + 2, column=3, value="Critical items not yet done").font = Font(bold=True)
    ws.cell(row=end + 2, column=7, value=f'=COUNTIFS(F2:F{end},"Critical",G2:G{end},"<>Done")')
    ws.cell(row=end + 3, column=3, value="Overall progress").font = Font(bold=True)
    c = ws.cell(row=end + 3, column=7, value=f'=COUNTIF(G2:G{end},"Done")/COUNTA(B2:B{end})')
    c.number_format = "0%"

    bd = wb.create_sheet("BD master data")
    rows = [
        ["Customer master", "Deduplicate (normalise Ltd/Limited), merge balances, flag inactive (2+ yrs)", "BIN (for Mushak 6.3), email, phone, payment terms", "Accounts"],
        ["Vendor master", "Deduplicate; classify for TDS", "TIN (12-digit), TDS category/section, TDS rate (no-TIN = higher), BIN, bank account + BEFTN routing", "Accounts"],
        ["Product master", "Consistent internal reference, category hierarchy agreed first", "UoM (pcs, dzn, kg, yards), cost price at cut-over, product type, VAT treatment (15% / zero-rated / exempt), HS code for imports", "Warehouse + Procurement"],
        ["Chart of accounts", "Map every legacy ledger to an Odoo account type; consolidate duplicates", "VAT payable, input VAT, VDS, AIT/TDS payable, PF payable, gratuity provision", "Accounts"],
        ["Opening AR", "Reconcile top-20 customers with statements; resolve disputes; decide on >180-day items", "Per-invoice import preferred; total must match legacy TB to ৳1", "Accounts"],
        ["Opening AP", "Confirm top-20 vendor balances; reflect advances as debit balances", "Per-bill import; supplier statements on file", "Accounts + Procurement"],
        ["Opening stock", "PHYSICAL count, not system count; write off discrepancies with CFO approval first", "Qty and unit cost per product per location; valuation = GL balance", "Warehouse"],
        ["Employee master", "Accurate joining dates (gratuity), grades, PF status", "NID, joining date, designation, basic/house rent/medical/conveyance, bank + routing", "HR"],
        ["Fixed assets", "Cost, accumulated depreciation, NBV at cut-over", "Category, acquisition date, method and rate, remaining life", "Accounts"],
        ["Open POs / SOs / LCs", "Decide migrate vs. close in legacy; only outstanding quantities", "Open LCs mapped to LC workflow; bills of entry referenced", "Procurement + Sales"],
    ]
    end = table(bd, ["Object", "What to do", "Bangladesh-specific fields to capture", "Owner", "Status", "Notes"],
                [r + ["Not started", None] for r in rows], [18, 50, 60, 18, 13, 30])
    dropdown(bd, f"E2:E{end}", ["Not started", "In progress", "Done", "N/A"])
    status_colours(bd, f"E2:E{end}")
    input_cells(bd, f"E2:F{end}")

    rc = wb.create_sheet("Reconciliation")
    objs = ["Chart of accounts", "Customers", "Vendors", "Products", "BOMs", "Opening stock (qty)", "Opening stock (value ৳)", "Open AR (৳)", "Open AP (৳)", "Fixed assets (NBV ৳)", "Employees", "Open POs", "Open SOs"]
    rows = []
    for i, o in enumerate(objs, start=2):
        rows.append([o, None, None, f"=IF(OR(B{i}=\"\",C{i}=\"\"),\"\",C{i}-B{i})", f"=IF(D{i}=\"\",\"\",IF(D{i}=0,\"OK\",\"INVESTIGATE\"))", None])
    end = table(rc, ["Object (load order)", "Source count / sum", "Odoo count / sum", "Difference", "Check", "Checked by / notes"], rows, [26, 20, 20, 14, 14, 36])
    input_cells(rc, f"B2:C{end}")
    input_cells(rc, f"F2:F{end}")
    rc.conditional_formatting.add(f"E2:E{end}", CellIsRule(operator="equal", formula=['"INVESTIGATE"'], fill=PatternFill("solid", fgColor="FBE0DF")))
    rc.conditional_formatting.add(f"E2:E{end}", CellIsRule(operator="equal", formula=['"OK"'], fill=PatternFill("solid", fgColor="D8F3E8")))
    rc.cell(row=end + 2, column=1, value="Load order: company → chart of accounts → partners → products → BOMs → stock → open documents.").font = Font(italic=True)
    save(wb, "odoo-data-migration-checklist.xlsx")


# ---------------------------------------------------------------- 4. Hypercare
def hypercare():
    wb = Workbook()
    about_sheet(wb, "Odoo Post Go-Live Hypercare Plan & Issue Log",
                "Run the first weeks after go-live with a clear support model: severity SLAs, a single issue log, the first month-end close checklist, and objective exit criteria to move to business-as-usual.",
                ["Agree the severity definitions and SLAs with the partner before go-live.",
                 "Log every issue in 'Issue log' and review it in the daily stand-up.",
                 "Use 'Month-end close' for the first close in Odoo.",
                 "Leave hypercare only when every item in 'Exit criteria' is met."],
                "/lab/0032-odoo-post-go-live-hypercare-bangladesh")
    sv = wb.create_sheet("Severity & SLA")
    table(sv, ["Severity", "Definition", "Bangladesh examples", "Response", "Resolution"], [
        ["S1 — Critical", "Operations stopped, no workaround", "Cannot post vendor bills (tax config broken); cannot post GRN; server down; cannot generate Mushak 6.3", "2 hours (any time)", "4 hours"],
        ["S2 — High", "Major function impaired, slow/error-prone workaround", "TDS not calculating on bills; payroll wrong for one employee type; bank import failing for one bank", "4 hours", "Same business day"],
        ["S3 — Medium", "Minor function impaired, easy workaround", "Report missing a column; 6.3 print alignment off; dashboard default filter wrong", "Next business day", "3 business days"],
        ["S4 — Low", "Cosmetic or enhancement", "Bengali label requested; column order; out-of-scope convenience feature", "Next business day", "Post-hypercare backlog"],
    ], [16, 36, 60, 18, 20])
    tiers = wb.create_sheet("Support tiers")
    table(tiers, ["Tier", "Who", "Handles"], [
        ["L1", "Internal superusers", "How-to questions, password resets, process clarification, report help, user-error recovery"],
        ["L2", "Internal Odoo lead / partner functional", "Configuration review, stuck workflows, data corrections, report/filter configuration, access rights"],
        ["L3", "Partner consultant / developer", "Defects and custom code bugs, developer-level configuration, performance, data integrity, integration failures"],
    ], [8, 32, 90])
    ws = wb.create_sheet("Issue log")
    end = table(ws, ["Issue #", "Date / time", "Module", "Severity", "Description", "Reported by", "Tier", "Assigned to", "Status", "Resolved on", "Root cause", "Prevent recurrence"],
                [["HC-001", "", "", "", "", "", "", "", "Open", "", "", ""]] + [[None] * 12 for _ in range(99)], [9, 14, 13, 13, 50, 14, 7, 14, 12, 14, 30, 30])
    dropdown(ws, f"D2:D{end}", ["S1 — Critical", "S2 — High", "S3 — Medium", "S4 — Low"])
    dropdown(ws, f"G2:G{end}", ["L1", "L2", "L3"])
    dropdown(ws, f"I2:I{end}", ["Open", "In progress", "Resolved", "Closed", "Backlog"])
    dropdown(ws, f"C2:C{end}", ["Accounting", "Inventory", "Purchase", "Sales", "Manufacturing", "Payroll", "HR", "Quality", "POS", "Access rights", "Integration", "Other"])
    status_colours(ws, f"I2:I{end}")
    input_cells(ws, f"A2:L{end}")
    dash = wb.create_sheet("Daily summary")
    table(dash, ["Measure", "Value"], [
        ["Open S1", f"=COUNTIFS('Issue log'!D2:D{end},\"S1 — Critical\",'Issue log'!I2:I{end},\"<>Closed\",'Issue log'!I2:I{end},\"<>Resolved\")"],
        ["Open S2", f"=COUNTIFS('Issue log'!D2:D{end},\"S2 — High\",'Issue log'!I2:I{end},\"<>Closed\",'Issue log'!I2:I{end},\"<>Resolved\")"],
        ["Open S3/S4", f"=COUNTIFS('Issue log'!I2:I{end},\"Open\")+COUNTIFS('Issue log'!I2:I{end},\"In progress\")-B2-B3"],
        ["Resolved or closed", f"=COUNTIF('Issue log'!I2:I{end},\"Resolved\")+COUNTIF('Issue log'!I2:I{end},\"Closed\")"],
        ["Share handled by L1 (superusers)", f"=IF(COUNTA('Issue log'!G2:G{end})=0,0,COUNTIF('Issue log'!G2:G{end},\"L1\")/COUNTA('Issue log'!G2:G{end}))"],
    ], [36, 20])
    dash["B6"].number_format = "0%"
    mc = wb.create_sheet("Month-end close")
    steps = ["Bank reconciliation: all statement lines matched; charges and interest posted (target: 3 working days)",
             "AP/AR cut-off: all bills and invoices for the period posted; no drafts left",
             "Inventory valuation report = inventory asset account on the balance sheet",
             "Depreciation run posted (if Fixed Assets is live)",
             "Accruals and provisions reviewed: gratuity, leave encashment",
             "VAT: run the tax report; monthly one-third advance deposit calculated (quarterly return under Finance Act 2026)",
             "Lock the period (lock date) so nothing is back-dated",
             "P&L and balance sheet shared with sponsor/CFO and walked through"]
    end = table(mc, ["#", "Step", "Owner", "Status", "Done on", "Notes"], [[i, s, None, "Not started", None, None] for i, s in enumerate(steps, 1)], [5, 80, 16, 13, 12, 30])
    dropdown(mc, f"D2:D{end}", ["Not started", "In progress", "Done"])
    status_colours(mc, f"D2:D{end}")
    input_cells(mc, f"C2:F{end}")
    ex = wb.create_sheet("Exit criteria")
    crit = ["No S1/S2 issue open more than 24 hours in the last 5 consecutive business days",
            "Superusers (L1) resolve 80%+ of queries without L3 for 5 consecutive business days",
            "First month-end close completed in Odoo and financials confirmed by accounts",
            "First full payroll batch processed and approved without consultant involvement (if HR is live)",
            "100% of in-scope daily transactions in Odoo; no parallel Tally/Excel records",
            "BAU support contract signed and support process communicated to all users"]
    end = table(ex, ["#", "Exit criterion", "Met?", "Evidence", "Confirmed by"], [[i, c, None, None, None] for i, c in enumerate(crit, 1)], [5, 80, 10, 40, 18])
    dropdown(ex, f"C2:C{end}", ["Yes", "No"])
    input_cells(ex, f"C2:E{end}")
    ex.cell(row=end + 2, column=2, value="Ready to exit hypercare?").font = Font(bold=True)
    ex.cell(row=end + 2, column=3, value=f'=IF(COUNTIF(C2:C{end},"Yes")={end - 1},"YES","NOT YET")')
    save(wb, "odoo-hypercare-plan-issue-log.xlsx")


# ---------------------------------------------------------------- 5. Training plan
def training():
    wb = Workbook()
    about_sheet(wb, "Odoo Training Plan & Sign-off Matrix",
                "Role-based (not module-based) training: who learns what depth, when, in which language, and proof that each user can actually do their job in Odoo before go-live.",
                ["List your roles and set the depth per module (DEEP / BASIC / VIEW / —).",
                 "Plan sessions in 'Schedule': small batches, Bangla where needed, practice data.",
                 "Every user completes the practical assessment and signs off in 'Sign-off'."],
                "/lab/0031-odoo-training-plan-template")
    m = wb.create_sheet("Role matrix")
    roles = [["AP accountant", "DEEP", "VIEW", "BASIC", "—", "—", "—"], ["AR accountant", "DEEP", "VIEW", "—", "BASIC", "—", "—"],
             ["Finance manager", "DEEP", "VIEW", "VIEW", "VIEW", "VIEW", "VIEW"], ["Store keeper", "—", "BASIC", "VIEW", "—", "—", "—"],
             ["Warehouse supervisor", "VIEW", "DEEP", "BASIC", "BASIC", "VIEW", "—"], ["Procurement officer", "VIEW", "BASIC", "DEEP", "—", "—", "—"],
             ["Sales executive", "—", "VIEW", "—", "DEEP", "—", "—"], ["Production planner", "—", "BASIC", "BASIC", "VIEW", "DEEP", "—"],
             ["Line supervisor", "—", "BASIC", "—", "—", "BASIC", "—"], ["HR / payroll officer", "—", "—", "—", "—", "—", "DEEP"],
             ["Management", "VIEW", "VIEW", "VIEW", "VIEW", "VIEW", "VIEW"], ["Superuser (per department)", "DEEP", "DEEP", "DEEP", "DEEP", "DEEP", "DEEP"]]
    end = table(m, ["Role", "Accounting", "Inventory", "Purchase", "Sales", "Manufacturing", "HR / Payroll", "No. of users"],
                [r + [None] for r in roles] + [[None] * 8 for _ in range(8)], [28, 14, 14, 14, 14, 16, 14, 12])
    dropdown(m, f"B2:G{end}", ["DEEP", "BASIC", "VIEW", "—"])
    input_cells(m, f"H2:H{end}")
    for col in "BCDEFG":
        m.conditional_formatting.add(f"{col}2:{col}{end}", CellIsRule(operator="equal", formula=['"DEEP"'], fill=PatternFill("solid", fgColor="CDEFEA")))
        m.conditional_formatting.add(f"{col}2:{col}{end}", CellIsRule(operator="equal", formula=['"BASIC"'], fill=PatternFill("solid", fgColor="EAF7F5")))
    m.cell(row=end + 2, column=1, value="DEEP = all transactions + configuration + period close (superusers) · BASIC = the transactions this role does daily · VIEW = run and read reports only · — = no training, no access").font = Font(italic=True, size=9)
    sc = wb.create_sheet("Schedule")
    end = table(sc, ["Session", "Role(s)", "Topics / transactions", "Trainer", "Date", "Time", "Language", "Venue / online", "Batch size", "Practice data ready?", "Materials"],
                [["S-01", "AP accountant", "Vendor bill entry, TDS deduction & certificate, vendor payments, AP ageing", "", "", "", "Bangla", "", 8, "Yes", "Screen guide + exercise"]] + [[None] * 11 for _ in range(29)],
                [8, 20, 50, 16, 11, 9, 11, 16, 10, 12, 22])
    dropdown(sc, f"G2:G{end}", ["Bangla", "English", "Bangla + English"])
    dropdown(sc, f"J2:J{end}", ["Yes", "No"])
    input_cells(sc, f"A2:K{end}")
    so = wb.create_sheet("Sign-off")
    end = table(so, ["User name", "Department", "Role", "Sessions attended", "Practical assessment (score /10)", "Can perform role in Odoo?", "Trainer signature", "User signature", "Date"],
                [[None] * 9 for _ in range(60)], [22, 16, 20, 14, 16, 16, 18, 18, 11])
    dropdown(so, f"F2:F{end}", ["Yes", "Needs refresher", "No"])
    input_cells(so, f"A2:I{end}")
    so.conditional_formatting.add(f"F2:F{end}", CellIsRule(operator="equal", formula=['"No"'], fill=PatternFill("solid", fgColor="FBE0DF")))
    save(wb, "odoo-training-plan-signoff.xlsx")


# ---------------------------------------------------------------- 6. Business case & ROI
def business_case():
    wb = Workbook()
    about_sheet(wb, "ERP Business Case & 3-Year ROI Model (Bangladesh)",
                "The spreadsheet version of the Odoo ROI calculator: five benefit categories, a full 3-year TCO, ROI and payback, ready to adapt for your board paper.",
                ["Enter your numbers in the yellow cells on 'Inputs'. Defaults are a typical mid-sized manufacturer.",
                 "Benefits use a ramp: year 1 counts only part of the full benefit (hypercare and adoption).",
                 "'Summary' gives ROI, payback and net gain for the executive summary.",
                 "Prefer the online version? mhasan.me/tools/odoo-roi-calculator/"],
                "/lab/0044-erp-business-case-bangladesh")
    ws = wb.create_sheet("Inputs")
    rows = [
        ("BENEFITS", None, None),
        ("Admin / data-entry staff (headcount)", 10, ""), ("Average monthly cost per person (৳)", 25000, ""), ("Time recovered by ERP (%)", 0.20, "pct"),
        ("Average inventory at cost (৳)", 30000000, ""), ("Realistic inventory reduction (%)", 0.12, "pct"), ("Bank working-capital rate (%)", 0.11, "pct"), ("Carrying cost (%)", 0.03, "pct"),
        ("Annual purchase spend (৳)", 50000000, ""), ("Procurement savings rate (%)", 0.02, "pct"),
        ("Annual production value (৳)", 100000000, ""), ("Waste today (%)", 0.04, "pct"), ("Waste after ERP (%)", 0.03, "pct"),
        ("Accounts receivable (৳)", 20000000, ""), ("DSO today (days)", 45, ""), ("DSO days saved", 10, ""),
        ("Year-1 benefit realisation (ramp)", 0.45, "pct"), ("Year-2 benefit realisation", 1.0, "pct"), ("Year-3 benefit realisation", 1.0, "pct"),
        ("COSTS", None, None),
        ("Implementation fee (one-time, ৳)", 1800000, ""), ("Internal team time (one-time, ৳)", 500000, ""), ("Training at go-live (one-time, ৳)", 250000, ""), ("Hardware / set-up (one-time, ৳)", 100000, ""),
        ("Odoo licence per year (৳)", 300000, ""), ("Hosting per year (৳)", 150000, ""), ("Support contract per year (৳)", 300000, ""), ("Refresher training per year (৳)", 50000, ""),
        ("Contingency on one-time costs (%)", 0.15, "pct"),
    ]
    ws.column_dimensions["A"].width = 44
    ws.column_dimensions["B"].width = 18
    ws.column_dimensions["C"].width = 50
    ref = {}
    for i, (label, val, fmt) in enumerate(rows, start=1):
        a = ws.cell(row=i, column=1, value=label)
        if val is None:
            a.font = Font(bold=True, color="FFFFFF")
            a.fill = HEAD_FILL
            ws.cell(row=i, column=2).fill = HEAD_FILL
            continue
        b = ws.cell(row=i, column=2, value=val)
        b.fill = INPUT_FILL
        b.number_format = "0%" if fmt == "pct" else "#,##0"
        ref[label] = f"Inputs!B{i}"
    ws.cell(row=18, column=3, value="Nothing in months 1–3 (hypercare); benefits phase in over year 1").font = Font(italic=True, color="666666")

    R = lambda k: ref[k]
    s = wb.create_sheet("Benefits")
    lines = [
        ("Labour efficiency", f"={R('Admin / data-entry staff (headcount)')}*{R('Average monthly cost per person (৳)')}*12*{R('Time recovered by ERP (%)')}"),
        ("Inventory & working capital", f"={R('Average inventory at cost (৳)')}*{R('Realistic inventory reduction (%)')}*({R('Bank working-capital rate (%)')}+{R('Carrying cost (%)')})"),
        ("Procurement savings", f"={R('Annual purchase spend (৳)')}*{R('Procurement savings rate (%)')}"),
        ("Production & waste", f"={R('Annual production value (৳)')}*MAX(0,{R('Waste today (%)')}-{R('Waste after ERP (%)')})"),
        ("Finance & collections", f"=IF({R('DSO today (days)')}=0,0,{R('Accounts receivable (৳)')}/{R('DSO today (days)')}*MIN({R('DSO days saved')},{R('DSO today (days)')})*{R('Bank working-capital rate (%)')})"),
    ]
    out = []
    for i, (name, f) in enumerate(lines, start=2):
        out.append([name, f, f"=B{i}*{R('Year-1 benefit realisation (ramp)')}", f"=B{i}*{R('Year-2 benefit realisation')}", f"=B{i}*{R('Year-3 benefit realisation')}", f"=SUM(C{i}:E{i})"])
    end = table(s, ["Benefit", "Full run-rate per year (৳)", "Year 1", "Year 2", "Year 3", "3-year total"], out, [30, 22, 16, 16, 16, 18])
    s.cell(row=end + 1, column=1, value="TOTAL").font = Font(bold=True)
    for col in "BCDEF":
        c = s[f"{col}{end + 1}"]
        c.value = f"=SUM({col}2:{col}{end})"
        c.font = Font(bold=True)
    for row in s.iter_rows(min_row=2, max_row=end + 1, min_col=2, max_col=6):
        for c in row:
            c.number_format = "#,##0"
    bt = end + 1

    c = wb.create_sheet("Costs")
    one = f"=({R('Implementation fee (one-time, ৳)')}+{R('Internal team time (one-time, ৳)')}+{R('Training at go-live (one-time, ৳)')}+{R('Hardware / set-up (one-time, ৳)')})*(1+{R('Contingency on one-time costs (%)')})"
    rec = f"={R('Odoo licence per year (৳)')}+{R('Hosting per year (৳)')}+{R('Support contract per year (৳)')}+{R('Refresher training per year (৳)')}"
    table(c, ["Cost", "Year 1", "Year 2", "Year 3", "3-year total"], [
        ["One-time (incl. contingency)", one, 0, 0, "=SUM(B2:D2)"],
        ["Recurring", rec, rec, rec, "=SUM(B3:D3)"],
        ["TOTAL", "=B2+B3", "=C2+C3", "=D2+D3", "=SUM(B4:D4)"],
    ], [30, 18, 18, 18, 18])
    for row in c.iter_rows(min_row=2, max_row=4, min_col=2, max_col=5):
        for x in row:
            x.number_format = "#,##0"
    for x in c[4]:
        x.font = Font(bold=True)

    sm = wb.create_sheet("Summary")
    table(sm, ["Business case summary", "Value"], [
        ["3-year benefits (৳)", f"=Benefits!F{bt}"],
        ["3-year total cost of ownership (৳)", "=Costs!E4"],
        ["Net gain over 3 years (৳)", "=B2-B3"],
        ["3-year ROI", "=IF(B3=0,0,(B2-B3)/B3)"],
        ["Simple payback (months, full run-rate)", f"=IF(Benefits!B{bt}=0,\"n/a\",B3/(Benefits!B{bt}/12))"],
        ["Verdict", "=IF(B5<0,\"Does not pay back in 3 years — revisit scope/costs\",IF(B5<1,\"Below 100%: proceed with caution\",IF(B5<2,\"100–200%: acceptable\",IF(B5<=4,\"200–400%: strong case\",\"Above 400%: re-check assumptions\"))))"],
    ], [42, 44])
    for r in (2, 3, 4):
        sm[f"B{r}"].number_format = "#,##0"
    sm["B5"].number_format = "0%"
    sm["B6"].number_format = "0.0"
    sm["A9"] = "Executive summary (draft for your board paper)"
    sm["A9"].font = Font(bold=True, color=TEAL)
    sm["A10"] = "Problem today (as-is): [e.g. month-end close takes 12 days; stock is reconciled twice a year; Mushak 6.3 prepared manually]"
    sm["A11"] = "Proposed solution (to-be): [Odoo modules and scope]"
    sm["A12"] = "Risks of doing nothing: [e.g. buyer traceability requirements, audit findings, growth needs more admin staff]"
    sm["A13"] = "Key implementation risks and mitigations: [ownership, data quality, key-user time — see the ERP readiness assessment]"
    for r in range(10, 14):
        sm[f"A{r}"].fill = INPUT_FILL
        sm[f"A{r}"].alignment = WRAP
    save(wb, "erp-business-case-roi-model.xlsx")


# ---------------------------------------------------------------- 7. Roadmap + RACI
def roadmap():
    wb = Workbook()
    about_sheet(wb, "Odoo Implementation Roadmap (12-week Gantt) & RACI",
                "A 12-week, 5-phase roadmap for a Bangladesh SME implementation, with the RACI matrix and go/no-go criteria. Larger projects stretch each phase; the sequence stays the same.",
                ["Set your start date on 'Gantt' (cell B1); week headers update automatically.",
                 "Adjust start week and duration per task; bars redraw via conditional formatting.",
                 "Plan around Eid, Pohela Boishakh and fiscal year-end (June). Never go live in the week before Eid.",
                 "Use 'RACI' to make ownership explicit before kick-off."],
                "/lab/0028-odoo-implementation-roadmap-bangladesh")
    g = wb.create_sheet("Gantt")
    g["A1"] = "Project start date"
    g["A1"].font = Font(bold=True)
    g["B1"] = date(2026, 11, 1)
    g["B1"].number_format = "dd-mmm-yyyy"
    g["B1"].fill = INPUT_FILL
    tasks = [
        ("1 Discovery", "Kick-off, roles, communication plan", 1, 1), ("1 Discovery", "Process workshops (as-is) per department", 1, 2), ("1 Discovery", "Gap analysis & signed requirements (BRD)", 2, 1),
        ("2 Configuration", "Company, chart of accounts, taxes (VAT/SD/VDS/TDS)", 3, 1), ("2 Configuration", "Inventory, purchase, sales configuration", 3, 2),
        ("2 Configuration", "Manufacturing / payroll configuration", 4, 2), ("2 Configuration", "Reports & print formats (Mushak 6.3, challan, payslip)", 5, 2), ("2 Configuration", "Conference room pilot with key users", 6, 1),
        ("3 Data & UAT", "Data cleansing & trial load #1", 7, 1), ("3 Data & UAT", "UAT cycle 1 with scripts", 8, 1), ("3 Data & UAT", "Fixes, trial load #2 (timed), UAT cycle 2", 9, 1),
        ("4 Training", "Role-based training (Bangla where needed)", 10, 2), ("4 Training", "Practical assessment & user sign-off", 11, 1),
        ("5 Go-live", "Go/no-go meeting, freeze, physical stock count", 12, 1), ("5 Go-live", "Cut-over & go-live", 12, 1), ("5 Go-live", "Hypercare (continues 2–6 weeks)", 12, 1),
    ]
    head = ["Phase", "Task", "Start week", "Weeks", "Owner", "Status"] + [f"W{w}" for w in range(1, 17)]
    for i, h in enumerate(head, 1):
        c = g.cell(row=3, column=i, value=h)
        c.font = HEAD_FONT
        c.fill = HEAD_FILL
        c.alignment = CENTER
    for w in range(1, 17):
        c = g.cell(row=2, column=6 + w, value=f"=$B$1+{(w - 1) * 7}")
        c.number_format = "dd-mmm"
        c.font = Font(size=8, color="666666")
        g.column_dimensions[get_column_letter(6 + w)].width = 6.5
    for r, (ph, t, s, d) in enumerate(tasks, start=4):
        for ci, v in enumerate([ph, t, s, d, "", "Not started"], 1):
            cell = g.cell(row=r, column=ci, value=v)
            cell.border = BORDER
            cell.alignment = WRAP
        for ci in (3, 4, 5, 6):
            g.cell(row=r, column=ci).fill = INPUT_FILL
    last = 3 + len(tasks) + 10
    g.column_dimensions["A"].width = 16
    g.column_dimensions["B"].width = 48
    g.column_dimensions["C"].width = 10
    g.column_dimensions["D"].width = 8
    g.column_dimensions["E"].width = 14
    g.column_dimensions["F"].width = 12
    rng = f"G4:V{last}"
    g.conditional_formatting.add(rng, FormulaRule(formula=["AND($C4<>\"\",COLUMN()-6>=$C4,COLUMN()-6<$C4+$D4)"], fill=PatternFill("solid", fgColor=TEAL)))
    dropdown(g, f"F4:F{last}", ["Not started", "In progress", "Done", "Blocked"])
    status_colours(g, f"F4:F{last}")
    g.freeze_panes = "C4"

    raci = wb.create_sheet("RACI")
    table(raci, ["Activity", "Sponsor (MD/CFO)", "Client PM", "Odoo consultant", "Key users (dept heads)", "IT admin"], [
        ["Scope sign-off", "A", "R", "C", "C", "I"], ["Business process documentation", "I", "A", "R", "R", "I"],
        ["Odoo configuration decisions", "I", "A", "R", "C", "I"], ["Server setup & user provisioning", "I", "A", "C", "I", "R"],
        ["Data extraction from legacy system", "I", "A", "C", "R", "R"], ["Data cleaning & validation", "I", "A", "R", "R", "I"],
        ["UAT test execution", "I", "A", "C", "R", "I"], ["Training delivery", "I", "A", "R", "R", "I"],
        ["Go-live decision", "A", "R", "C", "C", "C"], ["Hypercare issue escalation", "I", "A", "R", "R", "C"],
    ], [36, 16, 12, 16, 20, 12])
    dropdown(raci, "B2:F11", ["R", "A", "C", "I"])
    raci.cell(row=13, column=1, value="R = Responsible (does it) · A = Accountable (one per row, signs off) · C = Consulted · I = Informed").font = Font(italic=True)

    gn = wb.create_sheet("Go-no-go")
    crit = ["All Must UAT cases passed; no open S1/S2 defects", "Trial load #2 reconciled to the taka (AR, AP, stock value)",
            "Physical stock count completed and approved", "All users trained and signed off for their role",
            "Opening balances approved by finance", "Printers, scanners and internet (with backup link) tested at every site",
            "Hypercare roster agreed: who is on-site, which days", "Rollback plan documented and visible",
            "Not within 7 days before Eid / fiscal year-end"]
    end = table(gn, ["#", "Go-live criterion", "Met?", "Evidence / owner"], [[i, c, None, None] for i, c in enumerate(crit, 1)], [5, 70, 10, 40])
    dropdown(gn, f"C2:C{end}", ["Yes", "No"])
    input_cells(gn, f"C2:D{end}")
    gn.cell(row=end + 2, column=2, value="Decision").font = Font(bold=True)
    gn.cell(row=end + 2, column=3, value=f'=IF(COUNTIF(C2:C{end},"Yes")={end - 1},"GO","NO-GO")')
    save(wb, "odoo-implementation-roadmap-gantt.xlsx")


# ---------------------------------------------------------------- 8. Access rights
def access():
    wb = Workbook()
    about_sheet(wb, "Odoo User Access Rights Matrix",
                "Design access by role before creating users: which app access level each role gets, which record rules limit them (branch, company, own documents), and a quarterly review log.",
                ["Fill 'Role × app' with the access level per role (least privilege).",
                 "List record rules and approval limits in 'Record rules & limits'.",
                 "Map named users to roles in 'Users'. Review quarterly and log it."],
                "/lab/0042-odoo-user-access-rights-configuration")
    ws = wb.create_sheet("Role × app")
    apps = ["Accounting", "Invoicing", "Inventory", "Purchase", "Sales", "Manufacturing", "Quality", "Payroll", "Employees", "Settings"]
    roles = ["Managing director", "Finance manager", "Accountant", "Store keeper", "Warehouse supervisor", "Procurement officer", "Sales executive",
             "Production planner", "QC inspector", "HR / payroll officer", "Internal Odoo admin", "Auditor (read-only)"]
    end = table(ws, ["Role"] + apps + ["Can see cost?", "Approval limit (৳)"], [[r] + [None] * (len(apps) + 2) for r in roles] + [[None] * (len(apps) + 3) for _ in range(8)],
                [24] + [13] * len(apps) + [12, 16])
    dropdown(ws, f"B2:{get_column_letter(len(apps) + 1)}{end}", ["None", "User", "User: own documents", "Manager / Administrator", "Read-only"])
    dropdown(ws, f"{get_column_letter(len(apps) + 2)}2:{get_column_letter(len(apps) + 2)}{end}", ["Yes", "No"])
    input_cells(ws, f"B2:{get_column_letter(len(apps) + 3)}{end}")
    rr = wb.create_sheet("Record rules & limits")
    end = table(rr, ["Rule", "Applies to (group)", "Model / document", "Restriction", "Reason"], [
        ["Branch isolation", "Sales executive", "Sales orders, customers", "Only own branch / sales team", "Confidential pricing per branch"],
        ["Own documents", "Procurement officer", "Purchase orders", "Only POs they created", "Segregation of duties"],
        ["Company isolation", "All users", "All records", "Only allowed companies (multi-company)", "Sister concerns keep separate books"],
        ["PO approval", "Purchase manager", "Purchase orders", "Above ৳5,00,000 needs second approval", "Spending control"],
        ["Payment approval", "Finance manager", "Vendor payments", "Above ৳10,00,000 needs MD approval", "Cash control"],
    ] + [[None] * 5 for _ in range(10)], [22, 22, 24, 40, 36])
    input_cells(rr, f"A2:E{end}")
    us = wb.create_sheet("Users")
    end = table(us, ["User", "Email / login", "Department", "Role", "Companies", "Licence needed?", "Created on", "Deactivated on"], [[None] * 8 for _ in range(60)], [22, 26, 16, 22, 18, 14, 12, 14])
    dropdown(us, f"F2:F{end}", ["Yes (internal user)", "No (portal)"])
    input_cells(us, f"A2:H{end}")
    rv = wb.create_sheet("Quarterly review")
    end = table(rv, ["Review date", "Reviewed by", "Users deactivated", "Access reduced", "Exceptions approved", "Notes"], [[None] * 6 for _ in range(12)], [14, 20, 18, 18, 22, 40])
    input_cells(rv, f"A2:F{end}")
    save(wb, "odoo-user-access-rights-matrix.xlsx")


# ---------------------------------------------------------------- 9. Process mapping
def process_mapping():
    wb = Workbook()
    about_sheet(wb, "As-Is / To-Be Process Mapping Worksheet",
                "Capture how each process works today, where it hurts, and how it will work in Odoo, including whether each step is standard (fit), a workaround, or a customisation (gap).",
                ["One row per step. Group rows by process (procure-to-pay, order-to-cash, plan-to-produce, hire-to-pay, record-to-report).",
                 "Record the document and system used today. That's where the data migration and reports come from.",
                 "Mark each to-be step Fit / Workaround / Gap. Gaps go to the requirements document with a MoSCoW priority."],
                "/lab/0043-as-is-to-be-process-mapping-erp")
    ws = wb.create_sheet("Worksheet")
    rows = [
        ["Procure-to-pay", "P2P-1", "Store raises requisition", "Store keeper", "Paper requisition slip", "Paper", "Slips get lost; no stock check before request", "Purchase request from reordering rule or manual RFQ", "Purchase + Inventory", "Fit", "Must"],
        ["Procure-to-pay", "P2P-2", "Collect 3 quotations, comparative statement", "Procurement officer", "CS in Excel", "Excel", "No price history; CS re-typed each time", "RFQs to 3 vendors, compare in Odoo, vendor price lists", "Purchase", "Fit", "Should"],
        ["Procure-to-pay", "P2P-3", "Approve PO", "Purchase manager / MD", "Signed PO", "Paper", "MD approval delays; no approval limits", "Approval rule above ৳ limit", "Purchase", "Fit", "Must"],
        ["Procure-to-pay", "P2P-4", "Receive goods, GRN", "Store keeper", "GRN book", "Tally (later)", "GRN posted days later; quantities differ", "Receipt against PO, barcode scan, QC check point", "Inventory, Quality", "Fit", "Must"],
        ["Procure-to-pay", "P2P-5", "Enter vendor bill, deduct TDS/VDS", "AP accountant", "Vendor bill, Mushak 6.3", "Tally", "TDS rates by memory; 6.6 prepared manually", "Bill from PO (3-way match), TDS by vendor category, VDS certificate report", "Accounting", "Workaround", "Must"],
        ["Order-to-cash", "O2C-1", "Customer order, credit check", "Sales executive", "Email / phone", "Excel", "Credit limit checked after delivery", "Sales order with credit limit warning", "Sales", "Fit", "Must"],
        ["Order-to-cash", "O2C-2", "Deliver, print challan and 6.3", "Warehouse", "Delivery challan, Mushak 6.3", "Word template", "6.3 numbering errors; BIN missing", "Delivery + 6.3 print format from invoice", "Inventory, Accounting", "Gap", "Must"],
    ] + [[None] * 11 for _ in range(40)]
    end = table(ws, ["Process", "Step ID", "As-is step", "Who (role)", "Document", "System today", "Pain point", "To-be step in Odoo", "Odoo app / feature", "Fit / Workaround / Gap", "Priority (MoSCoW)"],
                rows, [16, 9, 32, 18, 20, 14, 36, 42, 20, 14, 12])
    dropdown(ws, f"J2:J{end}", ["Fit", "Workaround", "Gap"])
    dropdown(ws, f"K2:K{end}", ["Must", "Should", "Could", "Won't"])
    input_cells(ws, f"A9:K{end}")
    ws.conditional_formatting.add(f"J2:J{end}", CellIsRule(operator="equal", formula=['"Gap"'], fill=PatternFill("solid", fgColor="FBE0DF")))
    ws.conditional_formatting.add(f"J2:J{end}", CellIsRule(operator="equal", formula=['"Workaround"'], fill=PatternFill("solid", fgColor="FFF1D6")))
    ws.conditional_formatting.add(f"J2:J{end}", CellIsRule(operator="equal", formula=['"Fit"'], fill=PatternFill("solid", fgColor="D8F3E8")))
    sm = wb.create_sheet("Summary")
    table(sm, ["Measure", "Value"], [
        ["Steps mapped", f"=COUNTA(Worksheet!B2:B{end})"], ["Fit", f"=COUNTIF(Worksheet!J2:J{end},\"Fit\")"],
        ["Workaround", f"=COUNTIF(Worksheet!J2:J{end},\"Workaround\")"], ["Gap (needs development)", f"=COUNTIF(Worksheet!J2:J{end},\"Gap\")"],
        ["Fit rate", "=IF(B2=0,0,B3/B2)"], ["Must-have gaps", f"=COUNTIFS(Worksheet!J2:J{end},\"Gap\",Worksheet!K2:K{end},\"Must\")"],
    ], [30, 16])
    sm["B6"].number_format = "0%"
    save(wb, "as-is-to-be-process-mapping-worksheet.xlsx")


# ---------------------------------------------------------------- 10. Mushak / VAT field map
def mushak_map():
    wb = Workbook()
    about_sheet(wb, "Mushak & VAT in Odoo — Configuration Map (Finance Act 2026)",
                "Every Mushak form, register and return mapped to where it comes from in Odoo, plus the VAT accounts, tax set-up and the most common configuration errors. Updated for quarterly returns and Mushak 9.1.1.",
                ["Tick off each form as its Odoo output is built and tested.",
                 "Create the VAT accounts in 'Accounts' before configuring taxes.",
                 "Test each tax in 'Taxes' with a sample invoice and bill during UAT.",
                 "Confirm details with your VAT adviser: SROs set the specifics."],
                "/lab/0018-mushak-63-odoo-bangladesh")
    ws = wb.create_sheet("Forms → Odoo")
    rows = [
        ["2.1", "Registration / enlistment application", "e-VAT portal (one-time); store BIN on company", "Company settings", "All"],
        ["4.3", "Input-output coefficient (price declaration)", "BOM + product cost report", "Manufacturing, Inventory valuation", "Manufacturers"],
        ["4.3.1", "Coefficient for VAT on actual value addition (new 2026)", "Same data as 4.3", "Manufacturing", "Manufacturers selling exempt/reduced goods later at 15%"],
        ["6.1", "Purchase register", "Vendor bills with tax grids per rate", "Accounting report", "Manufacturers, service providers"],
        ["6.2", "Sales register", "Customer invoices with tax grids per VAT/SD rate", "Accounting report", "Manufacturers, service providers"],
        ["6.2.1", "Purchase-sales register (traders)", "Stock moves + tax per product", "Inventory + Accounting report", "Traders"],
        ["6.3", "Tax invoice (every taxable supply)", "Invoice / delivery print format — can now be issued and kept electronically from the ERP", "Accounting (report layout)", "All registered"],
        ["6.4", "Contract manufacturing challan", "Subcontracting receipt/delivery print", "Manufacturing (subcontracting)", "Subcontractors"],
        ["6.5", "Transfer challan", "Inter-warehouse transfer print", "Inventory", "Multi-unit"],
        ["6.6", "VDS certificate", "Withholding on vendor payments + certificate report", "Accounting", "Withholding entities"],
        ["6.7", "Credit note", "Customer credit note print, with original 6.3 reference", "Accounting", "All registered"],
        ["6.8", "Debit note", "Vendor refund / debit note print", "Accounting", "All registered"],
        ["6.10", "Purchases/sales above ৳2 lakh per invoice", "Filtered invoice report (> 200,000)", "Accounting", "All registered"],
        ["9.1", "VAT return — now quarterly, due 15 days after the cycle; monthly 1/3 advance deposits", "Tax report mapped to return lines (SD included)", "Accounting (tax report)", "Manufacturers, service providers"],
        ["9.1.1", "VAT return for registered traders (new 2026)", "Tax report, trader layout", "Accounting (tax report)", "Traders"],
        ["9.2", "Turnover tax return (yearly; four-month tax periods)", "Sales total per period", "Invoicing", "Turnover-tax enlisted (≤ ৳50 lakh)"],
    ]
    end = table(ws, ["Mushak", "What it is", "Where it comes from in Odoo", "App", "Who needs it", "Built?", "Tested in UAT?", "Notes"],
                [r + [None, None, None] for r in rows], [8, 44, 52, 26, 30, 9, 13, 30])
    dropdown(ws, f"F2:G{end}", ["Yes", "No", "N/A"])
    input_cells(ws, f"F2:H{end}")
    ac = wb.create_sheet("Accounts")
    table(ac, ["Account", "Type", "Suggested code", "Purpose"], [
        ["Output VAT payable", "Current liability", "2110", "Credited by customer invoices with VAT"],
        ["Input VAT recoverable", "Current asset", "1210", "Debited by vendor bills and import VAT/AT; claimed as credit"],
        ["VAT payable to NBR", "Current liability", "2115", "Net VAT settlement before payment (optional, cleaner close)"],
        ["Advance VAT deposits", "Current asset", "1215", "Monthly one-third advance deposits, settled in the quarterly return"],
        ["SD payable", "Current liability", "2112", "Supplementary duty on sales where applicable"],
        ["VDS receivable (deducted by customers)", "Current asset", "1220", "VAT withheld by withholding-entity customers (6.6 received)"],
        ["VDS payable (deducted from vendors)", "Current liability", "2120", "VAT you withheld as a withholding entity (6.6 issued)"],
        ["AIT / TDS payable", "Current liability", "2130", "Income tax withheld from vendors and employees"],
        ["Advance income tax (AIT paid)", "Current asset", "1230", "AIT at import and on receipts, adjustable against income tax"],
    ], [36, 18, 14, 60])
    tx = wb.create_sheet("Taxes")
    end = table(tx, ["Tax name", "Scope", "Rate", "Account", "Tax grid / report line", "Test document", "OK?"], [
        ["VAT 15% (sales)", "Sales", 0.15, "2110", "Output VAT 15%", "Local customer invoice", None],
        ["VAT 15% (purchases)", "Purchases", 0.15, "1210", "Input VAT 15%", "Vendor bill", None],
        ["VAT 7.5% / 10% / 5% (reduced)", "Sales", None, "2110", "Output VAT reduced", "Invoice for reduced-rate item", None],
        ["VAT 0% export", "Sales", 0, "—", "Zero-rated export", "Export invoice (fiscal position)", None],
        ["SD x% + VAT 15%", "Sales", None, "2112 / 2110", "SD + VAT (VAT on value + SD)", "Invoice for SD item", None],
        ["VDS withholding", "Purchases", None, "2120", "VDS", "Bill from service provider", None],
        ["TDS by vendor category", "Purchases", None, "2130", "TDS", "Bill for supply / service / no-TIN vendor", None],
    ], [30, 12, 8, 14, 30, 34, 8])
    for r in range(2, end + 1):
        tx[f"C{r}"].number_format = "0.0%"
    dropdown(tx, f"G2:G{end}", ["Yes", "No"])
    input_cells(tx, f"G2:G{end}")
    er = wb.create_sheet("Common errors")
    table(er, ["Symptom", "Likely cause", "Fix"], [
        ["Tax report output VAT is wrong", "Invoices with wrong/no tax, or wrong tax account", "Filter the GL on output VAT; every credit should be an invoice VAT line"],
        ["Export invoices show 15% VAT", "Fiscal position missing on customer", "Assign 'Export — Zero VAT' fiscal position; reconfirm invoice"],
        ["Input VAT missing from report", "Vendor bills posted without purchase tax", "Make purchase tax default on products/vendors; review bills"],
        ["Tax report ≠ GL", "Manual journals posted straight to VAT accounts", "Post VAT only through invoices/bills; lock VAT accounts for manual entries"],
        ["Import VAT/AT added to product cost", "Landed cost includes VAT/AT", "Only CD, RD, SD and local charges in landed cost; VAT/AT to input VAT/advance VAT"],
    ], [34, 40, 60])
    save(wb, "mushak-vat-odoo-configuration-map.xlsx")


# ---------------------------------------------------------------- 11. Requirements register (MoSCoW)
def requirements_xlsx():
    wb = Workbook()
    about_sheet(wb, "ERP Requirements Register (MoSCoW) & Vendor Fit Scoring",
                "A granular, numbered list of requirements with MoSCoW priority, to send vendors with the RFP and score their responses (Native / Workaround / Customisation).",
                ["One requirement per row, specific and testable. Use the module prefix for IDs.",
                 "Set priority with MoSCoW: Must / Should / Could / Won't (this phase).",
                 "Vendors fill their response columns; the summary shows how much of your Must list is standard in each proposal."],
                "/lab/0045-erp-requirements-document-template")
    ws = wb.create_sheet("Requirements")
    rows = [
        ["INV-01", "Inventory", "Track items by serial and/or lot/batch number from receipt to final delivery.", "Must"],
        ["INV-02", "Inventory", "Automatic landed cost apportioning freight and customs duties (CD/RD/SD) over received quantities; VAT/AT excluded from cost.", "Must"],
        ["INV-03", "Inventory", "Barcode receiving, picking and stock counts on handheld scanners.", "Should"],
        ["MRP-01", "Manufacturing", "Multi-level BOMs with phantom BOMs for sub-assemblies and wastage %.", "Must"],
        ["MRP-02", "Manufacturing", "OEE calculated from downtime logs per work centre.", "Should"],
        ["MRP-03", "Manufacturing", "Subcontracting with material sent to the subcontractor and Mushak 6.4 challan.", "Must"],
        ["ACC-01", "Accounting", "Mushak 6.3 generated on invoice validation, issued and stored electronically.", "Must"],
        ["ACC-02", "Accounting", "Quarterly VAT return data (9.1 / 9.1.1) with monthly one-third advance deposit tracking.", "Must"],
        ["ACC-03", "Accounting", "TDS by vendor category (with/without TIN) and VDS with 6.6 certificates.", "Must"],
        ["ACC-04", "Accounting", "Multi-currency with Bangladesh Bank rate revaluation for exporters.", "Should"],
        ["HR-01", "Payroll", "Wage-board grade structure, 9% annual increment, OT at basic÷208×2, festival bonus.", "Must"],
        ["HR-02", "Payroll", "Biometric attendance import and BEFTN salary file for the bank.", "Should"],
        ["GEN-01", "General", "Bangla labels on printed documents for workers (payslip).", "Could"],
    ] + [[None] * 4 for _ in range(60)]
    end = table(ws, ["ID", "Module", "Requirement (specific, testable)", "Priority", "Business owner", "Vendor A response", "Vendor A notes", "Vendor B response", "Vendor B notes", "Vendor C response", "Vendor C notes"],
                [r + [None] * 7 for r in rows], [9, 14, 70, 10, 16, 16, 24, 16, 24, 16, 24])
    dropdown(ws, f"D2:D{end}", ["Must", "Should", "Could", "Won't"])
    for col in ("F", "H", "J"):
        dropdown(ws, f"{col}2:{col}{end}", ["Native", "Workaround / app", "Customisation", "Not possible"])
    input_cells(ws, f"A15:E{end}")
    input_cells(ws, f"F2:K{end}")
    sm = wb.create_sheet("Summary")
    rows = []
    for label, col in (("Vendor A", "F"), ("Vendor B", "H"), ("Vendor C", "J")):
        rows.append([label,
                     f"=COUNTIFS(Requirements!D2:D{end},\"Must\",Requirements!{col}2:{col}{end},\"Native\")",
                     f"=COUNTIFS(Requirements!D2:D{end},\"Must\",Requirements!{col}2:{col}{end},\"Workaround / app\")",
                     f"=COUNTIFS(Requirements!D2:D{end},\"Must\",Requirements!{col}2:{col}{end},\"Customisation\")",
                     f"=COUNTIFS(Requirements!D2:D{end},\"Must\",Requirements!{col}2:{col}{end},\"Not possible\")",
                     f"=IF(COUNTIF(Requirements!D2:D{end},\"Must\")=0,0,B{len(rows) + 2}/COUNTIF(Requirements!D2:D{end},\"Must\"))"])
    table(sm, ["Vendor", "Must: native", "Must: workaround", "Must: customisation", "Must: not possible", "Must covered natively"], rows, [14, 14, 16, 18, 16, 20])
    for r in range(2, 5):
        sm[f"F{r}"].number_format = "0%"
    save(wb, "erp-requirements-register-moscow.xlsx")


# ---------------------------------------------------------------- Word documents
def docx_base(title, subtitle, article):
    d = Document()
    st = d.styles["Normal"]
    st.font.name = "Calibri"
    st.font.size = Pt(11)
    for s in d.sections:
        s.left_margin = s.right_margin = Cm(2.2)
    h = d.add_heading(title, level=0)
    for r in h.runs:
        r.font.color.rgb = RGBColor(0x0B, 0x25, 0x45)
    p = d.add_paragraph(subtitle)
    p.runs[0].italic = True
    p2 = d.add_paragraph("Template by Mehedi Hasan, Odoo Certified Functional Consultant · Method: https://mhasan.me" + article + " · Replace everything in [brackets].")
    p2.runs[0].font.size = Pt(9)
    p2.runs[0].font.color.rgb = RGBColor(0x66, 0x66, 0x66)
    return d


def add_table(d, headers, rows, widths=None):
    t = d.add_table(rows=1, cols=len(headers))
    t.style = "Light Grid Accent 1"
    for i, h in enumerate(headers):
        t.rows[0].cells[i].text = h
        for r in t.rows[0].cells[i].paragraphs[0].runs:
            r.bold = True
    for row in rows:
        cells = t.add_row().cells
        for i, v in enumerate(row):
            cells[i].text = v
    if widths:
        for row in t.rows:
            for i, w in enumerate(widths):
                row.cells[i].width = Cm(w)
    d.add_paragraph()
    return t


def bullets(d, items):
    for it in items:
        d.add_paragraph(it, style="List Bullet")


def charter_docx():
    d = docx_base("Odoo Project Charter", "One page that stops most ERP arguments before they start. Sign it before kick-off.", "/lab/0047-odoo-project-charter-template")
    d.add_heading("1. Project identity", 1)
    add_table(d, ["Item", "Detail"], [["Project name", "[e.g. Odoo ERP implementation — Phase 1]"], ["Company / entities", "[legal entities in scope]"],
                                      ["Sponsor", "[MD / CEO name]"], ["Client project manager", "[name, % time allocated]"], ["Implementation partner & PM", "[firm, name]"],
                                      ["Charter version / date", "[v1.0 — date]"]], [5, 11])
    d.add_heading("2. Objective — the business problem we are solving", 1)
    d.add_paragraph("[e.g. Implement Odoo Enterprise to replace Tally and manual Excel tracking across 3 manufacturing sites, so that stock, costing and VAT come from one system.]")
    d.add_heading("3. Success criteria (measurable)", 1)
    add_table(d, ["KPI", "Today (baseline)", "Target", "Measured when"], [["Month-end close", "[15 days]", "[3 days]", "[3 months after go-live]"],
                                                                         ["Stock accuracy (count vs system)", "[unknown]", "[≥ 98%]", "[first cycle count]"],
                                                                         ["Mushak 6.3 / VAT return preparation", "[2 days manual]", "[same day from Odoo]", "[first quarterly return]"],
                                                                         ["[your KPI]", "", "", ""]], [5, 3.5, 3.5, 4])
    d.add_heading("4. Scope", 1)
    d.add_paragraph("In scope (this phase):", style="Intense Quote")
    bullets(d, ["[Modules: Accounting, Inventory, Purchase, Sales, Manufacturing]", "[Sites / companies]", "[Bangladesh compliance: Mushak 6.3/9.1, VDS, TDS]",
                "[Data migration: masters + opening balances + open documents]", "[Integrations: bank statement import, biometric attendance]"])
    d.add_paragraph("Out of scope (explicitly):", style="Intense Quote")
    bullets(d, ["[e.g. Payroll and HR — Phase 2]", "[e.g. E-commerce integration]", "[e.g. Migration of transaction history older than the current fiscal year]"])
    d.add_heading("5. Timeline and milestones", 1)
    add_table(d, ["Milestone", "Target date", "Sign-off by"], [["Discovery & gap analysis signed", "[Month 1]", "[Sponsor + key users]"], ["Configuration complete / CRP", "[Month 2]", "[Client PM]"],
                                                                ["UAT passed & users trained", "[Month 3]", "[Process owners]"], ["Go-live (go/no-go meeting)", "[Month 4]", "[Sponsor]"],
                                                                ["Hypercare exit", "[Month 4–5]", "[Client PM]"]], [7, 4, 5])
    d.add_heading("6. Budget", 1)
    add_table(d, ["Cost line", "Amount (৳)"], [["Implementation fee", ""], ["Odoo licence (year 1)", ""], ["Hosting / hardware", ""], ["Internal team time (opportunity cost)", ""],
                                                ["Contingency (15–25%)", ""], ["Total approved budget", ""]], [10, 6])
    d.add_heading("7. Governance", 1)
    add_table(d, ["Role", "Name", "Responsibility"], [["Project sponsor", "", "Funds the project, resolves escalations, chairs go-live decision"],
                                                       ["Steering committee", "", "Department heads; meets fortnightly; approves change requests"],
                                                       ["Client project manager", "", "Day-to-day lead; makes sure the internal team tests and decides on time"],
                                                       ["Partner project manager", "", "Delivery of the vendor's scope"],
                                                       ["Key users / champions", "", "Define requirements, test (UAT), train colleagues, sign off"]], [4.5, 4, 7.5])
    d.add_paragraph("Decision rule: process disputes not resolved by key users go to the steering committee and are decided within [48 hours].")
    d.add_heading("8. Change control", 1)
    d.add_paragraph("Any change to scope, timeline or budget is raised as a written change request with cost and schedule impact, and approved by the steering committee before work starts.")
    d.add_heading("9. Key risks", 1)
    add_table(d, ["Risk", "Likelihood", "Impact", "Mitigation", "Owner"], [["Key users not released for testing", "", "", "Protect 20–50% of their time in writing", ""],
                                                                           ["Dirty master data", "", "", "Start clean-up in discovery; trial loads", ""],
                                                                           ["Scope creep", "", "", "Change control; MoSCoW priorities", ""]], [4.5, 2.2, 2, 5, 2.3])
    d.add_heading("10. Sign-off", 1)
    add_table(d, ["Name", "Role", "Signature", "Date"], [["", "Project sponsor", "", ""], ["", "Client project manager", "", ""], ["", "Partner project manager", "", ""]], [4, 4.5, 4.5, 3])
    d.save(os.path.join(OUT, "odoo-project-charter-template.docx"))
    print("wrote odoo-project-charter-template.docx")


def brd_docx():
    d = docx_base("ERP Business Requirements Document (BRD)", "What the business needs the system to do — signed before configuration starts.", "/lab/0045-erp-requirements-document-template")
    d.add_heading("1. Document control", 1)
    add_table(d, ["Item", "Detail"], [["Company", "[name]"], ["Version", "[v0.1]"], ["Prepared by", "[business analyst]"], ["Reviewed by", "[process owners]"], ["Approved by", "[sponsor]"]], [5, 11])
    d.add_heading("2. Business context", 1)
    d.add_paragraph("[Industry, products, sites, number of users, current systems (Tally / Excel / other), and why the company is implementing an ERP now.]")
    d.add_heading("3. Objectives and KPIs", 1)
    bullets(d, ["[Objective 1 — with baseline and target]", "[Objective 2]", "[Objective 3]"])
    d.add_heading("4. Scope", 1)
    add_table(d, ["Area", "In scope", "Out of scope"], [["Modules", "", ""], ["Companies / sites", "", ""], ["Integrations", "", ""], ["Data migration", "", ""]], [4, 6, 6])
    d.add_heading("5. Current (as-is) processes and pain points", 1)
    d.add_paragraph("Attach the as-is / to-be process mapping worksheet. Summarise the top pain points per process here.")
    for p in ["Procure-to-pay", "Order-to-cash", "Plan-to-produce", "Hire-to-pay", "Record-to-report (incl. VAT and month-end)"]:
        d.add_heading(p, 2)
        d.add_paragraph("[How it works today · who · documents · pain points]")
    d.add_heading("6. Functional requirements (MoSCoW)", 1)
    d.add_paragraph("Must = cannot go live without · Should = important, workaround acceptable for now · Could = nice to have · Won't = explicitly not in this phase.")
    add_table(d, ["ID", "Module", "Requirement", "Priority", "Fit (Native / Workaround / Custom)"], [
        ["INV-01", "Inventory", "Track items by lot/serial from receipt to delivery.", "Must", ""],
        ["INV-02", "Inventory", "Landed cost apportions freight, CD, RD, SD over received quantities; VAT/AT excluded from cost.", "Must", ""],
        ["MRP-01", "Manufacturing", "Multi-level BOMs with phantom sub-assemblies and wastage %.", "Must", ""],
        ["ACC-01", "Accounting", "Mushak 6.3 generated on invoice validation and stored electronically.", "Must", ""],
        ["ACC-02", "Accounting", "Quarterly VAT return data with monthly one-third advance deposits.", "Must", ""],
        ["ACC-03", "Accounting", "TDS by vendor category and VDS with Mushak 6.6.", "Must", ""],
        ["HR-01", "Payroll", "Wage-board grades, 9% increment, OT at basic÷208×2, festival bonus.", "Must", ""],
        ["[ID]", "[Module]", "[Requirement]", "[M/S/C/W]", ""]], [1.8, 2.6, 7.4, 1.8, 3.2])
    d.add_heading("7. Bangladesh compliance requirements", 1)
    bullets(d, ["VAT: Mushak 6.3, 6.1/6.2 (or 6.2.1 for traders), 6.7/6.8, 6.10, 9.1 or 9.1.1 (quarterly), VDS 6.6 as applicable",
                "Income tax: TDS on vendor payments by category; AIT at import; salary tax",
                "Customs: HS codes on products; bills of entry linked to receipts and landed costs",
                "Labour: wage-board grades, OT, festival bonus, leave rules (if payroll is in scope)",
                "Trade: LC tracking, bonded warehouse / UD records (exporters)"])
    d.add_heading("8. Reports and print formats", 1)
    add_table(d, ["Report / document", "Users", "Frequency", "Priority"], [["Mushak 6.3", "Accounts, warehouse", "Every sale", "Must"], ["Stock valuation", "Finance", "Monthly", "Must"], ["[report]", "", "", ""]], [6, 4, 3, 3])
    d.add_heading("9. Non-functional requirements", 1)
    bullets(d, ["Availability during business hours (Sunday–Thursday, 09:00–18:00 +06:00)", "Daily backups with 30-day retention; restore tested",
                "Role-based access; audit trail on financial and tax records", "Performance: standard screens load in under 3 seconds on a 10 Mbps connection"])
    d.add_heading("10. Data migration", 1)
    d.add_paragraph("[Objects, source systems, history depth, owners — see the data migration checklist.]")
    d.add_heading("11. Assumptions, constraints and dependencies", 1)
    bullets(d, ["[Assumption]", "[Constraint]", "[Dependency]"])
    d.add_heading("12. Sign-off", 1)
    add_table(d, ["Process owner", "Area", "Signature", "Date"], [["", "Finance", "", ""], ["", "Supply chain", "", ""], ["", "Production", "", ""], ["", "HR", "", ""]], [4.5, 4, 4.5, 3])
    d.save(os.path.join(OUT, "erp-business-requirements-document-template.docx"))
    print("wrote erp-business-requirements-document-template.docx")


def rfp_docx():
    d = docx_base("Request for Proposal — Odoo ERP Implementation", "Send with the requirements register and scoring matrix. Vendors price exactly what you specify.", "/lab/0029-odoo-rfp-template-bangladesh")
    d.add_heading("1. Company overview", 1)
    bullets(d, ["Company: [name], [industry: RMG / textile / trading / pharma / other], founded [year]", "Annual turnover approximately [BDT range]; [number] employees",
                "Current system: [Tally Prime / SAP B1 / custom / spreadsheets] for [accounting / inventory / HR]", "Key pain points: [3–5 specific problems]",
                "Reason for ERP: [growth / compliance / group mandate / new factory]", "Timeline: vendor selected by [date]; start by [date]; target go-live [date]",
                "Budget range for implementation services: approximately [BDT X–Y lakh]. Proposals significantly outside this range will not be evaluated."])
    d.add_heading("2. Scope", 1)
    bullets(d, ["Modules in scope: [Accounting, Inventory, Purchase, Sales, Manufacturing, HR & Payroll, Quality…]",
                "Users: approximately [total]; by department: Accounts [x], Warehouse [x], Procurement [x], Production [x], Management [x]",
                "Deployment: [Odoo Online / Odoo.sh / on-premise at our Dhaka facility]",
                "Bangladesh compliance (non-negotiable): Mushak 6.3 in NBR format; VAT return data for quarterly filing (9.1 / 9.1.1) with monthly advance deposits; VDS and 6.6; TDS by vendor category with certificates; payroll per Labour Act and wage board [if in scope]; [EPZ bond / LC / BGMEA]",
                "Print templates: [PO, delivery challan, invoice/6.3, payslip — letterhead requirements]",
                "Data migration from [system/version]: customers, vendors, products, opening balances, [opening stock], [open orders]",
                "Integrations: [bank statement import, biometric attendance, e-commerce, other]",
                "Out of scope: [e.g. website, e-commerce, hardware purchase, Odoo.sh subscription]",
                "Attached: requirements register (MoSCoW) — please mark each line Native / Workaround / Customisation."])
    d.add_heading("3. Technical requirements", 1)
    bullets(d, ["Odoo version: [18 / 19] Enterprise", "Concurrent users at peak: [x]; describe the proposed server sizing",
                "Availability: Sunday–Thursday 09:00–18:00 (+06:00); maximum planned downtime [4 hours/month]",
                "Backups: daily, minimum 30-day retention; describe backup and restore procedure",
                "Security: SSL, role-based access, audit trail on financial transactions", "Performance: standard transactions under 3 seconds on a 10 Mbps connection"])
    d.add_heading("4. Commercial requirements", 1)
    bullets(d, ["Itemised price: implementation by phase/module, Odoo licence (per user per year, in our company name), custom development, data migration, training, post-go-live support. All in BDT, VAT inclusive.",
                "Payment schedule tied to deliverables; no more than 30% advance before commencement.",
                "Post-go-live support: SLAs per severity, hours, channels, monthly retainer.", "Warranty: minimum 90 days on custom development.",
                "Change control: written change orders with cost and timeline impact before any out-of-scope work; state your daily rate.",
                "Ownership: we hold admin access, receive backups, and own the source code of all custom modules."])
    d.add_heading("5. Vendor qualifications", 1)
    bullets(d, ["Odoo partner tier and certificate", "Minimum two Bangladesh reference sites (company, industry, modules, users, go-live date, named contact)",
                "CVs of the project manager, lead consultant(s) and developer who will actually work on our project; confirm these individuals are committed",
                "Odoo certifications held by the team", "Trade licence and TIN certificate"])
    d.add_heading("6. Implementation methodology", 1)
    bullets(d, ["Week-by-week project plan with milestones and deliverables", "Discovery process: how you document as-is and design to-be; which workshops, who attends",
                "Scope and decision management", "UAT approach: test scripts, defect tracking, sign-off", "Training approach: role-based, materials, language, assessment",
                "Go-live and hypercare: who is on-site, for how long"])
    d.add_heading("7. Submission and evaluation", 1)
    bullets(d, ["Deadline: [date, time +06:00] to [email]", "Format: PDF, maximum 40 pages excluding appendices",
                "Clarification questions by [date]; answers shared with all bidders",
                "Shortlisted vendors (max 3) will run a 2-hour demo on a live Odoo instance showing Bangladesh compliance, using our demo scripts",
                "Evaluation: weighted scoring matrix (Bangladesh experience 30%, methodology 25%, team 20%, commercial 15%, technical 10%). Outcome communicated by [date]."])
    d.save(os.path.join(OUT, "odoo-rfp-document-template.docx"))
    print("wrote odoo-rfp-document-template.docx")


if __name__ == "__main__":
    rfp_scoring()
    uat()
    migration()
    hypercare()
    training()
    business_case()
    roadmap()
    access()
    process_mapping()
    mushak_map()
    requirements_xlsx()
    charter_docx()
    brd_docx()
    rfp_docx()
    print("done ->", OUT)
