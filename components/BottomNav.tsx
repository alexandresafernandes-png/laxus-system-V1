'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/',        label: 'HOME',    icon: '⬡' },
  { href: '/status',  label: 'HUNTER',  icon: '✦' },
  { href: '/checkin', label: 'CHECK-IN', icon: '◈' },
];

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-sm"
      style={{ background: 'rgba(11,15,26,0.95)', borderColor: 'var(--border)' }}
    >
      <div className="flex max-w-lg mx-auto">
        {TABS.map(({ href, label, icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-0.5 py-3 text-[10px] font-mono tracking-widest transition-colors duration-200"
              style={{ color: active ? '#00d4ff' : 'var(--muted)' }}
            >
              <span
                className="text-base leading-none"
                style={active ? { filter: 'drop-shadow(0 0 6px #00d4ff)' } : {}}
              >
                {icon}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
