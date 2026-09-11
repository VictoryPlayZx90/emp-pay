import type { Employee, AttendanceRecord, Holiday, Settings } from '../App';

// ─── Timezone-safe date string helper ─────────────────────────────────────────
export function makeDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ─── Working-days helpers (used by SettingsScreen preview only) ───────────────
export function getWorkingDays(year: number, month: number): number {
  const dim = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let d = 1; d <= dim; d++) {
    if (new Date(year, month, d).getDay() !== 0) count++;
  }
  return count;
}

export function getSundayCount(year: number, month: number): number {
  const dim = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let d = 1; d <= dim; d++) {
    if (new Date(year, month, d).getDay() === 0) count++;
  }
  return count;
}

// ─── Payroll result ────────────────────────────────────────────────────────────
//
// New absence-based model:
//   • Every month is treated as exactly 30 days.
//   • Daily rate = monthly salary ÷ 30 (constant).
//   • Gross salary = full monthly salary, or prorated from joining date.
//   • Only absence records create deductions — present records have no effect.
//   • Not-marked days do NOT create deductions (salary is assumed fully earned).
//   • Sundays and holidays are not special-cased; payroll reacts only to records.
//
export interface CalcResult {
  // ── Core financials ──
  grossSalary: number;       // full salary or prorated (joining month)
  dailyRate: number;         // salary ÷ 30
  totalDeductions: number;   // sum of all absence deductions
  finalSalary: number;       // grossSalary − totalDeductions

  // ── Per-type deduction day counts ──
  halfDays: number;          // present → half-day
  paidLeaves: number;
  sickLeaves: number;
  unpaidLeaves: number;
  otherAbs: number;

  // ── Per-type deduction amounts ──
  halfDayDeductAmt: number;
  paidLeaveDeductAmt: number;
  sickLeaveDeductAmt: number;
  unpaidLeaveDeductAmt: number;
  otherAbsDeductAmt: number;

  // ── Informational (not used in calculation) ──
  presentDays: number;       // full present days (no deduction)
  holidayCount: number;
  sundayCount: number;
  isJoiningMonth: boolean;
  eligibleDays: number;      // 30 for full month, N for joining month
}

// ─── Main payroll calculator ───────────────────────────────────────────────────
export function calcPayroll(
  employee: Employee,
  year: number,
  month: number,
  attendance: Record<string, AttendanceRecord>,
  holidays: Holiday[],
  settings: Settings,
): CalcResult {
  const dailyRate = employee.salary / 30;

  // ── Joining-date proration ────────────────────────────────────────────────
  // If the employee joined this month, gross salary is prorated from joining day
  // to the end of the 30-day month.  Example: joining on the 19th → 12 eligible
  // days (30 − 19 + 1 = 12) → prorated gross = 12 × daily rate.
  const [jy, jm, jd] = employee.joiningDate.split('-').map(Number);
  const isJoiningMonth = jy === year && jm - 1 === month;
  const eligibleDays = isJoiningMonth ? Math.max(0, 30 - jd + 1) : 30;
  const grossSalary = Math.round(eligibleDays * dailyRate);

  // ── Iterate only actual attendance records for this month ─────────────────
  const pfx = `${employee.id}_${year}-${String(month + 1).padStart(2, '0')}-`;
  let presentDays = 0, halfDays = 0, paidLeaves = 0, sickLeaves = 0;
  let unpaidLeaves = 0, otherAbs = 0;

  for (const key of Object.keys(attendance)) {
    if (!key.startsWith(pfx)) continue;

    // Skip days before joining date when in joining month
    if (isJoiningMonth) {
      const dayNum = parseInt(key.slice(pfx.length), 10);
      if (dayNum < jd) continue;
    }

    const rec = attendance[key];
    if (!rec?.mainStatus) continue;

    if (rec.mainStatus === 'present') {
      if (rec.subStatus === 'half-day') halfDays++;
      else presentDays++;
    } else if (rec.mainStatus === 'absent') {
      if (rec.subStatus === 'paid-leave')    paidLeaves++;
      else if (rec.subStatus === 'sick-leave')   sickLeaves++;
      else if (rec.subStatus === 'unpaid-leave') unpaidLeaves++;
      else                                        otherAbs++;
    }
  }

  // ── Deduction amounts ─────────────────────────────────────────────────────
  const halfDayValue = settings.halfDayValue ?? 0.5;
  const otherAbsDeductFrac =
    (settings.otherAbsenceHandling ?? 'unpaid') === 'full'    ? 0 :
    (settings.otherAbsenceHandling ?? 'unpaid') === 'half'    ? 0.5 :
    (settings.otherAbsenceHandling ?? 'unpaid') === 'quarter' ? 0.75 : 1;

  const halfDayDeductAmt    = halfDays    * (1 - halfDayValue) * dailyRate;
  const paidLeaveDeductAmt  = paidLeaves  * (settings.paidLeaveFullPay ? 0 : 1) * dailyRate;
  const sickLeaveDeductAmt  = sickLeaves  * (settings.sickLeaveFullPay ? 0 : 1) * dailyRate;
  const unpaidLeaveDeductAmt = unpaidLeaves * dailyRate;
  const otherAbsDeductAmt   = otherAbs    * otherAbsDeductFrac * dailyRate;

  const totalDeductions = Math.round(
    halfDayDeductAmt + paidLeaveDeductAmt + sickLeaveDeductAmt +
    unpaidLeaveDeductAmt + otherAbsDeductAmt
  );
  const finalSalary = Math.max(0, grossSalary - totalDeductions);

  // ── Informational counts (no payroll effect) ──────────────────────────────
  const dim = new Date(year, month + 1, 0).getDate();
  let sundayCount = 0, holidayCount = 0;
  const holidaySet = new Set(holidays.map(h => h.date));
  for (let d = 1; d <= dim; d++) {
    const ds = makeDateStr(year, month, d);
    if (new Date(year, month, d).getDay() === 0) sundayCount++;
    else if (holidaySet.has(ds)) holidayCount++;
  }

  return {
    grossSalary,
    dailyRate: Math.round(dailyRate * 100) / 100,
    totalDeductions,
    finalSalary,
    halfDays,
    paidLeaves,
    sickLeaves,
    unpaidLeaves,
    otherAbs,
    halfDayDeductAmt:     Math.round(halfDayDeductAmt),
    paidLeaveDeductAmt:   Math.round(paidLeaveDeductAmt),
    sickLeaveDeductAmt:   Math.round(sickLeaveDeductAmt),
    unpaidLeaveDeductAmt: Math.round(unpaidLeaveDeductAmt),
    otherAbsDeductAmt:    Math.round(otherAbsDeductAmt),
    presentDays,
    holidayCount,
    sundayCount,
    isJoiningMonth,
    eligibleDays,
  };
}

// ─── Attendance summary over a date range ─────────────────────────────────────
// (Used by the Attendance tab in EmployeeProfileScreen — unchanged.)
export interface AttendanceSummary {
  presentDays: number;
  halfDays: number;
  paidLeaves: number;
  sickLeaves: number;
  unpaidLeaves: number;
  otherAbsences: number;
  holidayDays: number;
  notMarkedDays: number;
  markedDays: number;
  sundayOffDays: number;
  totalWorkingDays: number;
  attendancePercentage: number;
}

export function calculateAttendanceSummary(
  employeeId: string,
  from: string,
  to: string,
  attendance: Record<string, AttendanceRecord>,
  holidays: Holiday[],
  settings: Settings,
): AttendanceSummary {
  const holidaySet = new Set(holidays.map(h => h.date));
  let presentDays = 0, halfDays = 0, paidLeaves = 0, sickLeaves = 0;
  let unpaidLeaves = 0, otherAbsences = 0, holidayDays = 0;
  let markedDays = 0, sundayOffDays = 0, totalWorkingDays = 0;

  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  const cur = new Date(fy, fm - 1, fd);
  const end = new Date(ty, tm - 1, td);

  while (cur <= end) {
    const y = cur.getFullYear(), mo = cur.getMonth(), d = cur.getDate();
    const ds = makeDateStr(y, mo, d);
    const dow = cur.getDay();

    if (dow === 0) { sundayOffDays++; cur.setDate(d + 1); continue; }
    totalWorkingDays++;
    if (holidaySet.has(ds)) { holidayDays++; cur.setDate(d + 1); continue; }

    const rec = attendance[`${employeeId}_${ds}`];
    if (rec?.mainStatus) {
      markedDays++;
      if (rec.mainStatus === 'present') {
        if (rec.subStatus === 'half-day') halfDays++;
        else presentDays++;
      } else {
        if (rec.subStatus === 'paid-leave')    paidLeaves++;
        else if (rec.subStatus === 'sick-leave')   sickLeaves++;
        else if (rec.subStatus === 'unpaid-leave') unpaidLeaves++;
        else                                        otherAbsences++;
      }
    }
    cur.setDate(d + 1);
  }

  const notMarkedDays = totalWorkingDays - holidayDays - markedDays;
  const markable = totalWorkingDays - holidayDays;
  const attendancePercentage = markable > 0
    ? Math.round(((presentDays + halfDays * 0.5 + paidLeaves + sickLeaves) / markable) * 100)
    : 0;

  return {
    presentDays, halfDays, paidLeaves, sickLeaves, unpaidLeaves, otherAbsences,
    holidayDays, notMarkedDays, markedDays, sundayOffDays, totalWorkingDays, attendancePercentage,
  };
}
