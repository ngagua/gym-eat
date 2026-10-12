export type Weekday =
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

/** A day's color, after calibrated weight plates; the values live in styles.css. */
export type Plate = 'red' | 'blue' | 'yellow' | 'green' | 'chalk';

/** What each plate color weighs, etched on the plate that turns behind the day's ring. */
export const PLATE_WEIGHT: Record<Plate, string> = {
  red: '25 KG',
  blue: '20 KG',
  yellow: '15 KG',
  green: '10 KG',
  chalk: 'REST',
};

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

/** Lowercase English weekday in local time ('monday'…), the same format as DayPlan.day. */
export const weekdayOf = (date: Date) =>
  date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

export const total = (meals: Meal[], key: 'kcal' | 'protein') =>
  meals.reduce((sum, meal) => sum + meal[key], 0);

/** ExerciseDB's free tier: no key, 180p GIFs, rate limited. */
export const EXERCISE_API = 'https://oss.exercisedb.dev/api/v1/exercises/';

// Meals are from the ChatGPT plan. Exercises are placeholders until the trainer's program is filled in.
const GYM = '11:00';

export const WEEK_PLAN: DayPlan[] = [
  {
    day: 'monday',
    focus: 'Chest + triceps',
    plate: 'yellow',
    workout: {
      time: GYM,
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
        items: ['Banana (120 g)', 'Skyr (170 g)'],
        kcal: 210,
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
    day: 'wednesday',
    focus: 'Back + biceps',
    plate: 'blue',
    workout: {
      time: GYM,
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
    focus: 'Moderate cardio',
    plate: 'green',
    workout: {
      time: GYM,
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
        items: ['Skyr (250 g)', 'Oats (50 g dry)', 'Berries (150 g)', 'Almonds (20 g)'],
        kcal: 535,
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
    day: 'friday',
    focus: 'Leg day',
    plate: 'red',
    workout: {
      time: GYM,
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
        items: ['Banana (120 g)', 'Skyr (200 g)'],
        kcal: 225,
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
        items: ['Skyr (250 g)', 'Apple (180 g)', 'Walnuts (30 g)'],
        kcal: 445,
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
