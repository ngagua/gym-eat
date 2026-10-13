import { DatePipe, DecimalPipe, formatDate } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  linkedSignal,
  LOCALE_ID,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { form, FormField, FormRoot, max, min, required, validate } from '@angular/forms/signals';
import { Announcer } from '../announcer.service';
import { ChalkDust } from '../motion/chalk-dust.directive';
import { WeightChart } from './weight-chart.component';
import { WeightLog } from './weight-log.service';
import {
  isoDay,
  KG_RANGE_MESSAGE,
  MAX_KG,
  MIN_KG,
  RECENT_COUNT,
  roundKg,
  TargetWeight,
  WeighIn,
  WeightEntry,
} from './weight.model';

@Component({
  imports: [ChalkDust, DatePipe, DecimalPipe, FormField, FormRoot, WeightChart],
  template: `
    <div
      class="grid gap-10 pt-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start lg:gap-16"
      data-plate="violet"
    >
      <canvas appChalkDust="violet"></canvas>
      <section class="grid gap-6 lg:sticky lg:top-8">
        <h1 class="font-display text-7xl leading-[0.85] font-black sm:text-8xl">Weight</h1>

        <dl class="grid grid-cols-2 gap-3">
          @for (stat of stats(); track stat.label) {
            <div class="rounded-2xl bg-surface p-4">
              <dt class="text-sm text-muted">{{ stat.label }}</dt>
              <dd class="mt-1 font-display text-4xl leading-none font-black tabular-nums">
                @if (stat.value; as value) {
                  {{ value
                  }}<span class="ml-1 font-sans text-base font-semibold text-muted">kg</span>
                } @else {
                  <span class="text-muted">–</span>
                }
              </dd>
            </div>
          }
        </dl>

        @if (log.saveFailed()) {
          <p role="alert" class="rounded-2xl bg-surface p-4 font-semibold text-danger">
            This browser isn't letting Gym+Eat save, so weigh-ins will be gone when you close the
            page. Allow site data for this site to keep them.
          </p>
        }

        <form [formRoot]="weighInForm" class="grid gap-4 rounded-3xl bg-surface p-5 sm:p-6">
          <h2 class="font-display text-3xl font-extrabold">Log weight</h2>
          <div class="grid grid-cols-2 gap-3">
            <label class="grid content-start gap-1.5 text-sm font-semibold">
              Date
              <input
                type="date"
                class="field"
                [formField]="weighInForm.date"
                [attr.aria-invalid]="dateError() ? true : null"
                [attr.aria-describedby]="dateError() ? 'date-error' : null"
              />
              @if (dateError(); as message) {
                <span id="date-error" class="text-danger">{{ message }}</span>
              }
            </label>
            <label class="grid content-start gap-1.5 text-sm font-semibold">
              Weight in kg
              <input
                type="number"
                inputmode="decimal"
                step="0.1"
                class="field"
                [formField]="weighInForm.kg"
                [attr.aria-invalid]="kgError() ? true : null"
                [attr.aria-describedby]="kgError() ? 'kg-error' : null"
              />
              @if (kgError(); as message) {
                <span id="kg-error" class="text-danger">{{ message }}</span>
              }
            </label>
          </div>
          <button
            type="submit"
            class="justify-self-start rounded-full bg-ink px-6 py-2.5 font-semibold text-bg"
          >
            Save
          </button>
        </form>

        <form [formRoot]="targetForm" class="grid gap-4 rounded-3xl bg-surface p-5 sm:p-6">
          <h2 class="font-display text-3xl font-extrabold">Target</h2>
          <div class="flex flex-wrap items-end gap-3">
            <label class="grid flex-1 basis-40 gap-1.5 text-sm font-semibold">
              Target in kg
              <input
                type="number"
                inputmode="decimal"
                step="0.1"
                class="field"
                [formField]="targetForm.kg"
                [attr.aria-invalid]="targetError() ? true : null"
                [attr.aria-describedby]="targetError() ? 'target-error' : null"
              />
            </label>
            <button type="submit" class="rounded-full border-2 border-ink px-6 py-2 font-semibold">
              Set target
            </button>
          </div>
          @if (targetError(); as message) {
            <p id="target-error" class="text-sm font-semibold text-danger">{{ message }}</p>
          }
        </form>
      </section>

      <div class="grid gap-10">
        <section class="grid gap-4 rounded-3xl bg-surface p-5 sm:p-7">
          <h2 class="font-display text-3xl font-extrabold">Progress</h2>
          @if (log.entries().length) {
            <app-weight-chart [entries]="log.entries()" [target]="log.target()" />
          } @else {
            <p class="text-muted">Log your first weigh-in and the chart starts here.</p>
          }
        </section>

        <section class="rounded-3xl bg-surface p-5 sm:p-7">
          <h2 #historyTitle tabindex="-1" class="font-display text-3xl font-extrabold">
            Weigh-ins
          </h2>
          @if (recent().length) {
            <ol class="mt-3 divide-y divide-line">
              @for (entry of recent(); track entry.date; let i = $index) {
                <li class="flex items-center gap-3 py-2">
                  <time class="flex-1" [attr.datetime]="entry.date">{{
                    entry.date | date: 'EEE d MMM'
                  }}</time>
                  <span class="font-display text-xl font-bold tabular-nums"
                    >{{ entry.kg | number: '1.1-1' }} kg</span
                  >
                  <button
                    #deleteButton
                    type="button"
                    class="grid size-10 place-items-center rounded-full text-muted transition-colors hover:text-ink"
                    [attr.aria-label]="
                      'Delete ' +
                      (entry.kg | number: '1.1-1') +
                      ' kg from ' +
                      (entry.date | date: 'EEE d MMM')
                    "
                    (click)="remove(entry, i)"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="size-5">
                      <path
                        d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
                      />
                    </svg>
                  </button>
                </li>
              }
            </ol>
            @if (log.entries().length > recent().length) {
              <p class="mt-2 text-sm text-muted">
                The last {{ recent().length }} of {{ log.entries().length }}. The chart shows them
                all.
              </p>
            }
          } @else {
            <p class="mt-2 text-muted">No weigh-ins yet.</p>
          }
        </section>
      </div>
    </div>
  `,
})
export class Weight {
  protected readonly log = inject(WeightLog);
  private readonly announcer = inject(Announcer);
  private readonly locale = inject(LOCALE_ID);
  private readonly injector = inject(Injector);
  private readonly removeButtons = viewChildren<ElementRef<HTMLButtonElement>>('deleteButton');
  private readonly historyTitle = viewChild.required<ElementRef<HTMLElement>>('historyTitle');

  protected readonly today = isoDay(new Date());

  private readonly weighIn = signal<WeighIn>({ date: this.today, kg: null });
  protected readonly weighInForm = form(
    this.weighIn,
    (path) => {
      required(path.date, { message: 'Pick a date.' });
      validate(path.date, ({ value }) =>
        value() > this.today
          ? { kind: 'future', message: 'Pick today or an earlier day.' }
          : undefined,
      );
      required(path.kg, { message: 'Enter your weight.' });
      min(path.kg, MIN_KG, { message: KG_RANGE_MESSAGE });
      max(path.kg, MAX_KG, { message: KG_RANGE_MESSAGE });
    },
    {
      submission: {
        action: async (field) => {
          const { date, kg } = this.weighIn();
          if (kg === null) return;
          this.log.log(date, kg);
          this.announcer.say(`Saved ${roundKg(kg)} kg for ${this.day(date)}.`);
          field().reset({ date: this.today, kg: null });
        },
      },
    },
  );

  /** Shows the saved target and follows it when it changes. */
  private readonly targetModel = linkedSignal<TargetWeight>(() => ({ kg: this.log.target() }));
  protected readonly targetForm = form(
    this.targetModel,
    (path) => {
      required(path.kg, { message: 'Enter your target weight.' });
      min(path.kg, MIN_KG, { message: KG_RANGE_MESSAGE });
      max(path.kg, MAX_KG, { message: KG_RANGE_MESSAGE });
    },
    {
      submission: {
        action: async () => {
          const { kg } = this.targetModel();
          if (kg === null) return;
          this.log.setTarget(kg);
          this.announcer.say(`Target set to ${roundKg(kg)} kg.`);
        },
      },
    },
  );

  // A field's first error, once the user has left the field or tried to submit.
  protected readonly dateError = computed(() => this.firstError(this.weighInForm.date()));
  protected readonly kgError = computed(() => this.firstError(this.weighInForm.kg()));
  protected readonly targetError = computed(() => this.firstError(this.targetForm.kg()));

  protected readonly recent = computed(() => this.log.entries().slice(-RECENT_COUNT).reverse());

  protected readonly stats = computed(() => {
    const entries = this.log.entries();
    const first = entries.at(0);
    const latest = entries.at(-1);
    const target = this.log.target();
    const change = first && latest ? roundKg(latest.kg - first.kg) : null;
    return [
      { label: 'Current', value: latest ? latest.kg.toFixed(1) : null },
      { label: 'Target', value: target === null ? null : target.toFixed(1) },
      {
        // Works whether the target is below (losing) or above (gaining) the current weight.
        label: 'To go',
        value: latest && target !== null ? Math.abs(roundKg(latest.kg - target)).toFixed(1) : null,
      },
      {
        label: first ? `Since ${formatDate(first.date, 'd MMM', this.locale)}` : 'Change',
        value:
          change === null
            ? null
            : (change > 0 ? '+' : change < 0 ? '−' : '') + Math.abs(change).toFixed(1),
      },
    ];
  });

  protected remove(entry: WeightEntry, index: number): void {
    this.log.remove(entry.date);
    this.announcer.say(`Deleted ${entry.kg} kg from ${this.day(entry.date)}.`);
    // Keep keyboard focus in the list: on the row that moved into this spot, else the new last row.
    afterNextRender(
      () => {
        const buttons = this.removeButtons();
        const next = buttons[index] ?? buttons[buttons.length - 1];
        (next ?? this.historyTitle()).nativeElement.focus();
      },
      { injector: this.injector },
    );
  }

  private day(date: string): string {
    return formatDate(date, 'EEE d MMM', this.locale);
  }

  private firstError(state: { touched(): boolean; errors(): readonly { message?: string }[] }) {
    return state.touched() ? state.errors()[0]?.message : undefined;
  }
}
