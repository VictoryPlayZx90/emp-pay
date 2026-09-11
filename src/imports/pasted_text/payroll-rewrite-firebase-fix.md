EMP PAY - MAJOR PAYROLL REWRITE + FIREBASE DOCUMENT STORAGE FIX

IMPORTANT:

This is a major architecture update.

Do NOT try to patch the old payroll system.

Remove the old payroll calculation architecture and replace it completely with the new absence-based payroll system described below.

Also investigate and permanently fix the employee document upload persistence issue.

====================================================
PART 1 - COMPLETE PAYROLL SYSTEM REWRITE
========================================

REMOVE OLD PAYROLL LOGIC

The existing payroll system currently depends on:

* Working Days
* Payable Days
* Present Days
* Marked Days
* Pending Days
* Attendance Percentage
* Month Length (28/29/30/31)

These concepts must be completely removed from payroll calculations.

Attendance records should remain stored for historical purposes only.

====================================================
NEW PAYROLL PRINCIPLE
=====================

Salary is assumed to be fully earned by default.

Payroll starts with Gross Salary.

Only deductions reduce salary.

Formula:

Final Salary = Gross Salary - Total Deductions

====================================================
FIXED 30-DAY MONTH
==================

Every month must be treated as exactly 30 days.

Never use actual month length.

Examples:

February = 30
April = 30
June = 30
December = 30

Daily Rate Formula:

Daily Rate = Monthly Salary / 30

Example:

Salary = ₹30,000

Daily Rate = ₹1,000

====================================================
PRESENCE NO LONGER AFFECTS PAYROLL
==================================

Present records exist only for attendance history.

Present records must never affect salary.

Do not count:

* Present Days
* Full Present Days
* Attendance Percentage

Payroll calculations must ignore presence completely.

====================================================
ABSENCE-BASED DEDUCTIONS
========================

Only absence records affect payroll.

FULL ABSENT

Deduction:

1 × Daily Rate

Example:

Daily Rate = ₹1,000

1 Absent Day

Deduction = ₹1,000

====================================================
HALF DAY
========

Continue using existing setting:

Half Day Value

Possible values:

25%
50%
75%
100%

Deduction:

Daily Rate × Configured Percentage

Examples:

₹1,000 Daily Rate

25% = ₹250
50% = ₹500
75% = ₹750
100% = ₹1,000

====================================================
PAID LEAVE
==========

If Paid Leave is configured as paid:

Deduction = ₹0

If configured as unpaid:

Deduction = Daily Rate

====================================================
SICK LEAVE
==========

If Sick Leave is configured as paid:

Deduction = ₹0

If configured as unpaid:

Deduction = Daily Rate

====================================================
OTHER ABSENCE
=============

Continue using existing setting:

Other Absence Handling

Options:

* Full Pay
* Half Pay
* Quarter Pay
* Unpaid

Deduction Rules:

Full Pay
Deduction = ₹0

Half Pay
Deduction = Daily Rate × 0.5

Quarter Pay
Deduction = Daily Rate × 0.25

Unpaid
Deduction = Daily Rate × 1

====================================================
SUNDAYS
=======

Do not special-case Sundays.

Do not auto mark Sundays.

Do not auto pay Sundays.

Do not auto deduct Sundays.

Payroll only reacts to actual attendance records.

Salary already starts at 100%.

Only deductions reduce salary.

====================================================
JOINING DATE LOGIC
==================

Joining Date MUST still be respected.

Example:

Salary = ₹30,000

Joining Date = 19 June

Daily Rate = ₹1,000

Employee only exists from:

19 June → End Of Month

Eligible Days = 12

Prorated Gross Salary = ₹12,000

After calculating prorated gross salary:

Apply all absence deductions.

Formula:

## Prorated Gross Salary

# Deductions

Final Salary

====================================================
REMOVE THESE UI ELEMENTS
========================

Delete:

* Work Days
* Payable Days
* Marked Days
* Pending Days
* Attendance %
* Present Days
* Any attendance-based payroll calculations

====================================================
NEW PAYROLL SCREEN
==================

Each employee card should show:

Employee Name

Gross Salary

Daily Rate

Total Deductions

Final Salary

Example:

Rahul Sharma

Gross Salary      ₹30,000

Daily Rate        ₹1,000

Deductions        ₹2,500

Final Salary      ₹27,500

====================================================
PAYSLIP REDESIGN
================

REMOVE:

* Present Days
* Payable Days
* Attendance %
* Work Days
* Pending Days

ADD:

Gross Salary

Daily Rate

Deduction Breakdown

Final Salary

Example:

Gross Salary      ₹30,000

Daily Rate        ₹1,000

Deductions

Absent Days (2)      ₹2,000
Half Days (1)        ₹500

Total Deduction      ₹2,500

Final Salary         ₹27,500

====================================================
ATTENDANCE MODULE
=================

Do NOT modify attendance storage.

Keep:

* Attendance history
* Calendar views
* Employee attendance records
* Reports

Only modify how payroll reads attendance.

====================================================
PART 2 - EMPLOYEE DOCUMENT UPLOAD FIX
=====================================

There is a serious bug involving employee document uploads.

Observed issue:

* User uploads employee documents.
* Upload appears successful.
* After sync, refresh, device change, or reopening app, documents disappear.
* Employee profile remains but uploaded documents are missing.

This must be investigated and fixed.

====================================================
LIKELY ROOT CAUSES TO CHECK
===========================

Inspect:

Employee interface

EmployeeDocument interface

Firestore save logic

Firestore load logic

Realtime sync logic

Cloud refresh logic

Profile switching logic

Autosave logic

Employee update logic

Employee profile screen

Document upload screen

====================================================
VERIFY DOCUMENTS ARE INCLUDED IN:
=================================

Employee object

Local state

Autosave payload

Cloud payload

Firestore write

Firestore read

Realtime subscription

Profile switching restore

Manual cloud refresh restore

Employee updates

====================================================
VERIFY FIRESTORE PAYLOADS
=========================

Documents must be preserved in every save.

Check for:

undefined values

empty arrays

partial employee updates

employee replacement logic

state overwrite bugs

migration bugs

stale state writes

race conditions

====================================================
SPECIAL ATTENTION
=================

Current code contains:

employees.map(...)

employee update handlers

Firestore autosave

Cloud snapshot restore

Realtime listeners

Profile restore logic

These are likely places where uploaded documents are being dropped.

Verify that:

documents

fileData

fileType

uploadedAt

document type

remain intact after every save/load cycle.

====================================================
TEST CASES
==========

Test 1

Upload Aadhaar

Refresh page

Document should remain

Test 2

Upload Aadhaar

Logout

Login

Document should remain

Test 3

Upload Aadhaar

Open app on second device

Document should sync

Test 4

Upload Aadhaar

Edit employee details

Document should remain

Test 5

Upload multiple documents

All documents should remain

Test 6

Manual Cloud Refresh

Documents should not disappear

====================================================
FINAL REQUIREMENT
=================

Payroll must be fully converted to:

## Gross Salary

# Absence Deductions

Final Salary

and

Employee documents must persist permanently across:

* Refresh
* Logout/Login
* Cloud Sync
* Multiple Devices
* Realtime Updates
* Manual Refresh

No document should ever disappear unless explicitly deleted by the user.
