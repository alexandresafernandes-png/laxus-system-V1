import { supabase } from './supabase';
import type { GameState } from '@/types';

const SESSION_KEY = 'laxus_session';

async function hashPin(pin: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getSession(): { username: string } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'local';

export type LoginResult =
  | { ok: true; state: GameState | null }
  | { ok: false; error: string };

export async function loginOrCreate(username: string, pin: string): Promise<LoginResult> {
  if (!supabase) return { ok: false, error: 'Supabase not configured' };
  try {
    const clean   = username.toLowerCase().trim();
    const pinHash = await hashPin(pin);

    const { data: row, error } = await supabase
      .from('user_progress')
      .select('pin_hash, data')
      .eq('username', clean)
      .maybeSingle();

    if (error) throw error;

    if (row) {
      if (row.pin_hash && row.pin_hash !== pinHash) {
        return { ok: false, error: 'Wrong PIN' };
      }
      if (!row.pin_hash) {
        await supabase.from('user_progress').update({ pin_hash: pinHash }).eq('username', clean);
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify({ username: clean }));
      const cloudState = row.data && Object.keys(row.data as object).length > 0
        ? (row.data as GameState)
        : null;
      return { ok: true, state: cloudState };
    }

    const { error: insertErr } = await supabase
      .from('user_progress')
      .insert({ username: clean, pin_hash: pinHash, data: {} });
    if (insertErr) throw insertErr;
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username: clean }));
    return { ok: true, state: null };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}

export async function saveProgress(username: string, state: GameState): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('user_progress')
      .update({ data: state, updated_at: new Date().toISOString() })
      .eq('username', username);
    return !error;
  } catch { return false; }
}
