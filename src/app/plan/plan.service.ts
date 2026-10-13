import { effect, Service, signal } from '@angular/core';
import {
  byTime,
  DayPlan,
  Exercise,
  GYM_TIME,
  Meal,
  parseSavedWeek,
  PLAN_STORAGE_KEY,
  WEEK_PLAN,
  Weekday,
} from './plan.model';

/** Your week: the default plan until you edit it, then your edited copy on this device. */
@Service()
export class Plan {
  private readonly days = signal(this.read());

  readonly week = this.days.asReadonly();
  /** Edit controls are showing on the Week and day pages. */
  readonly editing = signal(false);

  constructor() {
    effect(() => {
      const week = this.week();
      try {
        // An unedited week isn't stored, so changes to WEEK_PLAN in the code still reach you.
        if (week === WEEK_PLAN) localStorage.removeItem(PLAN_STORAGE_KEY);
        else localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(week));
      } catch {
        // Storage is blocked (private mode, site settings), so edits last until the page reloads.
      }
    });
  }

  /** Exchanges everything two days hold: focus, color, workout and meals. */
  swapDays(a: Weekday, b: Weekday): void {
    this.days.update((week) => {
      const dayA = week.find((d) => d.day === a);
      const dayB = week.find((d) => d.day === b);
      if (!dayA || !dayB) return week;
      return week.map((d) =>
        d.day === a ? { ...dayB, day: a } : d.day === b ? { ...dayA, day: b } : d,
      );
    });
  }

  /** Removing the last exercise removes the workout, so the day reads "No gym today". */
  removeExercise(day: Weekday, index: number): void {
    this.updateDay(day, (d) => {
      if (!d.workout) return d;
      const exercises = d.workout.exercises.filter((_, i) => i !== index);
      return { ...d, workout: exercises.length ? { ...d.workout, exercises } : undefined };
    });
  }

  /** Adding to a day without a workout plans one at the usual gym time. */
  addExercise(day: Weekday, exercise: Exercise): void {
    this.updateDay(day, (d) => ({
      ...d,
      workout: {
        time: d.workout?.time ?? GYM_TIME,
        exercises: [...(d.workout?.exercises ?? []), exercise],
      },
    }));
  }

  /** Sets an exercise's sets × reps or duration, e.g. '4 × 8' or '20 min'. */
  setTarget(day: Weekday, index: number, target: string): void {
    this.updateDay(day, (d) =>
      d.workout
        ? {
            ...d,
            workout: {
              ...d.workout,
              exercises: d.workout.exercises.map((e, i) => (i === index ? { ...e, target } : e)),
            },
          }
        : d,
    );
  }

  setGymTime(day: Weekday, time: string): void {
    this.updateDay(day, (d) => (d.workout ? { ...d, workout: { ...d.workout, time } } : d));
  }

  /** Moves a meal to a new time and re-sorts the day. Returns where the meal ended up. */
  setMealTime(day: Weekday, index: number, time: string): number {
    const current = this.week().find((d) => d.day === day)?.meals[index];
    if (!current) return index;
    const meal = { ...current, time };
    this.updateDay(day, (d) => ({
      ...d,
      meals: d.meals.map((m, i) => (i === index ? meal : m)).sort(byTime),
    }));
    return (
      this.week()
        .find((d) => d.day === day)
        ?.meals.indexOf(meal) ?? index
    );
  }

  /** Puts another meal's food in this slot; the slot keeps its name and time. */
  replaceMeal(day: Weekday, index: number, food: Meal): void {
    this.updateDay(day, (d) => ({
      ...d,
      meals: d.meals.map((m, i) =>
        i === index ? { ...m, items: food.items, kcal: food.kcal, protein: food.protein } : m,
      ),
    }));
  }

  reset(): void {
    this.days.set(WEEK_PLAN);
  }

  private updateDay(day: Weekday, change: (d: DayPlan) => DayPlan): void {
    this.days.update((week) => week.map((d) => (d.day === day ? change(d) : d)));
  }

  private read(): DayPlan[] {
    try {
      return parseSavedWeek(localStorage.getItem(PLAN_STORAGE_KEY)) ?? WEEK_PLAN;
    } catch {
      return WEEK_PLAN;
    }
  }
}
