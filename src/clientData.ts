import { supabase, type User } from './auth'

export type Session = { id: number; day: string; title: string; detail: string | null; completed: boolean }
export type Checkin = { starts_at: string; duration_min: number; kind: string; link: string | null }
export type ClientArea = {
  name: string
  planName: string | null
  coachName: string | null
  week: Session[]
  nextCheckin: Checkin | null
  note: string | null
}

/** Monday..Sunday (YYYY-MM-DD) of the current week, in local time. */
export function currentWeek(today = new Date()): string[] {
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
}

const sample: [string, string][] = [
  ['Rest or easy mobility', ''],
  ['Intervals', '6 × 800m at 10K effort, 2 min jog'],
  ['Easy run', '45 min conversational'],
  ['Strength', '30 min, coach’s routine'],
  ['Easy run + strides', '35 min + 6 × 20s'],
  ['Long run', '90 min, last 20 at marathon effort'],
  ['Recovery', '30 min very easy or rest'],
]

function demoArea(user: User): ClientArea {
  const days = currentWeek()
  const thursday = new Date(`${days[3]}T18:30:00`)
  return {
    name: user.name,
    planName: 'One-to-one coaching',
    coachName: 'Emily Brown',
    week: sample.map(([title, detail], i) => ({ id: i + 1, day: days[i], title, detail, completed: false })),
    nextCheckin: { starts_at: thursday.toISOString(), duration_min: 30, kind: 'Video call', link: null },
    note: 'Great consistency last week. Keep Wednesday truly easy so Saturday’s long run feels strong.',
  }
}

export async function loadClientArea(user: User): Promise<ClientArea> {
  if (!supabase) return demoArea(user)
  const days = currentWeek()
  const [profile, sessions, checkin, note] = await Promise.all([
    supabase.from('profiles').select('full_name, plan_name, coach_name').eq('id', user.id).maybeSingle(),
    supabase
      .from('sessions')
      .select('id, day, title, detail, completed')
      .eq('client_id', user.id)
      .gte('day', days[0])
      .lte('day', days[6])
      .order('day'),
    supabase
      .from('checkins')
      .select('starts_at, duration_min, kind, link')
      .eq('client_id', user.id)
      .gte('starts_at', new Date().toISOString())
      .order('starts_at')
      .limit(1)
      .maybeSingle(),
    supabase
      .from('coach_notes')
      .select('body')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])
  const failed = [profile, sessions, checkin, note].find((r) => r.error)
  if (failed?.error) throw failed.error
  return {
    name: profile.data?.full_name || user.name,
    planName: profile.data?.plan_name ?? null,
    coachName: profile.data?.coach_name ?? null,
    week: (sessions.data ?? []) as Session[],
    nextCheckin: (checkin.data as Checkin | null) ?? null,
    note: note.data?.body ?? null,
  }
}

export async function setSessionDone(id: number, completed: boolean) {
  if (!supabase) return
  const { error } = await supabase.from('sessions').update({ completed }).eq('id', id)
  if (error) throw error
}
