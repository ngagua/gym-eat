import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Backdrop } from '../motion/backdrop.component';
import { CountUp } from '../motion/count-up.directive';
import { Motion } from '../motion/motion.service';
import { Reveal } from '../motion/reveal.directive';
import { ExerciseDemo } from './exercise-demo.component';
import { PLATE_WEIGHT, total, weekdayOf } from './plan.model';
import { Plan } from './plan.service';
import { Plate } from './plate.component';

@Component({
  imports: [Backdrop, CountUp, DecimalPipe, ExerciseDemo, Plate, Reveal, RouterLink, TitleCasePipe],
  template: `
    @if (dayPlan(); as d) {
      <app-backdrop [plates]="[d.plate]" />
      <div
        class="grid gap-8 pt-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start lg:gap-16"
        [attr.data-plate]="d.plate"
      >
        <section class="flex flex-col items-start @container lg:sticky lg:top-8">
          @if (d.day === today) {
            <span
              class="inline-flex items-center gap-2 rounded-full bg-ink py-1.5 pr-3 pl-2.5 text-xs font-bold tracking-[0.14em] text-bg uppercase"
              ><span
                class="size-2 rounded-full bg-(--plate) animate-live motion-reduce:animate-none"
                aria-hidden="true"
              ></span
              >Today</span
            >
          }
          <!-- As large as the day's name fits on one line: 0.54 em is a Big Shoulders capital. -->
          <h1
            class="mt-3.5 font-display text-[length:min(6.5rem,calc(100cqi/(var(--letters)*0.54)))] leading-[0.85] font-black whitespace-nowrap uppercase lg:text-[length:min(9.5rem,calc(100cqi/(var(--letters)*0.54)))]"
            [style.--letters]="d.day.length"
          >
            {{ d.day | titlecase }}
          </h1>
          <p class="mt-4 flex items-center gap-2.5 text-xl font-semibold">
            <span class="size-3.5 shrink-0 rounded-full bg-(--plate)" aria-hidden="true"></span>
            {{ d.focus }}
          </p>
          <p class="mt-1 pl-6 text-muted">
            @if (d.workout; as w) {
              Gym at {{ w.time }}
            } @else {
              No gym today
            }
          </p>

          <div class="relative mt-6 grid place-items-center self-center lg:mt-12">
            <!-- The day's weight plate, turning slowly behind the ring and the text around it (the
                 section's @container makes it the stacking context -z-10 stays inside). -->
            <svg
              viewBox="0 0 200 200"
              aria-hidden="true"
              class="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[220%] -translate-1/2 animate-turn text-ink/10 motion-reduce:animate-none"
            >
              <defs>
                <path id="plate-text" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
              </defs>
              <circle
                cx="100"
                cy="100"
                r="98"
                fill="none"
                stroke="currentColor"
                stroke-width="0.8"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="currentColor"
                stroke-width="0.4"
              />
              <circle
                cx="100"
                cy="100"
                r="66"
                fill="none"
                stroke="currentColor"
                stroke-width="7"
                stroke-opacity="0.55"
              />
              <circle
                cx="100"
                cy="100"
                r="50"
                fill="none"
                stroke="currentColor"
                stroke-width="0.5"
              />
              <text
                fill="currentColor"
                class="font-display text-[8px] font-extrabold tracking-[3px]"
              >
                <textPath href="#plate-text">
                  GYM+EAT · {{ weight[d.plate] }} · CALIBRATED · GYM+EAT · {{ weight[d.plate] }} ·
                  CALIBRATED · GYM+EAT ·
                </textPath>
              </text>
            </svg>
            <div
              class="absolute -inset-8 -z-10 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--plate)_22%,transparent),transparent_65%)] opacity-60 animate-breathe motion-reduce:animate-none"
              aria-hidden="true"
            ></div>
            <app-plate class="relative size-60 sm:size-64 lg:size-80" [meals]="d.meals">
              <span
                class="block font-display text-6xl leading-none font-black lg:text-[5.25rem]"
                [appCountUp]="kcal()"
                >{{ kcal() }}</span
              >
              <span class="mt-0.5 block text-xs font-bold tracking-[0.16em] text-muted uppercase"
                >kcal</span
              >
              <span class="mt-2.5 block font-semibold lg:text-[17px]"
                ><span [appCountUp]="protein()">{{ protein() }}</span> g protein</span
              >
            </app-plate>
          </div>

          @if (next(); as n) {
            <section
              aria-label="Up next"
              class="mt-6 w-full rounded-3xl border border-line bg-surface p-[18px] lg:hidden"
            >
              <div class="flex items-center justify-between gap-3">
                <span class="text-xs font-bold tracking-[0.14em] text-muted uppercase"
                  >Up next · {{ n.time }}</span
                >
                <span class="font-display text-[22px] leading-none font-extrabold">{{
                  n.meta
                }}</span>
              </div>
              <p class="mt-3 text-[21px] leading-tight font-bold">{{ n.title }}</p>
              <button
                type="button"
                class="mt-3 flex h-13 w-full items-center justify-center gap-2.5 rounded-full bg-ink font-bold text-bg"
                (click)="motion.scrollTo(n.workout ? workout : meals)"
              >
                {{ n.workout ? 'Start workout' : 'See meals' }}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                  class="size-[18px]"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </section>
          }
        </section>

        <!-- Positioned so it paints over the plate turning behind the sticky ring. -->
        <div class="relative grid gap-10 lg:gap-11">
          <section
            #workout
            class="rounded-[28px] border border-line bg-surface px-2 pt-5 pb-3.5 sm:px-3.5 sm:pt-6"
          >
            <div class="flex flex-wrap items-center justify-between gap-3 px-3">
              <h2 class="font-display text-3xl font-extrabold lg:text-4xl">Workout</h2>
              @if (d.workout; as w) {
                <span class="text-sm font-semibold text-muted"
                  >Gym at {{ w.time }} · {{ w.exercises.length }}
                  {{ w.exercises.length === 1 ? 'move' : 'moves' }}</span
                >
              }
            </div>
            @if (d.workout; as w) {
              <ol class="mt-3">
                @for (e of w.exercises; track $index; let i = $index) {
                  <li class="border-t border-line">
                    @if (e.demo; as demo) {
                      <!-- Tap to see the movement; the demo loads on that first tap. -->
                      <details class="group">
                        <summary
                          #trigger
                          class="flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-ink/5 [&::-webkit-details-marker]:hidden"
                        >
                          <span class="w-6 shrink-0 font-display font-extrabold text-muted">{{
                            i + 1 | number: '2.0-0'
                          }}</span>
                          <span class="min-w-0 flex-1 font-semibold">{{ e.name }}</span>
                          <span class="shrink-0 font-display text-xl font-extrabold">{{
                            e.target
                          }}</span>
                          <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                            class="size-5 shrink-0 text-muted transition-transform group-open:rotate-180"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                            />
                          </svg>
                        </summary>
                        @defer (on interaction(trigger)) {
                          <app-exercise-demo
                            class="block px-3 pt-1 pb-5 [&_img]:ring-[3px] [&_img]:ring-(--plate)"
                            [exerciseId]="demo"
                          />
                        }
                      </details>
                    } @else {
                      <div class="flex min-h-14 items-center gap-3 px-3 py-2.5">
                        <span class="w-6 shrink-0 font-display font-extrabold text-muted">{{
                          i + 1 | number: '2.0-0'
                        }}</span>
                        <span class="min-w-0 flex-1 font-semibold">{{ e.name }}</span>
                        <span class="shrink-0 font-display text-xl font-extrabold">{{
                          e.target
                        }}</span>
                      </div>
                    }
                  </li>
                }
              </ol>
              <p class="mt-1.5 px-3 text-xs text-muted">
                Animations from
                <a
                  href="https://github.com/ExerciseDB/exercisedb-api"
                  class="text-ink underline underline-offset-2"
                  >ExerciseDB</a
                >.
              </p>
            } @else {
              <p class="mt-2 px-3 pb-2 text-muted">No gym today.</p>
            }
          </section>

          <section #meals>
            <div class="flex flex-wrap items-baseline justify-between gap-3">
              <h2 class="font-display text-3xl font-extrabold lg:text-4xl">Meals</h2>
              <span class="text-sm font-semibold text-muted"
                >{{ kcal() }} kcal · {{ protein() }} g protein</span
              >
            </div>
            <ol class="mt-4 grid gap-3">
              @for (m of d.meals; track $index) {
                <li
                  class="grid grid-cols-[3.75rem_minmax(0,1fr)] gap-2.5 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-3.5"
                  [appReveal]="$index"
                >
                  <time
                    class="pt-3.5 font-display text-[22px] font-extrabold sm:pt-4 sm:text-[26px]"
                    >{{ m.time }}</time
                  >
                  <div
                    class="rounded-[20px] border border-line bg-surface px-4 py-3.5 sm:rounded-[22px] sm:px-5 sm:py-4"
                  >
                    <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                      <h3 class="font-bold">{{ m.name }}</h3>
                      <p class="text-[13px] text-muted sm:text-sm">
                        {{ m.kcal }} kcal · {{ m.protein }} g protein
                      </p>
                    </div>
                    <!-- The meal's share of the day's kcal: the same arc it takes on the plate. -->
                    <div class="mt-2.5 h-1 rounded-full bg-line" aria-hidden="true">
                      <div
                        class="h-full rounded-full bg-(--plate)"
                        [style.width.%]="(m.kcal / kcal()) * 100"
                      ></div>
                    </div>
                    <ul
                      class="mt-2.5 text-sm/relaxed text-pretty text-muted sm:mt-3 sm:flex sm:flex-wrap sm:gap-1.5"
                    >
                      @for (item of m.items; track $index) {
                        <li
                          class="sm:rounded-full sm:border sm:border-line sm:bg-bg sm:px-2.5 sm:py-1 sm:text-[13px]/snug"
                        >
                          {{ item }}
                        </li>
                      }
                    </ul>
                  </div>
                </li>
              }
            </ol>
          </section>
        </div>
      </div>
    } @else {
      <h1 class="pt-2 font-display text-6xl font-black">Unknown day</h1>
      <p class="mt-3 text-muted">
        There's no plan for "{{ day() }}".
        <a routerLink="/week" class="font-semibold text-ink underline underline-offset-4"
          >Back to the week</a
        >
      </p>
    }
  `,
})
export class Day {
  private readonly plan = inject(Plan);
  protected readonly motion = inject(Motion);

  /** Route param on /week/:day; unset on /today. */
  readonly day = input<string>();

  protected readonly today = weekdayOf(new Date());
  protected readonly weight = PLATE_WEIGHT;
  protected readonly dayPlan = computed(() =>
    this.plan.week().find((d) => d.day === (this.day() ?? this.today)),
  );
  protected readonly kcal = computed(() => total(this.dayPlan()?.meals ?? [], 'kcal'));
  protected readonly protein = computed(() => total(this.dayPlan()?.meals ?? [], 'protein'));

  /** The day's first exercise, or its first meal when there's no gym. */
  protected readonly next = computed(() => {
    const d = this.dayPlan();
    const exercise = d?.workout?.exercises[0];
    if (d?.workout && exercise) {
      return { workout: true, time: d.workout.time, title: exercise.name, meta: exercise.target };
    }
    const meal = d?.meals[0];
    return meal && { workout: false, time: meal.time, title: meal.name, meta: `${meal.kcal} kcal` };
  });
}
