'use client';
import type { SyncStatus } from '@/lib/sync';

const CONFIG: Record<SyncStatus, { label: string; color: string }> = {
  synced:  { label: '● SYNC ON',    color: '#22c55e' },
  syncing: { label: '○ SYNCING',    color: '#fbbf24' },
  offline: { label: '● OFFLINE',    color: '#f97316' },
  local:   { label: '● LOCAL ONLY', color: '#6b7280' },
};

export default function SyncBadge({ status }: { status: SyncStatus }) {
  const { label, color } = CONFIG[status];
  return (
    <span className="text-[8px] font-mono tracking-widest" style={{ color }}>
      {label}
    </span>
  );
}
