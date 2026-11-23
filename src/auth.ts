import { useEffect, useState } from 'react'

/*
 * Client login.
 *
 * This is DEMO MODE: any email signs in, and the session is kept only in this
 * browser. It lets us design and test the client area before a login service
 * is chosen. To go live, replace signIn/signOut/getUser with calls to that
 * service (for example Supabase Auth email links); the pages only use these
 * three functions and the useUser hook.
 */
export const AUTH_DEMO = true

export type User = { email: string; name: string }

const KEY = 'lme-demo-user'
const listeners = new Set<() => void>()

function read(): User | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function getUser(): User | null {
  return read()
}

export async function signIn(email: string): Promise<User> {
  const name = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const user = { email, name }
  try {
    localStorage.setItem(KEY, JSON.stringify(user))
  } catch {
    /* storage blocked: session lasts until reload */
  }
  listeners.forEach((fn) => fn())
  return user
}

export async function signOut() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn())
}

export function useUser(): User | null {
  const [user, setUser] = useState<User | null>(read)
  useEffect(() => {
    const update = () => setUser(read())
    listeners.add(update)
    return () => {
      listeners.delete(update)
    }
  }, [])
  return user
}
