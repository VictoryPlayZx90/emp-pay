import { useState, type ElementType, type ReactNode } from 'react';
import { Check, LogOut, Sun, Moon, Monitor, Lock, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '../hooks/useIsMobile';
import type { Settings, OtherAbsenceHandling, BrandingMode } from '../App';
import type { UserProfile } from './UserSelectScreen';
import { useTheme, type ThemePreference } from '../contexts/ThemeContext';

interface Props {
  settings: Settings;
  onUpdateSettings: (settings: Settings) => void;
  currentUser: UserProfile;
  onSwitchUser: () => void;
}

const CURRENCY_OPTIONS = [
  { value: 'INR', label: '₹ Indian Rupee (INR)' },
  { value: 'USD', label: '$ US Dollar (USD)' },
  { value: 'EUR', label: '€ Euro (EUR)' },
  { value: 'GBP', label: '£ British Pound (GBP)' },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative rounded-full transition-colors flex-shrink-0"
      style={{
        width: 44,
        height: 24,
        background: checked ? 'var(--app-btn-primary-bg)' : 'var(--app-border)',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <span
        className="absolute rounded-full transition-transform"
        style={{
          width: 18,
          height: 18,
          background: checked ? 'var(--app-btn-primary-fg)' : 'var(--app-card)',
          top: 3,
          left: checked ? 23 : 3,
        }}
      />
    </button>
  );
}

function Field({ label, hint, children, isMobile, toggleRow }: { label: string; hint?: string; children: ReactNode; isMobile?: boolean; toggleRow?: boolean }) {
  return (
    <div
      style={{
        padding: '16px 0',
        borderBottom: '1px solid var(--app-border-subtle)',
        display: 'flex',
        flexDirection: (isMobile && !toggleRow) ? 'column' : 'row',
        alignItems: (isMobile && !toggleRow) ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: (isMobile && !toggleRow) ? 8 : 0,
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--app-text-primary)' }}>{label}</div>
        {hint && <div style={{ fontSize: 12.5, color: 'var(--app-text-muted)', marginTop: 2 }}>{hint}</div>}
      </div>
      <div style={{ marginLeft: (isMobile && !toggleRow) ? 0 : 24, width: (isMobile && !toggleRow) ? '100%' : 'auto' }}>{children}</div>
    </div>
  );
}

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: ElementType }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];


export function SettingsScreen({ settings, onUpdateSettings, currentUser, onSwitchUser }: Props) {
  const isMobile = useIsMobile();
  const [local, setLocal] = useState<Settings>({ ...settings });
  const [saved, setSaved] = useState(false);
  const { theme, setTheme } = useTheme();

  const update = (patch: Partial<Settings>) => {
    setLocal(prev => ({ ...prev, ...patch }));
    setSaved(false);
  };

  const handleSave = () => {
    onUpdateSettings(local);
    setSaved(true);
    toast.success('Settings saved successfully');
    setTimeout(() => setSaved(false), 2500);
  };

  const inputStyle = {
    padding: '8px 12px',
    fontSize: 13.5,
    background: 'var(--app-input-bg)',
    border: '1px solid var(--app-input-border)',
    borderRadius: 8,
    color: 'var(--app-text-primary)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  };

  const sectionStyle = {
    background: 'var(--app-card)',
    border: '1px solid var(--app-border)',
    borderRadius: 16,
    padding: isMobile ? '4px 16px' : '4px 24px',
    marginBottom: 20,
  };

  const sectionLabel = {
    fontSize: 11.5,
    fontWeight: 700,
    color: 'var(--app-text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.07em',
    padding: '16px 0 4px',
  };

  return (
    <div style={{ padding: isMobile ? '20px 16px 16px' : '32px 36px', maxWidth: 640, margin: '0 auto' }}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ color: 'var(--app-text-primary)', marginBottom: 2, fontSize: isMobile ? 20 : undefined }}>Settings</h1>
          <p style={{ fontSize: 13.5, color: 'var(--app-text-muted)' }}>Configure your workspace preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl transition"
          style={{
            padding: isMobile ? '9px 14px' : '9px 20px',
            fontSize: 13.5,
            fontWeight: 600,
            background: saved ? '#16A34A' : 'var(--app-btn-primary-bg)',
            color: saved ? '#fff' : 'var(--app-btn-primary-fg)',
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {saved ? <Check style={{ width: 15, height: 15 }} /> : null}
          {saved ? 'Saved!' : isMobile ? 'Save' : 'Save Changes'}
        </button>
      </div>

      {/* Appearance section */}
      <div style={sectionStyle}>
        <div style={sectionLabel}>Appearance</div>
        <div style={{ padding: '14px 0' }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--app-text-primary)', marginBottom: 4 }}>Theme</div>
          <div style={{ fontSize: 12.5, color: 'var(--app-text-muted)', marginBottom: 12 }}>Choose how the app looks on your device</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
              const active = theme === value;
              return (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '12px 8px',
                    borderRadius: 12,
                    border: `2px solid ${active ? 'var(--app-btn-primary-bg)' : 'var(--app-border)'}`,
                    background: active ? 'var(--app-nav-active-bg)' : 'var(--app-input-bg)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon style={{ width: 18, height: 18, color: active ? 'var(--app-btn-primary-bg)' : 'var(--app-text-muted)' }} />
                  <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? 'var(--app-text-primary)' : 'var(--app-text-muted)' }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Company section */}
      <div style={sectionStyle}>
        <div style={sectionLabel}>Company</div>

        <Field label="Company Name" hint="Shown in the sidebar and on payslips" isMobile={isMobile}>
          <input
            type="text"
            value={local.companyName}
            onChange={e => update({ companyName: e.target.value })}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'var(--app-input-focus)')}
            onBlur={e => (e.target.style.borderColor = 'var(--app-input-border)')}
          />
        </Field>

        <Field label="Currency" hint="Used for salary display across the app" isMobile={isMobile}>
          <select
            value={local.currency}
            onChange={e => update({ currency: e.target.value })}
            style={inputStyle}
          >
            {CURRENCY_OPTIONS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Payroll Rules info card */}
      <div style={{ ...sectionStyle, background: 'var(--app-nav-active-bg)', border: '1px solid var(--app-btn-primary-bg)30' }}>
        <div style={{ padding: '14px 0 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--app-text-primary)', marginBottom: 2 }}>Payroll Model</div>
          {[
            { icon: '30', label: 'Every month is treated as 30 payroll days' },
            { icon: '÷',  label: 'Daily Rate = Monthly Salary ÷ 30' },
            { icon: '−',  label: 'Only absence records create deductions' },
            { icon: '✓',  label: 'Present records do not affect salary' },
          ].map(({ icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 26, height: 26, borderRadius: 8, background: 'var(--app-btn-primary-bg)', color: 'var(--app-btn-primary-fg)',
                fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>{icon}</span>
              <span style={{ fontSize: 13, color: 'var(--app-text-secondary)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payroll Rules section */}
      <div style={sectionStyle}>
        <div style={sectionLabel}>Payroll Rules</div>

        {/* Half Day Value */}
        <Field label="Half Day Value" hint="Pay fraction for a half-day attendance (1.0 = full pay, 0.5 = half pay)" isMobile={isMobile}>
          <div style={{ display: 'flex', gap: 6 }}>
            {([
              { v: 0.25, label: '¼' },
              { v: 0.5,  label: '½' },
              { v: 0.75, label: '¾' },
              { v: 1.0,  label: 'Full' },
            ]).map(({ v, label }) => (
              <button
                key={v}
                onClick={() => update({ halfDayValue: v })}
                style={{
                  padding: '6px 14px', fontSize: 13,
                  fontWeight: local.halfDayValue === v ? 700 : 400, borderRadius: 8,
                  border: `1.5px solid ${local.halfDayValue === v ? 'var(--app-btn-primary-bg)' : 'var(--app-border)'}`,
                  background: local.halfDayValue === v ? 'var(--app-nav-active-bg)' : 'var(--app-input-bg)',
                  color: local.halfDayValue === v ? 'var(--app-text-primary)' : 'var(--app-text-muted)',
                  cursor: 'pointer',
                }}
              >{label}</button>
            ))}
          </div>
        </Field>

        {/* Paid Leave */}
        <Field label="Paid Leave = full pay" hint="When off, paid leave is treated as unpaid" isMobile={isMobile} toggleRow>
          <Toggle checked={local.paidLeaveFullPay} onChange={v => update({ paidLeaveFullPay: v })} />
        </Field>

        {/* Sick Leave */}
        <Field label="Sick Leave = full pay" hint="When off, sick leave is treated as unpaid" isMobile={isMobile} toggleRow>
          <Toggle checked={local.sickLeaveFullPay} onChange={v => update({ sickLeaveFullPay: v })} />
        </Field>

        {/* Other Absence — now includes Quarter Pay */}
        <Field label="Other Absence Pay" hint="Pay rule applied to absences marked as 'Other'" isMobile={isMobile}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {([
              { value: 'full',    label: 'Full Pay' },
              { value: 'half',    label: 'Half Pay' },
              { value: 'quarter', label: 'Quarter Pay' },
              { value: 'unpaid',  label: 'Unpaid' },
            ] as { value: OtherAbsenceHandling; label: string }[]).map(opt => (
              <button
                key={opt.value}
                onClick={() => update({ otherAbsenceHandling: opt.value })}
                style={{
                  padding: '6px 12px', fontSize: 12.5, whiteSpace: 'nowrap',
                  fontWeight: local.otherAbsenceHandling === opt.value ? 700 : 400, borderRadius: 8,
                  border: `1.5px solid ${local.otherAbsenceHandling === opt.value ? 'var(--app-btn-primary-bg)' : 'var(--app-border)'}`,
                  background: local.otherAbsenceHandling === opt.value ? 'var(--app-nav-active-bg)' : 'var(--app-input-bg)',
                  color: local.otherAbsenceHandling === opt.value ? 'var(--app-text-primary)' : 'var(--app-text-muted)',
                  cursor: 'pointer',
                }}
              >{opt.label}</button>
            ))}
          </div>
        </Field>

        {/* Unpaid Leave — read-only */}
        <div style={{ padding: '14px 0', borderBottom: '1px solid var(--app-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--app-text-primary)' }}>Unpaid Leave</div>
            <div style={{ fontSize: 12.5, color: 'var(--app-text-muted)', marginTop: 2 }}>Always deducted from salary · not configurable</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8 }}>
            <Lock style={{ width: 11, height: 11, color: '#DC2626' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#DC2626' }}>Not Payable</span>
          </div>
        </div>

        {/* Not Marked — no deduction in absence-based model */}
        <div style={{ padding: '14px 0', borderBottom: '1px solid var(--app-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--app-text-primary)' }}>Not Marked</div>
            <div style={{ fontSize: 12.5, color: 'var(--app-text-muted)', marginTop: 2 }}>No deduction — salary is fully earned unless an absence is recorded</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'var(--app-subtle-bg)', border: '1px solid var(--app-border)', borderRadius: 8 }}>
            <Lock style={{ width: 11, height: 11, color: 'var(--app-text-muted)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--app-text-muted)' }}>No Deduction</span>
          </div>
        </div>
      </div>

      {/* Live Calculation card */}
      <div style={{ ...sectionStyle, marginBottom: 0 }}>
        <div style={sectionLabel}>Live Calculation Example</div>
        <div style={{ padding: '14px 0' }}>
          <div style={{ fontSize: 12.5, color: 'var(--app-text-muted)', marginBottom: 12 }}>
            Based on your current deduction settings. Updates live as you change rules above.
          </div>

          {/* Example card */}
          {(() => {
            const DEMO_SALARY = 30000;
            const dailyRate = DEMO_SALARY / 30;
            const halfDeduct = Math.round(dailyRate * (1 - (local.halfDayValue ?? 0.5)));
            const unpaidDeduct = Math.round(dailyRate);
            const otherFrac = local.otherAbsenceHandling === 'full' ? 0 : local.otherAbsenceHandling === 'half' ? 0.5 : local.otherAbsenceHandling === 'quarter' ? 0.75 : 1;
            const otherDeduct = Math.round(dailyRate * otherFrac);
            const totalDeduct = unpaidDeduct * 2 + halfDeduct;
            const finalSalary = DEMO_SALARY - totalDeduct;
            const sym = local.currency === 'USD' ? '$' : local.currency === 'EUR' ? '€' : local.currency === 'GBP' ? '£' : '₹';
            const f = (n: number) => `${sym}${n.toLocaleString('en-IN')}`;

            const rows: { label: string; value: string; sub?: string; color?: string; bold?: boolean; top?: boolean }[] = [
              { label: 'Monthly Salary', value: f(DEMO_SALARY) },
              { label: 'Daily Rate (÷ 30)', value: f(dailyRate), sub: `${sym}${DEMO_SALARY.toLocaleString()} ÷ 30`, color: 'var(--app-text-muted)' },
              { label: 'Unpaid Leave × 2', value: `− ${f(unpaidDeduct * 2)}`, color: '#DC2626' },
              { label: `Half Day × 1`, value: `− ${f(halfDeduct)}`, sub: `${Math.round((1 - (local.halfDayValue ?? 0.5)) * 100)}% deduction`, color: '#D97706' },
              { label: 'Total Deductions', value: `− ${f(totalDeduct)}`, color: '#DC2626', bold: true, top: true },
              { label: 'Final Salary', value: f(finalSalary), bold: true, color: '#16A34A', top: true },
            ];

            return (
              <div style={{ background: 'var(--app-card)', border: '1px solid var(--app-border)', borderRadius: 12, overflow: 'hidden' }}>
                {rows.map((row, i) => (
                  <div key={row.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 16px',
                    borderTop: row.top ? '1px solid var(--app-border)' : i > 0 ? '1px solid var(--app-border-subtle)' : 'none',
                    background: row.top ? 'var(--app-subtle-bg)' : 'transparent',
                  }}>
                    <div>
                      <div style={{ fontSize: 13, color: row.color ?? 'var(--app-text-secondary)', fontWeight: row.bold ? 600 : 400 }}>{row.label}</div>
                      {row.sub && <div style={{ fontSize: 11, color: 'var(--app-text-muted)', marginTop: 1 }}>{row.sub}</div>}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: row.bold ? 700 : 500, color: row.color ?? 'var(--app-text-primary)', fontFamily: 'monospace' }}>
                      {row.value}
                    </div>
                  </div>
                ))}
                {otherDeduct > 0 && (
                  <div style={{ padding: '8px 16px', background: 'var(--app-subtle-bg)', borderTop: '1px solid var(--app-border-subtle)', fontSize: 11.5, color: 'var(--app-text-muted)' }}>
                    Other Absence (1) would deduct {f(otherDeduct)} · Paid/Sick Leave: {local.paidLeaveFullPay ? 'full pay' : 'unpaid'} / {local.sickLeaveFullPay ? 'full pay' : 'unpaid'}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Company Branding section — custom letterhead only */}
      <div style={{ ...sectionStyle, marginTop: 20 }}>
        <div style={sectionLabel}>Company Branding</div>
        <div style={{ fontSize: 12.5, color: 'var(--app-text-muted)', padding: '8px 0 4px' }}>
          Upload a custom letterhead to appear at the top of payslips and PDFs.
          If no letterhead is uploaded, payslips will be generated without a header.
        </div>

        <div style={{ padding: '16px 0', borderBottom: '1px solid var(--app-border-subtle)' }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--app-text-primary)', marginBottom: 4 }}>Custom Letterhead</div>
          <div style={{ fontSize: 12.5, color: 'var(--app-text-muted)', marginBottom: 12 }}>
            PNG, JPG or PDF · Aspect ratio preserved · Content automatically flows below
          </div>

          {local.customLetterhead ? (
            (() => {
              const isImage = local.customLetterhead.startsWith('data:image/');
              return (
                <div style={{ marginBottom: 12 }}>
                  {isImage ? (
                    <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                      <img
                        src={local.customLetterhead}
                        alt="Letterhead"
                        style={{ width: '100%', maxHeight: 100, objectFit: 'contain', borderRadius: 8, border: '1px solid var(--app-border)', display: 'block' }}
                      />
                      <button
                        onClick={() => update({ customLetterhead: undefined })}
                        style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#DC2626', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                      >
                        <X style={{ width: 11, height: 11, color: '#fff' }} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--app-success-bg)', border: '1px solid var(--app-border)', borderRadius: 10, marginBottom: 4 }}>
                      <Upload style={{ width: 14, height: 14, color: 'var(--app-success-color)' }} />
                      <span style={{ fontSize: 13, color: 'var(--app-success-color)', fontWeight: 500, flex: 1 }}>PDF letterhead uploaded</span>
                      <button
                        onClick={() => update({ customLetterhead: undefined })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 2 }}
                      >
                        <X style={{ width: 13, height: 13 }} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div style={{ width: '100%', height: 72, background: 'var(--app-input-bg)', border: '2px dashed var(--app-border)', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
              <Upload style={{ width: 18, height: 18, color: 'var(--app-text-muted)' }} />
              <span style={{ fontSize: 12.5, color: 'var(--app-text-muted)' }}>No letterhead — payslips will be clean without a header</span>
            </div>
          )}

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 13, fontWeight: 500, background: 'var(--app-input-bg)', border: '1px solid var(--app-input-border)', borderRadius: 10, color: 'var(--app-text-secondary)', cursor: 'pointer' }}>
            <Upload style={{ width: 13, height: 13 }} />
            {local.customLetterhead ? 'Replace Letterhead' : 'Upload Letterhead'}
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"
              style={{ display: 'none' }}
              onClick={e => { (e.target as HTMLInputElement).value = ''; }}
              onChange={e => {
                const f = e.target.files?.[0];
                if (!f) return;
                const r = new FileReader();
                r.onload = () => update({ customLetterhead: r.result as string });
                r.readAsDataURL(f);
              }}
            />
          </label>
        </div>
      </div>

      {/* PDF Preview — mirrors the actual exported payslip exactly */}
      <div style={{ ...sectionStyle, marginTop: 0 }}>
        <div style={sectionLabel}>PDF Preview</div>
        <div style={{ padding: '4px 0 16px' }}>
          <div style={{ fontSize: 12.5, color: 'var(--app-text-muted)', marginBottom: 12 }}>
            Live preview matching the exported payslip layout.
          </div>

          {/* Scaled-down preview card — uses same structure as the actual PDF */}
          <div style={{ background: '#ffffff', border: '1px solid var(--app-border)', borderRadius: 12, overflow: 'hidden', color: '#111', fontSize: 11 }}>
            <div style={{ padding: '16px 18px' }}>
              {/* Letterhead (if uploaded) */}
              {local.customLetterhead && local.customLetterhead.startsWith('data:image/') ? (
                <div style={{ marginBottom: 14 }}>
                  <img
                    src={local.customLetterhead}
                    alt="Letterhead preview"
                    style={{ width: '100%', maxHeight: 80, objectFit: 'contain', display: 'block' }}
                  />
                </div>
              ) : null}

              {/* Payslip document header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid #e5e7eb', marginBottom: 12 }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#9ca3af' }}>Salary Payslip</div>
                <div style={{ fontSize: 9, color: '#9ca3af' }}>Generated {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>

              {/* Employee information (mock) */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9ca3af', paddingBottom: 5, borderBottom: '1px solid #f3f4f6', marginBottom: 8 }}>Employee Information</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px 0' }}>
                  {[['Employee Name', local.companyName || 'Sample Employee'], ['Pay Period', new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })], ['Department', 'Operations']].map(([lbl, val]) => (
                    <div key={lbl}>
                      <div style={{ fontSize: 8, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.04em' }}>{lbl}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#111' }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Salary summary (mock) */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9ca3af', paddingBottom: 5, borderBottom: '1px solid #f3f4f6', marginBottom: 8 }}>Earnings</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f9f9f9' }}>
                  <span style={{ color: '#374151' }}>Monthly Salary</span>
                  <span style={{ fontWeight: 600 }}>₹30,000</span>
                </div>
              </div>

              {/* Net salary box */}
              <div style={{ background: '#111', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '.06em', color: '#9ca3af' }}>Net Salary Payable</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>₹30,000</div>
              </div>

              {!local.customLetterhead && (
                <div style={{ marginTop: 10, padding: '6px 10px', background: '#f9fafb', borderRadius: 6, fontSize: 9, color: '#9ca3af', textAlign: 'center' }}>
                  Upload a letterhead above to see it here
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile section — mobile only (desktop has sidebar) */}
      {isMobile && (
        <div style={{ ...sectionStyle, marginTop: 20, marginBottom: 0 }}>
          <div style={sectionLabel}>Profile</div>
          <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: '#EDE9FE', color: '#6D28D9',
              fontSize: 14, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {currentUser.name.trim().split(' ').reduce((acc, p, i, arr) =>
                arr.length >= 2 ? (i === 0 ? p[0] : i === arr.length - 1 ? acc + p[0] : acc) : p.slice(0, 2), ''
              ).toUpperCase().slice(0, 2)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--app-text-primary)' }}>{currentUser.name}</div>
              <div style={{ fontSize: 12, color: 'var(--app-text-muted)', marginTop: 1 }}>Saved on this device</div>
            </div>
            <button
              onClick={onSwitchUser}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 13, fontWeight: 500, background: 'var(--app-subtle-bg)', border: 'none', borderRadius: 10, color: 'var(--app-text-secondary)', cursor: 'pointer' }}
            >
              <LogOut style={{ width: 13, height: 13 }} />
              Switch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
