import { useEffect, useState } from 'react'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/*
 * Client login.
 *
 * LIVE MODE (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set): clients sign in
 * with a one-time link emailed by Supabase.
 *
 * PREVIEW MODE (not set): any email signs in, the session stays in this browser
 * and the client area shows sample data. Handy for design work and local runs.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null
export const AUTH_DEMO = !supabase

export type User = { id: string; email: string; name: string }

const nameFromEmail = (email: string) =>
  email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

// ---- preview mode storage ----
const KEY = 'lme-demo-user'
const listeners = new Set<() => void>()
function readDemo(): User | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

/**
 * Starts sign-in. In live mode this emails a sign-in link and resolves to
 * 'link-sent'; in preview mode it signs in at once and resolves to 'signed-in'.
 */
export async function signIn(email: string): Promise<'link-sent' | 'signed-in'> {
  if (supabase) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/account` },
    })
    if (error) throw error
    return 'link-sent'
  }
  const user = { id: 'demo', email, name: nameFromEmail(email) }
  try {
    localStorage.setItem(KEY, JSON.stringify(user))
  } catch {
    /* storage blocked */
  }
  listeners.forEach((fn) => fn())
  return 'signed-in'
}

export async function signOut() {
  if (supabase) {
    await supabase.auth.signOut()
    return
  }
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn())
}

/** The signed-in user, or null. `undefined` while the session is still loading. */
export function useUser(): User | null | undefined {
  const [user, setUser] = useState<User | null | undefined>(() => (supabase ? undefined : readDemo()))

  useEffect(() => {
    if (supabase) {
      const toUser = (u: { id: string; email?: string } | null | undefined): User | null =>
        u ? { id: u.id, email: u.email ?? '', name: nameFromEmail(u.email ?? '') } : null
      supabase.auth.getSession().then(({ data }) => setUser(toUser(data.session?.user)))
      const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(toUser(session?.user)))
      return () => data.subscription.unsubscribe()
    }
    const update = () => setUser(readDemo())
    listeners.add(update)
    return () => {
      listeners.delete(update)
    }
  }, [])

  return user
}
