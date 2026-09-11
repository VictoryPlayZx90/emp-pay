# Plan: Remove App-Generated Branding from Settings

## Context
The user wants to simplify the Company Branding section in Settings. Currently there are two modes — "App Generated" (with logo, address, phone, email, website, GST fields) and "Custom Letterhead" (image/PDF upload). The user wants to remove the App Generated mode entirely and keep only the Custom Letterhead upload.

## File to Change
**`src/app/components/SettingsScreen.tsx`** — one file, three targeted cuts:

---

## Changes

### 1. Remove the Branding Mode selector (lines ~393–415)
Delete the entire `<Field label="Branding Mode" ...>` block containing the two buttons ("App Generated" / "Custom Letterhead").

### 2. Remove the App-Generated sub-fields (lines ~417–475)
Delete the `{(local.brandingMode ?? 'app-generated') === 'app-generated' && (...)}` conditional block which contains:
- Company Logo upload
- Company Address input
- Company Phone input
- Company Email input
- Website input
- GST Number input

### 3. Always show the Custom Letterhead upload (lines ~477–539)
The custom letterhead block is currently wrapped in `{local.brandingMode === 'custom' && (...)}`. Remove the conditional wrapper so the letterhead upload is always visible.

### 4. Update the Branding Preview (lines ~542–596)
The preview has two branches — one for custom letterhead and one for app-generated. Remove the app-generated branch. The preview should only show:
- The custom letterhead image if one is uploaded
- Or a neutral "No letterhead uploaded" placeholder if none

### 5. No changes needed elsewhere
- `Settings` type in `App.tsx` still has `brandingMode` and `companyLogo` etc — these can stay (they're just unused fields if never set). No migration needed.
- PDF generators (`PayrollScreen.tsx`, `EmployeeProfileScreen.tsx`) use `settings.brandingMode === 'custom'` to decide rendering — they will naturally fall back to the app-generated header when no custom letterhead is uploaded, which is fine. No changes needed there.

---

## Verification
1. Open Settings → Company Branding section should show only a letterhead upload area (no mode toggle, no logo/address/phone/email/website/GST fields).
2. Upload a custom letterhead image → preview updates, PDF exports use it.
3. Delete the letterhead → preview shows placeholder, PDF exports use the generated header.
4. No TypeScript errors (branding fields still exist on `Settings` type, just not editable via UI).
