EMP PAY – CHANGE REQUEST (DO NOT MODIFY UNRELATED FEATURES)

IMPORTANT:

This is an update to an existing production payroll application.

Do NOT redesign pages that are not mentioned below.
Do NOT change existing employee records.
Do NOT change attendance records already stored.
Do NOT reset payroll history.
Do NOT migrate, delete, overwrite, or recalculate historical attendance data automatically.
Do NOT modify Firebase structure unless absolutely necessary.
All existing employees, attendance entries, holidays, and payroll data must continue working after the update.

Only implement the changes listed below.

---

1. PAYROLL MODE SYSTEM

---

Introduce two payroll calculation modes:

A. Fixed-Deduction Mode (NEW DEFAULT)
B. Working-Days Mode (LEGACY / OPTIONAL)

Fixed-Deduction Mode must become the default mode for all new installations.

The old working-days calculation must remain available as an optional mode for compatibility.

Add a Payroll Calculation Mode selector in Settings.

Example UI:

Payroll Calculation Mode

● Fixed-Deduction Mode (Recommended)
○ Working-Days Mode (Legacy)

Changes only apply after pressing Save Changes.

---

2. FIXED-DEDUCTION MODE LOGIC

---

This becomes the default payroll system.

Monthly Salary is divided by a constant 30 days.

Example:

Salary = ₹40,000

Daily Rate = ₹40,000 ÷ 30
Daily Rate = ₹1,333.33

Payroll starts from full salary.

Deductions are then applied.

Formula:

Final Salary =
Monthly Salary
− Total Deductions

Do NOT build salary from payable days.

---

3. SUNDAY RULE

---

Sundays are always fully paid.

Sunday attendance may still be marked in the Attendance screen.

However:

Present on Sunday = No effect
Absent on Sunday = No effect
Half Day on Sunday = No effect
Unmarked on Sunday = No effect

Sunday must never create deductions.

Sunday must never reduce salary.

Sunday should always be treated as payable.

---

4. MONDAY TO SATURDAY RULES

---

For Monday to Saturday:

Present = Full Pay

Half Day = Configurable Pay Fraction

Absent = Deduct Full Daily Rate

Not Marked = Treat as Absent

Holiday = Full Pay

---

5. HALF DAY SETTINGS

---

Keep existing Half Day configuration.

Half Day should continue using selected pay fractions.

Examples:

Full Pay = 1.0
Half Pay = 0.5
Quarter Pay = 0.25

No logic changes required except compatibility with Fixed-Deduction Mode.

---

6. OTHER ABSENCE SETTINGS

---

Add configurable pay rules for "Other Absence".

Current system does not provide this.

Add:

Other Absence Pay

[ Full Pay ]
[ Half Pay ]
[ Quarter Pay ]
[ Unpaid ]

Examples:

Full Pay = 1.0
Half Pay = 0.5
Quarter Pay = 0.25
Unpaid = 0.0

Payroll calculations must use this selected value.

---

7. SICK LEAVE RULE

---

Keep existing Sick Leave toggle.

If enabled:

Sick Leave = Full Pay

If disabled:

Sick Leave = Unpaid

Must work in Fixed-Deduction Mode.

---

8. UNPAID LEAVE RULE

---

Unpaid Leave remains unchanged.

Always deduct salary.

Not configurable.

---

9. SETTINGS PAGE PREVIEW

---

Update Salary Formula Preview dynamically.

When Fixed-Deduction Mode is selected:

Show:

Monthly Salary = ₹40,000
Daily Rate = Salary ÷ 30

Final Salary =
Monthly Salary
− Deductions

Sunday = Always Paid
Not Marked = Absent
Holiday = Paid

When Working-Days Mode is selected:

Show current existing formula preview.

---

10. PAYROLL PAGE CHANGES

---

When Fixed-Deduction Mode is active:

Remove dependence on Working Days calculations.

Display:

Monthly Salary
Daily Rate
Total Deductions
Net Salary

Payroll calculations must use the new deduction model.

Existing payroll screen design should remain mostly unchanged.

Only update the calculation fields necessary.

---

11. REMOVE SYNC STATUS UI

---

Remove:

Offline
Syncing
Synced

Remove:

Sync indicators
Sync badges
Refresh sync button

Keep background autosave.

No replacement UI required.

---

12. LETTERHEAD IMPROVEMENTS

---

Current custom letterhead must not stretch.

Current custom letterhead must not overlap content.

Apply the exact same letterhead rendering behavior to:

Payslip PDF
Attendance Export PDF

Requirements:

Maintain aspect ratio
Auto-scale to page width
Maximum height limit
Never overlap text
Never push content off page
Always keep consistent margins

---

13. PROFESSIONAL PAYSLIP DESIGN

---

Improve payslip appearance without redesigning the entire app.

Structure:

Letterhead

PAYSLIP

Employee Information

Employee Name
Employee ID
Department
Joining Date
Pay Period

Salary Breakdown

Monthly Salary
Daily Rate
Payable Amount
Deductions
Net Salary

Attendance Summary

Present
Half Day
Paid Leave
Sick Leave
Other Absence
Unpaid Leave
Not Marked
Holidays
Sundays

Calculation Summary

Formula Used
Daily Rate
Deduction Breakdown

Generated Date

Company Signature Area

Maintain clean professional payroll formatting.

---

14. ATTENDANCE EXPORT IMPROVEMENTS

---

Use same PDF quality level as Payslip.

Structure:

Letterhead

ATTENDANCE REPORT

Employee Information

Attendance Summary

Detailed Attendance Table

Date
Day
Status

Generated Date

Footer

Generated by Emp Pay

---

15. BACKWARD COMPATIBILITY

---

CRITICAL:

Existing employees must remain intact.

Existing attendance entries must remain intact.

Existing payroll records must remain intact.

Existing holidays must remain intact.

No automatic conversion of historical records.

Users updating from previous versions must not lose any data.

Only new payroll calculations should use the newly selected payroll mode.

Historical attendance and employee records must remain untouched.
