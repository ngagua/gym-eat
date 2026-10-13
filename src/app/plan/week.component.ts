import { TitleCasePipe } from '@angular/common';
import { afterNextRender, Component, computed, inject, Injector, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Announcer } from '../announcer.service';
import { ChalkDust } from '../motion/chalk-dust.directive';
import { EditToggle } from './edit-toggle.component';
import { dayName, total, Weekday, WEEKDAYS, weekdayOf } from './plan.model';
import { Plan } from './plan.service';
import { Plate } from './plate.component';

@Component({
  imports: [ChalkDust, EditToggle, Plate, RouterLink, TitleCasePipe],
  template: `
    <canvas appChalkDust="chalk"></canvas>
    <div class="flex flex-wrap items-center justify-between gap-4 pt-2">
      <h1 class="font-display text-7xl leading-[0.85] font-black sm:text-8xl">Week</h1>
      <app-edit-toggle />
    </div>
    @if (plan.editing()) {
      <div class="mt-6 flex flex-wrap items-end gap-3 rounded-3xl bg-surface p-4 sm:p-5">
        <label class="grid min-w-0 flex-1 basis-40 gap-1.5 text-sm font-semibold">
          Swap
          <select #from class="field" (change)="swapFrom.set(toWeekday(from.value))">
            <option value="">Choose a day</option>
            @for (day of weekdays; track day) {
              <option [value]="day">{{ day | titlecase }}</option>
            }
          </select>
        </label>
        <label class="grid min-w-0 flex-1 basis-40 gap-1.5 text-sm font-semibold">
          With
          <select #to class="field">
            <option value="">Choose a day</option>
            @for (day of weekdays; track day) {
              @if (day !== swapFrom()) {
                <option [value]="day">{{ day | titlecase }}</option>
              }
            }
          </select>
        </label>
        <button
          type="button"
          class="rounded-full bg-ink px-6 py-2.5 font-semibold text-bg"
          (click)="swap(from, to)"
        >
          Swap
        </button>
      </div>
    }
    <ol class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      @for (d of days(); track d.day; let i = $index) {
        <li>
          <a
            class="flex h-full items-center gap-4 rounded-3xl border-2 border-transparent bg-surface p-4 transition-colors hover:border-(--plate) aria-[current=date]:border-ink xl:flex-col xl:items-start"
            [routerLink]="['/week', d.day]"
            [attr.aria-current]="d.day === today ? 'date' : null"
            [attr.data-plate]="d.plate"
          >
            <app-plate
              class="size-16 shrink-0 xl:size-24"
              [meals]="d.meals"
              [delay]="i * 0.07"
              [style.view-transition-name]="'plate-' + d.day"
            />
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h2 class="font-display text-3xl leading-none font-black xl:text-2xl">
                  {{ d.day | titlecase }}
                </h2>
                @if (d.day === today) {
                  <span class="rounded-full bg-ink px-2 py-0.5 text-xs font-semibold text-bg"
                    >Today</span
                  >
                }
              </div>
              <p class="mt-1.5 font-semibold">{{ d.focus }}</p>
              <p class="mt-1 text-sm text-muted">{{ d.kcal }} kcal, {{ d.protein }} g protein</p>
            </div>
          </a>
        </li>
      }
    </ol>

    @if (plan.editing()) {
      <div class="mt-8 flex flex-wrap items-center gap-3">
        @if (confirmingReset()) {
          <p class="font-semibold">
            Reset the whole week to the default plan? Your changes are lost.
          </p>
          <button
            type="button"
            class="rounded-full bg-danger px-5 py-2 font-semibold text-bg"
            (click)="reset()"
          >
            Reset
          </button>
          <button
            id="cancel-reset"
            type="button"
            class="rounded-full border-2 border-ink px-5 py-2 font-semibold"
            (click)="askReset(false)"
          >
            Cancel
          </button>
        } @else {
          <button
            id="ask-reset"
            type="button"
            class="rounded-full border-2 border-line px-5 py-2 font-semibold text-muted transition-colors hover:text-ink"
            (click)="askReset(true)"
          >
            Reset to default plan
          </button>
        }
      </div>
    }
  `,
})
export class Week {
  protected readonly plan = inject(Plan);
  private readonly announcer = inject(Announcer);
  private readonly injector = inject(Injector);

  protected readonly today = weekdayOf(new Date());
  protected readonly weekdays = WEEKDAYS;
  protected readonly confirmingReset = signal(false);
  /** The day picked in the swap bar's first dropdown, left out of the second. */
  protected readonly swapFrom = signal<Weekday | null>(null);
  protected readonly days = computed(() =>
    this.plan.week().map((d) => ({
      day: d.day,
      focus: d.focus,
      plate: d.plate,
      meals: d.meals,
      kcal: total(d.meals, 'kcal'),
      protein: total(d.meals, 'protein'),
    })),
  );

  protected toWeekday(value: string): Weekday | null {
    return WEEKDAYS.find((d) => d === value) ?? null;
  }

  protected swap(from: HTMLSelectElement, to: HTMLSelectElement): void {
    const a = this.toWeekday(from.value);
    const b = this.toWeekday(to.value);
    // An unpicked day: send the user to it.
    if (!a || !b) {
      (a ? to : from).focus();
      return;
    }
    this.plan.swapDays(a, b);
    this.announcer.say(`Swapped ${dayName(a)} and ${dayName(b)}.`);
    from.value = '';
    to.value = '';
    this.swapFrom.set(null);
  }

  /** Shows or hides "Are you sure?". The buttons swap places, so focus follows them. */
  protected askReset(asking: boolean): void {
    this.confirmingReset.set(asking);
    const id = asking ? 'cancel-reset' : 'ask-reset';
    afterNextRender(() => document.getElementById(id)?.focus(), { injector: this.injector });
  }

  protected reset(): void {
    this.plan.reset();
    this.announcer.say('The week is back to the default plan.');
    this.askReset(false);
  }
}
