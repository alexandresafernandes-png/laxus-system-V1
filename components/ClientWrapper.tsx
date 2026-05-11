'use client';
import { useState, useEffect } from 'react';
import BottomNav from './BottomNav';
import LoadingScreen from './LoadingScreen';
import LoginScreen from './LoginScreen';
import { getSession, loginOrCreate } from '@/lib/sync';

const STORAGE_KEY = 'laxus_v1';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [ready,           setReady]           = useState(false);
  const [visible,         setVisible]         = useState(false);
  const [loggedIn,        setLoggedIn]        = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    const session = getSession();
    setLoggedIn(!!session);
    setCheckingSession(false);
  }, []);

  useEffect(() => {
    if (ready) {
      const t = setTimeout(() => setVisible(true), 40);
      return () => clearTimeout(t);
    }
  }, [ready]);

  async function handleLogin(username: string, pin: string): Promise<string | null> {
    const result = await loginOrCreate(username, pin);
    if (!result.ok) return result.error;

    if (result.state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.state));
    }
    setLoggedIn(true);
    return null;
  }

  if (checkingSession) return null;
  if (!loggedIn) return <LoginScreen onLogin={handleLogin} />;

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
