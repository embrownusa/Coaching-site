export const coaches = [
  {
    name: 'Davis Bove',
    role: 'Head Endurance Coach',
    initials: 'DB',
    specialty: 'Track · Road · Triathlon',
    bio: 'Davis brings an athlete-first approach across running and multisport. His coaching connects speed, endurance, and real-world consistency to build athletes who are ready for every start line.',
    credentials: ['Track & road specialist', 'Short & long course triathlon', 'Individualized performance planning'],
  },
  {
    name: 'Emily Brown',
    role: 'Running Coach',
    initials: 'EB',
    specialty: 'Track · Road',
    bio: 'Emily works with runners from the track to the marathon, pairing thoughtful communication with purposeful training. Her focus is sustainable progress, resilient confidence, and racing with intent.',
    credentials: ['Middle & long distance', 'Track and road development', 'Race strategy & preparation'],
  },
]

export const principles: [string, string][] = [
  ['Context over convention', 'Your training has to fit your work, family, history, and capacity—not an idealized week on paper.'],
  ['Consistency over heroics', 'Breakthroughs are usually quiet. We build repeatable weeks before chasing extraordinary ones.'],
  ['Communication over guesswork', 'Your feedback shapes the plan. We pay attention to the whole picture, not just the splits.'],
  ['Development over deadlines', 'Race day matters. Becoming a more capable, confident athlete matters even more.'],
]

export type Article = {
  slug: string
  category: string
  title: string
  time: string
  /** Draft copy: replace with the coaches' own writing. */
  body: string[]
}

export const articles: Article[] = [
  {
    slug: 'easy-days',
    category: 'Training',
    title: 'Why easy days need to be truly easy',
    time: '6 min read',
    body: [
      'Most of the fitness you build as an endurance athlete comes from time spent at a relaxed, conversational effort. Those sessions grow your aerobic engine, strengthen tendons and bones, and teach your body to use fuel well.',
      'The trouble starts when easy days drift into "steady." It feels productive, but it leaves you a little too tired to hit the sessions that really need quality, and not rested enough to absorb them.',
      'A simple check: if you could not hold a full conversation, you are going too fast. Slow down, let the hard days be hard, and the easy days will pay you back.',
    ],
  },
  {
    slug: 'marathon-week',
    category: 'Racing',
    title: 'A calmer approach to marathon week',
    time: '8 min read',
    body: [
      'The work is done. Marathon week is about arriving at the start line fresh, fuelled and confident, not squeezing in one last test of fitness.',
      'Keep a little rhythm in your legs with short, relaxed runs and a few strides. Plan your race morning in detail so nothing feels new on the day, and practise your fuelling one last time.',
      'Nerves are normal. They mean you care. Write down three things you did well in this training block and read them the night before.',
    ],
  },
  {
    slug: 'three-sports-one-life',
    category: 'Triathlon',
    title: 'Making three sports fit one real life',
    time: '7 min read',
    body: [
      'Triathlon asks for a lot of hours, and life rarely offers them neatly. The athletes who thrive are the ones who plan around their real week, not an ideal one.',
      'Anchor the sessions that matter most for your race, then fit the rest around work and family. A short swim you actually do beats a long one you skip.',
      'Bricks, commutes and early sessions all have a place. The goal is a rhythm you can repeat for months, not a heroic week you can only manage once.',
    ],
  },
  {
    slug: 'signals-your-log-cant-show',
    category: 'Recovery',
    title: 'The signals your training log can’t show',
    time: '5 min read',
    body: [
      'Paces, heart rate and mileage tell part of the story. Sleep, mood, appetite, stress at work and how your legs feel on the stairs tell the rest.',
      'We ask for a quick note after each session because these small signals often show fatigue before the numbers do.',
      'Recovery is not time off from training. It is the part of training where you actually get fitter.',
    ],
  },
  {
    slug: 'confidence-is-a-practice',
    category: 'Mindset',
    title: 'Confidence is a practice, not a feeling',
    time: '4 min read',
    body: [
      'Waiting to feel confident before a race is a long wait. Confidence is built, session by session, from evidence that you can do hard things.',
      'Notice and record your good days. Rehearse the tough middle part of a race in your head. Choose a cue word you can come back to when it hurts.',
      'You do not need to feel ready to race well. You need to have prepared well, and to trust that preparation.',
    ],
  },
  {
    slug: 'when-a-workout-goes-sideways',
    category: 'Training',
    title: 'What to do when a workout goes sideways',
    time: '6 min read',
    body: [
      'Every athlete has sessions that fall apart: the splits slip, the legs feel heavy, the wind will not quit. One bad workout changes very little.',
      'Adjust in the moment. Shorten the reps, extend the recovery, or switch to an easy run and call it a win for listening to your body.',
      'Afterwards, tell your coach what happened and how you felt. Patterns matter much more than any single day.',
    ],
  },
]


/*
 * The three discipline pages. Copy here is a first draft for Emily and Davis
 * to rewrite in their own words.
 */
export type DisciplineInfo = {
  n: string
  name: string
  art: 'stopwatch' | 'runner' | 'cyclist'
  artLabel: string
  events: string
  headline: string
  intro: string
  focus: [string, string][]
  coaches: string[]
}

export const disciplines: Record<'track' | 'road' | 'triathlon', DisciplineInfo> = {
  track: {
    n: '01',
    name: 'Track',
    art: 'stopwatch',
    artLabel: 'A stopwatch drawn in ASCII characters, its seconds hand sweeping the dial',
    events: '800m · 1500m · Mile · 3000m · 5K',
    headline: 'Every lap has a split. Every split has a plan.',
    intro:
      'Middle distance rewards athletes who can hold pace under pressure and still change gear on the last lap. We build the aerobic engine first, then sharpen speed, rhythm and race craft so you arrive at the line knowing exactly how you want to run it.',
    focus: [
      ['Pace control', 'Interval sessions built around your goal splits, so race pace feels familiar long before race day.'],
      ['Speed and mechanics', 'Short, sharp work and drills that keep your stride efficient when you are tired.'],
      ['Racing tactics', 'How to sit, when to move and how to close, rehearsed in training and reviewed after every race.'],
    ],
    coaches: ['Davis Bove', 'Emily Brown'],
  },
  road: {
    n: '02',
    name: 'Road',
    art: 'runner',
    artLabel: 'A runner drawn in ASCII characters, with blue speed trails streaming behind',
    events: '10K · Half marathon · Marathon',
    headline: 'Built for the long road, and the last mile of it.',
    intro:
      'Road racing is patience turned into speed. We plan your weeks around the life you actually live, build mileage that your body can absorb, and practise the fuelling and pacing that decide the final miles of a race.',
    focus: [
      ['Aerobic base', 'Steady, progressive mileage that raises your ceiling without wearing you down.'],
      ['Threshold and long runs', 'The key sessions that teach you to hold a strong pace for a long time.'],
      ['Race-day plan', 'Pacing, fuelling and taper worked out together, so the race is a rehearsal you have already done.'],
    ],
    coaches: ['Davis Bove', 'Emily Brown'],
  },
  triathlon: {
    n: '03',
    name: 'Triathlon',
    art: 'cyclist',
    artLabel: 'A time-trial cyclist drawn in ASCII characters, wheels spinning, with blue speed trails',
    events: 'Sprint · Olympic · 70.3 · Long course',
    headline: 'Three sports, one plan that fits your week.',
    intro:
      'Triathlon asks you to balance swim, bike and run with work, family and recovery. We bring the three together in one schedule, put the hard days where they do the most good, and train the transitions that so often decide the result.',
    focus: [
      ['Balanced training', 'Swim, bike and run sessions weighted to your strengths, your limiters and your race.'],
      ['Bike to run', 'Brick sessions and pacing on the bike so you still have legs for a strong run.'],
      ['Race execution', 'Nutrition, transitions and pacing for each leg, planned and practised ahead of time.'],
    ],
    coaches: ['Davis Bove'],
  },
}
