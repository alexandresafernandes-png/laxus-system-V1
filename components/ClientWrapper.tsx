'use client';
import { useState, useEffect } from 'react';
import BottomNav from './BottomNav';
import LoadingScreen from './LoadingScreen';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (ready) {
      const t = setTimeout(() => setVisible(true), 40);
      return () => clearTimeout(t);
    }
  }, [ready]);

  return (
    <>
      {!ready && <LoadingScreen onComplete={() => setReady(true)} />}
      <div
        className="transition-opacity duration-500"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <main className="pb-20 min-h-screen">{children}</main>
        <BottomNav />
      </div>
    </>
  );
}
