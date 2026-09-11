# EMPPAY V3 - ADDITIONAL CHANGES (ADD TO EXISTING MASTER PROMPT)

These changes are in addition to the previous master prompt and must override any conflicting UI or PDF designs.

====================================================
CHANGE #36 - COMPLETE PAYSLIP REDESIGN
======================================

The current payslip still feels like an exported webpage.

Redesign it as a professional HR/payroll document suitable for:

* Bank verification
* Salary proof
* Employment records
* Loan applications
* Visa applications

The payslip should feel like an official company document.

Use:

* Strong visual hierarchy
* Better spacing
* Professional typography
* Consistent sections
* Modern PDF layout

====================================================
CHANGE #37 - REMOVE DEBUG INFORMATION
=====================================

Never show:

gross = x days × rate

final = gross - deduction

or any developer/debug calculations.

These calculations are for internal logic only.

Do not show them in PDF exports.

====================================================
CHANGE #38 - REMOVE OLD PAYROLL CONCEPTS FROM PAYSLIP
=====================================================

Remove:

Present Days

Attendance %

Sundays

Holiday Count

Working Days

Payable Days

Pending Days

Any attendance metrics that do not affect salary.

====================================================
CHANGE #39 - PROFESSIONAL PAYSLIP STRUCTURE
===========================================

New structure:

LETTERHEAD

↓

PAYSLIP HEADER

↓

EMPLOYEE INFORMATION

↓

SALARY SUMMARY

↓

DEDUCTION BREAKDOWN

↓

ATTENDANCE SUMMARY

↓

FOOTER

Every section should have proper spacing.

No collisions.

No cramped layout.

====================================================
CHANGE #40 - BETTER SALARY SUMMARY
==================================

Instead of exposing technical calculations everywhere:

Show:

Monthly Salary

Payable Salary

Total Deductions

Final Salary

Clean and easy to understand.

Example:

Monthly Salary
₹35,000

Payable Salary
₹7,000

Total Deductions
₹583

Final Salary
₹6,417

====================================================
CHANGE #41 - ATTENDANCE SUMMARY SHOULD BE SIMPLIFIED
====================================================

Only show records that matter.

Example:

Half Days

Unpaid Leaves

Other Absences

Do not fill the PDF with unnecessary attendance statistics.

Keep it concise.

====================================================
CHANGE #42 - CUSTOM LETTERHEAD MUST NEVER BREAK PDF LAYOUT
==========================================================

Current issue:

Without custom letterhead:

PDF looks correct.

After uploading custom letterhead:

Text overlaps.

Dates collide.

Header becomes broken.

This must be fixed permanently.

====================================================
CHANGE #43 - LETTERHEAD AND CONTENT MUST BE SEPARATE LAYERS
===========================================================

Treat:

Custom Letterhead

and

Payslip Content

as completely separate systems.

The uploaded letterhead should never directly affect the content layout.

====================================================
CHANGE #44 - SAFE CONTENT ZONE
==============================

After rendering the letterhead:

Automatically create:

Letterhead Height

*

Safe Padding

*

Content Start Position

The content must start below this area.

Nothing may render inside the reserved header space.

====================================================
CHANGE #45 - DYNAMIC LETTERHEAD HEIGHT DETECTION
================================================

Different companies will upload:

Tall letterheads

Wide letterheads

Large logos

Small logos

The PDF engine must detect actual rendered height automatically.

Never rely on hardcoded coordinates.

====================================================
CHANGE #46 - NO ABSOLUTE POSITIONING FOR PDF CONTENT
====================================================

Do not render content using fixed Y coordinates.

Instead:

Render Section

↓

Move Cursor Down

↓

Render Next Section

↓

Move Cursor Down

↓

Render Next Section

PDF content should flow naturally.

====================================================
CHANGE #47 - CUSTOM LETTERHEAD MUST NOT CHANGE CONTENT WIDTH
============================================================

Uploaded letterhead must never:

Change margins

Change content width

Move salary table

Move employee details

Move attendance section

Only the header region should change.

The rest of the PDF should remain identical.

====================================================
CHANGE #48 - PAYSLIP MUST LOOK IDENTICAL WITH OR WITHOUT LETTERHEAD
===================================================================

Employee Information

Salary Summary

Deductions

Attendance Summary

Footer

must stay in the same positions regardless of whether a custom letterhead exists.

====================================================
CHANGE #49 - REMOVE DUPLICATE BRANDING
======================================

If custom letterhead already contains:

Logo

Company Name

Address

Phone

Email

Website

then do NOT generate those elements again.

Use either:

Custom Letterhead

OR

Generated Branding

Never both.

====================================================
CHANGE #50 - ATTENDANCE PDF MUST USE SAME LETTERHEAD ENGINE
===========================================================

Current issue:

Attendance PDF stretches letterhead.

Payroll PDF looks better.

Fix:

Create one shared PDF layout engine.

Attendance PDF

Payslip PDF

Payroll PDF

Employee Report PDF

must all use the exact same renderer.

====================================================
CHANGE #51 - LETTERHEAD PREVIEW MUST MATCH EXPORT
=================================================

The preview shown inside Settings must use the same rendering logic as the actual exported PDF.

If it looks correct in preview, it must export identically.

====================================================
CHANGE #52 - PDF STRESS TESTING
===============================

Verify with:

No letterhead

Tall letterhead

Wide letterhead

High-resolution letterhead

Large logo

Small logo

All PDF exports must remain professional.

No overlap.

No clipping.

No stretching.

====================================================
CHANGE #53 - PROFESSIONAL PDF FOOTER
====================================

Add footer:

This document was generated electronically.

No signature required.

Generated by EmpPay.

Keep it subtle and professional.

====================================================
CHANGE #54 - DARK THEME UPDATE
==============================

Use:

#111111

as the global application background.

Replace existing dark navy/blue backgrounds.

Use layered surfaces:

#171717

#1E1E1E

#242424

to create depth.

The app should feel closer to:

Linear

Vercel

Notion Dark

Stripe Dashboard

Raycast

====================================================
CHANGE #55 - CONSISTENT SURFACE HIERARCHY
=========================================

Level 0

#111111

Application Background

Level 1

#171717

Cards

Level 2

#1E1E1E

Modals

Level 3

#242424

Highlighted Sections

Use a consistent design system everywhere.

No random shades.

No mixed blue and gray themes.

====================================================
FINAL REQUIREMENT
=================

Custom letterheads must never break PDFs.

Payslips must look like professional HR documents.

Attendance PDF and Payslip PDF must render identically.

The user should be able to upload any valid company letterhead without causing overlaps, clipping, stretching, or layout corruption.
