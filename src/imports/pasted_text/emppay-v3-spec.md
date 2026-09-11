# EMPPAY V3 — COMPLETE REBUILD MASTER SPECIFICATION

## OBJECTIVE

Rebuild EmpPay as a modern, production-ready payroll, attendance, and employee management SaaS.

This is NOT a UI refresh.

This is a complete architecture, UX, payroll, document-storage, PDF, and responsiveness overhaul.

The final product must feel like a commercial SaaS platform comparable to:

* Deel
* Rippling
* BambooHR
* Zoho People
* Razorpay Payroll
* Keka

The application must work flawlessly on:

* Desktop
* Laptop
* Tablet
* Android
* iPhone

No broken layouts.

No overflowing dialogs.

No disappearing data.

No PDF issues.

No sync issues.

No visual glitches.

---

# CORE BUSINESS PHILOSOPHY

Attendance is a record system.

Payroll is a deduction system.

These are separate concepts.

Attendance records must be stored.

Payroll must only use absences for deductions.

Present days do NOT create salary.

Salary starts at full value.

Only deductions reduce salary.

---

# NEW PAYROLL ARCHITECTURE

REMOVE ENTIRE OLD PAYROLL SYSTEM.

Delete all logic related to:

* Working Days
* Payable Days
* Present Count
* Attendance Percentage
* Marked Days
* Pending Days
* Sunday Payroll Logic
* Month-Length Payroll Logic

---

# FIXED 30 DAY PAYROLL MODEL

Every month must be treated as:

30 payroll days

Always.

Do not use:

28

29

30

31

for payroll calculations.

Formula:

Daily Rate = Monthly Salary ÷ 30

Example:

Salary = ₹30,000

Daily Rate = ₹1,000

---

# PAYROLL FORMULA

Final Salary = Gross Salary - Total Deductions

Salary always starts at 100%.

Only deductions reduce salary.

---

# ABSENCE RULES

Present

No deduction.

Paid Leave

Deduction = ₹0 when configured as paid.

Sick Leave

Deduction based on settings.

Half Day

Deduction based on settings.

Other Leave

Deduction based on settings.

Unpaid Leave

Full deduction.

---

# HALF DAY SETTINGS

Allow:

25%

50%

75%

100%

Example:

Daily Rate = ₹1,000

50% Half Day

Deduction = ₹500

---

# OTHER ABSENCE SETTINGS

Options:

Full Pay

Half Pay

Quarter Pay

Unpaid

Rules:

Full Pay = ₹0 deduction

Half Pay = Daily Rate × 0.5

Quarter Pay = Daily Rate × 0.25

Unpaid = Daily Rate × 1

---

# REMOVE SUNDAY LOGIC

Do not auto-mark Sundays.

Do not auto-pay Sundays.

Do not auto-deduct Sundays.

Payroll should only react to actual attendance records.

---

# JOINING DATE LOGIC

Respect joining date.

Example:

Salary = ₹30,000

Joining Date = 15 June

Daily Rate = ₹1,000

Eligible Days = 16

Prorated Salary = ₹16,000

Then apply deductions.

---

# SETTINGS PAGE REBUILD

REMOVE:

Working Days section

Working Day cards

Sunday count

Month length calculations

Holiday Payable toggle

Attendance-based payroll explanations

---

# ADD PAYROLL RULES CARD

Show:

Every month = 30 payroll days

Daily Rate = Salary ÷ 30

Only absences create deductions

Present records do not affect salary

---

# LIVE CALCULATION CARD

Example:

Salary ₹30,000

Daily Rate ₹1,000

Absent (2) ₹2,000

Half Day (1) ₹500

Final Salary ₹27,500

Updates live when settings change.

---

# EMPLOYEE SCREEN REBUILD

Employee page is the source of truth.

Show:

Avatar

Name

Department

Designation

Monthly Salary

Joining Date

Status

Documents

Notes

Payroll Summary

Attendance Summary

---

# EMPLOYEE PROFILE

Tabs:

Overview

Attendance

Payroll

Documents

Notes

Timeline

Load tab content lazily.

Avoid long scrolling pages.

---

# EMPLOYEE STATISTICS

REMOVE:

Attendance %

Present %

Payable %

Replace with:

Present Records

Absence Records

Current Month Salary

Current Month Deductions

---

# PAYROLL SCREEN REBUILD

Top Cards:

Employees

Monthly Salary Commitment

Current Month Payable

Total Deductions

---

# PAYROLL TABLE

Columns:

Employee

Monthly Salary

Payable Salary

Deductions

Final Salary

Status

Actions

---

# REMOVE "GROSS SALARY" CONFUSION

Do not display prorated salary as gross salary.

Employee salary remains:

₹30,000

Payable salary may be:

₹16,000

Show them separately.

---

# REMOVE "JOINING MONTH (16/30 DAYS)" LABEL

Replace with:

New Joiner

or

First Payroll Cycle

Show actual calculations only inside expanded details.

---

# EXPANDABLE PAYROLL BREAKDOWN

Show:

Monthly Salary

Daily Rate

Joining Date

Eligible Days

Prorated Salary

Absent Days

Half Days

Paid Leaves

Sick Leaves

Other Leaves

Total Deductions

Final Salary

---

# ATTENDANCE MODULE

Attendance remains a record system.

Attendance types:

Present

Half Day

Paid Leave

Sick Leave

Unpaid Leave

Other

Not Marked

---

# ATTENDANCE UX

Add:

Mark All Present

Mark Holiday

Reset Day

Search

Filters

Bulk Actions

Fast Month Navigation

Touch Friendly Calendar

---

# DOCUMENT STORAGE REBUILD

CRITICAL PRIORITY

Documents must never disappear.

Supported:

Aadhaar

PAN

Passport

Driving License

Company ID

Other

---

# FIREBASE STORAGE FIX

Investigate and fix:

Documents disappearing after upload

Documents disappearing after sync

Documents disappearing after refresh

Documents disappearing after logout/login

Documents disappearing across devices

Documents disappearing after employee edit

---

# REQUIRED STORAGE FLOW

Upload

↓

Firebase Storage Upload

↓

Verify Upload Success

↓

Save Metadata

↓

Save Employee Reference

↓

Firestore Save

↓

Cloud Sync

↓

Success

Never mark upload successful before cloud confirmation.

---

# EMPLOYEE UPDATE RULE

Never replace employee objects.

Always merge.

Preserve:

Documents

Profile Photos

History

Attendance

Payroll

Notes

---

# DOCUMENT UI

Document Cards

Each card shows:

Document Type

Upload Date

File Size

Sync Status

View

Download

Delete

---

# UPLOAD STATUS

Show:

Uploading

Uploaded

Syncing

Synced

Failed

Retry

Never fail silently.

---

# CLOUD SYNC

Fix:

Realtime Sync

Autosave

Profile Switching

Cloud Refresh

Multi-device Sync

Race Conditions

Stale State Overwrites

Partial Updates

---

# RESPONSIVE REBUILD

Must work perfectly on:

320px

375px

390px

412px

768px

1024px

1440px

No overflow.

No clipping.

No horizontal scrolling.

---

# EMPLOYEE EDIT DIALOG FIX

Current dialog goes out of bounds.

Replace with:

Desktop:

Centered Modal

Scrollable Content

Sticky Header

Sticky Footer

Mobile:

Full Screen Sheet

Native App Feel

No Overflow

---

# REDUCE SCROLLING

Most actions should take:

1–2 clicks

Common actions:

Add Employee

Upload Document

Mark Attendance

Run Payroll

Generate Payslip

Edit Employee

---

# DARK MODE

Use premium SaaS styling.

Reference palette:

Deep charcoal surfaces

Muted borders

Soft shadows

Rounded corners

High contrast typography

Accent colors:

Purple

Orange

Blue

Success = Green

Warning = Orange

Error = Red

Avoid neon colors.

---

# LIGHT MODE

Do not simply invert colors.

Create dedicated light theme.

Professional.

Clean.

Premium.

---

# PDF & LETTERHEAD REBUILD

Create one unified PDF rendering engine.

Used by:

Payslip PDF

Attendance PDF

Payroll PDF

Employee Reports

Future Reports

---

# LETTERHEAD RULES

Letterhead is a separate layer.

Structure:

Letterhead

↓

Safe Spacing

↓

Document Content

Never allow content to overlap letterhead.

---

# LETTERHEAD IMAGE RULES

Preserve aspect ratio.

Never stretch.

Never distort.

Use contain mode.

Scale proportionally.

---

# ATTENDANCE PDF FIX

Attendance PDF currently stretches letterhead.

Make Attendance PDF use the exact same rendering engine as Payroll PDF.

Both outputs must look identical.

---

# PDF TEXT COLLISION FIX

Prevent:

Month/Year overlap

Header overlap

Content overlap

Footer overlap

Metadata collisions

Maintain consistent spacing.

---

# LETTERHEAD PREVIEW

Settings preview must match exported PDF exactly.

No preview/export differences.

---

# EXPORT TESTING

Verify with:

No letterhead

Wide letterhead

Tall letterhead

High-resolution letterhead

Large logo

Small logo

All PDFs must render correctly.

---

# GLOBAL UX RULES

Every screen must have:

Loading States

Skeleton Loaders

Empty States

Error States

Retry Actions

Success Feedback

Confirmation Dialogs

Undo where appropriate

---

# PERFORMANCE

Realtime Firebase Sync

Optimistic Updates

Background Sync

Offline Support

Fast Rendering

Minimal Re-renders

Smooth Animations

No UI Jank

---

# FINAL GOAL

EmpPay should feel like a polished commercial payroll SaaS product.

Reliable.

Modern.

Responsive.

Fast.

Beautiful.

No data loss.

No sync issues.

No PDF issues.

No document disappearance.

No layout problems.

Attendance remains a record system.

Payroll becomes a deduction system.

Documents remain permanently synced across all devices and sessions.
