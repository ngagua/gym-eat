import { afterNextRender, Component, inject, Injector, input } from '@angular/core';
import { Announcer } from '../announcer.service';
import { ExerciseSearch } from './exercise-search.component';
import {
  DayPlan,
  EXERCISE_OPTIONS,
  GYM_TIME,
  MAX_TARGET_LENGTH,
  optionValue,
  pickOption,
  TIME_PATTERN,
} from './plan.model';
import { Plan } from './plan.service';

/** A day's workout in edit mode: gym time, remove buttons, and an exercise to add from the list. */
@Component({
  selector: 'app-workout-editor',
  imports: [ExerciseSearch],
  host: { class: 'grid gap-4' },
  template: `
    @if (day().workout; as w) {
      <label class="flex flex-wrap items-center gap-3 font-semibold">
        Gym time
        <input type="time" class="field w-auto" [value]="w.time" (change)="setGymTime($event)" />
      </label>
      <ul class="divide-y divide-line">
        @for (e of w.exercises; track $index) {
          <li class="flex items-center gap-3 py-2">
            <span class="flex-1">{{ e.name }}</span>
            <input
              type="text"
              class="field w-28 shrink-0 px-2 py-1.5 text-center font-display text-lg font-bold"
              [maxLength]="maxTargetLength"
              [value]="e.target"
              [attr.aria-label]="e.name + ' sets and reps'"
              (change)="setTarget($index, $event)"
            />
            <button
              type="button"
              class="grid size-10 shrink-0 place-items-center rounded-full text-muted transition-colors hover:text-ink"
              [id]="'remove-exercise-' + $index"
              [attr.aria-label]="'Remove ' + e.name"
              (click)="remove($index, e.name)"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="size-5">
                <path
                  d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
                />
              </svg>
            </button>
          </li>
        }
      </ul>
    } @else {
      <p class="text-muted">No gym today. Adding an exercise plans a workout at {{ gymTime }}.</p>
    }

    <div class="flex flex-wrap items-end gap-2">
      <label class="grid min-w-0 flex-1 basis-56 gap-1.5 text-sm font-semibold">
        Add exercise
        <select #pick id="add-exercise" class="field">
          <option value="">Choose an exercise</option>
          @for (group of groups; track group.label; let g = $index) {
            <optgroup [label]="group.label">
              @for (option of group.options; track option.label; let o = $index) {
                <option [value]="optionValue(g, o)">{{ option.label }}</option>
              }
            </optgroup>
          }
        </select>
      </label>
      <button
        type="button"
        class="rounded-full border-2 border-ink px-5 py-2 font-semibold"
        (click)="add(pick)"
      >
        Add
      </button>
    </div>
    <app-exercise-search [day]="day().day" />
  `,
})
export class WorkoutEditor {
  private readonly plan = inject(Plan);
  private readonly announcer = inject(Announcer);
  private readonly injector = inject(Injector);

  readonly day = input.required<DayPlan>();

  protected readonly groups = EXERCISE_OPTIONS;
  protected readonly gymTime = GYM_TIME;
  protected readonly maxTargetLength = MAX_TARGET_LENGTH;
  protected readonly optionValue = optionValue;

  protected setGymTime(event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) return;
    const time = event.target.value;
    if (!TIME_PATTERN.test(time)) {
      // A cleared field: put the saved time back.
      event.target.value = this.day().workout?.time ?? '';
      return;
    }
    this.plan.setGymTime(this.day().day, time);
    this.announcer.say(`Gym time set to ${time}.`);
  }

  protected setTarget(index: number, event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) return;
    const exercise = this.day().workout?.exercises[index];
    const target = event.target.value.trim();
    if (!exercise) return;
    if (!target) {
      // An emptied field: put the saved value back.
      event.target.value = exercise.target;
      return;
    }
    this.plan.setTarget(this.day().day, index, target);
    this.announcer.say(`${exercise.name} set to ${target}.`);
  }

  protected remove(index: number, name: string): void {
    this.plan.removeExercise(this.day().day, index);
    this.announcer.say(`Removed ${name}.`);
    // Keep focus nearby: the row that moved into this spot, the row above, or the dropdown.
    afterNextRender(
      () =>
        (
          document.getElementById(`remove-exercise-${index}`) ??
          document.getElementById(`remove-exercise-${index - 1}`) ??
          document.getElementById('add-exercise')
        )?.focus(),
      { injector: this.injector },
    );
  }

  protected add(select: HTMLSelectElement): void {
    const exercise = pickOption(EXERCISE_OPTIONS, select.value);
    if (!exercise) {
      select.focus();
      return;
    }
    this.plan.addExercise(this.day().day, exercise);
    this.announcer.say(`Added ${exercise.name}.`);
    select.value = '';
  }
}
