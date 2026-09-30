import { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard, Receipt, Users, CalendarDays, Settings,
  Building2, LogOut, ChevronDown, User, Repeat2,
} from 'lucide-react';
import type { Screen } from '../App';
import type { UserProfile, GoogleUser } from './UserSelectScreen';
import type { SyncStatus } from './SyncIndicator';

interface Props {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  companyName: string;
  currentUser: UserProfile;
  onSwitchUser: () => void;
  onSignOut?: () => void;
  googleUser?: GoogleUser | null;
  // syncStatus and onCloudRefresh kept for API compatibility but sync UI is hidden
  syncStatus?: SyncStatus;
  onCloudRefresh?: () => void;
}

const PALETTES = [
  { bg: '#EDE9FE', color: '#6D28D9' },
  { bg: '#DBEAFE', color: '#1D4ED8' },
  { bg: '#D1FAE5', color: '#065F46' },
  { bg: '#FEF3C7', color: '#92400E' },
  { bg: '#FCE7F3', color: '#9D174D' },
  { bg: '#E0F2FE', color: '#075985' },
  { bg: '#FEE2E2', color: '#991B1B' },
  { bg: '#ECFDF5', color: '#065F46' },
];

function getPalette(name: string) {
  return PALETTES[(name.charCodeAt(0) ?? 65) % PALETTES.length];
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

const NAV_ITEMS: { id: Screen; label: string; icon: ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'payroll',   label: 'Payroll',   icon: Receipt },
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'holidays',  label: 'Holidays',  icon: CalendarDays },
  { id: 'settings',  label: 'Settings',  icon: Settings },
];

// Sync UI has been removed per product requirement (item 11).
// Background autosave continues to run — no indicator is shown.

// ─── Account menu (pops up from the user row) ─────────────────────────────────

interface AccountMenuProps {
  googleUser: GoogleUser;
  currentUser: UserProfile;
  onSwitchUser: () => void;
  onSignOut: () => void;
  onClose: () => void;
}

function AccountMenu({ googleUser, currentUser, onSwitchUser, onSignOut, onClose }: AccountMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const emailStr = googleUser.email ?? '';
  const p = getPalette(emailStr || currentUser.name);

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 260, zIndex: 200,
      background: 'var(--app-modal-bg)', border: '1px solid var(--app-border)',
      borderRadius: 14, boxShadow: '0 -4px 28px rgba(0,0,0,0.18)',
      overflow: 'hidden',
      animation: 'acct-in 0.14s ease',
    }}>
      <style>{`@keyframes acct-in { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:none; } }`}</style>

      {/* Identity block */}
      <div style={{ padding: '14px 14px 12px', borderBottom: '1px solid var(--app-border)' }}>
        {googleUser.photoURL ? (
          <img src={googleUser.photoURL} alt="" referrerPolicy="no-referrer"
            style={{ width: 36, height: 36, borderRadius: '50%', marginBottom: 8, display: 'block' }} />
        ) : (
          <div style={{
            width: 36, height: 36, borderRadius: '50%', marginBottom: 8,
            background: p.bg, color: p.color, fontSize: 13, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {emailStr ? emailStr.slice(0, 2).toUpperCase() : getInitials(currentUser.name)}
          </div>
        )}
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--app-text-primary)', marginBottom: 2 }}>
          {googleUser.displayName ?? 'My Account'}
        </div>
        {emailStr && (
          <div style={{ fontSize: 11.5, color: 'var(--app-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {emailStr}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: '5px 0' }}>
        {[
          { icon: <User style={{ width: 13, height: 13 }} />,    label: 'Account',        action: onClose },
          { icon: <Repeat2 style={{ width: 13, height: 13 }} />, label: 'Switch Profile', action: () => { onClose(); onSwitchUser(); } },
        ].map(item => (
          <button key={item.label} onClick={item.action} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 9,
            padding: '9px 14px', background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 13, fontWeight: 500,
            color: 'var(--app-text-secondary)', textAlign: 'left',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--app-nav-hover-bg)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <span style={{ color: 'var(--app-text-muted)' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--app-border)', padding: '5px 0' }}>
        <button onClick={() => { onClose(); onSignOut(); }} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 9,
          padding: '9px 14px', background: 'none', border: 'none',
          cursor: 'pointer', fontSize: 13, fontWeight: 700,
          color: '#DC2626', textAlign: 'left',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.06)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <LogOut style={{ width: 13, height: 13 }} />
          Logout
        </button>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar({
  currentScreen, onNavigate, companyName,
  currentUser, onSwitchUser, onSignOut,
  googleUser, syncStatus = 'synced', onCloudRefresh,
}: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const p = getPalette(currentUser.name);

  const handleSignOut = () => {
    setShowMenu(false);
    (onSignOut ?? onSwitchUser)();
  };

  return (
    <aside className="app-topbar">

      {/* Company header + sync */}
      <div className="app-brand">
        <div className="app-brand-mark">
          <Building2 style={{ width: 17, height: 17, color: 'var(--app-btn-primary-fg)' }} />
        </div>
        <span className="app-brand-name">
          {companyName}
        </span>
      </div>

      {/* Nav */}
      <nav className="app-topnav" aria-label="Main navigation">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = currentScreen === id;
          return (
            <button key={id} onClick={() => onNavigate(id)} className={`app-nav-item${active ? ' is-active' : ''}`} aria-current={active ? 'page' : undefined}>
              <Icon style={{ width: 15, height: 15, flexShrink: 0 }} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* User row */}
      <div className="app-account" style={{ position: 'relative' }}>
        {showMenu && googleUser && (
          <AccountMenu
            googleUser={googleUser}
            currentUser={currentUser}
            onSwitchUser={onSwitchUser}
            onSignOut={handleSignOut}
            onClose={() => setShowMenu(false)}
          />
        )}

        <button
          onClick={() => googleUser ? setShowMenu(v => !v) : onSwitchUser()}
          className="app-account-button"
        >
          {/* Avatar: Google photo > initials */}
          {googleUser?.photoURL ? (
            <img src={googleUser.photoURL} alt="" referrerPolicy="no-referrer"
              style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: p.bg, color: p.color,
              fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {getInitials(currentUser.name)}
            </div>
          )}

          <div className="app-account-copy">
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {googleUser?.displayName ?? currentUser.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--app-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {googleUser?.email ?? 'Switch profile'}
            </div>
          </div>

          {googleUser && (
            <ChevronDown style={{ width: 13, height: 13, color: 'var(--app-text-muted)', flexShrink: 0, transform: showMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          )}
          {!googleUser && (
            <LogOut style={{ width: 13, height: 13, color: 'var(--app-text-muted)', flexShrink: 0 }} />
          )}
        </button>
      </div>
    </aside>
  );
}
