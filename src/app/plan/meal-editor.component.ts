import { LowerCasePipe } from '@angular/common';
import { afterNextRender, Component, inject, Injector, input } from '@angular/core';
import { Announcer } from '../announcer.service';
import { Meal, MEAL_OPTIONS, optionValue, pickOption, TIME_PATTERN, Weekday } from './plan.model';
import { Plan } from './plan.service';

/** A meal's edit controls: its time, and other food from the list to put in its place. */
@Component({
  selector: 'app-meal-editor',
  imports: [LowerCasePipe],
  host: { class: 'grid gap-3 border-t border-line pt-4' },
  template: `
    <label class="flex flex-wrap items-center justify-between gap-3 text-sm font-semibold">
      {{ meal().name }} time
      <input
        type="time"
        class="field w-auto"
        [id]="'meal-time-' + index()"
        [value]="meal().time"
        (change)="setTime($event)"
      />
    </label>
    <div class="flex flex-wrap items-end gap-2">
      <label class="grid min-w-0 flex-1 basis-56 gap-1.5 text-sm font-semibold">
        Replace {{ meal().name | lowercase }} with
        <select #pick class="field">
          <option value="">Choose a meal</option>
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
        (click)="replace(pick)"
      >
        Replace
      </button>
    </div>
  `,
})
export class MealEditor {
  private readonly plan = inject(Plan);
  private readonly announcer = inject(Announcer);
  private readonly injector = inject(Injector);

  readonly day = input.required<Weekday>();
  readonly index = input.required<number>();
  readonly meal = input.required<Meal>();

  protected readonly groups = MEAL_OPTIONS;
  protected readonly optionValue = optionValue;

  protected setTime(event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) return;
    const time = event.target.value;
    if (!TIME_PATTERN.test(time)) {
      // A cleared field: put the saved time back.
      event.target.value = this.meal().time;
      return;
    }
    const name = this.meal().name;
    const moved = this.plan.setMealTime(this.day(), this.index(), time);
    this.announcer.say(`${name} moved to ${time}.`);
    // The meals re-sort by time, so this meal's field may now sit in another row. Follow it there.
    if (moved !== this.index()) {
      afterNextRender(() => document.getElementById(`meal-time-${moved}`)?.focus(), {
        injector: this.injector,
      });
    }
  }

  protected replace(select: HTMLSelectElement): void {
    const food = pickOption(MEAL_OPTIONS, select.value);
    if (!food) {
      select.focus();
      return;
    }
    this.plan.replaceMeal(this.day(), this.index(), food);
    this.announcer.say(`${this.meal().name} is now ${food.items.join(', ')}.`);
    select.value = '';
  }
}
