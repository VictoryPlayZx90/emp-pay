import { useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import type { Employee, AttendanceRecord, MainStatus, SubStatus } from '../App';
import { ProfilePhoto } from './ProfilePhoto';
import { Camera, Check, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { PhotoUploadCrop } from './PhotoUploadCrop';

interface Props {
  employee: Employee;
  record: AttendanceRecord;
  onUpdate: (record: AttendanceRecord) => void;
  onNavigateToProfile?: () => void;
  cardLayout?: boolean;
  onPhotoUpdate?: (photo: string) => void;
}

const BADGE: Record<SubStatus, { label: string; bg: string; color: string; border: string }> = {
  'full-day':     { label: 'Full Day',     bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  'half-day':     { label: 'Half Day',     bg: '#FEFCE8', color: '#CA8A04', border: '#FDE68A' },
  'paid-leave':   { label: 'Paid Leave',   bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
  'sick-leave':   { label: 'Sick Leave',   bg: '#FFF7ED', color: '#EA580C', border: '#FED7AA' },
  'unpaid-leave': { label: 'Unpaid Leave', bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  'other':        { label: 'Other',        bg: '#F9FAFB', color: '#6B7280', border: '#E5E7EB' },
};

function StatusBadge({ record }: { record: AttendanceRecord }) {
  if (!record.mainStatus) {
    return <span style={{ fontSize: 11.5, color: 'var(--app-text-faint)', fontStyle: 'italic' }}>Not Marked</span>;
  }
  if (record.subStatus && BADGE[record.subStatus]) {
    const c = BADGE[record.subStatus];
    return (
      <span style={{
        padding: '3px 10px', fontSize: 11.5, fontWeight: 600,
        background: c.bg, color: c.color, border: `1px solid ${c.border}`,
        borderRadius: 20, whiteSpace: 'nowrap',
      }}>
        {c.label}
      </span>
    );
  }
  return <span style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>—</span>;
}

function Pill({
  label, active, onClick,
  activeBg, activeColor,
  grow = false,
}: {
  label: string; active: boolean; onClick: () => void;
  activeBg: string; activeColor: string; grow?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`status-choice${active ? ' is-active' : ''} ${label.toLowerCase().replace(/\s+/g, '-')}`}
      aria-pressed={active}
      style={{
        flex: grow ? 1 : undefined,
        padding: '7px 14px',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        background: active ? activeBg : 'var(--app-pill-inactive-bg)',
        color: active ? activeColor : 'var(--app-pill-inactive-color)',
        border: `1px solid ${active ? activeBg : 'var(--app-pill-inactive-border)'}`,
        borderRadius: 20,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.1s',
      }}
    >
      {label}
    </button>
  );
}

const PRESENT_SUBS = [
  { key: 'full-day' as SubStatus,  label: 'Full Day',  activeBg: '#16A34A', activeColor: '#fff' },
  { key: 'half-day' as SubStatus,  label: 'Half Day',  activeBg: '#CA8A04', activeColor: '#fff' },
];

const ABSENT_SUBS = [
  { key: 'paid-leave'   as SubStatus, label: 'Paid Leave',   activeBg: '#2563EB', activeColor: '#fff' },
  { key: 'sick-leave'   as SubStatus, label: 'Sick Leave',   activeBg: '#EA580C', activeColor: '#fff' },
  { key: 'unpaid-leave' as SubStatus, label: 'Unpaid Leave', activeBg: '#DC2626', activeColor: '#fff' },
  { key: 'other'        as SubStatus, label: 'Other',        activeBg: '#6B7280', activeColor: '#fff' },
];

export function AttendanceRow({ employee, record, onUpdate, onNavigateToProfile, cardLayout = false, onPhotoUpdate }: Props) {
  const isMobile = useIsMobile();
  const useCardLayout = isMobile || cardLayout;
  const [openMenu, setOpenMenu] = useState<MainStatus | null>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  const setMain = (main: MainStatus) => {
    if (record.mainStatus === main) { onUpdate({ mainStatus: null, subStatus: null, reason: undefined }); return; }
    onUpdate({ mainStatus: main, subStatus: main === 'present' ? 'full-day' : 'paid-leave', reason: undefined });
  };
  const setSub = (sub: SubStatus) => {
    if (sub !== 'other') {
      onUpdate({ ...record, subStatus: sub, reason: undefined });
    } else {
      onUpdate({ ...record, subStatus: sub });
    }
  };
  const chooseAttendance = (main: MainStatus, sub: SubStatus) => {
    onUpdate({ mainStatus: main, subStatus: sub, reason: undefined });
    setOpenMenu(null);
  };
  const savePhoto = (photo: string) => {
    onPhotoUpdate?.(photo);
    setShowPhotoUpload(false);
    toast.success(`${employee.name}'s photo updated`);
  };
  const setReason = (reason: string) => onUpdate({ ...record, reason: reason || undefined });

  const subList = record.mainStatus === 'present' ? PRESENT_SUBS : record.mainStatus === 'absent' ? ABSENT_SUBS : [];
  const showReasonInput = record.subStatus === 'other';

  if (useCardLayout) {
    return (
      <div
        className="attendance-row"
        style={{
          background: 'transparent',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,.1)',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          minWidth: 0,
          position: 'relative',
          aspectRatio: '1 / 1',
          zIndex: openMenu ? 5 : undefined,
          transition: 'border-color .18s ease, transform .18s ease, box-shadow .18s ease',
        }}
        onMouseEnter={event => {
          event.currentTarget.style.borderColor = 'var(--app-input-border)';
          event.currentTarget.style.transform = 'translateY(-2px)';
          event.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,.12)';
        }}
        onMouseLeave={event => {
          event.currentTarget.style.borderColor = 'var(--app-border)';
          event.currentTarget.style.transform = 'translateY(0)';
          event.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Photo header uses the employee's saved profile image as the card cover. */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'visible', borderRadius: 15, background: 'linear-gradient(135deg, #31464b 0%, #26372f 48%, #151d20 100%)' }}>
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 15 }}>
          {employee.profilePhoto ? (
            <>
              <img aria-hidden="true" src={employee.profilePhoto} alt="" style={{ position: 'absolute', inset: -18, width: 'calc(100% + 36px)', height: 'calc(100% + 36px)', objectFit: 'cover', filter: 'blur(18px) brightness(.72) saturate(.85)', opacity: .62, transform: 'scale(1.04)' }} />
              <img src={employee.profilePhoto} alt={`${employee.name} profile`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', filter: 'drop-shadow(0 5px 16px rgba(0,0,0,.24))' }} />
            </>
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'radial-gradient(circle at 25% 10%, rgba(207,235,151,.32), transparent 42%), linear-gradient(145deg, #34494a, #27372f 60%, #182123)' }}>
              <ProfilePhoto name={employee.name} size={66} />
            </div>
          )}
          <div aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 172, background: 'linear-gradient(180deg, rgba(26,37,30,0) 0%, rgba(28,42,32,.36) 35%, rgba(15,24,19,.83) 100%)', backdropFilter: 'blur(13px)', WebkitBackdropFilter: 'blur(13px)', maskImage: 'linear-gradient(to bottom, transparent 0%, black 36%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 36%)' }} />
          </div>
          {onPhotoUpdate && <button type="button" aria-label={`Add or change ${employee.name}'s photo`} title={employee.profilePhoto ? 'Change photo' : 'Add photo'} onClick={() => setShowPhotoUpload(true)} style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, display: 'grid', placeItems: 'center', borderRadius: 11, border: '1px solid rgba(255,255,255,.35)', background: 'rgba(10,16,17,.58)', color: '#fff', cursor: 'pointer', backdropFilter: 'blur(10px)' }}><Camera size={15} /></button>}
          <div style={{ position: 'absolute', left: 12, right: 12, bottom: 11, display: 'flex', flexDirection: 'column', gap: 9 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
            {onNavigateToProfile ? (
              <button onClick={onNavigateToProfile} style={{ minWidth: 0, padding: 0, border: 0, background: 'transparent', color: '#fff', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>{employee.name}</div>
                <div style={{ marginTop: 3, color: 'rgba(255,255,255,.72)', fontSize: 11.5 }}>{employee.designation || employee.department}</div>
              </button>
            ) : (
              <div style={{ minWidth: 0, color: '#fff' }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 16, fontWeight: 700 }}>{employee.name}</div><div style={{ marginTop: 3, color: 'rgba(255,255,255,.72)', fontSize: 11.5 }}>{employee.designation || employee.department}</div></div>
            )}
            <StatusBadge record={record} />
          </div>

        {/* Each status button opens its matching attendance choices. */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['present', 'absent'] as MainStatus[]).map(main => {
            const isPresent = main === 'present';
            const active = record.mainStatus === main;
            const options = isPresent ? PRESENT_SUBS : ABSENT_SUBS;
            const selectedOption = active ? options.find(option => option.key === record.subStatus) : undefined;
            return (
              <div key={main} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                <button
                  type="button"
                  onClick={() => setOpenMenu(current => current === main ? null : main)}
                  aria-haspopup="menu"
                  aria-expanded={openMenu === main}
                  aria-pressed={active}
                  className={`status-choice ${main}${active ? ' is-active' : ''}`}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 7,
                    minHeight: 50, padding: '8px 10px', fontSize: 13, fontWeight: 650, borderRadius: 10,
                    border: `1px solid ${active ? (isPresent ? 'var(--app-stat-present)' : 'var(--app-stat-absent)') : 'var(--app-border)'}`,
                    background: active ? (isPresent ? 'rgba(31,95,67,.72)' : 'rgba(130,47,48,.72)') : 'rgba(13,21,24,.64)',
                    color: active ? (isPresent ? '#c9f6d8' : '#ffd3d3') : 'rgba(255,255,255,.72)',
                    backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                    cursor: 'pointer', transition: 'background .16s, border-color .16s, color .16s',
                  }}
                >
                  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0, gap: 2 }}>
                    <span>{isPresent ? 'Present' : 'Absent'}</span>
                    <span style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 10.5, fontWeight: 500, opacity: active ? .9 : .68 }}>
                      {selectedOption?.label ?? 'Choose type'}
                    </span>
                  </span>
                  <ChevronDown size={14} style={{ transform: openMenu === main ? 'rotate(180deg)' : undefined, transition: 'transform .16s' }} />
                </button>
                {openMenu === main && (
                  <div role="menu" aria-label={isPresent ? 'Present options' : 'Absence options'} style={{ position: 'absolute', bottom: 'calc(100% + 7px)', left: isPresent ? 0 : undefined, right: isPresent ? undefined : 0, width: 'max(100%, 190px)', padding: 5, borderRadius: 12, border: '1px solid var(--app-border)', background: 'var(--app-modal-bg, var(--app-card))', boxShadow: '0 14px 34px rgba(0,0,0,.34)', zIndex: 30 }}>
                    {options.map(option => {
                      const selected = active && record.subStatus === option.key;
                      return (
                        <button key={option.key} type="button" role="menuitemradio" aria-checked={selected} onClick={() => chooseAttendance(main, option.key)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '9px 10px', border: 0, borderRadius: 8, background: selected ? 'var(--app-subtle-bg)' : 'transparent', color: selected ? 'var(--app-text-primary)' : 'var(--app-text-secondary)', cursor: 'pointer', fontSize: 12.5, textAlign: 'left' }} onMouseEnter={event => { event.currentTarget.style.background = 'var(--app-subtle-bg)'; }} onMouseLeave={event => { event.currentTarget.style.background = selected ? 'var(--app-subtle-bg)' : 'transparent'; }}>
                          <span>{option.label}</span>{selected && <Check size={14} color="var(--app-accent)" />}
                        </button>
                      );
                    })}
                    {active && <button type="button" role="menuitem" onClick={() => { onUpdate({ mainStatus: null, subStatus: null, reason: undefined }); setOpenMenu(null); }} style={{ width: '100%', marginTop: 4, padding: '9px 10px', border: 0, borderTop: '1px solid var(--app-border)', borderRadius: 0, background: 'transparent', color: 'var(--app-text-muted)', cursor: 'pointer', fontSize: 11.5, textAlign: 'left' }}>Clear attendance</button>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Reason input for "Other" */}
        {showReasonInput && (
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--app-text-muted)', marginBottom: 6 }}>
              Reason (Optional)
            </label>
            <input
              type="text"
              value={record.reason || ''}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g., Vehicle Breakdown, Family Emergency"
              style={{
                width: '100%',
                padding: '9px 12px',
                fontSize: 13,
                background: 'rgba(13,21,24,.72)',
                border: '1px solid rgba(255,255,255,.22)',
                borderRadius: 8,
                outline: 'none',
                boxSizing: 'border-box',
                color: 'var(--app-text-primary)',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--app-input-focus)')}
              onBlur={e => (e.target.style.borderColor = 'var(--app-input-border)')}
            />
          </div>
        )}
        </div>
        </div>
        {showPhotoUpload && onPhotoUpdate && (
          <PhotoUploadCrop
            currentPhoto={employee.profilePhoto}
            onSave={savePhoto}
            onCancel={() => setShowPhotoUpload(false)}
          />
        )}
      </div>
    );
  }

  // ── Desktop layout ──────────────────────────────────────────
  return (
    <div
      className="attendance-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '12px 24px',
        borderBottom: '1px solid var(--app-border-subtle)',
        minHeight: 60,
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--app-card-hover)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Name — photo+name clickable */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 200, flexShrink: 0 }}>
        {onNavigateToProfile ? (
          <button
            onClick={onNavigateToProfile}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
          >
            <ProfilePhoto name={employee.name} photoUrl={employee.profilePhoto} size={34} />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--app-text-primary)', lineHeight: 1.3 }}>
                {employee.name}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--app-text-muted)' }}>{employee.department}</div>
            </div>
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ProfilePhoto name={employee.name} photoUrl={employee.profilePhoto} size={34} />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--app-text-primary)', lineHeight: 1.3 }}>
                {employee.name}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--app-text-muted)' }}>{employee.department}</div>
            </div>
          </div>
        )}
      </div>

      {/* Main pills */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <Pill label="Present" active={record.mainStatus === 'present'} onClick={() => setMain('present')} activeBg="#DCFCE7" activeColor="#15803D" />
        <Pill label="Absent"  active={record.mainStatus === 'absent'}  onClick={() => setMain('absent')}  activeBg="#FEE2E2" activeColor="#B91C1C" />
      </div>

      {/* Sub pills */}
      <div style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        {subList.map(s => (
          <Pill
            key={s.key}
            label={s.label}
            active={record.subStatus === s.key}
            onClick={() => setSub(s.key)}
            activeBg={s.activeBg}
            activeColor={s.activeColor}
          />
        ))}
        {showReasonInput && (
          <input
            type="text"
            value={record.reason || ''}
            onChange={e => setReason(e.target.value)}
            placeholder="Reason (Optional)"
            style={{
              flex: 1,
              minWidth: 200,
              padding: '7px 12px',
              fontSize: 12,
              background: 'var(--app-input-bg)',
              border: '1px solid var(--app-input-border)',
              borderRadius: 8,
              outline: 'none',
              color: 'var(--app-text-primary)',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--app-input-focus)')}
            onBlur={e => (e.target.style.borderColor = 'var(--app-input-border)')}
          />
        )}
      </div>

      {/* Badge */}
      <div style={{ flexShrink: 0, width: 110, textAlign: 'right' }}>
        <StatusBadge record={record} />
      </div>
    </div>
  );
}
