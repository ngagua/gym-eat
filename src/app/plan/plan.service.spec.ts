import { TestBed } from '@angular/core/testing';
import {
  EXERCISE_OPTIONS,
  MEAL_OPTIONS,
  parseSavedWeek,
  pickOption,
  PLAN_STORAGE_KEY,
  toMatches,
  WEEK_PLAN,
  Weekday,
} from './plan.model';
import { Plan } from './plan.service';

describe('Plan', () => {
  beforeEach(() => localStorage.clear());

  const dayOf = (plan: Plan, day: Weekday) => plan.week().find((d) => d.day === day)!;
  const defaultDay = (day: Weekday) => WEEK_PLAN.find((d) => d.day === day)!;

  it('swaps everything two days hold except their names', () => {
    const plan = TestBed.inject(Plan);
    plan.swapDays('monday', 'thursday');

    expect(dayOf(plan, 'monday')).toEqual({ ...defaultDay('thursday'), day: 'monday' });
    expect(dayOf(plan, 'thursday')).toEqual({ ...defaultDay('monday'), day: 'thursday' });
    expect(plan.week().map((d) => d.day)).toEqual(WEEK_PLAN.map((d) => d.day));
  });

  it('removes exercises, and the workout with the last one', () => {
    const plan = TestBed.inject(Plan);
    plan.removeExercise('monday', 0);
    expect(dayOf(plan, 'monday').workout?.exercises.map((e) => e.name)).toEqual(
      defaultDay('monday')
        .workout!.exercises.slice(1)
        .map((e) => e.name),
    );

    plan.removeExercise('tuesday', 0);
    expect(dayOf(plan, 'tuesday').workout).toBeUndefined();
  });

  it('edits an exercise’s sets and reps', () => {
    const plan = TestBed.inject(Plan);
    plan.setTarget('friday', 0, '4 × 8');

    expect(dayOf(plan, 'friday').workout?.exercises[0]).toEqual({
      ...defaultDay('friday').workout!.exercises[0],
      target: '4 × 8',
    });
  });

  it('turns search results into sentence-case rows without repeat names', () => {
    const data = Array.from({ length: 14 }, (_, i) => ({
      exerciseId: `id${i}`,
      name: i < 2 ? 'jump squat' : `squat ${i}`,
    }));

    const matches = toMatches(data);
    expect(matches[0]).toEqual({ id: 'id0', name: 'Jump squat' });
    expect(matches[1].name).toBe('Squat 2');
    expect(matches.length).toBe(10);
  });

  it('adds an exercise, planning a workout at the gym time on a rest day', () => {
    const plan = TestBed.inject(Plan);
    const lunges = { name: 'Walking lunge', target: '3 × 10' };
    plan.addExercise('sunday', lunges);

    expect(dayOf(plan, 'sunday').workout).toEqual({ time: '11:00', exercises: [lunges] });
  });

  it('moves a meal to a new time, re-sorts the day, and says where it went', () => {
    const plan = TestBed.inject(Plan);
    // Monday: 10:15, 12:30, 16:00, 19:30, 21:30. The pre-workout snack moves to 17:00.
    expect(plan.setMealTime('monday', 0, '17:00')).toBe(2);
    expect(dayOf(plan, 'monday').meals.map((m) => m.time)).toEqual([
      '12:30',
      '16:00',
      '17:00',
      '19:30',
      '21:30',
    ]);
    expect(dayOf(plan, 'monday').meals[2].name).toBe('Pre-workout');
  });

  it('replaces the food in a meal slot and keeps its name and time', () => {
    const plan = TestBed.inject(Plan);
    const food = defaultDay('tuesday').meals[2];
    plan.replaceMeal('monday', 1, food);

    expect(dayOf(plan, 'monday').meals[1]).toEqual({
      ...defaultDay('monday').meals[1],
      items: food.items,
      kcal: food.kcal,
      protein: food.protein,
    });
  });

  it('saves edits on the device, and forgets them on reset', () => {
    const plan = TestBed.inject(Plan);
    plan.setGymTime('friday', '18:00');
    TestBed.tick();
    const saved = parseSavedWeek(localStorage.getItem(PLAN_STORAGE_KEY));
    expect(saved?.find((d) => d.day === 'friday')?.workout?.time).toBe('18:00');

    plan.reset();
    TestBed.tick();
    expect(plan.week()).toBe(WEEK_PLAN);
    expect(localStorage.getItem(PLAN_STORAGE_KEY)).toBeNull();
  });

  it('ignores a saved week that is not a full, valid plan', () => {
    const shuffled = JSON.stringify([...WEEK_PLAN].reverse());
    const badMeal = JSON.stringify(
      WEEK_PLAN.map((d, i) => (i ? d : { ...d, meals: [{ time: 'noon', name: 'Lunch' }] })),
    );

    expect(parseSavedWeek(JSON.stringify(WEEK_PLAN))).toEqual(WEEK_PLAN);
    expect(parseSavedWeek(shuffled)).toBeNull();
    expect(parseSavedWeek(badMeal)).toBeNull();
    expect(parseSavedWeek('{')).toBeNull();
  });

  it('builds the dropdowns from the default plan, without duplicate meals', () => {
    expect(pickOption(EXERCISE_OPTIONS, '0:0')).toBe(defaultDay('monday').workout!.exercises[0]);
    expect(pickOption(EXERCISE_OPTIONS, 'nope')).toBeUndefined();

    const labels = MEAL_OPTIONS.flatMap((g) => g.options.map((o) => o.label));
    expect(new Set(labels).size).toBe(labels.length);
    expect(MEAL_OPTIONS[0].options[0].label).toBe('Banana, Greek yogurt · 225 kcal');
  });
});
