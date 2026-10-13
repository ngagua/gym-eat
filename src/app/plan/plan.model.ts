export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

/** A day's color, after calibrated weight plates; the values live in styles.css. */
export const PLATES = ['red', 'blue', 'violet', 'green', 'chalk'] as const;
export type Plate = (typeof PLATES)[number];

export interface Meal {
  time: string;
  name: string;
  items: string[];
  kcal: number;
  /** Grams. */
  protein: number;
}

export interface Exercise {
  name: string;
  /** Sets × reps or a duration, e.g. '3 × 10' or '35 min'. */
  target: string;
  /** ExerciseDB exercise id. Ids are permanent; the GIF link is looked up live (see ExerciseDemo). */
  demo?: string;
}

/** The part of an ExerciseDB `GET /exercises/:id` response the app shows. */
export interface ExerciseDbResponse {
  data: { name: string; gifUrl: string };
}

/** The part of an ExerciseDB `GET /exercises/search` response the app uses. */
export interface ExerciseSearchResponse {
  data: { exerciseId: string; name: string }[];
}

/** A search result ready to list. */
export interface ExerciseMatch {
  id: string;
  name: string;
}

export interface Workout {
  time: string;
  exercises: Exercise[];
}

export interface DayPlan {
  day: Weekday;
  /** What the day is for, e.g. 'Chest + triceps' or 'Active recovery'. */
  focus: string;
  plate: Plate;
  workout?: Workout;
  meals: Meal[];
}

/** One choice in an edit-mode dropdown. */
export interface PickOption<T> {
  label: string;
  value: T;
}

/** A dropdown `<optgroup>`. */
export interface PickGroup<T> {
  label: string;
  options: PickOption<T>[];
}

/** Lowercase English weekday in local time ('monday'…), the same format as DayPlan.day. */
export const weekdayOf = (date: Date) =>
  date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

export const total = (meals: Meal[], key: 'kcal' | 'protein') =>
  meals.reduce((sum, meal) => sum + meal[key], 0);

/** ExerciseDB's free tier: no key, 180p GIFs, rate limited, and AscendAPI must be credited. */
export const EXERCISE_API = 'https://oss.exercisedb.dev/api/v1/exercises/';

export const MIN_SEARCH_LENGTH = 3;
/** Search waits this long after the last keystroke, because the free API is rate limited. */
export const SEARCH_DEBOUNCE_MS = 400;
export const MAX_MATCHES = 10;
/** The API has no sets or reps, so a searched exercise starts here until you edit it. */
export const DEFAULT_TARGET = '3 × 10';
export const MAX_TARGET_LENGTH = 30;

/**
 * Turns search results into list rows: sentence case like the rest of the plan (ExerciseDB names
 * are mostly lowercase), without repeat names (a few exercises exist twice under different ids).
 */
export const toMatches = (data: ExerciseSearchResponse['data']): ExerciseMatch[] =>
  data
    .map((e) => ({ id: e.exerciseId, name: e.name.charAt(0).toUpperCase() + e.name.slice(1) }))
    .filter(
      (m, i, all) => all.findIndex((o) => o.name.toLowerCase() === m.name.toLowerCase()) === i,
    )
    .slice(0, MAX_MATCHES);

// Meals are from the ChatGPT plan. Exercises are placeholders until the trainer's program is filled in.
/** Gym time, also used for a workout added to a rest day. */
export const GYM_TIME = '11:00';

export const WEEK_PLAN: DayPlan[] = [
  {
    day: 'monday',
    focus: 'Chest + triceps',
    plate: 'violet',
    workout: {
      time: GYM_TIME,
      exercises: [
        {
          name: 'Chest press (machine or barbell)',
          target: '3 × 10',
          demo: 'DOoWcnA',
        },
        { name: 'Incline dumbbell press', target: '3 × 10', demo: 'ns0SIbU' },
        { name: 'Pec deck or cable fly', target: '3 × 12', demo: 'v3xmPAR' },
        {
          name: 'Triceps rope pushdown',
          target: '3 × 12',
          demo: 'dU605di',
        },
        {
          name: 'Overhead dumbbell extension',
          target: '3 × 12',
          demo: 'PdmaD0N',
        },
      ],
    },
    meals: [
      {
        time: '10:15',
        name: 'Pre-workout',
        items: ['Banana (120 g)', 'Greek yogurt (170 g)'],
        kcal: 225,
        protein: 18,
      },
      {
        time: '12:30',
        name: 'Lunch',
        items: [
          'Grilled chicken breast (170 g)',
          'Cooked rice (250 g)',
          'Cucumber-tomato salad (250 g)',
          'Olive oil (15 g)',
        ],
        kcal: 790,
        protein: 61,
      },
      {
        time: '16:00',
        name: 'Snack',
        items: ['Cottage cheese (200 g)', 'Apple (180 g)', 'Walnuts (25 g)'],
        kcal: 440,
        protein: 31,
      },
      {
        time: '19:30',
        name: 'Dinner',
        items: [
          'Lean beef (170 g)',
          'Roasted potatoes (300 g)',
          'Vegetables (250 g)',
          'Olive oil (15 g)',
        ],
        kcal: 720,
        protein: 52,
      },
      {
        time: '21:30',
        name: 'Extra',
        items: ['Wholegrain bread (50 g)'],
        kcal: 125,
        protein: 5,
      },
    ],
  },
  {
    day: 'tuesday',
    focus: 'Moderate cardio',
    plate: 'green',
    workout: {
      time: GYM_TIME,
      exercises: [
        {
          name: 'Incline treadmill walk or stairs',
          target: '30–40 min',
          demo: 'rjiM4L3',
        },
      ],
    },
    meals: [
      {
        time: '10:15',
        name: 'Optional snack',
        items: ['Banana (120 g)'],
        kcal: 105,
        protein: 1,
      },
      {
        time: '12:30',
        name: 'Lunch',
        items: [
          'Chicken breast (180 g)',
          'Cooked rice (230 g)',
          'Salad (250 g)',
          'Olive oil (15 g)',
        ],
        kcal: 790,
        protein: 65,
      },
      {
        time: '16:00',
        name: 'Snack',
        items: ['Greek yogurt (250 g)', 'Oats (50 g dry)', 'Berries (150 g)', 'Almonds (20 g)'],
        kcal: 560,
        protein: 39,
      },
      {
        time: '19:30',
        name: 'Dinner',
        items: [
          'Baked white fish (200 g)',
          'Potatoes (300 g)',
          'Vegetables (300 g)',
          'Olive oil (15 g)',
          'Wholegrain bread (50 g)',
        ],
        kcal: 665,
        protein: 55,
      },
    ],
  },
  {
    day: 'wednesday',
    focus: 'Back + biceps',
    plate: 'blue',
    workout: {
      time: GYM_TIME,
      exercises: [
        { name: 'Lat pulldown', target: '3 × 10', demo: 'LEprlgG' },
        { name: 'Seated cable row', target: '3 × 10', demo: 'fUBheHs' },
        { name: 'One-arm dumbbell row', target: '3 × 10 each side', demo: 'C0MA9bC' },
        { name: 'Dumbbell curl', target: '3 × 12', demo: 'NbVPDMW' },
        { name: 'Hammer curl', target: '3 × 12', demo: 'slDvUAU' },
      ],
    },
    meals: [
      {
        time: '10:15',
        name: 'Pre-workout',
        items: ['Banana (120 g)', 'Greek yogurt (200 g)'],
        kcal: 245,
        protein: 22,
      },
      {
        time: '12:30',
        name: 'Lunch',
        items: [
          'Lean beef mtsvadi (180 g)',
          'Boiled potatoes (350 g)',
          'Tomato-cucumber salad (250 g)',
          'Olive oil (10 g)',
        ],
        kcal: 780,
        protein: 54,
      },
      {
        time: '16:00',
        name: 'Snack',
        items: ['Cottage cheese (200 g)', 'Wholegrain bread (80 g)', 'Apple (180 g)'],
        kcal: 475,
        protein: 36,
      },
      {
        time: '19:30',
        name: 'Dinner',
        items: [
          'Grilled chicken (170 g)',
          'Cooked buckwheat (250 g)',
          'Roasted vegetables (300 g)',
          'Olive oil (15 g)',
        ],
        kcal: 750,
        protein: 66,
      },
    ],
  },
  {
    day: 'thursday',
    focus: 'Recovery / walking',
    plate: 'chalk',
    meals: [
      {
        time: '12:00',
        name: 'Lunch',
        items: [
          'Turkey breast (180 g)',
          'Cooked buckwheat (250 g)',
          'Salad (250 g)',
          'Olive oil (15 g)',
        ],
        kcal: 705,
        protein: 64,
      },
      {
        time: '16:00',
        name: 'Snack',
        items: ['Greek yogurt (250 g)', 'Banana (120 g)', 'Almonds (30 g)'],
        kcal: 455,
        protein: 33,
      },
      {
        time: '19:30',
        name: 'Dinner',
        items: ['Baked salmon (180 g)', 'Cooked rice (200 g)', 'Steamed broccoli (250 g)'],
        kcal: 720,
        protein: 49,
      },
      {
        time: '21:30',
        name: 'Evening',
        items: ['Cottage cheese (150 g)', 'Berries (150 g)'],
        kcal: 210,
        protein: 22,
      },
    ],
  },
  {
    day: 'friday',
    focus: 'Leg day',
    plate: 'red',
    workout: {
      time: GYM_TIME,
      exercises: [
        { name: 'Leg press', target: '3 × 10', demo: '10Z2DXU' },
        { name: 'Goblet squat', target: '3 × 10', demo: 'yn8yg1r' },
        {
          name: 'Romanian deadlift (dumbbells)',
          target: '3 × 10',
          demo: 'rR0LJzx',
        },
        { name: 'Lying leg curl', target: '3 × 12', demo: '17lJ1kr' },
        { name: 'Leg extension', target: '3 × 12', demo: 'my33uHU' },
        { name: 'Standing calf raise', target: '3 × 15', demo: 'ykUOVze' },
      ],
    },
    meals: [
      {
        time: '10:15',
        name: 'Pre-workout',
        items: ['Banana (120 g)', 'Greek yogurt (200 g)'],
        kcal: 245,
        protein: 22,
      },
      {
        time: '12:30',
        name: 'Lunch',
        items: [
          'Chicken breast (180 g)',
          'Cooked pasta (280 g)',
          'Tomato sauce (120 g)',
          'Olive oil (10 g)',
        ],
        kcal: 900,
        protein: 75,
      },
      {
        time: '16:00',
        name: 'Snack',
        items: ['Greek yogurt (250 g)', 'Berries (150 g)', 'Walnuts (30 g)'],
        kcal: 420,
        protein: 31,
      },
      {
        time: '19:30',
        name: 'Dinner',
        items: [
          'Lean beef (170 g)',
          'Cooked rice (200 g)',
          'Vegetables (300 g)',
          'Olive oil (15 g)',
        ],
        kcal: 735,
        protein: 52,
      },
    ],
  },
  {
    day: 'saturday',
    focus: 'Active recovery',
    plate: 'chalk',
    meals: [
      {
        time: '12:00',
        name: 'Lunch',
        items: [
          'Turkey breast (180 g)',
          'Roasted potatoes (300 g)',
          'Salad (250 g)',
          'Olive oil (15 g)',
        ],
        kcal: 740,
        protein: 62,
      },
      {
        time: '16:00',
        name: 'Snack',
        items: ['Cottage cheese (250 g)', 'Banana (120 g)', 'Almonds (25 g)'],
        kcal: 480,
        protein: 43,
      },
      {
        time: '19:30',
        name: 'Dinner',
        items: [
          'Salmon (170 g)',
          'Cooked buckwheat (250 g)',
          'Vegetables (300 g)',
          'Olive oil (10 g)',
        ],
        kcal: 800,
        protein: 51,
      },
      {
        time: '21:30',
        name: 'Extra',
        items: ['Dark chocolate (15 g)'],
        kcal: 85,
        protein: 1,
      },
    ],
  },
  {
    day: 'sunday',
    focus: 'Rest day',
    plate: 'chalk',
    meals: [
      {
        time: '12:00',
        name: 'Lunch',
        items: [
          'Chicken mtsvadi (200 g)',
          'Cooked rice (220 g)',
          'Salad (250 g)',
          'Olive oil (15 g)',
        ],
        kcal: 805,
        protein: 72,
      },
      {
        time: '16:00',
        name: 'Snack',
        items: ['Greek yogurt (250 g)', 'Apple (180 g)', 'Walnuts (30 g)'],
        kcal: 470,
        protein: 32,
      },
      {
        time: '19:30',
        name: 'Dinner',
        items: [
          'Lean beef (170 g)',
          'Cooked buckwheat (250 g)',
          'Vegetables (300 g)',
          'Olive oil (15 g)',
        ],
        kcal: 750,
        protein: 54,
      },
      {
        time: '21:30',
        name: 'Extra',
        items: ['Fruit (150 g)'],
        kcal: 90,
        protein: 1,
      },
    ],
  },
];

export const PLAN_STORAGE_KEY = 'gymeat.plan';

/** What `<input type="time">` gives: 'HH:MM', 24-hour. */
export const TIME_PATTERN = /^\d{2}:\d{2}$/;

/** 'monday' → 'Monday', for messages built in code. */
export const dayName = (day: Weekday) => day[0].toUpperCase() + day.slice(1);

export const byTime = (a: Meal, b: Meal) => a.time.localeCompare(b.time);

/** Every exercise in the default plan, grouped by the day it comes from. */
export const EXERCISE_OPTIONS: PickGroup<Exercise>[] = WEEK_PLAN.flatMap((d) =>
  d.workout
    ? [
        {
          label: d.focus,
          options: d.workout.exercises.map((e) => ({ label: `${e.name} · ${e.target}`, value: e })),
        },
      ]
    : [],
);

const ALL_MEALS = WEEK_PLAN.flatMap((d) => d.meals);
const UNIQUE_MEALS = ALL_MEALS.filter(
  (meal, i) => ALL_MEALS.findIndex((m) => m.items.join() === meal.items.join()) === i,
);

/** Every distinct meal in the default plan, grouped by its name (Lunch, Snack…). */
export const MEAL_OPTIONS: PickGroup<Meal>[] = [...new Set(UNIQUE_MEALS.map((m) => m.name))].map(
  (name) => ({
    label: name,
    options: UNIQUE_MEALS.filter((m) => m.name === name).map((m) => ({
      // 'Banana (120 g)' → 'Banana': the dropdown has no room for amounts.
      label: `${m.items.map((item) => item.replace(/\s*\(.*\)$/, '')).join(', ')} · ${m.kcal} kcal`,
      value: m,
    })),
  }),
);

/** Option values are 'group:option' indexes, e.g. '2:0'. */
export const optionValue = (group: number, option: number) => `${group}:${option}`;

export const pickOption = <T>(groups: PickGroup<T>[], value: string): T | undefined => {
  const [group, option] = value.split(':').map(Number);
  return groups[group]?.options[option]?.value;
};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isTime = (v: unknown) => typeof v === 'string' && TIME_PATTERN.test(v);
const isStrings = (v: unknown) => Array.isArray(v) && v.every((s) => typeof s === 'string');

const isMeal = (m: unknown) =>
  isRecord(m) &&
  isTime(m['time']) &&
  typeof m['name'] === 'string' &&
  isStrings(m['items']) &&
  typeof m['kcal'] === 'number' &&
  typeof m['protein'] === 'number';

const isExercise = (e: unknown) =>
  isRecord(e) &&
  typeof e['name'] === 'string' &&
  typeof e['target'] === 'string' &&
  (e['demo'] === undefined || typeof e['demo'] === 'string');

const isWorkout = (w: unknown) =>
  w === undefined ||
  (isRecord(w) &&
    isTime(w['time']) &&
    Array.isArray(w['exercises']) &&
    w['exercises'].every(isExercise));

const isDay = (d: unknown, i: number): d is DayPlan =>
  isRecord(d) &&
  d['day'] === WEEKDAYS[i] &&
  typeof d['focus'] === 'string' &&
  PLATES.some((plate) => plate === d['plate']) &&
  isWorkout(d['workout']) &&
  Array.isArray(d['meals']) &&
  d['meals'].every(isMeal);

/**
 * Reads back an edited week. Storage can be edited by hand or hold an older format after the plan's
 * shape changes, so anything that isn't a full Monday-to-Sunday plan is ignored and the default
 * plan shows instead.
 */
export function parseSavedWeek(json: string | null): DayPlan[] | null {
  if (!json) return null;
  try {
    const data: unknown = JSON.parse(json);
    return Array.isArray(data) && data.length === WEEKDAYS.length && data.every(isDay)
      ? data
      : null;
  } catch {
    return null;
  }
}
