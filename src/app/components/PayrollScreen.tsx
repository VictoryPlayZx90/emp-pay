import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, FileText, Printer, ChevronDown } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';
import type { Employee, AttendanceRecord, Holiday, Settings } from '../App';
import { calcPayroll, type CalcResult } from '../utils/attendanceEngine';

interface Props {
  employees: Employee[];
  attendance: Record<string, AttendanceRecord>;
  holidays: Holiday[];
  settings: Settings;
}

type RowData = { emp: Employee } & CalcResult;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function fmt(amount: number, currency: string): string {
  const symbols: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  return `${symbols[currency] ?? currency + ' '}${Math.round(amount).toLocaleString('en-IN')}`;
}

// ─── Shared branding header ───────────────────────────────────────────────────

const BASE_CSS = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;color:#111;background:#fff}`;

function openWindow(html: string) {
  const win = window.open('', '_blank');
  if (!win) { alert('Pop-up blocked — please allow pop-ups.'); return; }
  win.document.write(html);
  win.document.close();
}

function buildBrandingHeader(s: Settings, rightContent: string): string {
  const isCustom = s.brandingMode === 'custom';
  const hasLetterhead = isCustom && s.customLetterhead;

  if (hasLetterhead) {
    const isImg = s.customLetterhead!.startsWith('data:image/');
    const lhBlock = isImg
      ? `<img src="${s.customLetterhead}" style="width:100%;max-height:130px;object-fit:contain;display:block;" />`
      : `<div style="padding:12px;text-align:center;background:#f9fafb;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Custom Letterhead</div>`;
    return `<div style="margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #e5e7eb">
      ${lhBlock}
      <div style="display:flex;justify-content:flex-end;margin-top:8px;font-size:12px;color:#555">${rightContent}</div>
    </div>`;
  }

  const logoHtml = s.companyLogo
    ? `<img src="${s.companyLogo}" style="height:40px;max-width:100px;object-fit:contain;margin-right:12px;flex-shrink:0;" />`
    : '';
  const hasDetails = s.companyAddress || s.companyPhone || s.companyEmail || s.companyWebsite || s.companyGST;
  const detailsHtml = hasDetails
    ? `<div style="text-align:right;font-size:10.5px;color:#666;line-height:1.7;flex-shrink:0;padding-left:14px">
        ${s.companyAddress ? `<div>${s.companyAddress}</div>` : ''}
        ${s.companyPhone   ? `<div>${s.companyPhone}</div>`   : ''}
        ${s.companyEmail   ? `<div>${s.companyEmail}</div>`   : ''}
        ${s.companyWebsite ? `<div>${s.companyWebsite}</div>` : ''}
        ${s.companyGST     ? `<div>GST: ${s.companyGST}</div>` : ''}
      </div>` : '';

  return `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #111;gap:14px">
    <div style="display:flex;align-items:center;flex:1;min-width:0">
      ${logoHtml}
      <div style="font-size:19px;font-weight:800;color:#111;letter-spacing:-0.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.companyName}</div>
    </div>
    ${detailsHtml}
    <div style="text-align:right;flex-shrink:0;padding-left:14px;border-left:1px solid #e5e7eb">${rightContent}</div>
  </div>`;
}

// ─── Payroll statement PDF ─────────────────────────────────────────────────────

function buildPayrollHTML(rows: RowData[], month: number, year: number, settings: Settings): string {
  const mn = MONTH_NAMES[month];
  const { currency } = settings;
  const totalGross = rows.reduce((s, r) => s + r.grossSalary, 0);
  const totalDeduct = rows.reduce((s, r) => s + r.totalDeductions, 0);
  const totalNet = rows.reduce((s, r) => s + r.finalSalary, 0);

  const totalMonthlySalaryPDF = rows.reduce((s, r) => s + r.emp.salary, 0);
  const tableRows = rows.map((r, i) => {
    const hasDeduct = r.totalDeductions > 0;
    const isReduced = r.isJoiningMonth && r.grossSalary < r.emp.salary;
    return `<tr style="background:${i % 2 === 1 ? '#FAFAFA' : '#fff'}">
      <td style="padding:10px 12px;font-size:12.5px;border-bottom:1px solid #f2f2f2">${i + 1}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f2f2f2">
        <strong style="font-size:13px">${r.emp.name}</strong>
        ${r.isJoiningMonth ? `<span style="margin-left:6px;font-size:10px;color:#7C3AED;background:#F5F3FF;padding:1px 6px;border-radius:10px;font-weight:700">New Joiner</span>` : ''}
        <br><span style="font-size:10.5px;color:#999">${r.emp.department}</span>
      </td>
      <td style="padding:10px 12px;font-size:12.5px;border-bottom:1px solid #f2f2f2">${fmt(r.emp.salary, currency)}</td>
      <td style="padding:10px 12px;font-size:12.5px;color:${isReduced ? '#7C3AED' : '#555'};font-weight:${isReduced ? '600' : '400'};border-bottom:1px solid #f2f2f2">${fmt(r.grossSalary, currency)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f2f2f2">
        ${hasDeduct
          ? `<span style="color:#DC2626;font-weight:600;font-size:12.5px">−${fmt(r.totalDeductions, currency)}</span>`
          : `<span style="color:#ccc">—</span>`}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f2f2f2"><strong style="font-size:13px">${fmt(r.finalSalary, currency)}</strong></td>
    </tr>`;
  }).join('');

  const rightBlock = `<div style="font-size:18px;font-weight:700">Payroll Statement</div>
    <div style="font-size:14px;font-weight:600;color:#333;margin-top:3px">${mn} ${year}</div>
    <div style="font-size:10.5px;color:#888;margin-top:3px">${rows.length} employees · Absence-based · Daily rate = Salary ÷ 30</div>
    <div style="font-size:10.5px;color:#bbb;margin-top:2px">Generated ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>`;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Payroll — ${mn} ${year}</title>
<style>${BASE_CSS}
body{padding:44px}
.cards{display:flex;gap:12px;margin-bottom:24px}
.card{flex:1;background:#f8f8f8;border-radius:10px;padding:12px 16px}
.card-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#888;margin-bottom:5px}
.card-value{font-size:17px;font-weight:700}
table{width:100%;border-collapse:collapse}
th{background:#f5f5f5;padding:9px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#888;border-bottom:2px solid #e8e8e8}
tfoot td{font-weight:700;font-size:13px;background:#f5f5f5;border-top:2px solid #ccc;padding:11px 12px}
.footer{margin-top:36px;font-size:10px;color:#bbb;text-align:center;padding-top:12px;border-top:1px solid #f0f0f0}
@media print{body{padding:24px}}
</style></head><body>
${buildBrandingHeader(settings, rightBlock)}
<div class="cards">
  <div class="card"><div class="card-label">Employees</div><div class="card-value">${rows.length}</div></div>
  <div class="card"><div class="card-label">Monthly Salary Commitment</div><div class="card-value">${fmt(totalMonthlySalaryPDF, currency)}</div></div>
  <div class="card"><div class="card-label">Current Month Payable</div><div class="card-value">${fmt(totalGross, currency)}</div></div>
  <div class="card"><div class="card-label">Deductions</div><div class="card-value" style="color:#DC2626">−${fmt(totalDeduct, currency)}</div></div>
  <div class="card"><div class="card-label">Net Disbursed</div><div class="card-value" style="color:#16A34A">${fmt(totalNet, currency)}</div></div>
</div>
<table>
  <thead><tr><th>#</th><th>Employee</th><th>Monthly Salary</th><th>Payable Salary</th><th>Deductions</th><th>Final Salary</th></tr></thead>
  <tbody>${tableRows}</tbody>
  <tfoot><tr><td colspan="2">Total (${rows.length} employees)</td><td>${fmt(totalMonthlySalaryPDF, currency)}</td><td>${fmt(totalGross, currency)}</td><td style="color:#DC2626">−${fmt(totalDeduct, currency)}</td><td>${fmt(totalNet, currency)}</td></tr></tfoot>
</table>
<div class="footer">Absence-based payroll · Daily Rate = Monthly Salary ÷ 30 · ${settings.companyName} · ${mn} ${year}</div>
<script>setTimeout(()=>window.print(),400)</script>
</body></html>`;
}

// ─── Individual payslip ────────────────────────────────────────────────────────
// Layout rules:
//  • Letterhead (if uploaded) → automatic safe gap → payslip content.
//    Content width/margins are NEVER affected by the letterhead.
//  • No app-generated branding. Clean output when no letterhead.
//  • "SALARY PAYSLIP / Generated Date" header only — no big month/year heading.
//  • Page 1: Employee Info + Salary + Deductions + Net Salary (kept together).
//  • Page 2: Attendance Record.
//  • Net Salary Payable never moves to page 2.

function buildPayslipHTML(row: RowData, month: number, year: number, settings: Settings): string {
  const mn = MONTH_NAMES[month];
  const { currency } = settings;
  const joined = new Date(row.emp.joiningDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const generatedDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  // Custom letterhead — rendered at the very top, full-width, aspect-ratio preserved.
  // A 24px gap below separates it from content. Content margins are never changed.
  const hasLetterhead = !!(settings.customLetterhead && settings.customLetterhead.startsWith('data:image/'));
  const letterheadBlock = hasLetterhead
    ? `<div style="width:100%;margin-bottom:24px;line-height:0">
        <img src="${settings.customLetterhead}"
          style="width:100%;max-height:160px;object-fit:contain;display:block;" />
      </div>`
    : '';

  // Deduction rows — only entries with an actual deduction amount
  const deductRow = (label: string, days: number, amt: number) =>
    (days === 0 || amt === 0) ? '' :
    `<tr>
       <td style="padding:8px 0;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6">${label}</td>
       <td style="padding:8px 0;font-size:12px;color:#9ca3af;text-align:center;border-bottom:1px solid #f3f4f6">${days} day${days !== 1 ? 's' : ''}</td>
       <td style="padding:8px 0;font-size:13px;color:#DC2626;font-weight:600;text-align:right;border-bottom:1px solid #f3f4f6">− ${fmt(amt, currency)}</td>
     </tr>`;

  const deductRows = [
    deductRow('Half Day', row.halfDays, row.halfDayDeductAmt),
    deductRow('Unpaid Paid Leave', row.paidLeaves, row.paidLeaveDeductAmt),
    deductRow('Unpaid Sick Leave', row.sickLeaves, row.sickLeaveDeductAmt),
    deductRow('Unpaid Leave', row.unpaidLeaves, row.unpaidLeaveDeductAmt),
    deductRow('Other Absence', row.otherAbs, row.otherAbsDeductAmt),
  ].filter(Boolean).join('');

  // Attendance summary — only meaningful attendance types
  const attItems = [
    { label: 'Present', value: row.presentDays, color: '#16A34A' },
    { label: 'Half Days', value: row.halfDays, color: '#D97706' },
    { label: 'Paid Leave', value: row.paidLeaves, color: '#2563EB' },
    { label: 'Sick Leave', value: row.sickLeaves, color: '#7C3AED' },
    { label: 'Unpaid Leave', value: row.unpaidLeaves, color: '#DC2626' },
    { label: 'Other Absence', value: row.otherAbs, color: '#EA580C' },
  ].filter(item => item.value > 0);

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8">
<title>Payslip — ${row.emp.name} — ${mn} ${year}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#111;background:#fff;padding:40px 48px;max-width:700px;margin:0 auto}
  .doc-header{display:flex;justify-content:space-between;align-items:center;padding-bottom:14px;border-bottom:1px solid #e5e7eb;margin-bottom:28px}
  .sec-title{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9ca3af;padding-bottom:8px;border-bottom:1px solid #e5e7eb;margin-bottom:14px}
  .info-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px 0;margin-bottom:0}
  .info-field .lbl{font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px}
  .info-field .val{font-size:13px;font-weight:600;color:#111}
  .salary-table{width:100%;border-collapse:collapse}
  .salary-table td{padding:9px 0;border-bottom:1px solid #f3f4f6;vertical-align:middle}
  .net-box{background:#111;border-radius:10px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;margin-top:8px}
  .att-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
  .att-card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:10px 12px}
  .att-card .lbl{font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px}
  .att-card .val{font-size:18px;font-weight:700}
  .footer{margin-top:32px;padding-top:14px;border-top:1px solid #f3f4f6;font-size:10px;color:#9ca3af;text-align:center;line-height:1.7}
  /* Page 1: keep core payslip together; attendance starts on page 2 when printing */
  @media print{
    body{padding:28px 36px}
    .page1{page-break-inside:avoid}
    .page2{page-break-before:always}
  }
</style>
</head><body>

${letterheadBlock}

<!-- Document header: SALARY PAYSLIP + generated date only (no month/year) -->
<div class="doc-header">
  <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#9ca3af">Salary Payslip</div>
  <div style="font-size:10.5px;color:#9ca3af">Generated ${generatedDate}</div>
</div>

<!-- PAGE 1: Employee Info + Salary + Deductions + Net Salary -->
<div class="page1">

  <!-- Employee Information -->
  <div style="margin-bottom:24px">
    <div class="sec-title">Employee Information</div>
    <div class="info-grid">
      <div class="info-field"><div class="lbl">Employee Name</div><div class="val">${row.emp.name}</div></div>
      <div class="info-field"><div class="lbl">Pay Period</div><div class="val">${mn} ${year}</div></div>
      <div class="info-field"><div class="lbl">Department</div><div class="val">${row.emp.department}</div></div>
      ${row.emp.designation ? `<div class="info-field"><div class="lbl">Designation</div><div class="val">${row.emp.designation}</div></div>` : '<div></div>'}
      <div class="info-field"><div class="lbl">Date of Joining</div><div class="val">${joined}</div></div>
      ${row.emp.employeeCode ? `<div class="info-field"><div class="lbl">Employee Code</div><div class="val">${row.emp.employeeCode}</div></div>` : '<div></div>'}
    </div>
  </div>

  <!-- Earnings -->
  <div style="margin-bottom:20px">
    <div class="sec-title">Earnings</div>
    <table class="salary-table">
      <tr>
        <td style="font-size:13px;color:#374151">Monthly Salary</td>
        <td></td>
        <td style="text-align:right;font-size:14px;font-weight:700;color:#111">${fmt(row.emp.salary, currency)}</td>
      </tr>
      ${row.isJoiningMonth ? `<tr>
        <td style="font-size:13px;color:#7C3AED">Payable Salary <span style="font-size:10px;background:#f5f3ff;color:#7C3AED;padding:1px 7px;border-radius:10px;font-weight:700;margin-left:6px">First Payroll Cycle</span></td>
        <td style="font-size:11px;color:#9ca3af;text-align:center">${row.eligibleDays} days</td>
        <td style="text-align:right;font-size:13px;font-weight:600;color:#7C3AED">${fmt(row.grossSalary, currency)}</td>
      </tr>` : ''}
    </table>
  </div>

  <!-- Deductions -->
  <div style="margin-bottom:20px">
    <div class="sec-title">Deductions</div>
    ${deductRows ? `
    <table class="salary-table" style="margin-bottom:10px">
      <thead><tr>
        <th style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;font-weight:700;padding-bottom:7px;border-bottom:1px solid #e5e7eb;text-align:left">Reason</th>
        <th style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;font-weight:700;padding-bottom:7px;border-bottom:1px solid #e5e7eb;text-align:center;width:80px">Days</th>
        <th style="font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;font-weight:700;padding-bottom:7px;border-bottom:1px solid #e5e7eb;text-align:right;width:110px">Amount</th>
      </tr></thead>
      <tbody>${deductRows}</tbody>
      <tfoot><tr>
        <td style="padding-top:10px;font-size:13px;font-weight:700;color:#DC2626;border-top:1px solid #e5e7eb">Total Deductions</td>
        <td style="border-top:1px solid #e5e7eb"></td>
        <td style="padding-top:10px;text-align:right;font-size:14px;font-weight:700;color:#DC2626;border-top:1px solid #e5e7eb">− ${fmt(row.totalDeductions, currency)}</td>
      </tr></tfoot>
    </table>` :
    `<div style="font-size:13px;color:#16A34A;padding:10px 0;font-weight:500">✓ No deductions this period</div>`}
  </div>

  <!-- Net Salary — always stays on page 1 -->
  <div class="net-box">
    <div>
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af;margin-bottom:3px">Net Salary Payable</div>
      <div style="font-size:11px;color:#6b7280">${mn} ${year} · ${settings.companyName}</div>
    </div>
    <div style="font-size:24px;font-weight:800;color:#fff">${fmt(row.finalSalary, currency)}</div>
  </div>

</div><!-- end .page1 -->

<!-- PAGE 2: Attendance Record (starts new page when printed) -->
${attItems.length > 0 ? `
<div class="page2" style="margin-top:36px">
  <div class="sec-title">Attendance Record — ${mn} ${year}</div>
  <div class="att-grid">
    ${attItems.map(item => `
      <div class="att-card">
        <div class="lbl">${item.label}</div>
        <div class="val" style="color:${item.color}">${item.value}</div>
      </div>`).join('')}
  </div>
</div>` : ''}

<div class="footer" style="${attItems.length > 0 ? 'margin-top:24px' : ''}">
  This document was generated electronically. No signature required.<br>
  Generated by EmpPay · ${settings.companyName} · ${generatedDate}
</div>

<script>setTimeout(()=>window.print(),400)</script>
</body></html>`;
}

// ─── All payslips in one window ────────────────────────────────────────────────
// Reuses buildPayslipHTML per employee and wraps with page-breaks between slips.

function buildAllPayslipsHTML(rows: RowData[], month: number, year: number, settings: Settings): string {
  const mn = MONTH_NAMES[month];
  // Strip the outer html/head/body wrapper from each individual payslip,
  // keeping only the body content to embed inline.
  const extractBody = (html: string) =>
    html.replace(/^[\s\S]*?<body[^>]*>/i, '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<\/body>[\s\S]*$/i, '');

  const slips = rows.map((row, idx) => {
    const isLast = idx === rows.length - 1;
    return `<div style="max-width:700px;margin:0 auto;padding:40px 48px;${isLast ? '' : 'page-break-after:always'}">
      ${extractBody(buildPayslipHTML(row, month, year, settings))}
    </div>`;
  }).join('\n');

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><title>Payslips — ${mn} ${year}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#111;background:#fff}
  .doc-header{display:flex;justify-content:space-between;align-items:center;padding-bottom:14px;border-bottom:1px solid #e5e7eb;margin-bottom:28px}
  .sec-title{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9ca3af;padding-bottom:8px;border-bottom:1px solid #e5e7eb;margin-bottom:14px}
  .info-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px 0}
  .info-field .lbl{font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px}
  .info-field .val{font-size:13px;font-weight:600;color:#111}
  .salary-table{width:100%;border-collapse:collapse}
  .salary-table td{padding:9px 0;border-bottom:1px solid #f3f4f6;vertical-align:middle}
  .net-box{background:#111;border-radius:10px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;margin-top:8px}
  .att-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
  .att-card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:10px 12px}
  .att-card .lbl{font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px}
  .att-card .val{font-size:18px;font-weight:700}
  .footer{margin-top:32px;padding-top:14px;border-top:1px solid #f3f4f6;font-size:10px;color:#9ca3af;text-align:center;line-height:1.7}
  @media print{.page1{page-break-inside:avoid}.page2{page-break-before:always}}
</style></head>
<body>
${slips}
<script>setTimeout(()=>window.print(),400)</script>
</body></html>`;
}

// ─── Chip component ────────────────────────────────────────────────────────────
function Chip({ label, count, color, bg }: { label: string; count: number; color: string; bg: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: bg, border: `1px solid ${color}28`, borderRadius: 20 }}>
      <span style={{ fontSize: 12.5, fontWeight: 700, color }}>{count}</span>
      <span style={{ fontSize: 11, color, opacity: 0.85 }}>{label}</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PayrollScreen({ employees, attendance, holidays, settings }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const isMobile = useIsMobile();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const shiftMonth = (dir: number) => {
    let m = month + dir, y = year;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setMonth(m); setYear(y);
  };

  // Only include employees who had joined on or before the last day of the selected month.
  // Employees without a joining date are always included (backward compat).
  const activeEmployees = employees.filter(emp => {
    if (!emp.joiningDate) return true;
    const [jy, jm] = emp.joiningDate.split('-').map(Number);
    return jy < year || (jy === year && jm - 1 <= month);
  });

  const rows: RowData[] = activeEmployees.map(emp => ({
    emp,
    ...calcPayroll(emp, year, month, attendance, holidays, settings),
  }));

  // Monthly Salary Commitment = sum of contracted salaries (no proration)
  const totalMonthlySalary = rows.reduce((s, r) => s + r.emp.salary, 0);
  // Current Month Payable = after joining-date proration
  const totalPayable = rows.reduce((s, r) => s + r.grossSalary, 0);
  const totalNet     = rows.reduce((s, r) => s + r.finalSalary, 0);
  const totalDeduct  = rows.reduce((s, r) => s + r.totalDeductions, 0);
  const { currency } = settings;

  const handleExportPDF   = () => openWindow(buildPayrollHTML(rows, month, year, settings));
  const handleAllPayslips = () => openWindow(buildAllPayslipsHTML(rows, month, year, settings));
  const handlePayslip = (row: RowData) => openWindow(buildPayslipHTML(row, month, year, settings));

  const MonthSelector = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--app-card)', border: '1px solid var(--app-border)', borderRadius: 12, padding: '5px 8px' }}>
      <button onClick={() => shiftMonth(-1)} style={{ width: 30, height: 30, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--app-text-muted)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ChevronLeft style={{ width: 16, height: 16 }} />
      </button>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--app-text-primary)', minWidth: isMobile ? 108 : 126, textAlign: 'center' }}>
        {MONTH_NAMES[month]} {year}
      </span>
      <button onClick={() => shiftMonth(1)} style={{ width: 30, height: 30, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--app-text-muted)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ChevronRight style={{ width: 16, height: 16 }} />
      </button>
    </div>
  );

  return (
    <div style={{ padding: isMobile ? '20px 16px' : '32px 36px', maxWidth: isMobile ? '100%' : 1020, margin: '0 auto' }}>

      {/* ── Header ── */}
      {isMobile ? (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h1 style={{ color: 'var(--app-text-primary)', fontSize: 20, marginBottom: 2 }}>Payroll</h1>
              <p style={{ fontSize: 12.5, color: 'var(--app-text-muted)' }}>{activeEmployees.length} employees · Daily rate = salary ÷ 30</p>
            </div>
            <MonthSelector />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleExportPDF} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', fontSize: 13, fontWeight: 500, background: 'var(--app-btn-secondary-bg)', border: '1px solid var(--app-btn-secondary-border)', borderRadius: 10, color: 'var(--app-btn-secondary-fg)', cursor: 'pointer' }}>
              <FileText style={{ width: 14, height: 14 }} /> PDF
            </button>
            <button onClick={handleAllPayslips} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', fontSize: 13, fontWeight: 600, background: 'var(--app-btn-primary-bg)', border: 'none', borderRadius: 10, color: 'var(--app-btn-primary-fg)', cursor: 'pointer' }}>
              <Download style={{ width: 14, height: 14 }} /> Payslips
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ color: 'var(--app-text-primary)', marginBottom: 2 }}>Payroll</h1>
            <p style={{ fontSize: 13.5, color: 'var(--app-text-muted)' }}>{activeEmployees.length} employees · Absence-based · Daily rate = Salary ÷ 30</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MonthSelector />
            <button onClick={handleExportPDF} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13, fontWeight: 500, background: 'var(--app-btn-secondary-bg)', border: '1px solid var(--app-btn-secondary-border)', borderRadius: 12, color: 'var(--app-btn-secondary-fg)', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--app-btn-secondary-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--app-btn-secondary-bg)')}>
              <FileText style={{ width: 14, height: 14 }} /> Export PDF
            </button>
            <button onClick={handleAllPayslips} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, background: 'var(--app-btn-primary-bg)', border: 'none', borderRadius: 12, color: 'var(--app-btn-primary-fg)', cursor: 'pointer' }}>
              <Download style={{ width: 14, height: 14 }} /> Download All Payslips
            </button>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? 10 : 14, marginBottom: isMobile ? 16 : 22 }}>
        {[
          { label: 'Employees',                value: String(activeEmployees.length),                   sub: 'on payroll',            color: 'var(--app-text-primary)' },
          { label: 'Monthly Salary Commitment', value: fmt(totalMonthlySalary, currency),                sub: 'contracted salaries',   color: 'var(--app-text-primary)' },
          { label: 'Current Month Payable',     value: fmt(totalPayable, currency),                      sub: 'after joining proration', color: totalPayable < totalMonthlySalary ? '#7C3AED' : 'var(--app-text-primary)' },
          { label: 'Total Deductions',          value: totalDeduct > 0 ? `−${fmt(totalDeduct, currency)}` : '—', sub: 'absence deductions', color: totalDeduct > 0 ? '#DC2626' : 'var(--app-text-muted)' },
        ].map(card => (
          <div key={card.label} style={{ background: 'var(--app-card)', border: '1px solid var(--app-border)', borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--app-text-muted)', fontWeight: 500, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{card.label}</div>
            <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 700, color: card.color, lineHeight: 1.1 }}>{card.value}</div>
            <div style={{ fontSize: 11, color: 'var(--app-text-muted)', marginTop: 3 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Mobile: cards ── */}
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map(row => (
            <div key={row.emp.id} style={{ background: 'var(--app-card)', border: '1px solid var(--app-border)', borderRadius: 14, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--app-text-primary)' }}>{row.emp.name}</div>
                    {row.isJoiningMonth && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE', flexShrink: 0 }}>New Joiner</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--app-text-muted)', marginTop: 1 }}>{row.emp.department}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--app-text-primary)' }}>{fmt(row.finalSalary, currency)}</div>
                  {row.totalDeductions > 0 && <div style={{ fontSize: 11.5, color: '#DC2626', marginTop: 1 }}>−{fmt(row.totalDeductions, currency)}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--app-text-muted)', background: 'var(--app-subtle-bg)', borderRadius: 20, padding: '2px 9px' }}>
                  Monthly: {fmt(row.emp.salary, currency)}
                </span>
                {row.isJoiningMonth && (
                  <span style={{ fontSize: 12, color: '#7C3AED', background: '#F5F3FF', borderRadius: 20, padding: '2px 9px' }}>
                    Payable: {fmt(row.grossSalary, currency)}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--app-border-subtle)' }}>
                <button onClick={() => handlePayslip(row)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', fontSize: 12.5, fontWeight: 500, background: 'var(--app-subtle-bg)', border: 'none', borderRadius: 8, color: 'var(--app-text-secondary)', cursor: 'pointer' }}>
                  <Printer style={{ width: 13, height: 13 }} /> Payslip
                </button>
              </div>
            </div>
          ))}
          <p style={{ fontSize: 12, color: 'var(--app-text-muted)', textAlign: 'center', padding: '4px 0' }}>
            Net total: <strong style={{ color: 'var(--app-text-primary)' }}>{fmt(totalNet, currency)}</strong>
          </p>
        </div>
      ) : (
        /* ── Desktop: table ── */
        <>
        <div style={{ background: 'var(--app-card)', border: '1px solid var(--app-border)', borderRadius: 16, overflow: 'hidden' }}>
          {/* Header row — Employee | Monthly Salary | Payable Salary | Deductions | Final Salary | Print */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 110px 110px 120px 44px', padding: '10px 20px', background: 'var(--app-table-header-bg)', borderBottom: '1px solid var(--app-border-subtle)' }}>
            {['Employee', 'Monthly Salary', 'Payable Salary', 'Deductions', 'Final Salary', ''].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--app-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
            ))}
          </div>

          {rows.map(row => {
            const isExpanded = expandedRow === row.emp.id;
            // Payable salary = grossSalary (prorated for joining months, else == monthly salary)
            const payableSalary = row.grossSalary;
            const isReduced = row.isJoiningMonth && payableSalary < row.emp.salary;
            return (
              <div key={row.emp.id} style={{ borderBottom: '1px solid var(--app-border-subtle)' }}>
                <div
                  style={{ display: 'grid', gridTemplateColumns: '1fr 110px 110px 110px 120px 44px', padding: '13px 20px', alignItems: 'center', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--app-card-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => setExpandedRow(isExpanded ? null : row.emp.id)}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--app-text-primary)' }}>{row.emp.name}</div>
                      {row.isJoiningMonth && (
                        <span style={{ fontSize: 9.5, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE', flexShrink: 0 }}>New Joiner</span>
                      )}
                      <ChevronDown style={{ width: 13, height: 13, color: 'var(--app-text-muted)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }} />
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--app-text-muted)' }}>{row.emp.department}</div>
                  </div>
                  {/* Monthly Salary — always the contracted amount */}
                  <div style={{ fontSize: 13, color: 'var(--app-text-secondary)' }}>{fmt(row.emp.salary, currency)}</div>
                  {/* Payable Salary — may differ for new joiners */}
                  <div style={{ fontSize: 13, color: isReduced ? '#7C3AED' : 'var(--app-text-secondary)', fontWeight: isReduced ? 600 : 400 }}>
                    {fmt(payableSalary, currency)}
                  </div>
                  <div>
                    {row.totalDeductions > 0
                      ? <span style={{ fontSize: 13, fontWeight: 600, color: '#DC2626' }}>−{fmt(row.totalDeductions, currency)}</span>
                      : <span style={{ fontSize: 13, color: 'var(--app-text-faint)' }}>—</span>}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--app-text-primary)' }}>{fmt(row.finalSalary, currency)}</div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={e => { e.stopPropagation(); handlePayslip(row); }} title="Download payslip"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--app-text-muted)', padding: 6, borderRadius: 8 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--app-text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'var(--app-subtle-bg)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--app-text-muted)'; (e.currentTarget as HTMLElement).style.background = 'none'; }}>
                      <Printer style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>

                {/* Expandable deduction breakdown */}
                {isExpanded && (
                  <div style={{ padding: '10px 20px 16px 20px', background: 'var(--app-table-header-bg)', borderTop: '1px solid var(--app-border-subtle)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--app-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                      Deduction Breakdown — {MONTH_NAMES[month]} {year}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      {row.presentDays > 0 && <Chip label="Present" count={row.presentDays} color="#16A34A" bg="#F0FDF4" />}
                      {row.halfDays > 0 && <Chip label={`Half Day (−${fmt(row.halfDayDeductAmt, currency)})`} count={row.halfDays} color="#CA8A04" bg="#FEFCE8" />}
                      {row.paidLeaves > 0 && <Chip label={`Paid Leave${row.paidLeaveDeductAmt > 0 ? ` (−${fmt(row.paidLeaveDeductAmt, currency)})` : ' (paid)'}`} count={row.paidLeaves} color="#2563EB" bg="#EFF6FF" />}
                      {row.sickLeaves > 0 && <Chip label={`Sick Leave${row.sickLeaveDeductAmt > 0 ? ` (−${fmt(row.sickLeaveDeductAmt, currency)})` : ' (paid)'}`} count={row.sickLeaves} color="#7C3AED" bg="#F5F3FF" />}
                      {row.unpaidLeaves > 0 && <Chip label={`Unpaid Leave (−${fmt(row.unpaidLeaveDeductAmt, currency)})`} count={row.unpaidLeaves} color="#DC2626" bg="#FEF2F2" />}
                      {row.otherAbs > 0 && <Chip label={`Other Absence (−${fmt(row.otherAbsDeductAmt, currency)})`} count={row.otherAbs} color="#EA580C" bg="#FFF7ED" />}
                      {row.holidayCount > 0 && <Chip label="Holidays" count={row.holidayCount} color="#6B7280" bg="var(--app-subtle-bg)" />}
                    </div>
                    <div style={{ padding: '8px 12px', background: 'var(--app-card)', borderRadius: 8, border: '1px solid var(--app-border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                        <div style={{ fontSize: 12 }}>
                          <span style={{ color: 'var(--app-text-muted)' }}>Monthly Salary: </span>
                          <strong style={{ color: 'var(--app-text-primary)' }}>{fmt(row.emp.salary, currency)}</strong>
                        </div>
                        <div style={{ fontSize: 12 }}>
                          <span style={{ color: 'var(--app-text-muted)' }}>Daily Rate: </span>
                          <strong style={{ color: 'var(--app-text-primary)', fontFamily: 'monospace' }}>{fmt(row.dailyRate, currency)}</strong>
                          <span style={{ color: 'var(--app-text-muted)', fontSize: 11 }}> (÷ 30)</span>
                        </div>
                        {row.isJoiningMonth && (
                          <div style={{ fontSize: 12 }}>
                            <span style={{ color: 'var(--app-text-muted)' }}>Joining Date: </span>
                            <strong style={{ color: '#7C3AED' }}>{row.emp.joiningDate}</strong>
                            <span style={{ color: 'var(--app-text-muted)', fontSize: 11 }}> · {row.eligibleDays} eligible days</span>
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--app-text-secondary)', borderTop: '1px solid var(--app-border-subtle)', paddingTop: 6 }}>
                        {row.isJoiningMonth
                          ? `Payable = ${row.eligibleDays} days × ${fmt(row.dailyRate, currency)} = ${fmt(row.grossSalary, currency)}`
                          : `Payable Salary = ${fmt(row.emp.salary, currency)}`}
                        {row.totalDeductions > 0 && (
                          <span> → {fmt(row.grossSalary, currency)} − {fmt(row.totalDeductions, currency)} = <strong style={{ color: '#16A34A' }}>{fmt(row.finalSalary, currency)}</strong></span>
                        )}
                        {row.totalDeductions === 0 && (
                          <span style={{ color: '#16A34A' }}> → <strong>No deductions · full salary payable</strong></span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Footer total row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 110px 110px 120px 44px', padding: '12px 20px', borderTop: '1px solid var(--app-border)', background: 'var(--app-table-header-bg)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-secondary)' }}>Total ({rows.length} employees)</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-secondary)' }}>{fmt(totalMonthlySalary, currency)}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: totalPayable < totalMonthlySalary ? '#7C3AED' : 'var(--app-text-secondary)' }}>{fmt(totalPayable, currency)}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: totalDeduct > 0 ? '#DC2626' : 'var(--app-text-muted)' }}>
              {totalDeduct > 0 ? `−${fmt(totalDeduct, currency)}` : '—'}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--app-text-primary)' }}>{fmt(totalNet, currency)}</div>
            <div />
          </div>
        </div>

        <p style={{ fontSize: 11, color: 'var(--app-text-faint)', textAlign: 'center', marginTop: 10 }}>
          Absence-based payroll · Daily Rate = Monthly Salary ÷ 30 · Salary is fully earned unless an absence record exists · Click any row to expand
        </p>
        </>
      )}
    </div>
  );
}
