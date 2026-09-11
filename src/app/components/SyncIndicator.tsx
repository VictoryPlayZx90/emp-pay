// Sync status UI has been removed per product spec.
// The SyncStatus type is kept because Sidebar and App.tsx still reference it.
export type SyncStatus = 'synced' | 'syncing' | 'refreshing' | 'offline' | 'error' | 'failed';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SyncIndicator(_props: { status?: SyncStatus; onRetry?: () => void }) {
  return null;
}
