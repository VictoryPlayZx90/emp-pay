import { useState, type ElementType } from 'react';
import { ChevronLeft, ChevronRight, Users, UserCheck, UserX, Clock, Plus, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '../hooks/useIsMobile';
import type { Employee, AttendanceRecord, Holiday, Settings } from '../App';
import { getWorkingDays } from '../utils/attendanceEngine';
import { AttendanceRow } from './AttendanceRow';
import { CalendarDropdown } from './CalendarDropdown';
import { SyncIndicator } from './SyncIndicator';

interface Props {
  employees: Employee[];
  holidays: Holiday[];
  settings: Settings;
  selectedDate: string;
  onDateChange: (date: string) => void;
  getAttendance: (employeeId: string, date: string) => AttendanceRecord;
  updateAttendance: (employeeId: string, date: string, record: AttendanceRecord) => void;
  onUpdateHolidays?: (holidays: Holiday[]) => void;
  onNavigateToProfile?: (employeeId: string) => void;
  onUpdateEmployeePhoto?: (employeeId: string, photo: string) => void;
}


function formatDate(dateStr: string) {
  if (!dateStr) {
    const today = new Date();
    dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }
  const d = new Date(dateStr + 'T00:00:00');
  const DAY  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MON  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const MONS = MON.map(m => m.slice(0, 3));
  const dayIndex = d.getDay();
  const monthIndex = d.getMonth();
  return {
    dayName: DAY[dayIndex] || 'Sunday',
    dayShort: (DAY[dayIndex] || 'Sunday').slice(0, 3),
    day: d.getDate(),
    month: MON[monthIndex] || 'January',
    monthShort: MONS[monthIndex] || 'Jan',
    year: d.getFullYear(),
    monthIndex: monthIndex,
  };
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function SummaryCard({ label, count, total, bg, color, icon: Icon }: {
  label: string; count: number; total: number; bg: string; color: string; icon: ElementType;
}) {
  const percentage = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="summary-card" title={`${count} ${label.toLowerCase()} of ${total} employees`} style={{ background: 'var(--app-card)', border: '1px solid var(--app-border)', borderRadius: 14, padding: '14px 16px', flex: 1, minWidth: 0 }}>
      <div className="summary-card-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11.5, color: 'var(--app-text-muted)', fontWeight: 500 }}>{label}</span>
        <div style={{ width: 28, height: 28, background: bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon style={{ width: 13, height: 13, color }} />
        </div>
      </div>
      <div className="summary-card-value">{percentage}<span>%</span></div>
      <div className="summary-progress" role="progressbar" aria-label={`${label} as a share of employees`} aria-valuemin={0} aria-valuemax={total} aria-valuenow={count}>
        <span style={{ width: `${percentage}%`, background: color }} />
      </div>
      <div className="summary-card-foot">of employees</div>
    </div>
  );
}

export function DashboardScreen({
  employees, holidays, settings, selectedDate, onDateChange, getAttendance, updateAttendance, onUpdateHolidays, onNavigateToProfile, onUpdateEmployeePhoto,
}: Props) {
  const isMobile = useIsMobile();
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayName, setHolidayName] = useState('');

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const fmt = formatDate(selectedDate);
  const workingDays = getWorkingDays(fmt.year, fmt.monthIndex);

  // Only show employees who had already joined on the selected date.
  // Employees without a joining date are always shown (backward compat).
  const activeEmployees = employees.filter(emp =>
    !emp.joiningDate || emp.joiningDate <= selectedDate
  );

  const records = activeEmployees.map(emp => ({ emp, record: getAttendance(emp.id, selectedDate) }));
  const presentCount  = records.filter(r => r.record.mainStatus === 'present' && r.record.subStatus === 'full-day').length;
  const halfDayCount  = records.filter(r => r.record.subStatus === 'half-day').length;
  const absentCount   = records.filter(r => r.record.mainStatus === 'absent').length;
  const notMarked     = records.filter(r => !r.record.mainStatus).length;
  const markedCount = activeEmployees.length - notMarked;
  const markedPercent = activeEmployees.length ? Math.round((markedCount / activeEmployees.length) * 100) : 0;
  const unmarkedEmployees = records.filter(r => !r.record.mainStatus).slice(0, 4);

  const existingHoliday = holidays.find(h => h.date === selectedDate);
  const isHoliday = !!existingHoliday;
  const isSunday  = new Date(selectedDate + 'T00:00:00').getDay() === 0;

  const handleAddHoliday = () => {
    if (!holidayName.trim()) {
      toast.error('Holiday name is required');
      return;
    }
    if (!onUpdateHolidays) return;

    const newHoliday: Holiday = {
      id: `h_${Date.now()}`,
      name: holidayName.trim(),
      date: selectedDate,
    };
    onUpdateHolidays([...holidays, newHoliday]);
    toast.success(`${holidayName} marked as holiday`);
    setHolidayName('');
    setShowHolidayModal(false);
  };

  const handleRemoveHoliday = () => {
    if (!existingHoliday || !onUpdateHolidays) return;
    if (!window.confirm(`Remove "${existingHoliday.name}" from holidays?`)) return;
    onUpdateHolidays(holidays.filter(h => h.id !== existingHoliday.id));
    toast.success('Holiday removed');
  };

  return (
    <div className="dashboard-page">

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: isMobile ? 'wrap' : 'nowrap', position: 'relative', zIndex: 40 }}>
        <div>
          <div className="dashboard-eyebrow">{settings.companyName} <span>·</span> WORKSPACE</div>
          <h1 style={{ color: 'var(--app-text-primary)', marginBottom: 2, fontSize: isMobile ? 25 : undefined }}>Welcome back</h1>
          <p style={{ fontSize: 13, color: 'var(--app-text-muted)' }}>
            Here’s your attendance overview for {fmt.month} {fmt.day}.
          </p>
        </div>

        {/* Date navigator + sync */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <SyncIndicator />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => onDateChange(shiftDate(selectedDate, -1))}
              style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid var(--app-input-border)', background: 'var(--app-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft style={{ width: 16, height: 16, color: 'var(--app-text-muted)' }} />
            </button>

            <CalendarDropdown
              selectedDate={selectedDate}
              maxDate={today}
              onChange={onDateChange}
              displayFormat={isMobile ? 'short' : 'full'}
            />

            <button
              onClick={() => onDateChange(shiftDate(selectedDate, 1))}
              disabled={selectedDate >= today}
              style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid var(--app-input-border)', background: selectedDate >= today ? 'var(--app-input-bg)' : 'var(--app-card)', cursor: selectedDate >= today ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: selectedDate >= today ? 0.4 : 1 }}
            >
              <ChevronRight style={{ width: 16, height: 16, color: 'var(--app-text-muted)' }} />
            </button>

            {selectedDate !== today && (
              <button
                onClick={() => onDateChange(today)}
                style={{ padding: isMobile ? '8px 12px' : '6px 12px', fontSize: 13, fontWeight: 500, background: 'var(--app-card)', border: '1px solid var(--app-input-border)', borderRadius: 10, color: 'var(--app-text-secondary)', cursor: 'pointer' }}
              >
                Today
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Holiday Action */}
      {onUpdateHolidays && !isSunday && (
        <div style={{ marginBottom: 14 }}>
          {isHoliday ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: 'var(--app-warning-bg)',
              border: '1px solid var(--app-warning-border)',
              borderRadius: 10,
              gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>✓</span>
                <span style={{ fontSize: 13, color: 'var(--app-warning-color)', fontWeight: 500 }}>
                  Holiday: {existingHoliday.name}
                </span>
              </div>
              <button
                onClick={handleRemoveHoliday}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 10px',
                  fontSize: 12,
                  fontWeight: 500,
                  background: 'var(--app-card)',
                  border: '1px solid var(--app-warning-border)',
                  borderRadius: 8,
                  color: 'var(--app-warning-color)',
                  cursor: 'pointer',
                }}
              >
                <Trash2 style={{ width: 12, height: 12 }} />
                Remove
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setHolidayName(''); setShowHolidayModal(true); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: 500,
                background: 'var(--app-card)',
                border: '1px solid var(--app-input-border)',
                borderRadius: 10,
                color: 'var(--app-text-secondary)',
                cursor: 'pointer',
                width: isMobile ? '100%' : 'auto',
                justifyContent: isMobile ? 'center' : 'flex-start',
              }}
            >
              <Plus style={{ width: 14, height: 14 }} />
              Mark as Holiday
            </button>
          )}
        </div>
      )}

      {/* Sunday banner */}
      {isSunday && (
        <div style={{ padding: '12px 16px', background: 'var(--app-warning-bg)', border: '1px solid var(--app-warning-border)', borderRadius: 12, color: 'var(--app-warning-color)', fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 18 }}>🎉</span>
          <span>Sunday — non-working day</span>
        </div>
      )}

      <div className="dashboard-layout">
      <section className="dashboard-main-column">
      {/* Summary cards */}
      <div className="dashboard-metrics" style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: isMobile ? 10 : 14,
        marginBottom: isMobile ? 16 : 20,
      }}>
        <SummaryCard label="Present"    count={presentCount} total={activeEmployees.length} bg="var(--app-stat-present-bg)" color="var(--app-stat-present)" icon={UserCheck} />
        <SummaryCard label="Half Day"   count={halfDayCount} total={activeEmployees.length} bg="var(--app-stat-half-bg)" color="var(--app-stat-half)" icon={Clock} />
        <SummaryCard label="Absent"     count={absentCount}  total={activeEmployees.length} bg="var(--app-stat-absent-bg)" color="var(--app-stat-absent)" icon={UserX} />
        <SummaryCard label="Not Marked" count={notMarked}    total={activeEmployees.length} bg="var(--app-stat-neutral-bg)" color="var(--app-stat-neutral)" icon={Users} />
      </div>

      {/* Attendance cards */}
      <div
        className="attendance-records"
        id="attendance-records"
        style={{
          alignItems: 'stretch',
        }}
      >
        {records.map(({ emp, record }) => (
          <AttendanceRow
            key={emp.id}
            employee={emp}
            record={record}
            cardLayout
            onUpdate={rec => updateAttendance(emp.id, selectedDate, rec)}
            onPhotoUpdate={onUpdateEmployeePhoto ? photo => onUpdateEmployeePhoto(emp.id, photo) : undefined}
            onNavigateToProfile={onNavigateToProfile ? () => onNavigateToProfile(emp.id) : undefined}
          />
        ))}
      </div>

      <p style={{ fontSize: 11.5, color: 'var(--app-text-faint)', marginTop: 12, textAlign: 'center' }}>
        Changes are saved automatically
      </p>
      </section>

      <aside className="dashboard-focus-card">
        <div className="focus-card-topline"><span className="focus-card-dot" /> DAILY CLOSEOUT</div>
        <div className="focus-card-heading">Attendance<br />check-in</div>
        <p className="focus-card-date">{fmt.dayName}, {fmt.monthShort} {fmt.day}</p>
        <div className="focus-progress-row"><strong>{markedCount}<span>/{activeEmployees.length}</span></strong><span>marked</span></div>
        <div className="focus-progress-track"><span style={{ width: `${markedPercent}%` }} /></div>
        <div className="focus-card-caption">{markedPercent}% of today’s attendance recorded</div>
        <div className="focus-list-heading">{notMarked ? 'STILL TO MARK' : 'ALL CAUGHT UP'}</div>
        {unmarkedEmployees.length ? (
          <div className="focus-employee-list">
            {unmarkedEmployees.map(({ emp }) => (
              <div className="focus-employee" key={emp.id}>
                <span className="focus-employee-avatar">{emp.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()}</span>
                <span>{emp.name}</span><span className="focus-pending-dot" />
              </div>
            ))}
            {notMarked > unmarkedEmployees.length && <div className="focus-more">+{notMarked - unmarkedEmployees.length} more to mark</div>}
          </div>
        ) : (
          <div className="focus-complete"><span>✓</span> Every employee has a status</div>
        )}
        <a className="focus-action" href="#attendance-records">Review attendance <span>↗</span></a>
        <div className="focus-card-footer">{workingDays} working days this month</div>
      </aside>
      </div>

      {/* Add Holiday Modal */}
      {showHolidayModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--app-overlay)',
            zIndex: 900,
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'center',
            justifyContent: 'center',
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowHolidayModal(false); }}
        >
          <div style={{
            background: 'var(--app-modal-bg)',
            width: isMobile ? '100%' : 420,
            borderRadius: isMobile ? '20px 20px 0 0' : 16,
            padding: isMobile ? '24px 20px 32px' : 24,
            maxHeight: isMobile ? '92dvh' : 'auto',
            overflowY: 'auto',
          }}>
            {isMobile && <div style={{ width: 36, height: 4, background: 'var(--app-border)', borderRadius: 2, margin: '0 auto 20px' }} />}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ color: 'var(--app-text-primary)', margin: 0, fontSize: 16, fontWeight: 600 }}>Mark as Holiday</h3>
                <p style={{ fontSize: 12, color: 'var(--app-text-muted)', margin: '4px 0 0 0' }}>
                  {fmt.dayName}, {fmt.monthShort} {fmt.day}, {fmt.year}
                </p>
              </div>
              <button
                onClick={() => setShowHolidayModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--app-text-muted)', padding: 4 }}
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--app-text-secondary)', marginBottom: 6 }}>
                Holiday Name
              </label>
              <input
                type="text"
                value={holidayName}
                onChange={e => setHolidayName(e.target.value)}
                placeholder="e.g., Independence Day"
                autoFocus
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: 14,
                  background: 'var(--app-input-bg)',
                  border: '1px solid var(--app-input-border)',
                  borderRadius: 10,
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: 'var(--app-text-primary)',
                }}
                onKeyDown={e => { if (e.key === 'Enter') handleAddHoliday(); }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowHolidayModal(false)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  fontSize: 14,
                  fontWeight: 500,
                  background: 'var(--app-btn-secondary-bg)',
                  border: '1px solid var(--app-btn-secondary-border)',
                  borderRadius: 10,
                  color: 'var(--app-btn-secondary-fg)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddHoliday}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  fontSize: 14,
                  fontWeight: 600,
                  background: 'var(--app-btn-primary-bg)',
                  border: 'none',
                  borderRadius: 10,
                  color: 'var(--app-btn-primary-fg)',
                  cursor: 'pointer',
                }}
              >
                Save Holiday
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
