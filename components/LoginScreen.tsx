'use client';
import { useState } from 'react';

interface Props {
  onLogin: (username: string, pin: string) => Promise<string | null>;
}

export default function LoginScreen({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [pin,      setPin]      = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !pin.trim()) return;
    setLoading(true);
    setError('');
    const err = await onLogin(username.trim(), pin.trim());
    if (err) { setError(err); setLoading(false); }
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--bg)' }}
    >
      <div className="text-center mb-12">
        <div
          className="text-5xl font-black tracking-[0.35em] text-[#00d4ff]"
          style={{ textShadow: '0 0 30px #00d4ff, 0 0 60px #3d6aff' }}
        >
          LAXUS
        </div>
        <div className="text-[10px] tracking-[0.9em] text-[#3d6aff] mt-1 font-mono">
          SYSTEM
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <div>
          <label className="text-[9px] font-mono tracking-[0.4em] block mb-2" style={{ color: 'var(--muted)' }}>
            HUNTER NAME
          </label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="w-full rounded-lg px-4 py-3 text-sm font-mono tracking-wider outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: '#f0f4ff' }}
            onFocus={e  => (e.target.style.borderColor = '#00d4ff')}
            onBlur={e   => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        <div>
          <label className="text-[9px] font-mono tracking-[0.4em] block mb-2" style={{ color: 'var(--muted)' }}>
            PIN / PASSWORD
          </label>
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="••••••"
            className="w-full rounded-lg px-4 py-3 text-sm font-mono tracking-wider outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: '#f0f4ff' }}
            onFocus={e  => (e.target.style.borderColor = '#00d4ff')}
            onBlur={e   => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        {error && (
          <p className="text-[11px] font-mono text-[#f97316] tracking-wider">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !username.trim() || !pin.trim()}
          className="w-full py-3 rounded-lg font-mono font-black text-xs tracking-[0.3em] transition-all active:scale-95 disabled:opacity-40"
          style={{
            background: loading ? 'var(--surface)' : '#00d4ff',
            color:      loading ? 'var(--muted)'   : '#0b0f1a',
            boxShadow:  loading ? 'none'            : '0 0 20px #00d4ff40',
          }}
        >
          {loading ? 'CONNECTING...' : 'ENTER SYSTEM'}
        </button>

        <p className="text-center text-[9px] font-mono tracking-wider" style={{ color: 'var(--dim)' }}>
          New name? Account created automatically.
        </p>
      </form>
    </div>
  );
}
